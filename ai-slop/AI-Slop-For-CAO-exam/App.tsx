
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { QuestionView } from './components/QuestionView';
import { ChatPanel } from './components/ChatPanel';
import { EXAM_DATA } from './constants';
import { Problem } from './types';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(EXAM_DATA[0].problems[0]);
  const [isDark, setIsDark] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden font-sans relative">
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-4 right-4 z-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <Sidebar 
        topics={EXAM_DATA}
        selectedProblemId={selectedProblem.id}
        onSelectProblem={setSelectedProblem}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 flex relative">
        <QuestionView problem={selectedProblem} />
        <ChatPanel 
          context={`Problem: ${selectedProblem.title}\nType: ${selectedProblem.type}\nContent: ${selectedProblem.content}\nSolution: ${selectedProblem.solution}`} 
          problemTitle={selectedProblem.title}
          selectedProblem={selectedProblem}
        />
      </main>
    </div>
  );
}

export default App;
