"use client"

import { PfmIcon, getCategoryColor } from "./pfm-icon"
import { SectionTitle } from "./section-title"

function formatAmount(amount: number): { sign: string; integer: string; decimal: string } {
  const abs = Math.abs(amount)
  const sign = "−" // Always negative for scheduled payments (true minus U+2212)
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

interface ScheduledPayment {
  id: number
  name: string
  nextDay: number
  nextMonth: string
  amount: number
  currency: string
  pfmCategory: string
}

const scheduledPayments: ScheduledPayment[] = [
  {
    id: 1,
    name: "Disney+",
    nextDay: 10,
    nextMonth: "January",
    amount: -75.0,
    currency: "RON",
    pfmCategory: "Shopping",
  },
  {
    id: 2,
    name: "UniCredit Prime",
    nextDay: 1,
    nextMonth: "December",
    amount: -30.0,
    currency: "RON",
    pfmCategory: "Lifestyle",
  },
  {
    id: 3,
    name: "Orange",
    nextDay: 15,
    nextMonth: "January",
    amount: -45.9,
    currency: "RON",
    pfmCategory: "Utilities",
  },
]

interface ScheduledPaymentsProps {
  showAmounts?: boolean
}

export function ScheduledPayments({ showAmounts = true }: ScheduledPaymentsProps) {
  if (scheduledPayments.length === 0) {
    return null
  }

  const displayedPayments = scheduledPayments.slice(0, 2)
  const hasMore = scheduledPayments.length > 2

  return (
    <div style={{ marginTop: "40px" }}>
      <SectionTitle>Scheduled payments</SectionTitle>

      <div
        className="flex flex-col items-start w-full"
        style={{
          padding: "16px",
          gap: hasMore ? "32px" : "0px",
          borderRadius: "16px",
          backgroundColor: "#F5F5F5",
        }}
      >
        <div className="w-full flex flex-col">
          {displayedPayments.map((payment, index) => {
            const isLast = index === displayedPayments.length - 1
            const { sign, integer, decimal } = formatAmount(payment.amount)
            const circleColor = getCategoryColor(payment.pfmCategory)
            const nextDateFormatted = `Next on ${payment.nextDay} ${payment.nextMonth}`

            return (
              <div key={payment.id}>
                <div
                  className="flex justify-between items-start self-stretch w-full"
                  style={{ padding: "0", gap: "8px" }}
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
                        category={payment.pfmCategory}
                        fallbackInitial={payment.name.charAt(0).toUpperCase()}
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
                        }}
                      >
                        {payment.name}
                      </p>

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
                        }}
                      >
                        {nextDateFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline flex-shrink-0" style={{ flex: "0 0 auto", color: "#262626" }}>
                    {showAmounts ? (
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
                          {integer}
                        </span>
                        <span
                          style={{
                            fontFamily: "UniCredit, sans-serif",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "normal",
                          }}
                        >
                          {decimal} {payment.currency}
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
                          ,** {payment.currency}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {!isLast && (
                  <div style={{ paddingTop: "16px", paddingBottom: "16px" }}>
                    <div className="w-full h-px" style={{ backgroundColor: "#E0E0E0" }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {hasMore && (
          <div
            className="flex items-center justify-center self-stretch"
            style={{
              minHeight: "24px",
              gap: "4px",
            }}
          >
            <button
              onClick={() => console.log("Navigate to Account Details → Scheduled Payments")}
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
                SEE MORE
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
        )}
      </div>
    </div>
  )
}
