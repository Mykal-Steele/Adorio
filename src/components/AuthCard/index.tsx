import React from 'react';
import Link from 'next/link';
import PaperTornEdge from '../PaperTornEdge';

type AuthMode = 'signup' | 'signin';

const COPY: Record<AuthMode, { eyebrow: string; heading: string; blurb: string; note: string }> = {
  signup: {
    eyebrow: 'New account',
    heading: 'Make yourself an account',
    blurb: 'Some things here need to know who you are. Sign up once and they all will.',
    note: 'takes about a minute',
  },
  signin: {
    eyebrow: 'Welcome back',
    heading: 'Pick up where you left off',
    blurb: 'Everything you left open is still open.',
    note: 'good to see you',
  },
};

const CHECKLIST = [
  'One email and password, nothing else needed',
  'Your posts, likes, and progress are saved for you',
  'Delete your account any time — just ask',
];

const ROTATIONS = ['rotate-[-3deg]', 'rotate-[2deg]', 'rotate-[-2deg]'];

type AuthCardProps = {
  mode: AuthMode;
  redirectQuery: string;
  formTitle: string;
  children: React.ReactNode;
};

const AuthCard = ({ mode, redirectQuery, formTitle, children }: AuthCardProps) => {
  const copy = COPY[mode];
  const isSignup = mode === 'signup';

  return (
    <div className="paper-theme flex min-h-[calc(100vh-56px)] flex-col sm:min-h-[calc(100vh-64px)]">
      <PaperTornEdge />

      <main className="flex flex-1 items-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-[clamp(32px,5vw,64px)] lg:grid-cols-2">
          <div>
            <p className="mb-3.5 inline-flex items-center gap-[10px] font-paper-mono text-xs uppercase tracking-[.2em] text-[#3d382f]">
              <span aria-hidden="true" className="h-0.5 w-[22px] bg-[var(--paper-accent)]" />
              {copy.eyebrow}
            </p>
            <h1 className="font-paper-serif text-[clamp(40px,5.8vw,62px)] font-bold leading-[1.02] tracking-[-.025em]">
              {copy.heading}
            </h1>
            <p className="mt-4 max-w-[38ch] text-lg leading-[1.62] text-[#3a352d]">{copy.blurb}</p>

            <ul className="mt-[clamp(26px,3.5vw,36px)] flex max-w-[36ch] flex-col gap-3.5">
              {CHECKLIST.map((item, i) => (
                <li key={item} className="flex items-start gap-3 text-base leading-[1.5]">
                  <span
                    aria-hidden="true"
                    className={`mt-[3px] grid h-[19px] w-[19px] shrink-0 place-items-center rounded-[2px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] text-xs font-bold ${ROTATIONS[i % ROTATIONS.length]}`}
                  >
                    &#10003;
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-[clamp(26px,3.5vw,34px)] rotate-[-1deg] font-paper-hand text-2xl font-bold leading-[1.25]">
              {copy.note}
            </p>
          </div>

          <section
            aria-labelledby="auth-h"
            className="relative rotate-[-0.4deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(24px,3vw,38px)] shadow-[0_20px_34px_-16px_rgba(60,44,24,.4),0_2px_0_rgba(60,44,24,.1)]"
          >
            <span
              aria-hidden="true"
              className="absolute -top-3 left-[30px] h-[26px] w-[92px] rotate-[-3.5deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
            />

            <div className="mb-0.5 flex items-end gap-1.5">
              <Link
                href={`/register${redirectQuery}`}
                aria-current={isSignup ? 'page' : undefined}
                className={`relative rotate-[-1deg] rounded-t-[9px] border border-b-0 px-5 pb-3 pt-[10px] text-[15px] font-bold ${
                  isSignup
                    ? 'border-[rgba(60,44,24,.26)] bg-[var(--paper-cream)] text-[var(--paper-ink)]'
                    : 'border-[rgba(60,44,24,.22)] bg-[#ecdfc8] text-[var(--paper-muted)]'
                }`}
              >
                {isSignup && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[6px] left-[10px] right-[10px] h-[9px] rounded-[2px_6px_3px_7px] bg-[var(--paper-yellow)]"
                  />
                )}
                <span className="relative">Sign up</span>
              </Link>
              <Link
                href={`/login${redirectQuery}`}
                aria-current={!isSignup ? 'page' : undefined}
                className={`relative rotate-[1.2deg] rounded-t-[9px] border border-b-0 px-5 pb-3 pt-[10px] text-[15px] font-bold ${
                  !isSignup
                    ? 'border-[rgba(60,44,24,.26)] bg-[var(--paper-cream)] text-[var(--paper-ink)]'
                    : 'border-[rgba(60,44,24,.22)] bg-[#ecdfc8] text-[var(--paper-muted)]'
                }`}
              >
                {!isSignup && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[6px] left-[10px] right-[10px] h-[9px] rounded-[2px_6px_3px_7px] bg-[var(--paper-yellow)]"
                  />
                )}
                <span className="relative">Sign in</span>
              </Link>
            </div>
            <div aria-hidden="true" className="paper-dashed-rule h-0.5" />

            <h2 id="auth-h" className="mt-[22px] font-paper-serif text-[27px] font-bold">
              {formTitle}
            </h2>

            {children}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AuthCard;
