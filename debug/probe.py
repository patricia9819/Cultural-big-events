import re, sys, urllib.parse
sys.path.insert(0, "scripts")
import sync_google_lists as s
final, body = s.http_get("https://maps.app.goo.gl/RiJRgoFaCr5G4oAi6")
print("FINAL URL:", urllib.parse.unquote(final)[:600])
print("TITLE:", re.findall(r"<title>(.*?)</title>", body)[:1])
print("LEN", len(body))
for pat in [r"placelists/list/[\w-]+", r"!11m\d+![^\"&]{0,80}", r"!1s[\w-]{15,}", r"/maps/place/[^\"]{0,80}"]:
    print(pat, sorted(set(re.findall(pat, urllib.parse.unquote(body))))[:5])
