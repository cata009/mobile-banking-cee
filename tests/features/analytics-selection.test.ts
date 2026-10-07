import { expect, it } from 'vitest'
import { getActiveSplitSelection } from '@/features/analytics/breakdownSelection'

it('allows the rendered Other segment even when only two rows exist', () => {
  const rows = [
    { key: 'big', total: 95 },
    { key: 'small', total: 5 },
  ]
  const segments = [{ category: 'big' }, { category: 'Other' }]
  expect([...getActiveSplitSelection(rows, segments, ['Other'])]).toEqual(['Other'])
})

it('drops stale Other selection when all rows are represented directly', () => {
  const rows = [{ key: 'big' }, { key: 'small' }]
  expect([...getActiveSplitSelection(rows, [{ category: 'big' }, { category: 'small' }], ['Other', 'small'])]).toEqual([
    'small',
  ])
})

it('retains list-only rows folded into Other, removing disappeared keys', () => {
  expect([
    ...getActiveSplitSelection(
      [{ key: 'big' }, { key: 'small' }],
      [{ category: 'big' }, { category: 'Other' }],
      ['small', 'removed'],
    ),
  ]).toEqual(['small'])
})
