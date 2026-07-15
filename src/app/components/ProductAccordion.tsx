/**
 * ProductAccordion Component
 * Multi-product accordion for PreLogin screen
 * Supports 2, 3, or 4 products dynamically based on country
 */

import { useState } from "react";
import type { Product } from "@/app/config/productConfig";
import { AppIcon } from "@/app/components/icons";

/**
 * Separator Line
 */
function SeparatorLine() {
  return (
    <div className="flex justify-center items-center w-[327px] h-px">
      <span className="block h-px w-full bg-[var(--uc-text-subtle)] opacity-40" />
    </div>
  );
}

/**
 * Expanded Product
 */
function ExpandedProduct({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <h2 className="uc-type-l1 text-[var(--uc-static-white)]">
        {product.title}
      </h2>
      <div className="flex flex-col gap-[24px] w-full">
        <p className="uc-type-p1 text-[var(--uc-static-white)]">
          {product.description}
        </p>
        <button className="flex items-center gap-px self-start cursor-pointer hover:opacity-80 transition-opacity">
          <span className="uc-type-n5-strong uppercase text-[var(--uc-static-white)]">
            FIND OUT MORE
          </span>
          <AppIcon name="chevron-link" color="var(--uc-static-white)" />
        </button>
      </div>
    </div>
  );
}

/**
 * Collapsed Product
 */
function CollapsedProduct({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div className="relative w-full">
      <div 
        className="flex items-center gap-[16px] w-full pt-[24px] pb-[24px] cursor-pointer hover:opacity-80 transition-opacity relative"
        onClick={onClick}
      >
        {/* Separator line at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <SeparatorLine />
        </div>
        
        {/* Title */}
        <div className="flex-1">
          <h2 className="uc-type-l1 text-[var(--uc-static-white)]">
            {product.title}
          </h2>
        </div>
        
        {/* Chevron */}
        <div className="shrink-0">
          <AppIcon name="chevron-down" color="var(--uc-static-white)" />
        </div>
      </div>
    </div>
  );
}

/**
 * Main ProductAccordion Component
 */
interface ProductAccordionProps {
  products: Product[];
  productOrder?: number[];
  onProductClick?: (clickedIndex: number) => void;
}

export default function ProductAccordion({ 
  products,
  productOrder: externalProductOrder,
  onProductClick: externalOnProductClick 
}: ProductAccordionProps) {
  // Generate initial order based on number of products
  const initialOrder = Array.from({ length: products.length }, (_, i) => i);
  
  // State: indices of products in display order (first one is expanded)
  const [internalProductOrder, setInternalProductOrder] = useState(initialOrder);
  
  // Use external state if provided, otherwise use internal
  const productOrder = externalProductOrder || internalProductOrder;
  const onProductClick = externalOnProductClick || ((clickedIndex: number) => {
    const positionInOrder = internalProductOrder.indexOf(clickedIndex);
    
    if (positionInOrder === 0) {
      return;
    }

    const newOrder = [...internalProductOrder];
    newOrder.splice(positionInOrder, 1);
    newOrder.unshift(clickedIndex);
    
    setInternalProductOrder(newOrder);
  });

  const handleProductClick = (clickedIndex: number) => {
    onProductClick(clickedIndex);
  };

  const productEntries = productOrder.flatMap((index) => {
    const product = products[index];
    return product ? [{ index, product }] : [];
  });
  const expandedEntry = productEntries[0];

  if (!expandedEntry) {
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-[24px]">
      {/* Expanded Product (first in order) */}
      <ExpandedProduct product={expandedEntry.product} />
      
      {/* Collapsed Products (remaining) - wrapped to maintain gap */}
      <div className="flex flex-col w-full">
        {productEntries.slice(1).map(({ index, product }) => (
          <CollapsedProduct
            key={product.id}
            product={product}
            onClick={() => handleProductClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
