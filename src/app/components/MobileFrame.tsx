import { useEffect, useRef, useState, type CSSProperties } from 'react';
import StatusBar, { type PhoneChromeVariant } from '@/app/components/StatusBar';
import DynamicIsland from '@/app/components/DynamicIsland';
import ShareScreenGlow from '@/app/components/ShareScreenGlow';
import { useDevicePreview } from '@/app/components/demo/DevicePreview';

interface MobileFrameProps {
  children: React.ReactNode;
  statusBarVariant?: PhoneChromeVariant;
  overlay?: React.ReactNode;
  isCoAppingActive?: boolean;
}

export const SAFE_AREA_TOP = 70;
export const SAFE_AREA_BOTTOM = 34;

const PHONE_BEZEL = 12;
const PREVIEW_HORIZONTAL_PADDING = 96;
const PREVIEW_VERTICAL_PADDING = 32;
const MIN_PREVIEW_SCALE = 0.5;
const MAX_PREVIEW_SCALE = 1.18;

function getBoundedPreviewScale(width: number, height: number, frameWidth: number, frameHeight: number) {
  if (width <= 0 || height <= 0) {
    return 0.7;
  }

  const availableWidth = Math.max(width - PREVIEW_HORIZONTAL_PADDING, 0);
  const availableHeight = Math.max(height - PREVIEW_VERTICAL_PADDING, 0);
  const fitScale = Math.min(
    availableWidth / frameWidth,
    availableHeight / frameHeight,
  );

  return Math.min(MAX_PREVIEW_SCALE, Math.max(MIN_PREVIEW_SCALE, fitScale));
}

export default function MobileFrame({
  children,
  statusBarVariant = 'dark',
  overlay,
  isCoAppingActive,
}: MobileFrameProps) {
  const { profile, orientation, viewport } = useDevicePreview();
  const phoneFrameWidth = viewport.width + PHONE_BEZEL * 2;
  const phoneFrameHeight = viewport.height + PHONE_BEZEL * 2;
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
        phoneFrameWidth,
        phoneFrameHeight,
      );

      setPreviewScale((currentScale) => (
        Math.abs(currentScale - nextScale) < 0.005 ? currentScale : nextScale
      ));
    };

    applyPreviewScale();

    if (typeof ResizeObserver === 'undefined') return;
    const resizeObserver = new ResizeObserver(applyPreviewScale);
    resizeObserver.observe(previewContainer);

    return () => resizeObserver.disconnect();
  }, [phoneFrameHeight, phoneFrameWidth]);

  return (
    <div
      ref={previewContainerRef}
      className="relative flex h-full min-h-0 w-full justify-center overflow-hidden bg-gradient-to-br from-[var(--uc-app-bg)] via-[var(--uc-surface-muted)] to-[var(--uc-action-soft)] px-6 py-4"
    >
      <div
        className="relative shrink-0"
        style={{
          width: phoneFrameWidth * previewScale,
          height: phoneFrameHeight * previewScale,
        }}
      >
        <div
          className="relative"
          style={{
            width: phoneFrameWidth,
            height: phoneFrameHeight,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="absolute inset-0 bg-[rgb(var(--uc-static-black-rgb)_/_0.2)] blur-3xl transform translate-y-8" />

          <div className="relative bg-[var(--uc-static-black)] rounded-[48px] p-3 shadow-2xl">
            <div
              ref={screenSurfaceRef}
              className="relative overflow-hidden bg-[var(--uc-static-black)]"
              data-phone-screen="true"
              data-testid="device-preview-screen"
              data-device-profile={profile.id}
              data-device-kind={profile.kind}
              data-device-orientation={orientation}
              style={{
                width: viewport.width,
                height: viewport.height,
                borderRadius: profile.kind === 'foldable-main' ? 24 : 36,
                containerType: 'size',
                ...({
                  '--uc-preview-width': `${viewport.width}px`,
                  '--uc-preview-height': `${viewport.height}px`,
                } as CSSProperties),
              }}
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

              {statusBarVariant === 'theme' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 z-[44] h-[76px]"
                  style={{ background: 'var(--uc-phone-system-bar-bg, transparent)' }}
                />
              )}
              <StatusBar variant={statusBarVariant} />
              {profile.screenChrome === 'dynamic-island' ? <DynamicIsland variant={statusBarVariant} /> : null}

              {overlay && (
                <div className="pointer-events-none absolute inset-0 z-[43]">
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
