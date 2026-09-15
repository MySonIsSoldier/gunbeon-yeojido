import test from 'node:test';
import assert from 'node:assert/strict';
import { itineraryView } from '../lib/itinerary-view.ts';
const place = (id) => ({
  id,
  title: id,
  lat: 38.3,
  lon: 128.4,
  source: 'fixture',
  opening_status: 'unknown',
  reservation_required: null,
  id_check_required: null,
});
const places = ['origin', 'a', 'b'].map(place);
const entry = {
  missionId: 'custom:1',
  title: 'view',
  region: '고성군',
  stamps: [],
  plan: {
    kind: 'custom',
    originId: 'origin',
    variant: '내 코스',
    departureAt: '2026-01-01T14:30:00Z',
    transport: 'car',
    timeBudgetMinutes: 300,
    conditions: { companion: '친구', walkLimit: 40, extraBuffer: 20 },
    stops: [
      { placeId: 'a', stay: 60, walk: 10 },
      { placeId: 'b', stay: 60, walk: 10 },
    ],
  },
};
test('view uses the saved past date without mutating it and includes an overnight return', () => {
  const before = structuredClone(entry);
  const v = itineraryView(entry, places);
  assert.equal(v.schedule.start, Date.parse(entry.plan.departureAt));
  assert(v.schedule.returnedAt > Date.parse('2026-01-01T15:00:00Z'));
  assert(v.score && Number.isFinite(v.score.margin));
  assert.deepEqual(entry, before);
});
test('group view contains no personal margin/deadline even if a caller passes private criteria', () => {
  const v = itineraryView(entry, places, true);
  assert.equal(v.score, null);
  assert.equal(v.deadline, null);
  assert(v.schedule);
  assert.equal(v.stops.length, 2);
});
test('missing stops preserve order; incomplete coordinates or unknown transport never invent timed legs', () => {
  const v = itineraryView(
    entry,
    places.filter((p) => p.id !== 'a'),
  );
  assert.deepEqual(
    v.stops.map((s) => s.placeId),
    ['a', 'b'],
  );
  assert.equal(v.stops[0].place, undefined);
  assert.equal(v.stops[1].place.title, 'b');
  assert.equal(v.schedule, null);
  assert.equal(v.score, null);
  for (const transport of [undefined, 'unknown']) {
    const r = itineraryView(
      { ...entry, plan: { ...entry.plan, transport } },
      places,
    );
    assert.equal(r.schedule, null);
    assert.equal(r.score, null);
  }
  const r = itineraryView(
    entry,
    places.map((p) => (p.id === 'a' ? { ...p, lat: null } : p)),
  );
  assert.equal(r.schedule, null);
});
test('empty, undated and legacy plans are readable without inheriting defaults', () => {
  for (const plan of [
    undefined,
    {
      ...entry.plan,
      stops: [],
      departureAt: undefined,
      timeBudgetMinutes: undefined,
    },
  ]) {
    const v = itineraryView({ ...entry, plan }, places);
    assert.equal(v.start, null);
    assert.equal(v.schedule, null);
    assert.equal(v.score, null);
    assert.equal(v.deadline, null);
  }
  const v = itineraryView(
    { ...entry, plan: { ...entry.plan, conditions: undefined } },
    places,
  );
  assert.equal(v.score, null);
  assert(v.schedule);
});
