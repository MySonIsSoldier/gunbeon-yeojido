# 개발 인수인계

## 사용자용 도메인 가이드·Sites 한도 — 2026-09-15 16:47 KST

- [사용자용 가이드](domain-owner-guide.md)에 기존 Google/Naver/Kakao 앱에 새 주소를 추가하는 절차와 별도 Google 도메인 소유/브랜드 검수를 정리했다. 실제 콘솔 값은 변경하지 않았다.
- 동일 도메인 ID 새로고침: pending / provider active / SSL pending_validation, 오류 없음. 운영은 active/public·disabled_by 없음. 운영 v19/env4와 기존 origin 유지. 새 배포 없음.
- 공식 Sites DB 한도는 사이트당 10GB. 동시 접속자·방문자/요청 수·전송량·고정 공개 기간은 공개 숫자를 확인하지 못했다. 도구는 계정별 quota를 제공하지 않고, Sites 관리 페이지의 브라우저 로딩 실패로 개인 계정 표시값도 미확인이다. Cloudflare Free 숫자로 대체하지 않는다.
- 계정의 모든 Sites 합산·요금제별 beta 한도와 초과 시 공개 제한 가능성을 안내했다. Analytics는 실적이며 허용 최대값이 아니다. 문의 초안만 준비했으며 발송/모니터링 등록은 하지 않았다.
- 문서 링크/공백 검사 후 commit/push. 코드·Secret·DB 변경이 없어 앱 검사는 반복하지 않는다. 다음은 사용자의 제공자 주소 등록 완료 확인과 SSL 활성화 이후 전환이다.

## Google 운영 활성화·DNS 반영·심사 호스팅 — 2026-09-15 최신

**배포·소셜 로그인·도메인은 이 절이 아래 과거 기록보다 우선한다.** 상세 원인·증빙·공식 근거는 [운영 점검 보고](../reports/google_login_hosting_2026-09-15.md)에 있다.

- Google 키가 로컬에만 있고 운영 env3에 없어 버튼이 비활성이었다. 두 값만 Sites Secret에 반영해 **운영 v19/env4** 재배포 완료. 소스 `9790ac308766aecae662e71d7bdc0e2b5050fb38`, version `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_1094cb816de48191abd8ac1e8901721b`, deployment `appgdep_6aa8f31ecb40819186244a8bd052ea38` **succeeded 07:27:03 UTC**. 기존 코드·D1·Naver/TourAPI/Kakao/체험 Secret 보존. 환경만 바꿔 기존 저장 버전을 재사용했다.
- 운영 `/api/account`는 google/naver 모두 true. 실제 공개 브라우저에서 Google 버튼 → Google 이메일/전화번호 입력 화면까지 정상. 본인 인증 후 callback·계정 생성/연결·재로그인은 아직 미확인이다. 사용자가 직접 시험하도록 열어 두었다. 지정 심사 계정의 데이터·연결은 변경하지 않았고 브라우저 세션만 로그아웃했다.
- Hosting.kr A2·TXT2 설정은 권한 네임서버/공개 리졸버에서 확인 완료. 기존 도메인 ID `appgdom_6aa8d01a4d0481918a5c8ce10d2ed2ba`의 **07:32:36 UTC** 상태는 pending / provider active / SSL pending_validation, 오류 없음. HTTPS는 아직 실패. 도메인을 다시 등록하거나 임의 DNS를 추가하지 않는다.
- 운영 `AUTH_BASE_URL`·`PUBLIC_SITE_URL`은 기존 chatgpt.site 유지. 새 도메인의 HTTPS 및 Google/Naver 콜백·Kakao SDK 등록 후 함께 전환/재배포하고 기존 계정·기록을 검증한다. DNS만 반영됐다고 origin을 먼저 바꾸지 않는다. [정확한 콘솔 주소](custom-domain-setup.md).
- **한 달 심사에는 현재 Sites 유지 권장.** 대화/PC와 독립된 호스팅이나 beta·요금제별 한도이며 30일 SLA는 확인하지 못했다. 현재 계정/공개 접근 유지, 최종 검증한 주소/버전 고정, API 승인량 관리가 우선이다. 자동 모니터링이나 운영 DB 백업/복원은 이번에 실행하지 않았다. DB 복구 경로는 별도 확인할 과제다.
- 개발 Site는 기존 **v2/env2**, 소유자 전용·별도 DB·Google/Naver 미설정 상태 유지. 배포 환경을 혼동하지 않는다. 다른 PC의 로컬 env 수정은 운영 Secret에 자동 전파되지 않는다.
- 코드 변경 없이 실제 환경 API·브라우저·DNS·HTTPS를 검사했다. 기존 108개 단위/CI 결과를 이번 새 실행 결과로 표기하지 않는다. 문서 변경은 commit/push하고 최종 SHA는 git log에서 확인한다.

