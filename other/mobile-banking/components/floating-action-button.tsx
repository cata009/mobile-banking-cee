"use client"

import { useState, useEffect, useCallback } from "react"
import { useDevicePreview, DeviceOverlayPortal } from "@/lib/device-preview-context"

interface FloatingActionButtonProps {
  hidden?: boolean
  hideOnBottomSheet?: boolean
}

/**
 * FloatingActionButton - "Operations" FAB for mobile banking
 * 
 * POSITIONING:
 * - When in device preview: portals to the overlay layer (outside scroll container)
 *   so it stays fixed relative to the device viewport
 * - When standalone: uses fixed positioning relative to window
 * 
 * BEHAVIOR:
 * - Starts in expanded state ("Operations" text visible)
 * - Collapses to icon-only after scrolling past threshold
 * - Hidden when any bottom sheet/overlay is open
 */
export function FloatingActionButton({ hidden = false, hideOnBottomSheet = false }: FloatingActionButtonProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { onScroll, isInDevicePreview } = useDevicePreview()

  useEffect(() => {
    const SCROLL_THRESHOLD = 24

    // Use the device preview scroll context if available
    const unsubscribe = onScroll((scrollY) => {
      setIsCollapsed(scrollY > SCROLL_THRESHOLD)
    })

    return unsubscribe
  }, [onScroll])

  const handleClick = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  // Completely hide when overlays are open
  if (hidden || hideOnBottomSheet) {
    return null
  }

  // The FAB content - wrapped in portal when in device preview
  const fabContent = (
    <>
      {/* Operations Drawer (Bottom Sheet) - only when drawer is open */}
      {isDrawerOpen && (
        <div
          className="absolute inset-0 z-[60] pointer-events-auto"
          onClick={() => setIsDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            style={{
              animation: "fadeIn 200ms ease-out",
            }}
          />

          {/* Bottom Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "85vh",
              animation: "slideUp 300ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="rounded-full bg-gray-300" style={{ width: "44px", height: "5px" }} />
            </div>

            {/* Header */}
            <div className="px-4 pb-4 flex items-center justify-between">
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#262626",
                  lineHeight: "32px",
                }}
              >
                Operations
              </h2>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Operations Grid */}
            <div className="px-4 pb-8 grid grid-cols-4 gap-4">
              {[
                {
                  icon: "/assets/mobile-banking/New_Payment.svg",
                  label: "New Payment",
                },
                {
                  icon: "/assets/mobile-banking/Account.svg",
                  label: "Account",
                },
                {
                  icon: "/assets/mobile-banking/Move_Money.svg",
                  label: "Move Money",
                },
                {
                  icon: "/assets/mobile-banking/More_Options.svg",
                  label: "More Options",
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className="flex flex-col items-center gap-2"
                  style={{ minWidth: "64px" }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "#F5F5F5",
                    }}
                  >
                    <img src={item.icon || "/placeholder.svg"} alt={item.label} width={24} height={24} />
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666666",
                      textAlign: "center",
                      lineHeight: "14px",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAB Button - always visible unless drawer is open */}
      {!isDrawerOpen && (
        <button
          type="button"
          onClick={handleClick}
          className="absolute z-50 flex items-center justify-center pointer-events-auto bg-[#007A91] hover:bg-[#006375]"
          style={{
            bottom: "24px",
            right: "16px",
            height: "64px",
            width: isCollapsed ? "64px" : "180px",
            minWidth: "64px",
            padding: isCollapsed ? "20px" : "21px 24px",
            borderRadius: isCollapsed ? "32px" : "120px",
            backdropFilter: "blur(17px)",
            WebkitBackdropFilter: "blur(17px)",
            gap: isCollapsed ? "0px" : "8px",
            transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(0, 122, 145, 0.3)",
            overflow: "hidden",
          }}
        >
          {/* Payments Icon - always visible and centered */}
          <img
            src="/assets/mobile-banking/Payments_White.svg"
            alt="Operations"
            width={24}
            height={24}
            style={{
              flexShrink: 0,
            }}
          />

          <span
            style={{
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: "22px",
              whiteSpace: "nowrap",
              position: isCollapsed ? "absolute" : "relative",
              opacity: isCollapsed ? 0 : 1,
              pointerEvents: isCollapsed ? "none" : "auto",
              transform: isCollapsed ? "translateX(-6px)" : "translateX(0)",
              transition: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Operations
          </span>
        </button>
      )}
    </>
  )

  // In device preview: portal to overlay layer
  // Standalone: render with fixed positioning
  if (isInDevicePreview) {
    return <DeviceOverlayPortal>{fabContent}</DeviceOverlayPortal>
  }

  // Standalone mode - wrap in fixed container
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {fabContent}
    </div>
  )
}
