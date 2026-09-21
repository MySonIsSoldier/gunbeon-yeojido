import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.QA_BASE_URL||'http://localhost:3000',out=process.env.QA_OUT_DIR||'../reports/qa/planning-first-guide';
await fs.mkdir(out,{recursive:true});const results=[];
for(const channel of (process.env.QA_BROWSER_CHANNELS||'chromium').split(',')){
 const browser=await chromium.launch({headless:true,...channel==='chromium'?{}:{channel}});
 for(const width of [320,430,1440]){
  const c=await browser.newContext({viewport:{width,height:width===320?740:width===430?932:1000},locale:'ko-KR',timezoneId:'Asia/Seoul',extraHTTPHeaders:new URL(base).hostname==='localhost'?{'cf-connecting-ip':`192.0.2.${width%200+40}`}:{}});
  if(process.env.QA_SITE_TOKEN)await c.route(url=>url.origin===new URL(base).origin,route=>route.continue({headers:{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+process.env.QA_SITE_TOKEN}}));
  const p=await c.newPage();p.setDefaultTimeout(45000);const result={channel,width,checks:[],errors:[]};p.on('pageerror',e=>result.errors.push(e.message));
  const shot=name=>p.screenshot({path:`${out}/${channel}-${width}-${name}.png`});
  const guide=async()=>{await p.getByRole('button',{name:'여행 가이드 다시 보기',exact:true}).click();await p.getByRole('heading',{name:'기능별로 따라 해볼게요',exact:true}).waitFor();};
  const aligned=async()=>{
   await p.getByRole('alertdialog').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
   const bounds=await p.getByRole('alertdialog').boundingBox();
   assert(bounds.y>=15 && bounds.x>=15 && bounds.y+bounds.height<=(width===320?740:width===430?932:1000)-15,'Dialog exceeds viewport');
   const boxes=await p.getByRole('alertdialog').locator('[data-slot="alert-dialog-footer"] button').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {label:e.textContent.trim(),height:b.height,width:b.width,y:b.y}}));
   assert(boxes.length>=2);assert(boxes.every(b=>b.height>=44&&Math.abs(b.height-boxes[0].height)<1),JSON.stringify(boxes));
   if(width>640)assert(boxes.every(b=>Math.abs(b.y-boxes[0].y)<1),JSON.stringify(boxes));else assert(boxes.every(b=>Math.abs(b.width-boxes[0].width)<1),JSON.stringify(boxes));
   return boxes;
  };
  try{
   for(const handle of ['minjun_demo','openapi']){
    await p.goto(base+'/login');await p.locator('.account-page[data-ready=true]').waitFor();
    await p.getByRole('button',{name:handle==='openapi'?'openapi 테스트 계정 넣기':'민준 테스터 계정 선택',exact:true}).click();
    await p.getByRole('button',{name:handle==='openapi'?'openapi로 체험 시작':'민준으로 체험 시작',exact:true}).click();
    await p.getByRole('heading',{name:'기능별로 따라 해볼게요',exact:true}).waitFor();assert.equal(await p.locator('.quick-intro-dialog').count(),0);
    assert.equal(await p.locator('.tester-guide-layout nav button').first().getAttribute('aria-current'),'step');await shot(handle+'-guide');
    assert(await p.locator('.tester-guide-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Guide horizontal overflow');
    await p.getByRole('button',{name:'일정 열어보기',exact:true}).click();await p.locator('.trip-read-title').waitFor();await shot(handle+'-itinerary');
    assert(await p.getByRole('button',{name:'일정 수정하기',exact:true}).isVisible());
    const footer=p.locator('.trip-read-footer-actions'),sizes=await footer.locator('button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));assert(sizes.every(h=>h>=44&&h===sizes[0]));
    assert.notEqual(await footer.getByRole('button',{name:'출타 시작',exact:true}).evaluate(e=>getComputedStyle(e).backgroundColor),await footer.getByRole('button',{name:'일정 수정하기',exact:true}).evaluate(e=>getComputedStyle(e).backgroundColor));
    await p.keyboard.press('Escape');await guide();await p.locator('.tester-guide-layout nav button').nth(4).click();
    await p.getByRole('button',{name:'여행 당일 화면 살펴보기',exact:true}).click();await p.getByRole('heading',{name:'출발할 때 시작하세요',exact:true}).waitFor();
    assert.equal(await p.getByRole('alertdialog').count(),0);assert.equal(await p.locator('.outing-clock').count(),0);
    await p.locator('.outing-plan').first().click();await p.getByRole('alertdialog').waitFor();const startButtons=await aligned();await shot(handle+'-confirm');
    await p.getByRole('button',{name:'아직 출발 전',exact:true}).click();assert.equal(await p.locator('.outing-clock').count(),0);
    await p.getByRole('tab',{name:'내 여행',exact:true}).click();await p.locator('.trip-record-actions').first().getByRole('button',{name:'여행 완료',exact:true}).click();
    await p.getByRole('alertdialog').waitFor();const completeButtons=await aligned();assert.equal(await p.getByRole('alertdialog').evaluate(e=>e.scrollTop),0,'Completion opens at the title');await shot(handle+'-complete');await p.keyboard.press('Escape');
    await guide();await p.getByRole('button',{name:'20초 애니메이션으로 보기',exact:true}).click();await p.locator('.quick-intro-dialog').waitFor();
    await p.getByRole('heading',{name:'가고 싶은 곳과 돌아갈 여유를 함께.',exact:true}).waitFor({timeout:10000});await p.getByRole('button',{name:'일시정지',exact:true}).click();
    await p.getByRole('button',{name:'기능별로 따라 해볼게요',exact:true}).click();await p.getByRole('heading',{name:'기능별로 따라 해볼게요',exact:true}).waitFor();
    await p.getByRole('button',{name:'바로 둘러볼게요',exact:true}).click();await p.reload();await p.locator('.app-shell[data-ready=true]').waitFor();assert.equal(await p.locator('.tester-guide-dialog').count(),0);
    await guide();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    const state=await c.request.get(base+'/api/account/state',{headers:process.env.QA_SITE_TOKEN?{'OAI-Sites-Authorization':'Bearer '+process.env.QA_SITE_TOKEN}:{}}).then(r=>r.json());assert.equal(state.state?.activeOuting||null,null);
    result.checks.push({handle,guide:'Default and replay functional guide; animation opt-in',outing:'Guide opens explanation only; cancel leaves no active outing',startButtons,completeButtons});
    await p.goto(base+'/account');await p.locator('.account-page[data-ready=true]').waitFor();await p.getByRole('button',{name:'로그아웃',exact:true}).click();await p.getByRole('button',{name:'민준 테스터 계정 선택',exact:true}).waitFor();
   }
   assert.deepEqual(result.errors,[]);result.status='passed';
  }catch(e){result.status='failed';result.error=e.message;await shot('failure');process.exitCode=1;}
  results.push(result);console.log(JSON.stringify(result));await c.close();
 }
 await browser.close();
}
await fs.writeFile(out+'/results.json',JSON.stringify({at:new Date().toISOString(),base,mode:'Actual UI and isolated tester sessions; desktop viewport simulation; no original account changes',results},null,2));
