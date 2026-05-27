import { useState, ReactNode, Children, isValidElement, cloneElement, ReactElement } from 'react';

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
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
  
  if (isValidElement(firstChild) && firstChild.props && firstChild.props.children) {
    const products = Children.toArray(firstChild.props.children);
    productCount = products.length;
  }

  // If only one product, don't show chevron and always show content
  const isSingleProduct = productCount === 1;

  // Clone children and pass isOpen state
  const childrenWithProps = Children.map(children, child => {
    if (isValidElement(child)) {
      return cloneElement(child as ReactElement<any>, { isOpen });
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
          <h2 
            className="font-['UniCredit',sans-serif] font-bold"
            style={{
              color: '#262626',
              fontSize: '24px',
              lineHeight: 'normal'
            }}
          >
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
          <h2 
            className="font-['UniCredit',sans-serif] font-bold"
            style={{
              color: '#262626',
              fontSize: '24px',
              lineHeight: 'normal'
            }}
          >
            {title}
          </h2>

          {/* Chevron */}
          <div 
            className="transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              width: '32px',
              height: '32px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M23 12.6759C22.0651 11.7747 20.5478 11.7747 19.612 12.6759L16 15.9391L12.388 12.6759C11.4522 11.7747 9.93578 11.7747 9 12.6759L16 19L23 12.6759Z" fill="#262626"/>
            </svg>
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