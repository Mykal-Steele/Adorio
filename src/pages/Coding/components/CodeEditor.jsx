import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';

/**
 * Code Editor Component
 * Single responsibility: Handle code editing
 */
const CodeEditor = ({ code, onChange, height = '360px' }) => {
  const extensions = [
    javascript({ jsx: false }),
    autocompletion({ activateOnTyping: true }),
    closeBrackets(),
  ];

  return (
    <div className='bg-gray-900/70 border border-gray-800 rounded-xl shadow-lg overflow-hidden'>
      <div className='border-b border-gray-800 px-4 py-3 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-gray-300 uppercase tracking-wide'>
          Editor
        </h3>
        <span className='text-xs text-gray-500'>JavaScript</span>
      </div>
      <CodeMirror
        value={code}
        height={height}
        theme={tokyoNight}
        extensions={extensions}
        basicSetup={{
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
          lineNumbers: true,
        }}
        onChange={onChange}
      />
    </div>
  );
};

export default CodeEditor;
