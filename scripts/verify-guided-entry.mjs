// Read-only verification of the existing designated account. Never creates/resets it.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
const { chromium, request } = createRequire(new URL('../web/package.json', import.meta.url))('playwright');
const base=process.env.QA_BASE_URL||'https://gunbeon.gangwon.kr';
const password=process.env.QA_JUDGE_PASSWORD;
if(!password)throw new Error('Set QA_JUDGE_PASSWORD through private environment input');
const phase=process.env.QA_PHASE||'after';
const out=new URL('../reports/qa/content-guided-entry/production/',import.meta.url);
const baseline=new URL('../tmp/content-judge-before.json',import.meta.url);
const fingerprint = value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const snapshot=async api=>{
 const r=await api.get(base+'/api/account/state');if(!r.ok())throw new Error('State read status '+r.status());const data=await r.json();
 const g=await api.get(base+'/api/groups');if(!g.ok())throw new Error('Group read status '+g.status());const groups=(await g.json()).groups;
 return {stateHash:fingerprint(data.state),revision:data.revision,entries:data.state?.entries?.length,groups:groups.length,groupHash:fingerprint(groups)};
};
if(phase==='before'){
 const api=await request.newContext({baseURL:base,extraHTTPHeaders:{Origin:base}});
 const r=await api.post('/api/account',{data:{action:'login',handle:'openapi',password}});
 if(!r.ok())throw new Error('Existing judge login status '+r.status());
 const state=await snapshot(api);await fs.writeFile(baseline,JSON.stringify(state),{mode:0o600});
 console.log(JSON.stringify({phase,status:'passed',entries:state.entries,groups:state.groups,revision:state.revision}));await api.dispose();
}else{
 await fs.mkdir(out,{recursive:true});const previous=JSON.parse(await fs.readFile(baseline,'utf8'));
 const browser=await chromium.launch({headless:true});const results=[];
 for(const width of [360,1440]){
  const c=await browser.newContext({viewport:{width,height:width<500?800:1000},locale:'ko-KR',timezoneId:'Asia/Seoul'});const p=await c.newPage();p.setDefaultTimeout(45000);const errors=[], timings=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfinished',req=>{const t=req.timing();if(t.responseEnd>0)timings.push({path:new URL(req.url()).pathname,method:req.method(),durationMs:Math.round(t.responseEnd)});});
  await p.goto(base+'/login');await p.locator('.account-page[data-ready=true]').waitFor();
  await p.getByLabel('아이디',{exact:true}).fill('openapi');await p.getByLabel('비밀번호',{exact:true}).fill(password);
  const start=performance.now();await p.locator('form').getByRole('button',{name:'로그인',exact:true}).click();
  await p.getByRole('heading',{name:'일정은 한눈에, 편집은 필요할 때.'}).waitFor();const readyMs=Math.round(performance.now()-start);
  await p.waitForTimeout(350);await p.screenshot({path:new URL(`judge-${width}-intro.png`,out).pathname});
  await p.getByRole('heading',{name:'가고 싶은 곳과 돌아갈 여유를 함께.'}).waitFor({timeout:10000});
  await p.getByRole('button',{name:'일시정지',exact:true}).click();
  await p.getByRole('button',{name:'기능별로 따라 해볼게요'}).click();await p.getByRole('button',{name:'일정 열어보기',exact:true}).click();
  await p.locator('.trip-read-title').waitFor();await p.screenshot({path:new URL(`judge-${width}-itinerary.png`,out).pathname});
  const after=await snapshot(c.request);
  if(after.stateHash!==previous.stateHash||after.groupHash!==previous.groupHash)throw new Error('Read-only judge state changed; investigate without resetting');
  if(errors.length)throw new Error('Browser runtime errors');
  results.push({width,status:'passed',loginToGuideMs:readyMs,stateUnchanged:true,revision:after.revision,entries:after.entries,groups:after.groups,errors,slowestRequests:timings.sort((a,b)=>b.durationMs-a.durationMs).slice(0,8)});
  await c.close();
 }
 await browser.close();await fs.writeFile(new URL('judge.json',out),JSON.stringify({base,at:new Date().toISOString(),mode:'Real existing normal account authentication; read-only UI actions; no reset',results},null,2));console.log(JSON.stringify(results));
}
