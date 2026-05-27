/**
 * InactiveState - Placeholder screen when scenario is inactive
 */

import imgRectangle1 from "figma:asset/6f4a518088433560480f90c7a7448fdc1d294def.png";
import { AppIcon } from "@/app/components/icons";

export default function InactiveState() {
  return (
    <div className="w-full h-full relative bg-[var(--uc-app-bg)] flex flex-col items-center justify-center p-[24px]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <img 
          src={imgRectangle1} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-[300px]">
        {/* Icon */}
        <div className="w-[80px] h-[80px] bg-[var(--uc-border)] rounded-full flex items-center justify-center mx-auto mb-[24px]">
          <AppIcon name="lock" size={40} className="text-[var(--uc-text-muted)]" />
        </div>

        {/* Title */}
        <h2 className="font-['UniCredit',sans-serif] text-[24px] font-bold text-[var(--uc-text)] mb-[12px]">
          Application Inactive
        </h2>

        {/* Description */}
        <p className="font-['UniCredit',sans-serif] text-[16px] text-[var(--uc-text-muted)] mb-[24px]">
          This application is currently in inactive mode. Switch to "Aplicație activă" in the demo controls to enable full functionality.
        </p>

        {/* Info Box */}
        <div className="bg-[var(--uc-surface)] border border-[var(--uc-border-muted)] rounded-[8px] p-[16px] text-left">
          <p className="font-['UniCredit',sans-serif] text-[14px] text-[var(--uc-text-muted)]">
            <strong className="text-[var(--uc-text)]">Demo Mode:</strong> Use the controls at the top of the page to switch between active and inactive scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}
