import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.QA_BASE_URL||'http://localhost:3000';
const out=process.env.QA_OUT_DIR||'../reports/qa/content-guided-entry/explorer';
await fs.mkdir(out,{recursive:true});
const results=[];
for(const channel of (process.env.QA_BROWSER_CHANNELS||'chromium').split(',')){
 const browser=await chromium.launch({headless:true,...channel==='chromium'?{}:{channel}});
 for(const width of (process.env.QA_WIDTHS||'360,430,1440').split(',').map(Number)){
  const context=await browser.newContext({viewport:{width,height:width<500?800:1000},locale:'ko-KR',timezoneId:'Asia/Seoul',extraHTTPHeaders:new URL(base).hostname==='localhost'?{'cf-connecting-ip':'192.0.2.'+(width%200+1)}:{}});
  const page=await context.newPage();page.setDefaultTimeout(40000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const result={channel,width,checks:[],errors}; const shot=async name=>page.screenshot({path:`${out}/${channel}-${width}-${name}.png`});
  try{
   await page.goto(base+'/login');await page.locator('.account-page[data-ready=true]').waitFor();
   await page.getByRole('button',{name:'민준 테스터 계정 선택'}).click();await page.getByRole('button',{name:'민준으로 체험 시작'}).click();
   await page.getByRole('heading',{name:'일정은 한눈에, 편집은 필요할 때.'}).waitFor();await shot('intro');
   await page.getByRole('heading',{name:'가고 싶은 곳과 돌아갈 여유를 함께.'}).waitFor({timeout:10000});
   await page.getByRole('button',{name:'일시정지',exact:true}).click();await shot('intro-action');
   assert.equal(await page.locator('.quick-intro-controls').getByRole('button',{name:'재생',exact:true}).count(),1);
   await page.getByRole('button',{name:'바로 둘러볼게요'}).click();result.checks.push('Auto animation advances; pause and skip work');
   await page.getByRole('tab',{name:'둘러보기',exact:true}).click();
   await page.locator('.journey-card').nth(5).waitFor();assert.equal(await page.locator('.journey-card').count(),6);
   assert.equal(await page.locator('.discovery-page input[type=datetime-local]').count(),0);
   await shot('courses');result.checks.push('Six complete border courses; browse remains date-free');
   await page.getByRole('tab',{name:'장소 찾기',exact:true}).click();await page.locator('.place-explorer-card').first().waitFor();
   await shot('places');await page.getByRole('button',{name:'맛집·카페',exact:true}).click();
   await page.getByLabel('장소 이름 또는 동네 검색').fill('존재하지않는검색qa');await page.getByRole('heading',{name:'검색어를 조금 바꿔볼까요?'}).waitFor();
   await page.getByRole('button',{name:'전체 장소 보기',exact:true}).click();
   assert.equal(await page.locator('.place-explorer-card').count(),12);
   await page.getByRole('button',{name:/장소 더 보기 ·/}).click();assert.equal(await page.locator('.place-explorer-card').count(),24);
   result.checks.push('Place types/search/empty recovery/show more');
   await page.getByRole('button',{name:/춘천.*관문/}).click();
   await page.waitForFunction(()=>document.querySelector('.region-tabs button.active')?.textContent?.includes('춘천'));
   await page.getByRole('tab',{name:'추천 코스',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.journey-card').length===3,{},{timeout:90000});
   assert.equal(await page.locator('.journey-card').count(),3);await shot('gateway');
   await page.getByRole('tab',{name:'장소 찾기',exact:true}).click();
   const first=page.locator('.place-explorer-main').first();await first.click();await page.locator('[role=dialog]').last().waitFor();await shot('detail');await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'이 장소로 일정 만들기',exact:true}).first().click();
   await page.getByRole('heading',{name:'나만의 코스 만들기',exact:true}).waitFor();await shot('place-to-plan');
   result.checks.push('Live gateway courses, place details and editable single-place plan');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
   result.status='passed';
  }catch(e){result.status='failed';result.error=e.message;await shot('failure');}
  results.push(result);console.log(JSON.stringify(result));await context.close();
 }
 await browser.close();
}
await fs.writeFile(out+'/results.json',JSON.stringify({base,at:new Date().toISOString(),mode:'Real local APIs and isolated Minjun accounts; browser viewport simulation',results},null,2));
if(results.some(r=>r.status!=='passed'))process.exitCode=1;
