export type FundAction =
  'subscribe' | 'add' | 'redeem' | 'switch' | 'activate' | 'modify' | 'advance' | 'suspend' | 'reactivate' | 'revoke'
export type PlanStatus = 'inactive' | 'active' | 'suspended' | 'revoked'
export interface PacParameters {
  amount: number
  installments: number
  initial: number
  day: number
}
export interface SavingsParameters {
  average: number
  lower: number
  upper: number
  maximum: number
  day: number
}
export const defaultPacParameters: PacParameters = { amount: 100, installments: 74, initial: 1200, day: 4 }
export const defaultSavingsParameters: SavingsParameters = {
  average: 4000,
  lower: 2500,
  upper: 5000,
  maximum: 0,
  day: 1,
}
export function fundOperationMoney(input: {
  action: FundAction
  amount: number
  unit: 'amount' | 'shares'
  nav: number
  contract: string
  pac: PacParameters
}) {
  const monetary = ['subscribe', 'add', 'redeem', 'switch', 'advance'].includes(input.action)
  const contribution =
    input.action === 'advance'
      ? input.pac.amount
      : input.action === 'subscribe' && input.contract === 'PAC'
        ? input.pac.initial
        : input.unit === 'shares'
          ? input.amount * input.nav
          : input.amount
  const principalCents = monetary ? Math.round(contribution * 100) : 0
  const shares =
    monetary && input.nav > 0
      ? input.unit === 'shares' && ['redeem', 'switch'].includes(input.action)
        ? input.amount
        : principalCents / 100 / input.nav
      : 0
  const feeCents = ['subscribe', 'add', 'advance'].includes(input.action)
    ? Math.round(principalCents * fundFees.subscriptionRate)
    : 0
  return { principalCents, shares, feeCents, totalCents: principalCents + feeCents }
}

/** Preserve the source confirmation threshold after the operation's amount validation. */
export function requiresFundAmountConfirmation(amount: number, accepted: boolean): boolean {
  return amount >= 5000 && !accepted
}

export function validateFundOperation({
  action,
  amount,
  unit,
  shares,
  nav,
}: {
  action: FundAction
  amount: number
  unit: 'amount' | 'shares'
  shares: number
  nav: number
}): string {
  if (!Number.isFinite(nav) || nav <= 0) return 'Il NAV del fondo non è disponibile.'
  if (!Number.isFinite(shares) || shares < 0) return 'Le quote disponibili non sono valide.'
  if (!Number.isFinite(amount) || amount <= 0) return 'Inserisci un valore maggiore di zero.'
  if (action === 'subscribe' && amount < 100) return 'L’importo minimo della prima sottoscrizione è 100€.'
  if (action === 'add' && amount < 50) return 'L’importo minimo delle operazioni successive è 50€.'
  if ((action === 'redeem' || action === 'switch') && amount > (unit === 'shares' ? shares : shares * nav))
    return 'Il valore inserito supera le quote disponibili.'
  return ''
}
export function validatePac(p: PacParameters): string {
  if (!Number.isFinite(p.amount) || p.amount < 100) return 'L’importo minimo della rata è 100€.'
  if (!Number.isInteger(p.installments) || p.installments < 72 || p.installments > 192)
    return 'Scegli un numero di rate tra 72 e 192.'
  if (!Number.isFinite(p.initial) || p.initial < 1200 || p.initial > 2300)
    return 'Il versamento iniziale deve essere compreso tra 1.200€ e 2.300€.'
  if (!Number.isInteger(p.day) || p.day < 1 || p.day > 31) return 'Scegli un giorno di addebito tra 1 e 31.'
  return ''
}
export function validateSavingsPlan(p: SavingsParameters): string {
  const values = [p.average, p.lower, p.upper, p.maximum]
  if (values.some((value) => !Number.isFinite(value) || value < 0 || value % 500 !== 0))
    return 'Gli importi devono essere multipli di 500 Euro.'
  if (p.average < 4000) return 'La giacenza media non può essere inferiore a 4.000 Euro.'
  if (p.upper < p.average + 1000)
    return 'La soglia di investimento deve superare la giacenza media di almeno 1.000 Euro.'
  if (p.lower >= p.average || p.average >= p.upper)
    return 'La soglia di disinvestimento deve essere inferiore alla giacenza media e alla soglia di investimento.'
  if (p.maximum !== 0 && p.maximum < p.upper)
    return 'Il limite massimo deve essere almeno pari alla soglia di investimento.'
  if (!Number.isInteger(p.day) || p.day < 1 || p.day > 31) return 'Scegli un giorno di verifica saldo tra 1 e 31.'
  return ''
}
export function nextPlanStatus(status: PlanStatus, action: FundAction): PlanStatus {
  if (action === 'activate' || action === 'reactivate') return 'active'
  if (action === 'suspend') return 'suspended'
  if (action === 'revoke') return 'revoked'
  return status
}
export const planStatusLabels: Record<PlanStatus, string> = {
  inactive: 'Da attivare',
  active: 'Attivo',
  suspended: 'Sospeso',
  revoked: 'Revocato',
}
export const fundActionLabels: Record<FundAction, string> = {
  subscribe: 'Sottoscrizione fondi',
  add: 'Versamento aggiuntivo',
  redeem: 'Rimborso fondo',
  switch: 'Switch fondo',
  activate: 'Adesione',
  modify: 'Modifica',
  advance: 'Anticipo rata',
  suspend: 'Sospensione',
  reactivate: 'Riattivazione',
  revoke: 'Revoca',
}
export function fundActionFromRoute(action?: string): FundAction {
  if (action === 'refund') return 'redeem'
  if (action === 'subscribe-inadequate' || action === 'subscribe-restricted') return 'subscribe'
  return action && Object.prototype.hasOwnProperty.call(fundActionLabels, action) ? (action as FundAction) : 'subscribe'
}
export function validateFundsMobileCode(code: string): string {
  if (!/^\d{6}$/.test(code)) return 'Inserisci il Mobile Code di 6 cifre.'
  return code === '123456' ? '' : 'Mobile Code non corretto. Riprova.'
}
export function fundMatchesDistribution(name: string, distribution: string): boolean {
  if (!distribution) return true
  const distributing = /(?:^|[-. ])(?:dis|dist)(?:[-. ]|$)/i.test(name)
  return distribution === 'Distribuzione' ? distributing : !distributing
}

