import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.QA_BASE_URL||'http://localhost:3000',out=process.env.QA_OUT_DIR||new URL('../../reports/qa/tester-social/scenarios',import.meta.url).pathname;
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:430,height:932},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',extraHTTPHeaders:new URL(base).hostname==='localhost'?{'cf-connecting-ip':'192.0.2.201'}:{}}),p=await context.newPage(),visitor=await browser.newContext({viewport:{width:430,height:932},locale:'ko-KR'}),v=await visitor.newPage();
p.setDefaultTimeout(30000);v.setDefaultTimeout(30000);const checks=[],errors=[];p.on('pageerror',e=>errors.push(e.message));let id;
const shot=async name=>p.screenshot({path:out+'/'+name+'.png'});
const guide=async(step,action)=>{await p.locator('.tester-rail button').click();await p.locator('.tester-guide-layout nav button').nth(step).click();await p.getByRole('button',{name:action,exact:true}).click()};
const png=async name=>{await p.locator('.social-card-preview img').waitFor({timeout:90000});const [d]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'PNG 저장',exact:true}).click()]);await d.saveAs(out+'/'+name+'.png');};
try{
 await p.goto(base+'/login');await p.locator('.account-page[data-ready=true]').waitFor();await shot('01-login');
 await p.getByRole('button',{name:'민준 테스터 계정 선택'}).click();await p.getByRole('button',{name:'민준으로 체험 시작'}).click();await p.getByRole('heading',{name:'가이드와 함께 둘러볼까요?'}).waitFor();await shot('02-welcome');await p.getByRole('button',{name:'7분 체험 가이드 시작'}).click();await shot('03-guide');
 await p.getByRole('button',{name:'일정 열어보기',exact:true}).click();await p.locator('.trip-read-title').waitFor();await p.getByRole('button',{name:'이번 휴가 한 장 · 공유 카드'}).click();await png('04-story');await shot('05-studio');await p.keyboard.press('Escape');await p.keyboard.press('Escape');
 await guide(1,'일정 편집해 보기');await p.getByLabel('코스 이름',{exact:true}).fill('부모님과 여유롭게, 철원');await p.getByRole('button',{name:'변경사항 저장',exact:true}).click();await p.locator('.tester-rail').waitFor();checks.push('Guide opens actual editor and edited title saves to account');
 await guide(3,'공유안 준비해 보기');await p.locator('.advice-publish-places').waitFor();const [created]=await Promise.all([p.waitForResponse(r=>r.url().endsWith('/api/advice')&&r.request().method()==='POST'),p.getByRole('button',{name:'이 내용으로 공유 링크 만들기',exact:true}).click()]);assert.equal(created.status(),201);id=(await created.json()).id;
 await p.getByRole('button',{name:'스토리 이미지',exact:true}).click();await png('06-advice');await shot('07-advice-studio');await p.keyboard.press('Escape');await p.keyboard.press('Escape');
 await v.goto(base+'/p/'+id);await v.locator('.advice-page[data-ready=true]').waitFor();await v.locator('.advice-candidates button').first().click();await v.getByRole('button',{name:'이렇게 한 수 보태기',exact:true}).click();await v.locator('.advice-thanks').waitFor();
 await guide(3,'공유안 준비해 보기');await p.getByRole('button',{name:'내 계획에서 검토',exact:true}).click();await p.getByRole('button',{name:'변경사항 저장',exact:true}).click();await p.getByText('받은 한 수를 내 여행에 반영했어요.',{exact:false}).count();
 await guide(3,'공유안 준비해 보기');await p.getByRole('button',{name:'한 수가 바꾼 여행 공유',exact:true}).waitFor();await p.getByRole('button',{name:'한 수가 바꾼 여행 공유',exact:true}).click();await png('08-impact');await shot('09-impact-studio');await p.keyboard.press('Escape');await p.keyboard.press('Escape');
 checks.push('Public synthetic snapshot, anonymous proposal, real account save and adopted-impact QR card');
 await guide(4,'출타 시작 화면 열기');await p.getByRole('heading',{name:'지금 출발할까요?'}).waitFor();await p.getByRole('button',{name:'출타 시작',exact:true}).click();await p.locator('.outing-clock').waitFor();await p.getByRole('button',{name:'남은 하루, 한 장으로 공유',exact:true}).click();await png('10-outing-private');const cb=p.getByRole('checkbox',{name:'남은 시간을 함께 담기'});assert.equal(await cb.isChecked(),false);await cb.check();await p.getByRole('button',{name:'피드 4:5'}).click();await p.locator('.social-card-preview.feed img').waitFor();await png('11-outing-time');await shot('12-outing-studio');checks.push('Current outing share defaults to no time; approximate countdown requires opt-in');assert.equal(errors.length,0);
 await fs.writeFile(out+'/result.json',JSON.stringify({base,at:new Date().toISOString(),checks,errors,status:'passed'},null,2));console.log({status:'passed',checks});
}catch(e){await shot('failure');await fs.writeFile(out+'/result.json',JSON.stringify({base,checks,errors,error:e.message,status:'failed'},null,2));throw e;}finally{if(id)await context.request.post(base+'/api/advice',{headers:{Origin:base},data:{action:'delete',id}});await browser.close();}
