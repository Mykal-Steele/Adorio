'use client';
import { useEffect, useState } from 'react';
import type { FinanceOverview, FinanceLedgerDay, FinanceTransaction } from '@/api/finance';
import { getFinanceTransactions } from '@/api/finance';
import { fmtMoneyPlain, formatDayLabel } from '../../utils/format';

interface CalendarProps {
  overview: FinanceOverview;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function cellTone(day: FinanceLedgerDay, hasBudget: boolean) {
  if (day.isFuture) return 'future';
  if (!day.isTracked) return 'untracked';
  if (!hasBudget) return 'neutral';
  return day.spent > day.budget ? 'over' : 'under';
}

export default function Calendar({ overview }: CalendarProps) {
  const { dailyLedger, monthlyBudget } = overview;
  const hasBudget = monthlyBudget > 0;
  const monthStr = dailyLedger[0]?.date.slice(0, 7) ?? '';
  const firstWeekday = dailyLedger[0]
    ? new Date(`${dailyLedger[0].date}T00:00:00Z`).getUTCDay()
    : 0;

  const [selectedDate, setSelectedDate] = useState<string | null>(
    dailyLedger.find((d) => d.isToday)?.date ?? null,
  );
  const [monthTransactions, setMonthTransactions] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!monthStr) return;
    setIsLoading(true);
    setLoadError(false);
    (async () => {
      const all: FinanceTransaction[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore && !cancelled) {
        const result = await getFinanceTransactions({ month: monthStr, limit: 100, page });
        all.push(...result.transactions);
        hasMore = result.hasMore;
        page += 1;
      }
      if (!cancelled) setMonthTransactions(all);
    })()
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [monthStr]);

  const selectedDay = dailyLedger.find((d) => d.date === selectedDate) ?? null;
  const selectedTransactions = selectedDate
    ? monthTransactions.filter((t) => t.date === selectedDate)
    : [];

  const monthLabel = dailyLedger[0]
    ? new Date(`${dailyLedger[0].date}T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '';

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-paper-serif text-2xl font-bold md:text-[1.7rem]">Calendar</h2>
        <div className="mt-1 text-sm text-[var(--paper-muted)]">
          {monthLabel} — a green day spent less than its share of the budget, a red day spent more.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[12px] border border-[var(--paper-line)] bg-[var(--paper-cream)] p-[18px]">
          <div className="font-paper-mono grid grid-cols-7 gap-1.5 text-center text-[0.7rem] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
            {WEEKDAYS.map((w) => (
              <div key={w} className="pb-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {dailyLedger.map((day) => {
              const tone = cellTone(day, hasBudget);
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  title={
                    day.isTracked
                      ? `${fmtMoneyPlain(day.spent)} of ${fmtMoneyPlain(day.budget)}`
                      : day.isFuture
                        ? 'Upcoming'
                        : 'Before you started tracking'
                  }
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[7px] border-[1.5px] text-[0.8rem] transition-transform hover:-translate-y-px ${
                    day.isToday
                      ? 'border-[var(--paper-ink)]'
                      : isSelected
                        ? 'border-[var(--paper-accent-strong)]'
                        : 'border-transparent'
                  } ${
                    tone === 'over'
                      ? 'bg-[#8d3a33]/15 text-[#8d3a33]'
                      : tone === 'under'
                        ? 'bg-[#3f7d52]/12 text-[#3f7d52]'
                        : tone === 'future'
                          ? 'bg-[rgba(43,39,35,0.02)] text-[var(--paper-muted-2)]'
                          : 'bg-[repeating-linear-gradient(135deg,rgba(43,39,35,0.04)_0px,rgba(43,39,35,0.04)_3px,transparent_3px,transparent_7px)] text-[var(--paper-muted-2)]'
                  }`}
                >
                  <span className="font-paper-mono font-semibold">{day.day}</span>
                  {day.isTracked && hasBudget && day.spent > 0 && (
                    <span className="font-paper-mono text-[0.62rem]">
                      {fmtMoneyPlain(day.spent)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[12px] border border-[var(--paper-line)] bg-[var(--paper-cream)] p-[22px]">
          <h3 className="font-paper-mono mb-4 text-[0.78rem] font-bold uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
            {selectedDate ? formatDayLabel(selectedDate) : 'Pick a day'}
          </h3>

          {selectedDay?.isTracked && hasBudget && (
            <div className="font-paper-mono mb-4 flex justify-between border-b border-dashed border-[var(--paper-line)] pb-3 text-sm">
              <span>
                <strong>{fmtMoneyPlain(selectedDay.spent)}</strong> spent
              </span>
              <span className="text-[var(--paper-muted)]">
                {fmtMoneyPlain(selectedDay.budget)} budgeted
              </span>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-[var(--paper-muted-2)]">Loading…</p>
          ) : loadError ? (
            <p className="text-sm text-[#8d3a33]">
              Couldn&apos;t load this month&apos;s transactions.
            </p>
          ) : selectedTransactions.length === 0 ? (
            <p className="text-sm text-[var(--paper-muted-2)]">Nothing logged this day.</p>
          ) : (
            <div className="flex flex-col">
              {selectedTransactions.map((txn) => (
                <div
                  key={txn._id}
                  className="flex items-center justify-between gap-2.5 border-b border-[var(--paper-line)] py-2.5 text-sm last:border-b-0"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: txn.category.color }}
                    />
                    <span className="truncate">{txn.title}</span>
                  </span>
                  <span
                    className="font-paper-mono flex-shrink-0 font-semibold"
                    style={{ color: txn.type === 'income' ? '#3f7d52' : 'var(--paper-ink)' }}
                  >
                    {txn.type === 'income' ? '+' : '−'}
                    {fmtMoneyPlain(Math.abs(txn.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
