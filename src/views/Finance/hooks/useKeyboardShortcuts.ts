'use client';
import { useEffect, useRef } from 'react';
import type { Tab } from '../types';

interface Handlers {
  setTab: (tab: Tab) => void;
  openExpenseModal: () => void;
  openIncomeModal: () => void;
  openBalanceModal: () => void;
  openShortcuts: () => void;
  openCalculator: () => void;
  focusHistorySearch: () => void;
  closeAnyOpen: () => boolean;
  isModalOpen: boolean;
}

// Handlers close over per-render state (current tab, open modal, etc.), so
// a plain effect dep array would either re-subscribe every render or run
// stale. Keeping the latest handlers in a ref lets the listener attach once
// and always call through to the current render's callbacks.
export function useKeyboardShortcuts(handlers: Handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const h = handlersRef.current;
      const tag = (e.target as HTMLElement | null)?.tagName ?? '';
      const isTyping = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';

      if (e.key === 'Escape') {
        if (h.closeAnyOpen()) e.preventDefault();
        return;
      }
      if (isTyping) return;
      // A modal (calculator, transaction form, ...) owns the keyboard while
      // it's open — its own listener handles typing. Without this, "1"-"4"
      // would still flip dashboard tabs underneath an open dialog.
      if (h.isModalOpen) return;

      switch (e.key) {
        case '1':
          h.setTab('dashboard');
          e.preventDefault();
          break;
        case '2':
          h.setTab('calendar');
          e.preventDefault();
          break;
        case '3':
          h.setTab('history');
          e.preventDefault();
          break;
        case '4':
          h.setTab('settings');
          e.preventDefault();
          break;
        case 'n':
        case 'N':
          h.openExpenseModal();
          e.preventDefault();
          break;
        case 'i':
        case 'I':
          h.openIncomeModal();
          e.preventDefault();
          break;
        case 'b':
        case 'B':
          h.openBalanceModal();
          e.preventDefault();
          break;
        case 'c':
        case 'C':
          h.openCalculator();
          e.preventDefault();
          break;
        case '?':
          h.openShortcuts();
          e.preventDefault();
          break;
        case '/':
          h.setTab('history');
          h.focusHistorySearch();
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
