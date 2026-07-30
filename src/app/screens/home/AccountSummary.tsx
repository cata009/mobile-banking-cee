/**
 * AccountSummary - Balance card with totals and product categories
 */

import imgRectangle1 from "figma:asset/6f4a518088433560480f90c7a7448fdc1d294def.png";
import AccordionSection from "@/app/components/AccordionSection";
import ProductsList from "@/app/components/ProductsList";
import ProductCard from "@/app/components/ProductCard";
import { AppIcon } from "@/app/components/icons";
import { buildFutureCzAccountCardActions } from "@/app/components/productCardFixtures";
import { useProducts } from "@/hooks/useProducts";
import { useDemo } from "@/app/state/demoStore";
import { getCurrencySymbol } from "@/app/registry/countryConfig";
import { maskAmountParts } from "@/app/utils/amountPrivacy";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { isInvestmentsPortfolioAvailable } from "@/app/utils/investmentsAvailability";
import { isAccountDetailProduct } from "@/data/products";
import { formatAmount } from "@/data/products";
import type { Product } from "@/data/products";

const FUTURE_CZ_INVESTMENT_GOALS_VALUE = 151_241.33;

interface AccountSummaryProps {
  showRedesign?: boolean;
  onAccountClick?: (product: Product) => void;
  onInvestmentsClick?: () => void;
  onInvestmentGoalsClick?: () => void;
  onDomesticPaymentClick?: () => void;
  onAccountInfoClick?: (product: Product) => void;
}

