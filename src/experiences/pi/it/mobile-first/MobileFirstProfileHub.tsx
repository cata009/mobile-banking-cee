import { useRef, useState, useSyncExternalStore } from 'react'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { profileServicesStore } from '@/features/profile/mobileFirstProfileServices'
import { LogosBuddyHorizontal } from './assets'
import { profileAssets as a } from './profileAssets'
import { PROFILE_ACTIVITIES, PROFILE_PRACTICES, type ProfileArea } from './profileContent'
import { ProfileTabs } from './MobileFirstProfilePrimitives'

export interface ProfileHubNavigation {
  area: ProfileArea
  id?: string
  tab?: number
}
export default function MobileFirstProfileHub({
  name,
  onNavigate,
  onClose,
  onLogout,
}: {
  name: string
  onNavigate: (route: ProfileHubNavigation) => void
  onClose: () => void
  onLogout: () => void
}) {
  const [tab, setTab] = useState('Notifiche')
  const [offerTab, setOfferTab] = useState('Casa')
  const [carousel, setCarousel] = useState(0)
  const railRef = useRef<HTMLDivElement>(null)
  const services = useSyncExternalStore(profileServicesStore.subscribe, profileServicesStore.getSnapshot)
  const unread = services.notices.filter((item) => !item.read && !item.archived).length
  const documentUnread = services.documents.filter((item) => !item.read && !item.archived).length
  const practiceCards = PROFILE_PRACTICES.map((item) => ({
    ...item,
    status: services.practices.find((practice) => practice.id === item.id)?.status ?? item.status,
  })).filter((item) => services.practices.some((practice) => practice.id === item.id && !practice.archived))
  const activityCards = (PROFILE_ACTIVITIES[tab] ?? []).flatMap((item) => {
    const record = (tab === 'Notifiche' ? services.notices : services.messages).find(
      (record) => record.id === item.id && !record.archived,
    )
    return record ? [{ ...item, title: record.title, read: record.read }] : []
  })
  const shortcuts = [
    { label: 'I tuoi dati', area: 'personal', icon: a.hub.imgNavigationAndActionProfileK10 },
    { label: 'La tua banca', area: 'bank', icon: a.hub.imgBuildingsBankK10 },
    { label: 'Supporto', area: 'support', icon: a.hub.imgBankTouchpointAndCustomerCareKnowledgeCenterK10 },
    { label: 'Rubrica', area: 'contacts', icon: a.hub.imgNavigationAndActionAddressK10 },
    { label: 'Impostazioni', area: 'settings', icon: a.hub.imgNavigationAndActionSettingsK10 },
    { label: 'Mobile Token', area: 'token', icon: a.hub.imgValidationMobileTokenK10 },
    { label: 'Documenti', area: 'documents', icon: a.hub.imgNavigationAndActionDocumentK10 },
  ] as const
  const scrollTo = (index: number) => {
    setCarousel(index)
    railRef.current?.scrollTo?.({ left: index * 171, behavior: 'smooth' })
  }
  return (
    <main className="mf-home mf-profile-hub" lang="it" aria-label="Profilo" data-mobile-first-profile="true">
      <ScrollableRegion className="mf-profile-hub-scroll scrollbar-hide" aria-label="Profilo e comunicazioni">
        <header className="mf-profile-hub-header">
          <button
            type="button"
            className="mf-profile-name"
            aria-label="Seleziona profilo"
            onClick={() => onNavigate({ area: 'persona' })}
          >
            <strong>{name}</strong>
            <img src={a.hub.imgNavigationAndActionDownK10} alt="" />
          </button>
          <div>
            <button type="button" aria-label="Logout" onClick={onLogout}>
              <img src={a.hub.imgHelp} alt="" />
            </button>
            <button type="button" aria-label="Chiudi profilo" onClick={onClose}>
              <img src={a.hub.imgHelp1} alt="" />
            </button>
          </div>
        </header>
        <div className="mf-profile-quick-grid">
          {shortcuts.map((item) => (
            <button
              type="button"
              key={item.label}
              className={item.area === 'documents' ? 'is-wide' : ''}
              onClick={() => onNavigate({ area: item.area })}
            >
              <img src={item.icon} alt="" />
              <span>{item.label}</span>
              {item.area === 'documents' && documentUnread > 0 && (
                <i aria-label={`${documentUnread} documenti da leggere`}>{documentUnread}</i>
              )}
            </button>
          ))}
        </div>
        <div className="mf-profile-hub-sections">
          <section className="mf-profile-communications">
            <h2>Comunicazioni e attività</h2>
            <div className="mf-profile-communication-tabs">
              <ProfileTabs
                labels={['Notifiche', 'Messaggi', 'Pratiche']}
                value={tab}
                onChange={setTab}
                label="Comunicazioni e attività"
              />
              {unread > 0 && (
                <span className="mf-profile-unread" aria-label={`${unread} notifiche da leggere`}>
                  {unread}
                </span>
              )}
            </div>
            <div className="mf-profile-activity-list">
              {tab !== 'Pratiche' && activityCards.length === 0 && <p>Nessun messaggio disponibile</p>}
              {tab === 'Pratiche'
                ? practiceCards.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="mf-profile-practice-card"
                      onClick={() => onNavigate({ area: 'communications', tab: 2, id: item.id })}
                    >
                      <strong>{item.name}</strong>
                      <span>{item.date}</span>
                      <i className={`status-${item.status.replace(/ /g, '-').toLowerCase()}`}>{item.status}</i>
                      <small>
                        VISUALIZZA <img src={a.hub.imgNavigationAndActionForthT2} alt="" />
                      </small>
                    </button>
                  ))
                : activityCards.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`mf-profile-activity-card${item.read ? ' is-read' : ''}`}
                      onClick={() =>
                        onNavigate({
                          area: tab === 'Notifiche' ? 'notification' : 'communications',
                          id: item.id,
                          tab: 1,
                        })
                      }
                    >
                      <span className="mf-profile-activity-date">
                        <strong>{item.day}</strong>
                        <small>{item.month}</small>
                      </span>
                      <span className="mf-profile-activity-copy">
                        <small>{item.category}</small>
                        <strong>{item.title}</strong>
                      </span>
                      <span className="mf-profile-activity-link">
                        VISUALIZZA <img src={a.hub.imgNavigationAndActionForthT2} alt="" />
                      </span>
                    </button>
                  ))}
            </div>
            <button
              type="button"
              className="mf-profile-link mf-profile-centered"
              onClick={() =>
                onNavigate({ area: 'communications', tab: ['Notifiche', 'Messaggi', 'Pratiche'].indexOf(tab) })
              }
            >
              VEDI{' '}
              {tab === 'Pratiche'
                ? 'TUTTE LE PRATICHE'
                : tab === 'Messaggi'
                  ? 'TUTTI I MESSAGGI'
                  : 'TUTTE LE NOTIFICHE'}{' '}
              <img src={a.hub.imgNavigationAndActionForthT2} alt="" />
            </button>
          </section>
          <section className="mf-profile-stack">
            <h2>In evidenza</h2>
            <button
              type="button"
              className="mf-profile-donation"
              onClick={() => onNavigate({ area: 'partner', id: 'donation' })}
            >
              <span>
                <strong>Il Mio Dono</strong>
                <small>
                  La piattaforma UniCredit per la raccolta fondi, ideata per sostenere le Organizzazioni del Terzo
                  Settore
                </small>
              </span>
              <img src={a.hub.imgImg} alt="" />
            </button>
          </section>
          <section className="mf-profile-stack">
            <h2>Altro</h2>
            <ScrollableRegion ref={railRef} className="mf-profile-other-rail scrollbar-hide" aria-label="Altro">
              {[
                { label: 'Trova Filiali', image: a.hub.imgImage, area: 'branches' },
                { label: 'My Apps', image: a.hub.imgImage1, area: 'apps' },
                { label: 'Iniziative e promo', image: a.hub.imgImage2, area: 'promotions' },
              ].map((item) => (
                <button type="button" key={item.label} onClick={() => onNavigate({ area: item.area as ProfileArea })}>
                  <img src={item.image} alt="" />
                  <strong>{item.label}</strong>
                </button>
              ))}
            </ScrollableRegion>
            <div className="mf-profile-carousel-controls">
              <button
                type="button"
                aria-label="Altro precedente"
                disabled={carousel === 0}
                onClick={() => scrollTo(carousel - 1)}
              >
                <img src={a.hub.imgNavigationAndActionBackK4} alt="" />
              </button>
              <button
                type="button"
                aria-label="Altro successivo"
                disabled={carousel === 2}
                onClick={() => scrollTo(carousel + 1)}
              >
                <img src={a.hub.imgNavigationAndActionForthK10} alt="" />
              </button>
              <span>
                {[0, 1, 2].map((index) => (
                  <i key={index} className={index === carousel ? 'is-selected' : ''} />
                ))}
              </span>
            </div>
          </section>
          <section className="mf-profile-stack">
            <h2>Vantaggi per te</h2>
            <ProfileTabs labels={['Casa', 'Partner']} value={offerTab} onChange={setOfferTab} label="Vantaggi per te" />
            <button type="button" className="mf-profile-offer" onClick={() => onNavigate({ area: 'partner' })}>
              <span>
                <strong>
                  {offerTab === 'Casa' ? 'Servizi immobiliari' : 'Scopri tutte le offerte dei nostri partner'}
                </strong>
                <small>Scopri i numerosi servizi offerti per te dai nostri partner a prezzi dedicati.</small>
                <LogosBuddyHorizontal className="relative h-[26px] w-[57px]" />
              </span>
              <img src={a.hub.imgImg1} alt="" />
            </button>
          </section>
        </div>
        <div className="mf-profile-logout">
          <button type="button" onClick={onLogout}>
            <span>
              <img src={a.hub.imgNavigationAndActionLogoutK10} alt="" />
            </span>
            Logout
          </button>
        </div>
      </ScrollableRegion>
    </main>
  )
}
