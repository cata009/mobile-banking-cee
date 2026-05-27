"use client"

import { useState, useEffect } from "react"
import { useDevicePreview } from "@/lib/device-preview-context"

interface StickyTopBarProps {
  showAmounts: boolean
  toggleShowAmounts: () => void
  hideOnBottomSheet?: boolean
}

// Fixed height for the top bar - used for positioning sticky elements below it
export const TOP_BAR_HEIGHT = 64

export function StickyTopBar({ showAmounts, toggleShowAmounts, hideOnBottomSheet: _hideOnBottomSheet = false }: StickyTopBarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { onScroll } = useDevicePreview()

  useEffect(() => {
    const unsubscribe = onScroll((scrollY) => {
      setIsScrolled(scrollY > 4)
    })
    return () => unsubscribe()
  }, [onScroll])

  return (
    <div
      className="sticky top-0 z-40 px-4 bg-white"
      style={{
        height: TOP_BAR_HEIGHT,
        // Subtle bottom border when scrolled
        boxShadow: isScrolled ? "0 1px 0 0 #E0E0E0" : "none",
      }}
    >
      <div className="flex h-full justify-between items-center w-full">
        {/* Logo */}
        <img
          src="/assets/mobile-banking/UnicreditBank.svg"
          alt="UniCredit Bank"
          className="h-[24px] w-auto object-contain"
        />

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <div className="flex w-10 h-10 justify-center items-center cursor-pointer hover:bg-gray-50 rounded-full transition-colors">
            <img
              src="/assets/mobile-banking/PFM_K10.svg"
              alt="Analytics"
              className="w-6 h-6"
            />
          </div>

          <div
            className="flex w-10 h-10 justify-center items-center cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
            onClick={toggleShowAmounts}
          >
            {showAmounts ? (
              <img
                src="/assets/mobile-banking/Show_K10.svg"
                alt="Hide amounts"
                className="w-6 h-6"
              />
            ) : (
              <img
                src="/assets/mobile-banking/Hide_K10.svg"
                alt="Show amounts"
                className="w-6 h-6"
              />
            )}
          </div>

          {/* Profile */}
          <img
            src="/assets/mobile-banking/Profile.jpg"
            alt="Profile"
            className="w-10 h-10 cursor-pointer rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
