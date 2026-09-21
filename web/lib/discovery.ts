import { dedupePlaces, distance, validCoord } from './domain.ts';
import type { Place, Mission, Entry } from './domain.ts';
export const discoveryThemes = {
  all: '전체',
  nature: '풍경·산책',
  culture: '문화·쉼',
  peace: '평화·기억',
} as const;
type Definition = {
  id: string;
  region: string;
  title: string;
  brief: string;
  theme: Exclude<keyof typeof discoveryThemes, 'all'>;
  titles: string[];
  stays: number[];
  walks: number[];
  note?: string;
};
const definitions: Definition[] = [
  {
    id: 'cw-river',
    region: '철원군',
    title: '고석정에서 주상절리까지',
    brief: '한탄강을 따라 서로 다른 풍경 세 곳을 만나는 코스.',
    theme: 'nature',
    titles: ['고석정국민관광지', '순담계곡', '송대소주상절리'],
    stays: [50, 40, 35],
    walks: [20, 20, 15],
    note: '계곡 산책과 유료 주상절리길 입장은 다릅니다. 이용할 구간을 일정에서 확인하세요.',
  },
  {
    id: 'cw-memory',
    region: '철원군',
    title: '철원에 남은 기억을 따라',
    brief: '노동당사와 백마고지에서 지역의 역사를 돌아보는 하루.',
    theme: 'peace',
    titles: ['철원 노동당사', '백마고지 위령비와 기념관'],
    stays: [40, 45],
    walks: [15, 20],
  },
  {
    id: 'cw-flowers',
    region: '철원군',
    title: '고석정 곁에서 천천히',
    brief: '고석정과 꽃밭, 장소를 줄이고 여유를 남기는 코스.',
    theme: 'nature',
    titles: ['고석정국민관광지', '고석정 꽃밭'],
    stays: [50, 60],
    walks: [20, 30],
    note: '꽃밭은 계절에 따라 개장·경관이 달라집니다. 방문 날짜를 정한 뒤 운영 여부를 확인하세요.',
  },
  {
    id: 'hc-river',
    region: '화천군',
    title: '북한강 곁의 작은 쉼표',
    brief: '붕어섬과 꺼먹다리를 거쳐 커피 이야기가 있는 곳으로.',
    theme: 'nature',
    titles: ['붕어섬', '꺼먹다리', '산천어커피박물관'],
    stays: [50, 25, 45],
    walks: [25, 15, 10],
  },
  {
    id: 'hc-peace',
    region: '화천군',
    title: '평화의 댐에서 비목공원으로',
    brief: '물길을 바라보고 평화와 기억의 공간을 돌아봅니다.',
    theme: 'peace',
    titles: ['평화의댐(화천)', '세계 평화의종 공원', '화천 비목공원'],
    stays: [40, 30, 30],
    walks: [15, 15, 15],
  },
  {
    id: 'hc-culture',
    region: '화천군',
    title: '커피와 나무를 만나는 오후',
    brief: '전시와 체험 공간을 중심으로 짜는 화천 문화 여행.',
    theme: 'culture',
    titles: ['산천어커피박물관', '화천 목재문화체험장'],
    stays: [50, 60],
    walks: [10, 15],
    note: '체험 프로그램과 실내 이용 범위는 운영처 확인이 필요합니다.',
  },
  {
    id: 'yg-water',
    region: '양구군',
    title: '호수와 꽃섬을 잇는 하루',
    brief: '전망대와 꽃섬을 보고 양구의 이야기를 만납니다.',
    theme: 'nature',
    titles: ['한반도섬전망대', '양구꽃섬', '양구근현대사박물관'],
    stays: [35, 45, 50],
    walks: [20, 25, 10],
  },
  {
    id: 'yg-dmz',
    region: '양구군',
    title: '두타연과 펀치볼의 풍경',
    brief: '접경지역의 자연과 마을을 함께 살펴보는 코스.',
    theme: 'peace',
    titles: ['두타연 (국가지질공원)', '양구 펀치볼마을'],
    stays: [80, 50],
    walks: [45, 20],
    note: '두타연은 출입·예약·신분 확인 조건과 당일 통제를 먼저 확인하세요. 즉시 입장 가능한 코스를 뜻하지 않습니다.',
  },
  {
    id: 'yg-culture',
    region: '양구군',
    title: '양구의 이야기를 읽는 오후',
    brief: '두 박물관을 중심으로 전시를 천천히 둘러봅니다.',
    theme: 'culture',
    titles: ['양구근현대사박물관', '양구인문학박물관'],
    stays: [55, 55],
    walks: [10, 10],
  },
  {
    id: 'ij-village',
    region: '인제군',
    title: '만해마을에서 백담마을로',
    brief: '문학과 마을 풍경, 용대리에서 쉬어가는 여행.',
    theme: 'culture',
    titles: ['만해마을', '백담마을', '용대 매바위 인공폭포'],
    stays: [55, 45, 25],
    walks: [15, 15, 10],
  },
  {
    id: 'ij-forest',
    region: '인제군',
    title: '비밀의정원과 방동약수',
    brief: '숲의 풍경을 감상하고 약수터에 잠시 들릅니다.',
    theme: 'nature',
    titles: ['비밀의정원', '방동약수'],
    stays: [35, 35],
    walks: [10, 15],
    note: '비밀의정원은 정해진 관람 지점에서 감상하세요. 숲 안으로 들어가는 코스가 아닙니다.',
  },
  {
    id: 'ij-river',
    region: '인제군',
    title: '합강정에서 강을 바라보며',
    brief: '정자와 강변 지형을 잇는 짧은 인제 산책.',
    theme: 'nature',
    titles: ['합강정', '소양강 하안단구'],
    stays: [35, 40],
    walks: [15, 20],
  },
  {
    id: 'gs-coast',
    region: '고성군',
    title: '능파대와 아야진의 바다',
    brief: '바위 해안과 해변을 보고 청간정에서 마무리합니다.',
    theme: 'nature',
    titles: ['능파대 (강원평화지역 국가지질공원)', '아야진해변', '청간정'],
    stays: [45, 50, 30],
    walks: [25, 20, 15],
    note: '바위 해안은 파도·강풍과 미끄럼에 주의하세요.',
  },
  {
    id: 'gs-village',
    region: '고성군',
    title: '왕곡마을에서 송지호까지',
    brief: '옛 마을과 호수, 해변의 풍경을 한 번에 만납니다.',
    theme: 'culture',
    titles: ['고성 왕곡마을', '송지호관망타워', '송지호 해수욕장'],
    stays: [60, 30, 45],
    walks: [25, 10, 20],
  },
  {
    id: 'gs-peace',
    region: '고성군',
    title: '고성의 북쪽 바다를 만나는 길',
    brief: '출입 절차를 확인하고 전망대와 화진포를 돌아봅니다.',
    theme: 'peace',
    titles: ['통일안보공원', '고성 통일전망타워', '화진포(화진포호)'],
    stays: [35, 60, 50],
    walks: [10, 20, 25],
    note: '출입 신고·신분 확인·당일 통제를 먼저 확인하세요. 절차 대기시간은 별도입니다.',
  },

  {
    id: 'cw-falls',
    region: '철원군',
    title: '폭포에서 은하수교까지',
    brief: '한탄강의 물소리와 전망을 짧게 이어 봅니다.',
    theme: 'nature',
    titles: ['직탕폭포', '철원 한탄강 은하수교'],
    stays: [35, 40],
    walks: [15, 20],
    note: '비가 많이 오거나 강풍이 불면 강변 접근·다리 통제 여부를 먼저 확인하세요.',
  },
  {
    id: 'cw-temple',
    region: '철원군',
    title: '도피안사에서 옛 철원으로',
    brief: '사찰과 노동당사 주변을 돌아보며 철원의 시간을 만납니다.',
    theme: 'peace',
    titles: ['도피안사(철원)', '철원 노동당사'],
    stays: [40, 40],
    walks: [15, 15],
  },
  {
    id: 'cw-oldtown',
    region: '철원군',
    title: '옛 철원, 세 곳의 이야기',
    brief: '향교와 농산물검사소, 노동당사를 잇는 역사 산책.',
    theme: 'culture',
    titles: ['철원향교', '철원 농산물검사소', '철원 노동당사'],
    stays: [30, 25, 35],
    walks: [10, 10, 15],
    note: '유적 내부 관람과 외관 관람 가능 범위는 현장에서 확인하세요.',
  },
  {
    id: 'hc-lake',
    region: '화천군',
    title: '딴산에서 파로호 전망으로',
    brief: '물가에 머물고 호수를 내려다보는 여유로운 코스.',
    theme: 'nature',
    titles: ['딴산유원지', '파로호전망대'],
    stays: [45, 35],
    walks: [20, 15],
  },
  {
    id: 'hc-literature',
    region: '화천군',
    title: '문학관과 계곡 사이',
    brief: '감성마을의 문학 이야기 뒤에 광덕계곡의 풍경을 더해요.',
    theme: 'culture',
    titles: ['감성마을 이외수 문학관', '광덕계곡'],
    stays: [50, 40],
    walks: [10, 20],
    note: '계곡에서는 정해진 산책 구간을 이용하고 기상·수위에 따라 일정을 바꾸세요.',
  },
  {
    id: 'hc-indoors',
    region: '화천군',
    title: '커피와 물고기가 있는 오후',
    brief: '두 전시 공간을 중심으로 야외 걷기를 줄인 여행.',
    theme: 'culture',
    titles: ['산천어커피박물관', '화천 토속어류생태체험관'],
    stays: [50, 50],
    walks: [10, 10],
    note: '운영일과 관람 가능 시간을 각 시설에 확인한 뒤 출발하세요.',
  },
  {
    id: 'yg-forest',
    region: '양구군',
    title: '양구의 숲에서 숨 고르기',
    brief: '수목원과 자연휴양림에서 머무는 시간을 넉넉히 잡아요.',
    theme: 'nature',
    titles: ['양구 수목원', '광치자연휴양림'],
    stays: [70, 60],
    walks: [35, 30],
    note: '휴양림의 당일 입장·예약 조건을 확인하세요. 등산보다 입구 주변 산책을 가정한 초안입니다.',
  },
  {
    id: 'yg-stars',
    region: '양구군',
    title: '국토의 가운데서 만나는 별',
    brief: '배꼽마을을 둘러보고 천문대 프로그램에 맞춰 일정을 잡아요.',
    theme: 'culture',
    titles: ['양구 국토정중앙배꼽마을', '국토정중앙천문대'],
    stays: [40, 70],
    walks: [15, 10],
    note: '천체 관측은 운영 시간·프로그램 예약·날씨에 따라 달라요. 늦은 복귀가 가능한 날에 계획하세요.',
  },
  {
    id: 'yg-town',
    region: '양구군',
    title: '양구 읍내의 느긋한 산책',
    brief: '해시계와 향교, 군민공원을 이어 돌아보는 짧은 여행.',
    theme: 'culture',
    titles: ['양구 해시계', '양구향교', '양구군민공원'],
    stays: [20, 30, 35],
    walks: [5, 10, 15],
  },
  {
    id: 'ij-bangtae',
    region: '인제군',
    title: '방동약수에서 방태산 숲으로',
    brief: '약수터와 숲에서 쉬어가는 시간을 길게 남겨요.',
    theme: 'nature',
    titles: ['방동약수', '국립 방태산자연휴양림'],
    stays: [25, 75],
    walks: [10, 35],
    note: '휴양림 입장·휴무 조건을 확인하세요. 정상 등반을 포함한 코스는 아닙니다.',
  },
  {
    id: 'ij-naetgang',
    region: '인제군',
    title: '냇강마을과 리빙스턴교',
    brief: '마을과 강을 바라보며 한 템포 쉬어가는 길.',
    theme: 'nature',
    titles: ['인제 냇강마을', '리빙스턴교'],
    stays: [45, 30],
    walks: [20, 10],
    note: '하천변 통제 여부를 확인하고 정해진 관람 구간을 이용하세요.',
  },
  {
    id: 'ij-hwangtae',
    region: '인제군',
    title: '용대리에서 맛과 문학을',
    brief: '황태마을을 둘러보고 만해마을의 이야기를 만나는 여행.',
    theme: 'culture',
    titles: ['인제 황태마을', '만해마을', '용대 매바위 인공폭포'],
    stays: [60, 50, 25],
    walks: [10, 15, 10],
    note: '식사할 가게는 장소 찾기에서 골라 추가하세요. 인공폭포 가동은 계절·운영 상황에 따라 달라요.',
  },
  {
    id: 'gs-geojin',
    region: '고성군',
    title: '거진에서 두 번 만나는 바다',
    brief: '백섬 전망과 등대공원을 잇는 짧은 해안 산책.',
    theme: 'nature',
    titles: ['백섬해상전망대', '거진등대해맞이공원'],
    stays: [35, 40],
    walks: [15, 25],
    note: '등대공원에는 경사·계단 구간이 있어요. 전망대는 기상에 따라 통제될 수 있습니다.',
  },
  {
    id: 'gs-hwajinpo',
    region: '고성군',
    title: '화진포의 소나무와 해변',
    brief: '소나무 숲에서 쉬고 해변을 따라 천천히 걸어요.',
    theme: 'nature',
    titles: ['화진포소나무숲산림욕장', '화진포해수욕장'],
    stays: [45, 50],
    walks: [25, 20],
  },
  {
    id: 'gs-history',
    region: '고성군',
    title: '화진포에 남은 이야기',
    brief: '별장 전시를 살펴보고 호수 주변에 머무는 코스.',
    theme: 'peace',
    titles: ['이승만별장(고성)', '김일성 별장', '화진포소나무숲산림욕장'],
    stays: [40, 45, 35],
    walks: [10, 20, 20],
    note: '전시관 운영일·통합 관람 범위를 확인하세요. 오르막·계단 구간을 포함합니다.',
  },
  {
    id: 'cc-lake',
    region: '춘천시',
    title: '춘천에 도착하면, 호수부터',
    brief: '공지천에서 소양강까지, 만남 전후로 들르기 좋은 물가 풍경.',
    theme: 'nature',
    titles: ['공지천유원지', '소양강스카이워크', '소양강처녀상'],
    stays: [40, 40, 20],
    walks: [20, 15, 5],
    note: '스카이워크는 우천·결빙·강풍 시 통제될 수 있어요.',
  },
  {
    id: 'cc-books',
    region: '춘천시',
    title: '실레마을의 책과 문학',
    brief: '김유정문학촌과 책과인쇄박물관에서 보내는 차분한 오후.',
    theme: 'culture',
    titles: ['김유정문학촌', '책과인쇄박물관'],
    stays: [60, 60],
    walks: [20, 10],
    note: '전시실 휴무와 프로그램 시간을 확인하세요.',
  },
  {
    id: 'cc-museum',
    region: '춘천시',
    title: '박물관에서 공지천으로',
    brief: '박물관을 보고 공원에서 쉬며 만남의 하루를 시작해요.',
    theme: 'culture',
    titles: ['국립춘천박물관', '공지천유원지'],
    stays: [70, 40],
    walks: [15, 20],
  },
  {
    id: 'sc-coast',
    region: '속초시',
    title: '속초에서 외옹치까지',
    brief: '해수욕장과 바다향기로를 이어 걷는 해안 코스.',
    theme: 'nature',
    titles: ['속초해수욕장', '속초 외옹치 바다향기로'],
    stays: [45, 60],
    walks: [20, 40],
    note: '바다향기로는 운영 시간과 파도·강풍에 따른 통제를 확인하세요.',
  },
  {
    id: 'sc-market',
    region: '속초시',
    title: '아바이마을과 시장의 하루',
    brief: '마을 골목과 시장에서 함께 먹고 둘러볼 곳을 골라요.',
    theme: 'culture',
    titles: ['아바이마을', '속초관광수산시장'],
    stays: [50, 70],
    walks: [20, 20],
    note: '식사·갯배 대기 시간은 별도로 잡아주세요.',
  },
  {
    id: 'sc-view',
    region: '속초시',
    title: '영금정에서 호수 산책으로',
    brief: '바다 전망을 본 뒤 청초호에서 느긋하게 마무리합니다.',
    theme: 'nature',
    titles: ['영금정', '청초호 호수공원'],
    stays: [40, 50],
    walks: [20, 25],
    note: '영금정 접근로의 계단과 기상 통제 여부를 확인하세요.',
  },
];
const normalize = (s: string) => s.replace(/국민관광지|\([^)]*\)|\s/g, '');
export type Recommendation = Mission & {
  theme: Definition['theme'];
  note?: string;
  visitMinutes: number;
  walkMinutes: number;
  travelMinutes: number | null;
  sourceCount: number;
};
/** Date-free discovery: no personal departure, deadline, origin, weather or ranking by return margin. */
export function makeRecommendations(
  nodes: Place[],
  region: string,
): Recommendation[] {
  return definitions
    .filter((d) => d.region === region)
    .flatMap((d) => {
      const stops = d.titles
        .map((title, i) => {
          const matches = nodes.filter(
            (p) =>
              p.sigungu === region &&
              p.source !== 'manual' &&
              normalize(p.title) === normalize(title),
          );
          const place =
            matches.find((p) => p.source === 'tourapi' && validCoord(p)) ||
            matches.find(validCoord) ||
            matches[0];
          return place
            ? {
                place,
                stay: d.stays[i],
                walk: d.walks[i],
                walkVerified: false as const,
              }
            : null;
        })
        .filter((x) => x !== null);
      if (
        stops.length !== d.titles.length ||
        dedupePlaces(stops.map((s) => s.place)).length !== stops.length
      )
        return [];
      const kms = stops
        .slice(1)
        .map((s, i) => distance(stops[i].place, s.place));
      return [
        {
          id: 'discovery:' + d.id,
          title: d.title,
          brief: d.brief,
          region,
          variant: discoveryThemes[d.theme],
          theme: d.theme,
          note: d.note,
          stops,
          visitMinutes: stops.reduce((n, s) => n + s.stay, 0),
          walkMinutes: stops.reduce((n, s) => n + s.walk, 0),
          travelMinutes: kms.every(Number.isFinite)
            ? Math.ceil(((kms.reduce((a, b) => a + b, 0) * 1.4) / 35) * 60)
            : null,
          sourceCount: stops.filter((s) => s.place.source === 'tourapi').length,
        },
      ];
    });
}
export function recommendationEntry(m: Recommendation): Entry {
  const budget =
    Math.ceil((m.visitMinutes + (m.travelMinutes || 30) + 60) / 60) * 60;
  return {
    recordId: crypto.randomUUID(),
    missionId: 'custom:' + m.id,
    title: m.title,
    region: m.region,
    stamps: [],
    plan: {
      kind: 'custom',
      variant: m.variant,
      originId: '',
      stops: m.stops.map((s) => ({
        placeId: s.place.id,
        stay: s.stay,
        walk: s.walk,
      })),
      manualPlaces: [],
      timeBudgetMinutes: Math.max(180, budget),
    },
  };
}

