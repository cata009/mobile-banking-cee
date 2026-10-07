import { type CoAppingReplyResult } from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzChatFollowUp, buildCzNavigateFollowUp } from '../helpers'
import {
  buildInvestmentGoalProjectionBlock,
  formatInvestmentGoalHorizon,
  formatInvestmentGoalPurpose,
  formatInvestmentGoalRisk,
  getInvestmentGoalFundCollectionId,
} from '../investmentGoal'
import type { CzChatNormalizedContext } from '../normalizedContext'

import type { CzInvestmentRequestContext } from '../investmentRequestContext'

/** Owns the scripted predicates below. Null allows the next ordered domain to run. */
export function resolveCzInvestmentGoalReply(
  normalized: string,
  context: Pick<CzChatNormalizedContext, 'investmentGoalPortfolioBlock'>,
  investment: Pick<
    CzInvestmentRequestContext,
    'investmentGoalDraft' | 'investmentGoalNextStep' | 'isFreeTypedGoalAmountAnswer'
  >,
): Exclude<CoAppingReplyResult, string> | null {
  const { investmentGoalPortfolioBlock } = context
  const { investmentGoalDraft, investmentGoalNextStep, isFreeTypedGoalAmountAnswer } = investment
  if (
    ['start an investment goal', 'start an investment goal.', 'start investment goal', 'new investment goal'].includes(
      normalized,
    )
  ) {
    return {
      text:
        `### Investment goal setup\n` +
        `Let's build a useful brief before looking at funds.\n` +
        `We will cover purpose, timing, amount, monthly habit, and risk comfort, then continue into the existing Funds window.\n` +
        `Nothing is ordered from chat; product documents, suitability, and authorization remain inside Investments.`,
      richBlocks: [investmentGoalPortfolioBlock],
      followUps: [
        buildCzChatFollowUp(
          'cz-goal-purpose-grow-savings',
          'Grow my savings',
          'Set investment goal purpose to grow savings.',
        ),
        buildCzChatFollowUp(
          'cz-goal-purpose-future-purchase',
          'Future purchase',
          'Set investment goal purpose to future purchase.',
        ),
        buildCzChatFollowUp(
          'cz-goal-purpose-long-term-reserve',
          'Long-term reserve',
          'Set investment goal purpose to long-term reserve.',
        ),
      ],
    }
  }

  if (
    normalized === 'finish this investment goal conversation' ||
    normalized === 'finish this investment goal conversation.'
  ) {
    return {
      text:
        `### Goal plan complete\n` +
        `Your planning brief stays in this conversation. No goal or order was created.\n` +
        `You can start a new conversation whenever you want to explore funds or adjust the plan.`,
      followUps: [],
    }
  }

  if (normalized.startsWith('set investment goal ') || isFreeTypedGoalAmountAnswer) {
    if (investmentGoalNextStep === 'horizon') {
      return {
        text:
          `### Choose your horizon\n` +
          `Your purpose is **${formatInvestmentGoalPurpose(investmentGoalDraft.purpose)}**.\n` +
          `Choose when you may need the money. A longer horizon can absorb more movement, but it does not remove risk.`,
        followUps: [
          buildCzChatFollowUp('cz-goal-horizon-3-5', 'In 3-5 years', 'Set investment goal horizon to 3-5 years.'),
          buildCzChatFollowUp('cz-goal-horizon-5-10', 'In 5-10 years', 'Set investment goal horizon to 5-10 years.'),
          buildCzChatFollowUp(
            'cz-goal-horizon-undecided',
            'Not sure yet',
            'Set investment goal horizon to not sure yet.',
          ),
        ],
      }
    }

    if (investmentGoalNextStep === 'starting-amount') {
      return {
        text:
          `### Choose a starting amount\n` +
          `Horizon: **${formatInvestmentGoalHorizon(investmentGoalDraft.horizon)}**.\n` +
          `This amount is used only for the illustration. No money moves from chat.`,
        followUps: [
          buildCzChatFollowUp(
            'cz-goal-starting-5000',
            '5,000 CZK',
            'Set investment goal starting amount to 5,000 CZK.',
          ),
          buildCzChatFollowUp(
            'cz-goal-starting-10000',
            '10,000 CZK',
            'Set investment goal starting amount to 10,000 CZK.',
          ),
          buildCzChatFollowUp(
            'cz-goal-starting-undecided',
            "I'm not sure yet",
            'Set investment goal starting amount to not sure yet.',
          ),
        ],
      }
    }

    if (investmentGoalNextStep === 'monthly-contribution') {
      return {
        text:
          `### Add a monthly contribution\n` +
          `A regular contribution can reduce dependence on one entry day.\n` +
          `Choose a comfortable illustration amount, or leave it at zero for now.`,
        followUps: [
          buildCzChatFollowUp(
            'cz-goal-monthly-500',
            '500 CZK monthly',
            'Set investment goal monthly contribution to 500 CZK.',
          ),
          buildCzChatFollowUp(
            'cz-goal-monthly-1000',
            '1,000 CZK monthly',
            'Set investment goal monthly contribution to 1,000 CZK.',
          ),
          buildCzChatFollowUp(
            'cz-goal-monthly-none',
            'Not now',
            'Set investment goal monthly contribution to not now.',
          ),
        ],
      }
    }

    if (investmentGoalNextStep === 'risk-comfort') {
      return {
        text:
          `### Choose your risk comfort\n` +
          `This does not determine suitability. It only changes the illustrative range and helps frame the Funds review.\n` +
          `Choose the description closest to how much movement you are comfortable seeing.`,
        followUps: [
          buildCzChatFollowUp(
            'cz-goal-risk-calm',
            'Prefer less movement',
            'Set investment goal risk comfort to prefer less movement.',
          ),
          buildCzChatFollowUp('cz-goal-risk-balanced', 'Balanced', 'Set investment goal risk comfort to balanced.'),
          buildCzChatFollowUp(
            'cz-goal-risk-growth',
            'Accept more movement',
            'Set investment goal risk comfort to accept more movement.',
          ),
        ],
      }
    }

    const startingAmountLabel = investmentGoalDraft.startingAmount
      ? `${investmentGoalDraft.startingAmount.toLocaleString('en-US')} CZK`
      : 'Not decided yet'
    const monthlyContributionLabel = investmentGoalDraft.monthlyContribution
      ? `${investmentGoalDraft.monthlyContribution.toLocaleString('en-US')} CZK monthly`
      : 'No monthly contribution yet'

    return {
      text:
        `### Your goal plan\n` +
        `Purpose: **${formatInvestmentGoalPurpose(investmentGoalDraft.purpose)}**.\n` +
        `Horizon: **${formatInvestmentGoalHorizon(investmentGoalDraft.horizon)}**.\n` +
        `Starting amount: **${startingAmountLabel}**.\n` +
        `Monthly contribution: **${monthlyContributionLabel}**.\n` +
        `Risk comfort: **${formatInvestmentGoalRisk(investmentGoalDraft.riskComfort)}**.\n` +
        `This is an illustrative brief, not advice or an order. Continue to Funds to compare real products and documents.`,
      richBlocks: [buildInvestmentGoalProjectionBlock(investmentGoalDraft)],
      followUps: [
        buildCzNavigateFollowUp('cz-goal-explore-funds', 'Explore matching funds', 'investment-funds', {
          investmentFundCollectionId: getInvestmentGoalFundCollectionId(investmentGoalDraft.riskComfort),
        }),
        buildCzChatFollowUp('cz-goal-done', "I'm done", 'Finish this investment goal conversation.'),
      ],
    }
  }
  return null
}
