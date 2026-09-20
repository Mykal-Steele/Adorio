import type { FinanceOverview, FinanceTransaction } from '@/api/finance';
import Gauge from '../Gauge';
import Kbd from '../Kbd';
import { fmtMoney, fmtMoneyPlain, formatShortDate, statusColor } from '../../utils/format';

interface DashboardProps {
  overview: FinanceOverview;
  recentTransactions: FinanceTransaction[];
  onViewAll: () => void;
  onEditTransaction: (transaction: FinanceTransaction) => void;
}

export default function Dashboard({
  overview,
  recentTransactions,
  onViewAll,
  onEditTransaction,
}: DashboardProps) {
  const dateLine = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const monthPct =
    overview.monthlyBudget > 0 ? Math.min(overview.monthlySpend / overview.monthlyBudget, 1) : 0;
  const remaining = overview.monthlyBudget - overview.monthlySpend;
  const excludedAmount = overview.monthlySpendAll - overview.monthlySpend;
  const excludedNames = overview.categoryBreakdown
    .filter((entry) => entry.category.excludeFromBudget && entry.amount > 0)
    .map((entry) => entry.category.name);

  const recent = recentTransactions.slice(0, 6);
  const maxCategoryAmount = Math.max(0, ...overview.categoryBreakdown.map((e) => e.amount));
  const anyExcluded = overview.categoryBreakdown.some((e) => e.category.excludeFromBudget);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-paper-serif text-2xl font-bold md:text-[1.7rem]">Dashboard</h2>
          <div className="mt-1 text-sm text-[var(--paper-muted)]">{dateLine}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {/* Balance hero */}
        <Card className="flex flex-col justify-between md:col-span-2">
          <CardLabel>Balance</CardLabel>
          <div>
            <div className="font-paper-mono text-[2.3rem] font-semibold leading-none md:text-[2.5rem]">
              {fmtMoney(overview.balance)}
            </div>
            <div className="mt-2.5 flex gap-3.5 text-sm text-[var(--paper-muted)]">
              <span style={{ color: '#3f7d52' }}>
                +{fmtMoneyPlain(overview.monthlyIncome).replace('−', '')} in
              </span>
              <span style={{ color: '#8d3a33' }}>
                −{fmtMoneyPlain(overview.monthlySpendAll).replace('−', '')} out
              </span>
            </div>
          </div>
        </Card>

        {/* Daily gauge */}
        <Card className="flex flex-col items-center md:col-span-2">
          <CardLabel>Today&apos;s budget</CardLabel>
          <Gauge spent={overview.todaySpend} budget={overview.dailyBudget} />
        </Card>

        {/* Monthly progress */}
        <Card className="md:col-span-2">
          <CardLabel>This month</CardLabel>
          <div className="my-1.5 h-3 overflow-hidden rounded-full border border-[var(--paper-line)] bg-[rgba(43,39,35,0.06)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${monthPct * 100}%`, backgroundColor: statusColor(monthPct) }}
            />
          </div>
          <div className="font-paper-mono flex justify-between text-sm text-[var(--paper-muted)]">
            <span>
              <strong className="text-[var(--paper-ink)]">
                {fmtMoneyPlain(overview.monthlySpend)}
              </strong>{' '}
              spent
            </span>
            <span>
              <strong className="text-[var(--paper-ink)]">
                {overview.monthlyBudget > 0 ? fmtMoneyPlain(overview.monthlyBudget) : 'not set'}
              </strong>{' '}
              budget
            </span>
          </div>
          <div className="mt-3.5 flex justify-between text-xs text-[var(--paper-muted-2)]">
            <span>
              {overview.daysRemaining} day{overview.daysRemaining === 1 ? '' : 's'} left this month
            </span>
            <span>
              {overview.monthlyBudget > 0
                ? remaining >= 0
                  ? `${fmtMoneyPlain(remaining)} remaining`
                  : `${fmtMoneyPlain(Math.abs(remaining))} over budget`
                : '—'}
            </span>
          </div>
          {excludedNames.length > 0 && (
            <div className="mt-2.5 border-t border-dashed border-[var(--paper-line)] pt-2.5 text-xs leading-relaxed text-[var(--paper-muted-2)]">
              {fmtMoneyPlain(excludedAmount)} in {excludedNames.join(', ')} not counted toward this
              budget
            </div>
          )}
        </Card>

        {/* Category breakdown */}
        <Card className="md:col-span-3">
          <CardLabel>Spending by category</CardLabel>
          {overview.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-[var(--paper-muted-2)]">No spending yet this month.</p>
          ) : (
            <>
              {overview.categoryBreakdown.map((entry) => (
                <div key={entry.category.id} className="mb-3.5 flex items-center gap-3 last:mb-0">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={
                      entry.category.excludeFromBudget
                        ? { border: `1.5px dashed ${entry.category.color}` }
                        : { backgroundColor: entry.category.color }
                    }
                  />
                  <span className="w-[92px] flex-shrink-0 text-sm text-[var(--paper-muted)]">
                    {entry.category.name}
                  </span>
                  <span className="relative block h-2 flex-1 overflow-hidden rounded-full bg-[rgba(43,39,35,0.06)]">
                    <span
                      className="absolute inset-y-0 left-0 block h-full min-w-[3px] rounded-full"
                      style={{
                        width: `${maxCategoryAmount > 0 ? (entry.amount / maxCategoryAmount) * 100 : 0}%`,
                        backgroundColor: entry.category.color,
                      }}
                    />
                  </span>
                  <span className="font-paper-mono w-[76px] flex-shrink-0 text-right text-sm font-semibold">
                    {fmtMoneyPlain(entry.amount)}
                  </span>
                </div>
              ))}
              {anyExcluded && (
                <div className="mt-3 border-t border-dashed border-[var(--paper-line)] pt-3 text-xs text-[var(--paper-muted-2)]">
                  Categories marked with a hollow dot don&apos;t count toward your monthly budget.
                </div>
              )}
            </>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="md:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <CardLabel className="mb-0">Recent activity</CardLabel>
            <button
              type="button"
              onClick={onViewAll}
              className="flex items-center gap-1 rounded-[6px] px-1 py-0.5 text-sm font-semibold text-[var(--paper-accent-strong)] hover:underline"
            >
              View all →
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-[var(--paper-muted-2)]">
              No transactions yet — press <Kbd>N</Kbd> for an expense or <Kbd>I</Kbd> for income.
            </p>
          ) : (
            <div className="flex flex-col">
              {recent.map((txn) => (
                <button
                  key={txn._id}
                  type="button"
                  onClick={() => onEditTransaction(txn)}
                  className="-mx-1.5 flex items-center justify-between gap-2.5 rounded-[6px] border-b border-[var(--paper-line)] px-1.5 py-2.5 text-left last:border-b-0 hover:bg-[rgba(43,39,35,0.03)]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: txn.category.color }}
                    />
                    <span className="min-w-0">
                      <div className="truncate text-sm font-medium">{txn.title}</div>
                      <div className="mt-0.5 text-xs text-[var(--paper-muted-2)]">
                        {txn.category.name} · {formatShortDate(txn.date)}
                      </div>
                    </span>
                  </span>
                  <span
                    className="font-paper-mono flex-shrink-0 text-sm font-semibold"
                    style={{ color: txn.type === 'income' ? '#3f7d52' : 'var(--paper-ink)' }}
                  >
                    {txn.type === 'income' ? '+' : '−'}
                    {fmtMoneyPlain(Math.abs(txn.amount))}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-[12px] border border-[var(--paper-line)] bg-[var(--paper-cream)] p-[22px] ${className}`}
    >
      {children}
    </div>
  );
}

function CardLabel({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      className={`font-paper-mono mb-4 text-[0.78rem] font-bold uppercase tracking-[.08em] text-[var(--paper-muted-2)] ${className}`}
    >
      {children}
    </h3>
  );
}
