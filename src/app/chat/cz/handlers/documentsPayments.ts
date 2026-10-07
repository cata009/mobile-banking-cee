import { type CoAppingReplyResult } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, buildCzNavigateFollowUp } from '../helpers'
import type { CzChatNormalizedContext } from '../normalizedContext'
import { hasCzChatTerm as hasAny } from '../matching'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzDocumentsReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'latestDocument' | 'documentBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { latestDocument, documentBlock } = context

  if (
    hasAny(normalized, [
      'confirmations, statements',
      'recent bank documents',
      'payment confirmation in documents',
      'search account statements',
      'share or download a document',
      'legal notices',
    ])
  ) {
    const newest = latestDocument
      ? `${latestDocument.description} from ${latestDocument.date}${latestDocument.isNew ? ' marked NEW' : ''}`
      : 'the newest document group'
    return {
      text:
        `### Recent documents\n` +
        `I would start in **Documents**, not in a broad search.\n` +
        `The newest visible item in this mock profile is **${newest}**.\n` +
        `Use the list this way:\n` +
        `1. Start with the newest year group.\n` +
        `2. Search by document type: confirmation, statement, receipt, legal notice.\n` +
        `3. Open the row before sharing or deleting. Legal files should explain restrictions before any destructive action.`,
      richBlocks: [documentBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-documents', 'Open Documents', 'documents'),
        buildCzChatFollowUp(
          'cz-doc-confirmation',
          'Find confirmation',
          'I need help finding a payment confirmation in Documents.',
        ),
        buildCzChatFollowUp(
          'cz-doc-legal',
          'Explain legal files',
          'Which document types are legal notices and what can I do with them?',
        ),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzPaymentsReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'paymentBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { paymentBlock } = context

  if (
    hasAny(normalized, [
      'start a new payment',
      'start a payment safely',
      'payment limits',
      'fees, timing',
      'signing',
      'after i sign',
      'recurring payment',
      'template makes sense',
      'payment step',
    ])
  ) {
    return {
      text:
        `### Payment check\n` +
        `Before sending money, the assistant should check the exact step:\n` +
        `1. Recipient and account number.\n` +
        `2. Amount, currency, due date, and message/reference.\n` +
        `3. Limits, fees, and whether signing is still required.\n` +
        `For repeated transfers, use a standing order when date and amount are predictable. Use a template when the user wants to review each transfer manually.`,
      richBlocks: [paymentBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-payments', 'Open Payments', 'payments'),
        buildCzChatFollowUp(
          'cz-payment-confirmation',
          'Find confirmation',
          'Help me find or understand a payment confirmation.',
        ),
        buildCzChatFollowUp(
          'cz-standing-order',
          'Standing order or template?',
          'Help me decide whether a recurring payment or template makes sense.',
        ),
      ],
    }
  }
  return null
}
