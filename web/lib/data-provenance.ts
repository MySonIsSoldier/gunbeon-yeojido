import { localInputDate } from './domain.ts';
/** Provider attribution concerns place information; photo licensing is shown separately. */
export function sourceCredit(places: { source: string }[]) {
  const sources = new Set(places.map((p) => p.source));
  return [
    sources.has('tourapi') ? '출처: ⓒ한국관광공사' : '',
    sources.has('dmz_tourism') || sources.has('dmz_cafe')
      ? '출처: 통일부 DMZ 공개자료'
      : '',
    sources.has('mpva_memorial') ? '출처: 국가보훈부 현충시설 정보' : '',
  ]
    .filter(Boolean)
    .join(' · ');
}
export function apiReceiptLabel(data: {
  mode: string;
  categories?: { error?: string | null }[];
}) {
  if (data.mode === 'loading') return '관광정보 조회 중';
  if (data.mode !== 'live') return '관광정보 호출 미완료';
  const categories = data.categories || [],
    failed = categories.filter((x) => x.error).length;
  if (failed === categories.length && failed > 0) return '관광정보 호출 미완료';
  return failed
    ? `일부 유형 수신 · ${categories.length - failed}/${categories.length}유형`
    : '관광정보 수신 완료';
}
export function receivedAt(value?: string) {
  return value && Number.isFinite(Date.parse(value))
    ? localInputDate(value).replace('T', ' ') + ' 수신'
    : '수신 시각 미확인';
}
