import type * as Monaco from 'monaco-editor';
import {
  JAVA_INSTANCE_FALLBACK_DOCS,
  JAVA_KEYWORD_LABELS,
  JAVA_MEMBER_DOCS,
  JAVA_TYPE_LABELS,
  type MemberDoc,
} from './javaCompletions';

// Monaco's own equivalent of the CodeMirror provider in javaCompletions.ts —
// same curated data (imported, not re-typed), adapted to Monaco's
// CompletionItemProvider shape. See javaCompletions.ts for why this is a
// static list rather than a real language server.
export function registerJavaCompletions(monaco: typeof Monaco) {
  return monaco.languages.registerCompletionItemProvider('java', {
    triggerCharacters: ['.'],
    provideCompletionItems(model, position) {
      const line = model.getLineContent(position.lineNumber);
      const beforeCursor = line.slice(0, position.column - 1);

      const dotMatch = /([A-Za-z_][A-Za-z0-9_]*)\.(\w*)$/.exec(beforeCursor);
      if (dotMatch) {
        const [, receiver, partial] = dotMatch;
        const docs = JAVA_MEMBER_DOCS[receiver] ?? null;
        const range: Monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - partial.length,
          endColumn: position.column,
        };
        const suggestions = (docs ?? JAVA_INSTANCE_FALLBACK_DOCS).map((doc) =>
          memberToItem(monaco, doc, range),
        );
        return { suggestions };
      }

      const wordMatch = /\w*$/.exec(beforeCursor);
      const wordStart = position.column - (wordMatch?.[0].length ?? 0);
      const range: Monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordStart,
        endColumn: position.column,
      };
      const suggestions = [
        ...JAVA_KEYWORD_LABELS.map((label) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: label,
          range,
        })),
        ...JAVA_TYPE_LABELS.map((label) => ({
          label,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: label,
          range,
        })),
      ];
      return { suggestions };
    },
  });
}

function memberToItem(
  monaco: typeof Monaco,
  doc: MemberDoc,
  range: Monaco.IRange,
  kind: Monaco.languages.CompletionItemKind = monaco.languages.CompletionItemKind.Method,
): Monaco.languages.CompletionItem {
  return {
    label: doc.detail ? { label: doc.label, detail: `  ${doc.detail}` } : doc.label,
    kind,
    insertText: doc.label,
    detail: doc.detail,
    documentation: doc.info,
    range,
  };
}
