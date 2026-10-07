import PrimaryButton from '@/app/components/PrimaryButton'
import TextField from '@/app/components/TextField'
import InfoBanner from '@/app/components/cards/InfoBanner'
import { AppIcon, type IconName } from '@/app/components/icons'
import { cn } from '@/app/components/ui/utils'
import introImage from '@/assets/investments/robo-advisor-intro.png'
import roboQuitInfoLarge from '@/assets/investments/robo-quit-info-large.svg'
import { ROBO_GOAL_TYPES } from '@/features/investments/robo/catalog'
import { isInvestorProfileBlocking } from '@/features/investments/robo/model'
import { type RoboInvestorProfileStatus } from '@/features/investments/robo/types'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import { ROBO_INVESTOR_PROFILE_LABELS } from '@/features/investments/robo/presentationData'

export const GOAL_ICONS: Record<(typeof ROBO_GOAL_TYPES)[number]['id'], IconName> = {
  'build-wealth': 'robo-goal-wealth',
  'unforeseen-circumstances': 'robo-goal-unforeseen',
  'major-purchase': 'robo-goal-purchase',
  retirement: 'robo-goal-retirement',
}

export function GoalSelectionCard({
  id,
  title,
  description,
  selected,
  onSelect,
}: {
  id: (typeof ROBO_GOAL_TYPES)[number]['id']
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${title}. ${description}`}
      onClick={onSelect}
      className="flex w-full items-center gap-[12px] rounded-[5px] border border-[var(--uc-text)] px-[16px] py-[12px] text-left"
    >
      <span className="grid size-[24px] shrink-0 place-items-center text-[var(--uc-text)]">
        <AppIcon name={GOAL_ICONS[id]} size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">{title}</span>
        <span className="mt-[4px] block text-[14px] leading-[18px] text-[var(--uc-text)]">{description}</span>
      </span>
      <span className="grid size-[24px] shrink-0 place-items-center">
        <AppIcon name={selected ? 'radio-selected' : 'radio-unselected'} size={24} color="var(--uc-text)" />
      </span>
    </button>
  )
}

export function IntroScreen({ onCreate, onExit }: { onCreate: () => void; onExit: () => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)]" data-robo-screen="intro">
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="pointer-events-none sticky top-[calc(var(--uc-phone-top-reserve,54px)+4px)] z-20 -mb-[40px] flex h-[40px] justify-end px-[8px]">
          <button
            type="button"
            aria-label="Close"
            onClick={onExit}
            className="pointer-events-auto grid size-[40px] place-items-center"
          >
            <AppIcon name="close-flow" color="var(--uc-text)" size={20} />
          </button>
        </div>
        <div className="relative h-[400px] shrink-0 overflow-hidden bg-[var(--uc-app-bg)]">
          <img src={introImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="px-[24px] pb-[24px] pt-[20px]">
          <h1 className="uc-type-h1 text-[var(--uc-text)]">Invest towards what matters</h1>
          <p className="mt-[16px] text-[16px] leading-[21px] text-[var(--uc-text)]">
            Create a goal and invest with a portfolio selected for your needs.
          </p>
          <div className="mt-[22px] rounded-[8px] bg-[var(--uc-surface-muted)]">
            {[
              [
                'A recommendation built around you',
                'We use your goal, time horizon and investor profile to check suitable portfolios.',
              ],
              [
                'A clear plan you can track',
                'Explore possible outcomes, compare portfolios and follow your goal over time.',
              ],
              [
                'You decide before anything is invested',
                'Review the recommendation, risks and documents before you sign.',
              ],
            ].map(([title, body], index) => (
              <div
                key={title}
                className={cn(
                  'flex gap-[12px] px-[16px] py-[14px]',
                  index > 0 ? 'border-t border-[var(--uc-border)]' : null,
                )}
              >
                <span className="mt-[2px] grid size-[24px] shrink-0 place-items-center text-[var(--uc-text)]">
                  <AppIcon name={index === 2 ? 'investment-important-info' : 'invest-action'} size={22} />
                </span>
                <div>
                  <p className="uc-type-n5-strong uppercase text-[var(--uc-text)]">{title}</p>
                  <p className="uc-type-n5 mt-[3px] leading-[16px] text-[var(--uc-text)]">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[22px]">
            <p className="uc-type-n4-strong text-[var(--uc-text)]">
              Your capital is at risk. Returns are not guaranteed.
            </p>
            <p className="uc-type-n4 mt-[8px] leading-[21px] text-[var(--uc-text)]">
              Investments may rise or fall in value, and you could get back less than you invest. We only show a
              portfolio after checking what is suitable for you.
            </p>
          </div>
          <p className="uc-type-n5 mt-[18px] border-t border-[var(--uc-border)] pt-[10px] text-[var(--uc-text-muted)]">
            An investment account is required. Account terms and required documents are shown before signing.
          </p>
        </div>
      </main>
      <footer className="shrink-0 px-[24px] pb-[34px] pt-[12px]">
        <PrimaryButton labelSize="18" onClick={onCreate}>
          Create Goal
        </PrimaryButton>
      </footer>
    </div>
  )
}

export function QuitConfirmationScreen({ onResume, onQuit }: { onResume: () => void; onQuit: () => void }) {
  return (
    <RoboScreen
      title="Are you sure you want to quit?"
      onBack={onResume}
      onClose={onResume}
      dataScreen="quit-confirmation"
      contentTopClassName="pt-[24px]"
      footer={
        <div className="flex w-full flex-col gap-[8px]">
          <PrimaryButton labelSize="18" onClick={onResume}>
            Continue
          </PrimaryButton>
          <button
            type="button"
            onClick={onQuit}
            className="flex h-[48px] w-full items-center justify-center rounded-[4px] text-[18px] font-bold leading-[24px] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
          >
            Close the flow
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-[24px]">
        <div className="flex h-[160px] w-full items-center justify-center">
          <img src={roboQuitInfoLarge} width={100} height={100} alt="" aria-hidden="true" />
        </div>
        <p className="text-[18px] leading-[24px] tracking-[0.3px] text-[var(--uc-text)]">
          If you leave now, your progress will be lost and you’ll need to start again.
        </p>
      </div>
    </RoboScreen>
  )
}

export function ContactScreen({
  onBack,
  onContinue,
  onExit,
}: {
  onBack: () => void
  onContinue: () => void
  onExit: () => void
}) {
  return (
    <RoboScreen
      title="Check your contact details"
      description="Check where we should send important investment documents and updates."
      onBack={onBack}
      onClose={onExit}
      dataScreen="contact"
      footer={
        <PrimaryButton labelSize="18" onClick={onContinue}>
          Details are correct
        </PrimaryButton>
      }
    >
      <div className="space-y-[28px]">
        <TextField label="Email" value="teodora.novak@example.com" onChange={() => undefined} readOnly />
        <TextField label="Mobile number" value="+420 602 123 456" onChange={() => undefined} readOnly />
        <button type="button" className="uc-type-n4-strong text-[var(--uc-action)]">
          Update contact details
        </button>
      </div>
      <p className="uc-type-n5 mt-[28px] rounded-[6px] bg-[var(--uc-surface-muted)] p-[12px] leading-[17px] text-[var(--uc-text-muted)]">
        Keeping these details up to date helps us deliver important investment documents without delay.
      </p>
    </RoboScreen>
  )
}

export function InvestorProfileScreen({
  status,
  onBack,
  onContinue,
  onExit,
}: {
  status: RoboInvestorProfileStatus
  onBack: () => void
  onContinue: () => void
  onExit: () => void
}) {
  const blocking = isInvestorProfileBlocking(status)
  return (
    <RoboScreen
      title="Your risk profile"
      description={
        blocking
          ? 'Your investor profile needs an update before we can check which portfolios are suitable for you.'
          : `Your answers indicate a ${ROBO_INVESTOR_PROFILE_LABELS.moderate} investor profile. We’ll use it together with your goal and time horizon when checking suitable portfolios.`
      }
      onBack={onBack}
      onClose={onExit}
      dataScreen="profile"
      footer={
        !blocking ? (
          <PrimaryButton labelSize="18" onClick={onContinue}>
            Continue
          </PrimaryButton>
        ) : undefined
      }
    >
      <div className="rounded-[4px] bg-[var(--uc-surface-muted)] py-[16px] pl-[24px] pr-[12px]">
        <p className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">
          {blocking ? 'Profile update needed' : ROBO_INVESTOR_PROFILE_LABELS.moderate}
        </p>
        <p className="mt-[12px] text-[16px] leading-[21px] text-[var(--uc-text)]">
          {blocking
            ? 'Please review your MiFID answers so we can check which portfolios remain suitable for you.'
            : 'As a moderate risk investor you are willing to accept periods of market volatility in exchange for the possibility of receiving returns that will outpace inflation by a significant margin in the long run.'}
        </p>
      </div>
      {blocking ? (
        <div className="mt-[24px]">
          <button type="button" className="uc-type-p1 text-left font-bold text-[var(--uc-action)]">
            Update investor profile
          </button>
        </div>
      ) : (
        <InfoBanner
          title="Update your investor profile"
          description="Review the MiFID questions so your recommendation reflects your current situation."
          actionLabel="UPDATE NOW"
          actionIconName="chevron-link"
          actionIconSize={24}
          className="mt-[24px] w-full rounded-[4px]"
        />
      )}
    </RoboScreen>
  )
}
