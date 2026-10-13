import { useRef, useState } from 'react'
import { InvestmentButton, InvestmentPage } from './MobileFirstInvestmentPrimitives'
import { INVESTMENT_MENU_OPERATIONS, INVESTMENT_MENU_SERVICES } from './investmentsOverviewContent'
import type { InvestmentDestination } from './investmentsNavigation'
import search from '@/assets/mobile-first/it/investments/common/search.svg'
import consultant from '@/assets/mobile-first/it/investments/common/consultant.svg'
import bookmark from '@/assets/mobile-first/it/investments/common/bookmark.svg'
import orders from '@/assets/mobile-first/it/investments/common/orders.svg'
import market from '@/assets/mobile-first/it/investments/imgInvestmentsIndexK10.svg'
import funds from '@/assets/mobile-first/it/investments/imgInvestmentsFundsK10.svg'
import overview from '@/assets/mobile-first/it/investments/common/overview.svg'
import auction from '@/assets/mobile-first/it/investments/common/auction.svg'
import mifid from '@/assets/mobile-first/it/investments/common/mifid.svg'
import packages from '@/assets/mobile-first/it/investments/common/packages.svg'
import focus from '@/assets/mobile-first/it/investments/education/focus.png'
import tutorial from '@/assets/mobile-first/it/investments/education/tutorial.png'
import video1 from '@/assets/mobile-first/it/investments/education/video-1.png'
import video2 from '@/assets/mobile-first/it/investments/education/video-2.png'
import video3 from '@/assets/mobile-first/it/investments/education/video-3.png'
import play from '@/assets/mobile-first/it/investments/education/play.svg'
import catalogAccounts from '@/assets/mobile-first/it/investments/common/catalog-accounts.svg'
import catalogCards from '@/assets/mobile-first/it/investments/common/catalog-cards.svg'
import catalogLoans from '@/assets/mobile-first/it/investments/common/catalog-loans.svg'
import catalogMortgages from '@/assets/mobile-first/it/investments/common/catalog-mortgages.svg'
import catalogInvestments from '@/assets/mobile-first/it/investments/common/catalog-investments.svg'
import catalogInsurance from '@/assets/mobile-first/it/investments/common/catalog-insurance.svg'
import MobileFirstInvestmentDepositInfo from './MobileFirstInvestmentDepositInfo'
import carouselBack from '@/assets/mobile-first/it/investments/imgNavigationAndActionBackK4.svg'
import carouselForth from '@/assets/mobile-first/it/investments/imgNavigationAndActionForthK10.svg'

export type InvestmentHomeCategory = 'Conti' | 'Carte' | 'Mutui e Prestiti' | 'Polizze assicurative'

export function InvestmentProductCatalog({
  onNavigate,
  onClose,
  onOpenCategory,
  onAppointment,
}: {
  onNavigate: (destination: InvestmentDestination) => void
  onClose: () => void
  onOpenCategory: (category: InvestmentHomeCategory) => void
  onAppointment?: () => void
}) {
  const [depositInfo, setDepositInfo] = useState(false)
  const categories: Array<{ title: string; icon: string; category?: InvestmentHomeCategory }> = [
    { title: 'Conti correnti', icon: catalogAccounts, category: 'Conti' },
    { title: 'Carte', icon: catalogCards, category: 'Carte' },
    { title: 'Prestiti', icon: catalogLoans, category: 'Mutui e Prestiti' },
    { title: 'Mutui', icon: catalogMortgages, category: 'Mutui e Prestiti' },
    { title: 'Investimenti e risparmio', icon: catalogInvestments },
    { title: 'Assicurazioni', icon: catalogInsurance, category: 'Polizze assicurative' },
  ]
  if (depositInfo)
    return (
      <MobileFirstInvestmentDepositInfo
        onClose={() => setDepositInfo(false)}
        onAppointment={onAppointment ?? (() => onNavigate({ area: 'services', view: 'advisory' }))}
      />
    )
  return (
    <InvestmentPage title="Catalogo prodotti" onClose={onClose}>
      <p>Scopri i migliori prodotti UniCredit</p>
      <div className="mfi-menu-section">
        {categories.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => (item.category ? onOpenCategory(item.category) : setDepositInfo(true))}
          >
            <span className="mfi-menu-icon">
              <img src={item.icon} alt="" />
            </span>
            {item.title}
          </button>
        ))}
      </div>
    </InvestmentPage>
  )
}

