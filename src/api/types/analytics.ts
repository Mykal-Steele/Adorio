export interface TrackPageViewPayload {
  path?: string;
  fullUrl?: string;
  referrer?: string;
  durationMs?: number;
  locale?: string;
  timezoneOffset?: number;
  metadata?: Record<string, unknown>;
  visitorId?: string;
  sessionId?: string;
  userId?: string;
}

export type Period = 'today' | '7d' | '30d' | '12mo';

export interface OverviewTotals {
  visitors: number;
  visits: number;
  pageViews: number;
  viewsPerVisit: number;
  bounceRate: number;
  avgVisitSeconds: number;
}

export interface SeriesPoint {
  bucket: string;
  visitors: number;
  pageViews: number;
}

export interface NamedCount {
  name: string;
  visitors: number;
  pageViews?: number;
}

export interface RecentVisit {
  at: string;
  page: string;
  source: string;
  country: string | null;
  device: string;
  browser: string;
  os: string;
}

export interface AnalyticsOverview {
  period: Period;
  unit: 'hour' | 'day' | 'month';
  timezone: string;
  live: number;
  excluded: { ownerAccounts: number; ownerBrowsers: number };
  totals: OverviewTotals;
  previous: OverviewTotals;
  series: SeriesPoint[];
  pages: NamedCount[];
  entryPages: { name: string; visits: number }[];
  sources: NamedCount[];
  countries: NamedCount[];
  devices: NamedCount[];
  browsers: NamedCount[];
  os: NamedCount[];
  recent: RecentVisit[];
}
