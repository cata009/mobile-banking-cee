"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { formatTransactionDate, formatAmount, type Transaction } from "@/lib/transactions-data"
import { PfmIcon, getCategoryColor } from "./pfm-icon"
import { StatusBarScrim } from "./status-bar-scrim"
import { useDevicePreview } from "@/lib/device-preview-context"

// Status chip colors
const STATUS_COLORS: Record<string, string> = {
  Booked: "#3D7D43",
  Pending: "#388BCA",
  Rejected: "#DD1860",
}

function FigmaSeparator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "16px",
        margin: "0 -16px",
        paddingLeft: "0",
        paddingRight: "0",
        boxSizing: "content-box",
        width: "calc(100% + 32px)",
      }}
    >
      {/* Left notch arrow */}
      <svg width="6" height="16" viewBox="0 0 6 16" fill="none" style={{ flexShrink: 0 }}>
        <mask
          id="mask-left-sheet"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="6"
          height="16"
        >
          <rect width="6" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask-left-sheet)">
          <path
            d="M4.14269 5.18005C5.24301 6.57891 5.28676 8.5365 4.25002 9.98311L-2.74873 19.7488C-5.01364 22.9092 -10 21.3069 -10 17.4187L-10 -1.24459C-10 -5.04222 -5.20392 -6.70247 -2.85605 -3.71758L4.14269 5.18005Z"
            fill="#333333"
          />
        </g>
      </svg>

      {/* Dashed line */}
      <svg style={{ flexGrow: 1, height: "1px" }} viewBox="0 0 100 1" preserveAspectRatio="none" fill="none">
        <path d="M0 0.5L100 0.5" stroke="#CCCCCC" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Right notch arrow (mirrored) */}
      <svg width="6" height="16" viewBox="0 0 6 16" fill="none" style={{ flexShrink: 0, transform: "scaleX(-1)" }}>
        <mask
          id="mask-right-sheet"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="6"
          height="16"
        >
          <rect width="6" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask-right-sheet)">
          <path
            d="M4.14269 5.18005C5.24301 6.57891 5.28676 8.5365 4.25002 9.98311L-2.74873 19.7488C-5.01364 22.9092 -10 21.3069 -10 17.4187L-10 -1.24459C-10 -5.04222 -5.20392 -6.70247 -2.85605 -3.71758L4.14269 5.18005Z"
            fill="#333333"
          />
        </g>
      </svg>
    </div>
  )
}

// Mock monthly spending data for bar chart
const monthlySpending = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 80 },
  { month: "Mar", value: 35 },
  { month: "Apr", value: 120 },
  { month: "May", value: 150 },
  { month: "Jun", value: 180 },
  { month: "Jul", value: 90 },
  { month: "Aug", value: 60 },
  { month: "Sep", value: 140 },
  { month: "Oct", value: 110 },
  { month: "Nov", value: 75 },
  { month: "Dec", value: 55 },
]

interface TransactionDetailsSheetProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
  showAmounts?: boolean
}

