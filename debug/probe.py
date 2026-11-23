import json, re, sys, urllib.request, urllib.parse, pathlib
sys.path.insert(0, "scripts")
import sync_google_lists as s
out = pathlib.Path("debug/out"); out.mkdir(parents=True, exist_ok=True)
lid = s.resolve_list_id("https://maps.app.goo.gl/rfwBd3FmioaF2PqDA")
_, body = s.http_get(s.GETLIST.format(list_id=lid))
(out / "getlist.json").write_text(body, "utf-8")
data = s.parse_payload(body)
item = data[0][8][0]
(out / "item0.json").write_text(json.dumps(item, ensure_ascii=False, indent=1), "utf-8")
txt = json.dumps(item)
fids = re.findall(r"0x[0-9a-f]+:0x[0-9a-f]+", txt)
pids = re.findall(r"ChIJ[\w-]+", txt)
print("feature ids", fids, "place ids", pids)
urls = {}
if fids:
    cid = int(fids[0].split(":")[1], 16)
    urls["cid"] = f"https://www.google.com/maps?cid={cid}&hl=zh-TW&gl=tw"
    urls["fid"] = f"https://www.google.com/maps/place/data=!4m2!3m1!1s{fids[0]}?hl=zh-TW&gl=tw"
    urls["preview"] = ("https://www.google.com/maps/preview/place?authuser=0&hl=zh-TW&gl=tw&pb="
        f"!1m3!1s{fids[0]}!3m1!1e1!12m4!2m3!1i360!2i120!4i8!13m57!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m42!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e9!2b1!3e2!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!2b1!4b1!9b0!14m2!1s0!7e81!15m0!21m0!22m1!1e81!29m0!30m0!32b1!37i0")
name = item[2]
urls["search"] = "https://www.google.com/maps/search/" + urllib.parse.quote(name) + "?hl=zh-TW&gl=tw"
for k, u in urls.items():
    try:
        final, b = s.http_get(u)
        (out / f"{k}.txt").write_text(final + "\n" + b, "utf-8")
        print(k, len(b), "hours?", "星期" in b or "週一" in b, "photos?", b.count("googleusercontent.com/p/") + b.count("lh5.googleusercontent"))
    except Exception as e:
        print(k, "ERR", e)
