import { STACKED_PRODUCT_SHADOW } from '@/app/components/contracts/stackedProductShadow';
export default function StackedProductShadow() {
  return (
    <div className="relative w-full h-[9px] flex justify-center">
      {/* Shadow element - 85% width, centered */}
      <div className="relative w-[85%] h-full">
        {/* Bottom rounded white element */}
        <svg 
          className="absolute top-0 left-0 w-full h-[9px]" 
          viewBox={STACKED_PRODUCT_SHADOW.viewBox}
          fill="none" 
          preserveAspectRatio="none"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d={STACKED_PRODUCT_SHADOW.path}
            fill="var(--uc-surface-raised)"
          />
        </svg>
        
        {/* Top line with opacity */}
        <svg 
          className="absolute top-0 left-0 w-full h-[1px]" 
          viewBox={STACKED_PRODUCT_SHADOW.lineViewBox}
          fill="none" 
          preserveAspectRatio="none"
        >
          <path
            opacity={STACKED_PRODUCT_SHADOW.lineOpacity}
            d={STACKED_PRODUCT_SHADOW.linePath}
            stroke="var(--uc-border-muted)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
