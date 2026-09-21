// Revise existing objects with Artifact Tool, then restore the original OOXML
// styling/package around the verified text and screenshot changes. No redesign.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const requireArtifact=createRequire(process.env.RUNTIME_NODE_MODULES ? path.join(process.env.RUNTIME_NODE_MODULES,'entry.cjs') : import.meta.url);
const {FileBlob,PresentationFile}=await import(requireArtifact.resolve('@oai/artifact-tool'));
const spec=JSON.parse(await fs.readFile('scripts/submission/description-v3-3.json','utf8'));
const build=process.env.SUBMISSION_BUILD_DIR || 'tmp/submission-v3-3';
await fs.mkdir(build,{recursive:true});
const presentation=await PresentationFile.importPptx(await FileBlob.load(spec.source));
const before=await presentation.inspect({kind:'slide,textbox,image,table,layout',maxChars:250000});
await fs.writeFile(path.join(build,'before.ndjson'),before.ndjson);
const records=before.ndjson.split('\n').filter(Boolean).map(line=>JSON.parse(line));
const edited=[];
for(const change of spec.changes){
  const matches=records.filter(r=>r.kind==='textbox'&&r.slide===change.slide&&r.text===change.old);
  if(matches.length!==1)throw new Error(`Expected one text anchor on slide ${change.slide}: ${change.old}; found ${matches.length}`);
  // Whole-box replacement also handles imported paragraphs split into multiple runs.
  presentation.resolve(matches[0].id).text=change.text;
  edited.push({slide:change.slide,id:matches[0].id,text:change.text});
}
const imageCounts=new Map();
for(const change of spec.images){
  const index=imageCounts.get(change.slide)||0;
  const candidates=records.filter(r=>r.kind==='image'&&r.slide===change.slide);
  if(!candidates[index])throw new Error('Missing original picture anchor');
  const target=presentation.resolve(candidates[index].id);
  const frame=target.frame;
  const image=await fs.readFile(change.path);
  target.replace({blob:new Uint8Array(image),contentType:'image/png',alt:change.path,fit:'contain'});
  target.frame=frame;
  const [x,y,w,h]=change.cropPixels || [0,0,image.readUInt32BE(16),image.readUInt32BE(20)];
  target.crop={left:x/image.readUInt32BE(16),top:y/image.readUInt32BE(20),right:1-(x+w)/image.readUInt32BE(16),bottom:1-(y+h)/image.readUInt32BE(20)};
  imageCounts.set(change.slide,index+1);
}
for(const [number,note]of Object.entries(spec.notes))presentation.slides.items[Number(number)-1].speakerNotes.textFrame.setText(note+'\n운영 서비스: https://gunbeon.gangwon.kr');
await fs.writeFile(path.join(build,'after.ndjson'),(await presentation.inspect({kind:'slide,textbox,image,table',maxChars:250000})).ndjson);
await(await PresentationFile.exportPptx(presentation)).save(path.join(build,'artifact-edited.pptx'));
await fs.writeFile(path.join(build,'artifact-edits.json'),JSON.stringify(edited,null,2)+'\n');
execFileSync(process.env.RUNTIME_PYTHON || 'python3',['scripts/submission/preserve-description-v3-3.py',build],{stdio:'inherit'});
console.log('Revised original 18-slide deck; preserved masters, geometry, fonts, tables, and unaffected package parts.');