const sourceInvestmentFunds = [
  {
    id: 'pic',
    name: 'Pioneer SF - Equity Plan 60',
    manager: 'Amundi soluzione Italia',
    category: 'Bilanciati',
    type: 'PIC',
    isin: 'LU1275644675',
    nav: 569.37,
    pmc: 8.29,
    value: 2705.96,
    profit: 20.24,
    percent: '+ 0,70%',
    shares: 34,
  },
  {
    id: 'pac',
    name: 'Pioneer SF - Euro Strat. Bond',
    manager: 'Amundi soluzione Italia',
    category: 'Obbligazionari',
    type: 'PAC',
    isin: 'LU1275644676',
    nav: 1384.37,
    pmc: 8.29,
    value: 2705.96,
    profit: 89.3,
    percent: '+ 0,22%',
    shares: 34,
  },
  {
    id: 'savings',
    name: 'Pictet Asian Local Currency Debt',
    manager: 'Pictet',
    category: 'Obbligazionari',
    type: 'Risparmia e investi',
    isin: 'US0378331753',
    nav: 203.37,
    pmc: 8.29,
    value: 2705.96,
    profit: 20.3,
    percent: '+ 0,06%',
    shares: 34,
  },
  {
    id: 'managed',
    name: 'FF Funds America - Acc.',
    manager: 'Fidelity',
    category: 'Azionari',
    type: 'Conto gestito',
    isin: 'LU1941682335',
    nav: 1654.37,
    pmc: 8.29,
    value: 2705.96,
    profit: 67.3,
    percent: '+ 1,89%',
    shares: 34,
  },
  {
    id: 'allianz',
    name: 'Allianz Credit Opportunities',
    manager: 'Allianz',
    category: 'Flessibili',
    type: 'PIC',
    isin: 'LU1951921383',
    nav: 109.39,
    pmc: 8.29,
    value: 2705.96,
    profit: 20.24,
    percent: '+ 0,70%',
    shares: 34,
  },
  {
    id: 'aggregate',
    name: 'Amundi Euro Aggregate Bond',
    manager: 'Amundi',
    category: 'Obbligazionari',
    type: 'PIC',
    isin: 'LU1951921384',
    nav: 126.36,
    pmc: 8.29,
    value: 2705.96,
    profit: 20.24,
    percent: '+ 0,70%',
    shares: 34,
  },
  {
    id: 'global',
    name: 'Amundi Global Multi-Asset',
    manager: 'Amundi',
    category: 'Bilanciati',
    type: 'PAC',
    isin: 'LU1951921385',
    nav: 5.99,
    pmc: 8.29,
    value: 2705.96,
    profit: 20.24,
    percent: '+ 0,70%',
    shares: 34,
  },
  {
    id: 'pictet',
    name: 'PICTET GLOBAL FUNDS',
    manager: 'Pictet',
    category: 'Azionari',
    type: 'PIC',
    isin: 'LU1941682335',
    nav: 109.57,
    pmc: 8.29,
    value: 1928,
    profit: 112,
    percent: '+ 9,51%',
    shares: 34,
  },
  {
    id: 'digital',
    name: 'Pictet Digital - Acc.',
    manager: 'Amundi soluzione Italia',
    category: 'Azionari',
    type: 'Risparmia e investi',
    isin: 'LU1951921386',
    nav: 946.37,
    pmc: 8.29,
    value: 2705.96,
    profit: 89.3,
    percent: '+ 1,15%',
    shares: 34,
  },
  {
    id: 'IT0005418741',
    name: 'Amundi Elite Multi Asset Flexible-Dis.Cl.A EUR/EUR',
    manager: 'Amundi',
    category: 'Bilanciati',
    type: 'PIC',
    isin: 'IT0005418741',
    nav: 5.48,
    pmc: 0,
    value: 0,
    profit: 0,
    percent: 'N.D.',
    shares: 0,
  },
] as const
export interface InvestmentFund {
  id: string
  name: string
  manager: string
  category: string
  type: string
  isin: string
  nav: number
  pmc: number
  value: number
  profit: number
  percent: string
  shares: number
  annualPerformance?: number
  changePercent?: number
}

