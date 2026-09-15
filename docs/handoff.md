# 개발 인수인계


## 최신 상태 — 2026-09-15

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
