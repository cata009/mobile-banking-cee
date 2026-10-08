import StandardSuccessScreen from '@/app/components/flow/StandardSuccessScreen'

export interface CreationSuccessScreenProps {
  goalName: string
  targetAmount: string
  basketName: string
  onAddMoney: () => void
  onOpenGoal: () => void
}

export function CreationSuccessScreen({ goalName, onAddMoney, onOpenGoal }: CreationSuccessScreenProps) {
  return (
    <StandardSuccessScreen
      title="Your goal is ready"
      actionLabel="Add money"
      onDone={onAddMoney}
      secondaryActionLabel="View goal"
      onSecondaryAction={onOpenGoal}
      body={
        <>
          <h2 className="uc-type-h2 leading-[23px]">Give your goal a head start</h2>
          <p className="mt-[12px] leading-[22px]">
            Start investing towards <strong className="uc-type-n4-strong">{goalName}</strong> with a one-off
            contribution or a monthly plan that fits your life.
          </p>
          <p className="uc-type-n5 mt-[12px] leading-[19px] text-[var(--uc-text-muted)]">
            You’ll review the amount before confirming.
          </p>
        </>
      }
    />
  )
}
