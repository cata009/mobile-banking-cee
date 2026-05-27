"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { formatAmount } from "@/lib/transactions-data"
import { PfmIcon, getCategoryColor } from "./pfm-icon"
import { type AccountDetailsTransaction, groupTransactionsByMonthAndDay } from "@/lib/account-details-data"
import { StatusBarScrim } from "./status-bar-scrim"

interface TransactionSearchSheetProps {
  transactions: AccountDetailsTransaction[]
  isOpen: boolean
  onClose: () => void
  onTransactionSelect: (transaction: AccountDetailsTransaction) => void
  showAmounts: boolean
  currency: string
}

export function TransactionSearchSheet({
  transactions,
  isOpen,
  onClose,
  onTransactionSelect,
  showAmounts,
  currency,
}: TransactionSearchSheetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const dragStartY = useRef(0)
  const canDrag = useRef(false)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const velocityY = useRef(0)
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800

  // Mount/unmount and animation timing
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true)
      setIsClosing(false)
      setIsDismissing(false)
      setSearchQuery("")
      // Trigger entry animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
          // Focus input and open keyboard after animation starts
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)
        })
      })
    } else if (isMounted) {
      // Start exit animation
      setIsClosing(true)
      setIsVisible(false)
      // Unmount after exit animation completes
      const timer = setTimeout(() => {
        setIsMounted(false)
        setIsClosing(false)
        setIsDismissing(false)
        setSearchQuery("")
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMounted])

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (searchQuery.length < 3) {
      return transactions // Return full list if query < 3 chars
    }

    const query = searchQuery.toLowerCase()
    return transactions.filter((t) => {
      const name = t.name.toLowerCase()
      const desc1 = (t.description1 || "").toLowerCase()
      const longDesc = (t.longDescription || "").toLowerCase()
      const subcategory = (t.pfmSubcategory || "").toLowerCase()

      return name.includes(query) || desc1.includes(query) || longDesc.includes(query) || subcategory.includes(query)
    })
  }, [transactions, searchQuery])

  // Group filtered transactions by month and day
  const monthGroups = useMemo(() => {
    return groupTransactionsByMonthAndDay(filteredTransactions)
  }, [filteredTransactions])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return
    dragStartY.current = e.clientY
    lastY.current = e.clientY
    lastTime.current = Date.now()
    velocityY.current = 0
    canDrag.current = scrollRef.current.scrollTop <= 0
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!canDrag.current) return

    const deltaY = e.clientY - dragStartY.current

    if (deltaY > 0 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
      e.preventDefault()
      setIsDragging(true)

      const now = Date.now()
      const dt = now - lastTime.current
      if (dt > 0) {
        velocityY.current = ((e.clientY - lastY.current) / dt) * 1000
      }
      lastY.current = e.clientY
      lastTime.current = now

      const resistance = 0.6
      const clampedY = deltaY * resistance
      setDragY(clampedY)
    } else if (deltaY <= 0) {
      canDrag.current = false
      setIsDragging(false)
      setDragY(0)
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      const threshold = Math.min(280, viewportHeight * 0.35)
      const velocityThreshold = 900

      const shouldDismiss = dragY > threshold || velocityY.current > velocityThreshold

      if (shouldDismiss) {
        setIsDismissing(true)
        setIsDragging(false)
        setTimeout(() => {
          onClose()
        }, 350)
      } else {
        setIsDragging(false)
        setDragY(0)
      }
    }
    canDrag.current = false
  }, [isDragging, dragY, viewportHeight, onClose])

  const handleClose = () => {
    onClose()
  }

  const clearSearch = () => {
    setSearchQuery("")
    inputRef.current?.focus()
  }

  const formatTimeOnly = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const formatDailyTotal = (amount: number, _curr: string): { sign: string; integer: string; decimal: string } => {
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

  if (!isMounted) return null

  const maxDragForEffects = 300
  const dragProgress = Math.min(dragY / maxDragForEffects, 1)
  const sheetScale = 1 - dragProgress * 0.02
  const sheetRadius = 36 + dragProgress * 12
  const scrimOpacity = isDismissing ? 0 : Math.max(0, 0.35 * (1 - dragProgress))

  const getSheetTransform = () => {
    if (isDismissing) {
      return `translateY(${viewportHeight + 80}px)`
    }
    if (isClosing) {
      return "translateY(100%)"
    }
    if (isVisible) {
      return `translateY(${dragY}px) scale(${sheetScale})`
    }
    return "translateY(100%)"
  }

  const hasResults = filteredTransactions.length > 0
  const showEmptyState = searchQuery.length >= 3 && !hasResults

  const scrimVisible = isVisible && !isClosing && !isDismissing

  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{ pointerEvents: isVisible || isClosing || isDismissing ? "auto" : "none" }}
    >
      <StatusBarScrim visible={scrimVisible} zIndex={10001} />

      {/* Scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          opacity: isVisible && !isClosing ? scrimOpacity : 0,
          transition: isDragging ? "none" : "opacity 350ms ease-out",
          pointerEvents: "none",
        }}
      />

      {/* Sheet container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          transform: getSheetTransform(),
          borderTopLeftRadius: `${sheetRadius}px`,
          borderTopRightRadius: `${sheetRadius}px`,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          transition: isDragging
            ? "none"
            : isDismissing
              ? "transform 350ms cubic-bezier(0.4, 0, 1, 1), border-radius 300ms ease-out"
              : isClosing
                ? "transform 400ms cubic-bezier(0.4, 0, 1, 1), border-radius 300ms ease-out"
                : "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 300ms ease-out",
          overflow: "hidden",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "8px",
            paddingBottom: "4px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "4px",
              backgroundColor: "rgba(0,0,0,0.18)",
            }}
          />
        </div>

        <div
          ref={scrollRef}
          className="flex justify-center"
          style={{
            height: "calc(100dvh - 16px)", // Account for grab handle
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            touchAction: isDragging ? "none" : "pan-y",
          }}
        >
          <div className="w-full max-w-[600px] md:max-w-[760px] bg-white relative">
            {/* Header */}
            <header
              style={{
                position: "sticky",
                top: 0,
                zIndex: 999,
                backgroundColor: "#FFFFFF",
                padding: "16px",
                paddingTop: "env(safe-area-inset-top, 16px)",
              }}
            >
              {/* Close button row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <button
                  onClick={handleClose}
                  style={{
                    display: "flex",
                    width: "40px",
                    height: "40px",
                    padding: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src="/assets/mobile-banking/Close_K10.svg"
                    alt="Close"
                    width={24}
                    height={24}
                    style={{ display: "block" }}
                  />
                </button>
              </div>

              {/* Search input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "100px",
                  border: "1px solid #909090",
                  backgroundColor: "#FFFFFF",
                }}
              >
                {/* Search icon */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                    stroke="#262626"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 19L14.65 14.65"
                    stroke="#262626"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontFamily: "UniCredit, Inter, sans-serif",
                    fontSize: "16px",
                    color: "#262626",
                    backgroundColor: "transparent",
                  }}
                />

                {/* Clear button */}
                {searchQuery.length > 0 && (
                  <button
                    onClick={clearSearch}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#E0E0E0",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M9 3L3 9M3 3L9 9"
                        stroke="#666666"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </header>

            {/* Content */}
            <div style={{ padding: "0 16px 32px 16px" }}>
              {/* Empty state */}
              {showEmptyState && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px",
                    borderRadius: "16px",
                    backgroundColor: "#F5F5F5",
                    marginTop: "16px",
                  }}
                >
                  {/* Info icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#666666" strokeWidth="2" />
                    <path d="M12 16V12" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="8" r="1" fill="#666666" />
                  </svg>
                  <span
                    style={{
                      fontFamily: "UniCredit, Inter, sans-serif",
                      fontSize: "16px",
                      fontWeight: 400,
                      color: "#262626",
                    }}
                  >
                    There are no transactions found.
                  </span>
                </div>
              )}

              {/* Transaction list - grouped by day */}
              {hasResults &&
                monthGroups.map((monthGroup) => (
                  <div key={monthGroup.month}>
                    {monthGroup.days.map((dayGroup, dayIndex) => {
                      const showDailyTotal =
                        dayGroup.transactions.length > 1 ||
                        (dayGroup.transactions.length === 1 &&
                          dayGroup.transactions.some((t) => t.amount >= 0) !==
                            dayGroup.transactions.every((t) => t.amount >= 0))

                      const dailyTotal = formatDailyTotal(dayGroup.dailyTotal, currency)

                      return (
                        <div key={dayGroup.dayKey} style={{ marginTop: dayIndex === 0 ? "16px" : "24px" }}>
                          {/* Day header */}
                          <div className="flex justify-between items-center" style={{ marginBottom: "16px" }}>
                            <span
                              style={{
                                fontFamily: "UniCredit, Inter, sans-serif",
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#262626",
                              }}
                            >
                              {dayGroup.dayKey}
                            </span>
                            {showDailyTotal && (
                              <div
                                className="flex items-baseline"
                                style={{ color: dayGroup.dailyTotal >= 0 ? "#3D7D43" : "#262626" }}
                              >
                                {/* Sign - lighter */}
                                <span
                                  style={{
                                    fontFamily: "UniCredit, Inter, sans-serif",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    opacity: 0.9,
                                    marginRight: "1px",
                                  }}
                                >
                                  {showAmounts ? dailyTotal.sign : dayGroup.dailyTotal >= 0 ? "+" : "−"}
                                </span>
                                {/* Integer */}
                                <span
                                  style={{
                                    fontFamily: "UniCredit, Inter, sans-serif",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                  }}
                                >
                                  {showAmounts ? dailyTotal.integer : "***"}
                                </span>
                                {/* Decimal + currency */}
                                <span
                                  style={{
                                    fontFamily: "UniCredit, Inter, sans-serif",
                                    fontSize: "14px",
                                    fontWeight: 400,
                                  }}
                                >
                                  {showAmounts ? dailyTotal.decimal : ",**"} {currency}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Transactions card */}
                          <div
                            style={{
                              backgroundColor: "#F5F5F5",
                              borderRadius: "16px",
                              padding: "16px",
                            }}
                          >
                            {dayGroup.transactions.map((transaction, txIndex) => {
                              const categoryColor = getCategoryColor(transaction.pfmCategory)
                              const { sign, integer, decimal } = formatAmount(transaction.amount)
                              const amountColor = transaction.amount >= 0 ? "#3D7D43" : "#262626"
                              const isLast = txIndex === dayGroup.transactions.length - 1

                              return (
                                <div key={transaction.id}>
                                  <button
                                    onClick={() => onTransactionSelect(transaction)}
                                    className="flex items-start w-full text-left"
                                    style={{
                                      gap: "12px",
                                      padding: "0",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {/* PFM Icon */}
                                    <div
                                      className="flex items-center justify-center flex-shrink-0"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        backgroundColor: categoryColor,
                                      }}
                                    >
                                      <PfmIcon
                                        category={transaction.pfmCategory}
                                        fallbackInitial={transaction.name[0]}
                                      />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start" style={{ gap: "8px" }}>
                                        <div className="flex-1 min-w-0">
                                          <p
                                            style={{
                                              fontFamily: "UniCredit, Inter, sans-serif",
                                              fontSize: "16px",
                                              fontWeight: 700,
                                              color: "#262626",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {transaction.name}
                                          </p>
                                          {transaction.description1 && (
                                            <p
                                              style={{
                                                fontFamily: "UniCredit, Inter, sans-serif",
                                                fontSize: "14px",
                                                color: "#666666",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {transaction.description1}
                                            </p>
                                          )}
                                          <p
                                            style={{
                                              fontFamily: "UniCredit, Inter, sans-serif",
                                              fontSize: "14px",
                                              color: "#666666",
                                            }}
                                          >
                                            {formatTimeOnly(transaction.date)}
                                          </p>
                                        </div>

                                        {/* Amount */}
                                        <div
                                          className="flex items-baseline flex-shrink-0"
                                          style={{ color: amountColor }}
                                        >
                                          {/* Sign */}
                                          <span
                                            style={{
                                              fontFamily: "UniCredit, Inter, sans-serif",
                                              fontSize: "14px",
                                              fontWeight: 600,
                                              opacity: 0.9,
                                              marginRight: "1px",
                                            }}
                                          >
                                            {showAmounts ? sign : transaction.amount >= 0 ? "+" : "−"}
                                          </span>
                                          {/* Integer */}
                                          <span
                                            style={{
                                              fontFamily: "UniCredit, Inter, sans-serif",
                                              fontSize: "18px",
                                              fontWeight: 700,
                                            }}
                                          >
                                            {showAmounts ? integer : "***"}
                                          </span>
                                          {/* Decimal + currency */}
                                          <span
                                            style={{
                                              fontFamily: "UniCredit, Inter, sans-serif",
                                              fontSize: "14px",
                                              fontWeight: 400,
                                            }}
                                          >
                                            {showAmounts ? decimal : ",**"} {currency}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </button>

                                  {/* Divider */}
                                  {!isLast && (
                                    <div
                                      style={{
                                        height: "1px",
                                        backgroundColor: "#E0E0E0",
                                        margin: "16px 0",
                                        marginLeft: "52px",
                                      }}
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
