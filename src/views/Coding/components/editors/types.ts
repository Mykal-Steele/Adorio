// both engines expose this so CodeEditor.tsx can format without caring which is mounted
export interface EditorHandle {
  format: () => void;
}

export interface EditorEngineProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  problemTitle: string;
}
