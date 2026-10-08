import { applyRoboSale } from '@/features/investments/robo/goalActions'
import { createRoboTradeEventId } from '@/features/investments/robo/operationContext'
import PrimaryButton from '@/app/components/PrimaryButton'
import InvestmentProductCard from '@/app/components/investments/InvestmentProductCard'
import InvestmentSellOrderFlow from '@/app/screens/investments/InvestmentSellOrderFlow'
import { formatInvestmentAmountParts, formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import type { CurrentAccount } from '@/data/products'
import { type InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import { type RoboExistingGoal, type RoboPortfolio } from '@/features/investments/robo/types'
import { type RoboAdvisorManagementMode as ManagementMode } from '@/app/screens/investments/roboAdvisorFlowState'
import { RoboWithdrawalProduct } from '@/features/investments/robo/goalModel'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import type * as React from 'react'
import type { RoboManagementEvent } from '@/features/investments/robo/managementState'

export function WithdrawalSaleScreen({
  selectedWithdrawalOrderSecurity,
  currentAccounts,
  country,
  amountsHidden,
  dispatchManagement,
  existingGoal,
  portfolio,
  currentValue,
  securityCatalog,
  selectedWithdrawalProductId,
  onGoalUpdated,
  onMode,
}: {
  selectedWithdrawalOrderSecurity: InvestmentCatalogSecurity
  currentAccounts: readonly CurrentAccount[]
  country: CountryId
  amountsHidden: boolean
  dispatchManagement: React.Dispatch<RoboManagementEvent>
  existingGoal: RoboExistingGoal | undefined
  portfolio: RoboPortfolio
  currentValue: number
  securityCatalog: readonly InvestmentCatalogSecurity[]
  selectedWithdrawalProductId: string | null
  onGoalUpdated: (goal: RoboExistingGoal) => void
  onMode: (mode: ManagementMode) => void
}) {
  return (
    <InvestmentSellOrderFlow
      security={selectedWithdrawalOrderSecurity}
      accounts={currentAccounts}
      country={country}
      amountsHidden={amountsHidden}
      onBack={() => dispatchManagement({ type: 'sale-cancelled' })}
      onComplete={(execution) => {
        if (existingGoal && execution.quantity > 0) {
          const nextGoal = applyRoboSale(
            existingGoal,
            portfolio,
            currentValue,
            country,
            securityCatalog,
            selectedWithdrawalProductId,
            execution,
            { id: createRoboTradeEventId(), date: new Date().toISOString() },
          )
          if (nextGoal !== existingGoal) onGoalUpdated(nextGoal)
        }
        dispatchManagement({ type: 'sale-completed' })
        onMode('menu')
      }}
    />
  )
}

export function ManageWithdrawScreen({
  onBack,
  onClose,
  withdrawableProducts,
  country,
  amountsHidden,
  openWithdrawalProduct,
}: {
  onBack: () => void
  onClose: () => void
  withdrawableProducts: RoboWithdrawalProduct[]
  country: CountryId
  amountsHidden: boolean
  openWithdrawalProduct: (product: RoboWithdrawalProduct) => void
}) {
  return (
    <RoboScreen
      title="Withdraw money"
      description="Select an investment to start your sale. Review the quantity, estimated proceeds and order details before signing."
      contentTopClassName="pt-[4px]"
      onBack={onBack}
      onClose={onClose}
      headerAction="none"
      dataScreen="withdraw"
    >
      {withdrawableProducts.length === 0 ? (
        <div className="pt-[26px]" data-testid="robo-withdraw-empty-state">
          <p className="text-[16px] font-normal leading-[24px] text-[var(--uc-text)]">No investments to withdraw.</p>
        </div>
      ) : (
        <div className="-mx-[24px]">
          {withdrawableProducts.map((product) => {
            const security = product.security
            if (!security) {
              return (
                <div key={product.id} className="flex min-h-[72px] w-full items-center px-[16px] py-[12px] text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block uc-type-n5-strong text-[var(--uc-text)]">{product.name}</span>
                    <span className="mt-[3px] block uc-type-n6 text-[var(--uc-text-muted)]">
                      Current quote unavailable
                    </span>
                  </span>
                </div>
              )
            }

            return (
              <InvestmentProductCard
                key={product.id}
                security={security}
                valueParts={formatInvestmentAmountParts(security.value, country, security.currency, amountsHidden)}
                performanceParts={formatInvestmentAmountParts(
                  security.performanceAmount,
                  country,
                  security.localCurrency,
                  amountsHidden,
                  true,
                )}
                valueLabel="Value"
                performanceLabel="Performance"
                czRoboAmountStyle
                amountsHidden={amountsHidden}
                currentPriceParts={formatInvestmentAmountParts(
                  security.marketPrice,
                  country,
                  security.instrumentCurrency,
                  amountsHidden,
                )}
                portfolioValueParts={formatInvestmentAmountParts(
                  security.localValue,
                  country,
                  security.localCurrency,
                  amountsHidden,
                )}
                onClick={() => openWithdrawalProduct(product)}
              />
            )
          })}
        </div>
      )}
    </RoboScreen>
  )
}

export function ManageFullWithdrawalScreen({
  onBack,
  onClose,
  selectedWithdrawalValue,
  renderSelectedWithdrawalProducts,
}: {
  onBack: () => void
  onClose: () => void
  selectedWithdrawalValue: number
  renderSelectedWithdrawalProducts: () => React.JSX.Element
}) {
  return (
    <RoboScreen
      title="Review sale orders"
      description="The selected products will be sold. The final amount may be lower than today’s value."
      onBack={onBack}
      onClose={onClose}
      dataScreen="full-withdrawal"
      footer={
        <PrimaryButton labelSize="18" onClick={onBack}>
          Review sale orders
        </PrimaryButton>
      }
    >
      <div className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px]">
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">Estimated selected value</p>
        <p className="uc-type-h2 mt-[5px] text-[var(--uc-text)]">
          {formatInvestmentMoney(selectedWithdrawalValue, 'CZ', 'CZK')}
        </p>
        <p className="uc-type-n5 mt-[8px] leading-[17px] text-[var(--uc-text-muted)]">
          This is not a guaranteed withdrawal amount.
        </p>
      </div>
      {renderSelectedWithdrawalProducts()}
    </RoboScreen>
  )
}
