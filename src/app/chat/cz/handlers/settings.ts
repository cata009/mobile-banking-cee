import { type CoAppingReplyResult } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzNavigateFollowUp } from '../helpers'
import type { CzChatNormalizedContext } from '../normalizedContext'
import { hasCzChatTerm as hasAny } from '../matching'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzSettingsReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'documentBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { documentBlock } = context

  if (
    hasAny(normalized, [
      'security settings',
      'app preferences',
      'contact the bank',
      'support route',
      'branch',
      'consents',
      'third-party access',
      'applications',
    ])
  ) {
    return {
      text:
        `### Service route\n` +
        `For More, the answer should route the customer by task:\n` +
        `- Documents for statements, confirmations, contracts, and legal notices.\n` +
        `- Settings for security and app preferences.\n` +
        `- Contacts for branch, support, or advisor preparation.\n` +
        `- Consents and applications for third-party access or active requests.\n` +
        `That is more useful than listing every More tile in the same order.`,
      richBlocks: [documentBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-documents', 'Open Documents', 'documents'),
        buildCzNavigateFollowUp('cz-open-settings', 'Open Settings', 'settings'),
        buildCzNavigateFollowUp('cz-open-contacts', 'Open Contacts', 'contacts'),
      ],
    }
  }
  return null
}
