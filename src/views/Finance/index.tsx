'use client';
import { useCallback, useRef, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import PaperTornEdge from '@/components/PaperTornEdge';
import type { FinanceTransaction, TransactionType } from '@/api/finance';
import { deleteFinanceTransaction } from '@/api/finance';
import { useFinanceData } from './hooks/useFinanceData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useConfirm } from './hooks/useConfirm';
import { useToast } from './hooks/useToast';
import type { ModalKind, Tab } from './types';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './components/pages/Dashboard';
import History from './components/pages/History';
import Settings from './components/pages/Settings';
import TransactionModal from './components/modals/TransactionModal';
import BalanceModal from './components/modals/BalanceModal';
import ShortcutsModal from './components/modals/ShortcutsModal';
import ConfirmModal from './components/modals/ConfirmModal';

export default function Finance() {
  const {
    overview,
    categories,
    transactions,
    hasMore,
    summary,
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

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const { toastMessage, showToast } = useToast();
  const { confirmState, openConfirm, closeConfirm } = useConfirm();

  const closeModal = useCallback(() => {
    setOpenModal(null);
    setEditingTransaction(null);
  }, []);

  const openExpenseModal = useCallback(() => {
    setEditingTransaction(null);
    setTransactionModalType('expense');
    setOpenModal('transaction');
  }, []);

  const openIncomeModal = useCallback(() => {
    setEditingTransaction(null);
    setTransactionModalType('income');
    setOpenModal('transaction');
  }, []);

  const openEditTransaction = useCallback((transaction: FinanceTransaction) => {
    setEditingTransaction(transaction);
    setTransactionModalType(transaction.type);
    setOpenModal('transaction');
  }, []);

  const openBalanceModal = useCallback(() => setOpenModal('balance'), []);
  const openShortcuts = useCallback(() => setOpenModal('shortcuts'), []);

  const focusHistorySearch = useCallback(() => {
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const closeAnyOpen = useCallback(() => {
    const hadModal = openModal !== null;
    const hadConfirm = confirmState !== null;
    if (hadModal) closeModal();
    if (hadConfirm) closeConfirm();
    return hadModal || hadConfirm;
  }, [openModal, confirmState, closeModal, closeConfirm]);

  useKeyboardShortcuts({
    setTab: setActiveTab,
    openExpenseModal,
    openIncomeModal,
    openBalanceModal,
    openShortcuts,
    focusHistorySearch,
    closeAnyOpen,
  });

  const handleTransactionSaved = async (message: string) => {
    closeModal();
    await refetchAll(filters);
    showToast(message);
  };

  const handleBalanceSaved = async (message: string) => {
    closeModal();
    await refetchOverview();
    showToast(message);
  };

  const handleSettingsSaved = async (message: string) => {
    await refetchOverview();
    showToast(message);
  };

  const handleCategoriesChanged = async (message: string) => {
    await Promise.all([refetchCategories(), refetchOverview(), refetchAll(filters)]);
    showToast(message);
  };

  const requestDeleteTransaction = (transaction: FinanceTransaction) => {
    openConfirm(
      'Delete this transaction?',
      `"${transaction.title}" will be removed and your balance adjusted back.`,
      'Delete',
      async () => {
        closeConfirm();
        await deleteFinanceTransaction(transaction._id);
        closeModal();
        await refetchAll(filters);
        showToast('Transaction deleted.');
      },
    );
  };

  if (isLoading) {
    return (
      <div className="paper-theme flex min-h-screen items-center justify-center">
        <Spinner size="md" label="Loading Runway..." />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="paper-theme flex min-h-screen items-center justify-center p-4">
        <p className="text-[#8d3a33]">{error || 'Failed to load finance data'}</p>
      </div>
    );
  }

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />
      <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row">
        <Sidebar
          balance={overview.balance}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEditBalance={openBalanceModal}
          onAddExpense={openExpenseModal}
          onAddIncome={openIncomeModal}
          onOpenShortcuts={openShortcuts}
        />

        <main className="w-full max-w-[1180px] flex-1 px-4 pb-16 pt-8 md:px-10">
          {activeTab === 'dashboard' && (
            <Dashboard
              overview={overview}
              recentTransactions={transactions}
              onViewAll={() => setActiveTab('history')}
              onEditTransaction={openEditTransaction}
            />
          )}
          {activeTab === 'history' && (
            <>
              <History
                transactions={transactions}
                categories={categories}
                filters={filters}
                summary={summary}
                hasAnyTransactions={summary.totalIncome > 0 || summary.totalExpense > 0}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                searchInputRef={searchInputRef}
                onFilterChange={applyFilters}
                onLoadMore={loadMoreTransactions}
                onEditTransaction={openEditTransaction}
              />
              {filterError && <p className="mt-3 text-sm text-[#8d3a33]">{filterError}</p>}
            </>
          )}
          {activeTab === 'settings' && (
            <Settings
              overview={overview}
              categories={categories}
              onSettingsSaved={handleSettingsSaved}
              onCategoriesChanged={handleCategoriesChanged}
              openConfirm={openConfirm}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {openModal === 'transaction' && (
        <TransactionModal
          categories={categories}
          initialType={transactionModalType}
          editingTransaction={editingTransaction}
          onClose={closeModal}
          onSaved={handleTransactionSaved}
          onDeleteRequested={requestDeleteTransaction}
        />
      )}
      {openModal === 'balance' && (
        <BalanceModal
          currentBalance={overview.balance}
          onClose={closeModal}
          onSaved={handleBalanceSaved}
        />
      )}
      {openModal === 'shortcuts' && <ShortcutsModal onClose={closeModal} />}
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          okLabel={confirmState.okLabel}
          onCancel={closeConfirm}
          onConfirm={confirmState.onConfirm}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
