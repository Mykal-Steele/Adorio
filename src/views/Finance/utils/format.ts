export function fmtMoney(n: number): string {
  const v = Math.round((n + Number.EPSILON) * 100) / 100;
  const neg = v < 0;
  const s = Math.abs(v).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (neg ? '−฿' : '฿') + s;
}

export function fmtMoneyPlain(n: number): string {
  const neg = n < 0;
  return (neg ? '−฿' : '฿') + Math.round(Math.abs(n)).toLocaleString('en-US');
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const today = toISODate(new Date());
  const yesterday = toISODate(new Date(Date.now() - 86400000));
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDayLabel(iso: string): string {
  const short = formatShortDate(iso);
  const d = new Date(`${iso}T00:00:00`);
  if (short === 'Today' || short === 'Yesterday') {
    return `${short} · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Paper theme has no built-in positive/negative/warning palette (those are
// Runway's own dark-theme tokens) — these earthy equivalents keep the same
// good/warning/over-budget semantics on cream.
export const STATUS_COLORS = {
  positive: '#3f7d52',
  warning: 'var(--paper-accent-strong)',
  negative: '#8d3a33',
};

export function statusColor(pct: number): string {
  if (pct >= 1) return STATUS_COLORS.negative;
  if (pct >= 0.7) return STATUS_COLORS.warning;
  return STATUS_COLORS.positive;
}
