import type { PfmCategoryName } from '@/data/pfmCategories'

export type PfmTab = 'Bilancio familiare' | 'Budget' | 'Patrimonio'
export interface PfmCategory {
  name: string
  glyph: PfmCategoryName
  color: string
  amount: number
  share?: number
}
export interface PfmMovement {
  id: string
  name: string
  category: string
  subcategory: string
  amount: number
  date: string
  group: string
  note?: string
}

// Demo fixtures transcribed from the PFM frames beside 24251:126563.
// Figma contains independent illustrative totals; these are not live account data.
export const PFM_EXPENSE_CATEGORIES: PfmCategory[] = [
  { name: 'Cura della persona', glyph: 'Healthcare', color: '#dd1860', amount: 150 },
  { name: 'Casa', glyph: 'Home', color: '#388bca', amount: 110 },
  { name: 'Trasporti', glyph: 'Transportation', color: '#0d5870', amount: 79 },
  { name: 'Alimentari e spesa', glyph: 'Groceries', color: '#a33694', amount: 60 },
]
export const PFM_INCOME_CATEGORIES = [
  { name: 'Stipendio', amount: 800 },
  { name: 'Altre entrate', amount: 50 },
  { name: 'Rimborsi', amount: 50 },
]
export const PFM_BUDGET_CATEGORIES: PfmCategory[] = [
  { name: 'Assicurazioni e finanziamenti', glyph: 'Insurance', color: '#32a144', amount: 0 },
  { name: 'Tasse e sanzioni', glyph: 'Taxes and Penalties', color: '#7955a4', amount: 0 },
  PFM_EXPENSE_CATEGORIES[1]!,
  { name: 'Utenze', glyph: 'Utilities', color: '#546100', amount: 0 },
  PFM_EXPENSE_CATEGORIES[2]!,
  { name: 'Scuola e formazione', glyph: 'Education', color: '#624035', amount: 0 },
  { name: 'Salute', glyph: 'Healthcare', color: '#008576', amount: 0 },
  { name: 'Shopping', glyph: 'Shopping', color: '#af4c1c', amount: 0 },
  PFM_EXPENSE_CATEGORIES[0]!,
  { name: 'Tempo libero e viaggi', glyph: 'Leisure time', color: '#004f95', amount: 379 },
  { ...PFM_EXPENSE_CATEGORIES[3]!, name: 'Alimentari e spese' },
  { name: 'Altre spese', glyph: 'Uncategorized', color: '#535453', amount: 0 },
  { name: 'Investimenti e patrimonio', glyph: 'Investments', color: '#004c3d', amount: 0 },
  { name: 'Contanti', glyph: 'Wallet', color: '#806000', amount: 0 },
]
export const PFM_WEALTH_CATEGORIES: PfmCategory[] = [
  { name: 'Investimenti', glyph: 'Investments', color: '#004f95', amount: 951417.5, share: 50 },
  { name: 'Beni personali', glyph: 'Lifestyle', color: '#1961a0', amount: 285425.25, share: 15 },
  { name: 'Mezzi di trasporto', glyph: 'Transportation', color: '#2e6fa8', amount: 95141.75, share: 5 },
  { name: 'Proprietà immobiliari', glyph: 'Home', color: '#427db1', amount: 38056.7, share: 2 },
  { name: 'Altro', glyph: 'Uncategorized', color: '#6698c1', amount: 38056.7, share: 2 },
]
export const PFM_LIABILITIES: PfmCategory[] = [
  { name: 'Mutuo e prestito', glyph: 'Finance', color: '#9d1516', amount: 951417.5, share: 50 },
  { name: 'Carta di credito', glyph: 'Wallet', color: '#a92b2c', amount: 285425.25, share: 15 },
  { name: 'Liquidità', glyph: 'Wallet', color: '#b04546', amount: 95141.75, share: 5 },
  { name: 'Altro', glyph: 'Uncategorized', color: '#b9595a', amount: 38056.7, share: 2 },
]
export const PFM_MOVEMENTS: PfmMovement[] = [
  {
    id: 'fuel',
    name: 'Enerpetroli srl',
    category: 'Trasporti',
    subcategory: 'Carburante',
    amount: -50,
    date: '11/02/2025',
    group: '01 Maggio',
  },
  {
    id: 'flight',
    name: 'Ita airways',
    category: 'Trasporti',
    subcategory: 'Voli e traghetti',
    amount: -19,
    date: '11/02/2025',
    group: '28 Aprile',
  },
  {
    id: 'train',
    name: 'Trenitalia',
    category: 'Trasporti',
    subcategory: 'Treni',
    amount: -10,
    date: '11/02/2025',
    group: '28 Aprile',
  },
  {
    id: 'care',
    name: 'Cura della persona',
    category: 'Cura della persona',
    subcategory: 'Cura della persona',
    amount: -150,
    date: '11/02/2025',
    group: '01 Maggio',
  },
  {
    id: 'home',
    name: 'Casa',
    category: 'Casa',
    subcategory: 'Casa',
    amount: -110,
    date: '11/02/2025',
    group: '28 Aprile',
  },
  {
    id: 'groceries',
    name: 'Alimentari e spesa',
    category: 'Alimentari e spesa',
    subcategory: 'Alimentari e spesa',
    amount: -60,
    date: '11/02/2025',
    group: '28 Aprile',
  },
  {
    id: 'refund',
    name: 'Enerpetroli srl',
    category: 'Entrate',
    subcategory: 'Rimborso',
    amount: 50,
    date: '11/02/2025',
    group: '01 Maggio',
  },
  {
    id: 'salary',
    name: 'Accenture',
    category: 'Entrate',
    subcategory: 'Stipendio',
    amount: 800,
    date: '11/02/2025',
    group: '28 Aprile',
  },
  {
    id: 'income',
    name: 'Altre entrate',
    category: 'Entrate',
    subcategory: 'Altre entrate',
    amount: 50,
    date: '11/02/2025',
    group: '28 Aprile',
  },
]
export const PFM_RELATIONSHIPS = [
  { name: 'Rossi Mario', type: 'Genius Card', number: '4532-76XX-XXXX-1298', kind: 'card' },
  { name: 'Andrea Rossini', type: 'Conto personale - UniCredit', number: 'IT 123456789000000012', kind: 'account' },
  { name: 'Rossi Mario', type: 'UniCreditCard Flexia', number: '4532-76XX-XXXX-1298', kind: 'card' },
  { name: 'Rossi Mario', type: 'UniCreditCard Flexia', number: '4532-76XX-XXXX-1298', kind: 'card' },
] as const
