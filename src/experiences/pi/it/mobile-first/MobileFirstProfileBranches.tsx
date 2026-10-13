import { useState } from 'react'
import { filterProfileBranches } from '@/features/profile/mobileFirstProfile'
import { ProfileButton, ProfileField, ProfilePage, ProfileRow, ProfileTabs } from './MobileFirstProfilePrimitives'
import { PROFILE_BRANCHES, PROFILE_BRANCH_ROUTE, PROFILE_BRANCH_SERVICES } from './profileContent'
import { profileAssets as a } from './profileAssets'

export default function MobileFirstProfileBranches({
  onBack,
  onClose,
  onAppointment,
}: {
  onBack: () => void
  onClose: () => void
  onAppointment: () => void
}) {
  const [view, setView] = useState<'map' | 'list' | 'filters' | 'detail' | 'phone' | 'ubook'>('map')
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [draftType, setDraftType] = useState('')
  const [draftServices, setDraftServices] = useState<string[]>([])
  const [branchId, setBranchId] = useState('certosa')
  const [detailTab, setDetailTab] = useState('Informazioni')
  const [travel, setTravel] = useState('In auto')
  const [position, setPosition] = useState(false)
  const branch = PROFILE_BRANCHES.find((item) => item.id === branchId) ?? PROFILE_BRANCHES[0]
  const rows = filterProfileBranches(PROFILE_BRANCHES, query, type, services)
  const closeDetail = () => setView('map')
  const openFilters = () => {
    setDraftType(type)
    setDraftServices(services)
    setView('filters')
  }
  if (view === 'filters')
    return (
      <ProfilePage
        title="Filtri di ricerca"
        onClose={closeDetail}
        footer={
          <div className="mf-profile-two-buttons">
            <ProfileButton
              secondary
              onClick={() => {
                setDraftType('')
                setDraftServices([])
              }}
            >
              Rimuovi Filtri
            </ProfileButton>
            <ProfileButton
              onClick={() => {
                setType(draftType)
                setServices(draftServices)
                closeDetail()
              }}
            >
              Applica
            </ProfileButton>
          </div>
        }
      >
        <h2>Tipologia struttura</h2>
        <label className="mf-profile-field">
          Seleziona tipologia di struttura
          <select value={draftType} onChange={(event) => setDraftType(event.target.value)}>
            <option value="">Tipologia di struttura</option>
            {[
              'Filiale',
              'ATM Sportelli Automatici',
              'Filiale Private Banking',
              'Centri Imprese',
              'Negozi myAgents',
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <h2>Servizi di filiale</h2>
        <div className="mf-profile-stack">
          {PROFILE_BRANCH_SERVICES.map((item) => (
            <label className="mf-profile-checkbox" key={item.value}>
              <input
                type="checkbox"
                checked={draftServices.includes(item.value)}
                onChange={() =>
                  setDraftServices((current) =>
                    current.includes(item.value)
                      ? current.filter((value) => value !== item.value)
                      : [...current, item.value],
                  )
                }
              />
              {item.label}
            </label>
          ))}
        </div>
      </ProfilePage>
    )
  if (view === 'phone')
    return (
      <ProfilePage title="Chiama" onBack={() => setView('detail')} onClose={onClose}>
        <p>Milano Certosa</p>
        <a className="mf-profile-button" href="tel:0281681311">
          02 81681311
        </a>
      </ProfilePage>
    )
  if (view === 'ubook')
    return (
      <ProfilePage
        title="UBook"
        onBack={closeDetail}
        onClose={onClose}
        footer={<ProfileButton onClick={onAppointment}>Fissa un appuntamento</ProfileButton>}
      >
        <p>
          Per effettuare le operazioni di cassa puoi recarti direttamente in Filiale, senza necessità di prendere
          appuntamento con UBook.
        </p>
        <h2>Prima di venire in Filiale</h2>
        <p>Seleziona la Filiale e l’argomento dell’appuntamento, poi scegli giorno e orario disponibili.</p>
      </ProfilePage>
    )
  if (view === 'detail')
    return (
      <ProfilePage
        title={branch.name}
        onBack={closeDetail}
        onClose={onClose}
        footer={<ProfileButton onClick={onAppointment}>Fissa un appuntamento</ProfileButton>}
      >
        <p>
          {branch.address} &nbsp; {branch.distance}
        </p>
        <ProfileTabs
          labels={['Informazioni', 'ATM', 'Percorso']}
          value={detailTab}
          onChange={setDetailTab}
          label="Dettagli filiale"
        />
        {detailTab === 'Informazioni' ? (
          <>
            <h2>Orari</h2>
            <div>
              {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map((day, index) => (
                <p key={day}>
                  {day}: {index > 4 ? 'Chiuso' : index === 4 ? '08:20-13:20, 14:30-15:45' : '08:20-13:20, 14:30-16'}
                </p>
              ))}
            </div>
            <h2>Servizio di cassa</h2>
            <h2>Agenzia</h2>
            {[
              ['ABI', '02008'],
              ['CAB', '01636'],
              ['Indirizzo', branch.address],
              ['Comune', 'Milano'],
              ['CAP', '20151'],
            ].map(([label, value]) => (
              <ProfileRow key={label} label={label} value={value} />
            ))}
            <ProfileRow label="Telefono" value="02 81681311" onClick={() => setView('phone')} />
            <ProfileRow label="Fax" value="02 81681311" />
            <ProfileRow label="Email" value="Agooo236-Italia@unicredit-eu" />
            <h2>Servizi</h2>
            <p>Agenzia abilitata a firma elettronica</p>
          </>
        ) : detailTab === 'ATM' ? (
          <>
            <h2>Sportello Bancomant N°1</h2>
            {[
              ['Prelievi', 'Prelievo contante, anticipo contante con carta di credito, prelievo smart5'],
              ['Versamenti', 'Versamento assegni, Versamento contante, Versamento contante ed assegni 24 ore su 24'],
              [
                'Informazioni',
                'Saldo e movimenti conto corrente, Saldo movimenti deposito titoli, Saldo movimenti carta, Stampa e invio IBAN',
              ],
              [
                'Servizi',
                'Rateizzazione acquisti Carta Flexia, Cambio PIN, Biglietteria ed eventi, PostoClick Trenitalia',
              ],
              [
                'Ricariche',
                'Ricariche carte prepagate, Ricarica con carta di credito, Ricarica CoopVoce, Ricarica Fastweb, Ricarica TIM, Ricarica Vodafone, Ricarica WIND',
              ],
              [
                'Pagamenti',
                'Bollette IREN, Bollettini con lettura codice a barre, Bonifici, Donazioni, Pagamenti CBILL e PagoPA, Pagamento MAV',
              ],
            ].map(([heading, body]) => (
              <section className="mf-profile-stack" key={heading}>
                <h3>{heading}</h3>
                <p>{body}</p>
              </section>
            ))}
          </>
        ) : (
          <>
            <ProfileTabs
              labels={['In auto', 'A piedi']}
              value={travel}
              onChange={setTravel}
              label="Mezzo di trasporto"
            />
            <ProfileRow label="Distanza" value="4,1 km" />
            <ProfileRow label="Tempo di percorrenza" value={travel === 'In auto' ? '13min' : '50min'} />
            <ol className="mf-profile-route-steps">
              {PROFILE_BRANCH_ROUTE.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a
              className="mf-profile-button is-secondary"
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branch.address + ' Milano Italia')}&travelmode=${travel === 'In auto' ? 'driving' : 'walking'}`}
              target="_blank"
              rel="noreferrer"
            >
              Vai a Google Maps
            </a>
          </>
        )}
      </ProfilePage>
    )
  return (
    <ProfilePage
      title={view === 'list' ? 'Elenco filiali' : 'Filiali / ATM'}
      onBack={view === 'list' ? closeDetail : onBack}
      onClose={onClose}
    >
      {view === 'map' && (
        <>
          <p>
            Seleziona i servizi che ti interessano e indica dove ti trovi per effettuare la ricerca. Potrai calcolare
            anche il percorso più rapido per raggiungere la Filiale selezionata.
          </p>
          <div className="mf-profile-branch-warning">
            <img src={a.branches.imgNavigationAndActionWarningSmallBlack} alt="" />
            <strong>
              Per effettuare le operazioni di cassa puoi recarti direttamente in Filiale, senza necessità di prendere
              appuntamento con UBook
            </strong>
          </div>
          <button type="button" className="mf-profile-info" onClick={() => setView('ubook')}>
            <strong>Per maggiori informazioni su UBook e su cosa fare prima di venire in Filiale</strong>
            <span className="mf-profile-link">CLICCA QUI ›</span>
          </button>
        </>
      )}
      <div className="mf-profile-branch-search">
        <ProfileField
          type="search"
          label="Cerca indirizzo"
          placeholder="Cerca indirizzo"
          value={query}
          onChange={(event) => {
            setPosition(false)
            setQuery(event.target.value)
          }}
        />
        <button type="button" aria-label="Filtri di ricerca" onClick={openFilters}>
          <img src={a.branchDetail.imgNavigationAndActionFilterK10} alt="" />
        </button>
      </div>
      <div className="mf-profile-branch-actions">
        <button
          type="button"
          onClick={() => {
            setQuery('Milano')
            setPosition(true)
          }}
        >
          <img src={a.branchDetail.imgNavigationAndActionLocator} alt="" />
          Posizione attuale
        </button>
        <button type="button" className="mf-profile-link" onClick={() => setView(view === 'list' ? 'map' : 'list')}>
          {view === 'list' ? 'MAPPA' : 'ELENCO FILIALI'} ›
        </button>
      </div>
      {position && <p role="status">Corso Como 84, 20154 Milano, Italia</p>}
      {services.length > 0 && (
        <div className="mf-profile-filter-tags">
          {services.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setServices((current) => current.filter((value) => value !== item))}
            >
              {PROFILE_BRANCH_SERVICES.find((service) => service.value === item)?.label} ×
            </button>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <p role="status" className="mf-profile-info">
          Nessuna filiale trovata. Prova un altro indirizzo o modifica i filtri.
        </p>
      ) : view === 'map' ? (
        <>
          <button
            type="button"
            className="mf-profile-map"
            aria-label="Apri Milano Certosa sulla mappa"
            onClick={() => {
              setBranchId(rows[0]!.id)
              setView('detail')
            }}
          >
            <img src={a.branches.imgFrame1000002929} alt="Mappa delle filiali UniCredit a Milano" />
          </button>
          {query && (
            <div>
              {rows.map((item) => (
                <ProfileRow
                  key={item.id}
                  label={item.name}
                  detail={item.address}
                  value={item.distance}
                  onClick={() => {
                    setBranchId(item.id)
                    setView('detail')
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          {rows.map((item) => (
            <ProfileRow
              key={item.id}
              label={item.name}
              detail={`Indirizzo ${item.address}`}
              value={item.distance}
              onClick={() => {
                setBranchId(item.id)
                setView('detail')
              }}
            />
          ))}
        </div>
      )}
    </ProfilePage>
  )
}
