export const card =
  'rounded-[6px] border border-[var(--paper-line)] bg-[var(--paper-cream)] shadow-[0_1px_3px_rgba(60,44,24,.2)]';

export const eyebrow = 'font-paper-sans text-xs font-semibold text-[var(--paper-muted)]';

export const formatNumber = (n: number) => n.toLocaleString('en-US');

export function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

const regions =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

export function countryName(code: string) {
  if (!code || code === 'Unknown') return 'Unknown';
  try {
    return regions?.of(code) ?? code;
  } catch {
    return code;
  }
}

// chart axis and tooltip labels for a bucket key from the API
export function bucketLabel(bucket: string, unit: 'hour' | 'day' | 'month', long = false) {
  if (unit === 'hour') return `${bucket.slice(11, 13)}:00`;
  if (unit === 'month') {
    const [y, m] = bucket.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', {
      month: long ? 'long' : 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  const [y, m, d] = bucket.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    weekday: long ? 'short' : undefined,
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  });
}
