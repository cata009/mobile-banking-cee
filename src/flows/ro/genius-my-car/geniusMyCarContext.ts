import { createContext, type Context } from 'react'
import type { MyCarSession } from '@/flows/ro/genius-my-car/geniusMyCarSession'

// Preserve the provider/consumer identity across Vite updates. An open prototype
// can otherwise retain its provider while consumers receive a fresh context.
interface MyCarHotData {
  myCarSessionContext?: Context<MyCarSession | null>
}

export function getMyCarSessionContext(data?: MyCarHotData): Context<MyCarSession | null> {
  const context = data?.myCarSessionContext ?? createContext<MyCarSession | null>(null)
  if (data) data.myCarSessionContext = context
  return context
}

export const MyCarSessionContext = getMyCarSessionContext(import.meta.hot?.data)
