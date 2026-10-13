import { useState, useSyncExternalStore } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { profileHubStore } from '@/features/profile/mobileFirstProfile'
import { ProfileButton, ProfilePage, ProfileRow } from './MobileFirstProfilePrimitives'
import { profileAssets as a } from './profileAssets'

export default function MobileFirstProfilePromotions({
  initialDetail,
  onBack,
  onClose,
  onNavigate,
}: {
  initialDetail?: string
  onBack: () => void
  onClose: () => void
  onNavigate: (target: string, id?: string) => void
}) {
  const [view, setView] = useState(initialDetail ?? 'list')
  const [cancel, setCancel] = useState(false)
  const [share, setShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const [featuredPartner, setFeaturedPartner] = useState(0)
  const [partnerOffer, setPartnerOffer] = useState(0)
  const state = useSyncExternalStore(profileHubStore.subscribe, profileHubStore.getSnapshot)
  const back = () => (view === (initialDetail ?? 'list') ? onBack() : setView(initialDetail ?? 'list'))
  const title =
    view === 'invite'
      ? 'Il tuo codice invito U2502MUP6H5IPV'
      : view === 'telepass'
        ? 'Salta la coda con Telepass'
        : view === 'loan'
          ? 'I tuoi sogni a portata di mano'
          : view === 'donation'
            ? 'Il Mio Dono'
            : view === 'partner'
              ? 'Tutti i partner'
              : 'Iniziative e promo'
  const copy = async () => {
    try {
      await navigator.clipboard.writeText('U2502MUP6H5IPV')
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <ProfilePage
      title={title}
      onBack={view === 'partner' ? undefined : back}
      onClose={onClose}
      showHelp={view !== 'partner'}
    >
      {view === 'list' ? (
        <>
          <button type="button" className="mf-profile-promo-invitation" onClick={() => setView('invite')}>
            <img src={a.promos.imgImage} alt="" />
            <strong>Il tuo codice invito</strong>
            <small>
              {state.invitationActive
                ? 'Lorem ipsum dolor sit amet consectetur. Blandit urna pulvinar ut mi ipsum venenatis sed aliquet urna.'
                : 'Hai rinunciato a questa iniziativa.'}
            </small>
          </button>
          <h2>Iniziative in corso</h2>
          <p>Iniziative in corso di cui puoi parlare ai tuoi amici</p>
          {[
            {
              id: 'loan',
              title: 'I tuoi sogni a portata di mano',
              body: 'Scopri il prestito UniCredit comodo, flessibile e con un tasso in promo.',
              image: a.promos.imgImg,
            },
            {
              id: 'telepass',
              title: 'Salta la coda con Telepass',
              body: 'Accedi alle corsie riservate Telepass in tutte le autostrade d’Italia.',
              image: a.promos.imgImg1,
            },
          ].map((item) => (
            <button type="button" className="mf-profile-promo-card" key={item.id} onClick={() => setView(item.id)}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.body}</small>
                <small>Pubblicità - dal 12/04/22 a 12/12/22</small>
              </span>
              <img src={item.image} alt="" />
            </button>
          ))}
          <h2>Iniziative concluse</h2>
          <button type="button" className="mf-profile-promo-card is-ended" onClick={() => setView('ended')}>
            <span>
              <strong>Lorem ipsum dolor</strong>
              <small>Sit amet consectetur. Tellus dictum arcu odio massa.</small>
              <small>Pubblicità - da 12/04/22 a 12/12/22</small>
            </span>
            <img src={a.promos.imgImg2} alt="" />
          </button>
        </>
      ) : view === 'invite' ? (
        <>
          <img className="mf-profile-promo-hero" src={a.invite.imgHeroBannerMobile} alt="" />
          <ProfileRow label="Periodo di validità" value="05/12/2024 - 10/04/2025" />
          <ProfileRow label="Codice" value="U2502MUP6H5IPV" />
          <button type="button" className="mf-profile-link" onClick={() => setShare(true)}>
            <img src={a.invite.imgNavigationAndActionShareT2} alt="" />
            CONDIVIDI
          </button>
          {copied && <p role="status">Codice copiato</p>}
          <div className="mf-profile-promo-stats">
            <div>
              <span>Codici inseriti</span>
              <strong>0</strong>
            </div>
            <div>
              <span>Aperture completate</span>
              <strong>0</strong>
            </div>
            <div>
              <span>Bonus</span>
              <strong>0/3.000,00 €</strong>
            </div>
          </div>
          <h2>Come funziona?</h2>
          <p>
            Condividi il tuo codice amico con tutti i tuoi amici non ancora clienti. Hai tempo fino al 28/02/2025, con
            scadenza prorogata al 10/04/2025.
          </p>
          <p>Pubblicità info su UCIbank.com</p>
          {state.invitationActive ? (
            <ProfileButton secondary onClick={() => setCancel(true)}>
              Non desidero partecipare a questa promo
            </ProfileButton>
          ) : (
            <p role="status">Non partecipi a questa promo.</p>
          )}
        </>
      ) : view === 'telepass' ? (
        <>
          <img className="mf-profile-promo-hero" src={a.telepass.imgHeroBannerMobile} alt="" />
          <p>Accedi alle corsie riservate Telepass in tutte le autostrade di Italia.</p>
          <ProfileRow label="Ticket accumulati" value="2" />
          <ProfileRow label="Rate impiegate" value="Giovani" />
          <div className="mf-profile-telepass-benefits">
            <section>
              <h3>
                <img src={a.telepass.imgHomeBankingAndPaymentsAmountK10} alt="" />
                Canone zero
              </h3>
              <p>
                Il canone di locazione del primo dispositivo è azzerato per i primi 6 mesi, che decorreranno dal primo
                giorno del mese in cui è stato sottoscritto il contratto in Filiale.
              </p>
            </section>
            <section>
              <h3>
                <img src={a.telepass.imgHomeBankingAndPaymentsCashbackK10} alt="" />
                Cashback
              </h3>
              <p>
                2% di rimborso cashback sui pedaggi autostradali effettuati dal 5/3/2025 al 31/12/2025. Vantaggio
                attivabile dal cliente tramite l’App Telepass entro 7 giorni dalla sottoscrizione del contratto relativo
                al Servizio Telepass Family ed utilizzando il codice SCONTOTLP2025.
              </p>
            </section>
          </div>
          <ProfileButton onClick={() => onNavigate('appointments')}>Scopri di più</ProfileButton>
        </>
      ) : view === 'loan' ? (
        <>
          <img className="mf-profile-promo-hero" src={a.promos.imgImg} alt="" />
          <p>Scopri il prestito UniCredit comodo, flessibile e con un tasso in promo.</p>
          <ProfileButton onClick={() => onNavigate('loans')}>Scopri di più</ProfileButton>
        </>
      ) : view === 'donation' ? (
        <>
          <img className="mf-profile-promo-hero" src={a.hub.imgImg} alt="" />
          <p>
            La piattaforma UniCredit per la raccolta fondi, ideata per sostenere le Organizzazioni del Terzo Settore
          </p>
          <a className="mf-profile-button" href="https://www.ilmiodono.it/" target="_blank" rel="noreferrer">
            Scopri Il Mio Dono
          </a>
        </>
      ) : view === 'partner' ? (
        <>
          <PartnerCarousel
            title="In primo piano"
            index={featuredPartner}
            onChange={setFeaturedPartner}
            cards={[
              {
                image: a.partners.samsung,
                logo: a.partners.samsungLogo,
                title: 'Voglia di regali?',
                body: 'Per te uno sconto fino a 250€ su tutto il catalogo Samsung fino al 31/01/2026.',
              },
              {
                image: a.partners.papernest,
                logo: a.partners.papernestLogo,
                title: 'Caro bollette?',
                body: 'Prenota subito una consulenza gratuita con papernest, per risparmiare su luce, gas, internet e telefonia.',
              },
            ]}
          />
          <PartnerCarousel
            title="Tutte le nostre offerte"
            index={partnerOffer}
            onChange={setPartnerOffer}
            cards={[
              {
                image: a.partners.treedom,
                title: 'Un’idea originale a S. Valentino?',
                body: 'Scegli un albero come regalo!',
                crop: true,
              },
              {
                image: a.partners.premium,
                title: 'Sei in cerca di promozioni?',
                body: 'Vai su Premium4U e scopri tutti i vantaggi sui prodotti e servizi a disposizione per te!',
              },
              {
                image: a.partners.sharewood,
                title: 'Voglia di vacanze?',
                body: 'Scopri lo sconto Sharewood!',
                crop: true,
              },
            ]}
          />
          <p className="mf-profile-partner-disclaimer">
            UniCredit è responsabile unicamente dei propri prodotti e servizi, ai prodotti/servizi offerti dai partner
            si applicheranno le condizioni da questi ultimi praticate.
          </p>
        </>
      ) : (
        <>
          <img className="mf-profile-promo-hero" src={a.promos.imgImg2} alt="" />
          <p>Questa iniziativa è conclusa.</p>
        </>
      )}
      {cancel && (
        <BottomSheet
          title="Sei sicuro di voler abbandonare la promo?"
          closeLabel="Chiudi"
          className="mf-sheet"
          onClose={() => setCancel(false)}
        >
          <p>L’azione non è reversibile</p>
          <div className="mf-profile-stack">
            <ProfileButton
              onClick={() => {
                profileHubStore.dispatch({ type: 'leave-promotion' })
                setCancel(false)
              }}
            >
              Si, procedi
            </ProfileButton>
            <ProfileButton secondary onClick={() => setCancel(false)}>
              No, chiudi
            </ProfileButton>
          </div>
        </BottomSheet>
      )}
      {share && (
        <BottomSheet title="Codice di invito" closeLabel="Chiudi" className="mf-sheet" onClose={() => setShare(false)}>
          <p>U2502MUP6H5IPV</p>
          <ProfileButton onClick={() => void copy()}>Copia</ProfileButton>
          {copied && <p role="status">Codice copiato</p>}
        </BottomSheet>
      )}
    </ProfilePage>
  )
}

function PartnerCarousel({
  title,
  index,
  onChange,
  cards,
}: {
  title: string
  index: number
  onChange: (index: number) => void
  cards: { image: string; logo?: string; title: string; body: string; crop?: boolean }[]
}) {
  const card = cards[index]!
  return (
    <section className="mf-profile-partner-carousel">
      <h2>{title}</h2>
      <div className={`mf-profile-partner-image${card.crop ? ' is-cropped' : ''}`}>
        <img src={card.image} alt="" />
        {card.logo && <img className="mf-profile-partner-logo" src={card.logo} alt="" />}
      </div>
      <div aria-live="polite">
        <h3>{card.title}</h3>
        <p>{card.body}</p>
      </div>
      <div className="mf-profile-carousel-controls">
        <button
          type="button"
          aria-label={`${title}: precedente`}
          disabled={index === 0}
          onClick={() => onChange(index - 1)}
        >
          <img src={a.hub.imgNavigationAndActionBackK4} alt="" />
        </button>
        <button
          type="button"
          aria-label={`${title}: successivo`}
          disabled={index === cards.length - 1}
          onClick={() => onChange(index + 1)}
        >
          <img src={a.hub.imgNavigationAndActionForthK10} alt="" />
        </button>
        <span>
          {cards.map((_, i) => (
            <i key={i} className={i === index ? 'is-selected' : ''} />
          ))}
        </span>
      </div>
    </section>
  )
}
