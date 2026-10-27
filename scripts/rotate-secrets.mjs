#!/usr/bin/env node
// Rotate secrets across local env files, GitHub Actions secrets, and the Azure
// Container App in one run.
//
//   1. Add an entry to the ROTATIONS block below (or use --gen / --set).
//   2. `npm run secrets`            -> dry run, prints exactly what would change
//   3. `npm run secrets -- --apply` -> actually writes files, gh secrets, az secrets
//
// Only keys already present in a local file are rewritten; nothing is ever
// appended to a file. GitHub and Azure values are written from what you type
// here, never read back (both are write-only), so the local files stay the
// source of truth.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SECRETS, NOT_MANAGED } from './secrets.manifest.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const AZURE = { resourceGroup: 'adorio-prod-rg', app: 'adorio' };

// Edit this block, then run `npm run secrets`. Everything not listed is untouched.
//   KEY: { generate: 'hex32' }         make a fresh random value
//   KEY: { value: 'paste-the-new-one' } set it to something you have
const ROTATIONS = {
  // JWT_SECRET: { generate: 'hex32' },
  // REFRESH_TOKEN_SECRET: { generate: 'hex32' },
  // RESEND_API_KEY: { value: 're_xxxxxxxxxxxxxxxx' },
};

function parseArgs(argv) {
  const out = { apply: false, yes: false, reveal: false, gen: [], set: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') out.apply = true;
    else if (a === '--yes' || a === '-y') out.yes = true;
    else if (a === '--reveal') out.reveal = true;
    else if (a === '--gen') out.gen.push(argv[++i]);
    else if (a === '--set') {
      const pair = argv[++i] ?? '';
      const eq = pair.indexOf('=');
      if (eq < 1) throw new Error(`--set expects KEY=VALUE, got "${pair}"`);
      out.set[pair.slice(0, eq)] = pair.slice(eq + 1);
    } else if (a === '--help' || a === '-h') out.help = true;
    else throw new Error(`unknown argument "${a}" (try --help)`);
  }
  return out;
}

