import { useState } from 'react'
import {
  addWatchlistInstrument,
  getSecurity,
  securities,
  validateListName,
  canCreateWatchlist,
  type SecuritiesState,
} from '@/features/investments/mobileFirstSecurities'
import {
  InvestmentAmount,
  InvestmentButton,
  InvestmentPage,
  InvestmentRows,
  InvestmentTabs,
} from './MobileFirstInvestmentPrimitives'
import {
  SecuritiesError,
  SecuritiesField,
  SecuritiesLink,
  SecuritiesQuote,
} from './MobileFirstInvestmentSecuritiesElements'
import add from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionAdd.svg'

export default function MobileFirstInvestmentSecuritiesLists({
  virtual = false,
  instrument,
  action,
  state,
  onState,
  onSecurity,
  onBack,
  onClose,
}: {
  virtual?: boolean
  instrument?: string
  action?: string
  state: SecuritiesState
  onState: (state: SecuritiesState) => void
  onSecurity: (id: string, action?: string, portfolioId?: string) => void
  onBack: () => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [edit, setEdit] = useState<'new' | 'rename' | null>(null)
  const [manage, setManage] = useState(false)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<{ id: string; instrument?: string } | null>(null)
  const [tab, setTab] = useState('Portafoglio')
  const lists = virtual ? state.virtualPortfolios : state.watchlists
  const selectedList = lists.find((list) => list.id === selected)
  const watchlist = state.watchlists.find((list) => list.id === selected)
  const portfolio = state.virtualPortfolios.find((list) => list.id === selected)
  const targetInstrument = instrument ? getSecurity(instrument).id : null
  const back = () => {
    setError(null)
    setMessage(null)
    if (edit) setEdit(null)
    else if (adding) setAdding(false)
    else if (selected) {
      setSelected(null)
      setManage(false)
    } else if (manage) setManage(false)
    else onBack()
  }
  const save = () => {
    if (edit === 'new' && !virtual && !canCreateWatchlist(lists.length)) {
      setError('Hai raggiunto il numero massimo di 10 liste.')
      return
    }
    const validation = validateListName(name, lists, edit === 'rename' ? selectedList?.name : undefined)
    if (validation) {
      setError(validation)
      return
    }
    const id = edit === 'new' ? String(Date.now()) : selected!
    if (virtual)
      onState({
        ...state,
        virtualPortfolios:
          edit === 'new'
            ? [...state.virtualPortfolios, { id, name: name.trim(), positions: [], transactions: [] }]
            : state.virtualPortfolios.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
      })
    else
      onState({
        ...state,
        watchlists:
          edit === 'new'
            ? [...state.watchlists, { id, name: name.trim(), instruments: [] }]
            : state.watchlists.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
      })
    setSelected(id)
    setEdit(null)
    setError(null)
    setMessage(edit === 'new' ? (virtual ? 'Portafoglio creato' : 'Watchlist creata') : 'Nome modificato')
  }
  const addInstrument = (listId: string, securityId: string) => {
    const list = state.watchlists.find((p) => p.id === listId)
    if (!list) return
    const result = addWatchlistInstrument(list, securityId)
    if (result.error) {
      setError(result.error)
      return
    }
    onState({ ...state, watchlists: state.watchlists.map((p) => (p.id === listId ? result.list : p)) })
    setMessage(`${getSecurity(securityId).name} aggiunto alla watchlist ${list.name}`)
    setError(null)
  }
  const remove = () => {
    if (!deleting) return
    if (deleting.instrument)
      onState({
        ...state,
        watchlists: state.watchlists.map((list) =>
          list.id === deleting.id
            ? { ...list, instruments: list.instruments.filter((id) => id !== deleting.instrument) }
            : list,
        ),
      })
    else {
      if (virtual)
        onState({ ...state, virtualPortfolios: state.virtualPortfolios.filter((list) => list.id !== deleting.id) })
      else onState({ ...state, watchlists: state.watchlists.filter((list) => list.id !== deleting.id) })
      if (selected === deleting.id) setSelected(null)
    }
    setDeleting(null)
    setMessage('Eliminazione completata')
  }
  const title =
    edit === 'new'
      ? virtual
        ? 'Nuovo portafoglio'
        : 'Nuova watchlist'
      : edit === 'rename'
        ? virtual
          ? 'Modifica nome portafoglio'
          : 'Rinomina lista'
        : (selectedList?.name ??
          (virtual ? 'Portafoglio virtuale' : action === 'add' ? 'Aggiungi alla watchlist' : 'Watchlist'))
  return (
    <InvestmentPage
      title={title}
      onBack={back}
      onClose={onClose}
      footer={edit ? <InvestmentButton onClick={save}>Salva</InvestmentButton> : undefined}
    >
      <div className="mfis-content">
        <SecuritiesError>{error}</SecuritiesError>
        {message && (
          <p role="status" className="mfis-notice">
            {message}
          </p>
        )}
        {edit ? (
          <>
            <p>
              {edit === 'new' ? 'Inserisci il nome per creare una nuova lista.' : 'Modifica il nome della tua lista.'}
            </p>
            <SecuritiesField
              label={virtual ? 'Nome portafoglio' : 'Nome lista'}
              value={name}
              onChange={(value) => {
                setName(value)
                setError(null)
              }}
              hint="Massimo 30 caratteri"
            />
          </>
        ) : !selectedList ? (
          <>
            <p>
              {virtual
                ? 'Nella sezione “Portafoglio Virtuale” puoi creare portafogli attraverso la simulazione di acquisti e vendite di strumenti finanziari quotati sui diversi mercati e monitorarne il relativo andamento.'
                : 'Scopri le tue watchlist in cui inserire gli strumenti di maggiore interesse. Crea fino a 10 liste.'}
            </p>
            {virtual && (
              <p className="mfis-disclaimer">
                Tali simulazioni non tengono conto delle tue caratteristiche e non danno evidenza di eventuali
                avvertenze contrattualmente o normativamente dovute.
              </p>
            )}
            <div className="mfis-section-title">
              <h3>{virtual ? 'I tuoi portafogli' : 'Le tue liste'}</h3>
              <SecuritiesLink disabled={!lists.length} onClick={() => setManage(!manage)}>
                {manage ? 'Fine' : virtual ? 'Gestisci' : 'Gestisci liste'}
              </SecuritiesLink>
            </div>
            <div className="mfis-list-grid">
              <button
                type="button"
                className="mfis-list-tile"
                disabled={!virtual && lists.length >= 10}
                onClick={() => {
                  setEdit('new')
                  setName('')
                  setError(null)
                }}
              >
                <strong>{virtual ? 'Nuovo portafoglio' : 'Nuova lista'}</strong>
                <small>{virtual ? 'Crea nuovo portafoglio' : 'Aggiungi strumenti'}</small>
                <span className="mfis-add">
                  <img src={add} alt="" />
                </span>
              </button>
              {lists.map((list) => {
                const count = 'instruments' in list ? list.instruments.length : list.positions.length
                return (
                  <article className="mfis-list-tile" key={list.id}>
                    <strong>{list.name}</strong>
                    <small>Numero di strumenti</small>
                    <span className="mfis-count">
                      {count}
                      {!virtual && <small>/20</small>}
                    </span>
                    <SecuritiesLink
                      onClick={() => {
                        if (action === 'add' && targetInstrument) addInstrument(list.id, targetInstrument)
                        else {
                          setSelected(list.id)
                          setManage(false)
                          setMessage(null)
                        }
                      }}
                    >
                      {action === 'add' ? 'Aggiungi qui' : virtual ? 'Apri portafoglio' : 'Apri lista'}
                    </SecuritiesLink>
                    {manage && (
                      <SecuritiesLink onClick={() => setDeleting({ id: list.id })}>Elimina {list.name}</SecuritiesLink>
                    )}
                  </article>
                )
              })}
            </div>
            {!virtual && lists.length >= 10 && (
              <p className="mfis-notice">Hai raggiunto il numero massimo di 10 liste.</p>
            )}
          </>
        ) : (
          <>
            <div className="mfis-section-title">
              <h3>{selectedList.name}</h3>
              <SecuritiesLink onClick={() => setManage(!manage)}>
                {manage ? 'Fine' : virtual ? 'Gestisci portafoglio' : 'Gestisci lista'}
              </SecuritiesLink>
            </div>
            {manage && (
              <div className="mfis-actions">
                <SecuritiesLink
                  onClick={() => {
                    setName(selectedList.name)
                    setEdit('rename')
                  }}
                >
                  Rinomina
                </SecuritiesLink>
                <SecuritiesLink onClick={() => setDeleting({ id: selectedList.id })}>Elimina lista</SecuritiesLink>
              </div>
            )}
            {virtual ? (
              <>
                <InvestmentTabs labels={['Portafoglio', 'Transazioni virtuali']} value={tab} onChange={setTab} />
                {tab === 'Portafoglio' ? (
                  <>
                    <InvestmentRows
                      rows={[
                        {
                          label: 'Controvalore di mercato',
                          value: (
                            <InvestmentAmount
                              value={
                                portfolio?.positions.reduce(
                                  (sum, p) => sum + p.quantity * getSecurity(p.securityId).price,
                                  0,
                                ) ?? 0
                              }
                            />
                          ),
                        },
                        { label: 'Numero di strumenti', value: portfolio?.positions.length ?? 0 },
                      ]}
                    />
                    {!portfolio?.positions.length && (
                      <p>Il tuo portafoglio virtuale è vuoto. Aggiungi uno strumento per iniziare.</p>
                    )}
                    {portfolio?.positions.map((p) => (
                      <div key={p.securityId}>
                        <SecuritiesQuote
                          security={{ ...getSecurity(p.securityId), quantity: p.quantity }}
                          position
                          onClick={() => onSecurity(p.securityId, 'virtual-buy', selectedList.id)}
                        />
                        <div className="mfis-actions">
                          <SecuritiesLink onClick={() => onSecurity(p.securityId, 'virtual-buy', selectedList.id)}>
                            Acquista virtuale
                          </SecuritiesLink>
                          <SecuritiesLink onClick={() => onSecurity(p.securityId, 'virtual-sell', selectedList.id)}>
                            Vendi virtuale
                          </SecuritiesLink>
                        </div>
                      </div>
                    ))}
                    <InvestmentButton onClick={() => setAdding(!adding)}>Aggiungi strumento</InvestmentButton>
                  </>
                ) : (
                  <>
                    {!portfolio?.transactions.length && <p>Non sono presenti transazioni virtuali.</p>}
                    {portfolio?.transactions.map((t, i) => (
                      <article className="mfis-quote" key={`${t.securityId}-${i}`}>
                        <strong>{getSecurity(t.securityId).name}</strong>
                        <InvestmentRows
                          rows={[
                            { label: 'Causale', value: t.action },
                            { label: 'Quantità', value: t.quantity },
                            { label: 'Prezzo', value: <InvestmentAmount value={t.price} /> },
                            { label: 'Data', value: t.date },
                          ]}
                        />
                      </article>
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                {!watchlist?.instruments.length && <p>La lista è vuota. Aggiungi i tuoi strumenti preferiti.</p>}
                {watchlist?.instruments.map((id) => (
                  <div key={id}>
                    <SecuritiesQuote security={getSecurity(id)} onClick={() => onSecurity(id)} />
                    {manage && (
                      <SecuritiesLink onClick={() => setDeleting({ id: selectedList.id, instrument: id })}>
                        Elimina {getSecurity(id).name}
                      </SecuritiesLink>
                    )}
                  </div>
                ))}
                <InvestmentButton
                  disabled={(watchlist?.instruments.length ?? 0) >= 20}
                  onClick={() => setAdding(!adding)}
                >
                  {adding ? 'Chiudi ricerca' : 'Aggiungi strumenti'}
                </InvestmentButton>
                {(watchlist?.instruments.length ?? 0) >= 20 && (
                  <p className="mfis-notice">Hai raggiunto il numero massimo di 20 strumenti per lista.</p>
                )}
              </>
            )}
            {adding && (
              <>
                <SecuritiesField label="Cerca strumenti" value={query} onChange={setQuery} />
                {securities
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(query.toLowerCase()) ||
                      s.isin.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((s) => (
                    <div className="mfis-search-result" key={s.id}>
                      <div>
                        <strong>{s.name}</strong>
                        <small>{s.isin}</small>
                      </div>
                      <SecuritiesLink
                        onClick={() =>
                          virtual
                            ? onSecurity(s.id, 'virtual-buy', selectedList.id)
                            : addInstrument(selectedList.id, s.id)
                        }
                      >
                        Aggiungi {s.name}
                      </SecuritiesLink>
                    </div>
                  ))}
              </>
            )}
          </>
        )}
        {deleting && (
          <div role="alertdialog" aria-label="Conferma eliminazione" className="mfis-confirm">
            <h3>Confermi l’eliminazione?</h3>
            <p>
              {deleting.instrument
                ? `Lo strumento ${getSecurity(deleting.instrument).name} sarà rimosso dalla lista.`
                : 'La lista e il suo contenuto verranno eliminati.'}
            </p>
            <InvestmentButton onClick={remove}>Sì, elimina</InvestmentButton>
            <SecuritiesLink onClick={() => setDeleting(null)}>No, chiudi</SecuritiesLink>
          </div>
        )}
      </div>
    </InvestmentPage>
  )
}
