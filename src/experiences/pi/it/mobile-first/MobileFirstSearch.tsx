import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useDemo } from '@/app/state/demoStore'
import { searchMobileFirst, type SearchCategory, type SearchEntry } from '@/features/search/mobileFirstSearch'
import close from '@/assets/mobile-first/it/search-imgClose.svg'
import search from '@/assets/mobile-first/it/search-imgNavigationAndActionSearchAi.svg'
import clear from '@/assets/mobile-first/it/search-clear.svg'
import accountsIcon from '@/assets/mobile-first/it/pfm/settings-imgBankProductAndServiceAccountsV2.svg'
import cardsIcon from '@/assets/mobile-first/it/pfm/settings-imgHomeBankingAndPaymentsCard.svg'
import movementsIcon from '@/assets/mobile-first/it/imgBankProductAndServicePfmK10.svg'
import paymentsIcon from '@/assets/mobile-first/it/imgHomeBankingAndPaymentsTransferK10.svg'
import productsIcon from '@/assets/mobile-first/it/pfm/l-imgBankProductAndServiceLoans.svg'
import insuranceIcon from '@/assets/mobile-first/it/investments/imgInvestmentsBankInsuranceK10.svg'
import investmentsIcon from '@/assets/mobile-first/it/investments/imgInvestmentsIndexK10.svg'
import topicsIcon from '@/assets/mobile-first/it/imgBankTouchpointAndCustomerCareKnowledgeCenterK10.svg'
import chevron from '@/assets/mobile-first/it/account-chevron.svg'
import MobileFirstKeyboard from './MobileFirstKeyboard'
import './mobile-first-search-results.css'

const categories: { id: SearchCategory; label: string; icon: string }[] = [
  { id: 'accounts', label: 'Conti', icon: accountsIcon },
  { id: 'cards', label: 'Carte', icon: cardsIcon },
  { id: 'movements', label: 'Movimenti', icon: movementsIcon },
  { id: 'payments', label: 'Pagamenti', icon: paymentsIcon },
  { id: 'products', label: 'Prodotti', icon: productsIcon },
  { id: 'investments', label: 'Investimenti', icon: investmentsIcon },
  { id: 'topics', label: 'Argomenti', icon: topicsIcon },
]
const emptyEntries: readonly SearchEntry[] = []

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().toLocaleLowerCase('it').split(/\s+/).filter(Boolean)
  const lower = text.toLocaleLowerCase('it')
  const matches = Array.from({ length: text.length }, (_, index) =>
    terms.some((term) => {
      const start = lower.lastIndexOf(term, index)
      return start !== -1 && index < start + term.length
    }),
  )
  const segments: { start: number; end: number; matched: boolean }[] = []
  matches.forEach((matched, index) => {
    const last = segments[segments.length - 1]
    if (last?.matched === matched) last.end = index + 1
    else segments.push({ start: index, end: index + 1, matched })
  })
  return (
    <>
      {segments.map(({ start, end, matched }) =>
        matched ? <mark key={start}>{text.slice(start, end)}</mark> : <span key={start}>{text.slice(start, end)}</span>,
      )}
    </>
  )
}

function Suggestions({ onQuery }: { onQuery: (query: string) => void }) {
  return (
    <div className="mf-search-suggestions" aria-label="Argomenti suggeriti">
      {[
        { label: 'Bonifico', icon: paymentsIcon },
        { label: 'Carte', icon: cardsIcon },
        { label: 'Movimenti', icon: movementsIcon },
      ].map((topic) => (
        <button
          type="button"
          key={topic.label}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => onQuery(topic.label)}
        >
          <span className="mf-search-suggestion-icon" aria-hidden="true">
            <span style={{ maskImage: `url("${topic.icon}")` }} />
          </span>
          <span className="mf-search-suggestion-label">{topic.label}</span>
        </button>
      ))}
    </div>
  )
}

