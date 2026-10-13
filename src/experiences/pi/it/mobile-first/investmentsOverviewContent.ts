import type { InvestmentDestination } from './investmentsNavigation'

export const INVESTMENT_PORTFOLIO_TABS = [
  'Overview',
  'Titoli',
  'Fondi',
  'Prodotti di risparmio',
  'Prodotti assicurativi',
  'Gestione di portafogli',
  'Fondi pensione',
  'Posizione fiscale',
] as const

export const INVESTMENT_TAB_DESTINATIONS: Record<string, InvestmentDestination> = {
  Titoli: { area: 'securities', view: 'portfolio' },
  Fondi: { area: 'funds', view: 'portfolio' },
  'Prodotti di risparmio': { area: 'services', view: 'savings' },
  'Prodotti assicurativi': { area: 'services', view: 'insurance' },
  'Gestione di portafogli': { area: 'services', view: 'managed' },
  'Fondi pensione': { area: 'services', view: 'pension' },
  'Posizione fiscale': { area: 'services', view: 'fiscal' },
}

/** Figma uses the same five sample publications for each period variant. */
export const INVESTMENT_FOCUS_PUBLICATIONS = [
  { date: '04/02/2025', time: '09:27', subtitle: 'Leggi le novità del mattino' },
  { date: '03/02/2025', time: '17:27', subtitle: 'Leggi le novità della sera' },
  { date: '03/02/2025', time: '09:27', subtitle: 'Leggi le novità del mattino' },
  { date: '02/02/2025', time: '17:27', subtitle: 'Leggi le novità della sera' },
  { date: '02/02/2025', time: '09:27', subtitle: 'Leggi le novità del mattino' },
] as const

export const INVESTMENT_MENU_OPERATIONS: Array<{ title: string; destination: InvestmentDestination }> = [
  { title: 'Vetrina Mercati', destination: { area: 'securities', view: 'markets' } },
  { title: 'Vetrina Fondi', destination: { area: 'funds', view: 'catalog' } },
  { title: 'Aste', destination: { area: 'securities', view: 'auctions' } },
]
export const INVESTMENT_MENU_SERVICES: Array<{ title: string; destination: InvestmentDestination }> = [
  { title: 'Aggiornamento intervista MIFID', destination: { area: 'services', view: 'mifid' } },
  { title: 'Pacchetti aggiuntivi', destination: { area: 'services', view: 'packages' } },
]
