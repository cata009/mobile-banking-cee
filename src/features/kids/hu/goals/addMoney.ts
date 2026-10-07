import { HU_KIDS_ACCOUNTS } from '@/data/huKidsBanking'
import type { ScheduleConfig } from '@/data/schedule'
const OPERATOR_RE = /[+\-*/]/
const TRAILING_OPERATOR_RE = /[+\-*/]$/
const DIGIT_RE = /^\d$/

export function evaluateExpression(expression: string): number {
  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/]/g)
  if (!tokens || tokens.length === 0) return NaN
  if (TRAILING_OPERATOR_RE.test(expression.trim())) return NaN

  // First pass: resolve multiplication and division left to right.
  const pass1: Array<number | string> = []
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (token === undefined) return NaN
    if (token === '*' || token === '/') {
      const left = Number(pass1[pass1.length - 1])
      const right = Number(tokens[i + 1])
      if (Number.isNaN(left) || Number.isNaN(right)) return NaN
      pass1[pass1.length - 1] = token === '*' ? left * right : right === 0 ? NaN : left / right
      i += 1
    } else {
      pass1.push(token)
    }
  }

  // Second pass: resolve addition and subtraction left to right.
  let result = Number(pass1[0])
  if (Number.isNaN(result)) return NaN
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i]
    const right = Number(pass1[i + 1])
    if (typeof op !== 'string' || Number.isNaN(right)) return NaN
    result = op === '+' ? result + right : result - right
  }
  return result
}

export type HuAddMoneyState = {
  expression: string
  selectedAccountId: string
  sheet: 'account' | 'schedule' | null
  schedule: ScheduleConfig | null
}
export type HuAddMoneyEvent =
  | { type: 'token'; token: string }
  | { type: 'backspace' | 'evaluate' }
  | { type: 'sheet'; sheet: HuAddMoneyState['sheet'] }
  | { type: 'account'; accountId: string }
  | { type: 'schedule'; schedule: ScheduleConfig | null }
export function createHuAddMoneyState(): HuAddMoneyState {
  return { expression: '', selectedAccountId: HU_KIDS_ACCOUNTS[0].id, sheet: null, schedule: null }
}
export function huAddMoneyReducer(state: HuAddMoneyState, event: HuAddMoneyEvent): HuAddMoneyState {
  switch (event.type) {
    case 'token': {
      const current = state.expression,
        token = event.token,
        last = current.slice(-1)
      if (OPERATOR_RE.test(token) && OPERATOR_RE.test(last))
        return { ...state, expression: current.slice(0, -1) + token }
      if (OPERATOR_RE.test(token) && !current.length) return state
      if (DIGIT_RE.test(token) && (current.match(/\d/g) ?? []).length >= 10) return state
      return { ...state, expression: current + token }
    }
    case 'backspace':
      return { ...state, expression: state.expression.slice(0, -1) }
    case 'evaluate': {
      const result = selectHuAddMoney(state).evaluated
      return Number.isFinite(result) ? { ...state, expression: String(Math.floor(result)) } : state
    }
    case 'sheet':
      return { ...state, sheet: event.sheet }
    case 'schedule':
      return { ...state, schedule: event.schedule }
    case 'account':
      return HU_KIDS_ACCOUNTS.some((account) => account.id === event.accountId)
        ? { ...state, selectedAccountId: event.accountId, sheet: null }
        : state
  }
}
export function selectHuAddMoney(state: HuAddMoneyState) {
  const { expression } = state
  const selectedAccount =
    HU_KIDS_ACCOUNTS.find((account) => account.id === state.selectedAccountId) ?? HU_KIDS_ACCOUNTS[0]
  const hasOperator = OPERATOR_RE.test(expression)
  const rawEvaluated = evaluateExpression(expression)
  // Clamp negative results to 0 — "Add money" never accepts a negative amount.
  const evaluated = Number.isFinite(rawEvaluated) ? Math.max(0, Math.floor(rawEvaluated)) : rawEvaluated
  const amount = hasOperator ? evaluated : Math.max(0, Math.floor(Number(expression) || 0))
  // Insufficient funds: entered amount exceeds the selected account balance.
  const exceedsBalance = amount > selectedAccount.balance
  const canSubmit = Number.isFinite(amount) && amount > 0 && !exceedsBalance
  // Whether the user has typed any digit yet — drives the presets↔operators
  // strip swap above the keypad.
  const hasAmount = expression.length > 0
  // Whether the expression is complete enough to show a live result
  // (operator present, not trailing, evaluates to a finite number).
  const isComplete = hasOperator && !TRAILING_OPERATOR_RE.test(expression) && Number.isFinite(evaluated)

  // Pretty-print the raw expression tokens: * → ×, / → ÷, - → −.
  const expressionDisplay = expression.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')

  // The amount display always stays on one line. Start at 48px and shrink
  // step-by-step as the displayed text grows, so long numbers never overflow.
  const displayText =
    hasOperator && isComplete ? `${expressionDisplay}=${evaluated}` : hasAmount ? expressionDisplay : '0'
  const amountFontSize =
    displayText.length <= 6
      ? 48
      : displayText.length <= 8
        ? 40
        : displayText.length <= 10
          ? 34
          : displayText.length <= 12
            ? 28
            : 24

  return {
    selectedAccount,
    hasOperator,
    evaluated,
    amount,
    exceedsBalance,
    canSubmit,
    hasAmount,
    isComplete,
    expressionDisplay,
    amountFontSize,
  }
}
