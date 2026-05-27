"use client"

import { useDevicePreview } from "@/lib/device-preview-context"

type Props = {
  /** show when any overlay (transaction details / search / bottom sheet) is open */
  visible: boolean
  /** z-index should sit ABOVE the background page but BELOW the sheet */
  zIndex?: number
}

/**
 * StatusBarScrim - Revolut-style dark scrim over the notch/status bar area
 * When a sheet/overlay is open, this darkens the status bar area for better contrast
 * 
 * IMPORTANT: Uses absolute positioning when inside DeviceFrame preview,
 * and fixed positioning when running standalone.
 */
export function StatusBarScrim({ visible, zIndex = 70 }: Props) {
  const { isInDevicePreview } = useDevicePreview()
  
  // Use absolute when in device preview (relative to the sheet container)
  // Use fixed when running standalone (relative to viewport)
  const positionClass = isInDevicePreview ? "absolute" : "fixed"
  
  // In device preview, the height should cover the notch area (59px for iPhone)
  // Standalone uses env(safe-area-inset-top) for actual device
  const heightStyle = isInDevicePreview 
    ? "59px" // iPhone notch height
    : "calc(env(safe-area-inset-top) + 18px)"

  return (
    <div
      aria-hidden="true"
      className={[
        `pointer-events-none ${positionClass} left-0 right-0 top-0`,
        "transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        height: heightStyle,
        zIndex,
        // Revolut-like dark-to-transparent scrim
        background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.20) 60%, rgba(0,0,0,0.00))",
      }}
    />
  )
}
