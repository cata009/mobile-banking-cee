import { expect, it } from 'vitest'
import { formatGroupCount } from '@/features/products/groupCount'

const translate = (key: string) => key.endsWith('oneProduct') ? 'product' : 'products'
it.each([[undefined, null], [0, null], [-1, null], [1, 'product'], [3, '3 products']] as const)('formats %s products consistently', (count, expected) => {
  expect(formatGroupCount(count, translate)).toBe(expected)
})
