import { describe, expect, it } from 'vitest';
import { compileExpr, evalExpr, exprVariables } from '../src/expr';

describe('expression engine', () => {
  it('respects precedence and parentheses', () => {
    expect(evalExpr('1 + 2 * 3', {})).toBe(7);
    expect(evalExpr('(1 + 2) * 3', {})).toBe(9);
    expect(evalExpr('2 ^ 3 ^ 2', {})).toBe(512);
    expect(evalExpr('-2 ^ 2', {})).toBe(-4);
    expect(evalExpr('10 / 4', {})).toBe(2.5);
  });

  it('reads variables and functions', () => {
    expect(evalExpr('gauss(temp, 37, 5)', { temp: 37 })).toBe(1);
    expect(evalExpr('sig(x, 0, 1)', { x: 0 })).toBe(0.5);
    expect(evalExpr('sat(s, 2)', { s: 2 })).toBe(0.5);
    expect(evalExpr('clamp(x, 0, 10)', { x: 50 })).toBe(10);
    expect(evalExpr('step(x - 5, 1, 0)', { x: 6 })).toBe(1);
    expect(evalExpr('max(1, 2, 3)', {})).toBe(3);
  });

  it('divides by zero safely', () => {
    expect(evalExpr('1 / x', { x: 0 })).toBe(0);
  });

  it('rejects unsafe or malformed input', () => {
    expect(() => compileExpr('process.exit()')).toThrow();
    expect(() => compileExpr('alert(1)')).toThrow(/Unknown function/);
    expect(() => compileExpr('1 +')).toThrow();
    expect(() => evalExpr('y + 1', {})).toThrow(/Unknown variable/);
  });

  it('lists variables', () => {
    expect(exprVariables('100 * gauss(temp, 37, 8) * sat(light, 20) + pi').sort()).toEqual([
      'light',
      'temp',
    ]);
  });
});
