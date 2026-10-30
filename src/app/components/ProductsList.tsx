import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import StackedProductShadow from '@/app/components/StackedProductShadow';
import TotalRow from '@/app/components/TotalRow';
import ProductCard from '@/app/components/ProductCard';
import {
  resolveProductListStackRole,
  resolveProductsList,
} from '@/app/components/contracts/productsList';
import type { ProductCardStackRole } from '@/app/components/contracts/productCard';

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
  totalLabel?: string;
}

export default function ProductsList({
  children,
  isOpen,
  showTotal = false,
  variant = 'legacy',
  productStyle = 'pi',
  totalData,
  totalLabel,
}: ProductsListProps) {
  const childrenArray = Children.toArray(children);
  const productCount = childrenArray.length;
  const state = resolveProductsList({ productCount, isOpen, variant, showTotal, hasTotalData: Boolean(totalData) });
  const isEvolution = state.evolution;
  const isProductCardStack =
    productCount > 1 &&
    childrenArray.every(child => isValidElement(child) && child.type === ProductCard);
  const hasTotal = state.showTotal && Boolean(totalData);
  const withStackRole = (child: ReactNode, productIndex: number) => {
    if (!isValidElement<{ stackRole?: ProductCardStackRole }>(child) || child.type !== ProductCard) {
      return child;
    }
    return cloneElement(child, {
      stackRole: resolveProductListStackRole({
        productIndex,
        productCount,
        isOpen,
        hasTotal,
      }),
    });
  };

  // If single product, always show it fully (no total shown even if showTotal is true)
  if (state.single) {
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
        {withStackRole(childrenArray[0], 0)}
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
            maxHeight: `${state.maxHeight}px`,
            opacity: state.opacity,
            paddingTop: `${isProductCardStack || isEvolution ? 0 : state.paddingTop}px`,
          }}
          aria-hidden={!isOpen}
        >
          <div className={isEvolution || isProductCardStack ? "flex flex-col gap-0" : "flex flex-col gap-[2px]"}>
            {childrenArray.slice(1).map((child, index) => (
              <div
                key={index}
                className={
                  isProductCardStack
                    ? 'border-t-[0.5px] border-[var(--uc-border-muted)]'
                    : isEvolution
                      ? 'border-t border-[var(--uc-border-muted)]'
                      : undefined
                }
              >
                {withStackRole(child, index + 1)}
              </div>
            ))}

            {state.showTotal && totalData && (
              isEvolution ? (
                <TotalRow
                  variant="evolution"
                  productStyle={productStyle}
                  className="border-t border-[var(--uc-border-muted)]"
                  integer={totalData.integer}
                  decimals={totalData.decimals}
                  currency={totalData.currency}
                  label={totalLabel}
                />
              ) : (
                <div
                  className="flex flex-col items-end self-stretch bg-[var(--uc-surface)]"
                  style={{
                    padding: '16px',
                    gap: '4px',
                    borderRadius: '0 0 4px 4px',
                    ...(isProductCardStack
                      ? { borderTop: '0.5px solid var(--uc-border-muted)' }
                      : {}),
                  }}
                >
                  <TotalRow
                    integer={totalData.integer}
                    decimals={totalData.decimals}
                    currency={totalData.currency}
                    label={totalLabel}
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
