"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
// import { useRouter } from "next/navigation" // Removed
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { AccountSelectorDrawer, accounts } from "@/components/account-selector-drawer"
import { demoStore } from "../../../src/lib/demoStore"

interface AccountCardProps {
  showAmounts: boolean
  toggleShowAmounts: () => void
  onAccountChange?: (index: number) => void
  isAccountSelectorOpen: boolean
  onOpenAccountSelector: () => void
  onCloseAccountSelector: () => void
}

const carouselItems = [
  ...accounts.map((acc) => ({
    ...acc,
    id: acc.id as number | "all" | "new",
  })),
  {
    id: "all" as const,
    name: "All accounts",
    iban: "",
    balance: "21.183,34",
    currency: "RON",
    flag: "",
    subtitle: "3 accounts",
  },
  {
    id: "new" as const,
    name: "Open a new current account",
    iban: "",
    balance: "",
    currency: "",
    flag: "",
  },
]

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

const quickActions = [
  {
    id: "payment",
    label: "New Payment",
    icon: "/assets/mobile-banking/Payments_K10.svg",
  },
  {
    id: "details",
    label: "Account Details",
    icon: "/assets/mobile-banking/Bank_K10.svg",
  },
  {
    id: "move",
    label: "Move Money",
    icon: "/assets/mobile-banking/Excluded_transactions_K10.svg",
  },
  {
    id: "more",
    label: "More Options",
    icon: "/assets/mobile-banking/Quick_menu_K10.svg",
  },
]

