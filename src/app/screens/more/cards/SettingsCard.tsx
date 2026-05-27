/**
 * SettingsCard Component
 * Card for Settings section in More menu
 */

import imgSettings from "figma:asset/b756062d79e37b43d0eda8eee6125757ce5bb9bf.png";

interface SettingsCardProps {
  onClick: () => void;
}

export function SettingsCard({ onClick }: SettingsCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#f5f5f5] to-[#ccc]" />

      {/* Image - specific positioning from Figma */}
      <div className="absolute inset-[47.86%_-30.03%_-29.17%_42.2%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            src={imgSettings}
          />
        </div>
      </div>

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-black leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          Settings
        </p>
      </div>
    </button>
  );
}