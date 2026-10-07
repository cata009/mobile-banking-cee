import { type CoAppingReplyResult } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import {
  buildCzChatFollowUp,
  buildCzNavigateFollowUp,
  formatCzChatMoney,
  formatCzChatSignedMoney,
  formatCzChatTransactionDate,
} from '../helpers'
import type { CzChatNormalizedContext } from '../normalizedContext'
import { hasCzChatTerm as hasAny } from '../matching'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzHomeOverviewReply(
  normalized: string,
  context: Pick<
    CzChatNormalizedContext,
    'primaryCard' | 'totalAvailable' | 'totalOwed' | 'creditAvailable' | 'creditLimit' | 'homeSnapshotBlock'
  >,
): Exclude<CoAppingReplyResult, string> | null {
  const { primaryCard, totalAvailable, totalOwed, creditAvailable, creditLimit, homeSnapshotBlock } = context

  if (hasAny(normalized, ['main things i should notice', 'financial overview', 'homepage overview'])) {
    return {
      text:
        `### Your Home overview\n` +
        `I would read this page in three passes:\n` +
        `1. **Available money:** ${totalAvailable}. This is the money shown as usable now across current and savings balances.\n` +
        `2. **Money owed:** ${totalOwed}. This keeps borrowing visible instead of mixing it with available cash.\n` +
        `3. **Card capacity:** ${primaryCard ? `${primaryCard.name} has ${creditAvailable} free to spend from a ${creditLimit} limit.` : 'No credit card capacity is shown in this profile.'}\n` +
        `The useful next check is not another generic product pitch. It is to confirm whether the recent movement came from everyday spending, a pending card amount, or a document/confirmation that needs attention.`,
      richBlocks: [homeSnapshotBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-home-latest-transactions',
          'Review latest 5',
          'Show me the latest 5 transactions and which account they came from.',
        ),
        buildCzChatFollowUp(
          'cz-home-unusual-spending',
          'Spot unusual spending',
          'Check the largest, pending, or category-heavy movements from my latest account activity.',
        ),
        buildCzNavigateFollowUp('cz-open-spending', 'Open Spending', 'analytics'),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzAccountActivityReply(
  normalized: string,
  context: Pick<
    CzChatNormalizedContext,
    | 'country'
    | 'localCurrency'
    | 'primaryAccount'
    | 'primaryCard'
    | 'selectedSavings'
    | 'totalAvailable'
    | 'totalOwed'
    | 'accountBalance'
    | 'savingsBalance'
    | 'creditAvailable'
    | 'creditLimit'
    | 'latestHomeTransactions'
    | 'latestDebitTransactions'
    | 'latestCreditTransactions'
    | 'largestRecentDebit'
    | 'pendingRecentTransactions'
    | 'topMoneyOutCategory'
    | 'latestTransactionLines'
    | 'latestTransactionSnapshotBlock'
    | 'unusualSpendingBlock'
    | 'homeSnapshotBlock'
  >,
): Exclude<CoAppingReplyResult, string> | null {
  const {
    country,
    localCurrency,
    primaryAccount,
    primaryCard,
    selectedSavings,
    totalAvailable,
    totalOwed,
    accountBalance,
    savingsBalance,
    creditAvailable,
    creditLimit,
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
  } = context

  if (
    hasAny(normalized, [
      'latest 5 transactions',
      'latest five transactions',
      'which account they came from',
      'recent 5 transactions',
      'latest transactions',
    ])
  ) {
    return {
      text:
        `### Latest 5 transactions\n` +
        `Here are the latest visible transactions across this Home profile, with the source account included:\n` +
        `${latestTransactionLines}\n` +
        `Read this as activity evidence, not a balance explanation: the latest set has ${latestDebitTransactions.length} outgoing and ${latestCreditTransactions.length} incoming movement${
          latestHomeTransactions.length === 1 ? '' : 's'
        }. For dispute, receipt, or document proof, open the transaction or Documents rather than relying only on chat.`,
      richBlocks: [latestTransactionSnapshotBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-home-unusual-from-latest',
          'Spot unusual spending',
          'Check the largest, pending, or category-heavy movements from my latest account activity.',
        ),
        buildCzNavigateFollowUp('cz-open-account-from-latest', 'Open Account', 'account-detail'),
        buildCzNavigateFollowUp('cz-open-spending-from-latest', 'Open Spending', 'analytics'),
      ],
    }
  }

  if (
    hasAny(normalized, [
      'unusual spending',
      'largest, pending',
      'category-heavy',
      'latest account activity',
      'spot unusual',
      'biggest recent movement',
    ])
  ) {
    const largestDebitLine = largestRecentDebit
      ? `The largest recent outgoing movement is **${largestRecentDebit.label}** for ${formatCzChatSignedMoney(
          largestRecentDebit.amount,
          localCurrency,
          country,
        )} on ${formatCzChatTransactionDate(largestRecentDebit)} from ${largestRecentDebit.sourceProductName}.`
      : 'I do not see a recent outgoing movement in this mock profile.'
    const pendingLine = pendingRecentTransactions.length
      ? `Pending items to watch: ${pendingRecentTransactions
          .map(
            (transaction) =>
              `${transaction.label} ${formatCzChatSignedMoney(transaction.amount, localCurrency, country)} from ${transaction.sourceProductName}`,
          )
          .join('; ')}.`
      : 'I do not see pending transactions in the latest account-activity set.'
    const categoryLine = topMoneyOutCategory
      ? `The heaviest money-out category is **${topMoneyOutCategory.category}** with ${formatCzChatMoney(
          topMoneyOutCategory.total,
          localCurrency,
          country,
        )} across ${topMoneyOutCategory.transactionCount} transaction${topMoneyOutCategory.transactionCount === 1 ? '' : 's'}.`
      : 'There is no money-out category signal to summarize.'

    return {
      text:
        `### Unusual spending check\n` +
        `${largestDebitLine}\n` +
        `${categoryLine}\n` +
        `${pendingLine}\n` +
        `I would use this topic when the customer asks "what looks different?" because it points to concrete movements first, then lets them open Spending or the account for the full list.`,
      richBlocks: [unusualSpendingBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-home-latest-from-unusual',
          'Show latest 5',
          'Show me the latest 5 transactions and which account they came from.',
        ),
        buildCzNavigateFollowUp('cz-open-spending-from-unusual', 'Open Spending', 'analytics'),
        buildCzNavigateFollowUp('cz-open-account-from-unusual', 'Open Account', 'account-detail'),
      ],
    }
  }

  if (hasAny(normalized, ['available balance, owed amount', 'available money', 'owed amount'])) {
    return {
      text:
        `### Available money, not just balance\n` +
        `On this Home profile, the key split is:\n` +
        `- **Available now:** ${totalAvailable}, led by ${primaryAccount ? `${primaryAccount.name} at ${accountBalance}` : 'the visible current account'}${selectedSavings ? ` and savings at ${savingsBalance}` : ''}.\n` +
        `- **Owed:** ${totalOwed}, shown separately so debt does not make the day-to-day cash picture muddy.\n` +
        `- **Credit card:** ${primaryCard ? `${creditAvailable} is free to spend, but the full card limit is ${creditLimit}.` : 'No credit-card limit is available in this profile.'}\n` +
        `If the customer asks "can I spend this?", the assistant should start with available money and pending card movements, not total product value.`,
      richBlocks: [homeSnapshotBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-home-card-room',
          'Explain card room',
          'Explain what free to spend means on my credit card.',
        ),
        buildCzChatFollowUp(
          'cz-home-documents',
          'Check documents',
          'Help me find confirmations, statements, or recent bank documents.',
        ),
        buildCzNavigateFollowUp('cz-open-card', 'Open Card', 'card-detail'),
      ],
    }
  }

  if (hasAny(normalized, ['homepage, what should i review next', 'suggest my next action', 'review next in the app'])) {
    return {
      text:
        `### Start with recent activity\n` +
        `The concrete Home check is the latest account movement, not a vague "next best step".\n` +
        `${latestTransactionLines}\n` +
        `${largestRecentDebit ? `The biggest outgoing movement in the current activity set is **${largestRecentDebit.label}** for ${formatCzChatSignedMoney(largestRecentDebit.amount, localCurrency, country)} from ${largestRecentDebit.sourceProductName}.` : ''}\n` +
        `If one of these looks unfamiliar, open the account activity or Spending before jumping to products or documents.`,
      richBlocks: [latestTransactionSnapshotBlock, unusualSpendingBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-home-latest-from-legacy-next',
          'Show latest 5',
          'Show me the latest 5 transactions and which account they came from.',
        ),
        buildCzChatFollowUp(
          'cz-home-unusual-from-legacy-next',
          'Spot unusual spending',
          'Check the largest, pending, or category-heavy movements from my latest account activity.',
        ),
        buildCzNavigateFollowUp('cz-open-spending-from-legacy-next', 'Open Spending', 'analytics'),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzSpendingReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'homeSnapshotBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { homeSnapshotBlock } = context

  if (
    hasAny(normalized, [
      'where my money went',
      "this month's spending",
      'compare my spending categories',
      'reduce spending',
      'subscriptions',
      'recurring payments',
    ])
  ) {
    return {
      text:
        `### Spending readout\n` +
        `A useful answer should separate signal from noise:\n` +
        `- Compare card payments and recurring merchants first.\n` +
        `- Then look for category changes instead of listing every transaction.\n` +
        `- If the goal is to save money, protect fixed payments first and review subscriptions or price changes second.\n` +
        `For this preview, the best handoff is Spending because it already owns category and recurring-payment context.`,
      richBlocks: [homeSnapshotBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-spending', 'Open Spending', 'analytics'),
        buildCzChatFollowUp(
          'cz-review-subscriptions',
          'Review subscriptions',
          'Help me spot recurring payments or subscriptions in my spending.',
        ),
        buildCzChatFollowUp(
          'cz-find-savings',
          'Find saving ideas',
          'Where could I reduce spending without hurting important payments?',
        ),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzAccountDetailReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'primaryAccount' | 'accountBalance' | 'homeSnapshotBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { primaryAccount, accountBalance, homeSnapshotBlock } = context

  if (
    hasAny(normalized, [
      'available balance versus current balance',
      'specific transaction on this account',
      'filtering account activity',
      'account number, iban',
      'account details',
    ])
  ) {
    return {
      text:
        `### Account help\n` +
        `${primaryAccount ? `I am looking at **${primaryAccount.name}**, currently ${accountBalance}.` : 'Start from the selected account detail.'}\n` +
        `For balance questions, compare available/current balance and then inspect pending or recent transactions.\n` +
        `For transaction questions, search by merchant, amount, category, or date window.\n` +
        `For sharing details, open Account details so IBAN/account number copy stays inside the authenticated app surface.`,
      richBlocks: [homeSnapshotBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-account', 'Open Account', 'account-detail'),
        buildCzChatFollowUp(
          'cz-account-filter',
          'Filter activity',
          'Guide me through filtering account activity by amount, type, or category.',
        ),
        buildCzChatFollowUp(
          'cz-account-doc',
          'Find related document',
          'Help me find confirmations, statements, or recent bank documents.',
        ),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzBorrowingReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'selectedLoan' | 'totalOwed' | 'loanBalance' | 'documentBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { selectedLoan, totalOwed, loanBalance, documentBlock } = context

  if (
    hasAny(normalized, [
      'remaining amount',
      'monthly payment',
      'end date',
      'repaying part',
      'repay early',
      'next instalment',
      'loan contracts',
      'mortgage contracts',
      'interest rate',
      'fixation',
    ])
  ) {
    return {
      text:
        `### Borrowing check\n` +
        `${selectedLoan ? `${selectedLoan.name} is the visible borrowing item, with ${loanBalance} remaining/owed in this profile.` : `Total owed is ${totalOwed}.`}\n` +
        `For loans or mortgages, the assistant should not jump straight to an application or repayment action.\n` +
        `First review remaining amount, instalment, rate/fixation context, fees, and the account used for the next payment.\n` +
        `Documents are the right place for contracts, schedule changes, and official confirmations.`,
      richBlocks: [documentBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-documents', 'Open Documents', 'documents'),
        buildCzChatFollowUp(
          'cz-early-repay',
          'Explain early repayment',
          'Explain what I should check before repaying part of this loan early.',
        ),
        buildCzChatFollowUp(
          'cz-next-payment',
          'Review next payment',
          'Help me review the next mortgage payment and related account activity.',
        ),
      ],
    }
  }
  return null
}
