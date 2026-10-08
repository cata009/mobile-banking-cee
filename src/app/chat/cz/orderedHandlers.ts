import type { CoAppingChatMessage, CoAppingReplyResult } from '../../../../package/mobile-pi-coapping-chat-package/src'
import type { CzChatNormalizedContext } from './normalizedContext'
import { buildCzInvestmentRequestContext, type CzInvestmentRequestContext } from './investmentRequestContext'
import { normalizeCzChatInput } from './matching'
import { resolveCzCardReply } from './handlers/cards'
import { resolveCzSupportReply } from './handlers/support'
import {
  resolveCzInvestmentPurchaseReply,
  resolveCzInvestmentProductReply,
  resolveCzInvestmentPortfolioReply,
} from './handlers/investments'
import {
  resolveCzHomeOverviewReply,
  resolveCzAccountActivityReply,
  resolveCzSpendingReply,
  resolveCzAccountDetailReply,
  resolveCzBorrowingReply,
} from './handlers/accounts'
import { resolveCzSavingsPlanReply, resolveCzSavingsDetailReply } from './handlers/savings'
import { resolveCzProductShelfReply, resolveCzProductChoicesReply } from './handlers/products'
import { resolveCzDocumentsReply, resolveCzPaymentsReply } from './handlers/documentsPayments'
import { resolveCzSettingsReply } from './handlers/settings'
import { resolveCzCardServicingReply } from './handlers/cardServicing'
import { resolveCzInvestmentGoalReply } from './handlers/investmentGoals'

export type CzChatRequest = Readonly<{ normalized: string; investment: CzInvestmentRequestContext }>
export type CzChatDomainHandler = Readonly<{
  id: string
  domain: string
  resolve: (request: CzChatRequest, context: CzChatNormalizedContext) => Exclude<CoAppingReplyResult, string> | null
}>
/** Preserve the original branch precedence, including broad predicates that overlap later domains. */
export const CZ_CHAT_ORDERED_HANDLERS: readonly CzChatDomainHandler[] = Object.freeze([
  {
    id: 'InvestmentPurchase',
    domain: 'investments',
    resolve: ({ normalized, investment }, context) => resolveCzInvestmentPurchaseReply(normalized, context, investment),
  },
  {
    id: 'credit-limits',
    domain: 'cards',
    resolve: ({ normalized }, context) =>
      resolveCzCardReply(normalized, {
        primaryCardName: context.primaryCard?.name ?? null,
        creditLimit: context.creditLimit,
        proposedCreditLimit: context.proposedCreditLimit,
        creditLimitOfferBlock: context.creditLimitOfferBlock,
      }),
  },
  {
    id: 'HomeOverview',
    domain: 'accounts',
    resolve: ({ normalized }, context) => resolveCzHomeOverviewReply(normalized, context),
  },
  {
    id: 'SavingsPlan',
    domain: 'savings',
    resolve: ({ normalized }, context) => resolveCzSavingsPlanReply(normalized, context),
  },
  {
    id: 'AccountActivity',
    domain: 'accounts',
    resolve: ({ normalized }, context) => resolveCzAccountActivityReply(normalized, context),
  },
  {
    id: 'ProductShelf',
    domain: 'products',
    resolve: ({ normalized }, context) => resolveCzProductShelfReply(normalized, context),
  },
  {
    id: 'Documents',
    domain: 'documentsPayments',
    resolve: ({ normalized }, context) => resolveCzDocumentsReply(normalized, context),
  },
  {
    id: 'Spending',
    domain: 'accounts',
    resolve: ({ normalized }, context) => resolveCzSpendingReply(normalized, context),
  },
  {
    id: 'Payments',
    domain: 'documentsPayments',
    resolve: ({ normalized }, context) => resolveCzPaymentsReply(normalized, context),
  },
  {
    id: 'ProductChoices',
    domain: 'products',
    resolve: ({ normalized }, context) => resolveCzProductChoicesReply(normalized, context),
  },
  {
    id: 'Settings',
    domain: 'settings',
    resolve: ({ normalized }, context) => resolveCzSettingsReply(normalized, context),
  },
  {
    id: 'AccountDetail',
    domain: 'accounts',
    resolve: ({ normalized }, context) => resolveCzAccountDetailReply(normalized, context),
  },
  {
    id: 'CardServicing',
    domain: 'cardServicing',
    resolve: ({ normalized }, context) => resolveCzCardServicingReply(normalized, context),
  },
  {
    id: 'SavingsDetail',
    domain: 'savings',
    resolve: ({ normalized }, context) => resolveCzSavingsDetailReply(normalized, context),
  },
  {
    id: 'Borrowing',
    domain: 'accounts',
    resolve: ({ normalized }, context) => resolveCzBorrowingReply(normalized, context),
  },
  {
    id: 'InvestmentProduct',
    domain: 'investments',
    resolve: ({ normalized, investment }, context) => resolveCzInvestmentProductReply(normalized, context, investment),
  },
  {
    id: 'InvestmentGoal',
    domain: 'investmentGoals',
    resolve: ({ normalized, investment }, context) => resolveCzInvestmentGoalReply(normalized, context, investment),
  },
  {
    id: 'InvestmentPortfolio',
    domain: 'investments',
    resolve: ({ normalized }, context) => resolveCzInvestmentPortfolioReply(normalized, context),
  },
  {
    id: 'prime-messages-contacts-support',
    domain: 'support',
    resolve: ({ normalized }, context) => resolveCzSupportReply(normalized, context),
  },
])

export function buildCzChatRequest(
  input: string,
  messages: CoAppingChatMessage[],
  context: CzChatNormalizedContext,
  normalized = normalizeCzChatInput(input),
): CzChatRequest {
  return Object.freeze({
    normalized,
    investment: buildCzInvestmentRequestContext(input, messages, context, normalized),
  })
}
export function resolveCzChatDomainReply(
  request: CzChatRequest,
  context: CzChatNormalizedContext,
): Exclude<CoAppingReplyResult, string> | null {
  for (const handler of CZ_CHAT_ORDERED_HANDLERS) {
    const reply = handler.resolve(request, context)
    if (reply !== null) return reply
  }
  return null
}
