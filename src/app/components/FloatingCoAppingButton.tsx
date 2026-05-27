import svgPaths from "@/imports/svg-18ehkdpg9k";

interface FloatingCoAppingButtonProps {
  onClick: () => void;
  showSlideIn?: boolean;
}

export default function FloatingCoAppingButton({ onClick, showSlideIn = false }: FloatingCoAppingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute right-0 z-[100] cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        top: '432px',
        width: '44px',
        height: '113.013px',
        animation: showSlideIn ? 'fabSlideIn 0.3s ease-out 1.8s both' : 'none'
      }}
      aria-label="Co-apping session active"
    >
      {/* Background Shape - exact din Figma Patch */}
      <svg 
        className="block w-full h-full" 
        fill="none" 
        preserveAspectRatio="none" 
        viewBox="0 0 44 113.013"
      >
        <path 
          d={svgPaths.p2d5f5a80}
          fill="#008574"
        />
      </svg>

      {/* Share Screen Icon - centered in visible area */}
      <div 
        className="absolute"
        style={{
          top: '36.28%',
          right: '4.55%',
          bottom: '35.4%',
          left: '22.73%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg 
          width="24"
          height="24"
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M10.7144 5.15602V7.17729L3.02112 7.1773V18.6312H20.5671V15.3971H22.5917V19.305C22.5917 20.7338 21.4778 21.903 20.0698 21.9943L19.8923 22H0.996582V7.85105C0.996582 6.42161 2.11047 5.25296 3.51849 5.16175L3.69597 5.15602H10.7144ZM22.9966 3V13.1064C21.4809 13.1064 20.252 11.8794 20.252 10.3669V7.67722L14.8147 13.1064L12.8739 11.1686L18.3118 5.7395H15.6185C14.1028 5.7395 12.8739 4.51326 12.8739 3L22.9966 3Z" 
            fill="white"
          />
        </svg>
      </div>

      <style>{`
        @keyframes fabSlideIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
}