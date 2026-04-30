export const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  STABLE: { color: 'var(--ide-accent)', bg: 'rgba(0,255,194,0.1)', label: '■ STABLE' },
  BETA: { color: 'var(--ide-orange)', bg: 'rgba(254,157,0,0.1)', label: '■ BETA' },
  DEPRECATED: { color: 'var(--ide-pink)', bg: 'rgba(255,145,149,0.1)', label: '■ DEPRECATED' },
};

export const codeColors: Record<string, string> = {
  keyword: 'var(--ide-pink)',
  attr: 'var(--ide-purple)',
  normal: 'var(--ide-text-1)',
  field: 'var(--ide-orange)',
  comment: 'var(--ide-text-6)',
  empty: 'transparent',
};
