'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  getFinanceOverview,
  getFinanceCategories,
  getFinanceTransactions,
  type FinanceOverview,
  type FinanceCategory,
  type FinanceTransaction,
  type FinanceTransactionsQuery,
} from '@/api/finance';

export function useFinanceData() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [filters, setFilters] = useState<FinanceTransactionsQuery>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refetchOverview = useCallback(async () => {
    setOverview(await getFinanceOverview());
  }, []);

  const refetchCategories = useCallback(async () => {
    setCategories(await getFinanceCategories());
  }, []);

  const refetchTransactions = useCallback(async (query: FinanceTransactionsQuery) => {
    const page = await getFinanceTransactions(query);
    setTransactions(page.transactions);
  }, []);

  const refetchAll = useCallback(
    async (query: FinanceTransactionsQuery = filters) => {
      await Promise.all([refetchOverview(), refetchCategories(), refetchTransactions(query)]);
    },
    [filters, refetchOverview, refetchCategories, refetchTransactions],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError('');
      try {
        await refetchAll({});
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load finance data');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = useCallback(
    async (next: FinanceTransactionsQuery) => {
      setFilters(next);
      try {
        await refetchTransactions(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      }
    },
    [refetchTransactions],
  );

  return {
    overview,
    categories,
    transactions,
    filters,
    isLoading,
    error,
    setError,
    applyFilters,
    refetchAll,
    refetchOverview,
    refetchCategories,
  };
}
