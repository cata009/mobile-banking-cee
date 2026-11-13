// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import WalletButton from '@/app/components/ui/WalletButton'

afterEach(cleanup)

describe('WalletButton Figma contract', () => {
  it('keeps the long Apple Wallet and Click to Pay actions at their source dimensions', () => {
    render(
      <>
        <WalletButton kind="apple-wallet" size="long" />
        <WalletButton kind="click-to-pay" size="long" />
      </>,
    )

    const appleWallet = screen.getByRole('button', { name: 'Add to Apple Wallet' })
    const clickToPay = screen.getByRole('button', { name: 'Add to Click to Pay' })

    for (const button of [appleWallet, clickToPay]) {
      expect(button).toHaveClass('h-[48px]', 'w-[327px]', 'rounded-[8px]')
    }

    expect(clickToPay.querySelector('span[aria-hidden="true"]')).toHaveClass(
      'h-[24px]',
      'w-[38.4px]',
    )
  })
})
