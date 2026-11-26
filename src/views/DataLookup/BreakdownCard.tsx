'use client';

import { useState } from 'react';
import { card, eyebrow, formatNumber } from './format';

type Row = { name: string; visitors?: number; pageViews?: number; count?: number };

type Tab = {
  id: string;
  label: string;
  // heading of the name column
  column: string;
  rows: Row[] | undefined;
  // heading of the count column, Visitors unless the rows count something else
  countLabel?: string;
};

const countOf = (row: Row) => row.count ?? row.visitors ?? 0;

// A ranked list with a faint bar behind each name, like most analytics tools. The number
// is always printed, so the bar never carries the value alone.
export function BreakdownCard({ tabs, note }: { tabs: Tab[]; note?: string }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  const rows = tab.rows;
  const max = Math.max(1, ...(rows ?? []).map(countOf));
  const showViews = rows?.some((r) => r.pageViews !== undefined);

  return (
    <section aria-label={tab.label} className={`${card} flex flex-col p-4`}>
      <div role="tablist" className="mb-3 flex gap-4 border-b border-[var(--paper-line)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab.id}
            disabled={tabs.length === 1}
            onClick={() => setActive(t.id)}
            className={`-mb-px border-b-2 pb-2 text-sm font-bold transition-colors ${
              t.id === tab.id
                ? 'border-[var(--paper-ink)] text-[var(--paper-ink)]'
                : 'border-transparent text-[var(--paper-muted-2)] hover:text-[var(--paper-ink)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`flex justify-between pb-1.5 ${eyebrow}`}>
        <span>{tab.column}</span>
        <span className="flex gap-4">
          {showViews ? <span className="w-14 text-right">Views</span> : null}
          <span className="w-14 text-right">{tab.countLabel ?? 'Visitors'}</span>
        </span>
      </div>

      {rows === undefined ? (
        <ul aria-hidden className="space-y-1">
          {[70, 52, 38, 24, 14].map((w) => (
            <li
              key={w}
              className="h-7 rounded-[4px] bg-[var(--paper-hero)]"
              style={{ width: `${w}%` }}
            />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--paper-muted-2)]">
          No data for this period.
        </p>
      ) : (
        <ol className="space-y-1">
          {rows.map((row) => (
            <li key={row.name} className="flex items-center gap-4 text-sm">
              <span className="relative min-w-0 flex-1">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-[4px] bg-[rgba(168,128,26,0.16)]"
                  style={{ width: `${(countOf(row) / max) * 100}%` }}
                />
                <span className="relative block truncate px-2 py-1" title={row.name}>
                  {row.name}
                </span>
              </span>
              {showViews ? (
                <span className="w-14 text-right text-[var(--paper-muted-2)] [font-variant-numeric:lining-nums_tabular-nums]">
                  {formatNumber(row.pageViews ?? 0)}
                </span>
              ) : null}
              <span className="w-14 text-right font-semibold [font-variant-numeric:lining-nums_tabular-nums]">
                {formatNumber(countOf(row))}
              </span>
            </li>
          ))}
        </ol>
      )}

      {note ? <p className="mt-auto pt-3 text-xs text-[var(--paper-muted-2)]">{note}</p> : null}
    </section>
  );
}
