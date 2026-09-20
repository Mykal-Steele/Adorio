import API, { request } from './index';

export type TransactionType = 'income' | 'expense';

export interface FinanceCategory {
  _id: string;
  name: string;
  color: string;
  excludeFromBudget: boolean;
  isDefault: boolean;
  slug: string;
}

export interface FinanceTransaction {
  _id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: FinanceCategory;
  date: string;
  ts: number;
}

export interface FinanceSettings {
  balance: number;
  monthlyBudget: number;
}

export interface FinanceOverview {
  balance: number;
  monthlyBudget: number;
  dailyBudget: number;
  monthlySpend: number;
  monthlySpendAll: number;
  monthlyIncome: number;
  todaySpend: number;
  daysRemaining: number;
  daysInMonth: number;
  categoryBreakdown: {
    category: Pick<FinanceCategory, 'name' | 'color' | 'excludeFromBudget'> & { id: string };
    amount: number;
  }[];
}

export interface FinanceTransactionsPage {
  transactions: FinanceTransaction[];
  hasMore: boolean;
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  summary: { totalIncome: number; totalExpense: number };
}

export interface FinanceTransactionsQuery {
  month?: string;
  category?: string;
  type?: TransactionType;
  search?: string;
  page?: number;
  limit?: number;
}

export const getFinanceOverview = () =>
  request(API.get('/finance/overview')).then((res) => res.data as FinanceOverview);

export const getFinanceSettings = () =>
  request(API.get('/finance/settings')).then((res) => res.data as FinanceSettings);

export const updateFinanceSettings = (data: Partial<FinanceSettings>) =>
  request(API.patch('/finance/settings', data)).then((res) => res.data as FinanceSettings);

export const getFinanceCategories = () =>
  request(API.get('/finance/categories')).then((res) => res.data as FinanceCategory[]);

export const createFinanceCategory = (data: {
  name: string;
  color: string;
  excludeFromBudget?: boolean;
}) => request(API.post('/finance/categories', data)).then((res) => res.data as FinanceCategory);

export const updateFinanceCategory = (
  id: string,
  data: Partial<{ name: string; color: string; excludeFromBudget: boolean }>,
) =>
  request(API.patch(`/finance/categories/${id}`, data)).then((res) => res.data as FinanceCategory);

export const deleteFinanceCategory = (id: string) =>
  request(API.delete(`/finance/categories/${id}`));

export const getFinanceTransactions = (params: FinanceTransactionsQuery = {}) =>
  request(API.get('/finance/transactions', { params })).then(
    (res) => res.data as FinanceTransactionsPage,
  );

export const createFinanceTransaction = (data: {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}) =>
  request(API.post('/finance/transactions', data)).then((res) => res.data as FinanceTransaction);

export const updateFinanceTransaction = (
  id: string,
  data: Partial<{
    title: string;
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
  }>,
) =>
  request(API.patch(`/finance/transactions/${id}`, data)).then(
    (res) => res.data as FinanceTransaction,
  );

export const deleteFinanceTransaction = (id: string) =>
  request(API.delete(`/finance/transactions/${id}`));
