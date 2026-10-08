import PrimaryButton from '@/app/components/PrimaryButton'
import { AppIcon } from '@/app/components/icons'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'

export function PersonalDataConfirmationScreen({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  return (
    <RoboScreen
      title={"First of all,\nlet's check your data"}
      titleClassName="whitespace-pre-line"
      description="Please confirm or update your data before continuing with your investment account request."
      onBack={onBack}
      onClose={onBack}
      headerAction="none"
      dataScreen="personal-data-confirmation"
      footer={
        <div className="space-y-[12px]">
          <button
            type="button"
            className="min-h-[44px] w-full rounded-[4px] text-[16px] font-bold uppercase leading-[22px] text-[var(--uc-action)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]"
          >
            Edit data
          </button>
          <PrimaryButton labelSize="18" onClick={onConfirm}>
            I confirm these data
          </PrimaryButton>
        </div>
      }
    >
      <dl className="space-y-[40px]">
        {[
          ['Phone number', '+420 777 123 456'],
          ['Email address', 'email.address@gmail.com'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-[16px]">
            <div className="min-w-0">
              <dt className="text-[14px] uppercase leading-[20px] text-[var(--uc-text-muted)]">{label}</dt>
              <dd className="mt-[4px] break-words text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">
                {value}
              </dd>
            </div>
            <span aria-hidden="true" className="shrink-0">
              <AppIcon name="info-circle" size={24} color="var(--uc-text)" />
            </span>
          </div>
        ))}
      </dl>
    </RoboScreen>
  )
}
