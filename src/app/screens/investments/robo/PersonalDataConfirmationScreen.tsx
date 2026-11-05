import { useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import PrimaryButton from '@/app/components/PrimaryButton'
import { AppIcon } from '@/app/components/icons'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'

export function PersonalDataConfirmationScreen({
  onBack,
  onConfirm,
}: {
  onBack: () => void
  onConfirm: () => void
  onClose?: () => void
}) {
  const [infoSheet, setInfoSheet] = useState<'phone' | 'email' | null>(null)
  const infoContent =
    infoSheet === 'phone'
      ? {
          title: 'Phone number',
          body: 'A phone number is required to receive one time passwords via SMS to confirm and digitally sign.',
          closeLabel: 'Close phone number information',
        }
      : infoSheet === 'email'
        ? {
            title: 'Email Address',
            body: 'An email address is needed in order to send pre-contractual documentation and official periodical statements.',
            closeLabel: 'Close email address information',
          }
        : null

  return (
    <RoboScreen
      title={"First of all,\nlet's check your data"}
      titleClassName="whitespace-pre-line"
      description="Please confirm or update your data before continuing with your investment account request."
      onBack={onBack}
      onClose={onBack}
      headerAction="none"
      dataScreen="personal-data-confirmation"
      overlay={
        infoContent ? (
          <BottomSheet
            title={infoContent.title}
            onClose={() => setInfoSheet(null)}
            closeLabel={infoContent.closeLabel}
            className="px-[24px] pb-[24px] pt-[20px]"
            bodyClassName="!overflow-visible"
          >
            <p className="text-[18px] leading-[24px] text-[var(--uc-text)]">{infoContent.body}</p>
          </BottomSheet>
        ) : undefined
      }
      footer={
        <div className="space-y-[12px]">
          <PrimaryButton labelSize="18" onClick={onConfirm}>
            I confirm these data
          </PrimaryButton>
          <button
            type="button"
            className="min-h-[44px] w-full rounded-[4px] text-[16px] font-bold leading-[22px] text-[var(--uc-action)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]"
          >
            Edit data
          </button>
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
            <button
              type="button"
              aria-label={`${label} information`}
              onClick={() => setInfoSheet(label === 'Phone number' ? 'phone' : 'email')}
              className="grid size-[40px] shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2"
            >
              <AppIcon name="info-circle" size={24} color="var(--uc-text)" />
            </button>
          </div>
        ))}
      </dl>
    </RoboScreen>
  )
}
