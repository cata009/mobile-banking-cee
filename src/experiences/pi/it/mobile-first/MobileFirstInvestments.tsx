import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import { getInvestmentOverview } from '@/features/investments/mobileFirstValuation'
import PortfolioChart from './MobileFirstInvestmentChart'
import SingleChart from './MobileFirstInvestmentChartSingle'
import EdgeChart from './MobileFirstInvestmentChartEdge'
import { forwardRef, useImperativeHandle, useState, type ReactNode } from 'react'
import { useDemo } from '@/app/state/demoStore'
import {
  resolveInvestmentOverviewVariant,
  type InvestmentOverviewVariant,
} from '@/features/investments/mobileFirstInvestments'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { usePeriodSwipe } from '@/app/screens/analytics/evo/usePeriodSwipe'
import imgBankTouchpointAndCustomerCareOnlineAdviceK10 from '@/assets/mobile-first/it/investments/imgBankTouchpointAndCustomerCareOnlineAdviceK10.svg'
import imgInvestmentsIndexK10 from '@/assets/mobile-first/it/investments/imgInvestmentsIndexK10.svg'
import imgInvestmentsFundsK10 from '@/assets/mobile-first/it/investments/imgInvestmentsFundsK10.svg'
import imgInvestmentsBankInsuranceK10 from '@/assets/mobile-first/it/investments/imgInvestmentsBankInsuranceK10.svg'
import imgNavigationAndActionBackK4 from '@/assets/mobile-first/it/investments/imgNavigationAndActionBackK4.svg'
import imgNavigationAndActionForthK10 from '@/assets/mobile-first/it/investments/imgNavigationAndActionForthK10.svg'
import imgImage from '@/assets/mobile-first/it/investments/imgImage.png'
import imgImage1 from '@/assets/mobile-first/it/investments/imgImage1.png'
import imgImage2 from '@/assets/mobile-first/it/investments/imgImage2.png'
import imgImage3 from '@/assets/mobile-first/it/investments/imgImage3.png'
import imgImage4 from '@/assets/mobile-first/it/investments/imgImage4.png'
import imgEllipse29 from '@/assets/mobile-first/it/investments/imgEllipse29.svg'
import imgNavigationAndActionDownK10 from '@/assets/mobile-first/it/investments/imgNavigationAndActionDownK10.svg'
import imgIconsInvestimentiGraficoPortafoglio from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio.svg'
import imgLineBottom from '@/assets/mobile-first/it/investments/imgLineBottom.svg'
import imgLineTop from '@/assets/mobile-first/it/investments/imgLineTop.svg'
import imgIconsInvestimentiGraficoPortafoglio1 from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio1.svg'
import imgLineBottom1 from '@/assets/mobile-first/it/investments/imgLineBottom1.svg'
import imgIconsInvestimentiGraficoPortafoglio2 from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio2.svg'
import imgIconsInvestimentiGraficoPortafoglio3 from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio3.svg'
import imgIconsInvestimentiGraficoPortafoglio4 from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio4.svg'
import imgIconsInvestimentiGraficoPortafoglio5 from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGraficoPortafoglio5.svg'
import imgNavigationAndActionProfileT2 from '@/assets/mobile-first/it/investments/imgNavigationAndActionProfileT2.svg'
import imgNavigationAndActionDownloadT2 from '@/assets/mobile-first/it/investments/imgNavigationAndActionDownloadT2.svg'
import imgNavigationAndActionArrowDown from '@/assets/mobile-first/it/investments/imgNavigationAndActionArrowDown.svg'
import imgNavigationAndActionForthT2 from '@/assets/mobile-first/it/investments/imgNavigationAndActionForthT2.svg'
import product1 from '@/assets/mobile-first/it/investments/overview/product-1.png'
import product2 from '@/assets/mobile-first/it/investments/overview/product-2.png'
import product3 from '@/assets/mobile-first/it/investments/overview/product-3.png'
import product4 from '@/assets/mobile-first/it/investments/overview/product-4.png'
import warning from '@/assets/mobile-first/it/investments/common/warning.svg'
import bannerClose from '@/assets/mobile-first/it/investments/common/banner-close.svg'
import './mobile-first-investments.css'
import MobileFirstInvestmentArea from './MobileFirstInvestmentArea'
import MobileFirstInvestmentDepositInfo from './MobileFirstInvestmentDepositInfo'
import {
  InvestmentEducation,
  InvestmentMenu,
  InvestmentProductCatalog,
  type InvestmentHomeCategory,
} from './MobileFirstInvestmentExtras'
import { InvestmentPage, InvestmentButton } from './MobileFirstInvestmentPrimitives'
import type { InvestmentDestination } from './investmentsNavigation'
import {
  INVESTMENT_FOCUS_PUBLICATIONS,
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_TAB_DESTINATIONS,
} from './investmentsOverviewContent'
const allocations = [
  { title: 'Titoli', icon: imgIconsInvestimentiGraficoPortafoglio },
  { title: 'Fondi', icon: imgIconsInvestimentiGraficoPortafoglio1 },
  {
    title: 'Prodotti di risparmio',
    icon: imgIconsInvestimentiGraficoPortafoglio2,
  },
  { title: 'Prodotti assicurativi', icon: imgIconsInvestimentiGraficoPortafoglio3 },
  {
    title: 'Gestione di portafogli',
    icon: imgIconsInvestimentiGraficoPortafoglio4,
  },
  { title: 'Fondi pensione', icon: imgIconsInvestimentiGraficoPortafoglio5 },
]
const services = [
  { title: 'Area Consulenza', icon: imgBankTouchpointAndCustomerCareOnlineAdviceK10 },
  { title: 'Vetrina Mercati', icon: imgInvestmentsIndexK10 },
  { title: 'Vetrina Fondi', icon: imgInvestmentsFundsK10 },
  { title: 'Prodotti assicurativi', icon: imgInvestmentsBankInsuranceK10 },
]
const opportunities = [
  {
    title: 'BTP Italia',
    description: 'Scopri le possibilità e le garanzie di investire in BTP Italia',
    images: [imgImage],
  },
  {
    title: 'Apertura Deposito Titoli',
    description: 'Inizia a negoziare titoli o sottoscrivere fondi',
    images: [imgImage1, imgImage2],
  },
]
const guides = [
  {
    title: 'Guida agli investimenti',
    description: 'Scopri il tutorial per iniziare a investire in modo semplice e sicuro',
    images: [imgImage3],
  },
  {
    title: 'Focus del mese',
    description: 'Scopri i focus del mese per iniziare a investire con UniCredit',
    images: [imgImage4],
  },
]
const products: Array<{ title: string; description: string; image: string; destination: InvestmentDestination }> = [
  {
    title: 'Scopri come aprire il conto titoli',
    description: 'Inizia a negoziare titoli o sottoscrivere fondi',
    image: product1,
    destination: { area: 'securities', view: 'deposit-info' },
  },
  {
    title: 'Scopri come operare in fondi',
    description: 'Vedi la sezione dedicata per iniziare a operare',
    image: product2,
    destination: { area: 'funds', view: 'catalog' },
  },
  {
    title: 'Scopri la consulenza a distanza',
    description: 'Scegli una delle nostre proposte di investimento',
    image: product3,
    destination: { area: 'services', view: 'advisory' },
  },
  {
    title: 'Scopri il trading online',
    description: 'Trasmetti i tuoi ordini in autonomia in sicurezza',
    image: product4,
    destination: { area: 'securities', view: 'markets' },
  },
]
export interface MobileFirstInvestmentsHandle {
  openInvestMenu: () => void
  setOverviewVariant: (variant: InvestmentOverviewVariant) => void
}

