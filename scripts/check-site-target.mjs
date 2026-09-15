// Read-only deployment guard. Run before pushing or packaging either Site.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [target,checkout]=process.argv.slice(2);
const targets=JSON.parse(readFileSync(path.join(root,'config/sites-environments.json'),'utf8'));
if(!['development','production'].includes(target)||!checkout) {
  console.error('Usage: node scripts/check-site-target.mjs development|production /absolute/site-checkout');
  process.exit(1);
}
const manifest=JSON.parse(readFileSync(path.join(path.resolve(checkout),'.openai/hosting.json'),'utf8'));
if(manifest.project_id!==targets[target].project_id||manifest.d1!=='DB') {
  console.error('Target mismatch. Stop: do not push, deploy, or apply migrations to this checkout.');
  process.exit(1);
}
console.log(JSON.stringify({target,project_id:manifest.project_id,check:'passed'}));
