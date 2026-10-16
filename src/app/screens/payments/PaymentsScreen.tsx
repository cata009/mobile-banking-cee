import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import BaselineL1Header from '@/app/components/BaselineL1Header'
import { AppIcon } from '@/app/components/icons'
import { HeaderActionButton, HeaderActionRail } from '@/app/components/HeaderActionIcons'
import BeneficiaryEditIcon from '@/app/components/payments/BeneficiaryEditIcon'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useDemo, useCountry } from '@/app/state/demoStore'
import type { NativeDemoEvents, NativeDemoRoute } from '@/features/demo-native/contracts'
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents'
import type { PaymentTemplateSelection } from '@/data/paymentTemplates'
import { getEvo2027TemplateBeneficiaryName, getPaymentTemplates, getSavedBeneficiaries } from '@/data/paymentTemplates'
import { getFrequentBeneficiaries, type FrequentBeneficiary } from '@/data/paymentsHub'
import type { AccountTransaction } from '@/data/accountDetails'

export interface PaymentsScreenProps {
  onHomeClick?: () => void
  onAnalyticsClick?: () => void
  onContactsClick?: () => void
  onMessagesClick?: () => void
  onProductsClick?: () => void
  onInvestmentsClick?: () => void
  onMoreClick?: () => void
  onDomesticPaymentClick?: () => void
  onBeneficiarySendMoney?: (person: FrequentBeneficiary) => void
  selectedBeneficiary?: FrequentBeneficiary | null
  onBeneficiarySelect?: (person: FrequentBeneficiary | null) => void
  onBeneficiaryTransactionClick?: (transaction: AccountTransaction) => void
  onTemplateSelect?: (selection: PaymentTemplateSelection) => void
  paymentFlow?: NativePaymentFlow | null
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onPaymentEntryRequest?: NativeDemoEvents['onPaymentEntryRequest']
}
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
    <BaselineL1Header
      variant="payments"
      title={title}
      actions={
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
      }
    />
  )
}
function handlePaymentEntryRequest(
  route: NativeDemoRoute,
  props: PaymentsScreenProps,
  country: ReturnType<typeof useCountry>,
  release: string,
) {
  if (props.onPaymentEntryRequest) {
    props.onPaymentEntryRequest(route)
    return true
  }
  if (route.screen !== 'payment-create') return false
  const params = route.params ?? {}
  if (params.beneficiaryId) {
    const beneficiary = getFrequentBeneficiaries(country).find((person) => person.id === params.beneficiaryId)
    if (!beneficiary || !props.onBeneficiarySendMoney) return false
    props.onBeneficiarySendMoney(beneficiary)
    return true
  }
  const selectionId = params.templateId ?? params.selectionId
  if (selectionId) {
    const template = [...getPaymentTemplates(country), ...getSavedBeneficiaries(country, true)].find(
      (selection) => selection.id === selectionId,
    )
    if (!template || !props.onTemplateSelect) return false
    props.onTemplateSelect(
        release === 'release-future-evo-2027'
          ? { ...template, beneficiaryName: getEvo2027TemplateBeneficiaryName(template, country) }
          : template,
      )
    return true
  }
  if (params.transactionId || params.entry === 'redo' || !props.onDomesticPaymentClick) return false
  props.onDomesticPaymentClick()
  return true
}

export default function PaymentsScreen(props: PaymentsScreenProps) {
  const { country, release } = useDemo()
  const onNavigate = (route: NativeDemoRoute, action: 'push' | 'back') => {
    if (action !== 'push') return false
    if (route.screen === 'payment-create') return handlePaymentEntryRequest(route, props, country, release)
    const callbacks: Record<string, (() => void) | undefined> = {
      home: props.onHomeClick,
      analytics: props.onAnalyticsClick,
      contacts: props.onContactsClick,
      messages: props.onMessagesClick,
      products: props.onProductsClick,
      investments: props.onInvestmentsClick,
      more: props.onMoreClick,
      profile: props.onMoreClick,
    }
    const callback = callbacks[route.screen]
    if (!callback) return false
    callback()
    return true
  }

  return (
    <NativeScreenPreview
      route={{ screen: 'payments' }}
      snapshot={{ paymentFlow: props.paymentFlow ?? null }}
      events={{
        onPaymentFlowChange: props.onPaymentFlowChange,
      }}
      onBack={props.onHomeClick ?? (() => {})}
      onNavigate={onNavigate}
    />
  )
}
