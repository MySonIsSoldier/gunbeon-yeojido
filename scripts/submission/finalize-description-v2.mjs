import path from 'node:path';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const skill=process.env.PRESENTATIONS_SKILL_DIR;
if(!skill)throw new Error('Set PRESENTATIONS_SKILL_DIR to the installed presentations skill directory');
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const root=process.cwd(), build=process.env.SUBMISSION_BUILD_DIR || 'tmp/submission-redesign';
const source=process.env.SUBMISSION_TEMPLATE_PATH || path.join(root,'tmp/submission-assets/2026 관광데이터 활용 공모전 웹앱 개발 부문 기능설명서 양식(작성용).pptx');
const tables=[1,3,10];
const finalPath=process.env.SUBMISSION_FINAL_PATH || path.join(root,'output/submission/2026-round1-v2/gunbeon-2026-round1-functions-v2.pptx');
await fs.mkdir(path.dirname(finalPath),{recursive:true});
const result=await finalizePresentation({
 workspaceDir:root,
 candidatePath:path.resolve(build,'candidate.pptx'),
 finalPath,
 pythonExecutable:process.env.RUNTIME_PYTHON || 'python3',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...tables.flatMap(i=>['--require-native-table-slide',String(i)])],
 explicitTotalSlideCount:16,
 sourceTemplatePath:source,
 requiredNativeTableOwnerSlides:tables,
 fontPolicy:{basis:'design',families:['Pretendard','Pretendard SemiBold']},
 verifyArtifactToolImport:true,
 receiptPath:process.env.SUBMISSION_RECEIPT_PATH || path.resolve(build,'final-validation-v2.json')
});
console.log(JSON.stringify(result,null,2));
