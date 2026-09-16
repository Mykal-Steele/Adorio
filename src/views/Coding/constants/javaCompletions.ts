import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';

// The Java mode (@codemirror/legacy-modes) only tokenizes for syntax
// highlighting — it has no notion of the standard library, so without this
// nothing after `autocompletion()` ever suggests System, Scanner, etc. This
// is a curated static list (what a beginner actually needs for stdin/stdout
// practice problems), not a real language server — it won't know local
// variable types or give signature help. A real Java IntelliSense would mean
// running an actual language server (e.g. Eclipse JDT LS) and wiring it in
// over LSP, which is a much larger project than an editor tweak.
const KEYWORDS = [
  'abstract',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extends',
  'final',
  'finally',
  'float',
  'for',
  'if',
  'implements',
  'import',
  'instanceof',
  'int',
  'interface',
  'long',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'throws',
  'true',
  'false',
  'try',
  'void',
  'while',
].map((label): Completion => ({ label, type: 'keyword' }));

const TYPES = [
  'String',
  'Integer',
  'Long',
  'Double',
  'Float',
  'Boolean',
  'Character',
  'Object',
  'Scanner',
  'ArrayList',
  'LinkedList',
  'List',
  'Map',
  'HashMap',
  'TreeMap',
  'Set',
  'HashSet',
  'TreeSet',
  'StringBuilder',
  'StringBuffer',
  'Exception',
  'RuntimeException',
  'Comparator',
  'Iterator',
  'Optional',
  'Math',
  'Arrays',
  'Collections',
  'System',
].map((label): Completion => ({ label, type: 'class' }));

// Dot-completion for the handful of classes practice problems actually reach
// for — matched by the literal receiver text, not real type tracking.
const MEMBERS: Record<string, Completion[]> = {
  System: ['out', 'err', 'in', 'exit', 'currentTimeMillis', 'arraycopy', 'getProperty'].map(
    (label): Completion => ({ label, type: 'property' }),
  ),
  Math: ['abs', 'max', 'min', 'pow', 'sqrt', 'floor', 'ceil', 'round', 'random', 'PI', 'E'].map(
    (label): Completion => ({ label, type: 'function' }),
  ),
  Integer: ['parseInt', 'valueOf', 'toString', 'compare', 'MAX_VALUE', 'MIN_VALUE'].map(
    (label): Completion => ({ label, type: 'function' }),
  ),
  String: ['valueOf', 'format', 'join'].map((label): Completion => ({ label, type: 'function' })),
  Arrays: ['sort', 'asList', 'toString', 'fill', 'copyOf', 'binarySearch'].map(
    (label): Completion => ({ label, type: 'function' }),
  ),
  Collections: ['sort', 'reverse', 'max', 'min', 'emptyList', 'unmodifiableList', 'shuffle'].map(
    (label): Completion => ({ label, type: 'function' }),
  ),
  out: ['println', 'print', 'printf'].map((label): Completion => ({ label, type: 'method' })),
};

const TOP_LEVEL = [...KEYWORDS, ...TYPES];

export const javaCompletionSource = (context: CompletionContext): CompletionResult | null => {
  const dotMatch = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*\.\w*/);
  if (dotMatch) {
    const dotIndex = dotMatch.text.lastIndexOf('.');
    const receiver = dotMatch.text.slice(0, dotIndex);
    const members = MEMBERS[receiver];
    if (members) {
      return {
        from: dotMatch.from + dotIndex + 1,
        options: members,
        validFor: /^\w*$/,
      };
    }
  }

  const word = context.matchBefore(/\w+/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: TOP_LEVEL,
    validFor: /^\w*$/,
  };
};
