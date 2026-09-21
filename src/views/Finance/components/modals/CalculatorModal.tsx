'use client';
import { useEffect, useMemo, useState } from 'react';
import Overlay from './Overlay';
import { evaluateExpression } from '../../utils/calculator';

interface CalculatorModalProps {
  onClose: () => void;
}

type Key =
  | { label: string; kind: 'digit' | 'op' | 'ghost' | 'accent'; insert: string }
  | { label: string; kind: 'action'; action: 'clear' | 'backspace' | 'sign' | 'equals' };

const KEYS: Key[] = [
  { label: 'C', kind: 'action', action: 'clear' },
  { label: '( )', kind: 'ghost', insert: '()' },
  { label: '%', kind: 'ghost', insert: '%' },
  { label: '÷', kind: 'op', insert: '÷' },
  { label: '7', kind: 'digit', insert: '7' },
  { label: '8', kind: 'digit', insert: '8' },
  { label: '9', kind: 'digit', insert: '9' },
  { label: '×', kind: 'op', insert: '×' },
  { label: '4', kind: 'digit', insert: '4' },
  { label: '5', kind: 'digit', insert: '5' },
  { label: '6', kind: 'digit', insert: '6' },
  { label: '−', kind: 'op', insert: '−' },
  { label: '1', kind: 'digit', insert: '1' },
  { label: '2', kind: 'digit', insert: '2' },
  { label: '3', kind: 'digit', insert: '3' },
  { label: '+', kind: 'op', insert: '+' },
  { label: '±', kind: 'action', action: 'sign' },
  { label: '0', kind: 'digit', insert: '0' },
  { label: '.', kind: 'digit', insert: '.' },
  { label: '=', kind: 'accent', insert: '' },
];

const KEY_MAP: Record<string, string> = {
  '-': '−',
  '*': '×',
  '/': '÷',
};

function toggleTrailingSign(expr: string): string {
  const match = expr.match(/(−?\d*\.?\d+)$/);
  if (!match) return expr;
  const numStr = match[1];
  const before = expr.slice(0, expr.length - numStr.length);
  const toggled = numStr.startsWith('−') ? numStr.slice(1) : `−${numStr}`;
  return before + toggled;
}

export default function CalculatorModal({ onClose }: CalculatorModalProps) {
  const [expression, setExpression] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  const preview = useMemo(() => {
    if (!expression || error) return null;
    try {
      const value = evaluateExpression(expression);
      const asString = formatResult(value);
      return asString === expression ? null : asString;
    } catch {
      return null;
    }
  }, [expression, error]);

  const insert = (text: string) => {
    if (error) {
      setExpression(text === '(' || text === '()' ? '(' : /\d/.test(text) ? text : '');
      setError(false);
      return;
    }
    if (text === '()') {
      const opens = (expression.match(/\(/g) || []).length;
      const closes = (expression.match(/\)/g) || []).length;
      const lastChar = expression.slice(-1);
      if (opens > closes && lastChar !== '(' && !/[+−×÷]/.test(lastChar)) {
        setExpression(expression + ')');
      } else {
        setExpression(expression + '(');
      }
      return;
    }
    if (/[+−×÷]/.test(text)) {
      if (expression === '') {
        if (text === '−') setExpression('−');
        return;
      }
      const last = expression.slice(-1);
      if (/[+−×÷]/.test(last)) {
        // A unary minus is allowed right after a binary operator ("3×−4"),
        // but any other back-to-back operator press replaces the last one
        // rather than stacking ("3×+" -> "3+").
        if (/[+×÷]/.test(last) && text === '−') {
          setExpression(expression + text);
        } else {
          setExpression(expression.slice(0, -1) + text);
        }
        return;
      }
    }
    if (text === '.' && /\.\d*$/.test(expression.match(/[\d.]*$/)?.[0] ?? '')) return;
    setExpression(expression + text);
  };

  const clear = () => {
    setExpression('');
    setError(false);
  };

  const backspace = () => {
    if (error) {
      clear();
      return;
    }
    setExpression((prev) => prev.slice(0, -1));
  };

  const toggleSign = () => {
    if (error) return;
    setExpression((prev) => toggleTrailingSign(prev));
  };

  const equals = () => {
    if (!expression) return;
    try {
      const value = evaluateExpression(expression);
      setExpression(formatResult(value));
      setError(false);
    } catch {
      setExpression('Error');
      setError(true);
    }
  };

  const pressKey = (key: Key) => {
    if (key.kind === 'action') {
      if (key.action === 'clear') clear();
      else if (key.action === 'backspace') backspace();
      else if (key.action === 'sign') toggleSign();
      return;
    }
    if (key.label === '=') {
      equals();
      return;
    }
    insert(key.insert);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= '0' && key <= '9') {
        insert(key);
        e.preventDefault();
      } else if (key === '.') {
        insert('.');
        e.preventDefault();
      } else if (key === '(' || key === ')') {
        insert(key);
        e.preventDefault();
      } else if (key === '%') {
        insert('%');
        e.preventDefault();
      } else if (KEY_MAP[key]) {
        insert(KEY_MAP[key]);
        e.preventDefault();
      } else if (key === 'Enter' || key === '=') {
        equals();
        e.preventDefault();
      } else if (key === 'Backspace') {
        backspace();
        e.preventDefault();
      } else if (key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, error]);

  return (
    <Overlay>
      <h3 className="font-paper-serif text-xl font-bold">Calculator</h3>

      <div className="font-paper-mono mt-3 min-h-[88px] rounded-[6px] border-[1.5px] border-[var(--paper-line)] bg-[rgba(43,39,35,0.03)] px-4 py-3">
        <div
          className="break-all text-right text-[1.5rem] font-semibold leading-tight"
          style={{ color: error ? '#8d3a33' : 'var(--paper-ink)' }}
        >
          {expression || '0'}
        </div>
        {preview !== null && (
          <div className="mt-1 text-right text-sm text-[var(--paper-muted-2)]">= {preview}</div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {KEYS.map((key, i) => (
          <button
            key={key.label + i}
            type="button"
            onClick={() => pressKey(key)}
            className={`rounded-[6px] border-[1.5px] py-3 text-[1.05rem] font-semibold transition-transform hover:-translate-y-px ${
              key.label === '='
                ? 'border-[var(--paper-ink)] bg-[var(--paper-yellow)] shadow-[2px_3px_0_var(--paper-ink)]'
                : key.kind === 'op'
                  ? 'border-[var(--paper-accent-strong)] text-[var(--paper-accent-strong)]'
                  : key.kind === 'ghost' || key.kind === 'action'
                    ? 'border-[var(--paper-line)] text-[var(--paper-muted)]'
                    : 'border-[var(--paper-line)]'
            }`}
          >
            {key.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[4px] border border-[var(--paper-muted-2)] px-4 py-2 text-sm text-[var(--paper-muted)] hover:text-[var(--paper-ink)]"
        >
          Close
        </button>
      </div>
    </Overlay>
  );
}

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Math.round((value + Number.EPSILON) * 1e8) / 1e8;
  return String(rounded).replace('-', '−');
}
