import { useState } from 'react'
import {
  changeCredential,
  credentialError,
  effectiveProfileSignature,
  createProfileMobileCode,
  exportProfileText,
  filterAccesses,
  profileSettingsStore,
  validProfileContact,
  sendProfileAccessHistory,
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
  SettingsSecret,
  SettingsToggle,
  useProfileSettings,
  type SettingsNavigation,
} from './MobileFirstProfileSettingsShared'
import { MOBILE_CODE_RULES, PIN_RULES } from './profileSettingsContent'
import { CardArt } from './MobileFirstCardsPrimitives'
import { ITALY_CARDS } from './cardsContent'
import './mobile-first-cards.css'
import { profileSettingsAssets } from './profileSettingsAssets'

function SecurityAction({
  label,
  edit = false,
  badge,
  active = false,
}: {
  label: string
  edit?: boolean
  badge?: string
  active?: boolean
}) {
  return (
    <span className="mf-settings-security-action">
      <span>
        {label}
        <img src={edit ? profileSettingsAssets.edit : profileSettingsAssets.forth} alt="" />
      </span>
      {badge && <small className={active ? 'is-active' : ''}>{badge}</small>}
    </span>
  )
}

const accessRows = Array.from({ length: 14 }, (_, i) => ({
  id: String(i),
  date: i < 7 ? '2025-01-20' : '2024-12-20',
  time: '15:05:13',
  channel: i % 2 ? 'Web' : 'App',
}))
export default function MobileFirstProfileSettingsSecurity({
  initialFlow,
  onBack,
  onClose,
  onCheckup,
}: { initialFlow?: 'forgot-mobile-code' | 'digital-signature'; onCheckup: () => void } & SettingsNavigation) {
  const storedSettings = useProfileSettings()
  const settings = {
    ...storedSettings,
    signature: effectiveProfileSignature(storedSettings.signature, storedSettings.signatureSuspendedAt),
  }
  const [view, setView] = useState(
      initialFlow === 'forgot-mobile-code'
        ? 'create-contacts'
        : initialFlow === 'digital-signature'
          ? 'signature-menu'
          : 'security',
    ),
    [current, setCurrent] = useState(''),
    [next, setNext] = useState(''),
    [repeat, setRepeat] = useState(''),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState(''),
    [screenshots, setScreenshots] = useState(settings.screenshots)
  const [pending, setPending] = useState<() => void>(() => () => {}),
    [kind, setKind] = useState<'pin' | 'mobile'>('pin'),
    [signatureAction, setSignatureAction] = useState<'Attiva' | 'Sospesa' | 'Revocata'>('Attiva'),
    [cardBlock, setCardBlock] = useState('')
  const [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [channel, setChannel] = useState('Tutti'),
    [filters, setFilters] = useState(false),
    [email, setEmail] = useState(''),
    [phone, setPhone] = useState(''),
    [contact, setContact] = useState<'email' | 'phone'>('email'),
    [verification, setVerification] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', channel: 'Tutti' })
  const [contactReturn, setContactReturn] = useState('create-contacts')
  const [showEmail, setShowEmail] = useState(true)
  const go = (target: string) => {
    setError(null)
    setView(target)
  }
  const back = () => {
    setError(null)
    if (view === 'security') onBack()
    else if (['create-contact', 'contact-code'].includes(view)) go(contactReturn)
    else if (view === 'create-card') go('create-contacts')
    else go('security')
  }
  const finish = (message: string) => {
    setNotice(message)
    go('result')
  }
  const authorize = (action: () => void) => {
    setPending(() => action)
    go('authorize')
  }
  if (view === 'authorize')
    return (
      <SettingsAuthorization
        title="Conferma l’operazione"
        onBack={back}
        onClose={onClose}
        onForgot={() => go('create-contacts')}
        onSuccess={() => pending()}
      />
    )
  if (view === 'result')
    return (
      <SettingsResult
        title={notice}
        description={
          notice.includes('Mobile Code creato')
            ? 'Ti abbiamo inviato al numero di cellulare che hai inserito un SMS con un nuovo Mobile Code. Potrai modificarlo nella sezione Sicurezza. Per rendere la modifica effettiva accedi nuovamente all’App Mobile Banking.'
            : undefined
        }
        onDone={() => go('security')}
        onClose={onClose}
      />
    )
  if (view === 'security')
    return (
      <ProfilePage title="Sicurezza" onBack={onBack} onClose={onClose} className="mf-settings-security-menu">
        <ProfileRow
          label="PIN"
          value={<SecurityAction label="MODIFICA" edit />}
          onClick={() => {
            setKind('pin')
            setCurrent('')
            setNext('')
            setRepeat('')
            go('credential')
          }}
        />
        <ProfileRow label="Mobile Code" value={<SecurityAction label="GESTISCI" />} onClick={() => go('mobile-menu')} />
        <ProfileRow
          label="Screenshot"
          value={
            <SecurityAction
              label="MODIFICA"
              edit
              badge={settings.screenshots ? 'Abilitato' : 'Disabilitato'}
              active={settings.screenshots}
            />
          }
          onClick={() => go('screenshots')}
        />
        <ProfileRow label="Check up sicurezza" value={<SecurityAction label="VISUALIZZA" />} onClick={onCheckup} />
        <ProfileRow
          label="Storico accessi"
          value={<SecurityAction label="VISUALIZZA" />}
          onClick={() => go('history')}
        />
        <ProfileRow
          label="Firma digitale"
          value={
            <SecurityAction label="MODIFICA" edit badge={settings.signature} active={settings.signature === 'Attiva'} />
          }
          onClick={() => go('signature-menu')}
        />
      </ProfilePage>
    )
  if (view === 'mobile-menu')
    return (
      <ProfilePage title="Mobile Code" onBack={back} onClose={onClose}>
        <ProfileRow label="Creazione" onClick={() => go('create-contacts')} />
        <ProfileRow
          label="Modifica"
          onClick={() => {
            setKind('mobile')
            setCurrent('')
            setNext('')
            setRepeat('')
            go('credential')
          }}
        />
      </ProfilePage>
    )
  if (view === 'screenshots')
    return (
      <ProfilePage
        title="Screenshot"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              profileSettingsStore.update({ screenshots })
              finish('Modifiche salvate')
            }}
          >
            Salva le modifiche
          </ProfileButton>
        }
      >
        <p>
          Da questa pagina puoi abilitare o disabilitare gli screenshot delle schermate dell’App sul tuo dispositivo.
        </p>
        <p>
          Ricorda che, abilitando gli screenshot, non sarà possibile oscurare i dati dell’App quando non è in primo
          piano (background).
        </p>
        <SettingsToggle label="Abilita screenshot" checked={screenshots} onChange={setScreenshots} />
      </ProfilePage>
    )
  if (view === 'credential')
    return (
      <ProfilePage
        title={kind === 'pin' ? 'Modifica PIN' : 'Modifica il Mobile Code'}
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!current || !next || !repeat}
            onClick={() => {
              const e = credentialError(kind, current, next, repeat)
              setError(e)
              if (!e) {
                const applyChange = () => {
                  const changeError = changeCredential(kind, current, next, repeat)
                  if (changeError) setError(changeError)
                  else
                    finish(
                      kind === 'pin' ? 'Codice PIN modificato con successo!' : 'Mobile Code modificato con successo!',
                    )
                }
                if (kind === 'pin') authorize(applyChange)
                else applyChange()
              }
            }}
          >
            Salva le modifiche
          </ProfileButton>
        }
      >
        {kind === 'mobile' && (
          <p>Il Mobile Code ti permette di generare password monouso con cui autorizzare le operazioni dall’App.</p>
        )}
        <SettingsSecret
          label={kind === 'pin' ? 'Inserisci PIN attuale' : 'Inserisci attuale Mobile Code'}
          value={current}
          onChange={setCurrent}
        />
        <SettingsSecret
          label={kind === 'pin' ? 'Inserisci nuovo PIN' : 'Inserisci il nuovo Mobile Code'}
          value={next}
          onChange={setNext}
        />
        <SettingsSecret
          label={kind === 'pin' ? 'Conferma il nuovo PIN' : 'Conferma il nuovo Mobile Code'}
          value={repeat}
          onChange={setRepeat}
        />
        <SettingsError error={error} />
        <h3>Il tuo nuovo {kind === 'pin' ? 'PIN' : 'Mobile Code'} deve:</h3>
        <ul>
          {(kind === 'pin' ? PIN_RULES : MOBILE_CODE_RULES).map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </ProfilePage>
    )
  if (view === 'create-contacts')
    return (
      <ProfilePage
        title="Creazione di un nuovo Mobile Code"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!settings.emailVerified || !settings.phoneVerified}
            onClick={() => go('create-card')}
          >
            Conferma
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">1 / 2 · Verifica dati</p>
        <p>Per ricevere il nuovo Mobile Code, verifica o conferma il tuo indirizzo email e il numero di cellulare.</p>
        <ProfileRow
          label="Email"
          detail={settings.emailVerified ? 'Verificato' : 'Da verificare'}
          value={settings.email}
          onClick={() => {
            setContact('email')
            setContactReturn('create-contacts')
            setEmail('')
            go('create-contact')
          }}
        />
        <ProfileRow
          label="Numero di cellulare"
          detail={settings.phoneVerified ? 'Verificato' : 'Da verificare'}
          value={settings.phone}
          onClick={() => {
            setContact('phone')
            setContactReturn('create-contacts')
            setPhone('')
            go('create-contact')
          }}
        />
        <ProfileRow label="Operatore telefonico" value={settings.operator} />
      </ProfilePage>
    )
  if (view === 'create-contact')
    return (
      <ProfilePage
        title={contact === 'email' ? 'Modifica email' : 'Modifica numero di cellulare'}
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const value = contact === 'email' ? email : phone
              const valid = validProfileContact(contact, value)
              setError(valid ? null : 'Inserisci un recapito valido.')
              if (valid) {
                setVerification('')
                go('contact-code')
              }
            }}
          >
            Invia codice di verifica
          </ProfileButton>
        }
      >
        <ProfileField
          label={contact === 'email' ? 'Email' : 'Numero di cellulare'}
          value={contact === 'email' ? email : phone}
          onChange={(e) => (contact === 'email' ? setEmail(e.target.value) : setPhone(e.target.value))}
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'contact-code')
    return (
      <ProfilePage
        title="Verifica recapito"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (verification !== '123456') {
                setError('Il codice di verifica non è corretto.')
                return
              }
              profileSettingsStore.update(
                contact === 'email' ? { email, emailVerified: true } : { phone, phoneVerified: true },
              )
              go(contactReturn)
            }}
          >
            Verifica
          </ProfileButton>
        }
      >
        <p>Inserisci il codice ricevuto sul recapito indicato.</p>
        <ProfileField
          label="Codice di verifica"
          value={verification}
          onChange={(e) => setVerification(e.target.value)}
          inputMode="numeric"
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'create-card')
    return (
      <ProfilePage
        title="Creazione di un nuovo Mobile Code"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const e = createProfileMobileCode(cardBlock)
              setError(e)
              if (!e) finish('Mobile Code creato con successo!')
            }}
          >
            Conferma
          </ProfileButton>
        }
      >
        <p className="mf-settings-step">2 / 2 · Conferma</p>
        <div className="mf-settings-verification-card">
          <CardArt card={{ ...ITALY_CARDS[1]!, name: 'UniCredit Genius Card' }} mini />
        </div>
        <p>Per sicurezza inserisci il penultimo blocco di quattro cifre della tua carta.</p>
        <ProfileField
          label="Penultimo blocco di quattro cifre"
          value={cardBlock}
          onChange={(e) => setCardBlock(e.target.value)}
          inputMode="numeric"
          maxLength={4}
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'signature-menu')
    return (
      <ProfilePage title="Firma digitale" onBack={back} onClose={onClose}>
        <p>
          Stato certificato: <strong>{settings.signature}</strong>
        </p>
        {settings.signature !== 'Attiva' && (
          <ProfileRow
            label={settings.signature === 'Sospesa' ? 'Riattiva' : 'Attiva'}
            onClick={() => {
              setSignatureAction('Attiva')
              go('signature-doc')
            }}
          />
        )}
        {settings.signature === 'Attiva' && (
          <ProfileRow
            label="Sospendi"
            onClick={() => {
              setSignatureAction('Sospesa')
              go('signature-warning')
            }}
          />
        )}
        {['Attiva', 'Sospesa'].includes(settings.signature) && (
          <ProfileRow
            label="Revoca"
            onClick={() => {
              setSignatureAction('Revocata')
              go('signature-warning')
            }}
          />
        )}
      </ProfilePage>
    )
  if (view === 'signature-doc')
    return (
      <SettingsDocument
        title="Richiesta di certificato per la firma digitale"
        body="L’emissione del certificato è gratuita ed è regolata dal Manuale Operativo del certificatore In.Te.S.A. S.p.A. UniCredit comunica nome, cognome, codice fiscale e data di nascita al certificatore, che li tratta come titolare autonomo. Ho preso visione del Manuale Operativo e richiedo la Firma Digitale."
        onBack={back}
        onClose={onClose}
        onAccept={() =>
          authorize(() => {
            transitionProfileSignature('Attiva')
            finish('Certificato attivato correttamente!')
          })
        }
      />
    )
  if (view === 'signature-warning')
    return (
      <ProfilePage
        title={
          signatureAction === 'Sospesa'
            ? 'Sei sicuro di voler sospendere il certificato di Firma digitale?'
            : 'Sei sicuro di voler revocare il certificato di Firma digitale?'
        }
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() =>
              authorize(() => {
                transitionProfileSignature(signatureAction)
                finish(
                  signatureAction === 'Sospesa'
                    ? 'Certificato sospeso correttamente'
                    : 'Certificato revocato correttamente',
                )
              })
            }
          >
            {signatureAction === 'Sospesa' ? 'Sospendi' : 'Revoca'}
          </ProfileButton>
        }
      >
        <p>Le firme già apposte rimangono valide e i documenti sono conservati dalla banca e dal certificatore.</p>
        <p>
          {signatureAction === 'Sospesa'
            ? 'Prima di firmare nuovi documenti dovrai riattivare il certificato. Se non lo riattivi entro 90 giorni, il certificato sarà revocato.'
            : 'Per firmare nuovi documenti sarà necessario richiedere un nuovo certificato.'}
        </p>
        <ProfileButton secondary onClick={back}>
          Annulla
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'history-filter')
    return (
      <ProfilePage
        title="Filtri storico accessi"
        onBack={() => go('history')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (from && to && from > to) {
                setError('La data iniziale deve precedere la data finale.')
                return
              }
              setFilters(true)
              setAppliedFilters({ from, to, channel })
              go('history')
            }}
          >
            Applica filtri
          </ProfileButton>
        }
      >
        <ProfileField label="Dal" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <ProfileField label="Al" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <SettingsChoice label="Canale" options={['Tutti', 'App', 'Web']} value={channel} onChange={setChannel} />
        <SettingsError error={error} />
        <ProfileButton
          secondary
          onClick={() => {
            setFrom('')
            setTo('')
            setChannel('Tutti')
            setFilters(false)
            setAppliedFilters({ from: '', to: '', channel: 'Tutti' })
            go('history')
          }}
        >
          Rimuovi filtri
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'history-send')
    return (
      <ProfilePage
        title="Invia storico via email"
        onBack={() => go('history')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const error = sendProfileAccessHistory(
                settings.email,
                filterAccesses(accessRows, appliedFilters.from, appliedFilters.to, appliedFilters.channel).length,
              )
              if (error) setError(error)
              else finish('Storico accessi inviato con successo!')
            }}
          >
            Invia storico
          </ProfileButton>
        }
      >
        <ProfileRow
          label={
            <span className="mf-settings-email-label">
              Email
              <button
                type="button"
                aria-label={showEmail ? 'Nascondi email' : 'Mostra email'}
                onClick={() => setShowEmail(!showEmail)}
              >
                <img src={profileSettingsAssets.emailEye} alt="" />
              </button>
            </span>
          }
          detail={showEmail ? settings.email : '••••••'}
          value={
            <button
              type="button"
              className="mf-settings-inline-action"
              onClick={() => {
                setContactReturn('history-send')
                setContact('email')
                setEmail('')
                setVerification('')
                go('create-contact')
              }}
            >
              <SecurityAction
                label="MODIFICA"
                edit
                badge={settings.emailVerified ? 'Verificato' : 'Da verificare'}
                active={settings.emailVerified}
              />
            </button>
          }
        />
        <SettingsError error={error} />
        <ProfileButton
          secondary
          onClick={() =>
            exportProfileText(
              'storico-accessi.txt',
              filterAccesses(accessRows, appliedFilters.from, appliedFilters.to, appliedFilters.channel)
                .map((x) => x.date + ' ' + x.time + ' ' + x.channel)
                .join('\n'),
            )
          }
        >
          Scarica storico
        </ProfileButton>
      </ProfilePage>
    )
  const accesses = filterAccesses(accessRows, appliedFilters.from, appliedFilters.to, appliedFilters.channel)
  return (
    <ProfilePage
      title={filters ? 'Risultati di ricerca' : 'Storico accessi'}
      onBack={back}
      onClose={onClose}
      description="Da questa pagina puoi visualizzare l’elenco degli accessi al servizio di Banca Multicanale."
      footer={<ProfileButton onClick={() => go('history-send')}>Invia storico</ProfileButton>}
    >
      <ProfileButton
        secondary
        onClick={() => {
          setFrom(appliedFilters.from)
          setTo(appliedFilters.to)
          setChannel(appliedFilters.channel)
          go('history-filter')
        }}
      >
        Filtra accessi
      </ProfileButton>
      {filters && (
        <p>
          Filtri applicati: {appliedFilters.from || 'Inizio'} - {appliedFilters.to || 'Oggi'} · {appliedFilters.channel}
        </p>
      )}
      {accesses.map((x) => (
        <ProfileRow key={x.id} label={x.channel} detail={x.date + ' - ' + x.time} />
      ))}
      {!accesses.length && <p>Nessun accesso nel periodo selezionato.</p>}
    </ProfilePage>
  )
}
