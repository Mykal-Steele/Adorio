// Both engine implementations (CodeMirrorEditor, MonacoEditor) expose this
// same imperative surface so the shared header (CodeEditor.tsx) can trigger
// a format without knowing which engine is actually mounted.
export interface EditorHandle {
  format: () => void;
}

export interface EditorEngineProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  problemTitle: string;
}
