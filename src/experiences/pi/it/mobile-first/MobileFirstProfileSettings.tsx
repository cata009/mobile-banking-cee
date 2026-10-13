import { useState } from 'react'
import {
  deviceDeactivationError,
  profileSettingsStore,
  validProfileContact,
  securityLevel,
} from '@/features/profile/mobileFirstProfileSettings'
import { ProfileButton, ProfileField, ProfileRow } from './MobileFirstProfilePrimitives'
import { SettingsPage as ProfilePage } from './MobileFirstProfileSettingsShared'
import {
  SettingsChoice,
  SettingsError,
  SettingsResult,
  SettingsToggle,
  useProfileSettings,
} from './MobileFirstProfileSettingsShared'
import MobileFirstProfileSettingsSecurity from './MobileFirstProfileSettingsSecurity'
import MobileFirstProfileSettingsBank from './MobileFirstProfileSettingsBank'
import MobileFirstProfileSettingsCommunications from './MobileFirstProfileSettingsCommunications'
import { SECURITY_ARTICLES, SECURITY_MISSIONS, SETTINGS_MENU } from './profileSettingsContent'
import { profileSettingsAssets } from './profileSettingsAssets'
import './mobile-first-profile-settings.css'

export default function MobileFirstProfileSettings({
  entry = 'settings',
  initialFlow,
  onBack,
  onClose,
  onNavigate,
  onHome,
}: {
  entry?: 'settings' | 'security'
  initialFlow?: 'forgot-mobile-code' | 'digital-signature'
  onBack: () => void
  onClose: () => void
  onNavigate?: (target: string) => void
  onHome?: () => void
}) {
  const settings = useProfileSettings()
  const [view, setView] = useState(initialFlow ? 'security' : entry === 'security' ? 'checkup' : 'settings')
  const [securityStart, setSecurityStart] = useState(initialFlow)
  const [checkupReturn, setCheckupReturn] = useState('settings')
  const [language, setLanguage] = useState(settings.language),
    [preferred, setPreferred] = useState<string>(settings.preferredProfile),
    [size, setSize] = useState(settings.textSize),
    [location, setLocation] = useState(settings.location),
    [ip, setIp] = useState(settings.ipService),
    [bio, setBio] = useState(settings.biometric)
  const [selected, setSelected] = useState('iphone'),
    [tax, setTax] = useState(''),
    [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState(''),
    [mission, setMission] = useState('device'),
    [article, setArticle] = useState('phishing')
  const [missionContact, setMissionContact] = useState('')
  const [missionCode, setMissionCode] = useState('')
  const back = () => {
    setError(null)
    setNotice('')
    if (['language', 'preference', 'location'].includes(view)) setView('general')
    else if (['device', 'deactivate', 'device-confirm', 'shared-info'].includes(view)) setView('devices')
    else if (['levels', 'missions', 'article', 'articles', 'mission'].includes(view)) setView('checkup')
    else if (view === 'settings') onBack()
    else if (view === 'checkup' && entry === 'security') onBack()
    else if (view === 'checkup') setView(checkupReturn)
    else setView('settings')
  }
  const done = (message: string) => {
    setNotice(message)
    setView('result')
  }
  if (['security'].includes(view))
    return (
      <MobileFirstProfileSettingsSecurity
        initialFlow={securityStart}
        onBack={() => {
          setSecurityStart(undefined)
          setView('settings')
        }}
        onClose={onClose}
        onCheckup={() => {
          setSecurityStart(undefined)
          setCheckupReturn('security')
          setView('checkup')
        }}
      />
    )
  if (['limits', 'quick', 'third-party', 'withdrawal'].includes(view))
    return <MobileFirstProfileSettingsBank section={view} onBack={() => setView('settings')} onClose={onClose} />
  if (['notifications', 'newsletter', 'privacy'].includes(view))
    return (
      <MobileFirstProfileSettingsCommunications
        section={view}
        onBack={() => setView('settings')}
        onClose={onClose}
        onNavigate={onNavigate}
        onHome={onHome}
      />
    )
  if (view === 'result') return <SettingsResult title={notice} onClose={onClose} onDone={() => setView('settings')} />
  if (view === 'settings')
    return (
      <ProfilePage title="Impostazioni" onBack={onBack} onClose={onClose} className="mf-settings-menu">
        {SETTINGS_MENU.map((group) => (
          <section className="mf-settings-menu-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.rows.map(([label, target]) => (
              <ProfileRow
                key={target}
                label={label}
                icon={profileSettingsAssets[target]}
                onClick={() => setView(target)}
              />
            ))}
          </section>
        ))}
      </ProfilePage>
    )
  if (view === 'general')
    return (
      <ProfilePage
        title="Generali"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              profileSettingsStore.update({ textSize: size })
              done('Modifiche salvate')
            }}
          >
            Salva modifiche
          </ProfileButton>
        }
      >
        <ProfileRow
          label="Preferenza profilo"
          value={settings.preferredProfile}
          onClick={() => setView('preference')}
        />
        <ProfileRow label="Lingua" value={settings.language} onClick={() => setView('language')} />
        <ProfileRow label="Geolocalizzazione" onClick={() => setView('location')} />
        <SettingsToggle label="Ridimensionamento testo" checked={size} onChange={setSize} />
        <p>Adatta la dimensione dei testi alle tue preferenze.</p>
      </ProfilePage>
    )
  if (view === 'language')
    return (
      <ProfilePage
        title="Cambio lingua"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              profileSettingsStore.update({ language })
              done('Lingua modificata')
            }}
          >
            Salva modifiche
          </ProfileButton>
        }
      >
        <SettingsChoice
          label="Lingua"
          options={['Italiano', 'English', 'Deutsch']}
          value={language}
          onChange={setLanguage}
        />
      </ProfilePage>
    )
  if (view === 'preference')
    return (
      <ProfilePage
        title="Preferenza profilo"
        onBack={back}
        onClose={onClose}
        description="Scegli quale profilo vuoi visualizzare quando apri l’App. Vedrai il profilo scelto nella pagina di accesso e nella Home."
        footer={
          <ProfileButton
            onClick={() => {
              profileSettingsStore.update({ preferredProfile: preferred as 'UniCredit' | 'buddy' })
              done('Hai cambiato il tuo profilo preferito in ' + preferred)
            }}
          >
            Salva modifiche
          </ProfileButton>
        }
      >
        <SettingsChoice
          label="Profilo preferito"
          options={['UniCredit', 'buddy']}
          value={preferred}
          onChange={setPreferred}
        />
        <p>Potrai sempre navigare tra un profilo e l’altro o modificare la tua scelta in seguito.</p>
      </ProfilePage>
    )
  if (view === 'location')
    return (
      <ProfilePage
        title="Servizi geolocalizzazione"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              profileSettingsStore.update({ location, ipService: ip })
              done('Preferenze geolocalizzazione aggiornate')
            }}
          >
            Conferma
          </ProfileButton>
        }
      >
        <SettingsToggle label="Geolocalizzazione" checked={location} onChange={setLocation} />
        <SettingsToggle label="Rifornimento IP" checked={ip} onChange={setIp} />
        <p>Gestisci i servizi di geolocalizzazione del tuo dispositivo.</p>
      </ProfilePage>
    )
  if (view === 'face-id')
    return (
      <ProfilePage
        title="Face ID"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              profileSettingsStore.update({ biometric: bio })
              done(bio ? 'Face ID abilitato' : 'Face ID disabilitato')
            }}
          >
            Salva modifiche
          </ProfileButton>
        }
      >
        <SettingsToggle label="Abilita Face ID" checked={bio} onChange={setBio} />
        <p>Accedi e autorizza le operazioni con il riconoscimento biometrico.</p>
      </ProfilePage>
    )
  if (view === 'devices')
    return (
      <ProfilePage
        title="Dispositivi"
        onBack={back}
        onClose={onClose}
        footer={
          settings.devices.length > 0 ? (
            <ProfileButton onClick={() => setView(settings.sharedClient ? 'device-confirm' : 'deactivate')}>
              Disattiva tutti i dispositivi
            </ProfileButton>
          ) : undefined
        }
      >
        {settings.sharedClient && (
          <ProfileRow
            label="Utente condiviso"
            detail="Il tuo dispositivo è condiviso tra i profili."
            onClick={() => setView('shared-info')}
          />
        )}
        <h2>Dispositivo principale</h2>
        {settings.devices
          .filter((d) => d.primary)
          .map((d) => (
            <ProfileRow
              key={d.id}
              label={d.name}
              onClick={() => {
                setSelected(d.id)
                setView('device')
              }}
            />
          ))}
        <h2>Altri dispositivi attivi</h2>
        {settings.devices
          .filter((d) => !d.primary)
          .map((d) => (
            <ProfileRow
              key={d.id}
              label={d.name}
              detail="Dispositivo secondario"
              onClick={() => {
                setSelected(d.id)
                setView('device')
              }}
            />
          ))}
        {!settings.devices.length && (
          <p>Nessun dispositivo attivo. Per accedere all’app sarà necessaria una nuova registrazione.</p>
        )}
      </ProfilePage>
    )
  if (view === 'shared-info')
    return (
      <ProfilePage title="Utente condiviso" onBack={back} onClose={onClose}>
        <p>
          Se sei un cliente buddy - UniCredit il tuo dispositivo è condiviso tra i profili. Potrai impostare un solo
          dispositivo principale e un solo dispositivo secondario per entrambi i profili. Se disattivi i dispositivi, la
          scelta sarà valida anche per il tuo profilo UniCredit.
        </p>
      </ProfilePage>
    )
  if (view === 'device') {
    const device = settings.devices.find((d) => d.id === selected)
    return (
      <ProfilePage title={device?.name ?? 'Dispositivo'} onBack={back} onClose={onClose}>
        <ProfileRow label="Marca e sistema operativo" value={device?.id === 'office' ? 'Windows' : 'Apple - iOS'} />
        {['Data di registrazione', 'Ultimo accesso', 'Ultima autorizzazione'].map((x) => (
          <ProfileRow key={x} label={x} value="20/01/2025 - 15:05" />
        ))}
        <ProfileRow
          label="Tipologia di dispositivo"
          value={device?.primary ? 'Dispositivo principale' : 'Dispositivo secondario'}
        />
      </ProfilePage>
    )
  }
  if (view === 'deactivate' || view === 'device-confirm')
    return (
      <ProfilePage
        title="Disattiva tutti i dispositivi"
        onBack={back}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (view === 'device-confirm') {
                profileSettingsStore.update({ devices: [] })
                done('Dispositivi disattivati')
                return
              }
              const e = deviceDeactivationError(tax)
              setError(e)
              if (!e) setView('device-confirm')
            }}
          >
            {view === 'device-confirm' ? 'Disattiva' : 'Conferma'}
          </ProfileButton>
        }
      >
        <p>
          Per completare la disattivazione dell’app da tutti i tuoi dispositivi, inserisci il tuo codice fiscale. Non
          potrai più accedere senza una nuova registrazione.
        </p>
        {view === 'deactivate' ? (
          <>
            <ProfileField label="Inserisci codice fiscale" value={tax} onChange={(e) => setTax(e.target.value)} />
            <SettingsError error={error} />
          </>
        ) : (
          <>
            <h2>Sei sicuro di voler disattivare l’app per tutti i dispositivi?</h2>
            {settings.sharedClient && <p>La scelta sarà valida per il profilo buddy e UniCredit.</p>}
            <ProfileButton secondary onClick={back}>
              Annulla
            </ProfileButton>
          </>
        )}
      </ProfilePage>
    )
  if (view === 'levels')
    return (
      <ProfilePage
        title="Livelli"
        onBack={back}
        onClose={onClose}
        description="Il livello del profilo di sicurezza si basa sull’analisi di alcuni parametri e impostazioni dello smartphone in uso. Le missioni suggeriscono comportamenti per ridurre i rischi."
      >
        {[
          ['basso', 'Il tuo smartphone presenta elementi che potrebbero esporti ad un rischio.'],
          ['medio', 'Segui i task suggeriti per ridurre i rischi associati al tuo device.'],
          ['alto', 'Sei sulla buona strada, ma non abbassare mai la guardia.'],
        ].map(([level, text]) => (
          <section key={level} className="mf-settings-card">
            <h2>Livello {level}</h2>
            <p>{text}</p>
            <span>
              {securityLevel(settings.missions).toLowerCase() === level ? 'Livello attuale' : 'Completa le missioni'}
            </span>
          </section>
        ))}
      </ProfilePage>
    )
  if (view === 'missions')
    return (
      <ProfilePage
        title="Missioni"
        onBack={back}
        onClose={onClose}
        description="Completa le missioni e passa di livello."
      >
        {SECURITY_MISSIONS.map(([id, title, text]) => (
          <ProfileRow
            key={id}
            label={title}
            detail={text}
            value={settings.missions.includes(id) ? 'Completato' : undefined}
            onClick={() => {
              setMission(id)
              setView('mission')
            }}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'mission') {
    const data = SECURITY_MISSIONS.find((x) => x[0] === mission)!
    return (
      <ProfilePage
        title={data[1]}
        onBack={() => setView('missions')}
        onClose={onClose}
        footer={
          ['email', 'phone'].includes(mission) ? (
            <ProfileButton
              onClick={() => {
                setMissionContact('')
                setMissionCode('')
                setView('mission-contact')
              }}
            >
              Verifica recapito
            </ProfileButton>
          ) : mission === 'knowledge' ? (
            <ProfileButton
              onClick={() => {
                setArticle('phishing')
                setView('article')
              }}
            >
              Consulta la pagina Sicurezza
            </ProfileButton>
          ) : undefined
        }
      >
        <p>{data[2]}</p>
        {['email', 'phone'].includes(mission) && (
          <ProfileRow
            label={mission === 'email' ? 'Email' : 'Numero di telefono'}
            value={mission === 'email' ? settings.email : settings.phone}
            detail={
              (mission === 'email' ? settings.emailVerified : settings.phoneVerified) ? 'Verificato' : 'Da verificare'
            }
          />
        )}
      </ProfilePage>
    )
  }
  if (view === 'mission-contact')
    return (
      <ProfilePage
        title={mission === 'email' ? 'Verifica la tua email' : 'Verifica il tuo numero di telefono'}
        onBack={() => setView('mission')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              const valid = validProfileContact(mission === 'email' ? 'email' : 'phone', missionContact)
              if (!valid) {
                setError('Inserisci un recapito valido.')
                return
              }
              setError(null)
              setView('mission-contact-code')
            }}
          >
            Invia codice di verifica
          </ProfileButton>
        }
      >
        <ProfileField
          label={mission === 'email' ? 'Email' : 'Numero di telefono'}
          value={missionContact}
          onChange={(e) => setMissionContact(e.target.value)}
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'mission-contact-code')
    return (
      <ProfilePage
        title="Verifica recapito"
        onBack={() => setView('mission-contact')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (missionCode !== '123456') {
                setError('Il codice non è corretto. Riprova.')
                return
              }
              profileSettingsStore.update({
                ...(mission === 'email'
                  ? { email: missionContact, emailVerified: true }
                  : { phone: missionContact, phoneVerified: true }),
                missions: [...new Set([...settings.missions, mission])],
              })
              setError(null)
              setView('missions')
            }}
          >
            Conferma
          </ProfileButton>
        }
      >
        <p>Inserisci il codice ricevuto sul recapito indicato.</p>
        <ProfileField
          label="Codice di verifica"
          inputMode="numeric"
          value={missionCode}
          onChange={(e) => setMissionCode(e.target.value)}
        />
        <SettingsError error={error} />
      </ProfilePage>
    )
  if (view === 'article') {
    const item = SECURITY_ARTICLES.find((x) => x.id === article)!
    return (
      <ProfilePage title={item.title} onBack={back} onClose={onClose} className="mf-settings-education">
        <h2>{article === 'phishing' ? 'Cos’è il phishing?' : 'Pillole di sicurezza'}</h2>
        <p>{item.text}</p>
        <h2>Attenzione!</h2>
        <p>{item.tip}</p>
        <ProfileButton
          secondary
          onClick={() => {
            profileSettingsStore.update({ missions: [...new Set([...settings.missions, 'knowledge'])] })
            setView('articles')
          }}
        >
          Scopri di più
        </ProfileButton>
      </ProfilePage>
    )
  }
  if (view === 'articles')
    return (
      <ProfilePage title="Pillole di sicurezza" onBack={back} onClose={onClose}>
        {SECURITY_ARTICLES.map((item) => (
          <ProfileRow
            key={item.id}
            label={item.title}
            onClick={() => {
              setArticle(item.id)
              setView('article')
            }}
          />
        ))}
      </ProfilePage>
    )
  return (
    <ProfilePage
      title="Fai il Check-up della tua sicurezza"
      onBack={back}
      onClose={onClose}
      className="mf-settings-checkup"
    >
      <p>
        Il livello di protezione è: <strong>{securityLevel(settings.missions)}.</strong>
        <br />
        Scopri come migliorarlo
      </p>
      <ProfileButton secondary onClick={() => setView('levels')}>
        Scopri i livelli
        <img src={profileSettingsAssets.forth} alt="" />
      </ProfileButton>
      <h2>Missioni</h2>
      <p>Completa le missioni e passa di livello</p>
      {SECURITY_MISSIONS.filter((x) => !settings.missions.includes(x[0]))
        .slice(0, 2)
        .map(([id, title, text]) => (
          <button
            key={id}
            type="button"
            className="mf-settings-card"
            onClick={() => {
              setMission(id)
              setView('mission')
            }}
          >
            <strong>{title}</strong>
            <p>{text}</p>
          </button>
        ))}
      <ProfileButton secondary onClick={() => setView('missions')}>
        Scopri tutte le missioni
        <img src={profileSettingsAssets.forth} alt="" />
      </ProfileButton>
      <h2>Pillole di sicurezza</h2>
      <p>Segui le pillole e rendi più sicura la tua app</p>
      <div className="mf-settings-articles">
        {SECURITY_ARTICLES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setArticle(item.id)
              setView('article')
            }}
          >
            <img src={profileSettingsAssets[item.id]} alt="" />
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>
      <ProfileButton
        secondary
        onClick={() => {
          setView('articles')
        }}
      >
        Scopri tutte le pillole di sicurezza
        <img src={profileSettingsAssets.forth} alt="" />
      </ProfileButton>
    </ProfilePage>
  )
}
