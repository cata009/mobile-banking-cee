import type { ReactNode } from 'react'
import { mobileFirstAssets as a } from './assets'
import help from '@/assets/mobile-first/it/account/help.svg'
import close from '@/assets/mobile-first/it/account/close.svg'
import avatar from '@/assets/mobile-first/it/account/imgAvatar.png'
import notification from '@/assets/mobile-first/it/account/imgEllipse31.svg'
import './mobile-first-detail-header.css'

export interface MobileFirstDetailHeaderProps {
  className?: string
  layout?: 'overlay' | 'flow'
  title?: ReactNode
  onBack?: () => void
  onClose?: () => void
  closeLabel?: string
  onHelp?: () => void
  helpExpanded?: boolean
  onPrivacy?: () => void
  amountsHidden?: boolean
  onProfile?: () => void
  profileExpanded?: boolean
}

/** Italy's shared detail navigation; controls always occupy the same safe-area band. */
export default function MobileFirstDetailHeader({
  className = '',
  layout = 'overlay',
  title,
  onBack,
  onClose,
  closeLabel = 'Chiudi',
  onHelp,
  helpExpanded,
  onPrivacy,
  amountsHidden = false,
  onProfile,
  profileExpanded,
}: MobileFirstDetailHeaderProps) {
  return (
    <header
      className={`mf-detail-header ${className}`}
      data-mobile-first-detail-header="true"
      data-detail-header-layout={layout}
    >
      {onBack ? (
        <button type="button" className="mf-detail-header-control" aria-label="Indietro" onClick={onBack}>
          <img src={a.back} alt="" width={24} height={24} />
        </button>
      ) : (
        <span className="mf-detail-header-spacer" aria-hidden="true" />
      )}
      <span className="mf-detail-header-title">{title}</span>
      <div className="mf-detail-header-actions">
        {onPrivacy && (
          <button
            type="button"
            className="mf-detail-header-control"
            aria-label={amountsHidden ? 'Mostra importi' : 'Nascondi importi'}
            aria-pressed={amountsHidden}
            onClick={onPrivacy}
          >
            <img src={amountsHidden ? a.hide : a.show} alt="" width={24} height={24} />
          </button>
        )}
        {onHelp && (
          <button
            type="button"
            className="mf-detail-header-control"
            aria-label="Aiuto"
            aria-expanded={helpExpanded}
            onClick={onHelp}
          >
            <img src={help} alt="" width={24} height={24} />
          </button>
        )}
        {onClose && (
          <button type="button" className="mf-detail-header-control" aria-label={closeLabel} onClick={onClose}>
            <img src={close} alt="" width={24} height={24} />
          </button>
        )}
        {onProfile && (
          <button
            type="button"
            className="mf-detail-header-control mf-detail-header-avatar mf-avatar"
            aria-label="Profilo"
            aria-expanded={profileExpanded}
            onClick={onProfile}
          >
            <img src={avatar} alt="" width={32} height={32} />
            <img src={notification} alt="" className="mf-detail-header-notification" width={8} height={8} />
          </button>
        )}
      </div>
    </header>
  )
}
