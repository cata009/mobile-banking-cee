/**
 * UnplannedBanner - Warning banner for unplanned maintenance or notifications
 */

import { AppIcon } from "@/app/components/icons";

export default function UnplannedBanner() {
  return (
    <div className="px-[24px] pt-[24px]">
      <div className="bg-[color-mix(in_srgb,var(--uc-yellow-gold)_12%,var(--uc-surface))] border-l-4 border-[var(--uc-yellow-gold)] rounded-[8px] p-[16px] shadow-sm">
        <div className="flex items-start gap-[12px]">
          <AppIcon name="alert-triangle" size={24} className="mt-[2px] flex-shrink-0 text-[var(--uc-yellow-brown)]" />
          <div className="flex-1">
            <h4 className="font-['UniCredit',sans-serif] text-[16px] font-bold text-[var(--uc-text)] mb-[4px]">
              Unplanned Maintenance
            </h4>
            <p className="font-['UniCredit',sans-serif] text-[14px] text-[var(--uc-text-muted)]">
              Some services may be temporarily unavailable due to urgent maintenance. We apologize for any inconvenience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
