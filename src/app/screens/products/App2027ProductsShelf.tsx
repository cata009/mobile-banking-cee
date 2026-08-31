import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import AccountSearchBar from '@/app/components/accounts/AccountSearchBar'
import { HeaderActionButton } from '@/app/components/HeaderActionIcons'
import { AppIcon } from '@/app/components/icons'
import PageHeader from '@/app/components/PageHeader'
import SectionHeadingDivider from '@/app/components/SectionHeadingDivider'
import HorizontalCarousel from '@/app/components/ui/HorizontalCarousel'
import ProductShelfCard from '@/app/components/products/ProductShelfCard'
import type { ProductDetailSelection } from '@/app/components/products/ProductCardBottomSheet'
import { ProductsHeader } from '@/app/screens/products/ProductsHeader'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'
import { useLanguage } from '@/app/contexts/LanguageContext'
import {
  PRODUCT_SHELF_CATEGORIES,
  PRODUCT_SHELF_ENTRY_CARDS,
  getProductShelfCategory,
  type ProductShelfCategory,
  type ProductShelfCategoryId,
  type ProductShelfEntryCard,
  type ProductShelfItem,
} from '@/app/config/productsShelfConfig'

/** One heading language for every section on the page. */
const SHELF_SECTION_TITLE = 'text-[24px] font-bold leading-[28px] tracking-[-0.01em] text-[var(--uc-text)]'
/**
 * One rhythm down the page: 28px between a block and the next block's heading.
 * The shared L1 header already leaves 22px under the title, so the first block
 * only owes the remaining 6px — otherwise the page opens on a wider gap than it
 * keeps anywhere else.
 */
const SHELF_SECTION_GAP = 'pt-[28px]'
const SHELF_FIRST_SECTION_GAP = 'pt-[6px]'
/**
 * Height of the sticky `PageHeader` block: the safe-area reserve plus its
 * border-box 48px compact row. Anything that has to stick *below* the header —
 * the search field — offsets by this.
 */
const SHELF_STICKY_HEADER_HEIGHT = 'calc(var(--uc-phone-top-reserve, 54px) + 48px)'
/**
 * `AccountSearchBar` paints itself with `--uc-app-bg`, which is invisible on a
 * page that already uses that background. Rebinding the variable to the raised
 * surface inside this wrapper turns the field white without touching the shared
 * component or its other twenty call sites.
 */
const SHELF_SEARCH_SURFACE = { ['--uc-app-bg' as string]: 'var(--uc-surface)' }
/**
 * Foldables and rotated tablets give this screen far more width than a phone.
 * Full-width product cards would stretch to unreadable line lengths, so the
 * reading column is capped and centred; the carousels stay full width and simply
 * reveal more cards.
 */
const SHELF_CONTENT_WIDTH = 'mx-auto w-full max-w-[560px]'
/** The app's chevron convention: 32px slot, icon at its natural size, text tone.
 *  The glyph is `chevron-right` — the same wide chevron the home accordions use,
 *  rotated. `chevron-link` is the thin list-row glyph and reads far too small here. */
const SHELF_CHEVRON_SLOT = 'flex size-[32px] shrink-0 items-center justify-center'

type ShelfView =
  | { kind: 'shelf' }
  | { kind: 'category'; categoryId: ProductShelfCategoryId }
  | { kind: 'search' }
  | { kind: 'offers'; title: string; showSummary: boolean }

/** Every product on the shelf, flattened once for search. */
const SEARCHABLE_ITEMS: ReadonlyArray<{ item: ProductShelfItem; category: ProductShelfCategory; haystack: string }> =
  PRODUCT_SHELF_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      item,
      category,
      haystack: [item.productName, item.title, item.body, category.title].join(' ').toLowerCase(),
    })),
  )

