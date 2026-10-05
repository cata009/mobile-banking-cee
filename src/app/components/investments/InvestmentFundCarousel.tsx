import { useRef, useState } from "react";

import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import InvestmentsFundBanner from "@/app/components/investments/InvestmentsFundBanner";
import { useDragCarousel } from "@/hooks/useDragCarousel";
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
  const { dragHandlers, isDragging } = useDragCarousel({ carouselRef });

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
    const carousel = carouselRef.current;
    const slide = slideRefs.current[index];
    if (!carousel || !slide) return;

    const carouselRect = carousel.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    const nextScrollLeft = Math.min(
      maxScrollLeft,
      Math.max(0, carousel.scrollLeft + slideRect.left - carouselRect.left),
    );
    carousel.scrollTo({ left: nextScrollLeft, behavior: "smooth" });
  };

  return (
    <div className="mt-[16px]">
      <div className="pl-[24px]">
        <div
          ref={carouselRef}
          {...dragHandlers}
          onScroll={updateActiveSlide}
          className={`relative flex snap-x snap-mandatory gap-[12px] overflow-x-auto overscroll-x-contain pr-[24px] pb-[4px] scrollbar-hide select-none touch-pan-y ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
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
                dragHandlers={dragHandlers}
                variant={collection.bannerVariant}
                onClick={() => onSelectCollection(collection.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[4px]" role="group" aria-label="Choose a fund collection">
        <AccountCarouselIndicator
          count={INVESTMENT_FUND_COLLECTIONS.length}
          activeIndex={activeIndex}
          itemLabel="fund collection"
          itemLabels={INVESTMENT_FUND_COLLECTIONS.map((collection) => collection.title)}
          withBackdropBlur={false}
          onSelect={goToSlide}
        />
      </div>

      <span className="sr-only" aria-live="polite">
        Slide {activeIndex + 1} of {INVESTMENT_FUND_COLLECTIONS.length}: {INVESTMENT_FUND_COLLECTIONS[activeIndex]?.title}
      </span>
    </div>
  );
}
