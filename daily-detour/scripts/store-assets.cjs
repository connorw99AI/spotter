// Store screenshots and an app-preview capture, driven through the real game.
// Needs the dev server on :5173 (npm run dev) and ffmpeg for the video.
//   node scripts/store-assets.cjs
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:5173/';
const OUT = path.join(__dirname, '..', 'store');
const TMP = path.join(OUT, '.raw');
fs.mkdirSync(TMP, { recursive: true });

// A believable save: some routes delivered, most of the village restored, a run going.
const SAVE = (() => {
  const levels = {};
  // Consistent with the rules: 20 classic routes and 10 Market Town routes earn enough hearts
  // (about 110 with the dailies) for the nine restored projects.
  const ids = ['morning-loaves', 'there-and-back', 'fork-in-the-lane', 'corner-shop-shuffle', 'roadworks-on-rye', 'sunday-scoops', 'ring-road', 'picnic-hamper', 'wren-close',
    'over-the-bridge', 'basket-case', 'full-basket-fresh-ice', 'roundabout-rounds', 'market-day', 'old-town-blooms', 'cul-de-sac-crescent', 'the-grand-detour', 'melting-point', 'harbour-lights', 'the-long-way-home',
    ...Array.from({ length: 10 }, (_, i) => `market-town-${String(i + 1).padStart(2, '0')}`)];
  ids.forEach((id, i) => { levels[id] = { rev: 1, completions: 1, bestMoves: 10, bestMedal: i % 4 ? 'gold' : 'silver' }; });
  const daily = {};
  for (let d = 1; d <= 7; d++) daily[`2026-11-0${d}`] = { puzzleId: 'x', rev: 1, moves: 12, medal: d % 3 ? 'gold' : 'silver', hints: 0 };
  return { version: 1, levels, daily, drafts: {}, restored: ['lane', 'boxes', 'bench', 'lamps', 'fountain', 'bakery', 'orchard', 'bridge', 'allotments'], settings: { motion: 'full', sound: false, music: false } };
})();

/** Give every seeded record a best that matches its medal against the puzzle's real gold. */
async function makeSaveHonest(page) {
  await page.evaluate(async () => {
    const { getPuzzle } = await import('/src/data/catalog.ts');
    const save = JSON.parse(localStorage.getItem('daily-detour/save'));
    for (const [id, r] of Object.entries(save.levels)) {
      const gold = getPuzzle(id).gold;
      r.bestMoves = r.bestMedal === 'gold' ? gold : gold + 2;
    }
    localStorage.setItem('daily-detour/save', JSON.stringify(save));
  });
  await page.reload();
}

async function tapRoute(page, id, upto) {
  const pts = await page.evaluate(async (pid) => {
    const { getPuzzle } = await import('/src/data/catalog.ts');
    const { buildTown } = await import('/src/core/town.ts');
    const { solvePuzzle } = await import('/src/core/solver.ts');
    const t = buildTown(getPuzzle(pid));
    const svg = document.querySelector('.map-svg'); const m = svg.getScreenCTM();
    return solvePuzzle(t).route.slice(1).map((n) => { const q = t.pos.get(n); const pt = svg.createSVGPoint(); pt.x = q.x * 100; pt.y = q.y * 100; const r = pt.matrixTransform(m); return { x: r.x, y: r.y }; });
  }, id);
  return pts.slice(0, upto ?? pts.length);
}

async function drag(page, pts, pause) {
  await page.mouse.move(pts[0].x, pts[0].y);
  await page.mouse.down();
  for (const p of pts) { await page.mouse.move(p.x, p.y, { steps: 8 }); if (pause) await page.waitForTimeout(pause); }
  await page.mouse.up();
}

async function screenshots(browser) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.addInitScript((save) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('daily-detour/save', JSON.stringify(save)); sessionStorage.setItem('seeded', '1'); } }, SAVE);
  const page = await ctx.newPage();
  const shots = [];
  const shot = async (name, caption) => { await page.waitForTimeout(500); const f = path.join(TMP, `${name}.png`); await page.screenshot({ path: f }); shots.push({ f, caption }); };

  await page.goto(BASE + '#town'); await page.waitForSelector('.home');
  await makeSaveHonest(page); await page.waitForSelector('.home');
  await shot('1-home', 'A new delivery puzzle every day');

  await page.goto(BASE + '#route-harbour-lights'); await page.waitForSelector('.map-svg');
  const harbour = await tapRoute(page, 'harbour-lights', 13);
  for (const p of harbour) { await page.touchscreen.tap(p.x, p.y); await page.waitForTimeout(40); }
  await shot('2-plan', 'Plan the perfect round');

  await page.goto(BASE + '#route-sunday-scoops'); await page.waitForSelector('.map-svg');
  await page.click('.btn-hint'); await page.click('.hint-more'); await page.waitForSelector('.hint-item.stage-2');
  await shot('3-hints', 'Ice cream melts. Take the clever detour');

  await page.goto(BASE + '#route-over-the-bridge'); await page.waitForSelector('.map-svg');
  for (const p of await tapRoute(page, 'over-the-bridge')) { await page.touchscreen.tap(p.x, p.y); await page.waitForTimeout(30); }
  await page.click('.btn-ride');
  await page.waitForSelector('.docket-backdrop:not([hidden])', { timeout: 20000 });
  await page.waitForTimeout(1200);
  await shot('4-stamp', 'Earn stamps and thank-you notes');

  await page.goto(BASE + '#village'); await page.waitForSelector('.village-art');
  await shot('5-village', 'Bring your village back to life');

  await page.goto(BASE + '#book'); await page.waitForSelector('.chapter-card');
  await shot('6-book', '140 routes and a year of dailies');
  await ctx.close();
  return shots;
}

