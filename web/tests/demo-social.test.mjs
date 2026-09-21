import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { demoSeed, judgeSeed } from '../lib/demo-persona.ts';
import { travelSocialCard, adviceSocialCard, approximateCountdown } from '../lib/social-card.ts';
import { validSharedPlan, sharePlan } from '../lib/group-model.ts';
const places=JSON.parse(await readFile(new URL('../lib/data/places.json',import.meta.url)));
test('fictional persona seeds future plans and past record without provider payload or active outing',()=>{
 const {state,groups}=demoSeed(new Date('2026-09-20T16:01:00Z'));
 assert.equal(state.entries.length,5);assert.equal(groups.length,3);assert.equal(state.activeOuting,null);
 assert.equal(state.entries[0].plan.departureAt,'2026-09-23T01:00:00.000Z');
 assert(state.entries[0].plan.stops.some(s=>s.placeId.startsWith('tourapi:')));
 assert.equal(state.entries[3].plan.stops.length,0);
 assert.equal(state.entries[4].recordStatus,'completed');
 for(const g of groups) for(const e of g.entries) assert(validSharedPlan(sharePlan(e)));
 assert(!JSON.stringify(state).includes('image_url'));assert(!JSON.stringify(state).includes('overview'));
});
test('social export excludes personal titles, meeting point, dates, locations and manual references',()=>{
 const entry=demoSeed().state.entries[1];
 entry.title='PRIVATE NAME';entry.plan.manualPlaces=[{id:'manual:x',title:'SECRET BASE'}];entry.plan.stops.push({placeId:'manual:x',stay:5,walk:0});
 const card=travelSocialCard(entry,places,true), serialized=JSON.stringify(card);
 for(const forbidden of ['PRIVATE NAME','SECRET BASE',entry.plan.departureAt,'manual:','originId','lat','lon','returnAt']) assert(!serialized.includes(forbidden));
 assert.equal(card.places.length,2);assert.equal(card.example,true);
 const record=demoSeed().state.entries[4];record.visitedPlaceIds=[record.plan.stops[0].placeId];
 assert.equal(travelSocialCard(record,places).places.length,1);
});
test('impact cards require an adopted suggestion and only known public places',()=>{
 const seed=demoSeed().state.entries[1], detail={id:'a'.repeat(32),snapshot:{region:'고성군',question:'change',placeIds:seed.plan.stops.map(s=>s.placeId)},places};
 const s={id:'b'.repeat(32),kind:'remove',targetId:detail.snapshot.placeIds[0],placeId:null,status:'pending'};
 assert.equal(adviceSocialCard(detail,s).kind,'advice');
 assert.equal(adviceSocialCard(detail,{...s,status:'adopted'}).kind,'impact');
 assert.equal(adviceSocialCard(detail,{...s,status:'adopted',targetId:'manual:secret'}).kind,'advice');
});
test('relative time is approximate, opt-in presentation data without any return timestamp',()=>{
 assert.equal(approximateCountdown(179),'약 2시간');assert.equal(approximateCountdown(59),'1시간 미만');
 assert.equal(approximateCountdown(0),null);assert.equal(approximateCountdown(NaN),null);
});

test('unresolved public stops block export without treating excluded private places as missing',()=>{
 const entry=demoSeed().state.entries[0];
 const card=travelSocialCard(entry,places);assert.equal(card.missingCount,2);
 const privateOnly={...entry,plan:{...entry.plan,stops:[{placeId:'manual:secret',stay:10,walk:0}]}};
 assert.equal(travelSocialCard(privateOnly,places).missingCount,0);
});

test('public judging examples are clean independent plans, record and groups', () => {
 const now=new Date('2026-09-21T04:00:00Z');
 const a=judgeSeed(now),b=judgeSeed(now);
 assert.equal(a.state.entries.length,4);assert.equal(a.groups.length,2);
 assert.equal(a.state.entries[2].plan.stops.length,0);
 assert.equal(a.state.entries[3].recordStatus,'completed');
 assert.equal(a.state.activeOuting,null);
 assert.equal(a.state.entries[0].plan.conditions.walkLimit,20);
 for(const g of a.groups) for(const e of g.entries) assert(validSharedPlan(sharePlan(e)));
 a.state.entries[0].title='A changed';assert.notEqual(b.state.entries[0].title,'A changed');
 assert(!JSON.stringify(b).includes('image_url'));
});
