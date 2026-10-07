import { formatMaskedCardNumber } from '@/app/utils/cardNumber'
import { type CoAppingRichBlock } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { formatCzChatMoney, type CzChatSmartReplyOptions } from '../helpers'
import type { buildCzProfileChatContext } from './profileContext'
/** Domain-owned derivation used once when a chat resolver snapshots its input. */
export function buildCzCardsChatContext(
  context: Pick<CzChatSmartReplyOptions, 'country'> & Pick<ReturnType<typeof buildCzProfileChatContext>, 'primaryCard'>,
) {
  const { country, primaryCard } = context
  const creditAvailable = primaryCard
    ? formatCzChatMoney(primaryCard.availableCredit, primaryCard.currency, country)
    : 'not available in this simulation profile'

  const creditLimit = primaryCard
    ? formatCzChatMoney(primaryCard.creditLimit, primaryCard.currency, country)
    : 'not available in this simulation profile'

  const proposedCreditLimit = primaryCard
    ? formatCzChatMoney(primaryCard.creditLimit + 5000, primaryCard.currency, country)
    : 'not available in this simulation profile'

  const creditLimitOfferBlock: CoAppingRichBlock = {
    type: 'credit-limit-offer',
    title: 'Card limit offer',
    body: '',
    cardName: primaryCard?.name ?? 'Credit Card',
    cardDescription: primaryCard ? formatMaskedCardNumber(primaryCard.accountNumber) : 'Selected card',
    currentLimit: creditLimit,
    newLimit: proposedCreditLimit,
  }
  return { creditAvailable, creditLimit, proposedCreditLimit, creditLimitOfferBlock }
}
