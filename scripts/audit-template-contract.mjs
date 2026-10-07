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

function collectTemplateBlocks(source) {
  const ast = ts.createSourceFile('templates.ts', source, ts.ScriptTarget.Latest, true)
  const blocks = []
  const visit = (node) => {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'defineTemplate') {
      const seed = node.arguments[0]
      if (!seed || !ts.isObjectLiteralExpression(seed)) throw new Error('Template seed must be a literal declaration')
      blocks.push(seed)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return blocks
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

export function auditTemplateContract({ readSource = read, exists = fs.existsSync } = {}) {
  const templateRegistry = collectRegistrySource('src/app/registry/templateRegistry.ts', readSource, exists)
  // The dispatcher still owns the `case` arms; the id union moved next to the
  // preview fixture data when TemplateCodePreviews.tsx was split up.
  const templatePreviews = readSource('src/app/components/templates/TemplateCodePreviews.tsx')
  const templateData = readSource('src/app/components/templates/templateData.ts')
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
  const previewIds = collectUnion('TemplateCodePreviewId', templateData)
  const previewCases = new Set()
  const previewAst = ts.createSourceFile(
    'previews.tsx',
    templatePreviews,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const collectCases = (node) => {
    if (ts.isCaseClause(node) && ts.isStringLiteral(node.expression)) previewCases.add(node.expression.text)
    ts.forEachChild(node, collectCases)
  }
  collectCases(previewAst)
  const blocks = collectTemplateBlocks(templateRegistry)

  const componentUnionMissing = [...componentRegistryIds].filter((id) => !componentIds.has(id))
  const componentRegistryMissing = [...componentIds].filter((id) => !componentRegistryIds.has(id))
  const screenRegistryMissing = [...screenIds].filter((id) => !screenRegistryIds.has(id))
  const flowRegistryMissing = [...flowIds].filter((id) => !flowRegistryIds.has(id))

  if (componentUnionMissing.length > 0) {
    throw new Error(`Component registry has ids missing from ComponentId union: ${componentUnionMissing.join(', ')}`)
  }

  if (componentRegistryMissing.length > 0) {
    throw new Error(`ComponentId union has ids missing from component registry: ${componentRegistryMissing.join(', ')}`)
  }

  if (screenRegistryMissing.length > 0) {
    throw new Error(`ScreenId union has ids missing from screen registry: ${screenRegistryMissing.join(', ')}`)
  }

  if (flowRegistryMissing.length > 0) {
    throw new Error(`FlowId union has ids missing from flow registry: ${flowRegistryMissing.join(', ')}`)
  }

  const ids = new Set()
  const codePreviewIds = []

  for (const block of blocks) {
    const id = stringValue(block, 'id')
    if (!id) throw new Error('Template block missing id')
    if (ids.has(id)) throw new Error(`Duplicate template id: ${id}`)
    ids.add(id)

    const screenFamily = stringValue(block, 'screenFamily')
    const relatedScreens = arrayValues(block, 'relatedScreens')
    const relatedComponents = arrayValues(block, 'relatedComponents')
    const templateFlowIds = arrayValues(block, 'flowIds')
    const runtimeScreenId = stringValue(block, 'runtimeScreenId')
    const codePreviewId = stringValue(block, 'codePreviewId')
    const implementationStatus = stringValue(block, 'implementationStatus')

    if (!screenFamily) throw new Error(`${id}: missing screenFamily`)
    if (!relatedScreens || relatedScreens.length === 0) throw new Error(`${id}: missing relatedScreens`)
    if (!templateFlowIds) throw new Error(`${id}: missing flowIds array`)
    if (!relatedComponents || relatedComponents.length === 0) throw new Error(`${id}: missing relatedComponents`)
    if (implementationStatus === 'reconstructed-code' && !codePreviewId) {
      throw new Error(`${id}: reconstructed-code template must define codePreviewId`)
    }

    if (runtimeScreenId && !screenIds.has(runtimeScreenId)) {
      throw new Error(`${id}: unknown runtimeScreenId "${runtimeScreenId}"`)
    }

    if (codePreviewId) {
      codePreviewIds.push(codePreviewId)
      if (!previewIds.has(codePreviewId)) {
        throw new Error(`${id}: unknown codePreviewId "${codePreviewId}"`)
      }
      if (!previewCases.has(codePreviewId)) {
        throw new Error(`${id}: codePreviewId has no TemplateCodePreview switch case "${codePreviewId}"`)
      }
    }

    assertKnown(relatedScreens, screenIds, 'related screen', id)
    assertKnown(templateFlowIds, flowIds, 'flow id', id)
    assertKnown(relatedComponents, componentIds, 'component id', id)
  }

  const unusedPreviewIds = [...previewIds].filter((previewId) => !codePreviewIds.includes(previewId))
  if (unusedPreviewIds.length > 0) {
    throw new Error(`TemplateCodePreviewId values unused by registry: ${unusedPreviewIds.join(', ')}`)
  }

  return {
    templates: blocks.length,
    codePreviews: codePreviewIds.length,
    components: componentIds.size,
    screens: screenIds.size,
    flows: flowIds.size,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const counts = auditTemplateContract()
  console.log(
    `template-contract ok: templates=${counts.templates} codePreviews=${counts.codePreviews} components=${counts.components} screens=${counts.screens} flows=${counts.flows}`,
  )
}
