import type { CoAppingReplyResult, CoAppingRichBlock } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, buildCzNavigateFollowUp } from '../helpers'

export type CzCardHandlerContext = {
  primaryCardName: string | null
  creditLimit: string
  proposedCreditLimit: string
  creditLimitOfferBlock: CoAppingRichBlock
}

function hasAny(normalized: string, terms: readonly string[]): boolean {
  return terms.some((term) => normalized.includes(term))
}

export function resolveCzCardReply(
  normalized: string,
  { primaryCardName, creditLimit, proposedCreditLimit, creditLimitOfferBlock }: CzCardHandlerContext,
): CoAppingReplyResult | null {
  const review = buildCzNavigateFollowUp('cz-limit-review', 'Review offer', 'credit-limit-review')
  const notNow = buildCzChatFollowUp(
    'cz-limit-not-now',
    'Not now',
    'Finish this credit limit conversation without changing anything.',
  )

  if (
    hasAny(normalized, [
      'finish this credit limit conversation without changing anything',
      'leave this credit limit offer unchanged',
    ])
  ) {
    return {
      text:
        `### Offer left unchanged\n` +
        `Nothing changed on your card. You can review a future eligible offer from the card page.`,
    }
  }

  if (
    hasAny(normalized, [
      'check repayment impact for this credit limit offer',
      'repayment impact for this credit limit offer',
      'repayment impact',
      'impact if i accept',
    ])
  ) {
    return {
      text:
        `### Repayment impact\n` +
        `A higher limit does not create a charge by itself. It only adds spending room, so keep any extra use within an amount you can comfortably repay.\n` +
        `${primaryCardName ? `This offer moves **${primaryCardName}** from **${creditLimit}** to **${proposedCreditLimit}**.` : 'The exact amounts are confirmed in the secure card flow.'}\n` +
        `Review the final terms before signing; nothing changes from this conversation.`,
      followUps: [review, notNow],
    }
  }

  if (
    hasAny(normalized, [
      "i'm interested in this credit limit offer",
      'interested in this credit limit offer',
      'interested in this offer',
      'credit limit offer',
      'credit card limit upgrade options',
      'limit upgrade options',
    ])
  ) {
    return {
      text:
        `### Your limit offer\n` +
        `${primaryCardName ? `Increase **${primaryCardName}** from **${creditLimit}** to **${proposedCreditLimit}** for extra flexibility when you need it.` : 'Review the eligible limit prepared for your card.'}\n` +
        `You can check the repayment impact here or open the secure review. Nothing changes until you accept the terms and sign.`,
      richBlocks: [creditLimitOfferBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-limit-impact',
          'Check repayment impact',
          'Check repayment impact for this credit limit offer.',
        ),
        review,
        notNow,
      ],
    }
  }

  return null
}
