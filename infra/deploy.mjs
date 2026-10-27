// Re-applies main.bicep with the secrets in .env.production and the image that is
// running now, so an infra apply never swaps the live app to a different image.
//
//   node infra/deploy.mjs            apply
//   node infra/deploy.mjs --what-if  show what would change, apply nothing
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RESOURCE_GROUP = 'adorio-prod-rg';
const APP_NAME = 'adorio';

const infraDir = path.dirname(fileURLToPath(import.meta.url));

// Not `. .env.production` in a shell: the unquoted '&' in MONGO_URI makes the shell
// run that assignment in the background, so MONGO_URI never gets set.
process.loadEnvFile(path.join(infraDir, '..', '.env.production'));

process.env.CONTAINER_IMAGE = execFileSync(
  'az',
  [
    'containerapp',
    'show',
    '-g',
    RESOURCE_GROUP,
    '-n',
    APP_NAME,
    '--query',
    'properties.template.containers[0].image',
    '-o',
    'tsv',
  ],
  { encoding: 'utf8' },
).trim();
console.log(`Keeping the running image: ${process.env.CONTAINER_IMAGE}`);

const action = process.argv.includes('--what-if') ? 'what-if' : 'create';
execFileSync(
  'az',
  [
    'deployment',
    'group',
    action,
    '-g',
    RESOURCE_GROUP,
    '--parameters',
    path.join(infraDir, 'main.bicepparam'),
  ],
  { stdio: 'inherit' },
);
