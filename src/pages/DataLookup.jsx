import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchPageViewSummary, fetchRecentVisits } from '../api/analytics';

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString() : '—';

const formatDateTime = (value) => {
  if (!value) return '—';

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const SummaryCard = ({ label, value, hint }) => (
  <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900'>
    <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>
      {label}
    </div>
    <div className='mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100'>
      {formatNumber(value)}
    </div>
    {hint ? (
      <div className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
        {hint}
      </div>
    ) : null}
  </div>
);

const SummaryTable = ({ data }) => (
  <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900'>
    <div className='max-h-[28rem] overflow-auto'>
      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
        <thead className='bg-gray-50 dark:bg-gray-800'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Path
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Visits
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Unique Visitors
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Unique Users
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Avg. Duration
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              First Visit
            </th>
            <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Last Visit
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className='px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400'
              >
                No visits recorded yet.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.path}
                className='hover:bg-gray-50 dark:hover:bg-gray-800/80'
              >
                <td
                  className='max-w-xs truncate px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100'
                  title={row.path}
                >
                  {row.path}
                </td>
                <td className='px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300'>
                  {formatNumber(row.totalVisits)}
                </td>
                <td className='px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300'>
                  {formatNumber(row.uniqueVisitors)}
                </td>
                <td className='px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300'>
                  {formatNumber(row.uniqueUsers)}
                </td>
                <td className='px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300'>
                  {row.avgDuration ? `${Math.round(row.avgDuration)} ms` : '—'}
                </td>
                <td className='px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300'>
                  {formatDateTime(row.firstVisitAt)}
                </td>
                <td className='px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300'>
                  {formatDateTime(row.lastVisitAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const RecentVisitsTable = ({ data }) => (
  <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900'>
    <div className='max-h-[32rem] overflow-auto'>
      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
        <thead className='bg-gray-50 dark:bg-gray-800'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Visited At
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Path
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Visitor
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              User
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Referrer
            </th>
            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300'>
              Meta
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className='px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400'
              >
                No recent visits yet.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={`${row._id}-${row.createdAt}`}
                className='hover:bg-gray-50 dark:hover:bg-gray-800/80'
              >
                <td className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>
                  {formatDateTime(row.createdAt)}
                </td>
                <td
                  className='max-w-xs truncate px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100'
                  title={row.path}
                >
                  {row.path}
                </td>
                <td className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>
                  <span className='block truncate text-xs text-gray-500 dark:text-gray-400'>
                    {row.visitorId}
                  </span>
                  {row.ipAddress ? (
                    <span className='mt-1 block text-xs text-gray-400 dark:text-gray-500'>
                      IP: {row.ipAddress}
                    </span>
                  ) : null}
                </td>
                <td className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>
                  {row.userId || 'Guest'}
                </td>
                <td
                  className='max-w-xs truncate px-4 py-3 text-sm text-gray-700 dark:text-gray-300'
                  title={row.referrer}
                >
                  {row.referrer || '—'}
                </td>
                <td className='px-4 py-3 text-xs text-gray-500 dark:text-gray-400'>
                  <div>
                    UA: {row.userAgent ? row.userAgent.slice(0, 80) : '—'}
                  </div>
                  <div>
                    Locale: {row.locale || '—'} · TZ Offset:{' '}
                    {row.timezoneOffset ?? '—'}
                  </div>
                  {row.durationMs != null ? (
                    <div>Duration: {Math.round(row.durationMs)} ms</div>
                  ) : null}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const DataLookup = () => {
  const [summary, setSummary] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const totals = useMemo(() => {
    return summary.reduce(
      (acc, item) => {
        acc.totalVisits += item.totalVisits || 0;
        acc.uniqueVisitors += item.uniqueVisitors || 0;
        acc.uniqueUsers += item.uniqueUsers || 0;
        return acc;
      },
      { totalVisits: 0, uniqueVisitors: 0, uniqueUsers: 0 }
    );
  }, [summary]);

  const loadData = useCallback(
    async (recentLimit = limit) => {
      setLoading(true);
      setError(null);

      try {
        const [summaryResponse, recentResponse] = await Promise.all([
          fetchPageViewSummary(),
          fetchRecentVisits({ limit: recentLimit }),
        ]);

        setSummary(summaryResponse.results || []);
        setRecentVisits(recentResponse.results || []);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('failed to load analytics data', err);
        setError(err?.message || 'Unable to load analytics data right now.');
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    loadData(limit);
  }, [limit, loadData]);

  const handleRetry = () => loadData(limit);

  const increaseLimit = () => {
    setLimit((prev) => Math.min(prev + 100, 500));
  };

  return (
    <main className='min-h-screen bg-gray-100 px-4 py-10 dark:bg-gray-950 sm:px-8'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <header className='flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
              Analytics data lookup
            </h1>
            <p className='mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400'>
              View real-time page analytics, unique visitor counts, and the
              latest recorded visits across the site.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={handleRetry}
              className='inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500'
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh data'}
            </button>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              Last updated: {lastUpdated ? formatDateTime(lastUpdated) : '—'}
            </div>
          </div>
        </header>

        {error ? (
          <div className='rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'>
            <p className='font-medium'>We couldn't load the analytics data.</p>
            <p className='mt-2 text-xs'>{error}</p>
            <button
              type='button'
              onClick={handleRetry}
              className='mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500'
            >
              Try again
            </button>
          </div>
        ) : null}

        <section aria-labelledby='totals-heading' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2
              id='totals-heading'
              className='text-lg font-semibold text-gray-900 dark:text-gray-100'
            >
              Totals at a glance
            </h2>
            {loading ? (
              <span className='text-xs text-gray-400 dark:text-gray-500'>
                Updating…
              </span>
            ) : null}
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <SummaryCard
              label='Total Visits'
              value={totals.totalVisits}
              hint='Sum across every tracked page.'
            />
            <SummaryCard
              label='Unique Visitors'
              value={totals.uniqueVisitors}
              hint='Distinct visitor IDs observed.'
            />
            <SummaryCard
              label='Unique Users'
              value={totals.uniqueUsers}
              hint='Logged-in user accounts recorded.'
            />
          </div>
        </section>

        <section aria-labelledby='paths-heading' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2
                id='paths-heading'
                className='text-lg font-semibold text-gray-900 dark:text-gray-100'
              >
                Performance by path
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Sorted by total visits so you can spot your busiest routes
                instantly.
              </p>
            </div>
          </div>
          <SummaryTable data={summary} />
        </section>

        <section aria-labelledby='recent-heading' className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2
                id='recent-heading'
                className='text-lg font-semibold text-gray-900 dark:text-gray-100'
              >
                Recent visit stream
              </h2>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Latest tracked visits with metadata. Older entries roll off as
                you load more.
              </p>
            </div>
            <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
              <span>
                Showing {recentVisits.length} of up to {limit} entries.
              </span>
              {limit < 500 ? (
                <button
                  type='button'
                  onClick={increaseLimit}
                  className='rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-500'
                  disabled={loading}
                >
                  Load {Math.min(100, 500 - limit)} more
                </button>
              ) : null}
            </div>
          </div>
          <RecentVisitsTable data={recentVisits} />
        </section>
      </div>
    </main>
  );
};

export default DataLookup;
