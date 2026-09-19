#!/usr/bin/env python3
"""Create a local, unencrypted transfer ZIP outside Git. Never print secret values.

Copies only the explicit project inputs below, not browser profiles, personal
credentials, node_modules, caches or live server data. Python standard library only.
"""
import argparse
from contextlib import closing
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sqlite3
import subprocess
import tempfile
import unicodedata
import zipfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
INPUTS = [
    '.env.local', 'web/.env.local', '.dev.vars', 'web/.dev.vars',
    'tmp/submission-assets/2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서 양식(작성용).pptx',
    'tmp/submission-assets/2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서 양식(미리보기용).pdf',
    'tmp/submission-assets/ot-guide.pdf',
    'tmp/submission-build/current-manual.pdf',
    'tmp/submission-build/current-key-guide.pdf',
    'tmp/submission-v3/images.json',
    'tmp/submission-v3/final-validation-v3.2.json',
    'tmp/submission-v3/pdf-export-v3.json',
    'tmp/submission-v3/text-metrics.json',
    'data/raw/public/cwg-history-park-fee-20260812.pdf',
]
ORIGINALS = [
    '『2026 관광데이터 활용 공모전』 제안서_우리아들이군인인데여행계획을준비했대(심윤보).pdf',
    'TourAPI_Guide_(연관관광지)v4.1.zip',
    'TourAPI_Guide_(중심관광지)v4.1.zip',
    '개방 데이터 활용 매뉴얼(관광지 집중률 방문자 추이 예측 정보)v4.1.zip',
    '개방데이터_활용매뉴얼(국문).zip',
    '개방데이터_활용매뉴얼(무장애여행).zip',
    '기상청41_단기예보 조회서비스_오픈API활용가이드_2607.zip',
]


def run(*args, cwd=ROOT):
    proc = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if proc.returncode:
        # stderr from external tools may contain credentials; do not echo it.
        raise RuntimeError(f'{args[0]} operation failed (exit {proc.returncode})')
    return proc.stdout.strip()


