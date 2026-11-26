import { aggregateVisits } from '../models/index.js';
import { browserExpr, humanVisitFilter } from './visitorStats.js';

// Everything the admin analytics page shows for one period, from one aggregation over
// human visits (see humanVisitFilter). A visitor is a browser, a visit is a session.

const TIMEZONE = 'Asia/Bangkok';
const UTC_OFFSET_MS = 7 * 3600_000; // Bangkok has no daylight saving
const DAY_MS = 24 * 3600_000;
const LIVE_WINDOW_MS = 5 * 60_000;
// a tab left open overnight shouldn't count as a 9 hour visit
const MAX_PAGE_MS = 30 * 60_000;
const LIST_LIMIT = 15;

// The same rules sort user agents in JS (tests, one-off checks) and in the Mongo query.
// First match wins.
const DEVICE_RULES = [
  ['Tablet', 'iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)'],
  ['Mobile', 'Mobi|iPhone|iPod|Android|Windows Phone'],
];
const BROWSER_RULES = [
  ['Edge', 'Edg(e|A|iOS)?/'],
  ['Opera', 'OPR/|Opera'],
  ['Samsung Internet', 'SamsungBrowser'],
  ['Firefox', 'Firefox/|FxiOS'],
  ['Chrome', 'Chrome/|CriOS'],
  ['Safari', 'Safari/'],
];
const OS_RULES = [
  ['iOS', 'iPhone|iPad|iPod'],
  ['Android', 'Android'],
  ['Windows', 'Windows'],
  ['ChromeOS', 'CrOS'],
  ['macOS', 'Mac OS X|Macintosh'],
  ['Linux', 'Linux'],
];

const classify = (rules, fallback) => (userAgent) =>
  rules.find(([, pattern]) => new RegExp(pattern, 'i').test(userAgent || ''))?.[0] ?? fallback;

export const classifyDevice = classify(DEVICE_RULES, 'Desktop');
export const classifyBrowser = classify(BROWSER_RULES, 'Other');
export const classifyOs = classify(OS_RULES, 'Other');

const classifyExpr = (rules, fallback, input) => ({
  $switch: {
    branches: rules.map(([label, pattern]) => ({
      case: { $regexMatch: { input, regex: pattern, options: 'i' } },
      then: label,
    })),
    default: fallback,
  },
});

const UTM_SOURCE = '[?&]utm_source=([^&#]+)';
const REFERRER_HOST = '^[a-z][a-z0-9+.-]*://(?:www\\.)?([^/:?#]+)';
// links between pages of this site, and from the old domain, are not a source
const OWN_HOST = '(^|\\.)(oakar\\.dev|adorio\\.space)$|^localhost$|^127\\.0\\.0\\.1$';

export function trafficSource(referrer, fullUrl) {
  const utm = new RegExp(UTM_SOURCE, 'i').exec(fullUrl || '');
  if (utm) return utm[1].toLowerCase();
  const host = new RegExp(REFERRER_HOST, 'i').exec(referrer || '')?.[1]?.toLowerCase();
  if (!host || new RegExp(OWN_HOST, 'i').test(host)) return 'Direct';
  return host;
}

const sourceExpr = {
  $let: {
    vars: {
      utm: {
        $regexFind: { input: { $ifNull: ['$fullUrl', ''] }, regex: UTM_SOURCE, options: 'i' },
      },
      ref: {
        $regexFind: { input: { $ifNull: ['$referrer', ''] }, regex: REFERRER_HOST, options: 'i' },
      },
    },
    in: {
      $switch: {
        branches: [
          { case: { $ne: ['$$utm', null] }, then: { $toLower: { $first: '$$utm.captures' } } },
          { case: { $eq: ['$$ref', null] }, then: 'Direct' },
          {
            case: {
              $regexMatch: { input: { $first: '$$ref.captures' }, regex: OWN_HOST, options: 'i' },
            },
            then: 'Direct',
          },
        ],
        default: { $toLower: { $first: '$$ref.captures' } },
      },
    },
  },
};

const PERIODS = {
  today: { unit: 'hour' },
  '7d': { unit: 'day', days: 7 },
  '30d': { unit: 'day', days: 30 },
  '12mo': { unit: 'month', months: 12 },
};

const FORMATS = { hour: '%Y-%m-%dT%H', day: '%Y-%m-%d', month: '%Y-%m' };

const pad = (n) => String(n).padStart(2, '0');

