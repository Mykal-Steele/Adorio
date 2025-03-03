const puppeteer = require("puppeteer");

let retryCount = 0;
const maxRetries = 3;

// Helper function to add a delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLogin() {
  // Launch the browser
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser", // Adjust this path to your installed Chromium
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("Navigating to adiorios.space...");
    await page.goto("https://adorio.space/", { waitUntil: "networkidle2" });
    console.log("Page loaded.");

    await page.waitForSelector("body"); // Check if the body is loaded
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
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log("Login form found.");

    console.log("Entering credentials...");
    await page.type('input[type="email"]', "t@t.com", { delay: 100 });
    await page.type('input[type="password"]', "t", { delay: 100 });

    console.log("Submitting login...");
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    console.log("Verifying login...");
    const currentUrl = await page.evaluate(() => window.location.pathname);
    if (currentUrl === "/home") {
      console.log("✅ Login successful!");
    } else {
      throw new Error(`❌ Login failed: Unexpected URL (${currentUrl})`);
    }

    console.log("Clearing session token...");
    await page.evaluate(() => localStorage.removeItem("token"));

    console.log("Login workflow completed successfully.");
  } catch (error) {
    console.error("Error during automation:", error);
    throw error;
  } finally {
    console.log("Closing browser...");
    await delay(3000);
    await browser.close();
  }
}

function attemptLogin() {
  console.log("Starting login attempt...");
  runLogin().catch((error) => {
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
  });
}

attemptLogin();
