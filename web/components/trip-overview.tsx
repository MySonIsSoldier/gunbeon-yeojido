'use client';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Footprints,
  Map,
  MapPin,
  Pencil,
  Route,
  Users,
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import CourseCover from './course-cover';
import MissionMap from './mission-map';
import { itineraryView } from '@/lib/itinerary-view';
import { hasVisitRecord, validCoord, visitRestriction } from '@/lib/domain';
import type { Entry, Place } from '@/lib/domain';
import { sourceCredit } from '@/lib/data-provenance';
import { scheduleTime } from './trip-builder';

const transportNames = {
  car: '자차',
  transit: '대중교통',
  taxi: '택시+버스',
  unknown: '이동수단 미정',
};
const clock = (time: number) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(time);
const date = (time: number) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(time);
const duration = (minutes: number) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)}시간${minutes % 60 ? ` ${minutes % 60}분` : ''}`
    : `${minutes}분`;

export default function TripOverview({
  entry,
  places,
  loading,
  groupName,
  active,
  mapKey,
  onClose,
  onShare,
  onEdit,
  onStart,
  onImport,
  onPlace,
  onRetryPlaces,
}: {
  entry: Entry;
  places: Place[];
  loading: boolean;
  groupName?: string;
  active: boolean;
  mapKey: string;
  onClose: () => void;
  onShare?: () => void;
  onEdit: () => void;
  onStart: () => void;
  onImport?: () => void;
  onPlace: (place: Place) => void;
  onRetryPlaces: () => void;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const shared = groupName !== undefined,
    completed = hasVisitRecord(entry);
  const view = itineraryView(entry, places, shared),
    plan = entry.plan;
  const known = view.stops.flatMap((s) => (s.place ? [s.place] : []));
  const elapsed = view.schedule
    ? Math.ceil((view.schedule.returnedAt - view.schedule.start) / 60000)
    : null;
  const editLabel = completed ? '새 여행으로 가져오기' : '일정 편집';
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="trip-overview"
        showCloseButton={false}
      >
        <header className="trip-read-toolbar">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="일정 보기 닫기"
          >
            <ArrowLeft size={22} />
          </Button>
          <strong>{completed ? '여행 기록의 일정' : '일정 보기'}</strong>
          <Button variant="outline" onClick={onEdit} disabled={active || !plan}>
            <Pencil size={16} />
            {editLabel}
          </Button>
        </header>
        <div className="trip-read-scroll">
          <section className="trip-read-hero">
            <div className="trip-read-cover">
              <CourseCover
                eager
                places={view.stops.map(
                  (s) =>
                    s.place || {
                      id: s.placeId,
                      title: loading
                        ? '장소 정보 확인 중'
                        : '장소 정보 확인 필요',
                      image_url: '',
                    },
                )}
              />
            </div>
            <div className="trip-read-intro">
              <span className="trip-read-eyebrow">
                {entry.region} <span>·</span>{' '}
                {shared
                  ? groupName
                  : completed
                    ? '다녀온 여행'
                    : '나만 보는 계획'}
              </span>
              <SheetTitle className="trip-read-title">{entry.title}</SheetTitle>
              <SheetDescription className="trip-read-date">
                <CalendarDays size={18} />
                {view.start !== null
                  ? `${date(view.start)} · ${clock(view.start)} 출발`
                  : '날짜 미정'}
              </SheetDescription>
              {onShare && (
                <button className="trip-social-link" onClick={onShare}>
                  이번 휴가 한 장 · 공유 카드 <ArrowUpRight size={16} />
                </button>
              )}
              <div className="trip-read-stats">
                <span>
                  <MapPin size={17} />
                  {view.stops.length}곳
                </span>
                <span>
                  <Route size={17} />
                  {transportNames[plan?.transport || 'unknown']}
                </span>
                {!shared && plan?.conditions && (
                  <span>
                    <Users size={17} />
                    {plan.conditions.companion}
                  </span>
                )}
              </div>
            </div>
          </section>
          <div className="trip-read-columns">
            <section className="trip-read-route" aria-label="여행 일정표">
              <div className="trip-read-section-title">
                <h2>이렇게 다녀와요</h2>
                <span>
                  {elapsed !== null
                    ? `왕복 약 ${duration(elapsed)}`
                    : `장소 체류 ${duration(view.stay)}`}
                </span>
              </div>
              {completed && (
                <p className="trip-read-note">
                  저장했던 계획입니다. 실제 방문 기록과 시간은 다를 수 있어요.
                </p>
              )}
              {active && (
                <p className="trip-read-note">
                  현재 출타 중에는 이 계획을 편집할 수 없어요. 실시간 남은
                  시간은 현재 출타에서 확인하세요.
                </p>
              )}
              {!plan && (
                <p className="trip-read-note">
                  이전 버전의 기록으로 장소 순서가 보관되지 않았습니다.
                </p>
              )}
              {plan && (
                <>
                  {(view.stops.some((s) => !s.place) ||
                    (!!plan.originId && !view.origin)) && (
                    <div className="trip-read-note" role="status">
                      <p>
                        저장한 장소와 순서는 그대로 유지하고 있어요. 연결 상태를
                        확인한 뒤 다시 불러올 수 있습니다.
                      </p>
                      <Button
                        variant="outline"
                        disabled={loading}
                        onClick={onRetryPlaces}
                      >
                        {loading
                          ? '장소 정보 불러오는 중…'
                          : '장소 정보 다시 불러오기'}
                      </Button>
                    </div>
                  )}
                  <div className="trip-read-endpoint">
                    <span className="trip-read-dot">
                      <MapPin size={17} />
                    </span>
                    <div>
                      <small>
                        {view.start !== null ? clock(view.start) + ' · ' : ''}
                        만남 · 출발
                      </small>
                      <strong>
                        {view.origin?.title ||
                          (plan.originId
                            ? '만남 장소 정보 확인 필요'
                            : '만남 장소 미정')}
                      </strong>
                      {view.origin?.address && <p>{view.origin.address}</p>}
                    </div>
                  </div>
                  <ol className="trip-read-timeline">
                    {view.stops.map((stop, i) => {
                      const leg = view.schedule?.legs[i];
                      const p = stop.place;
                      const restriction =
                        p && leg
                          ? visitRestriction(
                              p,
                              new Date(leg.arrival),
                              stop.stay,
                            )
                          : null;
                      const nextDay =
                        leg &&
                        view.start !== null &&
                        date(leg.arrival) !== date(view.start);
                      return (
                        <li key={stop.placeId + i}>
                          <p className="trip-read-transfer">
                            <Route size={14} />
                            {leg
                              ? `이동 약 ${leg.travel}분${leg.wait ? ` · 주차·대기 ${leg.wait}분` : ''}`
                              : '이동시간 확인 필요'}
                          </p>
                          <div className="trip-read-stop">
                            <span className="trip-read-time">
                              {leg
                                ? clock(leg.arrival)
                                : String(i + 1).padStart(2, '0')}
                              {nextDay && <small>{date(leg!.arrival)}</small>}
                            </span>
                            <div className="trip-read-place">
                              <small>
                                {i + 1}번째 장소{' '}
                                {completed &&
                                  entry.visitedPlaceIds?.includes(
                                    stop.placeId,
                                  ) && (
                                    <span className="trip-read-visited">
                                      <Check size={12} />
                                      방문 기록
                                    </span>
                                  )}
                              </small>
                              <h3>
                                {p?.title ||
                                  (loading
                                    ? '장소 정보 불러오는 중'
                                    : '장소 정보를 불러오지 못했어요')}
                              </h3>
                              {p?.address && <p>{p.address}</p>}
                              <div className="trip-read-place-meta">
                                <span>
                                  <Clock3 size={14} />
                                  체류 {duration(stop.stay)}
                                </span>
                                <span>
                                  <Footprints size={14} />
                                  도보 약 {stop.walk}분
                                </span>
                                {leg && (
                                  <span>{clock(leg.departure)} 출발</span>
                                )}
                              </div>
                              {!p && (
                                <p className="trip-read-note">
                                  저장한 {i + 1}번째 장소를 유지하고 있어요.
                                  잠시 후 다시 확인해 주세요.
                                </p>
                              )}
                              {p && (
                                <>
                                  <div className="trip-read-flags">
                                    {p.reservation_required && (
                                      <span>예약 필요</span>
                                    )}
                                    {p.id_check_required && (
                                      <span>신분증 필요</span>
                                    )}
                                    {restriction && <span>{restriction}</span>}
                                    {!validCoord(p) && (
                                      <span>위치 확인 필요</span>
                                    )}
                                  </div>
                                  <button
                                    className="trip-read-detail"
                                    onClick={() => onPlace(p)}
                                  >
                                    방문 정보 <ChevronRight size={15} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  {!view.stops.length && (
                    <div className="trip-read-empty">
                      <MapPin size={30} />
                      <h3>어디로 떠나볼까요?</h3>
                      <p>
                        이름만 정해둔 여행이에요.
                        <br />
                        일정 편집에서 가고 싶은 곳을 하나씩 담아보세요.
                      </p>
                      <Button variant="outline" onClick={onEdit}>
                        장소 담기
                      </Button>
                    </div>
                  )}
                  {!!view.stops.length && (
                    <div className="trip-read-endpoint">
                      <span className="trip-read-dot end">
                        <Check size={17} />
                      </span>
                      <div>
                        <small>
                          {view.schedule
                            ? (date(view.schedule.returnedAt) !==
                              date(view.schedule.start)
                                ? date(view.schedule.returnedAt) + ' '
                                : '') +
                              clock(view.schedule.returnedAt) +
                              ' 예상 · '
                            : ''}
                          만남 장소로 돌아오기
                        </small>
                        <strong>
                          {view.origin?.title || '만남 장소 미정'}
                        </strong>
                        {view.schedule && (
                          <p>
                            마지막 장소에서 이동 약{' '}
                            {view.schedule.legs.at(-1)!.travel}분 · 별도 안전
                            여유 제외
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              <p className="trip-read-footnote">
                {sourceCredit(known) ? sourceCredit(known) + ' · ' : ''}
                이동·도보 시간은 추정값입니다. 실제 교통과 방문 조건은 출발 전
                확인하세요.
              </p>
            </section>
            <aside className="trip-read-aside">
              {!shared && (
                <section
                  className="trip-read-return"
                  aria-label="개인 복귀 계획"
                >
                  <span className="trip-read-eyebrow">개인 복귀 계획</span>
                  <h2>
                    {view.deadline !== null
                      ? scheduleTime(view.deadline)
                      : '복귀 기준 미정'}
                  </h2>
                  {view.score?.margin !== null &&
                  view.score?.margin !== undefined ? (
                    <>
                      <p className={`trip-read-margin ${view.score.band}`}>
                        예상 여유{' '}
                        <b>
                          {view.score.margin >= 0 ? '+' : ''}
                          {view.score.margin}분
                        </b>
                      </p>
                      <p>계획한 출발시각 기준 · 추가 여유 포함</p>
                    </>
                  ) : (
                    <p>
                      {!view.stops.length
                        ? '장소를 담으면 여행 시간을 확인할 수 있어요.'
                        : '날짜·만남 장소·복귀 기준·동행 조건을 모두 정하면 여유를 계산해요.'}
                    </p>
                  )}
                  {plan?.conditions && (
                    <p>
                      도보 {view.walk}분 / 편안한 한도{' '}
                      {plan.conditions.walkLimit}분<br />
                      추가 여유 {plan.conditions.extraBuffer}분
                    </p>
                  )}
                  {view.score && (
                    <details>
                      <summary>시간 계산과 확인할 사항</summary>
                      <dl>
                        {Object.entries(view.score.costs).map(([key, val]) => (
                          <div key={key}>
                            <dt>{key}</dt>
                            <dd>{val}분</dd>
                          </div>
                        ))}
                      </dl>
                      <ul>
                        {view.score.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <small>
                    안전마진은 참고값이며 실제 교통과 소속 부대 복귀 규정은 직접
                    확인이 필요합니다.
                  </small>
                </section>
              )}
              {shared && (
                <section className="trip-read-return">
                  <span className="trip-read-eyebrow">함께 보는 일정</span>
                  <h2>{groupName}</h2>
                  <p>
                    장소와 순서는 함께 정하고, 개인 복귀 기준은 내 여행에 담은
                    뒤 각자 설정해요.
                  </p>
                </section>
              )}
              {!!known.length &&
                view.origin &&
                validCoord(view.origin) &&
                view.mission && (
                  <section className="trip-read-map">
                    <button
                      onClick={() => setMapOpen((v) => !v)}
                      aria-expanded={mapOpen}
                    >
                      <Map size={18} />
                      지도에서 동선 보기 <ChevronRight size={16} />
                    </button>
                    {mapOpen && (
                      <MissionMap
                        mission={view.mission}
                        origin={view.origin}
                        mapKey={mapKey}
                        onSelectPlace={onPlace}
                      />
                    )}
                  </section>
                )}
              {plan && !active && !completed && (
                <p className="trip-read-tip">
                  <Pencil size={16} />
                  날짜, 장소, 머무는 시간은 위의 ‘일정 편집’에서 바꿀 수 있어요.
                </p>
              )}
            </aside>
          </div>
        </div>
        {(onImport || (!completed && !!plan?.stops.length)) && (
          <footer className="trip-read-footer">
            <span>
              {shared
                ? '내 복귀 기준까지 준비하려면'
                : active
                  ? '실시간 여유와 다음 장소 확인'
                  : '지금은 여행 준비 · 출타는 실제로 떠나는 날'}
            </span>
            <div className="trip-read-footer-actions">
              {!shared && !active && onEdit && (
                <Button onClick={onEdit}>
                  <Pencil size={17} /> 일정 수정하기
                </Button>
              )}
              <Button
                variant={!shared && !active ? 'outline' : 'default'}
                onClick={onImport || onStart}
              >
                {shared
                  ? '내 여행에 담기'
                  : active
                    ? '현재 출타 이어보기'
                    : '출타 시작'}
                <ArrowUpRight size={17} />
              </Button>
            </div>
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}
