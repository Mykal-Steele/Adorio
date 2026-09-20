'use client';
import { useCallback, useState } from 'react';

interface ConfirmState {
  title: string;
  message: string;
  okLabel: string;
  onConfirm: () => void;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const openConfirm = useCallback(
    (title: string, message: string, okLabel: string, onConfirm: () => void) => {
      setConfirmState({ title, message, okLabel, onConfirm });
    },
    [],
  );

  const closeConfirm = useCallback(() => setConfirmState(null), []);

  return { confirmState, openConfirm, closeConfirm };
}
