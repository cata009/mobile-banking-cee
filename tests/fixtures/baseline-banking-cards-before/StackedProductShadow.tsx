export default function StackedProductShadow() {
  return (
    <div className="relative w-full h-[9px] flex justify-center">
      {/* Shadow element - 85% width, centered */}
      <div className="relative w-[85%] h-full">
        {/* Bottom rounded white element */}
        <svg 
          className="absolute top-0 left-0 w-full h-[9px]" 
          viewBox="0 0 319 9" 
          fill="none" 
          preserveAspectRatio="none"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M0 0H319V5C319 7.20914 317.209 9 315 9H4C1.79086 9 0 7.20914 0 5V0Z" 
            fill="var(--uc-surface-raised)"
          />
        </svg>
        
        {/* Top line with opacity */}
        <svg 
          className="absolute top-0 left-0 w-full h-[1px]" 
          viewBox="0 0 319 1" 
          fill="none" 
          preserveAspectRatio="none"
        >
          <path
            opacity="0.296317"
            d="M0 0.5H319"
            stroke="var(--uc-border-muted)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
