import test from 'node:test';
import assert from 'node:assert/strict';
import {
  configuredSiteOrigin,
  oauthReadyAtOrigin,
  metadataOrigin,
} from '../lib/site-origin.ts';

test('OAuth readiness matches the actual callback origin, not just configured keys', () => {
  const config = {
    id: 'test-id',
    secret: 'test-secret',
    origin: 'https://travel.example.test/',
  };
  assert(oauthReadyAtOrigin(config, 'https://travel.example.test'));
  for (const origin of [
    'https://preview.example.test',
    'https://travel.example.test.evil.test',
    'http://travel.example.test',
    'https://travel.example.test:444',
  ])
    assert.equal(oauthReadyAtOrigin(config, origin), false);
  assert.equal(
    oauthReadyAtOrigin(
      { ...config, secret: '' },
      'https://travel.example.test',
    ),
    false,
  );
});

test('Configured origins reject credentials, paths, unsafe schemes and parser normalization', () => {
  for (const origin of [
    'https://a.test/login',
    'https://user@a.test',
    'https://a.test/?x=1',
    'https://a.test/#x',
    'http://a.test',
    'javascript:alert(1)',
    'https://a.test//',
    ' https://a.test',
    'https://a.test/../',
    'https://a.test\\evil',
    null,
  ])
    assert.equal(configuredSiteOrigin(origin), null, String(origin));
  assert.equal(
    configuredSiteOrigin('http://localhost:3000/'),
    'http://localhost:3000',
  );
  assert.equal(
    configuredSiteOrigin('https://travel.example.test/'),
    'https://travel.example.test',
  );
});

test('Social previews use per-environment URL with a safe existing-site fallback', () => {
  assert.equal(
    metadataOrigin({
      PUBLIC_SITE_URL: 'https://production.example.test',
      AUTH_BASE_URL: 'https://preview.example.test',
    }),
    'https://production.example.test',
  );
  assert.equal(
    metadataOrigin({ AUTH_BASE_URL: 'https://preview.example.test' }),
    'https://preview.example.test',
  );
  assert.equal(
    metadataOrigin({
      PUBLIC_SITE_URL: 'javascript:alert(1)',
      AUTH_BASE_URL: 'http://localhost:3000',
    }),
    'http://localhost:3000',
  );
  assert.equal(
    metadataOrigin({}),
    'https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site',
  );
});
