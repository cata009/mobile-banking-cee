import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import type { InvestmentBasketFund } from "@/app/config/investmentBasketFundsConfig";

interface InvestmentBasketFundsScreenProps {
  baskets: readonly InvestmentBasketFund[];
  onBack: () => void;
  onSelectBasket: (basket: InvestmentBasketFund) => void;
}

function BasketFundRow({ basket, onSelect }: { basket: InvestmentBasketFund; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open basket fund ${basket.title}: ${basket.description}`}
      className="flex min-h-[67px] w-full items-center gap-[8px] px-[16px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
      data-basket-fund-row={basket.id}
    >
      <BrandLogo logoId={basket.logoId} size={32} />
      <div className="min-w-0 flex-1 text-right">
        <h3 className="truncate text-[14px] font-bold leading-[17px] text-[var(--uc-text)]">{basket.title}</h3>
        <p className="truncate text-[14px] leading-[17px] text-[var(--uc-text-muted)]">{basket.description}</p>
      </div>
    </button>
  );
}

function BasketGroup({
  title,
  baskets,
  onSelectBasket,
}: {
  title: "ONE OFF INVESTMENT BASKETS" | "REGULAR INVESTMENT BASKETS";
  baskets: readonly InvestmentBasketFund[];
  onSelectBasket: (basket: InvestmentBasketFund) => void;
}) {
  const accessibleName = title.toLowerCase();

  return (
    <section className="pt-[24px]" aria-label={accessibleName}>
      <SectionHeadingDivider
        title={title}
        count={baskets.length}
        variant="with-counter"
        className="[&_h2]:text-[16px] [&_span]:text-[16px]"
      />
      <div className="pt-[8px]">
        {baskets.map((basket) => (
          <BasketFundRow key={basket.id} basket={basket} onSelect={() => onSelectBasket(basket)} />
        ))}
      </div>
    </section>
  );
}

export default function InvestmentBasketFundsScreen({ baskets, onBack, onSelectBasket }: InvestmentBasketFundsScreenProps) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const oneOffBaskets = baskets.filter((basket) => basket.contributionType === "ONE OFF").slice(0, 3);
  const regularBaskets = baskets.filter((basket) => basket.contributionType === "RECURRENT").slice(0, 2);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
      onScroll={handleScroll}
      data-investment-basket-funds="true"
    >
      <PageHeader
        title="Basket Funds"
        onBack={onBack}
        includeSafeArea
        compact
        collapsedTitleProgress={headerProgress}
      />
      <p className="px-[16px] pb-[8px] pt-[16px] text-[14px] leading-[17px] text-[var(--uc-text)]">
        Our Baskets are diversified portfolios that combine multiple investment funds into a single, easy-to-manage asset. Instead of picking individual funds, you invest in a curated theme or strategy.
      </p>
      <BasketGroup title="ONE OFF INVESTMENT BASKETS" baskets={oneOffBaskets} onSelectBasket={onSelectBasket} />
      <BasketGroup title="REGULAR INVESTMENT BASKETS" baskets={regularBaskets} onSelectBasket={onSelectBasket} />
      <div className="h-[34px]" aria-hidden="true" />
    </div>
  );
}
