import { Suspense } from 'react';
import type { Metadata } from 'next';
import Login from '@/views/Login';

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
