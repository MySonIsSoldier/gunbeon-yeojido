import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/api/social-photo/route.ts';
const req = p => new Request('https://example.test/api/social-photo?path='+encodeURIComponent(p));
const valid='/cms/resource/76/4062476_image2_1.jpg';
test('photo relay only requests a fixed KTO resource, preserves bytes and refuses redirects', async t=>{
 const calls=[];
 const mock=t.mock.method(globalThis,'fetch',async (url,init)=>{calls.push({url,init});return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'image/jpg'}})});
 for(const p of ['https://evil.test/image.jpg','//evil.test','/cms/resource/1/../x.jpg','/cms/resource/1/x.svg'])assert.equal((await GET(req(p))).status,400);
 assert.equal(calls.length,0);
 const r=await GET(req(valid));assert.equal(r.status,200);assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[1,2,3]);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(calls[0].url,'https://tong.visitkorea.or.kr'+valid);assert.equal(calls[0].init.redirect,'manual');
 mock.mock.mockImplementation(async()=>new Response(null,{status:302,headers:{location:'https://evil.test'}}));assert.equal((await GET(req(valid))).status,502);
 mock.mock.mockImplementation(async()=>new Response('x',{headers:{'Content-Type':'image/x-ms-bmp'}}));assert.equal((await GET(req('/cms/resource/1/200_image2_1.bmp'))).status,200);
 mock.mock.mockImplementation(async()=>new Response(new Uint8Array(8*1024*1024+1),{headers:{'Content-Type':'image/png'}}));assert.equal((await GET(req(valid))).status,502);
});
