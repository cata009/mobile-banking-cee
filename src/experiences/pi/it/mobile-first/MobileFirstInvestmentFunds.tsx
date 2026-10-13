import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import { getItalyFinancialSnapshot } from '@/features/finance/italyFinancials'
import { allocateValues, getFundPositions } from '@/features/investments/mobileFirstValuation'
import { useId, useRef, useState, type ReactNode } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { useDemo } from '@/app/state/demoStore'
import {
  readFundsState,
  fundsContractState,
  submitFundOrder,
  cancelFundOrder,
  fundAvailableShares,
  getFundInvestmentCapacity,
} from '@/features/investments/mobileFirstFundsState'
import {
  fundOperationMoney,
  availableInvestmentFunds,
  defaultPacParameters,
  defaultSavingsParameters,
  fundActionLabels,
  fundActionFromRoute,
  fundMatchesDistribution,
  nextPlanStatus,
  planStatusLabels,
  validateFundOperation,
  requiresFundAmountConfirmation,
  validatePac,
  validateSavingsPlan,
  validateFundsMobileCode,
  type FundAction,
  type PlanStatus,
} from '@/features/investments/mobileFirstFunds'
import {
  InvestmentAmount,
  InvestmentButton,
  InvestmentPage,
  InvestmentRows,
  InvestmentTabs,
} from './MobileFirstInvestmentPrimitives'
import {
  fundsCatalogSections,
  initialFundOrders,
  investmentFunds,
  type FundOrder,
  type InvestmentFund,
} from './investmentsFundsContent'
import down from '@/assets/mobile-first/it/investments/funds/661401-imgNavigationAndActionDownK10.svg'
import ordersIcon from '@/assets/mobile-first/it/investments/funds/661401-imgInvestmentsOrdersAndTransactions.svg'
import searchIcon from '@/assets/mobile-first/it/investments/funds/661401-imgNavigationAndActionSearchK10.svg'
import savingsIcon from '@/assets/mobile-first/it/investments/funds/661401-imgInvestmentsBankInsurance.svg'
import fundsIcon from '@/assets/mobile-first/it/investments/funds/661402-imgIconsInvestimentiGraficoPortafoglio.svg'
import bottomLine from '@/assets/mobile-first/it/investments/funds/661402-imgLineBottom.svg'
import topLine from '@/assets/mobile-first/it/investments/funds/661402-imgLineTop.svg'
import newFundsImage from '@/assets/mobile-first/it/investments/funds/658839-imgImage.png'
import ideasBackground from '@/assets/mobile-first/it/investments/funds/658839-imgImage1.png'
import ideasImage from '@/assets/mobile-first/it/investments/funds/658839-imgImage2.png'
import sustainabilityImage from '@/assets/mobile-first/it/investments/funds/658839-imgImage3.png'
import guideImage from '@/assets/mobile-first/it/investments/funds/658839-imgImage4.png'
import forth from '@/assets/mobile-first/it/investments/funds/658839-imgNavigationAndActionForthT2.svg'
import cardLine from '@/assets/mobile-first/it/investments/funds/661417-imgLine21.svg'
import successIcon from '@/assets/mobile-first/it/investments/funds/671942-imgNavigationAndActionSuccessLargeTkyPage.svg'
import signatureFacsimile from '@/assets/mobile-first/it/investments/funds/671895-imgRectangle4126.png'
import savingsInfoIcon from '@/assets/mobile-first/it/investments/funds/savings-info.svg'
import MobileFirstInvestmentFundsSheet from './MobileFirstInvestmentFundsSheet'
import './mobile-first-investments-funds.css'

