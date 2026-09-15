import { chromium } from 'playwright';
import { enterGuest } from './qa-navigation.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const out = path.resolve(process.env.QA_OUT_DIR || '../tmp/qa/itinerary-view');
await fs.mkdir(out, { recursive: true });
const places = JSON.parse(
  await fs.readFile(
    new URL('../lib/data/places.json', import.meta.url),
    'utf8',
  ),
);
const stops = ['고성 왕곡마을', '송지호관망타워', '송지호 해수욕장'].map(
  (title) => places.find((p) => p.title === title),
);
const entry = {
  recordId: 'qa-read',
  missionId: 'custom:qa-read',
  title: '친구들과 바다 보러 가는 날',
  region: '고성군',
  stamps: [],
  plan: {
    kind: 'custom',
    variant: '내 코스',
    originId: stops[0].id,
    departureAt: '2026-10-03T01:00:00Z',
    timeBudgetMinutes: 480,
    transport: 'car',
    conditions: { companion: '친구', walkLimit: 60, extraBuffer: 20 },
    stops: stops.map((p) => ({ placeId: p.id, stay: 50, walk: 10 })),
  },
};
const results = [];
for (const channel of (process.env.QA_BROWSER_CHANNELS || 'chromium').split(
  ',',
)) {
  const browser = await chromium.launch({
    headless: true,
    ...(channel === 'chromium' ? {} : { channel }),
  });
  for (const width of (process.env.QA_WIDTHS || '360,430,1440')
    .split(',')
    .map(Number)) {
    const c = await browser.newContext({
      viewport: { width, height: width < 500 ? 900 : 1000 },
      locale: 'ko-KR',
      timezoneId: 'Asia/Seoul',
      reducedMotion: 'reduce',
    });
    await c.route('**/api/places?*', (r) =>
      r.fulfill({
        status: 503,
        json: { places: [], mode: 'unavailable', error: 'QA_UNAVAILABLE' },
      }),
    );
    await c.route('**/api/places/resolve', (r) =>
      r.fulfill({ json: { places: [] } }),
    );
    const p = await c.newPage();
    p.setDefaultTimeout(15000);
    const result = {
      channel,
      version: browser.version(),
      width,
      status: 'running',
      errors: [],
      checks: [],
    };
    p.on('pageerror', (e) => result.errors.push(e.message));
    const state = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('gangwon-passport-v1')));
    const ready = () => p.locator('.app-shell[data-ready=true]').waitFor();
    const shot = async (name) => {
      await p.screenshot({
        path: path.join(out, `${channel}-${width}-${name}.png`),
        animations: 'disabled',
      });
    };
    try {
      await p.goto(base);
      await enterGuest(p);
      await p.getByLabel('테스트 비밀번호', { exact: true }).fill('1234');
      await p
        .getByRole('button', { name: '여행 시작하기', exact: true })
        .click();
      await ready();
      await p.evaluate((entry) => {
        const s = JSON.parse(localStorage.getItem('gangwon-passport-v1'));
        s.entries = [entry];
        s.activeOuting = null;
        localStorage.setItem('gangwon-passport-v1', JSON.stringify(s));
      }, entry);
      await p.reload();
      await ready();
      await p.locator('.day-passport-cover').waitFor();
      await p
        .locator('.day-passport-cover img')
        .first()
        .evaluate((i) => i.decode())
        .catch(() => {});
      await shot('home');
      const before = await state();
      await p
        .locator('.day-passport-cover')
        .getByRole('button', { name: '일정 보기', exact: true })
        .click();
      await p.locator('.trip-overview').waitFor();
      assert.equal(await p.locator('.trip-overview input').count(), 0);
      assert.deepEqual(
        await p.locator('.trip-read-place h3').allTextContents(),
        stops.map((p) => p.title),
      );
      assert.match(
        await p.locator('.trip-read-date').innerText(),
        /10월 3일.*10:00/,
      );
      assert.match(await p.locator('.trip-read-return').innerText(), /18:00/);
      assert.equal(await p.locator('.trip-read-timeline li').count(), 3);
      await p
        .locator('.trip-read-cover img')
        .first()
        .evaluate((i) => i.decode())
        .catch(() => {});
      await shot('view');
      assert.deepEqual((await state()).entries, before.entries);
      assert.deepEqual((await state()).settings, before.settings);
      assert(
        await p
          .locator('.trip-overview')
          .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      );
      result.checks.push(
        'Home opens read-only saved itinerary without state mutation; schedule order, fixed date, return criteria and no overflow',
      );
      await p
        .locator('.trip-overview')
        .getByRole('button', { name: '일정 편집', exact: true })
        .click();
      await p.locator('.course-builder').waitFor();
      assert.equal(await p.locator('.trip-overview').count(), 0);
      await p.getByLabel('코스 이름', { exact: true }).fill('수정한 바다 여행');
      await p.getByLabel('1번 머무는 시간', { exact: true }).fill('65');
      await shot('edit');
      await p
        .getByRole('button', { name: '변경사항 저장', exact: true })
        .click();
      await p.locator('.trip-overview').waitFor();
      assert.match(
        await p.locator('.trip-read-title').innerText(),
        /수정한 바다 여행/,
      );
      assert.match(
        await p.locator('.trip-read-place').first().innerText(),
        /1시간 5분/,
      );
      await p
        .getByRole('button', { name: '일정 보기 닫기', exact: true })
        .click();
      await p.getByRole('tab', { name: '내 여행', exact: true }).click();
      await p
        .locator('.saved-mission')
        .getByRole('button', { name: '일정 보기', exact: true })
        .click();
      await p.getByRole('button', { name: '일정 편집', exact: true }).click();
      await p
        .getByRole('button', { name: '코스 편집 닫기', exact: true })
        .click();
      await p.locator('.trip-overview').waitFor();
      assert.match(
        await p.locator('.trip-read-title').innerText(),
        /수정한 바다 여행/,
      );
      result.checks.push(
        'Explicit edit → save returns updated view; cancel returns original view; saved-card access works',
      );
      await p
        .getByRole('button', { name: '일정 보기 닫기', exact: true })
        .click();
      await p.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('gangwon-passport-v1'));
        s.entries[0].plan.stops.splice(1, 0, {
          placeId: 'tourapi:999999999',
          stay: 30,
          walk: 5,
        });
        localStorage.setItem('gangwon-passport-v1', JSON.stringify(s));
      });
      await p.reload();
      await ready();
      await p
        .locator('.saved-mission')
        .getByRole('button', { name: '일정 보기', exact: true })
        .click();
      await p
        .getByRole('heading', {
          name: '장소 정보를 불러오지 못했어요',
          exact: true,
        })
        .waitFor();
      assert.equal(await p.locator('.trip-read-place').count(), 4);
      assert.equal(
        (await p.locator('.trip-read-place h3').allTextContents())[2],
        stops[1].title,
      );
      assert.equal(await p.locator('.trip-read-margin').count(), 0);
      result.checks.push(
        'Unresolved place preserves index and all following stops; no invented movement or margin',
      );
      await p
        .getByRole('button', { name: '일정 보기 닫기', exact: true })
        .click();
      await p.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('gangwon-passport-v1'));
        s.entries[0].plan.stops = [];
        delete s.entries[0].plan.departureAt;
        delete s.entries[0].plan.timeBudgetMinutes;
        localStorage.setItem('gangwon-passport-v1', JSON.stringify(s));
      });
      await p.reload();
      await ready();
      await p
        .locator('.saved-mission')
        .getByRole('button', { name: '일정 보기', exact: true })
        .click();
      assert.match(await p.locator('.trip-read-date').innerText(), /날짜 미정/);
      await p
        .getByRole('heading', { name: '어디로 떠나볼까요?', exact: true })
        .waitFor();
      assert.equal(await p.locator('.course-builder').count(), 0);
      assert.equal(await p.locator('.trip-read-margin').count(), 0);
      result.checks.push(
        'Empty, undated itinerary remains viewable and points explicitly to editing',
      );
      assert.deepEqual(result.errors, []);
      result.status = 'passed';
    } catch (e) {
      result.status = 'failed';
      result.error = e.message;
      await shot('failure').catch(() => {});
      process.exitCode = 1;
    }
    results.push(result);
    console.log(JSON.stringify(result));
    await c.close();
  }
  await browser.close();
}
await fs.writeFile(
  path.join(out, 'results.json'),
  JSON.stringify(results, null, 2),
);
