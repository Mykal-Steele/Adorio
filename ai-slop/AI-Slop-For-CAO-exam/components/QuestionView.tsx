
import React, { useState } from 'react';
import { Problem } from '../types';
import { Eye, EyeOff, Lightbulb, CheckCircle2, FileText, Info } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface QuestionViewProps {
  problem: Problem;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ problem }) => {
  const [showSolution, setShowSolution] = useState(false);

  React.useEffect(() => {
    setShowSolution(false);
  }, [problem.id]);

  const isNote = problem.type === 'note';

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-gray-900 p-12 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto pb-20">
        
        {/* Article Header */}
        <div className="border-b border-gray-300 dark:border-gray-600 pb-4 mb-8">
          <h1 className="text-4xl font-serif font-bold text-black dark:text-white mb-2">{problem.title}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-4">
            <span>Type: {isNote ? 'Concept Note' : 'Practice Problem'}</span>
            <span>ID: {problem.id}</span>
          </div>
        </div>

        {/* Key Concepts / Definitions */}
        {problem.definitions && problem.definitions.length > 0 && (
          <div className="mb-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-sm">
            <h3 className="font-serif text-lg font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              Key Concepts
            </h3>
            <ul className="space-y-2">
              {problem.definitions.map((def, idx) => (
                <li key={idx} className="text-sm leading-relaxed">
                  <span className="font-bold text-gray-900 dark:text-gray-100">{def.term}:</span> <span className="text-gray-700 dark:text-gray-300">{def.definition}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Main Content */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold mb-4 border-b border-gray-200 pb-1">Question</h2>
          <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-sm shadow-sm text-lg leading-relaxed font-serif text-gray-800 dark:text-gray-200">
            {problem.content.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        </div>

        {/* Cheat Sheet (Wikipedia Infobox Style) */}
        {!isNote && problem.cheatSheet && problem.cheatSheet.length > 0 && (
          <div className="float-right ml-6 mb-6 w-72 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-4 text-sm shadow-sm">
            <div className="font-bold text-center border-b border-gray-300 pb-2 mb-2 bg-gray-200 dark:bg-gray-700 -mx-4 -mt-4 p-2">
              Quick Reference
            </div>
            <div className="space-y-4">
              {problem.cheatSheet.map((step, idx) => (
                <div key={idx}>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 mb-1">{step.label}</h4>
                  {step.formula && (
                    <code className="block bg-gray-100 dark:bg-gray-700 p-1 mb-1 font-mono text-xs border border-gray-200 text-center">
                      {step.formula}
                    </code>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-snug">{step.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution Section */}
        {!isNote && (
          <div className="clear-both mt-12">
            <h2 className="font-serif text-2xl font-bold mb-4 border-b border-gray-200 pb-1 flex justify-between items-end">
              Solution
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-sm font-sans font-normal text-blue-600 hover:underline flex items-center gap-1"
              >
                {showSolution ? 'Hide' : 'Show'}
              </button>
            </h2>

            {showSolution ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 border-l-4 border-blue-500 text-gray-800 dark:text-gray-200 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <p className='mb-4'>{children}</p>,
                    h4: ({ children }) => <h4 className='font-bold mt-6 mb-2 text-black dark:text-white text-lg'>{children}</h4>,
                    strong: ({ children }) => <strong className='font-bold'>{children}</strong>,
                    ul: ({ children }) => <ul className='list-disc list-inside mb-4 space-y-1'>{children}</ul>,
                    ol: ({ children }) => <ol className='list-decimal list-inside mb-4 space-y-1'>{children}</ol>,
                    li: ({ children }) => <li className='ml-4'>{children}</li>,
                    code: ({ children }) => (
                      <code className='bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-sm font-mono'>
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className='bg-gray-200 dark:bg-gray-600 p-3 rounded my-2 overflow-x-auto'>
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {problem.solution}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-12 text-center border border-gray-200 border-dashed text-gray-500 italic">
                Solution is hidden. Try to solve it first based on the concepts above.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
