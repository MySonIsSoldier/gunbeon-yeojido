import { request } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const local = new URL(base).hostname === 'localhost';
const out = process.env.QA_OUT_DIR || '../reports/qa/isolated-testers';
const contexts = [];
const checks = [];
async function make(storageState) {
  const c = await request.newContext({
    baseURL: base,
    storageState,
    extraHTTPHeaders: {
      Origin: base,
      Connection: 'close',
      ...(process.env.QA_SITE_TOKEN
        ? { 'OAI-Sites-Authorization': 'Bearer ' + process.env.QA_SITE_TOKEN }
        : {}),
      ...(local
        ? {
            'cf-connecting-ip':
              '198.51.100.' + (1 + Math.floor(Math.random() * 240)),
          }
        : {}),
    },
  });
  contexts.push(c);
  return c;
}
const post = (c, url, data, headers = {}) => c.post(url, { data, headers });
const ok = async (r) => {
  const d = await r.json();
  assert(r.ok(), JSON.stringify({ status: r.status(), message: d.message }));
  return d;
};
try {
  for (const [handle, password, kind, count, groupCount] of [
    ['minjun_demo', 'GangwonTrip2026!', 'minjun', 5, 3],
    ['openapi', '2026openapi!', 'openapi', 4, 2],
  ]) {
    const a = await make(),
      b = await make();
    const login = { action: 'login', handle, password };
    assert.equal(
      (
        await post(a, '/api/account', {
          ...login,
          password: 'wrong-test-password',
        })
      ).status(),
      401,
    );
    const [aa, bb] = await Promise.all(
      [a, b].map(
        async (c) => (await ok(await post(c, '/api/account', login))).account,
      ),
    );
    assert.notEqual(aa.id, bb.id);
    assert.equal(aa.demoPersona, kind);
    assert.equal(aa.handle, null);
    const sa = await ok(await a.get('/api/account/state')),
      sb = await ok(await b.get('/api/account/state'));
    assert.equal(sa.state.entries.length, count);
    assert.deepEqual(sa.state, sb.state);
    const ga = (await ok(await a.get('/api/groups'))).groups,
      gb = (await ok(await b.get('/api/groups'))).groups;
    assert.equal(ga.length, groupCount);
    assert.equal(gb.length, groupCount);
    assert(!ga.some((g) => gb.some((h) => g.id === h.id)));
    const changed = structuredClone(sa.state);
    changed.entries[0].title = 'QA only this session';
    changed.entries.push({
      ...structuredClone(changed.entries[1]),
      recordId: 'qa:' + crypto.randomUUID(),
      title: 'QA newly created travel',
    });
    await ok(
      await post(
        a,
        '/api/account/state',
        { state: changed, revision: sa.revision },
        { 'X-Gunbeon-Account': aa.id },
      ),
    );
    const group = (
      await ok(
        await post(a, '/api/groups', {
          action: 'create',
          kind: 'friends',
          name: 'QA only this session group',
        }),
      )
    ).group;
    const detail = (await ok(await a.get('/api/groups?id=' + ga[0].id))).group;
    const gp = detail.plans[0];
    await ok(
      await post(a, '/api/groups', {
        action: 'savePlan',
        groupId: ga[0].id,
        planId: gp.id,
        version: gp.version,
        plan: { ...gp.plan, title: 'QA edited group itinerary' },
      }),
    );
    // Cookie restoration models returning to the same signed-in device; no re-authentication.
    const same = await make(await a.storageState());
    assert.deepEqual(
      (await ok(await same.get('/api/account/state'))).state,
      changed,
    );
    assert(
      (await ok(await same.get('/api/groups'))).groups.some(
        (g) => g.id === group.id,
      ),
    );
    assert.equal(
      (await ok(await same.get('/api/groups?id=' + ga[0].id))).group.plans.find(
        (p) => p.id === gp.id,
      ).plan.title,
      'QA edited group itinerary',
    );
    assert.deepEqual(
      (await ok(await b.get('/api/account/state'))).state,
      sb.state,
    );
    assert.equal(
      (await ok(await b.get('/api/groups'))).groups.length,
      groupCount,
    );
    assert.equal((await b.get('/api/groups?id=' + group.id)).status(), 403);
    assert.equal(
      (
        await post(
          b,
          '/api/account/state',
          { state: changed, revision: 1 },
          { 'X-Gunbeon-Account': aa.id },
        )
      ).status(),
      409,
    );
    for (const path of ['/api/account/import', '/api/auth/start'])
      assert.equal(
        (await post(a, path, { provider: 'google', link: true })).status(),
        403,
      );
    await ok(await post(a, '/api/account', { action: 'logout' }));
    assert.equal((await same.get('/api/account/state')).status(), 401);
    const fresh = (await ok(await post(a, '/api/account', login))).account;
    assert.notEqual(fresh.id, aa.id);
    assert.deepEqual(
      (await ok(await a.get('/api/account/state'))).state,
      sb.state,
    );
    assert.equal(
      (await ok(await a.get('/api/groups'))).groups.length,
      groupCount,
    );
    assert.equal((await a.get('/api/groups?id=' + group.id)).status(), 403);
    checks.push(
      `${handle}: concurrent login isolation; travel and group create/edit persist only within session; cookie restoration; logout revocation; pristine relogin; no cross-read/write or personal OAuth/import`,
    );
  }
  if (local) {
    // Synthetic legacy fixture only, never the existing judge account or an operating DB.
    const a = await make(),
      b = await make();
    const handle = 'qa_legacy_' + Date.now().toString(36),
      password = crypto.randomUUID();
    const old = (
      await ok(
        await post(a, '/api/account', {
          action: 'register',
          handle,
          password,
          nickname: 'QA legacy',
          testPassword: '1234',
        }),
      )
    ).account;
    const initial = {
      version: 3,
      entries: [],
      favorites: [],
      activeOuting: null,
    };
    await ok(
      await post(
        a,
        '/api/account/state',
        { state: initial, revision: 0 },
        { 'X-Gunbeon-Account': old.id },
      ),
    );
    await ok(
      await post(b, '/api/account', { action: 'login', handle, password }),
    );
    const group = (
      await ok(
        await post(a, '/api/groups', {
          action: 'create',
          name: 'QA legacy saved group',
          kind: 'family',
        }),
      )
    ).group;
    assert(/^[a-f0-9-]{36}$/.test(old.id));
    execFileSync(
      process.execPath,
      [
        'node_modules/wrangler/bin/wrangler.js',
        'd1',
        'execute',
        'DB',
        '--local',
        '--config',
        'wrangler.local.jsonc',
        '--command',
        `UPDATE accounts SET demo_persona='template:openapi' WHERE id='${old.id}'`,
      ],
      { stdio: 'pipe' },
    );
    const readers = await Promise.all(
      Array.from({ length: 3 }, () =>
        a.get('/api/account?include=travel').then(ok),
      ),
    );
    assert(readers.every((r) => r.account.id === readers[0].account.id));
    assert.notEqual(readers[0].account.id, old.id);
    assert.deepEqual(readers[0].state, initial);
    const second = await ok(await b.get('/api/account?include=travel'));
    assert.notEqual(second.account.id, readers[0].account.id);
    const ag = (await ok(await a.get('/api/groups'))).groups,
      bg = (await ok(await b.get('/api/groups'))).groups;
    assert.equal(ag[0].name, group.name);
    assert.notEqual(ag[0].id, bg[0].id);
    assert.equal(
      (
        await post(
          a,
          '/api/account/state',
          { state: initial, revision: 1 },
          { 'X-Gunbeon-Account': old.id },
        )
      ).status(),
      409,
    );
    checks.push(
      'Existing synthetic legacy sessions retain their saved state and groups in distinct copies; concurrent migration converges; stale screen write denied',
    );
  }
  if (local) {
    // Only age the two disposable workspaces created by this test. A still-valid
    // session must survive cleanup; an expired one and its characters must not.
    const expiredClient = await make(),
      activeClient = await make();
    const login = {
      action: 'login',
      handle: 'minjun_demo',
      password: 'GangwonTrip2026!',
    };
    const expired = (await ok(await post(expiredClient, '/api/account', login)))
      .account;
    const active = (await ok(await post(activeClient, '/api/account', login)))
      .account;
    assert(
      /^[a-f0-9-]{36}$/.test(expired.id) && /^[a-f0-9-]{36}$/.test(active.id),
    );
    const sql = (command) =>
      JSON.parse(
        execFileSync(
          process.execPath,
          [
            'node_modules/wrangler/bin/wrangler.js',
            'd1',
            'execute',
            'DB',
            '--local',
            '--config',
            'wrangler.local.jsonc',
            '--command',
            command,
            '--json',
          ],
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
        ),
      );
    sql(
      `UPDATE accounts SET created_at='2020-01-01T00:00:00.000Z' WHERE id IN ('${expired.id}','${active.id}'); UPDATE account_sessions SET expires_at=0 WHERE account_id='${expired.id}'`,
    );
    // Each login removes at most three expired copies; older test fixtures may
    // be ahead of ours, so do not assume this particular copy is first in line.
    let remaining = 1;
    for (let attempt = 0; attempt < 20 && remaining; attempt++) {
      const next = await make();
      await ok(await post(next, '/api/account', login));
      remaining = sql(
        `SELECT count(*) AS n FROM accounts WHERE id='${expired.id}'`,
      )[0].results[0].n;
    }
    assert.equal(remaining, 0);
    const characters = sql(
      `SELECT count(*) AS n FROM profiles WHERE substr(token_hash,1,${('demo-character:' + expired.id + ':').length})='demo-character:${expired.id}:'`,
    )[0].results[0].n;
    assert.equal(characters, 0);
    assert.equal(
      (await ok(await activeClient.get('/api/account'))).account.id,
      active.id,
    );
    checks.push(
      'Expired demo cleanup accepts UUID prefixes in D1, removes associated characters, preserves active sessions, and does not break new tester login',
    );
  }
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(
    out + '/api.json',
    JSON.stringify(
      {
        base,
        at: new Date().toISOString(),
        status: 'passed',
        mode: 'Real authentication and D1 APIs; only disposable tester workspaces changed',
        checks,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ status: 'passed', checks }));
} finally {
  for (const c of contexts) {
    await post(c, '/api/account', { action: 'logout' }).catch(() => {});
    await c.dispose();
  }
}
