# 1차 기능설명서 재제작

2026-09-16 확인한 **① 웹·앱 개발 부문** 공식 양식으로 만든다. 앱 빌드와 별개인 문서 제작 도구이며 일반 `npm install`만으로는 실행되지 않는다. 현재 배포 기능·실응답·검수한 캡처를 먼저 확인하고 문구를 수정한다.

## 준비

1. [공식 PPTX](https://drive.google.com/file/d/1mZ5t_w0Rx21QQ5JOQ5uBMgtn0laixkAF/view)를 내려받고 `SUBMISSION_TEMPLATE_PATH`에 그 파일의 절대 경로를 지정한다. 원본은 수정하지 않는다.
2. Codex의 `load_workspace_dependencies`로 Node/Python 및 `RUNTIME_NODE_MODULES` 경로를 확인한다. `@oai/artifact-tool`이 있는 런타임을 사용한다.
3. 설치된 presentations 스킬 디렉터리를 `PRESENTATIONS_SKILL_DIR`, Python 실행 파일을 `RUNTIME_PYTHON`으로 지정한다. 자격증명은 필요 없다.
4. 저장소 루트에서 실행한다. `image-map.json`은 실제 촬영한 최종 화면을 가리킨다. 화면이 없으면 빌드가 중단되며 이전 가이드 이미지로 자동 대체하지 않는다.

```sh
node scripts/submission/build-description.mjs
node scripts/submission/finalize-description.mjs
```

첫 명령은 `tmp/submission-build/`에 13쪽 PPTX 후보·각 슬라이드 PNG·검사 정보를 만든다. 두 번째 명령은 패키지 무결성, 슬라이드 크기, 네이티브 표, 글머리/제목 배치, 원본 글꼴 정책과 재열기를 검사한 뒤 `output/submission/2026-round1/gunbeon-2026-round1-functions.pptx`로 확정한다. 확정 파일 또는 검수 영수증이 이미 있으면 덮어쓰지 않는다. 개정 시 `SUBMISSION_FINAL_PATH`와 `SUBMISSION_RECEIPT_PATH`를 새 경로로 지정해 만들고 검수 후 교체한다.

## PDF 및 최종 확인

- 확정 PPTX를 PowerPoint 또는 LibreOffice로 PDF 내보내기한다. 공식 양식의 `맑은 고딕`이 없는 Mac에서는 한글을 지원하는 Nanum Gothic 등을 **문서 변환 프로세스에만** 대체 지정한다. 9/16 최종 PDF에는 LibreOffice가 실제로 선택한 ArialUnicodeMS 등의 대체 글꼴 스트림이 포함되었음을 검사했다. 요청한 대체 글꼴과 실제 PDF의 글꼴명이 같다고 가정하지 않는다. PPTX의 원본 글꼴 지정은 유지한다.
- 내보낸 PDF의 13쪽을 모두 PNG로 렌더링해 글자 누락·잘림·화면 일관성·이미지 출처를 확인한다. 텍스트 추출이나 자동 통과만으로 시각 검수를 대신하지 않는다.
- PDF 10MB 이하, 대표 1장·상세 5장, 배포 URL·버전·스크린샷 날짜·실제 활용 API를 확인한다.
- 실제 키·개인정보를 넣지 않는다. PDF/PPTX에는 운영 일반 계정 비밀번호도 포함하지 않는다. 인증키와 심사 접속 정보는 비공개 접수란에서만 입력한다.
- 변경한 화면·SHA256·용량·검수 결과를 최종 `validation.json`과 `selected-images.json`에 기록한다. ZIP은 검수한 PDF/PPTX와 이미지·사용 안내만으로 다시 만든다.

제출 내용/확인 근거는 [제출 문서](../../docs/submission/2026-round1/README.md), 최종 접수 순서는 [접수 입력 초안](../../docs/submission/2026-round1/portal-copy.md)을 따른다. 파일 생성은 대회 접수 완료가 아니다.
