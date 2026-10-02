# 10/2 검색 접근 개선 및 테스터 로그인 회귀 점검

## 확인한 문제

GitHub master `6c74c92`와 로컬이 일치했고 원격 추가 변경은 없었다. 비로그인 운영 GET에서 `/`, `/robots.txt`, `/sitemap.xml`은 307 `/login`, `/guide`는 307 `/login?next=guide`였다. `/about`, `/login`은 200이지만 페이지별 canonical과 로그인 noindex가 없었다. Google이 서비스 본문과 사이트맵을 읽는 데 장애가 있는 상태였다.

사용자는 Search Console의 실제 제외 사유를 아직 확인하지 못했다. 따라서 위 응답을 관찰된 개선 대상으로 기록하며, Google 내부의 최종 제외 사유라고 단정하지 않는다.

## 구현

- 비로그인 루트에 서버 렌더링 소개 화면. 기존 브랜드·지역·기능으로 구성하고 모바일 320/430px 및 데스크톱을 지원한다. 로그인 시 기존 여행 앱 진입, 초대/제안의 로그인 경로를 보존한다.
- 공개 소개·이용 가이드·개인정보·약관의 자기 canonical·제목·설명·OG. 홈페이지의 WebSite 구조화 데이터. 과장된 평가/리뷰/검색 기능 데이터는 추가하지 않았다.
- 인증 없이 200을 반환하는 robots.txt와 XML sitemap. 정식 공개 URL 5개만 포함한다. 개발/환경 미설정은 차단, 개인 화면·공개 한 수·운영 별칭은 noindex.
- 로그인한 루트는 private/no-store와 noindex. 개인/API 접근 보호와 D1 hydration 저장 계약 유지. 가이드의 기존 가상/마스킹 화면 이미지만 공개한다.

## 검사 중 발견한 기존 로그인 오류

14일 지난 체험 사본의 만료 세션 정리에서 `demo-character:<UUID>:%` LIKE 패턴이 D1 제한을 초과해 `D1_ERROR: LIKE or GLOB pattern too complex`가 발생했다. 로그인 API가 503을 반환하여 가이드 검사가 실패했다. `substr(token_hash,1,길이)=정확한 접두어`로 바꾸고, 생성한 가상 사본을 과거로 설정하는 로컬 회귀 검사를 추가했다. 만료 사본과 관련 인물은 제거되며 유효 세션은 유지됨을 확인했다. 운영 원본 계정·개인 데이터는 초기화하지 않는다.

## 검증 상태

- typecheck, 124개 단위 검사, 빌드 통과.
- 새 검색 검사: 공개 5개 SSR/canonical, robots/XML MIME·환경 분기, 개인 API 401, 초대/제안 리디렉션, JavaScript를 끈 320/430/1440px 소개·가이드, 게스트의 기존 앱 진입 통과.
- 민준/openapi 각각 320/430/1440px에서 기능 안내·일정 보기·출타 취소·기록 확인 버튼과 재로그인 흐름 통과.
- 기존 계정 API 회귀, 360/1440px 이용 가이드 및 25개 이미지, 테스트 계정 격리/만료 정리 회귀 통과.
- 변경 TypeScript 파일 대상 lint 통과. 저장소 전체의 과거 lint 오류를 해결했다고 주장하지 않는다.
- [로컬 증빙](qa/search-2026-10-02/local/results.json). Chrome/Edge 실제 앱·물리 휴대폰·새 소셜 동의·Search Console 계정 내부는 이 검사 범위가 아니다.

