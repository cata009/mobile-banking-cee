"use client"

import { useRef, useState } from "react"
import { SectionTitle } from "./section-title"

const products = [
  {
    id: 1,
    title: "Current Account",
    subtitle: "Open a new current account in minutes and manage everything from your phone.",
    image: "/assets/mobile-banking/image-0.jpg",
  },
  {
    id: 2,
    title: "Overdraft",
    subtitle: "Need a safety net? Activate an overdraft limit and cover unexpected expenses.",
    image: "/assets/mobile-banking/image-1.jpg",
  },
  {
    id: 3,
    title: "Credit Card",
    subtitle: "Pay worldwide and split purchases into instalments with instant in-app control.",
    image: "/assets/mobile-banking/image-2.jpg",
  },
  {
    id: 4,
    title: "Personal Loan",
    subtitle: "Finance bigger plans with fixed monthly payments and a quick approval flow.",
    image: "/assets/mobile-banking/image-3.jpg",
  },
  {
    id: 5,
    title: "Prime by UniCredit",
    subtitle: "Priority support and lifestyle assistance—full support 24/7 for all your needs.",
    image: "/assets/mobile-banking/image-4.jpg",
  },
]

export function ProductsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef({ startX: 0, scrollLeft: 0 })

  const handleCardClick = (productId: number) => {
    console.log(`Product ${productId} tapped`)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current
    if (!container) return

    setIsDragging(true)
    dragStateRef.current.startX = e.pageX - container.offsetLeft
    dragStateRef.current.scrollLeft = container.scrollLeft
    container.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const container = scrollContainerRef.current
    if (!container) return

    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - dragStateRef.current.startX) * 1.5 // Scroll speed multiplier
    container.scrollLeft = dragStateRef.current.scrollLeft - walk
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    const container = scrollContainerRef.current
    if (container) {
      container.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <div style={{ marginTop: "40px", marginBottom: "40px" }}>
      <SectionTitle style={{ marginBottom: "24px" }}>Our products</SectionTitle>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto -mx-4 px-4"
        style={{
          gap: "16px",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => handleCardClick(product.id)}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              width: "167px",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px", // gap between image and text block
              flexShrink: 0,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Image area */}
            <div
              style={{
                width: "100%",
                height: "226px",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Text block - fixed height for alignment across cards */}
            {/* Title: 2 lines × 24px = 48px, gap: 4px, Subtitle: 3 lines × 22px = 66px, Total: 118px */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                width: "100%",
                height: "118px", // fixed height for alignment
              }}
            >
              {/* Title: max 2 lines */}
              <h3
                style={{
                  color: "#262626",
                  fontFamily: "UniCredit, Inter, sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  lineHeight: "24px",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.title}
              </h3>

              {/* Subtitle: max 3 lines */}
              <p
                style={{
                  color: "#666666",
                  fontFamily: "UniCredit, Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: "22px",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
