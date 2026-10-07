import { AmountSuggestionChip } from '@/app/components/AmountSuggestionChip'
import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import { AppIcon } from '@/app/components/icons'
import { formatCzkInteger } from '@/features/investments/robo/model'
import { isValidRoboHorizon } from '@/features/investments/robo/validation'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'

export function FundingAmountSuggestion({
  amount,
  value,
  onSelect,
}: {
  amount: string
  value: string
  onSelect: (amount: string) => void
}) {
  const selected = value === amount
  return (
    <AmountSuggestionChip selected={selected} onSelect={() => onSelect(amount)}>
      {formatCzkInteger(amount)} CZK
    </AmountSuggestionChip>
  )
}

export interface GoalPlanFieldsProps {
  targetAmount: string
  onTargetAmountChange: (value: string) => void
  horizonYears: number
  manualHorizon: string
  onSelectHorizon: (years: number) => void
  onManualHorizonChange: (value: string) => void
}

export function GoalPlanFields({
  targetAmount,
  onTargetAmountChange,
  horizonYears,
  manualHorizon,
  onSelectHorizon,
  onManualHorizonChange,
}: GoalPlanFieldsProps) {
  return (
    <>
      <TextField
        label="Target amount"
        value={targetAmount}
        onChange={onTargetAmountChange}
        inputMode="numeric"
        suffix="CZK"
        suffixOutsideDivider
        suffixClassName="!font-bold"
      />
      <div className="mt-[12px] grid grid-cols-3 gap-[8px]" role="group" aria-label="Suggested target amounts">
        {['100000', '250000', '500000'].map((amount) => (
          <AmountSuggestionChip
            key={amount}
            selected={targetAmount === amount}
            onSelect={() => onTargetAmountChange(amount)}
          >
            {formatCzkInteger(amount)} CZK
          </AmountSuggestionChip>
        ))}
      </div>
      <section className="mt-[20px]" aria-label="Time horizon">
        <h2 className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">Choose your time horizon</h2>
        <p className="mt-[10px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          Choose a period that fits your goal. It guides the recommendation, but your goal will not close automatically.
        </p>
        <div
          role="radiogroup"
          aria-label="Time horizon"
          className="mt-[10px] grid grid-cols-2 gap-x-[12px] gap-y-[4px]"
        >
          {[3, 5, 7, 10].map((years) => {
            const selected = horizonYears === years && !manualHorizon
            return (
              <button
                key={years}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${years} years`}
                onClick={() => onSelectHorizon(years)}
                className="flex min-h-[48px] w-full items-center gap-[12px] text-left"
              >
                <AppIcon name={selected ? 'radio-selected' : 'radio-unselected'} size={24} />
                <span className="text-[14px] font-bold leading-[18px]">{years} YEARS</span>
              </button>
            )
          })}
          <button
            type="button"
            role="radio"
            aria-checked={manualHorizon.length > 0}
            aria-label="Other time horizon"
            onClick={() => onManualHorizonChange(manualHorizon || '3')}
            className="col-span-2 flex min-h-[48px] w-full items-center gap-[12px] text-left"
          >
            <AppIcon name={manualHorizon.length > 0 ? 'radio-selected' : 'radio-unselected'} size={24} />
            <span className="text-[14px] font-bold leading-[18px]">OTHER TIME HORIZON</span>
          </button>
        </div>
        {manualHorizon.length > 0 ? (
          <div className="mt-[12px]">
            <TextField
              label="Other time horizon (years)"
              value={manualHorizon}
              onChange={(value) => onManualHorizonChange(value.replace(/\D/g, '').slice(0, 2))}
              inputMode="numeric"
              helperText="Select between 3 and 15 years"
              errorText={
                manualHorizon.length > 0 && !isValidRoboHorizon(manualHorizon)
                  ? 'Enter a whole number from 3 to 15 years.'
                  : undefined
              }
            />
          </div>
        ) : null}
      </section>
    </>
  )
}

export function GoalPlanScreen({
  dataScreen,
  targetAmount,
  onTargetAmountChange,
  horizonYears,
  manualHorizon,
  onSelectHorizon,
  onManualHorizonChange,
  onBack,
  onClose,
  onContinue,
  continueLabel = 'Continue',
}: GoalPlanFieldsProps & {
  dataScreen: string
  onBack: () => void
  onClose: () => void
  onContinue: (years: number) => void
  continueLabel?: string
}) {
  const hasHorizonSelection = horizonYears > 0 || isValidRoboHorizon(manualHorizon)
  const selectedHorizon = horizonYears || Number(manualHorizon) || 10

  return (
    <RoboScreen
      title="Set your goal plan"
      description="Choose a target amount and time horizon to shape your investment recommendation."
      onBack={onBack}
      onClose={onClose}
      headerAction="none"
      dataScreen={dataScreen}
      contentTopClassName="pt-[20px]"
      footer={
        <PrimaryButton
          labelSize="18"
          disabled={!Number(targetAmount) || !hasHorizonSelection}
          onClick={() => onContinue(selectedHorizon)}
        >
          {continueLabel}
        </PrimaryButton>
      }
    >
      <GoalPlanFields
        targetAmount={targetAmount}
        onTargetAmountChange={onTargetAmountChange}
        horizonYears={horizonYears}
        manualHorizon={manualHorizon}
        onSelectHorizon={onSelectHorizon}
        onManualHorizonChange={onManualHorizonChange}
      />
    </RoboScreen>
  )
}
