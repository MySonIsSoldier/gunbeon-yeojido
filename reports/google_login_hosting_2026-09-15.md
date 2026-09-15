# Google 로그인 활성화와 심사 기간 호스팅

확인일: 2026-09-15. 이 보고서는 운영 설정 변경과 실제 관측을 구분한다. 앱 코드·DB 스키마 변경은 없다.

## 1. Google 로그인

**원인:** 로컬 `.env.local`에는 Google 키가 있었지만 Sites 운영 환경 revision3에는 없었다. 로컬 파일은 공개 배포의 Secret으로 자동 전달되지 않는다. 로컬 `/api/account`는 Google 사용 가능, 운영은 미설정 상태였다.

**조치:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`만 Sites의 비밀 환경변수로 반영하고, 기존 소스 v19를 env revision4로 재배포했다. 기존 AUTH_BASE_URL·Naver·TourAPI·Kakao·체험 Secret과 D1은 보존했다. Secret 원문은 Git·문서·클라이언트 번들에 넣지 않았다.

| 증빙 | 값 |
|---|---|
| 운영 주소 | https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site |
| Sites source SHA | `9790ac308766aecae662e71d7bdc0e2b5050fb38` |
| 저장 버전 | v19 · `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_1094cb816de48191abd8ac1e8901721b` |
| 배포 | `appgdep_6aa8f31ecb40819186244a8bd052ea38` |
| 결과 | succeeded · 2026-09-15 07:27:03 UTC · env revision4 |
| 익명 계정 API | account null · google true · naver true |
| 실제 브라우저 | 활성 Google 버튼 → accounts.google.com의 이메일/전화번호 입력 화면 정상 도착 |
| 미완료 | 본인 인증 이후 callback·신규 계정 생성·재로그인·기존 계정 연결의 실제 검증 |

테스트 주소: [/login](https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/login). 사용자가 직접 Google 인증을 완료하면 홈과 내 계정의 연결 상태를 확인한다. 인증 시간이 오래 지났다면 로그인 페이지에서 버튼을 다시 누른다. 이번 확인에서는 기존 브라우저 세션만 로그아웃했으며 지정 심사 계정의 연동·여행을 변경하지 않았다. 기존 계정을 계속 쓰려면 해당 계정으로 로그인한 뒤 `/account`의 **Google 연결하기**를 사용한다.

현재 Google 콜백은 `https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/api/auth/callback/google`이다. Google의 로그인 화면까지 도달했으나 브랜드 검수 승인이나 최종 로그인 성공을 뜻하지 않는다. URI는 전체 문자열이 등록값과 일치해야 한다. [Google 웹 서버 OAuth 안내](https://developers.google.com/identity/protocols/oauth2/web-server)

## 2. Hosting.kr DNS와 새 도메인

사용자가 추가한 A 두 개와 TXT 두 개는 Sites 발급값과 일치했다. Hosting.kr 권한 네임서버와 1.1.1.1·8.8.8.8 조회에서도 반영을 확인했다. 기존 주차용 A는 교체되어 있었다. **현재 추가로 요구된 DNS 레코드는 없다.** 네임서버 변경·웹호스팅 구매·도메인 재등록은 필요하지 않다.

2026-09-15 07:32:36 UTC Sites 새로고침 결과:

- 도메인: `gunbeon.gangwon.kr`
- ID: `appgdom_6aa8d01a4d0481918a5c8ce10d2ed2ba` — 이 ID를 재사용한다.
- 전체 `pending`, provider `active`, SSL `pending_validation`, last_error 없음.
- HTTPS 실접속은 완료되지 않았다. 앞선 검사는 TLS handshake 실패, 재검사는 20초 연결 시간 초과였다. 유효한 인증서와 정상 응답을 확인하기 전에는 활성화 완료로 기록하지 않는다.
- `_cf-custom-hostname` 검증 항목은 최신 응답에서 빠졌지만 기존 TXT를 제거할 이유는 없다. 새 SSL용 DNS 이름/값은 반환되지 않았다.

다음 순서:

1. 같은 도메인 ID에서 SSL 상태와 실제 HTTPS 응답을 확인한다. 정확한 DNS인데 계속 대기하면 Sites 지원에 도메인 ID·검사 시각·상태를 전달한다. 임의 레코드를 추가하지 않는다.
2. Google에 `https://gunbeon.gangwon.kr/api/auth/callback/google`, 기존 Naver 앱에 `https://gunbeon.gangwon.kr/api/auth/callback/naver`, Kakao SDK에 `https://gunbeon.gangwon.kr`를 추가한다. 기존 등록 주소는 유지한다.
3. 새 도메인의 브랜드 검수를 진행할 때 Google 승인된 도메인과 Search Console 소유 확인을 별도로 마친다. 이번 Sites 검증 TXT는 Google 소유 확인을 대신하지 않는다.
4. HTTPS와 제공자 설정이 준비된 뒤 운영 `AUTH_BASE_URL`·`PUBLIC_SITE_URL`을 함께 변경하고 재배포한다. 로그인·기존 기록·초대·지도·공개 정책 페이지를 다시 검증한다.

