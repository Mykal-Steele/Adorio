import { LineNumbers } from './LineNumbers';

const LINE_WIDTHS = [68, 42, 85, 55, 30, 92, 48, 64, 38, 74, 26, 80];

export function RouteLoadingSkeleton() {
  return (
    <div className="min-h-full" aria-busy="true" aria-label="Loading">
      <div
        className="flex items-center px-6"
        style={{
          borderBottom: '1px solid var(--ide-border-subtle)',
          background: 'var(--ide-bg-4)',
          height: 33,
        }}
      >
        <div
          style={{
            width: 130,
            height: 9,
            borderRadius: 2,
            background: 'var(--ide-bg-5)',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        />
      </div>
      <div className="flex">
        <LineNumbers count={12} />
        <div className="flex-1 px-6 py-8 flex flex-col gap-3">
          {LINE_WIDTHS.map((w, i) => (
            <div
              key={i}
              style={{
                width: `${w}%`,
                height: 11,
                borderRadius: 3,
                background: 'var(--ide-bg-5)',
                animation: 'pulse 1.6s ease-in-out infinite',
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
