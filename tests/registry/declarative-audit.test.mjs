import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  auditRegistryContract,
  collectObjectKeys,
  collectRegistrySource,
} from '../../scripts/audit-registry-contract.mjs'
const readSource = (path) => fs.readFileSync(path, 'utf8')
function alteredReader(target, change) {
  return (path) => (change && path === target ? change(readSource(path)) : readSource(path))
}
describe('composed registry audit', () => {
  it('audits every canonical component, screen and flow domain', () => {
    expect(auditRegistryContract()).toEqual({
      components: 134,
      screens: 40,
      flows: 14,
    })
  })
  it('rejects an invalid reference within a nested component declaration', () => {
    const read = alteredReader('src/app/registry/domains/services/components.ts', (source) =>
      source.replace(/(['"])pi\.messages\.overview\1/, '"invalid.reference"'),
    )
    expect(() => auditRegistryContract({ readSource: read })).toThrow('unknown screen id "invalid.reference"')
  })
  it('rejects duplicate IDs across separate canonical domains', () => {
    const read = alteredReader(
      'src/app/registry/domains/services/components.ts',
      (source) => source + '\nconst duplicate={"ui.primary-button": {id:"ui.primary-button"}};\n',
    )
    expect(() => auditRegistryContract({ readSource: read })).toThrow('Duplicate registry id: ui.primary-button')
  })
  it('does not depend on formatting to find component IDs', () => {
    expect([...collectObjectKeys('const fixtures={"compact.id":{id:"compact.id"}}')]).toEqual(['compact.id'])
  })
  it('follows nested imports once and ignores type-only renderer contracts', () => {
    const files = new Map([
      ['src/app/registry/root.ts', "import {data} from './nested/data'; import type {View} from '../components/View';"],
      [
        'src/app/registry/nested/data.ts',
        'import {root} from \'../root\'; export const data = {"nested.id":{id:"nested.id"}}',
      ],
    ])
    const source = collectRegistrySource(
      'src/app/registry/root.ts',
      (file) => files.get(file),
      (file) => files.has(file),
    )
    expect([...collectObjectKeys(source)]).toEqual(['nested.id'])
  })
  it('rejects runtime UI dependencies and missing domain imports', () => {
    expect(() =>
      collectRegistrySource(
        'src/app/registry/root.ts',
        () => "import {useState} from 'react';",
        () => false,
      ),
    ).toThrow('imports runtime outside')
    expect(() =>
      collectRegistrySource(
        'src/app/registry/root.ts',
        () => "import {data} from './absent';",
        () => false,
      ),
    ).toThrow('Missing registry declaration dependency')
  })
})
