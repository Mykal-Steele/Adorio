'use client';

import type { ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';

// Renders signedIn or signedOut without the logged-out version flashing on refresh.
// Until the session check finishes (which includes the server render), both render and
// CSS shows one based on the data-auth flag the head script in layout.tsx sets before
// first paint. After the check, only the right one renders, so nothing moves.
export function AuthSwitch({ signedIn, signedOut }: { signedIn: ReactNode; signedOut: ReactNode }) {
  const { token, isAuthLoading } = useAppSelector((state) => state.user);

  if (!isAuthLoading) return <>{token ? signedIn : signedOut}</>;

  return (
    <>
      <div className="auth-in contents">{signedIn}</div>
      <div className="auth-out contents">{signedOut}</div>
    </>
  );
}
