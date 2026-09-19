# PC 작업 중단·이전 점검 · 2026-09-19

사용자가 1차 심사 완료와 이 PC의 당분간 작업 중단을 알렸다. 이에 맞춰 코드·제출 자료·개발 환경을 보존한다. 심사 결과, 포털 접수번호, 실제 최종 업로드 파일은 이번 점검에서 별도로 확인하지 않았다. 과거 9/17 문서의 미접수 상태는 당시 기록으로 남긴다.

## GitHub와 제출 자료

- 원격은 `MySonIsSoldier/gunbeon-yeojido`, 기본 브랜치는 `master`. 시작 시 원격을 새로 조회하여 로컬·원격 `4b19f75fef9747839a34c7e751b7ae994e2e2752` 일치를 확인했다.
- 시작 시 추적 파일 1,038개에 앱 소스·lockfile·migration 0001–0005·브랜드/글꼴·최종 제출 PDF/PPTX/ZIP·실제 화면·검사 기록·agent 문서가 포함돼 있었다. v3.2 제작 이미지 입력 22개도 모두 추적돼 있다.
- 이전 로컬 브랜치 `feat/travel-advice-records`에 `6e494a6bec3934b5b080c1cabf4672a79b5c2cad` 1개가 미게시로 남아 있었다. `git cherry`에서 이미 master에 동등한 패치가 있음을 확인했다. 중복 병합하지 않고 해당 브랜치를 fast-forward push하여 원래 커밋도 GitHub에 보존했다.
- `feat/judging-readiness`의 로컬 ahead 2개와 upstream 없는 `docs/naver-login-review`는 이미 원격 master에 포함돼 있었다. stash와 추가 worktree는 없었다.
- 미추적 `output/submission/gunbeon-2026-round1-v3/`의 21개 파일은 추적 폴더·최종 ZIP의 내용과 모두 SHA256 동일하다. 사용자 파일을 삭제하지 않고 `.git/info/exclude`에 이 중복 압축해제 폴더만 추가했다. 새 PC에는 중복 폴더가 필요하지 않다.
- 이번 변경은 문서와 로컬 백업 도구에 한정한다. 앱 코드·공모전 최종 산출물·운영 계정·배포를 변경하지 않는다. 이전 제품 PR은 #30이며, 이번 문서 정리는 master에 직접 commit/push한다. 최종 SHA는 `git log -1`과 비공개 ZIP의 `MANIFEST.json`에서 확인한다.

## 로컬 비공개 이전 묶음

[생성 도구](../scripts/create-private-transfer.py)는 저장소 **밖**의 새 ZIP만 생성하며 기존 파일을 덮어쓰지 않는다. 원본 환경파일 내용·쿠키·DB 행·인증값을 출력하지 않는다.

| 보존 항목 | 확인 및 범위 |
|---|---|
| GitHub Git bundle | 모든 로컬 refs와 이력; `git bundle verify` 및 별도 clone으로 검사 |
| 운영/개발 Sites 소스 bundle | 기존 checkout의 clean 상태와 source SHA 확인. Git 설정·원격 인증 토큰 제외 |
| 환경파일 | 루트 `.env.local` 1,232 bytes, 변수 9개. web의 같은 내용 symlink를 독립 파일로 복사 |
| 로컬 D1 | SQLite backup API로 WAL을 포함한 일관성 있는 사본 생성, integrity_check. 운영 DB 아님 |
| 설명서 재제작 입력 | 공식 PPTX/미리보기, OT/접수/API키 매뉴얼, v3.2 이미지 목록·검수·PDF 변환 기록, 글꼴 측정값 |
| 사용자 제공 원본 | 제안서 PDF와 TourAPI 5종·기상청 API 가이드 ZIP 6개 |
| 공개 참고 PDF | 철원역사문화공원 이용료 원문. Git에 재배포하지 않고 개인 보존 |
| 복원 안내·명세 | `README-FIRST.md`, `MANIFEST.json`, `SHA256SUMS`, 조회 당시 Sites 설정 메타데이터 |

