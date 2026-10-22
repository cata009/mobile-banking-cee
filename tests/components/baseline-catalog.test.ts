import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import {
  BASELINE_COMPONENT_CATALOG,
  BASELINE_NATIVE_PILOT_PATHS,
} from '../../src/app/components/contracts/baselineCatalog'
import { COMPONENT_REGISTRY } from '../../src/app/registry/componentRegistry'
import {
  FIGMA_IMPLEMENTATION_GROUPS,
  FIGMA_LIBRARY_FILE_KEY,
  FIGMA_LIBRARY_CAPTURED_ON,
  type FigmaLibraryPage,
} from '../../src/app/screens/design-system/figmaLibraryCatalog'
import legacyInventory from './fixtures/baseline-legacy-inventory.json'
import currentInventory from './fixtures/figma-implementation-groups.json'

describe('baseline catalog provenance and boundaries', () => {
  it('preserves every legacy baseline entry from the original HEAD inventory exactly once', () => {
    // Frozen from inventoryNav.ts at the recorded commit, before the Figma-driven catalog migration.
    expect(legacyInventory.baseCommit).toBe('700c23395e1481225e0bc594d2b56ff8f50c6000')
    const ids = BASELINE_COMPONENT_CATALOG.map((entry) => entry.id)
    expect(new Set(legacyInventory.ids).size).toBe(legacyInventory.ids.length)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(legacyInventory.ids.filter((id) => id !== 'TemplateCodePreview').sort())
  })
  it('preserves the current consolidated catalog and its real implementation sources exactly once', () => {
    expect(currentInventory.fileKey).toBe(FIGMA_LIBRARY_FILE_KEY)
    expect(currentInventory.capturedOn).toBe(FIGMA_LIBRARY_CAPTURED_ON)
    expect(FIGMA_IMPLEMENTATION_GROUPS).toHaveLength(71)
    expect(new Set(FIGMA_IMPLEMENTATION_GROUPS.map((group) => group.id)).size).toBe(71)
    const actual = FIGMA_IMPLEMENTATION_GROUPS.map((group) => {
      expect(group.implementations[0], group.id).toBe(group.id)
      expect(new Set(group.implementations).size, group.id).toBe(group.implementations.length)
      expect(group.sources.length, group.id).toBeGreaterThan(0)
      expect(group.family.nodeId, group.id).toBe(group.sources[0]?.nodeId)
      return {
        id: group.id,
        implementations: group.implementations.map((id) => {
          const implementation = COMPONENT_REGISTRY[id as keyof typeof COMPONENT_REGISTRY]
          expect(implementation, id).toBeDefined()
          expect(implementation.id, id).toBe(id)
          const sourcePaths = implementation.componentPath.split(' + ')
          for (const source of sourcePaths) expect(existsSync(resolve(source)), `${id}: ${source}`).toBe(true)
          return { id, sourcePaths }
        }),
        familyIds: group.sources.map((family) => family.nodeId),
      }
    })
    expect(actual).toEqual(currentInventory.entries)
  })
  it('retains exact Figma family and variant identities from the canonical source inventory', () => {
    const snapshot: { pages: FigmaLibraryPage[] } = JSON.parse(
      readFileSync(resolve('docs/tasks/design-system-figma-source-2026-10-20.json'), 'utf8'),
    )
    const canonical = new Map(snapshot.pages.flatMap((page) => page.families).map((family) => [family.nodeId, family]))
    const sources = FIGMA_IMPLEMENTATION_GROUPS.flatMap((group) => group.sources)
    expect(new Set(sources.map((family) => family.nodeId)).size).toBe(sources.length)
    for (const source of sources) {
      const family = canonical.get(source.nodeId)
      expect(family, source.nodeId).toBeDefined()
      expect(source.key, source.nodeId).toBe(family!.key)
      expect(source.name, source.nodeId).toBe(family!.name)
      expect(source.variants, source.nodeId).toEqual(family!.variants)
    }
  })
  it('references real implementations and keeps host/compositions distinct from extracted leaves', () => {
    for (const entry of BASELINE_COMPONENT_CATALOG) {
      expect(existsSync(resolve(entry.source)), entry.id).toBe(true)
      for (const contract of entry.contracts) expect(existsSync(resolve(contract)), contract).toBe(true)
      if (entry.scope === 'contract-boundary') {
        expect(entry.contracts.length, entry.id).toBeGreaterThan(0)
        expect(entry.evidence, entry.id).toBeTruthy()
      }
      if (entry.scope === 'preview-host') expect(entry.evidence).toBeNull()
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
