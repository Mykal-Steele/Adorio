const puppeteer = require("puppeteer");

let retryCount = 0;
const maxRetries = 3;

// Helper function to add a delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLogin() {
  const browser = await puppeteer.launch({
    headless: true, // Headless mode for production
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    await page.goto("https://mykal-steele.github.io/", {
      waitUntil: "networkidle2",
    });
    await delay(5000);

    await page.waitForSelector('input[type="email"], .navbar', {
      timeout: 10000,
    });
    await delay(5000);

    const isLoggedIn = await page.evaluate(
      () => window.location.pathname === "/home"
    );

    if (isLoggedIn) {
      await page.evaluate(() => localStorage.removeItem("token"));
      await delay(5000);
      await page.reload({ waitUntil: "networkidle2" });
      await delay(5000);
    }

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await delay(5000);

    await page.type('input[type="email"]', "t@t.com");
    await page.type('input[type="password"]', "t");
    await delay(5000);

    await Promise.all([page.click('button[type="submit"]')]);
    await delay(5000);

    const currentUrl = await page.evaluate(() => window.location.pathname);
    if (currentUrl === "/home") {
      console.log("Login successful! Redirected to /home.");
    } else {
      throw new Error(
        `Login verification failed: Unexpected URL (${currentUrl})`
      );
    }

    await page.evaluate(() => localStorage.removeItem("token"));
    await delay(5000);

    console.log("Login workflow completed successfully.");
  } catch (error) {
    console.error("Error during automation:", error);
    throw error;
  } finally {
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
