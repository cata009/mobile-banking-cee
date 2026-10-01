import { createContext, type Context } from 'react'
import type { MyCarSession } from './geniusMyCarSession'

// Preserve the provider/consumer identity across Vite updates. An open prototype
// can otherwise retain its provider while consumers receive a fresh context.
const previousContext = import.meta.hot?.data.myCarSessionContext as Context<MyCarSession | null> | undefined
export const MyCarSessionContext = previousContext ?? createContext<MyCarSession | null>(null)
if (import.meta.hot) import.meta.hot.data.myCarSessionContext = MyCarSessionContext
