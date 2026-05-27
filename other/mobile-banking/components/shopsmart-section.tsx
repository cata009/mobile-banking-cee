"use client"

import { useState, useRef } from "react"
import { SectionTitle } from "./section-title"
import {
  getMobileChipButtonClassName,
  getMobileChipLabelClassName,
} from "./mobile-chip-styles"

// Local asset path - no external requests
const GIT_BASE = "/assets/mobile-banking/"

const categories = [
  { id: "popular", label: "Most popular" },
  { id: "eshops", label: "E-shops" },
  { id: "electronics", label: "Electronics" },
  { id: "beauty", label: "Beauty" },
]

interface Offer {
  id: number
  image: string
  title: string
  subtitle: string
  status: "ACTIVATE NOW" | "ACTIVATED OFFER"
  link: string
}

const offersData: Record<string, Offer[]> = {
  popular: [
    {
      id: 1,
      image: "shopsmart-1.jpg",
      title: "fashiondays.ro",
      subtitle: "Get 5% cashback on all orders. Extra 10% off for first purchase",
      status: "ACTIVATE NOW",
      link: "SHOP NOW",
    },
    {
      id: 2,
      image: "shopsmart-2.jpg",
      title: "emag.ro",
      subtitle: "3% cashback on electronics & gadgets. Free delivery over 200 lei",
      status: "ACTIVATED OFFER",
      link: "SHOP NOW",
    },
    {
      id: 3,
      image: "shopsmart-3.jpg",
      title: "wolt.com",
      subtitle: "2% cashback for shopping above 100 lei. Valid on all restaurants",
      status: "ACTIVATE NOW",
      link: "ORDER NOW",
    },
    {
      id: 4,
      image: "shopsmart-4.jpg",
      title: "booking.com",
      subtitle: "Save 8% on hotel bookings. Cashback up to 150 lei per reservation",
      status: "ACTIVATED OFFER",
      link: "BOOK NOW",
    },
    {
      id: 5,
      image: "shopsmart-5.jpg",
      title: "notino.ro",
      subtitle: "4% cashback on beauty & cosmetics. Free samples with every order",
      status: "ACTIVATE NOW",
      link: "SHOP NOW",
    },
  ],
  eshops: [
    {
      id: 6,
      image: "shopsmart-6.jpg",
      title: "fashiondays.ro",
      subtitle: "Get 5% cashback on all orders. Extra 10% off for first purchase",
      status: "ACTIVATE NOW",
      link: "SHOP NOW",
    },
    {
      id: 7,
      image: "shopsmart-7.jpg",
      title: "aboutyou.ro",
      subtitle: "3% cashback on fashion & accessories. Free returns within 100 days",
      status: "ACTIVATED OFFER",
      link: "SHOP NOW",
    },
    {
      id: 8,
      image: "shopsmart-8.jpg",
      title: "answear.ro",
      subtitle: "Earn 4% cashback on shoes & clothing. Special deals on premium brands",
      status: "ACTIVATE NOW",
      link: "DISCOVER DEALS",
    },
    {
      id: 9,
      image: "shopsmart-9.jpg",
      title: "zalando.ro",
      subtitle: "2.5% cashback for orders above 150 lei. Free delivery on all items",
      status: "ACTIVATED OFFER",
      link: "SHOP NOW",
    },
    {
      id: 10,
      image: "shopsmart-10.jpg",
      title: "decathlon.ro",
      subtitle: "3% cashback on sports equipment. Join loyalty program for extra perks",
      status: "ACTIVATE NOW",
      link: "GET ACTIVE",
    },
  ],
  electronics: [
    {
      id: 11,
      image: "shopsmart-11.jpg",
      title: "emag.ro",
      subtitle: "3% cashback on electronics & gadgets. Free delivery over 200 lei",
      status: "ACTIVATED OFFER",
      link: "SHOP NOW",
    },
    {
      id: 12,
      image: "shopsmart-12.jpg",
      title: "altex.ro",
      subtitle: "Save 4% on home appliances & tech. Extended warranty available now",
      status: "ACTIVATE NOW",
      link: "EXPLORE TECH",
    },
    {
      id: 13,
      image: "shopsmart-13.jpg",
      title: "mediamart.ro",
      subtitle: "2.5% cashback on TVs, phones & laptops. Trade-in your old device",
      status: "ACTIVATED OFFER",
      link: "SHOP NOW",
    },
    {
      id: 14,
      image: "shopsmart-14.jpg",
      title: "pcgarage.ro",
      subtitle: "5% cashback for gaming & PC components. Build your dream setup today",
      status: "ACTIVATE NOW",
      link: "BUILD NOW",
    },
    {
      id: 15,
      image: "shopsmart-15.jpg",
      title: "cel.ro",
      subtitle: "Get 3% cashback on smartphones & accessories. Exclusive online deals",
      status: "ACTIVATED OFFER",
      link: "SHOP NOW",
    },
  ],
  beauty: [
    {
      id: 16,
      image: "shopsmart-16.jpg",
      title: "notino.ro",
      subtitle: "4% cashback on beauty & cosmetics. Free samples with every order",
      status: "ACTIVATE NOW",
      link: "SHOP NOW",
    },
    {
      id: 17,
      image: "shopsmart-17.jpg",
      title: "sephora.ro",
      subtitle: "Get 5% cashback on makeup & skincare. Exclusive brands & new arrivals",
      status: "ACTIVATED OFFER",
      link: "DISCOVER BEAUTY",
    },
    {
      id: 18,
      image: "shopsmart-18.jpg",
      title: "douglas.ro",
      subtitle: "Earn 3.5% cashback on perfumes & cosmetics. Premium beauty rewards",
      status: "ACTIVATE NOW",
      link: "SHOP NOW",
    },
    {
      id: 19,
      image: "shopsmart-19.jpg",
      title: "makeup.ro",
      subtitle: "Save 4% on all beauty products. Fast delivery & expert recommendations",
      status: "ACTIVATED OFFER",
      link: "EXPLORE DEALS",
    },
    {
      id: 20,
      image: "shopsmart-20.jpg",
      title: "farmec.ro",
      subtitle: "3% cashback on natural cosmetics. Romanian beauty brand since 1889",
      status: "ACTIVATE NOW",
      link: "SHOP LOCAL",
    },
  ],
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <button
      className="group"
      onClick={() => console.log(`Clicked offer: ${offer.title}`)}
      style={{
        display: "flex",
        maxWidth: "361px",
        width: "100%",
        minHeight: "180px",
        justifyContent: "space-between",
        alignItems: "stretch",
        borderRadius: "16px",
        border: "1px solid #000",
        background: "#FFF",
        overflow: "hidden",
        textAlign: "left",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Left content column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          alignSelf: "stretch",
          padding: "16px",
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            width: "48px",
            height: "48px",
            padding: "4px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={`${GIT_BASE}logo-a.svg`}
            alt="Logo"
            style={{ width: "40px", height: "40px", objectFit: "contain" }}
          />
        </div>

        {/* Title */}
        <h3
          style={{
            color: "#191B1B",
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
          {offer.title}
        </h3>

        {/* Subtitle */}
        <p
          style={{
            color: "#191B1B",
            fontFamily: "UniCredit, Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "22px",
            margin: 0,
            alignSelf: "stretch",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {offer.subtitle}
        </p>

        {/* Status pill */}
        <span
          style={{
            display: "inline-flex",
            padding: "4px 8px",
            borderRadius: "8px",
            background: "#26EDA9",
            color: "#191B1B",
            fontFamily: "UniCredit, Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "16px",
          }}
        >
          {offer.status}
        </span>

        {/* Spacer to push link button to bottom */}
        <div style={{ flex: 1 }} />

        {/* Link button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            paddingBottom: "0px",
          }}
        >
          <span
            className="text-[#007A91] group-hover:text-[#006375] transition-colors"
            style={{
              fontFamily: "UniCredit, Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {offer.link}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-[#007A91] group-hover:stroke-[#006375] transition-colors" />
          </svg>
        </div>
      </div>

      {/* Right image panel */}
      <div
        style={{
          display: "flex",
          width: "108px",
          flexShrink: 0,
          alignItems: "flex-end",
          alignSelf: "stretch",
          borderRadius: "0 12px 12px 0",
          overflow: "hidden",
        }}
      >
        <img
          src={`${GIT_BASE}${offer.image}`}
          alt={offer.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </button>
  )
}

export function ShopsmartSection() {
  const [activeCategory, setActiveCategory] = useState("popular")
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Refs and state for chips carousel mouse scroll
  const chipsContainerRef = useRef<HTMLDivElement>(null)
  const [isDraggingChips, setIsDraggingChips] = useState(false)
  const chipsDragStateRef = useRef({ startX: 0, scrollLeft: 0 })

  // Refs and state for offers carousel mouse scroll
  const offersContainerRef = useRef<HTMLDivElement>(null)
  const [isDraggingOffers, setIsDraggingOffers] = useState(false)
  const offersDragStateRef = useRef({ startX: 0, scrollLeft: 0 })

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveCategory(categoryId)
      setIsTransitioning(false)
    }, 150)
  }

  // Chips carousel pointer handlers
  const handleChipsPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = chipsContainerRef.current
    if (!container) return
    setIsDraggingChips(true)
    chipsDragStateRef.current.startX = e.pageX - container.offsetLeft
    chipsDragStateRef.current.scrollLeft = container.scrollLeft
    container.setPointerCapture(e.pointerId)
  }

  const handleChipsPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingChips) return
    const container = chipsContainerRef.current
    if (!container) return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - chipsDragStateRef.current.startX) * 1.5
    container.scrollLeft = chipsDragStateRef.current.scrollLeft - walk
  }

  const handleChipsPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingChips(false)
    const container = chipsContainerRef.current
    if (container) {
      container.releasePointerCapture(e.pointerId)
    }
  }

  // Offers carousel pointer handlers
  const handleOffersPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = offersContainerRef.current
    if (!container) return
    setIsDraggingOffers(true)
    offersDragStateRef.current.startX = e.pageX - container.offsetLeft
    offersDragStateRef.current.scrollLeft = container.scrollLeft
    container.setPointerCapture(e.pointerId)
  }

  const handleOffersPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingOffers) return
    const container = offersContainerRef.current
    if (!container) return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - offersDragStateRef.current.startX) * 1.5
    container.scrollLeft = offersDragStateRef.current.scrollLeft - walk
  }

  const handleOffersPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingOffers(false)
    const container = offersContainerRef.current
    if (container) {
      container.releasePointerCapture(e.pointerId)
    }
  }

  const currentOffers = offersData[activeCategory] || []

  return (
    <div style={{ marginTop: "40px", marginBottom: "40px" }}>
      {/* Section title */}
      <SectionTitle>ShopSmart</SectionTitle>

      {/* 24px gap is included in SectionTitle's marginBottom */}

      {/* Category chips row */}
      <div
        ref={chipsContainerRef}
        className="flex items-center gap-1 overflow-x-auto -mx-4 px-4"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: isDraggingChips ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onPointerDown={handleChipsPointerDown}
        onPointerMove={handleChipsPointerMove}
        onPointerUp={handleChipsPointerUp}
        onPointerLeave={handleChipsPointerUp}
      >
        {categories.map((chip) => {
          const isActive = activeCategory === chip.id
          return (
            <button
              key={chip.id}
              onClick={() => handleCategoryChange(chip.id)}
              onPointerDown={(e) => e.stopPropagation()}
              className={getMobileChipButtonClassName(isActive, {
                activeClassName: "hover:bg-[#006375]",
              })}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Invisible 44px hit area */}
              <span className="absolute inset-0 min-h-[44px]" />
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

      {/* 24px gap */}
      <div style={{ height: "24px" }} />

      {/* Offers list (horizontal swipe carousel) */}
      <div
        ref={offersContainerRef}
        className="overflow-x-auto overflow-y-hidden"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 150ms ease-out, transform 150ms ease-out",
          cursor: isDraggingOffers ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onPointerDown={handleOffersPointerDown}
        onPointerMove={handleOffersPointerMove}
        onPointerUp={handleOffersPointerUp}
        onPointerLeave={handleOffersPointerUp}
      >
        <div className="flex gap-4 pr-4" style={{ scrollSnapType: "x mandatory" }}>
          {currentOffers.map((offer) => (
            <div key={offer.id} className="flex-none" style={{ scrollSnapAlign: "start" }}>
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
