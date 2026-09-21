-- The user explicitly made the judging ID a public, isolated tester login.
-- Preserve its existing password, profile, trips, groups and sessions in upgraded databases.
-- Sessions are copied lazily into independent workspaces by currentAccount.
INSERT INTO profiles(id,token_hash,nickname,created_at)
SELECT 'demo-template-profile-openapi','template:openapi','기능심사 · 체험 원본','2026-09-21T00:00:00.000Z'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE handle='openapi');
--> statement-breakpoint
-- Intentionally public tester credential; new/local environments need no manual seeding.
INSERT INTO accounts(id,nickname,handle,password_hash,profile_id,created_at,demo_persona)
SELECT 'demo-template-account-openapi','기능심사 여행자','openapi','scrypt:16384:8:5:a902e3a1716f3f5195735de015e1aae0:3d360df19fc38ab56972769a5d7a7b2a4e2ed598778d87d289437c0faa75e495','demo-template-profile-openapi','2026-09-21T00:00:00.000Z','template:openapi'
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE handle='openapi');
--> statement-breakpoint
UPDATE accounts SET demo_persona='template:openapi' WHERE handle='openapi';
