const { BASE_URL } = require('./helpers');

// The portfolio scrolls inside <main>, not the window, so the browser does not restore it
describe('Portfolio scroll position and explorer', () => {
  let puppeteer;
  let browser;

  beforeAll(async () => {
    // puppeteer 25 is ESM only, so it loads through import() instead of require()
    ({ default: puppeteer } = await import('puppeteer'));
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }, 120_000);

  afterAll(async () => {
    if (browser) await browser.close();
  });

  const openAbout = async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('nav[aria-label=Explorer]');
    return page;
  };

  const scrollTop = (page) => page.$eval('main', (main) => Math.round(main.scrollTop));

  const scrollMainTo = async (page, top) => {
    await page.$eval('main', (main, y) => (main.scrollTop = y), top);
    await page.waitForFunction(
      (y) => Math.abs(document.querySelector('main').scrollTop - y) <= 2,
      {},
      top,
    );
    // Positions are saved a moment after scrolling stops
    await new Promise((resolve) => setTimeout(resolve, 400));
  };

  const openFromExplorer = async (page, href) => {
    await page.click(`nav[aria-label=Explorer] a[href="${href}"]`);
    await page.waitForFunction((path) => location.pathname === path, { timeout: 30000 }, href);
  };

  const expectScrollTop = (page, top) =>
    page.waitForFunction(
      (y) => Math.abs(document.querySelector('main').scrollTop - y) <= 2,
      { timeout: 10000 },
      top,
    );

  test('should put a page back where it was left when going Back to it', async () => {
    const page = await openAbout();
    await scrollMainTo(page, 900);
    await openFromExplorer(page, '/projects/adorio');
    await page.goBack({ waitUntil: 'networkidle0' });
    expect(await page.evaluate(() => location.pathname)).toBe('/');
    await expectScrollTop(page, 900);
    await page.close();
  }, 90_000);

  test('should start a page that was never opened at the top', async () => {
    const page = await openAbout();
    await scrollMainTo(page, 900);
    await openFromExplorer(page, '/projects/adorio');
    await expectScrollTop(page, 0);
    expect(await scrollTop(page)).toBe(0);
    await page.close();
  }, 90_000);

  test('should keep the position after a refresh', async () => {
    const page = await openAbout();
    await scrollMainTo(page, 900);
    await page.reload({ waitUntil: 'networkidle0' });
    await expectScrollTop(page, 900);
    await page.close();
  }, 90_000);

  test('should start a page at the top again after its tab is closed', async () => {
    const page = await openAbout();
    await scrollMainTo(page, 900);
    await openFromExplorer(page, '/projects/adorio');
    await page.click('[aria-label="Close about_me.md"]');
    await openFromExplorer(page, '/');
    await expectScrollTop(page, 0);
    await page.close();
  }, 90_000);

  test('should open the skills folder when a skill page is opened from About', async () => {
    const page = await openAbout();
    const skillsFolderOpen = () =>
      page.$$eval('nav[aria-label=Explorer] button[aria-expanded]', (buttons) =>
        buttons.find((b) => b.textContent.trim() === 'skills')?.getAttribute('aria-expanded'),
      );
    expect(await skillsFolderOpen()).toBe('false');
    await page.click('main a[href="/skills/azure"]');
    await page.waitForFunction(() => location.pathname === '/skills/azure', { timeout: 30000 });
    await page.waitForSelector('nav[aria-label=Explorer] a[href="/skills/azure"]');
    expect(await skillsFolderOpen()).toBe('true');
    await page.close();
  }, 90_000);
});
