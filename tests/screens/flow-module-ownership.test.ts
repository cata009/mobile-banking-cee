import { createHash } from 'node:crypto'
import { expect, it, vi } from 'vitest'
import { FLOW_DEFINITIONS, FLOW_ORDER } from '@/app/screens/flow-library/flows'
vi.mock('react', () => {
  throw new Error('Metadata imported React')
})
const entries = import.meta.glob('/src/flows/**/index.ts', { eager: true })
const paths = ['ro/genius-my-car', 'shared/ethoca', 'rs/property-insurance', 'rs/disposable-cards']
const ids = ['ro-genius-my-car', 'mobile-pi-ethoca', 'rs-property-insurance', 'rs-disposable-cards'] as const
it('owns all canonical definitions as identity reexports without UI runtime imports', () => {
  paths.forEach((path, index) => {
    const entry = entries['/src/flows/' + path + '/index.ts']
    expect(entry, path).toBeDefined()
    expect(Object.values(entry as object)).toContain(FLOW_DEFINITIONS[ids[index]!])
  })
  expect(FLOW_ORDER).toEqual([
    'investments-bulk-approval',
    'rs-property-insurance',
    'rs-disposable-cards',
    'ro-genius-my-car',
    'mobile-pi-ethoca',
  ])
})

it('preserves every definition field, scenario step, screen kind, rule and copy from the frozen input', () => {
  const hashes = {
    'ro-genius-my-car': '237436f01ce3b613e236adcf1c0624e79528e68dcc4acc553f9d873aa313fcf1',
    'mobile-pi-ethoca': 'cda92ca44121ed2a9441fa1593acf24db1871053bcc44ae5eb82411adbc4c2d1',
    'rs-property-insurance': '01c7ce688d0eeedeabb96c3026193a8b38eab12625897eed85134ccedfb3d879',
    'rs-disposable-cards': 'c5b9e620eb524fccfdc1552c4afeb718594e8fb29cf23bd416867236a70da0dd',
    'investments-bulk-approval': '7be32e96f08ba2d4271990e63e1059b756fcf2f438584ab951eb2b8b684b6f91',
  }
  for (const [id, flow] of Object.entries(FLOW_DEFINITIONS))
    expect(createHash('sha256').update(JSON.stringify(flow)).digest('hex')).toBe(hashes[id as keyof typeof hashes])
})
