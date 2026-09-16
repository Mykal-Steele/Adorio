import { Fragment } from 'react';
import { DIFFICULTY_CHIP_CLASS } from '../constants/enums';
import RichText, { RichInline } from './RichText';
import type { Problem } from '../types';

interface ProblemDetailsProps {
  problem: Problem;
}

const ProblemDetails = ({ problem }: ProblemDetailsProps) => (
  <section
    aria-labelledby="problem-h"
    className="relative -rotate-[0.25deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(20px,2.6vw,30px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]"
  >
    <span
      aria-hidden="true"
      className="absolute -top-3 left-7 h-[24px] w-24 -rotate-[3deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
    />

    <div className="flex flex-wrap items-center gap-3">
      <h2 id="problem-h" className="font-paper-serif text-[26px] font-bold">
        {problem.title}
      </h2>
      <span
        className={`rounded-[2px] px-[9px] py-[3px] font-paper-mono text-[11px] font-bold uppercase tracking-[.12em] ${
          DIFFICULTY_CHIP_CLASS[problem.difficulty] ?? 'bg-[var(--paper-yellow-soft)]'
        }`}
      >
        {problem.difficulty}
      </span>
    </div>

    <div className="mt-3 max-w-[68ch] text-[15.5px] leading-[1.6] text-[var(--paper-muted)]">
      <RichText text={problem.description} />
    </div>

    {problem.constraints && problem.constraints.length > 0 && (
      <div className="mt-5">
        <p className="mb-2 font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
          Constraints
        </p>
        <ul className="flex flex-col gap-1.5">
          {problem.constraints.map((constraint) => (
            <li key={constraint} className="flex items-start gap-2.5 text-sm leading-[1.5]">
              <span
                aria-hidden="true"
                className="mt-[3px] grid h-[15px] w-[15px] shrink-0 place-items-center rounded-[2px] border border-[var(--paper-ink)] bg-[var(--paper-yellow-soft)] text-[9px] font-bold"
              >
                &#10003;
              </span>
              <RichInline text={constraint} />
            </li>
          ))}
        </ul>
      </div>
    )}

    {problem.examples && problem.examples.length > 0 && (
      <div className="mt-5">
        <p className="mb-2 font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
          Examples
        </p>
        <div className="overflow-x-auto rounded-[2px] border border-[var(--paper-line)]">
          <table className="w-full border-collapse font-paper-mono text-[13px] leading-[1.6]">
            <thead>
              <tr className="bg-[#f6f0df]">
                <th className="border-b border-r border-[var(--paper-line)] p-2.5 text-left text-[11px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                  Input
                </th>
                <th className="border-b border-[var(--paper-line)] p-2.5 text-left text-[11px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                  Expected Output
                </th>
              </tr>
            </thead>
            <tbody>
              {problem.examples.map((example, index) => {
                const rowBg =
                  index % 2 === 1 ? 'bg-[var(--paper-cream)]' : 'bg-[var(--paper-hero)]';
                return (
                  <Fragment key={`${example.input}-${index}`}>
                    <tr className={rowBg}>
                      <td className="whitespace-pre-wrap border-b border-r border-[var(--paper-line)] p-2.5 align-top">
                        {example.input}
                      </td>
                      <td className="whitespace-pre-wrap border-b border-[var(--paper-line)] p-2.5 align-top">
                        {example.output}
                      </td>
                    </tr>
                    {example.explanation && (
                      <tr className={rowBg}>
                        <td
                          colSpan={2}
                          className="whitespace-normal border-b border-[var(--paper-line)] p-2.5 font-paper-sans text-[13px] italic text-[var(--paper-muted)]"
                        >
                          <RichInline text={example.explanation} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </section>
);

export default ProblemDetails;
