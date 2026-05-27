"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDevicePreview } from "@/lib/device-preview-context"
import {
  getMobileChipButtonClassName,
  getMobileChipLabelClassName,
} from "./mobile-chip-styles"

// Fixed height for the chips row
export const CHIPS_ROW_HEIGHT = 70

interface ChipsRowProps {
  className?: string
  style?: React.CSSProperties
  showSeparator?: boolean
}

export function ChipsRow({ className = "", style = {}, showSeparator }: ChipsRowProps) {
  const [activeChip, setActiveChip] = useState<"accounts" | "cards" | "savings" | "loans" | "investments">("accounts")
  const [isScrolled, setIsScrolled] = useState(false)
  const { onScroll } = useDevicePreview()
  const shouldShowSeparator = showSeparator ?? isScrolled

  // Show bottom border when content is scrolled
  useEffect(() => {
    const unsubscribe = onScroll((scrollY) => {
      // Show separator when scrolled past the chips row position
      setIsScrolled(scrollY > CHIPS_ROW_HEIGHT)
    })
    return () => unsubscribe()
  }, [onScroll])

  const chips = [
    { id: "accounts" as const, label: "Accounts" },
    { id: "cards" as const, label: "Cards" },
    { id: "savings" as const, label: "Savings" },
    { id: "loans" as const, label: "Loans" },
    { id: "investments" as const, label: "Investments" },
  ]

  return (
    <div
      className={`bg-white ${className}`}
      style={{
        boxShadow: shouldShowSeparator ? "0 1px 0 0 #E0E0E0" : "none",
        ...style,
      }}
    >
      <div
        className="flex items-center gap-1 overflow-x-auto px-4"
        style={{
          paddingTop: "12px",
          paddingBottom: "12px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {chips.map((chip) => {
          const isActive = activeChip === chip.id
          return (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
              className={getMobileChipButtonClassName(isActive)}
            >
              <span
                className={getMobileChipLabelClassName(isActive)}
              >
                {chip.label}
              </span>
              {isActive && (
                <svg width="4" height="4" className="mt-[2px]">
                  <circle cx="2" cy="2" r="2" fill="white" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
