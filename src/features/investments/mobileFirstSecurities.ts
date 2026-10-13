import {
  getItalyFinancialSnapshot,
  selectAccountBalance,
  reserveAccountFunds,
  releaseFinancialReservation,
  settleFinancialReservation,
  postAccountFinancialMovement,
  notifyItalyFinancialChanges,
} from '../finance/italyFinancials'

export type SecurityClass =
  'Azioni' | 'Obbligazioni' | 'ETF' | 'ETC - ETN' | 'Certificati e CW' | 'Diritti' | 'Altri titoli'
export type Security = {
  id: string
  name: string
  isin: string
  symbol: string
  kind: SecurityClass
  market: string
  price: number
  change: number
  quantity: number
  performance: number
  dividend: number
  esg?: boolean
  maturity?: string
  coupon?: number
  averageCost?: number
  costCents?: number
  registered?: boolean
}
export const securities: readonly Security[] = [
  {
    id: 'apple',
    name: 'Apple',
    isin: 'US0378331005',
    symbol: 'AAPL',
    kind: 'Azioni',
    market: 'NASDAQ',
    price: 204.75,
    change: 3.22,
    quantity: 124,
    performance: 5.61,
    dividend: 0.48,
    esg: true,
    registered: true,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    isin: 'US0231351067',
    symbol: 'AMZN',
    kind: 'Azioni',
    market: 'NASDAQ',
    price: 167,
    change: 0.7,
    quantity: 50,
    performance: 18.4,
    dividend: 0,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    isin: 'US5949181045',
    symbol: 'MSFT',
    kind: 'Azioni',
    market: 'NASDAQ',
    price: 20.24,
    change: -0.81,
    quantity: 50,
    performance: 11.8,
    dividend: 0.72,
    esg: true,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    isin: 'US67066G1040',
    symbol: 'NVDA',
    kind: 'Azioni',
    market: 'NASDAQ',
    price: 32.24,
    change: -0.65,
    quantity: 50,
    performance: 24.2,
    dividend: 0.04,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    isin: 'LU1778762911',
    symbol: 'SPOT',
    kind: 'Azioni',
    market: 'NYSE',
    price: 19.99,
    change: 0.89,
    quantity: 0,
    performance: 6.2,
    dividend: 0,
  },
  {
    id: 'samsung',
    name: 'Samsung',
    isin: 'KR7005930003',
    symbol: 'SMSN',
    kind: 'Azioni',
    market: 'LSE',
    price: 23.25,
    change: 1.32,
    quantity: 0,
    performance: 2.5,
    dividend: 1.2,
  },
  {
    id: 'buzzi',
    name: 'Buzzi',
    isin: 'IT0001347308',
    symbol: 'BZU',
    kind: 'Azioni',
    market: 'Euronext Milano',
    price: 37.33,
    change: 0.2,
    quantity: 3,
    performance: 9.5,
    dividend: 1.7,
  },
  {
    id: 'adidas',
    name: 'Adidas',
    isin: 'DE000A1EWWW0',
    symbol: 'ADS',
    kind: 'Azioni',
    market: 'XETRA',
    price: 134,
    change: 0.9,
    quantity: 10,
    performance: 4.6,
    dividend: 1,
  },
  {
    id: 'a2a',
    name: 'A2A',
    isin: 'IT0001233417',
    symbol: 'A2A',
    kind: 'Azioni',
    market: 'Euronext Milano',
    price: 2.14,
    change: 1.2,
    quantity: 2,
    performance: 4.8,
    dividend: 4.6,
    esg: true,
  },
  {
    id: 'btp',
    name: 'BTP',
    isin: 'IT0005534141',
    symbol: 'BTP',
    kind: 'Obbligazioni',
    market: 'MOT',
    price: 92.67,
    change: 0.15,
    quantity: 50,
    performance: 5.2,
    dividend: 3.5,
    maturity: '2030-03-01',
    coupon: 3.5,
  },
  {
    id: 'turkey',
    name: 'Turchia',
    isin: 'US900123CZ62',
    symbol: 'TUR',
    kind: 'Obbligazioni',
    market: 'EuroTLX',
    price: 323.67,
    change: 3.46,
    quantity: 50,
    performance: 3.46,
    dividend: 5.1,
    maturity: '2034-01-15',
    coupon: 5.1,
  },
  {
    id: 'amundi',
    name: 'Amundi MSCI World USD',
    isin: 'LU1681043599',
    symbol: 'CW8',
    kind: 'ETF',
    market: 'Euronext Milano',
    price: 119.1,
    change: -0.75,
    quantity: 50,
    performance: 12.2,
    dividend: 0,
    esg: true,
  },
  {
    id: 'ishares',
    name: 'iShares Global Clean Energy USD',
    isin: 'IE00B1XNHC34',
    symbol: 'INRG',
    kind: 'ETF',
    market: 'Euronext Milano',
    price: 7.1,
    change: -1.25,
    quantity: 50,
    performance: -4.1,
    dividend: 1.2,
    esg: true,
  },
  {
    id: 'gold',
    name: 'Gold Spot',
    isin: 'JE00B1VS3770',
    symbol: 'PHAU',
    kind: 'ETC - ETN',
    market: 'Euronext Milano',
    price: 1182.45,
    change: -0.79,
    quantity: 1,
    performance: 8.4,
    dividend: 0,
  },
  {
    id: 'certificate',
    name: 'UniCredit Cash Collect',
    isin: 'DE000HD4KXF0',
    symbol: 'UCC',
    kind: 'Certificati e CW',
    market: 'EuroTLX',
    price: 216.47,
    change: 0.4,
    quantity: 1,
    performance: 2.8,
    dividend: 6,
    maturity: '2027-12-15',
  },
  {
    id: 'saipem',
    name: 'DD SAIPEM TEST',
    isin: 'IT0005644783',
    symbol: 'SPM',
    kind: 'Diritti',
    market: 'Euronext Milano',
    price: 0.1158,
    change: 0.3,
    quantity: 36,
    performance: 1.1,
    dividend: 0,
  },
  {
    id: 'pimco',
    name: 'Pimco Low Duration Income Dist.Cl.E',
    isin: 'IE00B464QH67',
    symbol: 'PIM',
    kind: 'Altri titoli',
    market: 'NASDAQ',
    price: 98.1,
    change: -1.25,
    quantity: 50,
    performance: 3.2,
    dividend: 2.8,
  },
  {
    id: 'bot',
    name: 'BOT SEM 30/09/2025',
    isin: 'IT0005643009',
    symbol: '564300',
    kind: 'Obbligazioni',
    market: 'Mercato primario',
    price: 100,
    change: 0,
    quantity: 0,
    performance: 0,
    dividend: 0,
    maturity: '2025-09-30',
    coupon: 0,
  },
  {
    id: 'enel',
    name: 'Enel AZ Ord Raggruppate',
    isin: 'IT0003153852',
    symbol: 'ENEL',
    kind: 'Azioni',
    market: 'Euronext Milano',
    price: 6.24,
    change: 0.7,
    quantity: 50,
    performance: 7.4,
    dividend: 4.2,
    esg: true,
  },
  {
    id: 'unicredit',
    name: 'UniCredit',
    isin: 'IT0005239360',
    symbol: 'UCG',
    kind: 'Azioni',
    market: 'Euronext Milano',
    price: 32.67,
    change: 0.4,
    quantity: 50,
    performance: 12.5,
    dividend: 3.1,
  },
]
export const securityClasses: readonly SecurityClass[] = [
  'Azioni',
  'Obbligazioni',
  'ETF',
  'ETC - ETN',
  'Certificati e CW',
  'Diritti',
  'Altri titoli',
]
export function getSecurity(id?: string): Security {
  return (
    securities.find((s) => s.id === id || s.isin === id || s.name.toLowerCase() === id?.toLowerCase()) ?? securities[0]!
  )
}
export type SecurityOrder = {
  id: string
  securityId: string
  action: 'Acquisto' | 'Vendita' | 'Sottoscrizione' | 'Aumento di capitale'
  quantity: number
  price: number
  market: string
  status: 'Ineseguito' | 'Inviato' | 'Eseguito' | 'Annullato'
  date: string
  validUntil: string
  priceType: string
  quantityCondition: string
  depositId?: string
  subdepositId?: string
}
export type SecurityList = { id: string; name: string; instruments: string[] }
export type VirtualPosition = { securityId: string; quantity: number; price: number }
export type VirtualPortfolio = {
  id: string
  name: string
  positions: VirtualPosition[]
  transactions: Array<VirtualPosition & { action: 'Acquisto' | 'Vendita'; date: string }>
}
export type SecuritiesState = {
  orders: SecurityOrder[]
  watchlists: SecurityList[]
  virtualPortfolios: VirtualPortfolio[]
  searchHistory: string[]
  assemblyTickets: Record<string, number>
}
export const securitiesStorageKey = 'mf-it-securities-v1'

