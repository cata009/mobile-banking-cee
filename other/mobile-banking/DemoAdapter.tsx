"use client"

import { useState } from "react"
import { StickyTopBar, TOP_BAR_HEIGHT } from "./components/sticky-top-bar"
import { ChipsRow } from "./components/chips-row"
import { AccountCard } from "./components/account-card"
import { TransactionsList } from "./components/transactions-list"
import { ScheduledPayments } from "./components/scheduled-payments"
import { ProductsSection } from "./components/products-section"
import { ShopsmartSection } from "./components/shopsmart-section"
import { FloatingActionButton } from "./components/floating-action-button"
import { TransactionDetailsSheet } from "./components/transaction-details-sheet"
import type { Transaction } from "./lib/transactions-data"

/**
 * MobileBankingDemoAdapter - Renders the Mobile Banking Home screen
 * 
 * CRITICAL LAYOUT RULES:
 * 1. Header (StickyTopBar) is sticky at top-0
 * 2. ChipsRow is sticky at top-[64px] (below header)
 * 3. Content scrolls BELOW the sticky stack
 * 4. Content NEVER appears under notch (DeviceFrame handles safe-area padding)
 * 
 * The parent DeviceFrame provides:
 * - paddingTop for notch/status bar safe area
 * - Scroll container that enables sticky positioning
 */
export function MobileBankingDemoAdapter() {
  const [showAmounts, setShowAmounts] = useState(true)
  const [accountIndex, setAccountIndex] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [showAccountSelector, setShowAccountSelector] = useState(false)

  const isAnyBottomSheetOpen = isDetailsSheetOpen || showAccountSelector

  const toggleShowAmounts = () => setShowAmounts((prev) => !prev)

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsSheetOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsSheetOpen(false)
    setTimeout(() => setSelectedTransaction(null), 300)
  }

  return (
    <>
      {/* STICKY HEADER - sticks to top of scroll container */}
      <StickyTopBar
        showAmounts={showAmounts}
        toggleShowAmounts={toggleShowAmounts}
        hideOnBottomSheet={isAnyBottomSheetOpen}
      />

      {/* STICKY CHIPS - sticks below header */}
      <div 
        className="sticky bg-white"
        style={{ 
          top: TOP_BAR_HEIGHT, 
          zIndex: 30,
        }}
      >
        <ChipsRow />
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="pt-2 pb-24">
        <div className="px-4">
          <AccountCard
            showAmounts={showAmounts}
            toggleShowAmounts={toggleShowAmounts}
            onAccountChange={setAccountIndex}
            isAccountSelectorOpen={showAccountSelector}
            onOpenAccountSelector={() => setShowAccountSelector(true)}
            onCloseAccountSelector={() => setShowAccountSelector(false)}
          />
        </div>

        <div className="px-4">
          <TransactionsList
            accountIndex={accountIndex}
            showAmounts={showAmounts}
            onTransactionSelect={handleTransactionSelect}
          />
        </div>

        <div className="px-4">
          <ScheduledPayments />
        </div>

        <div className="px-4">
          <ProductsSection />
        </div>

        <div className="px-4">
          <ShopsmartSection />
        </div>
      </div>

      {/* FAB */}
      <FloatingActionButton hideOnBottomSheet={isAnyBottomSheetOpen} />

      {/* Transaction details sheet */}
      {selectedTransaction && (
        <TransactionDetailsSheet
          transaction={selectedTransaction}
          isOpen={isDetailsSheetOpen}
          onClose={handleCloseDetails}
          showAmounts={showAmounts}
        />
      )}
    </>
  )
}
