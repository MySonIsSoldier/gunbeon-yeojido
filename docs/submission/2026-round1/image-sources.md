# 제출 이미지 출처와 이용조건

2026-09-16. 기능설명서와 이미지 키트의 화면은 **운영 서비스 gunbeon.gangwon.kr**에서 촬영한 실제 UI다. 여행·그룹·기록은 기능 확인을 위한 **합성 예시**이며 실제 이용자 활동이나 현장 방문 인증이 아니다. 화면 크기는 데스크톱 Chromium의 430×900 모바일 viewport 모의이며 실물 휴대폰 검사와 구분한다.

API 응답을 가로채거나 성공 응답을 만들어 넣지 않았다. 촬영에 사용한 새 게스트의 개인 여행은 localStorage에만 넣었다. 그룹·공개 제안은 정상 서버 API로 생성하고 촬영 뒤 해당 임시 리소스만 종료/삭제했다. 지정 심사 계정의 예시를 변경하거나 초기화하지 않았다. 촬영 시각·성공/실패·로딩 전 제외 화면은 [기존 촬영 메타데이터](../../../reports/qa/submission-2026-09-16/screens/meta.json), v2 기타 데이터 추가 화면은 [추가 촬영 메타데이터](../../../reports/qa/submission-2026-09-16/redesign/meta.json)를 따른다. 최종 사용 목록은 v2 키트 확정 후 `output/submission/2026-round1-v2/selected-images.json`에서 확인한다.

## v2 대표·상세 화면 구성

[v2 기능설명서](../../../output/pdf/gunbeon-2026-round1-functions-v2.pdf)는 16쪽, 핵심 기능 5개·상세 흐름도 8쪽으로 구성한다. 대표 이미지는 아래 브랜드 이미지 1개이며, 4쪽의 상세 이미지는 다음 3개다. 공식 주요 화면 3~5개 조건 안에서 선택했다.

| 상세 화면 | 실제 원본 캡처 |
|---|---|
| 일정 보기 | [30-ready-live-itinerary.png](../../../reports/qa/submission-2026-09-16/screens/30-ready-live-itinerary.png) |
| 복귀 여유 비교 | [06-margin-comparison.png](../../../reports/qa/submission-2026-09-16/screens/06-margin-comparison.png) |
| 공개 장소 제안 | [55-matched-advice-public.png](../../../reports/qa/submission-2026-09-16/screens/55-matched-advice-public.png) |

상세 흐름도와 데이터 활용 페이지에는 필요한 실제 화면을 추가로 사용한다. v2는 화면 전체 표시와 핵심 영역 확대를 구분하며, 확대용 크롭은 원본 화면의 값·문구·동작 결과를 바꾸지 않는다. 기상청 예보와 통일부·보훈부 출처 화면은 `reports/qa/submission-2026-09-16/redesign/`에 있다. PDF만 열어도 필요한 출처를 찾을 수 있도록 공개 출처 문서 링크 또는 해당 크레딧을 남기며, 발표 노트만으로 대체하지 않는다.

8쪽의 동행 그룹 화면은 새 체험 세션 2개로 정상 UI·서버 API를 사용해 촬영했다. 임시 그룹 생성(201) → 여행 1개 공유 → 초대 생성(200) → 두 번째 체험 사용자의 초대 참여(200)를 거쳐 **참여자 2명·여행 1개**를 확인했다. [03-group-plan.png](../../../reports/qa/submission-2026-09-16/redesign/03-group-plan.png)는 이 공동 여행이며, [04-private-copy.png](../../../reports/qa/submission-2026-09-16/redesign/04-private-copy.png)는 같은 여행을 개인 사본으로 가져온 **저장 전 화면**이다. 개인 복귀 시각은 빈값에서 별도로 정하도록 표시됐으며, 이 캡처를 개인 사본 저장 완료의 증거로 쓰지 않는다.

촬영 후 이번에 만든 임시 그룹만 삭제(200)하고 조회에서 사라졌음을 확인했다. 지정 심사 계정과 기존 예시는 변경하지 않았고, API 모의 응답이나 초대 토큰을 증빙에 넣지 않았다. [추가 촬영 메타데이터](../../../reports/qa/submission-2026-09-16/redesign/meta.json)의 `groupCapture`에 이 과정이 기록되어 있다. 같은 파일의 기본 `screens`에 있는 기상·데이터 출처 2장과 합쳐 추가 캡처는 총 4장이다.

## 대표 이미지·로고

- 사용자 확정 B안 **‘다시 만나는 길’**, 팀의 [브랜드 키트](../../../assets/brand-kit/README.md).
- 대표 이미지 1200×630, 등록 로고 140×140. 기존 확정본을 사용하며 왜곡하지 않는다.
- 브랜드 글꼴 Pretendard Variable 1.3.9, SIL Open Font License. 원본과 라이선스는 브랜드 키트 source/에 있다.
- v2 문서 본문은 Pretendard 1.3.9 Regular/SemiBold를 사용한다. 문서용 OTF 원본과 SIL Open Font License는 [문서 글꼴 안내](../../../assets/document-fonts/README.md)에 있다. 최종 PDF의 글꼴 포함·표시 여부는 별도 검수에서 확인한다.
- 대표 이미지의 초기 콘셉트에 이미지 생성 도구를 이용했고 최종 로고는 SVG로 정리했다. 실물 사진·관광공사 CI를 로고로 사용하지 않았다.

