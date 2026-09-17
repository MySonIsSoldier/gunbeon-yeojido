import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const requireArtifact=createRequire(process.env.RUNTIME_NODE_MODULES ? path.join(process.env.RUNTIME_NODE_MODULES,'entry.cjs') : import.meta.url);
const {FileBlob,PresentationFile}=await import(requireArtifact.resolve('@oai/artifact-tool'));
const source=process.env.SUBMISSION_TEMPLATE_PATH || 'tmp/submission-assets/2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서 양식(작성용).pptx';
const OUT=process.env.SUBMISSION_BUILD_DIR || 'tmp/submission-v3';
await fs.mkdir(OUT,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const original=[...p.slides.items];
const C={ink:'#22383E',muted:'#647579',teal:'#246568',orange:'#D77B39',rule:'#D9E2E1',pale:'#F4F7F6',white:'#FFFFFF'};
const F='Pretendard', FB='Pretendard SemiBold';
const SCREEN='reports/qa/submission-2026-09-16/screens/';
const EXTRA='reports/qa/submission-2026-09-16/redesign/';
const map={search:SCREEN+'07-tourapi-search.png',itinerary:SCREEN+'30-ready-live-itinerary.png',conditions:SCREEN+'31-companion-conditions.png',comparison:SCREEN+'06-margin-comparison.png',adjusted:SCREEN+'35-adjustment-applied-undo.png',group:EXTRA+'03-group-plan.png',copy:EXTRA+'04-private-copy.png',complete:SCREEN+'40-consistent-completion-confirm.png',record:SCREEN+'41-consistent-completed-record.png',share:SCREEN+'54-matched-advice-preview.png',public:SCREEN+'55-matched-advice-public.png',suggest:SCREEN+'56-matched-advice-proposal.png',review:SCREEN+'57-matched-advice-owner-review.png',adopted:SCREEN+'59-matched-advice-adopted.png',accessibility:SCREEN+'24-live-accessibility.png',map:SCREEN+'25-live-kakao-itinerary.png',weather:EXTRA+'01-live-weather.png',sources:EXTRA+'02-dmz-memorial-sources.png'};
const usedImages=[], usedTexts=[];
function text(sl,v,x,y,w,h,size=24,weight='regular',color=C.ink,align='left'){
 usedTexts.push({slideId:sl.id,text:v,x,y,w,h,size,weight});
 const sh=sl.shapes.add({geometry:'textbox',name:v.replace(/\n/g,' ').slice(0,48),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=v;sh.text.style={typeface:weight==='regular'?F:FB,fontSize:size,color,alignment:align,verticalAlignment:'top',autoFit:'none',wrap:'none',insets:{left:0,right:0,top:0,bottom:0}};return sh;
}
function rule(sl,x,y,w,color=C.rule){sl.shapes.add({geometry:'line',name:'section divider',position:{left:x,top:y,width:w,height:0},fill:'none',line:{fill:color,width:1}});}
function clear(sl){for(const t of [...sl.tables.items])sl.tables.deleteById(t.id);for(const sh of [...sl.shapes.items])sh.delete();for(const im of [...sl.images.items])im.delete();}
function cell(t,r,c,v,size=23,weight='regular',color=C.ink,fill=C.white){let o=t.getCell(r,c);o.paragraphs.clear();o.value=v;o.fill=fill;o.text.style={typeface:weight==='regular'?F:FB,fontSize:size,color,alignment:'left',verticalAlignment:'middle',autoFit:'none',wrap:'none'};o.margins={left:18,right:18,top:12,bottom:12};return o;}
function table(sl,values,x,y,width,rowHeights,columns){const t=sl.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width,height:rowHeights.reduce((a,b)=>a+b,0),columnWidths:columns,values});t.styleOptions={headerRow:false,bandedRows:false,firstColumn:false};t.borders.assign({style:'solid',fill:C.rule,width:1});t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).borders=Object.fromEntries(['top','bottom','left','right'].map(edge=>[edge,{style:'solid',color:C.rule,width:0.8}]));for(let r=0;r<values.length;r++){t.rows[r].height=rowHeights[r];t.cells.block({row:r,column:0,rowCount:1,columnCount:values[0].length}).borders={bottom:{color:C.rule,width:0.8}};for(let c=0;c<values[r].length;c++)cell(t,r,c,values[r][c]);}return t;}
async function pic(sl,key,x,y,w,h,crop){const file=map[key]||key;const bytes=await fs.readFile(file);let frame={left:x,top:y,width:w,height:h};if(crop){const sw=bytes.readUInt32BE(16)*(1-crop.left-crop.right),sh=bytes.readUInt32BE(20)*(1-crop.top-crop.bottom),scale=Math.min(w/sw,h/sh);frame={left:x+(w-sw*scale)/2,top:y+(h-sh*scale)/2,width:sw*scale,height:sh*scale};}const options={blob:new Uint8Array(bytes),contentType:'image/png',alt:key,fit:crop?'cover':'contain',position:frame};if(crop)options.crop=crop;const im=sl.images.add(options);if(crop)im.crop=crop;usedImages.push({slideId:sl.id,key,file,frame,crop:crop||null});}
function steps(sl,items,{x=52,y=362,w=370,gap=69}={}){text(sl,'기능 흐름도',x,y-35,w,24,18,'semibold',C.muted);items.forEach((it,i)=>{const yy=y+i*gap;text(sl,String(i+1).padStart(2,'0'),x,yy,38,32,24,'semibold',C.teal);text(sl,it[0],x+52,yy,w-52,32,24,'semibold');if(it[1])text(sl,it[1],x+52,yy+33,w-52,30,20,'regular',C.muted);if(i<items.length-1)text(sl,'↓',x+6,yy+37,25,30,23,'regular',C.teal);});}
function feature(sl,n,name,part,desc){clear(sl);text(sl,'핵심 기능 '+String(n).padStart(2,'0'),52,126,380,25,19,'semibold',C.teal);text(sl,name,52,168,435,88,32,'semibold');if(part)text(sl,part,52,246,415,28,20,'regular',C.muted);text(sl,'기능 설명',52,292,350,24,18,'semibold',C.muted);text(sl,desc,52,326,418,106,23);}
function note(sl,v){sl.speakerNotes.textFrame.setText(v+'\n운영 서비스: https://gunbeon.gangwon.kr\n자료 근거: https://github.com/MySonIsSoldier/gunbeon-yeojido/tree/master/docs/submission/2026-round1\n사진 출처: ⓒ한국관광공사. 개별 외부 사진의 출처 및 이용조건은 동봉 IMAGE-SOURCES.md 참조.');}
const names=['관광정보 기반 일정 작성','동행 그룹 공동 계획','복귀 여유 비교·조정','출타 진행과 여행 기록','공개 장소 제안과 일정 반영'];
// 1. Official cover retained; only editable cells updated.
let t=original[0].tables.items[0];
cell(t,0,0,'팀 명',28,'semibold',C.white,'#FFAC00');cell(t,1,0,'서비스 명',28,'semibold',C.white,'#FFAC00');
cell(t,0,1,'우리아들이군인인데\n여행계획을준비했대',28,'semibold',C.ink,'#FFFCEE');cell(t,1,1,'군번여지도 강원:\n휴전선 밖 첫 하루',28,'semibold',C.ink,'#FFFCEE');
note(original[0],'2026 관광데이터 활용 공모전 ① 웹·앱 개발 부문 기능설명서.');
// 2. Required fields, with a clear service definition and problem structure.
let sl=original[1];clear(sl);
text(sl,'서비스명',52,132,150,26,19,'semibold',C.muted);text(sl,'군번여지도 강원: 휴전선 밖 첫 하루',225,126,1000,46,34,'semibold');
text(sl,'서비스 유형',52,193,150,27,19,'semibold',C.muted);text(sl,'웹 서비스 · 모바일 웹/PWA',225,187,550,34,25);text(sl,'gunbeon.gangwon.kr',880,191,335,34,23,'semibold',C.teal);
rule(sl,52,239,1160);
text(sl,'서비스 개요',52,270,150,28,19,'semibold',C.muted);text(sl,'장병과 동행자가 강원 여행을 함께 계획하고,\n개인 복귀 기준에 맞춰 일정을 조정하는 모바일 웹 서비스',225,264,1000,94,31,'semibold');
text(sl,'주제 선정 이유',52,397,160,30,19,'semibold',C.muted);
const reasons=[['제한된 출타 시간','이동·체류시간과 복귀 기준을 함께 고려해야 합니다.'],['서로 다른 동행 조건','부모·연인·친구와 도보 부담과 식사 선호를 조율해야 합니다.'],['분산된 여행 준비','관광정보 검색, 일정 공유, 장소 추천을 하나의 계획으로 연결합니다.']];
reasons.forEach((r,i)=>{const y=392+i*85;text(sl,r[0],225,y,310,34,25,'semibold',C.teal);text(sl,r[1],225,y+37,960,32,23);});
note(sl,'예선 제안서의 장병·가족 제한시간 관광 문제를 현재 구현 범위로 정리. 실제 군번·휴가증·작전·근무 정보나 GPS 자동 수집은 하지 않음.');
// 3. Five functions with separated number, title, and result columns.
sl=original[2];clear(sl);text(sl,'서비스 핵심기능',52,128,850,40,29,'semibold');
const summaries=['관광정보 검색·장소 추가·순서와 체류시간 편집','초대코드로 공동 일정을 준비하고 개인 사본으로 가져오기','장소 생략·체류시간 변경에 따른 복귀 여유와 도보량 비교','현재 출타 확인·방문 장소 선택·기록 수정과 계획 복원','관광지별 추가·교체·생략 제안을 검토해 실제 일정에 반영'];
const vals=names.map((n,i)=>[String(i+1).padStart(2,'0'),n,summaries[i]]);
t=table(sl,vals,52,195,1160,[89,89,89,89,89],[74,415,671]);
for(let r=0;r<5;r++){cell(t,r,0,vals[r][0],29,'semibold',C.teal);cell(t,r,1,vals[r][1],26,'semibold');cell(t,r,2,vals[r][2],23);}
note(sl,'핵심 기능은 5개. 상세 흐름도에서 같은 명칭을 사용하며 복잡한 기능만 두 쪽으로 나눔.');
// 4. One representative image and three legible principal screens.
sl=original[3];clear(sl);text(sl,'서비스 대표 이미지',52,127,320,32,24,'semibold');
await pic(sl,'assets/brand-kit/v1/representative-1200x630.png',52,192,295,155);
text(sl,'군번여지도 강원',52,392,340,38,28,'semibold',C.teal);text(sl,'장병·가족·연인·친구의\n강원 여행 계획',52,443,340,90,26);
text(sl,'서비스 상세 이미지',405,127,700,32,24,'semibold');
for(const [i,v]of [['itinerary','일정 보기'],['comparison','복귀 여유 비교'],['public','장소 제안']].entries()) {await pic(sl,v[0],408+i*274,180,244,464);text(sl,v[1],408+i*274,662,244,27,22,'semibold',C.ink,'center');}
note(sl,'대표 로고 B 다시 만나는 길. 실제 화면 3개: 일정표, 여유 비교, 공개 제안. 모두 운영 UI이며 예시 여행은 기능 확인용. 사진: ⓒ한국관광공사.');
// 5. Gangwon specificity, exact required roles retained.
sl=original[4];clear(sl);text(sl,'특화 지역명',52,130,230,30,20,'semibold',C.muted);text(sl,'강원특별자치도 접경 5군',270,122,900,46,34,'semibold');
text(sl,'철원 · 화천 · 양구 · 인제 · 고성',270,181,900,40,29,'semibold',C.teal);text(sl,'춘천·속초는 가족 방문과 이동의 관문도시로 활용',270,237,950,36,24);rule(sl,52,294,1160);
text(sl,'구현 내용',52,331,180,30,20,'semibold',C.muted);
const regions=[['지역별 탐색','접경 5군 추천 코스와 관광공사 장소 검색'],['방문 준비','운영·예약·편의시설 정보를 확인하고 일정에 반영'],['반복 방문','동행 그룹의 여러 여행과 강원 5개 장의 방문 기록']];
regions.forEach((r,i)=>{text(sl,r[0],270,322+i*94,240,34,25,'semibold',C.teal);text(sl,r[1],270,364+i*94,900,33,24);});
text(sl,'대표 여행',52,626,180,32,20,'semibold',C.muted);text(sl,'철원: 고석정·호국 장소·식사    /    고성: 왕곡마을·송지호',270,620,940,45,24,'semibold');
note(sl,'특화 광역은 강원특별자치도 하나. 장소 운영·예약 조건 확인 근거는 place-verification.md. 현장 사용 성과나 기관 협약이 체결되었다고 주장하지 않음.');
// Eight flow pages for five features. Only the permitted flow layout is duplicated.
const flows=[original[5]];for(let i=1;i<8;i++){const d=original[5].duplicate();d.moveTo(5+i);flows.push(d);}
// 6. Place search and travel draft.
sl=flows[0];feature(sl,1,names[0],'2/3 · 장소 검색과 코스 구성','추천 코스를 가져오거나 빈 일정에서\n시작해 관광지·음식점·숙박을\n검색하고 추가합니다.');
steps(sl,[['출발 권역 선택','강원 7개 권역에서 장소 탐색'],['관광정보 검색','장소명·유형으로 후보 확인'],['일정에 추가','직접 입력한 장소도 추가 가능']],{y:465,gap:69});
text(sl,'관광정보 검색 · 실제 장소 추가',565,130,645,30,23,'semibold');
await pic(sl,'search',565,188,600,465,{left:0,right:0,top:0.219,bottom:0.148});
note(sl,'KorService2/searchKeyword2 실응답 검색 화면. 직접 입력 장소는 개인 일정용이며 공개 한 수에서 제외.');
// 7. Read/edit separation.
sl=flows[1];feature(sl,1,names[0],'3/3 · 시간표 확인과 일정 편집','장소의 방문 순서와 머무는 시간을\n정하면 일정표에 반영됩니다.\n일정 보기와 편집 화면을 구분합니다.');
steps(sl,[['날짜·시간 설정','계획 시각을 기준으로 일정 계산'],['장소·체류시간 편집','순서를 바꾸고 동행 조건 입력'],['일정표 확인','시간·장소·이동 추정을 한 번에']],{y:465,gap:69});
text(sl,'동행 조건 입력',508,130,302,30,23,'semibold');text(sl,'저장한 일정 보기',890,130,324,30,23,'semibold');
await pic(sl,'conditions',500,182,300,464,{left:0,right:0,top:0.116,bottom:0.187});
text(sl,'→',828,375,44,45,34,'semibold',C.teal,'center');await pic(sl,'itinerary',873,176,309,485);
note(sl,'조건은 여행별 Entry.plan.conditions에 저장. 빈 일정 저장 가능. 계획 탐색은 현재 시각 기준이 아니며 현재 출타만 현재 시각 사용.');
// 8. Shared plan and personal copy.
sl=flows[2];feature(sl,2,names[1],'공동 일정과 개인 복귀 기준 분리','가족·연인·친구를 초대해 장소와\n시간을 함께 정합니다. 복귀 기준은\n각자의 개인 여행 사본에서 설정합니다.');
steps(sl,[['그룹 만들기·참여','초대코드로 동행자 연결'],['공동 일정 작성','그룹별로 여러 여행 관리'],['개인 사본 만들기','복귀 시각은 개인에게만 표시']],{y:465,gap:69});
text(sl,'그룹의 공동 일정',505,130,300,30,23,'semibold');text(sl,'나의 여행 사본',905,130,305,30,23,'semibold');
await pic(sl,'group',493,176,303,480,{left:0,right:0,top:0.15,bottom:0.078});text(sl,'→',827,375,45,45,34,'semibold',C.teal,'center');await pic(sl,'copy',891,178,314,478,{left:0,right:0,top:0.427,bottom:0.011});
note(sl,'새 게스트2명의 실제 초대/참여와 공동 일정1개를 촬영. 동일 일정의 개인 사본을 확인하고 임시 그룹만 삭제. 캡처 근거: redesign/meta.json. 초대는 게스트도 코드로 참여할 수 있음. 공동 원본과 개인 사본은 자동 동기화되지 않으며 개인 복귀시각·출타 진행·방문 기록은 그룹에 자동 전송되지 않음.');
// 9. Return margin inputs, companion conditions enlarged.
sl=flows[3];feature(sl,3,names[2],'1/2 · 계획 시각과 동행 조건','출발·복귀 시각, 이동수단과\n동행자의 도보 시간을 설정해\n여행에 남길 여유를 계산합니다.');
steps(sl,[['계획 시각·수단 입력','출발 날짜와 이동수단 선택'],['동행 조건 입력','편안한 도보 시간·추가 여유'],['시간 여유 계산','개인 복귀 기준까지 남는 시간']],{y:465,gap:69});
text(sl,'여행별 동행 조건',635,132,550,34,24,'semibold');await pic(sl,'conditions',613,190,551,443,{left:0.035,right:0.035,top:0.221,bottom:0.185});
note(sl,'입력값과 거리 기반 이동시간에 따른 참고 추정. 도보 추정은 자체 기본자료이며 TourAPI의 실제 측정값이 아님. 실제 교통·소속 부대 규정은 별도 확인.');
// 10. Numerical comparison and user choice.
sl=flows[4];clear(sl);text(sl,'핵심 기능 03',52,126,550,27,19,'semibold',C.teal);text(sl,names[2],52,167,600,42,32,'semibold');text(sl,'2/2 · 조정 전후 비교와 적용',52,222,590,30,20,'regular',C.muted);
text(sl,'기능 설명',52,272,590,25,18,'semibold',C.muted);text(sl,'한 곳을 덜 들르거나 체류시간을 줄여\n복귀 여유와 도보량의 변화를 비교합니다.',52,309,590,82,25);
text(sl,'입력 조건·거리 기반 이동시간으로 계산한 예시',52,386,590,26,19,'regular',C.muted);
text(sl,'고석정 꽃밭 방문을 생략한 일정 조정 예시',52,415,580,30,22,'semibold',C.teal);
t=table(sl,[['비교 항목','현재 계획','조정안'],['방문 장소','3곳','2곳'],['도보 추정','30분','15분'],['복귀 여유','+119분','+192분']],52,462,555,[40,45,45,54],[195,180,180]);
for(let r=0;r<4;r++)for(let c=0;c<3;c++){const o=cell(t,r,c,t.getCell(r,c).value,r===3?27:22,r===0||r===3?'semibold':'regular',r===3?C.teal:C.ink,r===0?C.pale:C.white);o.margins={top:6,bottom:6,left:16,right:16};}
text(sl,'조정안 선택 → 비교 → 적용 → 저장',52,670,600,30,22,'semibold');
text(sl,'조정안 비교·적용 화면',692,132,510,31,23,'semibold');await pic(sl,'comparison',688,179,494,479,{left:0.045,right:0.045,top:0.34,bottom:0.129});
note(sl,'동일 합성 예시의 추정 비교: +119→+192분(+73분), 도보30→15분. 실제 이동시간 절감 성과가 아님. 06→35→36→37 조정 적용/되돌리기 실검사. 되돌리기는 편집 중 저장 전 적용 가능하며 영구 저장 후 undo를 제공한다고 쓰지 않음.');
// 11. Completion and record. Enlarged crops show the same visited places.
sl=flows[5];feature(sl,4,names[3],'실제 다녀온 장소로 하루 기록','출발 후에는 현재 시각으로 일정을\n확인합니다. 완료할 때 방문 장소와\n스탬프를 선택해 기록을 남깁니다.');
steps(sl,[['현재 출타 시작','오늘의 복귀 기준을 직접 확인'],['여행 완료 확인','실제 다녀온 장소·스탬프 선택'],['여행 기록 관리','수정·공유·새 계획으로 복원']],{y:465,gap:69});
text(sl,'여행 완료 확인',498,130,307,31,23,'semibold');text(sl,'비무장 패스포트 기록',879,130,355,31,23,'semibold');
await pic(sl,'complete',491,177,310,482,{left:0.12,right:0.12,top:0.07,bottom:0.06});text(sl,'→',821,375,45,45,34,'semibold',C.teal,'center');await pic(sl,'record',872,182,325,470,{left:0.047,right:0.047,top:0.265,bottom:0.15});
note(sl,'40→41 실제 완료 동작으로 같은 관광지3곳과 입경/복귀/동행3스탬프 저장. 방문 기록은 사용자 확인이며 GPS 인증이 아님. 공유 카드에 개인 복귀 시각·상세 좌표·직접 입력 장소가 포함되지 않음.');
// 12. Share boundary and actionable proposal.
sl=flows[6];feature(sl,5,names[4],'1/3 · 공개할 장소와 질문 선택','여행의 관광지와 질문을 링크로\n공유합니다. 방문자는 장소의 추가·\n교체·생략을 구체적으로 제안합니다.');
steps(sl,[['공개 범위 선택','관광지와 질문만 골라 공유'],['SNS·메신저로 전달','개인 복귀 정보는 공개하지 않음'],['장소 단위로 제안','관광정보 검색으로 후보 선택']],{y:465,gap:69});
text(sl,'공개할 장소 확인',498,130,316,31,23,'semibold');text(sl,'방문자의 교체 제안',900,130,322,31,23,'semibold');
await pic(sl,'share',491,182,315,473,{left:0.028,right:0.028,top:0.23,bottom:0.272});text(sl,'→',824,375,44,45,34,'semibold',C.teal,'center');await pic(sl,'suggest',884,184,320,471,{left:0.02,right:0.02,top:0,bottom:0.12});
note(sl,'54→56은 같은 공개 링크. 방문자가 실제 TourAPI 검색으로 삼부연폭포를 선택. 로그인 없이 공개 제안 가능하며 원본 개인 계획을 직접 변경할 수 없음.');
// 13. Actual adoption, not a comment counter.
sl=flows[7];feature(sl,5,names[4],'2/3 · 작성자 검토와 실제 일정 반영','작성자가 제안을 검토하고 일정을\n저장하면 반영 완료로 표시됩니다.\n방문자는 공개안으로 새 여행을 만듭니다.');
steps(sl,[['받은 제안 확인','추가·교체할 장소와 이유 확인'],['내 일정에서 검토','변경할 장소·순서를 직접 확인'],['저장 후 반영 표시','실제 저장 결과를 방문자에게 안내']],{y:465,gap:69});
text(sl,'작성자에게 도착한 제안',511,130,370,31,23,'semibold');text(sl,'방문자가 보는 반영 결과',913,130,314,31,23,'semibold');
await pic(sl,'review',492,205,366,407,{left:0.035,right:0.035,top:0.52,bottom:0.075});text(sl,'→',848,375,40,45,32,'semibold',C.teal,'center');await pic(sl,'adopted',900,179,305,479,{left:0.024,right:0.024,top:0,bottom:0.11});
note(sl,'57→58→59 동일 링크의 실제 제안 검토, 개인 계획 저장, adopt API200 확인. 여행 완료나 현장 방문과 무관한 제안 반영 상태.');
// 14. Two actual KTO services. No empty API rows.
sl=original[6];clear(sl);text(sl,'API명',52,131,250,30,20,'semibold',C.muted);text(sl,'상세설명 · 서비스 활용',368,131,580,30,20,'semibold',C.muted);text(sl,'적용 화면',938,131,275,30,20,'semibold',C.muted);rule(sl,52,177,1160);
text(sl,'국문 관광정보\n서비스_GW',52,204,290,82,28,'semibold',C.teal);text(sl,'KorService2',52,302,285,28,19,'regular',C.muted);
text(sl,'장소명·주소·좌표·사진·운영정보',368,203,544,34,25,'semibold');text(sl,'관광지·음식점·숙박 등 장소 검색\n선택한 장소로 일정표와 지도 구성\n좌표를 이용해 이동시간 추정',368,257,550,114,24);
await pic(sl,'search',930,195,282,207,{left:0.045,right:0.045,top:0.395,bottom:0.271});
rule(sl,52,424,1160);
text(sl,'무장애 여행 정보',52,458,303,42,28,'semibold',C.teal);text(sl,'KorWithService2',52,512,300,30,19,'regular',C.muted);
text(sl,'주차·접근로·휠체어·편의시설',368,456,560,38,25,'semibold');text(sl,'장소별 동행 편의정보 확인\n부모·가족의 방문 조건 검토\n이용 가능한 시설 안내를 상세에 표시',368,511,550,114,24);
await pic(sl,'accessibility',918,453,294,198,{left:0.045,right:0.045,top:0.541,bottom:0.218});
note(sl,'실제 서비스 수는2개. KorService2:ldongCode2,areaBasedList2,searchKeyword2,detailCommon2,detailIntro2. KorWithService2:ldongCode2,areaBasedList2,detailWithTour2. 국문좌표가 이동추정, 운영·무장애정보는 사용자 방문판단에 쓰임. firstimage 사용, detailImage2는 미사용. 집중률/중심/연관API는 표본검증만 해 실사용목록에서 제외. 증거 reports/qa/submission-2026-09-16/live-api.json. 출처: ⓒ한국관광공사.');
// 15. Actual supplementary sources, with matching data screens.
sl=original[7];clear(sl);
const others=[['접경지역 관광 자료','통일부 DMZ 관광·카페 파일\n국가보훈부 현충시설 수집본','관광·휴식·호국 장소의\n기본 후보를 구성합니다.'],['기상청 단기예보','getVilageFcst','권역의 8시간 예보를 확인합니다.\n사용자가 선택한 날씨 조건을\n일정 여유에 반영합니다.'],['카카오맵','JavaScript SDK · 외부 길찾기','여행 장소와 순서를 지도에서 확인하고\n상세 길찾기로 연결합니다.']];
others.forEach((v,i)=>{const x=52+i*400;text(sl,v[0],x,135,375,42,28,'semibold',C.teal);text(sl,'데이터명',x,202,360,25,17,'semibold',C.muted);text(sl,v[1],x,239,374,63,22);text(sl,'상세설명',x,326,360,25,17,'semibold',C.muted);text(sl,v[2],x,365,375,80,22);});
await pic(sl,'sources',52,463,361,98,{left:0.041,right:0.041,top:0.272,bottom:0.61});
await pic(sl,'sources',52,571,361,96,{left:0.041,right:0.041,top:0.496,bottom:0.391});
await pic(sl,'weather',452,458,365,212,{left:0.047,right:0.047,top:0.617,bottom:0.184});
await pic(sl,'map',852,459,360,212,{left:0.02,right:0.02,top:0.585,bottom:0.078});
note(sl,'통일부/보훈 기본자료는 API 성공 응답을 대체한 모의자료가 아니라 출처가 있는 파일·수집 자료. 기상청은 시군청 대표격자8시간 예보; 자동 모든날짜보정 아님. 카카오지도는 위치표시와외부길찾기. 자체 이동추정에 카카오 실시간 교통시간을 쓴다고 주장하지 않음. 새 실제스크린샷 reports/qa/submission-2026-09-16/redesign.');
// 16. Distinct working mechanisms and an evidence-oriented development plan.
sl=original[8];clear(sl);text(sl,'차별성',52,125,1000,34,23,'semibold',C.teal);
const dif=[['공동 일정과 개인 기준의 분리','함께 장소를 정하고, 복귀 시각은\n개인 사본에서 관리합니다.'],['조정 가능한 복귀 여유','관광지를 생략하거나 체류를 줄여\n여유와 도보량을 비교합니다.'],['추천을 일정 변경으로 연결','장소 제안을 검토·저장한 뒤\n반영 결과를 제안자에게 보여줍니다.']];
dif.forEach((v,i)=>{const x=52+i*400;text(sl,String(i+1).padStart(2,'0'),x,186,56,42,29,'semibold',C.orange);text(sl,v[0],x,244,375,36,26,'semibold');text(sl,v[1],x,293,375,74,23);});
rule(sl,52,398,1160);text(sl,'발전계획',52,433,1000,34,23,'semibold',C.teal);
const future=[['사용성 검증','장병·동행자의 계획·초대·조정 관찰','확인 지표  공동 계획 완료율'],['강원 정보 고도화','접경 5군 운영·예약·편의정보 갱신','확인 지표  정보 확인율·API 성공률'],['지역 실증·재방문','관광지·식사·휴식 장소의 연계 평가','확인 지표  제안 반영률·재사용률']];
future.forEach((v,i)=>{const x=52+i*400;text(sl,'0'+(i+1),x,500,44,32,23,'semibold',C.orange);text(sl,v[0],x+60,496,320,38,27,'semibold');if(i<2)text(sl,'→',x+355,499,36,34,29,'regular',C.muted);text(sl,v[1],x,557,375,66,22);text(sl,v[2],x,644,375,28,19,'semibold',C.teal);});
note(sl,'발전계획은 향후 검증안. 현재 이용자 증가/관광소비 성과나 확정기관제휴를 의미하지 않음. 초대→공동계획→공개제안→새여행복사→재사용을 관찰하며 성장가설을 검증할 계획.');
// Supporting capabilities remain inside the five main function flows.
const NEW='reports/qa/tester-social/scenarios/';
sl=original[5].duplicate();sl.moveTo(5);
feature(sl,1,names[0],'1/3 · 로그인과 예시 여행 체험','Google·네이버로 내 여행을 시작하거나,\n민준의 휴가를 따라 체험합니다.\n준비된 일정에서 장소·시간을 바꿉니다.');
steps(sl,[['시작 방식 선택','개인 계정 로그인 또는 민준 체험'],['준비된 여행 확인','계획 4개 · 그룹 3개 · 기록 1개'],['기능 화면에서 직접 실행','5단계 가이드에서 바로 이동']],{y:465,gap:69});
text(sl,'로그인과 체험 시작',510,130,333,30,23,'semibold');
text(sl,'민준의 단계별 체험 가이드',890,130,330,30,23,'semibold');
await pic(sl,NEW+'01-login.png',502,178,322,432);
await pic(sl,NEW+'03-guide.png',878,178,324,432);
text(sl,'개인 계정에서 로그인 수단 연결',505,636,363,50,19,'semibold',C.teal);
text(sl,'가상 인물 · 테스터별 별도 사본',879,636,337,50,19,'semibold',C.teal);
note(sl,'로그인/체험은 부가·편의 기능이며 핵심 기능 1의 진입 흐름이다. Google/Naver 실로그인·복원은 9/15 운영 검증과 사용자 승인 완료 확인에 근거한다. 이번 촬영은 제공자 동의를 새로 수행한 증거가 아니다. 민준과 동행자는 가상 인물. 예시 사본은 개인 소셜계정 연결·실제 그룹초대를 제공하지 않음. 가이드 체크는 사용자의 수동 표시. reports/tester-social-delivery.md 참조.');
sl=original[5].duplicate();sl.moveTo(14);
feature(sl,5,names[4],'3/3 · SNS 이미지와 참여 링크','계획·기록·반영한 제안을\n스토리·피드 이미지로 만듭니다.\n링크와 QR로 다음 제안을 받습니다.');
steps(sl,[['형식과 색 선택','스토리 9:16 · 피드 4:5'],['PNG 저장·이미지 공유','지원 기기의 공유창 이용'],['공개안으로 참여 연결','링크 스티커 또는 QR로 제안']],{y:465,gap:69});
text(sl,'이번 휴가 한 장',532,132,295,30,23,'semibold');
text(sl,'고성 · 별도 체험 예시',918,132,296,30,23,'semibold');
await pic(sl,NEW+'04-story.png',518,182,290,485);
await pic(sl,NEW+'08-impact.png',899,182,290,485);
note(sl,'실제 앱에서 다운로드한 1080×1920 PNG. 왼쪽은 가상 체험 계획, 오른쪽은 방문자의 실제 제안→개인계획 저장→반영 표시를 거친 가상 여행의 공유 카드다. 현장 여행 성과가 아니다. 현재 출타는 사용자가 선택할 때 카드 생성 시점의 약 N시간을 표시하며 자동 갱신되지 않는다. 정확한 시각·만남장소·개인일정 제목·좌표는 제외. SNS 게시 완료는 사용자가 대상 앱에서 실행. 사진은 KTO 제공 원본 비율 유지, 출처표시. QR 링크는 촬영 후 삭제한 검증용 링크이므로 심사 시 새 공유안을 생성한다.');

