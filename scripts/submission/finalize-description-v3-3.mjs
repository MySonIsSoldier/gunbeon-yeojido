import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const skill=process.env.PRESENTATIONS_SKILL_DIR;
if(!skill)throw new Error('Set PRESENTATIONS_SKILL_DIR');
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const root=process.cwd();
const build=path.resolve(process.env.SUBMISSION_BUILD_DIR || 'tmp/submission-v3-3');
const source=path.resolve('output/submission/2026-round1-v3/gunbeon-2026-round1-functions-v3.2.pptx');
const finalPath=path.resolve(process.env.SUBMISSION_FINAL_PATH || 'output/submission/2026-round1-v3.3/gunbeon-2026-round1-functions-v3.3.pptx');
await fs.mkdir(path.dirname(finalPath),{recursive:true});
const tables=[1,3,11];
const result=await finalizePresentation({
 workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,
 pythonExecutable:process.env.RUNTIME_PYTHON || 'python3',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...tables.flatMap(i=>['--require-native-table-slide',String(i)])],
 explicitTotalSlideCount:18,sourceTemplatePath:source,requiredNativeTableOwnerSlides:tables,
 fontPolicy:{basis:'reference',families:['Pretendard','Pretendard SemiBold'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},
 verifyArtifactToolImport:true,receiptPath:path.join(build,'final-validation-v3.3.json')
});
console.log(JSON.stringify(result,null,2));
