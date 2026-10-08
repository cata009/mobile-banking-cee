import {
  type CoAppingFollowUpSuggestion,
  type CoAppingRichBlock,
} from '../../../../../package/mobile-pi-coapping-chat-package/src'
import {
  buildCzChatFollowUp,
  formatCzChatMoney,
  roundCzChatSavingAmount,
  type CzChatSmartReplyOptions,
} from '../helpers'
import type { buildCzProfileChatContext } from './profileContext'
import type { buildCzAccountsChatContext } from './accountsContext'
/** Domain-owned derivation used once when a chat resolver snapshots its input. */
export function buildCzSavingsChatContext(
  context: Pick<CzChatSmartReplyOptions, 'country'> &
    Pick<ReturnType<typeof buildCzProfileChatContext>, 'localCurrency' | 'currentAccounts' | 'selectedSavings'> &
    Pick<ReturnType<typeof buildCzAccountsChatContext>, 'totalAvailable' | 'currentSpendingSummary'>,
) {
  const { country, localCurrency, currentAccounts, selectedSavings, totalAvailable, currentSpendingSummary } = context
  const savingsBalance = selectedSavings
    ? formatCzChatMoney(selectedSavings.balance, selectedSavings.currency, country)
    : totalAvailable

  const monthlyIncomeAmount = currentSpendingSummary?.incomeTotal ?? 0

  const monthlySpendingAmount = currentSpendingSummary?.spendingTotal ?? 0

  const netMonthlyAmount = Math.max(0, monthlyIncomeAmount - monthlySpendingAmount)

  const currentAccountMoneyAmount = currentAccounts.reduce((sum, product) => sum + product.balance, 0)

  const suggestedMonthlySavingRaw = Math.min(
    Math.max(netMonthlyAmount * 0.35, monthlyIncomeAmount * 0.05),
    Math.max(currentAccountMoneyAmount * 0.45, 500),
  )

  const suggestedMonthlySavingAmount = roundCzChatSavingAmount(
    suggestedMonthlySavingRaw > 0 ? suggestedMonthlySavingRaw : currentAccountMoneyAmount * 0.2,
  )

  const savingAccountAnnualRate = 0.035

  const termDepositAnnualRate = 0.05

  const savingAccountRate = '3.5% p.a.'

  const termDepositRate = '5% p.a.'

  const savingStartAmountOptions = [
    {
      key: 'light',
      label: 'Light start',
      amount: roundCzChatSavingAmount(suggestedMonthlySavingAmount * 0.5),
    },
    {
      key: 'recommended',
      label: 'Recommended',
      amount: suggestedMonthlySavingAmount,
    },
    {
      key: 'stretch',
      label: 'Build buffer',
      amount: Math.max(
        suggestedMonthlySavingAmount + 500,
        roundCzChatSavingAmount(Math.min(currentAccountMoneyAmount * 0.6, suggestedMonthlySavingAmount * 1.5)),
      ),
    },
  ] as const

  const monthlyIncome = formatCzChatMoney(monthlyIncomeAmount, localCurrency, country)

  const monthlySpending = formatCzChatMoney(monthlySpendingAmount, localCurrency, country)

  const currentAccountMoney = formatCzChatMoney(currentAccountMoneyAmount, localCurrency, country)

  const suggestedMonthlySaving = formatCzChatMoney(suggestedMonthlySavingAmount, localCurrency, country)

  const savingPeriodLabel = currentSpendingSummary
    ? `${currentSpendingSummary.periodLabel} ${currentSpendingSummary.yearLabel}`
    : 'the current period'

  const savingsCapacityBlock: CoAppingRichBlock = {
    type: 'spending-insight',
    title: 'Monthly saving capacity',
    body: `Based on ${savingPeriodLabel} activity and current account money, a cautious monthly target is ${suggestedMonthlySaving}.`,
    metricLayout: 'calculation',
    metrics: [
      { label: 'Income', value: monthlyIncome, helper: savingPeriodLabel, icon: 'Income' },
      { label: 'Spending', value: monthlySpending, helper: 'Card, bills, cash, categories', icon: 'Shopping' },
      { label: 'Current accounts', value: currentAccountMoney, helper: 'Money available now', icon: 'Finance' },
    ],
  }

  const savingsProductChoiceBlock: CoAppingRichBlock = {
    type: 'product-cards',
    title: 'How to save it',
    body: `That keeps the recommendation cautious: it does not move every free crown, and it still leaves room for bills, card payments, and unexpected spending. Rates are illustrative for this simulation.`,
    variant: 'compact',
    footer: 'Choose your preferred saving type.',
    interactive: false,
    products: [
      {
        id: 'saving-account-plan',
        title: 'Saving account',
        subtitle: `${savingAccountRate} interest, flexible access`,
        meta: 'Flexible',
        tone: 'blue',
        icon: 'Wallet',
        action: {
          id: 'choose-saving-account-plan',
          label: 'Choose',
          type: 'send-message',
          prompt: 'Use Saving account for my savings plan.',
        },
      },
      {
        id: 'term-deposit-plan',
        title: 'Term deposit',
        subtitle: `${termDepositRate} interest, fixed term`,
        meta: 'Fixed term',
        tone: 'neutral',
        icon: 'Investments',
        action: {
          id: 'choose-term-deposit-plan',
          label: 'Choose',
          type: 'send-message',
          prompt: 'Use Term deposit for my savings plan.',
        },
      },
    ],
  }

  const buildSavingsAmountFollowUps = (productLabel: 'Saving account' | 'Term deposit'): CoAppingFollowUpSuggestion[] =>
    savingStartAmountOptions.map((option) =>
      buildCzChatFollowUp(
        `cz-save-now-${productLabel === 'Saving account' ? 'saving-account' : 'term-deposit'}-${option.key}`,
        formatCzChatMoney(option.amount, localCurrency, country),
        `Start with ${option.key} amount in ${productLabel}.`,
      ),
    )
  return {
    savingsBalance,
    savingAccountAnnualRate,
    termDepositAnnualRate,
    savingAccountRate,
    termDepositRate,
    savingStartAmountOptions,
    monthlyIncome,
    monthlySpending,
    currentAccountMoney,
    suggestedMonthlySaving,
    savingsCapacityBlock,
    savingsProductChoiceBlock,
    buildSavingsAmountFollowUps,
  }
}
