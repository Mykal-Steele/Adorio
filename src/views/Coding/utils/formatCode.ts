// Java starters use 4 spaces, JS uses 2. Has to match the editors' indentUnit
// and TAB_SIZE or Format would knock Java back down to 2.
export const INDENT_WIDTH_BY_LANGUAGE: Record<string, number> = { java: 4 };
const DEFAULT_INDENT_WIDTH = 2;

// Not a parser. Only redoes leading indentation from bracket depth and trims
// trailing whitespace, works for Java and JS since both use braces. Braces in
// strings, template literals and comments don't count.
export const formatCode = (code: string, language?: string): string => {
  const INDENT = ' '.repeat(
    (language && INDENT_WIDTH_BY_LANGUAGE[language]) || DEFAULT_INDENT_WIDTH,
  );
  const lines = code.replace(/\t/g, INDENT).split('\n');

  let depth = 0;
  let inBlockComment = false;
  let inTemplate = false;

  const formatted = lines.map((raw) => {
    const line = raw.replace(/[ \t]+$/, '');
    if (line.trim() === '') return '';

    // inside a multi-line template literal, re-indenting would change the string
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

// formatCode never adds or removes lines, so the cursor keeps its line and
// only the column shifts by the indent change. Without this a whole-doc
// replace snaps the cursor to 0.
export const mapPosThroughFormat = (oldText: string, newText: string, pos: number): number => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  if (oldLines.length !== newLines.length) return Math.min(pos, newText.length);

  let oldStart = 0;
  let newStart = 0;
  for (let i = 0; i < oldLines.length; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    const oldEnd = oldStart + oldLine.length;

    if (pos <= oldEnd) {
      const col = pos - oldStart;
      const oldIndent = /^[ \t]*/.exec(oldLine)?.[0].length ?? 0;
      const newIndent = /^[ \t]*/.exec(newLine)?.[0].length ?? 0;
      let newCol: number;
      if (col <= oldIndent) {
        newCol = col === oldIndent ? newIndent : Math.min(col, newIndent);
      } else {
        newCol = newIndent + (col - oldIndent);
      }
      newCol = Math.max(0, Math.min(newCol, newLine.length));
      return newStart + newCol;
    }

    oldStart = oldEnd + 1;
    newStart += newLine.length + 1;
  }
  return Math.min(pos, newText.length);
};
