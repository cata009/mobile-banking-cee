import { useState } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import LinkButton from "@/app/components/ui/LinkButton";
import type { InvestmentBasketFund } from "@/app/config/investmentBasketFundsConfig";

interface InvestmentBasketFundsScreenProps {
  baskets: readonly InvestmentBasketFund[];
  onBack: () => void;
}

function BasketFundRow({ basket }: { basket: InvestmentBasketFund }) {
  return (
    <article
      className="flex min-h-[67px] items-center gap-[8px] px-[16px] py-[12px]"
      data-basket-fund-row={basket.id}
    >
      <BrandLogo logoId={basket.logoId} size={32} />
      <div className="min-w-0 flex-1 text-right">
        <h3 className="truncate text-[14px] font-bold leading-[17px] text-[var(--uc-text)]">{basket.title}</h3>
        <p className="truncate text-[14px] leading-[17px] text-[var(--uc-text-muted)]">{basket.description}</p>
      </div>
    </article>
  );
}

function BasketGroup({
  title,
  baskets,
}: {
  title: "ONE OFF INVESTMENT BASKETS" | "REGULAR INVESTMENT BASKETS";
  baskets: readonly InvestmentBasketFund[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? baskets : baskets.slice(0, 4);
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
        {visible.map((basket) => <BasketFundRow key={basket.id} basket={basket} />)}
      </div>
      {baskets.length > 4 ? (
        <div className="flex justify-center py-[16px]">
          <LinkButton
            iconName={expanded ? "chevron-up" : "chevron-down-wide"}
            iconSize={16}
            aria-label={`${expanded ? "See less" : "See more"} ${accessibleName}`}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "See less" : "See more"}
          </LinkButton>
        </div>
      ) : null}
    </section>
  );
}

export default function InvestmentBasketFundsScreen({ baskets, onBack }: InvestmentBasketFundsScreenProps) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const oneOffBaskets = baskets.filter((basket) => basket.contributionType === "ONE OFF");
  const regularBaskets = baskets.filter((basket) => basket.contributionType === "RECURRENT");

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
      <BasketGroup title="ONE OFF INVESTMENT BASKETS" baskets={oneOffBaskets} />
      <BasketGroup title="REGULAR INVESTMENT BASKETS" baskets={regularBaskets} />
      <div className="h-[34px]" aria-hidden="true" />
    </div>
  );
}