function Results({
  entries,
  query,
  category,
  onCategory,
  onQuery,
  onSelect,
}: {
  entries: readonly SearchEntry[]
  query: string
  category: SearchCategory | 'all'
  onCategory: (category: SearchCategory | 'all') => void
  onQuery: (query: string) => void
  onSelect?: (entry: SearchEntry) => void
}) {
  const { amountsHidden } = useDemo()
  const filterRailRef = useRef<HTMLDivElement>(null)
  const matches = searchMobileFirst(entries, query)
  const filtered = category === 'all' ? matches : matches.filter((entry) => entry.category === category)
  const filters = [
    { id: 'all' as const, label: 'Tutto', count: matches.length },
    ...categories.map(({ id, label }) => ({
      id,
      label,
      count: matches.filter((entry) => entry.category === id).length,
    })),
  ]
  const filterCounts = filters.map((filter) => filter.count).join(':')
  useEffect(() => {
    const rail = filterRailRef.current
    const selected = rail?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
    if (!rail || !selected) return
    const center = selected.offsetLeft - (rail.clientWidth - selected.offsetWidth) / 2
    const left = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, center))
    const reducedMotion =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollTo?.({ left, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [category, filterCounts, query])
  const row = (entry: SearchEntry) => {
    const categoryIcon =
      entry.target.kind === 'insurance'
        ? insuranceIcon
        : entry.target.kind === 'category'
          ? {
              Conti: accountsIcon,
              Carte: cardsIcon,
              'Mutui e Prestiti': productsIcon,
              'Polizze assicurative': insuranceIcon,
            }[entry.target.category]
          : categories.find(({ id }) => id === entry.category)?.icon
    const icon = entry.icon || categoryIcon
    const vector = !entry.icon || /(?:^data:image\/svg\+xml|\.svg(?:\?|$))/i.test(entry.icon)
    const amount =
      entry.amount === undefined
        ? null
        : amountsHidden
          ? `**,** ${entry.currency && entry.currency !== 'EUR' ? entry.currency : '€'}`
          : new Intl.NumberFormat('it-IT', { style: 'currency', currency: entry.currency || 'EUR' }).format(
              entry.amount,
            )
    return (
      <li key={entry.id}>
        <button type="button" className="mf-search-result-row" disabled={!onSelect} onClick={() => onSelect?.(entry)}>
          <span className="mf-search-result-icon">
            {vector ? (
              <span className="mf-search-result-glyph" aria-hidden="true" style={{ maskImage: `url("${icon}")` }} />
            ) : (
              <img className="mf-search-result-photo" src={icon} alt="" width={40} height={40} />
            )}
          </span>
          <span className="mf-search-result-copy">
            <strong>
              <Highlight text={entry.title} query={query} />
            </strong>
            <span>
              <Highlight text={entry.subtitle} query={query} />
            </span>
          </span>
          {amount !== null && (
            <span className="mf-search-result-amount" data-amount-hidden={amountsHidden}>
              {amount}
            </span>
          )}
          {onSelect && <img className="mf-search-result-chevron" src={chevron} alt="" width={12} height={22} />}
        </button>
      </li>
    )
  }
  if (!query.trim()) {
    return (
      <section className="mf-search-start">
        <Suggestions onQuery={onQuery} />
      </section>
    )
  }
  return (
    <>
      <div ref={filterRailRef} className="mf-search-filters" role="tablist" aria-label="Categorie di ricerca">
        {filters.map(({ id, label, count }, index) => (
          <button
            type="button"
            key={id}
            role="tab"
            id={`mf-search-tab-${id}`}
            aria-selected={category === id}
            aria-controls="mf-search-results"
            tabIndex={category === id ? 0 : -1}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => onCategory(id)}
            onKeyDown={(event) => {
              let next = index
              if (event.key === 'ArrowRight') next = (index + 1) % filters.length
              else if (event.key === 'ArrowLeft') next = (index + filters.length - 1) % filters.length
              else if (event.key === 'Home') next = 0
              else if (event.key === 'End') next = filters.length - 1
              else return
              event.preventDefault()
              const nextFilter = filters[next]
              if (!nextFilter) return
              onCategory(nextFilter.id)
              document.getElementById(`mf-search-tab-${nextFilter.id}`)?.focus()
            }}
          >
            <span>{label}</span>
            <span className="mf-search-filter-count">{count}</span>
          </button>
        ))}
      </div>
      <p role="status" className="mf-search-result-status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'risultato' : 'risultati'}
      </p>
      <div id="mf-search-results" role="tabpanel" aria-labelledby={`mf-search-tab-${category}`}>
        {filtered.length === 0 ? (
          <section className="mf-search-empty">
            <span className="mf-search-empty-icon">
              <img src={search} alt="" width={24} height={24} />
            </span>
            <h2>Nessun risultato</h2>
            <p>Prova un’altra parola o cerca in tutte le categorie.</p>
            {category !== 'all' && (
              <button
                type="button"
                className="mf-search-all"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => onCategory('all')}
              >
                Cerca in tutto
              </button>
            )}
            <Suggestions onQuery={onQuery} />
          </section>
        ) : (
          categories.map(({ id, label }) => {
            const group = filtered.filter((entry) => entry.category === id)
            if (group.length === 0) return null
            return (
              <section className="mf-search-group" aria-labelledby={`mf-search-heading-${id}`} key={id}>
                <div className="mf-search-group-header">
                  <h2 id={`mf-search-heading-${id}`}>{label}</h2>
                  {category === 'all' && group.length > 3 && (
                    <button
                      type="button"
                      aria-label={`Vedi tutti i ${label.toLocaleLowerCase('it')}`}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => onCategory(id)}
                    >
                      Vedi tutti <span aria-hidden="true">({group.length})</span>
                    </button>
                  )}
                </div>
                <ul>{(category === 'all' ? group.slice(0, 3) : group).map(row)}</ul>
              </section>
            )
          })
        )}
      </div>
    </>
  )
}

