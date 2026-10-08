import {
  type CoAppingReplyResolver,
  type CoAppingReplyResult,
  defaultReplyResolver,
} from '../../../package/mobile-pi-coapping-chat-package/src'
import { resolveIntent, type IntentMatch } from './nlu'
import { buildCzChatFollowUp, type CzChatSmartReplyOptions } from './cz/helpers'
import { buildCzChatNormalizedContext } from './cz/normalizedContext'
import { buildCzChatRequest, resolveCzChatDomainReply } from './cz/orderedHandlers'
import { normalizeCzChatInput as normalize } from './cz/matching'

export {
  CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX,
  CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX,
  buildCreditCardOpportunities,
  getCzSavingsProductDetailSelection,
  getProductsShelfFocusCardId,
  isCreditCardProduct,
} from './cz/helpers'
export type { ProductsShelfFocusRequest } from './cz/helpers'
export {
  buildCzChatHelpContext,
  buildCzChatScreenContext,
  getCzChatHelpAreaForAccountProduct,
  getCzChatHelpAreaForScreen,
} from './cz/context'
export type { CzChatHelpArea, CzChatLauncherVariant } from './cz/helpers'

/**
 * "Did you mean…" reply built from the NLU's close-scoring intents. Tapping a
 * chip replays the exact scripted `canonicalPrompt`, re-entering the proven
 * deterministic path — so disambiguation never invents an answer.
 */
function buildNluDisambiguationReply(alternatives: IntentMatch[]): CoAppingReplyResult {
  return {
    text: `### Let me point you to the right place\n` + `I can help with a few things here. Which one did you mean?`,
    followUps: alternatives.map((match) =>
      buildCzChatFollowUp(`cz-nlu-${match.intent.id}`, match.intent.label, match.intent.canonicalPrompt),
    ),
  }
}

export function buildCzChatSmartReplyResolver(options: CzChatSmartReplyOptions): CoAppingReplyResolver {
  const context = buildCzChatNormalizedContext(options)
  const { selectedInvestmentSecurity } = context
  const baseResolver: CoAppingReplyResolver = (input, messages) => {
    const normalized = normalize(input)
    const namedInvestmentSecurity = context.investmentSecurityCatalog.find((security) =>
      normalized.includes(normalize(security.title)),
    )
    if (namedInvestmentSecurity && namedInvestmentSecurity.id !== selectedInvestmentSecurity?.id) {
      return buildCzChatSmartReplyResolver({
        country: context.country,
        categories: context.categories,
        selectedAccountProduct: context.selectedAccountProduct,
        selectedCardProduct: context.selectedCardProduct,
        creditCardForOpportunity: context.creditCardForOpportunity,
        selectedInvestmentSecurity: namedInvestmentSecurity,
      })(input, messages)
    }
    return (
      resolveCzChatDomainReply(buildCzChatRequest(input, messages, context, normalized), context) ??
      defaultReplyResolver(input)
    )
  }
  // ── NLU front-layer ──────────────────────────────────────────────────────
  // The base resolver returns a structured object for every scripted branch and
  // a plain string ONLY when it falls through to `defaultReplyResolver`. That
  // string-vs-object distinction is a zero-risk seam: if any branch matched we
  // return it untouched (the scripted chip happy-path is never re-routed); only
  // for genuine fall-through do we run the NLU layer to recover free text,
  // typos, and Czech by mapping to the canonical scripted prompt.
  const resolveWithNlu: CoAppingReplyResolver = (input, messages) => {
    const direct = baseResolver(input, messages)
    if (typeof direct !== 'string') return direct

    const resolution = resolveIntent(input, {
      hasSelectedSecurity: Boolean(selectedInvestmentSecurity),
    })

    if (resolution.status === 'route' && resolution.best) {
      const rewritten = baseResolver(resolution.best.intent.canonicalPrompt, messages)
      // Only adopt the rewrite if it actually reached a scripted branch.
      if (typeof rewritten !== 'string') return rewritten
    } else if (resolution.status === 'disambiguate' && resolution.alternatives.length >= 2) {
      return buildNluDisambiguationReply(resolution.alternatives)
    }

    // Nothing better than the engine's own topical fallback.
    return direct
  }
  return resolveWithNlu
}
