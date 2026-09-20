'use client';
import { useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import type { FinanceTransaction } from '@/api/finance';
import { useFinanceData } from './hooks/useFinanceData';
import BalanceCard from './components/BalanceCard';
import SpendSummary from './components/SpendSummary';
import CategoryBreakdown from './components/CategoryBreakdown';
import CategoryManager from './components/CategoryManager';
import TransactionForm from './components/TransactionForm';
import TransactionFilters from './components/TransactionFilters';
import TransactionList from './components/TransactionList';

export default function Finance() {
  const {
    overview,
    categories,
    transactions,
    hasMore,
    filters,
    isLoading,
    isLoadingMore,
    error,
    filterError,
    applyFilters,
    loadMoreTransactions,
    refetchAll,
    refetchOverview,
    refetchCategories,
  } = useFinanceData();
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner size="md" label="Loading Runway..." />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <p className="text-red-400">{error || 'Failed to load finance data'}</p>
      </div>
    );
  }

  const handleTransactionSaved = async () => {
    setEditingTransaction(null);
    await refetchAll(filters);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
          Runway
        </h1>

        <BalanceCard overview={overview} onUpdated={refetchOverview} />
        <SpendSummary overview={overview} />
        <CategoryBreakdown overview={overview} />

        <TransactionForm
          categories={categories}
          editingTransaction={editingTransaction}
          onDone={handleTransactionSaved}
          onCancelEdit={() => setEditingTransaction(null)}
        />

        <TransactionFilters categories={categories} filters={filters} onChange={applyFilters} />
        {filterError && <p className="text-red-400 text-sm">{filterError}</p>}

        <TransactionList
          transactions={transactions}
          onEdit={setEditingTransaction}
          onChanged={() => refetchAll(filters)}
        />

        {hasMore && (
          <button
            onClick={loadMoreTransactions}
            disabled={isLoadingMore}
            className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </button>
        )}

        <CategoryManager
          categories={categories}
          onChanged={async () => {
            await refetchCategories();
            await refetchAll(filters);
          }}
        />
      </div>
    </div>
  );
}
