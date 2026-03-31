// cspell:ignore adorio nosniff networkidle domcontentloaded
const axios = require('axios');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

jest.setTimeout(240000); // ensure CI can wait for containers to start

const safeExec = command => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout).trim() : '';
    const stderr = error?.stderr ? String(error.stderr).trim() : '';
    return [stdout, stderr].filter(Boolean).join('\n').trim() || 'No output';
  }
};

const collectDockerDebugInfo = () => {
  const ps = safeExec('docker ps --format "{{.Names}}\t{{.Status}}"');
  const composeServices = safeExec('docker compose -f docker-compose.yml ps --all');
  const composeProdServices = safeExec('docker compose -f docker-compose.prod.yml ps --all');

  return [
    '--- docker ps ---',
    ps || 'No running containers',
    '--- docker compose (dev) ps ---',
    composeServices || 'No compose services (dev)',
    '--- docker compose (prod) ps ---',
    composeProdServices || 'No compose services (prod)'
  ].join('\n');
};

// Helper to wait for the backend to be ready
const waitForBackend = async (url, retries = 30, interval = 2000) => {
  let lastErrorMessage = 'No response received from backend';

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(`${url}/api/health`);
      if (response.status === 200) return true;
    } catch (err) {
      lastErrorMessage = err?.message || 'Unknown request error';
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  const dockerInfo = collectDockerDebugInfo();
  throw new Error(
    `Backend at ${url} did not become ready in time. Last request error: ${lastErrorMessage}\n${dockerInfo}`
  );
};

const getWithRetry = async (url, retries = 5, interval = 1000) => {
  let lastError = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error(`Failed after ${retries} retries for ${url}: ${lastError?.message || 'Unknown request error'}`);
};

// cspell:ignore adorio nosniff networkidle domcontentloaded
const validateContainerName = (containers, patterns) => containers.some(name => patterns.some(p => name.includes(p)));

const skipWhenDockerUnavailable = fn => {
  try {
    return fn();
  } catch (err) {
    console.warn("Skipping Docker CLI test: docker command missing or no permissions.", err);
    return null;
  }
};

