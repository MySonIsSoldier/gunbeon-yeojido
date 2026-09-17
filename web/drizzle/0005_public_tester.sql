ALTER TABLE `accounts` ADD `demo_persona` text;
--> statement-breakpoint
-- Public fictional persona. This is a published tester password, not a private credential.
INSERT INTO profiles(id,token_hash,nickname,created_at) VALUES('demo-template-profile-minjun','template:minjun','민준 · 체험 원본','2026-09-16T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO accounts(id,nickname,handle,password_hash,profile_id,created_at,demo_persona) VALUES('demo-template-account-minjun','민준','minjun_demo','scrypt:16384:8:5:41e195ad4d3c185942fbcca7af918a56:ddb07883fbe5256417fca975ec1c609c1b43eb73494717d0005f5d5319dc4f02','demo-template-profile-minjun','2026-09-16T00:00:00.000Z','template:minjun');
