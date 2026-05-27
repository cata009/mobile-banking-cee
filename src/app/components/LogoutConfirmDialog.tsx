/**
 * LogoutConfirmDialog Component
 * iOS-style system alert for logout confirmation
 */

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function LogoutConfirmDialog({ isOpen, onClose, onConfirm }: LogoutConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    onConfirm?.();
  };

  return (
    <>
      {/* Overlay - semi-transparent background - ABSOLUTE to stay within MobileFrame */}
      <div 
        className="absolute inset-0 bg-black/40 z-[9998]"
        onClick={onClose}
      />

      {/* Dialog Container - centered - ABSOLUTE to stay within MobileFrame */}
      <div className="absolute inset-0 flex items-center justify-center z-[9999] px-[16px]">
        {/* Dialog Box */}
        <div 
          className="bg-[#f2f2f7] rounded-[14px] w-full max-w-[270px] overflow-hidden"
          style={{
            boxShadow: '0px 0px 1px rgba(0, 0, 0, 0.04), 0px 2px 6px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Message Content */}
          <div className="px-[16px] pt-[20px] pb-[16px] text-center">
            {/* Title */}
            <p className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] font-semibold text-[#000000] leading-[22px] mb-[2px]">
              Are you sure you want to leave Mobile Banking?
            </p>
          </div>

          {/* Divider */}
          <div className="h-[0.5px] bg-[#c6c6c8]" />

          {/* Buttons Container */}
          <div className="flex">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="flex-1 h-[44px] flex items-center justify-center cursor-pointer active:bg-[#d1d1d6] transition-colors"
            >
              <span className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] text-[#007AFF] leading-[22px]">
                Cancel
              </span>
            </button>

            {/* Vertical Divider */}
            <div className="w-[0.5px] bg-[#c6c6c8]" />

            {/* OK Button */}
            <button
              onClick={handleConfirm}
              className="flex-1 h-[44px] flex items-center justify-center cursor-pointer active:bg-[#d1d1d6] transition-colors"
            >
              <span className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] font-semibold text-[#007AFF] leading-[22px]">
                OK
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}