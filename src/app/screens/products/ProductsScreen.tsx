import { useEffect, useRef, useState } from "react";
import type { DragEvent, MouseEvent, PointerEvent, UIEvent } from "react";
import BottomNavigation from "@/app/components/BottomNavigation";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import {
  getProductsMenuForCountry,
  type ProductsCard,
  type ProductsMenuTab,
  type ProductsOffer,
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
  onMessagesClick?: () => void;
  onPaymentsClick?: () => void;
  onMoreClick?: () => void;
}

export function ProductsHeader({ title, onMessagesClick }: { title: string; onMessagesClick?: () => void }) {
  const { t } = useLanguage();
  const handleAction = (action: string) => {
    console.log(`Products ${action} clicked`);
  };

  return (
    <div className="w-full bg-[var(--uc-surface)]">
      <div className="px-[24px] pb-[22px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="flex-1 min-w-0 font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{ fontSize: "30px", lineHeight: "36px" }}
          >
            {title}
          </h1>
          <HeaderActionRail>
            <HeaderActionButton icon="profile" label={t("runtime.actions.profile", "Profile")} onClick={() => handleAction("profile")} />
            <HeaderActionButton icon="messages" label={t("runtime.actions.messages", "Messages")} onClick={onMessagesClick} />
            <HeaderActionButton icon="help" label={t("runtime.actions.help", "Help")} onClick={() => handleAction("help")} />
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
      <div className="grid h-[64px] grid-cols-2 border-b border-[var(--uc-text-muted)]">
        {[
          { id: "banking" as const, label: bankingLabel },
          { id: "shopsmart" as const, label: shopSmartLabel },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="relative flex items-center justify-center font-['UniCredit',sans-serif] font-bold cursor-pointer"
            style={{
              color: activeTab === tab.id ? "var(--uc-text)" : "var(--uc-text-muted)",
              fontSize: "21px",
              lineHeight: "24px",
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-[-1px] left-0 h-[3px] w-full bg-[var(--uc-text)]" />
            )}
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

function handleProductCardClick(card: ProductsCard) {
  console.log(`Products card clicked: ${card.id}`);
}

export function getProductsCardTranslationId(card: ProductsCard) {
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
}: {
  offersTitle: string;
  offers: readonly ProductsOffer[];
  productsTitle: string;
  products: readonly ProductsCard[];
  otherSolutionsTitle: string;
  otherSolutions: readonly ProductsCard[];
}) {
  return (
    <>
      {offers.length > 0 && (
        <section className="pt-[16px]">
          <SectionHeading>{offersTitle}</SectionHeading>
          <OffersRail offers={offers} />
        </section>
      )}

      <section className="pt-[16px]">
        {productsTitle ? <SectionHeading>{productsTitle}</SectionHeading> : null}
        <div className="grid grid-cols-[repeat(2,164px)] justify-center gap-[16px] pt-[16px]">
          {products.map((card) => (
            <ProductMenuCard key={card.id} card={card} variant="standard" onClick={handleProductCardClick} />
          ))}
        </div>
      </section>

      {otherSolutions.length > 0 && (
        <section className="pt-[16px]">
          <SectionHeading>{otherSolutionsTitle}</SectionHeading>
          <div className="grid grid-cols-[164px] px-[24px] pt-[16px]">
            {otherSolutions.map((card) => (
              <ProductMenuCard key={card.id} card={card} variant="standard" onClick={handleProductCardClick} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function ShopSmartContent({
  title,
  offers,
  products,
}: {
  title: string;
  offers: readonly ProductsOffer[];
  products: readonly ProductsCard[];
}) {
  const { t } = useLanguage();

  return (
    <>
      <section className="pt-[16px]">
        <SectionHeading>{title}</SectionHeading>
        <OffersRail offers={offers} />
      </section>
      <section className="pt-[16px]">
        <SectionHeading>{t("runtime.productsMenu.featuredCategories", "FEATURED CATEGORIES")}</SectionHeading>
        <div className="grid grid-cols-[repeat(2,164px)] justify-center gap-[16px] pt-[16px]">
          {products.map((card) => (
            <ProductMenuCard key={card.id} card={card} variant="standard" onClick={handleProductCardClick} />
          ))}
        </div>
      </section>
    </>
  );
}

export default function ProductsScreen({ onHomeClick, onAnalyticsClick, onMessagesClick, onPaymentsClick, onMoreClick }: ProductsScreenProps) {
  const { country } = useDemo();
  const { t } = useLanguage();
  const config = getProductsMenuForCountry(country);
  const localizeOffer = (offer: ProductsOffer): ProductsOffer => ({
    ...offer,
    title: t(`runtime.productsMenu.offers.${offer.id}.title`, offer.title),
    description: t(`runtime.productsMenu.offers.${offer.id}.description`, offer.description),
  });
  const localizeCard = (card: ProductsCard): ProductsCard => ({
    ...card,
    title: t(`runtime.productsMenu.cards.${getProductsCardTranslationId(card)}`, card.title),
  });
  const [activeTab, setActiveTab] = useState<ProductsMenuTab>("banking");
  const visibleTab = config.hasShopSmartTab ? activeTab : "banking";

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
      <ProductsHeader title={t("runtime.productsMenu.title", config.title)} onMessagesClick={onMessagesClick} />

      {config.hasShopSmartTab && (
        <ProductsTabs
          activeTab={activeTab}
          bankingLabel={t("runtime.productsMenu.banking", config.bankingTabLabel)}
          shopSmartLabel={t("runtime.productsMenu.shopSmart", config.shopSmartTabLabel)}
          onChange={setActiveTab}
        />
      )}

      <div className="relative z-0 flex-1 overflow-y-auto scrollbar-hide pb-[92px]">
        {visibleTab === "banking" ? (
          <BankingContent
            offersTitle={t("runtime.productsMenu.offersForYou", config.offersTitle)}
            offers={config.offers.map(localizeOffer)}
            productsTitle={config.productsTitle ? t("runtime.productsMenu.ourProducts", config.productsTitle) : ""}
            products={config.products.map(localizeCard)}
            otherSolutionsTitle={t("runtime.productsMenu.otherSolutionsForYou", config.otherSolutionsTitle)}
            otherSolutions={config.otherSolutions.map(localizeCard)}
          />
        ) : (
          <ShopSmartContent
            title={t("runtime.productsMenu.shopSmartTitle", config.shopSmartTitle)}
            offers={config.shopSmartOffers.map(localizeOffer)}
            products={config.shopSmartProducts.map(localizeCard)}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="products" onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
