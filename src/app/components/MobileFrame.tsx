import { useEffect, useRef, useState } from 'react';
import StatusBar from '@/app/components/StatusBar';
import DynamicIsland from '@/app/components/DynamicIsland';
import ShareScreenGlow from '@/app/components/ShareScreenGlow';

interface MobileFrameProps {
  children: React.ReactNode;
  statusBarVariant?: 'light' | 'dark';
  overlay?: React.ReactNode;
  isCoAppingActive?: boolean;
}

export const SAFE_AREA_TOP = 70;
export const SAFE_AREA_BOTTOM = 34;

const SCREEN_WIDTH = 375;
const SCREEN_HEIGHT = 812;
const PHONE_BEZEL = 12;
const PHONE_FRAME_WIDTH = SCREEN_WIDTH + PHONE_BEZEL * 2;
const PHONE_FRAME_HEIGHT = SCREEN_HEIGHT + PHONE_BEZEL * 2;
const PREVIEW_HORIZONTAL_PADDING = 96;
const PREVIEW_VERTICAL_PADDING = 32;
const MIN_PREVIEW_SCALE = 0.5;
const MAX_PREVIEW_SCALE = 1.18;

function getBoundedPreviewScale(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return 0.7;
  }

  const availableWidth = Math.max(width - PREVIEW_HORIZONTAL_PADDING, 0);
  const availableHeight = Math.max(height - PREVIEW_VERTICAL_PADDING, 0);
  const fitScale = Math.min(
    availableWidth / PHONE_FRAME_WIDTH,
    availableHeight / PHONE_FRAME_HEIGHT,
  );

  return Math.min(MAX_PREVIEW_SCALE, Math.max(MIN_PREVIEW_SCALE, fitScale));
}

export default function MobileFrame({
  children,
  statusBarVariant = 'dark',
  overlay,
  isCoAppingActive,
}: MobileFrameProps) {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const screenSurfaceRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.7);

  useEffect(() => {
    const previewContainer = previewContainerRef.current;
    if (!previewContainer) return;

    const applyPreviewScale = () => {
      const nextScale = getBoundedPreviewScale(
        previewContainer.clientWidth,
        previewContainer.clientHeight,
      );

      setPreviewScale((currentScale) => (
        Math.abs(currentScale - nextScale) < 0.005 ? currentScale : nextScale
      ));
    };

    applyPreviewScale();

    const resizeObserver = new ResizeObserver(applyPreviewScale);
    resizeObserver.observe(previewContainer);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={previewContainerRef}
      className="relative flex h-full min-h-0 w-full justify-center overflow-hidden bg-gradient-to-br from-[var(--uc-app-bg)] via-[var(--uc-surface-muted)] to-[var(--uc-action-soft)] px-6 py-4"
    >
      <div
        className="relative shrink-0"
        style={{
          width: PHONE_FRAME_WIDTH * previewScale,
          height: PHONE_FRAME_HEIGHT * previewScale,
        }}
      >
        <div
          className="relative"
          style={{
            width: PHONE_FRAME_WIDTH,
            height: PHONE_FRAME_HEIGHT,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.2)] blur-3xl transform translate-y-8" />

          <div className="relative bg-[var(--uc-static-black)] rounded-[48px] p-3 shadow-2xl">
            <div
              ref={screenSurfaceRef}
              className="relative rounded-[36px] overflow-hidden w-[375px] h-[812px] bg-[var(--uc-static-black)]"
              data-phone-screen="true"
            >
              <div
                ref={scrollContainerRef}
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

              <StatusBar variant={statusBarVariant} />
              <DynamicIsland variant={statusBarVariant} />

              {overlay && (
                <div className="absolute inset-0 z-[100]">
                  {overlay}
                </div>
              )}

              {isCoAppingActive && (
                <ShareScreenGlow />
              )}
            </div>

            <div className="absolute left-[-3px] top-[80px] w-[3px] h-[28px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-r-sm" />
            <div className="absolute left-[-3px] top-[120px] w-[3px] h-[56px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-r-sm" />
            <div className="absolute left-[-3px] top-[190px] w-[3px] h-[56px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-r-sm" />
            <div className="absolute right-[-3px] top-[150px] w-[3px] h-[88px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-l-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
