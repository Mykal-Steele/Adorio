'use client';

import type { RecentVisit } from '../../api/types/analytics';
import { card, countryName, eyebrow, timeAgo } from './format';

function Source({ name }: { name: string }) {
  if (name === 'Direct') return <span className="text-[var(--paper-muted-2)]">Direct</span>;
  return (
    <span className="inline-block rounded-[2px] bg-[var(--paper-yellow-soft)] px-1.5 py-0.5 font-semibold text-[var(--paper-accent-deep)]">
      {name}
    </span>
  );
}

export function RecentVisits({ rows }: { rows: RecentVisit[] | undefined }) {
  return (
    <section aria-label="Recent page views" className={`${card} p-4`}>
      <h2 className="mb-3 text-sm font-bold">Recent page views</h2>
      {rows === undefined ? (
        <div aria-hidden className="h-40 rounded-[2px] bg-[var(--paper-hero)]" />
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--paper-muted-2)]">
          Nothing in this period.
        </p>
      ) : (
        <div className="max-h-[26rem] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className={`sticky top-0 z-10 bg-[var(--paper-cream)] text-left ${eyebrow}`}>
              <tr>
                <th className="py-2 pr-4 font-semibold">Page</th>
                <th className="py-2 pr-4 font-semibold">Source</th>
                <th className="py-2 pr-4 font-semibold">Visitor</th>
                <th className="py-2 text-right font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr
                  key={`${v.at}-${v.page}`}
                  className="border-t border-[var(--paper-line)] transition-colors hover:bg-[var(--paper-hero)]"
                >
                  <td
                    className="max-w-[18rem] truncate py-2 pr-4 font-semibold text-[var(--paper-ink)]"
                    title={v.page}
                  >
                    {v.page}
                  </td>
                  <td className="py-2 pr-4">
                    <Source name={v.source} />
                  </td>
                  <td className="py-2 pr-4 text-[var(--paper-muted-2)]">
                    {v.country ? countryName(v.country) : 'Unknown country'} · {v.device},{' '}
                    {v.browser} on {v.os}
                  </td>
                  <td
                    className="whitespace-nowrap py-2 text-right text-xs text-[var(--paper-muted-2)] [font-variant-numeric:lining-nums_tabular-nums]"
                    title={new Date(v.at).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })}
                  >
                    {timeAgo(v.at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
