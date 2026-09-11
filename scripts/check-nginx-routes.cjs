#!/usr/bin/env node

// Every Next.js Route Handler under src/app/api/ needs an exact-match
// `location = /api/...` block in both nginx configs, or it silently falls
// through to the Express catch-all and 404s in production (this happened
// for real with /api/github-activity before nginx.production.conf and
// nginx.development.conf were fixed to exempt it).

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'src', 'app', 'api');
const NGINX_CONFIGS = ['nginx.production.conf', 'nginx.development.conf'].map((f) =>
  path.join(__dirname, '..', f),
);

function findApiRoutes(dir, apiRoot = dir) {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...findApiRoutes(full, apiRoot));
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      const relDir = path.relative(apiRoot, dir).split(path.sep).join('/');
      routes.push('/api' + (relDir ? '/' + relDir : ''));
    }
  }
  return routes;
}

const routes = findApiRoutes(API_DIR);
const dynamicRoutes = routes.filter((r) => r.includes('['));
const staticRoutes = routes.filter((r) => !r.includes('['));

if (dynamicRoutes.length > 0) {
  console.log(
    `Skipping ${dynamicRoutes.length} dynamic-segment route(s), not checkable against nginx exact-match blocks: ${dynamicRoutes.join(', ')}`,
  );
}

let failed = false;

for (const configPath of NGINX_CONFIGS) {
  const conf = fs.readFileSync(configPath, 'utf8');
  const confName = path.basename(configPath);
  for (const route of staticRoutes) {
    const pattern = new RegExp(`location\\s*=\\s*${route.replace(/\//g, '\\/')}\\s*\\{`);
    if (!pattern.test(conf)) {
      console.error(`✗ ${confName} has no "location = ${route}" block`);
      failed = true;
    }
  }
}

if (failed) {
  console.error(
    '\nAdd an exact-match `location = <path>` block proxying to Next.js in both nginx configs (see the existing /api/contact block for the pattern).',
  );
  process.exit(1);
}

console.log(
  `✓ All ${staticRoutes.length} Next.js API route(s) have matching nginx blocks in both configs`,
);
