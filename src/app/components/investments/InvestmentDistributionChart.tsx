import type { InvestmentDistributionItem } from "@/app/config/investmentsPortfolioConfig";
import type { InvestmentAmountParts } from "@/app/components/investments/InvestmentProductCard";

interface InvestmentDistributionChartProps {
  title: string;
  items: readonly InvestmentDistributionItem[];
  formatAmount: (value: number, currency: string) => InvestmentAmountParts;
  totalLabel: string;
}

function buildDonutSegments(items: readonly InvestmentDistributionItem[]): string {
  let offset = 0;

  return items
    .map((item) => {
      const start = offset;
      const end = offset + item.percent;
      offset = end;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(", ");
}

function getLabelPosition(index: number) {
  const positions = [
    "left-[18px] top-[16px] text-left",
    "right-[14px] top-[16px] text-right",
    "right-[16px] bottom-[20px] text-right",
    "left-[18px] bottom-[20px] text-left",
  ];

  return positions[index % positions.length];
}

export default function InvestmentDistributionChart({
  title,
  items,
  formatAmount,
  totalLabel,
}: InvestmentDistributionChartProps) {
  const donut = buildDonutSegments(items);

  return (
    <section className="pt-[18px]" data-ds-label="Investments distribution chart">
      <div className="relative mx-[8px] h-[258px]">
        <div
          className="absolute left-1/2 top-[44px] h-[148px] w-[148px] -translate-x-1/2 rounded-full"
          style={{ background: `conic-gradient(${donut})` }}
          aria-hidden="true"
        >
          <div className="absolute inset-[38px] rounded-full bg-[var(--uc-surface)]" />
        </div>
        <div className="absolute left-1/2 top-[91px] flex h-[54px] w-[54px] -translate-x-1/2 flex-col items-center justify-center rounded-full bg-[var(--uc-surface-muted)]">
          <span className="uc-type-n5-strong text-[var(--uc-text)]">100%</span>
          <span className="uc-type-n5 text-[var(--uc-text-muted)]">{totalLabel}</span>
        </div>
        {items.slice(0, 4).map((item, index) => (
          <div key={item.id} className={`absolute max-w-[92px] ${getLabelPosition(index)}`}>
            <p className="uc-type-n5 line-clamp-2 text-[var(--uc-text)]">{item.label}</p>
            <p className="text-[18px] font-bold leading-[22px] text-[var(--uc-text-muted)]">{item.percent}%</p>
          </div>
        ))}
      </div>

      <div className="px-[23px]">
        <h2 className="uc-type-n4-strong text-[var(--uc-text)]">{title}</h2>
      </div>
      <div className="mt-[18px] border-t border-[var(--uc-border-muted)]">
        {items.map((item) => {
          const amount = formatAmount(item.value, item.currency);

          return (
            <article
              key={item.id}
              className="flex min-h-[80px] items-start justify-between gap-[14px] border-b border-[var(--uc-border-muted)] px-[23px] py-[13px]"
            >
              <div className="flex min-w-0 gap-[10px]">
                <span
                  className="mt-[5px] h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <h3 className="uc-type-n4-strong truncate text-[var(--uc-text)]">{item.label}</h3>
                  <p className="uc-type-n4 mt-[3px] text-[var(--uc-text)]">
                    <span>{amount.integer}</span>
                    <span>{amount.decimal} {amount.currency}</span>
                  </p>
                  {item.secondaryLabel && (
                    <p className="uc-type-n5 mt-[2px] truncate text-[var(--uc-text-muted)]">{item.secondaryLabel}</p>
                  )}
                </div>
              </div>
              <p className="shrink-0 text-[20px] font-bold leading-[22px] text-[var(--uc-text)]">{item.percent}%</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