export function TransactionDetailsSheet({ transaction, isOpen, onClose }: TransactionDetailsSheetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { isInDevicePreview, scrollContainerRef } = useDevicePreview()

  // Get viewport height - use scroll container height when in device preview, otherwise window
  const [viewportHeight, setViewportHeight] = useState(800)
  useEffect(() => {
    const updateHeight = () => {
      if (isInDevicePreview && scrollContainerRef?.current) {
        // Use the device frame's scroll container height
        setViewportHeight(scrollContainerRef.current.clientHeight + 59) // Add notch height
      } else if (typeof window !== "undefined") {
        setViewportHeight(window.innerHeight)
      }
    }
    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [isInDevicePreview, scrollContainerRef])

  const scrollRef = useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const dragStartY = useRef(0)
  const canDrag = useRef(false)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const velocityY = useRef(0)
  // Use absolute positioning when in device preview
  const positionClass = isInDevicePreview ? "absolute" : "fixed"

  // Mount/unmount and animation timing
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true)
      setIsClosing(false)
      setIsDismissing(false)
      // Trigger entry animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
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
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMounted])

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
        velocityY.current = ((e.clientY - lastY.current) / dt) * 1000 // px/s
      }
      lastY.current = e.clientY
      lastTime.current = now

      // Use diminishing resistance as user drags further
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
      const threshold = Math.min(280, viewportHeight * 0.33)
      const velocityThreshold = 900 // px/s

      const shouldDismiss = dragY > threshold || velocityY.current > velocityThreshold

      if (shouldDismiss) {
        setIsDismissing(true)
        setIsDragging(false)
        // After animation completes, call onClose
        setTimeout(() => {
          onClose()
        }, 350)
      } else {
        // Spring back to y=0
        setIsDragging(false)
        setDragY(0)
      }
    }
    canDrag.current = false
  }, [isDragging, dragY, viewportHeight, onClose])

  const handleClose = () => {
    onClose()
  }

  const handleFaq = () => {
    console.log("FAQ clicked - not implemented yet")
  }

  if (!isMounted) return null

  const { integer, decimal } = formatAmount(transaction.amount)
  const amountColor = transaction.amount >= 0 ? "#3D7D43" : "#262626"
  const dateFormatted = formatTransactionDate(transaction.date)
  const postingDateFormatted = `${transaction.postingDate.getDate().toString().padStart(2, "0")}/${(transaction.postingDate.getMonth() + 1).toString().padStart(2, "0")}/${transaction.postingDate.getFullYear()}`
  const categoryColor = getCategoryColor(transaction.pfmCategory)
  const statusColor = STATUS_COLORS[transaction.status] || STATUS_COLORS.Booked

  const maxDragForEffects = 300 // Use fixed value for effect calculations
  const dragProgress = Math.min(dragY / maxDragForEffects, 1)
  const sheetScale = 1 - dragProgress * 0.02
  const sheetRadius = 36 + dragProgress * 12
  const scrimOpacity = isDismissing ? 0 : Math.max(0, 0.35 * (1 - dragProgress))

  const getSheetTransform = () => {
    if (isDismissing) {
      // Animate off-screen
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

  const scrimVisible = isVisible && !isClosing && !isDismissing

  return (
    <div
      className={`${positionClass} inset-0 z-[9999]`}
      style={{
        pointerEvents: isVisible || isClosing || isDismissing ? "auto" : "none",
        height: "100%",
        overflow: "hidden", // Prevent ALL scrollbars on this container
      }}
    >
      {/* Status bar scrim - darkens the notch area */}
      <StatusBarScrim visible={scrimVisible} zIndex={10001} />

      {/* Background scrim overlay */}
      <div
        style={{
          position: "absolute",
          top: isInDevicePreview ? 59 : 0, // Start below notch in device preview
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000000",
          opacity: isVisible && !isClosing ? scrimOpacity : 0,
          transition: isDragging ? "none" : "opacity 350ms ease-out",
          pointerEvents: "none",
        }}
      />

      {/* Sheet container - starts below notch, fills remaining height */}
      <div
        style={{
          position: "absolute",
          top: isInDevicePreview ? 59 : "env(safe-area-inset-top, 0px)", // Start below notch
          left: 0,
          right: 0,
          bottom: 0,
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
          display: "flex",
          flexDirection: "column",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grab handle */}
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
          className="flex justify-center no-scrollbar"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "scroll",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            touchAction: isDragging ? "none" : "pan-y",
          }}
        >
          <div className="w-full max-w-[600px] md:max-w-[760px] bg-white relative">
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <button
                  onClick={handleFaq}
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
                    src="/assets/mobile-banking/FAQ_K10.svg"
                    alt="FAQ"
                    width={24}
                    height={24}
                    style={{ display: "block" }}
                  />
                </button>
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
            </header>

            <div style={{ height: "24px" }} />

            {/* Main content */}
            <div style={{ padding: "0 16px 32px 16px" }}>
              {/* Title section */}
              <h1
                style={{
                  fontFamily: "UniCredit, sans-serif",
                  fontSize: "32px",
                  fontWeight: 700,
                  lineHeight: "36px",
                  color: "#262626",
                  marginBottom: "4px",
                }}
              >
                {transaction.name}
              </h1>
              <p
                style={{
                  fontFamily: "UniCredit, sans-serif",
                  fontSize: "16px",
                  fontWeight: 400,
                  color: "#666666",
                  marginBottom: "8px",
                }}
              >
                {dateFormatted}
              </p>

              {/* Status chip */}
              <div
                style={{
                  display: "inline-flex",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  gap: "4px",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: statusColor,
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "UniCredit, sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {transaction.status}
                </span>
              </div>

              {/* Amount section */}
              <div style={{ marginBottom: "24px" }}>
                <p
                  style={{
                    fontFamily: "UniCredit, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#666666",
                    marginBottom: "4px",
                  }}
                >
                  Amount
                </p>
                <div className="flex items-baseline" style={{ color: amountColor }}>
                  {/* Sign - lighter and smaller */}
                  <span
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      opacity: 0.9,
                      marginRight: "2px",
                    }}
                  >
                    {transaction.amount >= 0 ? "+" : "−"}
                  </span>
                  {/* Integer - bold */}
                  <span
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "32px",
                      fontWeight: 700,
                    }}
                  >
                    {integer}
                  </span>
                  {/* Decimal + currency - lighter */}
                  <span
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "18px",
                      fontWeight: 400,
                    }}
                  >
                    {decimal} {transaction.currency}
                  </span>
                </div>
              </div>

              {/* Action rows */}
              <div>
                <FigmaSeparator />

                {/* Transaction statement */}
                <div className="flex justify-between items-center" style={{ padding: "16px 0" }}>
                  <span style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", color: "#262626" }}>
                    Transaction statement
                  </span>
                  <button
                    className="flex items-center group"
                    style={{ gap: "4px", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span
                      className="text-[#007A91] group-hover:text-[#006375] transition-colors"
                      style={{
                        fontFamily: "UniCredit, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      DOWNLOAD
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v9M4 8l4 4 4-4M2 14h12" strokeWidth="2" strokeLinecap="round" className="stroke-[#007A91] group-hover:stroke-[#006375] transition-colors" />
                    </svg>
                  </button>
                </div>

                <FigmaSeparator />

                {/* Notes */}
                <div className="flex justify-between items-center" style={{ padding: "16px 0" }}>
                  <span style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", color: "#262626" }}>Notes</span>
                  <button
                    className="flex items-center group"
                    style={{ gap: "4px", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span
                      className="text-[#007A91] group-hover:text-[#006375] transition-colors"
                      style={{
                        fontFamily: "UniCredit, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      ADD
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 2L4 14M4 2v12h12" strokeWidth="1.5" strokeLinecap="round" className="stroke-[#007A91] group-hover:stroke-[#006375] transition-colors" />
                    </svg>
                  </button>
                </div>

                <FigmaSeparator />

                {/* Chargeback */}
                <div className="flex justify-between items-center" style={{ padding: "16px 0" }}>
                  <span style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", color: "#262626" }}>
                    Chargeback transaction
                  </span>
                  <button
                    className="flex items-center group"
                    style={{ gap: "4px", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span
                      className="text-[#007A91] group-hover:text-[#006375] transition-colors"
                      style={{
                        fontFamily: "UniCredit, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      INITIATE
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6 4L10 8L6 12"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="stroke-[#007A91] group-hover:stroke-[#006375] transition-colors"
                      />
                    </svg>
                  </button>
                </div>

                <FigmaSeparator />
              </div>

              {/* Detail fields */}
              <div style={{ marginTop: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "14px",
                      color: "#666666",
                      marginBottom: "4px",
                    }}
                  >
                    Posting date
                  </p>
                  <p
                    style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", fontWeight: 700, color: "#262626" }}
                  >
                    {postingDateFormatted}
                  </p>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "14px",
                      color: "#666666",
                      marginBottom: "4px",
                    }}
                  >
                    Transaction description
                  </p>
                  <p
                    style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", fontWeight: 700, color: "#262626" }}
                  >
                    {transaction.longDescription}
                  </p>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "14px",
                      color: "#666666",
                      marginBottom: "4px",
                    }}
                  >
                    Transaction type
                  </p>
                  <p
                    style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", fontWeight: 700, color: "#262626" }}
                  >
                    {transaction.typeLabel}
                  </p>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "14px",
                      color: "#666666",
                      marginBottom: "4px",
                    }}
                  >
                    Paid from
                  </p>
                  <p
                    style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", fontWeight: 700, color: "#262626" }}
                  >
                    {transaction.paidFrom}
                  </p>
                </div>
              </div>

              <FigmaSeparator />

              {/* Spending insights */}
              <div style={{ marginTop: "24px" }}>
                <div className="flex justify-between items-center" style={{ marginBottom: "16px" }}>
                  <h2
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#262626",
                    }}
                  >
                    Your spending insights
                  </h2>
                  <button
                    className="flex items-center group"
                    style={{ gap: "4px", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span
                      className="text-[#007A91] group-hover:text-[#006375] transition-colors"
                      style={{
                        fontFamily: "UniCredit, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      EDIT CATEGORY
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 2L4 14M4 2v12h12" strokeWidth="1.5" strokeLinecap="round" className="stroke-[#007A91] group-hover:stroke-[#006375] transition-colors" />
                    </svg>
                  </button>
                </div>

                {/* Category display */}
                <div className="flex items-center" style={{ gap: "12px", marginBottom: "16px" }}>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: categoryColor,
                    }}
                  >
                    <PfmIcon
                      category={transaction.pfmCategory}
                      fallbackInitial={transaction.name.charAt(0).toUpperCase()}
                      size={32}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "UniCredit, sans-serif",
                        fontSize: "14px",
                        color: "#666666",
                      }}
                    >
                      {transaction.pfmCategory}
                    </p>
                    <p
                      style={{
                        fontFamily: "UniCredit, sans-serif",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#262626",
                      }}
                    >
                      {transaction.pfmSubcategory}
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: "UniCredit, sans-serif",
                    fontSize: "14px",
                    color: "#666666",
                    marginBottom: "16px",
                  }}
                >
                  Your trend in the <strong>{transaction.pfmCategory}</strong> category
                </p>

                {/* Mock bar chart */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "#F5F5F5",
                    marginBottom: "24px",
                  }}
                >
                  <div className="flex items-end justify-between" style={{ height: "100px", gap: "4px" }}>
                    {monthlySpending.map((m) => (
                      <div key={m.month} className="flex flex-col items-center" style={{ flex: 1, gap: "4px" }}>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: "24px",
                            height: `${(m.value / 200) * 80}px`,
                            backgroundColor: "#007A91",
                            borderRadius: "4px",
                          }}
                        />
                        <span style={{ fontSize: "10px", color: "#666666" }}>{m.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-start" style={{ marginTop: "8px", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#666666" }}>0 RON</span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>100 RON</span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>200 RON</span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>300 RON</span>
                  </div>
                </div>

                <FigmaSeparator />

                {/* Exclude from budget */}
                <div className="flex justify-between items-center" style={{ padding: "16px 0" }}>
                  <span style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", color: "#262626" }}>
                    Exclude movement from budget
                  </span>
                  <button
                    className="flex items-center"
                    style={{ gap: "4px", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span
                      style={{
                        fontFamily: "UniCredit, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#007A91",
                      }}
                    >
                      EXCLUDE
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6 4L10 8L6 12"
                        stroke="#007A91"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
