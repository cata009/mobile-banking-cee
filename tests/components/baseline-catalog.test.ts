import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import {
  BASELINE_COMPONENT_CATALOG,
  BASELINE_NATIVE_PILOT_PATHS,
} from '../../src/app/components/contracts/baselineCatalog'

describe('baseline catalog provenance and boundaries', () => {
  it('accounts for every design-system inventory entry exactly once', () => {
    const source = readFileSync(resolve('src/app/screens/design-system/inventoryNav.ts'), 'utf8')
    const list = source.match(/const activeComponentFiles = \[([\s\S]*?)\];/)?.[1]
    expect(list).toBeDefined()
    const inventory = [...list!.matchAll(/"([^"]+)"/g)].map((match) => match[1])
    const ids = BASELINE_COMPONENT_CATALOG.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(inventory.sort())
  })
  it('references real implementations and keeps host/compositions distinct from extracted leaves', () => {
    for (const entry of BASELINE_COMPONENT_CATALOG) {
      expect(existsSync(resolve(entry.source)), entry.id).toBe(true)
      for (const contract of entry.contracts) expect(existsSync(resolve(contract)), contract).toBe(true)
      if (entry.scope === 'contract-boundary') {
        expect(entry.contracts.length, entry.id).toBeGreaterThan(0)
        expect(entry.evidence, entry.id).toBeTruthy()
      }
      if (entry.scope === 'preview-host' || entry.scope === 'documentation') expect(entry.evidence).toBeNull()
    }
    for (const file of BASELINE_NATIVE_PILOT_PATHS) expect(existsSync(resolve(file)), file).toBe(true)
    expect(BASELINE_COMPONENT_CATALOG.find((entry) => entry.id === 'CodeField')?.scope).toBe('ds-or-other-experience')
    expect(BASELINE_COMPONENT_CATALOG.find((entry) => entry.id === 'ProfileAvatar')?.scope).toBe(
      'ds-or-other-experience',
    )
    expect(BASELINE_COMPONENT_CATALOG.find((entry) => entry.id === 'PrimeScreen')?.scope).toBe('composition')
  })
  it('keeps catalog and all family contracts free of UI runtime imports', () => {
    const directory = resolve('src/app/components/contracts')
    for (const file of readdirSync(directory).filter((name) => name.endsWith('.ts'))) {
      const ast = ts.createSourceFile(
        file,
        readFileSync(resolve(directory, file), 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      )
      for (const statement of ast.statements) {
        if (
          !ts.isImportDeclaration(statement) ||
          statement.importClause?.isTypeOnly ||
          !ts.isStringLiteral(statement.moduleSpecifier)
        )
          continue
        const bindings = statement.importClause?.namedBindings
        if (
          bindings &&
          ts.isNamedImports(bindings) &&
          !statement.importClause?.name &&
          bindings.elements.every((element) => element.isTypeOnly)
        )
          continue
        const module = statement.moduleSpecifier.text
        expect(module, `${file} must not import UI runtime`).not.toMatch(
          /^(react|react-dom|react-native)|contexts|\.tsx$/,
        )
        expect(file, 'catalog consists of metadata, not runtime dependencies').not.toBe('baselineCatalog.ts')
      }
    }
  })
})
