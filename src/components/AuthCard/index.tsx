import React from 'react';
import Link from 'next/link';

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
    <div className="paper-theme min-h-screen">
      <svg
        viewBox="0 0 1200 36"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="block h-[20px] w-full"
      >
        <path
          fill="#fdfaf3"
          d="M0,0 H1200 V14 L1186,20 L1177,12 L1160,24 L1149,16 L1137,27 L1128,15 L1112,21 L1098,11 L1086,25 L1071,17 L1063,29 L1049,19 L1034,13 L1020,23 L1008,16 L994,26 L979,14 L968,21 L954,11 L939,24 L927,18 L913,28 L899,15 L884,22 L872,12 L857,25 L843,17 L828,30 L816,20 L801,13 L788,23 L774,16 L760,27 L745,14 L733,21 L718,11 L704,24 L690,18 L677,29 L662,20 L648,13 L634,23 L620,15 L606,26 L591,19 L578,12 L563,22 L549,16 L535,28 L520,21 L507,14 L493,24 L478,17 L464,30 L450,20 L436,12 L421,23 L408,16 L394,26 L379,19 L366,13 L352,22 L337,15 L323,27 L309,21 L295,14 L280,24 L266,17 L252,29 L238,20 L224,12 L209,23 L196,16 L182,25 L167,19 L154,13 L140,22 L126,15 L112,26 L98,20 L84,14 L69,24 L55,17 L41,28 L27,21 L13,15 L0,22 Z"
        />
      </svg>

      <main className="px-4 pb-[clamp(56px,7vw,88px)] pt-[clamp(10px,2vw,24px)] sm:px-8">
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
