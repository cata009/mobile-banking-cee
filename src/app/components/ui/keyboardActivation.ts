import type { KeyboardEvent } from 'react'

/** Give an existing visual click surface button semantics without changing its markup. */
export function activateOnKeyboard(event: KeyboardEvent<HTMLElement>): void {
  if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return
  event.preventDefault()
  if (!event.repeat) event.currentTarget.click()
}