// Page numbers only; no production date/provenance footer fragments.
for(let i=1;i<p.slides.items.length;i++)text(p.slides.items[i],String(i+1).padStart(2,'0'),1222,696,30,17,12,'regular',C.muted,'right');
for(let i=0;i<p.slides.items.length;i++){
 const slide=p.slides.items[i];
 await fs.writeFile(path.join(OUT,'slide-'+String(i+1).padStart(2,'0')+'.png'),new Uint8Array(await(await slide.export({format:'png',scale:1.5})).arrayBuffer()));
}
await(await PresentationFile.exportPptx(p)).save(path.join(OUT,'candidate.pptx'));
await fs.writeFile(path.join(OUT,'images.json'),JSON.stringify(usedImages.map(e=>({...e,slide:p.slides.items.findIndex(s=>s.id===e.slideId)+1})),null,2));
await fs.writeFile(path.join(OUT,'text-metrics.json'),JSON.stringify(usedTexts.map(e=>({...e,slide:p.slides.items.findIndex(s=>s.id===e.slideId)+1})),null,2));
execFileSync(process.env.RUNTIME_PYTHON || 'python3',['scripts/submission/restore-native-layout.py',path.join(OUT,'candidate.pptx'),path.join(OUT,'images.json')],{stdio:'inherit'});
await fs.writeFile(path.join(OUT,'inspect.ndjson'),(await p.inspect({kind:'slide,textbox,table,image',maxChars:220000})).ndjson);
console.log('Created',p.slides.items.length,'slides');
