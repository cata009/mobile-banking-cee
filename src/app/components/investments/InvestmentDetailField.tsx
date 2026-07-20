interface InvestmentDetailFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
  strong?: boolean;
}

export default function InvestmentDetailField({
  label,
  value,
  multiline = false,
  strong = true,
}: InvestmentDetailFieldProps) {
  return (
    <div
      className={`flex w-full flex-col gap-[4px] px-[24px] py-[16px] ${multiline ? "min-h-[132px]" : "min-h-[80px] justify-center"}`}
      data-investment-detail-field={label}
    >
      <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{label}</p>
      <p className={`text-[16px] leading-[20px] text-[var(--uc-text)] ${strong ? "font-bold" : "font-normal"}`}>{value}</p>
    </div>
  );
}
