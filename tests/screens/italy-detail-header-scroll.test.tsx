// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import MobileFirstCards from '@/experiences/pi/it/mobile-first/MobileFirstCards'
import MobileFirstCardsMovement from '@/experiences/pi/it/mobile-first/MobileFirstCardsMovement'
import MobileFirstDetailHeader from '@/experiences/pi/it/mobile-first/MobileFirstDetailHeader'
import { getItalyFinancialSnapshot, resetItalyFinancialState } from '@/features/finance/italyFinancials'
import { getCardLedgerMovements } from '@/features/cards/mobileFirstCards'

afterEach(cleanup)
beforeEach(resetItalyFinancialState)

test('renders the padded Help and Close exports at their original 40px canvas size', () => {
  render(<MobileFirstDetailHeader onBack={() => {}} onHelp={() => {}} onClose={() => {}} />)
  for (const label of ['Aiuto', 'Chiudi']) {
    const icon = screen.getByRole('button', { name: label }).querySelector('img')!
    expect(icon.getAttribute('width')).toBe('40')
    expect(icon.getAttribute('height')).toBe('40')
  }
  expect(screen.getByRole('button', { name: 'Indietro' }).querySelector('img')!.getAttribute('width')).toBe('24')
})

test('keeps a card movement category inside the sticky title band rather than under its mask', () => {
  const movement = getCardLedgerMovements('flexia', getItalyFinancialSnapshot())[0]!
  render(
    <MobileFirstCardsMovement
      movement={movement}
      filter={{}}
      onApplyFilter={() => {}}
      onChange={() => {}}
      onClose={() => {}}
      hidden={false}
      onNotice={() => {}}
    />,
  )
  const title = screen.getByRole('heading', { name: movement.name, level: 1 })
  const band = title.closest('.mfc-page-heading')
  expect(band).not.toBeNull()
  expect(within(band as HTMLElement).getByText(movement.category)).toBeDefined()
})

test('restores the card scroll offset after opening and closing a movement', () => {
  render(
    <DemoProvider initialState={{ product: 'PI', country: 'IT', designSystem: 'mobile-first' }}>
      <MobileFirstCards onClose={() => {}} initialView="detail" initialCardId="flexia" />
    </DemoProvider>,
  )
  const body = screen.getByRole('region', { name: 'Carta e movimenti' })
  fireEvent.scroll(body, { target: { scrollTop: 420 } })
  const movement = screen.getAllByRole('button', { name: /^Movimento / })[0]!
  fireEvent.click(movement)
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  expect(screen.getByRole('region', { name: 'Carta e movimenti' }).scrollTop).toBe(420)
  expect(screen.getByRole('button', { name: 'Nascondi importi' })).toBeDefined()
})