개발 v9/env2 배포와 동일 검색·반응형·게스트 검사 통과. 운영 환경에 기존 PUBLIC_SITE_URL을 유지하며 비밀이 아닌 SITE_ENVIRONMENT=production만 추가(env6)했다. API/OAuth Secret·D1 스키마·도메인·공개 범위는 변경하지 않았다. 현재 설치 환경에서 과거 Sites 전용 archive 제작 helper가 제공되지 않아, 로컬 앱 빌드 통과 후 지원되는 Sites 원격 빌드 경로로 정확히 push한 commit을 배포했다. 운영·GitHub 최종 상태는 아래와 handoff에 확정 기록한다. 사용자의 후속 절차는 [Search Console 안내](../docs/search-console-setup.md)에 있다.

운영 빌드의 지연 메타 출력도 점검했다. `htmlLimitedBots: /.*/`로 동일한 메타정보를 모든 방문자의 초기 HTML head에 포함한다. 표준 URL의 루트 슬래시 유무는 URL로 정규화해 검사한다.

## 운영 1차 확인과 보완

운영 v25/env6에서 Googlebot 식별자 GET `/`는 200과 서버 본문을 반환했다. 민준/openapi 3개 화면 크기 안내·일정·출타 취소 회귀도 통과했다. 최초 검색 검사에서 루트 canonical의 마지막 `/`를 생략하는 운영 직렬화 차이를 발견해 URL 정규화 비교로 검사를 고쳤다. 실제 주소 의미가 바뀐 것은 아니다. 메타정보가 스트리밍 본문 뒤에 나타나는 점도 확인해 모든 UA에 초기 head 출력을 적용하고 로컬에서 재검증했다. 초기 v25 응답을 최종 head 보완 검증으로 대신하지 않는다.

GitHub 중간 커밋 `c9cf705`는 전체 브라우저 CI 8분 31초 통과. 최종 커밋 `a620597`의 CI와 메타 보완 배포 결과는 아래에 기록한다.

최종 `a620597`의 [전체 브라우저 CI](https://github.com/MySonIsSoldier/gunbeon-yeojido/actions/runs/36963528792)는 8분 29초에 통과했다. 같은 커밋의 품질 CI(typecheck·단위·빌드)도 통과했다.

## 최종 완료

- GitHub [PR #35](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/35) 병합 `3155830d374ae6e2a8f83c0fc3d7d17325f321e8`. 검증·인계 문서는 병합 이후 master에 후속 커밋으로 보존하며 최종 SHA는 `git log -1`을 따른다.
- 개발 **v10/env2**, source `2c340893396f20d066d503ed3c2dffb8f1dd3e2a`; 운영 **v26/env6**, source `1ccb1cbac48001488436fe0cc625c5d47dc1dcfa`. 모두 succeeded, 기존 개발 owner-only/custom·운영 public 유지. [배포 결과](qa/search-2026-10-02/deployment.json).
- 최종 개발/공식 운영 모두 새 검색 검사 통과. 공개 5페이지 200·초기 head canonical/title·robots/XML·Googlebot 식별자의 동일 본문·비공개 API 401·초대 리디렉션·JavaScript 없는 320/430/1440px·게스트 기존 앱 진입 확인. [운영 결과](qa/search-2026-10-02/production/results.json).
- 운영 별칭은 200 + noindex이며 초기 head canonical은 공식 도메인. [별칭 검사](qa/search-2026-10-02/production/alias.json). 최종 운영 스크린샷도 동일 폴더에 보존했다.
- 운영 v25에서 두 체험 계정의 3화면 안내/일정 회귀를 확인한 뒤 v26은 메타 출력 설정만 추가했고, v26 공개/게스트 흐름을 재검증했다. 실제 Google 색인 등록, Googlebot의 실제 방문, 검색 순위·장기 서버 안정성의 검증은 아니다.

다음은 사용자가 Search Console에서 sitemap.xml 제출 → 홈 실제 URL 테스트 → 색인 생성 요청을 진행하는 것이다. 제외 사유·마지막 수집 시각을 확보하면 후속 진단이 가능하다. 반복 색인 요청·Search Console DNS 인증 TXT 삭제·개인 페이지의 noindex 제거는 하지 않는다.
