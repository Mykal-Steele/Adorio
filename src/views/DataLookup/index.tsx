'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAnalyticsOverview } from '../../api/analytics';
import type { AnalyticsOverview, OverviewTotals, Period } from '../../api/types/analytics';
import { BreakdownCard } from './BreakdownCard';
import { TrendChart, type Metric } from './TrendChart';
import { RecentVisits } from './RecentVisits';
import MonthlyVisitors from './MonthlyVisitors';
import { card, countryName, formatDuration, formatNumber } from './format';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '12mo', label: '12 months' },
];

const PREVIOUS_LABEL: Record<Period, string> = {
  today: 'yesterday',
  '7d': 'the 7 days before',
  '30d': 'the 30 days before',
  '12mo': 'the 12 months before',
};

type Tile = {
  key: keyof OverviewTotals;
  label: string;
  format: (n: number) => string;
  // a rate moves by points, and for bounce rate lower is better
  points?: boolean;
  metric?: Metric;
};

const TILES: Tile[] = [
  { key: 'visitors', label: 'Unique visitors', format: formatNumber, metric: 'visitors' },
  { key: 'visits', label: 'Visits', format: formatNumber },
  { key: 'pageViews', label: 'Page views', format: formatNumber, metric: 'pageViews' },
  { key: 'viewsPerVisit', label: 'Views per visit', format: (n) => n.toFixed(1) },
  { key: 'bounceRate', label: 'Bounce rate', format: (n) => `${n}%`, points: true },
  { key: 'avgVisitSeconds', label: 'Visit time', format: formatDuration },
];

type Change = { text: string; tone: 'good' | 'bad' | 'flat' };

function change(tile: Tile, now: number, before: number): Change | null {
  const diff = tile.points ? now - before : before ? ((now - before) / before) * 100 : null;
  if (diff === null) return now ? { text: 'new', tone: 'good' } : null;
  const rounded = Math.round(diff);
  if (rounded === 0) return { text: '0%', tone: 'flat' };
  const up = rounded > 0;
  return {
    text: `${up ? '↑' : '↓'} ${Math.abs(rounded)}${tile.points ? ' pts' : '%'}`,
    tone: up !== Boolean(tile.points) ? 'good' : 'bad',
  };
}

const TONE = {
  good: 'text-[#2f6b2a]',
  bad: 'text-[#a33a1a]',
  flat: 'text-[var(--paper-muted-2)]',
};

