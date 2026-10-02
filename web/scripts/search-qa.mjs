import { chromium, request } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const indexable = process.env.QA_SEARCH_INDEXABLE === '1';
const origin = new URL(base).origin;
const out = path.resolve(process.env.QA_OUT_DIR || '../tmp/qa/search');
await fs.mkdir(out, { recursive: true });
const bypass = process.env.QA_SITES_BYPASS;
// Credentials are added only to this exact origin, never to external links or assets.
const headers = {
  Origin: origin,
  ...(bypass ? { 'OAI-Sites-Authorization': `Bearer ${bypass}` } : {}),
};
const api = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: headers,
});
const report = {
  base,
  checkedAt: new Date().toISOString(),
  indexable,
  checks: [],
};
let browser;
try {
  const pages = ['/', '/about', '/guide', '/privacy', '/terms'];
  for (const pathname of pages) {
    const r = await api.get(pathname, { maxRedirects: 0 });
    assert.equal(r.status(), 200, pathname);
    const html = await r.text();
    const head = html.split('</head>')[0];
    const canonical = head.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
    assert.ok(canonical, `Initial head must include canonical: ${pathname}`);
    // Production URL serialization may omit the root slash; these are the same URL.
    assert.equal(new URL(canonical[1]).href, new URL(pathname, 'https://gunbeon.gangwon.kr').href);
    assert.match(head, /<title>[^<]*군번여지도/);
    if (indexable)
      assert.doesNotMatch(r.headers()['x-robots-tag'] || '', /noindex/);
    else assert.match(r.headers()['x-robots-tag'] || '', /noindex/);
    if (pathname === '/') {
      assert.match(html, /함께 기다린 하루/);
      assert.match(html, /application\/ld\+json/);
      assert.match(r.headers()['cache-control'], /private.*no-store/);
    }
  }
  const robots = await api.get('/robots.txt', { maxRedirects: 0 });
  assert.equal(robots.status(), 200);
  assert.match(robots.headers()['content-type'], /text\/plain/);
  assert.match(
    await robots.text(),
    indexable
      ? /Sitemap: https:\/\/gunbeon.gangwon.kr\/sitemap.xml/
      : /Disallow: \/\n/,
  );
  const sitemap = await api.get('/sitemap.xml', { maxRedirects: 0 });
  assert.equal(sitemap.status(), 200);
  assert.match(sitemap.headers()['content-type'], /application\/xml/);
  const xml = await sitemap.text();
  assert.equal([...xml.matchAll(/<loc>/g)].length, indexable ? 5 : 0);
  assert.doesNotMatch(xml, /login|account|\/api\/|\/p\//);
  for (const pathname of ['/login', '/account']) {
    const r = await api.get(pathname, { maxRedirects: 0 });
    assert.equal(r.status(), 200);
    assert.match(r.headers()['x-robots-tag'], /noindex/);
    assert.match(await r.text(), /name="robots" content="noindex/);
  }
  for (const pathname of ['/api/account/state', '/api/groups', '/api/places'])
    assert.equal(
      (await api.get(pathname, { maxRedirects: 0 })).status(),
      401,
      pathname,
    );
  for (const [key, length] of [
    ['join', 48],
    ['advice', 32],
  ]) {
    const r = await api.get('/?' + key + '=' + 'a'.repeat(length), {
      maxRedirects: 0,
    });
    assert.equal(r.status(), 307);
    assert.match(r.headers().location, new RegExp('/login\\?' + key + '='));
  }
  report.checks.push(
    'Anonymous SSR/public URLs, canonical, robots/XML, login noindex, private APIs, invitation redirects',
  );
  const bot = await api.get('/', { maxRedirects: 0, headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' } });
  assert.equal(bot.status(), 200);
  const botHtml = await bot.text();
  assert.match(botHtml.split('</head>')[0], /rel="canonical"/);
  assert.match(botHtml, /함께 기다린 하루/);
  browser = await chromium.launch({
    ...(process.env.QA_BROWSER_CHANNEL &&
    process.env.QA_BROWSER_CHANNEL !== 'chromium'
      ? { channel: process.env.QA_BROWSER_CHANNEL }
      : {}),
    headless: true,
  });
  for (const width of [320, 430, 1440]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      locale: 'ko-KR',
      javaScriptEnabled: false,
    });
    if (bypass)
      await ctx.route(
        (url) => url.origin === origin,
        (route) =>
          route.continue({
            headers: { ...route.request().headers(), ...headers },
          }),
      );
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'load' });
    await page.getByRole('heading', { level: 1 }).waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: path.join(out, `public-home-${width}.png`),
      fullPage: true,
    });
    await page.getByRole('link', { name: '사용법 먼저 보기' }).click();
    await page.locator('.usage-guide').waitFor();
    await ctx.close();
  }
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 900 },
    locale: 'ko-KR',
  });
  await ctx.route('**/api/places?*', (route) =>
    route.fulfill({
      status: 503,
      json: { mode: 'unavailable', places: [], error: 'QA_UNAVAILABLE' },
    }),
  );
  if (bypass)
    await ctx.route(
      (url) => url.origin === origin && !url.pathname.startsWith('/api/places'),
      (route) =>
        route.continue({
          headers: { ...route.request().headers(), ...headers },
        }),
    );
  const guest = await ctx.request.post(base + '/api/test-access', {
    headers,
    data: { password: '1234' },
  });
  assert.equal(guest.status(), 200);
  const page = await ctx.newPage();
  const root = await page.goto(base);
  assert.match(root.headers()['x-robots-tag'], /noindex/);
  await page.locator('.app-shell[data-ready=true]').waitFor({ timeout: 45000 });
  assert.equal(await page.locator('.public-home').count(), 0);
  await ctx.close();
  report.checks.push(
    'JavaScript-disabled mobile/desktop landing and guide; authenticated visitor retains travel app',
  );
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.error = String(error.message).replace(
    /Bearer \S+/g,
    'Bearer [redacted]',
  );
  process.exitCode = 1;
} finally {
  await browser?.close();
  await api.dispose();
  await fs.writeFile(
    path.join(out, 'results.json'),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
}
