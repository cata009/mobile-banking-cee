/**
 * ProductAccordion Component
 * Multi-product accordion for PreLogin screen
 * Supports 2, 3, or 4 products dynamically based on country
 */

import { useState } from "react";
import type { Product } from "@/app/config/productConfig";

/**
 * Chevron Down Icon (32x32px)
 */
function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M12.1207 13.2901L16.0007 17.1701L19.8807 13.2901C20.2707 12.9001 20.9007 12.9001 21.2907 13.2901C21.6807 13.6801 21.6807 14.3101 21.2907 14.7001L16.7007 19.2901C16.3107 19.6801 15.6807 19.6801 15.2907 19.2901L10.7007 14.7001C10.3107 14.3101 10.3107 13.6801 10.7007 13.2901C11.0907 12.9101 11.7307 12.9001 12.1207 13.2901Z" fill="white"/>
    </svg>
  );
}

/**
 * Chevron Right Icon (32x32px)
 */
function ChevronRightIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.29 19.88L17.17 16L13.29 12.12C12.9 11.73 12.9 11.1 13.29 10.71C13.68 10.32 14.31 10.32 14.7 10.71L19.29 15.3C19.68 15.69 19.68 16.32 19.29 16.71L14.7 21.3C14.31 21.69 13.68 21.69 13.29 21.3C12.91 20.91 12.9 20.27 13.29 19.88Z" fill="white"/>
    </svg>
  );
}

/**
 * Separator Line
 */
function SeparatorLine() {
  return (
    <div className="flex justify-center items-center w-[327px] h-px">
      <svg width="327" height="1" viewBox="0 0 327 1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.510938 0.5H326.489" stroke="#999999" strokeWidth="0.25" strokeLinecap="square"/>
      </svg>
    </div>
  );
}

/**
 * Expanded Product
 */
function ExpandedProduct({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <h2 className="text-white font-['UniCredit'] text-[24px] font-bold leading-[normal] tracking-[0.267px]">
        {product.title}
      </h2>
      <div className="flex flex-col gap-[24px] w-full">
        <p className="text-white font-['UniCredit'] text-[18px] font-normal leading-[normal]">
          {product.description}
        </p>
        <button className="flex items-center gap-px self-start cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-white font-['UniCredit'] text-[14px] font-bold leading-[normal] uppercase">
            FIND OUT MORE
          </span>
          <ChevronRightIcon />
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
          <h2 className="text-white font-['UniCredit'] text-[24px] font-bold leading-[normal] tracking-[0.267px]">
            {product.title}
          </h2>
        </div>
        
        {/* Chevron */}
        <div className="shrink-0">
          <ChevronDownIcon />
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

  return (
    <div className="flex flex-col w-full gap-[24px]">
      {/* Expanded Product (first in order) */}
      <ExpandedProduct product={products[productOrder[0]]} />
      
      {/* Collapsed Products (remaining) - wrapped to maintain gap */}
      <div className="flex flex-col w-full">
        {productOrder.slice(1).map((productIndex) => (
          <CollapsedProduct
            key={products[productIndex].id}
            product={products[productIndex]}
            onClick={() => handleProductClick(productIndex)}
          />
        ))}
      </div>
    </div>
  );
}