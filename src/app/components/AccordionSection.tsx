import { Children, cloneElement, isValidElement, useState, type ReactNode } from 'react';
import { AppIcon } from "@/app/components/icons";

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionChildProps {
  children?: ReactNode;
  isOpen?: boolean;
}

export default function AccordionSection({ 
  title, 
  children, 
  defaultOpen = true 
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Count the number of product children by checking the wrapper
  const childrenArray = Children.toArray(children);
  // Check if the child is ProductsList and get its product count
  const firstChild = childrenArray[0];
  let productCount = 0;
  
  if (isValidElement<AccordionChildProps>(firstChild) && firstChild.props.children) {
    const products = Children.toArray(firstChild.props.children);
    productCount = products.length;
  }

  // If only one product, don't show chevron and always show content
  const isSingleProduct = productCount === 1;

  // Clone children and pass isOpen state
  const childrenWithProps = Children.map(children, child => {
    if (isValidElement<AccordionChildProps>(child) && typeof child.type !== 'string') {
      return cloneElement(child, { isOpen });
    }
    return child;
  });

  return (
    <div className="flex flex-col">
      {/* Accordion Header */}
      {isSingleProduct ? (
        // No chevron, no click - just title
        <div
          className="flex items-center justify-between self-stretch"
          style={{
            height: '48px',
            padding: '0 24px'
          }}
        >
          {/* Title */}
          <h2 className="uc-type-l1 text-[var(--uc-text)]">
            {title}
          </h2>
        </div>
      ) : (
        // With chevron and click functionality
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between self-stretch cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            height: '48px',
            padding: '0 24px'
          }}
        >
          {/* Title */}
          <h2 className="uc-type-l1 text-[var(--uc-text)]">
            {title}
          </h2>

          {/* Chevron */}
          <div 
            className="grid place-items-center transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transformOrigin: 'center',
              width: '32px',
              height: '32px'
            }}
          >
            <AppIcon name="chevron-down-wide" color="var(--uc-icon)" />
          </div>
        </button>
      )}

      {/* Content with 8px spacing from header */}
      <div className="pt-[8px]">
        {childrenWithProps}
      </div>
    </div>
  );
}
