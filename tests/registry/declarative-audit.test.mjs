import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  auditTemplateContract,
  collectObjectKeys,
  collectRegistrySource,
} from '../../scripts/audit-template-contract.mjs'
const readSource = (path) => fs.readFileSync(path, 'utf8')
function alteredReader(target, change) {
  return (path) => (change && path === target ? change(readSource(path)) : readSource(path))
}
describe('composed template audit', () => {
  it('audits every canonical component, screen and template domain', () => {
    expect(auditTemplateContract()).toEqual({
      templates: 47,
      codePreviews: 47,
      components: 100,
      screens: 39,
      flows: 14,
    })
  })
  it('rejects an invalid reference within a nested template declaration', () => {
    const read = alteredReader('src/app/registry/domains/services/templates.ts', (source) =>
      source.replace(/(['"])messages\.inbox-list\1/, '"invalid.reference"'),
    )
    expect(() => auditTemplateContract({ readSource: read })).toThrow('unknown component id "invalid.reference"')
  })
  it('rejects duplicate IDs across separate canonical domains', () => {
    const read = alteredReader(
      'src/app/registry/domains/services/components.ts',
      (source) => source + '\nconst duplicate={"ui.primary-button": {id:"ui.primary-button"}};\n',
    )
    expect(() => auditTemplateContract({ readSource: read })).toThrow('Duplicate registry id: ui.primary-button')
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
