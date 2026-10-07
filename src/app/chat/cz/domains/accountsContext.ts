import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics'
import { isInternalTransferCategory } from '@/data/pfmCategories'
import { type CoAppingRichBlock } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import {
  buildCzNavigateAction,
  formatCzChatMoney,
  formatCzChatSignedMoney,
  formatCzChatTransactionDate,
  type CzChatSmartReplyOptions,
} from '../helpers'
import type { buildCzProfileChatContext } from './profileContext'
import type { buildCzCardsChatContext } from './cardsContext'
/** Domain-owned derivation used once when a chat resolver snapshots its input. */
export function buildCzAccountsChatContext(
  context: Pick<CzChatSmartReplyOptions, 'country'> &
    Pick<
      ReturnType<typeof buildCzProfileChatContext>,
      'localCurrency' | 'allProducts' | 'loansAndMortgages' | 'primaryAccount' | 'primaryCard' | 'selectedLoan'
    > &
    Pick<ReturnType<typeof buildCzCardsChatContext>, 'creditAvailable'>,
) {
  const {
    country,
    localCurrency,
    allProducts,
    loansAndMortgages,
    primaryAccount,
    primaryCard,
    selectedLoan,
    creditAvailable,
  } = context
  const totalAvailableAmount = allProducts.reduce((sum, product) => {
    if (product.type === 'current_account' || product.type === 'saving_account') return sum + product.balance
    return sum
  }, 0)

  const totalOwedAmount = loansAndMortgages.reduce((sum, product) => sum + Math.abs(product.balance), 0)

  const totalAvailable = formatCzChatMoney(totalAvailableAmount, localCurrency, country)

  const totalOwed = formatCzChatMoney(totalOwedAmount, localCurrency, country)

  const accountBalance = primaryAccount
    ? formatCzChatMoney(primaryAccount.balance, primaryAccount.currency, country)
    : totalAvailable

  const loanBalance = selectedLoan ? formatCzChatMoney(selectedLoan.balance, selectedLoan.currency, country) : totalOwed

  const spendingTimeline = createSpendingAnalyticsTimeline(country, allProducts)

  const currentSpendingSummary = spendingTimeline.summariesByPeriodKey[spendingTimeline.activePeriodKey]

  const latestHomeTransactions = currentSpendingSummary?.sourceTransactions.slice(0, 5) ?? []

  const latestDebitTransactions = latestHomeTransactions.filter((transaction) => transaction.amount < 0)

  const latestCreditTransactions = latestHomeTransactions.filter((transaction) => transaction.amount > 0)

  const largestRecentDebit =
    [...(currentSpendingSummary?.sourceTransactions ?? [])]
      .filter((transaction) => transaction.amount < 0 && !isInternalTransferCategory(transaction.category))
      .sort((first, second) => Math.abs(second.amount) - Math.abs(first.amount))[0] ?? null

  const pendingRecentTransactions =
    currentSpendingSummary?.sourceTransactions.filter((transaction) => transaction.status === 'Pending').slice(0, 3) ??
    []

  const topMoneyOutCategory = currentSpendingSummary?.moneyOutCategories[0] ?? null

  const latestTransactionLines = latestHomeTransactions.length
    ? latestHomeTransactions
        .map((transaction, index) => {
          const sourceName = transaction.sourceProductName || 'Account'
          const status = transaction.status === 'Pending' ? ', pending' : ''
          return `${index + 1}. **${transaction.label}** — ${formatCzChatSignedMoney(
            transaction.amount,
            localCurrency,
            country,
          )}, ${formatCzChatTransactionDate(transaction)} from ${sourceName}${status}.`
        })
        .join('\n')
    : 'No recent transactions are available in this simulation profile.'

  const latestTransactionSnapshotBlock: CoAppingRichBlock = {
    type: 'spending-insight',
    title: 'Latest transaction readout',
    body: currentSpendingSummary
      ? `Latest activity from ${currentSpendingSummary.periodLabel} ${currentSpendingSummary.yearLabel}, grouped across visible account products.`
      : 'Latest account activity across visible products.',
    metrics: [
      { label: 'Latest shown', value: `${latestHomeTransactions.length}`, helper: 'Transactions' },
      {
        label: 'Money out',
        value: formatCzChatMoney(currentSpendingSummary?.spendingTotal ?? 0, localCurrency, country),
        helper: currentSpendingSummary?.periodLabel ?? 'Current period',
      },
      {
        label: 'Money in',
        value: formatCzChatMoney(currentSpendingSummary?.incomeTotal ?? 0, localCurrency, country),
        helper: latestCreditTransactions.length
          ? `${latestCreditTransactions.length} incoming in latest set`
          : 'No incoming in latest set',
      },
    ],
    action: buildCzNavigateAction('open-account-from-latest-transactions', 'Open Account', 'account-detail'),
  }

  const unusualSpendingBlock: CoAppingRichBlock = {
    type: 'spending-insight',
    title: 'Spending signals',
    body: 'The assistant should call out large, pending, or category-heavy movements before sending the user elsewhere.',
    metrics: [
      {
        label: 'Largest debit',
        value: largestRecentDebit ? formatCzChatMoney(largestRecentDebit.amount, localCurrency, country) : 'n/a',
        helper: largestRecentDebit?.label ?? 'No debit found',
      },
      {
        label: 'Top category',
        value: topMoneyOutCategory ? formatCzChatMoney(topMoneyOutCategory.total, localCurrency, country) : 'n/a',
        helper: topMoneyOutCategory
          ? `${topMoneyOutCategory.category}, ${topMoneyOutCategory.transactionCount} trx`
          : 'No category',
      },
      {
        label: 'Pending',
        value: `${pendingRecentTransactions.length}`,
        helper: pendingRecentTransactions[0]?.label ?? 'No pending movement',
      },
    ],
    action: buildCzNavigateAction('open-spending-from-unusual-spending', 'Open Spending', 'analytics'),
  }

  const homeSnapshotBlock: CoAppingRichBlock = {
    type: 'spending-insight',
    title: 'Homepage money signals',
    body: 'A compact read of the visible Home data, with the next action still kept in the app.',
    metrics: [
      { label: 'Available', value: totalAvailable, helper: 'Current and savings money' },
      { label: 'Owed', value: totalOwed, helper: 'Loans and mortgage' },
      { label: 'Card room', value: creditAvailable, helper: primaryCard ? primaryCard.name : 'No credit card' },
    ],
    action: buildCzNavigateAction('open-spending-from-home', 'Open Spending', 'analytics'),
  }
  return {
    totalAvailable,
    totalOwed,
    accountBalance,
    loanBalance,
    currentSpendingSummary,
    latestHomeTransactions,
    latestDebitTransactions,
    latestCreditTransactions,
    largestRecentDebit,
    pendingRecentTransactions,
    topMoneyOutCategory,
    latestTransactionLines,
    latestTransactionSnapshotBlock,
    unusualSpendingBlock,
    homeSnapshotBlock,
  }
}
