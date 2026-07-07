import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, MouseEvent, PointerEvent, RefObject, UIEvent } from "react";
import BottomNavigation from "@/app/components/BottomNavigation";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { AppIcon } from "@/app/components/icons";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import ProductCardBottomSheet, {
  type ProductDetailSelection,
} from "@/app/components/products/ProductCardBottomSheet";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import ShopsmartOfferCard from "@/app/components/shopsmart/ShopsmartOfferCard";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import {
  getProductsMenuForCountry,
  type ProductsCard,
  type ProductsCardId,
  type ProductsMenuTab,
  type ProductsOffer,
  type ShopSmartOfferCard,
  type ShopSmartSummary,
} from "@/app/config/productsMenuConfig";

type NavItem = "home" | "analytics" | "payments" | "products" | "more";

const OFFER_CARD_WIDTH = 327;
const OFFER_CARD_GAP = 12;
const OFFER_CARD_STEP = OFFER_CARD_WIDTH + OFFER_CARD_GAP;
const OFFER_CAROUSEL_EDGE_GUTTER = 24;

type OfferCarouselDragState = {
  didMove: boolean;
  input: "mouse" | "pointer" | null;
  pointerId: number | null;
  startScrollLeft: number;
  startX: number;
};

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
}

export type { ProductDetailSelection };

export interface ProductsShelfFocusRequest {
  requestId: number;
  cardId?: ProductsCardId | null;
}

