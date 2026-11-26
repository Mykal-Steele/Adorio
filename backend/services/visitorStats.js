import { aggregateVisits, distinctVisitBrowsers, findAdminUserIds } from '../models/index.js';

// Monthly unique human visitors. A visitor is one browser (the id kept in its cookie and
// localStorage), counted once per month. Bots, scripts, headless browsers and the site
// owner's own browsers are left out. Visits saved before browserId existed fall back to
// the hashed visitorId, which changes with the IP, so older months count a little high.

export const BOT_USER_AGENT_PATTERN =
  'bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|externalhit|embedly|whatsapp|telegram|discord|slack|curl|wget|python|httpx|aiohttp|axios|node-fetch|undici|go-http|java/|okhttp|libwww|scrapy|phantomjs|puppeteer|playwright|selenium|chatgpt|perplexity|claude|anthropic|bytespider';

const BOT_RE = new RegExp(BOT_USER_AGENT_PATTERN, 'i');

export const isBotUserAgent = (userAgent) => !userAgent || BOT_RE.test(userAgent);

const TIMEZONE = 'Asia/Bangkok';
const UTC_OFFSET_HOURS = 7; // Bangkok has no daylight saving
const MAX_MONTHS = 24;

// first day of each month, newest first, as YYYY-MM in Bangkok time
function monthKeys(now, months) {
  const local = new Date(now.getTime() + UTC_OFFSET_HOURS * 3600_000);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(year, month - i, 1));
    return {
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      start: new Date(d.getTime() - UTC_OFFSET_HOURS * 3600_000),
    };
  });
}

const clampMonths = (value) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return 12;
  return Math.min(n, MAX_MONTHS);
};

// The filter every human-only count uses: no bots, scripts or headless browsers, and none
// of the site owner's visits. A browser the owner ever signed in on counts as the owner's,
// also when signed out. ownerStage needs a browser field (browserExpr) set before it.
export const humanVisitFilter = async () => {
  const adminIds = await findAdminUserIds();
  const ownerBrowsers = adminIds.length
    ? await distinctVisitBrowsers({ userId: { $in: adminIds } })
    : [];
  const match = {
    userAgent: { $type: 'string', $not: { $regex: BOT_USER_AGENT_PATTERN, $options: 'i' } },
  };
  if (adminIds.length) match.userId = { $nin: adminIds };
  return {
    match,
    ownerStage: ownerBrowsers.length ? [{ $match: { browser: { $nin: ownerBrowsers } } }] : [],
    excluded: { ownerAccounts: adminIds.length, ownerBrowsers: ownerBrowsers.length },
  };
};

export const browserExpr = { $ifNull: ['$browserId', '$visitorId'] };

export const getMonthlyVisitorStats = async ({ months, now = new Date() } = {}) => {
  const keys = monthKeys(now, clampMonths(months));
  const since = keys[keys.length - 1].start;
  const filter = await humanVisitFilter();
  const match = { ...filter.match, createdAt: { $gte: since } };

  const rows = await aggregateVisits([
    { $match: match },
    {
      $addFields: {
        browser: browserExpr,
        month: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: TIMEZONE } },
        // the tracker sends one extra record on unload with the time spent; not a page view
        isView: { $ne: ['$metadata.event', 'unload'] },
      },
    },
    ...filter.ownerStage,
    {
      $group: {
        _id: { month: '$month', browser: '$browser' },
        views: { $sum: { $cond: ['$isView', 1, 0] } },
        longest: { $max: { $ifNull: ['$durationMs', 0] } },
        sessions: { $addToSet: '$sessionId' },
      },
    },
    { $match: { views: { $gt: 0 } } },
    {
      $group: {
        _id: '$_id.month',
        visitors: { $sum: 1 },
        // opened a second page or stayed 10 seconds on one
        engagedVisitors: {
          $sum: {
            $cond: [{ $or: [{ $gte: ['$views', 2] }, { $gte: ['$longest', 10_000] }] }, 1, 0],
          },
        },
        pageViews: { $sum: '$views' },
        sessions: { $sum: { $size: { $setDifference: ['$sessions', [null]] } } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const byMonth = new Map(rows.map((row) => [row._id, row]));
  return {
    timezone: TIMEZONE,
    excluded: filter.excluded,
    months: keys.map(({ key }) => {
      const row = byMonth.get(key);
      return {
        month: key,
        visitors: row?.visitors ?? 0,
        engagedVisitors: row?.engagedVisitors ?? 0,
        pageViews: row?.pageViews ?? 0,
        sessions: row?.sessions ?? 0,
      };
    }),
  };
};
