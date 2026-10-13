import { useEffect, useState } from 'react'
import { createAccountPdf } from '@/features/accounts-payments/mobileFirstAccountExports'
import { useDemo } from '@/app/state/demoStore'
import {
  accountNameError,
  selectAccountFavorite,
  type MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts'
import favorite from '@/assets/mobile-first/it/account/favorite.svg'
import favoriteOff from '@/assets/mobile-first/it/account/favorite-off.svg'
import edit from '@/assets/mobile-first/it/account/edit-dark.svg'
import up from '@/assets/mobile-first/it/account/up.svg'
import down from '@/assets/mobile-first/it/account/down.svg'
import upDisabled from '@/assets/mobile-first/it/account/up-disabled.svg'
import downDisabled from '@/assets/mobile-first/it/account/down-disabled.svg'
import importIcon from '@/assets/mobile-first/it/account/import.svg'
import { AccountAmount, AccountButton, AccountPage } from './MobileFirstAccountPrimitives'

export default function MobileFirstAccountList({
  accounts,
  favorites,
  onFavorites,
  onRename,
  onSelect,
  onImport,
  onClose,
  initialPersonalize = false,
}: {
  accounts: readonly MobileFirstAccountRecord[]
  favorites: readonly string[]
  onFavorites: (ids: string[]) => void
  onRename: (number: string, name: string) => void
  onSelect: (account: MobileFirstAccountRecord) => void
  onImport: (account: MobileFirstAccountRecord) => void
  onClose: () => void
  initialPersonalize?: boolean
}) {
  const { amountsHidden } = useDemo()
  const [personalize, setPersonalize] = useState(initialPersonalize)
  const [draft, setDraft] = useState([...favorites])
  const [names, setNames] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<MobileFirstAccountRecord | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [discard, setDiscard] = useState(false)
  const [importStep, setImportStep] = useState(0)
  const [bank, setBank] = useState('FINECO')
  const [consent, setConsent] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  useEffect(
    () => () => {
      if (documentUrl) URL.revokeObjectURL(documentUrl)
    },
    [documentUrl],
  )
  const dirty = JSON.stringify(draft) !== JSON.stringify(favorites) || Object.keys(names).length > 0
  const close = () => {
    if (personalize && dirty) setDiscard(true)
    else if (personalize) setPersonalize(false)
    else onClose()
  }
  const internal = accounts.filter((a) => !a.imported)
  const preferred = draft
    .map((number) => internal.find((a) => a.number === number))
    .filter((a): a is MobileFirstAccountRecord => !!a)
  const others = internal.filter((a) => !draft.includes(a.number)).sort((a, b) => a.name.localeCompare(b.name, 'it'))
  const imported = accounts.filter((a) => a.imported)
  const move = (index: number, delta: number) => {
    const next = [...draft]
    const other = index + delta
    if (other < 0 || other >= next.length) return
    ;[next[index], next[other]] = [next[other]!, next[index]!]
    setDraft(next)
  }

  if (documentVisible)
    return (
      <AccountPage title="Integrazione contrattuale" onClose={() => setDocumentVisible(false)}>
        {documentUrl ? (
          <iframe className="mf-account-contract-pdf" src={documentUrl} title="Integrazione contrattuale PDF" />
        ) : (
          <div className="mf-account-contract">FACSIMILE</div>
        )}
      </AccountPage>
    )
  if (discard)
    return (
      <AccountPage
        title="Attenzione"
        onClose={() => setDiscard(false)}
        footer={
          <>
            <AccountButton
              onClick={() => {
                setDraft([...favorites])
                setNames({})
                setDiscard(false)
                setPersonalize(false)
              }}
            >
              Esci senza salvare
            </AccountButton>
            <AccountButton secondary onClick={() => setDiscard(false)}>
              Continua a modificare
            </AccountButton>
          </>
        }
      >
        <p className="mf-account-help">Le modifiche non sono state salvate. Vuoi uscire senza salvare?</p>
      </AccountPage>
    )
  if (editing)
    return (
      <AccountPage
        title="Modifica nome del conto"
        onClose={() => setEditing(null)}
        onBack={() => setEditing(null)}
        footer={
          <>
            <AccountButton
              onClick={() => {
                const problem = accountNameError(name)
                setError(problem)
                if (!problem) {
                  setNames({ ...names, [editing.number]: name.trim() })
                  setEditing(null)
                }
              }}
            >
              Salva modifica
            </AccountButton>
            <AccountButton secondary onClick={() => setEditing(null)}>
              Annulla
            </AccountButton>
          </>
        }
      >
        <label className="mf-account-label">
          Nome Conto
          <input value={name} maxLength={20} placeholder="Inserisci nome" onChange={(e) => setName(e.target.value)} />
        </label>
        <p className="mf-account-hint">Massimo 20 caratteri alfanumerici</p>
        {error && (
          <p role="alert" className="mf-account-error">
            {error}
          </p>
        )}
      </AccountPage>
    )

  if (importStep) {
    const title =
      importStep === 1
        ? 'Da quale banca vuoi importare un conto o una carta IBAN?'
        : importStep === 2
          ? 'Tutti i conti e carte con IBAN in un unico ambiente'
          : importStep === 3
            ? 'Firma del contratto'
            : 'Fatto! Operazione completata con successo'
    return (
      <AccountPage
        title={title}
        onClose={() => setImportStep(0)}
        onBack={importStep > 1 && importStep < 4 ? () => setImportStep(importStep - 1) : undefined}
        footer={
          <AccountButton
            disabled={importStep === 3 && !consent}
            onClick={() => {
              if (importStep === 3) {
                onImport({
                  name: 'Andrea Rossini',
                  number: `000011${225 + imported.length}`,
                  balance: 0,
                  bank,
                  imported: true,
                  iban: 'IT60X0542811101000000123458',
                })
                setImportStep(4)
              } else if (importStep === 4) setImportStep(0)
              else setImportStep(importStep + 1)
            }}
          >
            {importStep === 3 ? 'Firma' : importStep === 4 ? 'Chiudi' : 'Prosegui'}
          </AccountButton>
        }
      >
        {importStep === 1 && (
          <>
            <label className="mf-account-label">
              Paese
              <select defaultValue="Italia">
                <option>Italia</option>
              </select>
            </label>
            <label className="mf-account-label">
              Banca
              <select value={bank} onChange={(e) => setBank(e.target.value)}>
                <option>FINECO</option>
                <option>Intesa Sanpaolo</option>
                <option>BNL</option>
              </select>
            </label>
          </>
        )}
        {importStep === 2 && (
          <>
            <h3>Tutto a portata di mano</h3>
            <p className="mf-account-help">
              Grazie alla PSD2 potrai visualizzare, da Banca via Internet o da App Mobile Banking, il saldo e i
              movimenti dei tuoi conti e delle tue carte con IBAN, non solo UniCredit, ma anche di altre Banche. Potrai
              anche effettuare pagamenti da uno dei conti o carte con IBAN aggregati, in modo facile e veloce.
            </p>
            <AccountButton
              secondary
              onClick={() => {
                const pdf = createAccountPdf([], {
                  title: 'Integrazione contrattuale',
                  lines: [
                    'Tutti i conti e carte con IBAN in un unico ambiente',
                    'Hai scelto di aggiungere un conto o una carta con IBAN',
                    'che hai su altre banche.',
                    'Il documento resta a tua disposizione nel Communication Hub.',
                    'Ricordati di rinnovare il consenso alla scadenza.',
                  ],
                })
                if (typeof URL.createObjectURL === 'function')
                  setDocumentUrl(
                    URL.createObjectURL(new Blob([new Uint8Array(pdf).buffer], { type: 'application/pdf' })),
                  )
                setDocumentVisible(true)
              }}
            >
              Visualizza il documento in PDF
            </AccountButton>
          </>
        )}
        {importStep === 3 && (
          <>
            <p className="mf-account-help">
              Hai scelto di aggiungere un conto o una carta con IBAN che hai su altre banche. Qui sotto trovi
              l'integrazione contrattuale.
            </p>
            <div className="mf-account-contract">FACSIMILE</div>
            <p className="mf-account-help">Per proseguire è necessario selezionare tutte le voci sottostanti:</p>
            <label className="mf-account-check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              Confermo di aver letto l’integrazione contrattuale e autorizzo l’aggregazione del conto.
            </label>
          </>
        )}
        {importStep === 4 && (
          <p className="mf-account-help">
            Il consenso è ora attivo e da oggi puoi consultare i rapporti importati nella Banca via internet e sull’APP
            Mobile Banking UniCredit. Ricordati di rinnovare il consenso alla scadenza.
          </p>
        )}
      </AccountPage>
    )
  }

  const card = (account: MobileFirstAccountRecord, index?: number) => (
    <div className="mf-account-list-card" key={account.number}>
      <button
        type="button"
        className="mf-account-list-card-main"
        aria-label={`${account.name} ${amountsHidden ? 'conto nascosto' : account.number}`}
        onClick={() => {
          if (!personalize) onSelect(account)
        }}
        disabled={personalize}
      >
        <strong>{names[account.number] ?? account.name}</strong>
        <small>
          {amountsHidden ? '•••••••••' : account.number} - {account.bank ?? 'UniCredit'}
        </small>
        <div>
          <AccountAmount value={account.balance} hidden={amountsHidden} />
          <small>Saldo disponibile</small>
        </div>
      </button>
      {personalize && (
        <>
          <button
            className="mf-account-list-edit"
            type="button"
            aria-label={`Modifica nome ${account.name}`}
            onClick={() => {
              setEditing(account)
              setName(names[account.number] ?? (account.name.length <= 20 ? account.name : ''))
              setError(null)
            }}
          >
            <img src={edit} alt="" />
          </button>
          {!account.imported && (
            <button
              className="mf-account-list-favorite"
              type="button"
              aria-label={`Preferito ${account.name}`}
              aria-pressed={draft.includes(account.number)}
              onClick={() => setDraft(selectAccountFavorite(draft, account.number, !!account.imported))}
            >
              <img src={draft.includes(account.number) ? favorite : favoriteOff} alt="" />
            </button>
          )}
          {index !== undefined && (
            <div className="mf-account-list-order">
              <button
                type="button"
                aria-label={`Sposta in alto ${account.name}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <img src={index === 0 ? upDisabled : up} alt="" />
              </button>
              <button
                type="button"
                aria-label={`Sposta in basso ${account.name}`}
                disabled={index === preferred.length - 1}
                onClick={() => move(index, 1)}
              >
                <img src={index === preferred.length - 1 ? downDisabled : down} alt="" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <AccountPage
      title="Tutti i conti"
      list
      onClose={close}
      helpText={personalize ? 'Puoi scegliere fino a due conti UniCredit preferiti e modificarne l’ordine.' : undefined}
      footer={
        personalize ? (
          <AccountButton
            disabled={!dirty}
            onClick={() => {
              onFavorites(draft)
              Object.entries(names).forEach(([number, value]) => onRename(number, value))
              setNames({})
              setPersonalize(false)
            }}
          >
            Salva modifica
          </AccountButton>
        ) : (
          <button
            type="button"
            className="mf-account-text-action mf-account-list-customize"
            aria-label="Personalizza vista"
            onClick={() => {
              setDraft([...favorites])
              setPersonalize(true)
            }}
          >
            Personalizza vista
            <img src={edit} alt="" />
          </button>
        )
      }
    >
      <section className="mf-account-list-section" aria-label="Preferiti">
        <h3>Preferiti</h3>
        {personalize && (
          <p className="mf-account-help">
            Puoi spostare i tuoi conti preferiti per posizionarli secondo l'ordine desiderato.
          </p>
        )}
        {preferred.map((a, index) => card(a, index))}
        {preferred.length === 0 && (
          <p className="mf-account-help">Seleziona i conti che vuoi aggiungere ai preferiti.</p>
        )}
      </section>
      <section className="mf-account-list-section" aria-label="Tutti i conti UniCredit">
        <h3>Tutti i conti UniCredit</h3>
        {others.map((a, index) => (
          <div key={a.number} id={`mf-conti-letter-${a.name[0]}`}>
            {(index === 0 || a.name[0] !== others[index - 1]?.name[0]) && (
              <p className="mf-account-letter">{a.name[0]}</p>
            )}
            {card(a)}
          </div>
        ))}
      </section>
      {imported.length > 0 && (
        <section className="mf-account-list-section" aria-label="Conti importati">
          <h3>Conti importati</h3>
          {imported.map((a) => card(a))}
        </section>
      )}
      <button
        type="button"
        className="mf-account-share-info"
        onClick={() => {
          setConsent(false)
          setImportStep(1)
        }}
      >
        <span>
          <img src={importIcon} alt="" />
        </span>
        Importa
        <br />
        conto
      </button>
      <nav className="mf-account-alphabet" aria-label="Indice alfabetico">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
          <button
            type="button"
            aria-label={`Vai alla lettera ${letter}`}
            key={letter}
            onClick={() =>
              document
                .getElementById(`mf-conti-letter-${letter}`)
                ?.scrollIntoView({ block: 'start', behavior: 'smooth' })
            }
          >
            {letter}
          </button>
        ))}
      </nav>
    </AccountPage>
  )
}
