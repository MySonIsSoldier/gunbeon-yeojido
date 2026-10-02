import test from 'node:test';
import assert from 'node:assert/strict';
import {
  searchEnabled,
  robotsDocument,
  sitemapDocument,
  publicMetadata,
  privateHomeRequest,
  siteStructuredData,
  SEARCH_ORIGIN,
  PUBLIC_SEARCH_PATHS,
} from '../lib/search-policy.ts';
const production = {
  SITE_ENVIRONMENT: 'production',
  PUBLIC_SITE_URL: SEARCH_ORIGIN,
};

test('Only the explicitly configured production site opts into discovery', () => {
  assert.equal(searchEnabled(production), true);
  for (const vars of [
    {},
    { ...production, SITE_ENVIRONMENT: 'development' },
    { ...production, PUBLIC_SITE_URL: 'https://preview.example.test' },
    { SITE_ENVIRONMENT: 'production' },
  ]) {
    assert.equal(searchEnabled(vars), false);
    assert.match(robotsDocument(vars), /Disallow: \/\n/);
    assert.doesNotMatch(sitemapDocument(vars), /<loc>/);
    assert.equal(
      publicMetadata(vars, '/', 'Title', 'Description').robots.index,
      false,
    );
  }
});
test('Sitemap only exposes public canonical pages; login can be crawled to read noindex', () => {
  const sitemap = sitemapDocument(production);
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    urls,
    PUBLIC_SEARCH_PATHS.map((path) => new URL(path, SEARCH_ORIGIN).href),
  );
  assert.doesNotMatch(sitemap, /login|account|\/p\/|api|lastmod|priority/);
  assert.match(
    robotsDocument(production),
    /Sitemap: https:\/\/gunbeon.gangwon.kr\/sitemap.xml/,
  );
  assert.doesNotMatch(
    robotsDocument(production),
    /Disallow: \/(?:login|account|p)/,
  );
  for (const path of PUBLIC_SEARCH_PATHS) {
    const meta = publicMetadata(production, path, 'Title', 'Description');
    assert.equal(meta.alternates.canonical, new URL(path, SEARCH_ORIGIN).href);
    assert.equal(meta.openGraph.url, meta.alternates.canonical);
    assert.equal(meta.robots.index, true);
  }
});
test('Personal workspace and invitation URL indexing never depends on user-agent', () => {
  for (const cookie of [
    'gunbeon_account=example',
    'a=b; gangwon_test_session=example',
    'gunbeon_account=',
  ])
    assert.equal(privateHomeRequest(new URL(SEARCH_ORIGIN), cookie), true);
  for (const suffix of ['?join=a', '?advice=b'])
    assert.equal(
      privateHomeRequest(new URL(SEARCH_ORIGIN + suffix), null),
      true,
    );
  assert.equal(
    privateHomeRequest(new URL(SEARCH_ORIGIN), 'other_gunbeon_account=example'),
    false,
  );
  assert.equal(privateHomeRequest(new URL(SEARCH_ORIGIN), null), false);
  assert.deepEqual(
    Object.keys(siteStructuredData()).sort(),
    [
      '@context',
      '@type',
      'alternateName',
      'description',
      'inLanguage',
      'name',
      'url',
    ].sort(),
  );
});
