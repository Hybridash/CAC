/**
 * A tiny, safe math expression engine so slider simulations can be described as data
 * (e.g. "100 * gauss(temp, 37, 8) * sig(ph, 5, 2)") without eval().
 *
 * Grammar: expr := term (('+'|'-') term)* ; term := unary (('*'|'/') unary)* ;
 * unary := '-' unary | power ; power := atom ('^' unary)? ;
 * atom := number | ident | ident '(' args ')' | '(' expr ')'
 */

type Node =
  | { t: 'num'; v: number }
  | { t: 'var'; name: string }
  | { t: 'neg'; a: Node }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { t: 'call'; fn: string; args: Node[] };

const FUNCS: Record<string, (...a: number[]) => number> = {
  min: Math.min,
  max: Math.max,
  abs: Math.abs,
  sqrt: (x) => Math.sqrt(Math.max(0, x)),
  exp: Math.exp,
  log: (x) => Math.log(Math.max(1e-12, x)),
  log10: (x) => Math.log10(Math.max(1e-12, x)),
  floor: Math.floor,
  round: Math.round,
  clamp: (x, lo, hi) => Math.min(hi, Math.max(lo, x)),
  /** Bell curve peaking at 1 when x = center. */
  gauss: (x, center, width) => Math.exp(-((x - center) ** 2) / (2 * width * width)),
  /** Logistic switch: 0 → 1 around mid. Negative steepness makes it fall. */
  sig: (x, mid, steepness) => 1 / (1 + Math.exp(-(x - mid) / steepness)),
  /** Saturating (Michaelis–Menten): x / (k + x). */
  sat: (x, k) => (x <= 0 ? 0 : x / (k + x)),
  /** 1 if cond > 0 else b. Handy for thresholds: step(x - 5, 1, 0). */
  step: (cond, a, b) => (cond > 0 ? a : b),
};

export const EXPR_FUNCTIONS = Object.keys(FUNCS);

const cache = new Map<string, Node>();

export function compileExpr(src: string): Node {
  const hit = cache.get(src);
  if (hit) return hit;
  const tokens = src.match(/\d*\.?\d+(?:e[+-]?\d+)?|[A-Za-z_][A-Za-z0-9_]*|[-+*/^(),]/g) ?? [];
  if (tokens.join('') !== src.replace(/\s+/g, '')) throw new Error(`Bad characters in "${src}"`);
  let i = 0;
  const peek = () => tokens[i];
  const take = (expected?: string) => {
    const tk = tokens[i++];
    if (expected && tk !== expected) throw new Error(`Expected "${expected}" in "${src}"`);
    if (tk === undefined) throw new Error(`Unexpected end of "${src}"`);
    return tk;
  };
  const expr = (): Node => {
    let a = term();
    while (peek() === '+' || peek() === '-') a = { t: 'bin', op: take() as '+', a, b: term() };
    return a;
  };
  const term = (): Node => {
    let a = unary();
    while (peek() === '*' || peek() === '/') a = { t: 'bin', op: take() as '*', a, b: unary() };
    return a;
  };
  const unary = (): Node => (peek() === '-' ? (take(), { t: 'neg', a: unary() }) : power());
  const power = (): Node => {
    const a = atom();
    if (peek() === '^') {
      take();
      return { t: 'bin', op: '^', a, b: unary() };
    }
    return a;
  };
  const atom = (): Node => {
    const tk = take();
    if (tk === '(') {
      const e = expr();
      take(')');
      return e;
    }
    if (/^\d|^\./.test(tk)) return { t: 'num', v: Number(tk) };
    if (/^[A-Za-z_]/.test(tk)) {
      if (peek() === '(') {
        if (!FUNCS[tk]) throw new Error(`Unknown function ${tk}() in "${src}"`);
        take('(');
        const args: Node[] = [];
        if (peek() !== ')') {
          args.push(expr());
          while (peek() === ',') {
            take();
            args.push(expr());
          }
        }
        take(')');
        return { t: 'call', fn: tk, args };
      }
      return { t: 'var', name: tk };
    }
    throw new Error(`Unexpected "${tk}" in "${src}"`);
  };
  const ast = expr();
  if (i !== tokens.length) throw new Error(`Unexpected "${tokens[i]}" in "${src}"`);
  cache.set(src, ast);
  return ast;
}

function run(n: Node, vars: Record<string, number>): number {
  switch (n.t) {
    case 'num':
      return n.v;
    case 'var':
      if (n.name === 'pi') return Math.PI;
      if (!(n.name in vars)) throw new Error(`Unknown variable "${n.name}"`);
      return vars[n.name];
    case 'neg':
      return -run(n.a, vars);
    case 'call':
      return FUNCS[n.fn](...n.args.map((a) => run(a, vars)));
    case 'bin': {
      const a = run(n.a, vars);
      const b = run(n.b, vars);
      switch (n.op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          return b === 0 ? 0 : a / b;
        case '^':
          return a ** b;
      }
    }
  }
}

export function evalExpr(src: string, vars: Record<string, number>): number {
  const v = run(compileExpr(src), vars);
  return Number.isFinite(v) ? v : 0;
}

/** Names of variables referenced by an expression (used to validate concept data). */
export function exprVariables(src: string): string[] {
  const out = new Set<string>();
  const walk = (n: Node) => {
    if (n.t === 'var' && n.name !== 'pi') out.add(n.name);
    if (n.t === 'neg') walk(n.a);
    if (n.t === 'bin') (walk(n.a), walk(n.b));
    if (n.t === 'call') n.args.forEach(walk);
  };
  walk(compileExpr(src));
  return [...out];
}
