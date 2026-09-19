# 다른 컴퓨터로 작업 이어가기

2026-09-19 사용자가 1차 심사 완료와 이 PC의 당분간 작업 중단을 알렸다. 이 문서는 그 시점의 코드·자료·환경을 이전하는 안내다. 대회 결과나 접수 증빙을 별도로 확인했다는 뜻은 아니다. 다음 작업은 `docs/handoff.md`의 최신 기록부터 확인한다.

## 보관 위치와 범위

GitHub의 `MySonIsSoldier/gunbeon-yeojido`에는 앱 소스, migration, 제작 스크립트, 제출 산출물, 검사 근거와 agent 문서가 있다. 실제 환경변수와 로컬 DB는 별도 **비공개 이전 ZIP**에 모은다. 해당 ZIP의 최종 경로와 검증 결과는 작업 완료 안내를 따른다.

| ZIP 내부 | 용도 |
|---|---|
| `README-FIRST.md`, `MANIFEST.json`, `SHA256SUMS` | 생성 시점·포함 항목·복원 주의사항·무결성 확인 |
| `repository.bundle` | GitHub 저장소의 오프라인 Git 백업 |
| `sites-source/production.bundle`, `sites-source/development.bundle` | 별도로 관리하는 운영/개발 Sites 앱 소스 Git 백업 |
| `restore-root/.env.local`, `restore-root/web/.env.local` | 이 PC에 있던 환경 파일. 링크였던 파일도 실제 내용으로 보관 |
| `restore-root/`의 그 외 파일 | Git에서 제외됐던 문서 제작 입력·검수 자료와 `data/raw/public/` 참고 PDF. 저장소 내 원래 상대 경로 유지 |
| `local-d1/` | 로컬 Wrangler SQLite의 일관성 있는 백업. 내부에는 원래 저장소 상대 경로 유지 |
| `source-originals/` | 사용자가 제공한 제안서 PDF와 API 가이드 ZIP 6개. 공식 양식은 `restore-root/`에 별도 보관 |

이 ZIP은 **암호화되지 않았다.** 파일 권한은 소유자만 읽고 쓸 수 있는 `0600`, 보관 폴더는 `0700`으로 만든다. 권한 설정은 암호화가 아니며, 다른 디스크로 복사하면 유지되지 않을 수 있다. 암호화된 외장 디스크나 본인만 접근하는 안전한 저장소로 옮긴다. GitHub, 공개 링크, 이슈, PR, 공개 메일 첨부에 올리지 않는다. 파일 내용이나 전체 환경변수를 채팅·터미널 로그에 출력하지 않는다.

ZIP과 같은 폴더의 `TRANSFER-CHECKSUM.txt`에 전체 파일 SHA256이 있다. 복사 후 `shasum -a 256 파일명.zip`(macOS/Linux) 또는 `Get-FileHash 파일명.zip -Algorithm SHA256`(PowerShell)의 결과를 비교한다. ZIP 안의 `SHA256SUMS`는 개별 파일 검사용이다. 환경파일·서버 Secret 값이 출력되는 명령을 검증 목적으로 실행하지 않는다.

## 새 PC에서 코드와 환경 복원

### 1. 저장소 가져오기

평소에는 GitHub의 최신 소스를 사용한다.

```sh
git clone https://github.com/MySonIsSoldier/gunbeon-yeojido.git
cd gunbeon-yeojido
git status --short
git log -5 --oneline
```

인터넷 연결 없이 보관 시점의 소스가 필요하면, 비공개 ZIP을 본인 전용 폴더에 풀고 bundle로 clone한다. 아래 경로는 새 PC의 실제 압축 해제 위치로 바꾼다.

```sh
umask 077
export GUNBEON_TRANSFER_DIR=/absolute/path/to/extracted-private-transfer
git clone "$GUNBEON_TRANSFER_DIR/repository.bundle" gunbeon-yeojido
cd gunbeon-yeojido
git remote set-url origin https://github.com/MySonIsSoldier/gunbeon-yeojido.git
git status --short
git log -5 --oneline
```

네트워크를 다시 사용할 수 있으면 `git fetch origin --prune`로 이후 변경을 확인한다. 작업 변경이 없는 경우에만 현재 브랜치에 맞춰 `git pull --ff-only`를 실행한다. GitHub 로그인과 조직 쓰기 권한은 새 PC에서 준비한다.

### 2. 환경 파일을 덮어쓰지 않고 복사

