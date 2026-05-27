import type React from "react"
import { cn } from "@/lib/utils"

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const MOBILE_SECTION_TITLE_STYLE: React.CSSProperties = {
  color: "#262626",
  fontFamily: "UniCredit, sans-serif",
  fontSize: "28px",
  fontWeight: 700,
  lineHeight: "32px",
  marginBottom: "24px",
}

export function SectionTitle({ children, className = "", style }: SectionTitleProps) {
  return (
    <h2
      className={cn("block", className)}
      style={{ ...MOBILE_SECTION_TITLE_STYLE, ...style }}
    >
      {children}
    </h2>
  )
}
