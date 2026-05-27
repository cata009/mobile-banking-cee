interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export default function BackButton({ onClick, className = '' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-[32px] h-[32px] flex items-center justify-center cursor-pointer ${className}`}
      aria-label="Go back"
    >
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none"
        className="w-full h-full"
      >
        <path 
          d="M20 24L12 16L20 8" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
