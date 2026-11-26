import { describe, test, expect, mock, beforeEach } from 'bun:test';

// The admin analytics dashboard: one query per period that gives the totals, the chart,
// and the breakdowns, all from the same human-only visits.

const mockAggregateVisits = mock(() => Promise.resolve([]));
const mockDistinctVisitBrowsers = mock(() => Promise.resolve([]));
const mockFindAdminUserIds = mock(() => Promise.resolve([]));

mock.module('../../backend/models/index.js', () => ({
  aggregateVisits: mockAggregateVisits,
  distinctVisitBrowsers: mockDistinctVisitBrowsers,
  findAdminUserIds: mockFindAdminUserIds,
}));

const {
  classifyDevice,
  classifyBrowser,
  classifyOs,
  trafficSource,
  periodRange,
  getAnalyticsOverview,
} = await import('../../backend/services/analyticsOverview.js');
const { BOT_USER_AGENT_PATTERN } = await import('../../backend/services/visitorStats.js');

const UA = {
  chromeWin:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  edgeWin:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  safariIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  chromeIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  androidPhone:
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
  androidTablet:
    'Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  firefoxLinux: 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
  safariMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  operaMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/115.0.0.0',
  chromebook:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

describe('user agent buckets', () => {
  test('device', () => {
    expect(classifyDevice(UA.chromeWin)).toBe('Desktop');
    expect(classifyDevice(UA.safariMac)).toBe('Desktop');
    expect(classifyDevice(UA.safariIphone)).toBe('Mobile');
    expect(classifyDevice(UA.androidPhone)).toBe('Mobile');
    expect(classifyDevice(UA.ipad)).toBe('Tablet');
    expect(classifyDevice(UA.androidTablet)).toBe('Tablet');
  });

  test('browser', () => {
    expect(classifyBrowser(UA.chromeWin)).toBe('Chrome');
    expect(classifyBrowser(UA.chromeIphone)).toBe('Chrome');
    expect(classifyBrowser(UA.edgeWin)).toBe('Edge');
    expect(classifyBrowser(UA.operaMac)).toBe('Opera');
    expect(classifyBrowser(UA.androidPhone)).toBe('Samsung Internet');
    expect(classifyBrowser(UA.firefoxLinux)).toBe('Firefox');
    expect(classifyBrowser(UA.safariIphone)).toBe('Safari');
    expect(classifyBrowser(UA.safariMac)).toBe('Safari');
    expect(classifyBrowser('Something/1.0')).toBe('Other');
  });

  test('operating system', () => {
    expect(classifyOs(UA.chromeWin)).toBe('Windows');
    expect(classifyOs(UA.safariIphone)).toBe('iOS');
    expect(classifyOs(UA.ipad)).toBe('iOS');
    expect(classifyOs(UA.androidPhone)).toBe('Android');
    expect(classifyOs(UA.safariMac)).toBe('macOS');
    expect(classifyOs(UA.chromebook)).toBe('ChromeOS');
    expect(classifyOs(UA.firefoxLinux)).toBe('Linux');
    expect(classifyOs('Something/1.0')).toBe('Other');
  });
});

describe('trafficSource', () => {
  test('should prefer utm_source from the landing URL', () => {
    expect(
      trafficSource('https://www.google.com/', 'https://oakar.dev/?utm_source=LinkedIn&x=1'),
    ).toBe('linkedin');
  });

  test('should use the referring site without www', () => {
    expect(trafficSource('https://www.google.com/', 'https://oakar.dev/')).toBe('google.com');
    expect(trafficSource('https://github.com/Mykal-Steele', 'https://oakar.dev/')).toBe(
      'github.com',
    );
  });

  test('should call it Direct with no referrer or one from this site', () => {
    expect(trafficSource(null, 'https://oakar.dev/')).toBe('Direct');
    expect(trafficSource('', 'https://oakar.dev/')).toBe('Direct');
    expect(trafficSource('https://oakar.dev/projects', 'https://oakar.dev/')).toBe('Direct');
    expect(trafficSource('https://adorio.space/', 'https://oakar.dev/')).toBe('Direct');
  });
});

describe('periodRange', () => {
  // 26 Nov 2026, 19:00 in Bangkok
  const now = new Date('2026-11-26T12:00:00Z');

  test('today runs from midnight Bangkok time, in hours', () => {
    const r = periodRange('today', now);
    expect(r.from.toISOString()).toBe('2026-11-25T17:00:00.000Z');
    expect(r.unit).toBe('hour');
    expect(r.buckets).toHaveLength(24);
    expect(r.buckets[0]).toBe('2026-11-26T00');
    expect(r.previousFrom.toISOString()).toBe('2026-11-24T17:00:00.000Z');
  });

  test('30 days covers today and the 29 days before it, in days', () => {
    const r = periodRange('30d', now);
    expect(r.from.toISOString()).toBe('2026-10-27T17:00:00.000Z');
    expect(r.unit).toBe('day');
    expect(r.buckets).toHaveLength(30);
    expect(r.buckets[0]).toBe('2026-10-28');
    expect(r.buckets.at(-1)).toBe('2026-11-26');
    expect(r.previousFrom.toISOString()).toBe('2026-09-27T17:00:00.000Z');
    expect(r.previousTo.toISOString()).toBe(r.from.toISOString());
  });

  test('7 days', () => {
    const r = periodRange('7d', now);
    expect(r.buckets).toEqual([
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
      '2026-11-26',
    ]);
  });

  test('12 months starts on the first of the month 11 months back, in months', () => {
    const r = periodRange('12mo', now);
    expect(r.from.toISOString()).toBe('2025-11-30T17:00:00.000Z');
    expect(r.unit).toBe('month');
    expect(r.buckets[0]).toBe('2025-12');
    expect(r.buckets.at(-1)).toBe('2026-11');
    expect(r.previousFrom.toISOString()).toBe('2024-11-30T17:00:00.000Z');
  });

  test('should fall back to 30 days for an unknown period', () => {
    expect(periodRange('forever', now).buckets).toHaveLength(30);
  });
});

describe('getAnalyticsOverview', () => {
  const now = new Date('2026-11-26T12:00:00Z');
  const facets = {
    totals: [{ visitors: 10, visits: 16, bounces: 4, pageViews: 40, duration: 1_600_000 }],
    series: [
      { _id: '2026-11-20', visitors: 3, pageViews: 9 },
      { _id: '2026-11-26', visitors: 7, pageViews: 31 },
    ],
    pages: [{ _id: '/', visitors: 9, pageViews: 20 }],
    entryPages: [{ _id: '/', visits: 12 }],
    sources: [{ _id: 'google.com', visitors: 5 }],
    countries: [{ _id: 'TH', visitors: 8 }],
    devices: [{ _id: 'Mobile', visitors: 6 }],
    browsers: [{ _id: 'Chrome', visitors: 7 }],
    os: [{ _id: 'Android', visitors: 4 }],
    recent: [
      {
        createdAt: new Date('2026-11-26T11:58:00Z'),
        page: '/projects',
        referrer: 'https://www.google.com/',
        fullUrl: 'https://oakar.dev/projects',
        country: 'TH',
        userAgent: UA.safariIphone,
      },
    ],
  };

  beforeEach(() => {
    for (const m of [mockAggregateVisits, mockDistinctVisitBrowsers, mockFindAdminUserIds]) {
      m.mockReset();
    }
    mockDistinctVisitBrowsers.mockResolvedValue([]);
    mockFindAdminUserIds.mockResolvedValue([]);
    mockAggregateVisits
      .mockResolvedValueOnce([facets])
      .mockResolvedValueOnce([
        { totals: [{ visitors: 5, visits: 8, bounces: 4, pageViews: 16, duration: 400_000 }] },
      ])
      .mockResolvedValueOnce([{ live: 2 }]);
  });

  test('should work out the headline numbers', async () => {
    const o = await getAnalyticsOverview({ period: '7d', now });
    expect(o.totals).toEqual({
      visitors: 10,
      visits: 16,
      pageViews: 40,
      viewsPerVisit: 2.5,
      bounceRate: 25,
      avgVisitSeconds: 100,
    });
    expect(o.previous.visitors).toBe(5);
    expect(o.previous.bounceRate).toBe(50);
    expect(o.live).toBe(2);
  });

  test('should fill every bucket of the chart, empty ones as zero', async () => {
    const o = await getAnalyticsOverview({ period: '7d', now });
    expect(o.series).toHaveLength(7);
    expect(o.series[0]).toEqual({ bucket: '2026-11-20', visitors: 3, pageViews: 9 });
    expect(o.series[1]).toEqual({ bucket: '2026-11-21', visitors: 0, pageViews: 0 });
    expect(o.series[6]).toEqual({ bucket: '2026-11-26', visitors: 7, pageViews: 31 });
  });

  test('should return the breakdowns as name and count', async () => {
    const o = await getAnalyticsOverview({ period: '7d', now });
    expect(o.pages).toEqual([{ name: '/', visitors: 9, pageViews: 20 }]);
    expect(o.entryPages).toEqual([{ name: '/', visits: 12 }]);
    expect(o.sources).toEqual([{ name: 'google.com', visitors: 5 }]);
    expect(o.countries).toEqual([{ name: 'TH', visitors: 8 }]);
    expect(o.devices).toEqual([{ name: 'Mobile', visitors: 6 }]);
    expect(o.browsers).toEqual([{ name: 'Chrome', visitors: 7 }]);
    expect(o.os).toEqual([{ name: 'Android', visitors: 4 }]);
  });

  test('should list the latest page views by people with readable labels', async () => {
    const o = await getAnalyticsOverview({ period: '7d', now });
    expect(o.recent).toEqual([
      {
        at: '2026-11-26T11:58:00.000Z',
        page: '/projects',
        source: 'google.com',
        country: 'TH',
        device: 'Mobile',
        browser: 'Safari',
        os: 'iOS',
      },
    ]);
  });

  test('should give zeros, not NaN, when there are no visits', async () => {
    mockAggregateVisits.mockReset();
    mockAggregateVisits.mockResolvedValue([{}]);
    const o = await getAnalyticsOverview({ period: 'today', now });
    expect(o.totals).toEqual({
      visitors: 0,
      visits: 0,
      pageViews: 0,
      viewsPerVisit: 0,
      bounceRate: 0,
      avgVisitSeconds: 0,
    });
    expect(o.live).toBe(0);
    expect(o.recent).toEqual([]);
  });

  test('should leave out bots and the owner unless asked for everything', async () => {
    mockFindAdminUserIds.mockResolvedValue(['admin1']);
    mockDistinctVisitBrowsers.mockResolvedValue(['owner-laptop']);
    await getAnalyticsOverview({ period: '7d', now });
    const humans = JSON.stringify(mockAggregateVisits.mock.calls[0][0]);
    expect(humans).toContain(BOT_USER_AGENT_PATTERN);
    expect(humans).toContain('owner-laptop');

    mockAggregateVisits.mockReset();
    mockAggregateVisits.mockResolvedValue([{}]);
    await getAnalyticsOverview({ period: '7d', now, includeAll: true });
    const everything = JSON.stringify(mockAggregateVisits.mock.calls[0][0]);
    expect(everything).not.toContain(BOT_USER_AGENT_PATTERN);
    expect(everything).not.toContain('owner-laptop');
  });
});
