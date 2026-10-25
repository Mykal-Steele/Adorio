import { statusConfig } from '../constants/status';
import { eyebrow } from '../constants/type';

export function StatusLabel({ status }: { status: string }) {
  return <span style={eyebrow}>{(statusConfig[status] ?? statusConfig.STABLE).label}</span>;
}
