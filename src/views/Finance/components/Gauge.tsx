import { fmtMoneyPlain, statusColor, STATUS_COLORS } from '../utils/format';

interface GaugeProps {
  spent: number;
  budget: number;
  budgetIsSet?: boolean;
}

const RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Gauge({ spent, budget, budgetIsSet = budget > 0 }: GaugeProps) {
  const hasBudget = budgetIsSet && budget > 0;
  const pct = hasBudget ? Math.min(spent / budget, 1) : budgetIsSet ? 1 : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const color = budgetIsSet ? statusColor(pct) : 'var(--paper-muted-2)';
  const rawPct = hasBudget ? spent / budget : 0;

  let status: string;
  if (!budgetIsSet) {
    status = 'Set a monthly budget in Settings to auto-generate a daily allowance.';
  } else if (budget <= 0) {
    status = `Today's allowance is used up covering earlier overspending — ${fmtMoneyPlain(Math.abs(budget))} still owed.`;
  } else if (rawPct >= 1) {
    status = `Over today's allowance by ${fmtMoneyPlain(spent - budget)}.`;
  } else {
    status = `${fmtMoneyPlain(budget - spent)} left for today.`;
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative my-1.5 h-[150px] w-[150px]">
        <svg width="150" height="150" viewBox="0 0 150 150" className="block -rotate-90">
          <circle
            cx="75"
            cy="75"
            r={RADIUS}
            fill="none"
            stroke="rgba(43,39,35,0.1)"
            strokeWidth="12"
          />
          <circle
            cx="75"
            cy="75"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE.toFixed(1)}
            strokeDashoffset={offset.toFixed(1)}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-paper-mono text-[1.35rem] font-semibold">{fmtMoneyPlain(spent)}</div>
          <div className="font-paper-mono mt-0.5 text-[0.72rem] text-[var(--paper-muted-2)]">
            {!budgetIsSet
              ? 'no budget set'
              : hasBudget
                ? `of ${fmtMoneyPlain(budget)}`
                : `${fmtMoneyPlain(Math.abs(budget))} owed`}
          </div>
        </div>
      </div>
      <div
        className="mt-1 text-sm"
        style={{ color: hasBudget && rawPct >= 1 ? STATUS_COLORS.negative : 'var(--paper-muted)' }}
      >
        {status}
      </div>
    </div>
  );
}
