import {
  investmentFunds,
  availableInvestmentFunds,
  fundFees,
  defaultPacParameters,
  validatePac,
  validateSavingsPlan,
  type PacParameters,
  type PlanStatus,
  type SavingsParameters,
} from './mobileFirstFunds'
import {
  reserveAccountFunds,
  releaseFinancialReservation,
  settleFinancialReservation,
  postAccountFinancialMovement,
  notifyItalyFinancialChanges,
} from '../finance/italyFinancials'

export interface FundsStoredOrder {
  id: string
  fund: string
  action: string
  amount: number
  shares: number
  date: string
  status: 'Caricato' | 'Inviato' | 'Eseguito' | 'Annullato'
  targetFund?: string
  targetShares?: number
  feeCents?: number
}
export interface FundsStoredState {
  version: 1
  fund: string
  pac: PacParameters
  savings: SavingsParameters
  pacStatus: PlanStatus
  savingsStatus: PlanStatus
  orders: FundsStoredOrder[]
  contracts?: Record<string, FundsStoredContract>
}
export interface FundsStoredContract {
  pac: PacParameters
  savings: SavingsParameters
  pacStatus: PlanStatus
  savingsStatus: PlanStatus
}
const storageKey = 'mobile-first-it-investment-funds-v1'
let sessionFundsState: FundsStoredState | undefined
const statuses = ['inactive', 'active', 'suspended', 'revoked']
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
export function readFundsState(): FundsStoredState | undefined {
  if (sessionFundsState) return sessionFundsState
  try {
    if (typeof localStorage === 'undefined') return undefined
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (!raw || typeof raw !== 'object') return undefined
    const state = raw as Partial<FundsStoredState>
    if (
      state.version !== 1 ||
      typeof state.fund !== 'string' ||
      !statuses.includes(state.pacStatus ?? '') ||
      !statuses.includes(state.savingsStatus ?? '')
    )
      return undefined
    if (!state.pac || ![state.pac.amount, state.pac.installments, state.pac.initial, state.pac.day].every(finite))
      return undefined
    if (
      !state.savings ||
      ![
        state.savings.average,
        state.savings.lower,
        state.savings.upper,
        state.savings.maximum,
        state.savings.day,
      ].every(finite)
    )
      return undefined
    if (validatePac(state.pac) || validateSavingsPlan(state.savings)) return undefined
    if (
      state.contracts &&
      (typeof state.contracts !== 'object' ||
        Array.isArray(state.contracts) ||
        Object.keys(state.contracts).length > 200 ||
        !Object.values(state.contracts).every(
          (contract) =>
            contract &&
            statuses.includes(contract.pacStatus) &&
            statuses.includes(contract.savingsStatus) &&
            contract.pac &&
            contract.savings &&
            !validatePac(contract.pac) &&
            !validateSavingsPlan(contract.savings),
        ))
    )
      return undefined
    if (
      !Array.isArray(state.orders) ||
      state.orders.length > 100 ||
      new Set(state.orders.map((order) => order?.id)).size !== state.orders.length ||
      !state.orders.every(
        (order) =>
          order &&
          typeof order.id === 'string' &&
          typeof order.fund === 'string' &&
          typeof order.action === 'string' &&
          finite(order.amount) &&
          order.amount >= 0 &&
          Number.isSafeInteger(Math.round(order.amount * 100)) &&
          finite(order.shares) &&
          order.shares >= 0 &&
          (order.targetFund === undefined || typeof order.targetFund === 'string') &&
          (order.targetShares === undefined || (finite(order.targetShares) && order.targetShares >= 0)) &&
          (order.feeCents === undefined || (Number.isSafeInteger(order.feeCents) && order.feeCents >= 0)) &&
          typeof order.date === 'string' &&
          ['Caricato', 'Inviato', 'Eseguito', 'Annullato'].includes(order.status),
      )
    )
      return undefined
    const validState = state as FundsStoredState
    return {
      ...validState,
      contracts: validState.contracts ?? {
        [validState.fund]: {
          pac: validState.pac,
          savings: validState.savings,
          pacStatus: validState.pacStatus,
          savingsStatus: validState.savingsStatus,
        },
      },
    }
  } catch {
    return undefined
  }
}
export function saveFundsState(state: FundsStoredState): void {
  try {
    const contracts = {
      ...readFundsState()?.contracts,
      ...state.contracts,
      [state.fund]: {
        pac: state.pac,
        savings: state.savings,
        pacStatus: state.pacStatus,
        savingsStatus: state.savingsStatus,
      },
    }
    const next = { ...state, contracts }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(next))
      sessionFundsState = undefined
    } else sessionFundsState = next
  } catch {
    sessionFundsState = state
    /* Preview remains usable when storage is disabled. */
  }
  notifyItalyFinancialChanges()
}
export function resetFundsState(): void {
  sessionFundsState = undefined
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(storageKey)
  } catch {
    /* Storage can be disabled. */
  }
}
export function fundsContractState(state: FundsStoredState | undefined, fund: string): FundsStoredContract | undefined {
  return (
    state?.contracts?.[fund] ??
    (state?.fund === fund
      ? { pac: state.pac, savings: state.savings, pacStatus: state.pacStatus, savingsStatus: state.savingsStatus }
      : undefined)
  )
}

