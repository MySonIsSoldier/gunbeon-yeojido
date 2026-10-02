# Google Search Console 운영 안내

공식 검색 주소는 **https://gunbeon.gangwon.kr/** 이다. 개발 사이트와 기존 chatgpt.site 주소는 검색 대상으로 사용하지 않는다. SEO 구현·점검 기록은 [10/2 보고서](../reports/search_readiness_2026-10-02.md)를 확인한다.

## 이번 변경의 목적

로그인하지 않은 방문자는 첫 화면에서 서비스·이용 지역·여행 준비 방법을 읽고, 로그인 또는 이용 가이드로 이동한다. 로그인한 사용자는 기존 여행 앱으로 진입한다. 모든 방문자에게 같은 규칙을 적용하며 검색 로봇을 별도로 판별하지 않는다.

- `/robots.txt`: 운영에서 공개 페이지 크롤링을 허용하고 사이트맵 위치를 제공한다.
- `/sitemap.xml`: 홈·서비스 소개·이용 가이드·개인정보 안내·약관, 총 5개의 정식 URL만 포함한다. 개인 일정·계정·그룹·공개 한 수 링크는 포함하지 않는다.
- 공개 페이지: 서버 HTML 본문, 각 페이지의 제목·설명·자기 자신을 가리키는 canonical, OG 메타정보를 제공한다. 홈페이지에는 실제 서비스명으로 WebSite 구조화 데이터를 넣는다.
- 로그인·계정·공개 한 수와 로그인 상태의 홈페이지: `noindex`. 로그인·공개 한 수 페이지는 검색 로봇이 `noindex`를 읽을 수 있도록 robots.txt에서 막지 않는다. API에는 기존 인증을 계속 적용한다.
- 개발 환경: 검색 차단, 빈 사이트맵. 운영 별칭의 공개 HTML에는 `noindex`를 추가하고 canonical은 공식 도메인으로 지정한다. 기존 OAuth 콜백·쿠키 주소를 일괄 리디렉션하지 않는다.

## 사용자가 진행할 순서

1. [Search Console](https://search.google.com/search-console)에서 기존에 소유권을 확인한 `gunbeon.gangwon.kr` 속성을 선택한다. DNS 인증 TXT는 삭제하지 않는다.
2. **색인 생성 → Sitemaps**에서 `https://gunbeon.gangwon.kr/sitemap.xml`을 제출한다. URL 접두어 속성에서 주소 뒷부분만 입력하게 되어 있으면 `sitemap.xml`을 입력한다. 처리 후 상태가 **성공**인지, 발견한 페이지가 5개인지 확인한다.
3. 상단 **URL 검사**에 `https://gunbeon.gangwon.kr/`을 입력하고 **실제 URL 테스트**를 실행한다. 가져오기 성공·색인 허용·사용자 선언 표준 URL이 공식 주소인지 확인한다. 테스트된 페이지의 HTML/스크린샷에 소개 화면이 보이는지도 확인한다.
4. 홈의 **색인 생성 요청**을 한 번 실행한다. `/about`, `/guide`도 같은 방식으로 요청할 수 있다. 여러 번 반복한다고 빨라지지 않는다.
5. 며칠 뒤 **페이지 색인 생성**과 URL 검사를 확인한다. 아직 미색인이면 제외 사유 문구, 마지막 크롤링 시각, Google이 선택한 표준 URL을 전달한다. 실제 URL 테스트 성공과 검색 색인 등록은 서로 다른 상태다.

로그인·계정·개인 여행 링크의 `noindex`는 정상이다. 이 페이지의 색인 제외를 해제하지 않는다. 약관·개인정보 페이지가 검색 결과에 나타나지 않더라도 홈페이지의 등록 상태부터 확인한다.

## 제외 사유별 확인

| 표시되는 사유 | 확인할 내용 |
|---|---|
| 리디렉션이 포함된 페이지 | 검사 주소가 공식 루트인지, 로그인으로 이동하는 예전 응답을 마지막으로 수집했는지 확인 후 실제 URL 테스트 |
| robots.txt에 의해 차단됨 / noindex 감지 | 운영 정식 도메인인지 확인. 개발/계정 페이지의 차단은 의도한 동작 |
| 발견됨 - 현재 색인이 생성되지 않음 | 사이트맵 성공·서버 응답을 확인하고 수집을 기다림 |
| 크롤링됨 - 현재 색인이 생성되지 않음 | 수집된 본문/표준 URL을 확인하고, 이용 가이드·서비스 설명의 실제 정보 가치와 외부 유입을 보완 |
| 중복 / Google에서 다른 표준 페이지 선택 | 공식 주소의 canonical·사이트맵을 점검하고 외부 소개 링크도 공식 주소로 통일 |
| 서버 오류 | 발생 시각·URL을 확보해 Sites 응답과 로그를 점검 |

Search Console 계정 내부의 제외 사유와 실제 Google 색인 결과는 이번 코드 검사만으로 확인할 수 없다. 정상 응답과 사이트맵은 검색 수집을 돕지만 등록 날짜나 순위를 보장하지 않는다. 실제 이용자에게 도움이 되는 가이드 갱신과 공식 주소로 연결되는 소개 자료를 꾸준히 유지한다.

## 개발자 유지보수

`web/lib/search-policy.ts`가 공개 URL·canonical·환경별 색인 정책의 기준이다. 새 공개 문서를 추가할 때에는 실제 본문, 인증 없이 200 응답, 고유 제목/설명을 준비한 뒤 목록에 넣는다. 개인 기록을 사이트맵에 넣지 않는다. 매 요청마다 가짜 `lastmod`를 만들지 않는다.

```sh
cd web
npm run test:search
# 운영 배포 후, 계정 생성 없이 공개 HTTP/반응형/게스트 진입 검증
QA_BASE_URL=https://gunbeon.gangwon.kr QA_SEARCH_INDEXABLE=1 npm run test:search
```

로컬·개발은 색인이 차단되는 것이 정상이다. 운영은 `SITE_ENVIRONMENT=production`, `PUBLIC_SITE_URL=https://gunbeon.gangwon.kr`이어야 한다. 인증키나 Google API 연동은 사이트맵 제출에 필요하지 않다.

## 공식 근거

- [Google 재크롤링 요청](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko): 수일~수주가 걸릴 수 있고 색인 등록을 보장하지 않는다.
- [사이트맵 제작·제출](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko)
- [noindex 사용](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=ko): robots.txt로 막으면 noindex를 읽을 수 없다.
- [표준 URL 통합](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=ko)
- [사이트 이름 구조화 데이터](https://developers.google.com/search/docs/appearance/site-names?hl=ko)

운영 빌드의 지연 메타 출력도 점검했다. `htmlLimitedBots: /.*/`로 동일한 메타정보를 모든 방문자의 초기 HTML head에 포함한다. 표준 URL의 루트 슬래시 유무는 URL로 정규화해 검사한다.
