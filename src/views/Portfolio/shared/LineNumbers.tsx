import { mono } from '../constants/fonts';

interface LineNumbersProps {
  count: number;
}

export function LineNumbers({ count }: LineNumbersProps) {
  return (
    <div
      className="shrink-0 select-none"
      style={{
        width: 48,
        paddingTop: 32,
        paddingRight: 12,
        textAlign: 'right',
        borderRight: '1px solid var(--ide-border-subtle)',
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            fontSize: 12,
            fontFamily: mono,
            color: 'var(--ide-line-number)',
            lineHeight: '24px',
          }}
        >
          {String(i + 1).padStart(2, '0')}
        </div>
      ))}
    </div>
  );
}
