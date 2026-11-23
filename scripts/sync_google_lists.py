#!/usr/bin/env python3
"""從 Google 地圖「已分享」清單抓取地點與備註，輸出 veggie/places.json。

用法：
    python scripts/sync_google_lists.py            # 讀 veggie/lists.json，寫 veggie/places.json
    python scripts/sync_google_lists.py --dump raw # 另外把原始回應存到 raw/ 方便除錯

注意：Google 沒有公開「已儲存清單」的官方 API，這裡用的是 Google 地圖網頁
本身載入分享清單時呼叫的端點。若 Google 改版導致失敗，會保留上一次的資料不覆蓋。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LISTS_FILE = ROOT / "veggie" / "lists.json"
OUT_FILE = ROOT / "veggie" / "places.json"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
GETLIST = (
    "https://www.google.com/maps/preview/entitylist/getlist"
    "?authuser=0&hl=zh-TW&gl=tw&pb=!1m4!1s{list_id}!2e1!3m1!1e1!2e2!3e2!4i500!16b1"
)

LIST_ID_PATTERNS = [
    re.compile(r"!11m\d+!2s([A-Za-z0-9_-]{10,})"),
    re.compile(r"/placelists/list/([A-Za-z0-9_-]{10,})"),
    re.compile(r"!2s([A-Za-z0-9_-]{20,})"),
]


def http_get(url: str) -> tuple[str, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "zh-TW,zh;q=0.9"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.geturl(), resp.read().decode("utf-8", "replace")


def find_list_id(text: str) -> str | None:
    text = urllib.parse.unquote(text)
    for pat in LIST_ID_PATTERNS:
        m = pat.search(text)
        if m:
            return m.group(1)
    return None


def resolve_list_id(share_url: str) -> str:
    """分享連結 (maps.app.goo.gl/...) → 清單 ID。"""
    direct = find_list_id(share_url)
    if direct:
        return direct
    final_url, body = http_get(share_url)
    list_id = find_list_id(final_url) or find_list_id(body)
    if not list_id:
        raise RuntimeError(f"無法從連結取得清單 ID：{share_url}（請確認清單已設為「分享」）")
    return list_id


def parse_payload(text: str) -> dict:
    text = text.lstrip()
    if text.startswith(")]}'"):
        text = text[4:]
    return json.loads(text)


def _get(obj, *path):
    for p in path:
        try:
            obj = obj[p]
        except (IndexError, KeyError, TypeError):
            return None
    return obj


def _find_coords(node, depth=0):
    """在巢狀陣列中尋找 [null, null, lat, lng] 形式的座標。"""
    if depth > 6 or not isinstance(node, list):
        return None
    if (
        len(node) >= 4
        and node[0] is None
        and node[1] is None
        and isinstance(node[2], (int, float))
        and isinstance(node[3], (int, float))
        and -90 <= node[2] <= 90
        and -180 <= node[3] <= 180
    ):
        return node[2], node[3]
    for child in node:
        found = _find_coords(child, depth + 1)
        if found:
            return found
    return None


def extract_places(data, list_name: str) -> tuple[str, list[dict]]:
    root = _get(data, 0)
    title = _get(root, 4) if isinstance(_get(root, 4), str) else list_name
    items = _get(root, 8) or []
    places = []
    for it in items:
        if not isinstance(it, list):
            continue
        name = _get(it, 2) if isinstance(_get(it, 2), str) else None
        note = _get(it, 3) if isinstance(_get(it, 3), str) else ""
        info = _get(it, 1)
        coords = _find_coords(info)
        if not name or not coords:
            continue
        address = _get(info, 4) if isinstance(_get(info, 4), str) else ""
        if not address and isinstance(_get(info, 2), str):
            address = _get(info, 2)
        cid = None
        ids = _get(info, 6)
        if isinstance(ids, list):
            cid = next((x for x in ids if isinstance(x, str) and x), None)
        lat, lng = coords
        q = urllib.parse.quote(name.strip(), safe="")
        places.append(
            {
                "id": cid or f"{name}@{lat:.5f},{lng:.5f}",
                "name": name.strip(),
                "note": (note or "").strip(),
                "address": (address or "").strip(),
                "lat": lat,
                "lng": lng,
                "list": title or list_name,
                "gmaps": f"https://www.google.com/maps/search/{q}/@{lat},{lng},18z",
            }
        )
    return title or list_name, places


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dump", help="把原始回應存到這個資料夾")
    ap.add_argument("--from-file", help="不連網，直接解析本機的原始回應檔（測試用）")
    args = ap.parse_args()

    if args.from_file:
        data = parse_payload(Path(args.from_file).read_text("utf-8"))
        _, places = extract_places(data, "測試清單")
        print(json.dumps(places, ensure_ascii=False, indent=2))
        return 0

    lists = json.loads(LISTS_FILE.read_text("utf-8"))["lists"]
    lists = [l for l in lists if l.get("url", "").startswith("http")]
    if not lists:
        print("veggie/lists.json 尚未設定任何清單連結，略過同步。")
        return 0

    all_places: list[dict] = []
    errors = []
    for entry in lists:
        try:
            list_id = resolve_list_id(entry["url"])
            _, body = http_get(GETLIST.format(list_id=list_id))
            if args.dump:
                Path(args.dump).mkdir(parents=True, exist_ok=True)
                Path(args.dump, f"{list_id}.json").write_text(body, "utf-8")
            title, places = extract_places(parse_payload(body), entry.get("name", ""))
            if not places:
                print(f"  （解析不到地點，原始回應前 1500 字）{body[:1500]}", file=sys.stderr)
            if entry.get("name"):
                for p in places:
                    p["list"] = entry["name"]
            print(f"✓ {entry.get('name') or title}: {len(places)} 個地點")
            all_places.extend(places)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{entry.get('name') or entry['url']}: {exc}")
            print(f"✗ {errors[-1]}", file=sys.stderr)

    if errors and not all_places:
        print("全部清單都抓取失敗，保留原本的 places.json。", file=sys.stderr)
        return 1

    # 去除重複（同一地點出現在多個清單時合併清單名稱與備註）
    merged: dict[str, dict] = {}
    for p in all_places:
        if p["id"] in merged:
            m = merged[p["id"]]
            if p["list"] not in m["lists"]:
                m["lists"].append(p["list"])
            if p["note"] and p["note"] not in m["note"]:
                m["note"] = f"{m['note']}\n{p['note']}".strip()
        else:
            p["lists"] = [p.pop("list")]
            merged[p["id"]] = p

    out = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "demo": False,
        "errors": errors,
        "places": sorted(merged.values(), key=lambda x: x["name"]),
    }
    OUT_FILE.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"共寫入 {len(merged)} 個地點 → {OUT_FILE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
