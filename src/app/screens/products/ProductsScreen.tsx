import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject, UIEvent } from "react";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import BottomNavigation from "@/app/components/BottomNavigation";
import { AppIcon } from "@/app/components/icons";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import ProductCardBottomSheet, { type ProductDetailSelection } from "@/app/components/products/ProductCardBottomSheet";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import ShopsmartOfferCard from "@/app/components/shopsmart/ShopsmartOfferCard";
import ShopsmartCategoryChips from "@/app/components/shopsmart/ShopsmartCategoryChips";
import App2027ProductsShelf from "@/app/screens/products/App2027ProductsShelf";
import { ProductsHeader } from "@/app/screens/products/ProductsHeader";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry, useDemo } from "@/app/state/demoStore";
import {
  getProductsMenuForCountry,
  type ProductsCard,
  type ProductsCardId,
  type ProductsMenuTab,
  type ProductsOffer,
  type ShopSmartOfferCategory,
  type ShopSmartOfferCard,
  type ShopSmartSummary,
} from "@/app/config/productsMenuConfig";

export { ProductsHeader };

type NavItem = "home" | "analytics" | "payments" | "products" | "more";

const OFFER_CARD_WIDTH = 327;
const OFFER_CARD_GAP = 12;
const OFFER_CARD_STEP = OFFER_CARD_WIDTH + OFFER_CARD_GAP;
const OFFER_CAROUSEL_EDGE_GUTTER = 24;
/** Matches the Evo shelf sub-page header height, so a sticky row lands under it. */
const SHELF_STICKY_HEADER_TOP = "calc(var(--uc-phone-top-reserve, 54px) + 48px)";

interface ProductsScreenProps {
  onHomeClick?: () => void;
  onAnalyticsClick?: () => void;
  onContactsClick?: () => void;
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onMoreClick?: () => void;
  onProductDetailOpen?: (selection: ProductDetailSelection) => void;
  productsShelfFocusRequest?: ProductsShelfFocusRequest | null;
  onProductsShelfFocusHandled?: () => void;
  /** Evo 2027 shelf only: the hero photo has scrolled out from under the status bar. */
  onShelfHeroCollapsedChange?: (collapsed: boolean) => void;
}

export type { ProductDetailSelection };

export interface ProductsShelfFocusRequest {
  requestId: number;
  cardId?: ProductsCardId | null;
}

