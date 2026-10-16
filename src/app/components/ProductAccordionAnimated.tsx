import { ExpandedProduct, CollapsedProduct } from "./preloginProductViews";
import { accordionEntries, PRELOGIN_ACCORDION_CONTRACT } from "./contracts/preloginAccordion";
/**
 * ProductAccordionAnimated Component
 * Animated wrapper for ProductAccordion with slide up/down transitions
 * Supports 2, 3, or 4 products dynamically
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Product } from "@/app/config/productConfig";

/**
 * Separator Line
 */
interface ProductAccordionAnimatedProps {
  welcomeText: string;
  products: Product[];
  findOutMoreText: string;
  expandedProductId?: string;
}

export default function ProductAccordionAnimated({ welcomeText, products, findOutMoreText, expandedProductId }: ProductAccordionAnimatedProps) {
  // Generate initial order based on number of products
  const initialOrder = Array.from({ length: products.length }, (_, i) => i);
  const [productOrder, setProductOrder] = useState(initialOrder);
  const expandedIndex = products.findIndex((product) => product.id === expandedProductId);

  // Reset product order when products change (e.g., country switch)
  useEffect(() => {
    const newOrder = Array.from({ length: products.length }, (_, i) => i);
    if (expandedIndex > 0) {
      newOrder.splice(expandedIndex, 1);
      newOrder.unshift(expandedIndex);
    }
    setProductOrder(newOrder);
  }, [products.length, expandedIndex]);

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

  // Safety check: resolve only entries whose product still exists.
  const validProductEntries = accordionEntries(products, productOrder);
  const expandedEntry = validProductEntries[0];
  if (!expandedEntry) {
    return null; // Don't render if no valid products
  }

  const currentExpandedId = expandedEntry.product.id;

  return (
    <div className="w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExpandedId}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: PRELOGIN_ACCORDION_CONTRACT.animationDuration,
            ease: [...PRELOGIN_ACCORDION_CONTRACT.easing],
          }}
          className="flex flex-col gap-[24px] w-full"
        >
          {/* Welcome Heading */}
          <h1 className="text-[var(--uc-static-white)] font-['UniCredit'] text-[38px] font-bold leading-[40px] tracking-[0.335px]">
            {welcomeText}
          </h1>
          
          {/* Accordion */}
          <div className="flex flex-col w-full gap-[24px]">
            <ExpandedProduct product={expandedEntry.product} findOutMoreText={findOutMoreText} />
            <div className="flex flex-col w-full">
              {validProductEntries.slice(1).map(({ index, product }) => (
                <CollapsedProduct
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(index)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
