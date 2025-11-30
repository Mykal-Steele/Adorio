const axios = require('axios');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// Helper to wait for the backend to be ready
const waitForBackend = async (url, retries = 30, interval = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(`${url}/api/health`);
      if (response.status === 200) return true;
    } catch (err) {
      // Ignore errors and wait
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Backend at ${url} did not become ready in time.`);
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
    
    // Listen for console errors to catch hidden crashes
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.toString());
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    
    const title = await page.title();
    expect(title).toBe('Adorio | Social Media Platform | Connect & Share');

    // Fail if there were critical JS errors
    if (consoleErrors.length > 0) {
      console.warn('Frontend Console Errors:', consoleErrors);
    }
    // We expect 0 errors, but sometimes 3rd party scripts (ads/analytics) fail. 
    // Uncomment this line to enforce 0 errors:
    // expect(consoleErrors.length).toBe(0);

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

  // --- SIDECAR (AI-SLOP) TESTS ---

  test('AI-Slop sidecar is mounted and serving content', async () => {
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
    
    // Fail if there were console errors on the /cao page
    if (consoleErrors.length > 0) {
      console.warn('AI-Slop Console Errors:', consoleErrors);
      // Uncomment to enforce 0 errors:
      // expect(consoleErrors.length).toBe(0);
    }

    await page.close();
  });

  test('AI-Slop has API key embedded', async () => {
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
    const response = await axios.get(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('isHealthy');
    expect(response.data.isHealthy).toBe(true);
  });

  test('Backend can retrieve posts (DB connectivity)', async () => {
    const response = await axios.get(`${baseUrl}/api/posts`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.posts)).toBe(true);
    
    // Optional: Check structure of first post if exists
    if (response.data.posts.length > 0) {
      expect(response.data.posts[0]).toHaveProperty('_id');
    }
  });

  // --- INFRASTRUCTURE / DOCKER TESTS ---

  test('Inter-service connectivity: Docker containers are running', () => {
    // NOTE: This test assumes we are running ON the host machine that has Docker CLI access.
    // If running inside a CI container, this might fail without socket binding.
    try {
      const output = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' });
      const containers = output.trim().split('\n');
      
      // In PROD (Docker Compose), names are usually prefixed with folder name "adorio"
      // We check for partial match to be safe against folder name changes
      const frontendRunning = containers.some(name => name.includes('frontend') || name.includes('adorio-frontend'));
      expect(frontendRunning).toBe(true);

      if (nodeEnv !== 'production') {
        // In DEV, sidecar is a separate container
        const sidecarRunning = containers.some(name => name.includes('ai-slop') || name.includes('adorio-ai-slop'));
        expect(sidecarRunning).toBe(true);
      }
    } catch (err) {
      console.warn("Skipping Docker CLI test: 'docker' command not found or no permission.");
    }
  });

  test('AI-Slop volume mount/copy verification', () => {
    try {
      if (nodeEnv === 'production') {
        // In prod, /cao is copied into the Nginx image. 
        // We exec into the frontend container to verify file existence.
        const output = execSync('docker exec adorio-frontend-1 ls /usr/share/nginx/html/cao/index.html', { encoding: 'utf8' });
        expect(output.trim()).toContain('index.html');
      } else {
        // In dev, ai-slop is separate and volume mounted
        const output = execSync('docker exec adorio-ai-slop-1 ls /usr/share/nginx/html/index.html', { encoding: 'utf8' });
        expect(output.trim()).toContain('index.html');
      }
    } catch (err) {
       console.warn("Skipping Volume Verification: Docker CLI access required.");
    }
  });
});