`GUNBEON_TRANSFER_DIR`를 압축 해제한 폴더로 설정하고 저장소 루트에서 실행한다. Python 3가 필요하다. 아래 코드는 기존 환경 파일이나 링크가 하나라도 있으면 복사를 시작하지 않고 멈춘다. 기존 설정을 삭제하지 말고 필요한 항목을 별도로 비교한다.

```sh
python3 - <<'PY'
import os
from pathlib import Path

source = Path(os.environ['GUNBEON_TRANSFER_DIR']) / 'restore-root'
paths = [Path('.env.local'), Path('web/.env.local')]
available = [p for p in paths if (source / p).is_file()]
existing = [str(p) for p in available if p.exists() or p.is_symlink()]
if existing:
    raise SystemExit('기존 환경 파일 보존: ' + ', '.join(existing))
for relative in available:
    relative.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(relative, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'wb') as output:
        output.write((source / relative).read_bytes())
    print('복원 완료:', relative)
PY
```

`web/.env.local`은 독립 파일로 사용해도 된다. 이전 PC의 symlink를 재현할 필요는 없다. 로컬 OAuth 테스트 origin은 제공자 콘솔 등록값과 일치해야 한다. 기존 운영 Secret을 새 로컬 설정으로 덮어쓰지 않는다.

### 3. 의존성과 로컬 DB 준비

[로컬 설정 안내](local-setup.md)의 Node 22 버전과 명령을 따른다. 이전 파일을 복원했다면 안내의 환경 파일 생성 단계는 생략한다.

```sh
cd web
npm ci
npx wrangler d1 migrations apply DB --local --config wrangler.local.jsonc
npm run dev
```

새 개발은 위처럼 **새 로컬 DB**에서 시작하는 것을 기본으로 한다. 운영에서 사용하던 계정과 여행은 운영 사이트의 D1에 있으므로 로컬에 같은 계정이 생기지는 않는다.

예전 로컬 검사 자료가 꼭 필요하면 개발 서버와 로컬 Worker를 모두 종료한 뒤 `local-d1/`의 SQLite를 확인한다. 백업 안의 경로는 저장소 루트 기준이며, 같은 Wrangler 구성·버전에서 해당 경로를 복원할 수 있다. 대상에 DB나 `-wal`, `-shm` 파일이 이미 있으면 먼저 그 상태 전체를 별도로 보관하고, 실행 중인 DB 위에 파일을 복사하지 않는다. 새 DB와 과거 DB를 파일 단위로 섞지 않는다. 가능하면 별도 checkout에서 백업을 열어 확인한다. 로컬 데이터 확인 후 필요한 추가 migration만 `--local`로 적용한다.

`wrangler.local.jsonc`의 DB ID는 로컬 placeholder다. 이 설정에 `--remote`를 붙이지 않는다. 로컬 SQLite 복원은 운영 DB 복원이 아니다.

## 제출 자료를 다시 만들 때

최종 제출 산출물은 Git에서 바로 사용할 수 있다. 예전 제작 과정을 다시 실행할 때만 ZIP의 `restore-root/`에서 필요한 문서 제작 입력을 저장소의 같은 상대 경로에 복사한다. `MANIFEST.json`과 [제작 안내](../scripts/submission/README.md)를 먼저 확인한다.

- `.env.local`은 위 절차로 별도로 다룬다. `restore-root/` 전체를 무조건 덮어쓰지 않는다.
- `tmp/` 안의 입력·검수 자료는 제작 이력이다. 과거 v1·v2·v3 후보를 최신 제출본으로 바꾸거나 일괄 Git 추가하지 않는다.
- 사용자 원본은 `source-originals/`에 보관돼 있다. 스크립트가 기대하는 입력과 실제 양식이 같은지 확인한 뒤 사용한다.
- 문서 글꼴은 추적된 `assets/document-fonts/`와 해당 라이선스를 사용한다. 새 PC에서 편집·PDF 변환 후 줄바꿈과 모든 페이지를 다시 확인한다.

## 배포와 운영 데이터

이전 점검에서 운영은 **active/public · v20/env5**, 개발은 **active/custom · v3/env2**로 확인했다. 운영 Secret 8개·개발 Secret 4개는 이름과 마스킹된 설정 상태만 확인했으며 값을 내보낸 것은 아니다. 운영 DB는 17개 테이블의 메타데이터만 확인했으며 **운영 DB 내용은 이 이전 ZIP에 없다.**

새 PC에서도 기존 Sites 프로젝트를 계속 사용한다. `config/sites-environments.json`, [배포 환경 안내](custom-domain-setup.md), `docs/handoff.md`를 읽고 현재 프로젝트의 소스 Git 연결과 배포 인증을 다시 확보한다. ZIP의 Sites bundle은 보존용 소스이며, 과거 인증 정보나 Git 원격 주소를 그대로 재사용하는 배포 수단은 아니다.

