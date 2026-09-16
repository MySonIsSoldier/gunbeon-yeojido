import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const artifactRequire=createRequire(process.env.RUNTIME_NODE_MODULES ? path.join(process.env.RUNTIME_NODE_MODULES,'entry.cjs') : import.meta.url);
const {FileBlob,PresentationFile}=await import(artifactRequire.resolve('@oai/artifact-tool'));
const source=process.env.SUBMISSION_TEMPLATE_PATH || 'tmp/submission-assets/2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서 양식(작성용).pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const s=[...p.slides.items];
const F='맑은 고딕';
const OUT='tmp/submission-build';
await fs.mkdir(OUT,{recursive:true});
const map=JSON.parse(await fs.readFile(new URL('./image-map.json',import.meta.url),'utf8'));
function cell(t,r,c,v,size=24,bold=false){const x=t.getCell(r,c);x.paragraphs.clear();x.value=v;x.text.style={fontSize:size,typeface:F,color:'#172B35',alignment:'left',bold,autoFit:'none',wrap:'word'};x.margins={left:14,right:14,top:6,bottom:6};return x;}
function txt(sl,v,x,y,w,h,size=20,color='#172B35',bold=false){const t=sl.shapes.add({geometry:'textbox',name:v.slice(0,28),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});t.text=v;t.text.style={fontSize:size,typeface:F,color,bold,alignment:'left',verticalAlignment:'middle',autoFit:'none',wrap:'word',insets:{left:0,right:0,top:0,bottom:0}};return t;}
async function image(sl,key,fallback,x,y,w,h){const file=map[key]||(key==='representative'?fallback:null);if(!file)throw new Error(`Missing verified screenshot: ${key}`);sl.images.add({blob:new Uint8Array(await fs.readFile(file)),contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',alt:key,fit:'contain',position:{left:x,top:y,width:w,height:h}});}
function notes(sl,t){sl.speakerNotes.textFrame.setText(t+'\n실제 서비스: https://gunbeon.gangwon.kr\n구현 기준: 운영 v19/env5 (2026-09-16 확인). 화면은 기능 확인용 합성 여행 예시이며 실제 이용자 여행 기록이 아닙니다.');}
for(const i of [4,5,7])for(const shape of [...s[i].shapes.items])if(shape.text?.toString().includes('가이드 박스'))shape.delete();
// Cover: official background and label cells remain unchanged.
cell(s[0].tables.items[0],0,1,'우리아들이군인인데\n여행계획을준비했대',25,true);
cell(s[0].tables.items[0],1,1,'군번여지도 강원:\n휴전선 밖 첫 하루',25,true);
notes(s[0],'2026 관광데이터 활용 공모전 ① 웹·앱 개발 부문 1차 기능설명서. 지정 9쪽 양식을 기반으로 기능 흐름도만 5개로 확장했습니다. 대표자 심윤보.');
// Intro.
let t=s[1].tables.items[0];
cell(t,0,1,'군번여지도 강원: 휴전선 밖 첫 하루',27,true);
cell(t,1,1,'웹 서비스 · 모바일 웹/PWA  |  https://gunbeon.gangwon.kr',24);
cell(t,2,1,'장병과 가족·연인·친구가 강원 여행을 함께 준비하고,\n개인 복귀 기준에 맞춰 일정을 조정하며, 다녀온 하루를 기록하는 여행 여권.',24);
cell(t,3,1,'출타의 제약은 시간, 여행의 이유는 함께하는 사람입니다.\n\n장병은 복귀 기준을, 동행자는 이동·도보·식사 조건을 고려해야 합니다.\n관광정보를 찾은 뒤 단체 대화방에서 다시 조율하는 과정을 한 일정으로 잇습니다.\n\n강원 접경 5군의 평화·자연·식사 장소를 연결해\n짧은 면회와 휴가도 각자의 조건에 맞는 강원 여행이 되도록 돕습니다.',24);
notes(s[1],'문제 정의는 예선 제안서와 현재 구현을 바탕으로 정리. 관광소비 증가·이용자 만족도 등 정량 성과를 측정 완료했다고 주장하지 않습니다.');
const functions=[
['관광정보로 만드는 나의 강원 일정','강원 관광지·음식점을 찾아 장소·순서·체류시간을 내 여행에 맞춥니다.'],
['동행 그룹과 함께 준비하기','가족·연인·친구와 공동 일정을 만들고 개인 여행 사본으로 이어갑니다.'],
['복귀 여유 비교와 조정','한 곳 생략·체류시간 변경 전후의 추정 여유를 비교하고 저장합니다.'],
['현재 출타에서 하루 여권까지','계획과 실제 출타를 구분하고, 다녀온 장소만 선택해 하루를 기록합니다.'],
['한 수를 받아 여행에 반영하기','공개한 여행에 장소 제안을 받고 검토한 변경을 실제 일정에 반영합니다.']
];
cell(s[2].tables.items[0],0,1,functions.map((f,i)=>`${i+1}. ${f[0]}\n    ${f[1]}`).join('\n\n'),24);
notes(s[2],'핵심 기능 5개와 이후 기능 흐름도 5쪽은 동일 순서·이름입니다. 로그인/서버 저장/장애 대응은 완성도의 근거이며 별도 핵심 기능으로 중복 계상하지 않았습니다.');
// Images.
t=s[3].tables.items[0];cell(t,0,1,'');cell(t,1,1,'');
await image(s[3],'representative','assets/brand-kit/v1/representative-1200x630.png',258,141,346,168);
txt(s[3],'군번여지도 강원',640,151,540,46,30,'#174E51',true);
txt(s[3],'함께 만든 일정에, 나의 복귀 기준을.',640,201,555,46,26);
txt(s[3],'휴전선 밖 첫 하루  ·  gunbeon.gangwon.kr',640,254,555,32,21,'#4F666D');
const detail=[['home','web/public/guide/09-home.png','함께 준비하는 홈'],['itinerary','web/public/guide/25-itinerary-view.png','읽기 쉬운 일정표'],['comparison','web/public/guide/10-comparison.png','복귀 여유 비교'],['accessibility','web/public/guide/12-record.png','동행 편의시설 안내'],['advice','web/public/guide/15-advice-public.png','여행에 한 수']];
for(let i=0;i<5;i++){await image(s[3],detail[i][0],detail[i][1],246+i*201,339,188,257);txt(s[3],detail[i][2],246+i*201,608,194,28,19,'#172B35',true);}
notes(s[3],'대표 이미지: 팀 제작 로고 B(다시 만나는 길). 상세 이미지: 실제 구현 화면 캡처, 합성 예시 일정. 출처: ⓒ한국관광공사; 카카오 지도; 통일부 DMZ 인근 지역 파일데이터. 개별 사진 출처/사용조건은 서비스 /#sources 및 docs/submission/2026-round1의 이미지 기록을 참조.');
// Gangwon scope.
t=s[4].tables.items[0];
cell(t,0,1,'강원특별자치도\n\n철원 · 화천 · 양구 · 인제 · 고성 접경 5군\n춘천·속초는 가족 방문과 이동을 위한 보조 관문으로 활용',24,true);
cell(t,1,1,'지역 탐색  ─  접경 5군별 추천 여행과 관광공사 장소 검색을 제공합니다.\n방문 판단  ─  예약·운영·편의 안내를 출처와 함께 확인하고 일정을 조정합니다.\n반복 방문  ─  동행 그룹별 여행과 강원 5개 장의 기록을 다음 출타로 이어갑니다.\n\n철원 예시: 고석정 → 노동당사 → 관광공사 음식점 후보\n고성 예시: 왕곡마을 → 송지호관망타워\n\n지역 내 관광과 식사를 연결하되, 운영 여부·예약 조건은 방문 전에 확인합니다.',24);
notes(s[4],'강원 지역 특화는 한 광역자치단체 내부의 5군 및 2관문으로 한정. 공식 Notion의 지역특화 가점 인정 범위 참고. 여행 예시는 실제 심사용 합성 일정과 대응하며 실제 방문 성과가 아닙니다. 장소 최신 확인 근거: docs/submission/2026-round1/place-verification.md');
// Duplicate only the officially permitted feature flow page.
const flows=[s[5]];for(let i=1;i<5;i++){const c=s[5].duplicate();c.moveTo(5+i);flows.push(c);}
const steps=[
[
['discover','web/public/guide/01-discover.png','1  날짜 없이 둘러보기','지역과 동행 취향으로\n추천 여행을 살펴봅니다.'],
['search','web/public/guide/04-editor.png','2  실제 관광정보 검색','관광공사 장소·상세를 확인해\n일정에 넣습니다.'],
['editor','web/public/guide/24-trip-conditions.png','3  내 조건으로 편집','날짜·순서·체류시간과\n여행별 동행 조건을 정합니다.'],
['itinerary','web/public/guide/25-itinerary-view.png','4  보기 좋은 일정표','장소와 시간·이동 추정을\n한 화면에서 확인합니다.']
],
[
['home','web/public/guide/09-home.png','1  동행 그룹 선택','가족·연인·친구 그룹으로\n여러 여행을 나눠 관리합니다.'],
['group','web/public/guide/08-group.png','2  초대로 함께 준비','초대받은 사람이 가입하고\n공동 일정에 참여합니다.'],
['group-plan','web/public/guide/08-group.png','3  공동 여행 편집','같은 여행의 장소·순서·\n출발 계획을 함께 바꿉니다.'],
['personal-copy','web/public/guide/24-trip-conditions.png','4  내 여행 사본 만들기','복귀 기준은 내 사본에서.\n원본과 자동 동기화 없음.']
],
[
['conditions','web/public/guide/24-trip-conditions.png','1  나의 기준 입력','출발·복귀 시각과 도보·\n추가 여유를 설정합니다.'],
['adjust','web/public/guide/10-comparison.png','2  조정안 고르기','한 장소 생략 또는\n체류시간 감소를 선택합니다.'],
['comparison','web/public/guide/10-comparison.png','3  전후를 비교하기','추정 복귀 여유·도보량을\n비교해 직접 판단합니다.'],
['adjusted','web/public/guide/25-itinerary-view.png','4  적용 후 일정 저장','변경안을 저장하고\n필요하면 되돌립니다.']
],
[
['start','web/public/guide/05-start.png','1  출발을 직접 확인','계획을 남겨두고\n실제 출타를 시작합니다.'],
['outing','web/public/guide/06-outing.png','2  현재 출타 확인','현재 시각으로 남은 일정과\n복귀 여유를 확인합니다.'],
['complete','web/public/guide/11-completion.png','3  방문한 장소만 완료','다녀온 곳을 확인한 뒤\n여행 기록과 스탬프를 만듭니다.'],
['record','web/public/guide/12-record.png','4  하루 여권으로 남기기','공유 카드·기록 수정·\n다시 계획으로 가져오기.']
],
[
['advice-preview','web/public/guide/14-advice-preview.png','1  공개할 내용 확인','관광지와 질문만 공개.\n개인 시각·직접 입력지는\n공개 내용에서 제외합니다.'],
['advice','web/public/guide/15-advice-public.png','2  링크로 한 수 받기','방문자는 장소의 추가·\n교체·생략을 제안합니다.'],
['proposal','web/public/guide/16-advice-proposal.png','3  작성자가 검토하기','제안을 읽고 내 일정에서\n변경안을 확인합니다.'],
['adopted','web/public/guide/17-advice-adopted.png','4  저장 후 반영 표시','실제 일정 저장 후\n반영 완료로 표시합니다.\n새 여행으로도 가져갑니다.']
]
];
for(let i=0;i<flows.length;i++){
 const sl=flows[i], header=sl.tables.items.find(x=>x.rowCount===2), body=sl.tables.items.find(x=>x.rowCount===3);
 cell(header,0,0,`핵심 기능${i+1}`,24,true).text.style={color:'#FFFFFF',alignment:'center'};
 cell(header,0,1,functions[i][0],24,true);cell(header,1,1,functions[i][1],23);
 for(let col=0;col<4;col++){
  cell(body,1,col,'');cell(body,2,col,`${steps[i][col][2]}\n\n${steps[i][col][3]}`,22);
  await image(sl,steps[i][col][0],steps[i][col][1],40+col*300,248,280,279);
 }
 notes(sl,`핵심 기능 ${i+1}: ${functions[i][0]}.\n실제 동작 근거: https://github.com/MySonIsSoldier/gunbeon-yeojido/tree/master/reports/qa\n화면 출처: 2026-09-16 운영 서비스에서 실제 동작을 확인한 예시 여행. 로딩 중 캡처는 제외했습니다. `+(i===2?'이동 시간은 거리 기반 추정. 실제 교통 및 소속 부대 규정은 직접 확인하며 복귀 가능성을 보장하지 않습니다.':i===1?'그룹 공동 원본과 개인 사본은 별도입니다. 개인 복귀시각·실행 기록을 자동 전송하지 않습니다.':''));
}
// KTO APIs. Preserve all five slots, explicitly leave unused services out.
t=s[6].tables.items[0];
cell(t,0,2,'한국관광공사 국문 관광정보 서비스_GW (KorService2)',24,true);
cell(t,1,2,'강원 장소·좌표·사진·상세 → 검색·지도·일정 편집·이동시간 추정에 활용',23);
cell(t,2,2,'한국관광공사 무장애 여행 정보 (KorWithService2)',24,true);
cell(t,3,2,'주차·접근로·대여 안내 → 장소 상세와 동행 브리핑의 편의시설 확인',23);
for(let r=4;r<10;r++)cell(t,r,2,r%2===0?'—':'',23);
txt(s[6],'실제 호출 → 장소 선택 → 나의 일정 판단',40,596,1200,35,26,'#174E51',true);
txt(s[6],'9/16 운영 확인: 철원 5유형 113곳 · 꽃밭 상세/무장애 응답 성공\n출처: ⓒ한국관광공사  |  API 키는 서버에서만 사용 · 운영 DB에는 원문 응답 미적재',40,636,1200,62,22);
notes(s[6],'실제 서비스 오퍼레이션: KorService2/ldongCode2, areaBasedList2, searchKeyword2, detailCommon2, detailIntro2. 무장애: KorWithService2/ldongCode2, areaBasedList2, detailWithTour2. 국문 contentid/title/addr1/mapx/mapy/firstimage; 무장애 parking/route/wheelchair 등의 응답 필드를 사용합니다. detailImage2는 사용하지 않으며 firstimage로 대표 사진 표시. 2026-09-16 11:29 KST 운영 실호출: reports/qa/submission-2026-09-16/live-api.json. 113건은 이날 철원 응답값으로 상시 고정 보유량이 아닙니다. 집중률/중심/연관 API는 표본 검증만 완료하여 서비스 활용 목록에서 제외. 인증키 원문은 이 문서에 넣지 않습니다.');
// Other data.
t=s[7].tables.items[0];
const other=[['통일부 DMZ 관광·카페 파일 / 국가보훈부 현충시설 수집본','강원 관광·회복·호국 장소의 기본 후보로 정규화. API 실패 시 출처를 구분해 제공.'],['카카오맵 JavaScript SDK / 외부 길찾기 링크','선택 장소·일정 지도와 직접 장소 선택. 실제 도로 경로 시간 계산은 외부로 연결.'],['기상청 단기예보 조회서비스 (getVilageFcst)','권역 대표 격자의 8시간 예보를 안내. 사용자가 적용한 날씨 조건을 일정 여유에 반영.']];
for(let i=0;i<3;i++){cell(t,i*2,2,other[i][0],23,true);cell(t,i*2+1,2,other[i][1],22);}
txt(s[7],'서로 다른 근거를 같은 확정값으로 표시하지 않습니다.',40,458,1190,40,27,'#174E51',true);
txt(s[7],'공공 API 실응답  /  출처가 있는 기본 파일자료  /  공식 안내 수동 확인  /  거리 기반 추정\n\n운영·예약·신분확인 조건은 확인한 범위와 기준일을 구분합니다.\n복귀 여유는 거리 기반 참고값이며, 실제 교통과 소속 부대 규정은 직접 확인합니다.',40,518,1170,142,24);
notes(s[7],'통일부 DMZ 인근 지역 관광·카페 파일데이터, 국가보훈부 현충시설 데이터 수집본: reports/data_validation_summary.md 및 reports/data_validation_metrics.json. 기본 원천 607건은 출처 간 중복 가능한 정규화 레코드로 고유 장소 수가 아님. 기상청 실응답: reports/qa/submission-2026-09-16/live-api.json, 8시간 200/live. 예보는 개인 위치가 아닌 시군청 대표 격자. 카카오 API 확인: reports/custom_domain_live_2026-09-15.md. 사진은 서비스 출처 및 개별 라이선스 표시를 따릅니다.');
// Difference and realistic future milestones.
t=s[8].tables.items[0];
cell(t,0,1,'함께 준비하되, 개인의 복귀 기준은 따로 다룹니다.\n그룹의 관광 일정과 장병의 개인 판단을 연결하면서 공유 범위를 구분합니다.\n\n관광정보를 읽는 데서 끝나지 않고, 오늘의 선택을 바꿉니다.\n공사 좌표·상세·편의정보가 장소 선택과 일정 조정의 근거가 됩니다.\n\n외부의 “한 수”를 댓글에서 실제 일정 변경으로 이어갑니다.\n장소 단위 제안을 비교·저장한 뒤 반영 여부를 남깁니다.',24);
cell(t,1,1,'1단계 · 실제 장병과 동행자가 계획·초대·조정을 완주하는지 검증\n             완료율, 막힌 단계, 다음 출타 재사용을 관찰해 UX 보완\n2단계 · 접경 5군 운영·예약 조건의 확인 범위를 넓히고 갱신 체계 정비\n             관광공사 운영계정·호출량 확대와 안정적 운영을 병행\n3단계 · 지역 관광 주체와 실증을 제안해 식사·체류 장소 연결 개선\n             강원에서 효과를 확인한 뒤 확장 검토\n\n공동 계획 완료율 · 제안 반영률 · 다음 출타 재사용률로 개선 효과를 확인합니다.',23);
notes(s[8],'발전계획은 향후 실행 제안이며 현재 체결된 기관 협약·측정된 관광소비 증가 또는 사용자 조사 성과가 아닙니다. 공개 소스와 실행 증빙: https://github.com/MySonIsSoldier/gunbeon-yeojido . 공식 양식·참가자 안내: https://lowly-polyanthus-1fb.notion.site/2026-36b5dce406e380e0a3d1f80525667a11 .');
for(let i=0;i<p.slides.items.length;i++){
 const sl=p.slides.items[i];
 if(i>0)txt(sl,`${i+1} / ${p.slides.items.length}`,1170,700,85,16,13,'#677B80');
 if([3,5,6,7,8,9].includes(i)){
  const credit=txt(sl,'화면: 9/16 운영본·예시 여행 | 사진: ⓒ한국관광공사 · Sadopaul/Gyuwon Lee(CC BY-SA 4.0) 외 · 원문/이용조건',30,700,1100,16,12.5,'#677B80');
  credit.text.get('원문/이용조건').link={uri:'https://github.com/MySonIsSoldier/gunbeon-yeojido/blob/master/docs/submission/2026-round1/image-sources.md',isExternal:true};
 }

 await fs.writeFile(OUT+`/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await(await sl.export({format:'png',scale:1.5})).arrayBuffer()));
}
await(await PresentationFile.exportPptx(p)).save(OUT+'/candidate.pptx');
await fs.writeFile(OUT+'/final-inspect.ndjson',(await p.inspect({kind:'slide,textbox,table,image',maxChars:200000})).ndjson);
console.log('Created',p.slides.items.length,'slides');
