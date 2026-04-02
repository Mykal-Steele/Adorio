const { existsSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoots = [".", "backend", "ai-slop/AI-Slop-For-CAO-exam"];

const removeDirectory = (directoryPath) => {
  if (existsSync(directoryPath)) {
    rmSync(directoryPath, { recursive: true, force: true });
  }
};

const runBunInstall = (directoryPath) => {
  const result = spawnSync("bun", ["install"], {
    cwd: directoryPath,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    const projectName = directoryPath === "." ? "root" : directoryPath;
    throw new Error(`bun install failed in ${projectName}`);
  }
};

for (const root of projectRoots) {
  removeDirectory(join(root, "node_modules"));
}

for (const root of projectRoots) {
  runBunInstall(root);
}
