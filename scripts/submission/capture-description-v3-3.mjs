// Capture the deployed UI for the format-preserving document revision.
// No trips, groups or public links are edited. The login creates only its own demo session.
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium} = createRequire(new URL('../../web/package.json', import.meta.url))('playwright');
const base = 'https://gunbeon.gangwon.kr';
const out = 'reports/qa/description-v3-3/screens';
await fs.mkdir(out, {recursive:true});
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:430,height:932},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce'});
const page = await context.newPage();
page.setDefaultTimeout(45000);
const errors=[];
page.on('pageerror', e=>errors.push(e.message));
try {
  await page.goto(base+'/login');
  await page.locator('.account-page[data-ready=true]').waitFor();
  await page.getByRole('button',{name:'openapi 테스트 계정 넣기'}).waitFor();
  await page.screenshot({path:out+'/01-login.png'});
  await page.getByRole('button',{name:'openapi 테스트 계정 넣기'}).click();
  await page.getByRole('button',{name:'openapi로 체험 시작'}).click();
  await page.getByRole('heading',{name:'일정은 한눈에, 편집은 필요할 때.'}).waitFor();
  await page.screenshot({path:out+'/02-intro.png'});
  await page.getByRole('button',{name:'기능별로 따라 해볼게요'}).click();
  await page.getByRole('heading',{name:'준비된 여행부터 열어보세요'}).waitFor();
  await page.screenshot({path:out+'/03-guide.png'});
  await page.keyboard.press('Escape');
  await page.getByRole('tab',{name:'둘러보기',exact:true}).click();
  await page.getByRole('heading',{name:'어떤 강원을 만나볼까요?'}).waitFor();
  await page.getByRole('tab',{name:'장소 찾기',exact:true}).click();
  await page.getByPlaceholder('장소 이름이나 동네를 찾아보세요').waitFor();
  await page.getByPlaceholder('장소 이름이나 동네를 찾아보세요').fill('고석정');
  await page.getByText('고석정 (한탄강 유네스코 세계지질공원)',{exact:true}).first().waitFor();
  await page.locator('.place-explorer-card').first().locator('img').waitFor();
  await page.waitForFunction(()=>{const image=document.querySelector('.place-explorer-card img');return image?.complete && image.naturalWidth>0;});
  await page.screenshot({path:out+'/04-places-full.png'});
  // Match the existing screenshot frame aspect ratio without changing its placement.
  const inputBox=await page.getByPlaceholder('장소 이름이나 동네를 찾아보세요').boundingBox();
  await page.screenshot({path:out+'/04-places.png',clip:{x:0,y:Math.max(0,inputBox.y-135),width:430,height:569}});
  assert.deepEqual(errors,[]);
  await fs.writeFile(out+'/capture.json',JSON.stringify({at:new Date().toISOString(),base,viewport:{width:430,height:932},mode:'Live production; isolated openapi demo; no response mocks; no travel/group edits; reduced motion for still capture',files:['01-login.png','02-intro.png','03-guide.png','04-places-full.png','04-places.png'],errors},null,2)+'\n');
} finally {
  await context.request.post(base+'/api/account',{headers:{Origin:base},data:{action:'logout'}}).catch(()=>{});
  await context.close();
  await browser.close();
}
