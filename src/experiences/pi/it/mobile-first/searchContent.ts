import type { ProductCounts } from '@/app/state/demoTypes'
import {
  getAccountLedgerMovements,
  getAccountLedgerRecord,
  type MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts'
import { buildLoanPortfolio } from '@/features/credit/mobileFirstLoans'
import { hasMobileFirstInvestmentHoldings } from '@/features/investments/mobileFirstInvestments'
import { securities } from '@/features/investments/mobileFirstSecurities'
import { normalizeSearchQuery, type SearchEntry, type SearchTarget } from '@/features/search/mobileFirstSearch'
import { CARD_STATUS_LABELS, type ItalyCard, type ItalyCardMovement } from './cardsContent'
import { getCardLedgerMovements, getCardLedgerRecord } from '@/features/cards/mobileFirstCards'
import { MOBILE_FIRST_COMMERCIAL_PRODUCTS, MOBILE_FIRST_PRODUCT_CATEGORIES } from './content'
import { investmentFunds } from './investmentsFundsContent'
import {
  INVESTMENT_MENU_OPERATIONS,
  INVESTMENT_MENU_SERVICES,
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_TAB_DESTINATIONS,
} from './investmentsOverviewContent'
import { MOBILE_FIRST_OPERATION_GROUPS, MOBILE_FIRST_OPERATION_QUICK_ACTIONS } from './operationsContent'
import { MOBILE_FIRST_TAB_CONTENT } from './productTabContent'
import { PROFILE_BRANCHES } from './profileContent'
import { profileSupportTopics } from './profileServicesContent'
import { SETTINGS_MENU } from './profileSettingsContent'
import { ITALY_INSURANCE_POLICIES } from './insuranceContent'
import { insurancePremiumCents } from '@/features/insurance/mobileFirstInsurance'

export interface ItalySearchIndexInput {
  /** All eligible accounts, including those outside the homepage favorites. */
  accounts: readonly MobileFirstAccountRecord[]
  /** Current cards hub snapshot, including cards outside the homepage favorites. */
  cards: readonly ItalyCard[]
  cardMovements?: Readonly<Record<string, readonly ItalyCardMovement[]>>
  productCounts: ProductCounts
}

// Navigation metadata mirrors the existing profile hub and PFM tabs. Search contains no screen imports.
const PROFILE_AREAS = [
  ['I tuoi dati', 'personal', ['Dati personali', 'Anagrafica']],
  ['La tua banca', 'bank', ['Filiale', 'Consulente']],
  ['Supporto', 'support', ['Assistenza', 'Aiuto']],
  ['Rubrica', 'contacts', ['Contatti', 'Beneficiari']],
  ['Impostazioni', 'settings', ['Preferenze']],
  ['Mobile Token', 'token', ['Autorizzazioni']],
  ['Documenti', 'documents', ['Archivio', 'Contratti']],
  ['Sicurezza', 'security', ['PIN', 'Mobile Code', 'Face ID']],
  ['Comunicazioni', 'communications', ['Messaggi', 'Notifiche', 'Pratiche']],
  ['Appuntamenti', 'appointments', ['Prenotazione', 'Consulente']],
  ['Trova Filiali', 'branches', ['ATM', 'Sportello']],
  ['My Apps', 'apps', ['Applicazioni']],
  ['Iniziative e promo', 'promotions', ['Promozioni']],
  ['Il tuo profilo', 'hub', ['Area personale']],
] as const

const PFM_TABS = ['Bilancio familiare', 'Budget', 'Patrimonio'] as const
const CARD_KIND_LABELS = { debit: 'Carta di debito', credit: 'Carta di credito', prepaid: 'Carta prepagata' } as const
const slug = (label: string) => normalizeSearchQuery(label).replace(/ /g, '-')

/** Adapt existing Italy content and the caller's current portfolio into searchable destinations. */
export function createItalySearchIndex({
  accounts,
  cards,
  cardMovements: _legacyCardMovements,
  productCounts,
}: ItalySearchIndexInput): SearchEntry[] {
  const entries: SearchEntry[] = []

  for (const sourceAccount of accounts.filter((record) => record.imported || productCounts.accounts > 0)) {
    const account = getAccountLedgerRecord(sourceAccount)
    entries.push({
      id: `account:${account.number}`,
      category: 'accounts',
      title: account.name,
      subtitle: `${account.imported ? 'Conto importato' : 'Conto corrente'} · ${account.number}`,
      keywords: [account.iban ?? '', account.bank ?? '', 'Conti', 'Saldo', 'IBAN'],
      amount: account.balance,
      currency: 'EUR',
      target: { kind: 'account', accountNumber: account.number },
    })
    for (const movement of getAccountLedgerMovements(account.number)) {
      entries.push({
        id: `account-movement:${account.number}:${movement.id}`,
        category: 'movements',
        title: movement.name,
        subtitle: `${movement.category} · ${account.name} · ${account.number} · ${movement.date}`,
        keywords: [
          'Movimenti',
          'Conto',
          account.number,
          movement.subcategory ?? '',
          movement.note ?? '',
          ...(movement.splits?.map((split) => split.category) ?? []),
        ],
        amount: movement.amount,
        currency: 'EUR',
        target: { kind: 'account', accountNumber: account.number, movementId: movement.id },
      })
    }
  }

  // The existing hub includes prepaid cards alongside debit/credit holdings; it has no separate prepaid count.
  const cardsAccessible = productCounts.debitCards + productCounts.creditCards + productCounts.mealCards > 0
  for (const sourceCard of cardsAccessible ? cards : []) {
    const card = getCardLedgerRecord(sourceCard)
    const title = card.nickname?.trim() || card.name
    entries.push({
      id: `card:${card.id}`,
      category: 'cards',
      title,
      subtitle: `${CARD_KIND_LABELS[card.kind]} · •••• ${card.lastFour} · ${CARD_STATUS_LABELS[card.status]}`,
      keywords: ['Carte', card.name, card.holder],
      amount: card.kind === 'prepaid' ? card.balance : card.available,
      currency: 'EUR',
      target: { kind: 'card', cardId: card.id },
    })
    for (const movement of getCardLedgerMovements(card.id)) {
      entries.push({
        id: `card-movement:${card.id}:${movement.id}`,
        category: 'movements',
        title: movement.name,
        subtitle: `${movement.category} · ${title} · •••• ${card.lastFour} · ${movement.date}`,
        keywords: [
          'Movimenti',
          'Carta',
          card.name,
          card.lastFour,
          movement.subcategory ?? '',
          movement.note ?? '',
          ...(movement.splitCategories?.map((split) => split.category) ?? []),
        ],
        amount: movement.amount,
        currency: 'EUR',
        target: { kind: 'card', cardId: card.id, movementId: movement.id },
      })
    }
  }

  const operations = [
    ...MOBILE_FIRST_OPERATION_QUICK_ACTIONS.map((operation) => ({ ...operation, group: 'Operazioni rapide' })),
    ...MOBILE_FIRST_OPERATION_GROUPS.flatMap((group) =>
      group.rows.map((operation) => ({ ...operation, group: group.title })),
    ),
  ]
  for (const operation of operations) {
    entries.push({
      id: `payment:${slug(operation.label)}`,
      category: 'payments',
      title: operation.label,
      subtitle: operation.group,
      keywords: ['Operazioni', 'Pagamenti'],
      icon: operation.icon,
      target: { kind: 'payment', label: operation.label },
    })
  }

  for (const category of MOBILE_FIRST_PRODUCT_CATEGORIES) {
    entries.push({
      id: `category:${slug(category)}`,
      category: 'products',
      title: category,
      subtitle: 'Prodotti e servizi',
      target: { kind: 'category', category },
    })
  }
  MOBILE_FIRST_COMMERCIAL_PRODUCTS.forEach((product, index) => {
    const category = MOBILE_FIRST_PRODUCT_CATEGORIES[index] ?? 'Mutui e Prestiti'
    entries.push({
      id: `offer:${slug(product.title)}`,
      category: 'products',
      title: product.title,
      subtitle: product.description,
      keywords: [category],
      target: { kind: 'category', category },
    })
  })
  for (const [category, content] of Object.entries(MOBILE_FIRST_TAB_CONTENT)) {
    for (const product of content.products) {
      entries.push({
        id: `product:${slug(category)}:${slug(product.title)}`,
        category: 'products',
        title: product.title,
        subtitle: product.description,
        keywords: [category],
        icon: product.image,
        target: { kind: 'category', category: category as Extract<SearchTarget, { kind: 'category' }>['category'] },
      })
    }
  }
  for (const loan of buildLoanPortfolio(productCounts)) {
    entries.push({
      id: `loan:${loan.id}`,
      category: 'products',
      title: loan.name,
      subtitle: `${loan.kind} · ${loan.number}`,
      keywords: ['Finanziamenti', 'Mutui e Prestiti', 'Debito residuo', 'Rate'],
      amount: loan.outstanding,
      currency: 'EUR',
      target: { kind: 'loan', loanId: loan.id },
    })
  }

  for (const policy of ITALY_INSURANCE_POLICIES) {
    entries.push({
      id: `insurance:${policy.id}`,
      category: 'products',
      title: policy.name,
      subtitle: `Polizza ${policy.number} · ${policy.company} · Premio ${policy.frequency.toLocaleLowerCase('it-IT')}`,
      keywords: [
        'Polizze assicurative',
        'Assicurazione',
        policy.protection?.holder ?? '',
        ...(policy.protection?.guarantees ?? []),
        ...policy.modules.flatMap((module) => [module.name, ...module.guarantees]),
      ],
      amount: insurancePremiumCents(policy) / 100,
      currency: 'EUR',
      target: { kind: 'insurance', policyId: policy.id },
    })
  }

  if (hasMobileFirstInvestmentHoldings(productCounts.investments)) {
    entries.push({
      id: 'investments:overview',
      category: 'investments',
      title: 'Investimenti',
      subtitle: 'Il tuo portafoglio',
      target: { kind: 'investments' },
    })
    for (const { title, destination } of [
      ...INVESTMENT_PORTFOLIO_TABS.map((title) => ({ title, destination: INVESTMENT_TAB_DESTINATIONS[title] })),
      ...INVESTMENT_MENU_OPERATIONS,
      ...INVESTMENT_MENU_SERVICES,
    ]) {
      entries.push({
        id: `investments:section:${slug(title)}`,
        category: 'investments',
        title,
        subtitle: 'Investimenti',
        target: { kind: 'investments', destination },
      })
    }
    for (const fund of investmentFunds) {
      entries.push({
        id: `investments:fund:${fund.id}`,
        category: 'investments',
        title: fund.name,
        subtitle: `${fund.manager} · ${fund.category}`,
        keywords: ['Fondi', fund.isin, fund.type],
        target: { kind: 'investments', destination: { area: 'funds', view: 'fund', instrument: fund.id } },
      })
    }
    for (const security of securities) {
      entries.push({
        id: `investments:security:${security.id}`,
        category: 'investments',
        title: security.name,
        subtitle: `${security.kind} · ${security.market}`,
        keywords: ['Titoli', security.isin, security.symbol],
        target: { kind: 'investments', destination: { area: 'securities', view: 'security', instrument: security.id } },
      })
    }
  }

  for (const tab of PFM_TABS) {
    entries.push({
      id: `pfm:${slug(tab)}`,
      category: 'topics',
      title: tab,
      subtitle: 'Spese, entrate e risorse',
      keywords: ['Analisi', 'Risparmi'],
      target: { kind: 'pfm', tab },
    })
  }
  for (const [title, area, keywords] of PROFILE_AREAS) {
    entries.push({
      id: `profile:${area}`,
      category: 'topics',
      title,
      subtitle: 'Profilo e servizi',
      keywords,
      target: { kind: 'profile', area },
    })
  }
  for (const group of SETTINGS_MENU) {
    for (const [title, id] of group.rows) {
      entries.push({
        id: `profile:setting:${id}`,
        category: 'topics',
        title,
        subtitle: `Impostazioni · ${group.title}`,
        target: { kind: 'profile', area: 'settings' },
      })
    }
  }
  for (const topic of profileSupportTopics) {
    entries.push({
      id: `profile:support:${slug(topic.title)}`,
      category: 'topics',
      title: topic.title,
      subtitle: topic.description,
      keywords: [topic.category, ...topic.articles],
      target: { kind: 'profile', area: 'support' },
    })
  }
  for (const branch of PROFILE_BRANCHES) {
    entries.push({
      id: `profile:branch:${branch.id}`,
      category: 'topics',
      title: branch.name,
      subtitle: branch.address,
      keywords: ['Filiale', ...branch.services],
      target: { kind: 'profile', area: 'branches' },
    })
  }

  return [...new Map(entries.map((entry) => [entry.id, entry])).values()]
}
