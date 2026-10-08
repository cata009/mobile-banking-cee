import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import type { ProductCategory } from '@/data/products'
import { deriveProductCategories, type DeriveProductCategoriesInput } from '@/features/products/selectors'

vi.mock('react', () => { throw new Error('Pure product selectors must not load React') })

const cases = JSON.parse(readFileSync(new URL('../fixtures/products/category-contract.json',import.meta.url),'utf8')) as Array<{input:DeriveProductCategoriesInput;expected:ProductCategory[]}>

describe('approved product derivation contract outside React', () => {
  it.each(cases)('preserves $input.country / $input.release / counts $input.resolvedProductCounts.accounts', ({input,expected}) => {
    const before = JSON.stringify(input)
    expect(deriveProductCategories(input)).toEqual(expected)
    expect(JSON.stringify(input)).toBe(before)
  })
})