export const placeCategories = {
  all: '전체 장소',
  sights: '관광·산책',
  culture: '문화·전시',
  food: '맛집·카페',
  stay: '숙소',
  shopping: '시장·쇼핑',
  festival: '축제·행사',
} as const;
export type PlaceCategory = keyof typeof placeCategories;
export const categoryTypes: Record<PlaceCategory, string[]> = {
  all: ['12', '14', '15', '28', '32', '38', '39'],
  sights: ['12', '28'],
  culture: ['14'],
  food: ['39'],
  stay: ['32'],
  shopping: ['38'],
  festival: ['15'],
};
export function matchesPlaceCategory(p: Place, category: PlaceCategory) {
  if (category === 'all') return true;
  if (category === 'food') return ['cafe', 'restaurant'].includes(p.category);
  if (category === 'stay') return p.category === 'accommodation';
  if (category === 'sights')
    return (
      ['attraction', 'leisure', 'memorial'].includes(p.category) &&
      !/박물관|미술관|문학관|문화관|전시관/.test(p.title)
    );
  if (category === 'culture')
    return (
      p.category === 'culture' ||
      /박물관|미술관|문학관|문화관|전시관/.test(p.title)
    );
  return p.category === category;
}
/** Excludes personal input and facilities without confirmed public memorial access. */
export function discoveryPlaces(nodes: Place[], region: string) {
  const result: Place[] = [];
  const candidates = nodes
    .filter(
      (p) =>
        p.sigungu === region &&
        p.source !== 'manual' &&
        (p.source !== 'mpva_memorial' ||
          p.access_tags.includes('public_access_verified')),
    )
    .sort(
      (a, b) =>
        Number(b.source === 'tourapi') - Number(a.source === 'tourapi') ||
        Number(!!b.image_url) - Number(!!a.image_url) ||
        a.title.localeCompare(b.title, 'ko'),
    );
  for (const place of candidates) {
    if (
      !result.some(
        (p) =>
          p.id === place.id ||
          (normalize(p.title) === normalize(place.title) &&
            ((validCoord(p) && validCoord(place) && distance(p, place) < 0.5) ||
              p.address.replace(/\s/g, '') ===
                place.address.replace(/\s/g, ''))),
      )
    )
      result.push(place);
  }
  return result;
}
