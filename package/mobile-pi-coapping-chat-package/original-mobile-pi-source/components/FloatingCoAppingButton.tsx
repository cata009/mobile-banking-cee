import { AppIcon } from "@/app/components/icons";
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
          fill="var(--uc-green-bright)"
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
        <AppIcon name="panel-share-screen" color="var(--uc-static-white)" />
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
