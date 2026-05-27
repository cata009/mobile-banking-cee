"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface PlaceholderScreenProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  color?: "cyan" | "teal" | "slate" | "amber" | "green" | "purple"
  children?: React.ReactNode
}

const colorMap = {
  cyan: "bg-[var(--ds-cyan)]/10 text-[var(--ds-cyan)]",
  teal: "bg-[var(--ds-teal)]/10 text-[var(--ds-teal)]",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
}

export function PlaceholderScreen({ 
  title, 
  subtitle, 
  icon, 
  color = "cyan",
  children 
}: PlaceholderScreenProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {icon && (
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", colorMap[color])}>
            {icon}
          </div>
        )}
        {children || (
          <div className="text-center">
            <p className="text-slate-500 text-sm">Placeholder content for</p>
            <p className="text-slate-900 font-medium mt-1">{title}</p>
          </div>
        )}
      </div>
    </div>
  )
}
