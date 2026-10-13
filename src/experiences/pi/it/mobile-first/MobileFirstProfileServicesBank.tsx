import { useState, useSyncExternalStore } from 'react'
import {
  appointmentErrors,
  profileServicesStore,
  serviceBranchAvailability,
  bookServiceAppointment,
  cancelServiceAppointment,
  canManageServiceAppointment,
  dateLabel,
  type AppointmentDraft,
  type ServiceAppointment,
} from '../../../../features/profile/mobileFirstProfileServices'
import { ProfileButton, ProfileField, ProfilePage, ProfileRow, ProfileTabs } from './MobileFirstProfilePrimitives'
import {
  ServiceFact,
  ServiceQuickAction,
  ServiceSelect,
  ServiceSuccess,
  ServiceTextAction,
  downloadServicePdf,
} from './MobileFirstProfileServicesElements'
import {
  appointmentCategories,
  appointmentDates,
  appointmentPurposes,
  appointmentSlots,
  profileBranches,
} from './profileServicesContent'
import { profileServicesAssets as a } from './profileServicesAssets'
import type { ProfileAdvisorKind } from './MobileFirstProfileServices'
import MobileFirstKeyboard from './MobileFirstKeyboard'

type BankView =
  | 'home'
  | 'advisor'
  | 'branch'
  | 'booking'
  | 'slots'
  | 'booked'
  | 'appointment'
  | 'manage'
  | 'cancel'
  | 'phone'
  | 'email'
  | 'chat'
  | 'notes'