export const investmentFunds: readonly InvestmentFund[] = sourceInvestmentFunds.map((fund) => {
  const value = Math.round(fund.shares * fund.nav * 100) / 100
  const cost = Math.round(fund.shares * fund.pmc * 100) / 100
  const profit = Math.round((value - cost) * 100) / 100
  return {
    ...fund,
    changePercent: Number(fund.percent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0,
    value,
    profit,
    percent: cost ? `${profit >= 0 ? '+' : ''} ${((profit / cost) * 100).toFixed(2).replace('.', ',')}%` : 'N.D.',
  }
})
export const fundFees = { subscriptionRate: 0.015, ongoingAnnualRate: 0.0315 } as const

export const fundsCatalogSections = {
  news: {
    title: 'Nuovi fondi disponibili',
    subtitle: 'Scopri la nostra offerta',
    funds: [
      {
        heading: 'Cedola annuale per 3 anni',
        name: 'BGR EUR INVGRA FIX MATU BOND 28 DIST E5 EUR/EUR',
        nav: 10.02,
        percent: 'N.D.',
      },
      {
        heading: 'Cedola annuale per 5 anni',
        name: 'Amundi SITA OBB. EURO 02/2030-DIST-E-EUR/EUR',
        nav: 5,
        percent: '0,00%',
      },
      {
        heading: 'Accumulo progressivo della componente azionaria su 4 anni',
        name: 'Amundi Multi-Asset Sust.Future Acc. Cl. G',
        nav: 108.5,
        percent: '+ 6,92%',
      },
    ],
  },
  ideas: {
    title: 'Idee di investimento',
    subtitle: 'Scopri come affrontare i mercati',
    funds: [
      {
        heading: 'Multi asset sostenibile prudente',
        name: 'Amundi Multi-Asset Sust.Future Acc. Cl. G',
        nav: 108.5,
        percent: '+ 6,92%',
      },
      {
        heading: 'Multiasset moderato diversificato',
        name: 'ONEMARKETS BLACKROCK GL DIV BAL ACC CL C EUR/EUR',
        nav: 109.57,
        percent: '+ 9,51%',
      },
      {
        heading: 'Multiasset bilanciato sostenibile',
        name: 'ALLIANZ DYN.MUL.ASS.STR.SRI',
        nav: 163.4,
        percent: '+ 10,82%',
      },
    ],
  },
  pac: {
    title: 'Piani di Accumulo',
    subtitle: 'Scopri come investire gradualmente nel tempo',
    funds: [
      {
        heading: 'Approccio graduale al mercato azionario globale',
        name: 'ONEMARKETS IT SMART PLAN DIST CL A EUR/EUR',
        nav: 5.196,
        percent: '+ 4,86%',
      },
      {
        heading: 'Le migliori società azionarie globali',
        name: 'JPMF GLOBAL FOCUS - ACC. CL. A EUR/EUR',
        nav: 68,
        percent: '+ 18,81%',
      },
    ],
  },
} as const

export const availableInvestmentFunds: readonly InvestmentFund[] = [
  ...investmentFunds,
  ...Object.entries(fundsCatalogSections)
    .flatMap(([section, content]) =>
      content.funds.map((fund, index) => ({
        id: `${section}-${index}`,
        name: fund.name,
        isin: 'N.D.',
        manager: fund.name.startsWith('Amundi') ? 'Amundi' : fund.name.startsWith('ALLIANZ') ? 'Allianz' : 'OneMarkets',
        category: 'Bilanciati',
        type: section === 'pac' ? 'PAC' : 'PIC',
        nav: fund.nav,
        pmc: 0,
        value: 0,
        profit: 0,
        percent: fund.percent,
        shares: 0,
        annualPerformance: Number(fund.percent.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0,
      })),
    )
    .filter((fund, index, funds) => !funds.slice(0, index).some((existing) => existing.name === fund.name)),
]
