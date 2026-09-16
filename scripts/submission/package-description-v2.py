"""Package the visually reviewed v2 deck; preserve the historical v1 kit."""
from pathlib import Path
from datetime import datetime, timezone
from zipfile import ZipFile, ZIP_DEFLATED
from pypdf import PdfReader
from PIL import Image
from lxml import etree
import hashlib, json, re, shutil

root=Path.cwd();build=root/'tmp/submission-redesign'
out=root/'output/submission/2026-round1-v2'
pdf=root/'output/pdf/gunbeon-2026-round1-functions-v2.pdf'
pptx=out/'gunbeon-2026-round1-functions-v2.pptx'
review_path=root/'reports/qa/submission-2026-09-16/description-v2-review.json'
review=json.loads(review_path.read_text())
assert review['pagesReviewed']==list(range(1,17)) and review['status']=='passed'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def info(p):return {'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':sha(p)}
def dump(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert review['pdfSha256']==sha(pdf) and review['pptxSha256']==sha(pptx)
reader=PdfReader(pdf);assert len(reader.pages)==16 and pdf.stat().st_size<10_000_000
flat='\n'.join(p.extract_text() for p in reader.pages)
for forbidden in ['가이드 박스','YOUR_API','sample text','서로 다른 근거를 같은 확정값','화면: 9/16']:
 assert forbidden not in flat,forbidden
assert 'KorService2' in flat and 'KorWithService2' in flat
shutil.copy2(pdf,out/pdf.name)
images=out/'images';images.mkdir(exist_ok=True)
entries=[('representative-1200x630.png','대표 이미지','assets/brand-kit/v1/representative-1200x630.png'),('detail-01-itinerary.png','일정 보기','reports/qa/submission-2026-09-16/screens/30-ready-live-itinerary.png'),('detail-02-margin.png','복귀 여유 비교','reports/qa/submission-2026-09-16/screens/06-margin-comparison.png'),('detail-03-advice.png','장소 제안','reports/qa/submission-2026-09-16/screens/55-matched-advice-public.png'),('logo-140.png','등록용 로고','assets/brand-kit/v1/logo-140.png')]
selected=[]
for name,title,source in entries:
 target=images/name;shutil.copy2(root/source,target)
 with Image.open(target) as im: dimensions={'width':im.width,'height':im.height}
 selected.append({'file':'images/'+name,'title':title,'source':source,**dimensions,**{k:v for k,v in info(target).items() if k!='path'}})
dump(out/'selected-images.json',{'date':'2026-09-16','screenshots':'Actual production UI, synthetic example trips, desktop Chromium 430x900 viewport; no API success mocks; not physical-device/field-visit evidence.','standaloneImages':selected,'deckImages':json.loads((build/'images.json').read_text()),'creditFile':'IMAGE-SOURCES.md'})
for src,dest in [('requirements.md','REQUIREMENTS.md'),('portal-copy.md','PORTAL-COPY.md'),('final-checklist.md','CHECKLIST.md'),('rehearsal.md','REHEARSAL.md'),('image-sources.md','IMAGE-SOURCES.md'),('editorial-review-v2.md','EDITORIAL-REVIEW.md')]:
 source=root/'docs/submission/2026-round1'/src
 def link(m):
  value=m.group(1)
  if re.match(r'https?://|#|mailto:',value):return m.group(0)
  file,sep,anchor=value.partition('#')
  rel=(source.parent/file).resolve().relative_to(root)
  return '](https://github.com/MySonIsSoldier/gunbeon-yeojido/blob/master/'+str(rel)+(sep+anchor if sep else '')+')'
 (out/dest).write_text(re.sub(r'\]\(([^)]+)\)',link,source.read_text()))
fontdir=out/'fonts';fontdir.mkdir(exist_ok=True)
for p in (root/'assets/document-fonts').iterdir():
 if p.suffix=='.otf' or p.name in ['OFL.txt','README.md']:shutil.copy2(p,fontdir/p.name)
(out/'README.md').write_text(f'''# 군번여지도 강원 · 1차 기능설명서 v2

**2026 관광데이터 활용 공모전 ① 웹·앱 개발 부문**. 마감 2026-09-21(월) 16:00 KST. 운영 v19/env5 기준. 자료 준비본이며 **최종 접수는 아직 하지 않았다.**

## 사용할 자료

| 파일 | 용도 |
|---|---|
| [gunbeon-2026-round1-functions-v2.pdf](gunbeon-2026-round1-functions-v2.pdf) | 제출용 기능설명서. 16쪽, {pdf.stat().st_size/1e6:.2f}MB, 10MB 이하 |
| [gunbeon-2026-round1-functions-v2.pptx](gunbeon-2026-round1-functions-v2.pptx) | 수정 가능한 편집 원본. 수정하면 PDF도 다시 내보내 검수 |
| images/representative-1200x630.png | 대표 이미지 1장 |
| images/detail-01 ~ detail-03 | 일정 보기·복귀 여유·공개 제안 상세 이미지 3장. 설명서 4쪽과 동일 |
| images/logo-140.png | 140×140 등록 로고 |
| fonts/ | PPTX 편집용 Pretendard 원본 OTF와 SIL OFL 라이선스 |
| [PORTAL-COPY.md](PORTAL-COPY.md) | 소개·핵심 기능·API·지역특화 접수 문구 |
| [CHECKLIST.md](CHECKLIST.md) | 최종 팀원·메일 인증·비공개 키 입력·접수 확인 |
| [REHEARSAL.md](REHEARSAL.md) | 팀 내부 핵심 5기능 시연안 |
| [REQUIREMENTS.md](REQUIREMENTS.md) | 공식 안내의 필수·선택 요건 |
| [IMAGE-SOURCES.md](IMAGE-SOURCES.md) | 실제 화면·사진·지도 출처 |
| [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md) | 심사 관점 검토와 v2 편집 결정 |
| validation.json / selected-images.json | 최종 크기·해시·검수·사용 이미지 목록 |

접수에는 **지정 PDF**를 사용한다. 대표·상세 이미지는 PDF 안에도 있다. ZIP/PPTX/이미지 모두 필수 업로드라는 뜻은 아니다. 별도 이미지 칸이 있을 때 해당 PNG를 사용한다. 공식 안내에서 별도 시연 영상 필수 조건은 확인하지 못했다.

## v2 개정 내용

- 공식 표지·섹션·필수 항목을 보존하고 본문을 Pretendard로 정리했다.
- 핵심 기능은 5개, 흐름도는 8쪽이다. 주요 화면을 1~2개씩 확대하고 입력→행동→결과를 설명했다.
- 관광공사 실사용 API 2종의 빈 행을 제거하고 국문·무장애 데이터의 쓰임과 실제 화면을 배치했다.
- 기타 데이터는 통일부·보훈부 자료, 기상청 예보, 카카오맵의 적용 화면으로 설명했다.
- 차별성 3개와 발전계획 3단계를 구분했다. 반복 검수일·출처 문구·불필요한 경고형 문장을 제거했다.

PDF에는 Pretendard가 포함돼 별도 폰트 설치 없이 열 수 있다. PPTX를 다른 PC에서 편집할 때는 fonts/의 OTF를 먼저 설치한다. 캡처의 내용은 변경하지 않고 필요한 영역만 PowerPoint의 자르기로 확대했다. 앱 사진의 출처 표시와 카카오 지도 표기는 유지했다.

## 접수 순서

1. [공식 참가자 안내](https://lowly-polyanthus-1fb.notion.site/2026-36b5dce406e380e0a3d1f80525667a11) 최신 내용을 재확인한다.
2. [한국관광콘텐츠랩](https://api.visitkorea.or.kr)의 기존 신청 계정에서 이메일 인증·최종 팀원을 확인한다.
3. https://gunbeon.gangwon.kr · 웹 서비스 · 강원특별자치도 지역특화 · 국문/무장애 API 2종을 입력한다.
4. 실제 신청자의 키와 지정 일반 심사 계정은 **비공개 지정란**에만 입력한다.
5. v2 PDF의 파일명·16쪽 미리보기를 확인하고 최종 제출한다. 접수 증빙을 따로 보관한다.

화면은 운영 서비스의 실제 UI이며 여행·그룹·기록은 기능 확인용 합성 예시다. 실제 방문 인증·이용자 성과를 뜻하지 않는다. 복귀 여유는 입력 조건과 거리 기반 참고 추정이다. 촬영용 임시 공유 리소스는 정리했으므로 시연 시 새 링크를 만든다.
''')
source=root/'tmp/submission-assets/2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서 양식(작성용).pptx'
with ZipFile(source) as z:source_media={hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('ppt/media/')}
with ZipFile(pptx) as z:
 final_media={hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('ppt/media/')}
 slides=[n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)]
 tables={str(int(re.search(r'slide(\d+)',n).group(1))):len(etree.fromstring(z.read(n)).findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}tbl')) for n in slides}
 assert len(slides)==16 and all(tables[str(i)]>=1 for i in [1,3,10])
receipt=json.loads((build/'final-validation-v2.json').read_text());export=json.loads((build/'pdf-export-v2.json').read_text())
validation={'preparedAt':datetime.now(timezone.utc).isoformat(),'revision':'v2','competitionTrack':'① 웹·앱 개발 부문','deadline':'2026-09-21T16:00:00+09:00','applicationSubmitted':False,'production':{'url':'https://gunbeon.gangwon.kr','version':'v19/env5','sourceSha':'9790ac308766aecae662e71d7bdc0e2b5050fb38','deployedDuringThisTask':False},'pdf':{**info(pdf),'pages':16,'under10MB':True,'exportedFromFinalPptxSha':sha(pptx),'allTextFontsEmbedded':export['allFontsEmbedded'],'fontFamilies':['Pretendard Regular','Pretendard SemiBold']},'pptx':{**info(pptx),'slides':16,'nativeTableCounts':tables,'packageIntegrity':receipt['packageIntegrity']['status'],'artifactToolReimportPassed':receipt['firstPartyImport']['passed'],'fontPolicyPassed':receipt['fontSelection']['passed']},'template':{'sha256':sha(source),'originalSlides':9,'flowSlidesExpandedTo':8,'originalMediaCount':len(source_media),'byteIdenticalRetainedMediaCount':len(source_media & final_media),'requiredSectionsPreserved':True},'visualReview':review,'images':{'representative':1,'details':3,'logo140':1,'manifest':'selected-images.json','creditFile':'IMAGE-SOURCES.md'},'evidence':{'api':'reports/qa/submission-2026-09-16/live-api.json','screens':'reports/qa/submission-2026-09-16/screens/meta.json','newScreens':'reports/qa/submission-2026-09-16/redesign/meta.json','noApiMocks':True,'notPhysicalDeviceTesting':True},'remaining':['Final team members and applicant email confirmation','Actual phone final rehearsal','Private API key/account fields and final portal submission','Submission receipt retention','Hosting/database recovery owner confirmation']}
dump(out/'validation.json',validation)
archive=root/'output/submission/gunbeon-2026-round1-kit-v2.zip'
with ZipFile(archive,'w',ZIP_DEFLATED,compresslevel=9) as z:
 for file in sorted(out.rglob('*')):
  if file.is_file():z.write(file,'gunbeon-2026-round1-v2/'+str(file.relative_to(out)))
with ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'pdf':info(pdf),'pptx':info(pptx),'zip':info(archive),'templateMediaPreserved':validation['template'],'filesInKit':len([p for p in out.rglob('*') if p.is_file()])},ensure_ascii=False,indent=2))
