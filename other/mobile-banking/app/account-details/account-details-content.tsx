"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { accounts } from "../../components/account-selector-drawer"
import {
  generateAccountDetailsTransactions,
  getAvailableMonths,
  groupTransactionsByMonthAndDay,
  type AccountDetailsTransaction,
  type MonthGroup,
} from "../../lib/account-details-data"
import { formatAmount } from "../../lib/transactions-data"
import { PfmIcon, getCategoryColor } from "../../components/pfm-icon"
import { TransactionDetailsSheet } from "../../components/transaction-details-sheet"
import { TransactionSearchSheet } from "../../components/transaction-search-sheet"
import type { Transaction } from "../../lib/transactions-data"

// Figma-style separator
function FigmaSeparator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft: "-16px",
        marginRight: "-16px",
        width: "calc(100% + 32px)",
      }}
    >
      {/* Left notch */}
      <svg width="6" height="16" viewBox="0 0 6 16" fill="none" style={{ flexShrink: 0 }}>
        <mask id="mask_left" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="6" height="16">
          <rect width="6" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask_left)">
          <path
            d="M4.14269 5.18005C5.24301 6.57891 5.28676 8.5365 4.25002 9.98311L-2.74873 19.7488C-5.01364 22.9092 -10 21.3069 -10 17.4187L-10 -1.24459C-10 -5.04222 -5.20392 -6.70247 -2.85605 -3.71758L4.14269 5.18005Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
      {/* Dashed line */}
      <svg style={{ flex: 1, height: "1px" }} preserveAspectRatio="none">
        <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#CCCCCC" strokeDasharray="2 4" />
      </svg>
      {/* Right notch */}
      <svg width="6" height="16" viewBox="0 0 6 16" fill="none" style={{ flexShrink: 0, transform: "scaleX(-1)" }}>
        <mask
          id="mask_right"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="6"
          height="16"
        >
          <rect width="6" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask_right)">
          <path
            d="M4.14269 5.18005C5.24301 6.57891 5.28676 8.5365 4.25002 9.98311L-2.74873 19.7488C-5.01364 22.9092 -10 21.3069 -10 17.4187L-10 -1.24459C-10 -5.04222 -5.20392 -6.70247 -2.85605 -3.71758L4.14269 5.18005Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  )
}

