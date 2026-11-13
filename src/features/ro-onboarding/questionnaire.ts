export const FUND_SOURCES = [
  'Salariu',
  'Pensie',
  'Împrumut bancar',
  'Repartizare profit/dividende',
  'Cadou/Donatie',
  'Vanzare proprietate',
  'Depozit/Economii',
] as const
export const BANK_PURPOSES = [
  'Încasarea salariului',
  'Executarea operațiunilor curente',
  'Contractarea de împrumuturi sau produse de credit',
  'Economii/depozite',
] as const
export const TRANSACTION_TYPES = ['ORDINE DE PLATA/CU CARDUL', 'NUMERAR', 'ÎN/DIN CONTURI INTERNAȚIONALE'] as const
export const SOURCE_COUNTRIES = ['NU ESTE CAZUL', 'COLOMBIA', 'OPTION 3', 'OPTION 4', 'OPTION 5'] as const
export const TRANSACTION_GROUPS = [
  [
    'bank',
    'TRANZACȚII BANCARE',
    'Ordin de Plată Lunar',
    '1. Cate tranzactii lunare se efectueaza prin transfer bancar?',
    '2. Care este volumul tau lunar de tranzactii prin transfer Bancar?',
  ],
  [
    'cash',
    'TRANZACȚII CASH',
    'Plată Cash Lunară',
    '1. Cate tranzactii cash lunare se efectueaza?',
    '2. Care este volumul tau lunar de tranzactii cash?',
  ],
  [
    'international',
    'TRANZACȚII INTERNAȚIONALE',
    'Ordin de Plată Internațional Lunar',
    '1. Cate tranzactii lunare se efectueaza in/din conturi internationale?',
    '2. Care este volumul tau lunar de tranzactii prin transfer bancar?',
  ],
] as const
export function selectedOptions(values: Record<string, string>, key: string): string[] {
  return values[key]?.split('|').filter(Boolean) || []
}
export function validTransactionDetails(values: Record<string, string>): boolean {
  return TRANSACTION_GROUPS.every(
    ([key], index) =>
      !selectedOptions(values, 'transactions').includes(TRANSACTION_TYPES[index] ?? '') ||
      (/^[1-9][0-9]{0,5}$/.test(values[`${key}Count`] ?? '8') &&
        /^[0-9]+([.,][0-9]{1,2})?$/.test(values[`${key}Volume`] ?? '1300') &&
        Number((values[`${key}Volume`] ?? '1300').replace(',', '.')) > 0),
  )
}
export function questionnaireComplete(values: Record<string, string>): boolean {
  return selectedOptions(values, 'funds').length > 0 && selectedOptions(values, 'purpose').length > 0
}
export function transactionsComplete(values: Record<string, string>, accepted: boolean): boolean {
  return (
    accepted &&
    selectedOptions(values, 'transactions').length > 0 &&
    selectedOptions(values, 'countries').length > 0 &&
    (values.foreignIncome === 'Da' || values.foreignIncome === 'Nu') &&
    validTransactionDetails(values)
  )
}
