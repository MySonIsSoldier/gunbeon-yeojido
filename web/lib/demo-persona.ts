import { cleanTravelState } from './account-state.ts';
import type { Entry } from './domain';

/** Deliberately public credentials for a synthetic template, never a real user. */
export const DEMO_PERSONA = {
  handle: 'minjun_demo',
  password: 'GangwonTrip2026!',
  name: '민준',
  age: 24,
  title: '오랜만의 휴가, 만나고 싶은 사람들',
  description: '부모님과는 천천히, 연인과는 바다로, 친구들과는 새로운 곳으로. 24세 장병 민준의 여행을 함께 준비해 보세요.',
};

export function demoSeed(now = new Date()) {
  // Upcoming dates remain useful throughout the judging period. All people and trips are fictional.
  const day = new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10);
  const at = (offset: number, hour = 10) => new Date(Date.parse(`${day}T${String(hour).padStart(2, '0')}:00:00+09:00`) + offset * 86400000).toISOString();
  const make = (key: string, title: string, region: string, origin: string, ids: string[], offset: number, companion: string, budget: number, walk: number): Entry => ({
    recordId: `demo:${key}`, missionId: `custom:demo:${key}`, title, region, stamps: [],
    plan: { kind: 'custom', variant: '민준의 체험 여행', originId: origin, departureAt: at(offset), transport: 'car', timeBudgetMinutes: budget,
      conditions: { companion, walkLimit: walk, extraBuffer: 20 },
      stops: ids.map((placeId, i) => ({ placeId, stay: i === 0 ? 70 : 45, walk: i === 0 ? 20 : 10 })), manualPlaces: [] },
  });
  const parents = make('parents', '부모님과 천천히, 철원의 하루', '철원군', 'dmz_tourism:494cd281ebd7561e', ['tourapi:2749319', 'tourapi:3072021'], 2, '부모님', 240, 30);
  const partner = make('partner', '우리 둘, 고성 바다 산책', '고성군', 'dmz_tourism:d096c36656960f75', ['dmz_tourism:3aff1b8a01323058', 'dmz_tourism:a9bf219aaf681fa1'], 3, '연인', 300, 60);
  const friends = make('friends', '친구들과 떠나는 화진포', '고성군', 'dmz_tourism:a9bf219aaf681fa1', ['dmz_tourism:bd706e31ec85d966', 'dmz_tourism:684a22c17ce8bf8f'], 4, '친구', 360, 60);
  const blank = make('blank', '다음 휴가에 가고 싶은 곳', '철원군', '', [], 7, '친구', 240, 40);
  const record: Entry = { ...partner, recordId: 'demo:record', title: '지난 휴가, 바다에 남긴 하루', plan: { ...partner.plan!, departureAt: at(-7) }, recordStatus: 'completed', completedAt: at(-7, 15), visitedPlaceIds: partner.plan!.stops.map(s => s.placeId), stamps: ['입경', '동행', '복귀'] };
  return {
    state: cleanTravelState({ version: 3, entries: [parents, partner, friends, blank, record], favorites: [], activeOuting: null }),
    groups: [
      { name: '우리 가족의 주말', kind: 'family', members: ['엄마 · 예시', '아빠 · 예시'], entries: [parents] },
      { name: '민준과 서연', kind: 'partner', members: ['서연 · 예시'], entries: [partner] },
      { name: '오랜만이야, 우리', kind: 'friends', members: ['도윤 · 예시', '지훈 · 예시'], entries: [friends] },
    ],
  };
}
