import type { Metadata } from 'next';
import Finance from '@/views/Finance';

export const metadata: Metadata = {
  title: 'Runway',
  robots: { index: false, follow: false },
};

export default function FinancePage() {
  return <Finance />;
}
