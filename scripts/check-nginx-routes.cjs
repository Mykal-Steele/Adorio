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

// Dynamic-segment routes (e.g. /api/foo/[id]) can't get an exact nginx
// `location =` match — a real request carries an actual value, not the
// literal `[id]`. Each one needs a human to add a `location <prefix>` block
// proxying that subtree to Next.js, then register it here. An unregistered
// dynamic route fails this check instead of being silently skipped, so a new
// route can't reach production unrouted.
const VERIFIED_DYNAMIC_ROUTES = {
  // '/api/foo/[id]': '/api/foo/',
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

let failed = false;

for (const route of dynamicRoutes) {
  if (!Object.prototype.hasOwnProperty.call(VERIFIED_DYNAMIC_ROUTES, route)) {
    console.error(
      `✗ ${route} is a dynamic API route with no verified nginx mapping.\n` +
        `  A "location = <path>" block can't match it (real requests carry an actual\n` +
        `  value, not the literal segment name), so it needs a "location <prefix>"\n` +
        `  block proxying the whole subtree to Next.js in both nginx configs. Add that\n` +
        `  block, then register the route in VERIFIED_DYNAMIC_ROUTES in this script.`,
    );
    failed = true;
  }
}

for (const configPath of NGINX_CONFIGS) {
  const conf = fs.readFileSync(configPath, 'utf8');
  const confName = path.basename(configPath);

  for (const route of staticRoutes) {
    const pattern = new RegExp(`location\\s*=\\s*${escapeRegExp(route)}\\s*\\{`);
    if (!pattern.test(conf)) {
      console.error(`✗ ${confName} has no "location = ${route}" block`);
      failed = true;
    }
  }

  for (const route of dynamicRoutes) {
    const nginxPrefix = VERIFIED_DYNAMIC_ROUTES[route];
    if (!nginxPrefix) continue; // already reported above

    const pattern = new RegExp(`location\\s+${escapeRegExp(nginxPrefix)}\\s*\\{`);
    if (!pattern.test(conf)) {
      console.error(
        `✗ ${confName} has no "location ${nginxPrefix}" block for dynamic route ${route}`,
      );
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
  `✓ All ${staticRoutes.length} static + ${dynamicRoutes.length} verified dynamic Next.js API route(s) have matching nginx blocks in both configs`,
);
