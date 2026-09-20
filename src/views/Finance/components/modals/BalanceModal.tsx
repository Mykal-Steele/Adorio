'use client';
import { useEffect, useRef, useState } from 'react';
import { updateFinanceSettings } from '@/api/finance';
import Overlay from './Overlay';

interface BalanceModalProps {
  currentBalance: number;
  onClose: () => void;
  onSaved: (message: string) => Promise<void> | void;
}

export default function BalanceModal({ currentBalance, onClose, onSaved }: BalanceModalProps) {
  const [value, setValue] = useState(String(currentBalance));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(value);
    if (value.trim() === '' || !Number.isFinite(parsed)) {
      setError('Enter a valid amount.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await updateFinanceSettings({ balance: parsed });
      await onSaved('Balance updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update balance');
      setIsSaving(false);
    }
  };

  return (
    <Overlay>
      <form onSubmit={handleSubmit}>
        <h3 className="font-paper-serif text-xl font-bold">Edit balance</h3>
        <label className="mt-4 block">
          <span className="font-paper-mono mb-1.5 block text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
            Total balance
          </span>
          <input
            ref={inputRef}
            type="number"
            step="0.01"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-transparent px-3 py-2 text-lg outline-none focus:border-[var(--paper-accent-strong)]"
          />
        </label>
        {error && <p className="mt-2 text-sm font-bold text-[#8d3a33]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2.5">
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
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Overlay>
  );
}
