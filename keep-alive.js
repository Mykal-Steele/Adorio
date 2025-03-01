const puppeteer = require("puppeteer");

let retryCount = 0;
const maxRetries = 3;

async function runLogin() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Helpful for CI environments
  });
  const page = await browser.newPage();

  try {
    // Navigate to the root of the GitHub Pages site
    console.log("Navigating to the root page...");
    await page.goto("https://mykal-steele.github.io/", {
      waitUntil: "networkidle2",
    });

    // Wait for the React app to load and check if we're already logged in
    console.log("Waiting for React app to load...");
    await page.waitForSelector('input[type="email"], .navbar', {
      timeout: 10000,
    });

    // Check if we're already on the home page (logged in)
    const isLoggedIn = await page.evaluate(() => {
      return window.location.pathname === "/home";
    });

    if (isLoggedIn) {
      console.log("Already logged in, clearing localStorage to log out...");
      await page.evaluate(() => {
        localStorage.removeItem("token");
      });
      await page.reload({ waitUntil: "networkidle2" });
    }

    // Wait for the login form to load
    console.log("Waiting for login form...");
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill in credentials
    console.log("Filling credentials...");
    await page.type('input[type="email"]', "t@t.com");
    await page.type('input[type="password"]', "t");

    // Submit the form and wait for the React app to update
    console.log("Submitting login...");
    await Promise.all([
      page.waitForSelector(".navbar", { timeout: 10000 }), // Wait for the navbar to appear after login
      page.click('button[type="submit"]'),
    ]);

    // Verify successful login by checking the URL and page content
    console.log("Verifying login success...");
    const currentUrl = await page.evaluate(() => window.location.pathname);
    if (currentUrl === "/home") {
      console.log("Login successful! Redirected to /home.");
    } else {
      throw new Error(
        `Login verification failed: Unexpected URL (${currentUrl})`
      );
    }

    // Take a screenshot for debugging (optional)
    await page.screenshot({ path: "debug-screenshot.png" });

    // Clear localStorage to simulate logout
    console.log("Clearing localStorage to log out...");
    await page.evaluate(() => {
      localStorage.removeItem("token");
    });

    console.log("Login workflow completed successfully.");
  } catch (error) {
    console.error("Error during automation:", error);
    // Take error screenshot for debugging
    await page.screenshot({ path: "error-screenshot.png" });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run and retry on failure with 10-second intervals, up to 3 times
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
      console.log("Max retries reached. Stopping...");
    }
  });
}

attemptLogin();
