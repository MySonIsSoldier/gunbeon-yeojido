# 군번여지도 강원 · 1차 기능설명서 v3.2

**2026 관광데이터 활용 공모전 ① 웹·앱 개발 부문**. 마감 2026-09-21(월) 16:00 KST. 운영 v20/env5 기준. 자료 준비본이며 **최종 접수는 아직 하지 않았다.**

## 사용할 자료

| 파일 | 용도 |
|---|---|
| [gunbeon-2026-round1-functions-v3.2.pdf](gunbeon-2026-round1-functions-v3.2.pdf) | 제출용 기능설명서. 18쪽, 1.76MB, 10MB 이하 |
| [gunbeon-2026-round1-functions-v3.2.pptx](gunbeon-2026-round1-functions-v3.2.pptx) | 수정 가능한 편집 원본. 수정하면 PDF도 다시 내보내 검수 |
| images/representative-1200x630.png | 대표 이미지 1장 |
| images/detail-01 ~ detail-03 | 일정 보기·복귀 여유·공개 제안 상세 이미지 3장. 설명서 4쪽과 동일 |
| images/logo-140.png | 140×140 등록 로고 |
| fonts/ | PPTX 편집용 Pretendard 원본 OTF와 SIL OFL 라이선스 |
| [PORTAL-COPY.md](PORTAL-COPY.md) | 소개·핵심 기능·API·지역특화 접수 문구 |
| [CHECKLIST.md](CHECKLIST.md) | 최종 팀원·메일 인증·비공개 키 입력·접수 확인 |
| [REHEARSAL.md](REHEARSAL.md) | 팀 내부 핵심 5기능 시연안 |
| [REQUIREMENTS.md](REQUIREMENTS.md) | 공식 안내의 필수·선택 요건 |
| [IMAGE-SOURCES.md](IMAGE-SOURCES.md) | 실제 화면·사진·지도 출처 |
| [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md) | 심사 관점 검토와 v3 편집 결정 |
| validation.json / selected-images.json | 최종 크기·해시·검수·사용 이미지 목록 |

접수에는 **지정 PDF**를 사용한다. 대표·상세 이미지는 PDF 안에도 있다. ZIP/PPTX/이미지 모두 필수 업로드라는 뜻은 아니다. 별도 이미지 칸이 있을 때 해당 PNG를 사용한다. 공식 안내에서 별도 시연 영상 필수 조건은 확인하지 못했다.

## v3 개정 내용

- Google·네이버 로그인/계정 연결, 민준 체험/선택형 가이드, SNS 이미지/공개 한 수 반영을 기존 기능1·5에 추가했다. 새6·15쪽은 실제 로컬 앱/D1의 가상 시나리오다.

- 공식 표지·섹션·필수 항목을 보존하고 본문을 Pretendard로 정리했다.
- 핵심 기능은 5개, 흐름도는 10쪽이다. 주요 화면을 1~2개씩 확대하고 입력→행동→결과를 설명했다.
- 관광공사 실사용 API 2종의 빈 행을 제거하고 국문·무장애 데이터의 쓰임과 실제 화면을 배치했다.
- 기타 데이터는 통일부·보훈부 자료, 기상청 예보, 카카오맵의 적용 화면으로 설명했다.
- 차별성 3개와 발전계획 3단계를 구분했다. 반복 검수일·출처 문구·불필요한 경고형 문장을 제거했다.

PDF에는 Pretendard가 포함돼 별도 폰트 설치 없이 열 수 있다. PPTX를 다른 PC에서 편집할 때는 fonts/의 OTF를 먼저 설치한다. 캡처의 내용은 변경하지 않고 필요한 영역만 PowerPoint의 자르기로 확대했다. 앱 사진의 출처 표시와 카카오 지도 표기는 유지했다.

## 접수 순서

1. [공식 참가자 안내](https://lowly-polyanthus-1fb.notion.site/2026-36b5dce406e380e0a3d1f80525667a11) 최신 내용을 재확인한다.
2. [한국관광콘텐츠랩](https://api.visitkorea.or.kr)의 기존 신청 계정에서 이메일 인증·최종 팀원을 확인한다.
3. https://gunbeon.gangwon.kr · 웹 서비스 · 강원특별자치도 지역특화 · 국문/무장애 API 2종을 입력한다.
4. 실제 신청자의 키와 지정 일반 심사 계정은 **비공개 지정란**에만 입력한다.
5. v3 PDF의 파일명·18쪽 미리보기를 확인하고 최종 제출한다. 접수 증빙을 따로 보관한다.

화면은 운영 서비스의 실제 UI이며 여행·그룹·기록은 기능 확인용 합성 예시다. 실제 방문 인증·이용자 성과를 뜻하지 않는다. 복귀 여유는 입력 조건과 거리 기반 참고 추정이다. 촬영용 임시 공유 리소스는 정리했으므로 시연 시 새 링크를 만든다.
