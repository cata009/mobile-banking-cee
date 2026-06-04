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
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px py-[8px] relative text-[var(--uc-static-white)] whitespace-pre-wrap">
      <p className="uc-type-n4-strong relative shrink-0 w-full">{label}</p>
      <p className="uc-type-n4 relative shrink-0 w-full">{value}</p>
    </div>
  );
}
