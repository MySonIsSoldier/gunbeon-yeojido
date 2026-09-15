# 개발 환경 분리와 커스텀 도메인 전환 준비

## 현재 결과

- 개발 전용 Sites를 생성·별도 DB로 배포했다. **https://gunbeon-development.ybuser.chatgpt.site**, 소유자 전용 접근. 실제 이용자용 공개 서비스가 아니며 ChatGPT 소유자 로그인이 필요하다.
- 개발 프로젝트 `appgprj_6aa8c98dd2a08191a61d18c5e318a57f`, saved version `appgprj_6aa8c98dd2a08191a61d18c5e318a57f~appgver_9c5329f1b8f8819198b0f9c0b3204e01` **v1**, source `7a26875ba8af48454e39f03ce79c933c359e82d5`, deployment `appgdep_6aa8cc19acf8819196395be690693a38` **succeeded 2026-09-15 04:40:15 UTC**, env revision2.
- 개발 코드는 GitHub 기능 커밋 `e58c993`의 web/에서 내보냈다. 개발용 manifest의 project_id만 해당 Site로 유지한다. 별도 D1의 17개 테이블을 확인했고 accounts는 비어 있다. 운영 계정·DB 원문을 가져오지 않았다.
- 개발 Secret은 새 TEST_SESSION_SECRET과 1234 체험 암호, 기존 승인된 관광공사·지도 키를 사용한다. 개발 Naver/Google 키는 넣지 않았다. 개발/운영의 새로운 도메인은 Kakao SDK 도메인 추가가 필요하다.
- 운영은 기존 **v18/env revision3** 그대로다. 사용자 요청의 구매 도메인 철자 확인과 Hosting.kr 로그인이 없어 커스텀 도메인 등록·DNS·운영 AUTH_BASE_URL 변경은 아직 하지 않았다.

## 원인과 변경

하나의 Sites에 도메인 별칭만 붙이면 코드·DB·Secret·배포가 동일해 개발/운영 분리가 되지 않는다. 기존 사용자 데이터는 운영 프로젝트에서 유지하고 개발을 새 프로젝트로 분리했다.

`AUTH_BASE_URL`은 한 origin만 허용하는데 기존 providerReady는 키만 확인해 다른 호스트에서도 버튼이 켜졌다. 요청 origin과 설정 origin을 정확히 비교하도록 버튼·시작·콜백을 통일했다. state/cookie/Origin 검사를 완화하지 않았다.

metadataBase의 고정 주소를 PUBLIC_SITE_URL → AUTH_BASE_URL → 기존 주소 순의 검증된 설정으로 바꿨다. SITE_ENVIRONMENT=development이면 제목에 [개발], robots에 noindex/nofollow를 표시한다. `scripts/check-site-target.mjs`는 선택 환경과 manifest가 다르면 실패하여 개발 소스를 실수로 운영에 배포하는 것을 줄인다.

## 검증

- TypeScript·102개 단위 검사 통과. 개발 사이트에 배포한 정확한 소스의 빌드·패키징 성공.
- 로컬 localhost:3000에서 /about의 OG 이미지는 localhost 기준, Naver 준비 상태 true. 127.0.0.1:3000은 false. [읽기 전용 실검사](qa/custom-domain/local-origin-check.json).
- 환경 대상 확인의 production/development 정상 사례와 일부러 잘못된 development→운영 checkout 거부를 확인했다.
- IAB에서 개발 URL은 ChatGPT 로그인 화면으로 보호됨을 확인했다. 사용자 브라우저에 OpenAI 세션이 없어 앱 내부 로그인/화면 검증은 완료했다고 주장하지 않는다.
- 신규 배포의 설정 검증은 Sites가 발급한 소유자용 QA 인증으로 API/HTML만 읽어 완료했다. [실제 응답](qa/custom-domain/development-live.json): HTTP200, 제목 [개발], robots noindex/nofollow, 개발 도메인의 OG 이미지, Google/Naver 준비 상태 false, 앱 계정 null. 개발 회원을 생성하지 않았으며 토큰은 파일·Git·로그에 기록하지 않았다. 실제 브라우저 로그인과 구분한다.
- [PR28](https://github.com/MySonIsSoldier/gunbeon-yeojido/pull/28)의 품질 검사2개와 [전체 키 없는 브라우저 검사](https://github.com/MySonIsSoldier/gunbeon-yeojido/actions/runs/34929598340) 모두 통과했다. 실제 새 도메인 검사를 뜻하지 않는다.
- 로컬 Python의 기본 CA 저장소 문제는 시스템 curl의 정상 TLS 검증으로 검사한다. 인증서 검증을 끄지 않는다. TS 플래그 없는 단독 node test 명령은 인식 실패하여 저장소의 지정 플래그로 실행했고 3개 origin 검사가 통과했다.

## 도메인 확인 대기

구매 문장에는 gunbeon.gangwon.kr, 실제 이용 문장에는 gunbeon.ganwon.kr가 있어 사용자에게 확인을 요청했다. 공개 DNS에서는 gunbeon.gangwon.kr SOA/NS가 확인되지만 실제 변경 대상은 사용자 답을 받은 뒤 확정한다.

읽기 전용 DNS 조사: NS ns1~4.hosting.co.kr, 기존 A 75.2.85.42/99.83.196.71, CNAME 없음. 이 값은 관측된 기존 값이며 **Sites 연결 대상이 아니다**. Sites custom domain이 반환하는 apex A와 모든 검증 레코드만 입력한다. hosting.kr 화면은 로그아웃 상태다.

연결 구조·정확한 콘솔 항목·계정/PWA 이전 주의점·롤백은 [도메인 연결 안내](../docs/custom-domain-setup.md)에 정리했다. 실제 DNS/HTTPS 활성화와 새 도메인 OAuth·Kakao·공유 확인은 남아 있다. 이전 도메인 Naver 캡처는 전환 후 다시 준비한다.