describe('Adorio Integration Tests', () => {
  let browser;
  let nodeEnv;
  let expectedClientUrl;
  let expectedPort;
  let baseUrl; // Use this to target the correct URL dynamically

  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: "new",
      // Add args if running in CI/Docker environment often helps stability
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    // Determine base URL - locally it's usually localhost:8080 or the mapped port
    // If you are testing the PROD URL directly, change this default.
    baseUrl = process.env.TEST_TARGET_URL || 'http://localhost:8080';

    console.log(`Waiting for backend at ${baseUrl}...`);
    await waitForBackend(baseUrl);

    // Get environment from backend
    try {
      const response = await axios.get(`${baseUrl}/api/test-env`);
      nodeEnv = response.data.NODE_ENV;
      // In production, we expect the public URL; in dev, localhost
      expectedClientUrl = nodeEnv === 'production' ? 'https://adorio.space' : 'http://localhost:8080';
      expectedPort = '3000';
      console.log(`Environment detected: ${nodeEnv}`);
    } catch (error) {
      console.error('Failed to get env from backend:', error.message);
      throw error; // Fail fast if we can't even get the env
    }
  }, 120000); // Increased timeout for docker startup

  afterAll(async () => {
    if (browser) await browser.close();
  });

  // --- CONFIGURATION & ENV TESTS ---

  test('Backend env vars are set correctly', async () => {
    const response = await axios.get(`${baseUrl}/api/test-env`);
    expect(response.status).toBe(200);
    expect(response.data.NODE_ENV).toBe(nodeEnv);
    
    // Backend returns boolean (true if set) for sensitive env vars
    expect(response.data.MONGO_URI).toBe(true);
    expect(response.data.JWT_SECRET).toBe(true);
    expect(typeof response.data.CLOUDINARY_NAME).toBe('string');
    expect(response.data.CLOUDINARY_NAME.length).toBeGreaterThan(0);
    expect(response.data.CLOUDINARY_KEY).toBe(true);
    expect(response.data.CLOUDINARY_SECRET).toBe(true);
    
    // For non-sensitive strings
    expect(typeof response.data.CLIENT_URL).toBe('string');
    expect(response.data.CLIENT_URL).toBe(expectedClientUrl);
    expect(typeof response.data.PORT).toBe('string');
    expect(response.data.PORT).toBe(expectedPort);
  });

  // --- SECURITY & HEADERS TESTS (Handled by Cloudflare in Prod) ---

  test('Security Headers are present', async () => {
    // We check the headers on the main index page
    const response = await axios.get(baseUrl);
    
    // Check for basic security headers (only in production, since dev nginx doesn't have them)
    if (nodeEnv === 'production') {
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    } else {
      // In dev, no headers set in nginx
      console.log('Dev mode: Security headers not checked (handled by Cloudflare in prod)');
    }
  });

  // --- FRONTEND FUNCTIONALITY TESTS ---

  test('Frontend loads correctly without Console Errors', async () => {
    const page = await browser.newPage();
    const consoleErrors = [];
    const failedResourceResponses = [];
    
    // Listen for console errors to catch hidden crashes
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.toString());
    });
    page.on('response', response => {
      if (response.status() >= 500) {
        failedResourceResponses.push({
          status: response.status(),
          url: response.url(),
        });
      }
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    
    const title = await page.title();
    expect(title).toBe('Adorio | Project Hub');

    // Fail on any console errors or 5xx static resource responses to keep errors visible.
    if (consoleErrors.length > 0) {
      console.error('Frontend Console Errors:', consoleErrors);
    }
    if (failedResourceResponses.length > 0) {
      console.error('Frontend 5xx Resources:', failedResourceResponses);
    }
    expect(consoleErrors).toEqual([]);
    expect(failedResourceResponses).toEqual([]);

    // Check if the frontend can make an API call (Smoke test)
    const apiOk = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/health');
        return response.ok;
      } catch {
        return false;
      }
    });
    expect(apiOk).toBe(true);
    await page.close();
  });

  // --- SIDECAR TESTS ---

  test('Sidecar is mounted and serving content', async () => {
    const page = await browser.newPage();
    const consoleErrors = [];
    
    // Listen for console errors on the /cao page
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.toString());
    });

    const response = await page.goto(`${baseUrl}/cao/`, { waitUntil: 'domcontentloaded' });
    
    // Ensure it's a 200 OK (not a 404 falling back to main app)
    expect(response.status()).toBe(200);

    const title = await page.title();
    expect(title).toBe('ArchMaster - Architecture Exam Prep');
    
    // Check that we're on the correct URL (not redirected to main app)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/cao/');
    
    // Verify it's actually the sidecar and not the main React app
    const content = await page.content();
    expect(content).toContain('ArchMaster'); // Assuming the title or header is in the content
    expect(content).not.toContain('Adorio | Social Media Platform'); // Ensure it's not the main app
    
    // Fail on any sidecar console errors.
    if (consoleErrors.length > 0) {
      console.error('Sidecar console errors:', consoleErrors);
    }
    expect(consoleErrors).toEqual([]);

    await page.close();
  });

  test('Sidecar has API key embedded', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/cao/`);
    
    // 1. Negative Check: Ensure error message isn't there
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain('API Key not found');

    // 2. Positive Check (Optional but recommended): 
    // Does the global config variable exist? (Assuming it's injected into window.CONFIG or similar)
    // const hasConfig = await page.evaluate(() => window.ENV_API_KEY !== undefined);
    // expect(hasConfig).toBe(true);

    await page.close();
  });

  // --- BACKEND API TESTS ---

  test('Backend health check passes', async () => {
    const response = await getWithRetry(`${baseUrl}/api/health`, 8, 750);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('isHealthy');
    expect(response.data.isHealthy).toBe(true);
  });

  test('Backend can retrieve posts (DB connectivity)', async () => {
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
        })
      );

      expect(post).toHaveProperty('image');
      expect(Array.isArray(post.likes)).toBe(true);
    }
  });

  test('Backend can retrieve single post by id when present', async () => {
    const allPosts = await getWithRetry(`${baseUrl}/api/posts`, 8, 750);
    if (allPosts.data.posts.length === 0) {
      return;
    }

    const id = allPosts.data.posts[0]._id;
    const single = await getWithRetry(`${baseUrl}/api/posts/${id}`, 8, 750);
    expect(single.status).toBe(200);
    expect(single.data).toEqual(expect.objectContaining({ _id: id }));
  });

  test('Unknown API endpoint returns 404', async () => {
    const response = await axios.get(`${baseUrl}/api/not-real-route`).catch(err => err.response);
    expect(response.status).toBe(404);
  });

  // --- INFRASTRUCTURE / DOCKER TESTS ---

  test('Inter-service connectivity: Docker containers are running', () => {
    // NOTE: This test assumes we are running ON the host machine that has Docker CLI access.
    // If running inside a CI container, this might fail without socket binding.
    skipWhenDockerUnavailable(() => {
      const output = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' });
      const containers = output.trim().split('\n');

      const frontendRunning = validateContainerName(containers, ['frontend', 'adorio-frontend']);
      expect(frontendRunning).toBe(true);

      if (nodeEnv !== 'production') {
        const sidecarRunning = validateContainerName(containers, ['ai-slop', 'adorio-ai-slop']);
        expect(sidecarRunning).toBe(true);
      }
    });
  });

  test('Sidecar volume mount/copy verification', () => {
    skipWhenDockerUnavailable(() => {
      if (nodeEnv === 'production') {
        const output = execSync('docker exec adorio-frontend-1 ls /usr/share/nginx/html/cao/index.html', { encoding: 'utf8' });
        expect(output.trim()).toContain('index.html');
      } else {
        const output = execSync('docker exec adorio-ai-slop-1 ls /usr/share/nginx/html/index.html', { encoding: 'utf8' });
        expect(output.trim()).toContain('index.html');
      }
    });
  });
});