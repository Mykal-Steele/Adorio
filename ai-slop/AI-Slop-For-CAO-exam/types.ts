
export interface CheatSheetStep {
  label: string;
  formula?: string;
  explanation: string;
}

export interface Definition {
  term: string;
  definition: string;
}

export interface Problem {
  id: string;
  title: string;
  type: 'problem' | 'note';
  content: string;
  definitions: Definition[]; // shown before the problem
  solution: string;
  cheatSheet: CheatSheetStep[];
}

export interface Topic {
  id: string;
  title: string;
  problems: Problem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
