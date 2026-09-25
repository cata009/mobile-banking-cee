import { useRef, useState } from "react";

import InvestmentsFundBanner from "@/app/components/investments/InvestmentsFundBanner";
import {
  INVESTMENT_FUND_COLLECTIONS,
  type InvestmentFundCollectionId,
} from "@/app/config/investmentFundCollections";

interface InvestmentFundCarouselProps {
  onSelectCollection: (collectionId: InvestmentFundCollectionId) => void;
}

export default function InvestmentFundCarousel({ onSelectCollection }: InvestmentFundCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveSlide = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - carouselCenter);
      if (distance < closestDistance) {
        closestIndex = index;
        closestDistance = distance;
      }
    });

    setActiveIndex(closestIndex);
  };

  const goToSlide = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <div className="mt-[16px]">
      <div
        ref={carouselRef}
        onScroll={updateActiveSlide}
        className="relative flex snap-x snap-mandatory gap-[12px] overflow-x-auto overscroll-x-contain px-[24px] pb-[4px] scrollbar-hide"
        role="region"
        aria-label="Investment fund collections"
        aria-roledescription="carousel"
        data-investment-fund-carousel="true"
      >
        {INVESTMENT_FUND_COLLECTIONS.map((collection, index) => (
          <div
            key={collection.id}
            ref={(element) => {
              slideRefs.current[index] = element;
            }}
            className="w-[calc(100%_-_52px)] shrink-0 snap-start"
            role="group"
            aria-roledescription="slide"
            aria-label={`${collection.title}, ${index + 1} of ${INVESTMENT_FUND_COLLECTIONS.length}`}
          >
            <InvestmentsFundBanner
              title={collection.title}
              description={collection.subtitle}
              actionLabel="FIND OUT MORE"
              variant={collection.bannerVariant}
              onClick={() => onSelectCollection(collection.id)}
            />
          </div>
        ))}
      </div>

      <div
        className="mt-[12px] flex items-center justify-center gap-[8px]"
        role="group"
        aria-label="Choose a fund collection"
      >
        {INVESTMENT_FUND_COLLECTIONS.map((collection, index) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => goToSlide(index)}
            className="grid min-h-[24px] min-w-[24px] place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            aria-label={`Show ${collection.title}`}
            aria-current={activeIndex === index ? "true" : undefined}
          >
            <span
              className={`block h-[8px] rounded-full transition-[width,background-color] duration-200 ${
                activeIndex === index ? "w-[24px] bg-[var(--uc-action)]" : "w-[8px] bg-[var(--uc-border-muted)]"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <span className="sr-only" aria-live="polite">
        Slide {activeIndex + 1} of {INVESTMENT_FUND_COLLECTIONS.length}: {INVESTMENT_FUND_COLLECTIONS[activeIndex]?.title}
      </span>
    </div>
  );
}