export interface MobileFirstInvestmentFundsProps {
  view: string
  instrument?: string
  action?: string
  embedded?: boolean
  onNavigate: (destination: {
    area: 'securities' | 'funds' | 'services'
    view: string
    instrument?: string
    action?: string
  }) => void
  onClose: () => void
}
const monetary = (value: number, decimals = 2) => <InvestmentAmount value={value} decimals={decimals} />
function Field({
  label,
  value,
  onChange,
  optional = false,
  onInfo,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  optional?: boolean
  onInfo?: () => void
}) {
  const id = useId()
  return (
    <div className="mfif-field">
      <div className="mfif-field-label">
        <label htmlFor={id}>
          {label}
          {optional && ' (opzionale)'}
        </label>
        {onInfo && (
          <button className="mfif-field-info" type="button" aria-label={`Informazioni ${label}`} onClick={onInfo}>
            <img src={savingsInfoIcon} alt="" />
          </button>
        )}
      </div>
      <input
        id={id}
        type="number"
        min="0"
        step="any"
        value={value || ''}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
function FundCard({ fund, onClick }: { fund: InvestmentFund; onClick: () => void }) {
  return (
    <button type="button" className="mfif-fund-card" onClick={onClick}>
      <strong>{fund.name}</strong>
      <span>{fund.manager}</span>
      <div className="mfif-grid">
        <span>PMC{monetary(fund.pmc, 4)}</span>
        <span>NAV{monetary(fund.nav, 4)}</span>
        <span>Controvalore{monetary(fund.value)}</span>
        <span>
          P&amp;L | %{monetary(fund.profit)}
          <small className="mfif-positive">{fund.percent}</small>
        </span>
      </div>
      <img className="mfif-card-line" src={cardLine} alt="" />
      <small>Valore NAV riferito al {formatInvestmentReferenceDate()} (dati demo)</small>
    </button>
  )
}

export default function MobileFirstInvestmentFunds({
  view,
  instrument,
  action,
  embedded,
  onNavigate,
  onClose,
}: MobileFirstInvestmentFundsProps) {
  const { amountsHidden, productCounts } = useDemo()
  const emptyPortfolio = productCounts.investments === 0
  const [stored] = useState(readFundsState)
  const orderId = useRef(`MF${crypto.randomUUID()}`)
  const [screen, setScreen] = useState(view)
  const [history, setHistory] = useState<string[]>([])
  const [selectedFund, setFund] = useState<InvestmentFund>(
    investmentFunds.find(
      (item) =>
        item.id === instrument ||
        item.name === instrument ||
        item.isin === instrument ||
        (!instrument && item.id === stored?.fund),
    ) ?? investmentFunds[0]!,
  )
  const fund =
    getFundPositions().find((item) => item.id === selectedFund.id || item.name === selectedFund.name) ?? selectedFund
  const [tab, setTab] = useState('La tua posizione')
  const [operations, setOperations] = useState(false)
  const initialAction = fundActionFromRoute(action)
  const [operation, setOperation] = useState<FundAction>(initialAction)
  const [step, setStep] = useState(0)
  const [unit, setUnit] = useState<'amount' | 'shares'>(
    initialAction === 'redeem' || initialAction === 'switch' ? 'shares' : 'amount',
  )
  const [amount, setAmount] = useState(initialAction === 'subscribe' ? 100 : initialAction === 'add' ? 50 : 0)
  const [contract, setContract] = useState(
    fund.type === 'Risparmia e investi' &&
      ['activate', 'modify', 'suspend', 'reactivate', 'revoke'].includes(initialAction)
      ? 'Risparmia e investi'
      : fund.type === 'PAC'
        ? 'PAC'
        : 'PIC',
  )
  const [target, setTarget] = useState('allianz')
  const [destination, setDestination] = useState('Reinvesti')
  const savedContract = fundsContractState(stored, fund.id)
  const [pac, setPac] = useState(savedContract?.pac ?? { ...defaultPacParameters })
  const [savings, setSavings] = useState(savedContract?.savings ?? { ...defaultSavingsParameters })
  const [pacStatus, setPacStatus] = useState<PlanStatus>(savedContract?.pacStatus ?? 'active')
  const [savingsStatus, setSavingsStatus] = useState<PlanStatus>(
    savedContract?.savingsStatus ?? (view === 'fund' && fund.type === 'Risparmia e investi' ? 'active' : 'inactive'),
  )
  const [consent, setConsent] = useState<boolean[]>([false, false, false])
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [amountWarning, setAmountWarning] = useState(false)
  const [warningAccepted, setWarningAccepted] = useState(false)
  const [inadequateAccepted, setInadequateAccepted] = useState(false)
  const [insurance, setInsurance] = useState(false)
  const [orders, setOrders] = useState<FundOrder[]>(emptyPortfolio ? [] : (stored?.orders ?? initialFundOrders))
  const currentFunds = getFundPositions(orders)
  const fundsTotal = currentFunds.reduce((sum, p) => sum + Math.round(p.value * 100), 0) / 100
  const fundsProfit = currentFunds.reduce((sum, p) => sum + Math.round(p.profit * 100), 0) / 100
  const fundsCost = fundsTotal - fundsProfit
  const fundsAllocation = allocateValues(
    Array.from(new Set(currentFunds.map((p) => p.type)), (name) => ({
      name,
      id: currentFunds.find((p) => p.type === name)!.id,
      valueCents: currentFunds.filter((p) => p.type === name).reduce((sum, p) => sum + Math.round(p.value * 100), 0),
    })),
  ).map((p) => ({ ...p, value: p.valueCents / 100 }))
  const [selectedOrder, setSelectedOrder] = useState(initialFundOrders[0])
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [query, setQuery] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [filters, setFilters] = useState({ manager: '', category: '', type: '', distribution: '' })
  const [orderFilters, setOrderFilters] = useState({ action: '', status: '', from: '', to: '' })
  const [showOrderFilters, setShowOrderFilters] = useState(false)
  const [pir, setPir] = useState(action === 'pir' || instrument === 'pir')
  const [savingsTab, setSavingsTab] = useState('Da attivare')
  const [document, setDocument] = useState('')
  const [fieldInfo, setFieldInfo] = useState('')
  const [catalogSection, setCatalogSection] = useState<keyof typeof fundsCatalogSections>('news')
  const go = (next: string) => {
    setHistory([...history, screen])
    setScreen(next)
    setError('')
    setOperations(false)
  }
  const back = () => {
    if (fieldInfo) {
      setFieldInfo('')
      return
    }
    if (document) {
      setDocument('')
      return
    }
    if (screen === 'operation' && step > 0) {
      setConsent([false, false, false])
      setInadequateAccepted(false)
      setCode('')
      setStep(step - 1)
      setError('')
      return
    }
    if (screen === 'success' || screen === 'cancel-success') {
      setScreen(isSavings ? 'savings-plan' : 'orders')
      setHistory([])
      return
    }
    const previous = history.at(-1)
    if (previous) {
      setScreen(previous)
      setHistory(history.slice(0, -1))
      setOperations(false)
      setError('')
    } else onClose()
  }
  const selectFund = (next: InvestmentFund) => {
    const selected = fundsContractState(readFundsState(), next.id)
    setFund(next)
    setPac(selected?.pac ?? { ...defaultPacParameters })
    setSavings(selected?.savings ?? { ...defaultSavingsParameters })
    setPacStatus(selected?.pacStatus ?? 'active')
    setSavingsStatus(selected?.savingsStatus ?? (next.type === 'Risparmia e investi' ? 'active' : 'inactive'))
  }
  const openFund = (next: InvestmentFund) => {
    selectFund(next)
    setTab('La tua posizione')
    go('sheet')
  }
  const start = (next: FundAction, savingsFlow = false, sourceFund = fund) => {
    orderId.current = `MF${crypto.randomUUID()}`
    setOperation(next)
    setStep(0)
    setAmount(next === 'subscribe' ? 100 : next === 'add' ? 50 : 0)
    setUnit(next === 'redeem' || next === 'switch' ? 'shares' : 'amount')
    setConsent([false, false, false])
    setWarningAccepted(false)
    setAmountWarning(false)
    setInadequateAccepted(false)
    setCode('')
    setContract(
      savingsFlow
        ? 'Risparmia e investi'
        : sourceFund.type === 'PAC' ||
            next === 'activate' ||
            next === 'modify' ||
            next === 'suspend' ||
            next === 'reactivate' ||
            next === 'revoke' ||
            next === 'advance'
          ? 'PAC'
          : 'PIC',
    )
    go('operation')
  }
  const isSavings = contract === 'Risparmia e investi'
  const lifecycle = ['activate', 'modify', 'suspend', 'reactivate', 'revoke', 'advance'].includes(operation)
  const operationTitle = isSavings
    ? `${fundActionLabels[operation]} al servizio Risparmia e Investi`
    : lifecycle
      ? `${fundActionLabels[operation]} PAC`
      : fundActionLabels[operation]
  const needsParameters = lifecycle && ['activate', 'modify', 'reactivate'].includes(operation)
  const stepNames = lifecycle
    ? [
        'Riepilogo caratteristiche',
        ...(needsParameters ? ['Inserisci i dati'] : []),
        ...(operation === 'advance' ? ['Inserisci l’importo che desideri versare'] : []),
        'Riepilogo dei dati',
        'Prendi visione dei moduli e conferma le dichiarazioni',
        'Mobile Code',
      ]
    : operation === 'subscribe' || operation === 'add'
      ? [
          'Scegli il deposito titoli di riferimento',
          'Scegli la modalità di sottoscrizione',
          'Indica l’importo',
          ...(contract === 'PAC' ? ['Imposta parametri PAC'] : []),
          ...(contract === 'PAC' ? ['Aggiungi la copertura assicurativa'] : []),
          'Scegli come destinare eventuali proventi del fondo',
          'Prendi visione della documentazione',
          'Riepilogo operazione',
          'Prendi visione dei moduli e conferma le dichiarazioni',
          'Mobile Code',
        ]
      : operation === 'switch'
        ? [
            'Scegli il fondo di destinazione',
            'Imposta il rimborso',
            'Reinvesti o accredita',
            'Riepilogo operazione',
            'Prendi visione dei moduli e conferma le dichiarazioni',
            'Mobile Code',
          ]
        : [
            'Imposta il rimborso',
            'Riepilogo operazione',
            'Prendi visione dei moduli e conferma le dichiarazioni',
            'Mobile Code',
          ]
  const currentStep = stepNames[step] ?? 'Mobile Code'
  const operationMoney = fundOperationMoney({ action: operation, amount, unit, nav: fund.nav, contract, pac })
  const summaryRows = [
    { label: 'Fondo', value: fund.name },
    { label: 'ISIN', value: fund.isin },
    { label: 'Deposito titoli', value: '17010 - 0000017838112' },
    { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
    { label: 'Conto di regolamento', value: '7525 - 0000101829543' },
    {
      label: 'Commissione di sottoscrizione',
      value: monetary(operationMoney.feeCents / 100),
    },
  ]
  const confirm = () => {
    let validation = ''
    if (currentStep === 'Indica l’importo' || currentStep === 'Imposta il rimborso')
      validation = validateFundOperation({
        action: operation,
        amount,
        unit,
        shares: fundAvailableShares({ orders }, fund.id),
        nav: fund.nav,
      })
    if (currentStep === 'Imposta parametri PAC' || (currentStep === 'Inserisci i dati' && !isSavings))
      validation = validatePac(pac)
    if (currentStep === 'Inserisci i dati' && isSavings) validation = validateSavingsPlan(savings)
    if (currentStep === 'Inserisci l’importo che desideri versare')
      validation = validateFundOperation({
        action: 'advance',
        amount: pac.amount,
        unit: 'amount',
        shares: fund.shares,
        nav: fund.nav,
      })
    if (currentStep === 'Mobile Code') {
      validation = validateFundsMobileCode(code)
      if (!validation) {
        const orderAmount = operationMoney.principalCents / 100
        const orderShares = operationMoney.shares
        const targetFund = investmentFunds.find((item) => item.id === target)
        const nextState = {
          version: 1 as const,
          fund: fund.id,
          pac,
          savings,
          pacStatus:
            !isSavings && (lifecycle || contract === 'PAC')
              ? nextPlanStatus(pacStatus, operation === 'subscribe' ? 'activate' : operation)
              : pacStatus,
          savingsStatus: isSavings ? nextPlanStatus(savingsStatus, operation) : savingsStatus,
          orders,
        }
        const result = submitFundOrder(nextState, {
          id: orderId.current,
          fund: fund.name,
          action: operationTitle,
          amount: orderAmount,
          shares: orderShares,
          ...(operation === 'switch'
            ? { targetFund: target, targetShares: targetFund && targetFund.nav > 0 ? orderAmount / targetFund.nav : 0 }
            : {}),
          date: getItalyFinancialSnapshot().asOf,
          status: 'Caricato',
        })
        if (result.error) {
          setError(result.error)
          return
        }
        setSavingsStatus(result.state.savingsStatus)
        setPacStatus(result.state.pacStatus)
        setOrders(result.state.orders)
        go('success')
        return
      }
    }
    if (validation) {
      setError(validation)
      return
    }
    if (currentStep === 'Indica l’importo' && requiresFundAmountConfirmation(amount, warningAccepted)) {
      setAmountWarning(true)
      return
    }
    if (currentStep === 'Scegli come destinare eventuali proventi del fondo' && action === 'subscribe-restricted') {
      setError('Non puoi proseguire con la sottoscrizione. Fondo non negoziabile per dipendenti UniCredit.')
      return
    }
    setError('')
    if (stepNames[step + 1]?.startsWith('Prendi visione')) setConsent([false, false, false])
    setStep(step + 1)
  }
  const fundTabs = [
    'La tua posizione',
    'Dettaglio fondo',
    ...(fund.type === 'PAC'
      ? ['Piano di accumulo']
      : fund.type === 'Risparmia e investi'
        ? ['Risparmia e investi']
        : fund.type === 'Conto gestito'
          ? ['Conto gestito']
          : []),
    'Altri dettagli',
    'Lista ultimi ordini',
  ]
  const visibleFunds = investmentFunds.filter(
    (item) =>
      `${item.name} ${item.isin}`.toLocaleLowerCase('it-IT').includes(query.toLocaleLowerCase('it-IT')) &&
      (!filters.manager || item.manager.toLowerCase().includes(filters.manager.toLowerCase())) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.type || item.type === filters.type) &&
      fundMatchesDistribution(item.name, filters.distribution),
  )
  const visibleOrders = orders.filter(
    (item) =>
      (!orderFilters.action || item.action.includes(orderFilters.action)) &&
      (!orderFilters.status || item.status === orderFilters.status) &&
      (!orderFilters.from || item.date >= orderFilters.from) &&
      (!orderFilters.to || item.date <= orderFilters.to),
  )
  const selectField = (label: string, value: string, values: readonly string[], change: (value: string) => void) => (
    <label className="mfif-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => change(event.target.value)}>
        {values.map((option) => (
          <option key={option} value={option}>
            {option || 'Tutti'}
          </option>
        ))}
      </select>
    </label>
  )
  const catalogResults = (
    <div className="mfif-results">
      {visibleFunds.length === 0 && <p role="status">Nessun fondo trovato. Modifica i filtri di ricerca.</p>}
      {visibleFunds.map((item) => (
        <button type="button" key={item.id} className="mfif-search-result" onClick={() => openFund(item)}>
          <strong>{item.name}</strong>
          <span>Ultimo NAV | Variazione 1A</span>
          <span>
            {item.nav > 0 ? monetary(item.nav) : 'N.D.'} <span className="mfif-positive">{item.percent}</span>
          </span>
          <small>ISIN {item.isin}</small>
        </button>
      ))}
    </div>
  )
  const orderList = (
    <div className="mfif-orders">
      {visibleOrders.length === 0 && <p role="status">Nessun ordine corrisponde ai filtri selezionati.</p>}
      {visibleOrders.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => {
            setSelectedOrder(item)
            go('order')
          }}
        >
          <strong>{item.fund}</strong>
          <span>{item.action}</span>
          <span className="mfif-status">{item.status}</span>
          <div className="mfif-grid">
            <span>
              Quote
              <strong>
                {amountsHidden ? '••••' : item.shares.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
              </strong>
            </span>
            <span>Importo{monetary(item.amount)}</span>
            <span>
              Data<strong>{item.date.split('-').reverse().join('/')}</strong>
            </span>
          </div>
        </button>
      ))}
    </div>
  )
  let body: ReactNode
  let title = ''
  let footer: ReactNode
  if (screen === 'portfolio') {
    body = emptyPortfolio ? (
      <div className="mfif-empty">
        <h2>I tuoi fondi</h2>
        <p>Non hai ancora fondi nel tuo portafoglio.</p>
        <InvestmentButton onClick={() => onNavigate({ area: 'funds', view: 'catalog' })}>
          Scopri i fondi
        </InvestmentButton>
      </div>
    ) : (
      <>
        <section className="mfif-deposit">
          <button type="button" onClick={() => setPir(!pir)} className="mfif-deposit-select">
            Deposito
            <img src={down} alt="" />
          </button>
          <strong>Andrea Rossini Bianchi{pir ? ' - PIR' : ''}</strong>
          <small>{pir ? 'n. 00000017838164' : '17010 - 0000017838112'}</small>
          <div className="mfif-grid mfif-deposit-values">
            <span>
              <strong className="mfif-deposit-label">Controvalore di mercato</strong>
              {monetary(fundsTotal)}
            </span>
            <span>
              <strong className="mfif-deposit-label">P&amp;L €/%</strong>
              <span className="mfif-deposit-pnl">
                {monetary(fundsProfit)}
                <small className="mfif-positive">
                  {fundsCost ? ((fundsProfit / fundsCost) * 100).toFixed(2).replace('.', ',') : '0,00'}%
                </small>
              </span>
            </span>
          </div>
          <div className="mfif-quick-actions">
            {[
              { label: 'Ordini', icon: ordersIcon, view: 'orders' },
              { label: 'Ricerca fondi', icon: searchIcon, view: 'search' },
              {
                label: pir ? 'Plafond PIR' : 'Risparmia e investi',
                icon: savingsIcon,
                view: pir ? 'pir' : 'savings-plan',
              },
            ].map((item) => (
              <button key={item.label} type="button" onClick={() => onNavigate({ area: 'funds', view: item.view })}>
                <span>
                  <img src={item.icon} alt="" />
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>I tuoi fondi</h2>
          <div className="mfif-allocation">
            {fundsAllocation.map((item, index) => (
              <button
                type="button"
                key={item.name}
                onClick={() => {
                  globalThis.document
                    .getElementById(`mfif-${item.name}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <span>
                  <img src={fundsIcon} alt="" />
                  {item.name}
                </span>
                <span>{item.percent}%</span>
                {monetary(item.value)}
                {index > 0 && <img className="mfif-line mfif-line-top" src={topLine} alt="" />}
                <img className="mfif-line" src={bottomLine} alt="" />
              </button>
            ))}
          </div>
        </section>
        {fundsAllocation.map((item) => (
          <section id={`mfif-${item.name}`} key={item.name}>
            <h3>{item.name}</h3>
            {currentFunds
              .filter((candidate) => candidate.type === item.name && candidate.shares > 0)
              .map((candidate) => (
                <FundCard
                  key={candidate.id}
                  fund={candidate}
                  onClick={() => onNavigate({ area: 'funds', view: 'fund', instrument: candidate.id })}
                />
              ))}
          </section>
        ))}
      </>
    )
  } else if (screen === 'catalog') {
    title = 'Vetrina fondi'
    body = (
      <>
        <div className="mfif-catalog-tabs">
          <button type="button" onClick={() => onNavigate({ area: 'securities', view: 'markets' })}>
            Mercati
          </button>
          <strong>Fondi</strong>
          <button type="button" aria-label="Ricerca fondi" onClick={() => go('search')}>
            <img src={searchIcon} alt="" />
          </button>
        </div>
        <section>
          <h3>Novità</h3>
          <button
            className="mfif-commercial"
            type="button"
            onClick={() => {
              setCatalogSection('news')
              go('catalog-detail')
            }}
          >
            <img src={newFundsImage} alt="" />
            <strong>Nuovi fondi disponibili</strong>
            <span>La nostra offerta</span>
          </button>
        </section>
        <section>
          <h3>In evidenza</h3>
          <div className="mfif-commercial-grid">
            <button
              type="button"
              onClick={() => {
                setCatalogSection('ideas')
                go('catalog-detail')
              }}
            >
              <span className="mfif-commercial-photo mfif-ideas">
                <img className="mfif-photo-bg" src={ideasBackground} alt="" />
                <img className="mfif-photo-ideas" src={ideasImage} alt="" />
              </span>
              <strong>Idee di investimento</strong>
              <span>Scopri come affrontare i mercati</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCatalogSection('pac')
                go('catalog-detail')
              }}
            >
              <span className="mfif-commercial-photo">
                <img className="mfif-photo-bg" src={ideasBackground} alt="" />
                <img src={sustainabilityImage} alt="" />
              </span>
              <strong>Piani di accumulo</strong>
              <span>Scopri come investire gradualmente nel tempo</span>
            </button>
          </div>
        </section>
        <section>
          <h3>Asset Manager</h3>
          <button type="button" className="mfif-commercial" onClick={() => go('search')}>
            <img src={guideImage} alt="" />
            <strong>Scopri i fondi One Market</strong>
            <span>La nostra offerta di fondi è tutta un’altra musica</span>
          </button>
          <button type="button" className="mfif-text" onClick={() => go('search')}>
            Scopri tutti gli Asset Manager
            <img src={forth} alt="" />
          </button>
        </section>
        <section>
          <h3>Temi di investimento</h3>
          <p>Qui troverai alcuni temi di investimento che seguono le tendenze del momento</p>
          {['Fondi azionari', 'Top performance dei Fondi'].map((label, index) => (
            <button
              className="mfif-link-row"
              key={label}
              type="button"
              onClick={() => {
                setFilters({
                  ...filters,
                  category: ['Azionari', 'Obbligazionari', 'Bilanciati', 'Flessibili'][index] ?? '',
                })
                go('search')
              }}
            >
              {label}
              <img src={forth} alt="" />
            </button>
          ))}
        </section>
        <section>
          <button type="button" className="mfif-text" onClick={() => go('search')}>
            Apri tutti i temi di investimento
            <img src={forth} alt="" />
          </button>
        </section>
      </>
    )
    footer = <InvestmentButton onClick={() => go('search')}>Investi</InvestmentButton>
  } else if (screen === 'catalog-detail') {
    const section = fundsCatalogSections[catalogSection]
    title = section.title
    body = (
      <>
        <p>{section.subtitle}</p>
        {section.funds.map((item) => (
          <section key={item.name}>
            <h3>{item.heading}</h3>
            <button
              className="mfif-search-result mfif-eligible"
              type="button"
              onClick={() => openFund(availableInvestmentFunds.find((fund) => fund.name === item.name)!)}
            >
              <strong>{item.name}</strong>
              <span>Ultimo NAV | Variazione 1A</span>
              <span>
                <InvestmentAmount value={item.nav} decimals={3} /> | {item.percent}
              </span>
              <small>ISIN LU1941682335</small>
            </button>
            <button className="mfif-text" type="button" onClick={() => setDocument('Brochure del fondo')}>
              apri la brochure del fondo
              <img src={forth} alt="" />
            </button>
          </section>
        ))}
        <p className="mfif-muted">
          I dati si riferiscono ai risultati passati, che non sono indicativi di quelli futuri. Prima dell’adesione
          leggere il KID.
        </p>
      </>
    )
  } else if (screen === 'search') {
    title = advanced ? 'Ricerca avanzata' : 'Ricerca'
    body = (
      <>
        <label className="mfif-search">
          <img src={searchIcon} alt="" />
          <input
            aria-label="Ricerca fondi per nome o ISIN"
            placeholder="Cerca nome o ISIN"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button type="button" className="mfif-text" onClick={() => setAdvanced(!advanced)}>
          {advanced ? 'Chiudi ricerca avanzata' : 'Ricerca avanzata'}
        </button>
        {advanced && (
          <div className="mfif-filters">
            <h3>Filtra fondi:</h3>
            {selectField('Asset manager', filters.manager, ['', 'Amundi', 'Pictet', 'Allianz', 'Fidelity'], (manager) =>
              setFilters({ ...filters, manager }),
            )}
            {selectField('Modalità di sottoscrizione', filters.type, ['', 'PIC', 'PAC'], (type) =>
              setFilters({ ...filters, type }),
            )}
            {selectField(
              'Macrocategoria',
              filters.category,
              ['', 'Azionari', 'Obbligazionari', 'Bilanciati', 'Flessibili'],
              (category) => setFilters({ ...filters, category }),
            )}
            {selectField(
              'Distribuzione proventi',
              filters.distribution,
              ['', 'Accumulo', 'Distribuzione'],
              (distribution) => setFilters({ ...filters, distribution }),
            )}
            <InvestmentButton onClick={() => setAdvanced(false)}>
              Filtra • {visibleFunds.length} risultati
            </InvestmentButton>
            <button
              type="button"
              className="mfif-text"
              onClick={() => {
                setFilters({ manager: '', category: '', type: '', distribution: '' })
                setQuery('')
              }}
            >
              Rimuovi filtri
            </button>
          </div>
        )}
        {catalogResults}
      </>
    )
  } else if (screen === 'sheet') {
    title = 'Scheda di dettaglio'
    body = <MobileFirstInvestmentFundsSheet fund={fund} onDocument={setDocument} />
    footer = <InvestmentButton onClick={() => start('subscribe')}>Sottoscrivi</InvestmentButton>
  } else if (screen === 'fund') {
    title = 'Posizione del tuo fondo'
    const status = fund.type === 'Risparmia e investi' ? savingsStatus : pacStatus
    body = (
      <>
        <div className="mfif-fund-title">
          <strong>{fund.name}</strong>
          <div>
            <button type="button" className="mfif-text" onClick={() => go('sheet')}>
              scheda fondo
            </button>
            <button type="button" className="mfif-text" onClick={() => setDocument('Key information document (KID)')}>
              kid
            </button>
          </div>
        </div>
        <InvestmentTabs labels={fundTabs} value={tab} onChange={setTab} />
        <h3>{tab}</h3>
        {tab === 'La tua posizione' && (
          <>
            <p className="mfif-muted">Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)</p>
            <InvestmentRows
              rows={[
                { label: 'Tipo di contratto', value: fund.type },
                { label: 'PMC', value: monetary(fund.pmc, 4) },
                { label: 'Data quota', value: formatInvestmentReferenceDate() },
                { label: 'Ultimo NAV', value: monetary(fund.nav, 4) },
                {
                  label: 'Quote',
                  value: amountsHidden ? '••••' : fund.shares.toLocaleString('it-IT', { maximumFractionDigits: 6 }),
                },
                {
                  label: 'Quote disponibili',
                  value: amountsHidden ? '••••' : fundAvailableShares({ orders }, fund.id),
                },
                { label: 'Categoria assogestioni', value: fund.category },
                { label: 'Controvalore', value: monetary(fund.value) },
                { label: 'P&L €', value: monetary(fund.profit) },
                { label: 'P&L %', value: fund.percent },
                { label: 'Codice titolarità', value: 'US037833100563524563145YER9241AS731' },
              ]}
            />
          </>
        )}
        {tab === 'Dettaglio fondo' && (
          <InvestmentRows
            rows={[
              { label: 'Società prodotto', value: fund.manager },
              { label: 'Categoria', value: 'Fondo' },
              { label: 'Fondo', value: fund.type },
              { label: 'ISIN', value: fund.isin },
              { label: 'Classe', value: 'C' },
              { label: 'Posizione numero', value: '24' },
              { label: 'Conto di regolamento', value: 'AU532U97' },
            ]}
          />
        )}
        {tab === 'Altri dettagli' && (
          <InvestmentRows
            rows={[
              { label: 'Divisa', value: 'EUR' },
              { label: 'Data quota', value: formatInvestmentReferenceDate() },
              { label: 'Stato posizione', value: planStatusLabels[status] },
              { label: 'Data inserimento', value: '11/04/2024' },
              { label: 'Data ultima variazione', value: '13/12/2024' },
              { label: 'Tipo certificato', value: 'Cumulativo' },
              { label: 'Modalità di adesione', value: 'Online' },
              { label: 'Rendimento su base annua', value: 'N.D.' },
            ]}
          />
        )}
        {tab === 'Piano di accumulo' && (
          <InvestmentRows
            rows={[
              { label: 'Stato PAC', value: planStatusLabels[pacStatus] },
              { label: 'Importo rata', value: monetary(pac.amount) },
              { label: 'Periodicità', value: 'Mensile' },
              { label: 'Totale numero rate', value: pac.installments },
              {
                label: 'Rate residue',
                value: Math.max(
                  0,
                  pac.installments -
                    orders.filter(
                      (item) =>
                        item.fund === fund.name && item.status === 'Eseguito' && /PAC|Anticipo rata/.test(item.action),
                    ).length,
                ),
              },
              { label: 'Giorno addebito rata', value: pac.day },
            ]}
          />
        )}
        {tab === 'Risparmia e investi' && (
          <InvestmentRows
            rows={[
              { label: 'Giacenza media', value: monetary(savings.average) },
              { label: 'Ultimo investimento', value: '-' },
              { label: 'Conto', value: '5326 - 600036167' },
              { label: 'Costi amministrativi annui', value: monetary(9) },
              { label: 'Soglia di investimento', value: monetary(savings.upper) },
              { label: 'Soglia di disinvestimento', value: monetary(savings.lower) },
              { label: 'Ultimo disinvestimento', value: '-' },
              { label: 'Stato del servizio', value: planStatusLabels[savingsStatus] },
            ]}
          />
        )}
        {tab === 'Conto gestito' && (
          <InvestmentRows
            rows={[
              { label: 'Conto', value: '5326 - 600036167' },
              { label: 'Giacenza media', value: monetary(4000) },
              { label: 'Modalità regolamento', value: '-' },
              { label: 'Giacenza massima', value: monetary(10000) },
              { label: 'Giacenza minima', value: monetary(5000) },
              { label: 'Ultimo disinvestimento', value: '11/03/2022' },
              { label: 'Canone annuale', value: monetary(700) },
            ]}
          />
        )}
        {tab === 'Lista ultimi ordini' && orderList}
        {operations && (
          <div className="mfif-operation-menu">
            <h3>Operazioni</h3>
            {(
              [
                'subscribe',
                'redeem',
                'add',
                'switch',
                ...(fund.type === 'PAC'
                  ? ['advance', 'modify', pacStatus === 'suspended' ? 'reactivate' : 'suspend', 'revoke']
                  : fund.type === 'Risparmia e investi'
                    ? savingsStatus === 'active'
                      ? ['modify', 'suspend', 'revoke']
                      : savingsStatus === 'suspended'
                        ? ['reactivate', 'revoke']
                        : ['activate']
                    : []),
              ] as FundAction[]
            ).map((item) => (
              <button key={item} type="button" onClick={() => start(item, fund.type === 'Risparmia e investi')}>
                {fundActionLabels[item]}
                {['modify', 'suspend', 'reactivate', 'revoke'].includes(item) && fund.type === 'PAC' ? ' PAC' : ''}
                <img src={forth} alt="" />
              </button>
            ))}
          </div>
        )}
      </>
    )
    footer = <InvestmentButton onClick={() => setOperations(!operations)}>Operazioni</InvestmentButton>
  } else if (screen === 'savings-plan') {
    title = 'Risparmia e investi'
    body = (
      <>
        <p>
          Risparmia e Investi è il Servizio di UniCredit che, in funzione del saldo del conto corrente e di altri
          parametri da te individuati, determina in automatico la porzione di liquidità da destinare all’investimento
          nel fondo da te scelto o quanto disinvestire dallo stesso.
        </p>
        <p>
          Prima di procedere all’adesione, prendi visione delle norme del servizio e informa gli eventuali cointestatari
          del Conto Titoli.
        </p>
        <button type="button" className="mfif-text" onClick={() => setDocument('Norme del servizio')}>
          norme del servizio
        </button>
        <InvestmentTabs
          labels={['Da attivare', 'Fondi idonei', ...(savingsStatus !== 'inactive' ? ['Servizio attivo'] : [])]}
          value={savingsTab}
          onChange={setSavingsTab}
        />
        {savingsTab === 'Servizio attivo' ? (
          <>
            <InvestmentRows
              rows={[
                { label: 'Stato del servizio', value: planStatusLabels[savingsStatus] },
                { label: 'Fondo', value: fund.name },
                { label: 'Giacenza media', value: monetary(savings.average) },
                { label: 'Soglia di investimento', value: monetary(savings.upper) },
                { label: 'Soglia di disinvestimento', value: monetary(savings.lower) },
              ]}
            />
            {(savingsStatus === 'active'
              ? ['modify', 'suspend', 'revoke']
              : savingsStatus === 'suspended'
                ? ['reactivate', 'revoke']
                : ['activate']
            ).map((item) => (
              <button
                type="button"
                className="mfif-link-row"
                key={item}
                onClick={() => start(item as FundAction, true)}
              >
                {fundActionLabels[item as FundAction]}
                <img src={forth} alt="" />
              </button>
            ))}
          </>
        ) : (
          <>
            <p>
              {savingsTab === 'Da attivare'
                ? 'Per la seguente lista di fondi è possibile aderire al servizio “Risparmia e Investi” poiché sono già stati sottoscritti.'
                : 'Scegli un fondo idoneo al servizio Risparmia e Investi.'}
            </p>
            {investmentFunds.slice(4, 7).map((item) => (
              <article className="mfif-eligible" key={item.id}>
                <strong>{item.name}</strong>
                <small>{item.isin}</small>
                <InvestmentRows
                  rows={[
                    { label: 'Valore quota', value: monetary(item.nav) },
                    { label: 'Categoria', value: item.category },
                  ]}
                />
                <button
                  className="mfif-text"
                  type="button"
                  onClick={() => {
                    selectFund(item)
                    if (savingsTab === 'Fondi idonei') start('subscribe', false, item)
                    else start('activate', true, item)
                  }}
                >
                  {savingsTab === 'Fondi idonei' ? 'Sottoscrivi' : 'Aderisci'}
                </button>
              </article>
            ))}
          </>
        )}
      </>
    )
  } else if (screen === 'operation') {
    title = operationTitle
    body = (
      <>
        <div className="mfif-step">
          <strong>
            {step + 1}
            <span>/{stepNames.length}</span>
          </strong>
          <div>
            {stepNames.map((name, index) => (
              <i className={index <= step ? 'mfif-current' : ''} key={`${name}-${index}`} />
            ))}
          </div>
          <h3>{currentStep}</h3>
        </div>
        {error && (
          <p className="mfif-error" role="alert">
            {error}
          </p>
        )}
        {amountWarning && (
          <div className="mfif-confirm" role="alert">
            <h3>Attenzione</h3>
            <p>
              L’importo indicato non risulta disponibile sul conto di regolamento selezionato. Premi Conferma per
              proseguire con la selezione corrente o Annulla per selezionare un importo differente.
            </p>
            <InvestmentButton
              onClick={() => {
                setWarningAccepted(true)
                setAmountWarning(false)
                setStep(step + 1)
              }}
            >
              Conferma importo
            </InvestmentButton>
            <button className="mfif-text" type="button" onClick={() => setAmountWarning(false)}>
              Annulla
            </button>
          </div>
        )}
        {currentStep === 'Inserisci l’importo che desideri versare' && (
          <>
            <Field label="Importo rata" value={pac.amount} onChange={(value) => setPac({ ...pac, amount: value })} />
            <h3>Ultimi ordini</h3>
            {orderList}
          </>
        )}
        {currentStep === 'Aggiungi la copertura assicurativa' && (
          <>
            <p>
              Polizza infortuni gratuita: in caso di sottoscrizione tramite PAC è possibile abbinare tale polizza. Se
              vuoi aggiungerla, scegli la persona da assicurare tra gli intestatari del PAC.
            </p>
            <label className="mfif-field">
              <span>Persona da assicurare</span>
              <select>
                <option>Andrea Rossini Bianchi</option>
              </select>
            </label>
            <label>
              <input type="checkbox" checked={insurance} onChange={(event) => setInsurance(event.target.checked)} />{' '}
              Aggiungi polizza
            </label>
          </>
        )}
        {currentStep === 'Scegli il deposito titoli di riferimento' && (
          <InvestmentRows rows={[{ label: 'Deposito', value: '0000000017838164 - Andrea Rossini' }]} />
        )}
        {currentStep === 'Scegli la modalità di sottoscrizione' &&
          selectField('Modalità di sottoscrizione', contract, ['PIC', 'PAC'], setContract)}
        {currentStep === 'Scegli il fondo di destinazione' && (
          <>
            <label className="mfif-field">
              <span>Fondo di destinazione</span>
              <select value={target} onChange={(event) => setTarget(event.target.value)}>
                {investmentFunds
                  .filter((item) => item.id !== fund.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>
            <p>{investmentFunds.find((item) => item.id === target)?.name}</p>
          </>
        )}
        {(currentStep === 'Indica l’importo' || currentStep === 'Imposta il rimborso') && (
          <>
            {currentStep === 'Imposta il rimborso' &&
              selectField(
                'Seleziona la modalità',
                unit === 'shares' ? 'Quote' : 'Importo',
                ['Quote', 'Importo'],
                (value) => setUnit(value === 'Quote' ? 'shares' : 'amount'),
              )}
            <Field label={unit === 'shares' ? 'Quote' : 'Inserisci l’importo'} value={amount} onChange={setAmount} />
            {currentStep === 'Indica l’importo' ? (
              <p className="mfif-muted">
                In caso di prima sottoscrizione l’importo deve essere pari o superiore a 100€, in caso di operazioni
                successive deve essere pari o superiore a 50€.
              </p>
            ) : (
              <InvestmentRows
                rows={[
                  { label: 'Fondo', value: fund.name },
                  {
                    label: 'N° quote possedute*',
                    value: amountsHidden ? '••••' : fundAvailableShares({ orders }, fund.id),
                  },
                  { label: 'Controvalore quote possedute', value: monetary(fund.shares * fund.nav) },
                ]}
              />
            )}
          </>
        )}
        {(currentStep === 'Reinvesti o accredita' ||
          currentStep === 'Scegli come destinare eventuali proventi del fondo') &&
          selectField('Differenza di importo', destination, ['Reinvesti', 'Accredita sul conto'], setDestination)}
        {(currentStep === 'Imposta parametri PAC' || (currentStep === 'Inserisci i dati' && !isSavings)) && (
          <>
            <Field label="Importo rata" value={pac.amount} onChange={(value) => setPac({ ...pac, amount: value })} />
            <Field
              label="Numero rate"
              value={pac.installments}
              onChange={(value) => setPac({ ...pac, installments: value })}
            />
            <p className="mfif-muted">Scegli un numero tra 72 e 192 (per periodicità mensile).</p>
            <Field
              label="Importo versamento iniziale"
              value={pac.initial}
              onChange={(value) => setPac({ ...pac, initial: value })}
            />
            <p className="mfif-muted">Il versamento iniziale deve essere compreso tra 1.200€ e 2.300€.</p>
            <Field label="Giorno di addebito" value={pac.day} onChange={(value) => setPac({ ...pac, day: value })} />
            <p className="mfif-muted">
              Se il giorno di addebito corrisponde a una festività o non è presente nel mese, l’addebito sarà effettuato
              il primo giorno lavorativo successivo.
            </p>
          </>
        )}
        {currentStep === 'Inserisci i dati' && isSavings && (
          <>
            <Field
              label="Giacenza media"
              value={savings.average}
              onChange={(value) => setSavings({ ...savings, average: value })}
              onInfo={() => setFieldInfo('Giacenza media')}
            />
            <Field
              label="Soglia di disinvestimento"
              value={savings.lower}
              onChange={(value) => setSavings({ ...savings, lower: value })}
            />
            <Field
              label="Soglia di investimento"
              value={savings.upper}
              onChange={(value) => setSavings({ ...savings, upper: value })}
              onInfo={() => setFieldInfo('Soglia di investimento')}
            />
            <Field
              label="Limite massimo di investimento"
              optional
              value={savings.maximum}
              onChange={(value) => setSavings({ ...savings, maximum: value })}
              onInfo={() => setFieldInfo('Limite massimo di investimento (opzionale)')}
            />
            <Field
              label="Giorno verifica saldo c/c"
              value={savings.day}
              onChange={(value) => setSavings({ ...savings, day: value })}
            />
            <p className="mfif-muted">Gli importi sono modificabili con ammontari pari a multipli di 500 Euro.</p>
          </>
        )}
        {(currentStep.startsWith('Riepilogo') || currentStep === 'Prendi visione della documentazione') && (
          <>
            <InvestmentRows
              rows={[
                ...summaryRows,
                ...(lifecycle
                  ? [
                      { label: 'Richiesta', value: operationTitle },
                      {
                        label: isSavings ? 'Stato del servizio' : 'Stato PAC',
                        value: planStatusLabels[isSavings ? savingsStatus : pacStatus],
                      },
                      ...(isSavings
                        ? [
                            { label: 'Giacenza media', value: monetary(savings.average) },
                            { label: 'Soglia di investimento', value: monetary(savings.upper) },
                            { label: 'Soglia di disinvestimento', value: monetary(savings.lower) },
                          ]
                        : [
                            { label: 'Importo rata', value: monetary(pac.amount) },
                            { label: 'Numero rate', value: pac.installments },
                            { label: 'Periodicità', value: 'Mensile' },
                            { label: 'Giorno di addebito', value: pac.day },
                          ]),
                    ]
                  : [
                      { label: 'Modalità di sottoscrizione', value: contract },
                      {
                        label: unit === 'shares' ? 'Quote' : 'Importo',
                        value:
                          unit === 'shares'
                            ? amountsHidden
                              ? '••••'
                              : amount
                            : monetary(operationMoney.principalCents / 100),
                      },
                      {
                        label: 'Controvalore presunto',
                        value: monetary(operationMoney.principalCents / 100),
                      },
                      ...(operation === 'switch'
                        ? [
                            {
                              label: 'Fondo di destinazione',
                              value: investmentFunds.find((item) => item.id === target)?.name,
                            },
                            { label: 'Differenza', value: destination },
                          ]
                        : []),
                      { label: 'Valuta presunta di accredito rimborso', value: 'N.D.' },
                      { label: 'Numero posizione', value: '0000005672346' },
                    ]),
              ]}
            />
          </>
        )}
        {(currentStep.startsWith('Prendi visione') || (isSavings && currentStep === 'Inserisci i dati')) && (
          <div className="mfif-documents">
            {currentStep === 'Prendi visione dei moduli e conferma le dichiarazioni' && (
              <div className="mfif-facsimile">
                <img src={signatureFacsimile} alt="Facsimile del modulo di documentazione" />
                <strong>FACSIMILE</strong>
              </div>
            )}
            {action === 'subscribe-inadequate' && (
              <>
                <p className="mfif-error">
                  Se prosegui con l’operazione, il Portafoglio risulterà inadeguato. Prendi visione degli esiti dei
                  controlli di adeguatezza nel Modulo d’ordine.
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={inadequateAccepted}
                    onChange={(event) => setInadequateAccepted(event.target.checked)}
                  />
                  Voglio proseguire
                </label>
              </>
            )}
            <p>
              Ti raccomandiamo di prendere visione della documentazione qui esposta e delle eventuali avvertenze. Salva
              i documenti su supporto duraturo prima di proseguire.
            </p>
            {[
              'Key information document (KID)',
              isSavings ? 'Norme del servizio' : 'Informativa costi e oneri',
              'Dichiarazioni e modulo di sottoscrizione',
            ].map((label, index) => (
              <div key={label}>
                <button type="button" className="mfif-text" onClick={() => setDocument(label)}>
                  {label}
                </button>
                <label>
                  <input
                    type="checkbox"
                    checked={consent[index]}
                    onChange={(event) =>
                      setConsent(consent.map((value, position) => (position === index ? event.target.checked : value)))
                    }
                  />
                  Presa visione di {label}
                </label>
              </div>
            ))}
          </div>
        )}
        {currentStep === 'Mobile Code' && (
          <div className="mfif-signature">
            <h3>Inserisci il tuo Mobile Code</h3>
            <p>Inserisci il tuo PIN per confermare l’operazione.</p>
            <label className="mfif-field">
              <span>Mobile Code</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              />
            </label>
            <button
              type="button"
              className="mfif-text"
              onClick={() => setError('Per recuperare il Mobile Code, accedi alle impostazioni di sicurezza dell’app.')}
            >
              Ho dimenticato il Mobile Code
            </button>
          </div>
        )}
      </>
    )
    footer = (
      <InvestmentButton
        onClick={confirm}
        disabled={
          amountWarning ||
          (action === 'subscribe-inadequate' && currentStep.startsWith('Prendi visione') && !inadequateAccepted) ||
          ((currentStep.startsWith('Prendi visione') || (isSavings && currentStep === 'Inserisci i dati')) &&
            !consent.every(Boolean))
        }
      >
        {currentStep === 'Mobile Code' ? 'Conferma' : 'Prosegui'}
      </InvestmentButton>
    )
  } else if (screen === 'orders') {
    title = showOrderFilters ? 'Filtri di ricerca' : 'Ordini'
    body = (
      <>
        {showOrderFilters ? (
          <>
            <InvestmentRows rows={[{ label: 'Rapporto', value: '17010 0000017838112 - Andrea Rossini Bianchi' }]} />
            <label className="mfif-field">
              <span>Data dal</span>
              <input
                type="date"
                value={orderFilters.from}
                onChange={(event) => setOrderFilters({ ...orderFilters, from: event.target.value })}
              />
            </label>
            <label className="mfif-field">
              <span>Data al</span>
              <input
                type="date"
                value={orderFilters.to}
                onChange={(event) => setOrderFilters({ ...orderFilters, to: event.target.value })}
              />
            </label>
            {selectField(
              'Causale',
              orderFilters.action,
              ['', 'Rimborso', 'Sottoscrizione', 'Switch', 'Modifica', 'Sospensione'],
              (value) => setOrderFilters({ ...orderFilters, action: value }),
            )}
            {selectField('Stato', orderFilters.status, ['', 'Caricato', 'Inviato', 'Eseguito', 'Annullato'], (value) =>
              setOrderFilters({ ...orderFilters, status: value }),
            )}
            <button
              type="button"
              className="mfif-text"
              onClick={() => setOrderFilters({ action: '', status: '', from: '', to: '' })}
            >
              Rimuovi Filtri
            </button>
          </>
        ) : (
          <>
            <button type="button" className="mfif-text" onClick={() => setShowOrderFilters(true)}>
              Filtri di ricerca
            </button>
            <InvestmentRows
              rows={[
                { label: 'Rapporto', value: '17010 0000017838112 - Andrea Rossini Bianchi' },
                { label: 'Causale', value: orderFilters.action || 'Tutti' },
                { label: 'Stato', value: orderFilters.status || 'Tutti' },
              ]}
            />
            {orderList}
          </>
        )}
      </>
    )
    if (showOrderFilters)
      footer = <InvestmentButton onClick={() => setShowOrderFilters(false)}>Applica</InvestmentButton>
  } else if (screen === 'order') {
    title = 'Dettaglio ordine'
    body = (
      <>
        <h3>{selectedOrder.fund}</h3>
        <span className="mfif-status">{selectedOrder.status}</span>
        <h3>Dati ordinante</h3>
        <InvestmentRows rows={summaryRows.slice(2)} />
        <h3>Dati operazione</h3>
        <InvestmentRows
          rows={[
            { label: 'Ordine inserito in', value: 'Internet Banking Self Service' },
            { label: 'Data inserimento', value: selectedOrder.date.split('-').reverse().join('/') },
            { label: 'Ora inserimento', value: selectedOrder.id.startsWith('MF') ? 'N.D.' : '19:20:06' },
            { label: 'Ordine di', value: selectedOrder.action },
            { label: 'Esito operazione', value: selectedOrder.status },
            { label: 'Gestore', value: 'Amundi Soluzioni Italia' },
            { label: 'Categoria assogestione', value: 'Azionari Bilanciati' },
            { label: 'Tipo certificato', value: 'Cumulativo' },
            { label: 'Commissioni', value: monetary((selectedOrder.feeCents ?? 0) / 100) },
            { label: 'Oneri', value: monetary(0) },
            { label: 'Controvalore', value: monetary(selectedOrder.amount) },
            { label: 'Quote', value: amountsHidden ? '••••' : selectedOrder.shares },
          ]}
        />
        {cancelConfirm && (
          <div className="mfif-confirm">
            <h3>Vuoi annullare il tuo ordine?</h3>
            <p>L’ordine caricato può essere annullato prima dell’esecuzione.</p>
            <InvestmentButton
              onClick={() => {
                const nextState = cancelFundOrder(
                  { version: 1, fund: fund.id, pac, savings, pacStatus, savingsStatus, orders },
                  selectedOrder.id,
                )
                const updated = nextState.orders.find((item) => item.id === selectedOrder.id)!
                setOrders(nextState.orders)
                setSelectedOrder(updated)
                setCancelConfirm(false)
                go('cancel-success')
              }}
            >
              Conferma annullamento
            </InvestmentButton>
            <button className="mfif-text" type="button" onClick={() => setCancelConfirm(false)}>
              No, chiudi
            </button>
          </div>
        )}
      </>
    )
    if (selectedOrder.status === 'Caricato')
      footer = <InvestmentButton onClick={() => setCancelConfirm(true)}>Annulla ordine</InvestmentButton>
  } else if (screen === 'pir') {
    title = 'Plafond PIR ordinario'
    body = (
      <div className="mfif-pir">
        {getFundInvestmentCapacity(
          { orders, contracts: readFundsState()?.contracts },
          getItalyFinancialSnapshot().asOf,
        ).map((item) => (
          <div key={item.label}>
            <div>
              <strong>{item.label}</strong>
              {monetary(item.total)}
            </div>
            <progress value={item.used} max={item.total} />
            <div>
              <span>Utilizzato: {monetary(item.used)}</span>
              <span>Disponibile: {monetary(item.available)}</span>
            </div>
          </div>
        ))}
      </div>
    )
  } else {
    title = screen === 'cancel-success' ? 'Ordine annullato' : 'Operazione completata'
    body = (
      <div className="mfif-success">
        <img src={successIcon} alt="" />
        <h3>{title}</h3>
        <p>
          {screen === 'cancel-success'
            ? 'La richiesta di annullamento del tuo ordine è stata acquisita.'
            : `${operationTitle}: la tua richiesta è stata acquisita.`}
        </p>
        <InvestmentRows
          rows={[
            { label: 'Fondo', value: fund.name },
            ...(lifecycle
              ? [
                  {
                    label: isSavings ? 'Stato del servizio' : 'Stato PAC',
                    value: planStatusLabels[isSavings ? savingsStatus : pacStatus],
                  },
                ]
              : [{ label: 'Importo', value: monetary(operationMoney.principalCents / 100) }]),
          ]}
        />
      </div>
    )
    footer = (
      <InvestmentButton
        onClick={() => {
          if (isSavings) {
            setSavingsTab('Servizio attivo')
            go('savings-plan')
          } else go('orders')
        }}
      >
        Torna {isSavings ? 'al servizio' : 'agli ordini'}
      </InvestmentButton>
    )
  }
  const content = <div className={`mfif${screen === 'fund' ? ' mfif-position' : ''}`}>{body}</div>
  return (
    <>
      {screen === 'portfolio' && embedded ? (
        content
      ) : (
        <InvestmentPage title={title || 'Fondi'} onBack={back} onClose={onClose} footer={footer}>
          {content}
        </InvestmentPage>
      )}
      {document && (
        <InvestmentPage
          title={document}
          onBack={() => setDocument('')}
          onClose={() => setDocument('')}
          footer={
            <InvestmentButton
              onClick={() => {
                const index = document.toLowerCase().includes('kid')
                  ? 0
                  : document.toLowerCase().includes('norme') || document.toLowerCase().includes('costi')
                    ? 1
                    : 2
                setConsent(consent.map((value, position) => (position === index ? true : value)))
                setDocument('')
              }}
            >
              Ho preso visione
            </InvestmentButton>
          }
        >
          <div className="mfif">
            <h3>{fund.name}</h3>
            <InvestmentRows
              rows={[
                { label: 'ISIN', value: fund.isin },
                { label: 'Società prodotto', value: fund.manager },
                { label: 'Categoria', value: fund.category },
                { label: 'Divisa', value: 'EUR' },
                { label: 'Ultimo NAV', value: monetary(fund.nav, 4) },
              ]}
            />
            <p>
              Prima di procedere, verifica le caratteristiche del fondo, i costi e gli oneri e le dichiarazioni relative
              all’operazione.
            </p>
            <p>
              Il valore delle quote può variare. Consulta il KID e le norme del servizio relative al fondo selezionato.
            </p>
          </div>
        </InvestmentPage>
      )}
      {fieldInfo && (
        <BottomSheet title={fieldInfo} onClose={() => setFieldInfo('')}>
          <div className="mfif">
            <p>
              {fieldInfo === 'Giacenza media'
                ? 'La “Giacenza Media” deve essere un ammontare multiplo di Euro 500 e comunque non inferiore a Euro 4.000.'
                : fieldInfo === 'Soglia di investimento'
                  ? 'La “Soglia di investimento” deve essere un ammontare multiplo di Euro 500 e comunque superiore di almeno Euro 1.000 a quello della “giacenza media”.'
                  : 'Il limite massimo di investimento è opzionale.'}
            </p>
            <InvestmentButton onClick={() => setFieldInfo('')}>Va bene</InvestmentButton>
          </div>
        </BottomSheet>
      )}
    </>
  )
}
