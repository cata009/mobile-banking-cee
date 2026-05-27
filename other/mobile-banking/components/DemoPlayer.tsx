"use client"

import { useState, useEffect } from "react"
import { Monitor, Tablet, Smartphone, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Demo, DeviceType } from "@/src/types/demo"
import { getScreenComponent } from "./screens"

interface DemoPlayerProps {
  demo: Demo
  initialDevice?: DeviceType
  onScreenChange?: (screenIndex: number) => void
}

const deviceSizes: Record<DeviceType, { width: number; height: number; label: string }> = {
  desktop: { width: 1280, height: 800, label: "Desktop" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  phone: { width: 375, height: 812, label: "Phone" },
}

export function DemoPlayer({ demo, initialDevice, onScreenChange }: DemoPlayerProps) {
  const [device, setDevice] = useState<DeviceType>(initialDevice || demo.defaultDevice || "phone")
  const [currentScreenIndex, setCurrentScreenIndex] = useState(demo.data?.currentScreenIndex || 0)

  const screens = demo.data?.screens || []
  const currentScreen = screens[currentScreenIndex]
  const deviceConfig = deviceSizes[device]

  const goToScreen = (index: number) => {
    if (index >= 0 && index < screens.length) {
      setCurrentScreenIndex(index)
      onScreenChange?.(index)
    }
  }

  // Listen for navigation events from within the demo
  useEffect(() => {
    const handleNavigation = (e: CustomEvent<{ index: number }>) => {
      goToScreen(e.detail.index)
    }

    window.addEventListener("demo-navigate", handleNavigation as EventListener)
    return () => window.removeEventListener("demo-navigate", handleNavigation as EventListener)
  }, [screens.length])

  const renderScreen = () => {
    if (!currentScreen) {
      return (
        <div className="flex items-center justify-center h-full bg-slate-100">
          <p className="text-slate-500">No screens defined</p>
        </div>
      )
    }

    const ScreenComponent = getScreenComponent(currentScreen.component)
    if (!ScreenComponent) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-100 p-4">
          <p className="text-slate-500 text-sm text-center">
            Screen component not found:
          </p>
          <code className="mt-2 px-2 py-1 bg-slate-200 rounded text-xs">
            {currentScreen.component}
          </code>
        </div>
      )
    }

    return <ScreenComponent {...(currentScreen.props || {})} />
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Device toolbar */}
      <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200">
        <button
          onClick={() => setDevice("desktop")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
            device === "desktop" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
          )}
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">Desktop</span>
        </button>
        <button
          onClick={() => setDevice("tablet")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
            device === "tablet" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
          )}
        >
          <Tablet className="w-4 h-4" />
          <span className="hidden sm:inline">Tablet</span>
        </button>
        <button
          onClick={() => setDevice("phone")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
            device === "phone" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
          )}
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">Phone</span>
        </button>
        <span className="ml-auto text-xs text-slate-500">
          {deviceConfig.width} × {deviceConfig.height}
        </span>
      </div>

      {/* Device frame */}
      <div className="flex-1 bg-slate-200 p-4 overflow-auto flex items-start justify-center">
        <div
          className={cn(
            "bg-white shadow-xl overflow-hidden transition-all duration-300 border-8 border-slate-800",
            device === "phone" ? "rounded-[2.5rem]" : "rounded-2xl",
          )}
          style={{
            width: device === "desktop" ? "100%" : `${deviceConfig.width}px`,
            maxWidth: `${deviceConfig.width}px`,
            height: device === "desktop" ? "auto" : `${deviceConfig.height}px`,
            minHeight: device === "desktop" ? "500px" : undefined,
          }}
        >
          {/* Phone notch */}
          {device === "phone" && (
            <div className="bg-slate-800 h-7 flex items-center justify-center">
              <div className="w-32 h-5 bg-black rounded-full" />
            </div>
          )}

          {/* Screen content */}
          <div className={cn("overflow-auto", device === "phone" ? "h-[calc(100%-28px)]" : "h-full")}>
            {renderScreen()}
          </div>
        </div>
      </div>

      {/* Screen navigation */}
      {screens.length > 1 && (
        <div className="flex items-center justify-between p-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => goToScreen(currentScreenIndex - 1)}
            disabled={currentScreenIndex === 0}
            className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => goToScreen(index)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  index === currentScreenIndex
                    ? "bg-[var(--ds-cyan)] text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                )}
              >
                {screen.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToScreen(currentScreenIndex + 1)}
            disabled={currentScreenIndex === screens.length - 1}
            className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
