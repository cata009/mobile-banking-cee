import type { ReactNode } from "react";

interface InvestmentDetailFieldProps {
  label: string;
  value: ReactNode;
  secondaryValue?: string;
  multiline?: boolean;
  strong?: boolean;
  variant?: "default" | "product-detail";
}

export default function InvestmentDetailField({
  label,
  value,
  secondaryValue,
  multiline = false,
  strong = true,
  variant = "default",
}: InvestmentDetailFieldProps) {
  const labelStyle = variant === "product-detail" ? "text-[16px] leading-[16px]" : "text-[14px] leading-[16px]";
  const valueStyle = variant === "product-detail" ? "text-[18px] leading-[20px]" : "text-[16px] leading-[20px]";

  return (
    <div
      className={`flex w-full flex-col gap-[4px] px-[24px] py-[16px] ${multiline ? "min-h-[132px]" : "min-h-[80px] justify-center"}`}
      data-investment-detail-field={label}
    >
      <p className={`${labelStyle} font-normal text-[var(--uc-text-muted)]`}>{label}</p>
      <p className={`${valueStyle} text-[var(--uc-text)] ${strong ? "font-bold" : "font-normal"}`}>{value}</p>
      {secondaryValue ? <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{secondaryValue}</p> : null}
    </div>
  );
}
