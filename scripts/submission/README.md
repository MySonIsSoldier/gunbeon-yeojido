# v3.3 · 기존 형식 보존 개정

2026-09-21 최신 설명서 보완본은 **18쪽 v3.3**이다. 원본 v3.2를 다시 디자인하지 않고 5·6·7·9·16쪽의 내용만 바꾼다. [검토](../../docs/submission/2026-round1/editorial-review-v3-3.md).

아래 환경 준비의 `RUNTIME_NODE_MODULES`, `RUNTIME_PYTHON`, `PRESENTATIONS_SKILL_DIR`, LibreOffice/Poppler를 먼저 설정한다. 원본 v3.2와 추적된 캡처가 있으면 네트워크 없이 문서를 재제작할 수 있다. `capture-description-v3-3.mjs`는 **화면 갱신이 필요한 경우에만** 운영 주소에서 독립 openapi 체험을 촬영한다. 캡처 프레임을 바꾸면 `description-v3-3.json`의 cropPixels도 실제 화면과 대조한다.

```sh
node scripts/submission/revise-description-v3-3.mjs
node scripts/submission/finalize-description-v3-3.mjs
SUBMISSION_BUILD_DIR=tmp/submission-v3-3 \
SUBMISSION_FINAL_PATH=output/submission/2026-round1-v3.3/gunbeon-2026-round1-functions-v3.3.pptx \
SUBMISSION_PDF_PATH=output/pdf/gunbeon-2026-round1-functions-v3.3.pdf \
"$RUNTIME_PYTHON" scripts/submission/export-description-v3.py
```

- 기존 출력이 있으면 확정/변환은 중단한다. 새 개정은 `SUBMISSION_FINAL_PATH`, `SUBMISSION_PDF_PATH`, `SUBMISSION_BUILD_DIR`를 새 경로로 지정하고 기존 최종본을 덮어쓰지 않는다.
- 내용 목록은 `description-v3-3.json`. Artifact Tool의 기존 객체 편집을 확인한 뒤 `preserve-description-v3-3.py`가 원본의 스타일·좌표·표·테마를 보존한 패키지를 만든다. 허용하지 않은 변경은 assert로 중단한다.
- 최종화는 원본 글꼴 정책·18쪽·네이티브 표 1/3/11쪽과 재열기를 검사한다. PDF는 모든 Pretendard 글꼴 포함·10MB 이하를 검사하고 18쪽을 렌더한다.
- 최종 변경 페이지는 원본과 나란히 검토하고, 나머지 페이지의 렌더 픽셀 동일성을 확인한다. 자동 검사만으로 시각 검수를 완료 처리하지 않는다. 결과는 `reports/qa/description-v3-3/`에 있다.
- 예전 package-description-v3.py는 v3.2 제출 키트용이다. 새 수정본을 이 스크립트로 덮어쓰지 않는다.

# v3 재제작 이력

최신본은 **18쪽 v3.2**입니다. 9/17 새 공식 양식 대조 후 PDF/PPTX는 유지하고 접수 문서·키트만 갱신했습니다. 아래 v2환경준비후 `build-description-v3.mjs` → `finalize-description-v3.mjs` → `export-description-v3.py` → 전18쪽검수 → `package-description-v3.py`를 실행합니다. 네이티브표 소유페이지1·3·11, 빌드폴더`tmp/submission-v3`, 출력`output/submission/2026-round1-v3`입니다. 추가 실제캡처는 `reports/qa/tester-social/scenarios`에 있습니다.

# 1차 기능설명서 재제작

아래는 **v2 · 16쪽 제작 이력**이다. 현재 제출에는 맨 위의 v3.2 경로를 사용한다. 공식 **① 웹·앱 개발 부문** 표지·섹션명·필수 작성 항목을 유지하고, 핵심 기능 5개의 흐름을 8쪽에 나눠 설명한다. 예전 13쪽은 보존용이며 제출 파일을 혼동하지 않는다. 앱 빌드와 별개인 문서 도구로, 일반 `npm install`만으로 실행되지 않는다.

## 준비