function renderValue(value) {
  if (value.includes('\n')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  if (/[\s#"'`$]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

// Matches KEY= then either a double-quoted value (possibly spanning lines), a
// single-quoted value, or a bare value up to the end of the line.
function upsertEnvValue(content, key, value) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^${escaped}=("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|[^\\r\\n]*)`,
    'm',
  );
  const rendered = renderValue(value);
  // a replacer function so `$&`, `$$` etc. in a pasted value get written as is
  if (!pattern.test(content)) return { content, missing: true };
  return { content: content.replace(pattern, () => `${key}=${rendered}`) };
}

function mask(value, reveal) {
  if (reveal) return value;
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}… (${value.length} chars)`;
}

function resolveValue(key, cfg) {
  if (cfg.value != null) return cfg.value;
  if (cfg.generate === 'hex32') return randomBytes(32).toString('hex');
  if (cfg.generate) throw new Error(`${key}: unknown generator "${cfg.generate}"`);
  throw new Error(`${key}: neither { value } nor { generate } given in ROTATIONS`);
}

function buildPlan(rotations) {
  const plan = [];
  for (const [key, cfg] of Object.entries(rotations)) {
    const spec = SECRETS[key];
    if (!spec) {
      console.warn(`! ${key}: not in secrets.manifest.mjs — skipping`);
      continue;
    }
    if (cfg.generate && spec.generate == null) {
      console.warn(`! ${key}: automatic generation is disabled — use --set ${key}=VALUE`);
      continue;
    }
    plan.push({ key, spec, value: resolveValue(key, cfg) });
  }
  return plan;
}

function report(plan, args) {
  console.log(
    args.apply
      ? '\nApplying to: local files, GitHub, Azure\n'
      : '\nDRY RUN (add --apply to write)\n',
  );
  for (const { key, spec, value } of plan) {
    console.log(`${key} = ${mask(value, args.reveal)}`);
    if (spec.note) console.log(`  note        ${spec.note}`);
    if (spec.files.length) console.log(`  local       ${spec.files.join(', ')}`);
    if (spec.github) console.log('  github      gh secret set');
    if (spec.azure?.secret) console.log(`  azure       secret ${spec.azure.secret}`);
    if (spec.azure?.env) console.log(`  azure       env ${spec.azure.env}`);
    console.log('');
  }
}

function writeFiles(plan) {
  for (const { key, spec, value } of plan) {
    for (const rel of spec.files) {
      const abs = path.join(repoRoot, rel);
      if (!existsSync(abs)) {
        console.log(`  ~  ${rel}: file missing, skipped`);
        continue;
      }
      const original = readFileSync(abs, 'utf8');
      const { content, missing } = upsertEnvValue(original, key, value);
      if (missing) {
        console.log(`  ~  ${rel}: ${key} not present, skipped`);
        continue;
      }
      if (content === original) {
        console.log(`  -  ${rel}: ${key} unchanged`);
        continue;
      }
      writeFileSync(abs, content);
      console.log(`  ~  ${rel}: ${key} updated`);
    }
  }
}

function pushGithub(plan) {
  const keys = plan.filter((p) => p.spec.github);
  for (const { key, value } of keys) {
    // stdin, not argv, since any local user can see argv in `ps`
    execFileSync('gh', ['secret', 'set', key], {
      input: value,
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    console.log(`  ~  github: ${key} set`);
  }
}

function pushAzure(plan) {
  const secrets = plan.filter((p) => p.spec.azure?.secret);
  const envs = plan.filter((p) => p.spec.azure?.env);

  // `az` has no stdin form for these commands, so the value is passed as an
  // argv entry and is briefly visible in the process table while it runs.
  if (secrets.length) {
    const pairs = secrets.map((p) => `${p.spec.azure.secret}=${p.value}`);
    execFileSync(
      'az',
      [
        'containerapp',
        'secret',
        'set',
        '-g',
        AZURE.resourceGroup,
        '-n',
        AZURE.app,
        '--secrets',
        ...pairs,
      ],
      { stdio: 'inherit' },
    );
    for (const p of secrets) console.log(`  ~  azure: secret ${p.spec.azure.secret} set`);
  }
  if (envs.length) {
    const pairs = envs.map((p) => `${p.spec.azure.env}=${p.value}`);
    execFileSync(
      'az',
      [
        'containerapp',
        'update',
        '-g',
        AZURE.resourceGroup,
        '-n',
        AZURE.app,
        '--set-env-vars',
        ...pairs,
      ],
      { stdio: 'inherit' },
    );
    for (const p of envs) console.log(`  ~  azure: env ${p.spec.azure.env} set`);
  }
}

async function confirm(plan) {
  const gh = plan.filter((p) => p.spec.github).length;
  const az = plan.filter((p) => p.spec.azure).length;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `\nWrite ${plan.length} secret(s) — ${gh} GitHub, ${az} Azure, plus local files? [y/N] `,
  );
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

function printHelp() {
  console.log(`usage: npm run secrets [-- <options>]

  --apply            write changes (default is a dry run)
  --yes, -y          skip the confirmation prompt
  --reveal           print full secret values instead of masking them
  --gen KEY          generate a value for KEY this run
  --set KEY=VALUE    set KEY to VALUE this run
  --help, -h         this text

Edit the ROTATIONS block in scripts/rotate-secrets.mjs, or pass --gen/--set.

Not managed here (set by hand):`);
  for (const [k, v] of Object.entries(NOT_MANAGED)) console.log(`  ${k} — ${v}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();

  const rotations = { ...ROTATIONS };
  for (const key of args.gen) rotations[key] = { generate: 'hex32' };
  for (const [key, value] of Object.entries(args.set)) rotations[key] = { value };

  if (!Object.keys(rotations).length) {
    console.log(
      'Nothing to rotate. Edit the ROTATIONS block or pass --gen/--set. (--help for more)',
    );
    return;
  }

  const plan = buildPlan(rotations);
  if (!plan.length) return;
  report(plan, args);
  if (!args.apply) return;

  if (!args.yes && !(await confirm(plan))) {
    console.log('Aborted.');
    return;
  }

  console.log('\nLocal files');
  writeFiles(plan);
  console.log('\nGitHub');
  pushGithub(plan);
  console.log('\nAzure');
  pushAzure(plan);
  console.log('\nDone. Azure secret changes roll a fresh revision automatically.');
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});
