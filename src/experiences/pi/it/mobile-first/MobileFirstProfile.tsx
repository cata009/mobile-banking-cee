import { Suspense, lazy, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { getProfileDataSnapshot, subscribeProfileData } from '@/features/profile/mobileFirstProfileData'
import { nextProfileToken, profileHubStore } from '@/features/profile/mobileFirstProfile'
import {
  ProfileButton,
  ProfileChromeContext,
  ProfileHelpContext,
  ProfilePage,
  ProfileRow,
} from './MobileFirstProfilePrimitives'
import type { ProfileArea } from './profileContent'
import MobileFirstProfileHub, { type ProfileHubNavigation } from './MobileFirstProfileHub'
import MobileFirstProfileAuthorization, { ProfileRequestResult } from './MobileFirstProfileAuthorization'
import { ProfileSettingsRecoveryContext } from './MobileFirstProfileSettingsShared'
import { PROFILE_PERSONAS } from './profileContent'
import { profileAssets as a } from './profileAssets'
import { initializeProfileComposition } from './profileComposition'
import { profileServicesStore } from '@/features/profile/mobileFirstProfileServices'
import './mobile-first-profile.css'

const Personal = lazy(() => import('./MobileFirstProfileData'))
const Settings = lazy(() => import('./MobileFirstProfileSettings'))
const Services = lazy(() => import('./MobileFirstProfileServices'))
const Promotions = lazy(() => import('./MobileFirstProfilePromotions'))
const Branches = lazy(() => import('./MobileFirstProfileBranches'))
initializeProfileComposition()

export interface MobileFirstProfileProps {
  onClose: () => void
  onLogout?: () => void
  onNavigate?: (target: string, id?: string) => void
  onPhoneChromeChange?: (variant: 'light' | 'dark') => void
  initialEntry?: ProfileArea
  initialNavigation?: ProfileHubNavigation
}
export default function MobileFirstProfile({
  onClose,
  onLogout,
  onNavigate,
  onPhoneChromeChange,
  initialEntry = 'hub',
  initialNavigation,
}: MobileFirstProfileProps) {
  const [routes, setRoutes] = useState<ProfileHubNavigation[]>(() => {
    const initial = initialNavigation ?? { area: initialEntry }
    return initial.area === 'hub' ? [initial] : [{ area: 'hub' }, initial]
  })
  const [logout, setLogout] = useState(false)
  const [buddyConfirmation, setBuddyConfirmation] = useState(false)
  const chromeRef = useRef(onPhoneChromeChange)
  chromeRef.current = onPhoneChromeChange
  const changeChrome = useCallback((variant: 'light' | 'dark') => chromeRef.current?.(variant), [])
  const [tokenReady, setTokenReady] = useState(false)
  const [requestStage, setRequestStage] = useState<'details' | 'code' | 'approved' | 'declined'>('details')
  const state = useSyncExternalStore(profileHubStore.subscribe, profileHubStore.getSnapshot)
  const data = useSyncExternalStore(subscribeProfileData, getProfileDataSnapshot)
  const current = routes[routes.length - 1]!
  const persona = PROFILE_PERSONAS.find((item) => item.id === state.persona) ?? PROFILE_PERSONAS[0]
  const name = persona.legal ? persona.name : `${data.firstName} ${data.lastName}`
  const hub = useCallback(() => setRoutes([{ area: 'hub' }]), [])
  const navigate = useCallback((route: ProfileHubNavigation) => {
    if (route.area === 'notification' && route.id) {
      profileHubStore.dispatch({ type: 'read', id: route.id })
      profileServicesStore.update('notices', (items) =>
        items.map((item) => (item.id === route.id ? { ...item, read: true } : item)),
      )
    }
    setRequestStage('details')
    setTokenReady(false)
    setRoutes((previous) => [...previous, route])
  }, [])
  const back = () => setRoutes((previous) => (previous.length > 1 ? previous.slice(0, -1) : previous))
  const help = useCallback(() => navigate({ area: 'support' }), [navigate])
  const childNavigate = (target: string, id?: string) => {
    if (target === 'account') target = 'accounts'
    if (target === 'notification') navigate({ area: 'notification', id })
    else if (
      [
        'personal',
        'bank',
        'support',
        'contacts',
        'settings',
        'security',
        'documents',
        'appointments',
        'communications',
        'identity',
        'branches',
        'apps',
        'promotions',
      ].includes(target)
    )
      navigate({ area: target as ProfileHubNavigation['area'], id })
    else {
      onNavigate?.(target, id)
      if (onNavigate) onClose()
    }
  }
  useEffect(() => {
    if (current.area === 'hub') {
      onPhoneChromeChange?.('light')
      const escape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !logout) onClose()
      }
      document.addEventListener('keydown', escape)
      return () => document.removeEventListener('keydown', escape)
    }
  }, [current.area, onClose, onPhoneChromeChange, logout])
  const common = {
    onBack: back,
    onClose:
      initialEntry !== 'hub' || (initialNavigation?.area !== undefined && initialNavigation.area !== 'hub')
        ? onClose
        : hub,
  }
  const currentDecision = current.id ? state.decisions[current.id] : undefined
  const actionable = ['login', 'approve-transfer', 'approve-card', 'master'].includes(current.id ?? '')
  let content
  if (current.area === 'hub')
    content = (
      <MobileFirstProfileHub name={name} onNavigate={navigate} onClose={onClose} onLogout={() => setLogout(true)} />
    )
  else if (current.area === 'personal' || current.area === 'contacts' || current.area === 'identity')
    content = <Personal key={current.area} entry={current.area} {...common} />
  else if (current.area === 'settings' || current.area === 'security')
    content = (
      <Settings
        key={`${current.area}-${current.id}`}
        entry={current.area}
        initialFlow={current.id === 'forgot-mobile-code' || current.id === 'digital-signature' ? current.id : undefined}
        onNavigate={(target) =>
          target === 'practices' ? navigate({ area: 'communications', tab: 2 }) : childNavigate(target)
        }
        onHome={onClose}
        {...common}
      />
    )
  else if (['support', 'bank', 'appointments', 'documents', 'communications'].includes(current.area))
    content = (
      <Services
        key={`${current.area}-${current.id ?? ''}`}
        entry={current.area as 'support' | 'bank' | 'appointments' | 'documents' | 'communications'}
        communicationTab={current.tab}
        initialDetail={current.id}
        onNavigate={childNavigate}
        {...common}
      />
    )
  else if (current.area === 'promotions' || current.area === 'partner')
    content = (
      <Promotions
        key={current.id}
        initialDetail={current.area === 'partner' ? (current.id === 'donation' ? 'donation' : 'partner') : undefined}
        onBack={back}
        onClose={hub}
        onNavigate={childNavigate}
      />
    )
  else if (current.area === 'branches')
    content = <Branches onBack={back} onClose={hub} onAppointment={() => navigate({ area: 'appointments' })} />
  else if (current.area === 'apps')
    content = (
      <ProfilePage title="My Apps" onClose={hub}>
        <div className="mf-profile-app-grid">
          {[
            { name: 'SafetyDrive', image: a.apps.imgScreenshot20250328100157GooglePlayStore },
            { name: 'MyCare', image: a.apps.imgScreenshot20250328100150GooglePlayStore },
            { name: 'MyCareSalute', image: a.apps.imgScreenshot20250328100157GooglePlayStore1 },
            { name: 'Leasing', image: a.apps.imgScreenshot20250328100150GooglePlayStore1 },
          ].map((app) => (
            <a
              key={app.name}
              href={`https://play.google.com/store/search?q=${encodeURIComponent(`UniCredit ${app.name}`)}&c=apps`}
              target="_blank"
              rel="noreferrer"
            >
              <img src={app.image} alt="" />
              <span>{app.name}</span>
            </a>
          ))}
        </div>
      </ProfilePage>
    )
  else if (current.area === 'persona')
    content = (
      <ProfilePage
        title="Seleziona profilo"
        onClose={hub}
        description="Scegli il profilo (cambio REB), con cui desideri accedere."
      >
        {[false, true].map((legal) => (
          <section key={String(legal)}>
            <h3>{legal ? 'Persona Giuridica' : 'Persona Fisica'}</h3>
            {PROFILE_PERSONAS.filter((item) => item.legal === legal).map((item) => (
              <button
                type="button"
                key={item.id}
                className="mf-profile-persona"
                aria-pressed={state.persona === item.id}
                onClick={() => {
                  if (item.id === 'buddy-personal' && state.persona !== item.id) {
                    setBuddyConfirmation(true)
                    return
                  }
                  profileHubStore.dispatch({ type: 'persona', id: item.id })
                  hub()
                }}
              >
                {item.id === 'uci-personal' ? (
                  <img src={a.persona.imgAvatarCard} alt="" />
                ) : (
                  <span>{item.initials}</span>
                )}
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.code} &nbsp; {item.bank}
                  </small>
                </span>
                {state.persona === item.id && <img src={a.persona.imgNavigationAndActionSingleTickT2} alt="" />}
              </button>
            ))}
          </section>
        ))}
        <div className="mf-profile-logout">
          <button type="button" onClick={() => setLogout(true)}>
            <span>
              <img src={a.persona.imgNavigationAndActionLogoutK10} alt="" />
            </span>
            Logout
          </button>
        </div>
      </ProfilePage>
    )
  else if (current.area === 'token')
    content = tokenReady ? (
      <ProfilePage
        title="Mobile Token"
        onClose={hub}
        footer={
          <>
            <ProfileButton onClick={() => setTokenReady(false)}>Altra password</ProfileButton>
            <ProfileButton secondary onClick={hub}>
              Chiudi
            </ProfileButton>
          </>
        }
      >
        <div className="mf-profile-token">
          <img src={a.token.imgVector} alt="" />
          <strong>{nextProfileToken(Math.max(0, state.tokenGeneration - 1))}</strong>
        </div>
        <p>Password da inserire per confermare l’operazione</p>
      </ProfilePage>
    ) : (
      <MobileFirstProfileAuthorization
        onCancel={hub}
        onSuccess={() => {
          profileHubStore.dispatch({ type: 'new-token' })
          setTokenReady(true)
        }}
        onForgot={() => navigate({ area: 'settings', id: 'forgot-mobile-code' })}
      />
    )
  else if (current.area === 'notification') {
    if (requestStage === 'code')
      content = (
        <MobileFirstProfileAuthorization
          onCancel={() => setRequestStage('details')}
          onSuccess={() => {
            profileHubStore.dispatch({ type: 'decision', id: current.id!, decision: 'approved' })
            setRequestStage('approved')
          }}
          onForgot={() => navigate({ area: 'settings', id: 'forgot-mobile-code' })}
        />
      )
    else if (requestStage === 'approved' || requestStage === 'declined')
      content = (
        <ProfileRequestResult approved={requestStage === 'approved'} login={current.id === 'login'} onClose={hub} />
      )
    else
      content = (
        <ProfileNotificationDetail
          id={current.id ?? 'bank-access'}
          onBack={back}
          onClose={hub}
          decision={currentDecision}
          onNavigate={childNavigate}
          footer={
            current.id === 'slave' && !currentDecision ? (
              <ProfileButton
                secondary
                onClick={() => {
                  profileHubStore.dispatch({ type: 'decision', id: current.id!, decision: 'declined' })
                  hub()
                }}
              >
                Annulla operazione
              </ProfileButton>
            ) : actionable && !currentDecision ? (
              <>
                <ProfileButton onClick={() => setRequestStage('code')}>
                  {current.id === 'login' ? 'Consenti' : 'Autorizza'}
                </ProfileButton>
                <ProfileButton
                  secondary
                  onClick={() => {
                    profileHubStore.dispatch({ type: 'decision', id: current.id!, decision: 'declined' })
                    setRequestStage('declined')
                  }}
                >
                  {current.id === 'login' ? 'Non consentire' : 'Non autorizzare'}
                </ProfileButton>
              </>
            ) : undefined
          }
        />
      )
  }
  return (
    <ProfileSettingsRecoveryContext.Provider value={() => navigate({ area: 'settings', id: 'forgot-mobile-code' })}>
      <ProfileChromeContext.Provider value={changeChrome}>
        <ProfileHelpContext.Provider value={help}>
          <Suspense
            fallback={
              <ProfilePage title="Profilo" onClose={hub}>
                <div className="mf-profile-loading" aria-label="Caricamento">
                  <span />
                  <span />
                  <span />
                </div>
              </ProfilePage>
            }
          >
            {content}
          </Suspense>
          {buddyConfirmation && (
            <BottomSheet
              title="Attenzione"
              closeLabel="Chiudi"
              onClose={() => setBuddyConfirmation(false)}
              className="mf-sheet"
            >
              <p>Gentile Cliente, proseguendo, entrerai nel tuo profilo buddy.</p>
              <div className="mf-profile-stack">
                <ProfileButton
                  onClick={() => {
                    profileHubStore.dispatch({ type: 'persona', id: 'buddy-personal' })
                    setBuddyConfirmation(false)
                    hub()
                  }}
                >
                  Continua
                </ProfileButton>
                <ProfileButton secondary onClick={() => setBuddyConfirmation(false)}>
                  Annulla
                </ProfileButton>
              </div>
            </BottomSheet>
          )}
          {logout && (
            <BottomSheet title="Logout" closeLabel="Chiudi" onClose={() => setLogout(false)} className="mf-sheet">
              <p>Vuoi uscire dall’app?</p>
              <div className="mf-profile-stack">
                <ProfileButton
                  onClick={() => {
                    setLogout(false)
                    ;(onLogout ?? onClose)()
                  }}
                >
                  Esci
                </ProfileButton>
                <ProfileButton secondary onClick={() => setLogout(false)}>
                  Annulla
                </ProfileButton>
              </div>
            </BottomSheet>
          )}
        </ProfileHelpContext.Provider>
      </ProfileChromeContext.Provider>
    </ProfileSettingsRecoveryContext.Provider>
  )
}

