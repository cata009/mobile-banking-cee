/**
 * LogoutConfirmDialog Component
 * iOS-style system alert for logout confirmation
 */

import { useLanguage } from "@/app/contexts/LanguageContext";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function LogoutConfirmDialog({ isOpen, onClose, onConfirm }: LogoutConfirmDialogProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    onConfirm?.();
  };

  return (
    <>
      {/* Overlay - semi-transparent background - ABSOLUTE to stay within MobileFrame */}
      <div 
        className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] z-[9998]"
        onClick={onClose}
      />

      {/* Dialog Container - centered - ABSOLUTE to stay within MobileFrame */}
      <div className="absolute inset-0 flex items-center justify-center z-[9999] px-[16px]">
        {/* Dialog Box */}
        <div 
          className="bg-[var(--uc-surface-muted)] rounded-[14px] w-full max-w-[270px] overflow-hidden"
          style={{
            boxShadow: '0px 0px 1px rgb(var(--uc-shadow-rgb) / 0.04), 0px 2px 6px rgb(var(--uc-shadow-rgb) / 0.04), 0px 16px 24px rgb(var(--uc-shadow-rgb) / 0.06)'
          }}
        >
          {/* Message Content */}
          <div className="px-[16px] pt-[20px] pb-[16px] text-center">
            {/* Title */}
            <p className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] font-semibold text-[var(--uc-primary-main)] leading-[22px] mb-[2px]">
              {t("runtime.dialogs.logoutMessage", "Are you sure you want to leave Mobile Banking?")}
            </p>
          </div>

          {/* Divider */}
          <div className="h-[0.5px] bg-[var(--uc-border)]" />

          {/* Buttons Container */}
          <div className="flex">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="flex-1 h-[44px] flex items-center justify-center cursor-pointer active:bg-[var(--uc-border-muted)] transition-colors"
            >
              <span className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] text-[var(--uc-action)] leading-[22px]">
                {t("runtime.dialogs.cancel", "Cancel")}
              </span>
            </button>

            {/* Vertical Divider */}
            <div className="w-[0.5px] bg-[var(--uc-border)]" />

            {/* OK Button */}
            <button
              onClick={handleConfirm}
              className="flex-1 h-[44px] flex items-center justify-center cursor-pointer active:bg-[var(--uc-border-muted)] transition-colors"
            >
              <span className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] font-semibold text-[var(--uc-action)] leading-[22px]">
                {t("runtime.actions.okGotIt", "OK")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