export function InvestmentMenu({
  onNavigate,
  onClose,
  onOverview,
}: {
  onNavigate: (destination: InvestmentDestination) => void
  onClose: () => void
  onOverview: () => void
}) {
  const actions: Array<{ title: string; icon: string; destination: InvestmentDestination }> = [
    { title: 'Ricerca', icon: search, destination: { area: 'securities', view: 'search' } },
    { title: 'Consulenza', icon: consultant, destination: { area: 'services', view: 'advisory' } },
    { title: 'Watchlist', icon: bookmark, destination: { area: 'securities', view: 'watchlist' } },
    { title: 'Ordini e movimenti', icon: orders, destination: { area: 'securities', view: 'orders' } },
  ]
  return (
    <InvestmentPage title="Investi" onClose={onClose}>
      <div className="mfi-menu-quick">
        {actions.map((item) => (
          <button type="button" key={item.title} onClick={() => onNavigate(item.destination)}>
            <span>
              <img src={item.icon} alt="" />
            </span>
            {item.title}
          </button>
        ))}
      </div>
      <section className="mfi-menu-section">
        <h3>Operazioni</h3>
        <button type="button" onClick={onOverview}>
          <span className="mfi-menu-icon">
            <img src={overview} alt="" />
          </span>
          Overview
        </button>
        {INVESTMENT_MENU_OPERATIONS.map((item, i) => (
          <button key={item.title} type="button" onClick={() => onNavigate(item.destination)}>
            <span className="mfi-menu-icon">
              <img src={i === 0 ? market : i === 1 ? funds : auction} alt="" />
            </span>
            {item.title}
          </button>
        ))}
      </section>
      <section className="mfi-menu-section">
        <h3>Servizi</h3>
        {INVESTMENT_MENU_SERVICES.map((item, i) => (
          <button key={item.title} type="button" onClick={() => onNavigate(item.destination)}>
            <span className="mfi-menu-icon">
              <img src={i === 0 ? mifid : packages} alt="" />
            </span>
            {item.title}
          </button>
        ))}
      </section>
    </InvestmentPage>
  )
}