const monetaryFundOrder = (order: FundsStoredOrder) => order.amount > 0 && order.shares > 0
const reducingFundOrder = (order: FundsStoredOrder) => /Rimborso|Switch fondo/.test(order.action)
export function fundAvailableShares(state: Pick<FundsStoredState, 'orders'>, fundId: string) {
  const fund = availableInvestmentFunds.find((item) => item.id === fundId || item.name === fundId)
  if (!fund) return 0
  const executed = state.orders.filter((order) => order.id.startsWith('MF') && order.status === 'Eseguito')
  const changes =
    executed
      .filter((order) => order.fund === fund.name || order.fund === fund.id)
      .reduce((sum, order) => sum + (reducingFundOrder(order) ? -order.shares : order.shares), 0) +
    executed.filter((order) => order.targetFund === fund.id).reduce((sum, order) => sum + (order.targetShares ?? 0), 0)
  const reserved = state.orders
    .filter(
      (order) =>
        (order.fund === fund.name || order.fund === fund.id) &&
        reducingFundOrder(order) &&
        ['Caricato', 'Inviato'].includes(order.status),
    )
    .reduce((sum, order) => sum + order.shares, 0)
  return Math.max(0, fund.shares + changes - reserved)
}
function latestFundsState(state: FundsStoredState): FundsStoredState {
  const saved = readFundsState()
  return {
    ...state,
    orders: [
      ...state.orders.map(
        (order) => saved?.orders.find((item) => item.id === order.id && item.id.startsWith('MF')) ?? order,
      ),
      ...(saved?.orders ?? []).filter(
        (order) => order.id.startsWith('MF') && !state.orders.some((item) => item.id === order.id),
      ),
    ],
  }
}
export function submitFundOrder(
  state: FundsStoredState,
  order: FundsStoredOrder,
): { state: FundsStoredState; error: string | null } {
  const current = latestFundsState(state)
  const parametersError = validatePac(current.pac) || validateSavingsPlan(current.savings)
  if (parametersError) return { state: current, error: parametersError }
  if (current.orders.some((item) => item.id === order.id)) return { state: current, error: null }
  if (!Number.isFinite(order.amount) || order.amount < 0 || !Number.isFinite(order.shares) || order.shares < 0)
    return { state: current, error: 'Operazione non valida.' }
  const fund = availableInvestmentFunds.find((item) => item.id === order.fund || item.name === order.fund)
  let feeCents = 0
  if (monetaryFundOrder(order)) {
    if (!fund || !(fund.nav > 0)) return { state: current, error: 'Il NAV del fondo non è disponibile.' }
    if (Math.round(order.shares * fund.nav * 100) !== Math.round(order.amount * 100))
      return { state: current, error: 'Importo e quote non corrispondono al NAV.' }
    if (reducingFundOrder(order) && order.shares > fundAvailableShares(current, fund.id) + 1e-9)
      return { state: current, error: 'Il valore inserito supera le quote disponibili.' }
    if (order.action === 'Switch fondo') {
      const target = availableInvestmentFunds.find((item) => item.id === order.targetFund)
      if (
        !target ||
        target.id === fund.id ||
        target.nav <= 0 ||
        !Number.isFinite(order.targetShares) ||
        Math.round((order.targetShares ?? 0) * target.nav * 100) !== Math.round(order.amount * 100)
      )
        return { state: current, error: 'Seleziona un fondo di destinazione valido.' }
    } else if (!reducingFundOrder(order)) {
      feeCents = Math.round(order.amount * 100 * fundFees.subscriptionRate)
      const reserved = reserveAccountFunds(
        '000012345',
        Math.round(order.amount * 100) + feeCents,
        `it-fund:${order.id}`,
        `${order.action} ${fund.name}`,
        { feeCents },
      )
      if (!reserved.ok) return { state: current, error: reserved.error ?? 'Liquidità disponibile insufficiente.' }
    }
  } else if (
    order.amount !== 0 ||
    order.shares !== 0 ||
    !/Adesione|Modifica|Sospensione|Riattivazione|Revoca/.test(order.action)
  )
    return { state: current, error: 'Importo e quote non validi.' }
  const next = { ...current, orders: [{ ...order, feeCents, status: 'Caricato' as const }, ...current.orders] }
  saveFundsState(next)
  return { state: next, error: null }
}
export function cancelFundOrder(state: FundsStoredState, id: string): FundsStoredState {
  state = latestFundsState(state)
  const order = state.orders.find((item) => item.id === id)
  if (!order || !['Caricato', 'Inviato'].includes(order.status)) return state
  if (monetaryFundOrder(order) && !reducingFundOrder(order)) releaseFinancialReservation(`it-fund:${id}`)
  const next = {
    ...state,
    orders: state.orders.map((item) => (item.id === id ? { ...item, status: 'Annullato' as const } : item)),
  }
  saveFundsState(next)
  return next
}
export function executeFundOrder(
  state: FundsStoredState,
  id: string,
): { state: FundsStoredState; error: string | null } {
  state = latestFundsState(state)
  const order = state.orders.find((item) => item.id === id)
  if (!order) return { state, error: 'Ordine non trovato.' }
  if (order.status === 'Eseguito') return { state, error: null }
  if (!['Caricato', 'Inviato'].includes(order.status)) return { state, error: 'Ordine annullato.' }
  if (monetaryFundOrder(order) && order.action !== 'Switch fondo') {
    const result = reducingFundOrder(order)
      ? postAccountFinancialMovement({
          accountNumber: '000012345',
          amountCents: Math.round(order.amount * 100),
          name: `${order.action} ${order.fund}`,
          kind: 'transfer',
          category: 'Investimenti',
          key: `it-fund:${id}:redemption`,
        })
      : settleFinancialReservation(`it-fund:${id}`)
    if (!result.ok) return { state, error: result.error ?? 'Ordine non disponibile.' }
  }
  const next = {
    ...state,
    orders: state.orders.map((item) => (item.id === id ? { ...item, status: 'Eseguito' as const } : item)),
  }
  saveFundsState(next)
  return { state: next, error: null }
}

