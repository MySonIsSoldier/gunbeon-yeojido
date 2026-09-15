// Explicit one-time preparation through normal APIs; never resets an existing account.
import { request } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { cleanTravelState } from '../lib/account-state.ts';
import { sharePlan } from '../lib/group-model.ts';
const base = process.env.JUDGE_BASE_URL;
const handle = process.env.JUDGE_HANDLE;
const password = process.env.JUDGE_PASSWORD;
const testPassword = process.env.JUDGE_TEST_PASSWORD;
if (
  !process.argv.includes('--apply') ||
  !base ||
  !handle ||
  !password ||
  !testPassword
)
  throw new Error(
    'Set JUDGE_BASE_URL/HANDLE/PASSWORD/TEST_PASSWORD and pass --apply. Existing accounts are never reset.',
  );
const out =
  process.env.JUDGE_REPORT || '../tmp/judging-review/judge-account.json';
const a = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: { Origin: base },
});
const b = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: { Origin: base },
});
const report = {
  base,
  checkedAt: new Date().toISOString(),
  checks: [],
  liveTourApi: null,
};
async function ok(response) {
  const data = await response.json();
  if (!response.ok())
    throw new Error(
      `HTTP ${response.status()}: ${data.message || data.error || 'request failed'}`,
    );
  return data;
}
const post = (url, data) => a.post(url, { data });
try {
  const nodes = JSON.parse(
    await readFile(new URL('../lib/data/places.json', import.meta.url), 'utf8'),
  );
  const ids = [
    'dmz_tourism:494cd281ebd7561e',
    'dmz_tourism:4c494f617400a5b6',
    'dmz_tourism:d096c36656960f75',
    'dmz_tourism:a9bf219aaf681fa1',
  ];
  for (const id of ids)
    if (!nodes.some((p) => p.id === id))
      throw new Error('Missing verified example place reference');
  const registration = await post('/api/account', {
    action: 'register',
    handle,
    password,
    nickname: '기능심사 여행자',
    testPassword,
  });
  if (registration.status() === 409)
    throw new Error(
      'Account already exists. Stopped without login, reset or data writes; inspect previous preparation record.',
    );
  const { account } = await ok(registration);
  report.accountId = account.id;
  const current = await ok(await a.get('/api/account/state'));
  if (current.state || current.revision)
    throw new Error('Account is not empty; stopped.');
  let restaurant;
  try {
    const fetched = await a.get(
      '/api/places?region=' + encodeURIComponent('철원군'),
      { timeout: 90000 },
    );
    const live = await fetched.json();
    restaurant = live.places?.find(
      (p) =>
        p.source === 'tourapi' && p.category === 'restaurant' && p.lat && p.lon,
    );
    report.liveTourApi = {
      status: fetched.status(),
      mode: live.mode,
      error: live.error || null,
      fetchedAt: live.fetchedAt,
      places: live.places?.length || 0,
      categories: live.categories,
      chosenReference: restaurant
        ? {
            id: restaurant.id,
            sourceId: restaurant.source_id,
            title: restaurant.title,
          }
        : null,
    };
  } catch (error) {
    report.liveTourApi = {
      mode: 'unavailable',
      error: error.message,
      places: 0,
    };
  }
  const make = (
    id,
    title,
    region,
    places,
    companion,
    walkLimit,
    extraBuffer,
  ) => ({
    recordId: 'judge-example:' + id,
    missionId: 'custom:judge-example:' + id,
    title: '[예시] ' + title,
    region,
    stamps: [],
    plan: {
      kind: 'custom',
      variant: '심사 시연 예시',
      originId: places[0],
      departureAt: '2026-09-19T01:00:00.000Z',
      timeBudgetMinutes: 240,
      transport: 'car',
      conditions: { companion, walkLimit, extraBuffer },
      stops: places
        .slice(1)
        .map((placeId) => ({ placeId, stay: 40, walk: 10 })),
      manualPlaces: [],
    },
  });
  const parents = make(
    'parents',
    '부모님과 철원의 네 시간',
    '철원군',
    [ids[0], ids[1], ...(restaurant ? [restaurant.id] : [])],
    '부모님',
    20,
    30,
  );
  const friends = make(
    'friends',
    '친구들과 고성의 오후',
    '고성군',
    [ids[2], ids[3]],
    '친구',
    60,
    15,
  );
  const blank = make(
    'blank',
    '아직 갈 곳을 정하지 않은 여행',
    '철원군',
    [''],
    '친구',
    30,
    15,
  );
  const record = {
    ...friends,
    recordId: 'judge-example:record',
    plan: { ...friends.plan, departureAt: '2026-09-13T01:00:00.000Z' },
    title: '[예시 기록] 고성에서 보낸 하루',
    completedAt: '2026-09-13T05:00:00.000Z',
    recordStatus: 'completed',
    visitedPlaceIds: [ids[3]],
    stamps: ['입경', '동행', '복귀'],
  };
  const state = cleanTravelState({
    version: 3,
    entries: [parents, friends, blank, record],
    favorites: [],
    activeOuting: null,
  });
  await ok(
    await a.post('/api/account/state', {
      headers: { 'X-Gunbeon-Account': account.id },
      data: { revision: 0, state },
    }),
  );
  report.checks.push(
    'Four synthetic examples saved through account revision API; no provider response stored; no active outing',
  );
  report.groupIds = [];
  for (const [kind, name, entry] of [
    ['family', '[예시] 가족 여행', parents],
    ['friends', '[예시] 친구 여행', friends],
  ]) {
    const { group } = await ok(
      await post('/api/groups', { action: 'create', kind, name }),
    );
    report.groupIds.push(group.id);
    await ok(
      await post('/api/groups', {
        action: 'savePlan',
        groupId: group.id,
        plan: sharePlan(entry, false),
      }),
    );
  }
  await ok(
    await b.post('/api/account', {
      data: { action: 'login', handle, password },
    }),
  );
  const restored = await ok(await b.get('/api/account/state'));
  const groups = await ok(await b.get('/api/groups'));
  if (
    restored.state.entries.length !== 4 ||
    groups.groups.length !== 2 ||
    restored.state.entries[0].plan.conditions?.walkLimit !== 20
  )
    throw new Error('Second-session persistence verification failed');
  report.checks.push(
    'Fresh second session logs in directly without test gate; 4 entries, 2 groups, trip-specific conditions restored',
  );
  report.status = 'passed';
} catch (e) {
  report.status = 'failed';
  report.error = e.message;
  process.exitCode = 1;
} finally {
  await a.post('/api/account', { data: { action: 'logout' } }).catch(() => {});
  await b.post('/api/account', { data: { action: 'logout' } }).catch(() => {});
  await a.dispose();
  await b.dispose();
  await mkdir(new URL('../../tmp/judging-review/', import.meta.url), {
    recursive: true,
  });
  await writeFile(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