## 실제 화면에 포함된 관광 사진

관광 정보와 사진 권리는 구분한다. 화면 캡처에 포함된 사진의 크기는 앱 카드에 맞춰 축소·크롭되었다. 사진 전체를 임의로 개별 홍보 사진으로 재배포하는 파일은 이 키트에 넣지 않는다. 아래 크레딧과 원문·라이선스 링크를 화면 재사용 시 함께 유지한다.

| 사진 | 크레딧·원문 | 이용조건·변경 |
|---|---|---|
| TourAPI 제공 관광지·꽃밭·음식점 등의 대표 사진 | **출처: ⓒ한국관광공사**. [한국관광콘텐츠랩](https://api.visitkorea.or.kr/). 각 관광지의 contentid와 상세 화면에서 출처 확인. | 서비스 실응답 firstimage의 화면 내 표시를 캡처. 제공 API의 사진별 이용조건을 따르며 전부 동일 라이선스라고 단정하지 않는다. UI 카드에서 크롭/축소. |
| 철원 노동당사 — Korean Workers' Party Headquarters, Cheorwon (2026-05) (1) | **Sadopaul / Gyuwon Lee**, Wikimedia Commons. [개별 원문](https://commons.wikimedia.org/wiki/File:Korean_Workers%27_Party_Headquarters,_Cheorwon_(2026-05)_(1).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). 앱 카드의 축소·크롭. 변경된 사진 부분에는 같은 라이선스가 적용된다. 앱·문서 전체의 라이선스를 뜻하지 않는다. 9/16 원문 재확인. |
| 백마고지 전적지 — Battle of White Horse | **ACROFAN**, Wikimedia Commons. [개별 원문](https://commons.wikimedia.org/wiki/File:Battle_of_White_Horse.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). 둘러보기 카드에 포함되는 경우 축소·크롭된 사진 부분에 동일 조건 유지. |
| 고성 왕곡마을 — 국가민속문화재제235호 고성 왕곡마을 1 | **강원특별자치도·한국문화정보원**, 2018. [공공누리 원문](https://www.kogl.or.kr/recommend/recommendDivView.do?division=img&recommendIdx=8199) | [공공누리 제1유형](https://www.kogl.or.kr/info/licenseType1.do). 선택 화면에 포함되는 경우 출처표시 유지. 9/16 원문 재확인. |

일부 후보 화면에는 위 목록 중 일부만 나온다. 전체 앱의 다른 지역 사진은 [기존 사진 출처 목록](../../../reports/photo_sources.md)에 따르며, 이 문서에서 촬영하지 않은 사진까지 새로 권리 검증했다고 주장하지 않는다. 공식 장소 안내의 사진이나 문장을 통째로 복제하지 않았다.

## 지도·데이터·양식

- 카카오맵 SDK의 로고/저작권 표시를 가리거나 제거하지 않는다. 앱 일정의 선과 이동시간은 실제 차량 경로/실시간 교통 결과가 아니다.
- 무장애 정보는 **출처: ⓒ한국관광공사**와 수신 시각을 유지한다. 일부 시설 안내를 전체 동선의 무장애 보장으로 바꾸지 않는다.
- 통일부 DMZ 관광·카페 파일, 국가보훈부 현충시설 수집본은 [데이터 검증](../../../reports/data_validation_summary.md)에 따른다. 관광공사 API와 다른 출처임을 구분한다.
- 기능설명서는 주최 측 **웹·앱 개발 부문 작성용 PPTX**를 기반으로 대회 표지·섹션명·필수 작성 항목을 유지한다. v2는 안내 박스·작성 예시를 제거하고 본문 글꼴·배치를 재설계했으며, 허용된 기능 흐름도를 5개 기능·8쪽으로 구성한다. 원본 양식이나 예선 제안서의 연락처 등을 추가 배포하지 않는다. v1 산출물은 제작 이력으로 보존한다.


## v3 추가 화면 · 2026-09-17

6쪽 로그인/가이드와15쪽 PNG는 `reports/qa/tester-social/scenarios`의 실제 로컬 앱/D1촬영물입니다. 사람·여행은 가상이며 실현장관광기록이 아닙니다. `04-story.png`에 한국관광공사 제공 고석정꽃밭·철원역사문화공원사진을 원본비율그대로 담았습니다(크롭없음,사진내워터마크유지,출처표시). `08-impact.png`는 익명제안→개인계획저장→반영성공 후 내보낸이미지입니다. QR의 검증용공개링크는 촬영 후 삭제했습니다. [권리 및 구현근거](../../../reports/tester-social-delivery.md).
