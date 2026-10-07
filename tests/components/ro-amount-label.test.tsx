// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { RoAmountField } from '@/app/screens/kids/ro/ui'
afterEach(cleanup)
it('associates an external amount label with the actual native input', () => {
  render(<><label htmlFor="goal-target-amount">Goal target amount</label><RoAmountField id="goal-target-amount" value="50" onChange={() => undefined} /></>)
  expect(screen.getByLabelText('Goal target amount')).toHaveValue('50')
})
