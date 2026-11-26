import { describe, test, expect, mock, beforeEach } from 'bun:test';

// Monthly unique human visitors for the admin page: one count per browser per month,
// leaving out bots, crawlers, test browsers and the site owner's own visits.

const mockAggregateVisits = mock(() => Promise.resolve([]));
const mockDistinctVisitBrowsers = mock(() => Promise.resolve([]));
const mockFindAdminUserIds = mock(() => Promise.resolve([]));
const mockCreateVisit = mock((data) => Promise.resolve(data));

mock.module('../../backend/models/index.js', () => ({
  aggregateVisits: mockAggregateVisits,
  distinctVisitBrowsers: mockDistinctVisitBrowsers,
  findAdminUserIds: mockFindAdminUserIds,
  createVisit: mockCreateVisit,
  findRecentVisits: mock(() => Promise.resolve([])),
  findVisitsByVisitorId: mock(() => Promise.resolve([])),
  findUsersByIds: mock(() => Promise.resolve([])),
}));

const { isBotUserAgent, getMonthlyVisitorStats, BOT_USER_AGENT_PATTERN } =
  await import('../../backend/services/visitorStats.js');

const { recordVisit } = await import('../../backend/services/analyticsService.js');

const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const FIREFOX = 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0';

describe('isBotUserAgent', () => {
  test('should treat normal browsers as people', () => {
    for (const ua of [CHROME, IPHONE, FIREFOX]) expect(isBotUserAgent(ua)).toBe(false);
  });

  test('should flag crawlers, AI bots, headless browsers and scripts', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse',
      'curl/8.11.0',
      'python-requests/2.32.3',
      'facebookexternalhit/1.1',
    ]) {
      expect(isBotUserAgent(ua)).toBe(true);
    }
  });

  test('should treat a missing user agent as a bot', () => {
    expect(isBotUserAgent(undefined)).toBe(true);
    expect(isBotUserAgent('')).toBe(true);
  });

  test('should export the same pattern for the database query', () => {
    expect(new RegExp(BOT_USER_AGENT_PATTERN, 'i').test('Googlebot')).toBe(true);
    expect(new RegExp(BOT_USER_AGENT_PATTERN, 'i').test(CHROME)).toBe(false);
  });
});

describe('getMonthlyVisitorStats', () => {
  const NOW = new Date('2026-11-26T12:00:00+07:00');

  beforeEach(() => {
    mockAggregateVisits.mockReset();
    mockDistinctVisitBrowsers.mockReset();
    mockFindAdminUserIds.mockReset();
    mockAggregateVisits.mockResolvedValue([]);
    mockDistinctVisitBrowsers.mockResolvedValue([]);
    mockFindAdminUserIds.mockResolvedValue([]);
  });

  test('should return one row per month, newest first, with empty months as zero', async () => {
    mockAggregateVisits.mockResolvedValueOnce([
      { _id: '2026-11', visitors: 40, engagedVisitors: 25, pageViews: 130, sessions: 52 },
      { _id: '2026-09', visitors: 12, engagedVisitors: 5, pageViews: 30, sessions: 14 },
    ]);
    const stats = await getMonthlyVisitorStats({ months: 3, now: NOW });
    expect(stats.months).toEqual([
      { month: '2026-11', visitors: 40, engagedVisitors: 25, pageViews: 130, sessions: 52 },
      { month: '2026-10', visitors: 0, engagedVisitors: 0, pageViews: 0, sessions: 0 },
      { month: '2026-09', visitors: 12, engagedVisitors: 5, pageViews: 30, sessions: 14 },
    ]);
  });

  test('should count months in Bangkok time and start at the first day of the oldest month', async () => {
    await getMonthlyVisitorStats({ months: 3, now: NOW });
    const pipeline = mockAggregateVisits.mock.calls[0][0];
    const match = pipeline[0].$match;
    // 1 Sep 2026 00:00 in Bangkok
    expect(match.createdAt.$gte.toISOString()).toBe('2026-08-31T17:00:00.000Z');
    expect(JSON.stringify(pipeline)).toContain('"timezone":"Asia/Bangkok"');
  });

  test('should leave out bots and the owner, by account and by browser', async () => {
    mockFindAdminUserIds.mockResolvedValue(['admin1']);
    mockDistinctVisitBrowsers.mockResolvedValue(['owner-laptop', 'owner-phone']);
    await getMonthlyVisitorStats({ months: 1, now: NOW });

    expect(mockDistinctVisitBrowsers).toHaveBeenCalledWith({ userId: { $in: ['admin1'] } });
    const pipeline = JSON.stringify(mockAggregateVisits.mock.calls[0][0]);
    expect(pipeline).toContain(BOT_USER_AGENT_PATTERN);
    expect(pipeline).toContain('admin1');
    expect(pipeline).toContain('owner-laptop');
    expect(pipeline).toContain('owner-phone');
  });

  test('should report the browser ids it left out as the owner', async () => {
    mockFindAdminUserIds.mockResolvedValue(['admin1']);
    mockDistinctVisitBrowsers.mockResolvedValue(['owner-laptop']);
    const stats = await getMonthlyVisitorStats({ months: 1, now: NOW });
    expect(stats.excluded.ownerBrowsers).toBe(1);
  });

  test('should cap the range at 24 months', async () => {
    const stats = await getMonthlyVisitorStats({ months: 500, now: NOW });
    expect(stats.months).toHaveLength(24);
  });
});

describe('recordVisit', () => {
  test('should keep the browser id next to the hashed visitor id', async () => {
    const saved = await recordVisit({ visitorId: 'hash1', browserId: 'browser-a', path: '/' });
    expect(saved.browserId).toBe('browser-a');
    expect(saved.visitorId).toBe('hash1');
  });

  test('should keep the country Cloudflare reports, and drop unknown codes', async () => {
    expect((await recordVisit({ visitorId: 'h', path: '/', country: 'th' })).country).toBe('TH');
    expect((await recordVisit({ visitorId: 'h', path: '/', country: 'XX' })).country).toBe(null);
    expect((await recordVisit({ visitorId: 'h', path: '/', country: 'T1' })).country).toBe(null);
    expect((await recordVisit({ visitorId: 'h', path: '/' })).country).toBe(null);
  });
});
