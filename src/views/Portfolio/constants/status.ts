export const statusConfig: Record<string, { color: string; label: string }> = {
  STABLE: { color: 'var(--ide-green)', label: 'Stable' },
  BETA: { color: 'var(--ide-orange)', label: 'Beta' },
  IN_PROGRESS: { color: 'var(--ide-purple)', label: 'In progress' },
  DEPRECATED: { color: 'var(--ide-red)', label: 'Deprecated' },
};