현재 운영 origin은 기존 chatgpt.site로 유지했다. 도메인 연결과 심사 주소 전환은 구분한다. 제출 주소는 최종 리허설에서 하나로 확정하고 심사 중에는 유지한다. [DNS와 콘솔 입력값](../docs/custom-domain-setup.md)

## 3. 약 한 달의 심사 기간 운영 판단

**현재 Sites 유지 권장. 지금 서버/DB 이전을 시작할 근거는 없다.** 공식 안내상 배포는 대화 종료 후에도 유지되며 D1이 서버 데이터를 저장한다. 개발 PC를 계속 켜 둘 필요는 없다. 다만 Sites는 public beta이고 요금제별 한도가 적용된다. 공개 문서에서 30일 가동 SLA, 특정 무중단 보장, 비활성 사이트의 유지 기한은 확인하지 못했다. 따라서 심사 기간 이용에 적합하다는 판단과 가동 보장은 구분한다. [Sites 공식 안내](https://learn.chatgpt.com/docs/sites), [현재 요금제 안내](https://learn.chatgpt.com/docs/pricing)

심사 기간 권장 운영 방식:

- 현재 Sites를 지원하는 계정/요금제와 공개 접근 설정을 유지하고 Sites 화면의 실제 이용 한도를 확인한다. 한도 도달 시 사용량이 많은 Site의 공개 유지가 제한될 수 있다. Codex 모델 사용량과 Sites 호스팅 한도를 혼동하지 않는다. 이번 도구에서는 계정의 Sites 잔여 트래픽 수치를 확인하지 못했다.
- 제출 전 새 브라우저에서 URL·전용 심사 로그인·대표 여행·지도·API 출처를 점검하고 검증 버전과 origin을 고정한다. 개선은 별도 개발 Site에서 진행하며 운영에는 필요한 오류 수정만 반영한다.
- 심사 기간에는 주기적으로 접속·로그인·지도·TourAPI 오류를 확인하는 운영 담당을 정한다. **이번 작업에서 자동 감시를 등록한 것은 아니다.**
- 현재 v19와 env4의 배포 기록을 보관한다. 코드 롤백은 저장 버전 재배포로 준비하되, DB 복구와는 구분한다. Git은 이용자 DB 백업이 아니다. **운영 DB 백업/복원 경로는 별도 확인이 남았으며 이번에 백업을 생성하거나 복원 시험하지 않았다.** 계정/여행 데이터를 공개 저장소에 넣지 않는다.
- TourAPI와 Kakao 승인량·증설은 호스팅 용량과 별도로 관리한다. 서버 이전으로 외부 API 호출 한도가 늘지는 않는다.

## 4. 이전이 실제로 필요해질 경우의 무료 후보

가장 먼저 검토할 곳은 **사용자 소유 Cloudflare Workers + D1**이다. 현재 앱이 Workers·D1·Drizzle 구조이므로 다른 런타임/DB로 옮기는 것보다 변경 범위가 작다. 다만 Sites 내부의 요금제/한도가 Cloudflare 개인 Free와 같다는 뜻은 아니다.

| 개인 Free 기준 | 공개 제한 |
|---|---|
| Workers 동적 요청 | 일 100,000회, 요청당 CPU 10ms |
| D1 | 일 읽기 500만 행·쓰기 10만 행, DB 하나당 500MB·계정 전체 5GB |

[Workers 제한](https://developers.cloudflare.com/workers/platform/limits/), [D1 요금](https://developers.cloudflare.com/d1/platform/pricing/), [D1 DB별 한도](https://developers.cloudflare.com/d1/platform/limits/)

무료 이전을 확정하려면 별도 테스트 DB에서 SSR·실제 로그인·개인/그룹 저장의 CPU와 쿼리량을 먼저 측정해야 한다. 현재 비밀번호 scrypt 연산은 CPU 한도 위험이 있어, 무료 요금제에 맞추려고 인증 강도를 낮추지 않는다. 운영 DB 내보내기·보호·복원, Secret 재설정, 도메인/콜백 전환, 롤백까지 준비한 뒤 판단한다. 이번에는 계정 생성·이전·유료 가입을 실행하지 않았다.
