import { type CoAppingReplyResult } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, buildCzNavigateFollowUp } from '../helpers'
import type { CzChatNormalizedContext } from '../normalizedContext'
import { hasCzChatTerm as hasAny } from '../matching'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzCardServicingReply(
  normalized: string,
  context: Pick<
    CzChatNormalizedContext,
    'primaryCard' | 'creditAvailable' | 'creditLimit' | 'proposedCreditLimit' | 'productsBlock'
  >,
): Exclude<CoAppingReplyResult, string> | null {
  const { primaryCard, creditAvailable, creditLimit, proposedCreditLimit, productsBlock } = context

  if (
    hasAny(normalized, [
      'card security',
      'security settings and recent activity',
      'card limits',
      'temporarily for a purchase',
      'pin for this card',
      'card transactions',
      'free to spend',
    ])
  ) {
    return {
      text:
        `### Card check\n` +
        `${primaryCard ? `${primaryCard.name} shows ${creditAvailable} free to spend from a ${creditLimit} limit.` : 'Start from the selected card detail.'}\n` +
        `The useful checks are:\n` +
        `1. Recent card transactions and pending reservations.\n` +
        `2. Online, contactless, ATM, and temporary limit controls.\n` +
        `3. PIN/security options, with sensitive actions kept behind app authorization.\n` +
        `${primaryCard ? `If the user is interested, the limit-review path can explain a possible ${proposedCreditLimit} limit without changing anything from chat.` : ''}`,
      richBlocks: [productsBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-card', 'Open Card', 'card-detail'),
        buildCzChatFollowUp('cz-limit-review', 'Review limit option', "I'm interested in this credit limit offer."),
        buildCzChatFollowUp(
          'cz-card-transactions',
          'Search card activity',
          'Help me understand or search recent card transactions.',
        ),
      ],
    }
  }
  return null
}
