import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';

// The Java mode (@codemirror/legacy-modes) only tokenizes for syntax
// highlighting — it has no notion of the standard library, so without this
// nothing after `autocompletion()` ever suggests System, Scanner, etc. This
// is a curated static list (what a beginner actually needs for stdin/stdout
// practice problems), not a real language server — it won't know local
// variable types or give signature help. A real Java IntelliSense would mean
// running an actual language server (e.g. Eclipse JDT LS) and wiring it in
// over LSP, which is a much larger project than an editor tweak.
export const JAVA_KEYWORD_LABELS = [
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
];
const KEYWORDS = JAVA_KEYWORD_LABELS.map((label): Completion => ({ label, type: 'keyword' }));

export const JAVA_TYPE_LABELS = [
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
  'StringJoiner',
  'Deque',
  'ArrayDeque',
  'Queue',
  'PriorityQueue',
  'Exception',
  'RuntimeException',
  'Comparator',
  'Iterator',
  'Optional',
  'Math',
  'Arrays',
  'Collections',
  'System',
];
const TYPES = JAVA_TYPE_LABELS.map((label): Completion => ({ label, type: 'class' }));

// Dot-completion for the handful of classes practice problems actually reach
// for — matched by the literal receiver text, not real type tracking.
// detail/info give the VSCode-style signature + doc panel.
export interface MemberDoc {
  label: string;
  detail?: string;
  info?: string;
}

const membersOf = (type: string, boost: number, docs: MemberDoc[]): Completion[] =>
  docs.map(({ label, detail, info }) => ({ label, type, detail, info, boost }));

// Raw docs, shared with the Monaco completion provider (constants/javaCompletionsMonaco.ts)
// so the two engines suggest the same members instead of drifting apart. The
// CodeMirror-specific `type`/`boost` metadata is layered on below, per key.
export const JAVA_MEMBER_DOCS: Record<string, MemberDoc[]> = {
  System: [
    {
      label: 'out',
      detail: 'PrintStream',
      info: 'Standard output — out.println(...) prints a line.',
    },
    { label: 'err', detail: 'PrintStream', info: 'Standard error stream.' },
    { label: 'in', detail: 'InputStream', info: 'Standard input stream.' },
    {
      label: 'exit',
      detail: 'exit(int status)',
      info: 'Terminates the JVM with the given status code.',
    },
    {
      label: 'currentTimeMillis',
      detail: 'currentTimeMillis() : long',
      info: 'Current time in milliseconds since the epoch.',
    },
    {
      label: 'arraycopy',
      detail: 'arraycopy(src, srcPos, dest, destPos, length)',
      info: 'Copies a range of array elements.',
    },
    {
      label: 'getProperty',
      detail: 'getProperty(String key) : String',
      info: 'Gets the system property for the given key.',
    },
  ],
  Math: [
    { label: 'abs', detail: 'abs(int a) : int', info: 'Absolute value.' },
    { label: 'max', detail: 'max(a, b)', info: 'The greater of two values.' },
    { label: 'min', detail: 'min(a, b)', info: 'The smaller of two values.' },
    { label: 'pow', detail: 'pow(double a, double b) : double', info: 'a raised to the power b.' },
    { label: 'sqrt', detail: 'sqrt(double a) : double', info: 'Square root.' },
    { label: 'floor', detail: 'floor(double a) : double', info: 'Rounds down.' },
    { label: 'ceil', detail: 'ceil(double a) : double', info: 'Rounds up.' },
    { label: 'round', detail: 'round(double a) : long', info: 'Rounds to the nearest integer.' },
    { label: 'random', detail: 'random() : double', info: 'Random double in [0, 1).' },
    { label: 'PI', detail: 'double', info: 'The ratio of a circle.' },
    { label: 'E', detail: 'double', info: "Euler's number." },
  ],
  Integer: [
    {
      label: 'parseInt',
      detail: 'parseInt(String s) : int',
      info: 'Parses the string as a signed decimal integer.',
    },
    { label: 'valueOf', detail: 'valueOf(String s) : Integer', info: 'Returns an Integer object.' },
    {
      label: 'toString',
      detail: 'toString(int i) : String',
      info: 'String representation of the integer.',
    },
    { label: 'compare', detail: 'compare(int x, int y) : int', info: 'Compares two ints.' },
    { label: 'MAX_VALUE', detail: 'int', info: 'Largest possible int: 2147483647.' },
    { label: 'MIN_VALUE', detail: 'int', info: 'Smallest possible int: -2147483648.' },
  ],
  String: [
    { label: 'valueOf', detail: 'valueOf(Object o) : String' },
    { label: 'format', detail: 'format(String fmt, Object... args) : String' },
    { label: 'join', detail: 'join(CharSequence delim, ...) : String' },
  ],
  Arrays: [
    { label: 'sort', detail: 'sort(int[] a)', info: 'Sorts the array ascending.' },
    {
      label: 'asList',
      detail: 'asList(T... a) : List<T>',
      info: 'Fixed-size list view of the array.',
    },
    { label: 'toString', detail: 'toString(int[] a) : String' },
    { label: 'fill', detail: 'fill(int[] a, int val)', info: 'Fills every element with val.' },
    { label: 'copyOf', detail: 'copyOf(int[] a, int len) : int[]' },
    {
      label: 'binarySearch',
      detail: 'binarySearch(int[] a, int key) : int',
      info: 'Index of key in a sorted array, or negative if absent.',
    },
  ],
  Collections: [
    { label: 'sort', detail: 'sort(List<T> list)', info: 'Sorts the list ascending.' },
    { label: 'reverse', detail: 'reverse(List<?> list)' },
    { label: 'max', detail: 'max(Collection<T> c) : T' },
    { label: 'min', detail: 'min(Collection<T> c) : T' },
    { label: 'emptyList', detail: 'emptyList() : List<T>' },
    { label: 'unmodifiableList', detail: 'unmodifiableList(List<T> l) : List<T>' },
    { label: 'shuffle', detail: 'shuffle(List<?> list)' },
  ],
  out: [
    {
      label: 'println',
      detail: 'println(String x) : void',
      info: 'Prints a line to standard output.',
    },
    { label: 'print', detail: 'print(String x) : void', info: 'Prints without a newline.' },
    { label: 'printf', detail: 'printf(String fmt, Object... args)', info: 'Formatted print.' },
  ],
};

