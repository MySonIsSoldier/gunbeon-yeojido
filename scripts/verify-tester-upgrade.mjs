// One-time, read-only production upgrade check. Cookie stays in ignored mode-0600 tmp.
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {request}=createRequire(new URL('../web/package.json',import.meta.url))('playwright');
const base=process.env.QA_BASE_URL||'https://gunbeon.gangwon.kr';
const file=new URL('../tmp/isolated-tester-upgrade-session.json',import.meta.url);
const out=new URL('../reports/qa/isolated-testers/production-upgrade.json',import.meta.url);
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const ok=async r=>{assert(r.ok(),'Upgrade check HTTP '+r.status());return r.json();};
async function snapshot(c){
 const info=await ok(await c.get('/api/account?include=travel'));const list=(await ok(await c.get('/api/groups'))).groups;
 const groups=[];for(const g of list){const d=(await ok(await c.get('/api/groups?id='+g.id))).group;groups.push({name:g.name,kind:g.kind,plans:d.plans.map(p=>p.plan).sort((a,b)=>a.title.localeCompare(b.title))});}
 groups.sort((a,b)=>a.name.localeCompare(b.name));
 return {accountId:info.account.id,handle:info.account.handle,demoPersona:info.account.demoPersona,stateHash:hash(info.state),groupHash:hash(groups),entries:info.state.entries.length,groups:groups.length};
}
if(process.argv.includes('--before')){
 const c=await request.newContext({baseURL:base,extraHTTPHeaders:{Origin:base}});
 await ok(await c.post('/api/account',{data:{action:'login',handle:'openapi',password:'2026openapi!'}}));
 const initial=await snapshot(c);assert.equal(initial.handle,'openapi','Already isolated: do not create a legacy baseline');
 await fs.writeFile(file,JSON.stringify({initial,storageState:await c.storageState()}),{mode:0o600});await c.dispose();
 console.log(JSON.stringify({phase:'before',entries:initial.entries,groups:initial.groups,privateSessionSaved:true}));
}else if(process.argv.includes('--after')){
 const saved=JSON.parse(await fs.readFile(file,'utf8'));const c=await request.newContext({baseURL:base,storageState:saved.storageState,extraHTTPHeaders:{Origin:base}});
 try{
  const after=await snapshot(c);assert.notEqual(after.accountId,saved.initial.accountId);assert.equal(after.demoPersona,'openapi');assert.equal(after.stateHash,saved.initial.stateHash);assert.equal(after.groupHash,saved.initial.groupHash);
  await fs.writeFile(out,JSON.stringify({base,at:new Date().toISOString(),status:'passed',checks:['Pre-deployment real openapi session continued with the same cookie after release','Private travel and group plan fingerprints retained in its isolated workspace','New account identity; authentication template and other sessions not overwritten'],entries:after.entries,groups:after.groups},null,2));console.log('Live legacy-session upgrade passed; saved travel and groups unchanged');
 }finally{await c.post('/api/account',{data:{action:'logout'}});await c.dispose();await fs.unlink(file);}
}else throw new Error('Use --before on the legacy release, then --after on the upgraded release');
