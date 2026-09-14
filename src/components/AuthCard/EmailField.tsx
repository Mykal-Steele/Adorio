import React, { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const EmailField = ({ value, onChange, disabled = false }: EmailFieldProps) => {
  const [touched, setTouched] = useState(false);
  const invalid = touched && value.length > 0 && !EMAIL_RE.test(value);

  return (
    <label className="mt-[18px] block">
      <span className="mb-1.5 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
        Email
      </span>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        autoComplete="email"
        aria-invalid={invalid}
        disabled={disabled}
        required
        className={`w-full border-b-2 bg-transparent px-0.5 py-[9px] text-[17px] outline-none focus:border-[var(--paper-accent-strong)] ${
          invalid ? 'border-[#8d3a33]' : 'border-[var(--paper-muted-2)]'
        }`}
      />
      {invalid && (
        <span role="alert" className="mt-[7px] block text-[13.5px] font-bold text-[#8d3a33]">
          That email is missing something.
        </span>
      )}
    </label>
  );
};

export default EmailField;
