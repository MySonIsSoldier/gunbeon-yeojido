# 새 도메인 등록과 Sites 한도 확인

2026-09-15 **전환 완료**. 대상은 https://gunbeon.gangwon.kr 이며 DNS·SSL 모두 active다. 사용자 Google/Naver/Kakao 주소 추가 후 운영 v19/env5 전환과 두 소셜 로그인·기존 기록·지도를 확인했다. 아래 주소 추가 절차를 다시 실행할 필요는 없다. Google 브랜드 검수와 네이버 최종 검수는 별도 후속이다. [실제 검증·캡처](../reports/custom_domain_live_2026-09-15.md)

## 사용자 주소 등록 절차 — 완료 기록

아래는 새 키 발급이 아니라 **현재 사용하는 앱에 새 주소를 추가**하는 절차다. 기존 chatgpt.site·localhost 등록값은 전환 검증 전까지 보존한다. SSL 발급을 기다리는 동안 1~3의 주소 등록은 먼저 할 수 있다.

### 1. Google 로그인 콜백 추가

1. [Google Cloud Console](https://console.cloud.google.com/)에서 현재 Client ID를 발급한 프로젝트를 선택한다.
2. **Google Auth Platform → Branding → 승인된 도메인**에 `gunbeon.gangwon.kr`를 추가한다. `https://`나 경로를 붙이지 않는다.
3. **Clients → 현재 사용 중인 웹 애플리케이션 → 승인된 리디렉션 URI**에 아래 주소를 추가하고 저장한다.

```text
https://gunbeon.gangwon.kr/api/auth/callback/google
```

현재 구현은 서버 OAuth 방식이므로 **승인된 JavaScript 원본**은 이번 연결의 필수 입력이 아니다. 새 ID/Secret을 발급하지 않는다. 설정 변경은 즉시 반영되지 않을 수 있다. [Google Client 설정](https://support.google.com/cloud/answer/15549257?hl=ko), [서버 OAuth](https://developers.google.com/identity/protocols/oauth2/web-server)

### 2. 네이버에 서비스 주소와 콜백 추가

1. [NAVER Developers](https://developers.naver.com/) → **Application → 내 애플리케이션 → 기존 군번여지도 앱 → API 설정**으로 이동한다.
2. **로그인 오픈 API 서비스 환경**의 남는 서비스 URL 슬롯에 새 주소를 입력한다. 필요하면 **환경 추가 → Mobile 웹**을 이용한다.
3. 새 콜백도 추가하고 하단 **수정**으로 저장한다.

| 항목 | 추가할 값 |
|---|---|
| 서비스 URL | `https://gunbeon.gangwon.kr` |
| Callback URL | `https://gunbeon.gangwon.kr/api/auth/callback/naver` |

서비스 URL은 최대 2개, 콜백은 PC 웹 5개·Mobile 웹 5개를 등록할 수 있다. 이 PC/Mobile 구분은 입력 슬롯이며 검증 로직은 같다. 기존 앱을 유지하여 기존 회원 식별자를 보존한다. [복수 도메인 공식 안내](https://help.naver.com/service/23029/contents/20552?lang=ko&osType=COMMONOS), [설정 위치](https://help.naver.com/service/23029/contents/19600?lang=ko&osType=COMMONOS)

검수 신청 URL과 캡처는 최종 운영 주소에 맞춘다. 도메인 변경만으로 재검수가 반드시 필요하거나 항상 면제된다고 단정할 공식 근거는 확인하지 못했다. 저장 후 콘솔 안내와 현재 검수 상태를 따른다. [검수 안내](https://developers.naver.com/docs/login/verify/verify.md)

### 3. Kakao 지도 도메인 추가

1. [Kakao Developers](https://developers.kakao.com/)에서 기존 군번여지도 앱을 선택한다.
2. **앱 설정 → 앱 → 플랫폼 키 → 현재 JavaScript 키 → JavaScript SDK 도메인**으로 이동한다.
3. `https://gunbeon.gangwon.kr`를 추가하고 저장한다. 경로는 넣지 않는다.
4. 이미 활성화한 **카카오맵 사용 설정 ON**과 기존 도메인은 유지한다.

이 설정은 카카오 로그인과 관계없이 지도가 새 주소에서 작동하게 하는 허용 목록이다. [지도 시작 가이드](https://apis.map.kakao.com/web/guide/), [플랫폼 키 설정](https://developers.kakao.com/docs/ko/app-setting/app)

## Google 서비스 이름·로고를 표시하기 위한 별도 작업

기본 로그인 시험과 브랜드 검수는 구분한다. **새 도메인의 HTTPS와 공개 페이지가 정상 동작한 뒤** Branding의 홈페이지·정책 링크를 새 주소로 맞춰 검수한다.

| 항목 | 값 |
|---|---|
| 홈페이지 | `https://gunbeon.gangwon.kr/about` |
| 개인정보처리방침 | `https://gunbeon.gangwon.kr/privacy` |
| 서비스 약관 | `https://gunbeon.gangwon.kr/terms` |

[Search Console](https://search.google.com/search-console/about) → **속성 추가 → 도메인**에서 `gunbeon.gangwon.kr`를 입력한다. 발급되는 `google-site-verification=...` 값을 Hosting.kr의 **TXT / 호스트 @**에 새로 추가하고 Search Console에서 소유 확인을 누른다. 앞서 설정한 Sites TXT 두 개와 다른 값이므로 기존 값을 교체하지 않는다. DNS 소유 확인은 HTTPS가 준비되기 전에도 할 수 있다.

Google Branding의 검증 절차를 따라 승인 후 게시한다. 기존 chatgpt.site 주소의 소유 확인 때문에 검수가 막히면 오류 내용을 확인한 뒤 개발/운영 클라이언트 분리를 검토한다. 동작 중인 기존 콜백을 먼저 삭제하지 않는다. [Branding 안내](https://support.google.com/cloud/answer/15549049?hl=ko), [Search Console DNS 확인](https://support.google.com/webmasters/answer/9008080?hl=ko)

## 이후 운영 전환 절차 — 완료 기록

위 세 서비스에 새 주소를 저장한 뒤 완료 사실을 알려주면, 다음 작업에서 HTTPS 상태를 다시 확인하고 운영 `AUTH_BASE_URL`·`PUBLIC_SITE_URL`을 함께 전환·재배포한다. 기존 Google/Naver 키와 D1은 유지한다. 현재 설정만 먼저 바꾸면 기존 주소의 소셜 로그인이 비활성화될 수 있어 미리 변경하지 않았다.

새 주소에서 로그인·기존 여행·지도·그룹 초대·공개 정책 페이지를 확인한다. 도메인별 쿠키가 달라 다시 로그인해야 한다. 서버 계정 기록과 체험용 브라우저 기록을 구분하고 기존 주소를 바로 폐쇄하지 않는다. HTTPS 대기가 지속되면 기존 도메인 ID로 상태를 확인해 Sites 지원에 문의할 근거를 준비하며, 도메인을 중복 등록하지 않는다.

## Sites의 현재 공개 한도

아래에서 '숫자 미확인'은 무제한이라는 뜻이 아니다. OpenAI 공식 문서와 현재 제공되는 Sites 도구 응답을 확인했지만, 계정별 한도 수치가 도구에 없었다. 계정 화면 확인도 시도했으나 이 환경의 브라우저가 Sites 관리 페이지를 불러오지 못해 실제 표시값은 미확인이다.

| 항목 | 확인 결과 |
|---|---|
| 공개 유지 기간 | 대화 종료 후에도 남는 배포. 고정 만료일·비접속 자동 중단 기간은 공식 문서에서 확인하지 못함 |
| 최대 동시 접속자 | 숫자 미확인 |
| 일/월 최대 방문자 | 숫자 미확인 |
| 일/월 전송량·대역폭 | GB/TB 수치 미확인 |
| 일일 요청 수·요청 속도 | 숫자 미확인. 개인 Cloudflare Free의 요청 한도를 Sites에 적용하지 않음 |
| D1 DB 저장량 | 사이트당 10GB |
| R2 파일 저장량 | 사이트당 고정 저장 상한 없음. 요금제별 총 사용 제한이 없다는 뜻은 아님. 현재 군번여지도는 R2 미연결 |
| 가동률 보장 | 30일 무중단·가동률 SLA는 확인하지 못함 |

저장 용량·배포 지속성 근거: [Sites 공식 문서](https://learn.chatgpt.com/docs/sites). DB 10GB는 트래픽 10GB나 이용자 수 10,000명을 의미하지 않는다.

Sites는 public beta이며 계정의 **모든 Sites에 합산 적용되는 요금제별 한도**가 있다. 한도는 베타 중 바뀔 수 있고, 도달하면 새 Site 생성·저장 공간 추가·사용량이 많은 Site의 공개 유지가 제한될 수 있다. 생성/호스팅은 지원 요금제에 포함되지만 무제한이나 영구 무료로 해석하지 않는다. [공식 베타 한도 안내](https://help.openai.com/en/articles/20001339), [요금 안내](https://learn.chatgpt.com/docs/pricing)

### 계정별 숫자 확인 방법

1. 서비스를 만든 계정으로 [ChatGPT Sites](https://chatgpt.com/sites)에 접속한다. 사이드바에서는 **더 보기 → Sites**로 접근할 수 있다.
2. Sites 화면에 표시되는 현재 사용 한도·경고를 확인한다. 제공되는 화면은 계정/출시 상태에 따라 다르므로 확인하지 않은 '한도 메뉴' 이름을 가정하지 않는다.
3. 실제 방문 실적은 군번여지도 **더 보기(⋯) → Analytics**에서 방문자/페이지뷰를 확인한다. 이 값은 사용한 실적이며 최대 허용량이 아니다. [Analytics 안내](https://learn.chatgpt.com/docs/sites#review-site-analytics)
4. 한도 숫자가 보이지 않으면 지원에 아래 질문을 전달한다. 이번 작업에서 문의를 발송하지는 않았다.

> 관광데이터 공모전 심사를 위해 현재 계정의 ChatGPT Sites를 약 한 달 운영하려고 합니다. 현재 요금제의 공개 사이트 유지 기간, 비접속 자동 중단 여부, 최대 동시 접속자, 월 방문자/요청 수, 월 전송량, 계정 전체 저장 한도 및 한도 초과 시 공개 사이트 동작을 확인하고 싶습니다. 해당 수치와 사용량을 확인할 수 있는 화면도 안내 부탁드립니다.

현재 운영 Site는 active·public·관리자/플랫폼 비활성화 없음으로 확인했다. 심사 기간 기존 Sites 유지 권고는 운영 판단이며, 아직 확인하지 못한 계정별 최대 수용량을 보증하는 뜻은 아니다.