/** Virtual portfolios have no source creation cap; this limit is only for watchlists. */
export function canCreateWatchlist(count: number): boolean {
  return count < 10
}

export function validateSecuritySearchBounds(filters: Partial<SecuritySearch>): string | null {
  if (filters.maturityFrom && filters.maturityTo && filters.maturityFrom > filters.maturityTo)
    return 'La data iniziale deve precedere la data finale.'
  if (
    (filters.minPerformance &&
      filters.maxPerformance &&
      Number(filters.minPerformance) > Number(filters.maxPerformance)) ||
    (filters.minYield && filters.maxYield && Number(filters.minYield) > Number(filters.maxYield)) ||
    (filters.minStrike && filters.maxStrike && Number(filters.minStrike) > Number(filters.maxStrike))
  )
    return 'Il valore minimo deve essere inferiore al valore massimo.'
  return null
}

/** Assembly requests retain the original Number conversion and share-capacity rule. */
export function validateSecuritiesAssemblyRequest(quantity: string, available: number): string | null {
  const requested = Number(quantity)
  return !Number.isInteger(requested) || requested < 1 || requested > available
    ? `Inserisci una quantità intera tra 1 e ${available}.`
    : null
}

export function validateSecuritiesAssemblyMobileCode(code: string): string | null {
  return code === '123456' ? null : 'Mobile Code non corretto. Riprova.'
}