export function AccountCard({
  showAmounts,
  toggleShowAmounts: _toggleShowAmounts,
  onAccountChange,
  isAccountSelectorOpen,
  onOpenAccountSelector,
  onCloseAccountSelector,
}: AccountCardProps) {
  // const router = useRouter() // Removed
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [activeSlideHeight, setActiveSlideHeight] = useState<number>(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const activeSlideRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchCurrentX = useRef(0)
  const touchCurrentY = useRef(0) // Added for vertical scroll tracking
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)

  const currentItem = carouselItems[selectedIndex]
  const prevIndex = (selectedIndex - 1 + carouselItems.length) % carouselItems.length
  const nextIndex = (selectedIndex + 1) % carouselItems.length
  const prevItem = carouselItems[prevIndex]
  const nextItem = carouselItems[nextIndex]

  useEffect(() => {
    if (!activeSlideRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setActiveSlideHeight(entry.contentRect.height)
      }
    })
    observer.observe(activeSlideRef.current)
    return () => observer.disconnect()
  }, [selectedIndex])

  const animateToPosition = useCallback(
    (targetOffset: number, newIndex: number | null, duration = 320) => {
      setIsAnimating(true)
      const startOffset = dragOffset
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)

        const currentOffset = startOffset + (targetOffset - startOffset) * eased
        setDragOffset(currentOffset)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDragOffset(0)
          setIsAnimating(false)
          setDirection(null)
          if (newIndex !== null) {
            setSelectedIndex(newIndex)
            onAccountChange?.(newIndex)
          }
        }
      }

      requestAnimationFrame(animate)
    },
    [dragOffset, onAccountChange],
  )

  // Mouse/Touch gesture handling
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isAnimating) return

      // Don't interfere with clicks on buttons or interactive elements
      const target = e.target as HTMLElement
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        return
      }

      // Capture pointer to track movement even if mouse leaves element
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId)
      }

      touchStartX.current = e.clientX
      touchStartY.current = e.clientY
      touchCurrentX.current = e.clientX
      touchCurrentY.current = e.clientY
      lastTime.current = performance.now()
      velocity.current = 0
      isHorizontalSwipe.current = null
      setIsDragging(true)
    },
    [isAnimating],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || isAnimating) return

      const currentX = e.clientX
      const currentY = e.clientY

      // If we haven't determined direction yet
      if (isHorizontalSwipe.current === null) {
        const diffX = Math.abs(currentX - touchStartX.current)
        const diffY = Math.abs(currentY - touchStartY.current)
        const threshold = 5 // smaller threshold for mouse responsiveness

        if (diffX > threshold || diffY > threshold) {
          isHorizontalSwipe.current = diffX > diffY
        }
      }

      const isHorizontal = isHorizontalSwipe.current

      // Horizontal Swipe (Carousel)
      if (isHorizontal === true) {
        // Prevent default only if we are taking over control
        // e.preventDefault() // Not strictly needed with pointer events usually, but good practice if touch-action not set

        const diffX = currentX - touchStartX.current

        const now = performance.now()
        const dt = now - lastTime.current
        if (dt > 0) {
          velocity.current = (currentX - touchCurrentX.current) / dt
        }
        lastTime.current = now
        touchCurrentX.current = currentX
        touchCurrentY.current = currentY

        setDragOffset(diffX)
        setDirection(diffX > 0 ? "right" : "left")
      }
      // Vertical Scroll (Manual Fallback)
      else if (isHorizontal === false) {
        const dy = currentY - touchCurrentY.current

        // Manually scroll the nearest .demo-viewport
        const viewport = containerRef.current?.closest('.demo-viewport')
        if (viewport) {
          viewport.scrollTop -= dy
        }

        touchCurrentX.current = currentX
        touchCurrentY.current = currentY
      }
    },
    [isDragging, isAnimating],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return

    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId)
    }

    // Check if this was a click (minimal movement) vs a swipe
    const totalMovement = Math.sqrt(
      Math.pow(e.clientX - touchStartX.current, 2) +
      Math.pow(e.clientY - touchStartY.current, 2)
    )
    const clickThreshold = 10 // pixels

    setIsDragging(false)

    // If movement was minimal, treat as click - let onClick handlers work
    if (totalMovement < clickThreshold) {
      setDragOffset(0)
      setDirection(null)
      return
    }

    if (isHorizontalSwipe.current === false || isHorizontalSwipe.current === null) {
      setDragOffset(0)
      setDirection(null)
      return
    }

    const containerWidth = containerRef.current?.offsetWidth || 375
    const threshold = containerWidth * 0.2
    const velocityThreshold = 0.3

    const shouldSwipe = Math.abs(dragOffset) > threshold || Math.abs(velocity.current) > velocityThreshold

    if (shouldSwipe) {
      // If dragged right (positive offset) -> Go to Prev
      // If dragged left (negative offset) -> Go to Next
      if (dragOffset > 0 || velocity.current > velocityThreshold) {
        animateToPosition(containerWidth, prevIndex, 300)
      } else { // dragOffset < 0
        animateToPosition(-containerWidth, nextIndex, 300)
      }
    } else {
      animateToPosition(0, null, 250)
    }
  }, [isDragging, dragOffset, prevIndex, nextIndex, animateToPosition])

  const containerWidth = containerRef.current?.offsetWidth || 375

  const isActivelyMoving = isDragging || (isAnimating && direction !== null)

  const stepperIndicatorStyle = (index: number) => {
    const isActive = selectedIndex === index
    return {
      width: isActive ? "24px" : "12px",
      height: "4px",
      borderRadius: isActive ? "4px" : "2px",
      backgroundColor: isActive ? "#007A91" : "#CCCCCC",
      transition: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
    }
  }

  const handleQuickAction = (actionId: string) => {
    if (actionId === "details") {
      const demo = demoStore.getById("mobile-banking-full");
      if (demo && demo.data) {
        demoStore.update(demo.id, {
          data: {
            ...demo.data,
            currentScreenIndex: 3
          }
        });

        // Dispatch demo-navigate event for Projects Center demo
        const event = new CustomEvent("demo-navigate", { detail: { index: 3 } })
        window.dispatchEvent(event)
      }
    }
  }

  const renderAccountPanel = (item: typeof currentItem, offset: number, isActive: boolean, shouldShow: boolean) => {
    const isAddNew = item.id === "new"
    const isAllAccounts = item.id === "all"
    const balanceParts = item.balance ? item.balance.split(",") : ["0", "00"]
    const integerPart = showAmounts ? balanceParts[0] : "***"
    const decimalPart = showAmounts ? `,${balanceParts[1]}` : ",**"

    const visible = isActive || (shouldShow && isActivelyMoving)

    return (
      <div
        ref={isActive ? activeSlideRef : undefined}
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        style={{
          transform: `translateX(${offset}px)`,
          opacity: visible ? 1 : 0,
          visibility: visible ? "visible" : "hidden",
          pointerEvents: isActive ? "auto" : "none",
          transition: isAnimating ? "none" : undefined,
        }}
      >
        <div className="flex justify-center items-center" style={{ gap: "16px" }}>
          <span
            style={{
              color: "#262626",
              fontFamily: "UniCredit, Inter, sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: "20px",
            }}
          >
            {item.name}
          </span>
          <button
            className="flex justify-center items-center rounded-[18px] bg-[#F5F5F5] cursor-pointer hover:bg-gray-200 transition-colors"
            style={{ width: "36px", height: "36px" }}
            onClick={onOpenAccountSelector}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <img
              src="/assets/mobile-banking/down.svg"
              width={20}
              height={20}
              alt="Select account"
            />
          </button>
        </div>

        {isAddNew ? (
          <div className="flex justify-center items-center w-full" style={{ height: "52px", marginTop: "4px" }}>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#007A91] hover:bg-[#006375] transition-colors text-white rounded-full">
              <Plus className="w-5 h-5" />
              <span className="text-[16px] font-semibold">Open account</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center items-baseline w-full" style={{ height: "52px", marginTop: "4px" }}>
            <span
              style={{
                color: "#262626",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "44px",
                fontWeight: 700,
                lineHeight: "44px",
              }}
            >
              {integerPart}
            </span>
            <span
              style={{
                color: "#262626",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "28px",
                fontWeight: 400,
                lineHeight: "32px",
              }}
            >
              {decimalPart} {item.currency}
            </span>
          </div>
        )}

        {isAllAccounts ? (
          <div className="flex justify-center items-center w-full" style={{ gap: "4px", marginTop: "4px" }}>
            <span
              style={{
                color: "#505050",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "16.8px",
              }}
            >
              {item.subtitle}
            </span>
          </div>
        ) : item.iban ? (
          <div className="flex justify-center items-center w-full" style={{ gap: "4px", marginTop: "4px" }}>
            <span
              style={{
                color: "#505050",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "16.8px",
              }}
            >
              {item.iban}
            </span>
          </div>
        ) : !isAddNew ? (
          <div style={{ marginTop: "4px" }} />
        ) : null}

        <div
          className="flex flex-col justify-center items-center self-stretch w-full"
          style={{ padding: "14px 0", gap: "10px", marginTop: "24px" }}
        >
          <div className="flex items-center" style={{ gap: "2px" }}>
            {carouselItems.map((_, index) => (
              <div key={index} style={stepperIndicatorStyle(index)} />
            ))}
          </div>
        </div>

        <div
          className="flex justify-between items-start self-stretch w-full"
          style={{ marginTop: "24px", marginBottom: "32px", paddingLeft: "16px", paddingRight: "16px" }}
        >
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="flex flex-col items-center"
              style={{ width: "80px", gap: "8px" }}
              onClick={() => handleQuickAction(action.id)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                className="flex justify-center items-center"
                style={{
                  width: "64px",
                  height: "64px",
                  padding: "15px 16px",
                  borderRadius: "98px",
                  background: "#F5F5F5",
                }}
              >
                <img
                  src={action.icon || "/placeholder.svg"}
                  width={24}
                  height={24}
                  alt={action.label}
                  style={{ width: "24px", height: "24px" }}
                />
              </div>
              <span
                style={{
                  color: "#666666",
                  textAlign: "center",
                  fontFamily: "UniCredit, Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "16px",
                }}
              >
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const showPrev = direction === "right"
  const showNext = direction === "left"

  return (
    <div className="bg-white overflow-hidden">
      <div
        ref={containerRef}
        data-swipeable="true"
        className={cn(
          "touch-pan-y overflow-hidden select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "none" }} // Important: Disable browser touch actions to handle everything manually
      >
        <div
          className="relative overflow-hidden w-full"
          style={{
            height: activeSlideHeight > 0 ? `${activeSlideHeight}px` : "auto",
            minHeight: activeSlideHeight > 0 ? undefined : "300px",
            transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {renderAccountPanel(prevItem, dragOffset - containerWidth, false, showPrev)}
          {renderAccountPanel(currentItem, dragOffset, true, true)}
          {renderAccountPanel(nextItem, dragOffset + containerWidth, false, showNext)}
        </div>
      </div>

      <AccountSelectorDrawer
        isOpen={isAccountSelectorOpen}
        onClose={onCloseAccountSelector}
        selectedAccountId={carouselItems[selectedIndex].id}
        onSelectAccount={(id) => {
          const index = carouselItems.findIndex((item) => item.id === id)
          if (index !== -1) {
            const diff = index - selectedIndex
            if (diff !== 0) {
              setDirection(diff > 0 ? "left" : "right")
              animateToPosition(diff > 0 ? -containerWidth : containerWidth, index, 300)
            }
          }
        }}
        showAmounts={showAmounts}
      />
    </div>
  )
}
