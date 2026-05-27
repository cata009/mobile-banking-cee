/**
 * UnplannedBanner - Warning banner for unplanned maintenance or notifications
 */

import { AlertTriangle } from "lucide-react";

export default function UnplannedBanner() {
  return (
    <div className="px-[24px] pt-[24px]">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-[8px] p-[16px] shadow-sm">
        <div className="flex items-start gap-[12px]">
          <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0 mt-[2px]" />
          <div className="flex-1">
            <h4 className="font-['UniCredit',sans-serif] text-[16px] font-bold text-[#262626] mb-[4px]">
              Unplanned Maintenance
            </h4>
            <p className="font-['UniCredit',sans-serif] text-[14px] text-[#666666]">
              Some services may be temporarily unavailable due to urgent maintenance. We apologize for any inconvenience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
