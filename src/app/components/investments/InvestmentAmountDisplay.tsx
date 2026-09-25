import {
  formatInvestmentAmountParts,
  type InvestmentAmountParts,
} from "@/app/utils/investmentAmountFormatting";

export { formatInvestmentAmountParts };
export type { InvestmentAmountParts };

export type InvestmentAmountScale = "hero" | "portfolio" | "summary" | "card" | "field" | "list" | "transaction" | "compact";

const AMOUNT_SCALE_CLASSES: Record<InvestmentAmountScale, { integer: string; minor: string }> = {
  hero: {
    integer: "text-[30px] font-bold leading-none tracking-[0.2px]",
    minor: "text-[20px] font-normal leading-none",
  },
  portfolio: {
    integer: "text-[26px] font-bold leading-[30px] tracking-[0.2px]",
    minor: "text-[16px] font-normal leading-[20px]",
  },
  summary: {
    integer: "text-[20px] font-bold leading-[24px]",
    minor: "text-[14px] font-normal leading-normal",
  },
  card: {
    integer: "text-[20px] font-bold leading-[22px]",
    minor: "text-[14px] font-normal leading-normal",
  },
  field: {
    integer: "text-[18px] font-bold leading-[20px]",
    minor: "text-[14px] font-normal leading-[18px]",
  },
  list: {
    integer: "text-[20px] font-bold leading-[24px]",
    minor: "text-[14px] font-normal leading-[17px]",
  },
  transaction: {
    integer: "text-[14px] font-bold leading-normal",
    minor: "text-[14px] font-bold leading-normal",
  },
  compact: {
    integer: "text-[14px] font-normal leading-[18px]",
    minor: "text-[14px] font-normal leading-[18px]",
  },
};

export default function InvestmentAmountDisplay({
  parts,
  scale = "summary",
  className = "",
}: {
  parts: InvestmentAmountParts;
  scale?: InvestmentAmountScale;
  className?: string;
}) {
  const classes = AMOUNT_SCALE_CLASSES[scale];

  return (
    <span className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
      <span className={classes.integer}>{parts.integer}</span>
      <span className={classes.minor}>{parts.decimal}</span>
      {parts.currency ? <span className={`ml-[4px] ${classes.minor}`}>{parts.currency}</span> : null}
    </span>
  );
}
