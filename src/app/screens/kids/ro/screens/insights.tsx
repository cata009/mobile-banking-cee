/**
 * RO Teens spending insights: category breakdown with bars for the current period.
 */
import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import { formatRon, formatRonGuarded } from "../money";
import { RoCard } from "../ui";
import type { RoSpendCategory, RoTransaction } from "../types";

const CATEGORY_ACCENT: Partial<Record<RoSpendCategory, string>> = {
  Mâncare: "var(--uc-yellow-gold)",
  Distracție: "var(--uc-product-blue-deep)",
  Abonamente: "var(--uc-green-success)",
  Shopping: "var(--uc-red-main)",
  Transport: "var(--uc-product-blue)",
  Prieteni: "var(--uc-magenta-main)",
};

export function RoInsightsScreen({
  transactions,
  showAmounts,
  onBack,
}: {
  transactions: RoTransaction[];
  showAmounts: boolean;
  onBack: () => void;
}) {
  const spends = transactions.filter((transaction) => transaction.amount < 0);
  const totals = new Map<RoSpendCategory, number>();
  spends.forEach((transaction) => {
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + Math.abs(transaction.amount));
  });

  const rows = Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  const totalSpent = rows.reduce((sum, row) => sum + row.amount, 0);
  const max = rows[0]?.amount ?? 1;

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <PageHeader
        compact
        includeSafeArea
        collapsedTitleProgress={1}
        showHelp={false}
        variant="transparent"
        title="Unde se duc banii"
        onBack={onBack}
      />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[36px] pt-[10px]">
        <RoCard className="text-center">
          <p className="text-[13px] text-[var(--uc-text-muted)]">Total cheltuit recent</p>
          <p className="mt-[4px] text-[30px] font-bold leading-[34px] text-[var(--uc-text)]">
            {formatRonGuarded(totalSpent, showAmounts)}
          </p>
          <p className="mt-[4px] text-[13px] text-[var(--uc-text-muted)]">
            pe {rows.length} {rows.length === 1 ? "categorie" : "categorii"}
          </p>
        </RoCard>

        <div className="mt-[16px] space-y-[14px]">
          {rows.map((row) => {
            const accent = CATEGORY_ACCENT[row.category] ?? "var(--hu-theme-accent-strong)";
            const width = Math.max(6, Math.round((row.amount / max) * 100));
            const share = totalSpent > 0 ? Math.round((row.amount / totalSpent) * 100) : 0;
            return (
              <div key={row.category}>
                <div className="mb-[6px] flex items-center justify-between">
                  <span className="inline-flex items-center gap-[8px] text-[15px] font-bold text-[var(--uc-text)]">
                    <span
                      className="grid size-[26px] place-items-center rounded-full"
                      style={{ background: `color-mix(in srgb, ${accent} 16%, var(--uc-surface))`, color: accent }}
                    >
                      <AppIcon name="receipt-text" size={14} />
                    </span>
                    {row.category}
                  </span>
                  <span className="text-[14px] font-bold text-[var(--uc-text)]">
                    {formatRonGuarded(row.amount, showAmounts)}
                  </span>
                </div>
                <div className="h-[10px] w-full overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
                  <div className="h-full rounded-full" style={{ width: `${width}%`, background: accent }} />
                </div>
                <p className="mt-[3px] text-[12px] text-[var(--uc-text-muted)]">{share}% din total</p>
              </div>
            );
          })}
        </div>

        <RoCard className="mt-[20px] flex items-start gap-[12px]">
          <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-green-success)_16%,var(--uc-surface))] text-[var(--uc-green-success)]">
            <AppIcon name="piggy-bank" size={19} />
          </span>
          <p className="text-[14px] leading-[19px] text-[var(--uc-text-muted)]">
            Sfat: dacă muți {formatRon(20)} pe săptămână din „Mâncare" în obiective, ajungi la biletul de festival cu 2
            săptămâni mai devreme.
          </p>
        </RoCard>
      </main>
    </div>
  );
}
