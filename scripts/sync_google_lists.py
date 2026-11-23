#!/usr/bin/env python3
"""從 Google 地圖「已分享」清單抓取地點與備註，輸出 veggie/places.json。

另外會抓每間店的營業時間、地址、電話、網站，並下載 2 張照片到 veggie/photos/。
店家詳細資料每 7 天重新抓一次；照片只在沒有照片時才下載。

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
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LISTS_FILE = ROOT / "veggie" / "lists.json"
OUT_FILE = ROOT / "veggie" / "places.json"
PHOTO_DIR = ROOT / "veggie" / "photos"
DETAILS_MAX_AGE_DAYS = 7
PHOTOS_PER_PLACE = 2
PLACE_DETAILS = (
    "https://www.google.com/maps/preview/place?authuser=0&hl=zh-TW&gl=tw&pb="
    "!1m3!1s{fid}!3m1!1e1!12m4!2m3!1i360!2i120!4i8!13m57!2m2!1i203!2i100!3m2!2i4!5b1"
    "!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m42!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2"
    "!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e9!2b1!3e2!1m3"
    "!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!2b1!4b1!9b0!14m2!1s0!7e81!15m0"
    "!21m0!22m1!1e81!29m0!30m0!32b1!37i0"
)

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


def http_get_bytes(url: str) -> tuple[str, bytes]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.headers.get("Content-Type", ""), resp.read()


def find_list_id(text: str) -> str | None:
    text = urllib.parse.unquote(text)
    for pat in LIST_ID_PATTERNS:
        m = pat.search(text)
        if m:
            return m.group(1)
    return None


PLACE_URL_RE = re.compile(r"/maps/place/([^/]+)/.*?!1s(0x[0-9a-f]+:0x[0-9a-f]+).*?!3d(-?[\d.]+)!4d(-?[\d.]+)")


def resolve_link(share_url: str) -> tuple:
    """分享連結 → ("list", 清單ID) 或 ("place", 單一店家資訊)。"""
    direct = find_list_id(share_url)
    if direct:
        return ("list", direct)
    final_url, body = http_get(share_url)
    m = PLACE_URL_RE.search(urllib.parse.unquote(final_url))
    if m and "/placelists/" not in final_url:
        name = m.group(1).replace("+", " ")
        return ("place", {"fid": m.group(2), "name": name, "lat": float(m.group(3)), "lng": float(m.group(4))})
    list_id = find_list_id(final_url) or find_list_id(body)
    if not list_id:
        raise RuntimeError(f"無法從連結取得清單 ID：{share_url}（請確認清單已設為「分享」）")
    return ("list", list_id)


def single_place(info: dict, list_name: str) -> dict:
    """單一店家連結 → 一筆地點資料（id 與清單裡同一間店相同，會自動合併）。"""
    a, b = (int(x, 16) for x in info["fid"].split(":"))
    signed = a - (1 << 64) if a >= (1 << 63) else a
    name = info["name"]
    try:
        _, body = http_get(PLACE_DETAILS.format(fid=info["fid"]))
        d = _get(parse_payload(body), 6)
        if isinstance(_get(d, 11), str):
            name = _get(d, 11)
        address = _get(d, 39) if isinstance(_get(d, 39), str) else ""
    except Exception:  # noqa: BLE001
        address = ""
    q = urllib.parse.quote(name.strip(), safe="")
    return {
        "id": str(signed), "name": name.strip(), "note": "", "address": address,
        "lat": info["lat"], "lng": info["lng"], "fid": info["fid"], "list": list_name,
        "gmaps": f"https://www.google.com/maps/search/{q}/@{info['lat']},{info['lng']},18z",
    }
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
        cid = fid = None
        ids = _get(info, 6)
        if isinstance(ids, list):
            cid = next((x for x in ids if isinstance(x, str) and x), None)
            try:
                a, b = (int(x) % (1 << 64) for x in ids[:2])
                fid = f"0x{a:x}:0x{b:x}"
            except (TypeError, ValueError):
                fid = None
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
                "fid": fid,
                "list": title or list_name,
                "gmaps": f"https://www.google.com/maps/search/{q}/@{lat},{lng},18z",
            }
        )
    return title or list_name, places


def _walk_strings(node):
    if isinstance(node, str):
        yield node
    elif isinstance(node, list):
        for c in node:
            yield from _walk_strings(c)


def parse_details(body: str) -> dict:
    d = _get(parse_payload(body), 6)
    if not isinstance(d, list):
        raise RuntimeError("店家詳細資料格式不符")
    out: dict = {}
    week = _get(d, 203, 0)
    if isinstance(week, list):
        hours = []
        for day in week:
            name = _get(day, 0)
            num = _get(day, 1)
            ranges = _get(day, 3) or []
            texts = [r[0] for r in ranges if isinstance(r, list) and r and isinstance(r[0], str)]
            if isinstance(name, str) and isinstance(num, int):
                hours.append({"day": num, "name": name, "text": "、".join(texts) or "休息"})
        hours.sort(key=lambda h: h["day"])
        if hours:
            out["hours"] = hours
    for key, path in (("address", (39,)), ("category", (13, 0)), ("website", (7, 0)), ("phone", (178, 0, 0))):
        v = _get(d, *path)
        if isinstance(v, str) and v:
            out[key] = v
    photos = []
    seen = set()
    for src in (_get(d, 51, 0), _get(d, 37, 0), d):
        for u in _walk_strings(src):
            if "googleusercontent.com" in u and ("/grass-cs/" in u or "/p/" in u or "/gps-cs" in u):
                base = u.split("=")[0]
                if base not in seen:
                    seen.add(base)
                    photos.append(base)
        if len(photos) >= PHOTOS_PER_PLACE:
            break
    out["photo_urls"] = photos[: PHOTOS_PER_PLACE + 2]
    return out


def safe_name(pid: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]", "_", pid)[:60]


def download_photos(pid: str, urls: list[str]) -> list[str]:
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    saved = []
    for url in urls:
        if len(saved) >= PHOTOS_PER_PLACE:
            break
        try:
            ctype, data = http_get_bytes(url + "=w640-h480-k-no")
            if not ctype.startswith("image/") or len(data) < 2000:
                continue
            path = PHOTO_DIR / f"{safe_name(pid)}-{len(saved) + 1}.jpg"
            path.write_bytes(data)
            saved.append(f"photos/{path.name}")
        except Exception as exc:  # noqa: BLE001
            print(f"  照片下載失敗：{exc}", file=sys.stderr)
    return saved


def enrich(places: dict[str, dict], old: dict[str, dict]) -> None:
    """補上營業時間、照片等詳細資料；沿用上次抓過且未過期的資料。"""
    now = time.time()
    for pid, p in places.items():
        prev = old.get(pid, {})
        for k in ("hours", "phone", "website", "category", "photos", "details_at"):
            if k in prev:
                p[k] = prev[k]
        if not p.get("address") and prev.get("address"):
            p["address"] = prev["address"]
        fresh = now - prev.get("details_at", 0) < DETAILS_MAX_AGE_DAYS * 86400
        has_photos = bool(p.get("photos"))
        if (fresh and has_photos) or not p.get("fid"):
            continue
        try:
            _, body = http_get(PLACE_DETAILS.format(fid=p["fid"]))
            det = parse_details(body)
            for k in ("hours", "phone", "website", "category"):
                if k in det:
                    p[k] = det[k]
            if not p.get("address") and det.get("address"):
                p["address"] = det["address"]
            if not has_photos and det.get("photo_urls"):
                p["photos"] = download_photos(pid, det["photo_urls"])
            p["details_at"] = int(now)
            print(f"  · {p['name']}：營業時間 {'有' if p.get('hours') else '無'}，照片 {len(p.get('photos', []))} 張")
        except Exception as exc:  # noqa: BLE001
            print(f"  ✗ {p['name']} 詳細資料失敗：{exc}", file=sys.stderr)
        time.sleep(1.0)
    # 刪除已不在清單中的店家照片
    if PHOTO_DIR.exists():
        keep = {Path(x).name for p in places.values() for x in p.get("photos", [])}
        for f in PHOTO_DIR.iterdir():
            if f.name not in keep:
                f.unlink()


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
            kind, ref = resolve_link(entry["url"])
            if kind == "place":
                p = single_place(ref, entry.get("name") or "其他收藏")
                print(f"✓ 單一店家：{p['name']}")
                all_places.append(p)
                continue
            list_id = ref
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

    old_places: dict[str, dict] = {}
    old_updated = None
    if OUT_FILE.exists():
        try:
            old = json.loads(OUT_FILE.read_text("utf-8"))
            old_updated = old.get("updated")
            if not old.get("demo"):
                old_places = {p["id"]: p for p in old.get("places", [])}
        except (json.JSONDecodeError, KeyError):
            pass
    enrich(merged, old_places)

    places_sorted = sorted(merged.values(), key=lambda x: x["name"])
    # 內容沒變就保留原本的時間，避免每次都產生沒意義的更新
    unchanged = old_updated and [old_places.get(p["id"]) for p in places_sorted] == places_sorted and len(old_places) == len(places_sorted)
    out = {
        "updated": old_updated if unchanged else datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "demo": False,
        "errors": errors,
        "places": places_sorted,
    }
    OUT_FILE.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"共寫入 {len(merged)} 個地點 → {OUT_FILE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
