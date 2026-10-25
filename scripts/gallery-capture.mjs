#!/usr/bin/env node
/**
 * Gallery capture: drives the production build (served with TORRENT_DEBUG_API=1 on :4173) in headless Chromium on
 * the real GPU, clicks the app's own buttons, freezes the scene and saves 2880×1920 PNGs (1440×960 CSS px @ DPR 2).
 *
 *   TORRENT_DEBUG_API=1 npm run demo                      (in another terminal)
 *   node scripts/gallery-capture.mjs [shot-id …]          (no ids = every shot)
 *
 * PNGs land in artifacts/gallery-new/raw/ (git-ignored). The finals in submission/gallery2/ are these, converted to
 * 2400×1600 JPEG: sips -s format jpeg -s formatOptions 88 -z 1600 2400 <in.png> --out <out.jpg>
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4173/';
const OUT = path.resolve('artifacts/gallery-new/raw');
fs.mkdirSync(OUT, { recursive: true });

// ── in-page helpers ────────────────────────────────────────────────────────────
const inPage = {
  async ready() {
    await window.__torrent.ready;
  },
  freeze() {
    const d = window.__torrent;
    d.setPaused(true);
    d.setAdaptiveBudget(false);
    d.getRenderer()?.setQuality?.('high');
  },
  async run(sec) {
    await window.__torrent.runFor(sec);
  },
  cam(pose) {
    const d = window.__torrent;
    const sc = d.getScenario()?.camera;
    const t = pose.target ?? {};
    const gx = t.gx ?? sc.target.gx;
    const gy = t.gy ?? sc.target.gy;
    const elevation = t.elevation ?? d.sampleAt(gx, gy)?.ground ?? sc.target.elevation;
    d.setCamera({
      target: { gx, gy, elevation },
      distance: pose.distance ?? sc.distance,
      yaw: pose.yaw ?? sc.yaw,
      pitch: pose.pitch ?? sc.pitch,
    });
  },
  async settle(maxMs) {
    const d = window.__torrent;
    const t0 = performance.now();
    let last = -1;
    while (performance.now() - t0 < maxMs) {
      await new Promise((r) => setTimeout(r, 400));
      const t = d.getPerf().animTime;
      if (t === last) return true;
      last = t;
    }
    return false;
  },
};

async function P(page, name, ...args) {
  return page.evaluate(
    ([src, a]) => {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${src})`)();
      return fn(...a);
    },
    [inPage[name].toString().replace(/^async\s+\w+\(|^\w+\(/, (m) => (m.startsWith('async') ? 'async function(' : 'function(')), args],
  );
}
const click = (page, name) => page.getByRole('button', { name, exact: false }).first().click();

// ── shots ──────────────────────────────────────────────────────────────────────
const SHOTS = {
  'pgh-crest-depth': {
    url: '?preset=pittsburgh',
    async setup(page) {
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 1200);
      await mode(page, 'depth');
      await P(page, 'cam', { distance: 3600, pitch: 0.62 });
    },
  },
  'pgh-hero': {
    url: '?preset=pittsburgh',
    async setup(page) {
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 1200);
      await mode(page, 'depth');
      await page.evaluate(() => window.__torrent.setLook({ quality: 'cinematic', timeOfDay: 'goldenHour', presentation: true }));
      await P(page, 'cam', { target: { gx: 430, gy: 560 }, distance: 2300, yaw: 0.35, pitch: 0.42 });
    },
  },
  'pgh-levee': {
    url: '?preset=pittsburgh',
    async setup(page) {
      await click(page, 'Build a levee');
      await page.waitForTimeout(3000);
      await P(page, 'freeze');
      await P(page, 'run', 900);
      for (let i = 0; i < 20 && (await page.evaluate(() => window.__torrent.getStageApplied().moving)); i++) await P(page, 'run', 300);
      await P(page, 'run', 900);
      await page.waitForFunction(() => window.__torrent.getProtection(), null, { timeout: 30000 }).catch(() => {});
      await page.waitForFunction(() => !/Building a 2\.4 km levee/.test(document.body.innerText), null, { timeout: 30000, polling: 1000 }).catch(() => {});
      await page.waitForTimeout(3000);
      await mode(page, 'depth');
    },
  },
  'pgh-evacuate': {
    url: '?preset=pittsburgh',
    async setup(page) {
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 240);
      await click(page, 'Evacuate');
      const ok = await page.waitForFunction(() => window.__torrent.getState().evacStart, null, { timeout: 8000 }).then(() => true, () => false);
      if (!ok) await page.evaluate(() => { const e = window.__torrent.getScenario().evacStart; window.__torrent.setEvacStart(e); });
      await P(page, 'run', 360);
      await page.waitForFunction(() => window.__torrent.getRoute(), null, { timeout: 15000 }).catch(() => {});
      await mode(page, 'depth');
      await P(page, 'cam', { target: { gx: 520, gy: 540 }, distance: 2600, yaw: 0.25, pitch: 0.7 });
      await page.evaluate(() => window.__torrent.selectTool('orbit'));
    },
  },
  'how-it-works': {
    url: '?preset=pittsburgh',
    live: true,
    async setup(page) {
      await tryFirst(page);
      await page.waitForTimeout(6000);
      await click(page, 'How it works');
      await page.waitForTimeout(1200);
      await page.getByRole('tab', { name: 'The equations' }).or(page.getByRole('button', { name: 'The equations' })).first().click();
      await page.waitForTimeout(1500);
    },
  },
  'site-check': {
    url: '?usecase=site',
    async setup(page) {
      await page.waitForTimeout(3000);
      await P(page, 'freeze');
      await click(page, 'Run sweep');
      await page.waitForFunction(() => /Expected annual loss|EAL/i.test(document.body.innerText) && ![...document.querySelectorAll('button')].some((b) => /^Cancel$/.test(b.textContent.trim()) && b.offsetParent), null, { timeout: 300000, polling: 2000 });
      await page.waitForTimeout(2000);
      await page.evaluate(() => {
        const el = [...document.querySelectorAll('p, div, li')].find((e) => e.childElementCount === 0 && /^Water reaches Demo parcel A/.test(e.textContent.trim()));
        el?.scrollIntoView({ block: 'start' });
      });
      await page.waitForTimeout(800);
    },
  },
  'nepal-glacier': {
    url: '?usecase=glacier',
    async setup(page) {
      await page.waitForTimeout(3000);
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 1500);
      await mode(page, 'depth');
      await page.waitForFunction(() => !/on its way down the valley/.test(document.body.innerText), null, { timeout: 30000, polling: 1000 }).catch(() => {});
    },
  },
  'houston-portfolio': {
    url: '?usecase=portfolio',
    async setup(page) {
      await page.waitForTimeout(3000);
      await P(page, 'freeze');
      await P(page, 'run', 1800);
      await mode(page, 'depth');
      await click(page, 'Recompute');
      await page.waitForFunction(() => !/0 of 19 reached/.test(document.body.innerText), null, { timeout: 60000, polling: 1000 }).catch(() => {});
      await page.waitForTimeout(2000);
    },
  },
  'ftmyers-surge': {
    url: '?preset=ftmyers',
    async setup(page) {
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 1800);
      await mode(page, 'depth');
    },
  },
  'ftmyers-surge-b': {
    url: '?preset=ftmyers',
    async setup(page) {
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 1800);
      await mode(page, 'depth');
      await P(page, 'cam', { yaw: 1.45 + Math.PI, distance: 3400, pitch: 0.55 });
    },
  },
  'ftmyers-surge-c': {
    url: '?preset=ftmyers',
    async setup(page) {
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 1800);
      await mode(page, 'depth');
      await P(page, 'cam', { distance: 4200, pitch: 1.05 });
    },
  },
  'pgh-ensemble': {
    url: '?preset=pittsburgh',
    async setup(page) {
      await tryFirst(page);
      await P(page, 'freeze');
      await P(page, 'run', 600);
      await click(page, 'Uncertainty');
      await page.waitForTimeout(800);
      await click(page, 'Run ensemble');
      await page.waitForFunction(() => /Member \d+ of \d+/.test(document.body.innerText), null, { timeout: 30000 });
      await page.waitForFunction(() => !/Member \d+ of \d+/.test(document.body.innerText), null, { timeout: 600000, polling: 3000 });
      await page.waitForTimeout(2000);
      await mode(page, 'probability');
      await P(page, 'cam', { distance: 3600, pitch: 0.62 });
    },
  },
  'asheville-helene': {
    url: '?preset=asheville',
    async setup(page) {
      await P(page, 'freeze');
      await P(page, 'run', 2400);
      await mode(page, 'depth');
    },
  },
  'boulder-speed': {
    url: '?preset=boulder',
    async setup(page) {
      await P(page, 'freeze');
      await P(page, 'run', 1200);
      await mode(page, 'velocity');
    },
  },
};

async function tryFirst(page) {
  await page.locator('.dl-try-row button').first().click();
}
async function mode(page, m) {
  await page.evaluate((x) => window.__torrent.setWaterMode(x), m);
}

// ── runner ─────────────────────────────────────────────────────────────────────
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);
const browser = await chromium.launch({
  headless: true,
  channel: 'chromium',
  args: ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'],
});
try {
  for (const id of ids) {
    const s = SHOTS[id];
    if (!s) throw new Error(`unknown shot ${id}`);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const sep = s.url.includes('?') ? '&' : '?';
    await page.goto(BASE + s.url + sep + 'tutorial=0', { timeout: 120000 });
    await P(page, 'ready');
    await page.waitForTimeout(1500);
    const t0 = Date.now();
    await s.setup(page);
    if (!s.live) await page.evaluate(() => window.__torrent.setPaused(true));
    const frozen = await P(page, 'settle', 15000);
    await page.waitForTimeout(800);
    const file = path.join(OUT, `${id}.png`);
    await page.screenshot({ path: file });
    console.log(`${id}: ${((Date.now() - t0) / 1000).toFixed(1)} s, settled=${frozen}${errors.length ? `, errors: ${errors.slice(0, 3).join(' | ')}` : ''}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
