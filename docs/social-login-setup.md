# 구글·네이버 로그인 연결하기

현재 개인 아이디·비밀번호 가입/로그인과 계정별 서버 저장은 구현되어 있습니다. Google/Naver 로그인 경로도 구현했지만, 제공자 Client ID/Secret 발급 및 실제 계정 동의 검사는 별도로 해야 합니다. **설정되지 않은 소셜 버튼은 ‘연결 준비 중’으로 표시됩니다.**

**2026-09-15 10:03 KST 확인:** 운영 `/api/account`의 공개 응답은 `google: false`, `naver: false`입니다. 이는 각 ID·Secret·기준 주소의 준비 조건을 아직 충족하지 않았다는 뜻이며, 어떤 값이 없는지는 이 응답만으로 알 수 없습니다. `/about`, `/privacy`는 로그인 없이 HTTP 200과 본문을 확인했습니다. 실제 제공자 로그인·동의·콜백 성공은 아직 확인하지 않았습니다.

사용자가 할 일은 **두 콘솔에서 앱 등록 → 아래 주소 입력 → 발급받은 값 4개를 환경 파일에 저장**입니다. 그다음 agent가 운영 환경 반영과 연결 점검을 진행하고, 사용자 계정의 비밀번호 입력·동의와 제공자 검수 신청은 사용자가 해당 화면에서 진행합니다.

## 먼저 알아둘 것

- 관광공사 API 인증키와 카카오 지도 JavaScript 키로는 소셜 로그인을 연결할 수 없습니다.
- Google과 Naver에서 각각 **Client ID**, **Client Secret**을 발급받습니다. Secret은 공개 코드·스크린샷·GitHub·채팅에 넣지 않습니다.
- 아래 `web/.env.local`은 **개발 PC용**입니다. 기존 TourAPI/Kakao 값은 보존하고 이 항목만 추가합니다. 운영 사이트에도 동일한 변수 이름으로 별도 Secret을 등록해야 합니다. `.env.local`을 수정하는 것만으로 공개 사이트가 바뀌지는 않습니다. 새 PC 준비는 [로컬 설정](local-setup.md)을 따릅니다.
- 개인 아이디로 먼저 가입했다면 **내 계정 → 로그인 연결**에서 소셜 계정을 연결하세요. 로그인 화면에서 새 소셜 계정으로 들어가면 별도 여행 계정이 생깁니다. 이메일이 같다는 이유로 두 계정을 자동 합치지 않습니다.

```dotenv
# web/.env.local — 로컬 개발 PC
AUTH_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

운영 환경의 `AUTH_BASE_URL`은 다음 값입니다. 끝에 `/`는 붙이지 않습니다.

```text
https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site
```

이 값은 로그인 요청을 보낸 사이트 주소와 정확히 같아야 합니다. 로컬은 `http://localhost:3000`으로 접속하세요. `127.0.0.1`, LAN IP, 다른 포트는 현재 로그인 설정과 같지 않습니다. 운영 주소에는 `/login`이나 콜백 경로를 붙이지 않습니다.

## 1. Google

### 등록 화면에 넣을 공개 주소와 로고

| 항목 | 값 |
|---|---|
| 앱 홈페이지 | https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/about |
| 개인정보 안내 | https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/privacy |
| 서비스 이용약관 | https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/terms |
| 140×140 앱 로고 PNG | https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/brand/gunbeon-logo-140.png |
| 로고·홍보 이미지 키트 | https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/brand/gunbeon-brand-kit-v1.zip |

