'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, RefreshCw, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import MemoryImage from './memory-image';
import { pageFetch } from '@/lib/page-cache';
import {
  discoveryPlaces,
  matchesPlaceCategory,
  placeCategories,
  categoryTypes,
  type PlaceCategory,
} from '@/lib/discovery';
import { sourceCredit } from '@/lib/data-provenance';
import { photoUrl } from '@/lib/place-photos';
import type { Place } from '@/lib/domain';

export type CatalogReceipt = {
  mode: string;
  categories?: {
    contentTypeId: string;
    total: number;
    fetched: number;
    nextPage?: number | null;
    error?: string | null;
  }[];
};

export default function PlaceExplorer({
  places,
  region,
  live,
  onPlace,
  onStart,
  onMore,
  onRetry,
}: {
  places: Place[];
  region: string;
  live: CatalogReceipt;
  onPlace: (p: Place) => void;
  onStart: (p: Place) => void;
  onMore: (p: Place[]) => void;
  onRetry: () => void;
}) {
  const [category, setCategory] = useState<PlaceCategory>('all'),
    [query, setQuery] = useState(''),
    [limit, setLimit] = useState(12);
  const [pages, setPages] = useState<Record<string, number | null>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const available = useMemo(
    () => discoveryPlaces(places, region),
    [places, region],
  );
  const found = useMemo(
    () =>
      available.filter(
        (p) =>
          matchesPlaceCategory(p, category) &&
          (!query.trim() ||
            (p.title + p.address)
              .replace(/\s/g, '')
              .toLowerCase()
              .includes(query.replace(/\s/g, '').toLowerCase())),
      ),
    [available, category, query],
  );
  useEffect(() => {
    setLimit(12);
    setError('');
  }, [category, query]);
  const next = live.categories?.find(
    (c) =>
      !c.error &&
      categoryTypes[category].includes(c.contentTypeId) &&
      (Object.hasOwn(pages, c.contentTypeId)
        ? pages[c.contentTypeId]
        : c.nextPage),
  );
  async function loadMore() {
    if (!next || busy) return;
    const page = Object.hasOwn(pages, next.contentTypeId)
      ? pages[next.contentTypeId]
      : next.nextPage;
    setBusy(true);
    setError('');
    try {
      const response = await pageFetch(
        `/api/places/page?region=${encodeURIComponent(region)}&type=${next.contentTypeId}&page=${page}`,
      );
      const data = (await response.json()) as {
        places: Place[];
        nextPage: number | null;
        message?: string;
      };
      if (!response.ok)
        throw new Error(data.message || '장소를 불러오지 못했어요.');
      onMore(data.places);
      setPages((p) => ({ ...p, [next.contentTypeId]: data.nextPage }));
      setLimit((v) => v + 12);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : '연결을 확인한 뒤 다시 시도해 주세요.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="place-explorer" aria-label="관광 장소 찾기">
      <label className="discovery-search">
        <Search size={19} />
        <Input
          aria-label="장소 이름 또는 동네 검색"
          placeholder="장소 이름이나 동네를 찾아보세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="장소 검색 지우기">
            지우기
          </button>
        )}
      </label>
      <div
        className="discovery-themes place-category-tabs"
        aria-label="장소 종류"
      >
        {Object.entries(placeCategories).map(([key, label]) => (
          <button
            key={key}
            aria-pressed={category === key}
            className={category === key ? 'active' : ''}
            onClick={() => setCategory(key as PlaceCategory)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="section-title">
        <h2>
          {query ? '검색한 장소' : placeCategories[category]}{' '}
          <span className="quiet-count">{found.length}</span>
        </h2>
        <span className="helper">관광공사 · 지역 공개자료</span>
      </div>
      {live.mode === 'loading' && (
        <p className="catalog-status" role="status">
          <span className="small-loader" />
          한국관광공사의 장소를 더 불러오고 있어요. 준비된 장소는 먼저 볼 수
          있어요.
        </p>
      )}
      {live.mode !== 'loading' && live.mode !== 'live' && (
        <div className="catalog-status">
          <span>지금은 지역 공개자료를 보여드려요.</span>
          <button onClick={onRetry}>
            <RefreshCw size={14} />
            관광정보 다시 불러오기
          </button>
        </div>
      )}
      <div className="place-explorer-grid">
        {found.slice(0, limit).map((p) => (
          <article className="place-explorer-card" key={p.id}>
            <button
              className="place-explorer-main"
              onClick={() => onPlace(p)}
              aria-label={p.title + ' 관광정보 보기'}
            >
              <span className="place-explorer-photo">
                <MapPin size={26} />
                {photoUrl(p) && (
                  <MemoryImage src={photoUrl(p)} alt="" loading="lazy" />
                )}
              </span>
              <span className="place-explorer-copy">
                <small>
                  {p.category === 'restaurant' || p.category === 'cafe'
                    ? '맛집·카페'
                    : p.category === 'accommodation'
                      ? '숙소'
                      : p.category === 'shopping'
                        ? '시장·쇼핑'
                        : p.category === 'festival'
                          ? '축제·행사'
                          : '여행 장소'}
                </small>
                <strong>{p.title}</strong>
                <span>{p.address || '상세 위치 확인 필요'}</span>
                <em>
                  상세정보 보기 <ArrowRight size={13} />
                </em>
              </span>
            </button>
            <button className="place-start-button" onClick={() => onStart(p)}>
              <Plus size={15} />이 장소로 일정 만들기
            </button>
          </article>
        ))}
      </div>
      {!found.length && live.mode !== 'loading' && (
        <div className="home-empty">
          <h3>
            {query
              ? '검색어를 조금 바꿔볼까요?'
              : '다른 종류의 장소도 살펴보세요'}
          </h3>
          <p>
            {query
              ? '이름 일부나 가까운 동네 이름으로 찾아보세요.'
              : '관광정보가 도착하면 이 지역의 장소가 함께 표시돼요.'}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
          >
            전체 장소 보기
          </Button>
        </div>
      )}
      <div className="place-explorer-more">
        {found.length > limit ? (
          <Button variant="outline" onClick={() => setLimit((v) => v + 12)}>
            장소 더 보기 · {Math.min(limit, found.length)}/{found.length}
          </Button>
        ) : next ? (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void loadMore()}
          >
            {busy ? '관광정보 불러오는 중…' : '관광공사 장소 더 불러오기'}
          </Button>
        ) : null}
      </div>
      {error && (
        <p className="catalog-error" role="alert">
          {error}
        </p>
      )}
      <p className="explore-footnote">
        {sourceCredit(available)} · 운영일과 예약 조건은 장소 상세에서
        확인하세요.
      </p>
    </section>
  );
}
