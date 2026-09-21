"""Restore exact source formatting after the verified Artifact Tool content edits.

Only selected text runs, screenshot bytes/crops, and source notes can differ.
No fonts, coordinates, master/layout/theme, tables, or slide ordering can change.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from PIL import Image
import json, sys, hashlib, posixpath, copy

build=Path(sys.argv[1])
spec=json.loads(Path('scripts/submission/description-v3-3.json').read_text())
source=Path(spec['source'])
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
def xml(data): return E.fromstring(data)
def encode(root): return E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
def digest(data): return hashlib.sha256(data).hexdigest()
with ZipFile(source) as z: original={name:z.read(name) for name in z.namelist()}
with ZipFile(build/'artifact-edited.pptx') as z: artifact={name:z.read(name) for name in z.namelist()}
files=dict(original)
changed_slides=sorted({c['slide'] for c in spec['changes']})
for number in changed_slides:
    key=f'ppt/slides/slide{number}.xml'
    root=xml(original[key])
    artifact_text='\n'.join(xml(artifact[key]).xpath('//a:t/text()',namespaces=ns))
    for c in [c for c in spec['changes'] if c['slide']==number]:
        assert c['text'] in artifact_text, f'Artifact draft did not apply {number}: {c["text"]}'
        shapes=root.xpath(f'//p:sp[p:nvSpPr/p:cNvPr/@id="{c["shape"]}"]',namespaces=ns)
        assert len(shapes)==1
        runs=shapes[0].xpath('.//a:t',namespaces=ns)
        assert '\n'.join(t.text or '' for t in runs)==c['old'], f'Unexpected source text {number}/{c["shape"]}'
        lines=c['text'].split('\n')
        assert len(lines)==len(runs), 'Keep existing line/paragraph structure'
        for run,line in zip(runs,lines): run.text=line
    files[key]=encode(root)

image_evidence=[]
for c in spec['images']:
    key=f'ppt/slides/slide{c["slide"]}.xml'
    root=xml(files[key])
    pics=root.xpath(f'//p:pic[p:nvPicPr/p:cNvPr/@id="{c["picture"]}"]',namespaces=ns)
    assert len(pics)==1
    pic=pics[0]
    extent=pic.find('.//a:xfrm/a:ext',ns)
    with Image.open(c['path']) as image:
        image_width,image_height=image.size
        x,y,width,height=c.get('cropPixels',[0,0,image_width,image_height])
        ratio=width/height
        frame_ratio=int(extent.get('cx'))/int(extent.get('cy'))
        assert abs(ratio/frame_ratio-1)<0.003, 'Screenshot must match original frame aspect ratio'
    rid=pic.find('.//a:blip',ns).get('{'+ns['r']+'}embed')
    rels=xml(files[f'ppt/slides/_rels/slide{c["slide"]}.xml.rels'])
    target=next(r.get('Target') for r in rels if r.get('Id')==rid)
    media=posixpath.normpath(posixpath.join('ppt/slides',target)).lstrip('/')
    assert media in original, f'Missing original media: {media}'
    # Do not overwrite media shared with any other relationship in this deck.
    owners=[]
    for name,data in files.items():
        if name.endswith('.rels'):
            base=posixpath.dirname(posixpath.dirname(name))
            for rel in xml(data):
                if posixpath.normpath(posixpath.join(base,rel.get('Target',''))).lstrip('/')==media: owners.append(name)
    assert len(owners)==1, f'Shared image needs a new relationship: {media}'
    files[media]=Path(c['path']).read_bytes()
    for crop in pic.findall('.//a:srcRect',ns): crop.getparent().remove(crop)
    if 'cropPixels' in c:
        crop=E.Element('{'+ns['a']+'}srcRect')
        for side,fraction in {'l':x/image_width,'t':y/image_height,'r':1-(x+width)/image_width,'b':1-(y+height)/image_height}.items(): crop.set(side,str(round(fraction*100000)))
        pic.find('p:blipFill',ns).insert(1,crop)
    files[key]=encode(root)
    image_evidence.append({**c,'media':media,'sha256':digest(files[media])})

for number,note in spec['notes'].items():
    key=f'ppt/notesSlides/notesSlide{number}.xml'
    root=xml(files[key])
    bodies=root.xpath('//p:sp[p:nvSpPr/p:nvPr/p:ph/@type="body"]/p:txBody',namespaces=ns)
    assert len(bodies)==1
    body=bodies[0]
    paragraphs=body.findall('a:p',ns)
    prototype=copy.deepcopy(paragraphs[0])
    for p in paragraphs: body.remove(p)
    for line in (note+'\n운영 서비스: https://gunbeon.gangwon.kr').split('\n'):
        p=copy.deepcopy(prototype)
        texts=p.findall('.//a:t',ns)
        assert texts
        texts[0].text=line
        for t in texts[1:]: t.text=''
        body.append(p)
    files[key]=encode(root)

def structural_slide(data):
    root=xml(data)
    for text in root.findall('.//a:t',ns): text.text='CONTENT'
    for crop in root.findall('.//a:srcRect',ns): crop.getparent().remove(crop)
    return E.tostring(root,method='c14n')
for i in range(1,19):
    key=f'ppt/slides/slide{i}.xml'
    assert structural_slide(original[key])==structural_slide(files[key]), f'Format changed on slide {i}'
changed_parts=sorted(name for name in files if files[name]!=original[name])
allowed={f'ppt/slides/slide{i}.xml' for i in changed_slides}|{f'ppt/notesSlides/notesSlide{i}.xml' for i in spec['notes']}|{v['media'] for v in image_evidence}
assert set(changed_parts)<=allowed
assert files['ppt/presentation.xml']==original['ppt/presentation.xml']
for name in files:
    if any(s in name for s in ['slideMasters/','slideLayouts/','theme/']): assert files[name]==original[name]
candidate=build/'candidate.pptx'
with ZipFile(candidate,'w',ZIP_DEFLATED) as z:
    for name,data in files.items(): z.writestr(name,data)
report={'source':str(source),'sourceSha256':digest(source.read_bytes()),'candidateSha256':digest(candidate.read_bytes()),'slideCount':18,'changedSlides':changed_slides,'textEdits':len(spec['changes']),'changedPackageParts':changed_parts,'identicalPackageParts':len(files)-len(changed_parts),'allSlideGeometryAndTextFormattingUnchanged':True,'mastersLayoutsThemesAndOrderingByteIdentical':True,'images':image_evidence}
(build/'format-preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='images'},ensure_ascii=False))
