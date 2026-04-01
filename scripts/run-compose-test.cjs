const { spawnSync } = require("node:child_process");
const net = require("node:net");

const mode = process.argv[2] || "dev";

const isPortFree = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });

const resolveHostPort = async () => {
  if (process.env.HOST_PORT) {
    return process.env.HOST_PORT;
  }

  const candidatePorts = [8080, 18080, 38080];
  for (const port of candidatePorts) {
    if (await isPortFree(port)) {
      return String(port);
    }
  }

  throw new Error(
    "No free host port found. Set HOST_PORT to an available port and retry.",
  );
};

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
    const error = new Error(`Command failed: ${command} ${args.join(" ")}`);
    error.exitCode = result.status || 1;
    throw error;
  }

  return result.status || 0;
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

let testError;
let cleanupRan = false;

const cleanupCompose = (env) => {
  if (cleanupRan || !env) {
    return;
  }

  cleanupRan = true;
  run("docker", downWithEnvArgs, { env, allowFailure: true });
};

const registerCleanupHandlers = (env) => {
  const onSignal = (signal) => {
    cleanupCompose(env);
    process.exit(1);
  };

  process.once("SIGINT", () => onSignal("SIGINT"));
  process.once("SIGTERM", () => onSignal("SIGTERM"));

  process.once("uncaughtException", (error) => {
    cleanupCompose(env);
    throw error;
  });

  process.once("unhandledRejection", (reason) => {
    cleanupCompose(env);
    throw reason;
  });
};

const main = async () => {
  const hostPort = await resolveHostPort();
  const env = {
    ...process.env,
    HOST_PORT: hostPort,
  };

  registerCleanupHandlers(env);

  console.log(`Using HOST_PORT=${hostPort}`);

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
    run(
      "bun",
      ["test", "--timeout", "240000", "./tests/integration.js"],
      {
        env,
      },
    );
  } catch (error) {
    testError = error;
  } finally {
    cleanupCompose(env);
  }

  if (testError) {
    console.error(testError.message);
    process.exitCode = testError.exitCode || 1;
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