const emptyDraft: AppointmentDraft = { branch: '', category: '', purpose: '', date: '', time: '', notes: '' }
export default function MobileFirstProfileServicesBank({
  initialBooking = false,
  advisorKind,
  onBack,
  onClose,
}: {
  initialBooking?: boolean
  advisorKind: ProfileAdvisorKind
  onBack: () => void
  onClose: () => void
}) {
  const [view, setView] = useState<BankView>(initialBooking ? 'booking' : 'home')
  const [tab, setTab] = useState('Il tuo consulente')
  const [branchName, setBranchName] = useState('Milano Garibaldi')
  const [draft, setDraft] = useState<AppointmentDraft>(emptyDraft)
  const { appointments } = useSyncExternalStore(profileServicesStore.subscribe, profileServicesStore.getSnapshot)
  const setAppointments = (updater: (current: ServiceAppointment[]) => ServiceAppointment[]) =>
    profileServicesStore.update('appointments', updater)
  const [selectedId, setSelectedId] = useState('')
  const [editing, setEditing] = useState(false)
  const [moreBranches, setMoreBranches] = useState(false)
  const [noteKeyboard, setNoteKeyboard] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [contactReturn, setContactReturn] = useState<BankView>('branch')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [mailSubject, setMailSubject] = useState('')
  const [mailBody, setMailBody] = useState('')
  const [chatText, setChatText] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const branch = profileBranches.find((item) => item.name === branchName) ?? profileBranches[0]
  const selected = appointments.find((item) => item.id === selectedId)
  const advisorName = advisorKind === 'cfe' ? 'Giulio Celentano' : 'Mario Bianchi'
  const advisorRole =
    advisorKind === 'cfe' ? 'Consulente patrimoniale' : advisorKind === 'private' ? 'Private Banker' : 'Consulente'
  const update = (key: keyof AppointmentDraft, value: string) => {
    setError('')
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === 'category'
        ? { purpose: '', date: '', time: '' }
        : key === 'purpose' || key === 'branch'
          ? { date: '', time: '' }
          : {}),
    }))
  }
  const startBooking = (name = '') => {
    setDraft({ ...emptyDraft, branch: name })
    setEditing(false)
    setError('')
    setView('booking')
  }
  const contactTo = (kind: 'phone' | 'email', value: string, from: BankView) => {
    setContact(value)
    setContactReturn(from)
    setPhone('')
    setNotice('')
    setView(kind)
  }
  const home = () => {
    setView('home')
    setTab('Appuntamenti')
  }
  const book = () => {
    const errors = appointmentErrors(draft)
    if (errors.length) {
      setError(errors.join(' '))
      return
    }
    const id = editing ? selectedId : `appointment-${appointments.length + 1}`
    const booking = bookServiceAppointment(draft, id)
    setAppointments((current) =>
      editing ? current.map((item) => (item.id === id ? booking : item)) : [booking, ...current],
    )
    setSelectedId(id)
    setView('booked')
  }
  const appointmentDetails = (item: ServiceAppointment) => (
    <>
      <ServiceFact label="Stato">{item.status}</ServiceFact>
      <ServiceFact label="Filiale">{item.branch}</ServiceFact>
      <ServiceFact label="Indirizzo">
        {profileBranches.find((branch) => branch.name === item.branch)?.address}
      </ServiceFact>
      <ServiceFact label="Data e ora">
        {dateLabel(item.date)} - {item.time}
      </ServiceFact>
      <ServiceFact label="Scopo dell’appuntamento">{item.purpose}</ServiceFact>
      {item.notes && <ServiceFact label="Note">{item.notes}</ServiceFact>}
    </>
  )
  if (view === 'notes')
    return (
      <ProfilePage
        className="mf-services mf-services-notes"
        title="Note"
        onBack={() => setView('booking')}
        onClose={onClose}
        footer={
          noteKeyboard ? (
            <MobileFirstKeyboard
              pressedKey={null}
              onKey={(key) => {
                if (key === 'Enter') setNoteKeyboard(false)
                else
                  update('notes', key === 'Backspace' ? draft.notes.slice(0, -1) : `${draft.notes}${key}`.slice(0, 150))
              }}
            />
          ) : (
            <ProfileButton onClick={() => setView('booking')}>Conferma</ProfileButton>
          )
        }
      >
        <label className="mf-profile-field">
          <span>Note</span>
          <textarea
            aria-label="Modifica nota"
            maxLength={150}
            value={draft.notes}
            onChange={(event) => update('notes', event.target.value)}
            onFocus={() => setNoteKeyboard(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                setNoteKeyboard(false)
              }
            }}
            placeholder="Scrivi qui una nota..."
          />
        </label>
        <p>Massimo 150 caratteri</p>
        <ServiceTextAction onClick={() => setNoteKeyboard(false)}>Fine inserimento</ServiceTextAction>
      </ProfilePage>
    )
  if (view === 'slots')
    return (
      <ProfilePage
        className="mf-services"
        title="Seleziona il giorno e l’orario"
        onBack={() => setView('booking')}
        onClose={onClose}
        footer={
          <ProfileButton disabled={!draft.date || !draft.time} onClick={() => setView('booking')}>
            Conferma
          </ProfileButton>
        }
      >
        <h2>Data</h2>
        <div className="mf-services-dates">
          {appointmentDates.map(([label, date]) => (
            <button
              type="button"
              key={date}
              disabled={date === '2025-03-09'}
              aria-pressed={draft.date === date}
              onClick={() => {
                setDraft((current) => ({ ...current, date, time: '' }))
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <h2>Ora</h2>
        <div className="mf-services-slots">
          {appointmentSlots.map((time) => (
            <button
              type="button"
              disabled={!draft.date}
              aria-pressed={draft.time === time}
              key={time}
              onClick={() => setDraft((current) => ({ ...current, time }))}
            >
              {time}
            </button>
          ))}
        </div>
      </ProfilePage>
    )
  if (view === 'booking')
    return (
      <ProfilePage
        className="mf-services"
        title="Fissa un appuntamento in Filiale"
        onBack={initialBooking && !editing ? onBack : home}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!draft.branch || !draft.category || !draft.purpose || !draft.date || !draft.time}
            onClick={book}
          >
            Continua
          </ProfileButton>
        }
      >
        <ServiceSelect
          label="Seleziona la filiale"
          placeholder="Seleziona filiale"
          value={draft.branch}
          options={profileBranches.map((item) => item.name)}
          onChange={(value) => update('branch', value)}
        />
        {draft.branch && <small>{profileBranches.find((item) => item.name === draft.branch)?.address}</small>}
        <ServiceSelect
          label="Seleziona la categoria dell’appuntamento"
          placeholder="Categoria"
          value={draft.category}
          options={appointmentCategories}
          onChange={(value) => update('category', value)}
        />
        {draft.category && (
          <ServiceSelect
            label="Seleziona lo scopo dell’appuntamento"
            value={draft.purpose}
            options={appointmentPurposes}
            onChange={(value) => update('purpose', value)}
          />
        )}
        {draft.purpose && (
          <>
            {serviceBranchAvailability(draft.branch) ? (
              <>
                <ServiceTextAction onClick={() => setView('slots')}>Seleziona il giorno e l’orario</ServiceTextAction>
                <div className="mf-services-slot-summary">
                  {draft.date ? `${dateLabel(draft.date)} - ${draft.time}` : 'gg/mm/aaaa - 00:00'}
                </div>
              </>
            ) : (
              <div className="mf-services-error">
                <strong>Filiale non disponibile</strong>
                <p>
                  La filiale prescelta non ha disponibilità nei prossimi giorni per questo tipo di operazioni, te ne
                  proponiamo di seguito altre disponibili. In alternativa ti invitiamo a contattare il servizio cliente.
                </p>
              </div>
            )}
            <section className="mf-services-section">
              <h2>Altre filiali</h2>
              <p>
                Se non trovi un orario soddisfacente prova a consultare la disponibilità di una delle filiali limitrofe.
              </p>
              {profileBranches.slice(2, moreBranches ? undefined : 6).map((item, index) => (
                <button
                  className="mf-services-branch-choice"
                  type="button"
                  key={item.name}
                  onClick={() => update('branch', item.name)}
                >
                  <strong>{item.name}</strong>
                  <small>Prima disponibilità: GIO 6 Marzo, 11.30</small>
                  <small>{index === 0 ? '80 m' : `${(index + 1) * 4} Km`}</small>
                </button>
              ))}
              <ServiceTextAction onClick={() => setMoreBranches((value) => !value)}>
                {moreBranches ? 'Mostra meno filiali' : 'Mostra altre filiali'}
              </ServiceTextAction>
            </section>
            <label className="mf-profile-field">
              <span>Campo note{draft.category === 'Altre operazioni' ? ' *' : ''}</span>
              <textarea
                aria-label="Note"
                maxLength={150}
                value={draft.notes}
                onChange={(event) => update('notes', event.target.value)}
                placeholder="Scrivi qui una nota..."
              />
              <small>{150 - draft.notes.length} caratteri rimanenti</small>
            </label>
            <ServiceTextAction
              onClick={() => {
                setNoteKeyboard(true)
                setView('notes')
              }}
            >
              Modifica nota
            </ServiceTextAction>
          </>
        )}
        {error && (
          <div role="alert" className="mf-services-error">
            <strong>Dati mancanti</strong>
            <p>{error}</p>
          </div>
        )}
      </ProfilePage>
    )
  if (view === 'booked' && selected)
    return (
      <ServiceSuccess
        title="L’appuntamento è stato confermato"
        description="Riceverai anche una email all’indirizzo indicato. Conservala e mostrala in filiale in caso di necessità."
        onBack={home}
        onClose={onClose}
        footer={
          <>
            <ProfileButton
              secondary
              onClick={() => {
                downloadServicePdf('Riepilogo appuntamento', [
                  selected.branch,
                  `${dateLabel(selected.date)} - ${selected.time}`,
                  selected.purpose,
                  selected.notes,
                ])
                setNotice('Riepilogo PDF scaricato per la condivisione.')
              }}
            >
              Condividi
            </ProfileButton>
            <ProfileButton secondary onClick={home}>
              Vedi appuntamenti
            </ProfileButton>
          </>
        }
      >
        {appointmentDetails(selected)}
        <ServiceFact label="Indirizzo email">andrea.rossini@gmail.com</ServiceFact>
        <ServiceFact label="Cognome e nome">Andrea Rossini</ServiceFact>
        {notice && <p role="status">{notice}</p>}
      </ServiceSuccess>
    )
  if (view === 'appointment' && selected)
    return (
      <ProfilePage
        className="mf-services"
        title="Appuntamento in filiale"
        onBack={home}
        onClose={onClose}
        footer={
          canManageServiceAppointment(selected) ? (
            <ProfileButton onClick={() => setView('manage')}>Modifica o cancella</ProfileButton>
          ) : undefined
        }
      >
        {appointmentDetails(selected)}
        {selected.status === 'Da eseguire' && (
          <>
            <ServiceFact label="Riferimento">Enrico Laverenir</ServiceFact>
            <p>
              Se vuoi modificare o cancellare l’appuntamento, seleziona il tasto “modifica o cancella” entro le 24 ore
              precedenti. ARN: SA-27125011. PNR: d531cbaff3.
            </p>
          </>
        )}
      </ProfilePage>
    )
  if (view === 'manage' && selected)
    return (
      <ProfilePage
        className="mf-services"
        title="Modifica o cancella"
        onBack={() => setView('appointment')}
        onClose={onClose}
      >
        {appointmentDetails(selected)}
        <p>Puoi modificare o cancellare l’appuntamento fino a 24 ore prima.</p>
        <ProfileButton
          onClick={() => {
            setDraft(selected)
            setEditing(true)
            setView('booking')
          }}
        >
          Modifica appuntamento
        </ProfileButton>
        <ProfileButton secondary onClick={() => setView('cancel')}>
          Cancella appuntamento
        </ProfileButton>
      </ProfilePage>
    )
  if (view === 'cancel' && selected)
    return (
      <ProfilePage
        className="mf-services"
        title="Cancella appuntamento"
        onBack={() => setView('manage')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton
              onClick={() => {
                setAppointments((current) => cancelServiceAppointment(current, selected.id))
                setView('appointment')
              }}
            >
              Conferma cancellazione
            </ProfileButton>
            <ProfileButton secondary onClick={() => setView('manage')}>
              Annulla
            </ProfileButton>
          </>
        }
      >
        <p>
          Vuoi cancellare il tuo appuntamento del {dateLabel(selected.date)} alle {selected.time}?
        </p>
      </ProfilePage>
    )
  if (view === 'phone')
    return (
      <ProfilePage className="mf-services" title="Chiama" onBack={() => setView(contactReturn)} onClose={onClose}>
        <p>Seleziona il numero da contattare</p>
        {(contactReturn === 'advisor' && advisorKind !== 'remote'
          ? ['+39 34517850372', '+02 4567878909']
          : [contact]
        ).map((number) => (
          <ProfileRow
            label={number}
            detail={number.startsWith('+39') ? 'Numero di cellulare' : 'Numero di telefono'}
            key={number}
            icon={a.phone}
            onClick={() => setPhone(number)}
          />
        ))}
        {phone && (
          <div className="mf-services-contact-result" role="status">
            <strong>{phone}</strong>
            <p>Numero da contattare</p>
            <ProfileButton secondary onClick={() => setPhone('')}>
              Termina
            </ProfileButton>
          </div>
        )}
      </ProfilePage>
    )
  if (view === 'email')
    return (
      <ProfilePage
        className="mf-services"
        title="Scrivi una email"
        onBack={() => setView(contactReturn)}
        onClose={onClose}
        footer={
          <ProfileButton disabled={!mailSubject.trim() || !mailBody.trim()} onClick={() => setNotice('Bozza salvata.')}>
            Salva bozza
          </ProfileButton>
        }
      >
        <ServiceFact label="Da">andrea.rossini@gmail.com</ServiceFact>
        <ServiceFact label="A">{contact}</ServiceFact>
        <ProfileField label="Oggetto" value={mailSubject} onChange={(event) => setMailSubject(event.target.value)} />
        <label className="mf-profile-field">
          <span>Messaggio</span>
          <textarea value={mailBody} onChange={(event) => setMailBody(event.target.value)} />
        </label>
        {notice && <p role="status">{notice}</p>}
      </ProfilePage>
    )
  if (view === 'chat')
    return (
      <ProfilePage
        className="mf-services"
        title="Il tuo advisor"
        onBack={() => setView('advisor')}
        onClose={onClose}
        footer={
          <>
            <ProfileField
              label="Parla con il tuo advisor..."
              maxLength={2000}
              value={chatText}
              onChange={(event) => setChatText(event.target.value)}
            />
            <ProfileButton
              disabled={!chatText.trim()}
              onClick={() => {
                setMessages((current) => [
                  ...current,
                  chatText,
                  'Possiamo aiutarti a prenotare una consulenza. Seleziona Fissa un appuntamento per scegliere filiale, categoria e orario.',
                ])
                setChatText('')
              }}
            >
              Invia
            </ProfileButton>
          </>
        }
      >
        <p>Oggi</p>
        <div className="mf-services-chat-bubble">
          <strong>Ciao Andrea!</strong>
          <p>
            Sono il tuo buddy advisor dedicato alle consulenze patrimoniali, disponibile 24/7! Come posso esserti utile?
          </p>
        </div>
        {messages.map((text, index) => (
          <p className={`mf-services-chat-bubble${index % 2 === 0 ? ' is-user' : ''}`} key={index}>
            {text}
          </p>
        ))}
        <ServiceTextAction onClick={() => startBooking(branchName)}>Fissa un appuntamento</ServiceTextAction>
      </ProfilePage>
    )
  if (view === 'advisor')
    return (
      <ProfilePage className="mf-services" title="Il tuo consulente" onBack={() => setView('home')} onClose={onClose}>
        <div className="mf-services-advisor">
          <span>{advisorKind === 'cfe' ? 'GC' : 'MB'}</span>
          <strong>{advisorName}</strong>
          <small>{advisorRole}</small>
        </div>
        <div className="mf-services-quick-actions">
          <ServiceQuickAction
            icon={a.phone}
            label={advisorKind === 'cfe' ? 'Chatta con il tuo advisor' : 'Chiama'}
            onClick={() =>
              advisorKind === 'cfe'
                ? setView('chat')
                : contactTo('phone', advisorKind === 'remote' ? '800575757' : '+39 34517850372', 'advisor')
            }
          />
          {advisorKind !== 'remote' && advisorKind !== 'cfe' && (
            <ServiceQuickAction
              icon={a.email}
              label="Scrivi una email"
              onClick={() => contactTo('email', 'mario.bianchi@unicredit.eu', 'advisor')}
            />
          )}
        </div>
        <h2>Oppure vieni a trovarci in filiale</h2>
        {profileBranches.slice(0, 2).map((item) => (
          <ProfileRow
            key={item.name}
            label={item.name}
            detail={item.address}
            value="Scopri orari e contatti"
            onClick={() => {
              setBranchName(item.name)
              setView('branch')
            }}
          />
        ))}
      </ProfilePage>
    )
  if (view === 'branch')
    return (
      <ProfilePage
        className="mf-services mf-services-branch"
        title="La tua filiale"
        onBack={() => setView('home')}
        onClose={onClose}
      >
        <ServiceSelect
          label="Seleziona filiale"
          value={branchName}
          options={profileBranches.slice(0, 3).map((item) => item.name)}
          onChange={setBranchName}
        />
        <p>{branch.address}</p>
        <div className="mf-services-quick-actions">
          <ServiceQuickAction
            icon={a.bankAppointment}
            label="Fissa un appuntamento"
            onClick={() => startBooking(branchName)}
          />
          <ServiceQuickAction
            icon={a.phone}
            label="Chiama la filiale"
            onClick={() => contactTo('phone', branch.phone, 'branch')}
          />
          <ServiceQuickAction
            icon={a.email}
            label="Scrivi una email"
            onClick={() => contactTo('email', branch.email, 'branch')}
          />
        </div>
        <h2>Informazioni</h2>
        <section className="mf-services-section">
          <h3>Orari filiale</h3>
          {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map((day, index) => (
            <p key={day}>
              {day}:{' '}
              <strong>
                {index > 4 ? 'Chiuso' : index === 4 ? '08:20-13:20, 14:30-15:45' : '08:20-13:20, 14:30-16'}
              </strong>
            </p>
          ))}
        </section>
        <h3>Recapiti filiale</h3>
        <ServiceFact label="Indirizzo">{branch.address}</ServiceFact>
        <ServiceFact label={advisorKind === 'private' ? 'Private Banker' : 'Direttore'}>
          {advisorKind === 'private' ? 'Mario Bianchi' : 'Michele Rossi'}
        </ServiceFact>
        <ServiceFact label="Numero di filiale">02 12344567789</ServiceFact>
        <ServiceFact label="Fax">02 12344567789</ServiceFact>
        <h3>Intestazione rapporti bancari</h3>
        <ServiceFact label="Intestazioni">Alessandro dell’Acqua</ServiceFact>
        <ServiceFact label="Rapporto">000000012345678</ServiceFact>
        <ServiceFact label="Intestazioni">Rossi Anna</ServiceFact>
      </ProfilePage>
    )
  return (
    <ProfilePage className="mf-services mf-services-bank-home" title="La tua banca" onBack={onBack} onClose={onClose}>
      <ProfileTabs
        labels={['Il tuo consulente', 'La tua filiale', 'Appuntamenti']}
        value={tab}
        onChange={setTab}
        label="La tua banca"
      />
      {tab === 'Il tuo consulente' && (
        <ProfileRow
          label={advisorName}
          detail={advisorRole + (advisorKind === 'cfe' ? ' (per investimenti, mutui e prestiti)' : '')}
          onClick={() => setView('advisor')}
        />
      )}
      {tab === 'La tua filiale' &&
        profileBranches.slice(0, 3).map((item) => (
          <ProfileRow
            key={item.name}
            label={item.name}
            detail={item.address}
            onClick={() => {
              setBranchName(item.name)
              setView('branch')
            }}
          />
        ))}
      {tab === 'Appuntamenti' && (
        <>
          <p>
            In questa sezione troverai l’elenco degli appuntamenti che hai preso con le relative informazioni. Nuovi
            appuntamenti o modifiche verranno aggiornate dopo circa 10 min.
          </p>
          {appointments.length === 0 && <p>Nessun appuntamento disponibile</p>}
          {appointments
            .filter((item) => item.status === 'Da eseguire')
            .map((item) => (
              <ProfileRow
                key={item.id}
                label={item.purpose}
                detail={`${dateLabel(item.date)} - ${item.time} · Appuntamento in filiale`}
                value={item.status}
                onClick={() => {
                  setSelectedId(item.id)
                  setView('appointment')
                }}
              />
            ))}
          <h3>Appuntamenti conclusi ed annullati</h3>
          {appointments
            .filter((item) => item.status !== 'Da eseguire')
            .map((item) => (
              <ProfileRow
                key={item.id}
                label={item.purpose}
                detail={dateLabel(item.date)}
                value={item.status}
                onClick={() => {
                  setSelectedId(item.id)
                  setView('appointment')
                }}
              />
            ))}
          <ProfileButton onClick={() => startBooking()}>Fissa un appuntamento</ProfileButton>
        </>
      )}
    </ProfilePage>
  )
}
