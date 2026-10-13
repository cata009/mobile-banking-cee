import { useState } from 'react'
import { useDemo } from '@/app/state/demoStore'
import {
  accountSplitError,
  getMovementCategoryTrend,
  type AccountMovement,
  type AccountMovementChanges,
} from '@/features/accounts-payments/mobileFirstAccounts'
import receiptDivider from '@/assets/mobile-first/it/account/receipt-divider.svg'
import chartGrid from '@/assets/mobile-first/it/account/chart-grid.png'
import chartBase from '@/assets/mobile-first/it/account/chart-base.svg'
import expenses from '@/assets/mobile-first/it/account/expenses.svg'
import { ACCOUNT_CATEGORIES } from './accountContent'
import {
  AccountAmount,
  AccountButton,
  AccountField,
  AccountPage,
  AccountSettingRow,
} from './MobileFirstAccountPrimitives'

export type { AccountMovementChanges } from '@/features/accounts-payments/mobileFirstAccounts'

export default function MobileFirstAccountMovement({
  movement,
  changes,
  onSave,
  onClose,
  movements = [movement],
  asOf = movement.date,
}: {
  movement: AccountMovement
  changes: AccountMovementChanges
  onSave: (changes: AccountMovementChanges) => void
  onClose: () => void
  movements?: readonly AccountMovement[]
  asOf?: string
}) {
  const { amountsHidden } = useDemo()
  const amountCents = Math.round(Math.abs(movement.amount) * 100)
  const firstSplitCents = Math.floor(amountCents / 2)
  const [view, setView] = useState<'detail' | 'manage' | 'split' | 'notes' | 'exclude'>('detail')
  const [category, setCategory] = useState(changes.category ?? movement.category)
  const [subcategory, setSubcategory] = useState(changes.subcategory ?? 'Bank transfer')
  const [note, setNote] = useState(changes.note ?? '')
  const [parts, setParts] = useState<{ category: string; amount: string }[]>(
    changes.splits
      ? [...changes.splits]
      : [
          { category, amount: (firstSplitCents / 100).toFixed(2) },
          { category: 'Casa', amount: ((amountCents - firstSplitCents) / 100).toFixed(2) },
        ],
  )
  const [error, setError] = useState<string | null>(null)
  const [chartMonth, setChartMonth] = useState(11)
  const back = () => {
    setView('detail')
    setError(null)
  }
  const save = (value: AccountMovementChanges) => {
    onSave({ ...changes, ...value })
    back()
  }
  const currentCategory = changes.category ?? movement.category
  const date = movement.date.split('-').reverse().join('/')

  if (view === 'notes')
    return (
      <AccountPage
        title="Note"
        onClose={back}
        onBack={back}
        footer={<AccountButton onClick={() => save({ note: note.trim() })}>Salva</AccountButton>}
      >
        <label className="mf-account-label">
          Note
          <textarea
            value={note}
            maxLength={150}
            placeholder="Scrivi qui una nota..."
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <p className="mf-account-hint">Massimo 150 caratteri · {note.length}/150</p>
      </AccountPage>
    )
  if (view === 'exclude')
    return (
      <AccountPage
        title={changes.excluded ? 'Includi Movimento' : 'Escludi Movimento'}
        onClose={back}
        onBack={back}
        footer={
          <>
            <AccountButton onClick={() => save({ excluded: !changes.excluded })}>
              {changes.excluded ? 'Includi' : 'Escludi'}
            </AccountButton>
            <AccountButton secondary onClick={back}>
              Annulla
            </AccountButton>
          </>
        }
      >
        <p className="mf-account-help">
          {changes.excluded
            ? 'Il movimento sarà nuovamente incluso nell’analisi del Bilancio Familiare.'
            : 'Cliccando su Escludi non troverai più il movimento nell’analisi del Bilancio Familiare. Rimarrà comunque visibile nella sezione di riferimento (Conti o Carte).'}
        </p>
      </AccountPage>
    )
  if (view === 'manage')
    return (
      <AccountPage
        title="Gestisci movimento"
        onClose={back}
        onBack={back}
        footer={
          <AccountButton
            disabled={category === currentCategory && subcategory === (changes.subcategory ?? 'Bank transfer')}
            onClick={() => save({ category, subcategory })}
          >
            Salva
          </AccountButton>
        }
      >
        <h3>Categoria 1</h3>
        <label className="mf-account-label">
          Categoria
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setSubcategory('Altro')
            }}
          >
            {ACCOUNT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="mf-account-label">
          Sottocategoria
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
            {['Bank transfer', 'Altro', 'Abbonamenti', 'Energia', 'Acqua', 'Affitto', 'Spese per la casa'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <h3>Suddividi movimento</h3>
        <p className="mf-account-help">Puoi suddividere un movimento fino a 6 categorie</p>
        <button type="button" className="mf-account-text-action" onClick={() => setView('split')}>
          Suddividi
        </button>
      </AccountPage>
    )
  if (view === 'split')
    return (
      <AccountPage
        title="Suddividi movimento"
        onClose={() => setView('manage')}
        onBack={() => setView('manage')}
        footer={
          <AccountButton
            disabled={amountsHidden}
            onClick={() => {
              const problem = accountSplitError(movement.amount, parts)
              setError(problem)
              if (!problem) save({ splits: parts, category: parts[0]!.category })
            }}
          >
            Salva
          </AccountButton>
        }
      >
        <AccountField label="Totale movimento">
          <AccountAmount value={movement.amount} hidden={amountsHidden} />
        </AccountField>
        {parts.map((part, index) => (
          <section className="mf-account-split-part" key={index}>
            <h3>Categoria {index + 1}</h3>
            <label className="mf-account-label">
              Categoria {index + 1}
              <select
                value={part.category}
                onChange={(e) => setParts(parts.map((p, i) => (i === index ? { ...p, category: e.target.value } : p)))}
              >
                {ACCOUNT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="mf-account-label">
              Importo {index + 1}
              <input
                type={amountsHidden ? 'text' : 'number'}
                disabled={amountsHidden}
                placeholder="**,** €"
                min="0.01"
                step="0.01"
                value={amountsHidden ? '' : part.amount}
                onChange={(e) => setParts(parts.map((p, i) => (i === index ? { ...p, amount: e.target.value } : p)))}
              />
            </label>
            {parts.length > 2 && (
              <button
                type="button"
                className="mf-account-text-action"
                aria-label={`Rimuovi categoria ${index + 1}`}
                onClick={() => setParts(parts.filter((_, i) => i !== index))}
              >
                Rimuovi categoria
              </button>
            )}
          </section>
        ))}
        <button
          type="button"
          className="mf-account-text-action"
          disabled={parts.length >= 6}
          onClick={() => setParts([...parts, { category: 'Altre spese', amount: '' }])}
        >
          Aggiungi categoria
        </button>
        {error && (
          <p role="alert" className="mf-account-error">
            {error}
          </p>
        )}
      </AccountPage>
    )

  const trend = getMovementCategoryTrend(movements, currentCategory, asOf)
  const maximum = Math.max(100, ...trend.map((month) => month.totalCents))
  return (
    <AccountPage
      title={movement.pending ? 'Movimento da contabilizzare' : movement.amount > 0 ? 'Entrata' : 'Altro'}
      subtitle={movement.name}
      onClose={onClose}
      helpText={
        movement.pending
          ? 'Il movimento è in attesa di contabilizzazione. L’importo può essere aggiornato quando l’operazione sarà contabilizzata.'
          : 'Consulta i dettagli del movimento. Puoi cambiarne la categoria, aggiungere una nota o escluderlo dal Bilancio Familiare.'
      }
    >
      <AccountField label={movement.amount > 0 ? 'Importo ricevuto' : 'Importo speso'}>
        <AccountAmount value={movement.amount} hidden={amountsHidden} />
      </AccountField>
      <div className="mf-account-receipt-divider" aria-hidden="true">
        <img src={receiptDivider} alt="" />
      </div>
      <div className="mf-account-info-grid">
        <AccountField label="Insegna">{movement.name}</AccountField>
        <AccountField label="Divisa">Eur</AccountField>
        <AccountField label="Tipo Movimento">
          {movement.amount > 0 ? 'Bonifico ricevuto' : 'Pagamento e-commerce'}
        </AccountField>
        <AccountField label="Località">Italia</AccountField>
        <AccountField label="Importo divisa originaria">
          <AccountAmount value={movement.amount} hidden={amountsHidden} />
        </AccountField>
        <AccountField label="Cambio">-</AccountField>
        <AccountField label="Data operazione">{date}</AccountField>
        <AccountField label="Ora operazione">12:10:00</AccountField>
        {!movement.pending && (
          <AccountField label="Data registrazione">
            {(movement.bookedOn ?? movement.date).split('-').reverse().join('/')}
          </AccountField>
        )}
      </div>
      {!movement.pending && (
        <>
          <div className="mf-account-receipt-divider" aria-hidden="true">
            <img src={receiptDivider} alt="" />
          </div>
          <AccountSettingRow label="Categoria" action="Modifica" editIcon onClick={() => setView('manage')} />
          <div className="mf-account-movement-category">
            <span className="mf-account-category mf-account-category-expenses">
              <img src={expenses} alt="" />
            </span>
            <span>
              {currentCategory}
              <strong>{changes.subcategory ?? 'Bank transfer'}</strong>
            </span>
          </div>
          {changes.splits?.map((part, index) => (
            <AccountField key={index} label={part.category}>
              <AccountAmount value={Math.sign(movement.amount) * Number(part.amount)} hidden={amountsHidden} />
            </AccountField>
          ))}
          <div className="mf-account-receipt-divider" aria-hidden="true">
            <img src={receiptDivider} alt="" />
          </div>
          <AccountSettingRow
            label={`${changes.excluded ? 'Includi' : 'Escludi'} movimento nel bilancio familiare`}
            action={changes.excluded ? 'Includi' : 'Escludi'}
            onClick={() => setView('exclude')}
          />
          <div className="mf-account-receipt-divider" aria-hidden="true">
            <img src={receiptDivider} alt="" />
          </div>
          <AccountSettingRow
            label="Note"
            value={changes.note}
            action="Modifica"
            editIcon
            onClick={() => setView('notes')}
          />
          <div className="mf-account-receipt-divider" aria-hidden="true">
            <img src={receiptDivider} alt="" />
          </div>
          <h3 className="mf-account-chart-heading">
            Andamento nella categoria “{currentCategory}” del rapporto selezionato
          </h3>
          <div className="mf-account-category-chart" aria-label={`Andamento ${currentCategory}`}>
            <div className="mf-account-chart-grid" aria-hidden="true">
              {[0, 1, 2].map((line) => (
                <img key={line} src={chartGrid} alt="" width={305} height={1} />
              ))}
              <img src={chartBase} alt="" />
            </div>
            <div className="mf-account-chart-scale" aria-hidden="true">
              {[1, 2 / 3, 1 / 3, 0].map((fraction) => (
                <span key={fraction}>
                  {new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format((maximum * fraction) / 100)}€
                </span>
              ))}
            </div>
            <div className="mf-account-chart-bars">
              {trend.map((month, i) => (
                <button
                  type="button"
                  key={month.month}
                  aria-label={`${month.label} ${amountsHidden ? 'importo nascosto' : `${month.totalCents / 100} euro`}`}
                  aria-pressed={chartMonth === i}
                  onClick={() => setChartMonth(i)}
                >
                  <span style={{ height: amountsHidden ? 24 : (month.totalCents / maximum) * 70 }} />
                  <small>{month.label}</small>
                </button>
              ))}
            </div>
            {!amountsHidden && (
              <div className="mf-account-chart-value">
                <AccountAmount value={trend[chartMonth]!.totalCents / 100} hidden={false} />
              </div>
            )}
          </div>
        </>
      )}
    </AccountPage>
  )
}