export interface App2027ProductsShelfProps {
  /** L1 page title, printed in the header. */
  title: string
  onProductDetailOpen?: (selection: ProductDetailSelection) => void
  /** Existing ShopSmart tab body, rendered inside the offers sub-page. */
  renderOffers?: (options?: { showSummary?: boolean }) => ReactNode
  /**
   * Kept for the app's status-bar switch. The shelf is a light page at every
   * scroll position now, so it reports collapsed from the start.
   */
  onHeroCollapsedChange?: (collapsed: boolean) => void
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
  title,
  onProductDetailOpen,
  renderOffers,
  onHeroCollapsedChange,
}: App2027ProductsShelfProps) {
  const { t } = useLanguage()
  const [view, setView] = useState<ShelfView>({ kind: 'shelf' })

  // Nothing dark sits under the status bar any more, so its content stays dark throughout.
  useEffect(() => {
    onHeroCollapsedChange?.(true)
  }, [onHeroCollapsedChange])

  useEffect(() => () => onHeroCollapsedChange?.(false), [onHeroCollapsedChange])

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
    })
  }

  if (view.kind === 'category') {
    const category = getProductShelfCategory(view.categoryId)

    return (
      <ProductShelfSubPage title={category.title} onBack={() => setView({ kind: 'shelf' })}>
        <div data-products-shelf-category={category.id} className="flex flex-col gap-[16px] px-[16px] pb-[16px]">
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
    )
  }

  if (view.kind === 'search') {
    return (
      <ProductShelfSearch
        onBack={() => setView({ kind: 'shelf' })}
        onSelect={(item, category) => openProduct(item, category)}
      />
    )
  }

  if (view.kind === 'offers') {
    return (
      <ProductShelfSubPage title={view.title} onBack={() => setView({ kind: 'shelf' })}>
        <div data-products-shelf-offers="true">{renderOffers?.({ showSummary: view.showSummary })}</div>
      </ProductShelfSubPage>
    )
  }

  return (
    <>
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
      {/* The same L1 header the rest of the app uses; search is the only action this page needs. */}
      <ProductsHeader
        title={title}
        gutterClassName="px-[16px]"
        actions={
          <HeaderActionButton
            icon="search"
            label={t('runtime.actions.search', 'Search')}
            onClick={() => setView({ kind: 'search' })}
          />
        }
      />
      <div
        data-products-shelf="true"
        className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-[92px]"
      >
        {/* Partner commerce keeps the page's photographic language but flips the
          card's anatomy: full-bleed photo with the label over a gradient, where a
          product card is photo-above-white-text. Strong enough to be part of the
          experience, unmistakably not a banking product. The heading uses the
          same 24px title as every category below it. */}
        <section className={`px-[16px] ${SHELF_FIRST_SECTION_GAP}`} data-products-shelf-entries="true">
          <h2 className={SHELF_SECTION_TITLE}>{t('runtime.productsMenu.shoppingBenefits', 'Save when you shop')}</h2>
          {/* Wrapping flex rather than a 2-column grid: on a foldable the tiles
            stop growing at 280px instead of stretching to half the screen. */}
          <div className="mt-[12px] flex flex-wrap gap-[12px]">
            {PRODUCT_SHELF_ENTRY_CARDS.map((entry) => (
              <ShelfPartnerTile
                key={entry.id}
                entry={entry}
                onClick={() => setView({
                  kind: 'offers',
                  title: entry.title.replace(/\n/g, ' '),
                  showSummary: entry.id !== 'partner-offers',
                })}
              />
            ))}
          </div>
        </section>

        <section
          className={`flex flex-col gap-[16px] px-[16px] ${SHELF_SECTION_GAP}`}
          data-products-shelf-catalog="true"
        >
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
                onClick={() => setView({ kind: 'category', categoryId: category.id })}
                className="flex w-full items-center gap-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              >
                <h2 className={`min-w-0 flex-1 ${SHELF_SECTION_TITLE}`}>{category.title}</h2>
                <span aria-hidden="true" className={SHELF_CHEVRON_SLOT}>
                  <AppIcon name="chevron-right" size={20} color="var(--uc-text)" />
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
  )
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

/**
 * Search, pinned outside the scroller.
 *
 * Both materials are rendered and cross-faded rather than interpolated, so the
 * icon colour changes as smoothly as the background does and neither state is
 * ever a half-legible blend.
 */

/**
 * Partner programme tile.
 *
 * Same material as the rest of the page — photography — but a different form:
 * the photo runs full-bleed with the label over a gradient, where a product card
 * puts its photo above a white text block. That keeps the commerce zone visually
 * strong and unmistakably not a banking product, without a louder palette.
 */
