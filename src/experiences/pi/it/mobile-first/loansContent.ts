import type { MortgageSimulation } from '@/features/credit/mobileFirstLoans'

export const LOAN_VARIABLE_DISCLAIMER =
  'Per i finanziamenti e mutui "a tasso variabile", i valori delle rate future sono indicativi. Questi valori potranno risultare diversi rispetto a quelli qui indicati, qualora il tasso di interesse cambi. La visualizzazione delle informazioni è relativa all’ultimo tasso utilizzato. La presente rappresentazione non è valida come rendicontazione periodica.'
export const LOAN_DEBT_DISCLAIMER =
  'Per i Mutui, il debito residuo è calcolato in base al piano di ammortamento del finanziamento e a tale importo devono essere aggiunte le eventuali somme dovute per rate scadute e non pagate oltre ai relativi interessi di mora ed eventuali rate sospese.'
export const MORTGAGE_PROMOTIONAL_DISCLAIMER =
  'Nel processo di simulazione sono presenti contenuti con finalità promozionale.'
export const MORTGAGE_FULL_DISCLAIMER =
  'Messaggio pubblicitario con finalità promozionale. Per le condizioni contrattuali ed economiche del prodotto Mutuo UniCredit fare riferimento alle Informazioni Generali sul Credito Immobiliare ai Consumatori (IGCIC) disponibili in filiale. Condizioni economiche variabili in base a finalità, durata e Loan To Value (rapporto tra l’importo del mutuo richiesto ed il minore tra il prezzo di acquisto dell’immobile e il valore dell’immobile riportato nella perizia disposta dalla Banca). Importo massimo finanziabile variabile in base alla finalità.'
export const MORTGAGE_STEP_QUESTIONS = [
  'Per cosa vuoi richiedere un mutuo?',
  'È la tua prima casa?',
  'Quanto vale l’immobile?',
  'Di quanto hai bisogno?',
  'Qual è la tua data di nascita?',
  'Quanti anni durerà il tuo mutuo?',
] as const
export const CREDIT_PREFERENCES_STORAGE_KEY = 'pi-it-mobile-first-credit-preferences-v1'
export const CREDIT_SIMULATIONS_STORAGE_KEY = 'pi-it-mobile-first-credit-simulations-v1'
const baseDraft = {
  purpose: 'Acquisto',
  firstHome: true,
  propertyValue: 165000,
  principal: 80000,
  birthDate: '1998-06-28',
  years: 30,
}
export const INITIAL_MORTGAGE_SIMULATIONS: readonly MortgageSimulation[] = [
  {
    id: 'simulation-3',
    name: 'Simulazione test mutuo 3',
    createdAt: '2025-02-21T12:05:13',
    draft: { ...baseDraft, principal: 150000, years: 20 },
    rates: ['Fisso', 'Variabile', 'Variabile con CAP', 'Variabile BCE'],
  },
  {
    id: 'simulation-2',
    name: 'Simulazione test mutuo 2',
    createdAt: '2025-02-10T09:05:05',
    draft: { ...baseDraft, principal: 165000, years: 25 },
    rates: ['Fisso', 'Variabile', 'Variabile con CAP', 'Variabile BCE'],
  },
  {
    id: 'simulation-1',
    name: 'Simulazione test mutuo 1',
    createdAt: '2024-11-10T12:05:13',
    draft: { ...baseDraft, principal: 150000, years: 20 },
    rates: ['Fisso', 'Variabile', 'Variabile con CAP', 'Variabile BCE'],
    expired: true,
  },
]
