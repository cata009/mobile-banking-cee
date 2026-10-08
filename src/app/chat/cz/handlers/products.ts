import { type CoAppingReplyResult } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, buildCzNavigateFollowUp } from '../helpers'
import type { CzChatNormalizedContext } from '../normalizedContext'
import { hasCzChatTerm as hasAny } from '../matching'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzProductShelfReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'productShelfTitle' | 'productShelfLines' | 'productShelfBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { productShelfTitle, productShelfLines, productShelfBlock } = context

  if (
    hasAny(normalized, [
      'what products can i open',
      'products can i open',
      'open from product shelf',
      'open from products shelf',
      'product shelf',
      'our products shelf',
    ])
  ) {
    return {
      text:
        `### Products you can open\n` +
        `From **Products > ${productShelfTitle}**, this CZ product shelf currently exposes:\n` +
        `${productShelfLines}\n` +
        `Use this as catalogue discovery: chat can summarize what is available, but opening, applying, eligibility checks, documents, and confirmation belong in the Products shelf.`,
      richBlocks: [productShelfBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-products-shelf', 'Open Products', 'products'),
        buildCzChatFollowUp(
          'cz-products-savings-shelf',
          'Explain savings options',
          'Help me understand savings and investment product choices.',
        ),
        buildCzChatFollowUp(
          'cz-products-borrowing-shelf',
          'Review borrowing options',
          'Help me understand loan or mortgage options before applying.',
        ),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzProductChoicesReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'selectedSavings' | 'savingsBalance' | 'productsBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { selectedSavings, savingsBalance, productsBlock } = context

  if (
    hasAny(normalized, [
      'compare account',
      'product offers',
      'relevant offers',
      'savings and investment product choices',
      'loan or mortgage options',
      'product options',
      'explore savings and investing',
      'review loan options',
    ])
  ) {
    return {
      text:
        `### Product choice without pushing\n` +
        `I would split Products into intent, not a catalogue dump:\n` +
        `- **Everyday banking:** accounts and cards, based on usage and controls.\n` +
        `- **Saving:** ${selectedSavings ? `${selectedSavings.name} currently shows ${savingsBalance}.` : 'start from goal, access rules, and interest.'}\n` +
        `- **Borrowing:** show instalment, remaining amount, fees, and eligibility before any application.\n` +
        `- **Investing:** explain risk and documents before product selection.\n` +
        `The assistant can recommend where to look, but the final product action belongs in Products or the product detail screen.`,
      richBlocks: [productsBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-products', 'Open Products', 'products'),
        buildCzChatFollowUp(
          'cz-compare-savings',
          'Compare savings',
          'Help me compare this savings product with other options in the app.',
        ),
        buildCzChatFollowUp(
          'cz-review-borrowing',
          'Review borrowing',
          'Help me understand loan or mortgage options before applying.',
        ),
      ],
    }
  }
  return null
}
