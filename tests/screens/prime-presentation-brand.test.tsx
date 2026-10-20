// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import type { ReactNode } from 'react'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import PrimePresentation from '@/flows/shared/prime/presentation/PrimePresentation'
import type { PrimePresentationModel } from '@/flows/shared/prime/presentation/contracts'

const fixture = vi.hoisted(() => ({ moment: 'discover' as 'discover' | 'connect' | 'benefits' }))

vi.mock('@/flows/shared/prime/presentation/PrimePresentationController', () => ({
  PrimePresentationController: ({ children }: { children: (model: PrimePresentationModel) => ReactNode }) =>
    children({
      segment: 'prime',
      serviceActive: true,
      screen: 'prime-home',
      moment: fixture.moment,
      isCalling: false,
      phone: <div>Live phone</div>,
      selectSegment: vi.fn(),
      setStandardServiceActive: vi.fn(),
      selectMoment: vi.fn(),
      restart: vi.fn(),
      nextMoment: vi.fn(),
      previousMoment: vi.fn(),
    }),
}))

afterEach(() => {
  cleanup()
  fixture.moment = 'discover'
})

it('announces the official two-line PRIME lockup once and retains its vector artwork in ink', () => {
  const { container } = render(
    <PrimePresentation mode="page" onClose={vi.fn()} presentationUrl="http://localhost:4004/?presentation=prime" />,
  )
  const logo = screen.getByRole('img', { name: 'Prime by UniCredit Bank' })
  expect(within(logo).getByText('Prime')).toBeInTheDocument()
  expect(within(logo).getByText('by')).toBeInTheDocument()
  expect(within(logo).queryByRole('img')).not.toBeInTheDocument()
  expect(logo.querySelectorAll('svg')).toHaveLength(2)
  expect(logo.querySelector('[data-prime-brand-bank] svg path[fill="#222222"]')).not.toBeNull()
  expect(logo.querySelector('[data-prime-brand-bank] svg path[fill="var(--uc-brand)"]')).not.toBeNull()
  expect(container.querySelector('.prime-presentation-brand-divider')).toBeNull()
  expect(screen.getByRole('button', { name: 'Copy presentation link' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Close presentation' })).toBeInTheDocument()
})

it('gives each moment its own approved photograph and exposes only the selected story image', () => {
  const props = {
    mode: 'page' as const,
    onClose: vi.fn(),
    presentationUrl: 'http://localhost:4004/?presentation=prime',
  }
  const { container, rerender } = render(<PrimePresentation {...props} />)
  const images = Array.from(container.querySelectorAll<HTMLImageElement>('.prime-presentation-photo-image'))
  expect(images).toHaveLength(3)
  expect(new Set(images.map((image) => image.src)).size).toBe(3)
  for (const [moment, alt] of [
    ['discover', 'A customer using mobile banking in a warm architectural setting'],
    ['connect', 'An advisor and client discussing their plans together'],
    ['benefits', 'A couple enjoying the evening aboard a sailing boat'],
  ] as const) {
    fixture.moment = moment
    rerender(<PrimePresentation {...props} />)
    expect(
      screen.getAllByRole('img').map((image) => image.getAttribute('aria-label') ?? image.getAttribute('alt')),
    ).toEqual(['Prime by UniCredit Bank', alt])
    expect(screen.getByRole('img', { name: alt })).toHaveAttribute('data-active', 'true')
  }
})
