import type { RefObject } from 'react';
import type {
  FinanceCategory,
  FinanceTransaction,
  FinanceTransactionsQuery,
  TransactionType,
} from '@/api/finance';
import Kbd from '../Kbd';
import { fmtMoney, fmtMoneyPlain, formatDayLabel, formatShortDate } from '../../utils/format';

interface HistoryProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  filters: Omit<FinanceTransactionsQuery, 'page'>;
  summary: { totalIncome: number; totalExpense: number };
  hasAnyTransactions: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onFilterChange: (next: Omit<FinanceTransactionsQuery, 'page'>) => void;
  onLoadMore: () => void;
  onEditTransaction: (transaction: FinanceTransaction) => void;
}

export default function History({
  transactions,
  categories,
  filters,
  summary,
  hasAnyTransactions,
  hasMore,
  isLoadingMore,
  searchInputRef,
  onFilterChange,
  onLoadMore,
  onEditTransaction,
}: HistoryProps) {
  const net = summary.totalIncome - summary.totalExpense;

  const groups = transactions.reduce<Record<string, FinanceTransaction[]>>((acc, txn) => {
    (acc[txn.date] ??= []).push(txn);
    return acc;
  }, {});
  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-paper-serif text-2xl font-bold md:text-[1.7rem]">History</h2>
        <div className="mt-1 text-sm text-[var(--paper-muted)]">
          Every transaction, grouped by day.
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Stat label="Total income" value={fmtMoney(summary.totalIncome)} color="#3f7d52" />
        <Stat label="Total spent" value={fmtMoney(summary.totalExpense)} color="#8d3a33" />
        <Stat
          label="Net"
          value={`${net >= 0 ? '' : '−'}${fmtMoney(Math.abs(net)).replace('−', '')}`}
          color={net >= 0 ? undefined : '#8d3a33'}
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search by title…"
            value={filters.search ?? ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value || undefined })}
            className="w-full rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 pr-9 outline-none focus:border-[var(--paper-accent-strong)]"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Kbd>/</Kbd>
          </span>
        </div>
        <select
          value={filters.category ?? 'all'}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              category: e.target.value === 'all' ? undefined : e.target.value,
            })
          }
          className="rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={filters.type ?? 'all'}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              type: e.target.value === 'all' ? undefined : (e.target.value as TransactionType),
            })
          }
          className="rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
        >
          <option value="all">All types</option>
          <option value="income">Income only</option>
          <option value="expense">Expenses only</option>
        </select>
      </div>

      {dates.length === 0 ? (
        <p className="py-1.5 text-sm text-[var(--paper-muted-2)]">
          {hasAnyTransactions
            ? 'No transactions match your filters.'
            : 'No transactions yet — press N for an expense or I for income.'}
        </p>
      ) : (
        dates.map((date) => {
          const items = groups[date];
          const dayTotal = items.reduce(
            (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
            0,
          );
          return (
            <div key={date} className="mb-6">
              <div className="mb-2.5 flex items-baseline justify-between border-b border-[var(--paper-line)] pb-2">
                <span className="text-[0.95rem] font-semibold">{formatDayLabel(date)}</span>
                <span className="font-paper-mono text-sm text-[var(--paper-muted)]">
                  Net{' '}
                  <strong className="text-[var(--paper-ink)]">
                    {dayTotal >= 0 ? '+' : '−'}
                    {fmtMoneyPlain(Math.abs(dayTotal))}
                  </strong>
                </span>
              </div>
              {items.map((txn) => (
                <button
                  key={txn._id}
                  type="button"
                  onClick={() => onEditTransaction(txn)}
                  className="-mx-2 grid w-[calc(100%+16px)] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-[6px] px-2 py-2.5 text-left sm:grid-cols-[1fr_auto_auto_auto] hover:bg-[rgba(43,39,35,0.03)]"
                >
                  <span className="truncate text-[0.92rem] font-medium">{txn.title}</span>
                  <span className="font-paper-mono order-3 justify-self-start rounded-full border border-[var(--paper-line)] px-2.5 py-0.5 text-[0.72rem] text-[var(--paper-muted)] sm:order-none">
                    {txn.category.name}
                  </span>
                  <span className="font-paper-mono order-4 text-xs text-[var(--paper-muted-2)] sm:order-none">
                    {formatShortDate(date)}
                  </span>
                  <span
                    className="font-paper-mono order-2 text-right text-[0.92rem] font-semibold sm:order-none"
                    style={{ color: txn.type === 'income' ? '#3f7d52' : 'var(--paper-ink)' }}
                  >
                    {txn.type === 'income' ? '+' : '−'}
                    {fmtMoneyPlain(Math.abs(txn.amount))}
                  </span>
                </button>
              ))}
            </div>
          );
        })
      )}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="mt-2 w-full rounded-[6px] border border-[var(--paper-muted-2)] py-2.5 text-sm text-[var(--paper-muted)] hover:text-[var(--paper-ink)] disabled:opacity-50"
        >
          {isLoadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-[10px] border border-[var(--paper-line)] bg-[var(--paper-cream)] px-[18px] py-4">
      <div className="font-paper-mono mb-1.5 text-[0.74rem] uppercase tracking-[.07em] text-[var(--paper-muted-2)]">
        {label}
      </div>
      <div className="font-paper-mono text-[1.35rem] font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
