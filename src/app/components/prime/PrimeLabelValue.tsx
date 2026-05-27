/**
 * PrimeLabelValue Component
 * Reusable dark-themed component for displaying Label + Value pairs in Prime screens
 */

interface PrimeLabelValueProps {
  label: string;
  value: string;
}

export function PrimeLabelValue({ label, value }: PrimeLabelValueProps) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-h-px min-w-px not-italic py-[8px] relative text-[16px] text-white whitespace-pre-wrap">
      <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full">{label}</p>
      <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full">{value}</p>
    </div>
  );
}
