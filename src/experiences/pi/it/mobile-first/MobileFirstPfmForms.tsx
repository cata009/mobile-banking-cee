import { useState } from 'react'
import { useDemo } from '@/app/state/demoStore'
import { validPfmAmount, validPfmSearch, type MovementSearch } from '@/features/analytics/mobileFirstPfm'
import { pfmAssets as a } from './pfmAssets'
import type { PfmMovement } from './pfmContent'
import { PfmAmount, PfmRow, PfmSegment } from './MobileFirstPfmPrimitives'

export function PfmSearchForm({
  initial,
  onApply,
}: {
  initial: MovementSearch
  onApply: (search: MovementSearch) => void
}) {
  const [search, setSearch] = useState(initial)
  return (
    <form
      className="mf-pfm-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (validPfmSearch(search)) onApply(search)
      }}
    >
      <fieldset>
        <legend>Tipologia</legend>
        {(['Spese', 'Entrate'] as const).map((direction) => (
          <label className="mf-pfm-radio" key={direction}>
            <input
              type="radio"
              name="direction"
              checked={search.direction === direction}
              onChange={() => setSearch({ ...search, direction })}
            />
            {direction}
          </label>
        ))}
      </fieldset>
      <label className="mf-pfm-search-label">
        Cerca
        <span className="mf-pfm-search-input">
          <img src={a.s.imgNavigationAndActionSearchK10} alt="" />
          <input
            type="search"
            aria-label="Ricerca per testo, note o tag"
            placeholder="Ricerca per testo, note o tag"
            value={search.query}
            onChange={(event) => setSearch({ ...search, query: event.target.value })}
          />
        </span>
      </label>
      <fieldset>
        <legend className="mf-pfm-field-title">Importo</legend>
        <div className="mf-pfm-two-fields">
          <label>
            Da
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="00,00"
              value={search.minimum}
              onChange={(event) => setSearch({ ...search, minimum: event.target.value })}
            />
          </label>
          <label>
            A
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="00,00"
              value={search.maximum}
              onChange={(event) => setSearch({ ...search, maximum: event.target.value })}
            />
          </label>
        </div>
      </fieldset>
      <div className="mf-pfm-form-footer">
        <button
          type="button"
          className="mf-pfm-secondary"
          onClick={() => setSearch({ direction: 'Spese', query: '', minimum: '', maximum: '' })}
        >
          Rimuovi
        </button>
        <button type="submit" className="mf-pfm-primary" disabled={!validPfmSearch(search)}>
          Applica
        </button>
      </div>
    </form>
  )
}

export function PfmBudgetForm({
  total,
  income,
  onSave,
}: {
  total: number
  income: number
  onSave: (total: number, income: number) => void
}) {
  const [budget, setBudget] = useState(String(total))
  const [expectedIncome, setExpectedIncome] = useState(String(income))
  const valid = validPfmAmount(budget) && validPfmAmount(expectedIncome, true)
  return (
    <form
      className="mf-pfm-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (valid) onSave(Number(budget), Number(expectedIncome))
      }}
    >
      <p>Scegli gli importi massimi di entrate e spese che pianifichi di avere ogni mese.</p>
      <label>
        Entrate medie mensili previste
        <input
          type="number"
          min="0"
          step="0.01"
          value={expectedIncome}
          onChange={(event) => setExpectedIncome(event.target.value)}
        />
      </label>
      <label>
        Budget totale
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />
      </label>
      <div className="mf-pfm-form-footer">
        <button type="submit" className="mf-pfm-primary" disabled={!valid}>
          Salva
        </button>
      </div>
    </form>
  )
}

export function PfmCategoryBudgetForm({
  initial = 0,
  average = 0,
  onSave,
}: {
  initial?: number
  average?: number
  onSave: (amount: number) => void
}) {
  const [amount, setAmount] = useState(String(initial))
  return (
    <form
      className="mf-pfm-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (validPfmAmount(amount)) onSave(Number(amount))
      }}
    >
      <p>
        La tua media di spesa mensile in questa categoria è di <PfmAmount value={average} />. Scegli l'importo massimo
        che pianifichi di spendere ogni mese.
      </p>
      <label>
        Seleziona importo massimo
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <input
        type="range"
        aria-label="Importo massimo del budget"
        min="0"
        max="4550"
        step="10"
        value={amount || '0'}
        onChange={(event) => setAmount(event.target.value)}
      />
      <PfmRow label="Risparmio mensile previsto" value={Math.max(0, average - Number(amount || 0))} />
      <div className="mf-pfm-form-footer">
        <button type="submit" className="mf-pfm-primary" disabled={!validPfmAmount(amount)}>
          Salva
        </button>
      </div>
    </form>
  )
}

