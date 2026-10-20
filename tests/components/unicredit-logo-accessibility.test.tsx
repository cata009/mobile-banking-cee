// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import UniCreditLogo from '@/app/components/UniCreditLogo'

afterEach(cleanup)

describe('UniCredit logo image semantics', () => {
  it('excludes a decorative logo from the accessibility tree', () => {
    const { container } = render(<UniCreditLogo />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('svg')).toHaveAttribute('focusable', 'false')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('announces a meaningful logo once and preserves the vector artwork', () => {
    const { container, rerender } = render(<UniCreditLogo />)
    const artwork = container.querySelector('svg')!.innerHTML
    rerender(<UniCreditLogo ariaLabel="UniCredit Bank" />)
    const logo = screen.getByRole('img', { name: 'UniCredit Bank' })
    expect(logo).not.toHaveAttribute('aria-hidden')
    expect(logo).toHaveAttribute('width', '174')
    expect(logo).toHaveAttribute('height', '24')
    expect(logo).toHaveAttribute('viewBox', '0 0 174 24')
    expect(logo.innerHTML).toBe(artwork)
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })
})
