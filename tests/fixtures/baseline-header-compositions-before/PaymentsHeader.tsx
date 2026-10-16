import { AppIcon } from "@/app/components/icons";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import BeneficiaryEditIcon from "@/app/components/payments/BeneficiaryEditIcon";
import { useCountry } from "@/app/state/demoStore";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function PaymentsHeader({
  title,
  onContactsClick,
  onMessagesClick,
  onCustomiseClick,
  onExchangeRatesClick,
}: {
  title: string
  onContactsClick?: () => void
  onMessagesClick?: () => void
  /** Evo 2027 only: opens the editor for the payments grid. */
  onCustomiseClick?: () => void
  /** Evo 2027 moves exchange rates from the action grid into this header. */
  onExchangeRatesClick?: () => void
}) {
  const country = useCountry()
  const { t } = useLanguage()
  const usesBosniaHeaderActions = country === 'BA' || country === 'BA_BL'
  const handleAction = (_action: string) => {}

  return (
    <div className="w-full bg-[var(--uc-app-bg)]">
      {/* Matches the 20px gutter the payment cards below use. */}
      <div className="px-[20px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1 className="uc-type-h1 flex-1 min-w-0 text-[var(--uc-text)]">{title}</h1>

          <HeaderActionRail>
            {onExchangeRatesClick ? (
              <>
                <button
                  type="button"
                  aria-label={t('runtime.payments.hub.actions.exchange-rates', 'Exchange rates')}
                  onClick={onExchangeRatesClick}
                  className="flex size-[32px] items-center justify-center text-[var(--uc-icon)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                >
                  <AppIcon name="payment-exchange-rates" size={22} color="currentColor" />
                </button>
                {onCustomiseClick ? (
                  <button
                    type="button"
                    aria-label={t('runtime.payments.hub.customise', 'Customise payments')}
                    onClick={onCustomiseClick}
                    className="flex size-[32px] items-center justify-center text-[var(--uc-icon)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                  >
                    <BeneficiaryEditIcon size={26} />
                  </button>
                ) : null}
              </>
            ) : (
              <>
                {usesBosniaHeaderActions ? (
                  <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={onContactsClick} />
                ) : (
                  <HeaderActionButton
                    icon="profile"
                    label={t('runtime.actions.profile', 'Profile')}
                    onClick={() => handleAction('profile')}
                  />
                )}
                <HeaderActionButton
                  icon="messages"
                  label={t('runtime.actions.messages', 'Messages')}
                  onClick={onMessagesClick}
                />
                {onCustomiseClick ? (
                  <HeaderActionButton
                    icon="edit"
                    label={t('runtime.payments.hub.customise', 'Customise payments')}
                    onClick={onCustomiseClick}
                  />
                ) : usesBosniaHeaderActions ? null : (
                  <HeaderActionButton
                    icon="help"
                    label={t('runtime.actions.help', 'Help')}
                    onClick={() => handleAction('help')}
                  />
                )}
              </>
            )}
          </HeaderActionRail>
        </div>
      </div>
    </div>
  )
}