// Quick action buttons for account details
const quickActions = [
  {
    id: "payment",
    label: "New Payment",
    icon: "/assets/mobile-banking/Payments_K10.svg",
  },
  {
    id: "settings",
    label: "Account Settings",
    icon: "/assets/mobile-banking/Settings_K10.svg",
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

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

// Carousel items - same as homepage
const carouselItems = accounts.filter((acc) => typeof acc.id === "number")

export default function AccountDetailsContent() {
  const _router = useRouter()
  const searchParams = useSearchParams()
  const initialIndex = Number.parseInt(searchParams.get("account") || "0", 10)
  const focusTransactions = searchParams.get("focus") === "transactions"

  const [accountIndex, setAccountIndex] = useState(initialIndex)
  const [showAmounts, _setShowAmounts] = useState(true)
  const [transactions, setTransactions] = useState<AccountDetailsTransaction[]>([])
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([])
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [activeMonth, setActiveMonth] = useState<string>("")
  const [showStickyMonths, setShowStickyMonths] = useState(focusTransactions)
  const [showSearchBar, setShowSearchBar] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false) // Added state for isDragging

  const [dragOffset, setDragOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)

  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const isScrolling = useRef(false)
  const firstTransactionRef = useRef<HTMLDivElement | null>(null)
  const transactionsSectionRef = useRef<HTMLDivElement | null>(null)
  const chipsContainerRef = useRef<HTMLDivElement>(null)

  const swipeContainerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchCurrentX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const isHorizontalSwipe = useRef<boolean | null>(null)

  useEffect(() => {
    const txns = generateAccountDetailsTransactions(accountIndex)
    setTransactions(txns)
    const groups = groupTransactionsByMonthAndDay(txns)
    setMonthGroups(groups)
    const months = getAvailableMonths(txns)
    setAvailableMonths(months)
    if (months.length > 0) {
      setActiveMonth(months[months.length - 1])
    }
  }, [accountIndex])

  useEffect(() => {
    if (!firstTransactionRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyMonths(!entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: "-120px 0px 0px 0px", // Header (64px) + chips height (~56px)
        threshold: 0,
      },
    )

    observer.observe(firstTransactionRef.current)

    return () => observer.disconnect()
  }, [monthGroups])

  useEffect(() => {
    if (!activeMonth || !chipsContainerRef.current) return

    const container = chipsContainerRef.current
    const activeChip = container.querySelector(`[data-month-key="${activeMonth}"]`) as HTMLElement

    if (activeChip) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        activeChip.scrollIntoView({
          behavior: "smooth",
          inline: "end",
          block: "nearest",
        })
      })
    }
  }, [activeMonth, availableMonths])

  useEffect(() => {
    if (focusTransactions && transactionsSectionRef.current) {
      // Small delay to ensure layout is complete
      const timeoutId = setTimeout(() => {
        if (transactionsSectionRef.current) {
          const topOffset = 120 // Account for sticky header + month chips
          const elementPosition = transactionsSectionRef.current.getBoundingClientRect().top + window.scrollY
          window.scrollTo({
            top: elementPosition - topOffset,
            behavior: "smooth",
          })
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [focusTransactions, monthGroups])

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
          setSwipeDirection(null)
          if (newIndex !== null) {
            setAccountIndex(newIndex)
          }
        }
      }

      requestAnimationFrame(animate)
    },
    [dragOffset],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return

      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchCurrentX.current = e.touches[0].clientX
      lastTime.current = performance.now()
      velocity.current = 0
      isHorizontalSwipe.current = null
      setIsDragging(true) // Set isDragging to true
    },
    [isAnimating],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || isAnimating) return // Check isDragging

      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const diffX = currentX - touchStartX.current
      const diffY = currentY - touchStartY.current

      // Determine swipe direction after 10-15px threshold
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(diffX) > 12 || Math.abs(diffY) > 12) {
          isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY)
        }
      }

      // If vertical scroll, don't interfere
      if (isHorizontalSwipe.current === false) {
        return
      }

      // If horizontal swipe, prevent default scroll
      if (isHorizontalSwipe.current) {
        e.preventDefault()
      }

      const now = performance.now()
      const dt = now - lastTime.current
      if (dt > 0) {
        velocity.current = (currentX - touchCurrentX.current) / dt
      }
      lastTime.current = now
      touchCurrentX.current = currentX

      setDragOffset(diffX)
      setSwipeDirection(diffX > 0 ? "right" : "left")
    },
    [isDragging, isAnimating], // Include isDragging in dependencies
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return // Check isDragging
    setIsDragging(false) // Set isDragging to false

    if (isHorizontalSwipe.current === false || isHorizontalSwipe.current === null) {
      setDragOffset(0)
      setSwipeDirection(null)
      return
    }

    const containerWidth = swipeContainerRef.current?.offsetWidth || 375
    const threshold = containerWidth * 0.2
    const velocityThreshold = 0.3

    const shouldSwipe = Math.abs(dragOffset) > threshold || Math.abs(velocity.current) > velocityThreshold

    const prevIndex = (accountIndex - 1 + carouselItems.length) % carouselItems.length
    const nextIndex = (accountIndex + 1) % carouselItems.length

    if (shouldSwipe) {
      if (dragOffset > 0 || velocity.current > velocityThreshold) {
        animateToPosition(containerWidth, prevIndex, 300)
      } else {
        animateToPosition(-containerWidth, nextIndex, 300)
      }
    } else {
      animateToPosition(0, null, 250)
    }
  }, [isDragging, dragOffset, accountIndex, animateToPosition]) // Include isDragging in dependencies

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    lastScrollY.current = scrollY

    if (!isScrolling.current) {
      isScrolling.current = true
      setShowSearchBar(false)
    }

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false
      setShowSearchBar(true)
    }, 200)

    monthRefs.current.forEach((element, month) => {
      const rect = element.getBoundingClientRect()
      if (rect.top < 200 && rect.bottom > 0) {
        setActiveMonth(month)
      }
    })
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const scrollToMonth = (month: string) => {
    const element = monthRefs.current.get(month)
    if (element) {
      const topOffset = 120
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - topOffset,
        behavior: "smooth",
      })
    }
  }

  const handleTransactionClick = (transaction: AccountDetailsTransaction) => {
    setSelectedTransaction(transaction as Transaction)
    setIsDetailsSheetOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsSheetOpen(false)
    setTimeout(() => setSelectedTransaction(null), 400)
  }

  const handleOpenSearch = () => {
    setIsSearchSheetOpen(true)
  }

  const handleCloseSearch = () => {
    setIsSearchSheetOpen(false)
  }

  const handleSearchTransactionSelect = (transaction: AccountDetailsTransaction) => {
    // Close search sheet first
    setIsSearchSheetOpen(false)
    // Then open transaction details
    setTimeout(() => {
      setSelectedTransaction(transaction as Transaction)
      setIsDetailsSheetOpen(true)
    }, 400)
  }

  const copyIban = async () => {
    const account = carouselItems[accountIndex]
    if (account.iban) {
      await navigator.clipboard.writeText(account.iban)
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    }
  }

  const currentAccount = carouselItems[accountIndex]
  const prevIndex = (accountIndex - 1 + carouselItems.length) % carouselItems.length
  const nextIndex = (accountIndex + 1) % carouselItems.length
  const prevAccount = carouselItems[prevIndex]
  const nextAccount = carouselItems[nextIndex]

  const containerWidth = swipeContainerRef.current?.offsetWidth || 375
  const isActivelyMoving = isDragging || (isAnimating && swipeDirection !== null)
  const showPrev = swipeDirection === "right"
  const showNext = swipeDirection === "left"

  const formatTimeOnly = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const formatDailyTotal = (amount: number, _currency: string): { sign: string; integer: string; decimal: string } => {
    const abs = Math.abs(amount)
    const sign = amount >= 0 ? "+" : "−"
    const integerPart = Math.floor(abs)
    const decimalPart = Math.round((abs - integerPart) * 100)
      .toString()
      .padStart(2, "0")
    const formattedInteger = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return {
      sign,
      integer: formattedInteger,
      decimal: `,${decimalPart}`,
    }
  }

  const formatChipLabel = (monthString: string): string => {
    const [monthName, yearStr] = monthString.split(" ")
    const year = Number.parseInt(yearStr)
    const currentYear = new Date().getFullYear()
    if (year === currentYear) {
      return monthName // Current year: just "January", "February", etc.
    }
    return monthString // Past years: "December 2025", "November 2025", etc.
  }

  const renderAccountSummary = (
    account: typeof currentAccount,
    offset: number,
    isActive: boolean,
    shouldShow: boolean,
  ) => {
    const isAddNew = account.id === "new"
    const isAllAccounts = account.id === "all"
    const balanceParts = account.balance ? account.balance.split(",") : ["0", "00"]
    const integerPart = showAmounts ? balanceParts[0] : "***"
    const decimalPart = showAmounts ? `,${balanceParts[1]}` : ",**"

    const visible = isActive || (shouldShow && isActivelyMoving)

    return (
      <div
        className="absolute inset-x-0 top-0"
        style={{
          transform: `translateX(${offset}px)`,
          opacity: visible ? 1 : 0,
          visibility: visible ? "visible" : "hidden",
          pointerEvents: isActive ? "auto" : "none",
          transition: isAnimating ? "none" : undefined,
        }}
      >
        <h1
          style={{
            color: "#262626",
            fontFamily: "UniCredit, Inter, sans-serif",
            fontSize: "28px",
            fontWeight: 700,
            lineHeight: "32px",
            marginBottom: "8px",
          }}
        >
          {account.name}
        </h1>

        {account.iban && (
          <div className="flex items-center" style={{ gap: "8px", marginBottom: "24px" }}>
            <span
              style={{
                color: "#666666",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "18px",
              }}
            >
              {account.iban}
            </span>
            <button onClick={copyIban} className="flex items-center justify-center" style={{ padding: "4px" }}>
              <img
                src="/assets/mobile-banking/Copy_K10.svg"
                width={20}
                height={20}
                alt="Copy IBAN"
              />
            </button>
          </div>
        )}

        {isAllAccounts && (
          <div style={{ marginBottom: "24px" }}>
            <span
              style={{
                color: "#666666",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "18px",
              }}
            >
              {account.subtitle}
            </span>
          </div>
        )}

        {!isAddNew && (
          <>
            <p
              style={{
                color: "#666666",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "18px",
                marginBottom: "4px",
              }}
            >
              Available balance
            </p>

            {account.balance && (
              <div className="flex items-baseline">
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
                  {decimalPart} {account.currency}
                </span>
              </div>
            )}
          </>
        )}

        {isAddNew && (
          <div className="flex justify-center items-center" style={{ height: "52px", marginTop: "4px" }}>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#007A91] text-white rounded-full">
              <Plus className="w-5 h-5" />
              <span className="text-[16px] font-semibold">Open account</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[600px] md:max-w-[760px] min-h-screen bg-white pb-28 relative">
        <header
          className="sticky top-0 z-50 bg-white"
          style={{
            padding: "12px 16px",
          }}
        >
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                // Navigate back to Home screen (index 0) within the demo
                const event = new CustomEvent("demo-navigate", { detail: { index: 0 } })
                window.dispatchEvent(event)
              }}
              className="flex items-center justify-center"
              style={{ width: "40px", height: "40px", padding: "8px" }}
            >
              <img
                src="/assets/mobile-banking/Back_K10.svg"
                width={24}
                height={24}
                alt="Back"
              />
            </button>
            <button
              className="flex items-center justify-center"
              style={{ width: "40px", height: "40px", padding: "8px" }}
            >
              <img
                src="/assets/mobile-banking/FAQ_K10.svg"
                width={24}
                height={24}
                alt="Help"
              />
            </button>
          </div>
        </header>

        <div
          className="sticky z-40 bg-white"
          style={{
            top: "64px",
            transform: showStickyMonths ? "translateY(0)" : "translateY(-12px)",
            opacity: showStickyMonths ? 1 : 0,
            pointerEvents: showStickyMonths ? "auto" : "none",
            transition: "transform 250ms ease-out, opacity 250ms ease-out",
            borderBottom: showStickyMonths ? "1px solid #E0E0E0" : "none",
          }}
        >
          <div
            ref={chipsContainerRef}
            className="flex gap-1 overflow-x-auto"
            style={{
              padding: "12px 16px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {availableMonths.map((month) => {
              const isActive = month === activeMonth
              return (
                <button
                  key={month}
                  data-month-key={month}
                  onClick={() => scrollToMonth(month)}
                  className="flex-shrink-0 flex flex-col items-center justify-end"
                  style={{
                    height: "46px",
                    padding: isActive ? "12px 12px 8px 12px" : "12px 12px 14px 12px",
                    borderRadius: "120px",
                    backgroundColor: isActive ? "#007A91" : "transparent",
                    transition: "all 200ms ease-out",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "UniCredit, Inter, sans-serif",
                      fontSize: "18px",
                      fontWeight: isActive ? 500 : 400,
                      lineHeight: "20px",
                      color: isActive ? "#FFFFFF" : "#666666",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatChipLabel(month)}
                  </span>
                  {isActive && (
                    <div
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        marginTop: "4px",
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-4">
          <div
            ref={swipeContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden"
            style={{
              // No shadow on active/pressed states
              WebkitTapHighlightColor: "transparent",
              minHeight: "160px",
            }}
          >
            {renderAccountSummary(prevAccount, dragOffset - containerWidth, false, showPrev)}
            {renderAccountSummary(currentAccount, dragOffset, true, true)}
            {renderAccountSummary(nextAccount, dragOffset + containerWidth, false, showNext)}
          </div>

          {/* Stepper indicator */}
          <div
            className="flex justify-center items-center"
            style={{ gap: "2px", marginTop: "24px", marginBottom: "24px" }}
          >
            {carouselItems.map((_, index) => (
              <div
                key={index}
                style={{
                  width: accountIndex === index ? "24px" : "12px",
                  height: "4px",
                  borderRadius: accountIndex === index ? "4px" : "2px",
                  backgroundColor: accountIndex === index ? "#007A91" : "#CCCCCC",
                  transition: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            ))}
          </div>

          <div className="flex justify-between items-start" style={{ marginBottom: "32px" }}>
            {quickActions.map((action) => (
              <button key={action.id} className="flex flex-col items-center" style={{ width: "80px", gap: "8px" }}>
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
                  <img src={action.icon || "/placeholder.svg"} width={24} height={24} alt={action.label} />
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

        {/* Transactions Section - add ref for scroll-to-transactions */}
        <div ref={transactionsSectionRef} className="px-4" style={{ paddingTop: "16px" }}>
          {monthGroups.map((monthGroup, monthIdx) => (
            <div
              key={monthGroup.month}
              ref={(el) => {
                if (el) monthRefs.current.set(monthGroup.month, el)
              }}
            >
              {monthGroup.days.map((dayGroup, dayIdx) => {
                const showDailyTotal =
                  dayGroup.transactions.length >= 2 ||
                  (dayGroup.transactions.some((t) => t.amount >= 0) && dayGroup.transactions.some((t) => t.amount < 0))

                const currency = dayGroup.transactions[0]?.currency || "RON"
                const dailyFormatted = formatDailyTotal(dayGroup.dailyTotal, currency)

                const isFirstDayGroup = monthIdx === 0 && dayIdx === 0

                return (
                  <div key={dayGroup.dayKey} style={{ marginBottom: "16px" }}>
                    {isFirstDayGroup && (
                      <div ref={firstTransactionRef} style={{ height: "1px", marginBottom: "-1px" }} />
                    )}
                    <div className="flex justify-between items-center" style={{ marginBottom: "16px" }}>
                      <span
                        style={{
                          color: "#262626",
                          fontFamily: "UniCredit, Inter, sans-serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          lineHeight: "22px",
                        }}
                      >
                        {dayGroup.dayKey}
                      </span>
                      {showDailyTotal && (
                        <div className="flex items-baseline">
                          <span
                            style={{
                              color: dayGroup.dailyTotal >= 0 ? "#3D7D43" : "#262626",
                              fontFamily: "UniCredit, sans-serif",
                              fontSize: "16px",
                              fontWeight: 700,
                              lineHeight: "normal",
                            }}
                          >
                            {dailyFormatted.integer}
                          </span>
                          <span
                            style={{
                              color: dayGroup.dailyTotal >= 0 ? "#3D7D43" : "#262626",
                              fontFamily: "UniCredit, sans-serif",
                              fontSize: "14px",
                              fontWeight: 400,
                              lineHeight: "normal",
                            }}
                          >
                            {dailyFormatted.decimal} {currency}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        backgroundColor: "#F5F5F5",
                      }}
                    >
                      {dayGroup.transactions.map((transaction, txIdx) => {
                        const { integer, decimal } = formatAmount(transaction.amount)
                        const amountColor = transaction.amount >= 0 ? "#3D7D43" : "#262626"
                        const circleColor = getCategoryColor(transaction.pfmCategory)
                        const isLast = txIdx === dayGroup.transactions.length - 1

                        return (
                          <div key={transaction.id}>
                            <button
                              onClick={() => handleTransactionClick(transaction)}
                              className="flex justify-between items-start w-full text-left"
                              style={{ padding: 0, gap: "8px", background: "none", border: "none", cursor: "pointer" }}
                            >
                              <div className="flex items-start" style={{ gap: "8px", flex: 1, minWidth: 0 }}>
                                <div
                                  className="flex justify-center items-center flex-shrink-0"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "120px",
                                    backgroundColor: circleColor,
                                  }}
                                >
                                  <PfmIcon
                                    category={transaction.pfmCategory}
                                    fallbackInitial={transaction.name.charAt(0).toUpperCase()}
                                  />
                                </div>
                                <div className="flex flex-col" style={{ gap: "4px", minWidth: 0, flex: 1 }}>
                                  <p
                                    style={{
                                      color: "#262626",
                                      fontFamily: "UniCredit, sans-serif",
                                      fontSize: "16px",
                                      fontWeight: 700,
                                      lineHeight: "18px",
                                      textAlign: "left",
                                    }}
                                  >
                                    {transaction.name}
                                  </p>
                                  {transaction.description1 && (
                                    <p
                                      style={{
                                        color: "#191B1B",
                                        fontFamily: "UniCredit, sans-serif",
                                        fontSize: "14px",
                                        fontWeight: 400,
                                        lineHeight: "20px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {transaction.description1}
                                    </p>
                                  )}
                                  <p
                                    style={{
                                      color: "#191B1B",
                                      fontFamily: "UniCredit, sans-serif",
                                      fontSize: "14px",
                                      fontWeight: 400,
                                      lineHeight: "20px",
                                      textAlign: "left",
                                    }}
                                  >
                                    {formatTimeOnly(transaction.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-baseline flex-shrink-0">
                                {showAmounts ? (
                                  <>
                                    <span
                                      style={{
                                        color: amountColor,
                                        fontFamily: "UniCredit, sans-serif",
                                        fontSize: "18px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {integer}
                                    </span>
                                    <span
                                      style={{
                                        color: amountColor,
                                        fontFamily: "UniCredit, sans-serif",
                                        fontSize: "14px",
                                        fontWeight: 400,
                                      }}
                                    >
                                      {decimal} {transaction.currency}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      style={{
                                        color: amountColor,
                                        fontFamily: "UniCredit, sans-serif",
                                        fontSize: "18px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {transaction.amount >= 0 ? "+***" : "−***"}
                                    </span>
                                    <span
                                      style={{
                                        color: amountColor,
                                        fontFamily: "UniCredit, sans-serif",
                                        fontSize: "14px",
                                        fontWeight: 400,
                                      }}
                                    >
                                      ,** {transaction.currency}
                                    </span>
                                  </>
                                )}
                              </div>
                            </button>
                            {!isLast && (
                              <div style={{ paddingTop: "16px", paddingBottom: "16px" }}>
                                <div className="w-full h-px" style={{ backgroundColor: "#E0E0E0" }} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {monthIdx < monthGroups.length - 1 && (
                <div style={{ marginTop: "24px", marginBottom: "32px" }}>
                  <FigmaSeparator />

                  <div style={{ padding: "24px 0" }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: "8px" }}>
                      <span
                        style={{
                          color: "#262626",
                          fontFamily: "UniCredit, Inter, sans-serif",
                          fontSize: "24px",
                          fontWeight: 700,
                          lineHeight: "28px",
                        }}
                      >
                        {monthGroups[monthIdx + 1].month}
                      </span>
                      <div className="flex items-baseline">
                        {(() => {
                          const total = monthGroups[monthIdx + 1].monthlyTotal
                          const formatted = formatDailyTotal(total, "RON")
                          return (
                            <>
                              <span
                                style={{
                                  color: total >= 0 ? "#3D7D43" : "#262626",
                                  fontFamily: "UniCredit, sans-serif",
                                  fontSize: "18px",
                                  fontWeight: 700,
                                }}
                              >
                                {formatted.integer}
                              </span>
                              <span
                                style={{
                                  color: total >= 0 ? "#3D7D43" : "#262626",
                                  fontFamily: "UniCredit, sans-serif",
                                  fontSize: "14px",
                                  fontWeight: 400,
                                }}
                              >
                                {formatted.decimal} RON
                              </span>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    <p
                      style={{
                        color: "#666666",
                        fontFamily: "UniCredit, Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "18px",
                        marginBottom: "16px",
                      }}
                    >
                      {monthGroups[monthIdx + 1].monthlyTotal >= 0 ? "positive trend" : "negative trend"}
                    </p>

                    {(() => {
                      const nextMonth = monthGroups[monthIdx + 1]
                      const maxValue = Math.max(nextMonth.totalIncome, nextMonth.totalExpenses)
                      const incomeWidth = maxValue > 0 ? (nextMonth.totalIncome / maxValue) * 100 : 0
                      const expenseWidth = maxValue > 0 ? (nextMonth.totalExpenses / maxValue) * 100 : 0

                      return (
                        <div style={{ marginBottom: "16px" }}>
                          <div
                            style={{
                              height: "8px",
                              backgroundColor: "#E0E0E0",
                              borderRadius: "4px",
                              marginBottom: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${incomeWidth}%`,
                                backgroundColor: "#3D7D43",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              height: "8px",
                              backgroundColor: "#E0E0E0",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${expenseWidth}%`,
                                backgroundColor: "#262626",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        </div>
                      )
                    })()}

                    <div className="flex justify-between">
                      <div className="flex items-center" style={{ gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3D7D43" }} />
                        <span
                          style={{
                            color: "#666666",
                            fontFamily: "UniCredit, sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          Total income
                        </span>
                      </div>
                      <div className="flex items-center" style={{ gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#262626" }} />
                        <span
                          style={{
                            color: "#666666",
                            fontFamily: "UniCredit, sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          Total expenses
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between" style={{ marginTop: "4px" }}>
                      <span
                        style={{
                          color: "#3D7D43",
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "16px",
                          fontWeight: 700,
                        }}
                      >
                        +{monthGroups[monthIdx + 1].totalIncome.toLocaleString("ro-RO", { minimumFractionDigits: 2 })}{" "}
                        RON
                      </span>
                      <span
                        style={{
                          color: "#262626",
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "16px",
                          fontWeight: 700,
                        }}
                      >
                        -{monthGroups[monthIdx + 1].totalExpenses.toLocaleString("ro-RO", { minimumFractionDigits: 2 })}{" "}
                        RON
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className="fixed z-40"
          style={{
            bottom: "24px",
            left: "50%",
            transform: `translateX(-50%) translateY(${showSearchBar ? "0" : "100px"})`,
            opacity: showSearchBar ? 1 : 0,
            transition: "all 200ms ease-out",
            pointerEvents: showSearchBar ? "auto" : "none",
            // Glass outer container
            display: "flex",
            flexDirection: "row",
            padding: "8px",
            alignItems: "center",
            gap: "8px",
            borderRadius: "72px",
            background: "rgba(156, 156, 156, 0.10)",
            backdropFilter: "blur(17px)",
            WebkitBackdropFilter: "blur(17px)",
            whiteSpace: "nowrap",
          }}
        >
          {/* Search control (left) */}
          <button
            onClick={handleOpenSearch}
            style={{
              display: "flex",
              height: "48px",
              padding: "12px 16px",
              alignItems: "center",
              gap: "8px",
              borderRadius: "48px",
              border: "1px solid #909090",
              background: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <img
              src="/assets/mobile-banking/Search_K10.svg"
              width={20}
              height={20}
              alt="Search"
              style={{ aspectRatio: "1/1" }}
            />
            <span
              style={{
                color: "#666666",
                fontFamily: "UniCredit, Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              Search...
            </span>
          </button>

          {/* Filter control (right) */}
          <button
            onClick={() => console.log("Filter clicked - coming later")}
            style={{
              display: "flex",
              width: "48px",
              height: "48px",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "80px",
              border: "1px solid #909090",
              background: "#FFFFFF",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <img
              src="/assets/mobile-banking/Filter_K10.svg"
              width={20}
              height={20}
              alt="Filter"
              style={{ flexShrink: 0, aspectRatio: "1/1" }}
            />
          </button>
        </div>
        {/* End CHANGE */}

        <div
          style={{
            position: "fixed",
            bottom: "140px",
            left: "50%",
            transform: `translateX(-50%) translateY(${showCopyToast ? "0" : "20px"})`,
            opacity: showCopyToast ? 1 : 0,
            transition: "all 200ms ease-out",
            pointerEvents: "none",
            zIndex: 60,
          }}
        >
          <div
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              backgroundColor: "#262626",
              color: "#FFFFFF",
              fontFamily: "UniCredit, Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Copied to clipboard
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetailsSheet
          transaction={selectedTransaction}
          isOpen={isDetailsSheetOpen}
          onClose={handleCloseDetails}
        />
      )}

      <TransactionSearchSheet
        isOpen={isSearchSheetOpen}
        onClose={handleCloseSearch}
        transactions={transactions}
        onTransactionSelect={handleSearchTransactionSelect}
        showAmounts={true}
        currency={currentAccount.currency || "RON"}
      />
    </div>
  )
}
