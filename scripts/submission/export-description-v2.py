"""Export a finalized v2 PPTX with bundled Pretendard, then render every PDF page.

Requires LibreOffice, Poppler, pypdf. No installed global font fallback is used.
Refuses to overwrite the public PDF; give SUBMISSION_PDF_PATH for a revision.
"""
from pathlib import Path
from xml.sax.saxutils import escape
from pypdf import PdfReader, PdfWriter
import os, shutil, subprocess, uuid, json

root = Path.cwd()
build = Path(os.getenv('SUBMISSION_BUILD_DIR', 'tmp/submission-redesign')).resolve()
pptx = Path(os.getenv('SUBMISSION_FINAL_PATH', 'output/submission/2026-round1-v2/gunbeon-2026-round1-functions-v2.pptx')).resolve()
pdf = Path(os.getenv('SUBMISSION_PDF_PATH', 'output/pdf/gunbeon-2026-round1-functions-v2.pdf')).resolve()
assert not pdf.exists(), f'Refusing to overwrite final PDF: {pdf}'
assert pptx.is_file()
fonts = root/'assets/document-fonts'
assert (fonts/'Pretendard-Regular.otf').is_file()
assert shutil.which('soffice') and shutil.which('pdftoppm')
run = build/('pdf-export-'+uuid.uuid4().hex[:8]); run.mkdir(parents=True)
config = run/'fonts.conf'
config.write_text('<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">\n<fontconfig><dir>'+escape(str(fonts))+'</dir><cachedir>'+escape(str(run/'font-cache'))+'</cachedir><alias><family>sans-serif</family><prefer><family>Pretendard</family></prefer></alias></fontconfig>\n')
env = dict(os.environ, FONTCONFIG_FILE=str(config))
subprocess.run(['soffice','--headless','-env:UserInstallation='+str((run/'lo-profile').as_uri()),'--convert-to','pdf','--outdir',str(run),str(pptx)],env=env,check=True)
raw = run/(pptx.stem+'.pdf')
r = PdfReader(raw)
assert len(r.pages)==16
font_names=set()
for page in r.pages:
    for font in page['/Resources'].get('/Font', {}).get_object().values():
        font=font.get_object(); font_names.add(str(font.get('/BaseFont')))
        if '/DescendantFonts' in font: font=font['/DescendantFonts'][0].get_object()
        desc=font.get('/FontDescriptor'); desc=desc.get_object() if desc else {}
        assert any(k in desc for k in ['/FontFile','/FontFile2','/FontFile3']), 'Unembedded font'
assert font_names and all('Pretendard-' in n for n in font_names), sorted(font_names)
writer=PdfWriter(clone_from=r)
writer.add_metadata({'/Title':'군번여지도 강원 · 2026 관광데이터 활용 공모전 기능설명서', '/Author':'우리아들이군인인데여행계획을준비했대', '/Subject':'① 웹·앱 개발 부문 · 1차 심사 기능설명서 v2'})
pdf.parent.mkdir(parents=True,exist_ok=True)
with pdf.open('wb') as f: writer.write(f)
assert pdf.stat().st_size < 10_000_000
review=build/'final-pdf-v2';review.mkdir(exist_ok=True)
subprocess.run(['pdftoppm','-scale-to','1600','-png',str(pdf),str(review/'page')],check=True)
summary={'pdf':str(pdf.relative_to(root)), 'pages':16,'bytes':pdf.stat().st_size,'embeddedFonts':sorted(font_names),'allFontsEmbedded':True,'exportFontconfig':str(config.relative_to(root)), 'renderDirectory':str(review.relative_to(root))}
(build/'pdf-export-v2.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))
