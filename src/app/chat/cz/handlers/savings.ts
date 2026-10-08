import {
  type CoAppingReplyResult,
  type CoAppingRichBlock,
} from '../../../../../package/mobile-pi-coapping-chat-package/src'
import {
  buildCzChatFollowUp,
  buildCzNavigateFollowUp,
  buildCzSavingsProductDetailAction,
  formatCzChatMoney,
} from '../helpers'
import type { CzChatNormalizedContext } from '../normalizedContext'
import { hasCzChatTerm as hasAny } from '../matching'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzSavingsPlanReply(
  normalized: string,
  context: Pick<
    CzChatNormalizedContext,
    | 'country'
    | 'localCurrency'
    | 'savingAccountAnnualRate'
    | 'termDepositAnnualRate'
    | 'savingAccountRate'
    | 'termDepositRate'
    | 'savingStartAmountOptions'
    | 'monthlyIncome'
    | 'monthlySpending'
    | 'currentAccountMoney'
    | 'suggestedMonthlySaving'
    | 'savingsCapacityBlock'
    | 'savingsProductChoiceBlock'
    | 'buildSavingsAmountFollowUps'
  >,
): Exclude<CoAppingReplyResult, string> | null {
  const {
    country,
    localCurrency,
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
  } = context

  if (
    hasAny(normalized, [
      'how much money can i save',
      'how much can i save',
      'monthly saving capacity',
      'how much should i save',
    ])
  ) {
    return {
      text:
        `### How much you can save\n` +
        `Based on this Home profile, I would start with about **${suggestedMonthlySaving} per month**.\n` +
        `I used three signals: expenses of **${monthlySpending}**, income of **${monthlyIncome}**, and **${currentAccountMoney}** currently sitting in current accounts.`,
      richBlocks: [savingsCapacityBlock, savingsProductChoiceBlock],
      followUps: [
        buildCzChatFollowUp('cz-saving-account-plan', 'Saving account', 'Use Saving account for my savings plan.'),
        buildCzChatFollowUp('cz-term-deposit-plan', 'Term deposit', 'Use Term deposit for my savings plan.'),
      ],
    }
  }

  const selectedSavingAmountKey = hasAny(normalized, ['light amount'])
    ? 'light'
    : hasAny(normalized, ['recommended amount'])
      ? 'recommended'
      : hasAny(normalized, ['stretch amount', 'build buffer amount'])
        ? 'stretch'
        : null

  if (selectedSavingAmountKey && hasAny(normalized, ['saving account', 'term deposit'])) {
    const selectedOption =
      savingStartAmountOptions.find((option) => option.key === selectedSavingAmountKey) ?? savingStartAmountOptions[1]
    const productLabel = hasAny(normalized, ['term deposit']) ? 'Term deposit' : 'Saving account'
    const selectedStartAmount = formatCzChatMoney(selectedOption.amount, localCurrency, country)
    const interestAmount =
      productLabel === 'Term deposit'
        ? formatCzChatMoney(selectedOption.amount * termDepositAnnualRate, localCurrency, country)
        : formatCzChatMoney((selectedOption.amount * savingAccountAnnualRate) / 12, localCurrency, country)
    const selectedRate = productLabel === 'Term deposit' ? termDepositRate : savingAccountRate
    const interestCadence = productLabel === 'Term deposit' ? 'per year' : 'per month'
    const interestPreview =
      productLabel === 'Term deposit'
        ? `At ${selectedRate}, ${selectedStartAmount} would earn about ${interestAmount} per year before tax/fees if held for the full term.`
        : `At ${selectedRate}, ${selectedStartAmount} would earn about ${interestAmount} per month before tax/fees while it stays available.`
    const savingsOpenNowBlock: CoAppingRichBlock = {
      type: 'product-cards',
      title: 'Ready to open',
      body: `Start with ${selectedStartAmount} now. ${selectedRate} means about ${interestAmount} ${interestCadence} on this amount before tax/fees.`,
      interactive: false,
      products: [
        {
          id: 'open-selected-savings-product',
          title: productLabel,
          subtitle: `${selectedRate}; approx. ${interestAmount} ${interestCadence}`,
          meta: 'Open now',
          tone: 'blue',
          icon: productLabel === 'Term deposit' ? 'Investments' : 'Wallet',
          action: buildCzSavingsProductDetailAction(productLabel),
        },
      ],
    }

    return {
      text:
        `### Ready to open\n` +
        `Perfect. We can start **${productLabel}** with **${selectedStartAmount}** now.\n` +
        `${interestPreview}\n` +
        `The monthly target stays around **${suggestedMonthlySaving}**, based on spending of **${monthlySpending}**, income of **${monthlyIncome}**, and **${currentAccountMoney}** in current accounts.\n` +
        `Chat should stop at this point. Final product terms, rate, eligibility, documents, and confirmation belong in the Products shelf.`,
      richBlocks: [savingsOpenNowBlock],
      followUps: [
        {
          id: `cz-open-now-${productLabel === 'Term deposit' ? 'term-deposit' : 'saving-account'}`,
          label: 'Open now',
          action: buildCzSavingsProductDetailAction(productLabel),
        },
        buildCzChatFollowUp('cz-adjust-saving-amount', 'Adjust amount', `Use ${productLabel} for my savings plan.`),
        buildCzChatFollowUp(
          'cz-compare-saving-products',
          'Compare products',
          'How should I choose between Saving account and Term deposit?',
        ),
      ],
    }
  }

  if (hasAny(normalized, ['use saving account for my savings plan', 'choose saving account', 'saving account plan'])) {
    return {
      text:
        `### Saving account selected\n` +
        `Good choice for the flexible option. This simulation uses **${savingAccountRate}** for the Saving account, so the money stays accessible while still earning interest.\n` +
        `How much do you want to save now?`,
      followUps: buildSavingsAmountFollowUps('Saving account'),
    }
  }

  if (hasAny(normalized, ['use term deposit for my savings plan', 'choose term deposit', 'term deposit plan'])) {
    return {
      text:
        `### Term deposit selected\n` +
        `This works for money you can lock for a while. This simulation uses **${termDepositRate}** for the Term deposit, with less flexibility but a stronger rate.\n` +
        `How much do you want to save now?`,
      followUps: buildSavingsAmountFollowUps('Term deposit'),
    }
  }

  if (
    hasAny(normalized, [
      'choose between saving account and term deposit',
      'compare saving products',
      'saving account and term deposit',
    ])
  ) {
    return {
      text:
        `### Saving account or term deposit?\n` +
        `For this profile I would not make it a generic product pitch.\n` +
        `Use **Saving account** if flexibility matters; the simulation rate is **${savingAccountRate}**.\n` +
        `Use **Term deposit** if you can lock the money; the simulation rate is **${termDepositRate}**.\n` +
        `The starting monthly target remains **${suggestedMonthlySaving}**, grounded in income, spending, and current-account cash.`,
      richBlocks: [savingsProductChoiceBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-saving-account-plan-after-compare',
          'Saving account',
          'Use Saving account for my savings plan.',
        ),
        buildCzChatFollowUp(
          'cz-term-deposit-plan-after-compare',
          'Term deposit',
          'Use Term deposit for my savings plan.',
        ),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzSavingsDetailReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'selectedSavings' | 'savingsBalance' | 'productsBlock'>,
): Exclude<CoAppingReplyResult, string> | null {
  const { selectedSavings, savingsBalance, productsBlock } = context

  if (
    hasAny(normalized, [
      'savings product',
      'savings progress',
      'interest, term',
      'access rules',
      'move money to or from',
      'compare this savings',
    ])
  ) {
    return {
      text:
        `### Savings check\n` +
        `${selectedSavings ? `${selectedSavings.name} currently shows ${savingsBalance}.` : 'Start by identifying which savings product the user means.'}\n` +
        `A realistic assistant answer should cover:\n` +
        `- progress versus goal or starting amount;\n` +
        `- interest, term, and access rules;\n` +
        `- whether moving money affects availability or a term/deposit condition.\n` +
        `If the customer is comparing products, ask about time horizon before naming a product.`,
      richBlocks: [productsBlock],
      followUps: [
        buildCzNavigateFollowUp('cz-open-products', 'Open Products', 'products'),
        buildCzChatFollowUp(
          'cz-savings-transfer',
          'Move money safely',
          'Can you guide me before I move money to or from this savings product?',
        ),
        buildCzChatFollowUp(
          'cz-savings-interest',
          'Explain interest',
          'Explain the interest, term, and access rules for this savings product.',
        ),
      ],
    }
  }
  return null
}
