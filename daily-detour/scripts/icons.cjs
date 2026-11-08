// Render the app icon (store/icon.svg) to every PNG size the web app and stores need.
//   node scripts/icons.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'store/icon.svg'), 'utf8');
// Maskable icons keep their art inside the central 80% safe zone.
const maskable = svg.replace('<g id="art">', '<g id="art" transform="translate(102 102) scale(.8)">');
const jobs = [
  ['public/icons/icon-192.png', 192, svg], ['public/icons/icon-512.png', 512, svg],
  ['public/icons/maskable-512.png', 512, maskable], ['public/icons/apple-touch-icon.png', 180, svg],
  ['store/icon-1024.png', 1024, svg],
];
(async () => {
  const browser = await chromium.launch();
  for (const [out, size, markup] of jobs) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<html><body style="margin:0">${markup.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
    await page.screenshot({ path: path.join(root, out), clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
  }
  await browser.close();
  console.log('icons written');
})();
