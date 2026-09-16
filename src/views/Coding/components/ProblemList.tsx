import { useMemo, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { getSortedProblems } from '../problems';
import { DIFFICULTY_CHIP_CLASS } from '../constants/enums';
import type { Problem } from '../types';

interface ProblemListProps {
  classLabel: string;
  problems: Problem[];
  activeProblemId: string | null;
  solvedIds: Set<string>;
  onProblemSelect: (problemId: string) => void;
}

const ProblemList = ({
  classLabel,
  problems,
  activeProblemId,
  solvedIds,
  onProblemSelect,
}: ProblemListProps) => {
  const [hardestFirst, setHardestFirst] = useState(false);

  const sortedProblems = useMemo(
    () => getSortedProblems(hardestFirst, { problems }),
    [problems, hardestFirst],
  );

  const solvedCount = problems.filter((p) => solvedIds.has(p.id)).length;

  return (
    <div className="rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-4 shadow-[3px_4px_0_rgba(60,44,24,.16)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
          {classLabel} &middot; {solvedCount}/{problems.length} solved
        </p>
        <button
          onClick={() => setHardestFirst((v) => !v)}
          className="flex shrink-0 items-center gap-0.5 rounded-[2px] p-1 text-[var(--paper-muted)] transition-colors hover:text-[var(--paper-accent)]"
          title={hardestFirst ? 'Sorted hard to easy' : 'Sorted easy to hard'}
          aria-label={hardestFirst ? 'Sort easy to hard' : 'Sort hard to easy'}
        >
          {hardestFirst ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronUpIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <ul className="space-y-2">
        {sortedProblems.map((problem) => {
          const isActive = problem.id === activeProblemId;
          const solved = solvedIds.has(problem.id);
          return (
            <li key={problem.id}>
              <button
                onClick={() => onProblemSelect(problem.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`block w-full rounded-[3px] border-[1.5px] px-3.5 py-2.5 text-left transition-[transform,box-shadow] ${
                  isActive
                    ? 'border-[var(--paper-ink)] bg-[var(--paper-yellow-soft)] shadow-[2px_3px_0_var(--paper-ink)]'
                    : 'border-[rgba(60,44,24,.3)] bg-[var(--paper-cream)] hover:-translate-y-px hover:shadow-[2px_3px_0_rgba(60,44,24,.35)]'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[14.5px] font-bold leading-snug text-[var(--paper-ink)]">
                    {problem.title}
                  </span>
                  {solved && (
                    <span aria-hidden="true" className="shrink-0 text-[15px] text-[#4f6b2b]">
                      &#10003;
                    </span>
                  )}
                </span>
                <span
                  className={`mt-1.5 inline-block rounded-[2px] px-[7px] py-[2px] font-paper-mono text-[10px] font-bold uppercase tracking-[.1em] ${
                    DIFFICULTY_CHIP_CLASS[problem.difficulty] ?? 'bg-[var(--paper-yellow-soft)]'
                  }`}
                >
                  {problem.difficulty}
                  {solved && <span className="sr-only"> — solved</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProblemList;
