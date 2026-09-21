import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const out = process.env.QA_OUT_DIR || '../reports/qa/universal-guide';
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
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 820 : 1000 },
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
      reducedMotion: 'reduce',
      extraHTTPHeaders:
        new URL(base).hostname === 'localhost'
          ? { 'cf-connecting-ip': '192.0.2.' + ((width % 200) + 10) }
          : {},
    });
    const p = await context.newPage();
    p.setDefaultTimeout(30000);
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const r = { channel, width, checks: [], errors };
    const shot = async (name) =>
      p.screenshot({ path: `${out}/${channel}-${width}-${name}.png` });
    const open = async () => {
      await p
        .getByRole('button', { name: '여행 가이드 다시 보기', exact: true })
        .click();
      await p
        .getByRole('heading', { name: '기능별로 따라 해볼게요' })
        .waitFor();
    };
    const step = async (index) => {
      await open();

      await p.locator('.tester-guide-layout nav button').nth(index).click();
    };
    try {
      assert(
        (
          await context.request.post(base + '/api/test-access', {
            data: { password: '1234' },
          })
        ).ok(),
      );
      await p.goto(base + '/');
      await p.locator('.app-shell[data-ready=true]').waitFor();
      assert.equal(await p.locator('.quick-intro-dialog').count(), 0);
      await p
        .getByRole('heading', { name: '첫 여행, 코스 하나부터 골라볼까요?' })
        .waitFor();
      await shot('first-home');
      const guideBox = await p
        .getByRole('button', { name: '여행 가이드 다시 보기', exact: true })
        .boundingBox();
      assert(guideBox.y < 220 && guideBox.height >= 40);
      await open();
      assert.equal(await p.locator('.quick-intro-dialog').count(), 0);
      await p.getByRole('button', { name: '20초 애니메이션으로 보기' }).click();
      assert(
        await p.getByRole('button', { name: '재생', exact: true }).isVisible(),
      );
      await p.getByRole('button', { name: '기능별로 따라 해볼게요' }).click();
      await p.waitForTimeout(250);
      await shot('guide');
      await p
        .getByRole('button', { name: '추천 코스 고르기', exact: true })
        .click();
      await p
        .getByRole('heading', { name: '어떤 강원을 만나볼까요?' })
        .waitFor();
      assert.equal(
        await p.locator('.discovery-page input[type=datetime-local]').count(),
        0,
      );
      await step(1);
      await p
        .getByRole('button', { name: '빈 일정부터 만들기', exact: true })
        .click();
      await p
        .getByRole('heading', { name: '나만의 코스 만들기', exact: true })
        .waitFor();
      await shot('first-plan');
      await p.keyboard.press('Escape');
      if (
        await p.getByRole('button', { name: /입력 그만|저장하지 않고/ }).count()
      )
        throw new Error('Unexpected initial editor dirty state');
      await step(2);
      await p
        .getByRole('button', { name: '첫 동행 그룹 만들기', exact: true })
        .click();
      await p.getByLabel('그룹 이름', { exact: true }).waitFor();
      await shot('first-group');
      r.checks.push(
        'Guest top replay, no forced popup, reduced motion, empty journey actions and group create form',
      );
      for (const name of ['현재 출타', '내 여행', '홈']) {
        await p.getByRole('tab', { name, exact: true }).click();
        await open();
        await p
          .getByRole('button', { name: '바로 둘러볼게요', exact: true })
          .click();
      }
      await p.reload();
      await p.locator('.app-shell[data-ready=true]').waitFor();
      await open();
      await p.keyboard.press('Escape');
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      assert.equal(
        (
          await context.request
            .get(base + '/api/account?include=travel')
            .then((r) => r.json())
        ).account,
        null,
      );
      r.checks.push(
        'Guide works across tabs and after reload; no automatic account or outing creation',
      );
      if (new URL(base).hostname === 'localhost' && width === 430) {
        const password = crypto.randomUUID();
        const created = await context.request.post(base + '/api/account', {
          headers: { Origin: base },
          data: {
            action: 'register',
            handle: 'qa_guide_' + Date.now().toString(36),
            nickname: '첫 여행 사용자',
            password,
          },
        });
        assert(
          created.ok(),
          'Synthetic local registration: ' +
            created.status() +
            ' ' +
            (await created.text()),
        );
        const before = await context.request
          .get(base + '/api/account/state')
          .then((r) => r.json());
        await p.reload();
        await p.locator('.app-shell[data-ready=true]').waitFor();
        await open();
        await shot('member-guide');
        await p.getByRole('button', { name: '바로 둘러볼게요' }).click();
        const after = await context.request
          .get(base + '/api/account/state')
          .then((r) => r.json());
        assert.deepEqual(
          after.state?.entries || [],
          before.state?.entries || [],
        );
        assert.equal(after.state?.activeOuting || null, null);
        r.checks.push(
          'New ordinary account can replay without adding sample trips or starting an outing',
        );
      }
      assert.deepEqual(errors, []);
      r.status = 'passed';
    } catch (e) {
      r.status = 'failed';
      r.error = e.message;
      await shot('failure');
    }
    results.push(r);
    console.log(JSON.stringify(r));
    await context.close();
  }
  await browser.close();
}
await fs.writeFile(
  out + '/results.json',
  JSON.stringify(
    {
      at: new Date().toISOString(),
      base,
      mode: 'Real app APIs; viewport simulations; only a synthetic local account created',
      results,
    },
    null,
    2,
  ),
);
if (results.some((r) => r.status !== 'passed')) process.exitCode = 1;
