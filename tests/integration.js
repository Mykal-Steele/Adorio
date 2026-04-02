import axios from "axios";
import puppeteer from "puppeteer";
import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";

const safeExec = (command) => {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout).trim() : "";
    const stderr = error?.stderr ? String(error.stderr).trim() : "";
    return [stdout, stderr].filter(Boolean).join("\n").trim() || "No output";
  }
};

const collectDockerDebugInfo = () => {
  const ps = safeExec('docker ps --format "{{.Names}}\t{{.Status}}"');
  const composeServices = safeExec(
    "docker compose -f docker-compose.yml ps --all",
  );
  const composeProdServices = safeExec(
    "docker compose -f docker-compose.prod.yml ps --all",
  );

  return [
    "--- docker ps ---",
    ps || "No running containers",
    "--- docker compose (dev) ps ---",
    composeServices || "No compose services (dev)",
    "--- docker compose (prod) ps ---",
    composeProdServices || "No compose services (prod)",
  ].join("\n");
};

const hostPort = process.env.HOST_PORT || "8080";
const hasManagedTestTarget =
  Boolean(process.env.HOST_PORT) || Boolean(process.env.TEST_TARGET_URL);

const shouldStubRequest = (requestUrl) => {
  try {
    const url = new URL(requestUrl);
    return ["/api/stats/track", "/api/stats/client-metrics"].includes(
      url.pathname,
    );
  } catch {
    return false;
  }
};

const ignoredConsoleErrorPatterns = [
  /^Failed to load resource: net::ERR_NETWORK_CHANGED$/i,
];

const isIgnoredConsoleError = (message) =>
  ignoredConsoleErrorPatterns.some((pattern) => pattern.test(message));

const stubNonCriticalRequests = async (page) => {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (shouldStubRequest(request.url())) {
      request.respond({
        status: 204,
        contentType: "application/json",
        body: "{}",
      });
      return;
    }

    request.continue();
  });
};

const waitForBackend = async (url, retries = 30, interval = 2000) => {
  let lastErrorMessage = "No response received from backend";

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(`${url}/api/health`, {
        timeout: 5000,
      });
      if (response.status === 200) return true;
    } catch (err) {
      lastErrorMessage = err?.message || "Unknown request error";
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  const dockerInfo = collectDockerDebugInfo();
  throw new Error(
    `Backend at ${url} did not become ready in time. Last request error: ${lastErrorMessage}\n${dockerInfo}`,
  );
};

const getWithRetry = async (url, retries = 5, interval = 1000) => {
  let lastError = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, {
        timeout: Math.max(1000, Math.min(interval - 100, 5000)),
      });
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error(
    `Failed after ${retries} retries for ${url}: ${lastError?.message || "Unknown request error"}`,
  );
};

describe("Adorio Integration Tests", () => {
  let browser;
  let nodeEnv;
  let baseUrl;

  beforeAll(async () => {
    if (!hasManagedTestTarget) {
      throw new Error(
        "Integration tests need a running stack. Use `bun run test:integration` (dev) or `bun run test:prod` (prod), not `bun test`.",
      );
    }

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    baseUrl = process.env.TEST_TARGET_URL || `http://localhost:${hostPort}`;
    console.log(`Waiting for backend at ${baseUrl}...`);
    await waitForBackend(baseUrl);
    console.log("Waiting for network to settle...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await axios.get(`${baseUrl}/api/test-env`);
      nodeEnv = response.data.NODE_ENV;
      console.log(`Environment detected: ${nodeEnv}`);
    } catch (error) {
      throw new Error(
        `Failed to read test environment: ${error?.message || "unknown error"}`,
      );
    }
  }, 120000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test("Backend env vars are exposed in expected format", async () => {
    const response = await axios.get(`${baseUrl}/api/test-env`);
    expect(response.status).toBe(200);
    expect(typeof response.data.NODE_ENV).toBe("string");
    expect(response.data.MONGO_URI).toBe(true);
    expect(response.data.JWT_SECRET).toBe(true);
    expect(response.data.CLOUDINARY_KEY).toBe(true);
    expect(response.data.CLOUDINARY_SECRET).toBe(true);

    expect(typeof response.data.CLOUDINARY_NAME).toBe("string");
    expect(response.data.CLOUDINARY_NAME.length).toBeGreaterThan(0);
    expect(typeof response.data.CLIENT_URL).toBe("string");
    expect(typeof response.data.PORT).toBe("string");
  });

  test("Frontend loads without runtime errors", async () => {
    const page = await browser.newPage();
    const consoleErrors = [];

    await stubNonCriticalRequests(page);

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.toString());
    });

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

    await page.waitForSelector(".ts-left-sidebar h1", { visible: true });

    const profileName = await page.$eval(".ts-left-sidebar h1", (element) =>
      element.textContent.trim(),
    );
    expect(profileName).toBe("Oakar Oo");

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const filteredConsoleErrors = consoleErrors.filter(
      (message) => !isIgnoredConsoleError(message),
    );

    if (filteredConsoleErrors.length > 0) {
      console.error("Frontend Console Errors:", filteredConsoleErrors);
    }
    expect(filteredConsoleErrors).toEqual([]);

    const apiOk = await page.evaluate(async () => {
      try {
        const response = await fetch("/api/health");
        return response.ok;
      } catch {
        return false;
      }
    });
    expect(apiOk).toBe(true);
    await page.close();
  });

  test("Sidecar route is available in development stack", async () => {
    if (nodeEnv === "production") {
      return;
    }

    const page = await browser.newPage();
    const consoleErrors = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.toString());
    });

    const response = await page.goto(`${baseUrl}/cao/`, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("body", { visible: true });

    expect(response.status()).toBe(200);
    const currentUrl = page.url();
    expect(currentUrl).toContain("/cao/");

    if (consoleErrors.length > 0) {
      console.error("Sidecar console errors:", consoleErrors);
    }
    expect(consoleErrors).toEqual([]);

    await page.close();
  });

  test("Backend health check passes", async () => {
    const response = await getWithRetry(`${baseUrl}/api/health`, 8, 750);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("isHealthy");
    expect(response.data.isHealthy).toBe(true);
  });

  test("Backend can retrieve posts (DB connectivity)", async () => {
    const response = await getWithRetry(`${baseUrl}/api/posts`, 8, 750);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.posts)).toBe(true);

    if (response.data.posts.length > 0) {
      const post = response.data.posts[0];
      expect(post).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          content: expect.any(String),
          user: expect.objectContaining({
            _id: expect.any(String),
            username: expect.any(String),
          }),
        }),
      );

      expect(post).toHaveProperty("image");
      expect(Array.isArray(post.likes)).toBe(true);
    }
  });

  test("Backend can retrieve single post by id when present", async () => {
    const allPosts = await getWithRetry(`${baseUrl}/api/posts`, 8, 750);
    if (allPosts.data.posts.length === 0) {
      return;
    }

    const id = allPosts.data.posts[0]._id;
    const single = await getWithRetry(`${baseUrl}/api/posts/${id}`, 8, 750);
    expect(single.status).toBe(200);
    expect(single.data).toEqual(expect.objectContaining({ _id: id }));
  });

  test("Unknown API endpoint returns 404", async () => {
    const response = await axios
      .get(`${baseUrl}/api/not-real-route`)
      .catch((err) => err.response);
    expect(response.status).toBe(404);
  });
});
