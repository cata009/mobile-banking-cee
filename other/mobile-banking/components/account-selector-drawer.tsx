"use client"

import { useEffect, useState } from "react"
import { useDevicePreview } from "@/lib/device-preview-context"

interface Account {
  id: number | "all" | "new"
  name: string
  iban?: string
  balance?: string
  currency?: string
  flag?: string
  subtitle?: string
}

const accounts: Account[] = [
  {
    id: 1,
    name: "My RON account",
    iban: "RO57BACX0000007913550033",
    balance: "11.321,44",
    currency: "RON",
    flag: "🇷🇴",
  },
  {
    id: 2,
    name: "My USD account",
    iban: "RO57BACX0000007913550055",
    balance: "783,22",
    currency: "USD",
    flag: "🇺🇸",
  },
  {
    id: 3,
    name: "My EUR account",
    iban: "RO57BACX0000007913550066",
    balance: "0,00",
    currency: "EUR",
    flag: "🇪🇺",
  },
]

const allAccountsTotal = "21.183,34"

interface AccountSelectorDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedAccountId: number | "all" | "new"
  onSelectAccount: (accountId: number | "all" | "new") => void
  showAmounts: boolean
}

export function AccountSelectorDrawer({
  isOpen,
  onClose,
  selectedAccountId,
  onSelectAccount,
  showAmounts,
}: AccountSelectorDrawerProps) {
  const [pressedId, setPressedId] = useState<number | "all" | "new" | null>(null)
  const { isInDevicePreview } = useDevicePreview()

  useEffect(() => {
    // Only lock body scroll when not in device preview (standalone page)
    if (!isInDevicePreview) {
      if (isOpen) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = "unset"
      }
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen, isInDevicePreview])

  const handleSelect = (accountId: number | "all" | "new") => {
    onSelectAccount(accountId)
    onClose()
  }

  const displayAmount = (amount: string | undefined) => (showAmounts ? (amount || "0,00") : "***,**")

  // Use absolute positioning when in device preview
  const positionClass = isInDevicePreview ? "absolute" : "fixed"

  if (!isOpen) return null

  return (
    <div className={`${positionClass} inset-0 z-50`}>
      {/* Backdrop - 30% black */}
      <div className="absolute inset-0 bg-black/30 transition-opacity duration-300" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl transform transition-transform duration-300 ease-out max-h-[85vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-[10px] pb-[14px]">
          <div className="w-[44px] h-[5px] bg-[#CFCFCF] rounded-full" />
        </div>

        {/* Header with close button */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <h2 className="text-[28px] font-bold text-[#111111] leading-tight">Select the product</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Accounts list */}
          <div className="flex flex-col gap-3">
            {accounts.map((account) => {
              const isSelected = selectedAccountId === account.id
              const isPressed = pressedId === account.id
              return (
                <button
                  key={account.id}
                  role="button"
                  onClick={() => handleSelect(account.id)}
                  onPointerDown={() => setPressedId(account.id)}
                  onPointerUp={() => setPressedId(null)}
                  onPointerLeave={() => setPressedId(null)}
                  className="w-full flex items-center gap-3 p-[14px] rounded-[16px] transition-all"
                  style={{
                    minHeight: "44px",
                    background: isPressed ? "#E8E8E8" : isSelected ? "#FFFFFF" : "#F3F3F3",
                    border: isSelected ? "2px solid #0D7B8D" : "2px solid transparent",
                  }}
                >
                  {/* Flag in circle */}
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <span className="text-xl">{account.flag}</span>
                  </div>

                  {/* Account info - center text block */}
                  <div className="flex-1 text-left">
                    <p className={`text-[16px] font-bold ${isSelected ? "text-[#0D7B8D]" : "text-[#111111]"}`}>
                      {account.name}
                    </p>
                    <p className="text-[12px] text-[#6E7A80] mt-1">{account.iban}</p>
                    <p className="text-[12px] text-[#6E7A80] mt-1">
                      Available balance {displayAmount(account.balance)} {account.currency || ""}
                    </p>
                  </div>
                </button>
              )
            })}

            {/* All accounts option */}
            {(() => {
              const isSelected = selectedAccountId === "all"
              const isPressed = pressedId === "all"
              return (
                <button
                  role="button"
                  onClick={() => handleSelect("all")}
                  onPointerDown={() => setPressedId("all")}
                  onPointerUp={() => setPressedId(null)}
                  onPointerLeave={() => setPressedId(null)}
                  className="w-full flex items-center gap-3 p-[14px] rounded-[16px] transition-all"
                  style={{
                    minHeight: "44px",
                    background: isPressed ? "#E8E8E8" : isSelected ? "#FFFFFF" : "#F3F3F3",
                    border: isSelected ? "2px solid #0D7B8D" : "2px solid transparent",
                  }}
                >
                  {/* Coins/stack icon in dark circle */}
                  <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <ellipse cx="12" cy="6" rx="8" ry="3" />
                      <path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
                      <path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" />
                    </svg>
                  </div>

                  {/* All accounts info */}
                  <div className="flex-1 text-left">
                    <p className={`text-[16px] font-bold ${isSelected ? "text-[#0D7B8D]" : "text-[#111111]"}`}>
                      All accounts
                    </p>
                    <p className="text-[12px] text-[#6E7A80] mt-1">3 accounts</p>
                    <p className="text-[12px] text-[#6E7A80] mt-1">
                      Total balance {displayAmount(allAccountsTotal)} RON
                    </p>
                  </div>
                </button>
              )
            })()}
          </div>

          {/* Add new account card */}
          <button
            role="button"
            onPointerDown={() => setPressedId("new")}
            onPointerUp={() => setPressedId(null)}
            onPointerLeave={() => setPressedId(null)}
            className="w-full flex items-center gap-3 p-[14px] mt-3 rounded-[16px] border border-[#DADADA] transition-colors"
            style={{
              minHeight: "44px",
              background: pressedId === "new" ? "#F5F5F5" : "#FFFFFF",
            }}
          >
            {/* Text block */}
            <div className="flex-1 text-left">
              <p className="text-[16px] font-bold text-[#111111]">Add a new account</p>
              <p className="text-[12px] text-[#6E7A80] mt-1">Select the currency you want and open it now</p>
            </div>

            {/* Plus button */}
            <div className="w-11 h-11 rounded-full bg-[#EFEFEF] flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </button>
        </div>

        {/* iOS safe area only */}
        <div className="h-6" />
      </div>
    </div>
  )
}

export { accounts }
