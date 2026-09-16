// Minimal brace-aware formatter for the practice editor. Java and JS are
// both brace languages, so one implementation covers both. This is not a
// parser: it only normalizes leading indentation from bracket depth and
// trims trailing whitespace, leaving everything else byte-identical.
// Braces inside strings, template literals, and comments are skipped when
// counting so they never shift indentation.
export const formatCode = (code: string): string => {
  const INDENT = '  ';
  const lines = code.replace(/\t/g, INDENT).split('\n');

  let depth = 0;
  let inBlockComment = false;
  let inTemplate = false;

  const formatted = lines.map((raw) => {
    const line = raw.replace(/[ \t]+$/, '');
    if (line.trim() === '') return '';

    // A line in the middle of a multi-line template literal is string
    // content — re-indenting it would change the program's value.
    const verbatim = inTemplate;

    let opens = 0;
    let closes = 0;
    let leadingCloses = 0;
    let seenCode = false;
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1] ?? '';

      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false;
          i++;
        }
        continue;
      }
      if (inSingle || inDouble || inTemplate) {
        if (ch === '\\') {
          i++;
          continue;
        }
        if (inSingle && ch === "'") inSingle = false;
        else if (inDouble && ch === '"') inDouble = false;
        else if (inTemplate && ch === '`') inTemplate = false;
        seenCode = true;
        continue;
      }
      if (ch === '/' && next === '/') break;
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        seenCode = true;
        i++;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        if (ch === "'") inSingle = true;
        else if (ch === '"') inDouble = true;
        else inTemplate = true;
        seenCode = true;
        continue;
      }
      if (ch === '{' || ch === '(' || ch === '[') {
        opens++;
        seenCode = true;
        continue;
      }
      if (ch === '}' || ch === ')' || ch === ']') {
        closes++;
        if (!seenCode) leadingCloses++;
        continue;
      }
      if (!/\s/.test(ch)) seenCode = true;
    }

    if (verbatim) return line;
    const indent = Math.max(0, depth - leadingCloses);
    depth = Math.max(0, depth + opens - closes);
    return INDENT.repeat(indent) + line.trimStart();
  });

  return formatted.join('\n');
};
