import { createHash } from 'node:crypto'
import { expect, it, vi } from 'vitest'
import { FLOW_DEFINITIONS, FLOW_ORDER } from '@/app/screens/flow-library/flows'
vi.mock('react', () => {
  throw new Error('Metadata imported React')
})
const entries = import.meta.glob('/src/flows/**/index.ts', { eager: true })
const paths = ['ro/round-up', 'ro/card-pin', 'ro/genius-my-car', 'shared/ethoca', 'rs/property-insurance']
const ids = ['ro-round-up', 'ro-card-pin', 'ro-genius-my-car', 'mobile-pi-ethoca', 'rs-property-insurance'] as const
it('owns all canonical definitions as identity reexports without UI runtime imports', () => {
  paths.forEach((path, index) => {
    const entry = entries['/src/flows/' + path + '/index.ts']
    expect(entry, path).toBeDefined()
    expect(Object.values(entry as object)).toContain(FLOW_DEFINITIONS[ids[index]!])
  })
  expect(FLOW_ORDER).toEqual([
    'investments-bulk-approval',
    'rs-property-insurance',
    'ro-genius-my-car',
    'mobile-pi-ethoca',
    'ro-round-up',
    'ro-card-pin',
  ])
})

it('preserves every definition field, scenario step, screen kind, rule and copy from the frozen input', () => {
  const hashes = {
    'ro-round-up': '0ee7aa81369a7612853859b9bb29223fc3c21e9c9430ed10fc449fa9ded7bb75',
    'ro-card-pin': '7d54b1b10198e984d5d3e4eef7982c394652ce682105c66b9efbc3b2325778f8',
    'ro-genius-my-car': '237436f01ce3b613e236adcf1c0624e79528e68dcc4acc553f9d873aa313fcf1',
    'mobile-pi-ethoca': 'cda92ca44121ed2a9441fa1593acf24db1871053bcc44ae5eb82411adbc4c2d1',
    'rs-property-insurance': '01c7ce688d0eeedeabb96c3026193a8b38eab12625897eed85134ccedfb3d879',
    'investments-bulk-approval': '08045ce661b862593dc54215c87d5e862386d6a76a3a73558e4514e226b4231e',
  }
  for (const [id, flow] of Object.entries(FLOW_DEFINITIONS))
    expect(createHash('sha256').update(JSON.stringify(flow)).digest('hex')).toBe(hashes[id as keyof typeof hashes])
})
