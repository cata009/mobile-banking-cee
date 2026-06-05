/**
 * ProductAccordionAnimated Component
 * Animated wrapper for ProductAccordion with slide up/down transitions
 * Supports 2, 3, or 4 products dynamically
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
function ExpandedProduct({ product, findOutMoreText }: { product: Product; findOutMoreText: string }) {
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
            {findOutMoreText}
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <SeparatorLine />
        </div>
        <div className="flex-1">
          <h2 className="uc-type-l1 text-[var(--uc-static-white)]">
            {product.title}
          </h2>
        </div>
        <div className="shrink-0">
          <AppIcon name="chevron-down" color="var(--uc-static-white)" />
        </div>
      </div>
    </div>
  );
}

interface ProductAccordionAnimatedProps {
  welcomeText: string;
  products: Product[];
  findOutMoreText: string;
}

export default function ProductAccordionAnimated({ welcomeText, products, findOutMoreText }: ProductAccordionAnimatedProps) {
  // Generate initial order based on number of products
  const initialOrder = Array.from({ length: products.length }, (_, i) => i);
  const [productOrder, setProductOrder] = useState(initialOrder);

  // Reset product order when products change (e.g., country switch)
  useEffect(() => {
    const newOrder = Array.from({ length: products.length }, (_, i) => i);
    setProductOrder(newOrder);
  }, [products.length]);

  const handleProductClick = (clickedIndex: number) => {
    const positionInOrder = productOrder.indexOf(clickedIndex);
    
    if (positionInOrder === 0) {
      return;
    }

    const newOrder = [...productOrder];
    newOrder.splice(positionInOrder, 1);
    newOrder.unshift(clickedIndex);
    
    setProductOrder(newOrder);
  };

  // Safety check: ensure productOrder indices are valid
  const validProductOrder = productOrder.filter(index => index < products.length);
  if (validProductOrder.length === 0) {
    return null; // Don't render if no valid products
  }

  const currentExpandedId = products[validProductOrder[0]].id;

  return (
    <div className="w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExpandedId}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: 0.35,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="flex flex-col gap-[24px] w-full"
        >
          {/* Welcome Heading */}
          <h1 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[38px] font-bold leading-[40px] tracking-[0.335px]">
            {welcomeText}
          </h1>
          
          {/* Accordion */}
          <div className="flex flex-col w-full gap-[24px]">
            <ExpandedProduct product={products[validProductOrder[0]]} findOutMoreText={findOutMoreText} />
            <div className="flex flex-col w-full">
              {validProductOrder.slice(1).map((productIndex) => (
                <CollapsedProduct
                  key={products[productIndex].id}
                  product={products[productIndex]}
                  onClick={() => handleProductClick(productIndex)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
