'use client';
import { useState } from 'react';
import type { FinanceOverview } from '@/api/finance';
import { updateFinanceSettings } from '@/api/finance';

interface BalanceCardProps {
  overview: FinanceOverview;
  onUpdated: () => Promise<void>;
}

export default function BalanceCard({ overview, onUpdated }: BalanceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(String(overview.balance));
  const [monthlyBudget, setMonthlyBudget] = useState(String(overview.monthlyBudget));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const parsedBalance = Number(balance);
    const parsedMonthlyBudget = Number(monthlyBudget);
    if (balance.trim() === '' || !Number.isFinite(parsedBalance)) {
      setError('Enter a valid balance');
      return;
    }
    if (monthlyBudget.trim() === '' || !Number.isFinite(parsedMonthlyBudget)) {
      setError('Enter a valid monthly budget');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await updateFinanceSettings({ balance: parsedBalance, monthlyBudget: parsedMonthlyBudget });
      await onUpdated();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6">
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Balance</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monthly Budget</label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">Balance</p>
            <p className="text-3xl font-bold text-white">${overview.balance.toFixed(2)}</p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Monthly Budget</p>
                <p className="text-gray-200">${overview.monthlyBudget.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Daily Budget</p>
                <p className="text-gray-200">${overview.dailyBudget.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Days Left</p>
                <p className="text-gray-200">{overview.daysRemaining}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
