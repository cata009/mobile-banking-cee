import { useLanguage } from '@/app/contexts/LanguageContext';

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-[12px] w-[327px] mx-auto overflow-hidden shadow-xl">
        {/* Content */}
        <div className="px-6 py-8 flex flex-col items-center gap-4">
          <h2 className="text-[18px] font-['UniCredit:Bold',sans-serif] text-[#262626] text-center">
            {t('coApping.endSessionConfirm')}
          </h2>
          <p className="text-[14px] font-['UniCredit:Regular',sans-serif] text-[#666666] text-center">
            {t('coApping.coAppingPrivacy')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex border-t border-[#E5E5E5]">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-[18px] font-['UniCredit:Bold',sans-serif] text-[#007AFF] border-r border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors"
          >
            {t('coApping.no')}
          </button>
          <button
            onClick={onTerminate}
            className="flex-1 py-4 text-[18px] font-['UniCredit:Bold',sans-serif] text-[#007AFF] hover:bg-[#F5F5F5] transition-colors"
          >
            {t('coApping.yes')}
          </button>
        </div>
      </div>
    </div>
  );
}