새 프로젝트·도메인·OAuth 앱을 다시 만들 필요는 없다. 기존 운영 D1, 심사 계정, 공개 체험 템플릿을 초기화하지 않는다. `web/.openai/hosting.json`의 운영 ID를 개발 ID로 바꾸지 않는다. 배포 전 `scripts/check-site-target.mjs`로 대상을 확인한다.

다음 항목은 별도 보관 또는 접근 확인이 필요하다.

| 항목 | 필요한 조치 |
|---|---|
| 운영 D1 전체 백업·복구 | 현재 Sites 관리 기능/지원 경로에서 내보내기와 복구 방법 확인. 이번 묶음에는 포함되지 않음 |
| 운영·개발 Secret 원본 | 각 환경의 값이 로컬 파일과 같은지 별도 관리 기록으로 확인. 마스킹된 목록만으로 복원할 수 없음 |
| Hosting.kr 도메인 | 계정 접근·2단계 인증·갱신 일정 확인. DNS는 유지 |
| Google/Naver/Kakao/공공데이터포털 | 기존 앱·프로젝트의 소유 권한과 새 PC 로그인 확인. 기존 회원 식별자가 달라지는 앱 재생성 금지 |
| GitHub/OpenAI 계정 | 조직 접근·Sites 소유 권한·2단계 인증 수단 확보. 개인 계정 세션과 브라우저 프로필은 묶음에 포함하지 않음 |
| 실제 제출 증빙 | 접수 완료 화면·접수번호·최종 업로드 파일·결과 통지는 사용자 보관본과 대조. 저장소의 준비본과 구분 |

## 브라우저에만 있는 여행과 참여 권한

개인 계정에 정상 저장된 여행은 운영 사이트에서 같은 계정으로 로그인하면 이어서 조회할 수 있다. 이전 PC를 정리하기 전 화면의 **내 계정에 저장됨** 상태를 확인한다. 저장 오류·충돌 안내가 있으면 **현재 내용 백업**으로 JSON을 먼저 보관한다.

로그인 전에 만든 여행이 있다면, 기록을 만들었던 **같은 브라우저·같은 도메인**에서 다음 순서로 처리한다.

1. `/account`에서 본인의 일반 계정으로 로그인한다. 가상 민준 체험 계정은 사용하지 않는다.
2. **이 기기의 여행·그룹 연결**을 누른다.
3. 확인 영역의 **기기 기록 먼저 백업**을 눌러 JSON을 별도로 보관한다.
4. 서버 계정으로 연결하려면 내용을 확인하고 **가져오기 확인**을 누른다. 이는 실제 서버 기록과 참여 권한을 변경하는 사용자 선택이다.
5. 다른 브라우저에서 같은 계정으로 로그인해 여행과 그룹이 보이는지 확인한다.

기기 JSON에는 여행과 즐겨찾기가 들어가지만 그룹·공개 한 수의 관리 쿠키는 포함되지 않는다. 참여 권한은 계정 연결 과정으로 옮긴다. 현재 JSON 파일을 다시 업로드하는 복원 화면은 없으므로 다운로드만으로 완전한 계정 이전이 끝나는 것은 아니다. 게스트 기록은 도메인별로 나뉘며, `gunbeon.gangwon.kr`와 과거 `chatgpt.site`의 기록은 별도로 확인한다.

일반 계정 비밀번호는 서버에 해시로 저장돼 있어 DB에서 원문을 복원할 수 없다. 기억하지 못하는 개인 비밀번호, 2단계 인증 복구 코드, 소셜 계정 비밀번호는 이 프로젝트 파일 묶음의 보관 대상이 아니다. 본인의 비밀번호 관리자에서 별도로 관리한다.

## 작업 재개 순서

1. `docs/handoff.md`와 `docs/roadmap.md`를 읽고 GitHub 최신 커밋을 확인한다.
2. 로컬 환경·의존성·새 로컬 D1을 준비하고 기본 검사를 실행한다.
3. 운영 로그인·저장 기록을 읽기만 하여 기존 서비스 상태를 확인한다.
4. 대회 후속 일정과 사용자 요청에 맞춰 다음 목표를 정한다. 완료된 1차 준비 작업이나 일회 계정 생성 스크립트를 다시 실행하지 않는다.
5. 코드 변경, 검사, push, 배포는 각각 따로 기록한다.
