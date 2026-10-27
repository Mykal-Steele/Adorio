import type { Completion, CompletionContext } from '@codemirror/autocomplete';
import { snippetCompletion } from '@codemirror/autocomplete';

// no language server here, so just the dozen constructs people actually type
const defineSnippets = (entries: Array<[string, string, string]>): Completion[] =>
  entries.map(([label, detail, template]) =>
    snippetCompletion(template, { label, detail, type: 'snippet', boost: 2 }),
  );

const JAVA_SNIPPETS = defineSnippets([
  ['sout', 'print line', 'System.out.println(${x});'],
  ['fori', 'indexed for loop', 'for (int ${i} = 0; ${i} < ${n}; ${i}++) {\n  ${}\n}'],
  ['for', 'enhanced for loop', 'for (${Type} ${item} : ${collection}) {\n  ${}\n}'],
  ['if', 'if statement', 'if (${condition}) {\n  ${}\n}'],
  ['while', 'while loop', 'while (${condition}) {\n  ${}\n}'],
  ['main', 'main method', 'public static void main(String[] args) {\n  ${}\n}'],
  ['class', 'class block', 'public class ${Name} {\n  ${}\n}'],
  ['scanner', 'stdin scanner', 'Scanner ${sc} = new Scanner(System.in);'],
  ['try', 'try-catch', 'try {\n  ${}\n} catch (${Exception} ${e}) {\n  ${}\n}'],
]);

const JS_SNIPPETS = defineSnippets([
  ['clog', 'log to console', 'console.log(${x});'],
  ['for', 'indexed for loop', 'for (let ${i} = 0; ${i} < ${n}; ${i}++) {\n  ${}\n}'],
  ['forof', 'for-of loop', 'for (const ${item} of ${collection}) {\n  ${}\n}'],
  ['if', 'if statement', 'if (${condition}) {\n  ${}\n}'],
  ['while', 'while loop', 'while (${condition}) {\n  ${}\n}'],
  ['func', 'function', 'function ${name}(${args}) {\n  ${}\n}'],
  ['arrow', 'arrow function', '(${args}) => {\n  ${}\n}'],
  ['class', 'class block', 'class ${Name} {\n  ${}\n}'],
]);

// only while typing a word, or on Ctrl+Space with nothing typed
const snippetSourceFor = (snippets: Completion[]) => (context: CompletionContext) => {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return { from: word.from, options: snippets, validFor: /^\w*$/ };
};

export const javaSnippetSource = snippetSourceFor(JAVA_SNIPPETS);
export const jsSnippetSource = snippetSourceFor(JS_SNIPPETS);
