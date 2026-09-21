import type { FinanceLedgerDay } from '@/api/finance';
import { fmtMoneyPlain } from '../utils/format';

interface SavingsBannerProps {
  saved: number;
  hasBudget: boolean;
  isPartialMonth: boolean;
  dailyLedger: FinanceLedgerDay[];
}

export default function SavingsBanner({
  saved,
  hasBudget,
  isPartialMonth,
  dailyLedger,
}: SavingsBannerProps) {
  if (!hasBudget) return null;

  const inDebt = saved < 0;
  const trackedDays = dailyLedger.filter((d) => d.isTracked);
  const completedDays = trackedDays.filter((d) => !d.isToday);

  let message: string;
  if (completedDays.length === 0) {
    message = isPartialMonth
      ? 'Tracking starts today — your saved balance builds up one finished day at a time.'
      : 'First day of the month — check back tomorrow to see this move.';
  } else if (inDebt) {
    message = `You've spent ${fmtMoneyPlain(Math.abs(saved))} more than planned. Trim spending over the next few days to get back on track.`;
  } else if (saved === 0) {
    message =
      "Right on pace with your daily budget — spend less than today's share to build a cushion.";
  } else {
    message = `You're ${fmtMoneyPlain(saved)} ahead of your daily budget. That's real breathing room for later in the month.`;
  }

  return (
    <div className="rounded-[12px] border border-[var(--paper-line)] bg-[var(--paper-cream)] p-[22px] md:col-span-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-paper-mono mb-1 text-[0.78rem] font-bold uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
            {inDebt ? 'Overspending' : 'Saved this month'}
          </h3>
          <div
            className="font-paper-mono text-[2rem] font-semibold leading-none"
            style={{ color: inDebt ? '#8d3a33' : '#3f7d52' }}
          >
            {inDebt ? '−' : '+'}
            {fmtMoneyPlain(Math.abs(saved))}
          </div>
        </div>
        <p className="max-w-[420px] text-sm text-[var(--paper-muted)] md:text-right">{message}</p>
      </div>

      <div className="mt-5 flex gap-[3px] overflow-x-auto pb-1">
        {trackedDays.map((day) => {
          const over = day.budget > 0 && day.spent > day.budget;
          const tone = day.isToday
            ? 'bg-[var(--paper-accent-strong)]'
            : over
              ? 'bg-[#8d3a33]'
              : 'bg-[#3f7d52]';
          return (
            <span
              key={day.date}
              title={`Day ${day.day} — ${fmtMoneyPlain(day.spent)} of ${fmtMoneyPlain(day.budget)}`}
              className={`h-2.5 w-2.5 flex-shrink-0 rounded-[2px] ${tone}`}
              style={{ opacity: day.isToday ? 1 : over ? 0.55 : 0.85 }}
            />
          );
        })}
        {dailyLedger
          .filter((d) => d.isFuture)
          .map((day) => (
            <span
              key={day.date}
              title={`Day ${day.day} — upcoming`}
              className="h-2.5 w-2.5 flex-shrink-0 rounded-[2px] bg-[rgba(43,39,35,0.08)]"
            />
          ))}
      </div>
    </div>
  );
}
