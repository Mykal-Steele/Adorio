'use client';
import { useState } from 'react';
import type { FinanceCategory, FinanceOverview } from '@/api/finance';
import {
  updateFinanceSettings,
  createFinanceCategory,
  updateFinanceCategory,
  deleteFinanceCategory,
} from '@/api/finance';
import { fmtMoney } from '../../utils/format';

interface SettingsProps {
  overview: FinanceOverview;
  categories: FinanceCategory[];
  onSettingsSaved: (message: string) => Promise<void> | void;
  onCategoriesChanged: (message: string) => Promise<void> | void;
  openConfirm: (title: string, message: string, okLabel: string, onConfirm: () => void) => void;
  showToast: (message: string) => void;
}

export default function Settings({
  overview,
  categories,
  onSettingsSaved,
  onCategoriesChanged,
  openConfirm,
  showToast,
}: SettingsProps) {
  const [balanceInput, setBalanceInput] = useState(String(overview.balance));
  const [budgetInput, setBudgetInput] = useState(
    overview.monthlyBudget ? String(overview.monthlyBudget) : '',
  );
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#7FB3D5');
  const [newCatExclude, setNewCatExclude] = useState(false);

  const daily = overview.monthlyBudget > 0 ? overview.monthlyBudget / overview.daysInMonth : 0;

  const saveBalance = async () => {
    const v = Number(balanceInput);
    if (balanceInput.trim() === '' || !Number.isFinite(v))
      return showToast('Enter a valid amount.');
    await updateFinanceSettings({ balance: v });
    await onSettingsSaved('Balance updated.');
  };

  const saveBudget = async () => {
    const v = Number(budgetInput);
    if (budgetInput.trim() === '' || !Number.isFinite(v) || v < 0)
      return showToast('Enter a valid budget.');
    await updateFinanceSettings({ monthlyBudget: v });
    await onSettingsSaved('Monthly budget updated — daily allowance recalculated.');
  };

  const toggleCounts = async (category: FinanceCategory, counts: boolean) => {
    await updateFinanceCategory(category._id, { excludeFromBudget: !counts });
    await onCategoriesChanged(
      counts
        ? `${category.name} now counts toward your budget.`
        : `${category.name} no longer counts toward your budget.`,
    );
  };

  const deleteCategory = (category: FinanceCategory) => {
    openConfirm(
      `Delete "${category.name}"?`,
      "This can't be undone.",
      'Delete category',
      async () => {
        await deleteFinanceCategory(category._id);
        await onCategoriesChanged('Category deleted.');
      },
    );
  };

  const addCategory = async () => {
    const name = newCatName.trim();
    if (!name) return showToast('Give the category a name.');
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return showToast(`You already have a category called "${name}".`);
    }
    await createFinanceCategory({ name, color: newCatColor, excludeFromBudget: newCatExclude });
    setNewCatName('');
    setNewCatExclude(false);
    setNewCatColor('#7FB3D5');
    await onCategoriesChanged(`"${name}" added.`);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-paper-serif text-2xl font-bold md:text-[1.7rem]">Settings</h2>
        <div className="mt-1 text-sm text-[var(--paper-muted)]">
          Balance, budget and categories.
        </div>
      </div>

      <div className="grid max-w-[780px] grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Total balance">
          <div className="flex gap-2.5">
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="flex-1 rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
            />
            <SaveButton onClick={saveBalance} />
          </div>
          <Hint>
            Set this to whatever&apos;s actually in your accounts. Every transaction adjusts it from
            here.
          </Hint>
        </Field>

        <Field label="Monthly budget">
          <div className="flex gap-2.5">
            <input
              type="number"
              step="1"
              inputMode="decimal"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="flex-1 rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
            />
            <SaveButton onClick={saveBudget} />
          </div>
          <Hint>
            {overview.monthlyBudget > 0
              ? `That's ${fmtMoney(daily)} per day across ${overview.daysInMonth} days this month.`
              : 'Your daily budget is calculated automatically once you set a monthly budget.'}
          </Hint>
        </Field>
      </div>

      <div className="mt-7 max-w-[780px] border-t border-[var(--paper-line)] pt-6">
        <label className="mb-1 block text-sm font-semibold text-[var(--paper-muted)]">
          Categories
        </label>
        <p className="mb-3.5 text-[0.78rem] text-[var(--paper-muted-2)]">
          Turn off &quot;counts toward budget&quot; for costs like rent that you don&apos;t want
          inflating your daily allowance — the amount still comes out of your balance, it&apos;s
          just left out of the budget math.
        </p>

        <div className="mb-4 flex flex-col">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex flex-wrap items-center gap-3 border-b border-[var(--paper-line)] py-2.5 last:border-b-0"
            >
              <span
                className="h-[11px] w-[11px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span>
              <label className="flex cursor-pointer select-none items-center gap-1.5 whitespace-nowrap text-sm text-[var(--paper-muted)]">
                <input
                  type="checkbox"
                  checked={!category.excludeFromBudget}
                  onChange={(e) => toggleCounts(category, e.target.checked)}
                  className="h-[15px] w-[15px] accent-[var(--paper-accent-strong)]"
                />
                Counts toward budget
              </label>
              <button
                type="button"
                onClick={() => deleteCategory(category)}
                disabled={category.slug === 'other'}
                title="Delete category"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] border border-[var(--paper-line)] text-[var(--paper-muted-2)] hover:border-[#8d3a33] hover:text-[#8d3a33] disabled:cursor-not-allowed disabled:opacity-35"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-dashed border-[var(--paper-line)] pt-3.5">
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            aria-label="New category color"
            title="Color"
            className="h-[38px] w-[38px] flex-shrink-0 cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCategory();
              }
            }}
            placeholder="New category name"
            maxLength={24}
            aria-label="New category name"
            className="min-w-[160px] flex-1 rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
          />
          <label className="flex cursor-pointer select-none items-center gap-1.5 whitespace-nowrap text-sm text-[var(--paper-muted)]">
            <input
              type="checkbox"
              checked={newCatExclude}
              onChange={(e) => setNewCatExclude(e.target.checked)}
              className="h-[15px] w-[15px] accent-[var(--paper-accent-strong)]"
            />
            Exclude from budget
          </label>
          <SaveButton onClick={addCategory} label="Add category" />
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--paper-muted)]">{label}</label>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <div className="mt-1.5 text-[0.78rem] text-[var(--paper-muted-2)]">{children}</div>;
}

function SaveButton({ onClick, label = 'Save' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-4 py-2 text-sm font-bold shadow-[2px_3px_0_var(--paper-ink)] hover:-translate-y-px"
    >
      {label}
    </button>
  );
}
