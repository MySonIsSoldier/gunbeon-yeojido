import { chromium } from 'playwright';
import { enterGuest, recordMenu } from './qa-navigation.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const base = process.env.QA_BASE_URL || 'http://localhost:3000',
  out = path.resolve(
    process.env.QA_OUT_DIR || '../tmp/judging-review/conditions',
  );
await fs.mkdir(out, { recursive: true });
const results = [];
for (const channel of (process.env.QA_BROWSER_CHANNELS || 'chromium').split(
  ',',
)) {
  const browser = await chromium.launch({
    headless: true,
    ...(channel === 'chromium' ? {} : { channel }),
  });
  for (const width of [360, 430, 1440]) {
    const c = await browser.newContext({
      viewport: { width, height: width < 500 ? 900 : 1000 },
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
      reducedMotion: 'reduce',
    });
    const p = await c.newPage();
    p.setDefaultTimeout(20000);
    const result = {
      channel,
      version: browser.version(),
      width,
      status: 'running',
      errors: [],
    };
    p.on('pageerror', (e) => result.errors.push(e.message));
    await c.route('**/api/places?*', (r) =>
      r.fulfill({
        status: 503,
        json: { mode: 'unavailable', places: [], error: 'TEST_NO_KEY' },
      }),
    );
    try {
      await p.goto(base);
      await enterGuest(p);
      await p.getByLabel('테스트 비밀번호', { exact: true }).fill('1234');
      await p
        .getByRole('button', { name: '여행 시작하기', exact: true })
        .click();
      await p.locator('.app-shell[data-ready=true]').waitFor();
      for (const [name, companion, walk, buffer] of [
        ['부모님과 철원의 하루', '부모님', 15, 30],
        ['친구들과 강원 여행', '친구', 90, 10],
      ]) {
        await p.getByRole('tab', { name: '홈', exact: true }).click();
        await p.getByRole('button', { name: '새 여행', exact: true }).click();
        await p.getByLabel('코스 이름', { exact: true }).fill(name);
        await p.locator('.builder-conditions summary').click();
        await p
          .getByRole('combobox', { name: '함께 가는 사람', exact: true })
          .click();
        await p.getByRole('option', { name: companion, exact: true }).click();
        await p
          .getByLabel('편안한 전체 도보 시간', { exact: true })
          .fill(String(walk));
        await p
          .getByLabel('추가로 남길 여유', { exact: true })
          .fill(String(buffer));
        await p
          .getByRole('button', { name: '내 코스 저장', exact: true })
          .click();
        await p
          .getByLabel('코스 이름', { exact: true })
          .waitFor({ state: 'hidden' });
      }
      await p.reload();
      await p.locator('.app-shell[data-ready=true]').waitFor();
      await p.getByRole('tab', { name: '내 여행', exact: true }).click();
      const cards = p.locator('.saved-mission');
      const names = await cards.locator('h2').allTextContents();
      const index = names.indexOf('부모님과 철원의 하루');
      assert(index >= 0);
      await (await recordMenu(p, '코스 수정', index)).click();
      await p.locator('.builder-conditions summary').click();
      assert.match(
        await p
          .getByRole('combobox', { name: '함께 가는 사람', exact: true })
          .innerText(),
        /부모님/,
      );
      assert.equal(
        await p
          .getByLabel('편안한 전체 도보 시간', { exact: true })
          .inputValue(),
        '15',
      );
      assert.equal(
        await p.getByLabel('추가로 남길 여유', { exact: true }).inputValue(),
        '30',
      );
      await p.locator('.builder-conditions').scrollIntoViewIfNeeded();
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      await p.screenshot({
        path: path.join(out, channel + '-' + width + '-trip-conditions.png'),
      });
      assert.equal(result.errors.length, 0);
      result.status = 'passed';
    } catch (e) {
      result.status = 'failed';
      result.error = e.message;
      await p.screenshot({
        path: path.join(out, channel + '-' + width + '-failure.png'),
      });
      process.exitCode = 1;
    }
    results.push(result);
    await c.close();
  }
  await browser.close();
}
await fs.writeFile(
  path.join(out, 'results.json'),
  JSON.stringify(
    {
      base,
      checkedAt: new Date().toISOString(),
      note: 'Desktop viewport simulation; no physical phone verification; provider failure fixture',
      results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(results, null, 2));
