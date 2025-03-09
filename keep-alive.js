const puppeteer = require("puppeteer");

let retryCount = 0;
const maxRetries = 3;

// Helper function to add a delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLogin() {
  // Launch the browser with visibility for debugging
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, // use default chrome on local
    headless: false, // set to false to see the browser
    defaultViewport: null, // use full size
    args: [
      "--start-maximized", // maximize window
      "--disable-dev-shm-usage",
    ],
    slowMo: 50, // slow down operations by 50ms so you can see what's happening
  });

  const page = await browser.newPage();

  try {
    console.log("navigating to adiorios.space...");
    await page.goto("https://adorio.space/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    console.log("page loaded.");

    await page.waitForSelector("body");
    console.log("page body found.");

    const isLoggedIn = await page.evaluate(
      () => window.location.pathname === "/home"
    );

    if (isLoggedIn) {
      console.log("already logged in. clearing session...");
      await page.evaluate(() => localStorage.removeItem("token"));
      await page.reload({ waitUntil: "networkidle2" });
      await delay(3000);
    }

    console.log("waiting for login form...");
    await page.waitForSelector('input[type="email"]', { timeout: 60000 });
    console.log("login form found.");

    console.log("entering credentials...");
    await page.type('input[type="email"]', "t@t.com");
    await page.type('input[type="password"]', "t");

    console.log("submitting login...");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    ]);

    console.log("verifying login...");
    const currentUrl = await page.evaluate(() => window.location.pathname);
    if (currentUrl === "/home") {
      console.log("✅ login successful!");
    } else {
      throw new Error(`❌ login failed: unexpected URL (${currentUrl})`);
    }

    // don't close automatically to allow debugging
    console.log("login workflow completed successfully.");
    console.log(
      "browser will stay open for debugging - press Ctrl+C to exit when done"
    );

    // optional: uncomment this if you want it to eventually close
    // await delay(60000); // keep open for 60 seconds

    return true;
  } catch (error) {
    console.error("error during automation:", error);

    // keep browser open on error for debugging
    console.log("keeping browser open for debugging - press Ctrl+C to exit");
    await delay(300000); // 5 minutes to debug
    throw error;
  }
  // Remove the finally block to prevent automatic browser closing
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
