import FaceIdAnimation from '@/app/components/FaceIdAnimation'
import { useId } from 'react'
import mobileBankingIcon from '@/assets/ba/card-fraud/m-ba-approved-icon.png'
import lockWallpaper from '@/assets/ba/card-fraud/lake-dusk-lockscreen.png'
import { AppIcon } from '@/app/components/icons'
import { FRAUD_TRANSACTIONS, type FraudScreen } from '@/features/cards/fraud/model'

/** System-style simulation outside the banking app; the existing authentication animation is reused. */
export function FraudNotification({
  authenticating,
  go,
}: {
  authenticating: boolean
  go: (screen: FraudScreen) => void
}) {
  const countId = useId()
  return (
    <div className="fraud-lock-screen" style={{ backgroundImage: `url(${lockWallpaper})` }}>
      <div className="fraud-lock-time">
        <AppIcon name="lock" size={24} color="currentColor" />
        <p>Thursday, 22 October</p>
        <strong>10:52</strong>
      </div>
      <div className="fraud-os-notification-stack">
        <button
          type="button"
          className="fraud-os-notification"
          aria-label="Open m-ba fraud alert"
          aria-describedby={countId}
          disabled={authenticating}
          onClick={() => go('fraud-authenticate')}
        >
          <span className="fraud-os-app-icon-wrap">
            <img className="fraud-os-app-icon" src={mobileBankingIcon} alt="" />
            <span id={countId} className="fraud-os-notification-count">
              {FRAUD_TRANSACTIONS.length}
              <span className="sr-only"> notifications</span>
            </span>
          </span>
          <span className="fraud-os-notification-copy">
            <span className="fraud-os-notification-bank">
              <strong>m-ba</strong>
              <span>now</span>
            </span>
            <strong>Was this you?</strong>
            <span>We noticed unusual activity on your card. Review these payments securely.</span>
          </span>
        </button>
      </div>
      <span className="fraud-lock-home-indicator" aria-hidden="true" />
      {authenticating ? (
        <div role="status" aria-label="Face ID login simulation">
          <FaceIdAnimation onComplete={() => go('fraud-alerts')} />
        </div>
      ) : null}
    </div>
  )
}