async function frame(browser, shots) {
  const sizes = [['ios-6.7', 1290, 2796], ['android-phone', 1080, 1920]];
  const page = await browser.newPage({ viewport: { width: 1290, height: 2796 }, deviceScaleFactor: 1 });
  for (const [dir, W, H] of sizes) {
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
    await page.setViewportSize({ width: W, height: H });
    for (const s of shots) {
      const img = 'data:image/png;base64,' + fs.readFileSync(s.f).toString('base64');
      const capH = Math.round(H * 0.15);
      const imgH = H - capH - Math.round(H * 0.05);
      await page.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Young+Serif&display=swap" rel="stylesheet"></head>
        <body style="margin:0;width:${W}px;height:${H}px;background:linear-gradient(#FBF4E4,#F1E6CC);display:flex;flex-direction:column;align-items:center;overflow:hidden">
        <div style="height:${capH}px;display:flex;align-items:center;justify-content:center;padding:0 ${W * 0.07}px;text-align:center;font:400 ${Math.round(W * 0.07)}px 'Young Serif',Georgia,serif;color:#2F5D46;line-height:1.1">${s.caption}</div>
        <img src="${img}" style="height:${imgH}px;border-radius:${Math.round(W * 0.05)}px;box-shadow:0 30px 80px rgba(35,53,43,.25)"></body></html>`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(OUT, dir, path.basename(s.f).replace('.png', '.jpg')), type: 'jpeg', quality: 86 });
    }
  }
  await page.close();
}

async function preview(browser) {
  const dir = path.join(TMP, 'video');
  fs.rmSync(dir, { recursive: true, force: true });
  // Playwright never scales a recording up, so capture at the page size and upscale in ffmpeg.
  const ctx = await browser.newContext({ viewport: { width: 443, height: 960 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, recordVideo: { dir, size: { width: 443, height: 960 } } });
  const save = { ...SAVE, restored: SAVE.restored.slice(0, 8), settings: { motion: 'full', sound: false, music: false, speed: 'relaxed' } };
  await ctx.addInitScript((sv) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('daily-detour/save', JSON.stringify(sv)); sessionStorage.setItem('seeded', '1'); } }, save);
  const page = await ctx.newPage();
  await page.goto(BASE + '#town'); await page.waitForSelector('.home');
  await makeSaveHonest(page); await page.waitForSelector('.home'); await page.waitForTimeout(1800);
  await page.goto(BASE + '#route-picnic-hamper'); await page.waitForSelector('.map-svg'); await page.waitForTimeout(1200);
  await drag(page, await tapRoute(page, 'picnic-hamper'), 260);
  await page.waitForTimeout(700);
  await page.click('.btn-ride');
  await page.waitForSelector('.docket-backdrop:not([hidden])', { timeout: 20000 });
  await page.waitForTimeout(2600);
  await page.goto(BASE + '#village'); await page.waitForSelector('.village-art'); await page.waitForTimeout(900);
  await page.click('.project-ready .btn');
  await page.waitForTimeout(2600);
  const video = page.video();
  await ctx.close();
  const webm = await video.path();
  const mp4 = path.join(OUT, 'app-preview.mp4');
  // H.264 at 30 fps with a silent audio track, capped at 30 seconds.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-t', '29', '-vf', 'fps=30,scale=886:1920:flags=lanczos,unsharp=5:5:0.6,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-crf', '20', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', mp4]);
  return mp4;
}

(async () => {
  const browser = await chromium.launch();
  const shots = await screenshots(browser);
  await frame(browser, shots);
  const mp4 = await preview(browser);
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log(`screenshots: ${shots.length} per size; preview: ${path.relative(process.cwd(), mp4)}`);
})();
