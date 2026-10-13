import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getItalyFinancialSnapshot, subscribeItalyFinancialChanges } from '@/features/finance/italyFinancials'
import { BottomSheet } from '@/app/components/BottomSheet'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDemo } from '@/app/state/demoStore'
import selected from '@/assets/mobile-first/it/account/imgEllipse28.svg'
import chevron from '@/assets/mobile-first/it/account/imgNavigationAndActionForthK11.svg'
import selectedChevron from '@/assets/mobile-first/it/account/selected-chevron.svg'
import tealChevron from '@/assets/mobile-first/it/account/imgNavigationAndActionForthT2.svg'
import whiteChevron from '@/assets/mobile-first/it/account/imgNavigationAndActionForthK10.svg'
import search from '@/assets/mobile-first/it/account/imgNavigationAndActionSearchK10.svg'
import transfer from '@/assets/mobile-first/it/account/imgHomeBankingAndPaymentsTransferK10.svg'
import settings from '@/assets/mobile-first/it/account/imgNavigationAndActionSettingsK10.svg'
import frequent from '@/assets/mobile-first/it/account/imgHomeBankingAndPaymentsFastPaymentsK10.svg'
import share from '@/assets/mobile-first/it/account/imgNavigationAndActionShareK10.svg'
import divider from '@/assets/mobile-first/it/account/imgLineBottom1.svg'
import utilities from '@/assets/mobile-first/it/account/utilities.svg'
import taxes from '@/assets/mobile-first/it/account/taxes.svg'
import expenses from '@/assets/mobile-first/it/account/expenses.svg'
import incomes from '@/assets/mobile-first/it/account/incomes.svg'
import {
  ACCOUNT_ACTIONS,
  ACCOUNT_DIRECTORY,
  ACCOUNT_IMPORTED_DIRECTORY,
  type AccountTransaction,
} from './accountContent'
import type {
  AccountMovement,
  AccountSearchFilters,
  MobileFirstAccountRecord,
} from '@/features/accounts-payments/mobileFirstAccounts'
import {
  EMPTY_ACCOUNT_FILTERS,
  getAccountMovementChanges,
  saveAccountMovementChanges,
  subscribeAccountMovementChanges,
  getAccountPreferences,
  saveAccountFavorites,
  saveAccountName,
  saveImportedAccount,
  getAccountLedgerRecord,
  getAccountLedgerMovements,
} from '@/features/accounts-payments/mobileFirstAccounts'
import { AccountAmount, AccountProfileContext } from './MobileFirstAccountPrimitives'
import MobileFirstDetailHeader from './MobileFirstDetailHeader'
import MobileFirstAccountSettings from './MobileFirstAccountSettings'
import MobileFirstAccountList from './MobileFirstAccountList'
import MobileFirstAccountMovement from './MobileFirstAccountMovement'
import MobileFirstAccountSearch from './MobileFirstAccountSearch'
import './mobile-first.css'
import './mobile-first-account.css'

type Account = MobileFirstAccountRecord

interface MobileFirstAccountProps {
  account: Account
  onClose: () => void
  onProfile?: () => void
  onOperations?: () => void
  externalOverlayOpen?: boolean
  initialView?: 'detail' | 'accounts'
  initialMovementId?: string
}

type AccountSheet =
  | {
      kind:
        | 'profile'
        | 'accounts'
        | 'personalize'
        | 'settings'
        | 'info'
        | 'search'
        | 'balances'
        | 'operations'
        | 'liquidity'
        | 'partner'
    }
  | { kind: 'action'; title: string; description: string }
  | { kind: 'transaction'; transaction: AccountMovement; date: string }

const actionIcons = [transfer, settings, frequent, share] as const
const categoryIcons = { utilities, taxes, expenses, incomes }

