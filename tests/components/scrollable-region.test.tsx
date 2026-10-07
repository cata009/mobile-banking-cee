// @vitest-environment jsdom
import { createRef } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
afterEach(cleanup)
it('keeps a named scroll region focusable and forwards its native ref and keyboard events', () => {
  const ref=createRef<HTMLDivElement>()
  const arrow=vi.fn()
  render(<ScrollableRegion ref={ref} aria-label="Accounts" className="overflow-x-auto" onKeyDown={arrow}><button>Account details</button></ScrollableRegion>)
  const region=screen.getByRole('region',{name:'Accounts'})
  expect(region.tagName).toBe('DIV')
  expect(region).toHaveAttribute('tabindex','0')
  expect(ref.current).toBe(region)
  fireEvent.keyDown(region,{key:'ArrowRight'})
  expect(arrow).toHaveBeenCalledOnce()
  expect(screen.getByRole('button',{name:'Account details'})).toBeInTheDocument()
})
