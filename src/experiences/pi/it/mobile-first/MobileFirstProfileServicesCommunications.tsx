import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  canSignPractice,
  servicePracticeInteraction,
  profileServicesStore,
  authorizeServicePracticeSignature,
  servicePracticeSignatureError,
  dateLabel,
  filterServiceItems,
  updateServiceItems,
  type ServiceFilter,
  type ServiceItem,
} from '../../../../features/profile/mobileFirstProfileServices'
import { profileSettingsStore } from '../../../../features/profile/mobileFirstProfileSettings'
import { ProfileButton, ProfileField, ProfilePage, ProfileRow, ProfileTabs } from './MobileFirstProfilePrimitives'
import {
  ServiceCard,
  ServiceDocumentPreview,
  ServiceFact,
  ServiceSelect,
  ServiceSuccess,
  ServiceTextAction,
} from './MobileFirstProfileServicesElements'
import { profileServicesAssets as a } from './profileServicesAssets'
import type { ProfileServicesNavigate } from './MobileFirstProfileServices'

type CommunicationView = 'list' | 'filters' | 'detail' | 'practice' | 'interview' | 'signature' | 'success' | 'cancel'
export default function MobileFirstProfileServicesCommunications({
  initialTab = 0,
  initialItemId,
  onBack,
  onClose,
  onNavigate,
}: {
  initialTab?: number
  initialItemId?: string
  onBack: () => void
  onClose: () => void
  onNavigate?: ProfileServicesNavigate
}) {
  const [tab, setTab] = useState(['Notifiche', 'Messaggi', 'Pratiche'][initialTab] ?? 'Notifiche')
  const [practiceTab, setPracticeTab] = useState('Incomplete')
  const [view, setView] = useState<CommunicationView>(
    initialItemId ? (initialTab === 2 ? 'practice' : 'detail') : 'list',
  )
  const { notices, messages, practices } = useSyncExternalStore(
    profileServicesStore.subscribe,
    profileServicesStore.getSnapshot,
  )
  const settings = useSyncExternalStore(profileSettingsStore.subscribe, profileSettingsStore.getSnapshot)
  const signingError = servicePracticeSignatureError(settings)
  useEffect(() => {
    if (!initialItemId) return
    const collection = initialTab === 2 ? 'practices' : initialTab === 1 ? 'messages' : 'notices'
    const item = profileServicesStore.getSnapshot()[collection].find((item) => item.id === initialItemId)
    if (item && !item.read)
      profileServicesStore.update(collection, (current) => updateServiceItems(current, [initialItemId], 'read'))
  }, [initialItemId, initialTab])
  const setNotices = (updater: (current: ServiceItem[]) => ServiceItem[]) =>
    profileServicesStore.update('notices', updater)
  const setMessages = (updater: (current: ServiceItem[]) => ServiceItem[]) =>
    profileServicesStore.update('messages', updater)
  const setPractices = (updater: (current: ServiceItem[]) => ServiceItem[]) =>
    profileServicesStore.update('practices', updater)
  const [selectedId, setSelectedId] = useState(initialItemId ?? '')
  const [filter, setFilter] = useState<ServiceFilter>({})
  const [draft, setDraft] = useState<ServiceFilter>({})
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState('6M')
  const [archive, setArchive] = useState(false)
  const [viewed, setViewed] = useState(false)
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState('')
  const [successTitle, setSuccessTitle] = useState('')
  const [uploads, setUploads] = useState<Record<string, string>>({})
  const [selection, setSelection] = useState<string[] | null>(null)
  const items = tab === 'Notifiche' ? notices : tab === 'Messaggi' ? messages : practices
  const selected = items.find((item) => item.id === selectedId)
  const visible = filterServiceItems(items, { ...filter, query: query || filter.query, archived: archive }).filter(
    (item) =>
      tab !== 'Pratiche' ||
      (practiceTab === 'Incomplete'
        ? item.status === 'Incompleta'
        : practiceTab === 'In lavorazione'
          ? item.status === 'In lavorazione'
          : ['Completata', 'Annullata', 'Rifiutata'].includes(item.status ?? '')),
  )
  const update = (ids: string[], action: 'read' | 'archive' | 'restore') => {
    if (tab === 'Notifiche') setNotices((current) => updateServiceItems(current, ids, action))
    else if (tab === 'Messaggi') setMessages((current) => updateServiceItems(current, ids, action))
    else setPractices((current) => updateServiceItems(current, ids, action))
  }
  const open = (item: ServiceItem) => {
    if (tab === 'Notifiche' && onNavigate) {
      update([item.id], 'read')
      onNavigate('notification', item.id)
      return
    }
    setSelectedId(item.id)
    update([item.id], 'read')
    setNotice('')
    setViewed(false)
    setCode('')
    setView(tab === 'Pratiche' ? 'practice' : 'detail')
  }
  const changeStatus = (status: string) =>
    setPractices((current) => current.map((item) => (item.id === selectedId ? { ...item, status } : item)))
  const signatureWarning = signingError ? (
    <div role="alert" className="mf-services-error">
      <p>{signingError}</p>
      {onNavigate && (
        <ProfileButton secondary onClick={() => onNavigate('settings', 'digital-signature')}>
          Gestisci firma digitale
        </ProfileButton>
      )}
    </div>
  ) : null
  if (view === 'interview')
    return (
      <ServiceDocumentPreview
        title="Intervista di adeguatezza"
        category="Questionari"
        reference="Intervista MIFID"
        onBack={() => setView('practice')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              setViewed(true)
              setView('practice')
            }}
          >
            Continua
          </ProfileButton>
        }
      />
    )
  if (view === 'signature')
    return (
      <ProfilePage
        className="mf-services"
        title="Inserisci il tuo Mobile Code"
        onBack={() => setView('practice')}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!canSignPractice(viewed, code) || Boolean(signingError)}
            onClick={() => {
              const result = authorizeServicePracticeSignature(viewed, code)
              if (!result.valid) {
                setNotice(result.error ?? 'Autorizzazione non riuscita.')
                return
              }
              changeStatus('Completata')
              profileServicesStore.update('documents', (current) => [
                {
                  id: `interview-${current.length}`,
                  title: 'Intervista di adeguatezza',
                  category: 'Questionari',
                  date: '2025-01-31',
                  reference: 'Intervista MIFID',
                  owner: 'Andrea Rossini',
                  read: true,
                  archived: false,
                },
                ...current,
              ])
              setSuccessTitle('Aggiornamento intervista completato')
              setView('success')
            }}
          >
            Conferma
          </ProfileButton>
        }
      >
        <ProfileField
          label="Mobile Code"
          type="password"
          inputMode="numeric"
          maxLength={10}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
        />
        <p>Inserisci il tuo Mobile Code.</p>
        {signatureWarning}
        <ServiceTextAction
          onClick={() =>
            onNavigate
              ? onNavigate('security', 'forgot-mobile-code')
              : setNotice('Per recuperare il Mobile Code contatta il servizio clienti dalla sezione Supporto.')
          }
        >
          Ho dimenticato il Mobile Code
        </ServiceTextAction>
        {notice && <p role="alert">{notice}</p>}
      </ProfilePage>
    )
  if (view === 'success')
    return (
      <ServiceSuccess
        title={successTitle}
        description={
          successTitle.includes('annullata')
            ? 'Ti ricordiamo che potrai aggiornare la tua posizione in qualunque momento desideri contattando la tua Filiale.'
            : 'L’intervista rilasciata è stata salvata nella sezione Documenti/Questionari nel tuo profilo personale. Ti ricordiamo che potrai aggiornare la tua posizione contattando la tua filiale.'
        }
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton
              secondary
              onClick={() => {
                setView('list')
                setPracticeTab('Chiuse')
              }}
            >
              Vedi pratiche chiuse
            </ProfileButton>
            <ProfileButton secondary onClick={onClose}>
              Chiudi
            </ProfileButton>
          </>
        }
      />
    )
  if (view === 'cancel' && selected)
    return (
      <ProfilePage
        className="mf-services"
        title={selected.id === 'mifid' ? 'Stai annullando la tua intervista MIFID' : 'Annulla la pratica'}
        onBack={() => setView('practice')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton
              onClick={() => {
                changeStatus('Annullata')
                setSuccessTitle(
                  selected.id === 'mifid' ? 'Intervista annullata correttamente' : 'Pratica annullata correttamente',
                )
                setView('success')
              }}
            >
              Conferma
            </ProfileButton>
            <ProfileButton secondary onClick={() => setView('practice')}>
              Annulla
            </ProfileButton>
          </>
        }
      >
        <p>
          {selected.id === 'mifid'
            ? 'Cliccando su “Conferma” non confermerai la tua intervista e la stessa si intenderà non rilasciata.'
            : `Vuoi annullare la pratica ${selected.title}?`}
        </p>
      </ProfilePage>
    )
  if (view === 'practice' && selected) {
    if (servicePracticeInteraction(selected) === 'mifid-signature')
      return (
        <ProfilePage
          className="mf-services"
          title="Intervista MIFID"
          onBack={() => setView('list')}
          onClose={onClose}
          footer={
            <>
              <ProfileButton
                disabled={!viewed || Boolean(signingError)}
                onClick={() => {
                  setNotice('')
                  setView('signature')
                }}
              >
                Prosegui alla firma
              </ProfileButton>
              <ProfileButton secondary onClick={() => setView('cancel')}>
                Annulla intervista
              </ProfileButton>
            </>
          }
        >
          <p>Per avere maggiori informazioni può contattare:</p>
          <ServiceFact label="Nominativo">Giacomo Verdi</ServiceFact>
          <ServiceFact label="Filiale">Legnago</ServiceFact>
          <ServiceFact label="Telefono">02 95364457</ServiceFact>
          <ServiceFact label="Email">giacomo.verdi@unicredit.com</ServiceFact>
          <h2>Documenti da visualizzare</h2>
          <p>
            Per cliccare su “Prosegui alla firma” è obbligatoria la presa visione della documentazione di seguito
            riportata e la verifica delle risposte fornite nell’esito intervista/e.
          </p>
          <ProfileRow
            label="Intervista di adeguatezza"
            icon={a.mifidDocument}
            value={viewed ? 'Visualizzato' : 'VISUALIZZA'}
            onClick={() => setView('interview')}
          />
          {signatureWarning}
        </ProfilePage>
      )
    const active = ['Incompleta', 'In lavorazione'].includes(selected.status ?? '')
    return (
      <ProfilePage
        className="mf-services"
        title={selected.title}
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          active ? (
            <ProfileButton secondary onClick={() => setView('cancel')}>
              Annulla la pratica
            </ProfileButton>
          ) : undefined
        }
      >
        <ServiceFact label="Data pratica">{dateLabel(selected.date)}</ServiceFact>
        <ServiceFact label="Stato pratica">{selected.status}</ServiceFact>
        {servicePracticeInteraction(selected) === 'overdraft-upload' ? (
          <>
            <p>
              Il contratto è stato firmato. Eventuali altre attività necessarie a completare la richiesta sono elencate
              in questa pagina. Dopo aver caricato la documentazione richiesta non effettuare altre operazioni. La
              pratica rimarrà incompleta fino alla presa in carico da parte nostra.
            </p>
            <h2>Documenti da caricare</h2>
            {['Busta paga', 'Documentazione facoltativa'].map((label) => (
              <label className="mf-services-upload" key={label}>
                <img src={a.document} alt="" />
                <span>
                  <strong>{label}</strong>
                  <small>
                    {uploads[label] ??
                      'Per consentire la valutazione della richiesta è necessario fornire il seguente documento'}
                  </small>
                </span>
                <span>
                  CARICA
                  <input
                    aria-label={`Carica ${label}`}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        setUploads((current) => ({ ...current, [label]: file.name }))
                        setNotice(
                          `${label}: ${file.name} selezionato. La pratica rimane incompleta fino alla presa in carico.`,
                        )
                      }
                    }}
                  />
                </span>
              </label>
            ))}
          </>
        ) : servicePracticeInteraction(selected) === 'mifid-link' ? (
          <>
            <p>La tua richiesta è incompleta. Per procedere è necessario selezionare “Completa la pratica”.</p>
            <ProfileButton
              onClick={() => {
                setSelectedId('mifid')
                setViewed(false)
              }}
            >
              Completa la pratica
            </ProfileButton>
          </>
        ) : (
          <p>
            {selected.body ??
              (selected.status === 'Completata'
                ? 'La tua richiesta è stata completata.'
                : selected.status === 'Annullata'
                  ? 'La tua richiesta è stata annullata.'
                  : 'Consulta lo stato della tua richiesta.')}
          </p>
        )}
        {active && <p>Se si desidera è possibile procedere con l’annullamento della pratica.</p>}
        {notice && <p role="status">{notice}</p>}
      </ProfilePage>
    )
  }
  if (view === 'detail' && selected)
    return (
      <ProfilePage
        className="mf-services"
        title={tab}
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <ProfileButton
            secondary
            onClick={() => {
              update([selected.id], archive ? 'restore' : 'archive')
              setNotice(archive ? 'Comunicazione ripristinata.' : 'Comunicazione archiviata.')
              setView('list')
            }}
          >
            {archive ? 'Ripristina' : 'Archivia'}
          </ProfileButton>
        }
      >
        <h2>{selected.title}</h2>
        <p>{selected.body}</p>
        <ServiceFact label="Data">{dateLabel(selected.date)}</ServiceFact>
        <ServiceFact label="Categoria">{selected.category}</ServiceFact>
        {tab === 'Notifiche' && (
          <ProfileButton
            onClick={() =>
              onNavigate ? onNavigate('notification', selected.id) : setNotice('Richiesta visualizzata.')
            }
          >
            Visualizza attività
          </ProfileButton>
        )}
        {notice && <p role="status">{notice}</p>}
      </ProfilePage>
    )
  if (view === 'filters')
    return (
      <ProfilePage
        className="mf-services"
        title="Filtri di ricerca"
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <div className="mf-services-double">
            <ProfileButton
              secondary
              onClick={() => {
                setDraft({})
                setPeriod('6M')
              }}
            >
              Rimuovi Filtri
            </ProfileButton>
            <ProfileButton
              onClick={() => {
                if (draft.start && draft.end && draft.start > draft.end) {
                  setNotice('La data di fine deve essere successiva alla data di inizio.')
                  return
                }
                setFilter(draft)
                setView('list')
                setNotice('')
              }}
            >
              Applica
            </ProfileButton>
          </div>
        }
      >
        <h2>Ricerca per Tag</h2>
        <ProfileField
          label="Parola chiave o tag"
          placeholder="Scrivi la parola chiave o il tag..."
          value={draft.query ?? ''}
          onChange={(event) => setDraft((current) => ({ ...current, query: event.target.value }))}
        />
        <ProfileTabs
          labels={tab === 'Notifiche' ? ['Sicurezza', 'Accesso'] : ['Pagamento', 'Informazioni', 'Accesso']}
          value={draft.query ?? ''}
          onChange={(value) => setDraft((current) => ({ ...current, query: value }))}
          label="Tag"
        />
        <h2>Data</h2>
        <p>Seleziona periodo</p>
        <ProfileTabs
          labels={['3M', '6M', '12M']}
          value={period}
          onChange={(value) => {
            setPeriod(value)
            const start = new Date('2025-01-31T12:00:00Z')
            start.setUTCMonth(start.getUTCMonth() - Number.parseInt(value))
            setDraft((current) => ({ ...current, start: start.toISOString().slice(0, 10), end: '2025-01-31' }))
          }}
          label="Periodo comunicazioni"
        />
        <ProfileField
          label="Data di inizio"
          type="date"
          value={draft.start ?? ''}
          onChange={(event) => setDraft((current) => ({ ...current, start: event.target.value }))}
        />
        <ProfileField
          label="Data di fine"
          type="date"
          value={draft.end ?? ''}
          onChange={(event) => setDraft((current) => ({ ...current, end: event.target.value }))}
        />
        <ServiceSelect
          label="Stato lettura"
          options={['Tutti', 'Non letti']}
          value={draft.unread ? 'Non letti' : 'Tutti'}
          onChange={(value) => setDraft((current) => ({ ...current, unread: value === 'Non letti' }))}
        />
        {notice && <p role="alert">{notice}</p>}
      </ProfilePage>
    )
  return (
    <ProfilePage
      className="mf-services"
      title={
        archive
          ? `Archivio ${tab.toLocaleLowerCase('it')}`
          : Object.values(filter).some(Boolean)
            ? 'Risultati di ricerca'
            : tab
      }
      onBack={onBack}
      onClose={onClose}
      footer={
        selection ? (
          <ProfileButton
            disabled={selection.length === 0}
            onClick={() => {
              update(selection, 'read')
              setSelection(null)
              setNotice('Comunicazioni selezionate segnate come lette.')
            }}
          >
            Conferma
          </ProfileButton>
        ) : undefined
      }
    >
      <ProfileTabs
        labels={['Notifiche', 'Messaggi', 'Pratiche']}
        value={tab}
        onChange={(value) => {
          setTab(value)
          setFilter({})
          setQuery('')
          setArchive(false)
          setSelection(null)
        }}
        label="Comunicazioni e attività"
      />
      {tab === 'Pratiche' ? (
        <ProfileTabs
          labels={['Incomplete', 'In lavorazione', 'Chiuse']}
          value={practiceTab}
          onChange={setPracticeTab}
          label="Stato pratica"
        />
      ) : (
        <div className="mf-services-double">
          <ServiceTextAction icon={a.tick} onClick={() => setSelection([])}>
            Segna come letti
          </ServiceTextAction>
          <ServiceTextAction
            icon={a.filter}
            onClick={() => {
              setDraft(filter)
              setView('filters')
              setNotice('')
            }}
          >
            Filtri
          </ServiceTextAction>
        </div>
      )}
      <ProfileField
        label={`Cerca ${tab.toLocaleLowerCase('it')}`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cerca..."
      />
      {Object.values(filter).some(Boolean) && (
        <div className="mf-services-applied">
          <strong>Filtri applicati:</strong>
          <span>
            Periodo: {filter.start ?? 'Tutti'} - {filter.end ?? ''}
          </span>
          <span>Tag: {filter.query ?? 'Tutti'}</span>
          <ServiceTextAction onClick={() => setFilter({})}>Rimuovi filtri</ServiceTextAction>
        </div>
      )}
      {selection && (
        <label className="mf-services-checkbox">
          <input
            type="checkbox"
            checked={visible.length > 0 && selection.length === visible.length}
            onChange={(event) => setSelection(event.target.checked ? visible.map((item) => item.id) : [])}
          />
          Seleziona tutti
        </label>
      )}
      <div className="mf-services-card-list">
        {visible.map((item) => (
          <ServiceCard
            key={item.id}
            item={item}
            onClick={() =>
              selection
                ? setSelection((current) =>
                    current?.includes(item.id) ? current.filter((id) => id !== item.id) : [...(current ?? []), item.id],
                  )
                : open(item)
            }
            selected={selection?.includes(item.id)}
            onSelect={
              selection
                ? () =>
                    setSelection((current) =>
                      current?.includes(item.id)
                        ? current.filter((id) => id !== item.id)
                        : [...(current ?? []), item.id],
                    )
                : undefined
            }
          />
        ))}
      </div>
      {visible.length === 0 && <p className="mf-services-empty">Nessun risultato trovato</p>}
      {tab === 'Pratiche' && (
        <>
          <h3>La tua pratica non è presente?</h3>
          <p>Contatta il nostro servizio Clienti.</p>
          <ServiceTextAction
            onClick={() =>
              onNavigate
                ? onNavigate('support')
                : setNotice(
                    'Il servizio clienti è disponibile al numero 800 575 757. Apri Supporto dal profilo per la chat.',
                  )
            }
          >
            Chatta con noi
          </ServiceTextAction>
        </>
      )}
      <ServiceTextAction
        onClick={() => {
          setArchive((value) => !value)
          setFilter({})
          setQuery('')
        }}
      >
        {archive ? 'Torna alle comunicazioni' : 'Archivio'}
      </ServiceTextAction>
      {notice && <p role="status">{notice}</p>}
    </ProfilePage>
  )
}
