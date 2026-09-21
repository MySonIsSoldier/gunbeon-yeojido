import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=process.env.QA_BASE_URL||'http://localhost:3000',out=path.resolve(process.env.QA_OUT_DIR||new URL('../../reports/qa/tester-social',import.meta.url).pathname);
await fs.mkdir(out,{recursive:true});const results=[];
for(const channel of (process.env.QA_BROWSER_CHANNELS||'chromium').split(',')) {
 const browser=await chromium.launch({headless:true,...(channel==='chromium'?{}:{channel})});
 for(const width of [360,430,1440]) {
  const c=await browser.newContext({viewport:{width,height:width<500?900:1000},extraHTTPHeaders: new URL(base).hostname==='localhost'?{'cf-connecting-ip':'192.0.2.'+(width%250+1)}:{},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce'}),p=await c.newPage();
  p.setDefaultTimeout(30000);const errors=[];p.on('pageerror',e=>errors.push(e.message));const r={channel,width,checks:[],errors};
  const shot=async name=>p.screenshot({path:out+`/${channel}-${width}-${name}.png`,fullPage:true});
  try {
   await p.goto(base+'/login');await p.locator('.account-page[data-ready=true]').waitFor();await shot('login');
   await p.getByRole('button',{name:'민준 테스터 계정 선택'}).click();
   assert.equal(await p.getByLabel('아이디',{exact:true}).inputValue(),'minjun_demo');
   assert.equal(await p.getByLabel('비밀번호',{exact:true}).inputValue(),'GangwonTrip2026!');
   await p.getByRole('button',{name:'민준으로 체험 시작'}).click();
   await p.getByRole('heading',{name:'일정은 한눈에, 편집은 필요할 때.'}).waitFor();await shot('welcome');
   await p.getByRole('button',{name:'기능별로 따라 해볼게요'}).click();await shot('guide');
   await p.getByRole('button',{name:'일정 열어보기',exact:true}).click();
   await p.locator('.trip-read-title').filter({hasText:'부모님과 천천히'}).waitFor();await shot('itinerary');
   r.checks.push('Persona autofill, login, optional welcome, task 1 itinerary');
   await p.getByRole('button',{name:'이번 휴가 한 장 · 공유 카드'}).click();
   await p.locator('.social-card-preview img').waitFor({timeout:90000});await shot('social');
   let d=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'PNG 저장',exact:true}).click()]);await d[0].saveAs(out+`/${channel}-${width}-story.png`);
   await p.getByRole('button',{name:'피드 4:5'}).click();await p.locator('.social-card-preview.feed img').waitFor();
   d=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'PNG 저장',exact:true}).click()]);await d[0].saveAs(out+`/${channel}-${width}-feed.png`);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   r.checks.push('Story/feed PNG preview and download; no horizontal overflow');
   await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.reload();await p.locator('.app-shell[data-ready=true]').waitFor();
   assert.equal(await p.getByRole('heading',{name:'일정은 한눈에, 편집은 필요할 때.'}).count(),0);
   await p.locator('.tester-rail button').click();await p.locator('.tester-guide-layout nav button').nth(2).click();
   await p.getByRole('button',{name:'동행 그룹 열어보기'}).click();await p.getByRole('heading',{name:'우리 가족의 주말'}).waitFor();await shot('group');
   r.checks.push('Reload preserves workspace; guide can reopen family group');assert.equal(errors.length,0,errors.join('\n'));r.status='passed';
  }catch(e){r.status='failed';r.error=e.message;await shot('failure');}
  results.push(r);console.log(JSON.stringify(r));await c.close();
 }
 await browser.close();
}
await fs.writeFile(out+'/ui.json',JSON.stringify({base,at:new Date().toISOString(),results},null,2));
if(results.some(r=>r.status!=='passed'))process.exitCode=1;
