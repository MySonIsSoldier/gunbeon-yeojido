import test from 'node:test';
import assert from 'node:assert/strict';
import { invitationCode } from '../lib/group-invite.ts';

const origin = 'https://gunbeon.gangwon.kr';
const code = 'ab12'.repeat(12);
test('accepts an invite code and the full link copied by the owner, with whitespace', () => {
  for (const value of [
    code,
    ` ${code}\n`,
    `${origin}/?join=${code}#groups`,
    ` ${origin}/?join=${code}#groups `,
  ])
    assert.equal(invitationCode(value, origin), code);
});
test('rejects foreign environments, ambiguous parameters and malformed codes before preview/join', () => {
  for (const value of [
    `${origin}.example.com/?join=${code}`,
    `https://development.example.com/?join=${code}`,
    `${origin}/?join=${code}&join=${code}`,
    `${origin}/account?join=${code}`,
    `${origin.replace('https://', 'https://name:password@')}/?join=${code}`,
    `${origin}/?join=${'a'.repeat(47)}`,
    'javascript:alert(1)',
    code + 'z',
    '',
  ])
    assert.equal(invitationCode(value, origin), null);
});

test('production domain migration accepts the existing production link, never a development link', () => {
  const oldOrigin = 'https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site';
  assert.equal(
    invitationCode(`${oldOrigin}/?join=${code}#groups`, origin),
    code,
  );
  assert.equal(
    invitationCode(`${origin}/?join=${code}#groups`, oldOrigin),
    code,
  );
  assert.equal(
    invitationCode(
      `${oldOrigin}/?join=${code}#groups`,
      'https://gunbeon-development.ybuser.chatgpt.site',
    ),
    null,
  );
});
