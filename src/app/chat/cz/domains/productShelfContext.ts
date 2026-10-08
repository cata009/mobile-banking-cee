import { getProductCardSheetConfig, getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import { type CoAppingRichBlock } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import {
  CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX,
  buildCzNavigateAction,
  type CzChatSmartReplyOptions,
} from '../helpers'
import type { buildCzProfileChatContext } from './profileContext'
import type { buildCzCardsChatContext } from './cardsContext'
/** Domain-owned derivation used once when a chat resolver snapshots its input. */
export function buildCzProductShelfChatContext(
  context: Pick<CzChatSmartReplyOptions, 'country'> &
    Pick<ReturnType<typeof buildCzProfileChatContext>, 'primaryCard'> &
    Pick<ReturnType<typeof buildCzCardsChatContext>, 'creditAvailable'>,
) {
  const { country, primaryCard, creditAvailable } = context
  const productsMenu = getProductsMenuForCountry(country)

  const productShelfCards = productsMenu.products

  const productShelfTitle = productsMenu.productsTitle || 'OUR PRODUCTS'

  const productShelfLines = productShelfCards.length
    ? productShelfCards
        .map((card) => {
          const title = card.title.replace(/\n/g, ' ')
          const sheetOptions = getProductCardSheetConfig(card.id, country)
            .options.map((option) => option.title)
            .join(', ')
          return `- **${title}:** ${sheetOptions}.`
        })
        .join('\n')
    : 'This market does not expose product shelf cards in the current simulation profile.'

  const productShelfBlock: CoAppingRichBlock = {
    type: 'product-cards',
    title: 'Product shelf',
    body: `Open Products > ${productShelfTitle} to continue from the real shelf.`,
    products: productShelfCards.slice(0, 5).map((card, index) => {
      const title = card.title.replace(/\n/g, ' ')
      const subtitle = getProductCardSheetConfig(card.id, country)
        .options.slice(0, 2)
        .map((option) => option.title)
        .join(', ')

      return {
        id: `product-shelf-${card.id}`,
        title,
        subtitle,
        meta: 'Open Products',
        tone: index === 0 ? 'blue' : index === 1 ? 'dark' : 'neutral',
        action: buildCzNavigateAction(
          `${CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX}${card.id}`,
          'Open Products',
          'products',
        ),
      }
    }),
  }

  const productsBlock: CoAppingRichBlock = {
    type: 'product-cards',
    title: 'Relevant product areas',
    body: 'The assistant should explain the choice first, then hand off to the real product surface.',
    products: [
      {
        id: 'products',
        title: 'Products',
        subtitle: 'Accounts, cards, loans, savings',
        meta: 'Open catalog',
        tone: 'blue',
        action: buildCzNavigateAction('open-products', 'Open Products', 'products'),
      },
      {
        id: 'card-detail',
        title: 'Credit card',
        subtitle: primaryCard ? `${creditAvailable} free to spend` : 'Card controls',
        meta: 'Open card',
        tone: 'dark',
        action: buildCzNavigateAction('open-card-detail', 'Open Card', 'card-detail'),
      },
    ],
  }
  return { productShelfTitle, productShelfLines, productShelfBlock, productsBlock }
}
