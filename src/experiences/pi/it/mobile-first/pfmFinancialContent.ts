import type { PfmFinancialEvent } from '@/features/analytics/mobileFirstPfm'
import type { ProductCounts } from '@/app/state/demoTypes'
import { getItalyTransactionCategory } from '@/features/finance/italyTransactionCategories'
import {
  selectAccountBalance,
  selectCardBalance,
  toCents,
  type ItalyFinancialSnapshot,
} from '@/features/finance/italyFinancials'
import { getItalyInvestmentWealth } from '@/features/investments/mobileFirstValuation'
import { buildLoanPortfolio } from '@/features/credit/mobileFirstLoans'
import { getPfmBudgetSnapshot } from '@/features/analytics/mobileFirstPfmState'
import { ITALY_CARDS } from './cardsContent'
import { normalizePfmCategory } from '@/features/analytics/mobileFirstPfm'
import {
  PFM_BUDGET_CATEGORIES,
  PFM_EXPENSE_CATEGORIES,
  PFM_LIABILITIES,
  PFM_WEALTH_CATEGORIES,
  type PfmCategory,
  type PfmMovement,
} from './pfmContent'

/** Icon/color vocabulary comes from the design; monetary values come from the ledger. */
export function pfmCategory(row: { name: string; amountCents: number }): PfmCategory {
  const name = normalizePfmCategory(row.name)
  const categoryId = getItalyTransactionCategory(name)?.id
  const displayAliases: Partial<Record<NonNullable<typeof categoryId>, string>> = {
    insurance: 'Assicurazioni e finanziamenti',
    education: 'Scuola e formazione',
    leisure: 'Tempo libero e viaggi',
  }
  const styleName = (categoryId && displayAliases[categoryId]) || name
  const style = [
    ...PFM_BUDGET_CATEGORIES,
    ...PFM_EXPENSE_CATEGORIES,
    ...PFM_LIABILITIES,
    ...PFM_WEALTH_CATEGORIES,
  ].find((item) => normalizePfmCategory(item.name) === styleName)
  return {
    name,
    amount: row.amountCents / 100,
    glyph:
      categoryId === 'income'
        ? 'Income'
        : categoryId === 'transfers'
          ? 'Transfers'
          : style?.glyph === 'Uncategorized'
            ? 'Finance'
            : (style?.glyph ?? 'Finance'),
    color: categoryId === 'income' ? '#23895a' : categoryId === 'transfers' ? '#58708f' : (style?.color ?? '#535453'),
  }
}
export function pfmMovement(event: PfmFinancialEvent): PfmMovement {
  const date = new Date(`${event.date}T12:00:00Z`)
  return {
    id: event.id,
    note: event.note,
    name: event.name,
    category: normalizePfmCategory(event.category),
    subcategory: event.kind === 'refund' ? 'Rimborsi' : event.subcategory || normalizePfmCategory(event.category),
    amount: event.amountCents / 100,
    date: event.date.split('-').reverse().join('/'),
    group: new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      date,
    ),
  }
}

export function getItalyPfmFinancialInput(snapshot: ItalyFinancialSnapshot, counts: ProductCounts) {
  const plans = getPfmBudgetSnapshot()
  const accounts = [
    ...snapshot.accounts.filter((account) => !account.imported).slice(0, counts.accounts),
    ...snapshot.accounts.filter((account) => account.imported),
  ]
  // The Italy Cards hub exposes the complete portfolio once cards are enabled.
  // Blocking a card changes its usability, never its stored cash or outstanding debt.
  const cards = counts.debitCards + counts.creditCards > 0 ? snapshot.cards : []
  const relationships = [
    ...accounts.map((account) => ({
      id: account.number,
      name: account.name,
      type: `Conto personale - ${account.bank}`,
      number: account.number,
      kind: 'account',
    })),
    ...cards.map((card) => {
      const metadata = ITALY_CARDS.find((item) => item.id === card.id)
      return {
        id: card.id,
        name: metadata?.holder ?? 'Andrea Rossini',
        type: metadata?.name ?? card.id,
        number: `•••• ${metadata?.lastFour ?? card.id}`,
        kind: 'card',
      }
    }),
  ]
  const wealth = [
    ...accounts.map((account) => {
      const cents = selectAccountBalance(snapshot, account.number).bookBalanceCents
      return {
        id: `account:${account.number}`,
        label: `${account.name} · ${account.number}`,
        category: cents < 0 ? 'Scoperto di conto' : 'Liquidità',
        valueCents: Math.abs(cents),
        date: snapshot.asOf,
        liability: cents < 0,
        accountNumber: account.number,
      }
    }),
    ...cards
      .filter((card) => card.kind !== 'debit')
      .map((card) => {
        const amount = selectCardBalance(snapshot, card.id)
        return {
          id: `card:${card.id}`,
          label: ITALY_CARDS.find((item) => item.id === card.id)?.name ?? card.id,
          category: card.kind === 'credit' ? 'Carta di credito' : 'Liquidità',
          valueCents: card.kind === 'credit' ? amount.debtCents : Math.max(0, amount.bookBalanceCents),
          date: snapshot.asOf,
          liability: card.kind === 'credit',
          cardId: card.id,
        }
      }),
    ...(counts.investments > 0
      ? getItalyInvestmentWealth().map((item) => ({
          ...item,
          category: 'Investimenti',
          date: snapshot.asOf,
          liability: false,
        }))
      : []),
    ...buildLoanPortfolio(counts).map((loan) => ({
      id: loan.id,
      label: loan.name,
      category: 'Mutuo e prestito',
      valueCents: toCents(loan.outstanding),
      date: snapshot.asOf,
      liability: true,
    })),
    ...plans.manualWealth,
  ]
  return {
    relationships,
    accountNumbers: accounts
      .filter(
        (account) => plans.relationshipIds === null || plans.relationshipIds.includes(`account:${account.number}`),
      )
      .map((account) => account.number),
    cardIds: cards
      .filter((card) => plans.relationshipIds === null || plans.relationshipIds.includes(`card:${card.id}`))
      .map((card) => card.id),
    wealth,
  }
}
