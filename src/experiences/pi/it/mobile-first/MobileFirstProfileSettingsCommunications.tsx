import { useState } from 'react'
import {
  categoryNotificationError,
  profileSettingsStore,
  validProfileContact,
  switchProfileNotificationsToPush,
  saveProfileNotificationPreferences,
  transitionProfileSignature,
} from '@/features/profile/mobileFirstProfileSettings'
import { ProfileButton, ProfileField, ProfileRow } from './MobileFirstProfilePrimitives'
import { SettingsPage as ProfilePage } from './MobileFirstProfileSettingsShared'
import {
  SettingsAuthorization,
  SettingsChoice,
  SettingsDocument,
  SettingsError,
  SettingsResult,
  SettingsSelect,
  SettingsToggle,
  useProfileSettings,
  type SettingsNavigation,
} from './MobileFirstProfileSettingsShared'
import {
  CATEGORIES,
  NOTIFICATION_EVENTS,
  NOTIFICATION_GROUPS,
  PRIVACY_LABELS,
  TRANSPORT_SUBCATEGORIES,
} from './profileSettingsContent'

export default function MobileFirstProfileSettingsCommunications({
  section,
  onBack,
  onClose,
  onNavigate,
  onHome,
}: { section: string; onNavigate?: (target: string) => void; onHome?: () => void } & SettingsNavigation) {
  const settings = useProfileSettings()
  const [view, setView] = useState(section),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState(''),
    [enabled, setEnabled] = useState(settings.notificationsEnabled),
    [channels, setChannels] = useState({ ...settings.notificationChannels }),
    [groupFlags, setGroupFlags] = useState({ ...settings.notificationGroupEnabled }),
    [group, setGroup] = useState('Conti correnti'),
    [event, setEvent] = useState('Accrediti'),
    [category, setCategory] = useState(''),
    [subcategory, setSubcategory] = useState(''),
    [removing, setRemoving] = useState('')
  const [privacy, setPrivacy] = useState([...settings.privacy]),
    [cookies, setCookies] = useState(settings.cookies),
    [ivass, setIvass] = useState(settings.ivass),
    [newsletter, setNewsletter] = useState('Morning Meeting'),
    [email, setEmail] = useState(''),
    [verification, setVerification] = useState('')
  const [pending, setPending] = useState<() => void>(() => () => {})
  const go = (target: string) => {
    setError(null)
    setView(target)
  }
  const back = () => {
    if (view === section) onBack()
    else if (['notification-event', 'categories', 'category-remove'].includes(view)) go('notification-group')
    else if (['newsletter-confirm', 'email', 'email-verify'].includes(view)) go('newsletter')
    else go(section)
  }
  const finish = (message: string) => {
    setNotice(message)
    go('result')
  }
  const authorize = (action: () => void) => {
    setPending(() => action)
    go('authorize')
  }
  const saveNotifications = () => {
    saveProfileNotificationPreferences(enabled, channels, groupFlags)
    finish('Preferenze notifiche salvate')
  }
  if (view === 'authorize')
    return (
      <SettingsAuthorization
        title="Conferma le modifiche"
        onBack={back}
        onClose={onClose}
        onSuccess={() => pending()}
      />
    )
  if (view === 'result')
    return (
      <SettingsResult
        title={notice}
        onClose={onClose}
        onDone={() => go(section)}
        footer={
          notice === 'La sottoscrizione si è conclusa correttamente!' ? (
            <>
              <ProfileButton onClick={onHome ?? onClose}>Vai a Homepage</ProfileButton>
              <ProfileButton secondary onClick={() => (onNavigate ? onNavigate('practices') : go('privacy-practices'))}>
                Vai alla sezione Pratiche
              </ProfileButton>
            </>
          ) : undefined
        }
      />
    )
  if (view === 'privacy-practices')
    return (
      <ProfilePage title="Pratiche" onBack={() => go('privacy')} onClose={onClose}>
        <ProfileRow label="Aggiornamento consensi privacy" detail="Sottoscrizione completata" value="Completata" />
      </ProfilePage>
    )
  if (view === 'notifications')
    return (
      <ProfilePage
        title="Notifiche"
        onBack={onBack}
        onClose={onClose}
        footer={<ProfileButton onClick={saveNotifications}>Salva modifiche</ProfileButton>}
      >
        {settings.smsPremium && (
          <section className="mf-settings-card">
            <h2>Ricevi ancora notifiche tramite SMS?</h2>
            <p>Passa a Notifiche Push: ricevi le comunicazioni gratuitamente sul tuo smartphone.</p>
            <ProfileButton secondary onClick={() => go('sms-warning')}>
              Modifica metodo di ricezione
            </ProfileButton>
          </section>
        )}
        <SettingsToggle label="Abilita tutte le notifiche" checked={enabled} onChange={setEnabled} />
        {NOTIFICATION_GROUPS.map((x) => (
          <ProfileRow
            key={x}
            label={x}
            value="VISUALIZZA"
            onClick={() => {
              setGroup(x)
              go('notification-group')
            }}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'sms-warning')
    return (
      <ProfilePage
        title="Impostazioni notifiche"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              authorize(() => {
                switchProfileNotificationsToPush()
                setEnabled(true)
                finish('Notifiche push attivate')
              })
            }
          >
            Autorizza
          </ProfileButton>
        }
      >
        <p>Non riceverai più SMS a pagamento ma notifiche push sul tuo smartphone.</p>
        <p>Ricordati che passando alle notifiche push non potrai più riattivare SMS Premium.</p>
        <p>Per il trattamento dei dati personali consulta l’informativa privacy.</p>
        <ProfileButton secondary onClick={() => go('privacy')}>
          Visualizza informativa privacy
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'notification-group')
    return (
      <ProfilePage
        title={group}
        onBack={() => go('notifications')}
        onClose={onClose}
        footer={<ProfileButton onClick={saveNotifications}>Salva modifiche</ProfileButton>}
      >
        <SettingsToggle
          label="Abilita le notifiche"
          checked={groupFlags[group] ?? true}
          onChange={(value) => setGroupFlags({ ...groupFlags, [group]: value })}
        />
        {NOTIFICATION_EVENTS[group]?.map((x) => (
          <ProfileRow
            key={x}
            label={x}
            value={channels[group + ':' + x] ?? 'Solo archivio'}
            onClick={() => {
              setEvent(x)
              go('notification-event')
            }}
          />
        ))}
        {group === 'Bilancio familiare e budget' && (
          <ProfileButton secondary onClick={() => go('categories')}>
            Gestisci categorie
          </ProfileButton>
        )}
      </ProfilePage>
    )
  if (view === 'notification-event')
    return (
      <ProfilePage
        title={event}
        onBack={() => go('notification-group')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => go('notification-group')}>Conferma</ProfileButton>}
      >
        <SettingsChoice
          label="Modalità di ricezione"
          options={settings.smsPremium ? ['Solo archivio', 'Push', 'SMS Premium'] : ['Solo archivio', 'Push']}
          value={channels[group + ':' + event] ?? 'Solo archivio'}
          onChange={(x) => setChannels({ ...channels, [group + ':' + event]: x })}
        />
        <p>Le notifiche saranno consultabili anche nell’archivio.</p>
      </ProfilePage>
    )
  if (view === 'category-remove')
    return (
      <ProfilePage
        title="Attenzione"
        onBack={() => go('categories')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              profileSettingsStore.update({
                categoryNotifications: settings.categoryNotifications.filter((x) => x !== removing),
              })
              go('categories')
            }}
          >
            Conferma eliminazione
          </ProfileButton>
        }
      >
        <p>Stai eliminando una notifica per le categorie di spesa selezionate in precedenza.</p>
        <p>{removing}</p>
        <ProfileButton secondary onClick={() => go('categories')}>
          Annulla
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'categories')
    return (
      <ProfilePage
        title="Bilancio familiare e Budget"
        onBack={() => go('notification-group')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const e = categoryNotificationError(category, subcategory, settings.categoryNotifications)
              setError(e)
              if (!e) {
                profileSettingsStore.update({
                  categoryNotifications: [...settings.categoryNotifications, category + ' - ' + subcategory],
                })
                setCategory('')
                setSubcategory('')
              }
            }}
          >
            Conferma
          </ProfileButton>
        }
      >
        <h2>Nuova notifica per categoria</h2>
        <p>Seleziona una categoria per cui vuoi ricevere una notifica.</p>
        <SettingsSelect
          label="Categoria"
          options={CATEGORIES}
          value={category}
          onChange={(x) => {
            setCategory(x)
            setSubcategory('')
          }}
        />
        <SettingsSelect
          label="Sottocategoria"
          options={category === 'Trasporti' ? TRANSPORT_SUBCATEGORIES : category ? ['Altro ' + category] : []}
          value={subcategory}
          onChange={setSubcategory}
        />
        <SettingsError error={error} />
        <h2>Notifiche attive</h2>
        <p>Categorie di spesa per cui le notifiche sono già attive.</p>
        {settings.categoryNotifications.map((x) => (
          <div className="mf-settings-alert-row" key={x}>
            <span>{x}</span>
            <button
              type="button"
              aria-label={'Elimina ' + x}
              onClick={() => {
                setRemoving(x)
                go('category-remove')
              }}
            >
              ELIMINA
            </button>
          </div>
        ))}
        {!settings.categoryNotifications.length && <p>Nessuna notifica attiva.</p>}
      </ProfilePage>
    )
  if (view === 'newsletter')
    return (
      <ProfilePage title="Newsletter" onBack={onBack} onClose={onClose}>
        <h2>Email</h2>
        <ProfileRow
          label="Email"
          value={settings.email}
          detail={settings.emailVerified ? 'Verificato' : 'Da verificare'}
          onClick={() => go('email')}
        />
        <h2>Iscrizioni</h2>
        {['Morning Meeting', 'Novità di Banca Multicanale', 'Newsletter Genius'].map((x) => (
          <SettingsToggle
            key={x}
            label={x}
            detail={x + ' fonte: UniCredit'}
            checked={settings.newsletters.includes(x)}
            onChange={() => {
              setNewsletter(x)
              go('newsletter-confirm')
            }}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'newsletter-confirm') {
    const active = settings.newsletters.includes(newsletter)
    return (
      <ProfilePage
        title={active ? 'Disattiva newsletter' : 'Attiva newsletter'}
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!settings.emailVerified}
            onClick={() =>
              authorize(() => {
                profileSettingsStore.update({
                  newsletters: active
                    ? settings.newsletters.filter((x) => x !== newsletter)
                    : [...settings.newsletters, newsletter],
                })
                finish(active ? 'Iscrizione disattivata' : 'Iscrizione attivata')
              })
            }
          >
            Conferma
          </ProfileButton>
        }
      >
        <h2>{newsletter}</h2>
        <p>
          {active
            ? 'Non riceverai più questa newsletter. Puoi riattivarla in qualsiasi momento.'
            : 'Riceverai questa newsletter sul tuo indirizzo email verificato.'}
        </p>
        <ProfileRow label="Email" value={settings.email} />
        <ProfileButton secondary onClick={back}>
          Annulla
        </ProfileButton>
      </ProfilePage>
    )
  }
  if (view === 'email')
    return (
      <ProfilePage
        title="Modifica email"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (!validProfileContact('email', email)) {
                setError('Inserisci un indirizzo email valido.')
                return
              }
              setVerification('')
              go('email-verify')
            }}
          >
            Invia codice di verifica
          </ProfileButton>
        }
      >
        <ProfileField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'email-verify')
    return (
      <ProfilePage
        title="Verifica email"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (verification !== '123456') {
                setError('Il codice non è corretto. Riprova.')
                return
              }
              profileSettingsStore.update({ email, emailVerified: true })
              go('newsletter')
            }}
          >
            Conferma
          </ProfileButton>
        }
      >
        <p>Inserisci il codice ricevuto sul tuo indirizzo email.</p>
        <ProfileField
          label="Codice di verifica"
          inputMode="numeric"
          value={verification}
          onChange={(e) => setVerification(e.target.value)}
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'privacy')
    return (
      <ProfilePage title="Consensi e Privacy" onBack={onBack} onClose={onClose}>
        <h2>Privacy</h2>
        <ProfileButton secondary onClick={() => go('privacy-edit')}>
          Modifica privacy
        </ProfileButton>
        {PRIVACY_LABELS.map((label, i) => (
          <ProfileRow key={label} label={label} value={settings.privacy[i] ? 'Acconsento' : 'Non acconsento'} />
        ))}
        <h2>Cookies</h2>
        <ProfileRow
          label="Tracciamento"
          value={settings.cookies ? 'Acconsento' : 'Non acconsento'}
          onClick={() => go('cookies')}
        />
        <h2>Informative Privacy e Cookies Policy</h2>
        <p>Consulta le informative Privacy e la Cookies Policy dell’App.</p>
        <ProfileButton secondary onClick={() => go('privacy-info')}>
          Visualizza informativa
        </ProfileButton>
        <h2>IVASS</h2>
        <ProfileRow
          label="Consensi IVASS"
          value={settings.ivass ? 'Acconsento' : 'Non acconsento'}
          onClick={() => go('ivass')}
        />
      </ProfilePage>
    )
  if (view === 'privacy-edit')
    return (
      <ProfilePage
        title="Proteggi la tua privacy scegliendo come tratteremo i tuoi dati"
        onBack={back}
        onClose={onClose}
        description="Fai la tua scelta, ma prima prendi visione dell’informativa sul trattamento e la protezione dei dati personali."
        footer={<ProfileButton onClick={() => go('privacy-signing-intro')}>Prosegui</ProfileButton>}
      >
        {PRIVACY_LABELS.map((label, i) => (
          <SettingsChoice
            key={label}
            label={label}
            options={['Acconsento', 'Non acconsento']}
            value={privacy[i] ? 'Acconsento' : 'Non acconsento'}
            onChange={(x) => setPrivacy(privacy.map((v, j) => (i === j ? x === 'Acconsento' : v)))}
          />
        ))}
        {settings.sharedClient && <p>Questi consensi si applicano al cliente condiviso UniCredit e buddy.</p>}
      </ProfilePage>
    )
  if (view === 'privacy-doc')
    return (
      <SettingsDocument
        title="Documento Consensi Privacy"
        body={
          'Dichiaro di aver preso visione dell’Informativa privacy e confermo la volontà espressa in merito al trattamento dei dati personali. ' +
          PRIVACY_LABELS.map((x, i) => x + ': ' + (privacy[i] ? 'Acconsento' : 'Non acconsento')).join('. ')
        }
        onBack={() => go('privacy-edit')}
        onClose={onClose}
        onAccept={() => go('privacy-signing-complete')}
      />
    )
  if (view === 'privacy-signing-intro')
    return (
      <ProfilePage
        title="Firma la documentazione"
        onBack={() => go('privacy-edit')}
        onClose={onClose}
        footer={
          <ProfileButton onClick={() => go(settings.signature === 'Attiva' ? 'privacy-doc' : 'privacy-signature')}>
            Avanti
          </ProfileButton>
        }
      >
        <p>
          Ti raccomandiamo l’attenta lettura della documentazione. Premendo Conferma avvierai il processo di presa
          visione e, ove previsto, di successiva firma ai fini della formalizzazione della pratica.
        </p>
      </ProfilePage>
    )
  if (view === 'privacy-signature')
    return (
      <SettingsDocument
        title="Per firmare è necessaria la firma digitale: scopri come funziona"
        body="Per sottoscrivere i documenti informatici è necessaria l’emissione di un certificato di Firma Digitale, disponibile subito e senza costi aggiuntivi. L’emissione e la modalità di sottoscrizione sono regolate dal Manuale Operativo di In.Te.S.A. S.p.A. UniCredit comunica nome, cognome, codice fiscale e data di nascita al certificatore. Ho preso visione del Manuale Operativo e richiedo la Firma Digitale."
        onBack={() => go('privacy-signing-intro')}
        onClose={onClose}
        onAccept={() => go('privacy-doc')}
      />
    )
  if (view === 'privacy-signing-complete')
    return (
      <ProfilePage
        title="Completa la sottoscrizione"
        onBack={() => go('privacy-doc')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              authorize(() => {
                profileSettingsStore.update({ privacy })
                if (settings.signature !== 'Attiva') transitionProfileSignature('Attiva')
                finish('La sottoscrizione si è conclusa correttamente!')
              })
            }
          >
            Conferma
          </ProfileButton>
        }
      >
        <p>
          Premendo Conferma e inserendo il sistema di autenticazione richiesto si completa la sottoscrizione elettronica
          in corrispondenza dei punti firma accettati.
        </p>
      </ProfilePage>
    )
  if (view === 'privacy-info')
    return (
      <ProfilePage title="Informative Privacy e Cookies Policy" onBack={() => go('privacy')} onClose={onClose}>
        <h2>Trattamento e protezione dei dati</h2>
        <p>
          Puoi scegliere separatamente i consensi di messaggistica, email, comunicazioni multimediali, chiamate e
          profilazione. Puoi modificarli o revocarli dalla sezione Privacy.
        </p>
        <h2>Cookies</h2>
        <p>
          Il consenso al tracciamento è facoltativo e può essere revocato. I cookie necessari al funzionamento del
          servizio restano attivi.
        </p>
        <ProfileButton secondary onClick={() => go('privacy-edit')}>
          Gestisci consensi
        </ProfileButton>
      </ProfilePage>
    )
  const cookieView = view === 'cookies'
  return (
    <ProfilePage
      title={cookieView ? 'Modifica cookies' : 'Modifica consenso IVASS'}
      onBack={() => go('privacy')}
      onClose={onClose}
      footer={
        <ProfileButton
          onClick={() => {
            profileSettingsStore.update(cookieView ? { cookies } : { ivass })
            finish(cookieView ? 'Preferenze cookies aggiornate' : 'Consenso IVASS aggiornato')
          }}
        >
          Salva modifiche
        </ProfileButton>
      }
    >
      <SettingsChoice
        label={cookieView ? 'Tracciamento' : 'Consenso IVASS'}
        options={['Acconsento', 'Non acconsento']}
        value={(cookieView ? cookies : ivass) ? 'Acconsento' : 'Non acconsento'}
        onChange={(x) => (cookieView ? setCookies(x === 'Acconsento') : setIvass(x === 'Acconsento'))}
      />
    </ProfilePage>
  )
}
