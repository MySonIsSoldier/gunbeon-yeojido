// Opens live guest UI only: does not save trips, create groups, or alter existing accounts.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = createRequire(new URL('../web/package.json', import.meta.url))('playwright');
const base = process.env.QA_BASE_URL || 'https://gunbeon.gangwon.kr';
const origin = new URL(base).origin;
const token = process.env.QA_SITE_TOKEN;
const out = process.env.QA_OUT_DIR || 'reports/qa/universal-guide/production';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [320, 430, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 500 ? 820 : 1000 }, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce' });
    // Scope the private development bypass to our exact origin, never third-party requests.
    if (token) await ctx.route(url => url.origin === origin, route => route.continue({ headers: { ...route.request().headers(), 'OAI-Sites-Authorization': `Bearer ${token}` } }));
    const p = await ctx.newPage(); p.setDefaultTimeout(45000);
    const errors = []; p.on('pageerror', e => errors.push(e.message));
    const response = await ctx.request.post(base + '/api/test-access', { data: { password: process.env.QA_TEST_PASSWORD || '1234' }, headers: { Origin: origin, ...(token ? { 'OAI-Sites-Authorization': `Bearer ${token}` } : {}) } });
    assert(response.ok(), 'Guest access status ' + response.status());
    const start = performance.now();
    await p.goto(base + '/'); await p.locator('.app-shell[data-ready=true]').waitFor();
    const readyMs = Math.round(performance.now() - start);
    await p.getByRole('heading', { name: '첫 여행, 코스 하나부터 골라볼까요?' }).waitFor();
    const button = p.getByRole('button', { name: '여행 가이드 다시 보기', exact: true });
    assert((await button.boundingBox()).y < 220);
    await p.screenshot({ path: `${out}/${width}-home.png` });
    await button.click(); await p.getByRole('heading', { name: '일정은 한눈에, 편집은 필요할 때.' }).waitFor();
    await p.getByRole('button', { name: '기능별로 따라 해볼게요' }).click();
    await p.getByRole('button', { name: '추천 코스 고르기', exact: true }).click();
    await p.getByRole('heading', { name: '어떤 강원을 만나볼까요?' }).waitFor();
    await button.click(); await p.getByRole('heading', { name: '일정은 한눈에, 편집은 필요할 때.' }).waitFor();
    await p.screenshot({ path: `${out}/${width}-guide.png` });
    await p.keyboard.press('Escape');
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    assert.deepEqual(errors, []);
    results.push({ width, status: 'passed', readyMs, checks: ['Visible top guide for guest', 'First itinerary guidance opens recommendations', 'Guide reopens on another tab', 'Reduced motion, Escape and no overflow'], errors });
    await ctx.close();
  }
} finally { await browser.close(); }
await fs.writeFile(out + '/results.json', JSON.stringify({ base, at: new Date().toISOString(), mode: 'Live guest UI; no account or travel creation; desktop viewport simulation', results }, null, 2));
console.log(JSON.stringify(results));
