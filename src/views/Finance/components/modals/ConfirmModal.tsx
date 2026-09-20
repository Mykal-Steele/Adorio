import Overlay from './Overlay';

interface ConfirmModalProps {
  title: string;
  message: string;
  okLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  title,
  message,
  okLabel,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Overlay>
      <h3 className="font-paper-serif text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--paper-muted)]">{message}</p>
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[4px] border border-[var(--paper-muted-2)] px-4 py-2 text-sm text-[var(--paper-muted)] hover:text-[var(--paper-ink)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-[4px] border border-[#8d3a33] px-4 py-2 text-sm font-medium text-[#8d3a33] hover:bg-[#8d3a33]/10"
        >
          {okLabel}
        </button>
      </div>
    </Overlay>
  );
}
