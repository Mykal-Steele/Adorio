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
  Character: [
    {
      label: 'isDigit',
      detail: 'isDigit(char ch) : boolean',
      info: "True if ch's category is DECIMAL_DIGIT_NUMBER.",
    },
    { label: 'isLetter', detail: 'isLetter(char ch) : boolean' },
    { label: 'isLetterOrDigit', detail: 'isLetterOrDigit(char ch) : boolean' },
    { label: 'isUpperCase', detail: 'isUpperCase(char ch) : boolean' },
    { label: 'isLowerCase', detail: 'isLowerCase(char ch) : boolean' },
    { label: 'isAlphabetic', detail: 'isAlphabetic(int codePoint) : boolean' },
    { label: 'isWhitespace', detail: 'isWhitespace(char ch) : boolean' },
    { label: 'toUpperCase', detail: 'toUpperCase(char ch) : char' },
    { label: 'toLowerCase', detail: 'toLowerCase(char ch) : char' },
    {
      label: 'getNumericValue',
      detail: 'getNumericValue(char ch) : int',
      info: "The digit value of ch, e.g. '7' -> 7, or -1/-2 if it has none.",
    },
    { label: 'compare', detail: 'compare(char x, char y) : int' },
    { label: 'valueOf', detail: 'valueOf(char c) : Character' },
  ],
  Boolean: [
    {
      label: 'parseBoolean',
      detail: 'parseBoolean(String s) : boolean',
      info: 'True only if s equals "true", ignoring case.',
    },
    { label: 'valueOf', detail: 'valueOf(String s) : Boolean' },
    { label: 'compare', detail: 'compare(boolean x, boolean y) : int' },
    { label: 'toString', detail: 'toString(boolean b) : String' },
    { label: 'TRUE', detail: 'Boolean', info: 'The Boolean instance representing true.' },
    { label: 'FALSE', detail: 'Boolean', info: 'The Boolean instance representing false.' },
  ],
  Double: [
    { label: 'parseDouble', detail: 'parseDouble(String s) : double' },
    { label: 'valueOf', detail: 'valueOf(String s) : Double' },
    { label: 'toString', detail: 'toString(double d) : String' },
    { label: 'compare', detail: 'compare(double x, double y) : int' },
    { label: 'isNaN', detail: 'isNaN(double v) : boolean' },
    { label: 'isInfinite', detail: 'isInfinite(double v) : boolean' },
    { label: 'MAX_VALUE', detail: 'double' },
    { label: 'MIN_VALUE', detail: 'double' },
  ],
  Long: [
    { label: 'parseLong', detail: 'parseLong(String s) : long' },
    { label: 'valueOf', detail: 'valueOf(String s) : Long' },
    { label: 'toString', detail: 'toString(long l) : String' },
    { label: 'compare', detail: 'compare(long x, long y) : int' },
    { label: 'MAX_VALUE', detail: 'long', info: '9223372036854775807' },
    { label: 'MIN_VALUE', detail: 'long', info: '-9223372036854775808' },
  ],
  Float: [
    { label: 'parseFloat', detail: 'parseFloat(String s) : float' },
    { label: 'valueOf', detail: 'valueOf(String s) : Float' },
    { label: 'toString', detail: 'toString(float f) : String' },
    { label: 'compare', detail: 'compare(float x, float y) : int' },
    { label: 'MAX_VALUE', detail: 'float' },
    { label: 'MIN_VALUE', detail: 'float' },
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
// Scanner, a String, a StringBuilder, or a List — so this is the instance-
// method surface people actually type on local variables, offered for any
// receiver that isn't a known class name above (matching real Java would
// need a language server, not a static list). This is also why Scanner's
// methods live here rather than under a "Scanner" key in JAVA_MEMBER_DOCS —
// nobody ever types `Scanner.nextInt()` on the class itself, only on a
// variable like `sc.nextInt()`.
export const JAVA_INSTANCE_FALLBACK_DOCS: MemberDoc[] = [
  // Scanner
  { label: 'nextInt', detail: 'nextInt() : int', info: 'Reads the next token as an int.' },
  {
    label: 'nextLine',
    detail: 'nextLine() : String',
    info: 'Reads the rest of the current line (Scanner), or the next element (Iterator).',
  },
  {
    label: 'next',
    detail: 'next() : String',
    info: 'Scanner: next whitespace-delimited token. Iterator: next element.',
  },
  {
    label: 'nextDouble',
    detail: 'nextDouble() : double',
    info: 'Reads the next token as a double.',
  },
  { label: 'nextLong', detail: 'nextLong() : long', info: 'Reads the next token as a long.' },
  { label: 'nextFloat', detail: 'nextFloat() : float', info: 'Reads the next token as a float.' },
  { label: 'nextShort', detail: 'nextShort() : short', info: 'Reads the next token as a short.' },
  {
    label: 'nextBoolean',
    detail: 'nextBoolean() : boolean',
    info: 'Reads the next token as a boolean.',
  },
  {
    label: 'hasNext',
    detail: 'hasNext() : boolean',
    info: 'Scanner: another token is available. Iterator: another element is available.',
  },
  { label: 'hasNextInt', detail: 'hasNextInt() : boolean' },
  { label: 'hasNextLine', detail: 'hasNextLine() : boolean' },
  { label: 'hasNextDouble', detail: 'hasNextDouble() : boolean' },
  { label: 'close', detail: 'close() : void', info: 'Closes this Scanner/Closeable resource.' },
  // String / CharSequence
  { label: 'length', detail: 'length() : int' },
  { label: 'charAt', detail: 'charAt(int index) : char' },
  { label: 'substring', detail: 'substring(int begin[, int end]) : String' },
  { label: 'indexOf', detail: 'indexOf(String s) : int' },
  { label: 'lastIndexOf', detail: 'lastIndexOf(String s) : int' },
  { label: 'contains', detail: 'contains(CharSequence s) : boolean' },
  { label: 'startsWith', detail: 'startsWith(String prefix) : boolean' },
  { label: 'endsWith', detail: 'endsWith(String suffix) : boolean' },
  { label: 'equals', detail: 'equals(Object o) : boolean' },
  { label: 'equalsIgnoreCase', detail: 'equalsIgnoreCase(String s) : boolean' },
  { label: 'compareTo', detail: 'compareTo(String s) : int' },
  { label: 'compareToIgnoreCase', detail: 'compareToIgnoreCase(String s) : int' },
  { label: 'trim', detail: 'trim() : String' },
  { label: 'strip', detail: 'strip() : String' },
  { label: 'split', detail: 'split(String regex) : String[]' },
  { label: 'replace', detail: 'replace(CharSequence a, CharSequence b) : String' },
  { label: 'replaceAll', detail: 'replaceAll(String regex, String repl) : String' },
  { label: 'matches', detail: 'matches(String regex) : boolean' },
  { label: 'repeat', detail: 'repeat(int count) : String' },
  { label: 'concat', detail: 'concat(String s) : String' },
  { label: 'toUpperCase', detail: 'toUpperCase() : String' },
  { label: 'toLowerCase', detail: 'toLowerCase() : String' },
  { label: 'toCharArray', detail: 'toCharArray() : char[]' },
  { label: 'toString', detail: 'toString() : String' },
  { label: 'isEmpty', detail: 'isEmpty() : boolean' },
  { label: 'isBlank', detail: 'isBlank() : boolean' },
  { label: 'hashCode', detail: 'hashCode() : int' },
  // StringBuilder
  { label: 'append', detail: 'append(...) : StringBuilder' },
  { label: 'insert', detail: 'insert(int offset, ...) : StringBuilder' },
  { label: 'deleteCharAt', detail: 'deleteCharAt(int index) : StringBuilder' },
  { label: 'delete', detail: 'delete(int start, int end) : StringBuilder' },
  { label: 'reverse', detail: 'reverse() : StringBuilder' },
  { label: 'setLength', detail: 'setLength(int n) : void' },
  { label: 'capacity', detail: 'capacity() : int' },
  // Collections (List / Map / Set / Deque / Queue)
  { label: 'add', detail: 'add(E e) : boolean' },
  { label: 'addAll', detail: 'addAll(Collection<E> c) : boolean' },
  { label: 'addFirst', detail: 'addFirst(E e) : void' },
  { label: 'addLast', detail: 'addLast(E e) : void' },
  { label: 'remove', detail: 'remove(...) : boolean' },
  { label: 'removeFirst', detail: 'removeFirst() : E' },
  { label: 'removeLast', detail: 'removeLast() : E' },
  { label: 'get', detail: 'get(int index) : E' },
  { label: 'set', detail: 'set(int index, E e) : E' },
  { label: 'size', detail: 'size() : int' },
  { label: 'clear', detail: 'clear() : void' },
  { label: 'peek', detail: 'peek() : E' },
  { label: 'peekFirst', detail: 'peekFirst() : E' },
  { label: 'peekLast', detail: 'peekLast() : E' },
  { label: 'poll', detail: 'poll() : E' },
  { label: 'pollFirst', detail: 'pollFirst() : E' },
  { label: 'pollLast', detail: 'pollLast() : E' },
  { label: 'push', detail: 'push(E e) : void' },
  { label: 'pop', detail: 'pop() : E' },
  { label: 'put', detail: 'put(K key, V value) : V' },
  { label: 'getOrDefault', detail: 'getOrDefault(K key, V def) : V' },
  { label: 'putIfAbsent', detail: 'putIfAbsent(K key, V value) : V' },
  { label: 'containsKey', detail: 'containsKey(Object key) : boolean' },
  { label: 'containsValue', detail: 'containsValue(Object value) : boolean' },
  { label: 'keySet', detail: 'keySet() : Set<K>' },
  { label: 'values', detail: 'values() : Collection<V>' },
  { label: 'entrySet', detail: 'entrySet() : Set<Map.Entry<K,V>>' },
  { label: 'sort', detail: 'sort(Comparator<E> c) : void' },
  { label: 'forEach', detail: 'forEach(Consumer<E> action) : void' },
  { label: 'stream', detail: 'stream() : Stream<E>' },
  { label: 'iterator', detail: 'iterator() : Iterator<E>' },
];
const INSTANCE_FALLBACK: Completion[] = membersOf('method', 1, JAVA_INSTANCE_FALLBACK_DOCS);

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
