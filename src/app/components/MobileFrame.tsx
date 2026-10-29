import { useEffect, useRef, useState, type CSSProperties } from 'react'
import StatusBar, { type PhoneChromeVariant } from '@/app/components/StatusBar'
import DynamicIsland from '@/app/components/DynamicIsland'
import ShareScreenGlow from '@/app/components/ShareScreenGlow'
import { useDevicePreview } from '@/app/components/demo/DevicePreview'
import { DuoSystemStrip } from '@/app/components/demo/DuoSystemStrip'
import { duoPreviewViewport, resolveDuoContent } from '@/features/demo-native/duoPreview'

interface MobileFrameProps {
  authoringWidth?: 375 | 393
  children: React.ReactNode
  statusBarVariant?: PhoneChromeVariant
  overlay?: React.ReactNode
  isCoAppingActive?: boolean
}

export const SAFE_AREA_TOP = 70
export const SAFE_AREA_BOTTOM = 34

const PHONE_BEZEL = 12
/**
 * The app is authored at a logical 375px width — the Figma canvas (375x812).
 * A phone profile is a *bigger pane of glass*, not a wider canvas, so its screen
 * scales that canvas up instead of reflowing it: a 375px-wide component in Figma
 * lands on the phone at the proportion it was drawn at.
 *
 * Foldables are the exception — their whole point is the wider adaptive layout,
 * so they keep rendering fluid at their own logical width.
 */
const AUTHORING_WIDTH = 375
const PREVIEW_HORIZONTAL_PADDING = 96
const PREVIEW_VERTICAL_PADDING = 32
const MIN_PREVIEW_SCALE = 0.1
const MAX_PREVIEW_SCALE = 1.18

function getBoundedPreviewScale(width: number, height: number, frameWidth: number, frameHeight: number) {
  if (width <= 0 || height <= 0) {
    return 0.7
  }

  const availableWidth = Math.max(width - PREVIEW_HORIZONTAL_PADDING, 0)
  const availableHeight = Math.max(height - PREVIEW_VERTICAL_PADDING, 0)
  const fitScale = Math.min(availableWidth / frameWidth, availableHeight / frameHeight)

  return Math.min(MAX_PREVIEW_SCALE, Math.max(MIN_PREVIEW_SCALE, fitScale))
}