평문 ZIP이며 운영 DB 전체 백업을 의미하지 않는다. 보관 폴더 `0700`·ZIP `0600`은 암호화가 아니다. 비공개 저장소/암호화된 디스크에서 보관하고 Git에 추가하지 않는다. 파일 용량·해시·최종 포함 목록은 ZIP과 함께 제공하는 검증 명세를 따른다.

재설치 가능한 node_modules·빌드 산출물·브라우저 바이너리, 약 2GB의 임시 QA 프로필/로그, Wrangler cache/observability, 마스킹 전 네이버 원본 캡처는 제외했다. 이 PC의 원본을 삭제하지 않았다. 최종 마스킹 캡처와 QA 근거는 GitHub에 있다.

## 서버 조회 결과와 남은 백업 범위

[Sites 조회 기록](qa/handoff-2026-09-19/sites-state.json): 운영 **active/public v20/env5**, 개발 **active/custom v3/env2**. 각 D1 `DB`의 사용자 테이블 17개를 확인했다. 테이블 이름만 조회했으며 사용자 행·세션·비밀번호 해시를 내려받지 않았다.

- 운영 source `567ea91c800b3077be41c7bf68fc88b5e2bb7409`, 개발 source `788ddd6b579ad2f4183e147d62e6212c1549d874`를 로컬 Sites source checkout에서 확인했고, 이전 배포 기록과 일치한다.
- 운영 비밀변수 8개, 개발 4개가 마스킹된다. 설정 이름과 공개 origin은 보존했지만 **서버 비밀값 원문은 백업하지 못했다**. 로컬 값과 동일하다고 가정하지 않는다. 기존 서버 값을 바꾸거나 재발급하지 않았다.
- 제공된 Sites 도구는 DB 개요·제한된 행 미리보기이며 원자적 전체 내보내기/복구 도구가 아니다. 일부 행을 수집해 완전한 DB 백업으로 표시하지 않는다. **운영 전체 DB export와 복구 경로 확인은 남아 있다.**
- [공개 HTTP 점검](qa/handoff-2026-09-19/public-http.json): TLS 검증을 유지한 curl GET으로 `/login`·`/terms` 200, 인증이 필요한 `/guide` 307을 확인했다. 첫 Python 요청의 로컬 인증서 저장소 오류는 서비스 장애와 구분했다. 로그인·API 기능 전체 회귀를 새로 실행한 것은 아니다.
- 개인 계정 로그인, 소셜 제공자 콘솔·공공데이터포털·Hosting.kr·GitHub/Sites 소유 권한, 2단계 인증 복구 수단은 개인 비밀번호 관리자에서 보관한다. 계정 비밀번호 해시에서 원문을 복원할 수 없다.
- 브라우저 게스트 기록과 참여 쿠키는 ZIP에 없다. [기기 여행 백업·계정 연결 절차](../docs/pc-transfer.md#브라우저에만-있는-여행과-참여-권한)를 사용자가 실행하면 된다. 실제 제출 확인증·결과 통지도 별도 보관한다.

## 검사 범위

Git 원격 도달성, 최종 제출물 중복 비교, Python 문법, 링크, diff 공백, SQLite 무결성, ZIP CRC/SHA256, 별도 clone 복원을 확인한다. 로컬의 긴 API/소셜/서명 자격증명 6개를 전체 Git 이력의 blob 1,377개와 비교해 일치가 없었다. [검사 범위](qa/handoff-2026-09-19/known-secret-scan.json)는 알려진 로컬 값에 한정하며 모든 가능한 비밀값 검출을 보증하지 않는다. 공개 테스트 비밀번호는 검사 대상에서 제외했다.

앱 구현을 바꾸지 않았으므로 이전에 통과한 115개 단위검사·브라우저 검사·실 API 검사를 다시 실행하거나 새 통과 결과로 기록하지 않는다. 최종 이전 검증은 같은 폴더의 `transfer-validation.json`을 따른다.
