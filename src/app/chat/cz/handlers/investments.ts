import {
  buildInvestmentBuyOrderQuote,
  getInvestmentBuyOrderValidation,
} from '@/app/screens/investments/investmentBuyOrderModel'
import {
  type CoAppingFollowUpSuggestion,
  type CoAppingReplyResult,
} from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, buildCzNavigateFollowUp, formatCzChatMoney } from '../helpers'
import {
  buildInvestmentCommercialFollowUp,
  buildInvestmentDoneFollowUp,
  buildInvestmentEssentialsFollowUp,
  buildInvestmentPortfolioFollowUp,
  buildInvestmentRiskFollowUp,
} from '../investmentFollowUps'
import type { CzChatNormalizedContext } from '../normalizedContext'
import { normalizeCzChatInput as normalize, hasCzChatTerm as hasAny } from '../matching'
import type { CzInvestmentRequestContext } from '../investmentRequestContext'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzInvestmentPurchaseReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'country' | 'selectedInvestmentSecurity' | 'currentAccounts'>,
  investment: Pick<
    CzInvestmentRequestContext,
    | 'buildInvestmentBuyQuantityFollowUps'
    | 'compactInvestmentBuyAccount'
    | 'buildInvestmentBuyAccountFollowUps'
    | 'buyQuantityCandidate'
    | 'buyQuantity'
    | 'accountQuantity'
    | 'selectedBuyAccount'
    | 'selectedExecutionTiming'
  >,
): Exclude<CoAppingReplyResult, string> | null {
  const { country, selectedInvestmentSecurity, currentAccounts } = context
  const {
    buildInvestmentBuyQuantityFollowUps,
    compactInvestmentBuyAccount,
    buildInvestmentBuyAccountFollowUps,
    buyQuantityCandidate,
    buyQuantity,
    accountQuantity,
    selectedBuyAccount,
    selectedExecutionTiming,
  } = investment
  if (
    selectedInvestmentSecurity &&
    normalized === normalize(`Start a buy order for ${selectedInvestmentSecurity.title}.`)
  ) {
    return {
      text:
        `### Choose quantity\n` +
        `How many whole units of **${selectedInvestmentSecurity.title}** would you like to buy?\n` +
        `Choose a quick option below or type another positive whole number in the message field. The market price remains indicative until Review Data.`,
      followUps: buildInvestmentBuyQuantityFollowUps(),
    }
  }

  if (selectedInvestmentSecurity && buyQuantityCandidate !== null) {
    if (!buyQuantity || !Number.isSafeInteger(buyQuantity) || buyQuantity <= 0) {
      return {
        text:
          `### Choose quantity\n` +
          `Enter a **positive whole number** of units for ${selectedInvestmentSecurity.title}. Fractions, zero, and negative quantities are not supported in this one-off demo order.`,
        followUps: buildInvestmentBuyQuantityFollowUps(),
      }
    }

    if (currentAccounts.length === 0) {
      return {
        text:
          `### No cash account available\n` +
          `I cannot prepare Review Data because this profile has no current account that can fund the order. No order has been created.`,
      }
    }

    return {
      text:
        `### Choose cash account\n` +
        `You selected **${buyQuantity} PCS** of **${selectedInvestmentSecurity.title}**. Which current account should fund the one-off order? Available balances below use the same account data as Investments.`,
      followUps: buildInvestmentBuyAccountFollowUps(buyQuantity),
    }
  }

  if (
    selectedInvestmentSecurity &&
    selectedBuyAccount &&
    accountQuantity &&
    accountQuantity > 0 &&
    selectedExecutionTiming
  ) {
    const quote = buildInvestmentBuyOrderQuote(selectedInvestmentSecurity, selectedBuyAccount, accountQuantity)
    const balanceValidation = getInvestmentBuyOrderValidation(quote, selectedBuyAccount)

    if (balanceValidation) {
      return {
        text:
          `### Insufficient balance\n` +
          `**${selectedBuyAccount.name}** cannot fund ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}. ${balanceValidation}\n` +
          `Choose another cash account below or enter a smaller quantity.`,
        followUps: [
          ...buildInvestmentBuyAccountFollowUps(accountQuantity),
          buildCzChatFollowUp(
            `cz-investment-buy-change-quantity-${selectedInvestmentSecurity.id}`,
            'Change quantity',
            `Start a buy order for ${selectedInvestmentSecurity.title}.`,
          ),
        ],
      }
    }

    const executionLabel = selectedExecutionTiming === 'today' ? 'Today' : 'Next business day'
    return {
      text:
        `### Ready to review\n` +
        `**Product:** ${selectedInvestmentSecurity.title}\n` +
        `**Quantity:** ${accountQuantity} PCS\n` +
        `**Cash account:** ${compactInvestmentBuyAccount(selectedBuyAccount)}\n` +
        `**Execution:** ${executionLabel}\n` +
        `**Estimated debit:** ${formatCzChatMoney(quote.debitAmount, quote.accountCurrency, country)}\n` +
        `Nothing has been placed. Check the summary, then continue to Review Data.`,
      followUps: [
        {
          id: `cz-investment-buy-review-${selectedInvestmentSecurity.id}-${selectedExecutionTiming}`,
          label: 'Review order',
          action: {
            id: `cz-investment-buy-review-${selectedInvestmentSecurity.id}-${selectedExecutionTiming}`,
            label: 'Review order',
            type: 'navigate',
            target: 'investment-buy',
            securityId: selectedInvestmentSecurity.id,
            investmentBuyDraft: {
              quantity: accountQuantity,
              accountId: selectedBuyAccount.id,
              frequency: 'one-off',
              executionTiming: selectedExecutionTiming,
            },
          },
        },
        buildCzChatFollowUp(
          `cz-investment-buy-change-timing-${selectedInvestmentSecurity.id}`,
          'Change timing',
          `Use ${compactInvestmentBuyAccount(selectedBuyAccount)} for ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}.`,
        ),
        buildCzChatFollowUp(
          `cz-investment-buy-change-account-${selectedInvestmentSecurity.id}`,
          'Change account',
          `Buy ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}.`,
        ),
        buildCzChatFollowUp(
          `cz-investment-buy-change-quantity-${selectedInvestmentSecurity.id}`,
          'Change quantity',
          `Start a buy order for ${selectedInvestmentSecurity.title}.`,
        ),
      ],
    }
  }

  if (selectedInvestmentSecurity && selectedBuyAccount && accountQuantity && accountQuantity > 0) {
    const quote = buildInvestmentBuyOrderQuote(selectedInvestmentSecurity, selectedBuyAccount, accountQuantity)
    const balanceValidation = getInvestmentBuyOrderValidation(quote, selectedBuyAccount)

    if (balanceValidation) {
      return {
        text:
          `### Insufficient balance\n` +
          `**${selectedBuyAccount.name}** cannot fund ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}. ${balanceValidation}\n` +
          `Choose another cash account below or enter a smaller quantity.`,
        followUps: [
          ...buildInvestmentBuyAccountFollowUps(accountQuantity),
          buildCzChatFollowUp(
            `cz-investment-buy-change-quantity-${selectedInvestmentSecurity.id}`,
            'Change quantity',
            `Start a buy order for ${selectedInvestmentSecurity.title}.`,
          ),
        ],
      }
    }

    const buildExecutionAction = (
      executionTiming: 'today' | 'next-business-day',
      label: string,
    ): CoAppingFollowUpSuggestion =>
      buildCzChatFollowUp(
        `cz-investment-buy-execution-${selectedInvestmentSecurity.id}-${executionTiming}`,
        label,
        `Set timing to ${label} for ${accountQuantity} PCS of ${selectedInvestmentSecurity.title} using ${compactInvestmentBuyAccount(selectedBuyAccount)}.`,
      )

    return {
      text:
        `### Choose execution timing\n` +
        `The draft is **${accountQuantity} PCS** of **${selectedInvestmentSecurity.title}**, funded from **${selectedBuyAccount.name}**. The estimated debit is **${formatCzChatMoney(quote.debitAmount, quote.accountCurrency, country)}**.\n` +
        `Choose when to send this one-off order. You will confirm the full summary in chat before Review Data.`,
      followUps: [
        buildExecutionAction('today', 'Today'),
        buildExecutionAction('next-business-day', 'Next business day'),
      ],
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzInvestmentProductReply(
  normalized: string,
  context: Pick<
    CzChatNormalizedContext,
    | 'selectedInvestmentSecurity'
    | 'topInvestmentSecurity'
    | 'topInvestmentShare'
    | 'currencyMix'
    | 'assetClassMix'
    | 'selectedInvestmentValue'
    | 'selectedInvestmentPerformance'
    | 'selectedInvestmentQuantity'
    | 'selectedInvestmentRisk'
    | 'selectedInvestmentLiquidity'
    | 'selectedInvestmentPortfolioShare'
    | 'selectedInvestmentProductBlock'
    | 'selectedInvestmentChart'
    | 'selectedInvestmentExplanationBlock'
    | 'selectedInvestmentNameNormalized'
  >,
  investment: Pick<CzInvestmentRequestContext, 'showSelectedInvestmentCardOnce' | 'keepUnvisitedInvestmentFollowUps'>,
): Exclude<CoAppingReplyResult, string> | null {
  const {
    selectedInvestmentSecurity,
    topInvestmentSecurity,
    topInvestmentShare,
    currencyMix,
    assetClassMix,
    selectedInvestmentValue,
    selectedInvestmentPerformance,
    selectedInvestmentQuantity,
    selectedInvestmentRisk,
    selectedInvestmentLiquidity,
    selectedInvestmentPortfolioShare,
    selectedInvestmentProductBlock,
    selectedInvestmentChart,
    selectedInvestmentExplanationBlock,
    selectedInvestmentNameNormalized,
  } = context
  const { showSelectedInvestmentCardOnce, keepUnvisitedInvestmentFollowUps } = investment
  if (
    selectedInvestmentSecurity &&
    (normalized.startsWith(`explain ${selectedInvestmentNameNormalized} and the position`) ||
      hasAny(normalized, ['explain this product', 'explain this fund', 'product overview for']))
  ) {
    return {
      text:
        `### A quick look at ${selectedInvestmentSecurity.title}\n` +
        `It gives you **${selectedInvestmentSecurity.assetClass.toLowerCase()} exposure** through one **${selectedInvestmentSecurity.instrumentCurrency} ${selectedInvestmentSecurity.productType.toLowerCase()}**.\n` +
        `**Why it may fit:** one simple way to access this investment strategy. **Keep in mind:** value can fall, capital is not guaranteed, and **${selectedInvestmentLiquidity.toLowerCase()}** means access follows the product rules.${
          selectedInvestmentSecurity.owned &&
          selectedInvestmentSecurity.localCurrency !== selectedInvestmentSecurity.instrumentCurrency
            ? ` Because you view it in **${selectedInvestmentSecurity.localCurrency}**, currency moves can also change your result.`
            : ''
        }\n` +
        `${selectedInvestmentSecurity.owned ? 'Choose what matters to you next.' : 'You do not hold it yet, so no personal performance is shown.'} Information only, not a personal recommendation.`,
      richBlocks: showSelectedInvestmentCardOnce(
        selectedInvestmentExplanationBlock
          ? { ...selectedInvestmentExplanationBlock, chart: selectedInvestmentChart ?? undefined }
          : null,
      ),
      followUps: keepUnvisitedInvestmentFollowUps([
        buildCzChatFollowUp(
          'cz-investment-product-performance',
          'How is it doing for me?',
          `How is ${selectedInvestmentSecurity.title} doing for me?`,
        ),
        buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
        buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity, 'Show me the essentials'),
      ]),
    }
  }

  if (selectedInvestmentSecurity && hasAny(normalized, ['i have what i need for', "i'm done with", 'im done with'])) {
    return {
      text:
        `### All set\n` +
        `You covered the product, its performance, key risks, and essential facts. Nothing was ordered or changed.`,
    }
  }

  if (
    selectedInvestmentSecurity &&
    hasAny(normalized, [
      'how is my position',
      'doing for me',
      'review my performance',
      'position performing',
      'product performing',
      'holding performing',
      'performance of this',
    ])
  ) {
    const performanceDirection =
      selectedInvestmentSecurity.performancePercent > 0
        ? 'positive'
        : selectedInvestmentSecurity.performancePercent < 0
          ? 'negative'
          : 'flat'
    const positionInterpretation = selectedInvestmentSecurity.owned
      ? `The latest snapshot is **${performanceDirection}**${selectedInvestmentPortfolioShare ? `, and this position represents about **${selectedInvestmentPortfolioShare}** of your current investment portfolio` : ''}.`
      : 'You do not currently hold this product, so this is a product snapshot rather than personal performance.'
    const currencyInterpretation =
      selectedInvestmentSecurity.localCurrency !== selectedInvestmentSecurity.instrumentCurrency
        ? `The product is in **${selectedInvestmentSecurity.instrumentCurrency}** while your portfolio is viewed in **${selectedInvestmentSecurity.localCurrency}**, so currency movement can change the local result.`
        : `The product and portfolio view use **${selectedInvestmentSecurity.instrumentCurrency}**, so there is no separate display-currency effect in this snapshot.`

    return {
      text:
        `### ${selectedInvestmentSecurity.owned ? 'Your position at a glance' : 'Product snapshot'}\n` +
        `${positionInterpretation}\n` +
        `${currencyInterpretation}\n` +
        `Want to explore further? Any order still requires review and signing. Information only, not personal advice.`,
      richBlocksPosition: 'before-text',
      richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
      followUps: keepUnvisitedInvestmentFollowUps([
        buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
        buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
        buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
        buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
      ]),
    }
  }

  if (
    selectedInvestmentSecurity &&
    hasAny(normalized, [
      'what could affect my return',
      'affect my return from',
      'review risk',
      'explain the risk',
      'risk and liquidity',
      'liquidity and currency',
      'currency exposure of',
    ])
  ) {
    const currencyRisk =
      selectedInvestmentSecurity.localCurrency !== selectedInvestmentSecurity.instrumentCurrency
        ? `**${selectedInvestmentSecurity.instrumentCurrency}/${selectedInvestmentSecurity.localCurrency}** moves can increase or reduce the value you see.`
        : `There is no extra display-currency effect in this snapshot.`

    return {
      text:
        `### What can move your return\n` +
        `**Markets:** the investments inside the product can rise or fall.\n` +
        `**Currency:** ${currencyRisk}\n` +
        `**Access:** **${selectedInvestmentLiquidity}** means withdrawals follow the product timing.\n` +
        `**Costs:** fees reduce what you keep.\n` +
        `**${selectedInvestmentRisk}** still means losses are possible. Information only, not a personal recommendation.`,
      richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
      followUps: keepUnvisitedInvestmentFollowUps([
        buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
        buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity),
        buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
        buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
      ]),
    }
  }

  if (
    selectedInvestmentSecurity &&
    hasAny(normalized, [
      'show me the essential information',
      'show me the essentials',
      'summarize the key document',
      'documents should i review',
      'documents matter',
      'what documents',
      'key information document',
      'prospectus',
    ])
  ) {
    return {
      text:
        `### Check these 3 things\n` +
        `Before you decide, focus on:\n` +
        `1. **Potential gain or loss:** review the KID/KIID risk level and scenarios.\n` +
        `2. **Total cost:** check entry, ongoing, and exit fees.\n` +
        `3. **Access to money:** confirm the timing behind **${selectedInvestmentLiquidity.toLowerCase()}**.\n` +
        `${selectedInvestmentSecurity.owned ? 'For your holding, use the trade confirmation and statement to verify booked units and value.' : 'You do not hold it yet, so there is no trade confirmation to check.'}\n` +
        `This quick summary does not replace the source document or personal advice.`,
      richBlocks: [
        {
          type: 'product-cards',
          title: 'Key information at a glance',
          body: '',
          variant: 'compact',
          interactive: false,
          products: [
            {
              id: 'kid-kiid',
              title: `${selectedInvestmentSecurity.title} — KID/KIID`,
              subtitle: 'Risk, scenarios, costs and access',
              meta: 'Summary in chat · Source document',
              tone: 'neutral',
              icon: 'app:account-option-statement',
            },
          ],
        },
      ],
      followUps: keepUnvisitedInvestmentFollowUps([
        buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
        buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
        buildCzChatFollowUp(
          'cz-investment-product-overview',
          'Back to product overview',
          `Give me the product overview for ${selectedInvestmentSecurity.title}.`,
        ),
        buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
      ]),
    }
  }

  if (
    selectedInvestmentSecurity &&
    hasAny(normalized, ['what should i consider', 'review checklist', 'decision factors', 'before deciding'])
  ) {
    return {
      text:
        `### A quick decision check\n` +
        `Match the product to your **goal and time horizon**, then check **portfolio fit**, **risk and access**, **currency**, and **total costs**.\n` +
        `${selectedInvestmentSecurity.owned ? `Your holding is **${selectedInvestmentValue}**${selectedInvestmentPortfolioShare ? `, about **${selectedInvestmentPortfolioShare}** of your investments` : ''}.` : 'You do not hold it yet, so focus on the exposure it would add.'}\n` +
        `Use the KID/KIID for final product facts. Information only, not a personal recommendation.`,
      richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
      followUps: keepUnvisitedInvestmentFollowUps([
        buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
        buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
        buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity),
        buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
      ]),
    }
  }

  if (
    selectedInvestmentSecurity &&
    hasAny(normalized, ['in my portfolio context', 'review portfolio', 'portfolio fit', 'portfolio context for'])
  ) {
    const portfolioFit = selectedInvestmentSecurity.owned
      ? `The holding is **${selectedInvestmentValue}**${selectedInvestmentPortfolioShare ? `, about **${selectedInvestmentPortfolioShare}** of the current investment value` : ''}.`
      : 'This product is not currently held, so the useful question is what concentration, asset-class, and currency exposure it would add.'

    return {
      text:
        `### How it fits your portfolio\n` +
        `${portfolioFit}\n` +
        `${topInvestmentSecurity ? `Your largest holding is **${topInvestmentSecurity.title}** at **${topInvestmentShare}**.` : 'A wider concentration comparison is not available.'}\n` +
        `${currencyMix || assetClassMix ? `Main exposures: **${currencyMix || 'currency unavailable'}** and **${assetClassMix || 'asset class unavailable'}**.` : 'Check the Currency and Asset Class tabs before adding more.'}\n` +
        `Use this to spot concentration before adding more. Information only, not a personal recommendation.`,
      richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
      followUps: keepUnvisitedInvestmentFollowUps([
        buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
        buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
        buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity),
        buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
      ]),
    }
  }

  if (
    selectedInvestmentSecurity &&
    (normalized.includes(selectedInvestmentNameNormalized) ||
      hasAny(normalized, [
        'this investment product',
        'this fund',
        'think about this product',
        'think of this product',
        'opinion about this product',
        'should i buy',
        'should i sell',
        'should i keep',
      ]))
  ) {
    const ownershipSummary = selectedInvestmentSecurity.owned
      ? `The visible holding is **${selectedInvestmentValue}** across **${selectedInvestmentQuantity} PCS**.`
      : 'This product is not currently shown as one of your holdings, so I will discuss the product rather than inventing a position.'

    return {
      text:
        `### Your quick product view\n` +
        `${ownershipSummary}\n` +
        `It is a **${selectedInvestmentSecurity.assetClass.toLowerCase()} ${selectedInvestmentSecurity.productType.toLowerCase()}** in **${selectedInvestmentSecurity.instrumentCurrency}**, currently showing **${selectedInvestmentPerformance}** performance with **${selectedInvestmentRisk.toLowerCase()}** and **${selectedInvestmentLiquidity.toLowerCase()}**.\n` +
        `Next, check how it fits your goal, portfolio, costs, and access needs. Information only, not a personal recommendation.`,
      richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
      followUps: keepUnvisitedInvestmentFollowUps([
        buildCzChatFollowUp(
          'cz-investment-product-performance',
          'How is it doing for me?',
          `How is ${selectedInvestmentSecurity.title} doing for me?`,
        ),
        buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
        buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity, 'Show me the essentials'),
      ]),
    }
  }
  return null
}

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzInvestmentPortfolioReply(
  normalized: string,
  context: Pick<
    CzChatNormalizedContext,
    | 'investmentProduct'
    | 'pendingInvestmentOrders'
    | 'topInvestmentSecurity'
    | 'topInvestmentShare'
    | 'currencyMix'
    | 'assetClassMix'
    | 'investmentValue'
    | 'investmentReturn'
    | 'investmentGainLoss'
    | 'latestOrderSummary'
    | 'orderStatusSummary'
    | 'investmentPortfolioBlock'
    | 'investmentOrdersBlock'
    | 'investmentNextMoveBlock'
  >,
): Exclude<CoAppingReplyResult, string> | null {
  const {
    investmentProduct,
    pendingInvestmentOrders,
    topInvestmentSecurity,
    topInvestmentShare,
    currencyMix,
    assetClassMix,
    investmentValue,
    investmentReturn,
    investmentGainLoss,
    latestOrderSummary,
    orderStatusSummary,
    investmentPortfolioBlock,
    investmentOrdersBlock,
    investmentNextMoveBlock,
  } = context

  if (
    hasAny(normalized, [
      'review my investment portfolio context',
      'review my portfolio',
      'review portfolio',
      'portfolio context',
      'current portfolio',
    ])
  ) {
    return {
      text:
        `### Portfolio context\n` +
        `${investmentProduct ? `${investmentProduct.name} currently shows ${investmentValue} and ${investmentReturn} performance.` : 'This profile can still explain the portfolio review path.'}\n` +
        `I would review it in this order:\n` +
        `1. Value and performance: read ${investmentReturn} together with ${investmentGainLoss}, not as a standalone recommendation.\n` +
        `2. Concentration: ${topInvestmentSecurity ? `${topInvestmentSecurity.title} is the largest holding at ${topInvestmentShare}.` : 'check whether one product dominates the portfolio.'}\n` +
        `3. Exposure: ${currencyMix || 'check currency distribution'} and ${assetClassMix || 'asset class distribution'} before adding money.\n` +
        `4. Activity: check orders before starting a new buy, because pending or rejected orders can change the next step.`,
      richBlocks: [investmentPortfolioBlock, investmentOrdersBlock],
      followUps: [
        buildCzChatFollowUp('cz-invest-review-orders', 'Review my orders', 'Review my investment orders.'),
        buildCzChatFollowUp(
          'cz-invest-next-move',
          'Plan next move',
          'Help me decide the smartest next investment step using my portfolio, orders, risk, and currency exposure.',
        ),
        buildCzNavigateFollowUp('cz-open-investments', 'Open Investments', 'investments'),
      ],
    }
  }

  if (
    hasAny(normalized, [
      'review my investment orders',
      'review my orders',
      'investment orders',
      'pending orders',
      'rejected orders',
      'executed orders',
      'order status',
    ])
  ) {
    return {
      text:
        `### Investment orders\n` +
        `Orders are the action trail behind the portfolio. In this mock profile the status mix is **${orderStatusSummary}**.\n` +
        `Latest order: ${latestOrderSummary}.\n` +
        `Read them this way:\n` +
        `1. **Pending** means the portfolio may still change, so do not top up blindly.\n` +
        `2. **Executed** confirms what already affected holdings and history.\n` +
        `3. **Rejected** needs a reason check before retrying, especially if price, documents, or suitability changed.\n` +
        `The right handoff is Investments History on the Orders tab; chat should summarize and prepare the review, not hide the order evidence.`,
      richBlocks: [investmentOrdersBlock],
      followUps: [
        buildCzChatFollowUp('cz-invest-pending-orders', 'Pending orders', 'Explain my pending investment orders.'),
        buildCzChatFollowUp(
          'cz-invest-rejected-orders',
          'Rejected orders',
          'Explain rejected investment orders and what to check before retrying.',
        ),
        buildCzNavigateFollowUp('cz-open-investment-history', 'Open History', 'investments-history'),
      ],
    }
  }

  if (
    hasAny(normalized, [
      'smartest next investment step',
      'plan next investment move',
      'plan next move',
      'next investment step',
      'risk and currency exposure',
      'review risk',
      'reduce currency risk',
      'rebalance',
      'set recurring order',
      'recurring order',
    ])
  ) {
    return {
      text:
        `### Next investment move\n` +
        `I would not answer this with one product. A smarter next step compares portfolio shape and order activity first.\n` +
        `- Portfolio: ${investmentValue}, ${investmentReturn} performance, ${topInvestmentSecurity ? `${topInvestmentShare} in ${topInvestmentSecurity.title}` : 'largest holding not available'}.\n` +
        `- Exposure: ${currencyMix || 'currency mix needs review'}; ${assetClassMix || 'asset-class mix needs review'}.\n` +
        `- Orders: ${orderStatusSummary}. ${pendingInvestmentOrders.length ? 'Resolve pending orders before adding a new one.' : 'No pending-order blocker appears in the mock order set.'}\n` +
        `Suggested path: define the goal, check whether exposure still fits, then choose between a recurring order, a one-off top-up, or doing nothing until the next review date.`,
      richBlocks: [investmentPortfolioBlock, investmentOrdersBlock, investmentNextMoveBlock],
      followUps: [
        buildCzChatFollowUp('cz-invest-start-goal', 'Start a goal', 'Start an investment goal.'),
        buildCzChatFollowUp('cz-invest-review-orders-next', 'Review orders', 'Review my investment orders.'),
        buildCzNavigateFollowUp('cz-open-investments-next', 'Open Investments', 'investments'),
      ],
    }
  }
  return null
}
