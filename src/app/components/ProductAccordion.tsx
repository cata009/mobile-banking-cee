import { ExpandedProduct, CollapsedProduct } from "./preloginProductViews";
import { accordionEntries } from "./contracts/preloginAccordion";
/**
 * ProductAccordion Component
 * Multi-product accordion for PreLogin screen
 * Supports 2, 3, or 4 products dynamically based on country
 */

import { useState } from "react";
import type { Product } from "@/app/config/productConfig";

/**
 * Separator Line
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

  const productEntries = accordionEntries(products, productOrder);
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