// CodeMirror-shaped completions layered from the raw docs above — 'out'
// (instance method calls) ranks above the class-level statics.
const MEMBER_KIND: Record<string, { type: string; boost: number }> = {
  out: { type: 'method', boost: 2 },
};
const MEMBERS: Record<string, Completion[]> = Object.fromEntries(
  Object.entries(JAVA_MEMBER_DOCS).map(([receiver, docs]) => {
    const { type, boost } = MEMBER_KIND[receiver] ?? { type: 'function', boost: 1 };
    return [receiver, membersOf(receiver === 'System' ? 'property' : type, boost, docs)];
  }),
);

// There's no type checker here, so `foo.` can't know whether `foo` is a
// String, a StringBuilder, or a List, so this is the instance-method surface
// people actually type on local variables, offered for any receiver that
// isn't a known class name above (matching real Java would need a language
// server, not a static list).
export const JAVA_INSTANCE_FALLBACK_LABELS = [
  'length',
  'charAt',
  'substring',
  'indexOf',
  'lastIndexOf',
  'contains',
  'startsWith',
  'endsWith',
  'equals',
  'equalsIgnoreCase',
  'compareTo',
  'trim',
  'strip',
  'split',
  'replace',
  'replaceAll',
  'toUpperCase',
  'toLowerCase',
  'toCharArray',
  'toString',
  'isEmpty',
  'isBlank',
  'hashCode',
  'append',
  'insert',
  'deleteCharAt',
  'reverse',
  'add',
  'addAll',
  'addFirst',
  'addLast',
  'remove',
  'removeFirst',
  'removeLast',
  'get',
  'set',
  'size',
  'peek',
  'peekFirst',
  'peekLast',
  'poll',
  'pollFirst',
  'pollLast',
  'push',
  'pop',
  'put',
  'getOrDefault',
  'containsKey',
  'containsValue',
  'keySet',
  'values',
  'entrySet',
  'forEach',
  'stream',
  'iterator',
  'next',
  'hasNext',
];
const INSTANCE_FALLBACK: Completion[] = JAVA_INSTANCE_FALLBACK_LABELS.map(
  (label): Completion => ({ label, type: 'method' }),
);

const TOP_LEVEL = [...KEYWORDS, ...TYPES];

export const javaCompletionSource = (context: CompletionContext): CompletionResult | null => {
  const dotMatch = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*\.\w*/);
  if (dotMatch) {
    const dotIndex = dotMatch.text.lastIndexOf('.');
    const receiver = dotMatch.text.slice(0, dotIndex);
    const members = MEMBERS[receiver] ?? INSTANCE_FALLBACK;
    return {
      from: dotMatch.from + dotIndex + 1,
      options: members,
      validFor: /^\w*$/,
    };
  }

  const word = context.matchBefore(/\w+/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return {
    from: word.from,
    options: TOP_LEVEL,
    validFor: /^\w*$/,
  };
};
