import { hand } from '../constants/fonts';

interface ThemeHintProps {
  visible: boolean;
  onDismissForever: () => void;
}

// A note scribbled under the title bar, with a curly arrow up to the Theme button
export function ThemeHint({ visible, onDismissForever }: ThemeHintProps) {
  return (
    <div
      className="pointer-events-none absolute z-30 flex items-start"
      style={{
        top: 'calc(100% + 6px)',
        right: 56,
        gap: 2,
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: 'opacity 200ms ease, visibility 200ms',
      }}
    >
      <div
        className="flex flex-col items-end"
        style={{ marginTop: 28, gap: 8, transform: 'rotate(-4deg)' }}
      >
        <p
          style={{
            margin: 0,
            maxWidth: 210,
            fontFamily: hand,
            fontSize: 19,
            lineHeight: 1.2,
            color: 'var(--ide-text-2)',
            textAlign: 'right',
          }}
        >
          you can change the theme here if you don&apos;t like the current one :-)
        </p>
        <label
          className="pointer-events-auto flex cursor-pointer items-center"
          style={{ gap: 6, fontFamily: hand, fontSize: 16, color: 'var(--ide-text-4)' }}
        >
          <input
            type="checkbox"
            onChange={(e) => e.target.checked && onDismissForever()}
            style={{ width: 15, height: 15, accentColor: 'var(--ide-text-2)', cursor: 'pointer' }}
          />
          don&apos;t show this again
        </label>
      </div>
      <svg
        aria-hidden="true"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M4 50 C 18 58, 30 50, 28 38 C 26 28, 14 30, 18 38 C 22 46, 40 40, 48 26 C 52 19, 54 13, 55 7"
          stroke="var(--ide-text-3)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M47 12 L55 6 L59 15"
          stroke="var(--ide-text-3)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
