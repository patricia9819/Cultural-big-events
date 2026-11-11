"""Download Noto Sans TC / Noto Serif TC subset to the characters used in src/Visit.

Run from the video/ folder after changing any on-screen text:
    python3 scripts/subset-fonts.py
"""
import glob
import re
import subprocess
import urllib.parse

txt = "".join(open(f, encoding="utf-8").read() for f in glob.glob("src/Visit/*.ts*") + glob.glob("src/Reel/*.ts*"))
chars = "".join(sorted(set(c for c in txt + "0123456789" if not c.isspace())))
ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
for fam, key, weights in [
    ("Noto Sans TC", "sans", [300, 400, 500, 700, 900]),
    ("Noto Serif TC", "serif", [500, 700, 900]),
]:
    for w in weights:
        url = (
            "https://fonts.googleapis.com/css2?family=" + fam.replace(" ", "+")
            + f":wght@{w}&text=" + urllib.parse.quote(chars)
        )
        css = subprocess.check_output(["curl", "-sS", "-A", ua, url]).decode()
        src = re.search(r"url\((https://[^)]+)\)", css).group(1)
        subprocess.check_call(["curl", "-sS", "-o", f"public/fonts/{key}-{w}.woff2", src])
        print(f"public/fonts/{key}-{w}.woff2")
