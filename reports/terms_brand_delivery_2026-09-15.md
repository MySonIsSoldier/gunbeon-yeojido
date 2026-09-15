# 공개 이용약관과 확정 B 로고

## 범위

- 사용자 요청: 서비스 이용약관 링크 추가, 로고 B ‘다시 만나는 길’ 선택. 이전 요청의 140×140 포함 이미지 키트 제작을 이어서 수행.
- /terms는 로그인·체험 비밀번호 없이 공개한다. /login·/account, /about, /privacy, 앱 하단에서 연결한다. 로그인 후 개인 데이터의 공개 범위는 변경하지 않는다.
- 실제 운영팀명, 무료 테스트 상태, 체험/계정 저장, 여행 추정치, 그룹/공개 공유, 이용자 콘텐츠 권리, 제한·변경·문의 절차를 반영한다.
- 약관 동의 기록/자동 탈퇴/Google·Naver 실제 연결·검수를 새로 완료했다고 표시하지 않는다. 현재 문의는 조직 GitHub이며 개인정보를 공개 이슈에 적지 않도록 안내한다. 전용 비공개 문의 창구는 후속 운영 준비 항목이다.

## 확인 자료

2026-09-15 공식 자료와 현재 구현을 대조했다.

- [Google OAuth 정책](https://developers.google.com/identity/protocols/oauth2/policies): 공개 홈페이지 기능 설명과 이용약관/개인정보 링크. 링크를 게시하는 일과 브랜드 검수 승인은 별개.
- [Naver 개발가이드](https://developers.naver.com/docs/login/devguide/devguide.md): 로그인 플러스의 약관 동의 대행은 현재 일반 OAuth의 구현 범위와 구분.
- [국가법령정보센터 약관법](https://law.go.kr/LSW/lsInfoP.do?ancYnChk=0&lsId=000667): 명확한 고지, 불공정한 면책·일방적 변경·전속관할을 피하고 법정 권리를 보존하도록 검토.

## 브랜드

[키트 안내](../assets/brand-kit/README.md), 마스터 SVG, 투명/흰 배경 PNG, 140/180/192/512/1024 크기, PWA maskable, 가로형/반전형, 1200×630·1080×1080·1080×1920 이미지 제공. source 폰트·OFL·재현 스크립트 포함.

앱 Brand, 브라우저 아이콘, Apple touch icon, PWA, 대표 미리보기, 공개 다운로드에 확정 B를 적용한다. 개인 공개 한 수 페이지는 해당 여행의 제목을 유지하며 일반 브랜드 이미지를 상속하지 않는다.

## 검사·게시

- TypeScript·단위99개·프로덕션 빌드 통과.
- Chromium151 320/430/1440px: 익명 /terms200·본문10절·소개/로그인 약관 링크·공개 로고/ZIP 다운로드, 개인 /api/account/state·/api/places401 보존. 가로 넘침·페이지 오류 없음. [화면과 결과](qa/terms-brand-2026-09-15/summary.json).
- PNG16종의 실제 픽셀 크기와 투명 파일의 모서리 alpha0 확인. [자산 검증](qa/terms-brand-2026-09-15/assets.json). 로고·대표·세로 이미지 및 약관/로그인 캡처를 직접 시각 확인했다. 물리적 휴대폰·현재 Edge 검증은 별도로 수행하지 않았다.
- 공개 Sites **v18**, source `b82711477d649f41896a7a32fbc07aca15f4aed1`, 배포 `appgdep_6aa8c0e2a47081918d52644711074df3` succeeded 2026-09-15 03:52:29UTC, env revision2. 공개 정책과 데이터 스키마·비밀값 유지. GitHub web과 소스 트리 일치.
- [서비스 이용약관](https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/terms), [140 PNG](https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/brand/gunbeon-logo-140.png), [키트 ZIP](https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/brand/gunbeon-brand-kit-v1.zip). 기존 Sites 탭에 약관 페이지 열기를 요청했다.
- GitHub 기능 `aacbe9b`, 문서 `fa1773f`, [PR27](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/27). 후속 최종 커밋은 git log로 확인한다.
- PR27 병합 `ca55db0d344501df65cbd48cf9c6312a93fccfe8`, 2026-09-15 03:56:50UTC. 품질 검사2회 및 [전체 브라우저 CI](https://github.com/MySonIsSoldier/gunbeon-yeojido/actions/runs/34926513232) 5분46초 통과. 최종 전달 기록과 준비 완료 상태로 다시 촬영한 로그인 이미지, PNG 알파 검증을 master에 후속 push한다.
