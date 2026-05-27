"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  transactionsByAccount,
  formatTransactionDate,
  formatAmount,
  type Transaction,
} from "@/lib/transactions-data"
import { PfmIcon, getCategoryColor } from "./pfm-icon"

interface TransactionsListProps {
  showAmounts: boolean
  accountIndex: number
  onTransactionSelect?: (transaction: Transaction) => void
  onMoreTransactions?: () => void
}

export function TransactionsList({
  showAmounts,
  accountIndex,
  onTransactionSelect,
  onMoreTransactions,
}: TransactionsListProps) {
  const [displayedIndex, setDisplayedIndex] = useState(accountIndex)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<"idle" | "out" | "in">("idle")
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (accountIndex !== displayedIndex && !isAnimating) {
      setIsAnimating(true)
      setAnimationPhase("out")

      setTimeout(() => {
        setDisplayedIndex(accountIndex)
        setAnimationPhase("in")

        setTimeout(() => {
          setAnimationPhase("idle")
          setIsAnimating(false)
        }, 250)
      }, 120)
    }
  }, [accountIndex, displayedIndex, isAnimating])

  const transactions = transactionsByAccount[displayedIndex] || []

  if (displayedIndex === 4 || transactions.length === 0) {
    return null
  }

  const getAnimationStyle = () => {
    if (animationPhase === "out") {
      return {
        opacity: 0,
        transform: "translateY(-6px)",
        transition: "all 120ms cubic-bezier(0.4, 0, 0.2, 1)",
      }
    }
    if (animationPhase === "in") {
      return {
        opacity: 1,
        transform: "translateY(0px)",
        transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
      }
    }
    return {
      opacity: 1,
      transform: "translateY(0px)",
    }
  }

  const handleTransactionClick = (transaction: Transaction) => {
    if (onTransactionSelect) {
      onTransactionSelect(transaction)
    }
  }

  const handleMoreTransactions = () => {
    if (onMoreTransactions) {
      onMoreTransactions()
    } else {
      router.push(`/account-details?account=${accountIndex}&focus=transactions`)
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-start w-full"
      style={{
        marginTop: "24px",
        marginBottom: "32px",
        padding: "16px",
        gap: "32px",
        borderRadius: "16px",
        backgroundColor: "#F5F5F5",
        ...getAnimationStyle(),
      }}
    >
      <div className="w-full flex flex-col">
        {transactions.map((transaction, index) => {
          const isLast = index === transactions.length - 1
          const { sign, integer, decimal } = formatAmount(transaction.amount)
          const dateFormatted = formatTransactionDate(transaction.date)
          const amountColor = transaction.amount >= 0 ? "#3D7D43" : "#262626"
          const circleColor = getCategoryColor(transaction.pfmCategory)

          return (
            <div key={transaction.id}>
              <button
                onClick={() => handleTransactionClick(transaction)}
                className="flex justify-between items-start self-stretch w-full text-left"
                style={{
                  padding: "0",
                  gap: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleTransactionClick(transaction)
                  }
                }}
              >
                <div className="flex items-start" style={{ gap: "8px", flex: "1 0 0", minWidth: 0 }}>
                  <div
                    className="flex justify-center items-center flex-shrink-0"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "120px",
                      backgroundColor: circleColor,
                      color: "#FFFFFF",
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
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
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
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "left",
                      }}
                    >
                      {dateFormatted}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline flex-shrink-0" style={{ flex: "0 0 auto", color: amountColor }}>
                  {showAmounts ? (
                    <>
                      {/* Sign - refined: 14px, 600 weight, 0.9 opacity */}
                      <span
                        style={{
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "14px",
                          fontWeight: 600,
                          opacity: 0.9,
                          marginRight: "1px",
                          lineHeight: "normal",
                        }}
                      >
                        {sign}
                      </span>
                      {/* Integer - bold */}
                      <span
                        style={{
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          lineHeight: "normal",
                        }}
                      >
                        {integer}
                      </span>
                      {/* Decimal + currency - lighter */}
                      <span
                        style={{
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "14px",
                          fontWeight: 400,
                          lineHeight: "normal",
                        }}
                      >
                        {decimal} {transaction.currency}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        style={{
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "14px",
                          fontWeight: 600,
                          opacity: 0.9,
                          marginRight: "1px",
                          lineHeight: "normal",
                        }}
                      >
                        {sign}
                      </span>
                      <span
                        style={{
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          lineHeight: "normal",
                        }}
                      >
                        ***
                      </span>
                      <span
                        style={{
                          fontFamily: "UniCredit, sans-serif",
                          fontSize: "14px",
                          fontWeight: 400,
                          lineHeight: "normal",
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

      <div
        className="flex items-center justify-center self-stretch"
        style={{
          minHeight: "24px",
          gap: "4px",
        }}
      >
        <button
          onClick={handleMoreTransactions}
          className="relative flex items-center justify-center"
          style={{
            gap: "4px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseDown={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseUp={(e) => (e.currentTarget.style.opacity = "0.85")}
        >
          <span
            className="absolute"
            style={{
              width: "100%",
              height: "44px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
          <span
            style={{
              color: "#007A91",
              fontFamily: "UniCredit, sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "16px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            MORE TRANSACTIONS
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0 }}
          >
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
  )
}
