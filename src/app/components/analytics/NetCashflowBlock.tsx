import { TrendBadge } from "@/app/screens/home/App2027ProductAccordions";
import { useLanguage } from "@/app/contexts/LanguageContext";

export interface NetCashflowBlockProps {
  /** Signed difference between what came in and what went out. */
  netTotal: number;
  /** Needed to tell "nothing came in" from "you spent more than you earned". */
  incomeTotal: number;
  /** The absolute figure with its currency, formatted by the calling screen. */
  formattedAbsoluteNet: string;
  /** The signed figure with its currency, shown as the block's headline. */
  formattedSignedNet: string;
  /** Stamped on the wrapper so each screen keeps its own test hooks. */
  dataAttribute?: string;
  labelDataAttribute?: string;
  className?: string;
}

/**
 * What the month actually left behind, under the two flows that produced it.
 *
 * The Spending card and an account's monthly report answer the same question and
 * were answering it differently — one with a rule, a trend mark and a sentence,
 * the other with a bare signed total above the title. This is that block, once.
 *
 * The trend mark belongs to the label, so it sits on the label's centre line; the
 * amount and the sentence under it start at the same left edge as the mark rather
 * than indenting past it. One column, one edge.
 */
export default function NetCashflowBlock({
  netTotal,
  incomeTotal,
  formattedAbsoluteNet,
  formattedSignedNet,
  dataAttribute,
  labelDataAttribute,
  className = "",
}: NetCashflowBlockProps) {
  const { t } = useLanguage();

  const kept = incomeTotal > 0 && netTotal > 0;
  const overspent = incomeTotal > 0 && netTotal < 0;
  const caption = kept
    ? `${formattedAbsoluteNet} ${t("runtime.evo.spending.netPositive")}`
    : overspent
      ? `${formattedAbsoluteNet} ${t("runtime.evo.spending.netNegative")}`
      : t("runtime.evo.spending.noIncome");

  return (
    <div className={`border-t border-[color-mix(in_srgb,var(--uc-text)_16%,transparent)] pt-[10px] ${className}`.trim()}>
      <div className="min-w-0" {...(dataAttribute ? { [dataAttribute]: true } : {})}>
        <div className="flex items-center gap-[8px]">
          <TrendBadge direction={netTotal >= 0 ? "up" : "down"} size={16} compact />
          <p
            {...(labelDataAttribute ? { [labelDataAttribute]: true } : {})}
            className="text-[16px] font-bold leading-[20px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]"
          >
            {t("runtime.evo.spending.netCashflow", "Net cashflow")}
          </p>
        </div>
        <p className="mt-[2px] truncate text-[20px] font-bold leading-[24px]">{formattedSignedNet}</p>
        <p className="mt-[4px] text-[14px] leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
          {caption}
        </p>
      </div>
    </div>
  );
}
