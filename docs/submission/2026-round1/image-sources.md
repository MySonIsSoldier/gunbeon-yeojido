# 제출 이미지 출처와 이용조건

2026-09-16. 기능설명서와 이미지 키트의 화면은 **운영 서비스 gunbeon.gangwon.kr**에서 촬영한 실제 UI다. 여행·그룹·기록은 기능 확인을 위한 **합성 예시**이며 실제 이용자 활동이나 현장 방문 인증이 아니다. 화면 크기는 데스크톱 Chromium의 430×900 모바일 viewport 모의이며 실물 휴대폰 검사와 구분한다.

API 응답을 가로채거나 성공 응답을 만들어 넣지 않았다. 촬영에 사용한 새 게스트의 개인 여행은 localStorage에만 넣었다. 그룹·공개 제안은 정상 서버 API로 생성하고 촬영 뒤 해당 임시 리소스만 종료/삭제했다. 지정 심사 계정의 예시를 변경하거나 초기화하지 않았다. 전체 촬영 시각·성공/실패·로딩 전 제외 화면은 [촬영 메타데이터](../../../reports/qa/submission-2026-09-16/screens/meta.json)에 남긴다. PDF와 함께 보관하는 selected-images.json이 최종 사용 목록이다.

## 대표 이미지·로고

- 사용자 확정 B안 **‘다시 만나는 길’**, 팀의 [브랜드 키트](../../../assets/brand-kit/README.md).
- 대표 이미지 1200×630, 등록 로고 140×140. 기존 확정본을 사용하며 왜곡하지 않는다.
- 브랜드 글꼴 Pretendard Variable 1.3.9, SIL Open Font License. 원본과 라이선스는 브랜드 키트 source/에 있다.
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
- 기능설명서 배경·표·항목은 주최 측 **웹·앱 개발 부문 작성용 PPTX**에서 가져왔다. 안내 박스/작성 예시만 제거하고 허용된 기능 흐름도 페이지를 5개로 확장했다. 원본 양식이나 예선 제안서의 연락처 등을 추가 배포하지 않는다.
