import fs from 'node:fs'

import { posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const read = (path) => fs.readFileSync(path, 'utf8')

export function collectRegistrySource(entry, readSource = read, exists = fs.existsSync) {
  const sources = []
  const seen = new Set()
  const visit = (file) => {
    if (seen.has(file)) return
    seen.add(file)
    const source = readSource(file)
    sources.push(source)
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
    for (const node of ast.statements) {
      if (!ts.isImportDeclaration(node) || node.importClause?.isTypeOnly || !ts.isStringLiteral(node.moduleSpecifier))
        continue
      const bindings = node.importClause?.namedBindings
      if (
        bindings &&
        ts.isNamedImports(bindings) &&
        !node.importClause.name &&
        bindings.elements.every((item) => item.isTypeOnly)
      )
        continue
      const specifier = node.moduleSpecifier.text
      if (!specifier.startsWith('.') && !specifier.startsWith('@/app/registry/')) {
        throw new Error(`Registry metadata imports runtime outside its declarations: ${file}: ${specifier}`)
      }
      const target = specifier.startsWith('@/')
        ? `src/${specifier.slice(2)}`
        : posix.normalize(posix.join(posix.dirname(file), specifier))
      const resolved = [target, `${target}.ts`, `${target}/index.ts`].find((candidate) => exists(candidate))
      if (!resolved) throw new Error(`Missing registry declaration dependency: ${file}: ${specifier}`)
      visit(resolved)
    }
  }
  visit(entry)
  return sources.join('\n')
}

function collectUnion(typeName, source) {
  const ast = ts.createSourceFile('types.ts', source, ts.ScriptTarget.Latest, true)
  const declaration = ast.statements.find((node) => ts.isTypeAliasDeclaration(node) && node.name.text === typeName)
  if (!declaration) throw new Error(`Could not find ${typeName} union`)
  const values = new Set()
  const visit = (node) => {
    if (ts.isStringLiteral(node)) values.add(node.text)
    ts.forEachChild(node, visit)
  }
  visit(declaration.type)
  return values
}

export function collectObjectKeys(source) {
  const ids = new Set()
  const ast = ts.createSourceFile('registry.ts', source, ts.ScriptTarget.Latest, true)
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isStringLiteral(node.name) &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const id = node.name.text
      if (ids.has(id)) throw new Error(`Duplicate registry id: ${id}`)
      ids.add(id)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return ids
}

function propertyValue(block, key) {
  const property = block.properties.find(
    (node) =>
      ts.isPropertyAssignment(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      node.name.text === key,
  )
  return property?.initializer
}
function stringValue(block, key) {
  const value = propertyValue(block, key)
  return value && ts.isStringLiteral(value) ? value.text : null
}
function arrayValues(block, key) {
  const value = propertyValue(block, key)
  if (!value || !ts.isArrayLiteralExpression(value)) return null
  return value.elements.map((node) => {
    if (!ts.isStringLiteral(node)) throw new Error(`Registry ${key} reference must be a string literal`)
    return node.text
  })
}

function assertKnown(values, known, label, id) {
  for (const value of values ?? []) {
    if (!known.has(value)) {
      throw new Error(`${id}: unknown ${label} "${value}"`)
    }
  }
}

export function auditRegistryContract({ readSource = read, exists = fs.existsSync } = {}) {
  const demoTypes = readSource('src/app/state/demoTypes.ts')
  const componentRegistry = collectRegistrySource('src/app/registry/componentRegistry.ts', readSource, exists)
  const screenRegistry = collectRegistrySource('src/app/registry/screenRegistry.ts', readSource, exists)
  const flowRegistry = readSource('src/app/registry/flowRegistry.ts')
  const componentIds = collectUnion('ComponentId', demoTypes)
  const componentRegistryIds = collectObjectKeys(componentRegistry)
  const screenIds = collectUnion('ScreenId', demoTypes)
  const screenRegistryIds = collectObjectKeys(screenRegistry)
  const flowIds = collectUnion('FlowId', demoTypes)
  const flowRegistryIds = collectObjectKeys(flowRegistry)
  for (const [label, known, declared] of [
    ['ComponentId', componentIds, componentRegistryIds],
    ['ScreenId', screenIds, screenRegistryIds],
    ['FlowId', flowIds, flowRegistryIds],
  ]) {
    const missing = [...known].filter((id) => !declared.has(id))
    const unknown = [...declared].filter((id) => !known.has(id))
    if (missing.length) throw new Error(label + ' union has ids missing from registry: ' + missing.join(', '))
    if (unknown.length) throw new Error(label + ' registry has ids missing from union: ' + unknown.join(', '))
  }
  const ast = ts.createSourceFile('components.ts', componentRegistry, ts.ScriptTarget.Latest, true)
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isStringLiteral(node.name) &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      const id = node.name.text
      if (componentIds.has(id)) {
        const block = node.initializer
        if (stringValue(block, 'id') !== id) throw new Error(id + ': key does not match entry id')
        const screens = arrayValues(block, 'usedByScreens')
        if (!screens) throw new Error(id + ': missing usedByScreens')
        assertKnown(screens, screenIds, 'screen id', id)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return { components: componentIds.size, screens: screenIds.size, flows: flowIds.size }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const counts = auditRegistryContract()
  console.log(
    'registry-contract ok: components=' + counts.components + ' screens=' + counts.screens + ' flows=' + counts.flows,
  )
}
