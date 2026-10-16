import { useLanguage } from '@/app/contexts/LanguageContext';
import { BASELINE_DIALOG_CONTRACTS } from './contracts/dialog';

interface TerminateSessionPopupProps {
  onCancel: () => void;
  onTerminate: () => void;
}

export default function TerminateSessionPopup({
  onCancel,
  onTerminate,
}: TerminateSessionPopupProps) {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={BASELINE_DIALOG_CONTRACTS.terminate.backdropClass}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Popup */}
      <div className={BASELINE_DIALOG_CONTRACTS.terminate.boxClass}>
        {/* Content */}
        <div className="px-6 py-8 flex flex-col items-center gap-4">
          <h2 className="text-[18px] font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)] text-center">
            {t('coApping.endSessionConfirm')}
          </h2>
          <p className="text-[14px] font-['UniCredit:Regular',sans-serif] text-[var(--uc-text-muted)] text-center">
            {t('coApping.coAppingPrivacy')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex border-t border-[var(--uc-border-muted)]">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-[18px] font-['UniCredit:Bold',sans-serif] text-[var(--uc-action)] border-r border-[var(--uc-border-muted)] hover:bg-[var(--uc-app-bg)] transition-colors"
          >
            {t('coApping.no')}
          </button>
          <button
            onClick={onTerminate}
            className="flex-1 py-4 text-[18px] font-['UniCredit:Bold',sans-serif] text-[var(--uc-action)] hover:bg-[var(--uc-app-bg)] transition-colors"
          >
            {t('coApping.yes')}
          </button>
        </div>
      </div>
    </div>
  );
}