다음 행동: Google 본인 로그인 결과 확인 → SSL 활성화/새 도메인 제공자 설정 → 최종 제출 주소 결정. 서버 이전보다 대표 여행 정보·지정 기능설명서·심사 리허설을 먼저 마무리한다. 개인 Cloudflare Workers+D1은 실제 이전 필요가 생겼을 때만 무료 CPU/DB 용량과 데이터 복구를 시험한다.

## 여행·공유 UX 개선 — 2026-09-15 이전 배포 기록

- 사용자 확정 도메인 **gunbeon.gangwon.kr**. Sites 등록 완료, ID `appgdom_6aa8d01a4d0481918a5c8ce10d2ed2ba`. 05:28 UTC 상태 `pending`, SSL `pending_validation`. DNS A는 여전히 Hosting.kr 주차 주소 두 개이며 검증 TXT가 없다. DNS 로그인/설정 대기. [정확한 A/TXT와 다음 순서](custom-domain-setup.md). 등록을 반복하지 않는다.
- GitHub 기능 SHA `8ed28cc`, [PR #29](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/29) **merged** `d9aeb8347f93e18646f69baaf851496f3d5337f5`, master 동기화 완료. 본 최신 기록을 별도 문서 커밋으로 push한다.
- **운영 v19/env3**: source `9790ac308766aecae662e71d7bdc0e2b5050fb38`; version `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_1094cb816de48191abd8ac1e8901721b`; deployment `appgdep_6aa8d7ae5fc88191aac0e80d9e05709e` **succeeded 05:29:34 UTC**. 기존 공개 chatgpt.site URL·D1·Naver/TourAPI/Kakao Secret 유지. AUTH_BASE_URL 전환 안 함.
- **개발 v2/env2**: source `97650f2a8889b77d9fa7346475d49af88b47298f`; version `appgprj_6aa8c98dd2a08191a61d18c5e318a57f~appgver_1a33ae9986808191a8f967f8ed39c619`; deployment `appgdep_6aa8d69d142481918804d434e2fa6e74` **succeeded 05:25:14 UTC**. 소유자 전용·별도 DB. 네이티브 소유자 QA 인증과 1234 입장으로 새 가이드 문구, [개발] 제목/noindex를 확인. API account null·소셜 제공자 false. 브라우저 OpenAI 로그인까지 실검증한 것은 아님.
- 수정: 미조회 만남 장소 저장 보존, HTTP 오류 캐시 제거와 일정 다시 불러오기, 관광지/만남 장소 입력 보호, 후보 없는 유형의 검색 전환, 전체 초대 링크·운영 도메인 호환, 공유 대상 변경 시 개인 장소 동의 초기화, 그룹 조회 오류/빈 상태, 빈 코스의 비활성 UI 축소.
- 단위108·TypeScript·배포 빌드 통과. Chromium360/430/1440px 일정/복구/입력보호 각7시나리오, 개인 코스·로컬 D1 초대 링크 참여360/1440px 통과. Chrome 개인 코스360/430/1440/1920px 통과. Edge 미설치. GitHub PR 단위/빌드 및 전체 keyless-browser-flow **pass(5m40s)**. [실행·캡처·사용법](../reports/journey_clarity_2026-09-15.md).
- 운영 소스 임시 checkout에는 의존성이 없어서 빌드 명령이 실패했지만, 모든 소스 파일을 검증한 web/ 빌드와 바이트 대조 후 **동일 소스의 성공한 빌드 산출물**을 재사용해 패키징했다. 미완료 빌드를 배포하지 않았다.
- 운영 배포 후 익명 HTTP 확인: /login 정상, /api/account account null·naver true·google false, 1234 입장 후 /guide 새 초대/재시도 문구 정상, 운영 제목/noindex 없음. 이번 확인은 실제 Naver OAuth 재로그인이 아니며 기존 성공 기록을 유지한다. 브라우저 크기는 복원했고 운영 주소 열기는 Codex에 queued로 전달됐다.
- 후속: DNS/HTTPS·제공자 도메인 전환 → 실제 사용자 첫 이용 관찰 → 철원 부모 동행/고성 친구 여행의 예약·휴무 최신성 확인 및 제출 버전 리허설. 기능 확대보다 이 검증을 먼저 한다.


## 개발/운영 분리·구매 도메인 연결 준비 — 2026-09-15

**다음은 개발 환경 최초 분리 당시의 기록이다. 최신 상태는 문서 맨 위를 따른다.** 개발 전용 사이트를 새로 배포했다. 당시 운영은 기존 **v18/env revision3**을 유지했으며 환경 대응 변경은 개발에만 반영했다.

- 개발 URL **https://gunbeon-development.ybuser.chatgpt.site**, 소유자 전용. Project `appgprj_6aa8c98dd2a08191a61d18c5e318a57f`, source `7a26875ba8af48454e39f03ce79c933c359e82d5`, saved version `appgprj_6aa8c98dd2a08191a61d18c5e318a57f~appgver_9c5329f1b8f8819198b0f9c0b3204e01` **v1**, deployment `appgdep_6aa8cc19acf8819196395be690693a38` **succeeded 9/15 04:40:15 UTC**, env2.
- 개발 D1은 별도17테이블·accounts0건 확인. 운영 DB/계정 복제 없음. 개발 TEST_SESSION_SECRET은 새 값, TourAPI/Kakao 키는 기존 승인 값. 개발 소셜 키는 미설정이며 Kakao 개발 도메인 추가는 남아 있다. 운영 네이버 앱을 개발용 새 앱으로 교체하지 않는다.
- 코드 `e58c993`, [PR28](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/28) **병합 `4d1fa32e4518e6623997617c596e5e2eada43718`, 9/15 04:45:10 UTC**. TypeScript·102단위·개발 빌드·품질2개·전체 키 없는 브라우저 CI 통과. 최종 문서 커밋/원격은 git log와 status에서 확인한다.
- 실제 개발 HTML/API: [개발] 제목, noindex/nofollow, 개발 OG 이미지 URL, providers false, account null. Sites 소유자용 QA 인증으로 읽기만 했다. IAB는 OpenAI 로그인 화면까지 확인했으며 브라우저 앱 로그인·지도 성공을 주장하지 않는다. [실행 보고](../reports/custom_domain_rollout_2026-09-15.md).
- `config/sites-environments.json`과 `scripts/check-site-target.mjs` 사용. web/.openai/hosting.json은 운영 ID를 유지하고 개발 소스 checkout은 개발 ID를 유지한다. 배포마다 명시적 환경 검사 후 Sites 공식 skill을 수행한다. 개발/운영 원격 인증은 해당 프로젝트에서 새로 받는다.

**9/15 후속 확인:** 사용자가 `gunbeon.gangwon.kr`로 확정했다. 기존 운영 Site에 커스텀 도메인 `appgdom_6aa8d01a4d0481918a5c8ce10d2ed2ba`를 추가했으며 DNS/SSL 대기다. **다시 추가하지 않는다.** Hosting.kr 로그인 세션이 없어 DNS와 운영 AUTH_BASE_URL은 변경하지 않았다. 실제 반환된 A/TXT는 [설정 안내](custom-domain-setup.md)에 있다.

다음 첫 행동: Hosting.kr 로그인 후 A/TXT 설정 → 같은 custom domain ID의 DNS/SSL active 확인 → 기존 Naver 앱에 새 callback·Kakao SDK 도메인·Google TXT 확인 → 운영 AUTH_BASE_URL/PUBLIC_SITE_URL 전환 → 새 주소 로그인·기존 기록·지도·공유·네이버 캡처 재검증. 기존 주소·DB·PWA 기록을 삭제하거나 운영 데이터를 개발로 복사하지 않는다.

## 네이버 운영 로그인·검수 자료 — 2026-09-15

**소셜 로그인과 배포 환경은 이 절이 아래 기록보다 우선한다.** 네이버 로컬 발급값을 운영 Secret에 반영하고 **env revision3**으로 기존 **Sites v18**을 재배포했다. Google 키는 미설정이며 코드와 연결 준비 상태를 유지한다.

- 앱 source `b82711477d649f41896a7a32fbc07aca15f4aed1`, version `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_a8708f3a7c008191a67c40c21f15cba8`, deployment `appgdep_6aa8c3cbb14c8191a27b571dc48cd28e` **succeeded 9/15 04:05:15 UTC**. 앱 코드·D1 스키마 변경 없음. TourAPI/Kakao/체험 Secret 보존.
- 공개 사이트에서 기존 네이버 연결 계정의 **서비스 로그아웃 → 네이버 버튼 → 홈 복귀 → 네이버 연결됨**을 확인했다. 네이버 동의 이력이 있어 중간 인증·동의 화면이 생략됨. 기존 연결을 생성·삭제·변경하지 않았으며 지정 심사 계정을 초기화하지 않았다.
- 실제 캡처 PNG3장과 PDF3쪽을 [검수 제출자료](../output/naver-review/README.md)에 제공한다. 개인정보는 불투명 마스킹 후 PDF에 포함했다. 원본은 gitignored tmp/에만 있으며 새 PC는 최종 파일을 사용한다. [운영·QA 기록](../reports/naver_login_review_2026-09-15.md).
- 검수 적용 형태는 **네이버 로그인을 통한 신규 회원 가입**이다. 최초 식별자 생성 로직은 구현되어 있으나 이번 실제 촬영은 기존 회원 재로그인이다. 신규 회원/새 동의 실검증·네이버 검수 신청/승인·다른 기기 네이버 로그인은 이번 완료 범위가 아니다.
- Google의 승인된 도메인 목록에 `ybuser.chatgpt.site` 추가와 Search Console 소유 인증/브랜드 검수는 구분한다. 현재 openid 기본 로그인은 검수 전 시험 가능성이 있다. 콘솔 저장/키 발급/실로그인은 아직 미확인. [상세 안내](social-login-setup.md).
- 문서·증빙만 변경하여 전체 앱 검사를 반복하지 않았다. 최종 PDF 렌더링·각 파일5MB 미만·원문 계정 식별자 제외를 확인했다. 이번 작업 브랜치는 `docs/naver-login-review`; 최종 커밋/원격 상태는 `git log -1`과 `git status -sb`로 확인한다.

다음 행동: 사용자가 네이버 개발자센터에서 검수 유형 선택·필수 식별자 외 제공정보 점검·PDF 첨부 후 신청한다. 새 동의 화면이 필요하면 미연결 테스터로 촬영하고 기존 연동을 해제하지 않는다. Google은 목록 등록 후 Client 발급 가능 여부를 확인하며, 제출물 준비는 계속 진행한다.

## 공개 이용약관·B 로고 확정 — 2026-09-15

사용자가 **B ‘다시 만나는 길’**을 선택했다. [이미지 키트](../assets/brand-kit/README.md)의 source/symbol.svg가 마스터이며 140×140 포함 16개 PNG, 단색 SVG, 폰트/OFL, 재현 스크립트가 있다. image_gen의 후속 투명 출력은 실패해 사용하지 않았고 최종 파일은 선택안 기반 SVG를 정리하여 렌더링했다. 키트 ZIP과 140 PNG는 운영 /brand/의 공개 다운로드다. 다음 PC는 저장소 파일로 작업한다.

- **/terms** 공개 페이지, /login·/account·/about·/privacy·앱 하단 연결. [OAuth 입력 주소](social-login-setup.md) 갱신. 약관 동의 기록·자동 탈퇴·제공자 검수를 새로 구현/완료한 것은 아니다. 전용 비공개 문의 창구는 운영 후속 과제다.
- 기능 `aacbe9b`, 문서 `fa1773f`, [PR27](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/27) 병합 `ca55db0d344501df65cbd48cf9c6312a93fccfe8` (03:56:50UTC). 품질 검사·전체 브라우저 CI5분46초 통과. [전달 보고](../reports/terms_brand_delivery_2026-09-15.md). 최종 기록 SHA는 git log -1로 확인한다.
- 공개 **Sites v18**: source `b82711477d649f41896a7a32fbc07aca15f4aed1`, version `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_a8708f3a7c008191a67c40c21f15cba8`, deployment `appgdep_6aa8c0e2a47081918d52644711074df3` succeeded **9/15 03:52:29 UTC**, env revision2. 기존 공개 URL 유지. GitHub web/source tree `ef8915adae5f18a45139e90363184efbbaf4c6bd` 일치. D1·API 키 변경 없음.
- TypeScript·99 단위·빌드 통과. Chromium151 320/430/1440px에서 비로그인 약관 본문10절, 링크·공개 자산, 개인 API401·가로 넘침 없음 확인. 실제 16 PNG 크기와 투명 파일의 알파 확인. 로그인 캡처는 계정 상태 조회 완료 후 촬영했다.
- 기존 후보 A/C는 기록용이다. 다시 선택 요청하지 않는다. 최종 대표 이미지는 기능설명서와 실제 상세 화면3~5장을 대체하지 않으며 제출 후속 과제는 아래 계획을 이어간다.


## 최신 일정 보기 개선 — 2026-09-15

**아래 심사 준비 기록보다 이 절을 먼저 읽는다.** 홈·내 여행·그룹에서 읽기 전용 일정으로 진입하고 명시적인 ‘일정 편집’에서 수정한다. 수정 저장/취소 후 같은 일정 보기로 돌아온다. 개인 복귀 기준·현재 출타 잠금·그룹 공유 범위 계약을 유지한다. 청록색/살구색 날짜 표식과 사진 중심 디자인을 보완했고 `/guide`는23개 단계다.

- 기능 `6a38dc9`, 검사/보고 `f7a5e3f`, [PR26](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/26) 병합 `687705342813752c98d0f8d723792e2999fbdd2e` (9/15 01:49:53 UTC). 품질 검사와 [전체 브라우저 CI](https://github.com/MySonIsSoldier/gunbeon-yeojido/actions/runs/34918459992)5분 통과. master push 완료. 이 문서의 최종 기록 커밋은 `git log -1`로 확인.
- 공개 **Sites v17**: source `279030542d6fbc4bb8e7933807f9db16efc74985`, saved version `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_b9e1a27359a48191bd9728280c2888e1`, deployment `appgdep_6aa8a46922588191ab8af2f8ffcb41f6` succeeded **9/15 01:51:03 UTC**, env revision2. GitHub의 `HEAD:web`과 Sites source tree가 `9ba93ae05686a91d0c3d52e9587904d2ff287387`로 일치. D1 스키마/키 변경 없음.
- 공개 IAB에서 기존 심사 계정의 부모님 여행을 읽기 전용으로 열어 날짜, 노동당사/들꽃향기, 복귀14:00·여유+1분, 출처, 별도 편집 버튼을 확인했다. 계정·여행을 수정하거나 기기 기록을 가져오지 않았다. 초기 파일 전송2회 실패 후 같은 파일의 재시도 성공으로 완료했으며 중복 버전 없음.
- TypeScript·단위99·빌드 통과. Chrome153/Chromium151 360·430·1440px의 보기/수정/저장/취소·미확정/누락 장소 확인. 실제 TourAPI/Kakao360px 10항목도 통과했다. [구현·시나리오·증빙](../reports/itinerary_view_2026-09-15.md).
- 새 회귀검사 `npm run test:itinerary`는 키 없는 합성 여행이다. CI에 포함했다. 기본경로는 web/, Node22+이며 실제 휴대폰 OS/현재 Edge 검증은 별도다.
- `itineraryView()`에 전역 Settings 또는 현재 시각을 넣지 않는다. 누락 참조를 삭제하거나 미정 이동수단으로 자차 시간을 계산하지 않는다. 그룹 화면은 개인 마진을 표시하지 않는다.
- 가까운 Kakao 번호는 저장 좌표를 바꾸지 않고 화면 라벨만 배치한다. DOMRect 속성은 명시적으로 읽고, SDK 래퍼의 투명한 터치 영역이 버튼을 가리지 않게 한다.
- Google/Naver 운영 제공자 상태는 둘 다 미설정. [발급 안내](social-login-setup.md)의 네 값이 준비되면 로컬과 운영을 각각 설정하고 `/account` 연결→재로그인·다른 기기 복원·실패 복구를 확인한다. Google의 현재 도메인 소유 확인 가능성은 콘솔에서 확인하며 자체 도메인 구매를 필수로 단정하지 않는다.
- 지정 심사계정과 운영DB를 재준비/초기화하지 않는다. 제출 잔여 작업은 아래 ‘다음 첫 행동’을 그대로 이어간다.

## 심사 준비 기록 — 2026-09-15

공식 참가자 Notion과 첨부 기능설명서9쪽을 다시 확인하고 여행별 동행 조건·그룹 사본·브리핑·출처/수신 표시·로그인 제한을 보완했다. **이 절이 아래 9/11 기록보다 우선한다.**

- GitHub PR [24](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/24), 기능 커밋 `55c78aaa1f8f4ac12117a3e7537aebbadba6072f`, 병합 `185d62cd169482ac049e0755a437ea79ecbe9cb3` (9/15 00:39:31 UTC). 후속 문서/증빙 커밋은 `git log -1`로 확인.
- 공개 Sites **v16**, 앱 소스 `2cd13a45593d60dd2548ab276312726bcd17a98a`, 배포 `appgdep_6aa892359da081919d63a2f6d12bd96a` succeeded 9/15 00:33:51 UTC. 기존 도메인·env revision2·D1 스키마 유지.
- TypeScript·단위93·빌드 통과. PR 품질 검사와 전체 키 없는 브라우저 CI(5분33초) 성공. Chrome153/Chromium151의 여행 조건360/430/1440px, Chromium 개인 코스/그룹/브리핑360/1440px, 출타360px 확인. 현행 Edge와 실제 iOS/Android는 미검증.
- 실제 운영 TourAPI: 철원5유형114곳 정상 수신, 9/15 09:34KST. `tourapi:2686670` 들꽃향기 참조를 예시 일정에 사용. 공개 Kakao 지도마커와 여유비교 +1→+55분 확인. 현재 승인량·증설 승인과 별개.
- 지정 **전용 심사 계정 준비 완료**, 정상 로그인/두 번째 세션 복원, 개인 예시4(계획3/기록1), 그룹2. `prepare-judge-account.mjs` **재실행 금지**: 기존 아이디409에서 멈추며 계정 초기화/덮어쓰기 금지. 개인 기기 여행은 가져오지 않음. 원문 API 응답 D1저장 없음.
- 공개 사용 가이드 새 동행 조건 캡처/사본 설명 반영. [현재 점검 보고서](../reports/judging_readiness_review_2026-09-15.md), [심사·사용 시나리오](judging-scenario.md), [실행 증빙](../reports/qa/judging-2026-09-15/).

### 다음 첫 행동

1. 실제 장병·동행자에게 핵심 흐름을 관찰시키고 대표 철원/고성 여행의 운영·예약·접근 정보를 갱신한다. 그룹 원본/사본 자동 동기화는 지원하지 않으며 원본 링크 메타데이터도 후속 권고다.
2. 핵심5기능으로 지정 양식 PPTX/PDF10MB 이하와 대표1/상세3~5이미지를 제작한다. 아래 과거 안내의 Google/Naver 연결을 제출 필수 선행으로 삼지 않는다. 일반 심사계정은 이미 준비됐다.
3. API 승인량/증설 #15, 실사용/SNS #20, 제출 마무리 [#25](https://github.com/MySonIsSoldier/gunbeon-yeojido/issues/25)를 이어간다. 실제 문의·신청·최종 접수는 아직 실행하지 않았다.
4. 9/19 배포 후보 리허설,9/20 제출물 확정,**9/21 16:00 KST 전** 참가자 계정에서 실제 접수를 확인한다.

### 새 계약

- `Entry.plan.conditions`의 companion/walkLimit/extraBuffer를 개인 상태 whitelist로 보존한다. 그룹/public DTO에 추가하지 않는다. 출타는 저장한 여행의 조건을 우선한다.
- 그룹 사본에는 임의 240분을 넣지 않는다. 개인 사본 편집에서 복귀 기준을 입력하고 저장한다. 그룹 자체는 개인 여유 조정을 표시하지 않는다.
- authRate login-failure-v2는 실패만 소비한다. 정상 로그인이 실패 횟수를 늘리거나 초기화하지 않으며 entry80 제한을 유지한다.
- 신규 `npm run test:judging`은 정상 API가 아닌 실패 fixture + 화면 모의 검사다. 실제 API 근거는 운영 보고서와 분리한다.

## 이전 상태 — 2026-09-11

**2026-09-11 · 조직 저장소 이전 및 앱 링크 공개 반영 완료.** `AGENTS.md` → 이 문서 → `local-setup.md` → `roadmap.md` 순서로 읽는다. 최신 사용자 지시와 실제 코드가 과거 기획·검토안보다 우선한다.

## 현재 기준선

2026-09-11 저장소를 `MySonIsSoldier/gunbeon-yeojido`로 이전했다. 현재 원격/gh 기본 저장소와 clone·문서·앱 링크를 변경하고 조직에서의 새 CI·PR23 병합·v15 배포를 완료했다. [이전 점검 기록](../reports/repository_transfer.md). 공개 사이트 도메인과 API/로그인 설정은 그대로다.

| 항목 | 확인값 |
|---|---|
| GitHub / 기본 브랜치 | https://github.com/MySonIsSoldier/gunbeon-yeojido / `master` |
| 최신 PR | [#23](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/23) 조직 이전 링크/문서 변경, 2026-09-11 05:39:22 UTC 병합. 계정 기능은 PR22 |
| 제품 병합 SHA | `7afeca11cae19c583844bae7d4a0855d6394920b` |
| 최신 변경 커밋 | `dfef8ce0235d18aa152749773b8257ba9a11922b` push/병합. 기존 기능 커밋 이력 보존 |
| 문서 후속 | 이 인수인계·운영 검사 JSON은 제품 병합 뒤 문서 커밋. 최종 문서 SHA는 `git log -1`로 확인 |
| Sites | 기존 프로젝트 `appgprj_6a9e5a33eaa08191a72a52abf77522cc`, **v15** |
| Sites 앱 소스 SHA | `f14e810b6803a4b03b4b81e5520735cbe1dbb4dd` |
| 앱 소스 tree | `e235de4cc549ebeae7f2d29608fd2af76529b79f` — GitHub `HEAD:web`와 동일 |
| 공개 배포 | `appgdep_6aa3941963548191ad82d6078eb2c7ac`, **succeeded**, 2026-09-11 05:39:49 UTC |
| 주소 | https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/ · `/login` · `/account` · `/guide` |
| 로그인 | 개인 아이디 계정 + 체험 입장1234. Google/Naver Client ID/Secret 미설정, 실동의 미검증 |
| D1 / secret | migration0004 유지, 새 migration 없음. 9/11 운영 DB17개 테이블 확인, binding/Secret 유지, env revision2 |

## 9/11 저장소 이전 검사

- 원격 fetch/push·gh 기본 저장소를 새 조직 주소로 변경. 타입·89단위·빌드 통과. 새 조직에서 Quality checks2개와 전체 Browser flow checks 통과 후 PR23 병합.
- Actions 정책·workflow·키 없는 CI를 확인했다. 이전 때문에 바꿔야 할 owner 조건/패키지/보호 정책/비밀값 없음. 앱 링크3개를 v15에 반영했고 배포 결과는 `reports/qa/repository-transfer/`에 기록했다.
- 공개 URL·Sites 앱 소스 Git·Kakao/Google/Naver 도메인·DB/키는 보존했다. 다른 PC에서는 `local-setup.md`의 기존 clone 연결 변경을 먼저 수행한다.

## 계정 기능과 검사 (9/9)

- 기록 오른쪽 위 ⋮에 관리 메뉴를 정리했다. 공유 카드는 별도 전폭 버튼. 완료 기록 수정·계획 복원·새 여행 복사와 한 수 검토/반영은 유지한다.
- 실제 개인 아이디·비밀번호 인증, 계정별 개인 여행/즐겨찾기/출타/스탬프 D1 저장. 기기 기록·그룹·공개 공유/제안 관리 권한은 사용자가 가져오기를 선택한 뒤 검증한 이전 쿠키 범위만 연결한다.
- 서버 읽기 성공 전 쓰지 않는다. 저장 큐와 revision 충돌, 저장 실패 재시도/JSON 백업, 다른 탭의 계정 변경을 방어한다. 기존 계정 자료를 무조건 덮어쓰지 않는다.
- Google/Naver OAuth 경로는 구현했지만 아직 키·제공자 실로그인이 없다. `docs/social-login-setup.md`의 정확한 주소·변수·콘솔 절차를 따른다. 기존 개인 계정은 내 계정의 로그인 연결로 연결한다.
- 타입·89단위·빌드 통과. 계정 API6그룹 통과. Chrome153/Edge152 각360·430·1440·1920px 실제 가입→기기 가져오기→메뉴 수정→다른 브라우저 복원, 저장 실패/충돌 검증. 실제 휴대폰이 아닌 viewport/touch 모의다.
- 최종 GitHub 품질2개·전체 키 없는 브라우저 CI 통과 후 병합. [최종 브라우저 실행](https://github.com/MySonIsSoldier/gunbeon-yeojido/actions/runs/34318329541): 계정/그룹/관광 fallback/22장 가이드/직접 코스/현재 출타/하루 여권/공개 한 수까지 포함. `reports/qa/accounts/ci.json` 참조.
- CI에서 게스트 입력이 hydration 이전에 실행되던 검사 문제는 app-ready 대기와 입력 값 assertion으로 수정했다. 게스트 실패 화면·응답 상태도 수집한다.
- 운영 재검사 결과는 `reports/qa/accounts/public-*.json`에 별도 기록한다. UI의 관광 목록 격리는 실제 TourAPI 성공 근거가 아니다. 실제 제공자 소셜 로그인도 이번 통과 항목이 아니다.
- README·22장 `/guide`·`reports/usage_guide.md`에 실제 화면/사용 시나리오. 구현·한계는 `reports/accounts_delivery.md`.

## 다른 PC에서 재개

```sh
git clone https://github.com/MySonIsSoldier/gunbeon-yeojido.git
cd gunbeon-yeojido
git status --short
git log -5 --oneline
```

기존 폴더는 미커밋 변경을 먼저 보존하고 `git fetch origin --prune` / `git pull --ff-only`로 최신 상태를 확인한다. Node22/npm 설치·환경 파일·D1 migration·키 없는 QA는 `local-setup.md`를 따른다. 이전 PC의 `/tmp` checkout이나 브라우저 바이너리 경로를 복사하지 않는다.

앱 루트는 `web/`다. 새 D1 schema0002/0003/0004는 추가 적용하고 기존 SQL/스냅샷을 수정하지 않는다. `npm run test:advice`는 격리된3개 HTTP쿠키 세션, `npm run test:advice-ui`는 작성자/방문자 브라우저를 나눠 검증한다. 테스트가 만든 공유만 정리하고 운영 DB를 초기화하지 않는다.

Git clone은 개인 localStorage·참여/관리 쿠키·로컬 DB·실제 키·Playwright 바이너리를 옮기지 않는다. 운영에서 같은 계정으로 로그인하면 서버 여행·그룹·연결한 공유를 이어간다. 로컬 DB와 운영 DB는 별도다. 체험 이용의 기기 기록/관리 권한은 내 계정에서 명시적으로 가져와야 한다. 비밀번호 복구/자동 탈퇴는 후속이다.

## GitHub / Sites / D1

- GitHub는 전체 저장소, Sites source Git은 `web/` 앱 루트다. SHA를 혼용하지 않는다. `HEAD:web` tree를 비교해 같은 앱인지 확인한다.
- 이 환경의 Sites building·hosting 지침과 기존 `.openai/hosting.json`을 사용한다. 새 Site/Worker를 만들지 않는다.
- 새 PC는 기존 Sites 프로젝트에서 현재 연결과 단기 credential을 조회해 앱 소스를 새로 준비한다. 토큰은 파일·Git config/URL·로그에 저장하지 않고 명령별 인증으로만 쓴다.
- 검증한 앱 소스 push → 같은 소스의 build/package → 버전 저장 → 기존 공개 접근 배포 → 성공 상태 → 새 세션 검사를 잇는다. 사용자 승인 범위를 중복 질문하지 않는다.
- 로컬 `wrangler.local.jsonc`의 DB ID는 placeholder이며 `--local` 전용이다. 여기에 `--remote`를 붙이지 않는다. 운영 D1은 Sites 배포 migration으로 관리한다.
- `.env.local`과 배포 secret은 독립이다. 키를 Git/문서에 남기지 않는다. 연결 장애 시 로컬 진행과 배포 미반영 상태를 구분해 기록한다.

## 다음 첫 작업

0. Google/Naver Client ID/Secret과 AUTH_BASE_URL을 로컬/운영에 각각 설정한 뒤 신규 로그인·기존 계정 연결·재로그인을 실제 제공자에서 확인한다. 네이버 검수와 Google 게시/도메인 요건을 확인하고, 비밀번호 복구/탈퇴·문의 창구를 정식 운영 전에 보완한다. 키 원문은 채팅에 요청하지 않는다.

1. [#20](https://github.com/MySonIsSoldier/gunbeon-yeojido/issues/20): 실제 장병·가족·연인·친구5–10쌍이 공개 질문→제안→검토→새 여행을 이해하는지 관찰. Android Chrome / iPhone Safari의 PNG저장·인스타 링크 스티커·X 작성창 확인. 전환율 수치를 꾸미지 않는다.
2. [#15](https://github.com/MySonIsSoldier/gunbeon-yeojido/issues/15): 정상 TourAPI 기능 유지+승인량/집계 단위 확인·운영계정/공모전 증설. 문의 초안은 `api_capacity_requests.md`. 실제 문의 발송·증설 승인은 아직 없음.
3. Kakao 무료 배지·일/월 사용량을 실제 계정 수치로 확인한다. 결제 설정은 변경하지 않았다.
4. 대표 코스 운영/예약/접근 조건, 실제 사용자, 실기기·PWA, 최종 기능설명서/이미지/심사 접근을 `roadmap.md` 순서로 마무리한다. 기존 확인 마감9/21 16:00 KST는 제출 직전 공식 안내를 재확인한다.
5. TourAPI 원문 서버 저장/동기화는 별도 저장 조건 답변 후 적용한다. 현재 D1 관광 응답 적재 없음.

직전 v12의 하루 여권/여유 조정/16초 안내와 fresh clone 재현 기록은 `reports/day_passport_delivery.md`, `reports/qa/day-passport/`에 있다. 과거 v9 문서·그룹 브라우저 한정 설명·날짜가 있는 둘러보기는 현행 사양이 아니다.
