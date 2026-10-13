import { useState } from 'react'
import { getMovementCategoryTrend } from '@/features/accounts-payments/mobileFirstAccounts'
import { BottomSheet } from '@/app/components/BottomSheet'
import { splitCardMovement, type CardMovementFilter } from '@/features/cards/mobileFirstCards'
import { downloadCardMovements } from '@/features/cards/mobileFirstCardsExport'
import type { ItalyCardMovement } from './cardsContent'
import { cardsAssets as a } from './cardsAssets'
import { CardAmount, CardButton, CardField, CardRow, CardQuickAction, CardsPage } from './MobileFirstCardsPrimitives'

interface Props {
  movement?: ItalyCardMovement
  shareRows?: ItalyCardMovement[]
  filter: CardMovementFilter
  onApplyFilter: (filter: CardMovementFilter) => void
  onChange: (patch: Partial<ItalyCardMovement>) => void
  onClose: () => void
  hidden: boolean
  onInstallments?: () => void
  onNotice: (title: string, message: string) => void
  movements?: readonly ItalyCardMovement[]
  asOf?: string
}
export default function MobileFirstCardsMovement({
  movement: m,
  shareRows,
  filter,
  onApplyFilter,
  onChange,
  onClose,
  hidden,
  onInstallments,
  onNotice,
  movements,
  asOf,
}: Props) {
  const [query, setQuery] = useState(filter.query ?? '')
  const [from, setFrom] = useState(filter.from ?? '')
  const [to, setTo] = useState(filter.to ?? '')
  const [min, setMin] = useState(filter.min?.toString() ?? '')
  const [max, setMax] = useState(filter.max?.toString() ?? '')
  const [period, setPeriod] = useState(0)
  const [panel, setPanel] = useState<'note' | 'exclude' | 'category' | 'split' | null>(null)
  const [note, setNote] = useState(m?.note ?? '')
  const [category, setCategory] = useState(m?.category ?? 'Altre spese')
  const [subcategory, setSubcategory] = useState(m?.subcategory ?? 'Bank transfer')
  const [split, setSplit] = useState(m?.splits?.[0] !== undefined ? Math.abs(m.splits[0]).toString() : '')
  const [category2, setCategory2] = useState(m?.splitCategories?.[1]?.category ?? 'Utenze')
  const [selected, setSelected] = useState<string[]>([])
  const validDates = !from || !to || from <= to
  const validAmounts =
    (!min || Number(min) >= 0) && (!max || Number(max) >= 0) && (!min || !max || Number(min) <= Number(max))
  if (shareRows)
    return (
      <CardsPage
        title="Condividi movimenti"
        onBack={onClose}
        onClose={onClose}
        footer={
          <>
            <CardButton
              disabled={!selected.length}
              onClick={() =>
                downloadCardMovements(
                  shareRows.filter((r) => selected.includes(r.id)),
                  'xlsx',
                  hidden,
                )
              }
            >
              Condividi Excel
            </CardButton>
            <CardButton
              disabled={!selected.length}
              onClick={() =>
                downloadCardMovements(
                  shareRows.filter((r) => selected.includes(r.id)),
                  'pdf',
                  hidden,
                )
              }
            >
              Condividi PDF
            </CardButton>
          </>
        }
      >
        <label className="mfc-check">
          <input
            type="checkbox"
            checked={shareRows.length > 0 && selected.length === shareRows.length}
            onChange={(e) => setSelected(e.target.checked ? shareRows.map((r) => r.id) : [])}
          />
          Seleziona tutti i movimenti
        </label>
        {shareRows.map((row) => (
          <label className="mfc-selection-row" key={row.id}>
            <input
              type="checkbox"
              checked={selected.includes(row.id)}
              onChange={(e) =>
                setSelected((ids) => (e.target.checked ? [...ids, row.id] : ids.filter((x) => x !== row.id)))
              }
            />
            <span>
              <b>{row.name}</b>
              <small>{row.category}</small>
              <small>{row.date}</small>
            </span>
            <CardAmount value={row.amount} hidden={hidden} />
          </label>
        ))}
      </CardsPage>
    )
  if (!m)
    return (
      <CardsPage
        title="Filtri di ricerca"
        onBack={onClose}
        onClose={onClose}
        footer={
          <div className="mfc-double-footer">
            <CardButton
              secondary
              onClick={() => {
                onApplyFilter({})
                onClose()
              }}
            >
              Rimuovi Filtri
            </CardButton>
            <CardButton
              disabled={!validDates || !validAmounts}
              onClick={() =>
                onApplyFilter({
                  query,
                  from: from || undefined,
                  to: to || undefined,
                  min: min ? Number(min) : undefined,
                  max: max ? Number(max) : undefined,
                })
              }
            >
              Applica
            </CardButton>
          </div>
        }
      >
        <h2>Ricerca per Tag</h2>
        <CardField
          label="Ricerca per Tag"
          value={query}
          onChange={setQuery}
          placeholder="Scrivi la parola chiave o il tag..."
        />
        <h2 className="mfc-space">Data</h2>
        <p>Seleziona periodo</p>
        <div className="mfc-tabs mfc-periods">
          {[1, 3, 6, 12].map((month) => (
            <button
              type="button"
              aria-pressed={period === month}
              key={month}
              onClick={() => {
                setPeriod(month)
                const reference = asOf ?? '2025-02-28'
                const date = new Date(`${reference}T12:00:00Z`)
                date.setUTCMonth(date.getUTCMonth() - month)
                setFrom(date.toISOString().slice(0, 10))
                setTo(reference)
              }}
            >
              {month}M
            </button>
          ))}
        </div>
        <h3>Personalizza periodo</h3>
        <div className="mfc-date-fields">
          <CardField label="Dal" type="date" value={from} onChange={setFrom} />
          <CardField label="Al" type="date" value={to} onChange={setTo} />
        </div>
        {!validDates && <p role="alert">La data finale deve seguire la data iniziale.</p>}
        <h2 className="mfc-space">Importo</h2>
        <div className="mfc-date-fields">
          <CardField label="Importo minimo" type="number" value={min} onChange={setMin} />
          <CardField label="Importo massimo" type="number" value={max} onChange={setMax} />
        </div>
        {!validAmounts && <p role="alert">Inserisci un intervallo di importi valido.</p>}
      </CardsPage>
    )
  const editable = m.status === 'settled'
  const parts = splitCardMovement(m.amount, Number(split))
  const details = [
    ['Insegna', m.name],
    ['Divisa', 'Eur'],
    ['Tipo Movimento', m.status === 'authorization' ? 'Pre autorizzazione' : 'Pagamento e-commerce'],
    ['Località', 'Italia'],
    ['Importo divisa originaria', <CardAmount value={m.amount} hidden={hidden} />],
    ['Cambio', '-'],
    ['Data operazione', new Date(`${m.date}T12:00:00`).toLocaleDateString('it-IT')],
    ['Ora operazione', '12:10:00'],
    ['Data registrazione', editable ? (m.bookedOn ?? m.date).split('-').reverse().join('/') : 'Da contabilizzare'],
  ] as const
  const trend = getMovementCategoryTrend(
    (movements ?? [m]).map((row) => ({
      ...row,
      splits: row.splitCategories?.map((split) => ({
        category: split.category,
        amount: Math.abs(split.amount).toFixed(2),
      })),
    })),
    m.category,
    asOf ?? m.date,
  )
  const maximum = Math.max(100, ...trend.map((month) => month.totalCents))
  return (
    <CardsPage title={m.name} onBack={onClose} onClose={onClose}>
      <b className="mfc-subtitle">{m.category}</b>
      <p className="mfc-space">Importo speso</p>
      <CardAmount value={m.amount} hidden={hidden} />
      {m.status !== 'settled' && (
        <span className="mfc-pending">{m.status === 'pending' ? 'Da contabilizzare' : 'Pre Autorizzazione'}</span>
      )}
      <div className="mfc-partner mfc-space">
        <b>Vuoi un prestito?</b>
        <button
          type="button"
          onClick={() =>
            onNotice('Richiedi ora', 'Puoi consultare i prodotti disponibili nella sezione Mutui e Prestiti.')
          }
        >
          RICHIEDI ORA <img src={a.imgNavigationAndActionForthT2} alt="" />
        </button>
      </div>
      <div className="mfc-data-grid mfc-movement-details">
        {details.map(([label, text]) => (
          <span key={label}>
            {label}
            <b>{text}</b>
          </span>
        ))}
      </div>
      {editable && (
        <>
          <CardRow
            label="Categoria"
            value={`${m.category} · ${m.subcategory ?? 'Bank transfer'}`}
            action="MODIFICA"
            onClick={() => setPanel('category')}
            ariaLabel="Modifica categoria"
          />
          <CardRow
            label={m.excluded ? 'Movimento escluso dal bilancio familiare' : 'Escludi movimento nel bilancio familiare'}
            action={m.excluded ? 'INCLUDI' : 'ESCLUDI'}
            onClick={() => setPanel('exclude')}
            ariaLabel={m.excluded ? 'Includi movimento' : 'Escludi movimento'}
          />
          <CardRow
            label="Note"
            value={m.note}
            action="MODIFICA"
            onClick={() => setPanel('note')}
            ariaLabel="Modifica note"
          />
          {m.splits && (
            <div className="mfc-info">
              <b>Movimento suddiviso</b>
              {m.splits.map((amount, i) => (
                <p key={i}>
                  <b>{m.splitCategories?.[i]?.category}</b> <CardAmount value={amount} hidden={hidden} />
                </p>
              ))}
            </div>
          )}
          <h3 className="mfc-space">Andamento nella categoria “{m.category}” del rapporto selezionato</h3>
          {hidden ? (
            <div className="mfc-info">Importi nascosti</div>
          ) : (
            <div
              className="mfc-trend"
              role="img"
              aria-label={`Andamento ${m.category}: ${trend.map((month) => `${month.label} ${month.totalCents / 100} euro`).join(', ')}`}
            >
              <div className="mfc-trend-axis">
                {[1, 2 / 3, 1 / 3, 0]
                  .map(
                    (fraction) =>
                      `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format((maximum * fraction) / 100)}€`,
                  )
                  .map((label) => (
                    <span key={label}>{label}</span>
                  ))}
              </div>
              <div className="mfc-trend-plot">
                <div className="mfc-trend-lines" aria-hidden="true">
                  <img src={a.trendGrid} alt="" />
                  <img src={a.trendGrid} alt="" />
                  <img src={a.trendGrid} alt="" />
                  <img src={a.trend} alt="" />
                </div>
                {trend.map((month, i) => (
                  <span className="mfc-trend-bar" key={month.month}>
                    {i === 11 && (
                      <b>
                        <CardAmount value={month.totalCents / 100} hidden={hidden} />
                      </b>
                    )}
                    <i style={{ height: (month.totalCents / maximum) * 68 }} />
                    <small>{month.label}</small>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mfc-quick-actions mfc-movement-actions">
            {m.amount < 0 && onInstallments && (
              <CardQuickAction
                label="Paga a rate"
                src={a.imgHomeBankingAndPaymentsInstalment}
                onClick={() => onInstallments?.()}
              />
            )}
            <CardQuickAction
              label="Contesta movimento"
              src={a.chat}
              onClick={() =>
                onNotice(
                  'Contesta movimento',
                  'Per contestare questo movimento, richiedi assistenza dalla sezione Problemi carta.',
                )
              }
            />
            {m.amount < 0 && (
              <CardQuickAction
                label="Suddividi movimento"
                src={a.imgNavigationAndActionSettings}
                onClick={() => setPanel('split')}
              />
            )}
          </div>
        </>
      )}
      {panel && (
        <BottomSheet
          title={
            panel === 'note'
              ? 'Note'
              : panel === 'exclude'
                ? m.excluded
                  ? 'Includi movimento'
                  : 'Escludi movimento'
                : panel === 'category'
                  ? 'Gestisci movimento'
                  : 'Suddividi movimento'
          }
          onClose={() => setPanel(null)}
          closeLabel="Chiudi"
          className="mfc-sheet"
        >
          {panel === 'note' && (
            <>
              <label className="mfc-field">
                Note
                <textarea aria-label="Note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <CardButton
                onClick={() => {
                  onChange({ note: note.trim() })
                  setPanel(null)
                }}
              >
                Salva
              </CardButton>
            </>
          )}
          {panel === 'exclude' && (
            <>
              <p>
                {m.excluded
                  ? 'Il movimento sarà nuovamente incluso nel bilancio familiare.'
                  : 'Il movimento non contribuirà al bilancio familiare.'}
              </p>
              <CardButton
                onClick={() => {
                  onChange({ excluded: !m.excluded })
                  setPanel(null)
                }}
              >
                {m.excluded ? 'Conferma inclusione' : 'Conferma esclusione'}
              </CardButton>
            </>
          )}
          {(panel === 'category' || panel === 'split') && (
            <>
              <label className="mfc-field">
                Categoria
                <select aria-label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {[
                    'Altre spese',
                    'Utenze',
                    'Tasse e Sanzioni',
                    'Alimentari',
                    'Trasporti',
                    'Shopping',
                    'Viaggi',
                    'Entrate',
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="mfc-field">
                Sottocategoria
                <select
                  aria-label="Sottocategoria"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  {['Bank transfer', 'Pagamento POS', 'Abbonamenti', 'Altro'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              {panel === 'split' && (
                <>
                  <p>
                    Totale movimento <CardAmount value={m.amount} hidden={hidden} />
                  </p>
                  <CardField label="Importo categoria 1" type="number" value={split} onChange={setSplit} />
                  <label className="mfc-field">
                    Categoria 2
                    <select aria-label="Categoria 2" value={category2} onChange={(e) => setCategory2(e.target.value)}>
                      {['Utenze', 'Altre spese', 'Shopping', 'Viaggi'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <p>
                    Importo categoria 2: <CardAmount value={parts?.[1] ?? 0} hidden={hidden} />
                  </p>
                </>
              )}
              <CardButton
                disabled={panel === 'split' && !parts}
                onClick={() => {
                  onChange({
                    category,
                    subcategory,
                    ...(panel === 'split' && parts
                      ? {
                          splits: parts,
                          splitCategories: [
                            { category, amount: parts[0]! },
                            { category: category2, amount: parts[1]! },
                          ],
                        }
                      : {}),
                  })
                  setPanel(null)
                }}
              >
                Salva
              </CardButton>
            </>
          )}
        </BottomSheet>
      )}
    </CardsPage>
  )
}
