import { database, hashSecret } from './db';
import { demoSeed, DEMO_PERSONA } from './demo-persona';
import { sharePlan } from './group-model';
import type { Account } from './account-server';

/** One atomic batch: a failed seed must not leave a half-built judge experience. */
export async function createDemoWorkspace(): Promise<Account> {
  await cleanupExpiredDemos();
  const db = database(), id = crypto.randomUUID(), profileId = crypto.randomUUID(), now = new Date().toISOString();
  const a: Account = { id, profileId, nickname: DEMO_PERSONA.name, handle: null, demoPersona: 'minjun' };
  const seed = demoSeed();
  const statements = [
    db.prepare('INSERT INTO profiles(id,token_hash,nickname,created_at) VALUES(?,?,?,?)').bind(profileId, 'account:' + id, a.nickname, now),
    db.prepare('INSERT INTO accounts(id,nickname,profile_id,created_at,demo_persona) VALUES(?,?,?,?,?)').bind(id, a.nickname, profileId, now, a.demoPersona),
    db.prepare('INSERT INTO account_travel_state(account_id,payload,revision,updated_at) VALUES(?,?,1,?)').bind(id, JSON.stringify(seed.state), now),
  ];
  for (const group of seed.groups) {
    const groupId = crypto.randomUUID();
    statements.push(db.prepare('INSERT INTO travel_groups(id,name,kind,owner_id,created_at) VALUES(?,?,?,?,?)').bind(groupId, group.name, group.kind, profileId, now));
    statements.push(db.prepare('INSERT INTO group_members(group_id,user_id,joined_at) VALUES(?,?,?)').bind(groupId, profileId, now));
    for (const nickname of group.members) {
      const memberId = crypto.randomUUID();
      statements.push(db.prepare('INSERT INTO profiles(id,token_hash,nickname,created_at) VALUES(?,?,?,?)').bind(memberId, 'demo-character:' + id + ':' + memberId, nickname, now));
      statements.push(db.prepare('INSERT INTO group_members(group_id,user_id,joined_at) VALUES(?,?,?)').bind(groupId, memberId, now));
    }
    for (const entry of group.entries) statements.push(db.prepare('INSERT INTO group_plans(id,group_id,author_id,payload,version,updated_at) VALUES(?,?,?,?,1,?)').bind(crypto.randomUUID(), groupId, profileId, JSON.stringify(sharePlan(entry)), now));
  }
  await db.batch(statements);
  return a;
}

// Bounded lazy cleanup, exclusively expired synthetic workspaces; no production
// user, private judge, or template can match this selector.
export async function cleanupExpiredDemos() {
  const db = database();
  const expired = await db.prepare("SELECT id,profile_id AS profileId FROM accounts WHERE demo_persona='minjun' AND created_at<? AND NOT EXISTS(SELECT 1 FROM account_sessions s WHERE s.account_id=accounts.id AND s.expires_at>?) LIMIT 3")
    .bind(new Date(Date.now() - 14 * 86400000).toISOString(), Date.now()).all<{ id: string; profileId: string }>();
  for (const a of expired.results) {
    const hash = await hashSecret('account-advice:' + a.id);
    const groupIds = 'SELECT id FROM travel_groups WHERE owner_id=?';
    await db.batch([
      db.prepare('DELETE FROM advice_reports WHERE suggestion_id IN (SELECT id FROM advice_suggestions WHERE share_id IN (SELECT id FROM advice_shares WHERE owner_hash=?))').bind(hash),
      db.prepare('DELETE FROM advice_suggestions WHERE share_id IN (SELECT id FROM advice_shares WHERE owner_hash=?)').bind(hash),
      db.prepare('DELETE FROM advice_shares WHERE owner_hash=?').bind(hash),
      ...['group_plans', 'group_invitations', 'former_members', 'group_members'].map(t => db.prepare(`DELETE FROM ${t} WHERE group_id IN (${groupIds})`).bind(a.profileId)),
      db.prepare('DELETE FROM travel_groups WHERE owner_id=?').bind(a.profileId),
      db.prepare('DELETE FROM group_members WHERE user_id=?').bind(a.profileId),
      db.prepare('DELETE FROM account_travel_state WHERE account_id=?').bind(a.id),
      db.prepare('DELETE FROM account_sessions WHERE account_id=?').bind(a.id),
      db.prepare('DELETE FROM accounts WHERE id=? AND demo_persona=?').bind(a.id, 'minjun'),
      db.prepare('DELETE FROM profiles WHERE id=? OR token_hash LIKE ?').bind(a.profileId, 'demo-character:' + a.id + ':%'),
    ]);
  }
}
