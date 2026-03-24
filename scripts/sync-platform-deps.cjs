#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const projects = [
  { name: 'root', dir: rootDir },
  { name: 'backend', dir: path.join(rootDir, 'backend') },
  { name: 'ai-slop', dir: path.join(rootDir, 'ai-slop', 'AI-Slop-For-CAO-exam') }
];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed (${code}): ${command} ${args.join(' ')}`));
    });
  });
}

async function reinstallProject(project) {
  const packageJsonPath = path.join(project.dir, 'package.json');
  const lockFilePath = path.join(project.dir, 'package-lock.json');
  const nodeModulesPath = path.join(project.dir, 'node_modules');

  if (!(await pathExists(packageJsonPath))) {
    console.log(`- Skipping ${project.name}: package.json not found`);
    return;
  }

  console.log(`\n==> ${project.name}`);

  if (await pathExists(nodeModulesPath)) {
    console.log('Removing node_modules...');
    await fs.rm(nodeModulesPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 250
    });
  }

  const installArgs = (await pathExists(lockFilePath)) ? ['ci'] : ['install'];
  console.log(`Running ${npmCmd} ${installArgs.join(' ')}...`);
  await runCommand(npmCmd, installArgs, project.dir);
}

async function main() {
  console.log(`Platform dependency sync for ${process.platform}/${process.arch}`);

  for (const project of projects) {
    await reinstallProject(project);
  }

  console.log('\nDone. Dependencies are now aligned with this OS/CPU.');
}

main().catch((error) => {
  console.error('\nPlatform dependency sync failed.');
  console.error(error.message);
  process.exit(1);
});
