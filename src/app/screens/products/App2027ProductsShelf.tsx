import { useEffect, useRef, useState } from "react";
import type { ReactNode, UIEvent } from "react";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import HorizontalCarousel from "@/app/components/ui/HorizontalCarousel";
import ProductShelfCard from "@/app/components/products/ProductShelfCard";
import type { ProductDetailSelection } from "@/app/components/products/ProductCardBottomSheet";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import { useLanguage } from "@/app/contexts/LanguageContext";
import {
  PRODUCT_SHELF_CATEGORIES,
  PRODUCT_SHELF_ENTRY_CARDS,
  PRODUCT_SHELF_HERO_SLIDES,
  getProductShelfCategory,
  type ProductShelfCategory,
  type ProductShelfCategoryId,
  type ProductShelfEntryCard,
  type ProductShelfItem,
} from "@/app/config/productsShelfConfig";

/** One heading language for every section on the page. */
const SHELF_SECTION_TITLE = "text-[24px] font-bold leading-[28px] tracking-[-0.01em] text-[var(--uc-text)]";
/**
 * Height of the sticky `PageHeader` block: the safe-area reserve plus its 48px
 * row and 8px of top padding. Anything that has to stick *below* the header —
 * the search field — offsets by this.
 */
const SHELF_STICKY_HEADER_HEIGHT = "calc(var(--uc-phone-top-reserve, 54px) + 56px)";
/**
 * `AccountSearchBar` paints itself with `--uc-app-bg`, which is invisible on a
 * page that already uses that background. Rebinding the variable to the raised
 * surface inside this wrapper turns the field white without touching the shared
 * component or its other twenty call sites.
 */
const SHELF_SEARCH_SURFACE = { ["--uc-app-bg" as string]: "var(--uc-surface)" };
/**
 * Foldables and rotated tablets give this screen far more width than a phone.
 * Full-width product cards would stretch to unreadable line lengths, so the
 * reading column is capped and centred; the carousels stay full width and simply
 * reveal more cards.
 */
const SHELF_CONTENT_WIDTH = "mx-auto w-full max-w-[560px]";
/** The app's chevron convention: 32px slot, icon at its natural size, text tone. */
const SHELF_CHEVRON_SLOT = "flex size-[32px] shrink-0 items-center justify-center";

/** Status bar sits over the hero photo, so the title has to clear it. */
const STATUS_BAR_RESERVE = "var(--uc-phone-top-reserve, 54px)";
/** Scroll distance over which the floating search swaps from dark to light glass. */
const HERO_COLLAPSE_DISTANCE = 150;
/** Figma draws 240px on a 393px frame; scaled up so faces clear the status bar and dynamic island. */
const HERO_PHOTO_HEIGHT = 300;
/**
 * Taller than Figma's 81px: at 81 the headline, the supporting line and the
 * 32px dot indicator had to share 65px of inner height, so everything sat glued
 * together. 112 leaves a real gap between the copy and the dots.
 */
const HERO_BAND_HEIGHT = 112;
/** The curved band dips past the photo, exactly as the Figma ellipse mask does. */
const HERO_BAND_OVERHANG = 11;
const HERO_TOTAL_HEIGHT = HERO_PHOTO_HEIGHT + HERO_BAND_OVERHANG;
const HERO_BAND_TOP = HERO_TOTAL_HEIGHT - HERO_BAND_HEIGHT;
/**
 * The Figma ellipse (rx = 1061/393 of the width) is applied to the whole hero,
 * not just to the dark band. Masking only the band left the photo showing as a
 * dark sliver under the curve near the edges. `ry` is kept above half the hero
 * so the ellipse's top vertex sits above the hero and the top edge stays square
 * — only the bottom curves.
 */
const HERO_MASK_RADIUS_Y = Math.round(HERO_TOTAL_HEIGHT * 0.55);
const HERO_CLIP = `radial-gradient(135% ${HERO_MASK_RADIUS_Y}px at 50% ${HERO_TOTAL_HEIGHT - HERO_MASK_RADIUS_Y}px, #000 99%, transparent 100%)`;

