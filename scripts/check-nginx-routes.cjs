#!/usr/bin/env node

// Every route handler under src/app/api/ needs a `location = /api/...` block in
// both nginx configs, or it falls through to Express and 404s in prod. That
// happened with /api/github-activity.

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '..', 'src', 'app', 'api');
const NGINX_CONFIGS = ['nginx.production.conf', 'nginx.development.conf'].map((f) =>
  path.join(__dirname, '..', f),
);

// a dynamic route like /api/foo/[id] can't use `location =` since requests have a real
// value there. Add a `location /api/foo/` block for it by hand, then list it here as
// '/api/foo/[id]': '/api/foo/'. Unlisted dynamic routes fail the check on purpose.
const VERIFIED_DYNAMIC_ROUTES = {};

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
