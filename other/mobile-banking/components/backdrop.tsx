"use client"

type Props = {
  visible: boolean
  onClick?: () => void
  zIndex?: number
}

export function Backdrop({ visible, onClick, zIndex = 60 }: Props) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={[
        "fixed inset-0 transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0",
        onClick ? "cursor-pointer" : "pointer-events-none",
      ].join(" ")}
      style={{
        zIndex,
        backgroundColor: "rgba(0,0,0,0.25)",
        pointerEvents: visible && onClick ? "auto" : "none",
      }}
    />
  )
}
