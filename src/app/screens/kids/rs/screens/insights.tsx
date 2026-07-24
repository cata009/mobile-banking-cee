/**
 * RS Teens Insights — spending by category, derived from transactions.
 */
import { AppIcon } from "@/app/components/icons";
import { ListCard, ProgressBar, SectionLabel } from "../ui";
import { formatRsd } from "../money";
import type { RsSpendCategory, RsTransaction } from "../types";

const CATEGORY_ACCENT: Record<RsSpendCategory, string> = {
  Prihod: "var(--uc-green-main)",
  Hrana: "var(--uc-product-pink)",
  Zabava: "var(--uc-product-mauve)",
  Pretplate: "var(--uc-product-slate)",
  Kupovina: "var(--uc-product-blue)",
  Prevoz: "var(--uc-product-blue-deep)",
  Prijatelji: "var(--uc-product-brown)",
};

export function RsInsightsScreen({
  transactions,
  showAmounts,
  onBack,
}: {
  transactions: RsTransaction[];
  showAmounts: boolean;
  onBack: () => void;
}) {
  const spend = transactions.filter((t) => t.amount < 0);
  const byCategory = new Map<RsSpendCategory, number>();
  let total = 0;
  for (const t of spend) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Math.abs(t.amount));
    total += Math.abs(t.amount);
  }
  const rows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
          <AppIcon name="chevron-left" size={22} />
        </button>
        <h1 className="text-[18px] font-bold">Uvid u troškove</h1>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[40px]">
        <ListCard className="!p-5">
          <span className="text-[12px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>Ukupno potrošeno</span>
          <span className="mt-1 block text-[28px] font-bold" style={{ color: "var(--uc-text)" }}>
            {showAmounts ? formatRsd(total) : "••••"}
          </span>
        </ListCard>

        <SectionLabel>Po kategoriji</SectionLabel>
        <div className="flex flex-col gap-2">
          {rows.map(([cat, amount]) => {
            const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
            const accent = CATEGORY_ACCENT[cat];
            return (
              <ListCard key={cat} className="!p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>
                      <AppIcon name="receipt-text" size={14} />
                    </span>
                    <span className="text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{cat}</span>
                  </div>
                  <span className="text-[14px] font-bold" style={{ color: "var(--uc-text)" }}>
                    {showAmounts ? formatRsd(amount) : "••••"}
                  </span>
                </div>
                <ProgressBar progress={pct} accent={accent} />
              </ListCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