// Start and end of a period in UTC, its chart buckets in Bangkok time, and the period
// before it, which the totals are compared against.
export function periodRange(period, now = new Date()) {
  const key = PERIODS[period] ? period : '30d';
  const { unit, days, months } = PERIODS[key];
  const local = new Date(now.getTime() + UTC_OFFSET_MS);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();
  const toUtc = (localMs) => new Date(localMs - UTC_OFFSET_MS);

  if (unit === 'hour') {
    const from = toUtc(Date.UTC(y, m, d));
    return {
      period: key,
      unit,
      from,
      to: now,
      previousFrom: new Date(from.getTime() - DAY_MS),
      previousTo: new Date(now.getTime() - DAY_MS),
      buckets: Array.from({ length: 24 }, (_, h) => `${y}-${pad(m + 1)}-${pad(d)}T${pad(h)}`),
    };
  }

  if (unit === 'day') {
    const from = toUtc(Date.UTC(y, m, d - (days - 1)));
    return {
      period: key,
      unit,
      from,
      to: now,
      previousFrom: new Date(from.getTime() - days * DAY_MS),
      previousTo: from,
      buckets: Array.from({ length: days }, (_, i) => {
        const day = new Date(Date.UTC(y, m, d - (days - 1) + i));
        return `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;
      }),
    };
  }

  const from = toUtc(Date.UTC(y, m - (months - 1), 1));
  return {
    period: key,
    unit,
    from,
    to: now,
    previousFrom: toUtc(Date.UTC(y, m - (2 * months - 1), 1)),
    previousTo: from,
    buckets: Array.from({ length: months }, (_, i) => {
      const month = new Date(Date.UTC(y, m - (months - 1) + i, 1));
      return `${month.getUTCFullYear()}-${pad(month.getUTCMonth() + 1)}`;
    }),
  };
}

function baseStages(filter, from, to) {
  return [
    { $match: { ...filter.match, createdAt: { $gte: from, $lt: to } } },
    {
      $addFields: {
        browser: browserExpr,
        // the tracker sends one extra record on unload with the time spent; not a page view
        isView: { $ne: ['$metadata.event', 'unload'] },
        page: { $first: { $split: ['$path', '?'] } },
        dur: { $min: [{ $ifNull: ['$durationMs', 0] }, MAX_PAGE_MS] },
        sessionKey: {
          $ifNull: [
            '$sessionId',
            {
              $concat: [
                browserExpr,
                '|',
                { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TIMEZONE } },
              ],
            },
          ],
        },
      },
    },
    ...filter.ownerStage,
  ];
}

const totalsFacet = [
  {
    $group: {
      _id: '$sessionKey',
      browser: { $first: '$browser' },
      views: { $sum: { $cond: ['$isView', 1, 0] } },
      duration: { $sum: '$dur' },
    },
  },
  { $match: { views: { $gt: 0 } } },
  {
    $group: {
      _id: null,
      visitors: { $addToSet: '$browser' },
      visits: { $sum: 1 },
      bounces: { $sum: { $cond: [{ $eq: ['$views', 1] }, 1, 0] } },
      pageViews: { $sum: '$views' },
      duration: { $sum: '$duration' },
    },
  },
  {
    $project: {
      _id: 0,
      visitors: { $size: '$visitors' },
      visits: 1,
      bounces: 1,
      pageViews: 1,
      duration: 1,
    },
  },
];

// distinct browsers per value of expr
const visitorsBy = (expr) => [
  { $group: { _id: { key: expr, browser: '$browser' } } },
  { $group: { _id: '$_id.key', visitors: { $sum: 1 } } },
  { $sort: { visitors: -1, _id: 1 } },
  { $limit: LIST_LIMIT },
];

// the first page view of each visit, for entry pages and sources
const firstViews = [
  { $match: { isView: true } },
  { $sort: { createdAt: 1 } },
  {
    $group: {
      _id: '$sessionKey',
      page: { $first: '$page' },
      referrer: { $first: '$referrer' },
      fullUrl: { $first: '$fullUrl' },
      browser: { $first: '$browser' },
    },
  },
];

const byUserAgent = (rules, fallback) => [
  { $group: { _id: '$browser', ua: { $first: '$userAgent' } } },
  {
    $group: {
      _id: classifyExpr(rules, fallback, { $ifNull: ['$ua', ''] }),
      visitors: { $sum: 1 },
    },
  },
  { $sort: { visitors: -1, _id: 1 } },
];

function summarize(raw) {
  const t = raw?.[0] ?? {};
  const visits = t.visits ?? 0;
  const pageViews = t.pageViews ?? 0;
  return {
    visitors: t.visitors ?? 0,
    visits,
    pageViews,
    viewsPerVisit: visits ? Math.round((pageViews / visits) * 10) / 10 : 0,
    bounceRate: visits ? Math.round(((t.bounces ?? 0) / visits) * 100) : 0,
    avgVisitSeconds: visits ? Math.round((t.duration ?? 0) / visits / 1000) : 0,
  };
}

const named = (rows = [], countKey = 'visitors') =>
  rows.map(({ _id, ...rest }) => ({ name: _id, ...rest, [countKey]: rest[countKey] ?? 0 }));

export async function getAnalyticsOverview({ period, now = new Date(), includeAll = false } = {}) {
  const range = periodRange(period, now);
  const filter = includeAll
    ? { match: {}, ownerStage: [], excluded: { ownerAccounts: 0, ownerBrowsers: 0 } }
    : await humanVisitFilter();

  const bucketExpr = {
    $dateToString: { format: FORMATS[range.unit], date: '$createdAt', timezone: TIMEZONE },
  };

  const [current] = await aggregateVisits([
    ...baseStages(filter, range.from, range.to),
    {
      $facet: {
        totals: totalsFacet,
        series: [
          { $match: { isView: true } },
          { $group: { _id: { bucket: bucketExpr, browser: '$browser' }, views: { $sum: 1 } } },
          { $group: { _id: '$_id.bucket', visitors: { $sum: 1 }, pageViews: { $sum: '$views' } } },
        ],
        pages: [
          { $match: { isView: true } },
          { $group: { _id: { page: '$page', browser: '$browser' }, views: { $sum: 1 } } },
          { $group: { _id: '$_id.page', visitors: { $sum: 1 }, pageViews: { $sum: '$views' } } },
          { $sort: { visitors: -1, pageViews: -1, _id: 1 } },
          { $limit: LIST_LIMIT },
        ],
        entryPages: [
          ...firstViews,
          { $group: { _id: '$page', visits: { $sum: 1 } } },
          { $sort: { visits: -1, _id: 1 } },
          { $limit: LIST_LIMIT },
        ],
        sources: [...firstViews, { $addFields: { source: sourceExpr } }, ...visitorsBy('$source')],
        countries: visitorsBy({ $ifNull: ['$country', 'Unknown'] }),
        devices: byUserAgent(DEVICE_RULES, 'Desktop'),
        browsers: byUserAgent(BROWSER_RULES, 'Other'),
        os: byUserAgent(OS_RULES, 'Other'),
        recent: [
          { $match: { isView: true } },
          { $sort: { createdAt: -1 } },
          { $limit: 25 },
          {
            $project: {
              _id: 0,
              createdAt: 1,
              page: 1,
              referrer: 1,
              fullUrl: 1,
              country: 1,
              userAgent: 1,
            },
          },
        ],
      },
    },
  ]);

  const [previous] = await aggregateVisits([
    ...baseStages(filter, range.previousFrom, range.previousTo),
    { $facet: { totals: totalsFacet } },
  ]);

  const [live] = await aggregateVisits([
    ...baseStages(filter, new Date(now.getTime() - LIVE_WINDOW_MS), now),
    { $group: { _id: '$browser' } },
    { $count: 'live' },
  ]);

  const series = new Map((current?.series ?? []).map((row) => [row._id, row]));
  return {
    period: range.period,
    unit: range.unit,
    timezone: TIMEZONE,
    from: range.from,
    to: range.to,
    excluded: filter.excluded,
    live: live?.live ?? 0,
    totals: summarize(current?.totals),
    previous: summarize(previous?.totals),
    series: range.buckets.map((bucket) => ({
      bucket,
      visitors: series.get(bucket)?.visitors ?? 0,
      pageViews: series.get(bucket)?.pageViews ?? 0,
    })),
    pages: named(current?.pages),
    entryPages: named(current?.entryPages, 'visits'),
    sources: named(current?.sources),
    countries: named(current?.countries),
    devices: named(current?.devices),
    browsers: named(current?.browsers),
    os: named(current?.os),
    recent: (current?.recent ?? []).map((v) => ({
      at: new Date(v.createdAt).toISOString(),
      page: v.page,
      source: trafficSource(v.referrer, v.fullUrl),
      country: v.country ?? null,
      device: classifyDevice(v.userAgent),
      browser: classifyBrowser(v.userAgent),
      os: classifyOs(v.userAgent),
    })),
  };
}
