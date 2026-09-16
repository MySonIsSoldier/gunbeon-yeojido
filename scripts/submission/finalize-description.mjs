import path from 'node:path';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const skill=process.env.PRESENTATIONS_SKILL_DIR;
if(!skill)throw new Error('Set PRESENTATIONS_SKILL_DIR to the installed presentations skill directory');
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const root=process.cwd();
const source=process.env.SUBMISSION_TEMPLATE_PATH || path.join(root,'tmp/submission-assets/2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서 양식(작성용).pptx');
const result=await finalizePresentation({
 workspaceDir:root,
 candidatePath:path.join(root,'tmp/submission-build/candidate.pptx'),
 finalPath:process.env.SUBMISSION_FINAL_PATH || path.join(root,'output/submission/2026-round1/gunbeon-2026-round1-functions.pptx'),
 pythonExecutable:process.env.RUNTIME_PYTHON || 'python3',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...Array.from({length:13},(_,i)=>['--require-native-table-slide',String(i+1)]).flat()],
 explicitTotalSlideCount:13,
 sourceTemplatePath:source,
 requiredNativeTableOwnerSlides:[1,2,3,4,5,6,7,8,9,10,11,12,13],
 fontPolicy:{basis:'reference',families:['맑은 고딕'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},
 verifyArtifactToolImport:true,
 receiptPath:process.env.SUBMISSION_RECEIPT_PATH || path.join(root,'tmp/submission-build/final-validation.json')
});
console.log(JSON.stringify(result,null,2));
