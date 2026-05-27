"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StickyTopBar } from "../components/sticky-top-bar"
import { ChipsRow } from "../components/chips-row"
import { StickyChipsOverlay } from "../components/sticky-chips-overlay"
import { AccountCard } from "../components/account-card"
import { TransactionsList } from "../components/transactions-list"
import { ScheduledPayments } from "../components/scheduled-payments"
import { ProductsSection } from "../components/products-section"
import { ShopsmartSection } from "../components/shopsmart-section"
import { FloatingActionButton } from "../components/floating-action-button"
import { TransactionDetailsSheet } from "../components/transaction-details-sheet"
import type { Transaction } from "../lib/transactions-data"

export default function Home() {
  const router = useRouter()
  const [showAmounts, setShowAmounts] = useState(true)
  const [accountIndex, setAccountIndex] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
  const [showAccountSelector, setShowAccountSelector] = useState(false)
  const [_pendingNavigateToTransactions, setPendingNavigateToTransactions] = useState(false)
  const isAnyBottomSheetOpen = isDetailsSheetOpen || showAccountSelector

  // Debug log to verify the flag is working
  console.log(
    "[v0] isAnyBottomSheetOpen:",
    isAnyBottomSheetOpen,
    "showAccountSelector:",
    showAccountSelector,
    "isDetailsSheetOpen:",
    isDetailsSheetOpen,
  )

  const toggleShowAmounts = () => {
    setShowAmounts((prev) => !prev)
  }

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsSheetOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsSheetOpen(false)
    setTimeout(() => {
      setSelectedTransaction(null)
    }, 400)
  }

  const handleMoreTransactions = () => {
    if (accountIndex >= 0 && accountIndex <= 2) {
      router.push(`/account-details?account=${accountIndex}&focus=transactions`)
    } else if (accountIndex === 3) {
      setPendingNavigateToTransactions(true)
      setShowAccountSelector(true)
    }
  }

  const handleCloseAccountSelector = () => {
    setShowAccountSelector(false)
    setPendingNavigateToTransactions(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[600px] md:max-w-[760px] min-h-screen bg-white pb-28 relative">
        {/* A) Top bar - always sticky */}
        <StickyTopBar showAmounts={showAmounts} toggleShowAmounts={toggleShowAmounts} />

        {/* B) Chips row - now the main navigation, includes Investments as 5th chip */}
        <ChipsRow />

        {/* 48px spacer between chips and main content */}
        <div style={{ height: "48px" }} />

        <main>
          <AccountCard
            showAmounts={showAmounts}
            toggleShowAmounts={toggleShowAmounts}
            onAccountChange={setAccountIndex}
            isAccountSelectorOpen={showAccountSelector}
            onOpenAccountSelector={() => setShowAccountSelector(true)}
            onCloseAccountSelector={handleCloseAccountSelector}
          />
          <div className="px-4">
            <TransactionsList
              showAmounts={showAmounts}
              accountIndex={accountIndex}
              onTransactionSelect={handleTransactionSelect}
              onMoreTransactions={handleMoreTransactions}
            />
            <ScheduledPayments showAmounts={showAmounts} />
            <ProductsSection />
            <ShopsmartSection />
          </div>
        </main>
        <FloatingActionButton hidden={isAnyBottomSheetOpen} />
      </div>

      {/* C) Sticky chips overlay - appears under TopBar only on scroll-up */}
      <StickyChipsOverlay />

      {selectedTransaction && (
        <TransactionDetailsSheet
          transaction={selectedTransaction}
          isOpen={isDetailsSheetOpen}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  )
}
