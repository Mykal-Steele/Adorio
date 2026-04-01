const { spawnSync } = require("node:child_process");

const mode = process.argv[2] || "dev";
const hostPort = process.env.HOST_PORT || "18080";

const configByMode = {
  dev: {
    composeFile: "docker-compose.yml",
    envFile: ".env.development",
    waitTimeoutMs: "180000",
  },
  prod: {
    composeFile: "docker-compose.prod.yml",
    envFile: ".env.production",
    waitTimeoutMs: "240000",
  },
};

const config = configByMode[mode];
if (!config) {
  console.error(`Invalid mode: ${mode}. Use "dev" or "prod".`);
  process.exit(1);
}

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: options.env || process.env,
  });

  if (result.status !== 0 && !options.allowFailure) {
    process.exit(result.status || 1);
  }

  return result.status || 0;
};

const env = {
  ...process.env,
  HOST_PORT: hostPort,
};

const downArgs = [
  "compose",
  "-f",
  config.composeFile,
  "down",
  "--remove-orphans",
];
const downWithEnvArgs = [
  "compose",
  "--env-file",
  config.envFile,
  "-f",
  config.composeFile,
  "down",
  "--remove-orphans",
];
const upArgs = [
  "compose",
  "--env-file",
  config.envFile,
  "-f",
  config.composeFile,
  "up",
  "-d",
  "--build",
  "--remove-orphans",
];

try {
  run("bun", ["run", "docker:preflight"]);
  run("docker", downWithEnvArgs, { env, allowFailure: true });
  run("docker", upArgs, { env });
  run("bun", [
    "scripts/wait-for-url.cjs",
    `http://localhost:${hostPort}/api/health`,
    config.waitTimeoutMs,
    "1000",
  ]);
  run("bun", ["run", "test:integration"], { env });
} finally {
  run("docker", downWithEnvArgs, { env, allowFailure: true });
}
