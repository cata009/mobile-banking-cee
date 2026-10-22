import { describe, expect, it, vi } from 'vitest'
import {
  createPillSortingModel,
  SORTING_OPTIONS,
  resolvePill,
  PILL_SORTING_CONTRACT,
} from '@/app/components/contracts/pill'

describe('controlled pill sorting contract', () => {
  it('keeps loading busy and blocked without visually treating it as unavailable', () => {
    expect(resolvePill({ variant: 'loading-counter' })).toMatchObject({
      disabled: true,
      busy: true,
      opacity: 1,
      lineHeight: 15,
    })
    expect(resolvePill({ disabled: true })).toMatchObject({ disabled: true, opacity: 0.5 })
    expect(PILL_SORTING_CONTRACT.lineHeight).toBe(15)
  })
  it('preserves legacy callback values without changing the selected value itself', () => {
    const onChange = vi.fn()
    const model = createPillSortingModel(SORTING_OPTIONS, 'max-percent', onChange)
    model.activate('min-value')
    expect(onChange.mock.calls).toEqual([['min-value']])
    expect(model.value).toBe('max-percent')
  })

  it('forwards only supplied custom values and leaves a null selection controlled by the caller', () => {
    const options = [
      { value: 'date', label: 'Newest' },
      { value: 'amount', label: 'Amount' },
    ] as const
    const onChange = vi.fn()
    const model = createPillSortingModel(options, null, onChange)
    model.activate('not-an-option')
    expect(onChange).not.toHaveBeenCalled()
    model.activate('amount')
    expect(onChange.mock.calls).toEqual([['amount']])
    expect(model.value).toBeNull()
  })
})