export function ProductsHeader({
  title,
  onContactsClick,
  onMessagesClick,
}: {
  title: string;
  onContactsClick?: () => void;
  onMessagesClick?: () => void;
}) {
  const country = useCountry();
  const { t } = useLanguage();
  const usesBosniaHeaderActions = country === "BA" || country === "BA_BL";
  const handleAction = (action: string) => {
    console.log(`Products ${action} clicked`);
  };

  return (
    <div className="w-full bg-[var(--uc-surface)]">
      <div className="px-[24px] pb-[22px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="uc-type-n1 flex-1 min-w-0 text-[var(--uc-text)]"
            style={{ fontSize: "30px", lineHeight: "36px" }}
          >
            {title}
          </h1>
          <HeaderActionRail>
            {usesBosniaHeaderActions ? (
              <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={onContactsClick} />
            ) : (
              <HeaderActionButton icon="profile" label={t("runtime.actions.profile", "Profile")} onClick={() => handleAction("profile")} />
            )}
            <HeaderActionButton icon="messages" label={t("runtime.actions.messages", "Messages")} onClick={onMessagesClick} />
            {usesBosniaHeaderActions ? null : (
              <HeaderActionButton icon="help" label={t("runtime.actions.help", "Help")} onClick={() => handleAction("help")} />
            )}
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
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
    <div className="shrink-0 bg-[var(--uc-surface)]">
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

function handleOfferClick(offer: ProductsOffer) {
  console.log(`Products offer clicked: ${offer.id}`);
}

export function OffersRail({ offers }: { offers: readonly ProductsOffer[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<OfferCarouselDragState>({
    didMove: false,
    input: null,
    pointerId: null,
    startScrollLeft: 0,
    startX: 0,
  });
  const mouseDragCleanupRef = useRef<(() => void) | null>(null);
  const scrollSnapTimeoutRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

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

    return clampCarouselScrollLeft(
      cardOffsetLeft - (carousel.clientWidth - OFFER_CARD_WIDTH) / 2,
    );
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

  const removeMouseDragListeners = () => {
    mouseDragCleanupRef.current?.();
    mouseDragCleanupRef.current = null;
  };

  const clearScrollSnapTimeout = () => {
    if (scrollSnapTimeoutRef.current === null) return;

    window.clearTimeout(scrollSnapTimeoutRef.current);
    scrollSnapTimeoutRef.current = null;
  };

  const resetCarouselDrag = () => {
    removeMouseDragListeners();
    dragStateRef.current = {
      didMove: false,
      input: null,
      pointerId: null,
      startScrollLeft: 0,
      startX: 0,
    };
    setIsDragging(false);
  };

  const beginCarouselDrag = (
    clientX: number,
    input: OfferCarouselDragState["input"],
    pointerId: number | null = null,
  ) => {
    const carousel = carouselRef.current;
    if (!carousel || offers.length <= 1 || dragStateRef.current.input) return false;

    dragStateRef.current = {
      didMove: false,
      input,
      pointerId,
      startScrollLeft: carousel.scrollLeft,
      startX: clientX,
    };

    return true;
  };

  const moveCarouselDrag = (clientX: number) => {
    const carousel = carouselRef.current;
    const dragState = dragStateRef.current;
    if (!carousel || !dragState.input) return false;

    const deltaX = clientX - dragState.startX;
    if (!dragState.didMove && Math.abs(deltaX) < 4) return false;

    dragState.didMove = true;
    suppressClickRef.current = true;
    setIsDragging(true);
    carousel.scrollLeft = dragState.startScrollLeft - deltaX;
    return true;
  };

  const finishCarouselDrag = () => {
    const didMove = dragStateRef.current.didMove;

    if (didMove) {
      snapCarouselToNearestOffer();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 80);
    }

    resetCarouselDrag();
  };

  const handleCarouselScroll = (_event: UIEvent<HTMLDivElement>) => {
    if (dragStateRef.current.input) return;
    clearScrollSnapTimeout();
    scrollSnapTimeoutRef.current = window.setTimeout(snapCarouselToNearestOffer, 120);
  };

  const handleCarouselPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (beginCarouselDrag(event.clientX, "pointer", event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleCarouselPointerMove = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;

    if (moveCarouselDrag(event.clientX)) {
      event.preventDefault();
    }
  };

  const handleCarouselPointerUp = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (dragState.input !== "pointer" || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishCarouselDrag();
  };

  const handleCarouselPointerCancel = (event: PointerEvent<HTMLElement>) => {
    if (dragStateRef.current.input !== "pointer" || dragStateRef.current.pointerId !== event.pointerId) return;
    resetCarouselDrag();
    suppressClickRef.current = false;
  };

  const handleCarouselMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || !beginCarouselDrag(event.clientX, "mouse")) return;

    const handleMouseMove = (mouseEvent: globalThis.MouseEvent) => {
      if (dragStateRef.current.input !== "mouse") return;

      if (mouseEvent.buttons !== 1) {
        finishCarouselDrag();
        return;
      }

      if (moveCarouselDrag(mouseEvent.clientX)) {
        mouseEvent.preventDefault();
      }
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.input === "mouse") {
        finishCarouselDrag();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    mouseDragCleanupRef.current = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  };

  const handleCarouselClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
  };

  const handleCarouselDragStart = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    carouselRef.current?.scrollTo({ left: 0 });
  }, [offers]);

  useEffect(() => () => {
    removeMouseDragListeners();
    clearScrollSnapTimeout();
  }, []);

  return (
    <div
      ref={carouselRef}
      onScroll={handleCarouselScroll}
      onPointerDown={handleCarouselPointerDown}
      onPointerMove={handleCarouselPointerMove}
      onPointerUp={handleCarouselPointerUp}
      onPointerCancel={handleCarouselPointerCancel}
      onMouseDown={handleCarouselMouseDown}
      onClickCapture={handleCarouselClickCapture}
      className={`overflow-x-auto scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
      }}
    >
      <div className="flex gap-[12px] px-[24px] pt-[16px]">
        {offers.map((offer, index) => (
          <div
            key={offer.id}
            onClickCapture={handleCarouselClickCapture}
            onDragStart={handleCarouselDragStart}
            onMouseDown={handleCarouselMouseDown}
            onPointerCancel={handleCarouselPointerCancel}
            onPointerDown={handleCarouselPointerDown}
            onPointerMove={handleCarouselPointerMove}
            onPointerUp={handleCarouselPointerUp}
          >
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
  productsSectionRef?: RefObject<HTMLElement | null>;
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
        <div className="grid grid-cols-[repeat(2,164px)] justify-center gap-[16px] pt-[16px]">
          {products.map((card) => (
            <ProductMenuCard key={card.id} card={card} variant="standard" onClick={onProductCardClick} />
          ))}
        </div>
      </section>

      {otherSolutions.length > 0 && (
        <section className="pt-[16px]">
          <SectionHeading>{otherSolutionsTitle}</SectionHeading>
          <div className="grid grid-cols-[164px] px-[24px] pt-[16px]">
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
}: {
  summary: ShopSmartSummary;
  offerCards: readonly ShopSmartOfferCard[];
}) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleOfferCards = useMemo(() => {
    if (!normalizedSearchQuery) return offerCards;

    return offerCards.filter((offer) => {
      const searchableText = [
        offer.merchant,
        offer.title,
        offer.statusText,
        offer.pillLabel,
        offer.tagLabel,
        offer.distance,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    });
  }, [normalizedSearchQuery, offerCards]);

  return (
    <section className="flex flex-col gap-[16px] pt-[16px]" data-products-shopsmart-content="true">
      <ShopSmartSummaryBlock summary={summary} />
      <div className="flex flex-col gap-[16px]">
        <ShopSmartSectionHeading>{t("runtime.productsMenu.allOffers", "ALL OFFERS")}</ShopSmartSectionHeading>
        <div className="px-[16px] py-[2px]">
          <AccountSearchBar
            value={searchQuery}
            onValueChange={setSearchQuery}
            onFilterClick={() => console.log("ShopSmart filters clicked")}
            placeholder={t("runtime.actions.search", "Search")}
          />
        </div>
        <div className="flex flex-col items-center gap-[16px] px-[24px]">
          {visibleOfferCards.map((offer) => (
            <ShopsmartOfferCard
              key={offer.id}
              merchant={offer.merchant}
              title={offer.title}
              statusText={offer.statusText}
              imageSrc={offer.imageSrc}
              pillLabel={offer.pillLabel}
              pillTone={offer.pillTone}
              tagLabel={offer.tagLabel}
              distance={offer.distance}
              trailingIcon={offer.trailingIcon}
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

function handleShopSmartOfferClick(offer: ShopSmartOfferCard) {
  console.log(`ShopSmart offer clicked: ${offer.id}`);
}

function ShopSmartSummaryBlock({ summary }: { summary: ShopSmartSummary }) {
  return (
    <button
      type="button"
      className="grid min-h-[80px] grid-cols-[1fr_32px] items-center gap-[16px] px-[24px] text-left"
      onClick={() => console.log("ShopSmart summary clicked")}
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-[14px] font-bold uppercase leading-[20px] tracking-[1px] text-[var(--uc-text-muted)]">
          ACTIVATED OFFERS:{summary.activatedOffers}
        </span>
        <span className="mt-[2px] text-[24px] font-bold leading-[30px] tracking-[0] text-[var(--uc-text)]">
          {summary.totalSavedLabel}
        </span>
        <span className="mt-[1px] text-[18px] font-normal leading-[24px] tracking-[0] text-[var(--uc-text)]">
          {summary.totalSavedAmount}
        </span>
      </span>
      <span className="grid size-[32px] place-items-center text-[var(--uc-text)]">
        <AppIcon name="chevron-link" color="currentColor" />
      </span>
    </button>
  );
}

function ShopSmartSectionHeading({ children }: { children: string }) {
  return (
    <div className="relative h-[32px] px-[24px]">
      <h2 className="text-[18px] font-bold uppercase leading-[22px] tracking-[2px] text-[var(--uc-text)]">
        {children}
      </h2>
      <span aria-hidden="true" className="absolute bottom-0 left-0 h-px w-full bg-[var(--uc-border-muted)]" />
    </div>
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
}: ProductsScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const config = getProductsMenuForCountry(country);
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
  const productsSectionRef = useRef<HTMLElement | null>(null);
  const visibleTab = config.hasShopSmartTab ? activeTab : "banking";

  const handleProductCardClick = (card: ProductsCard) => {
    console.log(`Products card clicked: ${card.id}`);
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
    console.log(`Bottom nav tab clicked from products: ${tab}`);
    if (tab === "home") onHomeClick?.();
    if (tab === "analytics") onAnalyticsClick?.();
    if (tab === "payments") onPaymentsClick?.();
    if (tab === "more") onMoreClick?.();
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
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
          <ShopSmartContent
            summary={config.shopSmartSummary}
            offerCards={config.shopSmartOfferCards}
          />
        )}
      </div>

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
