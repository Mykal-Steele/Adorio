'use client';

import { useEffect, useRef, useState } from 'react';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Renders a Cloudflare Turnstile widget and hands the token up on solve. The
 * script is injected once and shared; each mount renders its own widget.
 */
export default function TurnstileWidget({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Kept in a ref so re-renders of the parent (which passes an inline callback)
  // don't tear down and re-render the widget.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);
  // The script can fail to load (an ad blocker, a flaky connection). Without saying so the
  // form would just sit there with no way to upload.
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fail = () => {
      if (!cancelled) setFailed(true);
    };

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (token: string) => onTokenRef.current(token),
        'error-callback': () => onTokenRef.current(''),
        'expired-callback': () => onTokenRef.current(''),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      // A script tag left over from a failed attempt never fires load again, so retries
      // start from a fresh one
      document.querySelector(`script[src="${SCRIPT_SRC}"][data-failed]`)?.remove();
      const script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (script) {
        script.addEventListener('load', render);
        script.addEventListener('error', fail);
      } else {
        const el = document.createElement('script');
        el.src = SCRIPT_SRC;
        el.async = true;
        el.defer = true;
        el.addEventListener('load', render);
        el.addEventListener('error', () => {
          el.dataset.failed = 'true';
          fail();
        });
        document.head.appendChild(el);
      }
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, attempt]);

  if (failed) {
    return (
      <p className="text-center text-sm text-[#7a2f29]">
        The bot check didn&apos;t load, so uploads can&apos;t start. An ad blocker can cause this.{' '}
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setAttempt((n) => n + 1);
          }}
          className="font-bold underline underline-offset-[3px]"
        >
          Try again
        </button>
      </p>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}
