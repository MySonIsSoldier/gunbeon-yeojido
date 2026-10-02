import type { Metadata } from 'next';
import { metadataOrigin } from './site-origin.ts';

export const SEARCH_ORIGIN = 'https://gunbeon.gangwon.kr';
export const PUBLIC_SEARCH_PATHS = [
  '/',
  '/about',
  '/guide',
  '/privacy',
  '/terms',
] as const;
export const SERVICE_TITLE = '군번여지도 강원 | 장병과 함께 만드는 강원 여행';
export const SERVICE_DESCRIPTION =
  '장병과 가족·연인·친구를 위한 강원 여행 계획 서비스. 철원·화천·양구·인제·고성의 추천 코스로 휴가와 면회 여행을 준비하고, 동행 그룹과 일정을 공유하세요.';

export function searchEnabled(vars: Record<string, unknown>) {
  return (
    vars.SITE_ENVIRONMENT === 'production' &&
    metadataOrigin(vars) === SEARCH_ORIGIN
  );
}

export function publicMetadata(
  vars: Record<string, unknown>,
  path: (typeof PUBLIC_SEARCH_PATHS)[number],
  title: string,
  description: string,
): Metadata {
  const url = new URL(path, SEARCH_ORIGIN).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: searchEnabled(vars), follow: searchEnabled(vars) },
    openGraph: {
      title,
      description,
      url,
      siteName: '군번여지도 강원',
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: SEARCH_ORIGIN + '/og.png',
          width: 1200,
          height: 630,
          alt: '군번여지도 강원 · 다시 만나는 길',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SEARCH_ORIGIN + '/og.png'],
    },
  };
}

// The cookie is only a conservative indexing signal here, never an authentication check.
export function privateHomeRequest(url: URL, cookie: string | null) {
  return (
    /(?:^|;\s*)(?:gunbeon_account|gangwon_test_session)=/.test(cookie || '') ||
    url.searchParams.has('join') ||
    url.searchParams.has('advice')
  );
}

export function robotsDocument(vars: Record<string, unknown>) {
  if (!searchEnabled(vars)) return 'User-agent: *\nDisallow: /\n';
  // Login and shared pages remain crawlable so Google can read their noindex directive.
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SEARCH_ORIGIN}/sitemap.xml\n`;
}

export function sitemapDocument(vars: Record<string, unknown>) {
  const entries = searchEnabled(vars)
    ? PUBLIC_SEARCH_PATHS.map(
        (path) => `<url><loc>${new URL(path, SEARCH_ORIGIN).href}</loc></url>`,
      ).join('\n')
    : '';
  // Omit lastmod rather than inventing a new content modification date on every request.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

export function siteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '군번여지도 강원',
    alternateName: '군번여지도',
    url: SEARCH_ORIGIN + '/',
    description: SERVICE_DESCRIPTION,
    inLanguage: 'ko-KR',
  };
}
