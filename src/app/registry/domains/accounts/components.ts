import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const ACCOUNTS_COMPONENTS = {
  'merchants.logo': {
    id: 'merchants.logo',
    label: 'Merchant logo',
    products: ['PI', 'KIDS_PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/components/merchants/MerchantLogo.tsx',
    usedByScreens: ['pi.account.detail', 'pi.transaction.detail', 'pi.analytics.overview', 'pi.home.overview'],
    notes:
      'Renders a brand mark from the merchant directory in the shared roundel at 32px in lists, 42px on the Evo 2027 home and 64px on the transaction detail. Artwork is real brand path data baked from Simple Icons into merchantMarks.ts, plus the bundled official eMAG SVG; nothing is fetched from a merchant domain and no letter stand-ins are used.',
  },
  'transactions.avatar': {
    id: 'transactions.avatar',
    label: 'Transaction avatar',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/components/transactions/TransactionAvatar.tsx',
    usedByScreens: ['pi.home.overview', 'pi.account.detail', 'pi.card.detail', 'pi.transaction.detail'],
    notes:
      "Single decision point for a transaction's leading visual. The identity presentation shows the account pair for own-account transfers and currency exchanges, the merchant mark for card purchases, counterparty initials with an out/in badge for payments, and the PFM category icon for activity with no counterparty (ATM cash, cash deposit, bank fee, wallet top-up, unbrandable card purchase). The category presentation forces the PFM icon and is what the PFM surfaces use.",
  },
  'transactions.party-avatar': {
    id: 'transactions.party-avatar',
    label: 'Transaction party avatar',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/components/transactions/TransactionPartyAvatar.tsx',
    usedByScreens: ['pi.account.detail', 'pi.transaction.detail'],
    notes:
      'Counterparty initials on a tint derived deterministically from the name, with a corner badge carrying the direction: an arrow for money sent, a plus for money received.',
  },
  'transactions.pair-avatar': {
    id: 'transactions.pair-avatar',
    label: 'Transaction pair avatar',
    products: ['PI'],
    designSystems: ['current'],
    status: 'mock-driven',
    componentPath: 'src/app/components/transactions/TransactionPairAvatar.tsx',
    usedByScreens: ['pi.account.detail', 'pi.transaction.detail'],
    notes:
      "Two overlapping roundels for a movement between the customer's own money — payer behind, destination in front. Accounts show a product glyph, currency exchanges show the two flags.",
  },
  'accounts.action-bar': {
    id: 'accounts.action-bar',
    label: 'Account action bar',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/accounts/AccountActionBar.tsx',
    usedByScreens: ['pi.account.detail', 'pi.analytics.overview'],
    notes:
      'Reusable 1-4 item action bar with shared 32px icon slot, 14px/15px label contract, and page-level alignment options.',
  },
  'accounts.carousel-indicator': {
    id: 'accounts.carousel-indicator',
    label: 'Account carousel indicator',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/accounts/AccountCarouselIndicator.tsx',
    usedByScreens: ['pi.account.detail', 'platform.design-system'],
    notes:
      '32px-tall dot rail for the account/product carousel: up to 4 items render as individual dots, more than 4 collapses to a sliding 5-dot window with 4px mini dots at either end. Active dot is a 30x6 rounded rectangle; inactive dots are 6x6.',
  },
  'accounts.details-info': {
    id: 'accounts.details-info',
    label: 'Account details information screen',
    products: ['PI'],
    designSystems: ['current'],
    status: 'partial',
    componentPath: 'src/app/screens/accounts/AccountDetailsInfoScreen.tsx',
    usedByScreens: ['pi.account.details-info'],
    notes:
      'Uses AccountDetailsInfoField rows for the account-number-with-icon variant and default title/subtitle fields.',
  },
  'accounts.details-info-field': {
    id: 'accounts.details-info-field',
    label: 'Account details info field',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/accounts/AccountDetailsInfoField.tsx',
    usedByScreens: ['pi.account.details-info'],
    notes:
      '80px reusable Account Details title/subtitle row with 4px internal title-to-subtitle gap, 16px normal title, 16px bold subtitle, and optional trailing-icon variant.',
  },
  'accounts.transaction-search': {
    id: 'accounts.transaction-search',
    label: 'Account transaction search',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/accounts/AccountSearchBar.tsx',
    usedByScreens: ['pi.account.detail'],
    notes:
      'Searches the current account transaction list, uses 32x32 search and filter/clear icon slots with icon-driven 32px height, swaps the filter icon for a clear-results action while a query is active, and supports the Meniga `Type=Active remove filters` state from node `1517:12655` with teal filter icon plus 14px bold `REMOVE FILTERS` action. Keeps the search bar pinned at the top of the list.',
  },
  'accounts.transaction-row': {
    id: 'accounts.transaction-row',
    label: 'Account transaction row',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/accounts/AccountTransactionRow.tsx',
    usedByScreens: ['pi.account.detail'],
    notes:
      'Renders account transactions with a PFM category badge sourced from the shared PFM category map, fixed date/icon spacing, 18px transaction label line-height, 22px amount line-height, and 16px list spacing around month dividers in Account Detail. Its optional split-interaction mode opens PFM recategorization from the icon while the detail column preserves Transaction Details navigation.',
  },
  'transactions.detail': {
    id: 'transactions.detail',
    label: 'Transaction detail screen',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/payments/DomesticPaymentFlowScreens.tsx',
    usedByScreens: ['pi.transaction.detail'],
    notes:
      'Shows transaction amount, a transaction-derived PFM category pill with the shared PFM icon glyph, category actions, spending insight, details, a connected Change category sheet, and a Redo payment entry into domestic payment.',
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
