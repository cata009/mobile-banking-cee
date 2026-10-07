import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import type { ProductsOffer } from "@/app/config/productsMenuConfig";

export const FUTURE_GAIN_SMART_INVESTMENT_OFFER: ProductsOffer = {
  id: "future-gain-smart-investment",
  title: "Check smart\ninvestment",
  description: "Explore investment opportunities",
  colorFamily: "yellow",
  lightVersion: false,
};

export default function FutureGainSmartInvestmentBanner({ onClick }: { onClick: () => void }) {
  return (
    <section aria-label="Smart investment" data-future-gain-smart-investment-banner="true">
      <div className="flex snap-x snap-mandatory gap-[12px] overflow-x-auto px-[24px] scrollbar-hide">
        <div className="snap-center">
          <ProductOfferCard
            offer={FUTURE_GAIN_SMART_INVESTMENT_OFFER}
            colorFamily="yellow"
            onClick={onClick}
          />
        </div>
        <div aria-hidden="true" className="w-[12px] shrink-0" />
      </div>
    </section>
  );
}
