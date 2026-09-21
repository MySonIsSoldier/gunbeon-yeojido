# 9/21 최신: 모든 사용자 상단 여행 가이드 배포 완료

[구현·검증 기록](../reports/universal_guide_2026-09-21.md). 사용자 요청에 따라 회원/비회원 모두 상단 **여행 가이드 다시 보기**를 사용할 수 있다. 운영 **v22/env5**, 개발 **v5/env2**에 반영했다. 아래 콘텐츠 확장·심사 계정 기록은 그대로 유효하다.

- 20초 안내 + 기능별 5단계, 첫 여행/그룹이 없을 때 코스 선택·빈 일정·그룹 만들기로 연결. 진행 중 출타는 이어보기. 홈 시작 버튼과 계획·기록·출타 빈 화면 설명을 보완했다. 기존 16초 홈 안내는 같은 가이드로 통합했다.
- 일반 사용자는 명시적으로 가이드를 연다. 민준/지정 심사 계정의 첫 자동 안내를 보존하며 초대·제안 진입은 가리지 않는다. 안내만으로 여행/그룹/출타를 생성하지 않는다. API·계정·D1 스키마/Secret 변경 없음.
- GitHub `jun/universal-travel-guide` 구현 `db98e8f352da9ab95bb90e965cc6e365efa3416c`, [PR #32](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/32) 병합 `5b14f81b9d215485e967092a12d3e88cbf42518b`. master로 동기화했다. 배포·인계 증빙은 후속 문서 commit으로 push하며 최종 SHA는 `git log -1`에서 확인한다.
- Sites source: 개발 `3641cddd1e5d92e92a2ed5d45eb6e1dc07ff4af5`, 운영 `8fa7e5a8e3048f7efb299af64d82fd502230c4ba`. [배포 결과](../reports/qa/universal-guide/deployment.json). 환경 분리·공개 범위·기존 DB/Secret 보존.
- typecheck·120개 단위·개발/운영 빌드 통과. Chrome/Chromium 320/430/1440px 새 사용자 6개, 민준 3개, 일정·기록 4개, 안내 페이지 2개 로컬 UI 검사 통과. 개발/공식 운영 주소 각각 3개 화면 크기에서 실제 비회원 가이드→추천 코스→재열기 통과. [전체 브라우저 CI](https://github.com/MySonIsSoldier/gunbeon-yeojido/actions/runs/35564405442)도 통과. 물리 기기/Edge는 미검사다.
- 운영 테스트에서 게스트 페이지 사용 준비까지 1.96/0.72/0.75초였다. 샘플 3개일 뿐 이전 첫 접속 지연이나 상시 서버 안정성 해결 근거로 쓰지 않는다. 이번 운영 검사는 기존 심사 계정/여행/그룹을 변경하지 않았다.

**다음 첫 행동:** 실제 휴대폰에서 상단 가이드→첫 일정 저장→동행 그룹 공유를 처음 이용하는 장병·동행자에게 시도하게 하고 어려운 지점을 기록한다. 외부 LTE 첫 접속 비교와 운영 DB 전체 export/Secret 복구 준비는 계속 후속 과제다. 새 PC는 최신 GitHub와 기존 비공개 환경 복원 절차를 따른다. 제출 자료 v3.2·9/19 이전 묶음은 과거 시점의 자료로 유지했다.

# 9/21 최신: 콘텐츠 확장·지정 심사 계정 안내 운영 반영 완료

사용자의 후속 요청으로 작업을 재개했다. [구현·실제 API·UX·성능 검증](../reports/content_guided_entry_2026-09-21.md). 운영 **v21/env5**, 개발 **v4/env2** 배포 완료. 이전 9/19의 작업 중단은 이력이다.

- 접경 5군 각 6개·춘천/속초 각 3개, 총 36개 추천 코스. 607개 지역 공개자료 유지, TourAPI 국문 7종 목록·추가 페이지·별도 장소 찾기·장소 하나로 일정 만들기. 실제 7개 권역 첫 조회 1,255건(춘천 레포츠 일시 부분 실패), 운영 춘천 387건+다음 페이지 5건 확인. 원문/사진 D1 저장 없음.
- 지정 일반 심사 계정도 정상 인증 후 20초 자동 안내와 실제 화면 5단계 가이드. 운영 360/1440px에서 자동 재생/안내/일정 보기 통과. 기존 여행 4개·그룹 2개·revision 2 및 해시 보존. 민준 독립 사본 계약 유지.
- 계정/여행 bootstrap 단일 no-store 요청, 계정 context 확인 후 그룹/관광조회. 초기 지연·재시도와 통신 제한 추가. 120개 단위·typecheck·build·계정/민준 API·기존 심사 조건 검사·Chromium/Chrome 주요 흐름 통과. 실제 휴대폰/Edge는 미실시. 지연 네트워크 검사는 모의로 별도 구분.
- GitHub `jun/richer-travel-guided-entry` 구현 `6650be2`, PR #31 CI 통과·병합 `c7ccb3897cf66e6a207ffdf05f720d234b8936e9`. 최종 운영 검증·인계 문서는 master 후속 commit/push, 최종 SHA는 `git log -1` 및 원격 일치를 확인한다.
- Sites source 개발 `b1f563a78bb8a4c3f99d807f804f870a61b37e25`, 운영 `c2dc51a132f38fc3f7ed670c9c34804422fb6ed2`. [반환 버전/배포 ID](../reports/qa/content-guided-entry/deployment.json). manifest 환경 분리·Secret·D1·공개 범위 유지. 제출 PDF v3.2와 기존 비공개 이전 ZIP은 당시 자료로 유지했다. 새 PC는 최신 GitHub를 받고 9/19 ZIP에서는 비공개 환경/입력만 복원한다.
- 성능: 운영 루트 첫 요청 4.26초, 반복 0.25~0.28초. Worker의 해당 리다이렉트는 1~12ms, 페이지/자산 지연이 함께 나타나 전달 구간 영향을 추론한다. 서버 오류/타임아웃은 재현하지 못했고 첫 지연은 남아 있다. 이를 완전 해결이나 상시 정상으로 보고하지 않는다.

**다음 첫 행동:** 실제 휴대폰/LTE·다른 네트워크에서 공식 `/`와 `/login` 첫 접속을 비교하고 장애 시각을 확보한다. 반복 시 기존 측정 자료로 호스팅 지원에 문의할 근거를 추가한다. 그다음 장병/동행자의 코스 선택→시간 조정→그룹 계획 관찰을 통해 후보/이미지/설명을 보완한다. 운영 계정 초기화·자동 감시·지원 문의 발송은 실행하지 않았다. 운영 전체 DB export/Secret 복구 준비는 여전히 별도 후속이다.

# 9/19 최신: 1차 심사 완료 후 PC 이전 준비

사용자가 **1차 심사 완료**와 이 컴퓨터의 당분간 작업 중단을 알렸다. 아래 9/17의 미접수·제출 마감 문구는 당시 이력이며 현재 할 일로 반복하지 않는다. 심사 결과·접수 증빙은 별도 확인하지 않았다.

- [PC 이전 안내](pc-transfer.md) · [보존/점검 기록](../reports/pc_handoff_2026-09-19.md). 코드·최종 v3.2 자료·이미지·폰트·agent 문서를 GitHub에 보존한다. 이번 작업은 master의 문서/백업 도구 commit·push이며 앱 PR·새 배포는 없다. 최종 SHA는 `git log -1`과 이전 ZIP의 `MANIFEST.json`을 따른다.
- 과거 브랜치의 미게시 문서 커밋 `6e494a6`도 해당 원격 브랜치에 push했다. 이미 master와 동등한 패치이므로 다시 병합하지 않았다. 중복 압축해제 폴더 21개는 최종 ZIP과 동일하여 삭제 없이 로컬 제외 처리했다.
- 비공개 ZIP은 저장소 밖에 제공한다. 로컬 env 9개 변수·로컬 D1·Git bundle 3개·제출 원본/매뉴얼·검수 입력과 복원 안내를 포함한다. **평문 ZIP**이므로 비공개로 옮긴다. 실제 값은 Git이나 채팅에 출력하지 않는다.
- Sites를 읽기 전용으로 재조회해 운영 **v20/env5 active/public**, 개발 **v3/env2 active/custom**을 확인했다. 운영 source `567ea91c800b3077be41c7bf68fc88b5e2bb7409`, 개발 source `788ddd6b579ad2f4183e147d62e6212c1549d874` 유지. 코드·DB·환경 설정을 변경하거나 재배포하지 않았다.
- **운영 D1 전체 내용, 마스킹된 서버 Secret 원문, 브라우저 전용 여행/쿠키는 로컬 ZIP에 없다.** D1은 테이블 목록만 확인했다. 기존 서버는 유지하며 전체 export/복구 경로와 개인 보관 비밀값 대조는 후속이다.
- 새 PC에서는 Git clone → 비공개 env/필요한 문서 입력 복원 → Node 22 설치·로컬 D1·검사 → 현재 서비스 읽기 확인 순서로 재개한다. 원격 연결/로그인은 새로 확보한다. 기존 Site·도메인·OAuth 앱·심사 계정을 다시 만들지 않는다.
- 이전 안내/도구 `2ee749f4be55ccdf623a1f321a2e7b148479f40d` master push 완료 후 Git bundle 3개 clone·fsck·env 동일성·SQLite 사본 2개·ZIP CRC/SHA256·최종 제출물 복원을 검증했다. [복원 검사](../reports/qa/handoff-2026-09-19/transfer-validation.json). 이 검사 기록의 후속 문서 커밋까지 push한 최종 HEAD를 ZIP에 포함한다. 앱 전체 회귀·새 배포·운영 DB 복원 검사는 실행하지 않았다.

**다음 첫 행동:** 다른 저장장치에 비공개 ZIP을 복사하고 무결성을 확인한다. 브라우저에만 있는 여행이 필요하면 이전 PC에서 계정 연결/JSON 백업을 직접 완료한다. 이후 대회 후속 일정과 사용자의 다음 목표를 확인한다. 점검 항목은 [로드맵](roadmap.md)의 최신 구간을 따른다.

이하는 날짜별 과거 진행 이력이다.

# 9/17 제출 직전 안내 재검토 완료

최신 사용자 제공 접수 항목과 공식 Notion·연결 매뉴얼 19쪽·새 첨부 PPTX를 재검토했다. **제출 PDF는 v3.2·18쪽·1,759,893바이트로 유지**한다. 새 양식은 기존 원본과 바이트 단위로 같고 필수 항목 누락이 없었다. [최종 입력안](submission/2026-round1/portal-copy.md) · [검토 보고서](../reports/final_submission_review_2026-09-17.md) · [검수 결과](../reports/qa/submission-final-2026-09-17/review.json).

- 접수 개요를 공백 포함 **283자**로 확정. 사용자 제공 개인사업자·웹 유형·강원 북부 지역을 유지했다.
- 지정 일반 심사 계정을 기본으로 제출한다. 공개 민준 체험은 실제 그룹 초대/참여가 제한되므로 가이드가 있는 보조 경로다. 지정 계정 초기화나 소셜 연결 변경은 하지 않았다.
- 인증키는 공공데이터포털 마이페이지 첫 화면의 **개인 API 인증키**에서 Encoding/Decoding을 각각 복사한다. ‘인증키 발급현황’에는 인코딩만 표시되는 차이를 고쳤다. 실제 키는 파일/채팅/Git에 넣지 않았다.
- 14:44 KST 새 HTTP 로그인 200·예시 4개·그룹 2개·revision 2 보존, 국문 철원 113건·무장애 상세·기상 8시간 실응답 확인. 기존 브라우저의 저장 일정 보기 확인은 새 HTTP 로그인 증거와 구분한다.
- portal-copy/requirements/README/키트의 과거 v2·16쪽 안내와 ‘저장 후 되돌리기’로 읽히던 시연 문구를 바로잡았다. 새 ZIP은 8,878,567바이트, SHA256 `812de8fa2e00aed073c059182633f38ee207fd1efb56eec3af07b3264836f1a3`이다. PDF/PPTX SHA는 기존 v3.2와 같다.
- **운영 v20/env5·개발 v3/env2 유지**, 앱 코드·D1·환경변수·배포는 변경하지 않았다. 문서 링크·283자·양식·18쪽·10MB·ZIP 무결성·비밀값 미포함 검사만 수행하고 불필요한 앱 전체 검사를 반복하지 않았다.
- 제출 정리 커밋 `9bde68c57bfc0984f78a62621c1fd27a96eab18b`을 `jun/final-submission-review`에서 작성하고 master에 fast-forward하여 push 완료했다. 원격 SHA 일치를 확인했다. 이 완료 상태를 기록하는 후속 문서 커밋은 `git log -1`을 따른다. 이전 앱 PR #30과 운영 배포 SHA는 아래 이력을 따른다.

**다음 첫 행동:** 사용자가 참가 신청 계정에서 이메일·팀원 확인 → 지정 계정/공공데이터포털 키 비공개 입력 → v3.2 PDF 업로드 → 9/21 16:00 KST 전에 최종 제출 → 완료 화면·안내 이메일·접수확인 내역 보관. **현재 실제 포털 입력·업로드·최종 제출은 미실행**이다.

이하 직전 구현 이력이다.

# 9/17 최신: 공개 체험·SNS 카드·제출 설명서 완료

중단됐던 미커밋 구현을 이어서 검토·수정하고 운영에 반영했다. 최신 제출 준비본은 **v3.2 · 18쪽**이며 핵심 기능 5개와 실제 사용 TourAPI 2종을 기준으로 작성했다. [PDF](../output/pdf/gunbeon-2026-round1-functions-v3.2.pdf) · [PPTX/키트](../output/submission/2026-round1-v3/) · [상세 검토](../reports/tester-social-delivery.md). **공모전 접수는 실행하지 않았다.**

## 구현과 GitHub

- 로그인에서 민준 테스터를 선택하면 일반 비밀번호 검증을 거쳐 독립된 예시 계획 4개·그룹 3개·지난 기록 1개를 받는다. 선택형 5단계 가이드는 실제 화면으로 연결한다. 비공개 지정 심사 계정은 초기화하지 않았고 실제 회원 자료도 보존했다. D1 migration 0005를 추가했다.
- ‘이번 휴가 한 장’은 스토리/피드 PNG, 색 선택, 원본 사진 비율과 출처, 공개 링크/QR, 실제 저장한 제안의 반영 카드를 제공한다. 개인 날짜·정확한 시각·만남 장소는 제외한다. 출타 상대시간은 기본 비공개이며 Instagram 최종 게시는 사용자가 완료한다.
- 체험 로그아웃 시 기존 게스트 권한 보존, 체험 계정의 OAuth 연결/실제 그룹 혼합 방지, 로그인 후 목적지 유지, 장소 미조회 시 내보내기 차단과 재시도를 검증했다. 예보 수신 직후의 30초 시계 차이 표시도 수정했다.
- 구현 `ee2f9e4b9677cb509c53f91a39fb04c165c5c040`, 설명서·배포 증빙 `d338bcf957d14b74d6b68a206160abc5d52a69c6`, 회귀 검사 수정 `0c59618`을 push했다. [PR #30](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/30)은 **2026-09-17 05:34:56 UTC 병합 완료**, 병합 SHA `8c260b963d21ad6910fba1ba9c818ac1204427d0`이다. 로컬도 `master`로 동기화했다. 이 인수인계 정리는 후속 문서 커밋으로 push하며 최신 SHA는 `git log -1`을 따른다.

## 배포

- 개발 **v3/env2**, source `788ddd6b579ad2f4183e147d62e6212c1549d874`, deployment `appgdep_6aab75e88a4c8191988fd6293a2e0402`: **05:09:10 UTC succeeded**. 소유자 전용을 유지하며 실제 체험 로그인 200·여행 5·그룹 3을 확인했다.
- 운영 **v20/env5**, source `567ea91c800b3077be41c7bf68fc88b5e2bb7409`, version `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_f579cbdd92a08191882f605f3e39015e`, deployment `appgdep_6aab7697a500819193767635a28b7398`: **05:12:22 UTC succeeded**. https://gunbeon.gangwon.kr 의 HTTPS·공개 접근·기존 Secrets/D1을 유지했다.
- Sites source와 GitHub SHA는 별개다. 앱 배포 후 변경한 것은 QA 스크립트와 문서뿐이며 추가 배포가 필요하지 않다. 검사를 위해 시작했던 로컬 개발 서버는 종료했다.

## 검증과 제출 자료

- typecheck·115개 단위검사·빌드 통과. 실제 D1 체험 격리, 기존 계정 API(정상 로그인 13회 포함), 공개 제안 회귀를 확인했다. PR의 품질 검사 2개와 [전체 브라우저 CI](https://github.com/MySonIsSoldier/gunbeon-yeojido/actions/runs/35185901043)는 모두 통과했다.
- 첫 전체 CI의 예전 SVG 다운로드 검사를 현재 미리보기 → PNG 저장으로 수정했다. 직접 코스·하루 여권의 개인정보 제외 검증과 가이드 25개 화면 검증을 유지했다. [로컬 회귀 증빙](../reports/qa/tester-social/regression-refresh/).
- Chrome/Chromium 360/430/1440px UI 검사를 통과했다. 운영 430px에서 로그인 → 일정 수정 → 익명 제안 → 실제 계획 저장 → 반영 PNG → 출타 시간 선택을 확인했다. [운영 시나리오](../reports/qa/tester-social/production/result.json).
- 운영 Chrome 360/430/1440px에서도 로그인·가이드·일정·그룹·PNG 저장·새로고침 복원을 확인했으며 페이지 오류와 가로 넘침이 없었다. [운영 반응형 증빙](../reports/qa/tester-social/production-responsive/ui.json). 물리 기기·Edge(미설치)·Instagram 실제 게시는 이번에 검사하지 않았다.
- 설명서 18쪽을 개별 시각 검토하고 최종 변경 6/15쪽을 다시 확인했다. PDF 1,759,893바이트, Pretendard 포함. PPTX 3,679,968바이트, 구조·레이아웃·재열기 통과. [검수 기록](../reports/qa/submission-2026-09-17/description-v3-review.json). Microsoft PowerPoint 앱 직접 열기는 미실행이다. 초기 v3/v3.1 후보는 tmp에 보존하고 **최종 v3.2만 현재 접수 준비본**으로 제공한다.

## 다음 첫 행동

1. 운영 `/login`에서 민준 선택 → 7분 가이드를 실제 휴대폰으로 따라가며 파일 공유와 Instagram 링크 스티커를 확인한다.
2. 신청자 메일·팀원 정보, 비공개 API 키·지정 심사 계정을 확인하고 최종 PDF와 이미지를 제출한 뒤 접수 증빙을 보관한다. 마감은 **9/21 16:00 KST**이며 제출 직전 공식 안내를 다시 확인한다.
3. Google/Naver 승인·연결 완료는 사용자 확인과 기존 검증 기록을 따른다. 이번 작업에서는 개인 소셜 동의를 새로 실행하지 않았다. 공식 Notion 안내는 9/17 접근해 재확인했다.

이하는 과거 진행 이력이다.

# 개발 인수인계

## 기능설명서 v2 편집·검수 — 2026-09-16 최신

사용자의 심사위원 관점 피드백을 반영한 **v2가 현재 제출 준비본**이다. [제출 자료](submission/2026-round1/README.md), [편집 검토](submission/2026-round1/editorial-review-v2.md)를 기준으로 이어간다. 아래 13쪽 v1은 제작 이력으로 보존한다.

- 공식 표지·섹션·필수 항목을 유지하고 본문을 Pretendard Regular/SemiBold로 재편집했다. 핵심 기능은 5개, 상세 흐름도 8쪽, 총16쪽이다. 기능 설명을 동작·입력·결과 중심으로 정리했고 화면은 1~2개씩 확대했다.
- 실제 활용 관광공사 API는 국문·무장애2종 그대로다. 빈 행과 반복 footer를 없애고 API·기상·DMZ/보훈·카카오 화면을 추가했다. 저장 전 되돌리기, 게스트 초대 참여, 사용자 선택 날씨 보정을 정확히 설명한다.
- 최종 `output/pdf/gunbeon-2026-round1-functions-v2.pdf`: **16쪽·1,439,903바이트**, 글꼴 실제 포함. `output/submission/2026-round1-v2/`에 PPTX·대표1/상세3/140px로고·OTF/OFL·문서·검수기록, `output/submission/gunbeon-2026-round1-kit-v2.zip`에 전체 자료가 있다. 정확한 SHA는 키트 `validation.json`을 따른다.
- 전16쪽 PDF를 개별 이미지로 열어 확인했고 PPTX 구조/폰트/재열기/레이아웃 검사는 오류·경고0이다. [검수 증빙](../reports/qa/submission-2026-09-16/description-v2-review.json). Microsoft PowerPoint 직접 실행 검사는 하지 않았다.
- 새 게스트2명의 실제 초대·공동여행1개·개인사본을 촬영했다. 기상청8시간 실응답과 DMZ/현충 자료도 추가 촬영. API 응답 조작 없이 검증하고 생성한 임시 그룹만 삭제했다. 지정 심사 계정·운영DB 기존 자료·앱 코드·배포는 그대로다(운영v19/env5).
- [재제작](../scripts/submission/README.md)은 v2 builder→finalizer→PDF export→전페이지검수→package 순서다. 공식 원본9쪽에서 시작한다. Artifact Tool의 cover 내보내기 중앙 crop/테두리 문제는 native OOXML 속성만 보완했고 원본 캡처 픽셀은 바꾸지 않았다. 최종 PDF를 시각검수 기준으로 사용한다.
- 글꼴 OTF/OFL을 `assets/document-fonts/`에 보존했다. 이 PC의 사용자 Fonts에 동일 파일을 추가했고 기존 파일은 덮어쓰지 않았다. PDF 변환은 작업별 fontconfig만 사용한다. 다른 PC의 PPTX 편집자는 먼저 OTF를 설치한다.

**미접수 상태 유지.** 다음은 최종 팀원·메일 인증, 실제 휴대폰 리허설, 비공개 API/일반 심사 계정 입력, 최종 PDF 접수와 증빙 보관이다. 제출 마감은9/21 16:00KST다. 문서 작업으로 앱 단위검사/재배포를 반복하지 않았다.

별도 후속: 새 예보 수신 직후 앱의30초 시계 갱신보다 `fetchedAt`이 앞서 일시적으로 ‘만료’가 뜨는 표시 문제를 발견했다. 실제 시계 갱신 후 정상으로 돌아왔고 문서 촬영에는 정상 상태를 사용했다. [재현과 코드 위치](../reports/qa/submission-2026-09-16/redesign/meta.json)의 `observedUiIssue`를 확인하고 다음 앱 결함 수정에서 처리한다. 이번에는 앱 코드를 변경하지 않았다.

## 1차 제출 자료 제작 — 2026-09-16

**이번 작업은 제출 준비 완료이며 대회 접수 완료가 아니다.** [자료·접수 문서 모음](submission/2026-round1/README.md)을 시작점으로 사용한다. ① 웹·앱 개발 부문 공식 Notion 본문·FAQ와 연결 제출/키 매뉴얼에 실제로 접근해 다시 확인했다. 제출 마감 **9/21(월) 16:00 KST**. 사용자에게 예선 이후 팀원 변경 여부를 물었으며 답변 대기 중이다. 이름/팀원을 추측해 등록하지 않는다.

- 공식 작성용 PPTX의 표지·배경·표·순서를 보존하고 기능 흐름도만 허용된 5개로 복사해 **13쪽 PDF/PPTX**를 제작했다. 대표 이미지 1개·실제 상세 화면 5개·140px 로고·접수 문구·리허설·체크리스트·사진 출처·검수 기록을 ZIP으로 묶었다. 최종 용량·SHA는 `output/submission/2026-round1/validation.json`을 따른다.
- 실제 활용 공사 API는 **KorService2/KorWithService2 2종**. 집중률·중심·연관 API는 표본 시험만 해 본 상태라 실사용 항목에서 제외했다. 대표 API 운영계정은 최신 공식 안내상 선택이다. 인증키는 비공개 포털에만 입력하며 제출 PDF/Git/이미지에 넣지 않는다.
- 운영 **v19/env5**, 소스 `9790ac308766aecae662e71d7bdc0e2b5050fb38`, https://gunbeon.gangwon.kr 유지. 새 배포·코드 변경·Secret 변경 없음. 개발 v2/env2 및 운영 D1을 보존했다.
- 지정 심사 계정의 새 로그인 200, 기존 예시4/revision2는 읽기만 했다. **prepare-judge-account를 다시 실행하지 않는다.** 철원 국문113곳, 꽃밭 국문/무장애 상세, 기상8시간 실응답을 확인했다. [측정 결과](../reports/qa/submission-2026-09-16/live-api.json).
- 실제 Chromium 430×900 운영 화면을 촬영했고 로딩 중 캡처는 제출에서 제외했다. 완료40→41은 같은3곳/3스탬프, 공개 한 수54→55→57→59는 같은 링크에서 실검색·계획저장·반영 POST200으로 이어진다. 게스트 예시는 합성 localStorage이며 API 성공 응답을 mock하지 않았다. 새 테스트 그룹/공개 링크만 정리했다. 실물 휴대폰·현장 방문·사용자 조사 결과로 취급하지 않는다.
- PPTX 원본 글꼴은 맑은 고딕 유지. PDF는 변환 프로세스 범위의 대체 글꼴 설정을 적용하고 실제로 포함된 글꼴 스트림과 한글 표시를 검수했다(ArialUnicodeMS 등, 원본 맑은 고딕 네이티브 렌더라고 주장하지 않음). 구조/재열기 검사와 13쪽 렌더 확인 완료. 재제작은 [빌드 안내](../scripts/submission/README.md)를 따른다. 수정 후에는 PDF도 다시 내보내고 전체 검수/ZIP을 갱신한다.

다음: 팀원·신청 계정/메일 확인 → 실기기 및 5기능 최종 리허설 → 신청자의 인코딩/디코딩 키 비공개 입력 → PDF 업로드/미리보기 → 사용자 확인 후 최종 제출 및 접수 증빙 보관. 포털 제출/기관 이메일 발송을 이번에 실행하지 않았다. 9/20 접수 완료를 목표로 하며 기능 확대보다 결함 수정·운영/DB 복구 경로 확인을 우선한다.

## 운영 도메인 전환 완료 — 2026-09-15 17:33 KST 배포

**운영 주소·로그인·배포의 최신 상태는 이 절이 우선한다.** [전환 검증과 실제 캡처](../reports/custom_domain_live_2026-09-15.md).

- 사용자 Google/Naver/Kakao 새 도메인 등록 완료 확인. 기존 domain ID `appgdom_6aa8d01a4d0481918a5c8ce10d2ed2ba`의 status/provider/SSL 모두 **active, 08:31:56 UTC**. HTTPS 정상 페이지 확인 후 변경했다.
- 공식 **https://gunbeon.gangwon.kr**. 운영 `AUTH_BASE_URL`·`PUBLIC_SITE_URL` 모두 이 origin, **v19/env5**. Google/Naver/TourAPI/Kakao/체험 Secret·운영 D1 보존. 개발은 v2/env2 그대로.
- source `9790ac308766aecae662e71d7bdc0e2b5050fb38`, version `appgprj_6a9e5a33eaa08191a72a52abf77522cc~appgver_1094cb816de48191abd8ac1e8901721b`, deployment `appgdep_6aa902d37c9881919acaabdf9f2d45e1` **succeeded 08:33:36 UTC**. 배포 응답 URL은 기존 `https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site`이며 새 커스텀 도메인의 실제 접속도 별도로 검증했다.
- IAB에서 Google 버튼 → 새 주소 홈 → Google 연결됨 확인. 로그아웃 후 Naver → 기존 예시 계획3·그룹2 복원, 가족 그룹 여행·읽기 전용 일정·실제 Kakao 지도3마커 확인. 계정 연결/병합·여행 수정·심사 계정 초기화 없음. 브랜드 승인/새 동의 검수는 완료로 취급하지 않는다.
- 새 주소 `/api/account`의 google/naver true, 두 실제 start 요청의 새 callback, 공개 about/privacy/terms·OG origin 확인. 기존 chatgpt.site의 providers false는 origin 보호상 의도된 결과다. 소셜 이용자는 새 `/login`을 사용한다. 기존 일반 로그인과 체험 기록 접근을 위해 플랫폼 주소를 삭제하지 않는다.
- 문서·캡처만 변경했으며 앱 코드/단위/빌드를 반복하지 않았다. 배포 대상 검사·HTTPS/API·실제 OAuth/복원/지도 완료. Python 기본 CA 문제는 TLS 검증을 끄지 않고 시스템 curl로 확인했다.
- README·현행 소셜 설정·심사 진입 링크를 새 주소로 갱신하고 commit/push한다. 최종 GitHub SHA는 git log를 따른다. 이전 Naver 검수자료 URL은 과거 촬영 기록이며 제출 직전 새 주소와 정합성을 맞춘다.

다음: 신규 초대 참여·지정 일반 심사 로그인·대표 여행의 운영/예약 정보를 최종 리허설하고 지정 기능설명서·이미지·접수를 마무리한다. Google 브랜드/네이버 검수와 DB 복구 경로 확인을 병행한다. 체험 localStorage를 서버 계정 데이터와 혼동하지 않는다.

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
