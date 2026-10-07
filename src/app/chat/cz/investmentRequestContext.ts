import type { CurrentAccount } from '@/data/products'
import {
  type CoAppingFollowUpSuggestion,
  type CoAppingRichBlock,
} from '../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, formatCzChatMoney } from './helpers'
import { extractInvestmentGoalDraft, getInvestmentGoalNextStep } from './investmentGoal'
import type { CoAppingChatMessage } from '../../../../package/mobile-pi-coapping-chat-package/src'
import type { CzChatNormalizedContext } from './normalizedContext'
import { normalizeCzChatInput as normalize, hasCzChatTerm as hasAny } from './matching'

export function buildCzInvestmentRequestContext(
  input: string,
  messages: CoAppingChatMessage[],
  context: Pick<CzChatNormalizedContext, 'country' | 'selectedInvestmentSecurity' | 'currentAccounts'>,
  normalized = normalize(input),
) {
  const { country, selectedInvestmentSecurity, currentAccounts } = context
  const investmentGoalDraft = extractInvestmentGoalDraft(messages)

  const investmentGoalNextStep = getInvestmentGoalNextStep(investmentGoalDraft)

  // Detect a free-typed amount answer during an active goal flow: the amount
  // step was open *before* this message and is now filled *including* it.
  // (Chip prompts are handled by the `startsWith` guard below; this adds free
  // text like "10k" / "7 500 Kč" / "skip" without disturbing that path.)
  const lastGoalMessage = messages[messages.length - 1]

  const priorGoalMessages =
    lastGoalMessage?.role === 'user' && lastGoalMessage.text === input ? messages.slice(0, -1) : messages

  const goalDraftBeforeInput = extractInvestmentGoalDraft(priorGoalMessages)

  const goalStepBeforeInput = getInvestmentGoalNextStep(goalDraftBeforeInput)

  const isFreeTypedGoalAmountAnswer =
    !normalized.startsWith('set investment goal ') &&
    goalDraftBeforeInput.purpose !== null &&
    ((goalStepBeforeInput === 'starting-amount' &&
      (investmentGoalDraft.startingAmount !== null || investmentGoalDraft.startingAmountUndecided)) ||
      (goalStepBeforeInput === 'monthly-contribution' && investmentGoalDraft.monthlyContribution !== null))

  const hasShownSelectedInvestmentCard = Boolean(
    selectedInvestmentSecurity &&
    messages.some(
      (message) =>
        message.role === 'agent' &&
        message.richBlocks?.some(
          (block) => block.type === 'investment-summary' && block.title === selectedInvestmentSecurity.title,
        ),
    ),
  )

  const showSelectedInvestmentCardOnce = (block: CoAppingRichBlock | null) =>
    block && !hasShownSelectedInvestmentCard ? [block] : undefined

  const normalizedInvestmentUserMessages = messages
    .filter((message) => message.role === 'user')
    .map((message) => normalize(message.text))

  const hasVisitedInvestmentTopic = (terms: string[]) =>
    normalizedInvestmentUserMessages.some((message) => hasAny(message, terms))

  const consumedInvestmentFollowUpIds = new Set<string>()

  if (
    hasVisitedInvestmentTopic([
      'how is my position',
      'doing for me',
      'review my performance',
      'position performing',
      'product performing',
      'holding performing',
      'performance of this',
    ])
  ) {
    consumedInvestmentFollowUpIds.add('cz-investment-product-performance')
  }

  if (
    hasVisitedInvestmentTopic([
      'what could affect my return',
      'affect my return from',
      'review risk',
      'explain the risk',
      'risk and liquidity',
      'liquidity and currency',
      'currency exposure of',
    ])
  ) {
    consumedInvestmentFollowUpIds.add('cz-investment-product-risk')
  }

  if (
    hasVisitedInvestmentTopic([
      'show me the essential information',
      'show me the essentials',
      'summarize the key document',
      'documents should i review',
      'documents matter',
      'what documents',
      'key information document',
      'prospectus',
    ])
  ) {
    consumedInvestmentFollowUpIds.add('cz-investment-product-documents')
  }

  if (
    hasVisitedInvestmentTopic(['in my portfolio context', 'review portfolio', 'portfolio fit', 'portfolio context for'])
  ) {
    consumedInvestmentFollowUpIds.add('cz-investment-product-portfolio')
  }

  if (hasVisitedInvestmentTopic(['product overview for'])) {
    consumedInvestmentFollowUpIds.add('cz-investment-product-overview')
  }

  const keepUnvisitedInvestmentFollowUps = (followUps: CoAppingFollowUpSuggestion[]) =>
    followUps.filter((followUp) => !consumedInvestmentFollowUpIds.has(followUp.id))

  const buildInvestmentBuyQuantityFollowUps = (): CoAppingFollowUpSuggestion[] =>
    [1, 5, 10].map((quantity) =>
      buildCzChatFollowUp(
        `cz-investment-buy-quantity-${selectedInvestmentSecurity?.id ?? 'product'}-${quantity}`,
        `${quantity} PCS`,
        `Buy ${quantity} PCS of ${selectedInvestmentSecurity?.title ?? 'this investment product'}.`,
      ),
    )

  const compactInvestmentBuyAccount = (account: CurrentAccount) =>
    `${account.name} ending ${account.accountNumber.slice(-4)}`

  const buildInvestmentBuyAccountFollowUps = (quantity: number): CoAppingFollowUpSuggestion[] =>
    currentAccounts.map((account) =>
      buildCzChatFollowUp(
        `cz-investment-buy-account-${selectedInvestmentSecurity?.id ?? 'product'}-${account.id}-${quantity}`,
        `${account.name} · ${formatCzChatMoney(account.balance, account.currency, country)}`,
        `Use ${compactInvestmentBuyAccount(account)} for ${quantity} PCS of ${selectedInvestmentSecurity?.title ?? 'this investment product'}.`,
      ),
    )

  const latestAgentMessage = [...messages].reverse().find((message) => message.role === 'agent') ?? null

  const isQuantityAnswer = Boolean(
    selectedInvestmentSecurity &&
    latestAgentMessage?.text.includes('### Choose quantity') &&
    latestAgentMessage.text.includes(selectedInvestmentSecurity.title) &&
    /^[+-]?\d+(?:[.,]\d+)?$/.test(normalized),
  )

  const buyQuantityMatch = normalized.match(/\bbuy\s+([^\s]+)\s+pcs\s+of\s+/i)

  const buyQuantityCandidate = buyQuantityMatch?.[1] ?? (isQuantityAnswer ? normalized : null)

  const buyQuantity = buyQuantityCandidate && /^\d+$/.test(buyQuantityCandidate) ? Number(buyQuantityCandidate) : null

  const accountQuantityMatch = normalized.match(/\bfor\s+(\d+)\s+pcs\s+of\s+/i)

  const accountQuantity = accountQuantityMatch ? Number(accountQuantityMatch[1]) : null

  const selectedBuyAccount =
    currentAccounts.find((account) => normalized.includes(normalize(compactInvestmentBuyAccount(account)))) ?? null

  const selectedExecutionTiming = normalized.startsWith('set timing to today for ')
    ? 'today'
    : normalized.startsWith('set timing to next business day for ')
      ? 'next-business-day'
      : null
  return Object.freeze({
    investmentGoalDraft,
    investmentGoalNextStep,
    isFreeTypedGoalAmountAnswer,
    showSelectedInvestmentCardOnce,
    keepUnvisitedInvestmentFollowUps,
    buildInvestmentBuyQuantityFollowUps,
    compactInvestmentBuyAccount,
    buildInvestmentBuyAccountFollowUps,
    buyQuantityCandidate,
    buyQuantity,
    accountQuantity,
    selectedBuyAccount,
    selectedExecutionTiming,
  })
}
export type CzInvestmentRequestContext = ReturnType<typeof buildCzInvestmentRequestContext>
