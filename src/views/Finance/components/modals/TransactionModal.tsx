'use client';
import { useEffect, useRef, useState } from 'react';
import type { FinanceCategory, FinanceTransaction, TransactionType } from '@/api/finance';
import { createFinanceTransaction, updateFinanceTransaction } from '@/api/finance';
import { toISODate } from '../../utils/format';
import Overlay from './Overlay';

interface TransactionModalProps {
  categories: FinanceCategory[];
  initialType: TransactionType;
  editingTransaction: FinanceTransaction | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void> | void;
  onDeleteRequested: (transaction: FinanceTransaction) => void;
}

export default function TransactionModal({
  categories,
  initialType,
  editingTransaction,
  onClose,
  onSaved,
  onDeleteRequested,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(editingTransaction?.type ?? initialType);
  const [title, setTitle] = useState(editingTransaction?.title ?? '');
  const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : '');
  const [categoryId, setCategoryId] = useState(
    editingTransaction?.category._id ?? categories.find((c) => c.slug === 'other')?._id ?? '',
  );
  const [date, setDate] = useState(editingTransaction?.date ?? toISODate(new Date()));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories.find((c) => c.slug === 'other')?._id ?? categories[0]._id);
    }
  }, [categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (
      !title.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !date ||
      !categoryId
    ) {
      setError('Fill in all fields with a valid amount.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        amount: parsedAmount,
        type,
        category: categoryId,
        date,
      };
      if (editingTransaction) {
        await updateFinanceTransaction(editingTransaction._id, payload);
        await onSaved('Transaction updated.');
      } else {
        await createFinanceTransaction(payload);
        await onSaved(`${type === 'income' ? 'Income' : 'Expense'} added — balance updated.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
      setIsSaving(false);
    }
  };

  return (
    <Overlay>
      <form onSubmit={handleSubmit}>
        <h3 className="font-paper-serif text-xl font-bold">
          {editingTransaction ? 'Edit' : 'Add'} {type === 'expense' ? 'expense' : 'income'}
        </h3>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 rounded-[6px] border-[1.5px] px-3 py-2 text-sm font-semibold ${
              type === 'expense'
                ? 'border-[#8d3a33] bg-[#8d3a33]/10 text-[#8d3a33]'
                : 'border-[var(--paper-line)] text-[var(--paper-muted)]'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 rounded-[6px] border-[1.5px] px-3 py-2 text-sm font-semibold ${
              type === 'income'
                ? 'border-[#3f7d52] bg-[#3f7d52]/10 text-[#3f7d52]'
                : 'border-[var(--paper-line)] text-[var(--paper-muted)]'
            }`}
          >
            Income
          </button>
        </div>

        <label className="mt-4 block">
          <span className="font-paper-mono mb-1.5 block text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            Title
          </span>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Groceries"
            autoComplete="off"
            className="w-full rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-paper-mono mb-1.5 block text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            Amount
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-paper-mono mb-1.5 block text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            Category
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="font-paper-mono mb-1.5 block text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 outline-none focus:border-[var(--paper-accent-strong)]"
          />
        </label>

        {error && <p className="mt-3 text-sm font-bold text-[#8d3a33]">{error}</p>}

        <div className="mt-5 flex items-center justify-between">
          {editingTransaction ? (
            <button
              type="button"
              onClick={() => onDeleteRequested(editingTransaction)}
              className="rounded-[4px] border border-[#8d3a33] px-4 py-2 text-sm text-[#8d3a33] hover:bg-[#8d3a33]/10"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[4px] border border-[var(--paper-muted-2)] px-4 py-2 text-sm text-[var(--paper-muted)] hover:text-[var(--paper-ink)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 text-sm font-bold shadow-[2px_3px_0_var(--paper-ink)] hover:-translate-y-px disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : editingTransaction ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </div>
      </form>
    </Overlay>
  );
}