export function PfmSettings({
  selected,
  onSave,
  relationships,
  excluded,
  onRestore,
}: {
  relationships: readonly { name: string; type: string; number: string; kind: string }[]
  excluded: readonly PfmMovement[]
  onRestore: (id: string) => void
  selected: readonly number[]
  onSave: (selected: number[]) => void
}) {
  const { amountsHidden } = useDemo()
  const [tab, setTab] = useState('Rapporti')
  const [selection, setSelection] = useState([...selected])
  return (
    <div className="mf-pfm-settings">
      <PfmSegment
        label="Impostazioni"
        labels={['Rapporti', 'Movimenti esclusi', 'Gestione categorie']}
        value={tab}
        onChange={(value) => {
          setTab(value)
        }}
      />
      {tab === 'Rapporti' && (
        <>
          <p>Seleziona almeno un rapporto; puoi sceglierne più di uno.</p>
          <div className="mf-pfm-relationships">
            {relationships.map((relationship, index) => (
              <label key={index} className={selection.includes(index) ? 'is-selected' : ''}>
                <span className="mf-pfm-relationship-icon">
                  <img
                    src={
                      relationship.kind === 'card'
                        ? a.settings.imgHomeBankingAndPaymentsCard
                        : a.settings.imgBankProductAndServiceAccountsV2
                    }
                    alt=""
                  />
                </span>
                <span>
                  <strong>{relationship.name}</strong>
                  <small>{relationship.type}</small>
                  <small>{amountsHidden ? '••••••••' : relationship.number}</small>
                </span>
                <input
                  type="checkbox"
                  aria-label={`${relationship.name} ${relationship.type} ${index + 1}`}
                  checked={selection.includes(index)}
                  onChange={() =>
                    setSelection(
                      selection.includes(index) ? selection.filter((id) => id !== index) : [...selection, index],
                    )
                  }
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            className="mf-pfm-primary"
            disabled={selection.length === 0}
            onClick={() => onSave(selection)}
          >
            Conferma
          </button>
        </>
      )}
      {tab === 'Movimenti esclusi' && (
        <>
          <p>Questi movimenti risultano esclusi dal conteggio sia del bilancio familiare, budget, report</p>
          {excluded.length ? (
            excluded.map((movement) => (
              <PfmRow key={movement.id} label={movement.name} value={movement.amount}>
                <button type="button" onClick={() => onRestore(movement.id)}>
                  Includi
                </button>
              </PfmRow>
            ))
          ) : (
            <p>Nessun movimento escluso.</p>
          )}
        </>
      )}
      {tab === 'Gestione categorie' && (
        <>
          <p>
            Apri un movimento dal bilancio per modificare la categoria o la sottocategoria. Le modifiche si applicano
            anche ai budget e ai report.
          </p>
        </>
      )}
    </div>
  )
}

export function PfmWealthForm({
  onSave,
}: {
  onSave: (name: string, value: number, liability: boolean, date: string, category: string) => void
}) {
  const [step, setStep] = useState(0)
  const [liability, setLiability] = useState(false)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('Mezzi di trasporto')
  const valid = name.trim() !== '' && validPfmAmount(value) && date !== ''
  return (
    <form
      className="mf-pfm-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (step === 0) setStep(1)
        else if (valid) onSave(name.trim(), Number(value), liability, date, category)
      }}
    >
      {step === 0 ? (
        <fieldset>
          <legend>Seleziona il tipo di elemento</legend>
          <label className="mf-pfm-radio">
            <input type="radio" name="kind" checked={!liability} onChange={() => setLiability(false)} />
            Risorsa
          </label>
          <label className="mf-pfm-radio">
            <input type="radio" name="kind" checked={liability} onChange={() => setLiability(true)} />
            Impegno
          </label>
        </fieldset>
      ) : (
        <>
          <p>Inserisci i dettagli di ciò che vuoi aggiungere; i campi con asterisco sono obbligatori</p>
          <label>
            Tipologia
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="Mezzi di trasporto">Auto/Moto</option>
              <option>Proprietà immobiliari</option>
              <option>Altro</option>
            </select>
          </label>
          <label>
            Titolo/Modello*
            <input
              required
              placeholder="Inserisci titolo/modello"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Valore*
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Inserisci valore"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </label>
          <label>
            Data di riferimento*
            <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </>
      )}
      <div className="mf-pfm-form-footer">
        <button type="submit" className="mf-pfm-primary" disabled={step === 1 && !valid}>
          {step === 0 ? 'Prosegui' : 'Salva'}
        </button>
      </div>
    </form>
  )
}

export function PfmBudgetGauge({ remaining, target }: { remaining: number; target: number }) {
  const { amountsHidden } = useDemo()
  return (
    <div
      className="mf-pfm-gauge"
      role="img"
      aria-label={`Budget rimanente: ${amountsHidden ? 'importo nascosto' : remaining} €`}
    >
      <svg viewBox="0 0 252 135" aria-hidden="true">
        <path d="M 15 126 A 111 111 0 0 1 237 126" fill="none" stroke="#eee" strokeWidth="22" />
        <path
          d="M 15 126 A 111 111 0 0 1 237 126"
          fill="none"
          stroke={remaining < 0 ? '#c00000' : '#32a144'}
          strokeWidth="22"
          pathLength="100"
          strokeDasharray={`${target > 0 ? Math.max(0, Math.min(100, (remaining / target) * 100)) : 0} 100`}
        />
      </svg>
      <div>
        <span>Budget rimanente</span>
        <PfmAmount value={remaining} />
      </div>
    </div>
  )
}
