import { type RoboAdvisorCreationStep as CreationStep } from '@/features/investments/robo/legacyFlowState'
import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import { cn } from '@/app/components/ui/utils'
import { ROBO_GOAL_TYPES, getRoboGoalNameSuggestions } from '@/features/investments/robo/catalog'
import { GoalSelectionCard } from '@/app/screens/investments/robo/OnboardingScreens'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'

export function CreationGoalTypeScreen({
  goBackByStep,
  requestExit,
  goalType,
  setStep,
  setGoalType,
}: {
  goBackByStep: () => void
  requestExit: () => void
  goalType: string
  setStep: (value: CreationStep) => void
  setGoalType: (value: string) => void
}) {
  return (
    <RoboScreen
      title="Choose your goal"
      description="What would you like this investment to help you achieve?"
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen="goal-type"
      contentTopClassName="pt-[16px]"
      footer={
        <PrimaryButton labelSize="18" disabled={!goalType} onClick={() => setStep('goal-name')}>
          Continue
        </PrimaryButton>
      }
    >
      <div className="space-y-[12px]">
        {ROBO_GOAL_TYPES.map((type) => (
          <GoalSelectionCard
            key={type.id}
            id={type.id}
            title={type.title}
            description={type.description}
            selected={goalType === type.title}
            onSelect={() => setGoalType(type.title)}
          />
        ))}
      </div>
    </RoboScreen>
  )
}

export function CreationGoalNameScreen({
  goBackByStep,
  requestExit,
  goalName,
  setStep,
  setGoalName,
  goalType,
}: {
  goBackByStep: () => void
  requestExit: () => void
  goalName: string
  setStep: (value: CreationStep) => void
  setGoalName: (value: string) => void
  goalType: string
}) {
  return (
    <RoboScreen
      title="Name your goal"
      description="Give your goal a name so you can easily recognize it later."
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen="goal-name"
      footer={
        <PrimaryButton labelSize="18" disabled={!goalName.trim()} onClick={() => setStep('target')}>
          Continue
        </PrimaryButton>
      }
    >
      <TextField
        label="Enter your goal name"
        value={goalName}
        onChange={setGoalName}
        helperText="You can change this name later"
      />
      <div className="mt-[22px] flex flex-wrap gap-[8px]" role="group" aria-label="Suggested goal names">
        {getRoboGoalNameSuggestions(goalType).map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            aria-pressed={goalName === suggestion}
            onClick={() => setGoalName(suggestion)}
            className={cn(
              'min-h-[36px] w-fit whitespace-nowrap rounded-[4px] px-[12px] py-[8px] text-left text-[13px] font-bold leading-[17px] transition-colors',
              goalName === suggestion
                ? 'border border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
                : 'bg-[var(--uc-neutral-100)] text-[var(--uc-text)]',
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </RoboScreen>
  )
}
