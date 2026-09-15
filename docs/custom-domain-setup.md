# 운영 도메인과 개발 환경 분리

2026-09-15 요청에 따라 운영과 개발을 **별도 Sites 프로젝트·D1·배포**로 분리한다. 도메인 등록 업체는 hosting.kr, 앱 서버·HTTPS는 Sites를 사용한다. 별도 hosting.kr 웹호스팅이나 도메인 포워딩은 필요하지 않다.

## 주소와 데이터의 역할

| 환경 | 주소 | 배포·데이터 |
|---|---|---|
| 운영 | 구매 도메인 확인 후 연결. 입력 후보 `gunbeon.gangwon.kr` | 기존 Sites 프로젝트·운영 D1·기존 네이버 앱 유지 |
| 운영의 기존 주소 | `gunbeon-yeojido-gangwon.ybuser.chatgpt.site` | 기존 회원·기기 기록 이전을 위한 과도기 접속 주소. 개발 환경으로 취급하지 않음 |
| 개발 | `gunbeon-development.ybuser.chatgpt.site` | 별도 Sites 프로젝트와 테스트 D1. 소유자 전용으로 시작 |
| PC 개발 | `http://localhost:3000` | 로컬 D1, 로컬 환경 파일 |

사용자가 같은 메시지에서 `gunbeon.gangwon.kr`와 `gunbeon.ganwon.kr`를 모두 적어 정확한 철자를 확인 중이다. 확인 전에는 커스텀 도메인 등록·DNS 변경·운영 AUTH_BASE_URL 전환을 하지 않는다. 개발 주소는 Sites가 반환한 실제 expected_url이며 배포 완료 여부는 handoff.md의 최신 기록을 따른다.

운영 프로젝트를 새로 만들고 기존 계정을 옮기는 방식 대신, 이미 사용자 데이터를 가진 프로젝트에 도메인을 연결한다. 개발에는 운영 계정·여행 원문·운영 DB를 복제하지 않는다. 같은 앱에 주소 두 개만 붙이는 것은 개발/운영 분리가 아니다.

## 배포 흐름

1. GitHub 기능 브랜치에서 구현·검사한다. 저장소의 web/은 원본 코드이며 hosting.json은 기존 운영 프로젝트 ID를 유지한다.
2. **별도 개발용 Sites 소스 checkout**에 검증할 web/ 소스를 반영하고, hosting.json은 config/sites-environments.json의 development ID를 유지한다. 운영 manifest를 그대로 복사해 배포하지 않는다.
3. 개발 환경에 배포하여 사용자 흐름·API·회귀 검사를 수행한다. 기능 PR을 master에 병합했다고 운영을 자동 배포하지 않는다.
4. 통과한 동일 GitHub 커밋의 web/을 운영용 Sites 소스 checkout에 반영한다. 운영 ID·기존 DB·Secret은 보존한다. 실제 Sites source SHA는 환경별 manifest 때문에 서로 다르며 GitHub 기준 커밋과 함께 기록한다.
5. 해당 환경에서 빌드·push·버전 저장·배포한다. Sites 공식 skill의 순서와 exact-source 계약을 따른다. 배포 전에 아래 읽기 전용 검사를 통과해야 한다.

```sh
node scripts/check-site-target.mjs development /absolute/development-site-checkout
node scripts/check-site-target.mjs production /absolute/production-site-checkout
```

원격 저장소·자격증명은 각 프로젝트의 현재 Sites 응답으로 얻는다. 예전 PC의 tmp checkout, token, 원격 주소를 재사용하지 않는다. 개발용 검사를 운영 D1 대상으로 실행하지 않는다. config에는 프로젝트 ID와 비밀이 아닌 주소만 저장한다.

## 환경변수

| 변수 | 운영 | 개발 |
|---|---|---|
| AUTH_BASE_URL | DNS/HTTPS와 OAuth 콜백 준비 후 확정 도메인 origin | 개발 전용 origin |
| PUBLIC_SITE_URL | 확정 운영 origin | 개발 전용 origin |
| SITE_ENVIRONMENT | production | development: 검색 색인 차단·탭 제목 표시 |
| NAVER_CLIENT_ID/SECRET | 기존 운영 네이버 앱 값 유지 | 필요시 별도 개발용 앱 발급. 지금은 미설정 |
| GOOGLE_CLIENT_ID/SECRET | 운영용 OAuth Client | 개발용 Client, 필요할 때 설정 |
| TEST_SESSION_SECRET | 기존 운영 값 보존 | 새 독립 값 |
| DATA_GO_KR_SERVICE_KEY | 기존 승인된 키 | 같은 승인 키 사용 가능; 정상 기능·한도 구분 |
| KAKAO_MAP_JAVASCRIPT_KEY | 승인 도메인에 운영 주소 추가 | 개발 주소도 별도 등록 필요 |

실제 키는 Sites Secret과 각 PC의 .env.local에서 관리한다. 운영 변수는 DNS 준비 전 변경하지 않는다. `providerReady`는 요청 origin까지 비교하여 다른 도메인에서 실패할 소셜 버튼을 활성화하지 않는다. Origin/CSRF 검사를 완화하거나 쿠키 Domain을 확장하지 않는다.

## hosting.kr DNS 연결 순서

