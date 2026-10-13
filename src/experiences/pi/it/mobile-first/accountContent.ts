/** Reference content for Italian Conti, Figma page 23122:529199. */
import {
  getAccountLedgerMovements,
  getAccountLedgerRecord,
  type MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts'
import { getItalyFinancialSnapshot } from '@/features/finance/italyFinancials'
export interface AccountTransaction {
  readonly name: string
  readonly category: string
  readonly amount: number
  readonly icon: 'utilities' | 'taxes' | 'expenses' | 'incomes'
}

export const ACCOUNT_ACTIONS = [
  { name: 'Bonifico', description: 'Prepara un bonifico dal conto selezionato.' },
  { name: 'Gestione conto', description: 'Consulta i dati e i servizi del conto selezionato.' },
  { name: 'Ultimi pagamenti', description: 'Consulta i movimenti e gli ultimi pagamenti del conto.' },
  { name: 'Condividi IBAN', description: 'Consulta i riferimenti del conto selezionato.' },
] as const

export const ACCOUNT_REFERENCE_DATE = getItalyFinancialSnapshot().asOf
export const ACCOUNT_MOVEMENTS = getAccountLedgerMovements('000012345').filter((row) => !row.pending)
export const ACCOUNT_PENDING_MOVEMENTS = getAccountLedgerMovements('000012345').filter((row) => row.pending)
export const ACCOUNT_TRANSACTION_GROUPS = [...new Set(ACCOUNT_MOVEMENTS.map((row) => row.date))].map((date) => ({
  date:
    date === ACCOUNT_REFERENCE_DATE
      ? 'Oggi'
      : new Date(`${date}T12:00:00Z`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', timeZone: 'UTC' }),
  transactions: ACCOUNT_MOVEMENTS.filter((row) => row.date === date),
}))
export const ACCOUNT_DIRECTORY: readonly MobileFirstAccountRecord[] = getItalyFinancialSnapshot()
  .accounts.filter((account) => !account.imported)
  .map((account) => getAccountLedgerRecord({ ...account, balance: 0 }))
export const ACCOUNT_IMPORTED_DIRECTORY: readonly MobileFirstAccountRecord[] = getItalyFinancialSnapshot()
  .accounts.filter((account) => account.imported)
  .map((account) => getAccountLedgerRecord({ ...account, balance: 0 }))
export const ACCOUNT_CATEGORIES = [
  'Assicurazioni e finanziamenti',
  'Bambini',
  'Animali domestici',
  'Tasse e sanzioni',
  'Casa',
  'Utenze',
  'Trasporti',
  'Scuola e corsi di formazione',
  'Medicine e spese sanitarie',
  'Shopping',
  'Cura della persona',
  'Tempo libero e viaggi',
  'Cibo e spese',
  'Altre spese',
  'Investimenti',
  'Patrimonio',
  'Entrate',
] as const
export const ACCOUNT_CONDITIONS: Readonly<Record<string, readonly [string, string][]>> = {
  'Tasso creditore': [
    ['Scaglione', '0,000'],
    ['Tasso', '0,050 %'],
    ['Tipo tasso', 'Esplicito'],
    ['Spread percentuale su parametro indicativo', '0,000'],
    ['Parametro di riferimento indicativo', '0,000'],
  ],
  'Tasso extrafido': [
    ['Tasso', '19,550 %'],
    ['Tipo tasso', 'Esplicito'],
    ['Spread percentuale su parametro indicativo', '0,000'],
    ['Parametro di riferimento indicativo', '0,000'],
  ],
  Spese: [
    ['Spese fisse di chiusura trimestrale', '0,00 €'],
    ['Spese di rimborso forfettario trimestrale', '0,00 €'],
    ['Numero di operazioni esenti', '1'],
    ['Spese per operazione', '0,60 €'],
  ],
  'Versamento assegni': [
    ['Assegni circolari da altre banche', '0'],
    ['Assegni bancari da nostra banca', '0'],
    ['Assegni bancari da altre banche', '0'],
  ],
  'Commissioni per i bonifici da internet': [
    ['Bonifici su nostra banca', '0,00 €'],
    ['Bonifici verso altre banche', '0,00 €'],
  ],
  'Corrispettivo per servizio di disponibilità immediata fondi per cassa': [['Percentuale trimestre', '0,000']],
}
