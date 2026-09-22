import type * as Monaco from 'monaco-editor';

// Monaco's own equivalent of constants/snippets.ts, using Monaco's
// `$1`/`$0` snippet placeholder syntax instead of CodeMirror's `${x}`.
const JAVA_SNIPPETS: Array<[string, string, string]> = [
  ['sout', 'print line', 'System.out.println($1);'],
  ['fori', 'indexed for loop', 'for (int $1 = 0; $1 < $2; $1++) {\n\t$0\n}'],
  ['for', 'enhanced for loop', 'for ($1 $2 : $3) {\n\t$0\n}'],
  ['if', 'if statement', 'if ($1) {\n\t$0\n}'],
  ['while', 'while loop', 'while ($1) {\n\t$0\n}'],
  ['main', 'main method', 'public static void main(String[] args) {\n\t$0\n}'],
  ['class', 'class block', 'public class $1 {\n\t$0\n}'],
  ['scanner', 'stdin scanner', 'Scanner $1 = new Scanner(System.in);'],
  ['try', 'try-catch', 'try {\n\t$1\n} catch ($2 $3) {\n\t$0\n}'],
];

const JS_SNIPPETS: Array<[string, string, string]> = [
  ['clog', 'log to console', 'console.log($1);'],
  ['for', 'indexed for loop', 'for (let $1 = 0; $1 < $2; $1++) {\n\t$0\n}'],
  ['forof', 'for-of loop', 'for (const $1 of $2) {\n\t$0\n}'],
  ['if', 'if statement', 'if ($1) {\n\t$0\n}'],
  ['while', 'while loop', 'while ($1) {\n\t$0\n}'],
  ['func', 'function', 'function $1($2) {\n\t$0\n}'],
  ['arrow', 'arrow function', '($1) => {\n\t$0\n}'],
  ['class', 'class block', 'class $1 {\n\t$0\n}'],
];

const buildSuggestions = (
  monaco: typeof Monaco,
  entries: Array<[string, string, string]>,
  range: Monaco.IRange,
): Monaco.languages.CompletionItem[] =>
  entries.map(([label, detail, template]) => ({
    label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: template,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail,
    range,
  }));

export function registerSnippets(monaco: typeof Monaco, language: 'java' | 'javascript') {
  const entries = language === 'java' ? JAVA_SNIPPETS : JS_SNIPPETS;
  return monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range: Monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return { suggestions: buildSuggestions(monaco, entries, range) };
    },
  });
}
