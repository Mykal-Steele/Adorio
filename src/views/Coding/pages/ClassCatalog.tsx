'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PaperTornEdge from '../../../components/PaperTornEdge';
import { getClasses } from '../constants/classes';
import { getProblemsByClass } from '../problems';
import { isProblemSolved } from '../utils/progress';

const LANGUAGE_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  java: 'Java',
};

const ROTATIONS = ['rotate-[-0.6deg]', 'rotate-[0.5deg]', 'rotate-[-0.4deg]', 'rotate-[0.7deg]'];

const ClassCatalog = () => {
  const classes = getClasses();
  // Solved counts read localStorage — computed after mount so the server-rendered
  // HTML (no access to localStorage) matches the client's first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
            hands-on practice
          </p>
          <h1 className="font-paper-serif text-[clamp(38px,6vw,58px)] font-bold leading-[1.02] tracking-[-.02em]">
            Practice problems
          </h1>
          <p className="mt-3.5 max-w-[56ch] text-[17px] leading-[1.62] text-[var(--paper-muted)]">
            Pick a class below. Each one is a set of problems in its own language, written and
            graded right in the browser.
          </p>
        </div>
      </section>

      <main className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2">
          {classes.map((cls, i) => {
            const problems = getProblemsByClass(cls.id);
            const solvedCount = mounted ? problems.filter(isProblemSolved).length : 0;
            const languages = Array.from(
              new Set(problems.flatMap((p) => Object.keys(p.languages))),
            );

            return (
              <Link
                key={cls.id}
                href={`/coding/${cls.id}`}
                className={`group relative block rounded-[3px] bg-[var(--paper-cream)] p-[clamp(22px,3vw,30px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)] transition-transform hover:-translate-y-1 ${ROTATIONS[i % ROTATIONS.length]}`}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-3 left-7 h-[24px] w-24 rotate-[-3deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
                />

                <h2 className="font-paper-serif text-[26px] font-bold">{cls.name}</h2>
                {cls.description && (
                  <p className="mt-2 text-[15px] leading-[1.55] text-[var(--paper-muted)]">
                    {cls.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-paper-mono text-[11px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                  <span>{problems.length} problems</span>
                  <span>{languages.map((l) => LANGUAGE_LABEL[l] ?? l).join(' / ')}</span>
                  {mounted && (
                    <span className="text-[var(--paper-accent)]">
                      {solvedCount}/{problems.length} solved
                    </span>
                  )}
                </div>

                <span className="mt-5 inline-flex -rotate-[0.6deg] items-center gap-1.5 rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-5 py-2 font-paper-mono text-[13px] font-bold uppercase tracking-[.1em] shadow-[3px_4px_0_var(--paper-ink)] transition-transform group-hover:-translate-y-px">
                  Start practicing
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ClassCatalog;
