// Java's convention (and every starter template in problems.ts) is 4 spaces
// per level; this app's JS templates are 2. Both editor engines' live
// indentation already keys off this per language (see CodeMirrorEditor's
// indentUnit and MonacoEditor's TAB_SIZE) — formatCode has to match, or
// pressing Format would immediately re-indent Java back down to 2 spaces
// and undo that consistency.
export const INDENT_WIDTH_BY_LANGUAGE: Record<string, number> = { java: 4 };
const DEFAULT_INDENT_WIDTH = 2;

// Minimal brace-aware formatter for the practice editor. Java and JS are
// both brace languages, so one implementation covers both. This is not a
// parser: it only normalizes leading indentation from bracket depth and
// trims trailing whitespace, leaving everything else byte-identical.
// Braces inside strings, template literals, and comments are skipped when
// counting so they never shift indentation.
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

// Maps a cursor offset in `oldText` to the equivalent offset in `newText`
// after `formatCode` ran. formatCode never adds/removes lines — it only
// rewrites leading indentation (tabs -> spaces, brace-depth indent) and
// trims trailing whitespace — so the cursor's line number is stable and
// only its column needs adjusting by the indent delta. A cursor sitting in
// (or at the end of) the old indent lands at the corresponding spot in the
// new indent; a cursor in the code keeps its offset within the code. This
// is what keeps Enter-auto-format from snapping the cursor to 0 the way a
// bare whole-doc replace does.
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
