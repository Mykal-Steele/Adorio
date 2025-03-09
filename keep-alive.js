const puppeteer = require("puppeteer");

let retryCount = 0;
const maxRetries = 3;

// Helper function to add a delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLogin() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    headless: true, // Run headless in production
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,720",
    ],
  });

  const page = await browser.newPage();

  try {
    console.log("Navigating to adiorios.space...");
    await page.goto("https://adorio.space/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    console.log("Page loaded.");

    await page.waitForSelector("body");
    console.log("Page body found.");

    const isLoggedIn = await page.evaluate(
      () => window.location.pathname === "/home"
    );

    if (isLoggedIn) {
      console.log("Already logged in. Clearing session...");
      await page.evaluate(() => localStorage.removeItem("token"));
      await page.reload({ waitUntil: "networkidle2" });
      await delay(3000);
    }

    console.log("Waiting for login form...");
    await page.waitForSelector('input[type="email"]', { timeout: 60000 });
    console.log("Login form found.");

    console.log("Entering credentials...");
    await page.type('input[type="email"]', "t@t.com");
    await page.type('input[type="password"]', "t");

    console.log("Submitting login...");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    ]);

    console.log("Verifying login...");
    const currentUrl = await page.evaluate(() => window.location.pathname);
    if (currentUrl === "/home") {
      console.log("✅ Login successful!");
    } else {
      throw new Error(`❌ Login failed: unexpected URL (${currentUrl})`);
    }

    console.log("Login workflow completed successfully.");
    return true;
  } catch (error) {
    console.error("Error during automation:", error);
    throw error;
  } finally {
    // Always close the browser in production
    await browser.close();
    console.log("Browser closed.");
  }
}

async function attemptLogin() {
  console.log("Starting login attempt...");
  try {
    await runLogin();
    console.log("Login process completed successfully");
    process.exit(0);
  } catch (error) {
    if (retryCount < maxRetries) {
      retryCount++;
      console.error(
        `Script failed, retrying in 10 seconds... (Attempt ${retryCount}/${maxRetries})`
      );
      setTimeout(attemptLogin, 10000);
    } else {
      console.error("Max retries reached. Stopping...");
      process.exit(1);
    }
  }
}

// Handle unexpected errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Execute the login process
attemptLogin();
