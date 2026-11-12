import { createContext } from 'react'

/**
 * The toolbar slot above a live preview. Variant selectors rendered inside a preview portal their control here,
 * so every component keeps its variant control in the same place, whatever its specimen layout.
 */
export const PreviewControlSlotContext = createContext<HTMLElement | null>(null)