export default function MobileFrame({
  authoringWidth = AUTHORING_WIDTH,
  children,
  statusBarVariant = 'dark',
  overlay,
  isCoAppingActive,
}: MobileFrameProps) {
  const { profile, orientation, viewport } = useDevicePreview()
  const duoGeometry = duoPreviewViewport(profile.id, viewport)
  const duo = !!duoGeometry
  const duoCover = duo && profile.kind === 'foldable-cover'
  const duoPortrait = duo && !duoCover && viewport.height > viewport.width
  const duoFallbackFrame = duoGeometry && !duoCover ? resolveDuoContent(duoGeometry, 'home') : undefined
  const frameRadius = duoCover ? '8px 56px 56px 8px' : '48px'
  const glassRadius = duoCover ? '3px 44px 44px 3px' : duo ? 36 : profile.kind === 'foldable-main' ? 24 : 36
  const phoneFrameWidth = viewport.width + PHONE_BEZEL * 2
  const phoneFrameHeight = viewport.height + PHONE_BEZEL * 2
  const usesAuthoringCanvas = profile.kind === 'phone'
  const contentScale = usesAuthoringCanvas ? viewport.width / authoringWidth : 1
  const contentWidth = usesAuthoringCanvas ? authoringWidth : viewport.width
  const contentHeight = viewport.height / contentScale
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const screenSurfaceRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.7)

  useEffect(() => {
    const previewContainer = previewContainerRef.current
    if (!previewContainer) return

    const applyPreviewScale = () => {
      const nextScale = getBoundedPreviewScale(
        previewContainer.clientWidth,
        previewContainer.clientHeight,
        phoneFrameWidth,
        phoneFrameHeight,
      )

      setPreviewScale((currentScale) => (Math.abs(currentScale - nextScale) < 0.005 ? currentScale : nextScale))
    }

    applyPreviewScale()

    if (typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(applyPreviewScale)
    resizeObserver.observe(previewContainer)

    return () => resizeObserver.disconnect()
  }, [phoneFrameHeight, phoneFrameWidth])

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

          {duoCover && (
            <div
              data-duo-folded-layer
              aria-hidden="true"
              className="pointer-events-none absolute bg-[#6d706e]"
              style={{
                inset: '-2px 3px -2px -5px',
                borderRadius: '8px 56px 56px 8px',
                boxShadow: 'inset 1px 0 0 #d8d8d3, inset 3px 0 0 #393b3b',
              }}
            />
          )}
          <div
            className="relative bg-[var(--uc-static-black)] rounded-[48px] p-3 shadow-2xl"
            data-duo-hardware={duo ? (duoCover ? 'closed' : 'open') : undefined}
            style={{
              borderRadius: frameRadius,
              ...(duo
                ? {
                    background: '#17191b',
                    boxShadow:
                      '0 24px 50px #0003, inset 0 0 0 1px #b8bab5, inset 0 0 0 3px #5c5e5b, inset 0 0 0 5px #242626',
                  }
                : {}),
            }}
          >
            <div
              ref={screenSurfaceRef}
              className="relative overflow-hidden bg-[var(--uc-static-black)]"
              data-phone-screen="true"
              data-testid="device-preview-screen"
              data-device-profile={profile.id}
              data-device-kind={profile.kind}
              data-device-orientation={orientation}
              data-device-rotation-enabled={profile.supportsRotation ? 'true' : 'false'}
              data-device-duo={duo ? 'true' : undefined}
              style={{
                width: viewport.width,
                height: viewport.height,
                borderRadius: glassRadius,
                // Fallback experiences may render only inside the Duo safe width.
                // Paint the exposed system region with a contrasting theme surface.
                ...(duo
                  ? { backgroundColor: statusBarVariant === 'dark' ? 'var(--uc-static-black)' : 'var(--uc-app-bg)' }
                  : {}),
              }}
            >
              {duo && (
                <style>{`[data-device-duo="true"] [data-phone-scroll="true"]:not(:has([data-duo-geometry="true"])) { right: var(--uc-duo-right-inset, 84px); } [data-device-duo="true"][data-device-kind="foldable-main"] [data-phone-scroll="true"]:not(:has([data-duo-geometry="true"])) { left: var(--uc-duo-fallback-left); right: auto; width: var(--uc-duo-fallback-width); }`}</style>
              )}
              <div
                className="absolute left-0 top-0 origin-top-left"
                data-phone-canvas="true"
                style={{
                  width: contentWidth,
                  height: contentHeight,
                  transform: contentScale === 1 ? undefined : `scale(${contentScale})`,
                  containerType: 'size',
                  ...({
                    '--uc-preview-width': `${contentWidth}px`,
                    '--uc-preview-height': `${contentHeight}px`,
                    '--uc-duo-right-inset': `${duoGeometry?.rightInset ?? 0}px`,
                    ...(duoFallbackFrame
                      ? {
                          '--uc-duo-fallback-left': `${duoFallbackFrame.left}px`,
                          '--uc-duo-fallback-width': `${duoFallbackFrame.width}px`,
                        }
                      : {}),
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

                {!duo && statusBarVariant === 'theme' && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-[44] h-[76px]"
                    style={{ background: 'var(--uc-phone-system-bar-bg, transparent)' }}
                  />
                )}
                {duo && duoGeometry?.rightInset ? (
                  <DuoSystemStrip variant={statusBarVariant} cover={profile.kind === 'foldable-cover'} />
                ) : (
                  <StatusBar variant={statusBarVariant} edgeAligned={duoPortrait} />
                )}
                {profile.screenChrome === 'dynamic-island' ? <DynamicIsland variant={statusBarVariant} /> : null}

                {overlay && <div className="pointer-events-none absolute inset-0 z-[43]">{overlay}</div>}

                {isCoAppingActive && <ShareScreenGlow />}
              </div>
            </div>

            {!duo && (
              <>
                <div className="absolute left-[-3px] top-[80px] w-[3px] h-[28px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-r-sm" />
                <div className="absolute left-[-3px] top-[120px] w-[3px] h-[56px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-r-sm" />
                <div className="absolute left-[-3px] top-[190px] w-[3px] h-[56px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-r-sm" />
                <div className="absolute right-[-3px] top-[150px] w-[3px] h-[88px] bg-[rgb(var(--uc-static-black-rgb)_/_0.4)] rounded-l-sm" />
              </>
            )}
            {duo && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute flex gap-3"
                style={duoPortrait ? { right: -3, top: '12%', flexDirection: 'column' } : { top: -3, right: '12%' }}
              >
                <div
                  className="rounded bg-[#777b77]"
                  style={{ width: duoPortrait ? 3 : 34, height: duoPortrait ? 34 : 3 }}
                />
                <div
                  className="rounded bg-[#777b77]"
                  style={{ width: duoPortrait ? 3 : 54, height: duoPortrait ? 54 : 3 }}
                />
              </div>
            )}
            {duo && !duoCover && (
              <>
                <div
                  data-duo-hinge
                  aria-hidden="true"
                  data-duo-fold-axis={duoPortrait ? 'horizontal' : 'vertical'}
                  className="pointer-events-none absolute rounded bg-[#666b66]"
                  style={
                    duoPortrait
                      ? { left: -1, top: '50%', width: 4, height: 20, transform: 'translateY(-50%)' }
                      : { left: '50%', top: -1, width: 20, height: 4, transform: 'translateX(-50%)' }
                  }
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded bg-[#666b66]"
                  style={
                    duoPortrait
                      ? { right: 0, top: '50%', width: 3, height: 20, transform: 'translateY(-50%)' }
                      : { left: '50%', bottom: 0, width: 20, height: 3, transform: 'translateX(-50%)' }
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
