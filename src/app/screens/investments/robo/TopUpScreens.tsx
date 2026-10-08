import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig'
import StandardSignScreen from '@/app/components/flow/StandardSignScreen'
import StandardSuccessScreen from '@/app/components/flow/StandardSuccessScreen'
import { InvestmentBuyOrderReviewData } from '@/app/screens/investments/InvestmentBuyOrderFlow'
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount } from '@/data/products'
import { getCountryCurrency } from '@/data/exchangeRates'
import { type RoboFundingMethod, type RoboExistingGoal } from '@/features/investments/robo/types'
import { type RoboAdvisorManagementMode as ManagementMode } from '@/app/screens/investments/roboAdvisorFlowState'
import { displayRoboAccountNumber } from '@/features/investments/robo/presentationData'
import type * as React from 'react'
import type { RoboManagementEvent } from '@/features/investments/robo/managementState'
import type { RoboFundingFieldVisibility } from '@/features/investments/robo/types'

export function TopUpSignScreen({
  dispatchManagement,
  onAddMoney,
  topUpMethod,
  initialTopUpAmount,
  topUpFields,
  monthlyContributionAmount,
  date,
  selectedTopUpCashAccount,
}: {
  dispatchManagement: React.Dispatch<RoboManagementEvent>
  onAddMoney: (contribution: {
    method: RoboFundingMethod
    initialAmount: number
    monthlyAmount: number
    startDate: string
    cashAccountId: string
  }) => void
  topUpMethod: RoboFundingMethod
  initialTopUpAmount: number
  topUpFields: RoboFundingFieldVisibility
  monthlyContributionAmount: number
  date: string
  selectedTopUpCashAccount: CurrentAccount | null
}) {
  return (
    <StandardSignScreen
      title="Confirm investment"
      pinLabel="Security code"
      actionLabel="Confirm investment"
      pinHelper={
        topUpMethod === 'regular'
          ? 'Confirm the monthly investment plan from your selected cash account.'
          : 'Confirm this investment from your selected cash account. One basket order will be submitted for execution.'
      }
      onBack={() => dispatchManagement({ type: 'top-up-back', to: 'review' })}
      onSign={() => {
        onAddMoney({
          method: topUpMethod,
          initialAmount: initialTopUpAmount,
          monthlyAmount: topUpFields.monthlyContribution ? monthlyContributionAmount : 0,
          startDate: date,
          cashAccountId: selectedTopUpCashAccount?.id ?? '',
        })
        dispatchManagement({ type: 'top-up-submitted' })
      }}
    />
  )
}

export function TopUpSuccessScreen({
  topUpMethod,
  onMode,
}: {
  topUpMethod: RoboFundingMethod
  onMode: (mode: ManagementMode) => void
}) {
  return (
    <StandardSuccessScreen
      title={topUpMethod === 'regular' ? 'Monthly investment scheduled' : 'Add money request submitted'}
      body={
        topUpMethod === 'regular'
          ? 'Your monthly investment is scheduled. The goal value will change after the first basket order is executed.'
          : topUpMethod === 'combined'
            ? 'Your basket order is pending and your monthly investment is scheduled. The goal value will update after the order is executed.'
            : 'Your basket order is pending. The goal value and positions will update after it is executed. You can follow its status in History.'
      }
      actionLabel="Back to goal"
      onDone={() => onMode('menu')}
    />
  )
}

export function TopUpReviewScreen({
  topUpFields,
  basket,
  existingGoal,
  initialTopUpAmount,
  country,
  amountsHidden,
  monthlyContributionAmount,
  date,
  selectedTopUpCashAccount,
  dispatchManagement,
  canReviewTopUp,
}: {
  topUpFields: RoboFundingFieldVisibility
  basket: InvestmentBasketFund | undefined
  existingGoal: RoboExistingGoal | undefined
  initialTopUpAmount: number
  country: CountryId
  amountsHidden: boolean
  monthlyContributionAmount: number
  date: string
  selectedTopUpCashAccount: CurrentAccount | null
  dispatchManagement: React.Dispatch<RoboManagementEvent>
  canReviewTopUp: boolean
}) {
  const isRecurringTopUp = topUpFields.monthlyContribution
  const basketIsin = basket?.marketInfo.basketIsin ?? existingGoal?.basketIsin
  const orderSummary = [
    { label: 'Product', value: basket?.title ?? 'Investment basket' },
    ...(basketIsin ? [{ label: 'Product ID', value: basketIsin }] : []),
    { label: 'Order type', value: initialTopUpAmount > 0 ? 'One off BUY' : 'Monthly BUY' },
    ...(initialTopUpAmount > 0
      ? [
          { label: 'Execution', value: 'Next available market session' },
          {
            label: 'Estimated amount',
            value: formatInvestmentMoney(initialTopUpAmount, country, getCountryCurrency(country), amountsHidden),
          },
        ]
      : [
          { label: 'Frequency', value: 'Monthly' },
          {
            label: 'Monthly amount',
            value: formatInvestmentMoney(
              monthlyContributionAmount,
              country,
              getCountryCurrency(country),
              amountsHidden,
            ),
          },
          { label: 'Start date', value: date },
        ]),
    ...(initialTopUpAmount > 0 && isRecurringTopUp
      ? [
          {
            label: 'Monthly contribution',
            value: formatInvestmentMoney(
              monthlyContributionAmount,
              country,
              getCountryCurrency(country),
              amountsHidden,
            ),
          },
          { label: 'Monthly start date', value: date },
        ]
      : []),
  ]
  const accountSummary = selectedTopUpCashAccount
    ? [
        {
          label: 'Cash account',
          value: `${selectedTopUpCashAccount.name} · ${displayRoboAccountNumber(selectedTopUpCashAccount.accountNumber, country)}`,
        },
      ]
    : []
  return (
    <InvestmentBuyOrderReviewData
      orderSummary={orderSummary}
      accounts={accountSummary}
      currency={getCountryCurrency(country)}
      onBack={() => dispatchManagement({ type: 'top-up-back', to: 'amount' })}
      actionLabel={initialTopUpAmount > 0 ? 'Buy' : 'Set up monthly investment'}
      actionDisabled={!canReviewTopUp}
      onAction={() => dispatchManagement({ type: 'top-up-sign-requested' })}
    />
  )
}
