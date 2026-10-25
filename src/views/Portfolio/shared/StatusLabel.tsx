import { statusConfig } from '../constants/status';
import { eyebrow } from '../constants/type';

export function StatusLabel({ status }: { status: string }) {
  const { color, label } = statusConfig[status] ?? statusConfig.STABLE;
  return (
    <span className="inline-flex items-center" style={{ ...eyebrow, gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}
