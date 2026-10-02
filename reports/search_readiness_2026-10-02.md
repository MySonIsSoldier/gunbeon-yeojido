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

배포·GitHub 상태는 검증 후 아래와 handoff에 확정 기록한다. 사용자의 후속 절차는 [Search Console 안내](../docs/search-console-setup.md)에 있다.
