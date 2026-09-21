import type { FinanceOverview } from '@/api/finance';
import { fmtMoney, fmtMoneyPlain } from '../utils/format';
import Kbd from './Kbd';
import type { Tab } from '../types';

const TABS: { id: Tab; label: string; key: string }[] = [
  { id: 'dashboard', label: 'Dashboard', key: '1' },
  { id: 'calendar', label: 'Calendar', key: '2' },
  { id: 'history', label: 'History', key: '3' },
  { id: 'settings', label: 'Settings', key: '4' },
];

interface SidebarProps {
  balance: number;
  overview: FinanceOverview;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onEditBalance: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onOpenShortcuts: () => void;
  onOpenCalculator: () => void;
}

export default function Sidebar({
  balance,
  overview,
  activeTab,
  onTabChange,
  onEditBalance,
  onAddExpense,
  onAddIncome,
  onOpenShortcuts,
  onOpenCalculator,
}: SidebarProps) {
  const hasBudget = overview.monthlyBudget > 0;
  const inDebt = overview.saved < 0;
  return (
    <aside className="flex h-auto flex-row flex-wrap items-center gap-3.5 border-b border-[var(--paper-line)] bg-[var(--paper-cream)] p-3.5 md:sticky md:top-0 md:max-h-screen md:w-[260px] md:flex-shrink-0 md:flex-col md:items-stretch md:gap-6 md:overflow-y-auto md:border-b-0 md:border-r md:p-6">
      <div className="flex items-baseline gap-2">
        <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[3px] bg-gradient-to-br from-[var(--paper-accent-strong)] to-[var(--paper-accent-deep)]" />
        <h1 className="font-paper-serif text-xl font-bold italic">Runway</h1>
      </div>

      <div className="flex items-center gap-3 rounded-[6px] border border-[var(--paper-line)] bg-[rgba(43,39,35,0.03)] px-3.5 py-2.5 md:block md:px-4 md:py-4">
        <div className="flex-1">
          <div className="font-paper-mono mb-0 text-[0.72rem] uppercase tracking-[.08em] text-[var(--paper-muted-2)] md:mb-1.5">
            Total balance
          </div>
          <div className="font-paper-mono text-[1.1rem] font-semibold md:text-[1.6rem]">
            {fmtMoney(balance)}
          </div>
        </div>
        <button
          type="button"
          onClick={onEditBalance}
          className="ml-auto flex items-center gap-1.5 rounded-[6px] border border-[var(--paper-muted-2)] px-2.5 py-1.5 text-[0.78rem] text-[var(--paper-muted)] hover:border-[var(--paper-accent-strong)] hover:text-[var(--paper-accent-strong)] md:ml-0 md:mt-2.5"
        >
          Edit balance <Kbd>B</Kbd>
        </button>
      </div>

      {hasBudget ? (
        <div className="hidden rounded-[6px] border border-[var(--paper-line)] bg-[rgba(43,39,35,0.03)] px-4 py-4 md:block">
          <div className="font-paper-mono mb-1.5 text-[0.72rem] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
            Today&apos;s budget
          </div>
          <div className="font-paper-mono text-[1.15rem] font-semibold">
            {overview.todayRemaining >= 0
              ? `${fmtMoneyPlain(overview.todayRemaining)} left`
              : `${fmtMoneyPlain(Math.abs(overview.todayRemaining))} over`}
          </div>
          <div className="mt-1 text-[0.78rem]" style={{ color: inDebt ? '#8d3a33' : '#3f7d52' }}>
            {inDebt
              ? `${fmtMoneyPlain(Math.abs(overview.saved))} behind pace`
              : `${fmtMoneyPlain(overview.saved)} saved this month`}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className="hidden rounded-[6px] border border-dashed border-[var(--paper-line)] px-4 py-4 text-left text-[0.85rem] text-[var(--paper-muted)] hover:border-[var(--paper-accent-strong)] hover:text-[var(--paper-accent-strong)] md:block"
        >
          Set a monthly budget to see your daily allowance here →
        </button>
      )}

      <nav
        aria-label="Sections"
        className="flex flex-row gap-1.5 overflow-x-auto md:flex-col md:overflow-visible"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-between gap-2.5 whitespace-nowrap rounded-[6px] px-3 py-2.5 text-left text-[0.92rem] font-medium ${
              activeTab === tab.id
                ? 'bg-[var(--paper-yellow-soft)] text-[var(--paper-ink)]'
                : 'text-[var(--paper-muted)] hover:bg-[rgba(43,39,35,0.05)] hover:text-[var(--paper-ink)]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="hidden md:inline">
              <Kbd>{tab.key}</Kbd>
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-row gap-2.5 md:mt-2 md:flex-none md:flex-col">
        <button
          type="button"
          onClick={onAddExpense}
          className="flex flex-1 items-center justify-center gap-2 rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-[rgba(43,39,35,0.03)] px-3.5 py-2.5 text-[0.88rem] font-semibold hover:border-[#8d3a33] hover:text-[#8d3a33]"
        >
          + Expense <Kbd>N</Kbd>
        </button>
        <button
          type="button"
          onClick={onAddIncome}
          className="flex flex-1 items-center justify-center gap-2 rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-[rgba(43,39,35,0.03)] px-3.5 py-2.5 text-[0.88rem] font-semibold hover:border-[#3f7d52] hover:text-[#3f7d52]"
        >
          + Income <Kbd>I</Kbd>
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenCalculator}
        className="flex items-center justify-center gap-2 rounded-[6px] border-[1.5px] border-dashed border-[var(--paper-line)] px-3.5 py-2.5 text-[0.88rem] font-medium text-[var(--paper-muted)] hover:border-[var(--paper-accent-strong)] hover:text-[var(--paper-accent-strong)]"
      >
        Calculator <Kbd>C</Kbd>
      </button>

      <div className="hidden items-center gap-1.5 text-[0.78rem] text-[var(--paper-muted-2)] md:flex">
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="underline underline-offset-2 hover:text-[var(--paper-accent-strong)]"
        >
          Keyboard shortcuts
        </button>
        <Kbd>?</Kbd>
      </div>
    </aside>
  );
}
