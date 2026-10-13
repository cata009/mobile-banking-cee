import { useState, useSyncExternalStore } from 'react'
import {
  canDeleteServiceDocument,
  profileServicesStore,
  canSignPractice,
  authorizeServiceSignature,
  createServiceDemoPdf,
  documentFilterError,
  filterServiceItems,
  updateServiceItems,
  type ServiceFilter,
  type ServiceItem,
} from '../../../../features/profile/mobileFirstProfileServices'
import { ProfileButton, ProfileField, ProfilePage, ProfileRow, ProfileTabs } from './MobileFirstProfilePrimitives'
import {
  ServiceCard,
  ServiceDocumentPreview,
  ServiceFact,
  ServiceSelect,
  ServiceSuccess,
  ServiceTextAction,
} from './MobileFirstProfileServicesElements'
import { initialServiceDocuments, profileDocumentCategories } from './profileServicesContent'
import { profileServicesAssets as a } from './profileServicesAssets'

type DocumentView =
  | 'list'
  | 'filters'
  | 'preview'
  | 'share'
  | 'share-confirm'
  | 'delete'
  | 'settings'
  | 'code'
  | 'saved'
  | 'certificate'
  | 'certificate-options'
  | 'generating'
const accounts = ['Andrea Rossini', 'Andrea Rossini e Sara Fumagalli']
const relationshipTypes = [
  'Conto corrente',
  'Deposito titoli',
  'Finanziamento',
  'Gestione patrimoniale',
  'Carta di credito',
  'Finanziamento aggiuntivo',
]
export default function MobileFirstProfileServicesDocuments({
  privateClient = false,
  onBack,
  onClose,
}: {
  privateClient?: boolean
  onBack: () => void
  onClose: () => void
}) {
  const [view, setView] = useState<DocumentView>('list')
  const snapshot = useSyncExternalStore(profileServicesStore.subscribe, profileServicesStore.getSnapshot)
  const documents = snapshot.documents
  const setDocuments = (updater: (current: ServiceItem[]) => ServiceItem[]) =>
    profileServicesStore.update('documents', updater)
  const [tab, setTab] = useState('In primo piano')
  const [category, setCategory] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState<'read' | 'share' | null>(null)
  const [filter, setFilter] = useState<ServiceFilter>({})
  const [filterDraft, setFilterDraft] = useState<ServiceFilter>({})
  const [period, setPeriod] = useState('6M')
  const [query, setQuery] = useState('')
  const [archive, setArchive] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [certificate, setCertificate] = useState('Attestazione ISEE')
  const [certificateAccounts, setCertificateAccounts] = useState<string[]>([accounts[0]!])
  const [certificateType, setCertificateType] = useState('Saldo')
  const [year, setYear] = useState('2024')
  const [generated, setGenerated] = useState<ServiceItem | null>(null)
  const [delivery, setDelivery] = useState<Record<string, string>>(
    () => snapshot.delivery ?? Object.fromEntries(relationshipTypes.map((type) => [type, 'Online'])),
  )
  const [deliveryEmail, setDeliveryEmail] = useState(snapshot.deliveryEmail ?? 'mic****ssi@email.it')
  const [editEmail, setEditEmail] = useState(false)
  const [history, setHistory] = useState('')
  const [code, setCode] = useState('')
  const selected = generated ?? documents.find((item) => item.id === selectedId)
  const activeFilter = {
    ...filter,
    query: query || filter.query,
    archived: archive,
    category:
      filter.category === 'In primo piano'
        ? ''
        : filter.category || category || (tab === 'Conti' ? 'Conti correnti' : tab === 'Carte' ? 'Carte' : ''),
  }
  const visible = filterServiceItems(documents, activeFilter).filter(
    (item) =>
      tab !== 'In primo piano' ||
      archive ||
      category ||
      Boolean(filter.category) ||
      initialServiceDocuments.slice(0, 6).some((document) => document.id === item.id),
  )
  const open = (item: ServiceItem) => {
    setSelectedId(item.id)
    setGenerated(null)
    setDocuments((current) => updateServiceItems(current, [item.id], 'read'))
    setView('preview')
    setNotice('')
  }
  const selectId = (id: string) =>
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))
  const download = (items: ServiceItem[]) => {
    const file = createServiceDemoPdf(
      items.length === 1 ? items[0]!.title : 'Documenti online e altri documenti',
      items.flatMap((item) => [
        item.title,
        `Intestatario: ${item.owner ?? 'Andrea Rossini'}`,
        `Riferimento: ${item.reference ?? item.id}`,
      ]),
    )
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'UniCredit-demo.pdf'
    anchor.click()
    URL.revokeObjectURL(url)
    setNotice('PDF dimostrativo scaricato.')
  }
  const startCertificate = (title: string) => {
    setGenerated(null)
    setCertificate(title)
    setCertificateAccounts([accounts[0]!])
    setView('certificate')
  }
  const generate = () => {
    const item: ServiceItem = {
      id: `certificate-${documents.length}`,
      title: certificate,
      category: 'Attestazioni',
      date: '2025-01-31',
      owner: certificateAccounts.join(', '),
      reference: certificate === 'Attestazione ISEE' ? `${year} · ${certificateType}` : 'IT 123456789000000012',
      read: true,
      archived: false,
    }
    setGenerated(item)
    setView('generating')
  }
  if (view === 'generating')
    return (
      <ProfilePage
        className="mf-services"
        title="Creazione in corso"
        onBack={() => setView('certificate')}
        onClose={onClose}
        footer={<ProfileButton onClick={() => setView('preview')}>Visualizza documento</ProfileButton>}
      >
        <p>Stiamo creando il documento richiesto</p>
        <div
          className="mf-services-progress"
          role="progressbar"
          aria-label="Creazione documento"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={67}
        >
          <strong>67%</strong>
        </div>
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
                setFilterDraft({})
                setError('')
                setPeriod('6M')
              }}
            >
              Rimuovi Filtri
            </ProfileButton>
            <ProfileButton
              onClick={() => {
                const message = documentFilterError({
                  ...filterDraft,
                  category: filterDraft.category || category || tab,
                })
                if (message) setError(message)
                else {
                  setFilter(filterDraft)
                  setSelectedIds([])
                  setSelectionMode(null)
                  setView('list')
                  setError('')
                }
              }}
            >
              Applica
            </ProfileButton>
          </div>
        }
      >
        <h2>Data</h2>
        <p>Seleziona periodo</p>
        <ProfileTabs
          labels={['3M', '6M', '12M']}
          label="Periodo documenti"
          value={period}
          onChange={(value) => {
            setPeriod(value)
            const months = Number.parseInt(value)
            const start = new Date('2025-01-31T12:00:00Z')
            start.setUTCMonth(start.getUTCMonth() - months)
            setFilterDraft((current) => ({ ...current, start: start.toISOString().slice(0, 10), end: '2025-01-31' }))
          }}
        />
        <ProfileField
          type="date"
          label="Data di inizio"
          value={filterDraft.start ?? ''}
          onChange={(event) => setFilterDraft((current) => ({ ...current, start: event.target.value }))}
        />
        <ProfileField
          type="date"
          label="Data di fine"
          value={filterDraft.end ?? ''}
          onChange={(event) => setFilterDraft((current) => ({ ...current, end: event.target.value }))}
        />
        <h2>Categoria</h2>
        <ServiceSelect
          label="Seleziona categoria"
          options={['In primo piano', ...profileDocumentCategories]}
          value={filterDraft.category ?? ''}
          onChange={(value) => setFilterDraft((current) => ({ ...current, category: value, owner: '' }))}
        />
        {filterDraft.category === 'Altri documenti e report' && (
          <>
            <ServiceSelect
              label="Tipologia di rapporto"
              options={['Avvisi effetti', 'Conto corrente', 'Deposito titoli']}
              value={filterDraft.query ?? ''}
              onChange={(value) => setFilterDraft((current) => ({ ...current, query: value }))}
            />
            <ServiceSelect
              label="Partita IVA"
              options={['12345GDX4']}
              value="12345GDX4"
              onChange={() => setNotice('Partita IVA selezionata: 12345GDX4')}
            />
          </>
        )}
        {filterDraft.category === 'Caricati da te' && (
          <ServiceSelect
            label="Sottocategoria"
            options={['Repository 1', 'Repository 2', 'Repository 3']}
            value={filterDraft.query ?? ''}
            onChange={(value) => setFilterDraft((current) => ({ ...current, query: value }))}
          />
        )}
        <h2>Intestatario</h2>
        <ServiceSelect
          label="Seleziona intestatario"
          options={accounts}
          value={filterDraft.owner ?? ''}
          onChange={(value) => setFilterDraft((current) => ({ ...current, owner: value }))}
        />
        {error && (
          <div className="mf-services-error" role="alert">
            <strong>Selezione non possibile</strong>
            <p>{error}</p>
          </div>
        )}
      </ProfilePage>
    )
  if (view === 'certificate')
    return (
      <ProfilePage
        className="mf-services"
        title={certificate}
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={certificateAccounts.length === 0}
            onClick={() => (certificate === 'Attestazione ISEE' ? setView('certificate-options') : generate())}
          >
            Conferma
          </ProfileButton>
        }
      >
        {certificate === 'Titolarità conto' ? (
          <h2>Seleziona il rapporto</h2>
        ) : (
          <label className="mf-services-checkbox">
            <input
              type="checkbox"
              checked={certificateAccounts.length === accounts.length}
              onChange={(event) => setCertificateAccounts(event.target.checked ? [...accounts] : [])}
            />
            Seleziona tutti
          </label>
        )}
        {accounts.map((account, index) => (
          <label
            key={account}
            htmlFor={`certificate-account-${index}`}
            aria-label={account}
            className={`mf-services-account-choice${certificateAccounts.includes(account) ? ' is-selected' : ''}`}
          >
            <img src={a.document} alt="" />
            <span>
              <strong>{account}</strong>
              <small>IT 123456789000000012</small>
            </span>
            <input
              id={`certificate-account-${index}`}
              type={certificate === 'Titolarità conto' ? 'radio' : 'checkbox'}
              name="certificate-account"
              checked={certificateAccounts.includes(account)}
              onChange={() =>
                setCertificateAccounts((current) =>
                  certificate === 'Titolarità conto'
                    ? [account]
                    : current.includes(account)
                      ? current.filter((value) => value !== account)
                      : [...current, account],
                )
              }
            />
          </label>
        ))}
      </ProfilePage>
    )
  if (view === 'certificate-options')
    return (
      <ProfilePage
        className="mf-services"
        title="Attestazione ISEE"
        onBack={() => setView('certificate')}
        onClose={onClose}
        footer={<ProfileButton onClick={generate}>Conferma</ProfileButton>}
      >
        <h2>Tipo di attestazione</h2>
        {['Saldo', 'Giacenza media'].map((type) => (
          <label key={type} className="mf-services-checkbox">
            <input
              type="radio"
              name="certificate-type"
              checked={certificateType === type}
              onChange={() => setCertificateType(type)}
            />
            {type}
          </label>
        ))}
        <h2>Seleziona l’anno</h2>
        <ProfileTabs
          labels={['2020', '2021', '2022', '2023', '2024']}
          label="Anno attestazione"
          value={year}
          onChange={setYear}
        />
      </ProfilePage>
    )
  if (view === 'preview' && selected)
    return (
      <ServiceDocumentPreview
        title={selected.title}
        category={selected.category}
        reference={selected.reference}
        onBack={() => {
          setGenerated(null)
          setView('list')
        }}
        onClose={onClose}
        footer={
          <>
            <div className="mf-services-double">
              <ProfileButton onClick={() => download([selected])}>Scarica PDF</ProfileButton>
              <ProfileButton
                secondary
                onClick={() => {
                  setSelectedIds([selected.id])
                  setView('share-confirm')
                }}
              >
                Condividi PDF
              </ProfileButton>
            </div>
            {!generated && (
              <ServiceTextAction
                onClick={() => {
                  setDocuments((current) => updateServiceItems(current, [selected.id], archive ? 'restore' : 'archive'))
                  setNotice(archive ? 'Documento ripristinato.' : 'Documento archiviato.')
                  setView('list')
                }}
              >
                {archive ? 'Ripristina' : 'Archivia'}
              </ServiceTextAction>
            )}
            {notice && <p role="status">{notice}</p>}
          </>
        }
      />
    )
  if (view === 'share-confirm')
    return (
      <ProfilePage
        className="mf-services"
        title="Attenzione"
        onBack={() => setView(selected ? 'preview' : 'list')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton onClick={() => setView('share')}>Prosegui</ProfileButton>
            <ProfileButton secondary onClick={() => setView('list')}>
              Annulla
            </ProfileButton>
          </>
        }
      >
        <p>Stai per condividere l’informazione selezionata. Sei sicuro di voler proseguire?</p>
        <p>{selectedIds.length} documenti selezionati</p>
      </ProfilePage>
    )
  if (view === 'share')
    return (
      <ProfilePage className="mf-services" title="Condividi" onBack={() => setView('list')} onClose={onClose}>
        <ServiceFact label="Documento">UniCredit-demo.pdf</ServiceFact>
        <ProfileButton
          onClick={() => download(generated ? [generated] : documents.filter((item) => selectedIds.includes(item.id)))}
        >
          Scarica PDF
        </ProfileButton>
        <ProfileRow
          label="Copia riepilogo"
          onClick={() => {
            void navigator.clipboard?.writeText(
              (generated ? [generated] : documents.filter((item) => selectedIds.includes(item.id)))
                .map((item) => item.title)
                .join('\n'),
            )
            setNotice('Riepilogo copiato.')
          }}
        />
        <p>Scarica il documento o copia il riepilogo per condividerlo.</p>
        {notice && <p role="status">{notice}</p>}
      </ProfilePage>
    )
  if (view === 'delete' && selected)
    return (
      <ProfilePage
        className="mf-services"
        title="Elimina documento"
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <>
            <ProfileButton
              onClick={() => {
                if (canDeleteServiceDocument(selected)) {
                  setDocuments((current) => current.filter((item) => item.id !== selected.id))
                  setNotice('Documento eliminato.')
                  setView('list')
                }
              }}
            >
              Conferma eliminazione
            </ProfileButton>
            <ProfileButton secondary onClick={() => setView('list')}>
              Annulla
            </ProfileButton>
          </>
        }
      >
        <p>Vuoi eliminare {selected.title}? Verrà rimosso dai documenti caricati da te.</p>
      </ProfilePage>
    )
  if (view === 'code')
    return (
      <ProfilePage
        className="mf-services"
        title="Inserisci il tuo Mobile Code"
        onBack={() => setView('settings')}
        onClose={onClose}
        footer={
          <ProfileButton
            disabled={!canSignPractice(true, code)}
            onClick={() => {
              const result = authorizeServiceSignature(true, code)
              if (result.valid) {
                profileServicesStore.update('delivery', () => ({ ...delivery }))
                profileServicesStore.update('deliveryEmail', () => deliveryEmail)
                setView('saved')
                setError('')
              } else setError(result.error ?? 'Autorizzazione non riuscita.')
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
        <p>Inserisci il tuo Mobile Code per confermare la scelta.</p>
        {error && <p role="alert">{error}</p>}
      </ProfilePage>
    )
  if (view === 'saved')
    return (
      <ServiceSuccess
        title="Scelta effettuata correttamente"
        description="La modalità di ricezione è stata modificata."
        onBack={() => setView('settings')}
        onClose={onClose}
        footer={
          <ProfileButton secondary onClick={() => setView('list')}>
            Chiudi
          </ProfileButton>
        }
      />
    )
  if (view === 'settings')
    return (
      <ProfilePage
        className="mf-services"
        title="Scelta modalità di recezione dei documenti"
        onBack={() => setView('list')}
        onClose={onClose}
        footer={
          <ProfileButton
            onClick={() => {
              if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail))
                setError('Inserisci un indirizzo email valido.')
              else {
                setCode('')
                setView('code')
              }
            }}
          >
            Avanti
          </ProfileButton>
        }
      >
        <p>Le notifiche relative alla disponibilità di nuovi documenti ti saranno inviate via email all’indirizzo:</p>
        {editEmail ? (
          <ProfileField
            label="Email"
            value={deliveryEmail}
            type="email"
            onChange={(event) => setDeliveryEmail(event.target.value)}
          />
        ) : (
          <ProfileRow label="Email" value={deliveryEmail} detail="Verificato" onClick={() => setEditEmail(true)} />
        )}
        <h3>Scegli la modalità di ricezione dei documenti per i rapporti elencati:</h3>
        {relationshipTypes.map((type, index) => (
          <section className="mf-services-section" key={type}>
            <div className="mf-services-branch-choice">
              <small>Tipo: {type}</small>
              <strong>Andrea Rossini - 30654 000010532399{index}</strong>
              <small>Ultimo aggiornamento: 24/07/2018 03:18:35</small>
            </div>
            <div className="mf-services-double">
              {['Online', 'Cartaceo'].map((mode) => (
                <label className="mf-services-checkbox" key={mode}>
                  <input
                    type="radio"
                    name={`delivery-${type}`}
                    checked={delivery[type] === mode}
                    onChange={() => setDelivery((current) => ({ ...current, [type]: mode }))}
                  />
                  {mode}
                </label>
              ))}
            </div>
          </section>
        ))}
        {privateClient && (
          <p>
            Se vuoi accedere ai Documenti online e continuare a riceverli anche via posta devi rivolgerti al gestore per
            richiedere una deroga.
          </p>
        )}
        <h3>Storico attivazione modalità di ricezione online</h3>
        <ServiceSelect label="Seleziona il rapporto" options={accounts} value={history} onChange={setHistory} />
        {history && (
          <>
            <ServiceFact label="Aderito">1752098 - 06/03/2025 - 17:06:23</ServiceFact>
            <ServiceFact label="Non aderito">1752098 - 11/06/2023 - 08:42:19</ServiceFact>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </ProfilePage>
    )
  return (
    <ProfilePage
      className="mf-services mf-services-documents"
      title={
        archive ? 'Archivio documenti' : Object.values(filter).some(Boolean) ? 'Risultati di ricerca' : 'Documenti'
      }
      onBack={onBack}
      onClose={onClose}
      footer={
        selectionMode ? (
          <ProfileButton
            disabled={selectedIds.length === 0}
            onClick={() => {
              if (selectionMode === 'read') {
                setDocuments((current) => updateServiceItems(current, selectedIds, 'read'))
                setSelectionMode(null)
                setNotice('Documenti selezionati segnati come letti.')
                setSelectedIds([])
              } else setView('share-confirm')
            }}
          >
            {selectionMode === 'read' ? 'Conferma' : 'Condividi PDF'}
          </ProfileButton>
        ) : undefined
      }
    >
      <div className="mf-services-toolbar">
        <button
          type="button"
          aria-label="Impostazioni documenti"
          onClick={() => {
            setError('')
            setView('settings')
          }}
        >
          <img src={a.settings} alt="" />
        </button>
        <button
          type="button"
          aria-label="Filtri documenti"
          onClick={() => {
            setFilterDraft(filter)
            setView('filters')
            setError('')
          }}
        >
          <img src={a.filter} alt="" />
        </button>
      </div>
      {!archive && (
        <div className="mf-services-certificates">
          <button type="button" onClick={() => startCertificate('Attestazione ISEE')}>
            <strong>Attestazione ISEE</strong>
            <span>RICHIEDI ›</span>
          </button>
          <button type="button" onClick={() => startCertificate('Titolarità conto')}>
            <strong>Titolarità conto</strong>
            <span>RICHIEDI ›</span>
          </button>
        </div>
      )}
      <ProfileTabs
        labels={['In primo piano', 'Recenti', 'Conti', 'Carte', 'Altro']}
        label="Categorie documenti"
        value={tab}
        onChange={(value) => {
          setTab(value)
          setCategory('')
          setQuery('')
          setFilter({})
          setSelectionMode(null)
        }}
      />
      {tab === 'Altro' && !category && !archive ? (
        <>
          {profileDocumentCategories.map((value) => (
            <ProfileRow key={value} label={value} onClick={() => setCategory(value)} />
          ))}
        </>
      ) : (
        <>
          {category && <h2>{category}</h2>}
          {tab === 'In primo piano' && !archive && (
            <p>I documenti della sezione “In primo piano” sono quelli degli ultimi 6 mesi.</p>
          )}
          {Object.values(filter).some(Boolean) && (
            <div className="mf-services-applied">
              <strong>Filtri applicati:</strong>
              {filter.start && (
                <span>
                  Periodo: {filter.start} - {filter.end}
                </span>
              )}
              {filter.category && <span>Categoria: {filter.category}</span>}
              {filter.owner && <span>Intestatario: {filter.owner}</span>}
              <ServiceTextAction onClick={() => setFilter({})}>Rimuovi filtri</ServiceTextAction>
            </div>
          )}
          {(archive || category || Object.values(filter).some(Boolean)) && (
            <ProfileField
              label="Cerca documenti"
              placeholder="Cerca per parola chiave..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          )}
          <div className="mf-services-double mf-services-document-actions">
            <ServiceTextAction
              icon={a.tick}
              onClick={() => {
                setSelectionMode('read')
                setSelectedIds([])
              }}
            >
              Segna tutto come letto
            </ServiceTextAction>
            <ServiceTextAction
              icon={a.share}
              onClick={() => {
                setSelectionMode('share')
                setSelectedIds([])
                setSelectedId('')
                setGenerated(null)
              }}
            >
              Condividi
            </ServiceTextAction>
          </div>
          {selectionMode && (
            <label className="mf-services-checkbox">
              <input
                type="checkbox"
                checked={visible.length > 0 && selectedIds.length === visible.length}
                onChange={(event) => setSelectedIds(event.target.checked ? visible.map((item) => item.id) : [])}
              />
              Seleziona tutti i documenti
            </label>
          )}
          <div className="mf-services-card-list">
            {visible.map((item) => (
              <div key={item.id}>
                <ServiceCard
                  item={item}
                  onClick={() => (selectionMode ? selectId(item.id) : open(item))}
                  selected={selectedIds.includes(item.id)}
                  onSelect={selectionMode ? () => selectId(item.id) : undefined}
                />
                {item.uploaded && !selectionMode && (
                  <ServiceTextAction
                    onClick={() => {
                      setSelectedId(item.id)
                      setGenerated(null)
                      setView('delete')
                    }}
                  >
                    Elimina {item.title}
                  </ServiceTextAction>
                )}
              </div>
            ))}
          </div>
          {visible.length === 0 && <p className="mf-services-empty">Nessun documento trovato</p>}
        </>
      )}
      <ServiceTextAction
        onClick={() => {
          setArchive((current) => !current)
          setSelectedIds([])
          setSelectionMode(null)
          setTab('Recenti')
          setCategory('')
          setFilter({})
          setQuery('')
        }}
      >
        {archive ? 'Torna ai documenti' : 'Archivio'}
      </ServiceTextAction>
      {notice && <p role="status">{notice}</p>}
    </ProfilePage>
  )
}
