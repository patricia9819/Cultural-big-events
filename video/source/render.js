const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [,, mode, outDir, a, b] = process.argv;
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => console.log('console:', m.text()));
  page.on('pageerror', e => console.log('ERR', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'reel.html'));
  const nf = await page.evaluate(() => window.ready);
  console.log('fonts loaded faces:', nf);
  fs.mkdirSync(outDir, { recursive: true });
  const canvas = await page.$('canvas');
  const times = mode === 'times' ? a.split(',').map(Number) : null;
  const frames = times ? times.map(t => Math.round(t * 30)) : Array.from({ length: +b - +a }, (_, i) => +a + i);
  for (const f of frames) {
    await page.evaluate(t => window.render(t), f / 30);
    await canvas.screenshot({ path: path.join(outDir, `f${String(f).padStart(4, '0')}.png`) });
  }
  await browser.close();
})();
