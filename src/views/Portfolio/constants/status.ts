export const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  STABLE: { color: 'var(--ide-accent)', bg: 'rgba(0,255,194,0.1)', label: '■ STABLE' },
  BETA: { color: 'var(--ide-orange)', bg: 'rgba(254,157,0,0.1)', label: '■ BETA' },
  IN_PROGRESS: {
    color: 'var(--ide-purple)',
    bg: 'rgba(198,160,246,0.12)',
    label: '■ IN PROGRESS',
  },
  DEPRECATED: { color: 'var(--ide-pink)', bg: 'rgba(255,145,149,0.1)', label: '■ DEPRECATED' },
};
