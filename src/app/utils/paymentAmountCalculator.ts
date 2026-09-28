const OPERATOR_RE = /[+\-*/]/
const TRAILING_OPERATOR_RE = /[+\-*/]$/

/** The payment keypad uses the same four-operation model as Kids Add money. */
export function evaluatePaymentExpression(expression: string): number {
  const normalized = expression.replace(/,/g, '.')
  const tokens = normalized.match(/\d+(?:\.\d+)?|[+\-*/]/g)
  if (!tokens?.length || tokens.join('') !== normalized || TRAILING_OPERATOR_RE.test(normalized)) return NaN

  const pass1: Array<number | string> = []
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (token === '*' || token === '/') {
      const left = Number(pass1[pass1.length - 1])
      const right = Number(tokens[index + 1])
      if (!Number.isFinite(left) || !Number.isFinite(right) || (token === '/' && right === 0)) return NaN
      pass1[pass1.length - 1] = token === '*' ? left * right : left / right
      index += 1
    } else if (token !== undefined) {
      pass1.push(token)
    }
  }

  let result = Number(pass1[0])
  for (let index = 1; index < pass1.length; index += 2) {
    const operator = pass1[index]
    const right = Number(pass1[index + 1])
    if (!Number.isFinite(result) || !Number.isFinite(right)) return NaN
    result = operator === '+' ? result + right : result - right
  }
  return Number.isFinite(result) ? Math.round((result + Number.EPSILON) * 100) / 100 : NaN
}

export function appendPaymentToken(current: string, token: string): string {
  const last = current.slice(-1)
  if (OPERATOR_RE.test(token)) {
    if (!current) return current
    return OPERATOR_RE.test(last) ? current.slice(0, -1) + token : current + token
  }
  if (token === ',') {
    const operand = current.split(OPERATOR_RE).at(-1) ?? ''
    if (operand.includes(',')) return current
    return current + (operand ? ',' : '0,')
  }
  if (!/^\d$/.test(token) || (current.match(/\d/g) ?? []).length >= 10) return current
  const operand = current.split(OPERATOR_RE).at(-1) ?? ''
  if (operand.includes(',') && operand.split(',')[1]!.length >= 2) return current
  if (operand === '0' && token !== '0') return current.slice(0, -1) + token
  return current + token
}

export function paymentAmountPresets(currency: string): number[] {
  if (currency === 'HUF' || currency === 'RSD') return [1000, 2500, 5000]
  if (currency === 'CZK') return [100, 500, 1000]
  if (currency === 'RON' || currency === 'BAM' || currency === 'PLN') return [50, 100, 250]
  return [10, 25, 50]
}