export function ProductsTabs({
  activeTab,
  bankingLabel,
  shopSmartLabel,
  onChange,
}: {
  activeTab: ProductsMenuTab;
  bankingLabel: string;
  shopSmartLabel: string;
  onChange: (tab: ProductsMenuTab) => void;
}) {
  return (
    <div className="shrink-0 bg-[var(--uc-app-bg)]">
      <div className="grid h-[48px] grid-cols-2">
        {[
          { id: "banking" as const, label: bankingLabel },
          { id: "shopsmart" as const, label: shopSmartLabel },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`uc-type-n2-strong flex cursor-pointer items-center justify-center border-b focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--uc-action)] ${
              activeTab === tab.id ? "border-b-[3px] border-[var(--uc-text)]" : "border-[var(--uc-text-muted)]"
            }`}
            style={{
              color: activeTab === tab.id ? "var(--uc-text)" : "var(--uc-text-muted)",
              lineHeight: "24px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SectionHeading({ children }: { children: string }) {
  return <SectionHeadingDivider title={children} className="px-[24px]" />;
}

function handleOfferClick(_offer: ProductsOffer) {}

export function OffersRail({ offers }: { offers: readonly ProductsOffer[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollSnapTimeoutRef = useRef<number | null>(null);

  const clampOfferIndex = (index: number) => Math.max(0, Math.min(offers.length - 1, index));

  const clampCarouselScrollLeft = (scrollLeft: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return scrollLeft;

    const maxScrollLeft = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    return Math.max(0, Math.min(maxScrollLeft, scrollLeft));
  };

  const getOfferScrollLeft = (index: number) => {
    const carousel = carouselRef.current;
    const nextIndex = clampOfferIndex(index);
    const cardOffsetLeft = OFFER_CAROUSEL_EDGE_GUTTER + nextIndex * OFFER_CARD_STEP;

    if (!carousel || nextIndex === 0) {
      return 0;
    }

    if (nextIndex === offers.length - 1) {
      return clampCarouselScrollLeft(
        cardOffsetLeft + OFFER_CARD_WIDTH + OFFER_CAROUSEL_EDGE_GUTTER - carousel.clientWidth,
      );
    }

    return clampCarouselScrollLeft(cardOffsetLeft - (carousel.clientWidth - OFFER_CARD_WIDTH) / 2);
  };

  const getNearestOfferIndex = (scrollLeft: number) => {
    if (offers.length <= 1) return 0;

    return offers.reduce((nearestIndex, _offer, index) => {
      const nearestDistance = Math.abs(scrollLeft - getOfferScrollLeft(nearestIndex));
      const nextDistance = Math.abs(scrollLeft - getOfferScrollLeft(index));
      return nextDistance < nearestDistance ? index : nearestIndex;
    }, 0);
  };

  const scrollToOffer = (index: number, behavior: ScrollBehavior = "smooth") => {
    carouselRef.current?.scrollTo({
      left: getOfferScrollLeft(index),
      behavior,
    });
  };

  const snapCarouselToNearestOffer = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    scrollToOffer(getNearestOfferIndex(carousel.scrollLeft));
  };

  const clearScrollSnapTimeout = () => {
    if (scrollSnapTimeoutRef.current === null) return;

    window.clearTimeout(scrollSnapTimeoutRef.current);
    scrollSnapTimeoutRef.current = null;
  };

  const { isDragging, isPressActiveRef, dragHandlers } = useDragCarousel({
    carouselRef,
    onSettle: snapCarouselToNearestOffer,
    enabled: offers.length > 1,
  });

  const handleCarouselScroll = (_event: UIEvent<HTMLDivElement>) => {
    if (isPressActiveRef.current) return;
    clearScrollSnapTimeout();
    scrollSnapTimeoutRef.current = window.setTimeout(snapCarouselToNearestOffer, 120);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    if (typeof carousel.scrollTo === "function") carousel.scrollTo({ left: 0 });
    else carousel.scrollLeft = 0;
  }, [offers]);

  useEffect(
    () => () => {
      clearScrollSnapTimeout();
    },
    [],
  );

  return (
    <div
      ref={carouselRef}
      onScroll={handleCarouselScroll}
      {...dragHandlers}
      className={`overflow-x-auto scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
      }}
    >
      <div className="flex gap-[12px] px-[24px] pt-[16px]">
        {offers.map((offer, index) => (
          <div key={offer.id} {...dragHandlers}>
            <ProductOfferCard
              offer={offer}
              colorFamily={offer.colorFamily}
              lightVersion={offer.lightVersion}
              onClick={(selectedOffer) => {
                scrollToOffer(index);
                handleOfferClick(selectedOffer);
              }}
            />
          </div>
        ))}
        <div aria-hidden="true" className="w-[12px] shrink-0" />
      </div>
    </div>
  );
}

export function getProductsCardTranslationId(card: ProductsCard) {
  if (card.translationKey === null) return null;
  if (card.translationKey) return card.translationKey;

  const normalizedTitle = card.title.replace(/\n/g, " ").toLowerCase();
  if (normalizedTitle === "electronics") return "electronics";
  if (normalizedTitle === "travel") return "travel";
  if (normalizedTitle === "home and living") return "home-living";
  if (normalizedTitle === "fashion") return "fashion";
  return card.id;
}

export function BankingContent({
  offersTitle,
  offers,
  productsTitle,
  products,
  otherSolutionsTitle,
  otherSolutions,
  onProductCardClick,
  productsSectionRef,
}: {
  offersTitle: string;
  offers: readonly ProductsOffer[];
  productsTitle: string;
  products: readonly ProductsCard[];
  otherSolutionsTitle: string;
  otherSolutions: readonly ProductsCard[];
  onProductCardClick: (card: ProductsCard) => void;
  productsSectionRef?: RefObject<HTMLElement>;
}) {
  return (
    <>
      {offers.length > 0 && (
        <section className="pt-[16px]">
          <SectionHeading>{offersTitle}</SectionHeading>
          <OffersRail offers={offers} />
        </section>
      )}

      <section ref={productsSectionRef} className="pt-[16px]" data-products-banking-shelf="true">
        {productsTitle ? <SectionHeading>{productsTitle}</SectionHeading> : null}
        <div data-products-menu-grid className="grid min-w-0 grid-cols-2 gap-[12px] px-[24px] pt-[16px]">
          {products.map((card) => (
            <ProductMenuCard key={card.id} card={card} variant="standard" onClick={onProductCardClick} />
          ))}
        </div>
      </section>

      {otherSolutions.length > 0 && (
        <section className="pt-[16px]">
          <SectionHeading>{otherSolutionsTitle}</SectionHeading>
          <div className="grid grid-cols-1 px-[24px] pt-[16px]">
            {otherSolutions.map((card) => (
              <ProductMenuCard key={card.id} card={card} variant="standard" onClick={onProductCardClick} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function ShopSmartContent({
  summary,
  offerCards,
  stickySearchTop,
  searchSurface = false,
  showSummary = true,
}: {
  summary: ShopSmartSummary;
  offerCards: readonly ShopSmartOfferCard[];
  /** CSS `top` for a sticky search row. Omit to keep the baseline static layout. */
  stickySearchTop?: string;
  /** Paint the search field as a raised surface, for pages on the app background. */
  searchSurface?: boolean;
  /** Partner offers has no activated-offers summary; ShopSmart keeps it. */
  showSummary?: boolean;
}) {
  const { t } = useLanguage();
  const partnerOffersMode = !showSummary;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"popular" | ShopSmartOfferCategory>("popular");

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleOfferCards = useMemo(() => {
    return offerCards.filter((offer) => {
      if (activeCategory !== "popular" && !offer.categories.includes(activeCategory)) return false;
      if (!normalizedSearchQuery) return true;
      const searchableText = [
        offer.merchant,
        offer.title,
        offer.statusText,
        offer.pillLabel,
        offer.tagLabel,
        offer.partnerTagLabel,
        offer.distance,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    });
  }, [activeCategory, normalizedSearchQuery, offerCards]);
  const partnerCategories: ReadonlyArray<{
    id: "popular" | ShopSmartOfferCategory;
    label: string;
  }> = [
    { id: "popular", label: t("runtime.evo.shopsmart.filters.popular", "MOST POPULAR") },
    { id: "eshops", label: t("runtime.evo.shopsmart.filters.eshops", "E-SHOPS") },
    { id: "electronics", label: t("runtime.evo.shopsmart.filters.electronics", "ELECTRONICS") },
    { id: "travel", label: t("runtime.evo.shopsmart.filters.travel", "TRAVEL") },
    { id: "home", label: t("runtime.evo.shopsmart.filters.home", "HOME & LIVING") },
  ];

  return (
    <section className="flex flex-col gap-[16px] pt-[16px]" data-products-shopsmart-content="true">
      {showSummary ? <ShopSmartSummaryBlock summary={summary} /> : null}
      <div className="flex flex-col gap-[16px]">
        {!partnerOffersMode ? (
          <SectionHeading>{t("runtime.productsMenu.allOffers", "ALL OFFERS")}</SectionHeading>
        ) : null}
        {/* On the Evo shelf this body sits on the app background, where the
            search bar's own app-bg fill is invisible; `searchSurface` rebinds the
            variable so the field reads as a raised white row, and `stickySearchTop`
            keeps it reachable while the offers scroll, as Account details does. */}
        <div
          data-products-shopsmart-search
          className={
            stickySearchTop ? "sticky z-[9] bg-[var(--uc-app-bg)] px-[16px] pb-[10px] pt-[2px]" : "px-[16px] py-[2px]"
          }
          style={stickySearchTop ? { top: stickySearchTop } : undefined}
        >
          <div
            className={
              searchSurface
                ? "rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px]"
                : undefined
            }
            style={searchSurface ? { ["--uc-app-bg" as string]: "var(--uc-surface)" } : undefined}
          >
            <AccountSearchBar
              value={searchQuery}
              onValueChange={setSearchQuery}
              onFilterClick={() => {}}
              showTrailingAction={!partnerOffersMode}
              placeholder={t("runtime.actions.search", "Search")}
            />
          </div>
        </div>
        {partnerOffersMode ? (
          <ShopsmartCategoryChips
            categories={partnerCategories}
            activeId={activeCategory}
            onSelect={(id) => setActiveCategory(id as typeof activeCategory)}
            ariaLabel={t("runtime.evo.shopsmart.categoriesLabel", "Shopsmart categories")}
            className="px-[16px]"
            railDataAttribute="data-partner-offers-categories"
          />
        ) : null}
        <div
          data-products-shopsmart-offers
          className={`flex w-full min-w-0 flex-col items-stretch gap-[16px] ${partnerOffersMode ? "px-[16px]" : "px-[24px]"}`}
        >
          {visibleOfferCards.map((offer) => (
            <ShopsmartOfferCard
              key={offer.id}
              merchant={offer.merchant}
              title={offer.title}
              statusText={offer.statusText}
              imageSrc={offer.imageSrc}
              imageHeight={partnerOffersMode ? 143 : 130}
              pillLabel={partnerOffersMode ? undefined : offer.pillLabel}
              pillTone={offer.pillTone}
              tagLabel={partnerOffersMode ? offer.partnerTagLabel : offer.tagLabel}
              distance={offer.distance}
              trailingIcon={offer.trailingIcon}
              variant={partnerOffersMode ? "partner" : "default"}
              onClick={() => handleShopSmartOfferClick(offer)}
            />
          ))}
          {visibleOfferCards.length === 0 ? (
            <p className="w-full py-[24px] text-center text-[14px] font-bold leading-[18px] text-[var(--uc-text-muted)]">
              {t("runtime.productsMenu.noOffersFound", "No offers found")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function handleShopSmartOfferClick(_offer: ShopSmartOfferCard) {}

function ShopSmartSummaryBlock({ summary }: { summary: ShopSmartSummary }) {
  return (
    <button
      type="button"
      className="grid min-h-[80px] grid-cols-[1fr_32px] items-center gap-[16px] px-[24px] text-left"
      onClick={() => {}}
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-[14px] font-bold uppercase leading-[20px] tracking-[1px] text-[var(--uc-text-muted)]">
          ACTIVATED OFFERS:{summary.activatedOffers}
        </span>
        <span className="mt-[2px] text-[18px] font-bold leading-[24px] tracking-[0] text-[var(--uc-text)]">
          {summary.totalSavedLabel}
        </span>
        <span className="mt-[1px] text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text)]">
          {summary.totalSavedAmount}
        </span>
      </span>
      <span className="grid size-[32px] place-items-center text-[var(--uc-text)]">
        <AppIcon name="chevron-link" color="currentColor" />
      </span>
    </button>
  );
}

export default function ProductsScreen({
  onHomeClick,
  onAnalyticsClick,
  onContactsClick,
  onMessagesClick,
  onPaymentsClick,
  onMoreClick,
  onProductDetailOpen,
  productsShelfFocusRequest,
  onProductsShelfFocusHandled,
  onShelfHeroCollapsedChange,
}: ProductsScreenProps) {
  const country = useCountry();
  const demo = useDemo();
  const { t } = useLanguage();
  const config = getProductsMenuForCountry(country);
  /** Evo 2027 replaces the products menu with the shelf; every other release keeps the baseline. */
  const showProductsShelf = demo.release === "release-future-evo-2027";
  const localizeOffer = (offer: ProductsOffer): ProductsOffer => ({
    ...offer,
    title: t(`runtime.productsMenu.offers.${offer.id}.title`, offer.title),
    description: t(`runtime.productsMenu.offers.${offer.id}.description`, offer.description),
  });
  const localizeCard = (card: ProductsCard): ProductsCard => {
    const translationId = getProductsCardTranslationId(card);

    return {
      ...card,
      title: translationId ? t(`runtime.productsMenu.cards.${translationId}`, card.title) : card.title,
    };
  };
  const [activeTab, setActiveTab] = useState<ProductsMenuTab>("banking");
  const [selectedProductCard, setSelectedProductCard] = useState<ProductsCard | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const productsSectionRef = useRef<HTMLElement>(null);
  const visibleTab = config.hasShopSmartTab ? activeTab : "banking";

  const handleProductCardClick = (card: ProductsCard) => {
    setSelectedProductCard(card);
  };

  useEffect(() => {
    if (!productsShelfFocusRequest) return;

    setActiveTab("banking");
    setSelectedProductCard(null);

    const focusTimeout = window.setTimeout(() => {
      const shelf = productsSectionRef.current;
      const scroller = scrollContainerRef.current;

      if (shelf && scroller) {
        scroller.scrollTo({
          top: Math.max(shelf.offsetTop - 8, 0),
          behavior: "smooth",
        });
      }

      if (productsShelfFocusRequest.cardId) {
        const targetCard = config.products.find((card) => card.id === productsShelfFocusRequest.cardId);
        if (targetCard) setSelectedProductCard(localizeCard(targetCard));
      }

      onProductsShelfFocusHandled?.();
    }, 100);

    return () => window.clearTimeout(focusTimeout);
  }, [productsShelfFocusRequest?.requestId]);

  const handleTabChange = (tab: NavItem) => {
    if (tab === "home") onHomeClick?.();
    if (tab === "analytics") onAnalyticsClick?.();
    if (tab === "payments") onPaymentsClick?.();
    if (tab === "more") onMoreClick?.();
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      {showProductsShelf ? (
        <App2027ProductsShelf
          title={t("runtime.productsMenu.title", config.title)}
          offerCounts={{
            shopsmart: config.shopSmartOfferCards.length,
            "partner-offers": config.shopSmartOfferCards.length,
          }}
          onProductDetailOpen={onProductDetailOpen}
          onHeroCollapsedChange={onShelfHeroCollapsedChange}
          renderOffers={({ showSummary = true } = {}) => (
            <ShopSmartContent
              summary={config.shopSmartSummary}
              offerCards={config.shopSmartOfferCards}
              stickySearchTop={SHELF_STICKY_HEADER_TOP}
              searchSurface
              showSummary={showSummary}
            />
          )}
        />
      ) : (
        <>
          <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
          <ProductsHeader
            title={t("runtime.productsMenu.title", config.title)}
            onContactsClick={onContactsClick}
            onMessagesClick={onMessagesClick}
          />

          {config.hasShopSmartTab && (
            <ProductsTabs
              activeTab={activeTab}
              bankingLabel={t("runtime.productsMenu.banking", config.bankingTabLabel)}
              shopSmartLabel={t("runtime.productsMenu.shopSmart", config.shopSmartTabLabel)}
              onChange={setActiveTab}
            />
          )}

          <div ref={scrollContainerRef} className="relative z-0 flex-1 overflow-y-auto scrollbar-hide pb-[92px]">
            {visibleTab === "banking" ? (
              <BankingContent
                offersTitle={t("runtime.productsMenu.offersForYou", config.offersTitle)}
                offers={config.offers.map(localizeOffer)}
                productsTitle={config.productsTitle ? t("runtime.productsMenu.ourProducts", config.productsTitle) : ""}
                products={config.products.map(localizeCard)}
                otherSolutionsTitle={t("runtime.productsMenu.otherSolutionsForYou", config.otherSolutionsTitle)}
                otherSolutions={config.otherSolutions.map(localizeCard)}
                onProductCardClick={handleProductCardClick}
                productsSectionRef={productsSectionRef}
              />
            ) : (
              <ShopSmartContent summary={config.shopSmartSummary} offerCards={config.shopSmartOfferCards} />
            )}
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="products" onTabChange={handleTabChange} />
      </div>

      {selectedProductCard ? (
        <ProductCardBottomSheet
          card={selectedProductCard}
          country={country}
          onClose={() => setSelectedProductCard(null)}
          onProductOptionClick={onProductDetailOpen}
        />
      ) : null}
    </div>
  );
}
