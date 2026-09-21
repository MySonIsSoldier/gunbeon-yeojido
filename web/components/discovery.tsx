'use client';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Footprints,
  MapPin,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import CourseCover from './course-cover';
import PlaceExplorer, { type CatalogReceipt } from './place-explorer';
import {
  makeRecommendations,
  discoveryThemes,
  type Recommendation,
} from '@/lib/discovery';
import { sourceCredit } from '@/lib/data-provenance';
import { regions, type Place } from '@/lib/domain';
export default function Discovery({
  places,
  region,
  onRegion,
  onChoose,
  onNew,
  onPhotos,
  live,
  onPlace,
  onStartPlace,
  onMorePlaces,
  onRetry,
}: {
  places: Place[];
  region: string;
  onRegion: (r: string) => void;
  onChoose: (r: Recommendation) => void;
  onNew: () => void;
  onPhotos: () => void;
  live: CatalogReceipt;
  onPlace: (p: Place) => void;
  onStartPlace: (p: Place) => void;
  onMorePlaces: (p: Place[]) => void;
  onRetry: () => void;
}) {
  const [section, setSection] = useState<'courses' | 'places'>('courses');
  const [pace, setPace] = useState<'all' | 'short' | 'gentle'>('all');
  const [theme, setTheme] = useState<keyof typeof discoveryThemes>('all'),
    [selected, setSelected] = useState<Recommendation | null>(null);
  const all = useMemo(
    () => makeRecommendations(places, region),
    [places, region],
  );
  const items = all.filter(
    (x) =>
      (theme === 'all' || x.theme === theme) &&
      (pace === 'all' ||
        (pace === 'gentle'
          ? x.walkMinutes <= 30
          : x.travelMinutes !== null &&
            x.visitMinutes + x.travelMinutes <= 150)),
  );
  const estimate = (m: Recommendation) =>
    m.travelMinutes === null
      ? '장소 간 이동 확인 필요'
      : `${Math.max(1, Math.round((m.visitMinutes + m.travelMinutes) / 30) / 2)}시간 안팎`;
  return (
    <main className="explore-page discovery-page">
      <section className="explore-heading">
        <div>
          <h1>어떤 강원을 만나볼까요?</h1>
          <p>추천 코스로 시작하거나, 가고 싶은 장소부터 골라보세요.</p>
        </div>
        <Button variant="outline" onClick={onNew}>
          <Plus size={17} />
          직접 만들기
        </Button>
      </section>
      <div className="region-tabs" aria-label="여행 지역">
        {regions.map((r) => (
          <button
            key={r}
            className={region === r ? 'active' : ''}
            aria-pressed={region === r}
            onClick={() => onRegion(r)}
          >
            {r.replace(/[군시]$/, '')}
            {r.endsWith('시') && <small>관문</small>}
          </button>
        ))}
      </div>
      <div
        className="discovery-section-tabs"
        role="tablist"
        aria-label="둘러보기 방식"
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
            return;
          event.preventDefault();
          const next =
            event.key === 'Home'
              ? 'courses'
              : event.key === 'End'
                ? 'places'
                : section === 'courses'
                  ? 'places'
                  : 'courses';
          setSection(next);
          document.getElementById(`discovery-${next}-tab`)?.focus();
        }}
      >
        <button
          role="tab"
          aria-selected={section === 'courses'}
          tabIndex={section === 'courses' ? 0 : -1}
          aria-controls="discovery-courses"
          id="discovery-courses-tab"
          onClick={() => setSection('courses')}
        >
          추천 코스
        </button>
        <button
          role="tab"
          aria-selected={section === 'places'}
          tabIndex={section === 'places' ? 0 : -1}
          aria-controls="discovery-places"
          id="discovery-places-tab"
          onClick={() => setSection('places')}
        >
          장소 찾기
        </button>
      </div>
      <div
        hidden={section !== 'places'}
        role="tabpanel"
        id="discovery-places"
        aria-labelledby="discovery-places-tab"
      >
        <PlaceExplorer
          key={region}
          region={region}
          places={places}
          live={live}
          onPlace={onPlace}
          onStart={onStartPlace}
          onMore={onMorePlaces}
          onRetry={onRetry}
        />
      </div>
      <div
        hidden={section !== 'courses'}
        role="tabpanel"
        id="discovery-courses"
        aria-labelledby="discovery-courses-tab"
      >
        <div className="discovery-themes" aria-label="추천 취향">
          {Object.entries(discoveryThemes).map(([k, v]) => (
            <button
              key={k}
              aria-pressed={theme === k}
              className={theme === k ? 'active' : ''}
              onClick={() => setTheme(k as keyof typeof discoveryThemes)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="discovery-pace" aria-label="코스 길이">
          {(
            [
              ['all', '시간은 자유롭게'],
              ['short', '2시간 안팎'],
              ['gentle', '도보 30분 이내'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={pace === value}
              onClick={() => setPace(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="section-title">
          <h2>
            {region.replace(/[군시]$/, '')} 추천 코스{' '}
            <span className="quiet-count">{items.length}</span>
          </h2>
          <span className="helper">일정에 맞게 수정 가능</span>
        </div>
        <div className="journey-cards">
          {items.map((m, i) => (
            <article className="journey-card" key={m.id}>
              <button
                className="journey-image"
                aria-label={m.title + ' 자세히 보기'}
                onClick={() => setSelected(m)}
              >
                <CourseCover places={m.stops.map((s) => s.place)} eager={!i} />
                <span className="image-category">{m.variant}</span>
                <span className="image-corner">
                  <ArrowUpRight size={20} />
                </span>
              </button>
              <button className="journey-text" onClick={() => setSelected(m)}>
                <h3>{m.title}</h3>
                <p>{m.stops.map((s) => s.place.title).join(' → ')}</p>
                <div className="journey-meta">
                  <span>
                    <Clock3 size={15} />
                    {estimate(m)}
                  </span>
                  <span>
                    <Footprints size={15} />
                    도보 약 {m.walkMinutes}분
                  </span>
                </div>
                <span className="discovery-card-link">
                  코스 살펴보기 <ChevronRight size={16} />
                </span>
              </button>
            </article>
          ))}
        </div>
        {!items.length && live.mode === 'loading' && (
          <p className="catalog-status" role="status">
            <span className="small-loader" />이 지역의 관광정보로 코스를
            준비하고 있어요.
          </p>
        )}
        {!items.length && live.mode !== 'loading' && (
          <div className="home-empty">
            <h3>
              {all.length
                ? '다른 코스도 둘러보세요'
                : '관광정보를 연결하면 코스를 볼 수 있어요'}
            </h3>
            <p>
              {all.length
                ? '취향이나 도보 조건을 바꾸면 더 많은 코스를 만날 수 있어요.'
                : '장소 찾기에서 여행을 시작하거나 관광정보를 다시 불러오세요.'}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                if (!all.length) onRetry();
                setTheme('all');
                setPace('all');
              }}
            >
              {all.length ? '조건 없이 코스 보기' : '관광정보 다시 불러오기'}
            </Button>
          </div>
        )}
        <p className="explore-footnote">
          {sourceCredit(items.flatMap((m) => m.stops.map((s) => s.place)))}
        </p>
        <p className="explore-footnote">
          시간은 자차 이동과 체류를 가정한 초안입니다. 만남 장소에서의
          왕복·식사·예약 대기는 포함하지 않아요.
        </p>
        <button className="text-link photo-library-link" onClick={onPhotos}>
          사진 출처와 이용조건 <ArrowUpRight size={15} />
        </button>
      </div>
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent side="bottom" className="recommendation-sheet">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>{selected.brief}</SheetDescription>
              </SheetHeader>
              <div className="recommendation-scroll">
                <CourseCover
                  places={selected.stops.map((s) => s.place)}
                  eager
                />
                <div className="recommendation-stats">
                  <span>
                    <Clock3 size={17} />
                    {estimate(selected)}
                  </span>
                  <span>
                    <Footprints size={17} />
                    도보 약 {selected.walkMinutes}분
                  </span>
                </div>
                <ol className="recommendation-stops">
                  {selected.stops.map((s, i) => (
                    <li key={s.place.id}>
                      <span>{i + 1}</span>
                      <div>
                        <strong>{s.place.title}</strong>
                        <small>{s.place.address}</small>
                        <p>머무는 시간 약 {s.stay}분</p>
                      </div>
                      <MapPin size={17} />
                    </li>
                  ))}
                </ol>
                {selected.note && (
                  <p className="recommendation-note">{selected.note}</p>
                )}
                <details className="recommendation-details">
                  <summary>시간·방문 정보의 기준</summary>
                  <p>
                    장소 사이 자차 이동과 체류 시간의 초안입니다. 실제 길찾기
                    결과나 예약 가능 여부가 아닙니다. 날짜·이동수단·만남 장소는
                    일정표에서 정하세요.
                  </p>
                  <p>{sourceCredit(selected.stops.map((s) => s.place))}</p>
                  <p>
                    {selected.sourceCount
                      ? `한국관광공사 수신 장소 ${selected.sourceCount}곳 · `
                      : ''}
                    기본 장소: 통일부 공개 관광자료. 장소별 운영·예약·신분
                    확인은 방문 전에 확인하세요.
                  </p>
                </details>
                <button
                  className="text-link"
                  onClick={() => {
                    setSelected(null);
                    onPhotos();
                  }}
                >
                  사진 출처 보기 <ArrowUpRight size={14} />
                </button>
              </div>
              <div className="recommendation-footer">
                <p>장소와 순서는 자유롭게 바꿀 수 있어요.</p>
                <Button
                  onClick={() => {
                    onChoose(selected);
                    setSelected(null);
                  }}
                >
                  이 코스로 일정 만들기 <ArrowRight size={18} />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
