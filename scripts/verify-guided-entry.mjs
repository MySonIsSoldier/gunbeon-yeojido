// The public openapi ID now issues isolated workspaces, not a shared persistent account.
// Exercise only disposable tester workspaces; never reset an authentication template.
process.env.QA_BASE_URL ||= 'https://gunbeon.gangwon.kr';
process.env.QA_OUT_DIR ||= new URL('../reports/qa/isolated-testers/production-api', import.meta.url).pathname;
if (process.env.QA_PHASE) throw new Error('Legacy before/after shared-account comparison retired. Use the isolated tester verification without QA_PHASE.');
await import('../web/scripts/isolated-testers-qa.mjs');
