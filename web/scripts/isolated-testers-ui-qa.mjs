import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.QA_BASE_URL || 'http://localhost:3000',
  out = process.env.QA_OUT_DIR || '../reports/qa/isolated-testers/ui';
await fs.mkdir(out, { recursive: true });
const results = [];
for (const channel of (process.env.QA_BROWSER_CHANNELS || 'chromium').split(
  ',',
)) {
  const browser = await chromium.launch({
    headless: true,
    ...(channel === 'chromium' ? {} : { channel }),
  });
  for (const width of [320, 430, 1440]) {
    const c = await browser.newContext({
      viewport: { width, height: width < 500 ? 900 : 1050 },
      reducedMotion: 'reduce',
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
      extraHTTPHeaders:
        new URL(base).hostname === 'localhost'
          ? { 'cf-connecting-ip': '192.0.2.' + ((width % 240) + 1) }
          : {},
    });
    if (process.env.QA_SITE_TOKEN)
      await c.route(
        (url) => url.origin === new URL(base).origin,
        (route) =>
          route.continue({
            headers: {
              ...route.request().headers(),
              'OAI-Sites-Authorization': 'Bearer ' + process.env.QA_SITE_TOKEN,
            },
          }),
      );
    const p = await c.newPage();
    p.setDefaultTimeout(45000);
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const r = { channel, width, checks: [], errors };
    const shot = (name) =>
      p.screenshot({
        path: `${out}/${channel}-${width}-${name}.png`,
        fullPage: true,
      });
    try {
      await p.goto(base + '/login');
      await p.locator('.account-page[data-ready=true]').waitFor();
      const primary = p.getByRole('button', { name: '민준 테스터 계정 선택' }),
        secondary = p.getByRole('button', { name: 'openapi 테스트 계정 넣기' });
      const a = await primary.boundingBox(),
        b = await secondary.boundingBox();
      assert(b.y >= a.y + a.height);
      assert(b.height >= 44);
      assert(
        Number(
          await secondary.evaluate((e) =>
            getComputedStyle(e).fontSize.replace('px', ''),
          ),
        ) <
          Number(
            await primary.evaluate((e) =>
              getComputedStyle(e).fontSize.replace('px', ''),
            ),
          ),
      );
      await p.getByText('두 테스트 계정 모두 나만의 체험 공간이에요').waitFor();
      await shot('login');
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      await primary.click();
      assert.equal(
        await p.getByLabel('아이디', { exact: true }).inputValue(),
        'minjun_demo',
      );
      await secondary.click();
      assert.equal(
        await p.getByLabel('아이디', { exact: true }).inputValue(),
        'openapi',
      );
      assert.equal(
        await p.getByLabel('비밀번호', { exact: true }).inputValue(),
        '2026openapi!',
      );
      await p.getByRole('button', { name: 'openapi로 체험 시작' }).click();
      await p
        .getByRole('heading', { name: '기능별로 따라 해볼게요' })
        .waitFor();
      await p.getByRole('button', { name: '바로 둘러볼게요' }).click();
      await p.getByRole('button', { name: '새 여행', exact: true }).click();
      const title = 'QA 이 기기에서 이어보는 여행';
      await p.getByLabel('코스 이름', { exact: true }).fill(title);
      await p
        .getByRole('button', { name: '내 코스 저장', exact: true })
        .click();
      await p
        .getByLabel('코스 이름', { exact: true })
        .waitFor({ state: 'hidden' });
      await p.getByText('내 계정에 저장됨', { exact: true }).waitFor();
      await p.reload();
      await p.locator('.app-shell[data-ready=true]').waitFor();
      await p.getByRole('tab', { name: '내 여행', exact: true }).click();
      await p.getByRole('heading', { name: title, exact: true }).waitFor();
      await shot('session-resumed');
      await p.goto(base + '/account');
      await p.locator('.account-page[data-ready=true]').waitFor();
      await p
        .getByText('openapi · 기능심사 체험 공간', { exact: true })
        .waitFor();
      await p.getByRole('button', { name: '로그아웃', exact: true }).click();
      await p.locator('.account-page[data-ready=true]').waitFor();
      await secondary.click();
      await p.getByRole('button', { name: 'openapi로 체험 시작' }).click();
      await p
        .getByRole('heading', { name: '기능별로 따라 해볼게요' })
        .waitFor();
      await p.getByRole('button', { name: '바로 둘러볼게요' }).click();
      await p.getByRole('tab', { name: '내 여행', exact: true }).click();
      assert.equal(
        await p.getByRole('heading', { name: title, exact: true }).count(),
        0,
      );
      await shot('fresh-login');
      assert.deepEqual(errors, []);
      r.checks.push(
        'Secondary openapi autofill and both-account notice',
        'Judge automatic guide; actual empty trip save; reload keeps changes; logout and relogin starts clean',
        'No horizontal overflow or uncaught errors',
      );
      r.status = 'passed';
    } catch (e) {
      r.status = 'failed';
      r.error = e.message;
      await shot('failure');
      process.exitCode = 1;
    }
    results.push(r);
    console.log(JSON.stringify(r));
    await c.close();
  }
  await browser.close();
}
await fs.writeFile(
  out + '/results.json',
  JSON.stringify(
    {
      base,
      at: new Date().toISOString(),
      mode: 'Real browser authentication and own disposable tester state; viewport emulation',
      results,
    },
    null,
    2,
  ),
);
