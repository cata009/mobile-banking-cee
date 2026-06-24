import { ReactNode, Children } from 'react';
import StackedProductShadow from '@/app/components/StackedProductShadow';
import TotalRow from '@/app/components/TotalRow';

interface ProductsListProps {
  children: ReactNode;
  isOpen: boolean;
  showTotal?: boolean;
  variant?: 'legacy' | 'evolution';
  productStyle?: 'pi' | 'sme';
  totalData?: {
    integer: string;
    decimals: string;
    currency: string;
  };
}

export default function ProductsList({
  children,
  isOpen,
  showTotal = false,
  variant = 'legacy',
  productStyle = 'pi',
  totalData,
}: ProductsListProps) {
  const childrenArray = Children.toArray(children);
  const productCount = childrenArray.length;
  const isEvolution = variant === 'evolution';

  // If single product, always show it fully (no total shown even if showTotal is true)
  if (productCount === 1) {
    return (
      <div className="px-[24px]">
        {children}
      </div>
    );
  }

  // Multiple products - always show first product
  return (
    <div>
      {/* First product - always visible */}
      <div className="px-[24px]">
        {childrenArray[0]}
      </div>

      <div className="relative">
        <div
          className={`absolute inset-x-0 top-0 transition-all duration-300 ease-in-out ${isOpen ? "pointer-events-none -translate-y-[2px] opacity-0" : "translate-y-0 opacity-100"}`}
          aria-hidden={isOpen}
        >
          <StackedProductShadow />
        </div>

        <div
          className="overflow-hidden px-[24px] transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isOpen ? '2000px' : '0px',
            opacity: isOpen ? 1 : 0,
            paddingTop: isOpen ? (isEvolution ? '0px' : '2px') : '0px',
          }}
          aria-hidden={!isOpen}
        >
          <div className={isEvolution ? "flex flex-col gap-0" : "flex flex-col gap-[2px]"}>
            {childrenArray.slice(1).map((child, index) => (
              <div key={index} className={isEvolution ? "border-t border-[var(--uc-border-muted)]" : undefined}>
                {child}
              </div>
            ))}

            {showTotal && totalData && productCount >= 2 && (
              isEvolution ? (
                <TotalRow
                  variant="evolution"
                  productStyle={productStyle}
                  className="border-t border-[var(--uc-border-muted)]"
                  integer={totalData.integer}
                  decimals={totalData.decimals}
                  currency={totalData.currency}
                />
              ) : (
                <div
                  className="flex flex-col items-end self-stretch bg-[var(--uc-surface)]"
                  style={{
                    padding: '16px',
                    gap: '4px',
                    borderRadius: '0 0 4px 4px'
                  }}
                >
                  <TotalRow
                    integer={totalData.integer}
                    decimals={totalData.decimals}
                    currency={totalData.currency}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
