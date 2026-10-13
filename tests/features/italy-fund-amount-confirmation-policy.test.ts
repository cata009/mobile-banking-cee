import { expect, it } from 'vitest'
import { requiresFundAmountConfirmation } from '@/features/investments/mobileFirstFunds'

it.each([0, 50, 100, 4999.99, 5000, 5000.01, 100000, Number.NaN, Number.POSITIVE_INFINITY])(
  'retains the source amount-confirmation boundary at %s',
  (amount) => {
    for (const accepted of [false, true])
      expect(requiresFundAmountConfirmation(amount, accepted)).toBe(amount >= 5000 && !accepted)
  },
)
