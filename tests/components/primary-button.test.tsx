// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PrimaryButton from '@/app/components/PrimaryButton'

afterEach(cleanup)

describe('PrimaryButton', () => {
  it('matches the design-system Primary disabled state', () => {
    render(<PrimaryButton disabled>Move money</PrimaryButton>)

    expect(screen.getByRole('button', { name: 'Move money' })).toHaveClass(
      'h-[48px]',
      'w-full',
      'rounded',
      'bg-[var(--uc-action-strong)]',
      'text-[var(--uc-static-white)]',
      'opacity-30',
      'uc-type-h2',
    )
  })
})
