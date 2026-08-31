import { useState, type PointerEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { AppIcon } from '@/app/components/icons'
import PageHeader from '@/app/components/PageHeader'
import PrimaryButton from '@/app/components/PrimaryButton'
import { CurrencyFlagRoundel } from '@/app/components/payments/CurrencyFlag'
import { useCountry } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'
import { formatMoneyNumber } from '@/app/registry/countryConfig'
import { useProducts } from '@/hooks/useProducts'
import {
  createInternalTransferDraft,
  getEligibleTransferAccounts,
  getInternalTransferQuote,
  type InternalTransferAccount,
  type InternalTransferDraft,
} from '@/app/screens/payments/internalTransferState'

interface InternalTransferScreenProps {
  onBack: () => void
}

type PickerPosition = 'top' | 'bottom'
type TransferRole = 'source' | 'destination'
type CalculatorOperator = 'add' | 'subtract' | 'multiply' | 'divide'
const OPERATOR_RE = /[+\-*/]/
const TRAILING_OPERATOR_RE = /[+\-*/]$/
const DIGIT_RE = /^\d$/
const INTERNAL_TRANSFER_PRESETS = [1000, 2500, 5000] as const
const CALCULATOR_TOKENS: Record<CalculatorOperator, string> = {
  add: '+',
  subtract: '-',
  multiply: '*',
  divide: '/',
}

function evaluateExpression(expression: string): number {
  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/]/g)
  if (!tokens || tokens.length === 0 || TRAILING_OPERATOR_RE.test(expression.trim())) return Number.NaN

  const prioritized: Array<number | string> = []
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (token === undefined) return Number.NaN
    if (token === '*' || token === '/') {
      const left = Number(prioritized[prioritized.length - 1])
      const right = Number(tokens[index + 1])
      if (Number.isNaN(left) || Number.isNaN(right) || (token === '/' && right === 0)) return Number.NaN
      prioritized[prioritized.length - 1] = token === '*' ? left * right : left / right
      index += 1
    } else {
      prioritized.push(token)
    }
  }

  let result = Number(prioritized[0])
  if (Number.isNaN(result)) return Number.NaN
  for (let index = 1; index < prioritized.length; index += 2) {
    const operator = prioritized[index]
    const right = Number(prioritized[index + 1])
    if (typeof operator !== 'string' || Number.isNaN(right)) return Number.NaN
    result = operator === '+' ? result + right : result - right
  }
  return result
}

function formatCalculatedAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return rounded
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

function formatExpression(expression: string): string {
  return expression.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')
}

function formatSignedAmount(amount: number, currency: string, sign: '+' | '−'): string {
  return `${sign}${amount.toFixed(2)} ${currency}`
}

function formatBalance(account: InternalTransferAccount, country: CountryId): string {
  return `${formatMoneyNumber(account.balance, country)} ${account.currency}`
}

function AccountChooser({
  account,
  role,
  balance,
  onClick,
}: {
  account: InternalTransferAccount
  role: 'From' | 'To'
  balance: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={`${role} account ${account.name}, balance ${balance}`}
      onClick={onClick}
      className="grid min-h-[64px] w-full grid-cols-[36px_minmax(0,1fr)] items-center gap-[12px] rounded-[12px] px-[4px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
    >
      <CurrencyFlagRoundel currency={account.currency} size={36} />
      <span className="min-w-0">
        <span className="uc-type-n5 block text-[var(--uc-text-muted)]">{role}</span>
        <span className="flex min-w-0 items-center gap-[6px]">
          <span className="uc-type-h2 min-w-0 truncate text-[var(--uc-text)]">{account.name}</span>
          <span className="grid size-[20px] shrink-0 place-items-center" aria-hidden="true">
            <AppIcon name="chevron-down-wide" size={16} color="var(--uc-icon)" />
          </span>
        </span>
        <span className="uc-type-n5 mt-[2px] block truncate text-[var(--uc-text-muted)]">{balance}</span>
      </span>
    </button>
  )
}

