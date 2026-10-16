import { AppIcon } from '@/app/components/icons'
import { detailToolbarWeb } from './contracts/detailToolbarWeb'
import type { DetailToolbarVariant } from './contracts/detailToolbar'

/** Account/Card compatibility toolbar; the owner supplies collapse progress and navigation. */
export default function BaselineDetailToolbar({ variant, title, progress, onBack, onHelpClick }: { variant: DetailToolbarVariant; title: string; progress: number; onBack: () => void; onHelpClick?: () => void }) {
  const contract = detailToolbarWeb({ variant, progress, hasHelpCallback: Boolean(onHelpClick) })
  return <div className={contract.rootClass}><div className={contract.rowClass}>
    <button onClick={onBack} className={contract.actionClass} aria-label={contract.backLabel}><AppIcon name={contract.backIcon} color="var(--uc-text)" /></button>
    <h1 className={contract.titleClass} style={contract.titleStyle}>{title}</h1>
    {contract.showHelp ? <button onClick={onHelpClick} className={contract.actionClass} aria-label={contract.helpLabel}><AppIcon name={contract.helpIcon} color="var(--uc-text)" /></button> : <div className={contract.emptyActionClass} />}
  </div></div>
}