/** Configured demo capacity amounts, without making claims about statutory PIR limits. */
export function getFundInvestmentCapacity(state: Pick<FundsStoredState, 'orders' | 'contracts'>, asOf: string) {
  const year = asOf.slice(0, 4)
  const contributions = state.orders.filter((order) => monetaryFundOrder(order) && !reducingFundOrder(order))
  const annualCents = contributions
    .filter((order) => order.status === 'Eseguito' && order.date.startsWith(year))
    .reduce((sum, order) => sum + Math.round(order.amount * 100), 0)
  const totalCents = contributions
    .filter((order) => order.status === 'Eseguito')
    .reduce((sum, order) => sum + Math.round(order.amount * 100), 0)
  const pendingCents = contributions
    .filter((order) => ['Caricato', 'Inviato'].includes(order.status))
    .reduce((sum, order) => sum + Math.round(order.amount * 100), 0)
  const remainingMonths = 12 - Number(asOf.slice(5, 7))
  const plannedCents = investmentFunds
    .filter((fund) => fund.type === 'PAC')
    .reduce((sum, fund) => {
      const contract = state.contracts?.[fund.id]
      if (contract && contract.pacStatus !== 'active') return sum
      const plan = contract?.pac ?? defaultPacParameters
      const paid = state.orders.filter(
        (order) => order.fund === fund.name && order.status === 'Eseguito' && /PAC|Anticipo rata/.test(order.action),
      ).length
      return sum + Math.min(remainingMonths, Math.max(0, plan.installments - paid)) * Math.round(plan.amount * 100)
    }, 0)
  return [
    {
      label: 'Anno corrente',
      total: 3543.82,
      used: annualCents / 100,
      available: Math.max(0, 354382 - annualCents) / 100,
    },
    {
      label: 'Anno corrente e rate PAC programmate',
      total: 3543.82,
      used: (annualCents + pendingCents + plannedCents) / 100,
      available: Math.max(0, 354382 - annualCents - pendingCents - plannedCents) / 100,
    },
    { label: 'Totale', total: 20000, used: totalCents / 100, available: Math.max(0, 2000000 - totalCents) / 100 },
  ]
}
