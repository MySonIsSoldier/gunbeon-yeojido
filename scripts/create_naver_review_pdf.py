"""Package authentic, locally captured Naver login evidence with irreversible redaction.

Raw screenshots remain gitignored under tmp/naver-review/raw. No OAuth tokens,
cookies, API keys or profile identifiers are read by this script.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont as FontToolsFont
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'tmp/naver-review/raw'
OUT = ROOT / 'output/naver-review'
PDF = ROOT / 'output/pdf/naver-login-review-2026-09-15.pdf'
OUT.mkdir(parents=True, exist_ok=True)
PDF.parent.mkdir(parents=True, exist_ok=True)

for weight, name in [(400, 'Review'), (700, 'ReviewBold')]:
    font = FontToolsFont(ROOT / 'assets/brand-kit/source/PretendardVariable.woff2')
    font.flavor = None
    font = instantiateVariableFont(font, {'wght': weight}, inplace=True)
    dest = RAW / f'{name}.ttf'
    font.save(dest)
    pdfmetrics.registerFont(TTFont(name, str(dest)))

shots = ['01-service-login.png', '02-login-complete.png', '03-naver-linked.png']
redactions = []
for i, name in enumerate(shots):
    image = Image.open(RAW / name).convert('RGB')
    boxes = []
    if i:
        info = json.loads((RAW / f'0{i+1}-masks.json').read_text())
        assert info['width'] == image.width, 'Viewport and image coordinates differ'
        draw = ImageDraw.Draw(image)
        for j, r in enumerate(info['masks']):
            if not r:
                raise ValueError(f'Missing masking region: {name} {j}')
            # The account heading's second line is ordinary UI text, not a name.
            height = min(r['height'], 41) if i == 2 and j == 0 else r['height']
            box = [int(r['x'])-2, int(r['y'])-1, int(r['x']+r['width'])+2, int(r['y']+height)+2]
            draw.rectangle(box, fill='#273b40')
            boxes.append(box)
    image.save(OUT / name, optimize=True)
    redactions.append({'file': name, 'width': image.width, 'height': image.height, 'opaque_masks': boxes})
(OUT / 'redaction-manifest.json').write_text(json.dumps(redactions, indent=2)+'\n')

W, H = 595.276, 841.89
canvas = Canvas(str(PDF), pagesize=(W,H), pageCompression=1)
canvas.setTitle('군번여지도 강원 - 네이버 로그인 적용 형태 확인')
canvas.setAuthor('우리아들이군인인데여행계획을준비했대 팀')
style = ParagraphStyle('body', fontName='Review', fontSize=10, leading=15, textColor=HexColor('#43545b'), wordWrap='CJK')
small = ParagraphStyle('small', parent=style, fontSize=8.4, leading=12)
def paragraph(text, x, top, width=W-84, styles=style):
    p=Paragraph(text, styles); _,h=p.wrap(width, H); p.drawOn(canvas,x,top-h); return top-h

pages = [
    ('01', '서비스에서 네이버 로그인 시작',
     '적용 형태: 네이버 로그인을 통한 신규 회원 가입에 적용',
     '서비스의 활성화된 “네이버로 계속하기” 버튼을 눌렀습니다. 하단의 아이디·비밀번호 입력란은 자체 계정 로그인용이며, 네이버 로그인 과정에서는 입력하지 않았습니다.',
     '촬영 조건: 운영 사이트 /login · 2026-09-15 · 기존 네이버 로그인·동의 이력이 있는 계정'),
    ('02', '네이버 로그인 후 서비스로 복귀',
     '네이버 버튼 클릭 후 별도 비밀번호 입력 없이 로그인 완료',
     '동일 브라우저의 기존 네이버 인증·동의 이력에 따라 중간 화면이 생략되고 서비스 홈으로 돌아왔습니다. 계정 저장 상태와 여행 화면을 확인했습니다. 보이는 일정은 심사용 예시 데이터입니다.',
     '이번 캡처는 기존 연결 계정의 재로그인입니다. 신규 회원 생성이나 새 정보제공 동의를 촬영한 자료로 주장하지 않습니다.<br/>화면 속 사진: <link href="https://commons.wikimedia.org/wiki/File:Korean_Workers%27_Party_Headquarters,_Cheorwon_(2026-05)_(1).jpg">Gyuwon Lee (Sadopaul), Wikimedia Commons</link>, <link href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</link>. 앱 표시 상태를 캡처했습니다.'),
    ('03', '네이버 계정 연결 상태 확인',
     '내 계정 화면의 “네이버 연결됨” 표시',
     '로그인 완료 후 내 계정에서 네이버 연결 상태를 확인했습니다. 별명과 아이디는 불투명하게 마스킹했습니다. 신규 네이버 식별자는 서버에서 별도 서비스 비밀번호 없이 회원으로 생성하도록 구현되어 있습니다.',
     '회원가입 없이 일회성 인증만 하는 형태가 아닙니다. 개인정보 추가 조회 항목은 이용자 식별자만 사용하도록 설정해야 합니다.'),
]
for idx,(num,title,subtitle,caption,note) in enumerate(pages):
    canvas.setFillColor(HexColor('#246568')); canvas.rect(42,H-48,32,4,fill=1,stroke=0)
    canvas.setFont('Review',9); canvas.drawString(84,H-50,'군번여지도 강원 / 네이버 로그인 적용 형태 확인')
    canvas.setFillColor(HexColor('#20363c')); canvas.setFont('ReviewBold',20); canvas.drawString(42,H-87,f'{num}  {title}')
    paragraph(subtitle,42,H-106)
    image=Image.open(OUT/shots[idx]); ih=525; iw=image.width/image.height*ih
    x=(W-iw)/2; y=H-145-ih
    canvas.setStrokeColor(HexColor('#dbe3df')); canvas.setLineWidth(.6); canvas.rect(x-1,y-1,iw+2,ih+2,stroke=1,fill=0)
    canvas.drawImage(ImageReader(image),x,y,iw,ih)
    bottom=paragraph(caption,42,y-16)
    paragraph(note,42,bottom-8,styles=small)
    canvas.setStrokeColor(HexColor('#dbe3df')); canvas.line(42,37,W-42,37)
    canvas.setFillColor(HexColor('#617076')); canvas.setFont('Review',7.4)
    canvas.drawString(42,24,'운영 URL: https://gunbeon-yeojido-gangwon.ybuser.chatgpt.site')
    canvas.drawRightString(W-42,24,f'{idx+1} / 3')
    canvas.showPage()
canvas.save()
assert PDF.stat().st_size < 5_000_000
for name in shots: assert (OUT/name).stat().st_size < 5_000_000
print(json.dumps({'pdf':str(PDF),'pdfBytes':PDF.stat().st_size,'png':[{ 'file':n,'bytes':(OUT/n).stat().st_size} for n in shots]},ensure_ascii=False))
