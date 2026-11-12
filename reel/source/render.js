const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const FPS = 30, DUR = 66.5, NF = Math.round(FPS * DUR), WORKERS = 4;
(async () => {
  const root = __dirname;
  const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } const ext = path.extname(f); r.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' }[ext] || 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const port = srv.address().port;
  const b = await chromium.launch();
  const per = Math.ceil(NF / WORKERS);
  await Promise.all([...Array(WORKERS)].map(async (_, w) => {
    const f0 = w * per, f1 = Math.min(NF, f0 + per);
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto(`http://localhost:${port}/${process.env.PAGE||'reel.html'}`); await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', `seg${w}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise(r => ff.on('close', r));
    for (let f = f0; f < f1; f++) {
      await p.evaluate(t => render(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 100 === 0) console.log(`w${w} ${f - f0}/${f1 - f0}`);
    }
    ff.stdin.end(); await done;
  }));
  await b.close(); srv.close();
  fs.writeFileSync('segs.txt', [...Array(WORKERS)].map((_, w) => `file 'seg${w}.mp4'`).join('\n'));
  console.log('done');
})();
