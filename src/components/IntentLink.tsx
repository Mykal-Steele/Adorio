'use client';

import Link, { useLinkStatus } from 'next/link';
import { useState, type ComponentProps, type ReactNode } from 'react';

// A Link that fetches the whole page, server data included, as soon as someone shows
// they're about to open it: pointer over it, keyboard focus, or a finger touching it.
// Static pages are fully prefetched once they scroll into view anyway. This matters for
// dynamic ones like /social, where the default prefetch only gets the loading shell.
// onlyOnIntent skips the on-screen prefetch, for long lists where most links won't be used.
export function IntentLink({
  onlyOnIntent = false,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: ComponentProps<typeof Link> & { onlyOnIntent?: boolean }) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={intent ? true : onlyOnIntent ? false : null}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
    />
  );
}

// Renders with the pending state of the Link it sits in, so a clicked link can look
// active right away while its page is still on the way
export function LinkPending({ children }: { children: (pending: boolean) => ReactNode }) {
  const { pending } = useLinkStatus();
  return <>{children(pending)}</>;
}
