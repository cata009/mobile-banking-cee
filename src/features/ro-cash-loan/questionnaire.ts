/** Copy aliases retain the shared questionnaire's stable selection values. */
const LOAN_LABELS: Record<string, readonly string[]> = {
  funds: [
    'Salariu sau plăți pentru servicii prestate',
    'Pensie sau forme de asistență socială',
    'Împrumut bancar',
    'Distribuția profitului/dividendelor',
    'Sprijin sau contribuții din partea familiei',
    'imobiliare de vânzare, proprietăți, bunuri',
    'depozit/economii',
  ],
  transactions: ['TRANSFERURI / PLAȚI CU CARDUL', 'TRANZACȚII Cash', 'În/DIN CONTURI internaționalE'],
}
export function loanQuestionnaireLabel(key: string, index: number, fallback: string): string {
  return LOAN_LABELS[key]?.[index] || fallback
}
