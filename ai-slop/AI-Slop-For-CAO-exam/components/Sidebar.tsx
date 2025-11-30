
import React from 'react';
import { Topic, Problem } from '../types';
import { BookOpen, ChevronRight, GraduationCap, ChevronLeft, Menu } from 'lucide-react';

interface SidebarProps {
  topics: Topic[];
  selectedProblemId: string | null;
  onSelectProblem: (problem: Problem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, selectedProblemId, onSelectProblem, isCollapsed, onToggleCollapse }) => {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto flex-shrink-0 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-72'
    }`}>
      <div className={`border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4 flex items-center justify-between'}`}>
        {!isCollapsed && (
          <h1 className="text-xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ArchMaster
          </h1>
        )}
        {isCollapsed && (
          <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      {!isCollapsed && (
        <div className="p-4">
          {topics.map((topic) => (
            <div key={topic.id} className="mb-8">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 px-2">
                {topic.title}
              </h2>
              <div className="space-y-0.5">
                {topic.problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => onSelectProblem(problem)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all flex items-center justify-between group ${
                      selectedProblemId === problem.id
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <span className="truncate">{problem.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