/** One successful request records one ticket; it does not reserve or trade the entered shares. */
export function recordSecuritiesAssemblyTicket(state: SecuritiesState, company: string): SecuritiesState {
  return {
    ...state,
    assemblyTickets: { ...state.assemblyTickets, [company]: (state.assemblyTickets[company] ?? 0) + 1 },
  }
}

export function isSecuritiesState(value: unknown): value is SecuritiesState {
  const record = (item: unknown): item is Record<string, unknown> =>
    !!item && typeof item === 'object' && !Array.isArray(item)
  const text = (item: unknown): item is string => typeof item === 'string'
  const number = (item: unknown): item is number => typeof item === 'number' && Number.isFinite(item)
  const instrument = (item: unknown) => text(item) && securities.some((s) => s.id === item)
  const position = (item: unknown) =>
    record(item) &&
    instrument(item.securityId) &&
    number(item.quantity) &&
    item.quantity > 0 &&
    number(item.price) &&
    item.price > 0
  if (
    !record(value) ||
    !Array.isArray(value.orders) ||
    !Array.isArray(value.watchlists) ||
    !Array.isArray(value.virtualPortfolios) ||
    !Array.isArray(value.searchHistory) ||
    !record(value.assemblyTickets)
  )
    return false
  return (
    value.orders.length <= 500 &&
    new Set(value.orders.map((order) => (record(order) ? order.id : undefined))).size === value.orders.length &&
    value.orders.every(
      (o) =>
        record(o) &&
        text(o.id) &&
        instrument(o.securityId) &&
        ['Acquisto', 'Vendita', 'Sottoscrizione', 'Aumento di capitale'].includes(String(o.action)) &&
        number(o.quantity) &&
        o.quantity > 0 &&
        Number.isSafeInteger(o.quantity) &&
        number(o.price) &&
        o.price > 0 &&
        text(o.market) &&
        ['Ineseguito', 'Inviato', 'Eseguito', 'Annullato'].includes(String(o.status)) &&
        text(o.date) &&
        text(o.validUntil) &&
        text(o.priceType) &&
        text(o.quantityCondition) &&
        (o.depositId === undefined || text(o.depositId)) &&
        (o.subdepositId === undefined || text(o.subdepositId)),
    ) &&
    value.watchlists.length <= 10 &&
    value.watchlists.every(
      (l) =>
        record(l) &&
        text(l.id) &&
        text(l.name) &&
        l.name.length <= 30 &&
        Array.isArray(l.instruments) &&
        l.instruments.length <= 20 &&
        l.instruments.every(instrument) &&
        new Set(l.instruments).size === l.instruments.length,
    ) &&
    value.virtualPortfolios.length <= 100 &&
    value.virtualPortfolios.every(
      (p) =>
        record(p) &&
        text(p.id) &&
        text(p.name) &&
        Array.isArray(p.positions) &&
        p.positions.every(position) &&
        Array.isArray(p.transactions) &&
        p.transactions.every(
          (t) => position(t) && record(t) && ['Acquisto', 'Vendita'].includes(String(t.action)) && text(t.date),
        ),
    ) &&
    value.searchHistory.length <= 5 &&
    value.searchHistory.every(text) &&
    Object.values(value.assemblyTickets).every((v) => number(v) && Number.isInteger(v) && v >= 0)
  )
}
export function initialSecuritiesState(): SecuritiesState {
  return {
    orders: [
      {
        id: '91198960',
        securityId: 'buzzi',
        action: 'Acquisto',
        quantity: 3,
        price: 37.33,
        market: 'Best Execution',
        status: 'Ineseguito',
        date: '2025-01-10',
        validUntil: '2025-02-12',
        priceType: 'Al limite',
        quantityCondition: 'Senza condizione',
      },
      {
        id: '91198961',
        securityId: 'adidas',
        action: 'Acquisto',
        quantity: 10,
        price: 13.4,
        market: 'Best Execution',
        status: 'Inviato',
        date: '2025-01-10',
        validUntil: '2025-02-12',
        priceType: 'Al meglio',
        quantityCondition: 'Senza condizione',
      },
      {
        id: '91198962',
        securityId: 'a2a',
        action: 'Acquisto',
        quantity: 14,
        price: 6,
        market: 'Best Execution',
        status: 'Eseguito',
        date: '2025-01-10',
        validUntil: '2025-02-12',
        priceType: 'Al meglio',
        quantityCondition: 'Senza condizione',
      },
    ],
    watchlists: [
      { id: 'technology', name: 'Tecnologia', instruments: ['microsoft', 'apple', 'nvidia', 'spotify', 'samsung'] },
      { id: 'etf', name: 'ETF', instruments: ['amundi', 'ishares'] },
      { id: 'innovation', name: 'Innovazione', instruments: ['apple', 'amazon', 'nvidia'] },
      { id: 'media', name: 'Media/Intrattenimento', instruments: ['spotify'] },
    ],
    virtualPortfolios: [
      { id: 'test1', name: 'TEST PORTFOLIO 1', positions: [], transactions: [] },
      {
        id: 'test2',
        name: 'Test 2',
        positions: securities
          .filter((s) => s.quantity > 0)
          .slice(0, 7)
          .map((s) => ({ securityId: s.id, quantity: 50, price: s.price })),
        transactions: [],
      },
    ],
    searchHistory: [],
    assemblyTickets: { 'We Build SPA': 1 },
  }
}
export type TradeDraft = {
  action: 'buy' | 'sell' | 'auction' | 'aucap' | 'virtual-buy' | 'virtual-sell'
  depositId: string
  subdepositId: string
  quantity: string
  price: string
  priceType: string
  market: string
  quantityCondition: string
  validUntil: string
  conditional: boolean
  triggerPrice: string
}
export const securitiesDepositEligibility = [
  { id: 'main', subdeposits: [{ id: '00', individual: true }] },
  {
    id: 'joint',
    subdeposits: [
      { id: '00', individual: false },
      { id: '01', individual: true },
    ],
  },
] as const
export const registeredSecurityBlockMessage =
  'Stai acquistando un titolo nominativo, cambia il sottodeposito per poter procedere l’acquisto di questo titolo.'