type ShelfView =
  | { kind: "shelf" }
  | { kind: "category"; categoryId: ProductShelfCategoryId }
  | { kind: "search" }
  | { kind: "offers"; title: string };

/** Every product on the shelf, flattened once for search. */
const SEARCHABLE_ITEMS: ReadonlyArray<{ item: ProductShelfItem; category: ProductShelfCategory; haystack: string }> =
  PRODUCT_SHELF_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      item,
      category,
      haystack: [item.productName, item.title, item.body, category.title].join(" ").toLowerCase(),
    })),
  );

export interface App2027ProductsShelfProps {
  onProductDetailOpen?: (selection: ProductDetailSelection) => void;
  /** Existing ShopSmart tab body, rendered inside the offers sub-page. */
  renderOffers?: () => ReactNode;
  /**
   * Fires when the hero photo has scrolled out from under the status bar. The
   * app uses it to flip the status bar back to dark content — white system
   * icons are invisible once the light page reaches the top.
   */
  onHeroCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Evo 2027 Products shelf — Figma "2027 - transformation 11" (node 24042:10990).
 *
 * Level 1 puts the actual product benefits on screen: a hero campaign carousel,
 * the compact partner-offer entries, then one carousel per product category
 * holding every product in it. A card opens the existing product detail; the
 * category chevron opens the same cards as a full page.
 */
export default function App2027ProductsShelf({
  onProductDetailOpen,
  renderOffers,
  onHeroCollapsedChange,
}: App2027ProductsShelfProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<ShelfView>({ kind: "shelf" });
  /** 0 while the hero fills the top, 1 once the page has scrolled under the status bar. */
  const { progress: shelfProgress, onScroll: trackShelfScroll, setProgress: setShelfProgress } =
    useCollapsingHeader(HERO_COLLAPSE_DISTANCE);

  const handleShelfScroll = (event: UIEvent<HTMLDivElement>) => {
    trackShelfScroll(event);
    onHeroCollapsedChange?.(event.currentTarget.scrollTop > HERO_COLLAPSE_DISTANCE * 0.6);
  };

  /**
   * The status bar follows what is actually behind it. On the shelf that is the
   * hero photo, so it starts with light content; on every sub-page it is the
   * light app background, so it must switch to dark content immediately —
   * otherwise the clock and battery are white on near-white.
   */
  useEffect(() => {
    setShelfProgress(0);
    onHeroCollapsedChange?.(view.kind !== "shelf");
  }, [view.kind, setShelfProgress, onHeroCollapsedChange]);

  useEffect(() => () => onHeroCollapsedChange?.(false), [onHeroCollapsedChange]);

  const openProduct = (item: ProductShelfItem, category: ProductShelfCategory) => {
    onProductDetailOpen?.({
      cardId: item.cardId,
      categoryTitle: category.title,
      optionId: item.id,
      title: item.productName,
      // The detail page continues the card: same photo, same promise, then the
      // longer product copy underneath.
      heroImage: item.image,
      heroImagePosition: item.imagePosition,
      headline: item.title,
      intro: item.body,
    });
  };

  if (view.kind === "category") {
    const category = getProductShelfCategory(view.categoryId);

    return (
      <ProductShelfSubPage title={category.title} onBack={() => setView({ kind: "shelf" })}>
        <div
          data-products-shelf-category={category.id}
          className="flex flex-col gap-[16px] px-[16px] pb-[16px]"
        >
          <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {category.items.length} products to explore
          </p>
          {category.items.map((item, itemIndex) => (
            <ProductShelfCard
              key={item.id}
              item={item}
              layout="list"
              categoryId={category.id}
              position={itemIndex + 1}
              onClick={(selected) => openProduct(selected, category)}
            />
          ))}
        </div>
      </ProductShelfSubPage>
    );
  }

  if (view.kind === "search") {
    return (
      <ProductShelfSearch
        onBack={() => setView({ kind: "shelf" })}
        onSelect={(item, category) => openProduct(item, category)}
      />
    );
  }

  if (view.kind === "offers") {
    return (
      <ProductShelfSubPage title={view.title} onBack={() => setView({ kind: "shelf" })}>
        <div data-products-shelf-offers="true">{renderOffers?.()}</div>
      </ProductShelfSubPage>
    );
  }

  return (
    <>
      {/*
        Search has to stay reachable at any scroll position, but a solid header
        bar would fight the full-bleed hero. So the control floats outside the
        scroller and changes material instead of appearing: dark glass while it
        sits on the photo, light glass with a hairline once the page has scrolled
        under it. A barely-there blurred strip fades in behind the status bar at
        the same time, so the system icons never sit on moving content.
      */}
      <ShelfStatusScrim progress={shelfProgress} />
      <ShelfFloatingSearch
        progress={shelfProgress}
        label={t("runtime.actions.search", "Search")}
        onClick={() => setView({ kind: "search" })}
      />
    <div
      data-products-shelf="true"
      onScroll={handleShelfScroll}
      className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-[92px]"
    >
      <ProductShelfHero
        onSlideClick={(categoryId) => setView({ kind: "category", categoryId })}
      />

      {/* Partner commerce keeps the page's photographic language but flips the
          card's anatomy: full-bleed photo with the label over a gradient, where a
          product card is photo-above-white-text. Strong enough to be part of the
          experience, unmistakably not a banking product. The heading uses the
          same 24px title as every category below it. */}
      <section className="px-[16px] pt-[24px]" data-products-shelf-entries="true">
        <h2 className={SHELF_SECTION_TITLE}>
          {t("runtime.productsMenu.shoppingBenefits", "Save when you shop")}
        </h2>
        {/* Wrapping flex rather than a 2-column grid: on a foldable the tiles
            stop growing at 280px instead of stretching to half the screen. */}
        <div className="mt-[12px] flex flex-wrap gap-[12px]">
          {PRODUCT_SHELF_ENTRY_CARDS.map((entry) => (
            <ShelfPartnerTile
              key={entry.id}
              entry={entry}
              onClick={() => setView({ kind: "offers", title: entry.title.replace(/\n/g, " ") })}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-[28px] px-[16px] pt-[28px]" data-products-shelf-catalog="true">
        {PRODUCT_SHELF_CATEGORIES.map((category, categoryIndex) => (
          <section key={category.id} data-products-shelf-rail={category.id} data-shelf-position={categoryIndex + 1}>
            {/* One affordance for "there is more": the whole heading row. No count
                here — a bare number next to a title reads like the red "new"
                badges elsewhere, and the dots already say how many cards there
                are. The count lives on the category page instead. */}
            <button
              type="button"
              data-products-shelf-see-all={category.id}
              aria-label={`${category.title}, ${category.items.length} products`}
              onClick={() => setView({ kind: "category", categoryId: category.id })}
              className="flex w-full items-center gap-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
            >
              <h2 className={`min-w-0 flex-1 ${SHELF_SECTION_TITLE}`}>{category.title}</h2>
              <span aria-hidden="true" className={SHELF_CHEVRON_SLOT}>
                <AppIcon name="chevron-link" color="var(--uc-text)" />
              </span>
            </button>
            <HorizontalCarousel ariaLabel={category.title} count={category.items.length} itemLabel="product">
              {category.items.map((item, itemIndex) => (
                <ProductShelfCard
                  key={item.id}
                  item={item}
                  categoryId={category.id}
                  position={itemIndex + 1}
                  onClick={(selected) => openProduct(selected, category)}
                />
              ))}
            </HorizontalCarousel>
          </section>
        ))}
      </section>
    </div>
    </>
  );
}

/**
 * Partner programme entry: a row, deliberately not a product card.
 *
 * The count is a plain subtitle rather than a red chip — red is the app's
 * "new / unread" signal, and a catalogue size is neither.
 */
/**
 * The strip that keeps the system status bar legible once the page scrolls under
 * it. Not a header: no title, no border, no colour of its own — just the page
 * background, blurred, fading in exactly as far as the scroll has gone.
 */
function ShelfStatusScrim({ progress }: { progress: number }) {
  return (
    <div
      aria-hidden="true"
      data-products-shelf-status-scrim
      className="pointer-events-none absolute inset-x-0 top-0 z-20"
      style={{
        height: STATUS_BAR_RESERVE,
        opacity: progress,
        background: "color-mix(in srgb, var(--uc-app-bg) 82%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    />
  );
}

/**
 * Search, pinned outside the scroller.
 *
 * Both materials are rendered and cross-faded rather than interpolated, so the
 * icon colour changes as smoothly as the background does and neither state is
 * ever a half-legible blend.
 */
function ShelfFloatingSearch({
  progress,
  label,
  onClick,
}: {
  progress: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-products-shelf-search
      data-shelf-progress={progress > 0.5 ? "collapsed" : "hero"}
      aria-label={label}
      onClick={onClick}
      className="absolute right-[16px] z-30 grid size-[36px] place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{ top: `calc(${STATUS_BAR_RESERVE} + 4px)` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          opacity: 1 - progress,
          background: "rgb(var(--uc-static-black-rgb) / 0.34)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-[var(--uc-border)]"
        style={{
          opacity: progress,
          background: "color-mix(in srgb, var(--uc-surface) 90%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 2px 8px rgb(var(--uc-shadow-rgb) / 0.12)",
        }}
      />
      <span aria-hidden="true" className="absolute" style={{ opacity: 1 - progress }}>
        <AppIcon name="search" color="var(--uc-static-white)" size={20} />
      </span>
      <span aria-hidden="true" className="absolute" style={{ opacity: progress }}>
        <AppIcon name="search" color="var(--uc-icon)" size={20} />
      </span>
    </button>
  );
}

/**
 * Partner programme tile.
 *
 * Same material as the rest of the page — photography — but a different form:
 * the photo runs full-bleed with the label over a gradient, where a product card
 * puts its photo above a white text block. That keeps the commerce zone visually
 * strong and unmistakably not a banking product, without a louder palette.
 */
function ShelfPartnerTile({
  entry,
  onClick,
}: {
  entry: ProductShelfEntryCard;
  onClick: () => void;
}) {
  const title = entry.title.replace(/\n/g, " ");

  return (
    <button
      type="button"
      data-products-shelf-entry={entry.id}
      aria-label={`${title}, ${entry.count} offers`}
      onClick={onClick}
      className="relative flex h-[136px] min-w-[150px] max-w-[280px] flex-1 basis-[calc(50%-6px)] overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
    >
      <img
        src={entry.image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        draggable={false}
        data-products-shelf-entry-media
        className="absolute inset-0 size-full object-cover"
        style={{ objectPosition: entry.imagePosition }}
      />
      {/* Two layers: a light overall knock-down so busy photography stops
          competing, then a hard bottom scrim that guarantees text contrast. */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundColor: "rgb(var(--uc-static-black-rgb) / 0.18)" }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[112px]"
        style={{
          background:
            "linear-gradient(to top, rgb(var(--uc-static-black-rgb) / 0.97) 0%, rgb(var(--uc-static-black-rgb) / 0.88) 40%, rgb(var(--uc-static-black-rgb) / 0.55) 72%, transparent 100%)",
        }}
      />
      {/* Count as a corner badge: over photography a muted line disappears, and
          the corner is where the eye looks for "how many". */}
      <span
        data-products-shelf-entry-count
        className="absolute right-[8px] top-[8px] z-10 rounded-[4px] bg-[var(--uc-brand)] px-[6px] py-[2px] text-[13px] font-bold leading-[17px] text-[var(--uc-static-white)]"
      >
        {entry.count}
      </span>
      <span className="relative z-10 mt-auto flex w-full flex-col gap-[3px] p-[12px]">
        <span className="truncate text-[17px] font-bold leading-[21px] text-[var(--uc-static-white)]">{title}</span>
        {/* Two lines reserved so both tiles' titles sit on the same baseline
            whatever the subtitle length — and after translation. */}
        <span className="line-clamp-2 min-h-[36px] text-[14px] leading-[18px] text-[var(--uc-static-white)]">
          {entry.subtitle}
        </span>
      </span>
    </button>
  );
}

/** Searches every product in every category, not just the visible carousel. */
function ProductShelfSearch({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (item: ProductShelfItem, category: ProductShelfCategory) => void;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const matches = normalizedQuery
    ? SEARCHABLE_ITEMS.filter((entry) => entry.haystack.includes(normalizedQuery))
    : SEARCHABLE_ITEMS;

  const groups = PRODUCT_SHELF_CATEGORIES.map((category) => ({
    category,
    items: matches.filter((entry) => entry.category.id === category.id).map((entry) => entry.item),
  })).filter((group) => group.items.length > 0);

  return (
    <ProductShelfSubPage title={t("runtime.actions.search", "Search")} onBack={onBack}>
      <div data-products-shelf-search="true" className="flex flex-col gap-[16px] pb-[16px]">
        {/* Sticky under the header, the same way Account details keeps its search
            reachable while the list scrolls. */}
        <div
          data-products-shelf-search-bar="true"
          className="sticky z-[9] bg-[var(--uc-app-bg)] px-[16px] pb-[10px] pt-[2px]"
          style={{ top: SHELF_STICKY_HEADER_HEIGHT }}
        >
          <div
            className="rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px]"
            style={SHELF_SEARCH_SURFACE}
          >
            <AccountSearchBar
              value={query}
              onValueChange={setQuery}
              placeholder={t("runtime.productsMenu.searchPlaceholder", "Search all products")}
              showTrailingAction={false}
            />
          </div>
        </div>
        <p className="px-[16px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {matches.length} {matches.length === 1 ? "product" : "products"}
          {normalizedQuery ? ` for “${query.trim()}”` : " across all categories"}
        </p>
        {groups.map((group) => (
          <section key={group.category.id} className="flex flex-col gap-[12px] px-[16px]">
            <SectionHeadingDivider title={group.category.title} />
            {group.items.map((item, itemIndex) => (
              <ProductShelfCard
                key={item.id}
                item={item}
                layout="list"
                categoryId={group.category.id}
                position={itemIndex + 1}
                onClick={(selected) => onSelect(selected, group.category)}
              />
            ))}
          </section>
        ))}
        {groups.length === 0 ? (
          <p className="px-[16px] py-[24px] text-center text-[16px] font-bold leading-[20px] text-[var(--uc-text-muted)]">
            {t("runtime.productsMenu.noProductsFound", "No products found")}
          </p>
        ) : null}
      </div>
    </ProductShelfSubPage>
  );
}

/**
 * Sub-page chrome for the category, search and offers views.
 *
 * The header lives *inside* the scroller and is `sticky`, which is what makes
 * the platform's large-title-to-compact-title collapse work: the big title
 * scrolls away while the centred one fades in. Previously the header sat outside
 * the scroller, so the title never moved. `variant="gray"` keeps the header on
 * the same app background as the shelf, so the white product cards stay the only
 * raised surface instead of a white header blending into white cards.
 */
function ProductShelfSubPage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  const { progress, onScroll } = useCollapsingHeader(64);

  return (
    <div
      data-products-shelf-subpage="true"
      onScroll={onScroll}
      className="relative z-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--uc-app-bg)] scrollbar-hide pb-[92px]"
    >
      <PageHeader
        title={title}
        onBack={onBack}
        showHelp={false}
        variant="gray"
        collapsedTitleProgress={progress}
        includeSafeArea
      />
      <div className={`pt-[8px] ${SHELF_CONTENT_WIDTH}`}>{children}</div>
    </div>
  );
}

function ProductShelfHero({
  onSlideClick,
}: {
  onSlideClick: (categoryId: ProductShelfCategoryId) => void;
}) {
  const { t } = useLanguage();
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = PRODUCT_SHELF_HERO_SLIDES;
  const activeSlide = slides[activeIndex] ?? slides[0];

  const scrollToSlide = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    const left = nextIndex * rail.clientWidth;
    if (typeof rail.scrollTo === "function") rail.scrollTo({ left, behavior: "smooth" });
    else rail.scrollLeft = left;
    setActiveIndex(nextIndex);
  };

  const settle = () => {
    const rail = railRef.current;
    if (!rail || rail.clientWidth === 0) return;
    scrollToSlide(Math.round(rail.scrollLeft / rail.clientWidth));
  };

  const { dragHandlers, isDragging } = useDragCarousel({
    carouselRef: railRef,
    enabled: slides.length > 1,
    onSettle: settle,
  });

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    if (rail.clientWidth === 0) return;
    setActiveIndex(Math.max(0, Math.min(slides.length - 1, Math.round(rail.scrollLeft / rail.clientWidth))));
  };

  return (
    <div
      data-products-shelf-hero="true"
      className="relative w-full"
      style={{
        height: `${HERO_TOTAL_HEIGHT}px`,
        maskImage: HERO_CLIP,
        WebkitMaskImage: HERO_CLIP,
        // Without this the gradient tiles and the masked-off band reappears
        // below the curve as a stray dark strip.
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      <div
        ref={railRef}
        onScroll={onScroll}
        {...dragHandlers}
        role="region"
        aria-label={t("runtime.productsMenu.offersForYou", "OFFERS FOR YOU")}
        className={`absolute inset-x-0 top-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-hide select-none touch-pan-y ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          height: `${HERO_PHOTO_HEIGHT}px`,
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {slides.map((slide) => (
          <div key={slide.id} {...dragHandlers} className="relative h-full w-full shrink-0 snap-start overflow-hidden bg-[var(--uc-surface-muted)]">
            {/* Anchored at the top and zoomed per slide: the only way to push a
                high-set subject below the status bar without cropping the face. */}
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              draggable={false}
              data-products-shelf-hero-media
              className="absolute inset-x-0 top-0 w-full object-cover"
              style={{ height: slide.imageZoom ?? "100%", objectPosition: slide.imagePosition }}
            />
          </div>
        ))}
      </div>

      {/* Carries the status bar and the overlaid title over any photo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: `calc(${STATUS_BAR_RESERVE} + 64px)`,
          background:
            "linear-gradient(to bottom, rgb(var(--uc-static-black-rgb) / 0.62) 0%, rgb(var(--uc-static-black-rgb) / 0.42) 45%, transparent 100%)",
        }}
      />

      {/* Scrim, not a slab: a gradient lets the photo carry through the band. */}
      <div
        data-products-shelf-hero-band="true"
        className="absolute inset-x-0 flex flex-col items-center justify-center gap-[14px] px-[16px] pb-[6px] pt-[14px]"
        style={{
          top: `${HERO_BAND_TOP}px`,
          height: `${HERO_BAND_HEIGHT}px`,
          background:
            "linear-gradient(to bottom, rgb(var(--uc-static-black-rgb) / 0.55) 0%, rgb(var(--uc-static-black-rgb) / 0.82) 55%, rgb(var(--uc-static-black-rgb) / 0.86) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        {/* No chevron: the whole band is the target, and a chevron here competes
            with the dots for the same 24px of vertical space. */}
        <button
          type="button"
          data-products-shelf-hero-cta={activeSlide.target}
          onClick={() => onSlideClick(activeSlide.target)}
          className="flex w-full flex-col gap-[6px] text-left text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-static-white)]"
        >
          <span className="text-[20px] font-bold leading-[25px]">{activeSlide.title}</span>
          <span className="line-clamp-2 text-[14px] leading-[19px] text-[rgb(var(--uc-static-white-rgb)_/_0.85)]">
            {activeSlide.body}
          </span>
        </button>
        <AccountCarouselIndicator
          count={slides.length}
          activeIndex={activeIndex}
          itemLabel="offer"
          withBackdropBlur={false}
          tone="inverse"
          onSelect={scrollToSlide}
        />
      </div>
    </div>
  );
}
