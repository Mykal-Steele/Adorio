const LINE_WIDTHS = [92, 85, 64, 0, 88, 74, 80, 42];

const pulse = {
  borderRadius: 3,
  background: 'var(--ide-bg-4)',
  animation: 'pulse 1.6s ease-in-out infinite',
} as const;

export function RouteLoadingSkeleton() {
  return (
    <div
      className="flex flex-col px-8 pt-16"
      style={{ gap: 12, maxWidth: 776, margin: '0 auto' }}
      aria-busy="true"
      aria-label="Loading"
    >
      <div style={{ ...pulse, width: 220, height: 12 }} />
      <div style={{ ...pulse, width: 320, height: 44, marginBottom: 24 }} />
      {LINE_WIDTHS.map((w, i) => (
        <div
          key={i}
          style={{ ...pulse, width: `${w}%`, height: w ? 14 : 8, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