export function validateSecurityDeposit(security: Security, depositId: string, subdepositId: string): string | null {
  const deposit = securitiesDepositEligibility.find((value) => value.id === depositId)
  const subdeposit = deposit?.subdeposits.find((value) => value.id === subdepositId)
  if (!subdeposit) return 'Il deposito o sottodeposito selezionato non è disponibile. Seleziona un altro deposito.'
  return security.registered && !subdeposit.individual ? registeredSecurityBlockMessage : null
}
export function parseItalianNumber(value: string): number {
  return Number(value.trim().replace(',', '.'))
}
export function validateSecurityTrade(
  draft: TradeDraft,
  security: Security,
  availableQuantity = security.quantity,
  liquidity = selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents / 100,
): string | null {
  if (draft.action === 'buy') {
    const depositError = validateSecurityDeposit(security, draft.depositId, draft.subdepositId)
    if (depositError) return depositError
  }
  const quantity = parseItalianNumber(draft.quantity)
  const price =
    draft.priceType === 'Al meglio' || draft.priceType === 'Prezzo attuale'
      ? security.price
      : parseItalianNumber(draft.price)
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isSafeInteger(quantity))
    return 'Inserisci una quantità intera maggiore di zero.'
  if (draft.action === 'aucap') {
    if (quantity > availableQuantity) return 'La quantità non può superare il numero di diritti residui esercitabili.'
    if (quantity % 12 !== 0) return 'Inserisci un numero di diritti multiplo di 12.'
  }
  if (draft.action === 'auction' && (quantity < 1000 || quantity % 1000 !== 0))
    return 'La quantità deve essere almeno 1.000 e multipla di 1.000.'
  if (draft.action.endsWith('sell') && quantity > availableQuantity)
    return 'La quantità supera i titoli disponibili in portafoglio.'
  if (!Number.isFinite(price) || price <= 0) return 'Inserisci un prezzo maggiore di zero.'
  const total = draft.action === 'auction' ? quantity : quantity * price
  if (
    (draft.action === 'buy' || draft.action === 'auction' || draft.action === 'aucap') &&
    total + Math.min(securityMaximumCommissionCents, Math.round(total * 0.0015 * 100)) / 100 > liquidity
  )
    return 'Liquidità disponibile insufficiente per questa operazione.'
  if (draft.conditional && !(parseItalianNumber(draft.triggerPrice) > 0))
    return 'Inserisci il prezzo di attivazione dell’ordine condizionato.'
  if (draft.validUntil && draft.validUntil < getItalyFinancialSnapshot().asOf)
    return 'La fine validità non può precedere la data dell’ordine.'
  return null
}