export default function AccountSummary({
  showRedesign = false,
  onAccountClick,
  onInvestmentsClick,
  onInvestmentGoalsClick,
  onDomesticPaymentClick,
  onAccountInfoClick,
}: AccountSummaryProps) {
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
  const { country, amountsHidden, product: selectedProduct, release } = useDemo();
  const investmentsAvailable = isInvestmentsPortfolioAvailable(selectedProduct, country);
  const useFutureProductCards =
    selectedProduct === "PI" &&
    country === "CZ" &&
    release === "release-future-cz-robo";

  // Calculate totals for the main card
  const totalAvailable = calculateTotalAvailable();
  const totalOwed = calculateTotalOwed();
  const displayedTotalAvailable = maskAmountParts(totalAvailable, amountsHidden);
  const displayedTotalOwed = maskAmountParts(totalOwed, amountsHidden);
  
  // Get currency symbol for display (uses country config)
  const currencyCode = getCurrencySymbol(country);

  return (
    <>
      {/* Balance Card with Lighthouse */}
      <div className="px-[24px]">
        <div className={`w-full rounded-[8px] overflow-hidden flex relative ${
          showRedesign ? 'bg-gradient-to-br from-[var(--uc-product-blue)] to-[var(--uc-teal-soft)]' : 'bg-[var(--uc-teal-soft)]'
        }`}>
          {/* Info Section */}
          <div className="flex-1 p-[24px] flex flex-col gap-[4px]">
            {/* Total Available */}
            <div className="flex flex-col gap-[4px]">
              <p className="uc-type-n5-strong text-[var(--uc-text)]">
                {t(showRedesign ? 'home.totalBalance' : 'home.totalAvailable')}
              </p>
              <div className="flex items-baseline gap-[2px]">
                <span className="uc-type-n1 text-[var(--uc-text)] leading-[1]">
                  {displayedTotalAvailable.integer}
                </span>
                <span className="uc-type-n2-strong text-[var(--uc-text)] leading-[1]">
                  {displayedTotalAvailable.decimals} {currencyCode}
                </span>
              </div>
            </div>

            {/* Separator Line */}
            <div className="w-[205px] h-[0.25px] bg-[var(--uc-text)]" />

            {/* Total Owed */}
            <div className="flex flex-col gap-[4px]">
              <p className="uc-type-n5-strong text-[var(--uc-text)]">Total Owed</p>
              <div className="flex items-baseline">
                <span className="uc-type-n2-strong text-[var(--uc-text)] leading-[1]">
                  {displayedTotalOwed.integer}
                </span>
                <span className="uc-type-n5-strong text-[var(--uc-text)] leading-[1]">
                  {displayedTotalOwed.decimals} {currencyCode}
                </span>
              </div>
            </div>

            {/* Cards Redesign Extra Info */}
            {showRedesign && (
              <div className="mt-2 pt-2 border-t border-[var(--uc-text)]/20">
                <p className="text-xs text-[var(--uc-text)] opacity-75">
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
        const isFutureInvestmentCategory =
          useFutureProductCards &&
          category.key === "investments" &&
          category.products.length > 0;
        const renderedProductCount = category.products.length + (isFutureInvestmentCategory ? 1 : 0);
        const hasEvolutionTotal =
          useFutureProductCards &&
          shouldShowTotal &&
          renderedProductCount >= 2;
        const totalData = shouldShowTotal && renderedProductCount >= 2
          ? isFutureInvestmentCategory
            ? formatAmount(
                category.products.reduce((sum, product) => sum + product.balance, FUTURE_CZ_INVESTMENT_GOALS_VALUE),
                "CZK",
              )
            : calculateTotal(category.products)
          : undefined;

        return (
          <div key={category.key} className="pt-[24px]">
            <AccordionSection
              title={category.title}
              defaultOpen={false}
              titleClassName={useFutureProductCards ? "text-[20px] font-bold leading-[24px]" : undefined}
            >
              <ProductsList 
                isOpen={false} 
                showTotal={shouldShowTotal}
                variant={useFutureProductCards ? "evolution" : "legacy"}
                productStyle="pi"
                totalData={totalData ? maskAmountParts(totalData, amountsHidden) : undefined}
                totalLabel={isFutureInvestmentCategory ? "Total investments" : undefined}
              >
                {category.products.map((product, productIndex) => {
                  const formatted = formatProductAmount(product);
                  const displayedAmount = maskAmountParts(formatted, amountsHidden);
                  const accountActions =
                    useFutureProductCards && product.type === "current_account"
                      ? buildFutureCzAccountCardActions({
                          onNewPayment: onDomesticPaymentClick,
                          onAccountInfo: () => onAccountInfoClick?.(product),
                        })
                      : undefined;
                  const stackRole =
                    renderedProductCount === 1
                      ? "single"
                      : productIndex === 0
                        ? "first"
                        : productIndex === renderedProductCount - 1 && !hasEvolutionTotal
                          ? "last"
                          : "middle";
                  return (
                    <ProductCard
                      key={product.id}
                      icon={getProductIcon(product)}
                      title={isFutureInvestmentCategory ? "Security Portfolio" : product.name}
                      accountNumber={getProductDisplayNumber(product)}
                      amount={displayedAmount.integer}
                      decimals={displayedAmount.decimals}
                      currency={displayedAmount.currency}
                      variant={useFutureProductCards ? "evolution" : "legacy"}
                      productStyle="pi"
                      stackRole={stackRole}
                      actions={accountActions}
                      onClick={
                        product.type === "investment_account" && investmentsAvailable
                          ? onInvestmentsClick
                          : isAccountDetailProduct(product) || product.type === "debit_card" || product.type === "credit_card"
                          ? () => onAccountClick?.(product)
                          : undefined
                      }
                    />
                  );
                })}
                {isFutureInvestmentCategory ? (
                  <ProductCard
                    key="future-cz-investment-goals"
                    icon={<AppIcon name="investment-goals-product" size={32} />}
                    title="Investment goals"
                    accountNumber=""
                    amount="151 241"
                    decimals=".33"
                    currency="CZK"
                    variant="evolution"
                    productStyle="pi"
                    stackRole={hasEvolutionTotal ? "middle" : "last"}
                    onClick={onInvestmentGoalsClick}
                  />
                ) : null}
              </ProductsList>
            </AccordionSection>
          </div>
        );
      })}
    </>
  );
}
