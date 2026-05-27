import { ReactNode, Children } from 'react';
import StackedProductShadow from '@/app/components/StackedProductShadow';
import TotalRow from '@/app/components/TotalRow';

interface ProductsListProps {
  children: ReactNode;
  isOpen: boolean;
  showTotal?: boolean;
  totalData?: {
    integer: string;
    decimals: string;
    currency: string;
  };
}

export default function ProductsList({ children, isOpen, showTotal = false, totalData }: ProductsListProps) {
  const childrenArray = Children.toArray(children);
  const productCount = childrenArray.length;

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

      {/* Conditional rendering based on state */}
      {!isOpen ? (
        // Collapsed state - show shadow
        <StackedProductShadow />
      ) : (
        // Expanded state - show remaining products with animation
        <div 
          className="overflow-hidden transition-all duration-300 ease-in-out px-[24px]"
          style={{
            maxHeight: isOpen ? '2000px' : '0px',
            opacity: isOpen ? 1 : 0
          }}
        >
          <div className="flex flex-col gap-[2px] pt-[2px]">
            {childrenArray.slice(1)}
            
            {/* Show Total if enabled and we have 2+ products */}
            {showTotal && totalData && productCount >= 2 && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
