'use client';
import { useEffect } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { useRouter, usePathname } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, isAuthLoading } = useAppSelector((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthLoading, token, router, pathname]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner size="md" label="Loading Adorio..." />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
