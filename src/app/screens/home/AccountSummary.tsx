/**
 * AccountSummary - Balance card with totals and product categories
 */

import imgRectangle1 from "figma:asset/6f4a518088433560480f90c7a7448fdc1d294def.png";
import AccordionSection from "@/app/components/AccordionSection";
import ProductsList from "@/app/components/ProductsList";
import ProductCard from "@/app/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useDemo } from "@/app/state/demoStore";
import { getCurrencySymbol } from "@/app/registry/countryConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { Product } from "@/data/products";

interface AccountSummaryProps {
  showRedesign?: boolean;
  onAccountClick?: (product: Product) => void;
}

export default function AccountSummary({ showRedesign = false, onAccountClick }: AccountSummaryProps) {
  const { 
    categories, 
    getProductIcon, 
    formatProductAmount, 
    getProductDisplayNumber, 
    calculateTotal, 
    calculateTotalAvailable, 
    calculateTotalOwed 
  } = useProducts();
  
  const { t } = useLanguage();
  const { country } = useDemo();

  // Calculate totals for the main card
  const totalAvailable = calculateTotalAvailable();
  const totalOwed = calculateTotalOwed();
  
  // Get currency symbol for display (uses country config)
  const currencyCode = getCurrencySymbol(country);

  return (
    <>
      {/* Balance Card with Lighthouse */}
      <div className="px-[24px]">
        <div className={`w-full rounded-[8px] overflow-hidden flex relative ${
          showRedesign ? 'bg-gradient-to-br from-[#7497C0] to-[#94b1ba]' : 'bg-[#94b1ba]'
        }`}>
          {/* Info Section */}
          <div className="flex-1 p-[24px] flex flex-col gap-[4px]">
            {/* Total Available */}
            <div className="flex flex-col gap-[4px]">
              <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[#262626]">
                {t(showRedesign ? 'home.totalBalance' : 'home.totalAvailable')}
              </p>
              <div className="flex items-baseline gap-[2px]">
                <span className="font-['UniCredit',sans-serif] text-[30px] font-bold text-[#262626] leading-[1]">
                  {totalAvailable.integer}
                </span>
                <span className="font-['UniCredit',sans-serif] text-[20px] font-bold text-[#262626] leading-[1]">
                  {totalAvailable.decimals} {currencyCode}
                </span>
              </div>
            </div>

            {/* Separator Line */}
            <div className="w-[205px] h-[0.25px] bg-[#262626]" />

            {/* Total Owed */}
            <div className="flex flex-col gap-[4px]">
              <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[#262626]">Total Owed</p>
              <div className="flex items-baseline">
                <span className="font-['UniCredit',sans-serif] text-[20px] font-bold text-[#262626] leading-[1]">
                  {totalOwed.integer}
                </span>
                <span className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[#262626] leading-[1]">
                  {totalOwed.decimals} {currencyCode}
                </span>
              </div>
            </div>

            {/* Cards Redesign Extra Info */}
            {showRedesign && (
              <div className="mt-2 pt-2 border-t border-[#262626]/20">
                <p className="text-xs text-[#262626] opacity-75">
                  ✨ Redesigned card layout
                </p>
              </div>
            )}
          </div>

          {/* Lighthouse Image */}
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
      {categories.map((category) => {
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
                totalData={totalData}
              >
                {category.products.map((product) => {
                  const formatted = formatProductAmount(product);
                  return (
                    <ProductCard
                      key={product.id}
                      icon={getProductIcon(product)}
                      title={product.name}
                      accountNumber={getProductDisplayNumber(product)}
                      amount={formatted.integer}
                      decimals={formatted.decimals}
                      currency={formatted.currency}
                      onClick={
                        product.type === "current_account"
                          ? () => onAccountClick?.(product)
                          : undefined
                      }
                    />
                  );
                })}
              </ProductsList>
            </AccordionSection>
          </div>
        );
      })}
    </>
  );
}
