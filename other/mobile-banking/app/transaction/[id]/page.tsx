"use client"

import type React from "react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  findTransactionById,
  formatTransactionDate,
  formatAmount,
  type Transaction,
} from "../../../lib/transactions-data"
import { PfmIcon, getCategoryColor } from "../../../components/pfm-icon"

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
        <mask id="mask-left" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="6" height="16">
          <rect width="6" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask-left)">
          <path
            d="M4.14269 5.18005C5.24301 6.57891 5.28676 8.5365 4.25002 9.98311L-2.74873 19.7488C-5.01364 22.9092 -10 21.3069 -10 17.4187L-10 -1.24459C-10 -5.04222 -5.20392 -6.70247 -2.85605 -3.71758L4.14269 5.18005Z"
            fill="#333333"
          />
        </g>
      </svg>

      {/* Dashed line - flex-grow to fill space */}
      <svg style={{ flexGrow: 1, height: "1px" }} viewBox="0 0 100 1" preserveAspectRatio="none" fill="none">
        <path d="M0 0.5L100 0.5" stroke="#CCCCCC" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Right notch arrow (mirrored) */}
      <svg width="6" height="16" viewBox="0 0 6 16" fill="none" style={{ flexShrink: 0, transform: "scaleX(-1)" }}>
        <mask
          id="mask-right"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="6"
          height="16"
        >
          <rect width="6" height="16" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask-right)">
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

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartScrollTop = useRef(0)
  const canDrag = useRef(false)

  const id = typeof params.id === "string" ? Number.parseInt(params.id, 10) : null

  useEffect(() => {
    if (id !== null) {
      const found = findTransactionById(id)
      setTransaction(found)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    }
  }, [id])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return
    dragStartY.current = e.clientY
    dragStartScrollTop.current = scrollRef.current.scrollTop
    // Can only start drag if scroll is at top
    canDrag.current = scrollRef.current.scrollTop <= 0
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!canDrag.current) return

    const deltaY = e.clientY - dragStartY.current

    // Only drag downward (positive deltaY) when at scroll top
    if (deltaY > 0 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
      e.preventDefault()
      setIsDragging(true)
      // Clamp to max 220px with resistance
      const clampedY = Math.min(deltaY * 0.6, 220)
      setDragY(clampedY)
    } else if (deltaY <= 0) {
      // User is scrolling up, allow normal scroll
      canDrag.current = false
      setIsDragging(false)
      setDragY(0)
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      // Spring back animation
      setDragY(0)
    }
    canDrag.current = false
  }, [isDragging])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      router.back()
    }, 400)
  }

  const handleFaq = () => {
    console.log("FAQ clicked - not implemented yet")
  }

  if (id === null || transaction === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <p style={{ fontFamily: "UniCredit, sans-serif", fontSize: "18px", color: "#262626" }}>Transaction not found</p>
        <button
          onClick={() => router.back()}
          style={{
            marginTop: "16px",
            color: "#007A91",
            fontFamily: "UniCredit, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Go back
        </button>
      </div>
    )
  }

  const { integer, decimal } = formatAmount(transaction.amount)
  const amountColor = transaction.amount >= 0 ? "#3D7D43" : "#262626"
  const dateFormatted = formatTransactionDate(transaction.date)
  const postingDateFormatted = `${transaction.postingDate.getDate().toString().padStart(2, "0")}/${(transaction.postingDate.getMonth() + 1).toString().padStart(2, "0")}/${transaction.postingDate.getFullYear()}`
  const categoryColor = getCategoryColor(transaction.pfmCategory)
  const statusColor = STATUS_COLORS[transaction.status] || STATUS_COLORS.Booked

  const dragProgress = dragY / 220
  const sheetScale = 1 - dragProgress * 0.02 // 1 -> 0.98
  const sheetRadius = dragProgress * 16 // 0 -> 16px

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          opacity: dragProgress * 0.3,
          transition: isDragging ? "none" : "opacity 300ms ease-out",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFFFFF",
          transform: isClosing
            ? "translateY(100%)"
            : isVisible
              ? `translateY(${dragY}px) scale(${sheetScale})`
              : "translateY(100%)",
          borderRadius: `${sheetRadius}px ${sheetRadius}px 0 0`,
          transition: isDragging
            ? "none"
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
          ref={scrollRef}
          className="flex justify-center"
          style={{
            height: "100dvh",
            overflowY: "auto",
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
                {/* FAQ icon button */}
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
                {/* Close icon button */}
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
                <div className="flex items-baseline">
                  <span
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "32px",
                      fontWeight: 700,
                      color: amountColor,
                    }}
                  >
                    {integer}
                  </span>
                  <span
                    style={{
                      fontFamily: "UniCredit, sans-serif",
                      fontSize: "18px",
                      fontWeight: 400,
                      color: amountColor,
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
                      DOWNLOAD
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v9M4 8l4 4 4-4M2 14h12" stroke="#007A91" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <FigmaSeparator />

                {/* Notes */}
                <div className="flex justify-between items-center" style={{ padding: "16px 0" }}>
                  <span style={{ fontFamily: "UniCredit, sans-serif", fontSize: "16px", color: "#262626" }}>Notes</span>
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
                      ADD
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 2L4 14M4 2v12h12" stroke="#007A91" strokeWidth="1.5" strokeLinecap="round" />
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
                      INITIATE
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.77635 0.675781C3.74642 1.65524 3.74642 3.24474 4.77635 4.22511L8.50577 8.00911L4.77635 11.7931C3.74642 12.7735 3.74643 14.3621 4.77635 15.3424L12.0039 8.00911L4.77635 0.675781Z"
                        fill="#007A91"
                      />
                    </svg>
                  </button>
                </div>

                <FigmaSeparator />
              </div>

              {/* Detail fields */}
              <div style={{ marginTop: "24px" }}>
                {/* Posting date */}
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

                {/* Transaction description */}
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

                {/* Transaction type */}
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

                {/* Paid from */}
                <div style={{ marginBottom: "24px" }}>
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

              {/* Spending insights section */}
              <div style={{ paddingTop: "24px" }}>
                <FigmaSeparator />
                <div style={{ height: "24px" }} />

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
                      EDIT CATEGORY
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 2L4 14M4 2v12h12" stroke="#007A91" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Category row */}
                <div className="flex items-center" style={{ gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: categoryColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PfmIcon category={transaction.pfmCategory} fallbackInitial={transaction.pfmCategory.charAt(0)} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "UniCredit, sans-serif", fontSize: "14px", color: "#666666" }}>
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

                {/* Trend text */}
                <p
                  style={{
                    fontFamily: "UniCredit, sans-serif",
                    fontSize: "14px",
                    color: "#262626",
                    marginBottom: "16px",
                  }}
                >
                  Your trend in the <strong>{transaction.pfmCategory}</strong> category
                </p>

                {/* Bar chart placeholder */}
                <div
                  style={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  {/* Y-axis labels */}
                  <div className="flex" style={{ marginBottom: "8px" }}>
                    <div
                      style={{ width: "50px", fontSize: "12px", color: "#666666", fontFamily: "UniCredit, sans-serif" }}
                    >
                      <div>300 RON</div>
                      <div style={{ marginTop: "20px" }}>200 RON</div>
                      <div style={{ marginTop: "20px" }}>100 RON</div>
                      <div style={{ marginTop: "20px" }}>0 RON</div>
                    </div>
                    {/* Bars */}
                    <div className="flex items-end flex-1" style={{ gap: "4px", height: "100px" }}>
                      {monthlySpending.map((m, i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "20px",
                              height: `${(m.value / 200) * 80}px`,
                              backgroundColor: "#007A91",
                              borderRadius: "4px 4px 0 0",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex" style={{ marginLeft: "50px" }}>
                    {monthlySpending.map((m, i) => (
                      <div
                        key={i}
                        className="flex-1 text-center"
                        style={{ fontSize: "10px", color: "#666666", fontFamily: "UniCredit, sans-serif" }}
                      >
                        {m.month}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exclude from budget */}
              <FigmaSeparator />
              <div
                className="flex justify-between items-center"
                style={{ paddingTop: "16px", paddingBottom: "env(safe-area-inset-bottom, 32px)" }}
              >
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
                      d="M4.77635 0.675781C3.74642 1.65524 3.74642 3.24474 4.77635 4.22511L8.50577 8.00911L4.77635 11.7931C3.74642 12.7735 3.74643 14.3621 4.77635 15.3424L12.0039 8.00911L4.77635 0.675781Z"
                      fill="#007A91"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
