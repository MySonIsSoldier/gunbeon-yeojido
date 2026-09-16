"""Preserve explicit screenshot crops and table border styling after Artifact Tool's cover-fit export.

Only native OOXML crop/border attributes change. Source image bytes and all UI contents
are preserved. The exported PDF, not the draft renderer's centered crop, is the
visual QA reference for these crops.
"""
from pathlib import Path
from collections import defaultdict
from zipfile import ZipFile
from lxml import etree
import json, sys

pptx, manifest = map(Path, sys.argv[1:3])
ns = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}
by_slide = defaultdict(list)
for entry in json.loads(manifest.read_text()):
    by_slide[entry['slide']].append(entry)
with ZipFile(pptx) as source:
    parts = {name: source.read(name) for name in source.namelist()}
count = 0
for slide, entries in by_slide.items():
    name = f'ppt/slides/slide{slide}.xml'
    xml = etree.fromstring(parts[name])
    pictures = xml.findall('.//p:pic', ns)
    assert len(pictures) == len(entries), (slide, len(pictures), len(entries))
    for picture, entry in zip(pictures, entries):
        crop = entry['crop']
        if not crop:
            continue
        fill = picture.find('p:blipFill', ns)
        rect = fill.find('a:srcRect', ns)
        if rect is None:
            rect = etree.Element('{'+ns['a']+'}srcRect')
            fill.insert(1, rect)
        for xml_edge, edge in [('l','left'),('r','right'),('t','top'),('b','bottom')]:
            assert 0 <= crop[edge] < 1
            rect.set(xml_edge, str(round(crop[edge]*100000)))
        count += 1
    parts[name] = etree.tostring(xml, encoding='UTF-8', xml_declaration=True, standalone=True)
# Explicit cell borders avoid a renderer/export fallback to black internal lines.
# The two rebuilt tables retain editable cells, text and original row geometry.
for slide in [3, 10]:
    name = f'ppt/slides/slide{slide}.xml'
    xml = etree.fromstring(parts[name])
    for table in xml.findall('.//a:tbl', ns):
        for row_index, row in enumerate(table.findall('a:tr', ns)):
            for cell in row.findall('a:tc', ns):
                props = cell.find('a:tcPr', ns)
                for edge in ['L','R','T','B']:
                    tag = '{'+ns['a']+'}ln'+edge
                    existing = props.find(tag)
                    if existing is not None:
                        props.remove(existing)
                    line = etree.Element(tag, w='7620')
                    if edge == 'B' or (edge == 'T' and row_index == 0):
                        fill = etree.SubElement(line, '{'+ns['a']+'}solidFill')
                        etree.SubElement(fill, '{'+ns['a']+'}srgbClr', val='D9E2E1')
                    else:
                        etree.SubElement(line, '{'+ns['a']+'}noFill')
                    props.insert(0, line)
    parts[name] = etree.tostring(xml, encoding='UTF-8', xml_declaration=True, standalone=True)
target = pptx.with_suffix('.layout-fix.pptx')
with ZipFile(pptx) as source, ZipFile(target, 'w') as result:
    for info in source.infolist():
        result.writestr(info, parts[info.filename])
target.replace(pptx)
print(f'Preserved {count} explicit native image crops and two table border styles; image bytes unchanged.')