function ProfileNotificationDetail({
  id,
  onBack,
  onClose,
  footer,
  decision,
  onNavigate,
}: {
  id: string
  onBack: () => void
  onClose: () => void
  footer?: ReactNode
  decision?: 'approved' | 'declined'
  onNavigate: (target: string, id?: string) => void
}) {
  const payment = id === 'approve-transfer' || id === 'approve-card' || id === 'master'
  const receipt = id === 'debit-info' || id === 'bank-access' || id === 'transfer-info'
  const title =
    id === 'login'
      ? 'Sei veramente tu?'
      : payment
        ? id === 'approve-transfer'
          ? 'Autorizza Bonifico Sepa'
          : id === 'master'
            ? 'Autorizza Bonifico Sepa'
            : 'Autorizza Transazione'
        : id === 'debit-info'
          ? 'Pagamento con carta di debito'
          : id === 'bancomat'
            ? 'BANCOMAT® Pay'
            : id === 'transfer-info'
              ? 'Ordine di bonifico'
              : id === 'secondary-device'
                ? 'Accesso da Dispositivo secondario'
                : id === 'access-error'
                  ? 'Errore Accesso Banca Multicanale'
                  : id === 'slave'
                    ? 'Notifica inviata'
                    : 'Accesso a Banca Multicanale'
  return (
    <ProfilePage
      title={title}
      onBack={receipt ? undefined : onBack}
      onClose={onClose}
      showHelp={!receipt}
      chrome={receipt ? 'dark' : 'light'}
      hero={
        receipt
          ? id === 'debit-info'
            ? a.receipts.debit
            : id === 'transfer-info'
              ? a.receipts.transfer
              : a.receipts.access
          : undefined
      }
      className={receipt ? 'mf-profile-receipt' : ''}
      footer={
        receipt && id !== 'bank-access' ? (
          <ProfileButton onClick={() => onNavigate(id === 'debit-info' ? 'cards' : 'accounts')}>
            {id === 'debit-info' ? 'Vai a Carte' : 'Vai a Conti'}
          </ProfileButton>
        ) : (
          footer
        )
      }
    >
      {id === 'login' ? (
        <>
          <ProfileRow label="Dispositivo" value="Windows" />
          <ProfileRow label="Browser" value="Chrome" />
          <ProfileRow label="Data e ora" value="14/03/2025 - 17:03:2025" />
          <p>Abbiamo rilevato un accesso alla tua Banca via internet, qui sopra i dettagli</p>
        </>
      ) : payment ? (
        <>
          <p>
            {id === 'approve-transfer'
              ? 'Controlla che tutti i dati siano corretti e procedi al pagamento'
              : 'Se i dati sono corretti procedi per autorizzare la transazione'}
          </p>
          <div className="mf-profile-notification-details">
            {(id === 'master'
              ? [
                  ['Conto ordinante', '0000000004567000523'],
                  ['Beneficiario', 'Umberto Ronzoni'],
                  ['IBAN Beneficiario', 'IT8F7909ICIHJJHGJA908000000'],
                  ['Banca', 'Intesa Sanpaolo SPA'],
                  ['Importo', '5,00€'],
                  ['Causale', 'Ricarica conto'],
                  ['Canale', 'Dispositivo secondario'],
                  ['Nome dispositivo', 'Apple1'],
                  ['Data e ora', '14/03/2025 - 17:03:2025'],
                ]
              : [
                  ['Beneficiario', 'Andrea Rossini'],
                  ['IBAN Beneficiario', 'IT83F03012345990921'],
                  ['Banca', 'Intesa Sanpaolo SPA'],
                  ['Importo', '5,00€'],
                  ['Data e ora', '14/03/2025 - 17:03:2025'],
                ]
            ).map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </>
      ) : id === 'slave' ? (
        <>
          <p>Abbiamo inoltrato una notifica push al tuo dispositivo principale affinchè confermi l’operazione.</p>
          <p>Puoi recuperare la richiesta dall’archivio delle notifiche del dispositivo principale.</p>
        </>
      ) : id === 'transfer-info' ? (
        <>
          <p>
            UniCredit c/c n.xx0123 bonifico di EUR 5.00 disposto tramite Banca Multicanale ben. Andrea Rossini,
            15/03/25, 14:58.
          </p>
          <p>
            Per info <a href="tel:800575757">800575757</a>
          </p>
        </>
      ) : id === 'debit-info' ? (
        <>
          <p>
            UniCredit segnala: autorizzato pagamento 5,60 EUR carta di debito XX3627 c/o Andrea Rossini 14/03/25 13:32.
          </p>
          <p>
            Per info <a href="tel:800575757">800575757</a>
          </p>
        </>
      ) : id === 'bancomat' ? (
        <>
          <p>Autorizzazione per pagamenti ricorrente revocata</p>
          {[
            ['Operazione', 'BANCOMAT® Pay'],
            ['Beneficiario', 'Sephora'],
            ['Tipologia', 'Pagamento ricorrente'],
            ['Data e ora', '20/09/2024 - 10:39'],
          ].map(([label, value]) => (
            <ProfileRow key={label} label={label} value={value} />
          ))}
        </>
      ) : (
        <>
          <p>
            {id === 'access-error'
              ? 'UniCredit: errore accesso Banca Multicanale. Verifica i tuoi codici identificativi.'
              : id === 'secondary-device'
                ? 'UniCredit: accesso alla Banca Multicanale da dispositivo secondario.'
                : id === 'master' || id === 'slave'
                  ? 'Controlla i dati del dispositivo e conferma solo se riconosci l’operazione.'
                  : 'UniCredit Il 15-03-25, 14:49 è stato effettuato un accesso a Banca Multicanale con i suoi codici identificativi.'}
          </p>
          <p>
            Per info <a href="tel:800575757">800575757</a>
          </p>
          {!receipt && (
            <ProfileButton secondary onClick={() => onNavigate('security')}>
              Check up sicurezza
            </ProfileButton>
          )}
        </>
      )}
      {decision && (
        <p role="status">{decision === 'approved' ? 'Richiesta autorizzata' : 'Richiesta non autorizzata'}</p>
      )}
    </ProfilePage>
  )
}