1. 정확한 구매 도메인을 확인한다. Sites의 기존 운영 프로젝트에서 custom domain 추가를 **한 번** 수행하고 반환된 검증 레코드·A 대상·상태 ID를 기록한다.
2. Hosting.kr 로그인 → 나의 서비스 → 도메인 관리 → 도메인 선택 → 네임서버 / DNS → DNS 레코드 관리에서 현재 레코드를 먼저 읽는다.
3. `gunbeon.gangwon.kr`가 확정된 경우 이는 루트 도메인이다. Sites가 반환한 **apex용 A 주소**와 모든 TXT/CNAME 검증 항목을 사용한다. 현재 관측된 주차용 IP나 chatgpt.site의 DNS 조회 IP를 Sites 연결값으로 사용하지 않는다.
4. 루트 A만 Sites 대상으로 교체하고 관련 없는 MX/TXT/서브도메인은 유지한다. 호스트는 UI 기준 공란 또는 @; 검증 이름은 루트 부분을 중복 입력하지 않는다. 정확한 값은 Sites 응답에서 복사한다.
5. DNS 확인과 Sites custom domain 새로고침을 통해 hostname·SSL이 모두 active인지 확인한다. A/TXT 방식이면 기존 hosting.co.kr 네임서버를 변경할 이유가 없다.
6. 새 HTTPS 주소의 공개 약관·소개·개인 API 차단을 확인한 다음 OAuth·지도 설정을 마무리한다. HTTP 프레임 포워딩/단순 리다이렉트는 원하는 주소에서 서비스하는 연결을 대신하지 않는다.

공식 근거: [DNS 관리](https://help.hosting.kr/hc/ko/articles/5259561590809), [A 레코드](https://help.hosting.kr/hc/ko/articles/5451071915545), [TXT 레코드](https://help.hosting.kr/hc/ko/articles/5696985768217), [루트 CNAME Alias 조건](https://help.hosting.kr/hc/ko/articles/5695232561561). 현재 기본 네임서버에서 일반 루트 CNAME은 사용하지 않는다. 실제 값 발급 전 레코드를 지어내지 않는다.

## OAuth·지도 설정 (도메인 확정 후)

`gunbeon.gangwon.kr`가 확정되면 아래 값을 사용한다.

| 설정 | 값 |
|---|---|
| Google 승인된 도메인 / Search Console 도메인 속성 | gunbeon.gangwon.kr |
| 앱 홈페이지 | https://gunbeon.gangwon.kr/about |
| 개인정보 / 약관 | https://gunbeon.gangwon.kr/privacy · https://gunbeon.gangwon.kr/terms |
| Google 리디렉션 URI | https://gunbeon.gangwon.kr/api/auth/callback/google |
| Naver 서비스 URL | https://gunbeon.gangwon.kr |
| Naver Callback URL | https://gunbeon.gangwon.kr/api/auth/callback/naver |
| Kakao JavaScript SDK 도메인 | https://gunbeon.gangwon.kr |
| 개발 Kakao SDK 도메인 | https://gunbeon-development.ybuser.chatgpt.site |

Search Console에서 발급한 `google-site-verification=...`는 루트 TXT에 별도로 추가한다. Sites 소유 확인 TXT와 다르며 인증 후에도 유지한다. `gangwon.kr`는 [공식 Public Suffix List](https://publicsuffix.org/list/public_suffix_list.dat)의 공개 접미어이므로 Google에는 사용자가 구입한 `gunbeon.gangwon.kr`를 등록한다. [Google 도메인 확인](https://support.google.com/cloud/answer/13804266?hl=en), [Search Console 소유 확인](https://support.google.com/webmasters/answer/9008080?hl=ko).

기존 운영 네이버 앱에 새 콜백을 추가한다. 새 네이버 앱으로 교체하면 이용자 식별자가 달라질 수 있다. 전환 후 새 도메인에서 검수 캡처/서비스 URL을 다시 맞춘다. 기존 콜백은 정상 전환 확인 전 삭제하지 않는다. 지금 생성된 네이버 검수 PDF는 이전 주소에서 촬영된 자료다.

## 사용자 기록과 전환 검증

- 계정 서버 기록은 기존 D1에 남는다. 새 도메인에서 같은 계정으로 다시 로그인하면 조회할 수 있는지 실제 검증한다.
- 기존 쿠키·체험 localStorage·설치된 PWA는 새 도메인으로 자동 이동하지 않는다. 기존 주소에서 로그인 후 ‘이 기기의 여행·그룹 연결’을 명시적으로 실행하고 새 주소에서 같은 계정으로 로그인한다. 자동 가져오기나 일괄 사용자 데이터 변경은 하지 않는다.
- 익명 초대·공개 제안 관리 쿠키도 이전되지 않는다. 계정 연결 없이 주소만 바꾸면 관리 권한을 잃을 수 있어 기존 주소를 즉시 폐쇄하지 않는다.
- 새 주소에서 로그인 시작→동일 주소 callback→기존 여행 조회, 그룹 초대·공개 제안, Kakao 지도, OG 이미지와 PWA를 확인한다. 현재 환경에서 생성된 공유 링크는 해당 환경 origin을 사용한다.
- 장애 시 운영 AUTH_BASE_URL/PUBLIC_SITE_URL을 기존 origin으로 되돌려 검증된 운영 버전을 재배포한다. 개발 DB를 운영에 덮어쓰는 롤백은 하지 않는다.