export default function DataLookup() {
  const [period, setPeriod] = useState<Period>('30d');
  const [includeAll, setIncludeAll] = useState(false);
  const [metric, setMetric] = useState<Metric>('visitors');
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // a slow answer for an older period must never replace the one just asked for
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const overview = await fetchAnalyticsOverview({ period, all: includeAll }, controller.signal);
      if (!controller.signal.aborted) setData(overview);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Could not load analytics.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [period, includeAll]);

  useEffect(() => {
    load();
    return () => request.current?.abort();
  }, [load]);

  // refresh once a minute while the tab is in view, for the live count
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60_000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="paper-theme min-h-screen pb-16 font-paper-sans">
      <div className="mx-auto max-w-6xl space-y-4 px-4 pt-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-[var(--paper-muted-2)]">
              {data
                ? `${formatNumber(data.live)} ${data.live === 1 ? 'person' : 'people'} on the site in the last 5 minutes`
                : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--paper-muted)]">
              <input
                type="checkbox"
                checked={includeAll}
                onChange={(e) => setIncludeAll(e.target.checked)}
                className="h-4 w-4 accent-[var(--paper-ink)]"
              />
              Include bots and my visits
            </label>
            <div
              role="radiogroup"
              aria-label="Period"
              className="flex rounded-[6px] border border-[var(--paper-line)] bg-[var(--paper-cream)] p-0.5"
            >
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={period === p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`rounded-[4px] px-3 py-1 text-sm font-semibold transition-colors ${
                    period === p.id
                      ? 'bg-[var(--paper-ink)] text-[var(--paper-cream)]'
                      : 'text-[var(--paper-muted)] hover:bg-[var(--paper-hero)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {error ? (
          <div role="alert" className={`${card} flex items-center justify-between gap-4 p-4`}>
            <p className="text-sm">Couldn&apos;t load analytics: {error}</p>
            <button
              type="button"
              onClick={load}
              className="rounded-[4px] bg-[var(--paper-ink)] px-3 py-1 text-sm font-semibold text-[var(--paper-cream)]"
            >
              Try again
            </button>
          </div>
        ) : null}

        <div aria-busy={loading} className={`space-y-4 ${loading && data ? 'opacity-60' : ''}`}>
          <section aria-label="Totals" className={`${card} p-2`}>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
              {TILES.map((tile) => {
                const now = data?.totals[tile.key] ?? 0;
                const delta = data ? change(tile, now, data.previous[tile.key]) : null;
                const selected = tile.metric === metric;
                const body = (
                  <>
                    <span className="block text-xs font-semibold text-[var(--paper-muted-2)]">
                      {tile.label}
                    </span>
                    <span className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-bold [font-variant-numeric:lining-nums_tabular-nums]">
                        {data ? tile.format(now) : '–'}
                      </span>
                      {delta ? (
                        <span
                          className={`text-xs font-semibold ${TONE[delta.tone]}`}
                          title={`Compared with ${PREVIOUS_LABEL[data!.period]}`}
                        >
                          {delta.text}
                        </span>
                      ) : null}
                    </span>
                  </>
                );
                const base = 'rounded-[4px] px-3 py-2.5 text-left';
                return tile.metric ? (
                  <button
                    key={tile.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMetric(tile.metric!)}
                    className={`${base} transition-colors ${
                      selected ? 'bg-[var(--paper-hero)]' : 'hover:bg-[var(--paper-hero)]'
                    }`}
                  >
                    {body}
                  </button>
                ) : (
                  <div key={tile.key} className={base}>
                    {body}
                  </div>
                );
              })}
            </div>
            <div className="px-2 pb-2 pt-4">
              <TrendChart
                series={data?.series ?? []}
                unit={data?.unit ?? 'day'}
                metric={metric}
                loading={!data}
              />
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownCard
              tabs={[{ id: 'sources', label: 'Sources', column: 'Source', rows: data?.sources }]}
            />
            <BreakdownCard
              tabs={[
                { id: 'pages', label: 'Top pages', column: 'Page', rows: data?.pages },
                {
                  id: 'entry',
                  label: 'Entry pages',
                  column: 'Page',
                  rows: data?.entryPages?.map((r) => ({ name: r.name, count: r.visits })),
                  countLabel: 'Visits',
                },
              ]}
            />
            <BreakdownCard
              tabs={[
                {
                  id: 'countries',
                  label: 'Countries',
                  column: 'Country',
                  rows: data?.countries?.map((r) => ({ ...r, name: countryName(r.name) })),
                },
              ]}
              note="Countries are recorded from 26 Nov 2026, so older visits show as Unknown."
            />
            <BreakdownCard
              tabs={[
                { id: 'browsers', label: 'Browsers', column: 'Browser', rows: data?.browsers },
                { id: 'os', label: 'Operating systems', column: 'OS', rows: data?.os },
                { id: 'devices', label: 'Devices', column: 'Device', rows: data?.devices },
              ]}
            />
          </div>

          <RecentVisits rows={data?.recent} />
        </div>

        <MonthlyVisitors />

        <p className="text-xs leading-relaxed text-[var(--paper-muted-2)]">
          A visitor is one browser. A visit lasts until the tab closes. Bounce rate is the share of
          visits that saw one page. Changes compare with the period before. Times are Bangkok time.
          {data && !includeAll
            ? ` Bots, scripts and ${data.excluded.ownerBrowsers} of your own browsers are left out.`
            : ''}
        </p>
      </div>
    </div>
  );
}