function EditableAmount({
  value,
  currency,
  onChange,
  onFocus,
}: {
  value: string
  currency: string
  onChange: (value: string) => void
  onFocus: () => void
}) {
  const visibleCharacterCount = Math.max(1, Math.min(value.length || 1, 11))

  return (
    <div data-amount-editor className="mt-[8px] flex items-baseline gap-[6px] px-[4px]">
      <input
        type="text"
        inputMode="none"
        autoComplete="off"
        aria-label={`Amount in ${currency}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder="0"
        style={{ width: `${visibleCharacterCount}ch` }}
        className="min-w-[1ch] max-w-[calc(100%_-_56px)] bg-transparent text-[36px] font-bold leading-[40px] tabular-nums text-[var(--uc-text-muted)] outline-none placeholder:text-[var(--uc-text-subtle)]"
      />
      <span className="uc-type-h2 shrink-0 text-[var(--uc-text-muted)]">{currency}</span>
    </div>
  )
}

function QuotedAmount({
  amount,
  currency,
  sign,
  reduceMotion,
  onActivate,
}: {
  amount: number
  currency: string
  sign: '+' | '−'
  reduceMotion: boolean | null
  onActivate: () => void
}) {
  const isZero = amount === 0
  const visualSign = isZero ? '' : sign
  const visualAmount = isZero ? '0' : amount.toFixed(2)
  const accessibleAmount = `${visualSign}${visualAmount} ${currency}`

  return (
    <motion.button
      data-amount-editor
      type="button"
      key={`${currency}-${amount}`}
      initial={reduceMotion ? false : { opacity: 0.45, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label={`Enter amount in ${currency}`}
      onClick={onActivate}
      className="mt-[8px] flex items-baseline gap-[6px] rounded-[8px] px-[4px] text-left text-[36px] font-bold leading-[40px] text-[var(--uc-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      aria-live="polite"
    >
      <span aria-hidden="true">
        {visualSign}
        {visualAmount}
      </span>
      <span className="uc-type-h2" aria-hidden="true">
        {currency}
      </span>
      <span className="sr-only">{accessibleAmount}</span>
    </motion.button>
  )
}

function AccountPicker({
  pickerRole,
  accounts,
  blockedAccountId,
  selectedAccountId,
  onSelect,
  onClose,
}: {
  pickerRole: TransferRole
  accounts: InternalTransferAccount[]
  blockedAccountId: string
  selectedAccountId: string
  onSelect: (account: InternalTransferAccount) => void
  onClose: () => void
}) {
  const country = useCountry()
  const title = pickerRole === 'source' ? 'Choose source account' : 'Choose destination account'

  return (
    <BottomSheet title={title} onClose={onClose} closeLabel="Close account picker" showDragHandle className="pb-[24px]">
      <div className="flex flex-col gap-[8px]">
        {accounts
          .filter((account) => account.id !== blockedAccountId)
          .map((account) => {
            const selected = account.id === selectedAccountId
            return (
              <button
                key={account.id}
                type="button"
                aria-label={`${account.name}, ${formatBalance(account, country)}`}
                onClick={() => onSelect(account)}
                className={`grid min-h-[76px] w-full grid-cols-[40px_minmax(0,1fr)_24px] items-center gap-[12px] rounded-[12px] px-[12px] py-[10px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${
                  selected
                    ? 'bg-[var(--uc-action-soft)]'
                    : 'bg-[var(--uc-surface-muted)] hover:bg-[color-mix(in_srgb,var(--uc-action)_8%,var(--uc-surface-muted))]'
                }`}
              >
                <CurrencyFlagRoundel currency={account.currency} size={40} />
                <span className="min-w-0">
                  <span className="uc-type-h2 block truncate text-[var(--uc-text)]">{account.name}</span>
                  <span className="uc-type-n5 mt-[3px] block truncate text-[var(--uc-text-muted)]">
                    {account.accountNumber}
                  </span>
                  <span className="uc-type-n5 mt-[2px] block truncate text-[var(--uc-text-muted)]">
                    Available {formatBalance(account, country)}
                  </span>
                </span>
                {selected ? <AppIcon name="check" color="var(--uc-action)" /> : null}
              </button>
            )
          })}
      </div>
    </BottomSheet>
  )
}

function TransferSuccess({
  draft,
  sourceAccount,
  destinationAccount,
  onDone,
}: {
  draft: InternalTransferDraft
  sourceAccount: InternalTransferAccount
  destinationAccount: InternalTransferAccount
  onDone: () => void
}) {
  const reduceMotion = useReducedMotion()
  const quote = getInternalTransferQuote({
    amountText: draft.amountText,
    sourceAccount,
    destinationAccount,
  })

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-app-bg)] px-[24px] pb-[24px] pt-[54px] text-[var(--uc-text)]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.72, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 24 }}
          className="grid size-[80px] place-items-center rounded-full bg-[var(--uc-action-strong)] text-[var(--uc-static-white)] shadow-[0_14px_34px_rgb(var(--uc-shadow-rgb)/0.16)]"
          aria-hidden="true"
        >
          <AppIcon name="check" size={36} color="var(--uc-static-white)" strokeWidth={2.4} />
        </motion.div>
        <h1 className="uc-type-h1 mt-[28px] text-[var(--uc-text)]">Money moved</h1>
        <p className="mt-[12px] text-[36px] font-bold leading-[40px] text-[var(--uc-text)]">
          {quote.sourceAmount.toFixed(2)} {sourceAccount.currency}
        </p>
        <p className="uc-type-n4 mt-[12px] max-w-[280px] text-[var(--uc-text-muted)]">
          From {sourceAccount.name} to {destinationAccount.name}
        </p>
        {quote.isFx ? (
          <p className="uc-type-n4 mt-[8px] text-[var(--uc-action)]">
            {formatSignedAmount(quote.destinationAmount, destinationAccount.currency, '+')} received
          </p>
        ) : null}
      </div>
      <PrimaryButton onClick={onDone} className="w-full shrink-0" labelSize="18">
        Done
      </PrimaryButton>
    </div>
  )
}

function TransferScheduleSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: (date: string) => void }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)

  return (
    <BottomSheet title="Schedule transfer" onClose={onClose} closeLabel="Close schedule">
      <div className="flex flex-col gap-[18px] pb-[8px]">
        <label htmlFor="internal-transfer-date" className="uc-type-n4 text-[var(--uc-text)]">
          Transfer date
          <input
            aria-label="Transfer date"
            id="internal-transfer-date"
            type="date"
            min={today}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="uc-type-n4 mt-[8px] h-[52px] w-full rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-[var(--uc-text)]"
          />
        </label>
        <PrimaryButton className="w-full" onClick={() => onConfirm(date)}>
          Confirm date
        </PrimaryButton>
      </div>
    </BottomSheet>
  )
}

function AmountKeypad({
  hasValue,
  showOperators,
  canEvaluate,
  suggestions,
  onDigit,
  onDelete,
  onOperator,
  onEquals,
  onSuggestion,
}: {
  hasValue: boolean
  showOperators: boolean
  canEvaluate: boolean
  suggestions: ReadonlyArray<{ value: number; label: string }>
  onDigit: (digit: string) => void
  onDelete: () => void
  onOperator: (operator: CalculatorOperator) => void
  onEquals: () => void
  onSuggestion: (value: number) => void
}) {
  const operators: Array<{ value: CalculatorOperator; label: string; symbol: string }> = [
    { value: 'add', label: 'Add', symbol: '+' },
    { value: 'subtract', label: 'Subtract', symbol: '−' },
    { value: 'multiply', label: 'Multiply', symbol: '×' },
    { value: 'divide', label: 'Divide', symbol: '÷' },
  ]
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0']

  return (
    <div className="mt-[8px]" role="group" aria-label="Amount keypad">
      {showOperators ? (
        <div className="grid grid-cols-5 gap-[8px]" role="group" aria-label="Calculator operations">
          {operators.map((operator) => (
            <button
              key={operator.value}
              type="button"
              aria-label={operator.label}
              onClick={() => onOperator(operator.value)}
              className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[20px] font-bold text-[var(--uc-text)] transition-colors active:scale-[0.96] active:bg-[var(--uc-surface-muted)]"
            >
              {operator.symbol}
            </button>
          ))}
          <button
            type="button"
            aria-label="Equals"
            onClick={onEquals}
            disabled={!canEvaluate}
            className="flex h-[44px] items-center justify-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[20px] font-bold text-[var(--uc-text)] transition-colors active:scale-[0.96] active:bg-[var(--uc-surface-muted)] disabled:opacity-40"
          >
            =
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-[12px]" role="group" aria-label="Suggested amounts">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.value}
              type="button"
              aria-label={suggestion.label}
              onClick={() => onSuggestion(suggestion.value)}
              className="h-[44px] rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[8px] text-[14px] font-bold leading-[18px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-[8px] grid grid-cols-3 gap-x-[8px] gap-y-[2px]" role="group" aria-label="Amount digits">
        {digits.map((digit, index) => (
          <button
            key={`${digit}-${index}`}
            type="button"
            aria-label={digit}
            onClick={() => onDigit(digit)}
            className="flex h-[48px] items-center justify-center rounded-[12px] text-[26px] font-semibold leading-[30px] text-[var(--uc-text)] transition-colors active:bg-[var(--uc-surface-muted)]"
          >
            {digit}
          </button>
        ))}
        {hasValue ? (
          <button
            type="button"
            aria-label="Delete amount"
            onClick={onDelete}
            className="flex h-[48px] items-center justify-center rounded-[12px] text-[var(--uc-text)] active:bg-[var(--uc-surface-muted)]"
          >
            <AppIcon name="keypad-backspace" size={26} color="var(--uc-icon)" />
          </button>
        ) : (
          <span aria-hidden="true" className="h-[48px]" />
        )}
      </div>
    </div>
  )
}

export default function InternalTransferScreen({ onBack }: InternalTransferScreenProps) {
  const country = useCountry()
  const reduceMotion = useReducedMotion()
  const { categories } = useProducts()
  const accounts = getEligibleTransferAccounts(categories.flatMap((category) => category.products))
  const [draft, setDraft] = useState<InternalTransferDraft>(() => createInternalTransferDraft(accounts))
  const [topAccountId, setTopAccountId] = useState(accounts[0]?.id ?? '')
  const [bottomAccountId, setBottomAccountId] = useState(accounts[1]?.id ?? '')
  const [pickerPosition, setPickerPosition] = useState<PickerPosition | null>(null)
  const [keypadOpen, setKeypadOpen] = useState(false)
  const [activeAmountPosition, setActiveAmountPosition] = useState<PickerPosition>('top')
  const [amountExpression, setAmountExpression] = useState('')
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const sourceAccount = accounts.find((account) => account.id === draft.sourceAccountId)
  const destinationAccount = accounts.find((account) => account.id === draft.destinationAccountId)
  const topAccount = accounts.find((account) => account.id === topAccountId)
  const bottomAccount = accounts.find((account) => account.id === bottomAccountId)
  const topIsSource = sourceAccount?.id === topAccount?.id

  if (
    !sourceAccount ||
    !destinationAccount ||
    !topAccount ||
    !bottomAccount ||
    sourceAccount.id === destinationAccount.id ||
    topAccount.id === bottomAccount.id
  ) {
    return (
      <div className="flex h-full w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
        <PageHeader title="Move between accounts" onBack={onBack} includeSafeArea showHelp={false} />
        <div className="flex flex-1 flex-col items-center justify-center px-[32px] text-center">
          <div className="grid size-[64px] place-items-center rounded-full bg-[var(--uc-surface-muted)]">
            <AppIcon name="currency-exchange" size={28} color="var(--uc-icon)" />
          </div>
          <h2 className="uc-type-h2 mt-[20px] text-[var(--uc-text)]">Two accounts are needed</h2>
          <p className="uc-type-n4 mt-[8px] text-[var(--uc-text-muted)]">
            Add another current or savings account to move money here.
          </p>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <TransferSuccess
        draft={draft}
        sourceAccount={sourceAccount}
        destinationAccount={destinationAccount}
        onDone={onBack}
      />
    )
  }

  const activeAccount = activeAmountPosition === 'top' ? topAccount : bottomAccount
  const keypadSuggestions = INTERNAL_TRANSFER_PRESETS.map((value) => ({
    value,
    label: `${formatMoneyNumber(value, country)} ${activeAccount.currency}`,
  }))
  const inputSide = activeAccount.id === sourceAccount.id ? 'source' : 'destination'
  const hasOperator = OPERATOR_RE.test(amountExpression)
  const evaluatedExpression = evaluateExpression(amountExpression)
  const expressionIsComplete =
    hasOperator && !TRAILING_OPERATOR_RE.test(amountExpression) && Number.isFinite(evaluatedExpression)
  const expressionDisplay = formatExpression(amountExpression)
  const amountDisplayText = expressionIsComplete
    ? `${expressionDisplay}=${formatCalculatedAmount(evaluatedExpression)}`
    : expressionDisplay

  const quote = getInternalTransferQuote({
    amountText: draft.amountText,
    sourceAccount,
    destinationAccount,
    inputSide,
  })
  const isSubmittable = quote.error === null
  const rateText = quote.isFx
    ? `1 ${sourceAccount.currency} = ${quote.rate.toFixed(4)} ${destinationAccount.currency}`
    : null

  const selectAccount = (account: InternalTransferAccount) => {
    const selectingSource = pickerPosition === 'top' ? topIsSource : !topIsSource
    setDraft((current) => ({
      ...current,
      [selectingSource ? 'sourceAccountId' : 'destinationAccountId']: account.id,
    }))
    if (pickerPosition === 'top') {
      setTopAccountId(account.id)
    } else {
      setBottomAccountId(account.id)
    }
    setPickerPosition(null)
  }

  const swapAccounts = () => {
    setDraft((current) => ({
      ...current,
      sourceAccountId: current.destinationAccountId,
      destinationAccountId: current.sourceAccountId,
    }))
  }

  const commitExpression = (nextExpression: string) => {
    setAmountExpression(nextExpression)
    const expressionHasOperator = OPERATOR_RE.test(nextExpression)
    const evaluated = evaluateExpression(nextExpression)
    const complete = expressionHasOperator && !TRAILING_OPERATOR_RE.test(nextExpression) && Number.isFinite(evaluated)
    const amountText = expressionHasOperator ? (complete ? formatCalculatedAmount(evaluated) : '') : nextExpression
    setDraft((current) => ({ ...current, amountText }))
  }

  const updateAmount = (displayValue: string) => {
    const normalized = displayValue.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    commitExpression(normalized.includes('=') ? (normalized.split('=')[0] ?? '') : normalized)
  }

  const appendToken = (token: string) => {
    const last = amountExpression.slice(-1)
    if (OPERATOR_RE.test(token) && OPERATOR_RE.test(last)) {
      commitExpression(`${amountExpression.slice(0, -1)}${token}`)
      return
    }
    if (OPERATOR_RE.test(token) && amountExpression.length === 0) return
    if (DIGIT_RE.test(token) && (amountExpression.match(/\d/g) ?? []).length >= 10) return
    const currentOperand = amountExpression.split(OPERATOR_RE).at(-1) ?? ''
    if (token === '.' && currentOperand.includes('.')) return
    const nextToken = token === '.' && currentOperand.length === 0 ? '0.' : token
    commitExpression(`${amountExpression}${nextToken}`)
  }

  const appendDigit = (digit: string) => appendToken(digit)

  const selectCalculatorOperator = (operator: CalculatorOperator) => {
    appendToken(CALCULATOR_TOKENS[operator])
  }

  const calculateResult = () => {
    const result = evaluateExpression(amountExpression)
    if (!Number.isFinite(result)) return
    commitExpression(formatCalculatedAmount(result))
  }

  const deleteDigit = () => commitExpression(amountExpression.slice(0, -1))

  const finishAmountEditing = () => {
    const expressionToEvaluate = TRAILING_OPERATOR_RE.test(amountExpression)
      ? amountExpression.slice(0, -1)
      : amountExpression
    if (OPERATOR_RE.test(expressionToEvaluate)) {
      const result = evaluateExpression(expressionToEvaluate)
      if (Number.isFinite(result)) commitExpression(formatCalculatedAmount(result))
    }
    setKeypadOpen(false)
  }

  const handleMainPointerDown = (event: PointerEvent<HTMLElement>) => {
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('[data-amount-editor]')) return
    finishAmountEditing()
  }

  const activateAmountPosition = (position: PickerPosition) => {
    setActiveAmountPosition(position)
    setKeypadOpen(true)
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader title="Move between accounts" onBack={onBack} includeSafeArea showHelp={false} />

        <main
          onPointerDown={handleMainPointerDown}
          className={`bg-[var(--uc-surface)] px-[16px] pt-[8px] ${keypadOpen ? 'pb-[360px]' : 'pb-[160px]'}`}
        >
          <div className="overflow-hidden rounded-[16px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)] shadow-[0_8px_24px_rgb(var(--uc-shadow-rgb)/0.06)]">
            <section className="px-[12px] pb-[8px] pt-[8px]">
              <AccountChooser
                account={topAccount}
                role={topIsSource ? 'From' : 'To'}
                balance={formatBalance(topAccount, country)}
                onClick={() => {
                  setKeypadOpen(false)
                  setPickerPosition('top')
                }}
              />
              {activeAmountPosition === 'top' ? (
                <EditableAmount
                  value={amountDisplayText}
                  currency={topAccount.currency}
                  onChange={updateAmount}
                  onFocus={() => activateAmountPosition('top')}
                />
              ) : (
                <QuotedAmount
                  amount={topIsSource ? quote.sourceAmount : quote.destinationAmount}
                  currency={topAccount.currency}
                  sign={topIsSource ? '−' : '+'}
                  reduceMotion={reduceMotion}
                  onActivate={() => activateAmountPosition('top')}
                />
              )}
            </section>

            <div className="relative flex h-[36px] items-center px-[16px]">
              <span className="h-px w-full bg-[var(--uc-border-muted)]" />
              <motion.button
                type="button"
                aria-label="Swap accounts"
                onClick={swapAccounts}
                whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                animate={reduceMotion ? undefined : { rotate: topIsSource ? 0 : 180 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className="absolute right-[16px] grid size-[40px] place-items-center rounded-full border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-action)] shadow-[0_3px_10px_rgb(var(--uc-shadow-rgb)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
              >
                <AppIcon name="repeat" size={20} color="var(--uc-action)" strokeWidth={2.2} />
              </motion.button>
            </div>

            <section className="px-[12px] pb-[10px] pt-0">
              <AccountChooser
                account={bottomAccount}
                role={topIsSource ? 'To' : 'From'}
                balance={formatBalance(bottomAccount, country)}
                onClick={() => {
                  setKeypadOpen(false)
                  setPickerPosition('bottom')
                }}
              />
              {activeAmountPosition === 'bottom' ? (
                <EditableAmount
                  value={amountDisplayText}
                  currency={bottomAccount.currency}
                  onChange={updateAmount}
                  onFocus={() => activateAmountPosition('bottom')}
                />
              ) : (
                <QuotedAmount
                  amount={topIsSource ? quote.destinationAmount : quote.sourceAmount}
                  currency={bottomAccount.currency}
                  sign={topIsSource ? '+' : '−'}
                  reduceMotion={reduceMotion}
                  onActivate={() => activateAmountPosition('bottom')}
                />
              )}
            </section>
          </div>

          {quote.isFx && rateText ? (
            <div className="mt-[16px] flex items-center justify-between gap-[12px] rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)] px-[14px] py-[12px]">
              <span className="uc-type-n5 text-[var(--uc-text-muted)]">Exchange rate</span>
              <span className="uc-type-n5-strong text-right text-[var(--uc-text)]">{rateText}</span>
            </div>
          ) : null}

          {quote.error === 'insufficient-balance' ? (
            <p className="uc-type-n4 mt-[12px] text-[var(--uc-status-red)]" role="alert">
              Amount exceeds your available balance.
            </p>
          ) : null}

          <label htmlFor="internal-transfer-note" className="mt-[28px] block">
            <span className="uc-type-n4 block text-[var(--uc-text)]">Note (optional)</span>
            <input
              type="text"
              id="internal-transfer-note"
              aria-label="Note (optional)"
              maxLength={140}
              value={draft.note}
              onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
              onFocus={finishAmountEditing}
              placeholder="What is this transfer for?"
              className="uc-type-p1 mt-[8px] h-[52px] w-full rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-subtle)] focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]"
            />
          </label>
          {scheduledDate ? (
            <p className="uc-type-n5 mt-[10px] text-[var(--uc-text-muted)]">
              Scheduled for {new Intl.DateTimeFormat('en-GB').format(new Date(`${scheduledDate}T00:00:00`))}
            </p>
          ) : null}
        </main>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 bg-[var(--uc-surface)] px-[24px] pt-[16px] ${
          keypadOpen ? 'pb-[16px]' : 'pb-[42px]'
        }`}
      >
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            aria-label="Schedule recurring transfer"
            onClick={() => {
              setKeypadOpen(false)
              setScheduleSheetOpen(true)
            }}
            className={`grid size-[48px] shrink-0 place-items-center rounded-[12px] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${
              scheduledDate
                ? 'border-transparent bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
                : 'border-[var(--uc-border-muted)] bg-[var(--uc-surface)] text-[var(--uc-text)]'
            }`}
          >
            <AppIcon name="calendar-days" size={22} color="currentColor" />
          </button>
          <PrimaryButton
            onClick={() => setCompleted(true)}
            disabled={!isSubmittable}
            className="!h-[48px] !w-auto !min-w-0 !flex-1"
            labelSize="16"
          >
            Move money
          </PrimaryButton>
        </div>
        {keypadOpen ? (
          <AmountKeypad
            hasValue={amountExpression.length > 0}
            showOperators={amountExpression.length > 0}
            canEvaluate={hasOperator}
            suggestions={keypadSuggestions}
            onDigit={appendDigit}
            onDelete={deleteDigit}
            onOperator={selectCalculatorOperator}
            onEquals={calculateResult}
            onSuggestion={(value) => commitExpression(String(value))}
          />
        ) : null}
      </div>

      {pickerPosition ? (
        <AccountPicker
          pickerRole={(pickerPosition === 'top' ? topIsSource : !topIsSource) ? 'source' : 'destination'}
          accounts={accounts}
          blockedAccountId={pickerPosition === 'top' ? bottomAccount.id : topAccount.id}
          selectedAccountId={pickerPosition === 'top' ? topAccount.id : bottomAccount.id}
          onSelect={selectAccount}
          onClose={() => setPickerPosition(null)}
        />
      ) : null}
      {scheduleSheetOpen ? (
        <TransferScheduleSheet
          onClose={() => setScheduleSheetOpen(false)}
          onConfirm={(date) => {
            setScheduledDate(date)
            setScheduleSheetOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
