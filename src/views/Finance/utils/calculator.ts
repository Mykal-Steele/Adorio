// Small recursive-descent evaluator for the calculator modal's expression
// strings (e.g. "12+(3×4)%"). Deliberately not `eval`/`Function` — this
// parses a fixed, known grammar instead of running arbitrary JS.
type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: '+' | '−' | '×' | '÷' }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'percent' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j += 1;
      tokens.push({ type: 'num', value: Number(expr.slice(i, j)) });
      i = j;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
    } else if (ch === ')') {
      tokens.push({ type: 'rparen' });
    } else if (ch === '%') {
      tokens.push({ type: 'percent' });
    } else if (ch === '+' || ch === '−' || ch === '×' || ch === '÷') {
      tokens.push({ type: 'op', value: ch });
    } else {
      throw new Error(`Unexpected character: ${ch}`);
    }
    i += 1;
  }
  return tokens;
}

// Auto-closes any unmatched "(" so pressing "=" mid-expression still works,
// the way most calculator apps behave.
function autoClose(expr: string): string {
  const opens = (expr.match(/\(/g) || []).length;
  const closes = (expr.match(/\)/g) || []).length;
  return expr + ')'.repeat(Math.max(0, opens - closes));
}

export function evaluateExpression(rawExpression: string): number {
  const tokens = tokenize(autoClose(rawExpression));
  if (tokens.length === 0) throw new Error('Empty expression');
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  const peekOp = (): ('+' | '−' | '×' | '÷') | null => {
    const token = peek();
    return token?.type === 'op' ? token.value : null;
  };

  // A "bare" percent term — a single factor like "15%" with nothing else
  // multiplied into it — means something different depending on where it
  // sits. Next to +/- it reads the financial way ("500 − 15%" is 500 minus
  // 15% *of 500*, i.e. a discount), so that case is resolved against the
  // running total instead of taken literally. Everywhere else (multiplied,
  // parenthesized, or standalone) it's just the literal fraction.
  interface Term {
    value: number;
    isBarePercent: boolean;
  }

  function parseExpression(): number {
    let value = parseTerm().value;
    let op = peekOp();
    while (op === '+' || op === '−') {
      consume();
      const rhs = parseTerm();
      const delta = rhs.isBarePercent ? value * rhs.value : rhs.value;
      value = op === '+' ? value + delta : value - delta;
      op = peekOp();
    }
    return value;
  }

  function parseTerm(): Term {
    const first = parseUnary();
    let op = peekOp();
    if (op !== '×' && op !== '÷') return first;

    let value = first.value;
    while (op === '×' || op === '÷') {
      consume();
      const rhs = parseUnary();
      value = op === '×' ? value * rhs.value : value / rhs.value;
      op = peekOp();
    }
    return { value, isBarePercent: false };
  }

  function parseUnary(): Term {
    if (peekOp() === '−') {
      consume();
      const inner = parseUnary();
      return { value: -inner.value, isBarePercent: false };
    }
    return parsePostfix();
  }

  function parsePostfix(): Term {
    let value = parsePrimary();
    let sawPercent = false;
    while (peek()?.type === 'percent') {
      consume();
      value /= 100;
      sawPercent = true;
    }
    return { value, isBarePercent: sawPercent };
  }

  function parsePrimary(): number {
    const token = peek();
    if (!token) throw new Error('Unexpected end of expression');
    if (token.type === 'num') {
      consume();
      return token.value;
    }
    if (token.type === 'lparen') {
      consume();
      const value = parseExpression();
      const closing = consume();
      if (closing?.type !== 'rparen') throw new Error('Missing closing parenthesis');
      return value;
    }
    throw new Error(`Unexpected token: ${token.type}`);
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new Error('Unexpected trailing tokens');
  if (!Number.isFinite(result)) throw new Error('Division by zero');
  return result;
}
