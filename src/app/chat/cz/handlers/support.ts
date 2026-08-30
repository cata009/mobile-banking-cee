import type { CoAppingReplyResult, CoAppingRichBlock } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, buildCzNavigateFollowUp } from '../helpers'

export type CzSupportHandlerContext = {
  documentBlock: CoAppingRichBlock
  productsBlock: CoAppingRichBlock
}

function hasAny(normalized: string, terms: readonly string[]): boolean {
  return terms.some((term) => normalized.includes(term))
}

export function resolveCzSupportReply(
  normalized: string,
  { documentBlock, productsBlock }: CzSupportHandlerContext,
): CoAppingReplyResult | null {
  if (hasAny(normalized, ['specific inbox', 'outbox message', 'message types', 'bank notifications'])) {
    return {
      text:
        `### Messages help\n` +
        `Use Messages for bank communication, not transaction proof.\n` +
        `Inbox is for received notices, Outbox is for requests or messages sent from the app, and Documents is where durable statements or confirmations should live.\n` +
        `If the user needs evidence for a payment, route to Documents or the transaction detail instead of only searching messages.`,
      richBlocks: [documentBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-messages', 'Open Messages', 'messages'),
        buildCzNavigateFollowUp('cz-open-documents', 'Open Documents', 'documents'),
        buildCzChatFollowUp(
          'cz-find-confirmation',
          'Find payment proof',
          'Help me find or understand a payment confirmation.',
        ),
      ],
    }
  }

  if (hasAny(normalized, ['prime can help', 'contact or prepare questions for my advisor', 'advisor questions'])) {
    return {
      text:
        `### Prime preparation\n` +
        `A good Prime answer should help the customer prepare before contacting the advisor.\n` +
        `Summarize the goal, the amount involved, urgency, risk or borrowing questions, and any documents the advisor should review.\n` +
        `Then route to Prime or Contacts rather than pretending the chat itself is the advisor.`,
      followUps: [
        buildCzNavigateFollowUp('cz-open-prime', 'Open Prime', 'prime'),
        buildCzNavigateFollowUp('cz-open-contacts', 'Open Contacts', 'contacts'),
        buildCzChatFollowUp(
          'cz-prepare-advisor',
          'Prepare questions',
          'Help me prepare questions before contacting the bank.',
        ),
      ],
    }
  }

  if (hasAny(normalized, ['right support', 'support or branch contact', 'prepare questions before contacting'])) {
    return {
      text:
        `### Contact route\n` +
        `First decide whether this is servicing, advice, or urgent security.\n` +
        `- Security issue: card block/support first.\n` +
        `- Product advice: prepare context and use advisor/Prime where available.\n` +
        `- Branch/contact search: open Contacts and choose the channel there.\n` +
        `The assistant should prepare the question, not replace the official contact route.`,
      followUps: [
        buildCzNavigateFollowUp('cz-open-contacts', 'Open Contacts', 'contacts'),
        buildCzChatFollowUp(
          'cz-card-security',
          'Card security',
          "Help me review this card's security settings and recent activity.",
        ),
        buildCzChatFollowUp(
          'cz-documents',
          'Find documents',
          'Help me find statements, contracts, confirmations, or legal notices.',
        ),
      ],
    }
  }

  if (hasAny(normalized, ['why should i review the card before documents', 'why this order'])) {
    return {
      text:
        `### Why that order\n` +
        `The card check is action-oriented: it can explain free-to-spend, recent reservations, and the limit-review opportunity.\n` +
        `Documents are evidence-oriented: useful when the customer needs a statement, receipt, contract, or legal notice.\n` +
        `So I would start with Card if the question is "what should I do next?", and Documents if the question is "where is the proof?"`,
      richBlocks: [productsBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-card', 'Open Card', 'card-detail'),
        buildCzNavigateFollowUp('cz-open-documents', 'Open Documents', 'documents'),
      ],
    }
  }

  return null
}