1. [공식 작성용 PPTX](https://drive.google.com/file/d/1mZ5t_w0Rx21QQ5JOQ5uBMgtn0laixkAF/view)를 내려받아 `SUBMISSION_TEMPLATE_PATH`에 절대 경로를 지정한다. 원본을 변경하지 않는다.
2. Codex의 `load_workspace_dependencies`로 Node/Python과 `RUNTIME_NODE_MODULES`를 확인한다. `@oai/artifact-tool`을 사용한다.
3. 설치된 presentations 스킬 경로를 `PRESENTATIONS_SKILL_DIR`, Python 실행 파일을 `RUNTIME_PYTHON`으로 지정한다. Python에는 `lxml`, `pypdf`, `Pillow`가 필요하다.
4. LibreOffice의 `soffice`와 Poppler의 `pdftoppm`을 PATH에 준비한다. [문서 글꼴](../../assets/document-fonts/README.md)의 Pretendard를 설치하면 PPTX 편집과 초안 렌더에 사용된다. PDF 변환은 저장소의 원본 OTF를 전용 fontconfig로 지정한다.
5. 저장소 루트에서 실행한다. builder의 `map`은 실제 운영 UI 캡처를 가리킨다. 누락 파일을 다른 화면으로 자동 대체하지 않는다.

## 빌드·확정·PDF

```sh
node scripts/submission/build-description-v2.mjs
node scripts/submission/finalize-description-v2.mjs
"$RUNTIME_PYTHON" scripts/submission/export-description-v2.py
```

- 첫 명령은 `tmp/submission-redesign/`에 PPTX 후보·PNG 초안·이미지/텍스트 배치 목록을 만든다. 텍스트·표·화살표는 편집 가능한 PowerPoint 요소다.
- Artifact Tool의 이미지 `cover` 내보내기가 지정 crop 대신 중앙 crop을 기록하는 경우를 보완하기 위해 `restore-native-layout.py`가 **OOXML의 자르기 범위와 표 테두리만** 확정한다. 캡처의 원본 픽셀·표의 내용은 바꾸지 않는다. 초안 PNG의 중앙 crop을 최종 검수로 간주하지 않는다.
- 두 번째 명령은 구조·슬라이드 크기·네이티브 표·폰트 정책·재열기를 검사하고 별도 최종 PPTX로 확정한다. 표 소유 페이지는 1·3·10쪽이다.
- 세 번째 명령은 확정 PPTX를 PDF로 내보낸다. 모든 텍스트 폰트가 **Pretendard이며 실제 임베딩**됐는지 검사한다. 최종 PDF 16쪽을 모두 PNG로 렌더링한다. 글로벌 폰트 설정이나 앱 환경을 변경하지 않는다.
- 최종 경로 또는 검수 영수증이 이미 있으면 덮어쓰지 않는다. 개정 시 `SUBMISSION_FINAL_PATH`, `SUBMISSION_RECEIPT_PATH`, `SUBMISSION_PDF_PATH`를 새 경로로 지정한다. 빌드 폴더는 `SUBMISSION_BUILD_DIR`로 변경할 수 있다.

기본 최종 파일은 `output/submission/2026-round1-v2/gunbeon-2026-round1-functions-v2.pptx`, `output/pdf/gunbeon-2026-round1-functions-v2.pdf`다.

## 시각 검수와 패키지

1. **최종 PDF의 16쪽을 각각 열어** 문장·행간·표 정렬·화면 자르기·버튼·출처·흐름을 확인한다. 자동 검사는 시각 검수를 대신하지 않는다.
2. PDF 10MB 이하, 핵심 기능 5개, 대표 1장·상세 3장, 실제 활용 관광공사 API 2종을 확인한다. 최신 공식 조건이 바뀌면 먼저 반영한다.
3. 실제 키·계정 비밀번호·개인정보를 넣지 않는다. 심사 접속 정보와 인증키는 비공개 접수란에서만 입력한다.
4. 검수한 뒤 `package-description-v2.py`로 문서·이미지·폰트·검수 목록을 묶는다. 이 스크립트는 검수 기록 파일을 요구하며 미검수 자료를 완료로 표시하지 않는다.
5. 문서·파일 크기·SHA·ZIP 무결성을 확인하고 commit/push한다. 자료 생성은 대회 접수 완료가 아니다.

[편집 검토와 변경 이유](../../docs/submission/2026-round1/editorial-review-v2.md), [제출 자료 모음](../../docs/submission/2026-round1/README.md), [접수 입력 초안](../../docs/submission/2026-round1/portal-copy.md)을 함께 확인한다.

## v1 기록

`build-description.mjs`, `finalize-description.mjs`, `image-map.json`은 이전 13쪽 제작 기록이다. 맑은 고딕 지정과 PDF 대체 폰트 정책도 그 버전에만 적용된다. 현행 v2에 사용하지 않는다.
