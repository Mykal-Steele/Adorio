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
  const [hasMore, setHasMore] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filters, setFilters] = useState<Omit<FinanceTransactionsQuery, 'page'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');

  const refetchOverview = useCallback(async () => {
    setOverview(await getFinanceOverview());
  }, []);

  const refetchCategories = useCallback(async () => {
    setCategories(await getFinanceCategories());
  }, []);

  const refetchTransactions = useCallback(
    async (query: FinanceTransactionsQuery, { append = false } = {}) => {
      const page = await getFinanceTransactions(query);
      setTransactions((prev) => (append ? [...prev, ...page.transactions] : page.transactions));
      setHasMore(page.hasMore);
      setTotalTransactions(page.totalTransactions);
    },
    [],
  );

  const refetchAll = useCallback(
    async (query: Omit<FinanceTransactionsQuery, 'page'> = filters) => {
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
    async (next: Omit<FinanceTransactionsQuery, 'page'>) => {
      setFilters(next);
      setFilterError('');
      try {
        await refetchTransactions(next);
      } catch (err) {
        setFilterError(err instanceof Error ? err.message : 'Failed to load transactions');
      }
    },
    [refetchTransactions],
  );

  const loadMoreTransactions = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setFilterError('');
    try {
      const nextPage = Math.floor(transactions.length / (filters.limit ?? 50)) + 1;
      await refetchTransactions({ ...filters, page: nextPage }, { append: true });
    } catch (err) {
      setFilterError(err instanceof Error ? err.message : 'Failed to load more transactions');
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, hasMore, isLoadingMore, refetchTransactions, transactions.length]);

  return {
    overview,
    categories,
    transactions,
    hasMore,
    totalTransactions,
    filters,
    isLoading,
    isLoadingMore,
    error,
    filterError,
    setError,
    applyFilters,
    loadMoreTransactions,
    refetchAll,
    refetchOverview,
    refetchCategories,
  };
}
