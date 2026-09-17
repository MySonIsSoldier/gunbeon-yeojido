import { hasVisitRecord, regions, sensitivePlaceText, type Entry, type Place } from './domain.ts';
import { adviceQuestions, type AdviceDetail, type PublicPlace } from './advice-model.ts';
import { sourceCredit } from './data-provenance.ts';

export type SocialCard = {
  kind: 'plan' | 'record' | 'advice' | 'impact';
  region: string; title: string; subtitle: string;
  places: { title: string; source: string; imageUrl?: string }[];
  stamps: string[]; credit: string;
  publicId?: string; impact?: { before: string; after: string };
  example?: boolean;
  missingCount?: number;
};
const safePlaces = (ids: string[], places: PublicPlace[]) => [...new Set(ids)].flatMap(id => {
  const p = places.find(p => p.id === id && !id.startsWith('manual:') && ['tourapi', 'dmz_tourism', 'dmz_cafe', 'mpva_memorial'].includes(p.source) && !sensitivePlaceText(p.title));
  const imageUrl = p?.image_url?.replace(/^http:/, 'https:');
  return p ? [{ title: p.title, source: p.source, ...(imageUrl?.startsWith('https://tong.visitkorea.or.kr/') ? { imageUrl } : {}) }] : [];
});
const region = (s: string) => regions.includes(s as typeof regions[number]) ? s.replace(/[군시]$/, '') : '강원';
/** No personal title, dates, addresses, coordinates, departure/return point or account identifiers. */
export function travelSocialCard(entry: Entry, places: Place[], example = false): SocialCard {
  const record = hasVisitRecord(entry);
  const ids = (entry.plan?.stops || []).filter(s => s.placeId !== entry.plan?.originId && (!record || entry.visitedPlaceIds?.includes(s.placeId))).map(s => s.placeId);
  const selected = safePlaces(ids, places);
  const missingCount = ids.filter(id => !id.startsWith('manual:') && !places.some(p => p.id === id)).length;
  return { kind: record ? 'record' : 'plan', region: region(entry.region), title: record ? '함께 남긴 하루.' : '이번 휴가, 여기.', subtitle: record ? '다녀온 곳이 우리의 이야기가 됐어요.' : '기다리던 하루를, 함께 준비하는 중.', places: selected, stamps: record ? entry.stamps.filter(s => ['입경', '전환', '복귀', '동행', '휴가 씨앗'].includes(s)) : [], credit: sourceCredit(selected), example, missingCount };
}
export function adviceSocialCard(detail: Pick<AdviceDetail, 'id' | 'snapshot' | 'places'>, suggestion?: AdviceDetail['suggestions'][number]): SocialCard {
  const selected = safePlaces(detail.snapshot.placeIds, detail.places), lookup = (id: string | null) => id ? safePlaces([id], detail.places)[0]?.title : undefined;
  const before = suggestion ? lookup(suggestion.targetId) : undefined;
  const after = suggestion?.kind === 'remove' ? '다음 여행으로, 조금 더 여유롭게' : suggestion ? lookup(suggestion.placeId) : undefined;
  const impact = suggestion?.status === 'adopted' && before && after ? { before, after: suggestion.kind === 'add' ? before + ' 다음에 ' + after : after } : undefined;
  return { kind: impact ? 'impact' : 'advice', region: region(detail.snapshot.region), title: impact ? '한 수가 바꾼 하루.' : '너의 한 수가 필요해.', subtitle: impact ? '추천한 한 곳, 내 여행에 담았어요.' : adviceQuestions[detail.snapshot.question], places: selected.map(({ title, source }) => ({ title, source })), stamps: [], credit: sourceCredit(detail.places), example: !!detail.snapshot.example, missingCount: [...detail.snapshot.placeIds, ...(suggestion?.placeId ? [suggestion.placeId] : [])].filter(id => !detail.places.some(p => p.id === id)).length, publicId: /^[a-f0-9]{32}$/.test(detail.id) ? detail.id : undefined, impact };
}
export function approximateCountdown(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes < 60) return '1시간 미만';
  return `약 ${Math.floor(minutes / 60)}시간`;
}
