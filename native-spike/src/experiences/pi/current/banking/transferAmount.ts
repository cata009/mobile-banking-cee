/** Exact editing model used by Source InternalTransferScreen (quote policy stays canonical). */
export const OPERATOR_RE = /[+\-*/]/;
export const TRAILING_OPERATOR_RE = /[+\-*/]$/;
export function evaluateTransferExpression(expression: string): number {
  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (
    !tokens ||
    tokens.length === 0 ||
    TRAILING_OPERATOR_RE.test(expression.trim())
  )
    return Number.NaN;
  const prioritized: Array<number | string> = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token === undefined) return Number.NaN;
    if (token === '*' || token === '/') {
      const left = Number(prioritized[prioritized.length - 1]),
        right = Number(tokens[index + 1]);
      if (
        Number.isNaN(left) ||
        Number.isNaN(right) ||
        (token === '/' && right === 0)
      )
        return Number.NaN;
      prioritized[prioritized.length - 1] =
        token === '*' ? left * right : left / right;
      index++;
    } else prioritized.push(token);
  }
  let result = Number(prioritized[0]);
  if (Number.isNaN(result)) return Number.NaN;
  for (let index = 1; index < prioritized.length; index += 2) {
    const operator = prioritized[index],
      right = Number(prioritized[index + 1]);
    if (typeof operator !== 'string' || Number.isNaN(right)) return Number.NaN;
    result = operator === '+' ? result + right : result - right;
  }
  return result;
}
export const calculatedTransferAmount = (amount: number) =>
  (Math.round(amount * 100) / 100)
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1');
export function appendTransferToken(expression: string, token: string) {
  const last = expression.slice(-1);
  if (OPERATOR_RE.test(token) && OPERATOR_RE.test(last))
    return `${expression.slice(0, -1)}${token}`;
  if (OPERATOR_RE.test(token) && expression.length === 0) return expression;
  if (/^\d$/.test(token) && (expression.match(/\d/g) ?? []).length >= 10)
    return expression;
  const operand = expression.split(OPERATOR_RE).at(-1) ?? '';
  if (token === '.' && operand.includes('.')) return expression;
  return `${expression}${token === '.' && operand.length === 0 ? '0.' : token}`;
}
