import { request } from 'playwright';
import fs from 'node:fs/promises';
import { makeRecommendations, discoveryPlaces } from '../lib/discovery.ts';
import { regions } from '../lib/domain.ts';
const base=process.env.QA_BASE_URL || 'http://localhost:3000';
if(new URL(base).hostname!=='localhost') throw new Error('Use the local adapter; never enter account credentials in reports');
process.loadEnvFile('.env.local');
const api=await request.newContext({baseURL:base,extraHTTPHeaders:{Origin:base}});
const access=await api.post('/api/test-access',{data:{password:process.env.TEST_ACCESS_PASSWORD}});
if(!access.ok())throw new Error('Local test access unavailable');
const nodes=JSON.parse(await fs.readFile(new URL('../lib/data/places.json',import.meta.url),'utf8'));
const results=[];
for(const region of regions){
 const start=performance.now(),r=await api.get('/api/places?region='+encodeURIComponent(region),{timeout:90000});
 const data=await r.json();
 const all=[...nodes,...data.places||[]];
 const item={region,status:r.status(),mode:data.mode,durationMs:Math.round(performance.now()-start),fetched:data.places?.length||0,categories:data.categories,visiblePlaces:discoveryPlaces(all,region).length,courses:makeRecommendations(all,region).map(m=>({id:m.id,title:m.title,stops:m.stops.length,liveSources:m.sourceCount})),error:data.error};
 if(region==='춘천시' && data.categories?.some(c=>c.contentTypeId==='12' && c.nextPage)){
  const next=await api.get('/api/places/page?region='+encodeURIComponent(region)+'&type=12&page=2',{timeout:60000});const d=await next.json();
  item.pagination={status:next.status(),page:d.page,fetched:d.places?.length,total:d.total,nextPage:d.nextPage,distinct:d.places?.every(p=>!data.places.some(x=>x.id===p.id))};
 }
 results.push(item);console.log(JSON.stringify({region,status:item.status,fetched:item.fetched,visible:item.visiblePlaces,courses:item.courses.length,pagination:item.pagination}));
}
await fs.mkdir('../reports/qa/content-guided-entry',{recursive:true});
await fs.writeFile('../reports/qa/content-guided-entry/live-content.json',JSON.stringify({at:new Date().toISOString(),mode:'Real TourAPI through local server; only counts and curated route metadata retained',results},null,2));
await api.dispose();
if(results.some(r=>r.status!==200 || r.courses.length!==(r.region.endsWith('시')?3:6)))process.exitCode=1;
