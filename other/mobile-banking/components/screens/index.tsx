"use client"

import React from "react"

import { CreditCard, Send, Plus, Check, ArrowRight, Building2 } from "lucide-react"
import { PlaceholderScreen } from "../PlaceholderScreen"
import { MobileBankingDemoAdapter } from "../../DemoAdapter"
import AccountDetailsContent from "../../app/account-details/account-details-content"

// ============================================
// Full Version Demo Screens
// ============================================

// MobileBankingHome now renders the REAL Home component via DemoAdapter
export function MobileBankingHome() {
  return <MobileBankingDemoAdapter />
}

export function MobileBankingAccountDetails() {
  return <AccountDetailsContent />
}

export function MobileBankingAccounts() {
  return (
    <PlaceholderScreen
      title="Accounts"
      subtitle="Your accounts overview"
      icon={<CreditCard className="w-8 h-8" />}
      color="teal"
    >
      <div className="w-full max-w-xs space-y-3">
        {[
          { name: "Current Account", balance: "€8,240.00" },
          { name: "Savings Account", balance: "€4,210.00" },
        ].map((account) => (
          <div key={account.name} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600">{account.name}</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">{account.balance}</p>
          </div>
        ))}
      </div>
    </PlaceholderScreen>
  )
}

export function MobileBankingPayments() {
  return (
    <PlaceholderScreen
      title="Payments"
      subtitle="Send money quickly"
      icon={<Send className="w-8 h-8" />}
      color="cyan"
    >
      <div className="w-full max-w-xs space-y-3">
        <p className="text-sm text-slate-500 text-center">Recent Recipients</p>
        <div className="flex justify-center gap-4">
          {["JD", "MK", "AS"].map((initials) => (
            <div key={initials} className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">{initials}</span>
            </div>
          ))}
        </div>
      </div>
    </PlaceholderScreen>
  )
}

// ============================================
// Add Money Flow Screens
// ============================================

export function AddMoneyAmount() {
  return (
    <PlaceholderScreen
      title="Add Money"
      subtitle="Enter amount"
      icon={<Plus className="w-8 h-8" />}
      color="cyan"
    >
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="py-8">
          <p className="text-4xl font-bold text-slate-900">€500.00</p>
          <p className="text-sm text-slate-500 mt-2">Enter amount to add</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["€50", "€100", "€200", "€500", "€1000", "Other"].map((amount) => (
            <button
              key={amount}
              className="p-3 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              {amount}
            </button>
          ))}
        </div>
      </div>
    </PlaceholderScreen>
  )
}

export function AddMoneySource() {
  return (
    <PlaceholderScreen
      title="Select Source"
      subtitle="Choose funding source"
      icon={<Building2 className="w-8 h-8" />}
      color="teal"
    >
      <div className="w-full max-w-xs space-y-3">
        {[
          { name: "UniCredit Current", number: "****4521" },
          { name: "External Bank", number: "****7832" },
        ].map((source) => (
          <button
            key={source.number}
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-left hover:border-[var(--ds-cyan)]"
          >
            <p className="font-medium text-slate-900">{source.name}</p>
            <p className="text-sm text-slate-500">{source.number}</p>
          </button>
        ))}
      </div>
    </PlaceholderScreen>
  )
}

export function AddMoneyConfirm() {
  return (
    <PlaceholderScreen
      title="Confirm"
      subtitle="Review your top-up"
      icon={<ArrowRight className="w-8 h-8" />}
      color="amber"
    >
      <div className="w-full max-w-xs space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Amount</span>
            <span className="font-medium">€500.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">From</span>
            <span className="font-medium">****4521</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fee</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
        </div>
        <button className="w-full py-3 bg-[var(--ds-cyan)] text-white rounded-xl font-medium">
          Confirm Top-Up
        </button>
      </div>
    </PlaceholderScreen>
  )
}

export function AddMoneySuccess() {
  return (
    <PlaceholderScreen
      title="Success!"
      subtitle="Money added successfully"
      icon={<Check className="w-8 h-8" />}
      color="green"
    >
      <div className="w-full max-w-xs text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">€500.00</p>
          <p className="text-sm text-slate-500 mt-1">Added to your wallet</p>
        </div>
        <button className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium">
          Back to Home
        </button>
      </div>
    </PlaceholderScreen>
  )
}

// ============================================
// KYC Verification Screens
// ============================================

export function KYCIntro() {
  return (
    <PlaceholderScreen
      title="Identity Verification"
      subtitle="Verify your identity to continue"
      icon={<Check className="w-8 h-8" />}
      color="purple"
    >
      <div className="w-full max-w-xs space-y-4 text-center">
        <p className="text-sm text-slate-500">We need to verify your identity before opening your account. This process takes about 2 minutes.</p>
        <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium">
          Start Verification
        </button>
      </div>
    </PlaceholderScreen>
  )
}

export function KYCDocument() {
  return (
    <PlaceholderScreen
      title="Scan Document"
      subtitle="Passport or ID Card"
      icon={<CreditCard className="w-8 h-8" />}
      color="purple"
    >
      <div className="w-full h-48 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
        <p className="text-sm text-slate-500">Camera Preview</p>
      </div>
      <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium">
        Capture Photo
      </button>
    </PlaceholderScreen>
  )
}

export function KYCSelfie() {
  return (
    <PlaceholderScreen
      title="Take a Selfie"
      subtitle="Center your face"
      icon={<Check className="w-8 h-8" />}
      color="purple"
    >
      <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 mx-auto mb-6 flex items-center justify-center">
        <p className="text-xs text-slate-500">Face</p>
      </div>
      <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium">
        Take Selfie
      </button>
    </PlaceholderScreen>
  )
}

// ============================================
// Screen Component Map
// ============================================

export const screenComponents: Record<string, React.ComponentType> = {
  MobileBankingHome,
  MobileBankingAccounts,
  MobileBankingAccountDetails, // Real account details
  MobileBankingPayments,
  AddMoneyAmount,
  AddMoneySource,
  AddMoneyConfirm,
  AddMoneySuccess,
  KYCIntro,
  KYCDocument,
  KYCSelfie,
}

export function getScreenComponent(componentName: string): React.ComponentType | null {
  return screenComponents[componentName] || null
}