let sessionSecurities: SecuritiesState | undefined
let securitiesStorageUnavailable = false
export function readSecuritiesFinancialState(): SecuritiesState {
  if (securitiesStorageUnavailable && sessionSecurities) return sessionSecurities
  try {
    if (typeof localStorage !== 'undefined') {
      const saved: unknown = JSON.parse(localStorage.getItem(securitiesStorageKey) ?? 'null')
      if (isSecuritiesState(saved)) return saved
      return initialSecuritiesState()
    }
  } catch {
    /* Keep the session authoritative when browser storage is unavailable. */
  }
  return sessionSecurities ?? initialSecuritiesState()
}
export function saveSecuritiesFinancialState(state: SecuritiesState) {
  sessionSecurities = state
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(securitiesStorageKey, JSON.stringify(state))
    securitiesStorageUnavailable = typeof localStorage === 'undefined'
  } catch {
    securitiesStorageUnavailable = true
    /* Session fallback. */
  }
  notifyItalyFinancialChanges()
}
export function resetSecuritiesFinancialState() {
  sessionSecurities = undefined
  securitiesStorageUnavailable = false
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(securitiesStorageKey)
  } catch {
    /* Session reset. */
  }
}
export function securityOrderMoney(order: Pick<SecurityOrder, 'quantity' | 'price'>) {
  const principalCents = Math.round(order.quantity * order.price * 100)
  const feeCents = Math.min(securityMaximumCommissionCents, Math.round(principalCents * 0.0015))
  return { principalCents, feeCents, totalCents: principalCents + feeCents }
}
export const securityMaximumCommissionCents = 1950
export function securityAvailableQuantity(state: SecuritiesState, securityId: string) {
  const base = getSecurity(securityId).quantity
  const executed = state.orders
    .filter((o) => o.securityId === securityId && o.id.startsWith('MF') && o.status === 'Eseguito')
    .reduce(
      (sum, o) =>
        sum +
        (o.action === 'Vendita' || o.action === 'Aumento di capitale'
          ? -o.quantity
          : o.action === 'Sottoscrizione'
            ? o.quantity / 100
            : o.quantity),
      0,
    )
  const reserved = state.orders
    .filter(
      (o) =>
        o.securityId === securityId &&
        canCancelSecurityOrder(o) &&
        (o.action === 'Vendita' || o.action === 'Aumento di capitale'),
    )
    .reduce((sum, o) => sum + o.quantity, 0)
  return Math.max(0, base + executed - reserved)
}
export function ensureSecurityCashReservations(state: SecuritiesState) {
  for (const order of state.orders.filter((o) => canCancelSecurityOrder(o) && o.action !== 'Vendita')) {
    const money = securityOrderMoney(order)
    reserveAccountFunds(
      '000012345',
      money.totalCents,
      `it-security:${order.id}`,
      `${order.action} ${getSecurity(order.securityId).name}`,
      { feeCents: money.feeCents },
    )
  }
}
function latestSecurityState(state: SecuritiesState): SecuritiesState {
  const saved = readSecuritiesFinancialState()
  return {
    ...state,
    orders: [
      ...state.orders.map(
        (order) => saved.orders.find((item) => item.id === order.id && item.id.startsWith('MF')) ?? order,
      ),
      ...saved.orders.filter(
        (order) => order.id.startsWith('MF') && !state.orders.some((item) => item.id === order.id),
      ),
    ],
  }
}
export function submitSecurityOrder(
  state: SecuritiesState,
  order: SecurityOrder,
): { state: SecuritiesState; error: string | null } {
  const current = latestSecurityState(state)
  if (current.orders.some((o) => o.id === order.id)) return { state: current, error: null }
  if (isSecurityOrderExpired(order))
    return { state: current, error: 'La fine validità non può precedere la data dell’ordine.' }
  if (
    !securities.some((item) => item.id === order.securityId) ||
    !Number.isInteger(order.quantity) ||
    order.quantity <= 0 ||
    !Number.isFinite(order.price) ||
    order.price <= 0
  )
    return { state: current, error: 'Ordine non valido.' }
  if (
    (order.action === 'Vendita' || order.action === 'Aumento di capitale') &&
    order.quantity > securityAvailableQuantity(current, order.securityId)
  )
    return { state: current, error: 'La quantità supera i titoli disponibili in portafoglio.' }
  if (order.action !== 'Vendita') {
    const money = securityOrderMoney(order)
    const reserved = reserveAccountFunds(
      '000012345',
      money.totalCents,
      `it-security:${order.id}`,
      `${order.action} ${getSecurity(order.securityId).name}`,
      { feeCents: money.feeCents },
    )
    if (!reserved.ok) return { state: current, error: reserved.error ?? 'Liquidità disponibile insufficiente.' }
  }
  const next = { ...current, orders: [{ ...order, status: 'Inviato' as const }, ...current.orders] }
  saveSecuritiesFinancialState(next)
  return { state: next, error: null }
}
export function cancelSecurityOrder(state: SecuritiesState, id: string): SecuritiesState {
  state = latestSecurityState(state)
  const order = state.orders.find((o) => o.id === id)
  if (!order || !canCancelSecurityOrder(order)) return state
  if (order.action !== 'Vendita') releaseFinancialReservation(`it-security:${id}`)
  const next = { ...state, orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'Annullato' as const } : o)) }
  saveSecuritiesFinancialState(next)
  return next
}
export function executeSecurityOrder(
  state: SecuritiesState,
  id: string,
): { state: SecuritiesState; error: string | null } {
  state = latestSecurityState(state)
  const order = state.orders.find((o) => o.id === id)
  if (!order) return { state, error: 'Ordine non trovato.' }
  if (order.status === 'Eseguito') return { state, error: null }
  if (isSecurityOrderExpired(order)) return { state, error: 'Ordine scaduto.' }
  if (!canCancelSecurityOrder(order)) return { state, error: 'Ordine annullato.' }
  if (order.action === 'Aumento di capitale')
    return { state, error: 'I dati delle nuove azioni assegnate non sono ancora disponibili.' }
  const money = securityOrderMoney(order)
  const result =
    order.action === 'Vendita'
      ? postAccountFinancialMovement({
          accountNumber: '000012345',
          amountCents: money.principalCents,
          name: `Vendita ${getSecurity(order.securityId).name}`,
          kind: 'transfer',
          category: 'Investimenti',
          key: `it-security:${id}:sale`,
        })
      : settleFinancialReservation(`it-security:${id}`)
  if (!result.ok) return { state, error: result.error ?? 'Ordine non disponibile.' }
  if (order.action === 'Vendita' && money.feeCents)
    postAccountFinancialMovement({
      accountNumber: '000012345',
      amountCents: -money.feeCents,
      name: 'Commissione investimento',
      kind: 'fee',
      category: 'Altre spese',
      key: `it-security:${id}:fee`,
    })
  const next = { ...state, orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'Eseguito' as const } : o)) }
  saveSecuritiesFinancialState(next)
  return { state: next, error: null }
}
export function validateListName(
  name: string,
  lists: readonly { name: string }[],
  currentName?: string,
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Inserisci il nome della lista.'
  if (trimmed.length > 30) return 'Il nome può contenere al massimo 30 caratteri.'
  if (lists.some((list) => list.name.toLowerCase() === trimmed.toLowerCase() && list.name !== currentName))
    return 'Questo nome è già presente. Scegli un altro nome.'
  return null
}
export function addWatchlistInstrument(
  list: SecurityList,
  instrument: string,
): { list: SecurityList; error: string | null } {
  if (list.instruments.includes(instrument)) return { list, error: 'Lo strumento è già presente nella lista.' }
  if (list.instruments.length >= 20)
    return { list, error: 'Hai raggiunto il numero massimo di 20 strumenti per lista.' }
  return { list: { ...list, instruments: [...list.instruments, instrument] }, error: null }
}
export function applyVirtualTrade(
  portfolio: VirtualPortfolio,
  securityId: string,
  quantity: number,
  price: number,
  action: 'Acquisto' | 'Vendita',
): VirtualPortfolio {
  const current = portfolio.positions.find((p) => p.securityId === securityId)
  const nextQuantity = (current?.quantity ?? 0) + (action === 'Acquisto' ? quantity : -quantity)
  const nextPrice =
    action === 'Acquisto'
      ? ((current?.quantity ?? 0) * (current?.price ?? 0) + quantity * price) / nextQuantity
      : (current?.price ?? price)
  return {
    ...portfolio,
    positions: [
      ...portfolio.positions.filter((p) => p.securityId !== securityId),
      ...(nextQuantity > 0 ? [{ securityId, quantity: nextQuantity, price: nextPrice }] : []),
    ],
    transactions: [{ securityId, quantity, price, action, date: '2025-01-09' }, ...portfolio.transactions],
  }
}
export function isSecurityOrderExpired(order: SecurityOrder, asOf = getItalyFinancialSnapshot().asOf): boolean {
  return (
    (order.status === 'Inviato' || order.status === 'Ineseguito') &&
    Boolean(order.validUntil) &&
    order.validUntil < asOf
  )
}
export function securityOrderDisplayStatus(order: SecurityOrder): SecurityOrder['status'] | 'Scaduto' {
  return isSecurityOrderExpired(order) ? 'Scaduto' : order.status
}
export function canCancelSecurityOrder(order: SecurityOrder): boolean {
  return (order.status === 'Inviato' || order.status === 'Ineseguito') && !isSecurityOrderExpired(order)
}
export function securityOrderPeriodRange(period: string, asOf = getItalyFinancialSnapshot().asOf) {
  const monthsByPeriod: Readonly<Record<string, number>> = { '1M': 1, '3M': 3, '6M': 6, '12M': 12 }
  const months = monthsByPeriod[period] ?? 12
  const end = new Date(`${asOf}T12:00:00Z`)
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months, 1, 12))
  const monthDays = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate()
  start.setUTCDate(Math.min(end.getUTCDate(), monthDays))
  return { from: start.toISOString().slice(0, 10), to: asOf }
}
export type SecuritySearch = {
  query: string
  searchBy: string
  kind: string
  market: string
  esg: boolean
  minPerformance: string
  maxPerformance: string
  minYield: string
  maxYield: string
  maturityFrom: string
  maturityTo: string
  sort: string
  underlying: string
  accumulation: string
  warrantType: string
  minStrike: string
  maxStrike: string
  consensus: string
}
export function searchSecurities(filters: SecuritySearch): Security[] {
  const query = filters.query.trim().toLowerCase()
  return securities
    .filter((s) => {
      const haystack =
        filters.searchBy === 'ISIN'
          ? s.isin
          : filters.searchBy === 'Simbolo'
            ? s.symbol
            : s.name + ' ' + s.symbol + ' ' + s.isin
      return (
        haystack.toLowerCase().includes(query) &&
        (filters.kind === 'Tutti' || s.kind === filters.kind) &&
        (filters.market === 'Tutti' || s.market === filters.market) &&
        (!filters.esg || s.esg) &&
        (!filters.minPerformance || s.performance >= parseItalianNumber(filters.minPerformance)) &&
        (!filters.maxPerformance || s.performance <= parseItalianNumber(filters.maxPerformance)) &&
        (!filters.minYield || s.dividend >= parseItalianNumber(filters.minYield)) &&
        (!filters.maxYield || s.dividend <= parseItalianNumber(filters.maxYield)) &&
        (!filters.maturityFrom || (!!s.maturity && s.maturity >= filters.maturityFrom)) &&
        (!filters.maturityTo || (!!s.maturity && s.maturity <= filters.maturityTo)) &&
        (!filters.underlying ||
          (s.kind === 'ETF'
            ? s.name
            : s.kind === 'ETC - ETN'
              ? 'Gold'
              : s.kind === 'Certificati e CW'
                ? 'Apple'
                : s.name
          )
            .toLowerCase()
            .includes(filters.underlying.toLowerCase())) &&
        (filters.accumulation === 'Tutti' ||
          s.kind !== 'ETF' ||
          (s.id === 'ishares' ? 'Distribuzione' : 'Accumulazione') === filters.accumulation) &&
        (filters.warrantType === 'Tutti' || s.kind !== 'Certificati e CW' || filters.warrantType === 'Call') &&
        (!filters.minStrike || (s.kind === 'Certificati e CW' && 245.9 >= parseItalianNumber(filters.minStrike))) &&
        (!filters.maxStrike || (s.kind === 'Certificati e CW' && 245.9 <= parseItalianNumber(filters.maxStrike))) &&
        (filters.consensus === 'Tutti' ||
          s.kind !== 'Azioni' ||
          (s.performance >= 0 ? 'Buy' : 'Sell') === filters.consensus)
      )
    })
    .sort((a, b) =>
      filters.sort === 'Performance'
        ? b.performance - a.performance
        : filters.sort === 'Dalla Z alla A'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name),
    )
}