export default function MobileFirstSearch({
  onClose,
  entries = emptyEntries,
  onSelect,
  initialQuery = '',
  onQueryChange,
}: {
  onClose: () => void
  entries?: readonly SearchEntry[]
  onSelect?: (entry: SearchEntry) => void
  initialQuery?: string
  onQueryChange?: (query: string) => void
}) {
  const nativeKeyboard = new URLSearchParams(window.location.search).get('frame') === '0'
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<SearchCategory | 'all'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const [keyboardVisible, setKeyboardVisible] = useState(true)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [physicalShift, setPhysicalShift] = useState(false)
  const keyTimer = useRef<number | null>(null)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
    return () => {
      if (keyTimer.current !== null) window.clearTimeout(keyTimer.current)
    }
  }, [])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const dismissKeyboard = () => {
    setKeyboardVisible(false)
    inputRef.current?.blur()
  }

  const updateQuery = (next: string) => {
    setQuery(next)
    setCategory('all')
    onQueryChange?.(next)
  }

  const suggestQuery = (next: string) => {
    updateQuery(next)
    dismissKeyboard()
  }

  const handleSoftwareKey = (key: string) => {
    if (key === 'Enter') {
      dismissKeyboard()
      return
    }
    const input = inputRef.current
    if (!input) return
    const value = input.value
    const start = input.selectionStart ?? value.length
    const end = input.selectionEnd ?? start
    const before = value.slice(0, start)
    const after = value.slice(end)
    const prefix = key === 'Backspace' && start === end ? Array.from(before).slice(0, -1).join('') : before
    const next = key === 'Backspace' ? prefix + after : before + key + after
    const cursor = key === 'Backspace' ? prefix.length : start + key.length
    updateQuery(next)
    input.focus({ preventScroll: true })
    window.requestAnimationFrame(() => input.setSelectionRange(cursor, cursor))
  }

  const handlePhysicalKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return
    if (keyTimer.current !== null) window.clearTimeout(keyTimer.current)
    setPressedKey(event.key)
    setPhysicalShift(event.shiftKey || event.key === 'Shift')
    keyTimer.current = window.setTimeout(() => setPressedKey(null), 180)
    if (event.key === 'Enter') {
      event.preventDefault()
      dismissKeyboard()
    }
  }

  return (
    <main
      className="mf-home mf-search-page"
      aria-label="Cerca"
      lang="it"
      data-mobile-first-search="true"
      data-keyboard-open={!nativeKeyboard && keyboardVisible}
    >
      <header className="mf-search-header">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            dismissKeyboard()
          }}
        >
          <div className="mf-search-field">
            <img src={search} alt="" width={24} height={24} />
            <input
              ref={inputRef}
              type="search"
              inputMode={nativeKeyboard ? 'search' : 'none'}
              enterKeyHint="search"
              autoComplete="off"
              autoCapitalize="none"
              aria-label="Come posso aiutarti?"
              placeholder="Come posso aiutarti?..."
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              onFocus={() => setKeyboardVisible(true)}
              onKeyDown={handlePhysicalKey}
              onKeyUp={(event) => setPhysicalShift(event.shiftKey)}
            />
            {query && (
              <button
                type="button"
                aria-label="Cancella ricerca"
                className="mf-search-clear"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  updateQuery('')
                  inputRef.current?.focus({ preventScroll: true })
                }}
              >
                <img src={clear} alt="" width={16} height={16} />
              </button>
            )}
          </div>
        </form>
        <button type="button" aria-label="Chiudi ricerca" onClick={onClose}>
          <img src={close} alt="" width={40} height={40} />
        </button>
      </header>
      <div className="mf-search-content">
        {entries.length > 0 ? (
          <Results
            entries={entries}
            query={query}
            category={category}
            onCategory={setCategory}
            onQuery={suggestQuery}
            onSelect={
              onSelect
                ? (entry) => {
                    dismissKeyboard()
                    onSelect(entry)
                  }
                : undefined
            }
          />
        ) : !query.trim() ? (
          <section className="mf-search-start">
            <Suggestions onQuery={suggestQuery} />
          </section>
        ) : (
          <section className="mf-search-empty">
            <h2>Nessun risultato</h2>
            <p>Prova un’altra parola.</p>
            <Suggestions onQuery={suggestQuery} />
          </section>
        )}
      </div>
      {!nativeKeyboard && keyboardVisible && (
        <MobileFirstKeyboard onKey={handleSoftwareKey} pressedKey={pressedKey} physicalShift={physicalShift} />
      )}
    </main>
  )
}
