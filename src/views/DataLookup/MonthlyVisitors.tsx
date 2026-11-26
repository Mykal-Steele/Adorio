'use client';

import { useEffect, useState } from 'react';
import { fetchMonthlyVisitors } from '../../api/analytics';
import { card, eyebrow, formatNumber } from './format';

interface MonthRow {
  month: string;
  visitors: number;
  engagedVisitors: number;
  pageViews: number;
  sessions: number;
}

const monthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

// Unique people per calendar month over the last year, the number to quote when
// someone asks how many people visit the site each month.
export default function MonthlyVisitors() {
  const [months, setMonths] = useState<MonthRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchMonthlyVisitors({ months: 12 })
      .then((data) => setMonths(data.months))
      .catch((err) => {
        if (!controller.signal.aborted) setError(err?.message || 'Could not load.');
      });
    return () => controller.abort();
  }, []);

  return (
    <section aria-label="Monthly visitors" className={`${card} p-4`}>
      <h2 className="text-sm font-bold">Visitors by month</h2>
      <p className="mb-3 text-xs text-[var(--paper-muted-2)]">
        Each person counts once per month. Engaged means they opened a second page or stayed 10
        seconds.
      </p>
      {error ? <p className="text-sm">{error}</p> : null}
      {months === null && !error ? (
        <div aria-hidden className="h-40 rounded-[2px] bg-[var(--paper-hero)]" />
      ) : null}
      {months ? (
        <table className="w-full border-collapse text-sm [font-variant-numeric:lining-nums_tabular-nums]">
          <thead className={`text-left ${eyebrow}`}>
            <tr>
              <th className="py-1.5 font-normal">Month</th>
              <th className="py-1.5 text-right font-normal">Visitors</th>
              <th className="py-1.5 text-right font-normal">Engaged</th>
              <th className="py-1.5 text-right font-normal">Visits</th>
              <th className="py-1.5 text-right font-normal">Page views</th>
            </tr>
          </thead>
          <tbody>
            {months.map((row) => (
              <tr key={row.month} className="border-t border-[var(--paper-line)]">
                <td className="py-1.5">{monthLabel(row.month)}</td>
                <td className="py-1.5 text-right font-bold">{formatNumber(row.visitors)}</td>
                <td className="py-1.5 text-right">{formatNumber(row.engagedVisitors)}</td>
                <td className="py-1.5 text-right">{formatNumber(row.sessions)}</td>
                <td className="py-1.5 text-right">{formatNumber(row.pageViews)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