def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def private_copy(source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    # Dereference the known project env link; no symlink to the old PC is archived.
    with source.open('rb') as src, destination.open('xb') as dest:
        shutil.copyfileobj(src, dest)
    destination.chmod(0o600)


def bundle(source, destination):
    if run('git', 'status', '--porcelain', '--untracked-files=no', cwd=source):
        raise RuntimeError('Commit tracked changes before creating a Git bundle')
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    run('git', 'bundle', 'create', str(destination), '--all', cwd=source)
    run('git', 'bundle', 'verify', str(destination), cwd=source)
    destination.chmod(0o600)
    return {'head': run('git', 'rev-parse', 'HEAD', cwd=source), 'verified': True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='New .zip outside the repository')
    parser.add_argument('--originals', type=Path, help='Folder containing the explicitly named user attachments')
    parser.add_argument('--production-source', type=Path, help='Existing clean Sites source checkout')
    parser.add_argument('--development-source', type=Path, help='Existing clean Sites source checkout')
    args = parser.parse_args()
    os.umask(0o077)
    output = args.output.expanduser().resolve()
    if output == ROOT or ROOT in output.parents or output.suffix != '.zip':
        raise SystemExit('Choose a .zip path outside the repository')
    if output.exists():
        raise SystemExit('Output exists; choose a new name')
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if output.parent.stat().st_mode & 0o077:
        raise SystemExit('Choose a dedicated owner-only output directory (chmod 700 on that directory only)')
    manifest = {
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'encrypted': False,
        'remoteDatabaseExported': False,
        'remoteSecretsExported': False,
        'browserProfilesIncluded': False,
        'missingOptionalInputs': [], 'environment': [], 'sqlite': [],
        'note': 'Local backup only. Runtime secrets are masked by Sites; local values are not proof of equality.',
    }
    # Temporary private directory on the destination filesystem is removed after ZIP creation.
    with tempfile.TemporaryDirectory(prefix='.gunbeon-transfer-', dir=output.parent) as tmp:
        stage = Path(tmp)
        manifest['repository'] = bundle(ROOT, stage / 'repository.bundle')
        manifest['sitesSource'] = {}
        for label in ('production', 'development'):
            source = getattr(args, label + '_source')
            if source:
                manifest['sitesSource'][label] = bundle(source.resolve(), stage / 'sites-source' / f'{label}.bundle')
        for relative in INPUTS:
            source = ROOT / relative
            if not source.is_file():
                manifest['missingOptionalInputs'].append(relative)
                continue
            private_copy(source, stage / 'restore-root' / relative)
            if source.name.startswith(('.env', '.dev.vars')):
                variables = []
                for line in source.read_text().splitlines():
                    match = re.match(r'(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)', line)
                    if match:
                        variables.append({'name': match[1], 'configured': bool(match[2].strip().strip('\"\''))})
                manifest['environment'].append({'path': relative, 'sourceWasSymlink': source.is_symlink(), 'variables': variables})
        if args.originals:
            available = {unicodedata.normalize('NFC', p.name): p for p in args.originals.iterdir() if p.is_file()}
            for name in ORIGINALS:
                source = available.get(unicodedata.normalize('NFC', name))
                if source:
                    private_copy(source, stage / 'source-originals' / name)
                else:
                    manifest['missingOptionalInputs'].append('source-originals/' + name)
        db_root = ROOT / 'web/.wrangler/state/v3/d1'
        for source in sorted(db_root.rglob('*.sqlite')) if db_root.exists() else []:
            destination = stage / 'local-d1' / source.relative_to(ROOT)
            destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            # SQLite's backup API creates a consistent snapshot including committed WAL data.
            with closing(sqlite3.connect(source.resolve().as_uri() + '?mode=ro', uri=True)) as src:
                with closing(sqlite3.connect(destination)) as dest:
                    src.backup(dest)
                    integrity = dest.execute('PRAGMA integrity_check').fetchone()[0]
            destination.chmod(0o600)
            if integrity != 'ok':
                raise RuntimeError('Local SQLite snapshot failed integrity check')
            manifest['sqlite'].append({'path': str(destination.relative_to(stage)), 'integrity': integrity, 'production': False})
        readme = (ROOT / 'docs/pc-transfer.md').read_text()
        github = 'https://github.com/MySonIsSoldier/gunbeon-yeojido/blob/master/'
        for relative, repo_path in [('local-setup.md', 'docs/local-setup.md'),
                                    ('custom-domain-setup.md', 'docs/custom-domain-setup.md'),
                                    ('../scripts/submission/README.md', 'scripts/submission/README.md')]:
            readme = readme.replace(f']({relative})', f']({github}{repo_path})')
        (stage / 'README-FIRST.md').write_text(readme)
        state = ROOT / 'reports/qa/handoff-2026-09-19/sites-state.json'
        if state.exists():
            private_copy(state, stage / 'sites-state.json')
        (stage / 'MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        files = sorted(p for p in stage.rglob('*') if p.is_file())
        hashes = {str(p.relative_to(stage)): sha(p) for p in files}
        (stage / 'SHA256SUMS').write_text(''.join(f'{digest}  {name}\n' for name, digest in hashes.items()))
        with zipfile.ZipFile(output, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            for file in sorted(p for p in stage.rglob('*') if p.is_file()):
                info = zipfile.ZipInfo.from_file(file, arcname=str(file.relative_to(stage)))
                info.external_attr = 0o100600 << 16
                archive.writestr(info, file.read_bytes(), compress_type=zipfile.ZIP_DEFLATED)
        output.chmod(0o600)
        with zipfile.ZipFile(output) as archive:
            if archive.testzip() is not None:
                raise RuntimeError('ZIP checksum verification failed')
            for name, expected in hashes.items():
                if hashlib.sha256(archive.read(name)).hexdigest() != expected:
                    raise RuntimeError('Archive content hash mismatch')
        result = {'file': output.name, 'bytes': output.stat().st_size, 'sha256': sha(output),
                  'files': len(hashes) + 1, 'gitHead': manifest['repository']['head'],
                  'encrypted': False, 'zipAndHashesVerified': True,
                  'missingOptionalInputs': manifest['missingOptionalInputs']}
        # No values from env, cookies, database rows, or Git auth are printed.
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
