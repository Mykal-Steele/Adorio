'use client';
import { useEffect, useState } from 'react';
import type { FinanceCategory, FinanceTransaction, TransactionType } from '@/api/finance';
import { createFinanceTransaction, updateFinanceTransaction } from '@/api/finance';

interface TransactionFormProps {
  categories: FinanceCategory[];
  editingTransaction: FinanceTransaction | null;
  onDone: () => Promise<void>;
  onCancelEdit: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({
  categories,
  editingTransaction,
  onDone,
  onCancelEdit,
}: TransactionFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(today());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setType(editingTransaction.type);
      setCategoryId(editingTransaction.category._id);
      setDate(editingTransaction.date);
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setDate(today());
    }
  }, [editingTransaction]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories.find((c) => c.slug === 'other')?._id ?? categories[0]._id);
    }
  }, [categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !categoryId) return;
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        amount: Number(amount),
        type,
        category: categoryId,
        date,
      };
      if (editingTransaction) {
        await updateFinanceTransaction(editingTransaction._id, payload);
      } else {
        await createFinanceTransaction(payload);
      }
      setTitle('');
      setAmount('');
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 space-y-3"
    >
      <h2 className="text-sm font-medium text-gray-300">
        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="col-span-2 p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
        >
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : editingTransaction ? 'Save Changes' : 'Add Transaction'}
        </button>
        {editingTransaction && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