function TransactionRow({
  transaction,
  hidden,
  onOpen,
}: {
  transaction: AccountTransaction
  hidden: boolean
  onOpen: () => void
}) {
  return (
    <>
      <button type="button" className="mf-account-transaction" onClick={onOpen}>
        <span className={`mf-account-category mf-account-category-${transaction.icon}`}>
          <img src={categoryIcons[transaction.icon]} alt="" />
        </span>
        <span className="mf-account-transaction-copy">
          <strong>{transaction.name}</strong>
          <span>{transaction.category}</span>
        </span>
        <span className={transaction.amount > 0 ? 'mf-account-incoming' : undefined}>
          <AccountAmount value={transaction.amount} signed hidden={hidden} />
        </span>
      </button>
      <span className="mf-account-divider" aria-hidden="true">
        <img src={divider} alt="" />
      </span>
    </>
  )
}

export default function MobileFirstAccount({
  account,
  onClose,
  onProfile,
  onOperations,
  externalOverlayOpen = false,
  initialView = 'detail',
  initialMovementId,
}: MobileFirstAccountProps) {
  const { amountsHidden, toggleAmountsHidden, productCounts } = useDemo()
  const financial = useSyncExternalStore(
    subscribeItalyFinancialChanges,
    getItalyFinancialSnapshot,
    getItalyFinancialSnapshot,
  )
  const preferences = useSyncExternalStore(
    subscribeAccountMovementChanges,
    getAccountPreferences,
    getAccountPreferences,
  )
  const [baseDirectory] = useState<Account[]>(() => [
    ...ACCOUNT_DIRECTORY.map((a) => (a.number === account.number ? { ...a, ...account } : a)),
    ...ACCOUNT_IMPORTED_DIRECTORY,
  ])
  const directory = [...baseDirectory, ...preferences.imported].map((a) =>
    getAccountLedgerRecord(
      {
        ...a,
        name: preferences.names[a.number] ?? a.name,
      },
      financial,
    ),
  )
  const favorites = preferences.favorites ?? ACCOUNT_DIRECTORY.slice(0, 2).map((a) => a.number)
  const [searchSession, setSearchSession] = useState<AccountSearchFilters | null>(null)
  const movementChanges = useSyncExternalStore(
    subscribeAccountMovementChanges,
    getAccountMovementChanges,
    getAccountMovementChanges,
  )
  const [pendingOpen, setPendingOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [sheet, setSheet] = useState<AccountSheet | null>(() => {
    if (initialMovementId !== undefined) {
      const movement = getAccountLedgerMovements(account.number, financial).find((m) => m.id === initialMovementId)
      if (!movement) return null
      const transaction = {
        ...movement,
        category: movement.category,
      }
      return { kind: 'transaction', transaction, date: transaction.date }
    }
    return initialView === 'accounts' ? { kind: 'accounts' } : null
  })
  const [compact, setCompact] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const currentAccount = getAccountLedgerRecord(
    directory.find((a) => a.number === (selectedAccount ?? account).number) ?? selectedAccount ?? account,
    financial,
  )
  const allMovements = getAccountLedgerMovements(currentAccount.number, financial)
  const movements = allMovements.filter((row) => !row.pending)
  const pendingMovements = allMovements.filter((row) => row.pending)
  const accountChoices = directory.filter(
    (a) =>
      a.imported ||
      ACCOUNT_DIRECTORY.findIndex((entry) => entry.number === a.number) < Math.max(1, productCounts.accounts),
  )
  const renameAccount = saveAccountName
  const filter = query.trim().toLocaleLowerCase('it-IT')
  const transactionGroups = [...new Set(movements.map((row) => row.date))]
    .map((date) => ({
      date:
        date === financial.asOf
          ? 'Oggi'
          : new Date(`${date}T12:00:00Z`)
              .toLocaleDateString('it-IT', { day: 'numeric', month: 'long', timeZone: 'UTC' })
              .replace(/ [a-z]/, (match) => match.toLocaleUpperCase('it-IT')),
      transactions: movements
        .filter((m) => m.date === date)
        .filter((transaction) =>
          `${transaction.name} ${transaction.category}`.toLocaleLowerCase('it-IT').includes(filter),
        ),
    }))
    .filter((group) => group.transactions.length > 0)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || sheet || externalOverlayOpen) return
      if (searchOpen) {
        setSearchOpen(false)
        setCompact(false)
        setQuery('')
      } else onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, sheet, searchOpen, externalOverlayOpen])

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus({ preventScroll: true })
      if (compact) scrollRef.current?.scrollTo?.({ top: 0 })
    }
  }, [searchOpen, compact])

  const openAction = (index: number) => {
    const action = ACCOUNT_ACTIONS[index]!
    if (index === 2) {
      setSheet(null)
      scrollRef.current?.scrollTo?.({ top: 336, behavior: 'smooth' })
      return
    }
    if (index === 1) {
      setSheet({ kind: currentAccount.imported ? 'info' : 'settings' })
      return
    }
    if (index === 3) {
      setSheet({ kind: 'info' })
      return
    }
    if (index === 0 && onOperations) {
      setSheet(null)
      onOperations()
      return
    }
    setSheet({ kind: 'action', title: action.name, description: action.description })
  }

  const sheetTitle = sheet
    ? sheet.kind === 'action'
      ? sheet.title
      : sheet.kind === 'transaction'
        ? sheet.transaction.name
        : {
            profile: 'Profilo',
            accounts: 'Tutti i conti',
            personalize: 'Tutti i conti',
            settings: 'Gestione Conto',
            info: 'Info conto',
            search: 'Filtri di ricerca',
            balances: 'Saldo disponibile e contabile',
            operations: 'Operazioni',
            liquidity: 'Riserva di liquidità',
            partner: 'Dividiamo per 12 quello che spenderesti!',
          }[sheet.kind]
    : ''

  const searchControl = (
    <button
      type="button"
      aria-label={searchOpen ? 'Chiudi ricerca movimenti' : 'Cerca movimenti'}
      aria-expanded={searchOpen}
      onClick={() => {
        if (searchOpen) setCompact(false)
        setSearchOpen(!searchOpen)
        setQuery('')
      }}
    >
      <img src={search} alt="" />
    </button>
  )
  const searchField = (
    <div className="mf-account-inline-search">
      <input
        ref={searchRef}
        className="mf-account-search"
        type="search"
        placeholder="Cerca movimenti"
        aria-label="Cerca movimenti"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />
      <button type="button" className="mf-account-text-action" onClick={() => setSheet({ kind: 'search' })}>
        Filtri di ricerca
      </button>
    </div>
  )

  const openExternalProfile = onProfile
    ? () => {
        setSheet(null)
        onProfile()
      }
    : undefined
  return (
    <AccountProfileContext.Provider value={openExternalProfile ?? null}>
      <main
        className="mf-home mf-account-page"
        aria-label="Dettaglio conto"
        lang="it"
        data-mobile-first-account="true"
        data-account-count={productCounts.accounts}
        data-account-search-compact={compact && searchOpen}
      >
        <MobileFirstDetailHeader
          className="mf-account-header"
          onBack={onClose}
          onProfile={openExternalProfile ?? (() => setSheet({ kind: 'profile' }))}
        />
        {compact && (
          <div className="mf-account-compact" role="region" aria-label="Riepilogo conto">
            <div className="mf-account-compact-row">
              <div>
                <strong>{currentAccount.name}</strong>
                <span>
                  Saldo disponibile <AccountAmount value={currentAccount.balance} hidden={amountsHidden} />
                </span>
              </div>
              {searchControl}
            </div>
            {searchOpen && searchField}
          </div>
        )}
        <ScrollableRegion
          ref={scrollRef}
          aria-label="Conto e movimenti"
          className="mf-account-scroll"
          data-mobile-first-account-scroll="true"
          onScroll={(event) => {
            if (!searchOpen) setCompact(event.currentTarget.scrollTop >= 336)
          }}
        >
          <div className="mf-account-tabs" role="tablist" aria-label="Conti">
            <button
              type="button"
              role="tab"
              aria-selected={!selectedAccount}
              aria-controls="mf-account-detail"
              id="mf-account-current-tab"
              onClick={() => setSelectedAccount(null)}
            >
              Conto
              {!selectedAccount && productCounts.accounts > 1 && <img src={selected} alt="" />}
            </button>
            {productCounts.accounts > 1 && (
              <button
                type="button"
                role="tab"
                aria-selected={!!selectedAccount}
                aria-controls="mf-account-detail"
                id="mf-account-all-tab"
                onClick={() => {
                  if (productCounts.accounts === 2) {
                    setSelectedAccount(directory.find((a) => !a.imported && a.number !== account.number) ?? null)
                    scrollRef.current?.scrollTo?.({ top: 0 })
                    setCompact(false)
                    setQuery('')
                  } else setSheet({ kind: 'accounts' })
                }}
              >
                {productCounts.accounts === 2 ? 'Altro conto' : 'Tutti i conti'}
                {productCounts.accounts > 2 && <img src={selectedAccount ? selectedChevron : chevron} alt="" />}
              </button>
            )}
          </div>
          <section
            id="mf-account-detail"
            role="tabpanel"
            aria-labelledby={selectedAccount ? 'mf-account-all-tab' : 'mf-account-current-tab'}
            className="mf-account-summary"
          >
            <div className="mf-account-identity">
              <h1>{currentAccount.name}</h1>
              <p>{`${currentAccount.number} - ${currentAccount.bank ?? 'UniCredit'}`}</p>
            </div>
            <div className="mf-account-balances">
              <div>
                <strong>Saldo contabile</strong>
                <div aria-label="Saldo contabile">
                  <AccountAmount value={currentAccount.bookBalance ?? currentAccount.balance} hidden={amountsHidden} />
                </div>
                <p>Saldi aggiornati al {financial.asOf.split('-').reverse().join('/')}</p>
              </div>
              <div>
                <strong>Saldo disponibile</strong>
                <div aria-label="Saldo disponibile">
                  <AccountAmount value={currentAccount.balance} hidden={amountsHidden} />
                </div>
              </div>
            </div>
            <button type="button" className="mf-account-liquidity" onClick={() => setSheet({ kind: 'liquidity' })}>
              Riserva di liquidità <img src={tealChevron} alt="" />
            </button>
            <div className="mf-account-quick-actions">
              {ACCOUNT_ACTIONS.map((action, index) => (
                <button type="button" key={action.name} onClick={() => openAction(index)}>
                  <span>
                    <img src={actionIcons[index]} alt="" />
                  </span>
                  <span>{index === 1 && currentAccount.imported ? 'Info conto' : action.name}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="mf-account-movements" aria-label="Movimenti del conto">
            <div className="mf-account-movement-heading">
              <h2>{filter ? 'Risultati di ricerca' : 'Oggi'}</h2>
              {!compact && searchControl}
            </div>
            {searchOpen && !compact && searchField}
            {transactionGroups.length === 0 && <p className="mf-account-no-results">Nessun movimento trovato.</p>}
            {transactionGroups.map((group) => (
              <div className="mf-account-transaction-group" key={group.date}>
                {group.date !== 'Oggi' && <h2>{group.date}</h2>}
                <ul>
                  {group.transactions.map((transaction, index) => (
                    <li className="mf-account-row-group" key={transaction.id}>
                      <TransactionRow
                        transaction={transaction}
                        hidden={amountsHidden}
                        onOpen={() => setSheet({ kind: 'transaction', transaction, date: group.date })}
                      />
                      {!filter && group.date === '27 Febbraio' && index === 0 && (
                        <button
                          type="button"
                          className="mf-account-partner"
                          onClick={() => setSheet({ kind: 'partner' })}
                        >
                          <strong>Dividiamo per 12 quello che spenderesti!</strong>
                          <span>
                            Passa al nostro partner <img src={whiteChevron} alt="" />
                          </span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {!filter && (
              <div className="mf-account-pending">
                <button type="button" aria-expanded={pendingOpen} onClick={() => setPendingOpen(!pendingOpen)}>
                  Movimenti da contabilizzare
                  <img src={chevron} alt="" />
                </button>
                {pendingOpen &&
                  pendingMovements.map((movement) => (
                    <TransactionRow
                      key={movement.id}
                      transaction={movement}
                      hidden={amountsHidden}
                      onOpen={() => setSheet({ kind: 'transaction', transaction: movement, date: movement.date })}
                    />
                  ))}
              </div>
            )}
          </section>
        </ScrollableRegion>
        <div className="mf-floating-action" data-mobile-first-floating="true">
          <button type="button" onClick={onOperations ?? (() => setSheet({ kind: 'operations' }))}>
            Operazioni
          </button>
        </div>
        {sheet && ['profile', 'operations', 'liquidity', 'partner', 'action'].includes(sheet.kind) && (
          <BottomSheet title={sheetTitle} closeLabel="Chiudi" className="mf-sheet" onClose={() => setSheet(null)}>
            {sheet.kind === 'profile' && (
              <div className="mf-account-sheet-content">
                <p>{currentAccount.name}</p>
                <button type="button" className="mf-account-sheet-button" onClick={toggleAmountsHidden}>
                  {amountsHidden ? 'Mostra importi' : 'Nascondi importi'}
                </button>
              </div>
            )}
            {sheet.kind === 'operations' && (
              <div className="mf-operation-menu">
                {ACCOUNT_ACTIONS.map((action, index) => (
                  <button type="button" key={action.name} onClick={() => openAction(index)}>
                    <img src={actionIcons[index]} alt="" />
                    {action.name}
                    <img src={chevron} alt="" />
                  </button>
                ))}
              </div>
            )}
            {sheet.kind === 'action' && (
              <div className="mf-account-sheet-content">
                <p>{sheet.description}</p>
                <p>
                  <strong>{currentAccount.name}</strong>
                  <br />
                  {amountsHidden ? '•••••••••' : `${currentAccount.number} - UniCredit`}
                </p>
              </div>
            )}
            {sheet.kind === 'liquidity' && <p>Consulta la riserva di liquidità associata al tuo conto.</p>}
            {sheet.kind === 'partner' && <p>Scopri le offerte del nostro partner per le tue utenze.</p>}
          </BottomSheet>
        )}
        {(sheet?.kind === 'settings' || sheet?.kind === 'info' || sheet?.kind === 'balances') && (
          <MobileFirstAccountSettings
            account={currentAccount}
            initialView={sheet.kind}
            onClose={() => setSheet(null)}
            onRename={(name) => renameAccount(currentAccount.number, name)}
            onFavorites={() => setSheet({ kind: 'personalize' })}
          />
        )}
        {(sheet?.kind === 'accounts' || sheet?.kind === 'personalize') && (
          <MobileFirstAccountList
            accounts={accountChoices}
            favorites={favorites}
            onFavorites={saveAccountFavorites}
            onRename={renameAccount}
            initialPersonalize={sheet.kind === 'personalize'}
            onImport={saveImportedAccount}
            onSelect={(choice) => {
              setSelectedAccount(choice)
              setSheet(null)
              setCompact(false)
              setQuery('')
              scrollRef.current?.scrollTo?.({ top: 0 })
            }}
            onClose={() => {
              if (sheet.kind === 'personalize') setSheet({ kind: 'settings' })
              else if (initialView === 'accounts' && !selectedAccount) onClose()
              else setSheet(null)
            }}
          />
        )}
        {sheet?.kind === 'transaction' && (
          <MobileFirstAccountMovement
            movement={allMovements.find((row) => row.id === sheet.transaction.id) ?? sheet.transaction}
            changes={
              allMovements.find((row) => row.id === sheet.transaction.id) ??
              movementChanges[`${currentAccount.number}:${sheet.transaction.id}`] ??
              {}
            }
            movements={allMovements}
            asOf={financial.asOf}
            onSave={(changes) => saveAccountMovementChanges(currentAccount.number, sheet.transaction.id, changes)}
            onClose={() => {
              if (!externalOverlayOpen) setSheet(searchSession ? { kind: 'search' } : null)
            }}
          />
        )}
        {sheet?.kind === 'search' && (
          <MobileFirstAccountSearch
            movements={allMovements}
            asOf={financial.asOf}
            initialFilters={searchSession ?? { ...EMPTY_ACCOUNT_FILTERS, tag: query }}
            initialResults={!!searchSession}
            onClose={() => {
              setSearchSession(null)
              setSheet(null)
            }}
            onClear={() => {
              setSearchSession(null)
              setSheet(null)
              setQuery('')
              setSearchOpen(false)
              setCompact(false)
            }}
            onOpenMovement={(movement, filters) => {
              setSearchSession(filters)
              setSheet({ kind: 'transaction', transaction: movement, date: movement.date })
            }}
          />
        )}
      </main>
    </AccountProfileContext.Provider>
  )
}
