/** Italy transaction taxonomy and evidence rules. Display glyphs belong to the experience adapter. */
export const ITALY_CATEGORY_VERSION = 2
export const ITALY_TRANSACTION_CATEGORIES = [
  { id: 'utilities', name: 'Utenze', aliases: [] },
  { id: 'taxes', name: 'Tasse e sanzioni', aliases: [] },
  { id: 'leisure', name: 'Tempo libero e viaggi', aliases: ['Tempo libero'] },
  { id: 'food', name: 'Alimentari e spesa', aliases: ['Alimentari e spese'] },
  { id: 'insurance', name: 'Assicurazioni', aliases: ['Assicurazioni e finanziamenti'] },
  { id: 'education', name: 'Istruzione', aliases: ['Scuola e formazione'] },
  { id: 'other', name: 'Altre spese', aliases: [] },
  { id: 'income', name: 'Entrate', aliases: ['Stipendio', 'Altre entrate', 'Rimborso', 'Rimborsi'] },
  { id: 'transfers', name: 'Trasferimenti', aliases: [] },
  { id: 'investments', name: 'Investimenti', aliases: ['Investimenti e patrimonio'] },
] as const
export type ItalyTransactionCategoryId = (typeof ITALY_TRANSACTION_CATEGORIES)[number]['id'] | 'custom'

export function getItalyTransactionCategory(name: string) {
  return ITALY_TRANSACTION_CATEGORIES.find(
    (category) => category.name === name || category.aliases.some((alias: string) => alias === name),
  )
}

export interface ItalyCategoryClassification {
  version: number
  source: 'merchant-rule' | 'unresolved' | 'provided' | 'user' | 'legacy-user'
  categoryId: ItalyTransactionCategoryId
  originalCategory: string
  ruleId?: string
  evidence: {
    merchantName?: string
    processor?: string
    reason:
      | 'named-merchant'
      | 'explicit-purpose'
      | 'underlying-merchant-unavailable'
      | 'provided-category'
      | 'user-selection'
      | 'legacy-edit-preserved'
      | 'insufficient-evidence'
  }
}
interface CategorizedTransaction {
  name: string
  category: string
  subcategory?: string
  classification?: ItalyCategoryClassification
}

export function preserveItalyTransactionCategory(
  event: CategorizedTransaction,
  source: 'provided' | 'user' | 'legacy-user',
): ItalyCategoryClassification {
  return {
    version: ITALY_CATEGORY_VERSION,
    source,
    categoryId: getItalyTransactionCategory(event.category)?.id ?? 'custom',
    originalCategory: event.category,
    evidence: {
      reason:
        source === 'user' ? 'user-selection' : source === 'legacy-user' ? 'legacy-edit-preserved' : 'provided-category',
    },
  }
}

export function classifyItalyTransaction<T extends CategorizedTransaction>(event: T): T {
  if (event.classification && ['user', 'legacy-user', 'provided'].includes(event.classification.source)) return event
  const merchant = event.name.trim().toLocaleLowerCase('it-IT')
  const rules = [
    {
      names: ['netflix', 'spotify'],
      category: 'Tempo libero e viaggi',
      subcategory: 'Abbonamenti digitali',
      ruleId: 'digital-subscription',
      reason: 'named-merchant',
    },
    {
      names: ['starbucks'],
      category: 'Alimentari e spesa',
      subcategory: 'Bar e caffetterie',
      ruleId: 'coffee-shop',
      reason: 'named-merchant',
    },
    {
      names: ['edison energia'],
      category: 'Utenze',
      subcategory: 'Energia',
      ruleId: 'energy-provider',
      reason: 'named-merchant',
    },
    {
      names: ['imposta di bollo'],
      category: 'Tasse e sanzioni',
      subcategory: 'Imposta di bollo',
      ruleId: 'stamp-tax',
      reason: 'explicit-purpose',
    },
    {
      names: ['premio assicurativo'],
      category: 'Assicurazioni',
      subcategory: 'Premio assicurativo',
      ruleId: 'insurance-premium',
      reason: 'explicit-purpose',
    },
    {
      names: ['acquisto libri'],
      category: 'Istruzione',
      subcategory: 'Libri',
      ruleId: 'books',
      reason: 'explicit-purpose',
    },
  ] as const
  const rule = rules.find((candidate) => candidate.names.some((name: string) => name === merchant))
  if (rule)
    return {
      ...event,
      category: rule.category,
      subcategory: rule.subcategory,
      classification: {
        version: ITALY_CATEGORY_VERSION,
        source: 'merchant-rule',
        categoryId: getItalyTransactionCategory(rule.category)!.id,
        originalCategory: event.classification?.originalCategory ?? event.category,
        ruleId: rule.ruleId,
        evidence: { merchantName: event.name, reason: rule.reason },
      },
    }
  if (merchant === 'paypal' || event.category === 'Altre spese')
    return {
      ...event,
      category: 'Altre spese',
      classification: {
        version: ITALY_CATEGORY_VERSION,
        source: 'unresolved',
        categoryId: 'other',
        originalCategory: event.category,
        evidence:
          merchant === 'paypal'
            ? { processor: 'PayPal', reason: 'underlying-merchant-unavailable' }
            : { reason: 'insufficient-evidence' },
      },
    }
  return { ...event, classification: preserveItalyTransactionCategory(event, 'provided') }
}

/** Unmarked old events are regenerated only when their identity and values match a known fixture. */
export function migrateItalyTransactionCategory<T extends CategorizedTransaction>(event: T, baseline?: T): T {
  if (event.classification) {
    if (['user', 'legacy-user', 'provided'].includes(event.classification.source)) return event
    return event.classification.version >= ITALY_CATEGORY_VERSION ? event : classifyItalyTransaction(event)
  }
  if (
    baseline &&
    event.name === baseline.name &&
    (event.category === baseline.classification?.originalCategory || event.category === baseline.category) &&
    (!event.subcategory || event.subcategory === baseline.subcategory)
  )
    return classifyItalyTransaction(event)
  return { ...event, classification: preserveItalyTransactionCategory(event, 'legacy-user') }
}
