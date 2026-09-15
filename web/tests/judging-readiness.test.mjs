import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultSettings,
  withPlan,
  createEntry,
  resolveEntry,
  assessPlan,
  planningSettings,
  rankCompanionMissions,
} from '../lib/domain.ts';
import { cleanEntry } from '../lib/account-state.ts';
import { sharePlan, groupEntry } from '../lib/group-model.ts';
import {
  sourceCredit,
  apiReceiptLabel,
  receivedAt,
} from '../lib/data-provenance.ts';
const settings = defaultSettings(new Date('2026-09-19T01:00:00Z'));
const origin = {
  id: 'fixture:origin',
  source: 'fixture',
  title: '만나는 곳',
  lat: 38.2,
  lon: 127.3,
  sigungu: '철원군',
  data_quality_flags: [],
  reservation_required: false,
  id_check_required: false,
  opening_status: 'unknown',
};
const destination = {
  ...origin,
  id: 'fixture:stop',
  title: '쉬는 곳',
  lat: 38.21,
};
const mission = {
  id: 'custom:test',
  custom: true,
  title: '우리 여행',
  region: '철원군',
  variant: '내 코스',
  brief: '',
  stops: [{ place: destination, stay: 40, walk: 25, walkVerified: false }],
};
test('each trip retains companion and buffers after server roundtrip and another trip edits global defaults', () => {
  const parent = cleanEntry(
    createEntry(
      withPlan(mission, {
        ...settings,
        companion: '부모님',
        walkLimit: 15,
        extraBuffer: 30,
      }),
      origin,
    ),
  );
  const friends = cleanEntry(
    createEntry(
      withPlan(mission, {
        ...settings,
        companion: '친구',
        walkLimit: 90,
        extraBuffer: 5,
      }),
      origin,
    ),
  );
  const resolve = (e) => resolveEntry(e, [origin, destination]).mission;
  const changed = {
    ...settings,
    companion: '혼자',
    walkLimit: 5,
    extraBuffer: 120,
  };
  assert.deepEqual(
    planningSettings(resolve(parent), changed).companion,
    '부모님',
  );
  assert.equal(planningSettings(resolve(friends), changed).extraBuffer, 5);
  assert.equal(
    assessPlan(resolve(parent), settings, origin).margin,
    assessPlan(resolve(parent), changed, origin).margin,
  );
  assert.equal(planningSettings(resolve(parent), changed).walkLimit, 15);
  assert(!('conditions' in sharePlan(parent)));
  assert.throws(() =>
    cleanEntry({
      ...parent,
      plan: {
        ...parent.plan,
        conditions: { companion: '친구', walkLimit: -1, extraBuffer: 15 },
      },
    }),
  );
});
test('group copies never invent a personal four-hour deadline', () => {
  const record = {
    id: 'shared',
    plan: sharePlan(createEntry(withPlan(mission, settings), origin)),
  };
  const copy = groupEntry(record);
  assert.equal(copy.plan.timeBudgetMinutes, undefined);
  assert.equal(copy.plan.conditions, undefined);
  assert.equal(copy.plan.departureAt, settings.startedAt);
});
test('walking preference changes candidate choice without deleting alternatives or hiding excess', () => {
  const short = {
    ...mission,
    id: 'short',
    stops: [{ ...mission.stops[0], walk: 10 }],
  };
  const long = {
    ...mission,
    id: 'long',
    stops: [{ ...mission.stops[0], walk: 30 }],
  };
  const candidates = [long, short];
  assert.equal(
    rankCompanionMissions(candidates, { ...settings, walkLimit: 15 }, origin)[0]
      .id,
    'short',
  );
  assert.equal(
    rankCompanionMissions(candidates, { ...settings, walkLimit: 60 }, origin)[0]
      .id,
    'long',
  );
  const impossible = rankCompanionMissions(
    candidates,
    { ...settings, walkLimit: 5 },
    origin,
  );
  assert.equal(impossible.length, 2);
  assert.equal(
    assessPlan(impossible[0], { ...settings, walkLimit: 5 }, origin).band,
    'avoid',
  );
  assert.deepEqual(
    candidates.map((x) => x.id),
    ['long', 'short'],
  );
});
test('partial receipts and attribution never claim all categories or all photos are KTO', () => {
  assert.equal(
    apiReceiptLabel({
      mode: 'live',
      categories: [{ error: null }, { error: 'UPSTREAM' }],
    }),
    '일부 유형 수신 · 1/2유형',
  );
  assert.equal(
    apiReceiptLabel({
      mode: 'live',
      categories: [{ error: null, fetched: 0 }],
    }),
    '관광정보 수신 완료',
  );
  assert.equal(sourceCredit([{ source: 'manual' }]), '');
  assert.equal(
    sourceCredit([{ source: 'tourapi' }, { source: 'tourapi' }]),
    '출처: ⓒ한국관광공사',
  );
  assert.equal(receivedAt('invalid'), '수신 시각 미확인');
});