export function InvestmentEducation({
  onNavigate,
  onClose,
}: {
  onNavigate: (destination: InvestmentDestination) => void
  onClose: () => void
}) {
  const [article, setArticle] = useState<string | null>(null)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [videoImage, setVideoImage] = useState(video1)
  const [videoPage, setVideoPage] = useState(0)
  const videoRail = useRef<HTMLDivElement>(null)
  const selectVideoPage = (page: number) => {
    setVideoPage(page)
    const rail = videoRail.current
    if (rail) rail.scrollTo?.({ left: page * Math.max(0, rail.scrollWidth - rail.clientWidth), behavior: 'smooth' })
  }
  const steps = ['Portafoglio', 'Strumenti', 'Andamento', 'Dettagli']
  if (article)
    return (
      <InvestmentPage title={article} onBack={() => setArticle(null)} onClose={onClose}>
        {article === 'Tutorial' ? (
          <>
            <div className="mfi-education-tutorial">
              <img src={tutorial} alt="Portafoglio investimenti UniCredit" />
            </div>
            <h3>{steps[tutorialStep]}</h3>
            <p>Esplora strumenti, andamento e dettagli della tua sezione investimenti.</p>
            <InvestmentButton
              onClick={() => (tutorialStep === steps.length - 1 ? setArticle(null) : setTutorialStep(tutorialStep + 1))}
            >
              {tutorialStep === steps.length - 1 ? 'Fine' : 'Avanti'}
            </InvestmentButton>
          </>
        ) : article === 'UniCredit Save4You' ? (
          <>
            <img className="mfi-education-image" src={videoImage} alt="" />
            <p>Scopri i focus del mese per iniziare a investire</p>
            <InvestmentButton onClick={() => onNavigate({ area: 'funds', view: 'catalog' })}>
              Vetrina Fondi
            </InvestmentButton>
          </>
        ) : (
          <>
            <img className="mfi-education-image" src={focus} alt="" />
            <h3>Focus del mese di maggio</h3>
            <p>BTP e BTC in espansione? Non trovarti impreparato sul mercato</p>
            <InvestmentButton onClick={() => onNavigate({ area: 'securities', view: 'markets' })}>
              Vetrina Mercati
            </InvestmentButton>
          </>
        )}
      </InvestmentPage>
    )
  return (
    <InvestmentPage title="Cose da sapere per investire" onBack={onClose} onClose={onClose}>
      <div className="mfi-education">
        <p>La sezione dedicata ad informarti in modo completo riguardo il mondo degli investimenti</p>
        <section>
          <h3>Scopri i focus del mese</h3>
          <button type="button" onClick={() => setArticle('Focus del mese di maggio')}>
            <img className="mfi-education-image" src={focus} alt="" />
            <strong>Focus del mese di maggio</strong>
            <span>BTP e BTC in espansione? Non trovarti impreparato sul mercato</span>
          </button>
        </section>
        <section>
          <h3>Tutorial</h3>
          <button
            type="button"
            onClick={() => {
              setTutorialStep(0)
              setArticle('Tutorial')
            }}
          >
            <div className="mfi-education-tutorial">
              <img src={tutorial} alt="" />
            </div>
            <strong>Scopri tutto quello che c’è da sapere</strong>
            <span>Segui il tutorial per esplorare strumenti, andamento e dettagli della tua sezione investimenti.</span>
          </button>
        </section>
        <section>
          <h3>UniCredit Save4You</h3>
          <div ref={videoRail} className="mfi-education-videos">
            {[video1, video2, video3, video1, video2, video1, video3, video2, video2, video1].map((image, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setVideoImage(image)
                  setArticle('UniCredit Save4You')
                }}
                aria-label={`UniCredit Save4You ${i + 1}`}
              >
                <div>
                  <img className={image === video1 ? 'mfi-video-crop' : undefined} src={image} alt="" />
                  <img className="mfi-play" src={play} alt="" />
                </div>
                <strong>UniCredit Save4You</strong>
                <span>Scopri i focus del mese per iniziare a investire</span>
              </button>
            ))}
          </div>
          <div className="mfi-stepper">
            <div>
              <button
                type="button"
                aria-label="Video precedenti"
                disabled={videoPage === 0}
                onClick={() => selectVideoPage(0)}
              >
                <img
                  className={videoPage === 1 ? 'mfi-back-enabled' : undefined}
                  src={videoPage === 0 ? carouselBack : carouselForth}
                  alt=""
                />
              </button>
              <button
                type="button"
                aria-label="Video successivi"
                disabled={videoPage === 1}
                onClick={() => selectVideoPage(1)}
              >
                <img src={carouselForth} alt="" />
              </button>
            </div>
            <span className={videoPage === 1 ? 'mfi-stepper-next' : ''}>
              <i />
              <i />
            </span>
          </div>
        </section>
        <section className="mfi-virtual-banner">
          <h3>Impara a investire con il portafoglio virtuale</h3>
          <p>Scopri le funzionalità del portafoglio virtuale per imparare a investire in totale sicurezza</p>
          <button type="button" onClick={() => onNavigate({ area: 'securities', view: 'virtual' })}>
            Scopri portafoglio virtuale ›
          </button>
        </section>
      </div>
    </InvestmentPage>
  )
}