2026-09-15 B ‘다시 만나는 길’ 로고로 확정했습니다. 등록 화면이 파일 업로드를 요구하면 로고 이미지를 내려받아 올립니다. 위 안내 페이지와 로고는 로그인·체험 비밀번호 없이 접근할 수 있도록 공개합니다. 약관 URL은 Google Branding의 이용약관 항목 및 해당 등록 화면에 넣습니다. [Google OAuth 정책](https://developers.google.com/identity/protocols/oauth2/policies)은 공개 홈페이지의 약관·개인정보 링크를 요구합니다. URL 게시만으로 Google/Naver 검수나 별도 약관 동의 기록이 완료되는 것은 아닙니다.

1. [Google Cloud Console](https://console.cloud.google.com/)에 로그인합니다. 프로젝트를 선택하거나 `군번여지도 강원` 프로젝트를 만듭니다.
2. **Google Auth Platform → Branding**에서 앱 이름, 지원 이메일, 개발자 연락 이메일을 입력합니다. 앱 홈페이지는 `https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/about`, 개인정보 안내는 `https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/privacy`를 입력합니다. 승인된 도메인 또는 소유 확인을 요구하면 아래 ‘도메인 확인’ 설명을 따릅니다.
3. **Audience**에서 일반 이용자용 **External**을 선택합니다. 조직 내부용 Internal은 일반 Google 사용자에게 적합하지 않습니다.
4. **Data Access**에서는 현재 구현에 필요한 `openid`만 사용합니다. 이메일, Drive, Gmail, 생일 등의 권한은 필요 없습니다.
5. **Clients → Create Client → Web application**을 선택합니다.
6. **Authorized redirect URIs(승인된 리디렉션 URI)**에 아래 주소를 줄별로 등록합니다.

```text
https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

7. 발급된 ID와 Secret을 `web/.env.local`의 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`에 넣습니다. **Google Secret 원문은 생성 직후에만 볼 수 있으므로 그 화면에서 바로 안전하게 보관합니다.** 분실하면 기존 OAuth Client를 삭제하지 말고 Secret 재발급·교체 기능을 사용합니다. [공식 Client 관리 안내](https://support.google.com/cloud/answer/15549257?hl=en)
8. 개발 서버를 재시작하고 `/login`에서 **Google로 계속하기**를 눌러 시험합니다. 이미 만든 아이디 계정을 사용할 때는 `/account`에서 **Google 연결하기**를 누릅니다.
9. 운영 Secret을 등록한 후 공개 사이트의 콜백도 검사합니다.

현재 방식은 서버 리디렉션 OAuth입니다. JavaScript SDK나 JavaScript origin 설정은 필수가 아닙니다. `redirect_uri_mismatch`가 나오면 주소의 `http/https`, 호스트, 포트, 전체 경로, 마지막 `/`를 대조하세요. [공식 웹 서버 OAuth 안내](https://developers.google.com/identity/protocols/oauth2/web-server)

기본 로그인 범위(`openid/email/profile`)에는 일반 Testing 사용자 수·만료 규칙의 예외가 있으므로, 무조건 ‘100명까지만’ 또는 ‘7일 후 로그인이 모두 만료’라고 해석하지 않습니다. 실제 콘솔의 게시 상태를 확인합니다. [Google Audience 안내](https://support.google.com/cloud/answer/15549945?hl=en)

### 도메인 확인과 일반 공개

Google 브랜드 검수는 홈페이지·개인정보 안내·콜백 주소가 속한 **public suffix 바로 아래 도메인**을 Search Console에서 확인하도록 요구합니다. 홈페이지와 개인정보 안내는 로그인 없이 열려야 합니다. 현재 공개 페이지는 이 접속 조건을 확인했지만, 브랜드 검수 승인을 받은 것은 아닙니다. [브랜드 검수 요건](https://developers.google.com/identity/verification/authentication-verification)

2026-09-15 확인한 [공식 Public Suffix List](https://publicsuffix.org/list/public_suffix_list.dat)에는 `chatgpt.site`가 등록되어 있습니다. 따라서 Google의 설명을 이 주소에 적용하면 승인 도메인은 `ybuser.chatgpt.site`로 해석됩니다. 콘솔이 실제로 이 값을 받는지와 Search Console 소유 확인이 가능한지는 아직 확인하지 않았습니다. 현재 제어하는 개별 사이트 주소만으로 그 상위 주소의 소유 확인까지 된다고 가정하지 않습니다. 콘솔에서 해당 주소의 검증을 완료할 수 없다면 사용자 소유 도메인을 연결한 뒤 홈페이지·개인정보·콜백·`AUTH_BASE_URL`을 함께 변경합니다. **키 발급 전부터 도메인 구매가 필수라고 단정하지 않습니다.**

일반 공개 단계에서는 **Audience → Publish app**과 **Verification Center**의 남은 항목을 확인합니다. `openid`만 쓰는 로그인 범위와 앱 이름·로고의 브랜드 검수는 별개입니다. 테스터 등록이나 버튼 활성화를 브랜드 검수 완료로 기록하지 않습니다. [Google Audience 안내](https://support.google.com/cloud/answer/15549945?hl=en)

## 2. Naver

1. [네이버 개발자센터 애플리케이션 등록](https://developers.naver.com/apps/#/register)을 엽니다.
2. 앱 이름을 `군번여지도 강원`, 사용 API를 **네이버 로그인**으로 선택합니다.
3. 로그인 제공 정보는 **이용자 식별자**만 필요합니다. 별명은 군번여지도 안에서 정하므로 이름·이메일·생일·성별·휴대전화번호는 요청하지 않습니다.
4. 서비스 환경에 **PC 웹**을 추가하고 서비스 URL에 아래 운영 주소를 입력합니다. 모바일 브라우저에서도 같은 웹 서비스로 사용합니다.

```text
서비스 URL
https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site

Callback URL
https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site/api/auth/callback/naver
```

5. PC 웹 콜백은 최대 5개까지 등록할 수 있습니다. 같은 앱으로 로컬도 시험하려면 아래 주소를 추가하고, 서비스 URL에도 로컬 환경을 등록합니다. 별도 개발용 앱을 쓰는 경우 운영용 ID·Secret과 혼동하지 않습니다. [서비스 환경 공식 안내](https://developers.naver.com/docs/common/openapiguide/appregister.md)

```text
http://localhost:3000/api/auth/callback/naver
```

6. **내 애플리케이션**에서 Client ID/Secret을 확인하고 `web/.env.local`의 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`에 넣습니다. [앱 등록 공식 안내](https://developers.naver.com/docs/common/openapiguide/appregister.md)
7. 검수 전에는 앱 등록자 계정 또는 **멤버관리 → 관리자/테스터**에 등록된 계정으로 시험합니다.
8. 일반 이용자에게 공개하려면 **네이버 로그인 검수 상태 → 검수 요청**을 진행합니다. 로그인 버튼 → 네이버 동의 → 가입/로그인 완료 → 별명/내 여행 화면을 캡처합니다. 추가 수집 정보가 있으면 실제 활용 화면도 제출해야 합니다. 현재 구현은 추가 앱 비밀번호 없이 소셜 가입이 완료됩니다. [사전 검수 공식 안내](https://developers.naver.com/docs/login/verify/verify.md)

공식 안내의 검수 결과 회신 예상은 2~3영업일이며 승인 날짜를 보장하지는 않습니다. 서비스 소개에는 공개 `/about` 주소와 실제 이용 화면을 첨부하면 됩니다. 이름·이메일 등 선택 정보를 모두 해제한 현재 범위에서는 그 정보의 활용처 증빙은 필요 없지만, 로그인 적용 과정 증빙은 필요합니다. 운영 시작 후에는 기존 네이버 앱을 임의로 새 앱으로 교체하지 않습니다. 이용자 식별자가 앱마다 달라 기존 계정과 연결되지 않을 수 있습니다. [검수와 앱 변경 안내](https://developers.naver.com/docs/login/verify/verify.md)

## 3. 운영 반영과 확인 순서

사용자가 키를 발급한 후 agent에게 **‘환경 파일에 넣었다’**고만 알려도 됩니다. 키 원문을 채팅에 붙여넣을 필요가 없습니다.

1. 로컬 변수 **이름과 설정 유무만** 검사하고 서버를 재시작합니다.
2. 각 제공자로 새 로그인, 로그아웃, 재로그인, 기존 아이디 계정 연결을 시험합니다.
3. 운영 Sites 환경에 5개 변수를 추가하고 기존 TourAPI/Kakao/테스트 Secret을 보존합니다.
4. 공개 주소에서 별도 브라우저로 다시 로그인해 내 여행이 같은 계정에 연결되는지 확인합니다.
5. 네이버 검수·Google 콘솔 게시/브랜드 요건의 실제 완료 여부를 기록합니다. 버튼 활성화만으로 실로그인 성공이라고 보고하지 않습니다.

| 보이는 상황 | 먼저 확인할 곳 |
|---|---|
| ‘연결 준비 중’ | 해당 환경의 ID·Secret·`AUTH_BASE_URL` 설정 유무. 로컬만 넣었다면 운영 값은 별도 반영 |
| Google `redirect_uri_mismatch` | Google Client에 등록한 콜백 전체 주소와 실제 접속 주소 |
| 앱 등록자만 네이버 로그인 가능 | 네이버 멤버관리의 테스터 등록, 일반 공개용 검수 상태 |
| 소셜로 들어왔는데 기존 여행이 없음 | 별도 계정으로 가입했는지 확인. 기존 아이디로 로그인한 뒤 **내 계정 → 로그인 연결** 사용 |
| 콜백 후 ‘소셜 로그인이 완료되지 않았어요’ | 같은 브라우저에서 다시 시작하고, 제공자 동의 취소·앱 설정·서버 오류를 구분해 검사 |

테스트 결과에는 환경(로컬/운영), 제공자, 신규 가입/기존 계정 연결/재로그인, 성공 여부를 각각 남깁니다. 비밀번호·토큰·인증 코드가 포함된 URL은 캡처나 로그에 남기지 않습니다.

## 4. 지금 쓸 수 있는 임시 개인 계정

- `/login` → **계정 만들기** → 별명, 영문 소문자·숫자 아이디(4~30자), 비밀번호(10~128자), 체험 초대 비밀번호 `1234`를 입력합니다.
- 개인 비밀번호는 `1234`가 아닙니다. 서버에는 salt를 사용하는 scrypt 해시만 저장합니다.
- **회원가입 없이 체험하기**는 종전과 같은 기기 저장 방식입니다. 개인 계정과 다릅니다.
- 기존 기기 기록은 `/account` → **이 기기의 여행·그룹 연결** → **가져오기 확인**으로 옮깁니다. 같은 ID의 다른 여행은 사본으로 보관합니다.
- 초기 버전은 비밀번호 재설정 메일이 없습니다. 비밀번호 관리자에 보관하고, 소셜 연결이 준비되면 기존 계정에 연결하세요.

## 구현 근거와 자산

Sites의 현재 인증 지침은 ChatGPT SIWC를 제공하지만 Google/Naver 전용 연결 경로는 제공하지 않습니다. 기존 앱에 요청된 외부 로그인 경로를 별도로 추가했으며 플랫폼 소유 `/callback`, `/signin-with-chatgpt`, `/signout-with-chatgpt`는 사용하지 않습니다.

Google은 서버 코드 교환, PKCE S256, 일회성 state·브라우저 쿠키, 서명/issuer/audience/expiry/nonce를 검증한 ID Token과 UserInfo subject 일치 검사를 사용합니다. Naver는 서버 코드 교환 후 회원정보 API의 앱별 고유 ID를 사용합니다. 소셜 액세스 토큰은 DB에 저장하지 않습니다. [Google OIDC](https://developers.google.com/identity/openid-connect/openid-connect), [네이버 로그인 API](https://developers.naver.com/docs/login/api/api.md)

- Google G: [공식 PNG](https://developers.google.com/static/identity/images/g-logo.png), [버튼 가이드](https://developers.google.com/identity/branding-guidelines). 적용 파일 `web/public/brand/google-g.png`.
- Naver N: [공식 PNG ZIP](https://developers.naver.com/inc/devcenter/downloads/bi/NAVER_login_KR.zip)의 `NAVER_login_Light_KR_green_icon_H48.png`. 적용 파일 `web/public/brand/naver-n.png`. [버튼 가이드](https://developers.naver.com/docs/login/bi/bi.md)의 녹색 #03A94D와 원본 비율을 사용합니다.
