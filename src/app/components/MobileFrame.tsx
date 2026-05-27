import { useRef } from 'react';
import StatusBar from '@/app/components/StatusBar';
import DynamicIsland from '@/app/components/DynamicIsland';
import ShareScreenGlow from '@/app/components/ShareScreenGlow';

interface MobileFrameProps {
  children: React.ReactNode;
  statusBarVariant?: 'light' | 'dark';
  overlay?: React.ReactNode; // NEW: Overlay portal pentru modals și overlays
  isCoAppingActive?: boolean; // NEW: Pentru share screen glow effect
}

// iPhone 16 Pro Max Safe Area Constants
// Status bar height: ~62px (21px top padding + 22px content + 19px bottom padding)
// Gap între status bar și conținut: 8px
// Total safe area top: 70px
export const SAFE_AREA_TOP = 70; // px - folosește acest spacing pentru toate componentele
export const SAFE_AREA_BOTTOM = 34; // px - pentru home indicator

export default function MobileFrame({ 
  children, 
  statusBarVariant = 'dark',
  overlay,
  isCoAppingActive
}: MobileFrameProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex justify-center py-4">
      {/* Mobile Phone Frame */}
      <div 
        className="relative"
        style={{
          // Scale mai agresiv: lasă mai mult spațiu pentru telefon
          // 160px = Figma header (~50px) + Demo header (~90px) + padding minim (20px)
          transform: 'scale(min(1, calc((100vh - 160px) / 850px)))',
          transformOrigin: 'top center', // Scalează de sus, nu de centru!
        }}
      >
        {/* Phone Shadow */}
        <div className="absolute inset-0 bg-black/20 blur-3xl transform translate-y-8" />
        
        {/* Phone Container */}
        <div className="relative bg-black rounded-[48px] p-3 shadow-2xl">
          {/* Screen Container - iPhone 16 Pro Max dimensions */}
          <div className="relative rounded-[36px] overflow-hidden w-[375px] h-[812px] bg-black">
            
            {/* ==================== Content Layer (z-0) - FĂRĂ PADDING ==================== */}
            <div
              ref={scrollContainerRef}
              className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
              style={{
                zIndex: 0,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>

            {/* ==================== Status Bar Overlay (z-50) ==================== */}
            <StatusBar variant={statusBarVariant} />
            
            {/* ==================== Dynamic Island Overlay (z-50) ==================== */}
            <DynamicIsland variant={statusBarVariant} />
            
            {/* ==================== Overlay Portal Layer (z-[100]) ==================== */}
            {/* Pentru modals, overlays, și alte componente care trebuie să apară peste tot */}
            {overlay && (
              <div className="absolute inset-0 z-[100]">
                {overlay}
              </div>
            )}
            
            {/* ==================== Share Screen Glow Effect (z-[101]) ==================== */}
            {isCoAppingActive && (
              <ShareScreenGlow />
            )}
          </div>
          
          {/* Phone Hardware Buttons */}
          {/* Silent Switch (stânga sus) */}
          <div className="absolute left-[-3px] top-[80px] w-[3px] h-[28px] bg-black/40 rounded-r-sm" />
          
          {/* Volume Buttons (stânga) */}
          <div className="absolute left-[-3px] top-[120px] w-[3px] h-[56px] bg-black/40 rounded-r-sm" />
          <div className="absolute left-[-3px] top-[190px] w-[3px] h-[56px] bg-black/40 rounded-r-sm" />
          
          {/* Power Button (dreapta) */}
          <div className="absolute right-[-3px] top-[150px] w-[3px] h-[88px] bg-black/40 rounded-l-sm" />
        </div>
      </div>
    </div>
  );
}