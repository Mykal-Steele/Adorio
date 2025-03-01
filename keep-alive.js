const puppeteer = require("puppeteer");

let retryCount = 0;
const maxRetries = 3;

async function runLogin() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto("https://mykal-steele.github.io/login");

    // Fill in credentials
    await page.type('input[type="email"]', "t@t.com");
    await page.type('input[type="password"]', "t");

    // Submit form
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]'),
    ]);

    console.log("Login successful");

    // Clear localStorage to simulate logout
    await page.evaluate(() => {
      localStorage.removeItem("token");
    });
  } catch (error) {
    console.error("Error during automation:", error);
  } finally {
    await browser.close();
  }
}

// Run and retry on failure with 10-second intervals, up to 3 times
function attemptLogin() {
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
