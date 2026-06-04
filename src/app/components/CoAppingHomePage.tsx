import { useLanguage } from "@/app/contexts/LanguageContext";
import imgRectangle1 from "figma:asset/6f4a518088433560480f90c7a7448fdc1d294def.png";
import BottomNavigation from "@/app/components/BottomNavigation";
import AmountVisibilityButton from "@/app/components/AmountVisibilityButton";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { PrimeDiamondMark } from "@/app/components/prime/PrimeDiamondMark";
import ProductCard from "@/app/components/ProductCard";
import AccordionSection from "@/app/components/AccordionSection";
import ProductsList from "@/app/components/ProductsList";
import { useProducts } from "@/hooks/useProducts";
import { useDemo } from "@/app/state/demoStore";
import { getCurrencySymbol } from "@/app/registry/countryConfig";
import { maskAmountParts } from "@/app/utils/amountPrivacy";

export default function CoAppingHomePage() {
  const { t } = useLanguage();
  const { categories, getProductIcon, formatProductAmount, getProductDisplayNumber, calculateTotal, calculateTotalAvailable, calculateTotalOwed } = useProducts();
  const { country, amountsHidden, toggleAmountsHidden } = useDemo();

  // Calculate totals for the main card
  const totalAvailable = calculateTotalAvailable();
  const totalOwed = calculateTotalOwed();
  const displayedTotalAvailable = maskAmountParts(totalAvailable, amountsHidden);
  const displayedTotalOwed = maskAmountParts(totalOwed, amountsHidden);
  const currencyCode = getCurrencySymbol(country);

  return (
    <div className="w-full h-full relative bg-[var(--uc-app-bg)] flex flex-col">
      {/* Status Bar Space - 46px + 8px padding - with background for notch visibility */}
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />

      {/* Top Bar - Prime Badge + Icons */}
      <div className="px-[24px] pb-[24px] flex items-center justify-between">
        {/* Prime Badge */}
        <div 
          className="flex items-center gap-[6px]"
          style={{
            padding: '8px 12px',
            borderRadius: '16px',
            background: 'radial-gradient(37.18% 73.78% at 70% 28.98%, color-mix(in srgb, var(--uc-primary-k1) 0%, transparent) 0%, color-mix(in srgb, var(--uc-primary-k1) 20%, transparent) 100%), radial-gradient(61.85% 49.94% at 50.13% 50.06%, color-mix(in srgb, var(--uc-product-blue-deep) 20%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 20%, transparent) 100%), linear-gradient(193deg, var(--uc-product-blue) -32.31%, var(--uc-static-black) 60.01%)',
            backgroundBlendMode: 'soft-light, normal, soft-light, normal'
          }}
        >
          <PrimeDiamondMark color="var(--uc-static-white)" />
          <span 
            className="uc-type-n5-strong text-[var(--uc-static-white)]"
            style={{
              lineHeight: '16px'
            }}
          >
            Prime
          </span>
        </div>

        {/* Top Icons */}
        <HeaderActionRail>
          <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
          <HeaderActionButton icon="profile" label="Profile" />
          <HeaderActionButton icon="messages" label="Messages" />
        </HeaderActionRail>
      </div>

      {/* Title */}
      <div className="px-[24px] pb-[24px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">
          {t('navigation.home')}
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[80px] scrollbar-hide">
        {/* Balance Card with Lighthouse */}
        <div className="px-[24px]">
          <div className="w-full bg-[var(--uc-action-soft-strong)] rounded-[8px] overflow-hidden flex relative">
            {/* Info Section - definește înălțimea cardului */}
            <div className="flex-1 p-[24px] flex flex-col gap-[4px]">
              {/* Total Available */}
              <div className="flex flex-col gap-[4px]">
                <p className="uc-type-n5-strong text-[var(--uc-text)]">{t('home.totalAvailable')}</p>
                <div className="flex items-baseline gap-[2px]">
                  <span className="uc-type-n1 leading-[1] text-[var(--uc-text)]">{displayedTotalAvailable.integer}</span>
                  <span className="uc-type-n2-strong leading-[1] text-[var(--uc-text)]">{displayedTotalAvailable.decimals} {currencyCode}</span>
                </div>
              </div>

              {/* Separator Line */}
              <div className="w-[205px] h-[0.25px] bg-[var(--uc-text)]" />

              {/* Total Owed */}
              <div className="flex flex-col gap-[4px]">
                <p className="uc-type-n5-strong text-[var(--uc-text)]">Total Owed</p>
                <div className="flex items-baseline">
                  <span className="uc-type-n2-strong leading-[1] text-[var(--uc-text)]">{displayedTotalOwed.integer}</span>
                  <span className="uc-type-n5-strong leading-[1] text-[var(--uc-text)]">{displayedTotalOwed.decimals} {currencyCode}</span>
                </div>
              </div>
            </div>

            {/* Lighthouse Image - absolute positioning cu padding top 24px */}
            <div className="absolute top-[24px] right-0 w-[96px]">
              <img 
                src={imgRectangle1} 
                alt="Lighthouse" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Product Categories */}
        {categories.map((category, index) => {
          // Determine if this category should show totals (exclude cards)
          const shouldShowTotal = category.key !== 'cards';
          const totalData = shouldShowTotal && category.products.length >= 2 
            ? calculateTotal(category.products) 
            : undefined;

          return (
            <div key={category.key} className="pt-[24px]">
              <AccordionSection title={category.title} defaultOpen={false}>
                <ProductsList 
                  isOpen={false} 
                  showTotal={shouldShowTotal}
                  totalData={totalData ? maskAmountParts(totalData, amountsHidden) : undefined}
                >
                  {category.products.map((product) => {
                    const formatted = formatProductAmount(product);
                    const displayedAmount = maskAmountParts(formatted, amountsHidden);
                    return (
                      <ProductCard
                        key={product.id}
                        icon={getProductIcon(product)}
                        title={product.name}
                        accountNumber={getProductDisplayNumber(product)}
                        amount={displayedAmount.integer}
                        decimals={displayedAmount.decimals}
                        currency={displayedAmount.currency}
                      />
                    );
                  })}
                </ProductsList>
              </AccordionSection>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-[var(--uc-surface)] border-t border-[var(--uc-border-muted)] flex items-center justify-center">
        <BottomNavigation />
      </div>
    </div>
  );
}
