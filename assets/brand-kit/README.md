# 군번여지도 강원 · 다시 만나는 길

2026-09-15 사용자가 선택한 **B**를 기반으로 정리한 이미지 키트 v1입니다. 둥근 G 모양의 길과 살구색 합류 지점은 ‘함께 짜는 휴가, 다시 만나는 길’을 표현합니다.

## 파일 선택

| 용도 | 파일 | 크기 |
|---|---|---|
| 서비스 등록 기본 로고 | v1/logo-140.png | **140×140**, 흰 배경 PNG |
| 투명 배경 심벌 | v1/symbol-transparent-140.png, 512.png, 1024.png | 파일명에 표시한 정사각형 크기 |
| 앱·프로필 로고 | v1/logo-180.png, 192.png, 512.png, 1024.png | 흰 배경 정사각형 |
| PWA 마스크 아이콘 | v1/icon-maskable-512.png | 512×512, 안전 여백 추가 |
| 편집·인쇄 원본 | v1/symbol.svg | 벡터, 크기 제한 없음 |
| 단색·반전 원본 | v1/symbol-monochrome.svg, symbol-white.svg | 벡터 |
| 단색 PNG | v1/symbol-teal-512.png, symbol-white-512.png | 512×512, 투명 배경 |
| 가로형 서비스 로고 | v1/wordmark-horizontal.png | 1200×320, 투명 배경 |
| 어두운 배경 가로형 | v1/wordmark-dark.png | 1200×320 |
| 서비스 대표·링크 미리보기 | v1/representative-1200x630.png | 1200×630 |
| SNS 정사각형 | v1/social-square-1080.png | 1080×1080 |
| 스토리·세로 홍보물 | v1/story-1080x1920.png | 1080×1920 |

![확정 로고](v1/logo-140.png)

## 사용 규칙

- 작은 앱 아이콘에는 심벌만 사용합니다. 140px에 서비스명까지 억지로 넣지 않습니다.
- 기본 색상은 청록 **#246568**, 살구 **#D68755**입니다. 글자색은 **#273B40**, 어두운 배경은 **#1E393C**입니다.
- 심벌 비율과 두 조각의 간격을 유지합니다. 돌리거나 늘리거나 그림자·외곽선을 추가하지 않습니다.
- 제공된 정사각형 파일의 여백을 유지합니다. 다른 물체·글자와는 심벌 너비의 1/8 이상 간격을 둡니다.
- 어두운 배경에는 흰색 단색 심벌 또는 반전 가로형을 사용합니다. 투명 PNG에 체크무늬는 포함되어 있지 않습니다.
- 대표 이미지의 문구는 서비스 소개용입니다. 공모전 필수 ‘상세 화면 3~5장’이나 기능설명서를 대체하지 않습니다. 등록처가 별도 크기·파일 용량을 요구하면 해당 규격으로 추가 출력합니다.

## 원본·재현·출처

초기 아이디어는 내장 image_gen으로 생성한 B 시안입니다. 프롬프트와 원본은 `reports/brand-concepts/2026-09-15/`에 보관합니다. 후속 이미지 생성에서 투명도·평면 색상 요건이 충족되지 않아, 최종 앱 자산은 선택한 G/합류 형태를 기반으로 SVG 도형을 정리했습니다. AI 생성 PNG를 투명 원본이라고 표시하지 않습니다. `source/symbol.svg`가 확정 마스터이며 모든 최종 PNG는 이 파일에서 렌더링했습니다.

타이포는 **Pretendard Variable 1.3.9**, SIL Open Font License입니다. [공식 저장소](https://github.com/orioncactus/pretendard), [배포 폰트](https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2). 원본 폰트와 라이선스를 source/에 동봉했습니다. 실물 사진·한국관광공사 CI·타사 로고는 이 키트에 사용하지 않았습니다.

GitHub 저장소의 web/에서 `node scripts/export-brand-kit.mjs`를 실행하면 v1/의 크기별 PNG·SVG·manifest를 재생성합니다. Node22, npm ci, Playwright Chromium이 필요합니다. 네트워크·API 키·이미지 생성 호출 없이 재현합니다. 폰트를 포함하므로 OS 폰트에 의존하지 않습니다. 최종 서비스에 들어간 파일은 web/public/brand 및 web/public/icon*에 복사한 동일 자산입니다.