const MobileFirstInvestments = forwardRef<
  MobileFirstInvestmentsHandle,
  {
    onOpen: (title: string, content: ReactNode) => void
    onOpenCategory?: (category: InvestmentHomeCategory) => void
    overviewVariant?: InvestmentOverviewVariant
    onBookAppointment?: () => void
    initialDestination?: InvestmentDestination
  }
>(function MobileFirstInvestments(
  { onOpen, onOpenCategory, overviewVariant, onBookAppointment, initialDestination },
  ref,
) {
  const { amountsHidden, productCounts } = useDemo()
  const [previewVariant, setPreviewVariant] = useState<InvestmentOverviewVariant | undefined>()
  const variant = resolveInvestmentOverviewVariant(productCounts.investments, previewVariant ?? overviewVariant)
  const hasHoldings = !['zero', 'no-deposit', 'loading'].includes(variant)
  const overview = getInvestmentOverview(variant)
  const visibleAllocations = overview.allocations.map((item) => ({
    title: item.label,
    percent: `${item.percent.toLocaleString('it-IT')}%`,
    amount: (item.valueCents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    icon: allocations.find((a) => a.title === item.label)!.icon,
  }))
  const [opportunity, setOpportunity] = useState(variant === 'no-deposit' ? 'I nostri prodotti' : 'Novità per te')
  const [mifidDismissed, setMifidDismissed] = useState(false)
  const [consultationDismissed, setConsultationDismissed] = useState(false)
  const [period, setPeriod] = useState('Giornaliero')
  const [chartPage, setChartPage] = useState(0)
  const { swipeHandlers: chartSwipeHandlers, swipeMotionStyle: chartSwipeMotionStyle } = usePeriodSwipe(
    (direction) => setChartPage((page) => Math.max(0, Math.min(1, page + direction))),
    { canPrev: variant !== 'no-esg' && chartPage > 0, canNext: variant !== 'no-esg' && chartPage < 1 },
  )
  const [portfolioTab, setPortfolioTab] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [educationOpen, setEducationOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [commercialDetail, setCommercialDetail] = useState<(typeof opportunities)[number] | null>(null)
  const [depositInfoOpen, setDepositInfoOpen] = useState(() => initialDestination?.view === 'deposit-info')
  const [ownerExpanded, setOwnerExpanded] = useState(true)
  const [focusExpanded, setFocusExpanded] = useState(false)
  const [destination, setDestination] = useState<InvestmentDestination | null>(() =>
    initialDestination?.view === 'deposit-info' ? null : (initialDestination ?? null),
  )
  useImperativeHandle(
    ref,
    () => ({
      openInvestMenu: () => {
        setDestination(null)
        setEducationOpen(false)
        setInfoOpen(false)
        setCatalogOpen(false)
        setCommercialDetail(null)
        setDepositInfoOpen(false)
        setMenuOpen(true)
      },
      setOverviewVariant: (next) => {
        setDestination(null)
        setMenuOpen(false)
        setEducationOpen(false)
        setInfoOpen(false)
        setCatalogOpen(false)
        setCommercialDetail(null)
        setDepositInfoOpen(false)
        setPreviewVariant(next)
        setPortfolioTab('Overview')
        setChartPage(0)
        setMifidDismissed(false)
        setConsultationDismissed(false)
        setOpportunity(next === 'no-deposit' ? 'I nostri prodotti' : 'Novità per te')
      },
    }),
    [],
  )
  const navigate = (next: InvestmentDestination) => {
    setMenuOpen(false)
    setEducationOpen(false)
    setInfoOpen(false)
    setCatalogOpen(false)
    setCommercialDetail(null)
    if (next.area === 'securities' && next.view === 'deposit-info') {
      setDepositInfoOpen(true)
      setDestination(null)
    } else {
      setDepositInfoOpen(false)
      setDestination(next)
    }
  }
  const info = (title: string, content: ReactNode = title) => onOpen(title, content)
  const chips = (labels: readonly string[], selected: string, select: (label: string) => void) => (
    <ScrollableRegion className="mfi-chips" aria-label="Categorie investimenti">
      {labels.map((label) => (
        <button type="button" key={label} aria-pressed={label === selected} onClick={() => select(label)}>
          {label}
          {label === selected && <img src={imgEllipse29} alt="" />}
        </button>
      ))}
    </ScrollableRegion>
  )
  const cards = (items: typeof opportunities, guide = false) => (
    <div className="mfi-cards">
      {items.map((item, i) => (
        <button
          type="button"
          className="mfi-commercial"
          key={item.title}
          onClick={() => (guide ? setEducationOpen(true) : setCommercialDetail(item))}
        >
          <span className={guide && i === 0 ? 'mfi-photo mfi-photo-guide' : 'mfi-photo'}>
            {item.images.map((src) => (
              <img key={src} src={src} alt="" />
            ))}
          </span>
          <strong>{item.title}</strong>
          <span>{item.description}</span>
        </button>
      ))}
    </div>
  )
  const servicesSection = (
    <section className="mfi-overview-section">
      <div className="mfi-section-heading">
        <h2>I nostri servizi</h2>
        <button
          type="button"
          className="mfi-text-action"
          onClick={() => navigate({ area: 'services', view: 'profile' })}
        >
          Profilo investimenti
          <img src={imgNavigationAndActionProfileT2} alt="" />
        </button>
      </div>
      <div className="mfi-services">
        {services.map((item) => (
          <button
            type="button"
            key={item.title}
            disabled={variant === 'no-deposit' && item.title !== 'Prodotti assicurativi'}
            onClick={() =>
              navigate(
                item.title === 'Area Consulenza'
                  ? { area: 'services', view: 'advisory' }
                  : item.title === 'Vetrina Mercati'
                    ? { area: 'securities', view: 'markets' }
                    : item.title === 'Vetrina Fondi'
                      ? { area: 'funds', view: 'catalog' }
                      : { area: 'services', view: 'insurance' },
              )
            }
          >
            <span>
              <img src={item.icon} alt="" />
            </span>
            {item.title}
          </button>
        ))}
      </div>
    </section>
  )
  const embeddedDestination = INVESTMENT_TAB_DESTINATIONS[portfolioTab]
  return (
    <div className="mf-investments">
      <h2>Portafoglio</h2>
      {chips(INVESTMENT_PORTFOLIO_TABS, portfolioTab, setPortfolioTab)}
      {portfolioTab !== 'Overview' && embeddedDestination && (
        <MobileFirstInvestmentArea
          {...embeddedDestination}
          embedded
          onNavigate={navigate}
          onClose={() => setPortfolioTab('Overview')}
        />
      )}
      {portfolioTab === 'Overview' && (
        <>
          {variant !== 'no-deposit' && variant !== 'loading' && (
            <div className="mfi-owner">
              <button type="button" aria-expanded={ownerExpanded} onClick={() => setOwnerExpanded(!ownerExpanded)}>
                Intestatario
                <img src={imgNavigationAndActionDownK10} alt="" />
              </button>
              {ownerExpanded && <strong>Andrea Rossini Bianchi</strong>}
              <span>Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)</span>
            </div>
          )}
          {variant === 'consultation' && !consultationDismissed && (
            <div className="mfi-banner mfi-consultation-banner">
              <button type="button" onClick={() => navigate({ area: 'services', view: 'advisory' })}>
                <strong>Prenota una consulenza</strong>
                <span>Entra nell’area consulenza per prenotare la consulenza con il nostro esperto.</span>
              </button>
              <button
                type="button"
                aria-label="Chiudi avviso consulenza"
                onClick={() => setConsultationDismissed(true)}
              >
                <img src={bannerClose} alt="" />
              </button>
            </div>
          )}
          {['mifid', 'consultation'].includes(variant) && !mifidDismissed && (
            <div className="mfi-banner mfi-mifid-banner">
              <button type="button" onClick={() => navigate({ area: 'services', view: 'mifid', action: 'expired' })}>
                <strong>
                  <img src={warning} alt="" />
                  Ricorda di aggiornare il Mifid
                </strong>
                <span>Il Mifid è scaduto, aggiornalo dall’area profilo per poter continuare a investire.</span>
              </button>
              <button type="button" aria-label="Chiudi avviso MIFID" onClick={() => setMifidDismissed(true)}>
                <img src={bannerClose} alt="" />
              </button>
            </div>
          )}
          {variant === 'loading' && (
            <div className="mfi-loading" role="status">
              <span className="mfi-loading-bar" />
              <strong>I tuoi dati si stanno caricando</strong>
              <p>I tuoi dati sono in caricamento, ma non ti preoccupare sono sempre al sicuro con noi</p>
            </div>
          )}
          {variant === 'zero' && (
            <strong className="mfi-empty-total">
              {amountsHidden ? 'Totale investimenti ••••' : 'Totale investimenti 0€'}
            </strong>
          )}
          {hasHoldings && (
            <>
              {variant !== 'no-esg' && (
                <div className="mfi-stepper">
                  <div>
                    <button
                      type="button"
                      aria-label="Grafico precedente"
                      disabled={chartPage === 0}
                      onClick={() => setChartPage(0)}
                    >
                      <img src={imgNavigationAndActionBackK4} alt="" />
                    </button>
                    <button
                      type="button"
                      aria-label="Grafico successivo"
                      disabled={chartPage === 1}
                      onClick={() => setChartPage(1)}
                    >
                      <img src={imgNavigationAndActionForthK10} alt="" />
                    </button>
                  </div>
                  <span className={chartPage === 1 ? 'mfi-stepper-next' : ''}>
                    <i />
                    <i />
                  </span>
                </div>
              )}
              <div
                {...(variant === 'no-esg' ? {} : chartSwipeHandlers)}
                className={
                  (chartPage === 1 ? 'mfi-graph-window mfi-graph-window-esg' : 'mfi-graph-window') +
                  (variant === 'no-esg' ? ' mfi-no-esg' : '')
                }
              >
                <div style={variant === 'no-esg' ? undefined : chartSwipeMotionStyle}>
                  {variant === 'single' ? (
                    <div className="mfi-chart">
                      <SingleChart
                        hidden={amountsHidden}
                        totalCents={overview.totalCents}
                        esgCents={overview.esgCents}
                        allocations={overview.allocations}
                        esgAllocations={overview.esgAllocations}
                        onInfo={() => setInfoOpen(true)}
                      />
                    </div>
                  ) : variant === 'edge' ? (
                    <div className="mfi-chart">
                      <EdgeChart
                        hidden={amountsHidden}
                        totalCents={overview.totalCents}
                        esgCents={overview.esgCents}
                        allocations={overview.allocations}
                        esgAllocations={overview.esgAllocations}
                        onInfo={() => setInfoOpen(true)}
                      />
                    </div>
                  ) : (
                    <PortfolioChart
                      hidden={amountsHidden}
                      totalCents={overview.totalCents}
                      esgCents={overview.esgCents}
                      allocations={overview.allocations}
                      esgAllocations={overview.esgAllocations}
                      onInfo={() => setInfoOpen(true)}
                    />
                  )}
                </div>
              </div>
              <div className="mfi-allocations">
                {visibleAllocations.map((item, i) => (
                  <button
                    type="button"
                    className="mfi-allocation"
                    key={item.title}
                    onClick={() => setPortfolioTab(item.title)}
                  >
                    <span className="mfi-allocation-title">
                      <img src={item.icon} alt="" />
                      <span>{item.title}</span>
                    </span>
                    <span>{item.percent}</span>
                    <span className="mfi-row-amount">
                      <strong>{amountsHidden ? '••••' : item.amount}</strong>
                      {!amountsHidden && <small> €</small>}
                    </span>
                    {i > 0 && <img className="mfi-row-top" src={imgLineTop} alt="" />}
                    <img className="mfi-row-bottom" src={i === 0 ? imgLineBottom : imgLineBottom1} alt="" />
                  </button>
                ))}
              </div>
            </>
          )}
          {variant !== 'no-deposit' && servicesSection}
          <section className="mfi-overview-section">
            <h2>Opportunità</h2>
            {chips(['Novità per te', 'I nostri prodotti'], opportunity, setOpportunity)}
            {opportunity === 'Novità per te' ? (
              cards(opportunities)
            ) : (
              <ScrollableRegion className="mfi-products-rail" aria-label="I nostri prodotti di investimento">
                {products.map((product) => (
                  <button
                    key={product.title}
                    type="button"
                    className="mfi-commercial"
                    onClick={() => navigate(product.destination)}
                  >
                    <span className="mfi-photo">
                      <img src={product.image} alt="" />
                    </span>
                    <strong>{product.title}</strong>
                    <span>{product.description}</span>
                  </button>
                ))}
              </ScrollableRegion>
            )}
            {opportunity === 'I nostri prodotti' && (
              <button type="button" className="mfi-text-action mfi-full-action" onClick={() => setCatalogOpen(true)}>
                Scopri tutti i nostri prodotti
                <img src={imgNavigationAndActionForthT2} alt="" />
              </button>
            )}
          </section>
          {variant === 'no-deposit' && servicesSection}
          {variant !== 'no-deposit' && (
            <section className="mfi-overview-section">
              <h2>Market Focus</h2>
              {chips(['Giornaliero', 'Settimanale', 'Mensile', 'Trimestrale'], period, setPeriod)}
              <div className="mfi-news">
                {INVESTMENT_FOCUS_PUBLICATIONS.slice(0, focusExpanded ? 5 : 2).map(({ date, subtitle, time }) => (
                  <article key={date + time}>
                    <strong>{date} - Le novità dal mondo investimenti</strong>
                    <p>{subtitle}</p>
                    <footer>
                      <span>
                        {date} - {time}
                      </span>
                      <button
                        type="button"
                        className="mfi-text-action"
                        onClick={() =>
                          info(
                            'Market Focus',
                            <p>
                              {date} - Le novità dal mondo investimenti
                              <br />
                              {subtitle}
                            </p>,
                          )
                        }
                      >
                        Scarica pdf
                        <img src={imgNavigationAndActionDownloadT2} alt="" />
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
              <button
                type="button"
                className="mfi-text-action mfi-full-action"
                onClick={() => setFocusExpanded(!focusExpanded)}
              >
                {focusExpanded ? 'Nascondi' : 'Scopri tutti'}
                <img src={imgNavigationAndActionArrowDown} alt="" />
              </button>
            </section>
          )}
          <section className="mfi-overview-section">
            <h2>Cose da sapere per investire</h2>
            {cards(guides, true)}
            <button type="button" className="mfi-text-action mfi-full-action" onClick={() => setEducationOpen(true)}>
              Tutti gli approfondimenti
              <img src={imgNavigationAndActionForthT2} alt="" />
            </button>
          </section>
        </>
      )}
      {menuOpen && (
        <InvestmentMenu
          onNavigate={navigate}
          onClose={() => setMenuOpen(false)}
          onOverview={() => {
            setPortfolioTab('Overview')
            setMenuOpen(false)
          }}
        />
      )}
      {educationOpen && <InvestmentEducation onNavigate={navigate} onClose={() => setEducationOpen(false)} />}
      {commercialDetail && (
        <InvestmentPage
          title={commercialDetail.title}
          onBack={() => setCommercialDetail(null)}
          onClose={() => setCommercialDetail(null)}
          footer={
            <InvestmentButton
              onClick={() =>
                navigate(
                  commercialDetail.title === 'BTP Italia'
                    ? { area: 'securities', view: 'security', instrument: 'btp' }
                    : { area: 'securities', view: 'deposit-info' },
                )
              }
            >
              {commercialDetail.title === 'BTP Italia' ? 'Scopri il titolo' : 'Scopri come aprire il conto titoli'}
            </InvestmentButton>
          }
        >
          <div className="mfi-info-copy">
            <div className="mfi-photo">
              {commercialDetail.images.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
            <p>{commercialDetail.description}</p>
          </div>
        </InvestmentPage>
      )}
      {catalogOpen && (
        <InvestmentProductCatalog
          onNavigate={navigate}
          onClose={() => setCatalogOpen(false)}
          onOpenCategory={(category) => {
            setCatalogOpen(false)
            if (onOpenCategory) onOpenCategory(category)
            else onOpen(category, 'Scopri i migliori prodotti UniCredit')
          }}
          onAppointment={() => {
            setCatalogOpen(false)
            if (onBookAppointment) onBookAppointment()
            else navigate({ area: 'services', view: 'advisory' })
          }}
        />
      )}
      {depositInfoOpen && (
        <MobileFirstInvestmentDepositInfo
          onClose={() => setDepositInfoOpen(false)}
          onAppointment={() => {
            setDepositInfoOpen(false)
            if (onBookAppointment) onBookAppointment()
            else navigate({ area: 'services', view: 'advisory' })
          }}
        />
      )}
      {infoOpen && (
        <InvestmentPage title="Informazioni investimenti" onClose={() => setInfoOpen(false)}>
          <div className="mfi-info-copy">
            <p>
              La Posizione Globale Investimenti e Risparmio ti fornisce una panoramica degli investimenti e dei prodotti
              di risparmio collegati al servizio di Banca Multicanale relativi all’intestatario selezionato.
            </p>
            <p>I dati non sono aggiornati in tempo reale, quindi la situazione visualizzata è puramente indicativa.</p>
            <p>
              La Posizione Globale Investimenti e Risparmio non sostituisce le comunicazioni di carattere ufficiale
              inviate dalla Banca o dalle Società i cui prodotti sono stati collocati / distribuiti dalla Banca stessa.
            </p>
          </div>
        </InvestmentPage>
      )}
      {destination && (
        <MobileFirstInvestmentArea
          key={`${destination.area}-${destination.view}-${destination.instrument ?? ''}-${destination.action ?? ''}`}
          {...destination}
          onNavigate={navigate}
          onClose={() => setDestination(null)}
        />
      )}
    </div>
  )
})

export default MobileFirstInvestments
