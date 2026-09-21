import Overlay from './Overlay';
import Kbd from '../Kbd';

const ROWS: [string, string][] = [
  ['Dashboard / Calendar / History / Settings', '1 2 3 4'],
  ['Add expense', 'N'],
  ['Add income', 'I'],
  ['Edit balance', 'B'],
  ['Calculator', 'C'],
  ['Search history', '/'],
  ['Close dialog', 'Esc'],
  ['Show this panel', '?'],
];

interface ShortcutsModalProps {
  onClose: () => void;
}

export default function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  return (
    <Overlay>
      <h3 className="font-paper-serif text-xl font-bold">Keyboard shortcuts</h3>
      <div className="mt-3">
        {ROWS.map(([label, keys]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-[var(--paper-line)] py-2 text-sm last:border-b-0"
          >
            <span>{label}</span>
            <Kbd>{keys}</Kbd>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 text-sm font-bold shadow-[2px_3px_0_var(--paper-ink)] hover:-translate-y-px"
        >
          Got it
        </button>
      </div>
    </Overlay>
  );
}