function ShelfPartnerTile({ entry, onClick }: { entry: ProductShelfEntryCard; onClick: () => void }) {
  const title = entry.title.replace(/\n/g, ' ')

  return (
    <button
      type="button"
      data-products-shelf-entry={entry.id}
      aria-label={`${title}, ${entry.count} offers`}
      onClick={onClick}
      className="relative flex h-[136px] min-w-[150px] max-w-[280px] flex-1 basis-[calc(50%-6px)] items-start overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
    >
      <img
        src={entry.image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        draggable={false}
        data-products-shelf-entry-media
        className="absolute inset-0 size-full origin-bottom-right scale-[1.28] object-cover"
        style={{ objectPosition: entry.imagePosition }}
      />
      {/* Two layers: a light overall knock-down so busy photography stops
          competing, then a hard top scrim, since the copy now reads from the top
          edge down the way the More menu cards do. */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        data-products-shelf-entry-scrim
        style={{ backgroundColor: 'rgb(var(--uc-static-black-rgb) / 0.08)' }}
      />
      <span
        aria-hidden="true"
        data-products-shelf-entry-gradient
        className="absolute inset-x-0 top-0 h-[96px]"
        style={{
          background:
            'linear-gradient(to bottom, rgb(var(--uc-static-black-rgb) / 0.78) 0%, rgb(var(--uc-static-black-rgb) / 0.58) 30%, rgb(var(--uc-static-black-rgb) / 0.24) 64%, transparent 100%)',
        }}
      />
      {/* The More menu's corner badge: a filled quarter-disc in the top-right, not a
          floating pill, so a count reads the same wherever it appears. */}
      <span data-products-shelf-entry-count className="absolute right-0 top-0 z-20 size-[32px]">
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 size-[30px] rounded-bl-[30px] bg-[var(--uc-brand)]"
        />
        <span className="absolute right-[7px] top-[4px] text-[14px] font-bold leading-none text-[var(--uc-static-white)]">
          {entry.count > 99 ? 99 : entry.count}
        </span>
      </span>
      <span className="relative z-10 flex w-full flex-col gap-[3px] p-[12px]">
        <span className="truncate pr-[28px] text-[17px] font-bold leading-[21px] text-[var(--uc-static-white)]">
          {title}
        </span>
        {/* Two lines reserved so both tiles' subtitles end on the same baseline
            whatever their length — and after translation. */}
        <span className="line-clamp-2 min-h-[36px] text-[14px] leading-[18px] text-[var(--uc-static-white)]">
          {entry.subtitle}
        </span>
      </span>
    </button>
  )
}

/** Searches every product in every category, not just the visible carousel. */
function ProductShelfSearch({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect: (item: ProductShelfItem, category: ProductShelfCategory) => void
}) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const matches = normalizedQuery
    ? SEARCHABLE_ITEMS.filter((entry) => entry.haystack.includes(normalizedQuery))
    : SEARCHABLE_ITEMS

  const groups = PRODUCT_SHELF_CATEGORIES.map((category) => ({
    category,
    items: matches.filter((entry) => entry.category.id === category.id).map((entry) => entry.item),
  })).filter((group) => group.items.length > 0)

  return (
    <ProductShelfSubPage title={t('runtime.actions.search', 'Search')} onBack={onBack}>
      <div data-products-shelf-search="true" className="flex flex-col gap-[16px] pb-[16px]">
        {/* Sticky under the header, the same way Account details keeps its search
            reachable while the list scrolls. */}
        <div
          data-products-shelf-search-bar="true"
          className="sticky z-[9] bg-[var(--uc-app-bg)] px-[16px] pb-[10px] pt-[2px]"
          style={{ top: SHELF_STICKY_HEADER_HEIGHT }}
        >
          <div
            className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px]"
            style={SHELF_SEARCH_SURFACE}
          >
            <AccountSearchBar
              value={query}
              onValueChange={setQuery}
              placeholder={t('runtime.productsMenu.searchPlaceholder', 'Search all products')}
              showTrailingAction={false}
            />
          </div>
        </div>
        <p className="px-[16px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {matches.length} {matches.length === 1 ? 'product' : 'products'}
          {normalizedQuery ? ` for “${query.trim()}”` : ' across all categories'}
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
            {t('runtime.productsMenu.noProductsFound', 'No products found')}
          </p>
        ) : null}
      </div>
    </ProductShelfSubPage>
  )
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
function ProductShelfSubPage({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  const { progress, onScroll } = useCollapsingHeader(64)

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
      <div className={`relative z-0 pt-[8px] ${SHELF_CONTENT_WIDTH}`}>{children}</div>
    </div>
  )
}
