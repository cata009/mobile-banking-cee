import { type CSSProperties, useEffect, useRef, useState } from 'react';
import ShareScreenGlow from '@/app/components/ShareScreenGlow';

interface FramelessDeviceFrameProps {
  children: React.ReactNode;
  statusBarVariant?: 'light' | 'dark' | 'theme';
  overlay?: React.ReactNode;
  isCoAppingActive?: boolean;
}

/** The app is authored at a logical 375px width. */
const FRAME_WIDTH = 375;
const FRAMELESS_TOP_RESERVE = 12;

/**
 * FramelessDeviceFrame
 *
 * Renders the exact same app surface as MobileFrame, but WITHOUT the phone
 * bezel and scaled to fill the real device viewport — so opening a shared link
 * on a phone feels like entering the country's app directly rather than looking
 * at a simulated phone in a frame.
 *
 * The 375px-wide surface is scaled up to the viewport width and its logical
 * height is derived so the scaled result fills the viewport height exactly
 * (edge to edge, any aspect ratio).
 */
export default function FramelessDeviceFrame({
  children,
  overlay,
  isCoAppingActive,
}: FramelessDeviceFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [surface, setSurface] = useState({ scale: 1, logicalHeight: 812 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applySurface = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;

      const scale = width / FRAME_WIDTH;
      const logicalHeight = height / scale;

      setSurface((prev) =>
        Math.abs(prev.scale - scale) < 0.001 && Math.abs(prev.logicalHeight - logicalHeight) < 0.5
          ? prev
          : { scale, logicalHeight },
      );
    };

    applySurface();

    const resizeObserver = new ResizeObserver(applySurface);
    resizeObserver.observe(container);
    // Orientation changes and dynamic-viewport (dvh) shifts on mobile browsers.
    window.addEventListener('resize', applySurface);
    window.addEventListener('orientationchange', applySurface);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', applySurface);
      window.removeEventListener('orientationchange', applySurface);
    };
  }, []);

  useEffect(() => {
    const previousOverscroll = document.documentElement.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = 'none';

    const hideBrowserChrome = () => {
      if (window.scrollY === 0) {
        window.scrollTo(0, 1);
      }
    };

    window.requestAnimationFrame(hideBrowserChrome);
    window.setTimeout(hideBrowserChrome, 250);

    return () => {
      document.documentElement.style.overscrollBehaviorY = previousOverscroll;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[calc(100dvh+1px)] w-screen overflow-hidden bg-[var(--uc-app-bg)]"
    >
      <div
        className="relative overflow-hidden bg-[var(--uc-app-bg)]"
        style={{
          width: FRAME_WIDTH,
          height: surface.logicalHeight,
          transform: `scale(${surface.scale})`,
          transformOrigin: 'top left',
          ['--uc-phone-top-reserve' as string]: `${FRAMELESS_TOP_RESERVE}px`,
        } as CSSProperties}
        data-phone-screen="true"
      >
        <div
          className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
          data-phone-scroll="true"
          style={{
            zIndex: 0,
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {children}
        </div>

        {/* Native device/browser chrome owns the top system area in QR mode. */}
        {overlay && <div className="absolute inset-0 z-[100]">{overlay}</div>}

        {isCoAppingActive && <ShareScreenGlow />}
      </div>
    </div>
  );
}
