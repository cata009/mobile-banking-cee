"use client"

import { useState, useEffect, useRef } from "react"
import { ChipsRow } from "./chips-row"
import { useDevicePreview } from "@/lib/device-preview-context"

const TOP_BAR_HEIGHT = 64
const SCROLL_THRESHOLD = 8
const MIN_SCROLL_FOR_OVERLAY = 80

export function StickyChipsOverlay() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const lastScrollY = useRef(0)
  const scrollDirection = useRef<"up" | "down" | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { onScroll, isInDevicePreview } = useDevicePreview()

  useEffect(() => {
    const unsubscribe = onScroll((currentScrollY) => {
      const scrollDiff = currentScrollY - lastScrollY.current

      // Track scrolling state
      setIsScrolling(true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)

      // Determine scroll direction with threshold
      if (scrollDiff < -SCROLL_THRESHOLD) {
        scrollDirection.current = "up"
      } else if (scrollDiff > SCROLL_THRESHOLD) {
        scrollDirection.current = "down"
      }

      // Show overlay only when:
      // 1) Scrolled past MIN_SCROLL_FOR_OVERLAY
      // 2) Scrolling UP
      if (currentScrollY > MIN_SCROLL_FOR_OVERLAY && scrollDirection.current === "up") {
        setIsVisible(true)
      } else if (scrollDirection.current === "down" || currentScrollY <= MIN_SCROLL_FOR_OVERLAY) {
        setIsVisible(false)
      }

      lastScrollY.current = currentScrollY
    })

    return () => {
      unsubscribe()
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [onScroll])

  const showSeparator = isVisible && isScrolling

  // Use absolute positioning when inside device preview, fixed otherwise
  const positionClass = isInDevicePreview ? "absolute" : "fixed"

  return (
    <div
      className={`${positionClass} z-40 left-0 right-0`}
      style={{
        top: TOP_BAR_HEIGHT,
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: isVisible
          ? "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 250ms cubic-bezier(0.2, 0.8, 0.2, 1)"
          : "transform 200ms ease-in, opacity 200ms ease-in",
      }}
    >
      {/* In device preview, don't need to center - just use full width */}
      <div className={isInDevicePreview ? "w-full" : "flex justify-center"}>
        <div className={isInDevicePreview ? "w-full" : "w-full max-w-[600px] md:max-w-[760px]"}>
          <ChipsRow
            showSeparator={showSeparator}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />
        </div>
      </div>
    </div>
  )
}
