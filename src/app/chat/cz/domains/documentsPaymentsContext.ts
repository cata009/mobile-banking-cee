import { type CoAppingRichBlock } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzNavigateAction, getCzLatestDocument, type CzChatSmartReplyOptions } from '../helpers'

/** Domain-owned derivation used once when a chat resolver snapshots its input. */
export function buildCzDocumentsPaymentsChatContext(context: Pick<CzChatSmartReplyOptions, 'country'>) {
  const { country } = context
  const latestDocument = getCzLatestDocument(country)

  const documentBlock: CoAppingRichBlock = {
    type: 'product-cards',
    title: 'Document routes',
    body: latestDocument
      ? `Newest item in this mock profile: ${latestDocument.description}, ${latestDocument.date}.`
      : 'Documents are grouped by year and newest date first.',
    products: [
      {
        id: 'documents',
        title: 'Documents',
        subtitle: 'Statements, notices, confirmations',
        meta: 'Open list',
        tone: 'blue',
        action: buildCzNavigateAction('open-documents', 'Open Documents', 'documents'),
      },
      {
        id: 'messages',
        title: 'Messages',
        subtitle: 'Bank notifications',
        meta: 'Open inbox',
        tone: 'neutral',
        action: buildCzNavigateAction('open-messages', 'Open Messages', 'messages'),
      },
    ],
  }

  const paymentBlock: CoAppingRichBlock = {
    type: 'product-cards',
    title: 'Payment handoff',
    body: 'Use chat to prepare the check, then keep creation, review, and signing in Payments.',
    products: [
      {
        id: 'new-payment',
        title: 'New payment',
        subtitle: 'Recipient, amount, review',
        meta: 'Open Payments',
        tone: 'blue',
        action: buildCzNavigateAction('open-payments', 'Open Payments', 'payments'),
      },
      {
        id: 'documents',
        title: 'Confirmation',
        subtitle: 'After payment is processed',
        meta: 'Open Documents',
        tone: 'neutral',
        action: buildCzNavigateAction('open-payment-documents', 'Open Documents', 'documents'),
      },
    ],
  }
  return { latestDocument, documentBlock, paymentBlock }
}
