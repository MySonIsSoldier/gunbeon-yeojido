import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { discoveryPlaces, matchesPlaceCategory, makeRecommendations } from '../lib/discovery.ts';
import { guideAudience } from '../lib/onboarding.ts';
import { fetchRegionPage } from '../lib/tour-api.ts';
const nodes = JSON.parse(fs.readFileSync(new URL('../lib/data/places.json', import.meta.url)));
test('place explorer prefers tourism data, preserves distant branches and excludes private places', () => {
 const base = nodes.find(p => p.sigungu === '철원군' && p.source === 'dmz_cafe');
 const live = {...base, id:'tourapi:1', source:'tourapi'}, distant = {...base, id:'tourapi:2', source:'tourapi', lat:base.lat + 1, address:'다른 동네'};
 const privatePlace = {...base, id:'manual:1', source:'manual'};
 const list = discoveryPlaces([base, live, distant, privatePlace, {...base, id:'memorial:1', source:'mpva_memorial', access_tags:[]}], '철원군');
 assert.deepEqual(new Set(list.map(p => p.id)), new Set([live.id, distant.id]));
 assert(matchesPlaceCategory(live, 'food'));
 assert(!matchesPlaceCategory(live, 'stay'));
});
test('six complete routes in each border county have coordinates, distinct stops and date-free budgets', () => {
 for (const region of ['철원군','화천군','양구군','인제군','고성군']) {
  const list = makeRecommendations(nodes,region); assert.equal(list.length,6,region);
  for (const route of list) {
   assert(Number.isFinite(route.travelMinutes),route.title);
   assert(route.stops.every(s=>s.stay>0 && s.walk>=0));
   assert.equal(route.departureAt,undefined);
  }
 }
 assert.equal(makeRecommendations(nodes,'춘천시').length,0,'No fabricated gateway fallback');
});
test('guide is presentation-only for the authenticated judge or isolated persona', () => {
 assert.equal(guideAudience({handle:'openapi'}),'judge');
 assert.equal(guideAudience({handle:null,demoPersona:'minjun'}),'demo');
 assert.equal(guideAudience({handle:null,demoPersona:'openapi'}),'judge');
 assert.equal(guideAudience({handle:'other'}),null);
 assert.equal(guideAudience(null),null);
});
const fake = (calls, count=230, length=100) => async input => {
 const u = new URL(input); calls.push(u);
 const codes = u.pathname.endsWith('ldongCode2');
 const item = codes ? u.searchParams.has('lDongRegnCd') ? [{code:'110',name:'춘천시'}] : [{code:'51',name:'강원특별자치도'}] : Array.from({length},(_,i)=>({contentid:String(i+100),contenttypeid:'12',title:'조회 장소',mapx:'127.73',mapy:'37.87'}));
 return Response.json({response:{header:{resultCode:'0000'},body:{items:{item},totalCount:codes?1:count}}});
};
test('pagination requests actual second provider page and exposes continuation, not cached first page', async () => {
 const calls=[]; const page=await fetchRegionPage('fixture','춘천시','12',2,fake(calls));
 assert.equal(page.places.length,100); assert.equal(page.nextPage,3);
 assert.equal(calls.at(-1).searchParams.get('pageNo'),'2');
 assert.equal(calls.at(-1).searchParams.get('numOfRows'),'100');
 const last=await fetchRegionPage('fixture','춘천시','12',3,fake([],230,30)); assert.equal(last.nextPage,null);
 const empty=await fetchRegionPage('fixture','춘천시','12',2,fake([],230,0)); assert.equal(empty.nextPage,null);
});
test('invalid pagination never sends a provider request', async () => {
 for(const [type,page] of [['99',2],['12',1],['12',2.5],['12',NaN],['12',10001]]) {
  await assert.rejects(()=>fetchRegionPage('fixture','춘천시',type,page,async()=>{throw new Error('MUST_NOT_REQUEST')}),e=>e.code==='INVALID_PAGE');
 }
});
