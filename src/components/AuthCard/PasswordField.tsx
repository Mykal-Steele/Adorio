import React, { useState } from 'react';

const STRENGTH = [
  { width: '4%', color: '#ecdfc8', label: 'empty' },
  { width: '34%', color: '#a9564f', label: 'weak' },
  { width: '67%', color: '#c08a1e', label: 'ok' },
  { width: '100%', color: '#5f7a2e', label: 'strong' },
] as const;

const scorePassword = (pw: string) => {
  if (!pw) return 0;
  let n = 0;
  if (pw.length >= 8) n++;
  if (pw.length >= 14) n++;
  if (/[^a-zA-Z0-9]/.test(pw) || (/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw))) n++;
  return Math.min(n, 3);
};

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'new-password' | 'current-password';
  showStrength?: boolean;
  disabled?: boolean;
};

const PasswordField = ({
  value,
  onChange,
  autoComplete,
  showStrength = false,
  disabled = false,
}: PasswordFieldProps) => {
  const [shown, setShown] = useState(false);
  const strength = STRENGTH[scorePassword(value)];

  return (
    <label className="mt-[18px] block">
      <span className="mb-1.5 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
        Password
      </span>
      <span className="flex items-end gap-[10px]">
        <input
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          required
          minLength={showStrength ? 8 : undefined}
          className="min-w-0 flex-1 border-b-2 border-[var(--paper-muted-2)] bg-transparent px-0.5 py-[9px] text-[17px] outline-none focus:border-[var(--paper-accent-strong)]"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-pressed={shown}
          className="shrink-0 rounded-full border-[1.5px] border-dashed border-[var(--paper-muted-2)] px-3 py-[7px] font-paper-mono text-[11px] uppercase tracking-[.12em] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
        >
          {shown ? 'Hide' : 'Show'}
        </button>
      </span>

      {showStrength && (
        <>
          <span className="mt-[11px] flex items-center gap-[10px]">
            <span
              aria-hidden="true"
              className="block h-2 flex-1 overflow-hidden rounded-full border border-[rgba(60,44,24,.22)] bg-[#ecdfc8]"
            >
              <span
                className="block h-full transition-all"
                style={{ width: strength.width, backgroundColor: strength.color }}
              />
            </span>
            <span className="shrink-0 font-paper-mono text-[11px] uppercase tracking-[.12em] text-[var(--paper-muted)]">
              {strength.label}
            </span>
          </span>
          <span className="mt-[7px] block text-[13.5px] text-[var(--paper-muted)]">
            Eight characters minimum. Length beats punctuation.
          </span>
        </>
      )}
    </label>
  );
};

export default PasswordField;
