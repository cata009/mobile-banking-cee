#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import path from 'node:path'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts'])
const RESOLVABLE_EXTENSIONS = [
  ...CODE_EXTENSIONS,
  '.json',
  '.css',
  '.scss',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.woff',
  '.woff2',
]
const EXCLUDED_DIRECTORIES = new Set(['.git', '.codex-temp', 'node_modules', 'dist', 'build', 'coverage', 'android', 'ios', '.expo'])
const DEFAULT_SOURCE_MANIFEST = '.codex-temp/pi-wide-migration/luna-15/legacy-pi-consumer-manifest.json'
const DEFAULT_ADAPTER_CANDIDATES = '.codex-temp/pi-wide-migration/luna-4/native-adapter-candidates.json'
const DEFAULT_ADAPTER_APPROVALS = 'scripts/native-spike/pi-native-compat-adapters.json'
const DEFAULT_OUTPUT = '.codex-temp/pi-wide-migration/luna-4/retired-pi-ui-manifest.json'
const NATIVE_EQUIVALENT_EVIDENCE = [
  {
    sourcePath: 'src/app/screens/cards/CreditLimitOfferFlow.tsx',
    nativePath: 'native-spike/src/experiences/pi/current/baseline/CreditLimitOfferFlow.tsx',
    tests: ['native-spike/__tests__/credit-limit-offer-native.test.tsx'],
  },
  {
    sourcePath: 'src/app/screens/payments/Evo2027DomesticPaymentFlow.tsx',
    nativePath: 'native-spike/src/experiences/pi/cz/evo-2027/payments/PaymentFlow.tsx',
    tests: [
      'native-spike/__tests__/cz-evo-payments.test.tsx',
      'native-spike/__tests__/cz-evo-payments-fidelity.test.tsx',
      'native-spike/__tests__/pi-wide-evo-controlled-payment.test.tsx',
    ],
  },
]
const toRepoPath = (root, value) => path.relative(root, value).split(path.sep).join('/')
const isFile = (value) => {
  try {
    return statSync(value).isFile()
  } catch {
    return false
  }
}
const isWithin = (root, value) => {
  const relative = path.relative(root, value)
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))
}

function walkCodeFiles(root, directories) {
  const files = new Set()
  const visit = (directory) => {
    if (!existsSync(directory)) return
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRECTORIES.has(entry.name)) visit(path.join(directory, entry.name))
        continue
      }
      if (CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.add(toRepoPath(root, path.join(directory, entry.name)))
      }
    }
  }
  for (const directory of directories) visit(path.join(root, directory))
  return [...files].sort()
}

function resolveLocalSpecifier(root, importer, rawSpecifier) {
  const specifier = rawSpecifier.replace(/[?#].*$/, '')
  let unresolved
  if (specifier.startsWith('@/')) unresolved = path.join(root, 'src', specifier.slice(2))
  else if (specifier.startsWith('src/')) unresolved = path.join(root, specifier)
  else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    unresolved = path.resolve(root, path.dirname(importer), specifier)
  } else {
    return null
  }
  if (!isWithin(root, unresolved)) return null
  const candidates = [unresolved]
  if (!path.extname(unresolved)) {
    for (const extension of RESOLVABLE_EXTENSIONS) candidates.push(unresolved + extension)
    for (const extension of RESOLVABLE_EXTENSIONS) candidates.push(path.join(unresolved, 'index' + extension))
  }
  const match = candidates.find(isFile)
  return {
    path: match ? toRepoPath(root, match) : null,
    unresolvedPath: toRepoPath(root, unresolved),
    raw: rawSpecifier.includes('?raw'),
  }
}

function scriptKindFor(file) {
  const extension = path.extname(file).toLowerCase()
  if (extension === '.tsx') return ts.ScriptKind.TSX
  if (extension === '.jsx') return ts.ScriptKind.JSX
  if (['.js', '.mjs', '.cjs'].includes(extension)) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

function importClauseIsTypeOnly(clause) {
  if (!clause) return false
  if (clause.isTypeOnly) return true
  if (clause.name) return false
  if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
    const elements = clause.namedBindings.elements
    return elements.length > 0 && elements.every((element) => element.isTypeOnly)
  }
  return false
}

function extractModuleEdges(root, file, sourceText) {
  const edges = []
  const dynamicPatterns = []
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, scriptKindFor(file))
  const add = (specifier, kind, node) => {
    const resolution = resolveLocalSpecifier(root, file, specifier)
    if (!resolution) return
    edges.push({
      from: file,
      to: resolution.path,
      unresolvedPath: resolution.path ? null : resolution.unresolvedPath,
      specifier,
      kind: resolution.raw ? 'raw-source' : kind,
      line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
    })
  }
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      add(node.moduleSpecifier.text, importClauseIsTypeOnly(node.importClause) ? 'type-only' : 'runtime', node)
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      add(node.moduleSpecifier.text, node.isTypeOnly ? 'type-only' : 'runtime', node)
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
      add(node.argument.literal.text, 'type-only', node)
    } else if (ts.isCallExpression(node)) {
      const argument = node.arguments[0]
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        if (argument && ts.isStringLiteral(argument)) add(argument.text, 'dynamic', node)
        else dynamicPatterns.push({
          file,
          expression: node.getText(sourceFile),
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
        })
      } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require' && argument && ts.isStringLiteral(argument)) {
        add(argument.text, 'runtime', node)
      } else if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'glob' &&
        ts.isMetaProperty(node.expression.expression) &&
        argument &&
        ts.isStringLiteral(argument)
      ) {
        dynamicPatterns.push({
          file,
          expression: 'import.meta.glob(' + JSON.stringify(argument.text) + ')',
          pattern: argument.text,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return { edges, dynamicPatterns }
}

function buildImportGraph(root, files) {
  const edges = []
  const dynamicPatterns = []
  for (const file of files) {
    const parsed = extractModuleEdges(root, file, readFileSync(path.join(root, file), 'utf8'))
    edges.push(...parsed.edges)
    dynamicPatterns.push(...parsed.dynamicPatterns)
  }
  return { edges, dynamicPatterns }
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text
  return null
}

function literalValue(node) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : null
}

function readStringArray(objectLiteral, property) {
  const assignment = objectLiteral.properties.find((item) => ts.isPropertyAssignment(item) && propertyName(item.name) === property)
  if (!assignment || !ts.isArrayLiteralExpression(assignment.initializer)) return []
  return assignment.initializer.elements.map(literalValue).filter(Boolean)
}

function unwrapTypeWrappers(expression) {
  let current = expression
  while (
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression
  }
  return current
}

function parseScreenMetadata(root, files) {
  const records = []
  for (const file of files.filter((candidate) => candidate.startsWith('src/app/registry/domains/') && candidate.endsWith('/screens.ts'))) {
    const source = ts.createSourceFile(file, readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const visit = (node) => {
      if (ts.isPropertyAssignment(node) && ts.isObjectLiteralExpression(node.initializer)) {
        const screenKey = propertyName(node.name)
        if (screenKey && screenKey.startsWith('pi.')) {
          const properties = node.initializer.properties.filter(ts.isPropertyAssignment)
          const getString = (key) => literalValue(properties.find((item) => propertyName(item.name) === key)?.initializer)
          const componentPath = getString('componentPath')
          if (componentPath) {
            records.push({
              screenId: getString('id') ?? screenKey,
              componentPath: componentPath.split(path.sep).join('/'),
              products: readStringArray(node.initializer, 'products'),
              countries: readStringArray(node.initializer, 'countries'),
              designSystems: readStringArray(node.initializer, 'designSystems'),
              file,
            })
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return records
}

function parseExperienceSourceModules(root, files) {
  const records = []
  for (const file of files.filter((candidate) => candidate.startsWith('src/experiences/') && candidate.endsWith('/manifest.ts'))) {
    const source = ts.createSourceFile(file, readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue
      for (const declaration of statement.declarationList.declarations) {
        if (!declaration.initializer) continue
        const initializer = unwrapTypeWrappers(declaration.initializer)
        if (!ts.isObjectLiteralExpression(initializer)) continue
        const objectLiteral = initializer
        const properties = objectLiteral.properties.filter(ts.isPropertyAssignment)
        const getString = (key) => literalValue(properties.find((item) => propertyName(item.name) === key)?.initializer)
        const sourceModules = readStringArray(objectLiteral, 'sourceModules')
        const experienceId = getString('id') ?? (ts.isIdentifier(declaration.name) ? declaration.name.text : file)
        const releases = readStringArray(objectLiteral, 'releases')
        for (const sourceModule of sourceModules) {
          records.push({
            path: normalizeReferencedPath(sourceModule),
            consumer: file,
            experienceId,
            product: getString('product'),
            country: getString('country'),
            releases,
            kind: 'experience-sourceModules-metadata',
          })
        }
      }
    }
  }
  return records
}

function addConsumer(map, target, consumer) {
  if (!target) return
  const list = map.get(target) ?? []
  list.push(consumer)
  map.set(target, list)
}

function buildAdjacency(edges, includeTypeOnly = false) {
  const graph = new Map()
  for (const edge of edges) {
    if (!edge.to || edge.kind === 'raw-source' || (!includeTypeOnly && edge.kind === 'type-only')) continue
    const list = graph.get(edge.from) ?? []
    list.push(edge.to)
    graph.set(edge.from, list)
  }
  return graph
}

function walkReachable(roots, graph) {
  const reached = new Set()
  const previous = new Map()
  const queue = []
  for (const root of roots) {
    if (!root || reached.has(root)) continue
    reached.add(root)
    queue.push(root)
  }
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor]
    for (const child of graph.get(current) ?? []) {
      if (reached.has(child)) continue
      reached.add(child)
      previous.set(child, current)
      queue.push(child)
    }
  }
  return { reached, previous }
}

function minimalReachabilityRoots(roots, graph) {
  const orderedRoots = [...new Set(roots)]
  const reachableByRoot = new Map(orderedRoots.map((root) => [root, walkReachable([root], graph).reached]))
  const shadowedRoots = new Set()
  for (let index = 0; index < orderedRoots.length; index += 1) {
    const root = orderedRoots[index]
    for (let otherIndex = 0; otherIndex < orderedRoots.length; otherIndex += 1) {
      if (index === otherIndex) continue
      const other = orderedRoots[otherIndex]
      if (!reachableByRoot.get(other)?.has(root)) continue
      const mutuallyReachable = reachableByRoot.get(root)?.has(other) ?? false
      if (!mutuallyReachable || otherIndex < index) shadowedRoots.add(root)
    }
  }
  return orderedRoots.filter((root) => !shadowedRoots.has(root))
}

function reachabilityPath(target, previous) {
  const chain = [target]
  let cursor = target
  while (previous.has(cursor)) {
    cursor = previous.get(cursor)
    chain.push(cursor)
  }
  return chain.reverse()
}

function allRuntimeChainsToTarget(target, roots, adjacency, maxChains = 128) {
  const parents = new Map()
  for (const [from, targets] of adjacency) {
    for (const child of targets) {
      const list = parents.get(child) ?? []
      list.push(from)
      parents.set(child, list)
    }
  }
  const rootSet = new Set(roots)
  const chains = []
  let truncated = false
  const walkBack = (current, reversedPath, visited) => {
    if (rootSet.has(current)) {
      if (chains.length >= maxChains) {
        truncated = true
        return
      }
      chains.push(reversedPath.slice().reverse())
      return
    }
    for (const parent of parents.get(current) ?? []) {
      if (visited.has(parent)) continue
      walkBack(parent, [...reversedPath, parent], new Set([...visited, parent]))
      if (chains.length >= maxChains) {
        truncated = true
        return
      }
    }
  }
  walkBack(target, [target], new Set([target]))
  const uniqueChains = [...new Map(chains.map((chain) => [chain.join('\u0000'), chain])).values()]
  return { chains: uniqueChains, truncated }
}

function excludedContextForChain(chain) {
  if (!chain.includes('src/app/navigation/legacyExcludedRouter.tsx')) return null
  if (chain.some((file) => file.startsWith('src/experiences/pi/it/'))) {
    return { excludedOwner: 'PI Italy', experienceId: 'pi.it.mobile-first' }
  }
  const kidsExperience = chain.find((file) => /^src\/experiences\/kids-pi\/[^/]+\/baseline\//.test(file))
  if (kidsExperience) {
    const parts = kidsExperience.split('/')
    return {
      excludedOwner: `KIDS ${parts[3].toUpperCase()}`,
      experienceId: `kids-pi.${parts[3]}.${parts[4]}`,
    }
  }
  if (chain.some((file) => file.startsWith('src/experiences/kids-pi/') || file.startsWith('src/app/screens/kids/'))) {
    return { excludedOwner: 'KIDS PI', experienceId: 'kids-pi' }
  }
  return null
}

function runtimeChainScope(chain) {
  const excluded = excludedContextForChain(chain)
  if (excluded) return { scope: 'excluded-owner', ...excluded }
  const flowPath = chain.find((file) => file.startsWith('src/flows/'))
  if (flowPath && chain.includes('src/app/screens/flow-library/FlowLibraryScreen.tsx')) {
    return { scope: 'flow-owned-prototype', flowPath }
  }
  if (chain.includes('src/app/screens/design-system/DesignSystemPage.tsx')) return { scope: 'design-system-platform' }
  if (chain.includes('src/app/screens/tools/ToolsScreen.tsx')) return { scope: 'platform-tool' }
  return { scope: 'in-scope-source-runtime' }
}

function sameRuntimeChainSet(left, right) {
  const keys = (chains) => chains.map((chain) => chain.map(normalizeReferencedPath).join('\u0000')).sort()
  const normalizedLeft = keys(left)
  const normalizedRight = keys(right)
  return normalizedLeft.length === normalizedRight.length && normalizedLeft.every((key, index) => key === normalizedRight[index])
}

function getNativeRoots(root) {
  const candidates = [
    'src/app/components/demo/NativeDemoSurface.tsx',
    'native-spike/index.js',
    'native-spike/index.ts',
    'native-spike/global-native.web.tsx',
    'native-spike/src/app/GlobalNativeApp.tsx',
    'native-spike/src/app/CurrentApplication.tsx',
    'native-spike/src/experiences/pi/current/NativeCurrentApp.tsx',
    'native-spike/src/experiences/pi/cz/evo-2027/NativeCzechApp.tsx',
  ]
  return candidates.filter((relative) => existsSync(path.join(root, relative)))
}

function getProductionRoots(root, nativeRoots) {
  const sourceRoots = ['src/main.tsx', 'src/app/App.tsx', 'src/app/AppShell.tsx']
    .filter((relative) => existsSync(path.join(root, relative)))
  return [...new Set([...sourceRoots, ...nativeRoots])]
}

function normalizeReferencedPath(value) {
  const normalized = String(value ?? '')
    .split(String.fromCharCode(92))
    .join('/')
    .split('?')[0]
  return normalized.startsWith('./') ? normalized.slice(2) : normalized
}

function uiRuntimeEvidence(root, file) {
  const absolutePath = path.join(root, file)
  if (!isFile(absolutePath)) {
    return {
      path: file,
      sourceFileExists: false,
      hasJsx: false,
      jsxTags: [],
      hasCreateElementUi: false,
      hookCalls: [],
      hookDefinitions: [],
      isNativePreviewOnlyWrapper: false,
      isUiRuntime: false,
    }
  }
  const source = ts.createSourceFile(file, readFileSync(absolutePath, 'utf8'), ts.ScriptTarget.Latest, true, scriptKindFor(file))
  const jsxTags = []
  const hookCalls = new Set()
  const hookDefinitions = new Set()
  let hasJsxFragment = false
  let hasCreateElementUi = false
  let hasCreatePortalUi = false
  const hookName = (name) => /^use[A-Z0-9]/.test(name)
  const visit = (node) => {
    if (ts.isJsxElement(node)) jsxTags.push(node.openingElement.tagName.getText(source))
    else if (ts.isJsxSelfClosingElement(node)) jsxTags.push(node.tagName.getText(source))
    else if (ts.isJsxFragment(node)) hasJsxFragment = true

    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression)) {
        if (node.expression.text === 'createElement') hasCreateElementUi = true
        if (hookName(node.expression.text)) hookCalls.add(node.expression.text)
      } else if (ts.isPropertyAccessExpression(node.expression)) {
        const name = node.expression.name.text
        if (name === 'createElement') hasCreateElementUi = true
        if (name === 'createPortal') hasCreatePortalUi = true
        if (hookName(name)) hookCalls.add(name)
      }
    }

    if (ts.isFunctionDeclaration(node) && node.name && hookName(node.name.text)) {
      hookDefinitions.add(node.name.text)
    } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && hookName(node.name.text)) {
      if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
        hookDefinitions.add(node.name.text)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)

  const hasJsx = jsxTags.length > 0 || hasJsxFragment
  const hasNativePreviewJsx = jsxTags.includes('NativeScreenPreview')
  const hasNonNativeJsx = jsxTags.some((tag) => tag !== 'NativeScreenPreview') || hasJsxFragment
  const isNativePreviewOnlyWrapper = hasNativePreviewJsx && !hasNonNativeJsx && !hasCreateElementUi && !hasCreatePortalUi
  const isUiRuntime = hasNonNativeJsx || hasCreateElementUi || hasCreatePortalUi || hookCalls.size > 0 || hookDefinitions.size > 0
  return {
    path: file,
    sourceFileExists: true,
    hasJsx,
    jsxTags: [...new Set(jsxTags)].sort(),
    hasCreateElementUi,
    hasCreatePortalUi,
    hookCalls: [...hookCalls].sort(),
    hookDefinitions: [...hookDefinitions].sort(),
    isNativePreviewOnlyWrapper,
    isUiRuntime,
  }
}

function nativePreviewFunctionPass(root, file) {
  const absolutePath = path.join(root, file)
  if (!isFile(absolutePath)) return { sourceFileExists: false, nativePreviewRoutes: [], conditionalSourceBranches: [] }
  const source = ts.createSourceFile(file, readFileSync(absolutePath, 'utf8'), ts.ScriptTarget.Latest, true, scriptKindFor(file))
  const functionNameFor = (node) => {
    let current = node
    while (current) {
      if (ts.isFunctionDeclaration(current)) return current.name?.text ?? 'default'
      if (ts.isMethodDeclaration(current)) return propertyName(current.name) ?? '<method>'
      if (ts.isArrowFunction(current) || ts.isFunctionExpression(current)) {
        const parent = current.parent
        if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) return parent.name.text
        if (ts.isPropertyAssignment(parent)) return propertyName(parent.name) ?? '<property>'
        return '<anonymous>'
      }
      current = current.parent
    }
    return '<module>'
  }
  const rootJsxTargets = (expression) => {
    if (!expression) return []
    const value = ts.isParenthesizedExpression(expression) ? expression.expression : expression
    if (ts.isJsxElement(value)) return [value.openingElement.tagName.getText(source)]
    if (ts.isJsxSelfClosingElement(value)) return [value.tagName.getText(source)]
    if (ts.isJsxFragment(value)) return value.children.flatMap((child) =>
      ts.isJsxElement(child) ? [child.openingElement.tagName.getText(source)]
        : ts.isJsxSelfClosingElement(child) ? [child.tagName.getText(source)]
          : [],
    )
    if (ts.isConditionalExpression(value)) return [...rootJsxTargets(value.whenTrue), ...rootJsxTargets(value.whenFalse)]
    if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return rootJsxTargets(value.right)
    return []
  }
  const returnedJsxTargets = (node) => {
    if (!node) return []
    const targets = []
    const visit = (current, isRoot = false) => {
      if (!isRoot && (ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current) || ts.isArrowFunction(current))) return
      if (ts.isReturnStatement(current)) {
        targets.push(...rootJsxTargets(current.expression))
        return
      }
      ts.forEachChild(current, (child) => visit(child))
    }
    visit(node, true)
    return [...new Set(targets)]
  }
  const routeBindings = new Map()
  const functionBindings = new Map()
  const nativePreviewFunctions = new Set()
  const functionJsxReferences = new Map()
  const collectRouteBindings = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const functionName = functionNameFor(node)
      const bindings = functionBindings.get(functionName) ?? new Map()
      if (ts.isIdentifier(node.name)) {
        bindings.set(node.name.text, node.initializer.getText(source))
      } else if (ts.isObjectBindingPattern(node.name)) {
        for (const element of node.name.elements) {
          if (!ts.isIdentifier(element.name)) continue
          const sourceName = element.propertyName ? propertyName(element.propertyName) : element.name.text
          if (sourceName) bindings.set(element.name.text, `${node.initializer.getText(source)}.${sourceName}`)
        }
      }
      functionBindings.set(functionName, bindings)
      if (ts.isIdentifier(node.name) && node.name.text === 'route') {
        const initializer = unwrapTypeWrappers(node.initializer)
        if (ts.isObjectLiteralExpression(initializer)) {
          const screenProperty = initializer.properties.find((property) =>
            ts.isPropertyAssignment(property) && propertyName(property.name) === 'screen',
          )
          const routeScreen = screenProperty && ts.isPropertyAssignment(screenProperty)
            ? literalValue(screenProperty.initializer)
            : null
          if (routeScreen) routeBindings.set(functionName, routeScreen)
        }
      }
    }
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxElement(node)) {
      const name = functionNameFor(node)
      const tag = ts.isJsxSelfClosingElement(node) ? node.tagName.getText(source) : node.openingElement.tagName.getText(source)
      const references = functionJsxReferences.get(name) ?? new Set()
      references.add(tag)
      functionJsxReferences.set(name, references)
      if (tag === 'NativeScreenPreview') nativePreviewFunctions.add(name)
    }
    ts.forEachChild(node, collectRouteBindings)
  }
  collectRouteBindings(source)
  let expanded = true
  while (expanded) {
    expanded = false
    for (const [name, references] of functionJsxReferences) {
      if (!nativePreviewFunctions.has(name) && [...references].some((tag) => nativePreviewFunctions.has(tag))) {
        nativePreviewFunctions.add(name)
        expanded = true
      }
    }
  }
  const nativePreviewRoutes = []
  const conditionalSourceBranches = []
  const visitEvidence = (node) => {
    const functionName = functionNameFor(node)
    if ((ts.isJsxSelfClosingElement(node) && node.tagName.getText(source) === 'NativeScreenPreview') ||
      (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'NativeScreenPreview')) {
      const attributes = ts.isJsxSelfClosingElement(node) ? node.attributes : node.openingElement.attributes
      const routeAttribute = attributes.properties.find((property) => ts.isJsxAttribute(property) && property.name.text === 'route')
      const routeExpression = routeAttribute && ts.isJsxAttribute(routeAttribute) && routeAttribute.initializer && ts.isJsxExpression(routeAttribute.initializer)
        ? routeAttribute.initializer.expression
        : undefined
      let routeScreen = null
      if (routeExpression && ts.isObjectLiteralExpression(unwrapTypeWrappers(routeExpression))) {
        const routeObject = unwrapTypeWrappers(routeExpression)
        const screenProperty = routeObject.properties.find((property) =>
          ts.isPropertyAssignment(property) && propertyName(property.name) === 'screen',
        )
        routeScreen = screenProperty && ts.isPropertyAssignment(screenProperty)
          ? literalValue(screenProperty.initializer)
          : null
      } else if (routeExpression && ts.isIdentifier(routeExpression)) {
        routeScreen = routeBindings.get(functionName) ?? null
      }
      nativePreviewRoutes.push({
        functionName,
        routeExpression: routeExpression?.getText(source) ?? null,
        routeScreen,
      })
    }
    if (ts.isIfStatement(node) && nativePreviewFunctions.has(functionName)) {
      const thenJsxTargets = returnedJsxTargets(node.thenStatement)
      const elseJsxTargets = returnedJsxTargets(node.elseStatement)
      if (thenJsxTargets.length || elseJsxTargets.length) {
        const conditionIdentifiers = new Set()
        const collectIdentifiers = (current) => {
          if (ts.isIdentifier(current)) conditionIdentifiers.add(current.text)
          ts.forEachChild(current, collectIdentifiers)
        }
        collectIdentifiers(node.expression)
        const guardBindings = [...conditionIdentifiers]
          .map((name) => [name, functionBindings.get(functionName)?.get(name)])
          .filter((entry) => entry[1])
          .map(([name, initializer]) => ({ name, initializer }))
        conditionalSourceBranches.push({
          functionName,
          guardExpression: node.expression.getText(source),
          guardBindings,
          thenJsxTargets,
          elseJsxTargets,
        })
      }
    }
    ts.forEachChild(node, visitEvidence)
  }
  visitEvidence(source)
  return {
    sourceFileExists: true,
    nativePreviewRoutes,
    conditionalSourceBranches,
    nativePreviewFunctions: [...nativePreviewFunctions].sort(),
  }
}

function scopedNativeBridgeEvidence(root, file) {
  return nativePreviewFunctionPass(root, file)
}

/** Bind every projected edge to an imported JSX target in a separately reviewed excluded branch. */
function excludedBranchEdges(root, file, branches, edges) {
  const source = ts.createSourceFile(file, readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true, scriptKindFor(file))
  const imports = new Map()
  for (const declaration of source.statements) {
    if (!ts.isImportDeclaration(declaration) || !ts.isStringLiteral(declaration.moduleSpecifier) || importClauseIsTypeOnly(declaration.importClause)) continue
    const specifier = declaration.moduleSpecifier.text
    const to = resolveLocalSpecifier(root, file, specifier)?.path
    if (!to) continue
    const clause = declaration.importClause
    if (clause?.name) imports.set(clause.name.text, { from: file, to, specifier })
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const item of clause.namedBindings.elements) if (!item.isTypeOnly) imports.set(item.name.text, { from: file, to, specifier })
    }
  }
  const projected = []
  for (const branch of branches) {
    for (const edge of branch.excludedRuntimeEdges ?? []) {
      const expected = { from: edge.from, to: edge.to, specifier: edge.specifier }
      const bindsTarget = (branch.jsxTargets ?? []).some((target) => sameStructuredEvidence(imports.get(target), expected))
      const exists = edges.some((actual) => actual.kind === 'runtime' && actual.from === edge.from && actual.to === edge.to && actual.specifier === edge.specifier)
      if (!bindsTarget || !exists) return { valid: false, edges: [] }
      projected.push({ ...expected, owner: branch.owner, bridge: file })
    }
  }
  return { valid: true, edges: [...new Map(projected.map((edge) => [JSON.stringify([edge.from, edge.to, edge.specifier]), edge])).values()] }
}

function samePathSet(left, right) {
  const normalizedLeft = [...new Set(left.map(normalizeReferencedPath))].sort()
  const normalizedRight = [...new Set(right.map(normalizeReferencedPath))].sort()
  return normalizedLeft.length === normalizedRight.length && normalizedLeft.every((value, index) => value === normalizedRight[index])
}

function stableEvidenceValue(value) {
  if (Array.isArray(value)) return value.map(stableEvidenceValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableEvidenceValue(value[key])]))
  }
  return value
}

function sameStructuredEvidence(left, right) {
  return JSON.stringify(stableEvidenceValue(left)) === JSON.stringify(stableEvidenceValue(right))
}

function sourceBranchesFromBridgeEvidence(evidence) {
  return (evidence.conditionalSourceBranches ?? []).flatMap((branch) => {
    const jsxTargets = [...new Set([...(branch.thenJsxTargets ?? []), ...(branch.elseJsxTargets ?? [])])]
      .filter((target) => target !== 'NativeScreenPreview')
      .sort()
    return jsxTargets.length
      ? [{
          functionName: branch.functionName,
          guardExpression: branch.guardExpression,
          guardBindings: branch.guardBindings ?? [],
          jsxTargets,
        }]
      : []
  })
}

function samePathSequence(left, right) {
  const normalizedLeft = left.map(normalizeReferencedPath)
  const normalizedRight = right.map(normalizeReferencedPath)
  return normalizedLeft.length === normalizedRight.length && normalizedLeft.every((value, index) => value === normalizedRight[index])
}

function directRuntimeConsumers(file, edges) {
  return [...new Set(edges
    .filter((edge) => edge.to === file && edge.kind === 'runtime' && !edge.from.startsWith('tests/'))
    .map((edge) => edge.from))]
    .sort()
}

function productionRuntimeConsumerDetails(file, edges, roots, adjacency) {
  const allRuntimeConsumers = directRuntimeConsumers(file, edges)
  const perConsumer = allRuntimeConsumers.map((consumer) => {
    const result = allRuntimeChainsToTarget(consumer, roots, adjacency)
    const chains = result.chains.map((chain) => [...chain, file])
    return {
      path: consumer,
      chains,
      scopes: chains.map(runtimeChainScope),
      reachable: chains.length > 0,
      truncated: result.truncated,
    }
  })
  const reachable = perConsumer.filter((consumer) => consumer.reachable)
  const excluded = reachable.filter((consumer) => consumer.scopes.length > 0 && consumer.scopes.every((scope) => scope.scope === 'excluded-owner'))
  const flow = reachable.filter((consumer) => consumer.scopes.length > 0 && consumer.scopes.every((scope) => scope.scope === 'flow-owned-prototype'))
  const inScope = reachable.filter((consumer) =>
    consumer.scopes.some((scope) => scope.scope !== 'excluded-owner'),
  )
  return {
    allRuntimeConsumers,
    productionReachableConsumers: reachable.map((consumer) => consumer.path).sort(),
    unreachableRuntimeConsumers: perConsumer.filter((consumer) => !consumer.reachable).map((consumer) => consumer.path).sort(),
    perConsumer,
    excludedConsumers: excluded,
    flowPrototypeConsumers: flow,
    inScopeConsumers: inScope,
    exactExcludedChains: excluded.flatMap((consumer) => consumer.chains),
    exactFlowPrototypeChains: flow.flatMap((consumer) => consumer.chains),
    exactInScopeChains: inScope.flatMap((consumer) => consumer.chains),
    truncated: perConsumer.some((consumer) => consumer.truncated),
  }
}

function evaluateRetainedSupportRecords(root, approvalManifest, sourceClosure, edges, uiEvidenceByPath) {
  const records = (approvalManifest?.retainedSupport ?? []).map((record) => {
    const file = normalizeReferencedPath(record.path)
    const absolutePath = path.join(root, file)
    const evidence = uiEvidenceByPath.get(file) ?? uiRuntimeEvidence(root, file)
    const currentSha256 = existsSync(absolutePath)
      ? createHash('sha256').update(readFileSync(absolutePath)).digest('hex').toUpperCase()
      : null
    const exactRuntimeConsumers = (record.exactRuntimeConsumers ?? []).map(normalizeReferencedPath)
    const actualRuntimeConsumers = directRuntimeConsumers(file, edges)
    const consumersMatch = samePathSet(actualRuntimeConsumers, exactRuntimeConsumers)
    const requiredTests = (record.requiredTests ?? []).map(normalizeReferencedPath)
    const requiredTestsExist = requiredTests.every((test) => existsSync(path.join(root, test)))
    const hashMatches = Boolean(currentSha256 && currentSha256 === String(record.reviewedSha256 ?? '').toUpperCase())
    const verified = Boolean(evidence.sourceFileExists && !evidence.isUiRuntime && hashMatches && consumersMatch && requiredTestsExist)
    return {
      ...record,
      path: file,
      classification: verified ? 'root-approved-retained-support' : hashMatches ? 'retained-support-evidence-invalid' : 'retained-support-stale-or-unreviewed',
      reviewedSha256: record.reviewedSha256 ?? null,
      currentSha256,
      exactRuntimeConsumers,
      actualRuntimeConsumers,
      requiredTests,
      evidence: { ...evidence, consumersMatch, requiredTestsExist, hashMatches, verified },
      sourceClosureDependency: sourceClosure.has(file),
    }
  })
  return records
}

function evaluateExcludedConsumerRecords(root, approvalManifest, edges, productionRoots, runtimeAdjacency, reachable, previous) {
  const records = (approvalManifest?.excludedConsumers ?? []).map((record) => {
    const file = normalizeReferencedPath(record.path)
    const absolutePath = path.join(root, file)
    const currentSha256 = existsSync(absolutePath)
      ? createHash('sha256').update(readFileSync(absolutePath)).digest('hex').toUpperCase()
      : null
    const exactRuntimeChains = (record.exactRuntimeChains ?? (record.exactRuntimeChain ? [record.exactRuntimeChain] : []))
      .map((chain) => chain.map(normalizeReferencedPath))
    const chainEdgesValid = exactRuntimeChains.length > 0 && exactRuntimeChains.every((chain) =>
      chain.length >= 2 &&
      productionRoots.includes(chain[0]) &&
      chain[chain.length - 1] === file &&
      chain.slice(0, -1).every((from, index) => edges.some((edge) => edge.from === from && edge.to === chain[index + 1] && edge.kind === 'runtime')),
    )
    const chainContexts = exactRuntimeChains.map(excludedContextForChain)
    const inferredExcludedOwners = [...new Set(chainContexts.flatMap((context) => context ? [context.excludedOwner] : []))].sort()
    const inferredExperienceIds = [...new Set(chainContexts.flatMap((context) => context ? [context.experienceId] : []))].sort()
    const recordExcludedOwners = (record.excludedOwners ?? (record.excludedOwner ? [record.excludedOwner] : [])).map(String).sort()
    const recordExperienceIds = (record.experienceIds ?? (record.experienceId ? [record.experienceId] : [])).map(String).sort()
    const allChainsBelongToExcludedOwners = chainContexts.length > 0 && chainContexts.every(Boolean)
    const excludedOwnersMatch = samePathSet(inferredExcludedOwners, recordExcludedOwners)
    const experiencesMatch = samePathSet(inferredExperienceIds, recordExperienceIds)
    const exactRuntimeConsumers = [...new Set(exactRuntimeChains.map((chain) => chain[chain.length - 2]).filter(Boolean))].sort()
    const consumerDetails = productionRuntimeConsumerDetails(file, edges, productionRoots, runtimeAdjacency)
    const actualExcludedRuntimeConsumers = consumerDetails.excludedConsumers.map((consumer) => consumer.path).sort()
    const consumersMatch = samePathSet(actualExcludedRuntimeConsumers, exactRuntimeConsumers) &&
      sameRuntimeChainSet(consumerDetails.exactExcludedChains, exactRuntimeChains)
    const noInScopeRuntimeConsumers = consumerDetails.inScopeConsumers.length === 0 && !consumerDetails.truncated
    const requiredTests = (record.requiredTests ?? []).map(normalizeReferencedPath)
    const requiredTestsExist = requiredTests.every((test) => existsSync(path.join(root, test)))
    const hashMatches = Boolean(currentSha256 && currentSha256 === String(record.reviewedSha256 ?? '').toUpperCase())
    const verified = Boolean(hashMatches && chainEdgesValid && consumersMatch && requiredTestsExist && allChainsBelongToExcludedOwners && excludedOwnersMatch && experiencesMatch && noInScopeRuntimeConsumers)
    return {
      ...record,
      path: file,
      exactRuntimeChains,
      excludedOwners: recordExcludedOwners,
      experienceIds: recordExperienceIds,
      inferredExcludedOwners,
      inferredExperienceIds,
      excludedOwnersMatch,
      experiencesMatch,
      exactRuntimeConsumers,
      actualRuntimeConsumers: consumerDetails.productionReachableConsumers,
      flowPrototypeConsumers: consumerDetails.flowPrototypeConsumers.map((consumer) => consumer.path),
      inScopeRuntimeConsumers: consumerDetails.inScopeConsumers.map((consumer) => consumer.path),
      unreachableRuntimeConsumers: consumerDetails.unreachableRuntimeConsumers,
      requiredTests,
      currentSha256,
      classification: verified ? 'root-approved-excluded-consumer' : hashMatches ? 'excluded-consumer-evidence-invalid' : 'excluded-consumer-stale-or-unreviewed',
      evidence: { hashMatches, chainEdgesValid, consumersMatch, requiredTestsExist, allChainsBelongToExcludedOwners, excludedOwnersMatch, experiencesMatch, noInScopeRuntimeConsumers, verified },
      reachableFromProduction: reachable.has(file),
      currentProductionChain: reachable.has(file) ? reachabilityPath(file, previous) : [],
    }
  })
  return records
}

function inspectNativePreviewAdapterCandidates(root, manifest, candidateManifestPath, approvalManifest, approvalManifestPath, edges, oldRootPaths) {
  const approvalByPath = new Map((approvalManifest?.approvedAdapters ?? []).map((item) => [normalizeReferencedPath(item.path), item]))
  const candidateByPath = new Map((manifest?.candidates ?? []).map((item) => [normalizeReferencedPath(item.path), item]))
  for (const [candidatePath, approval] of approvalByPath) {
    if (!candidateByPath.has(candidatePath)) candidateByPath.set(candidatePath, approval)
  }
  for (const candidatePath of oldRootPaths) {
    const hasPreviewEdge = edges.some((edge) =>
      edge.from === candidatePath &&
      edge.kind === 'runtime' &&
      edge.to?.startsWith('src/app/components/demo/NativeScreenPreview.'),
    )
    if (hasPreviewEdge && !candidateByPath.has(candidatePath)) {
      candidateByPath.set(candidatePath, { path: candidatePath, discoveredFromOldSourceRoute: true })
    }
  }
  const candidates = [...candidateByPath.values()].map((candidate) => {
    const candidatePath = normalizeReferencedPath(candidate.path)
    const contractTest = candidate.contractTest
      ? normalizeReferencedPath(candidate.contractTest)
      : normalizeReferencedPath(approvalByPath.get(candidatePath)?.requiredTests?.[0])
    const sourceFile = path.join(root, candidatePath)
    const testFile = contractTest ? path.join(root, contractTest) : null
    const testText = testFile && existsSync(testFile) ? readFileSync(testFile, 'utf8') : ''
    const approval = approvalByPath.get(candidatePath)
    const sourceSpecifier = candidatePath.startsWith('src/')
      ? '@/' + candidatePath.slice(4).replace(/\.[^.]+$/, '')
      : candidatePath
    const importsNativeScreenPreview = edges.some((edge) =>
      edge.from === candidatePath &&
      edge.kind === 'runtime' &&
      edge.to?.startsWith('src/app/components/demo/NativeScreenPreview.'),
    )
    const contractTestNamesModule = testText.includes(sourceSpecifier) || testText.includes(candidatePath)
    const requiredTests = approval?.requiredTests?.map(normalizeReferencedPath) ?? []
    const requiredTestsExist = requiredTests.every((test) => existsSync(path.join(root, test)))
    const runtimeEvidence = uiRuntimeEvidence(root, candidatePath)
    const nativePreviewOnlyWrapper = runtimeEvidence.isNativePreviewOnlyWrapper
    const contractTestIsRequired = !approval || requiredTests.includes(contractTest)
    const currentSha256 = existsSync(sourceFile)
      ? createHash('sha256').update(readFileSync(sourceFile)).digest('hex').toUpperCase()
      : null
    const hashMatchesApproval = Boolean(approval && currentSha256 && currentSha256 === String(approval.reviewedSha256 ?? '').toUpperCase())
    const nativeOnly = approval?.nativeOnly === true
    const evidenceVerified = existsSync(sourceFile) && importsNativeScreenPreview && nativePreviewOnlyWrapper &&
      Boolean(testFile && existsSync(testFile)) && contractTestNamesModule && contractTestIsRequired && requiredTestsExist
    const rootApproved = Boolean(approval)
    const approvedAndVerified = rootApproved && hashMatchesApproval && nativeOnly && evidenceVerified
    let classification = 'candidate-pending-root-approval'
    if (rootApproved && !hashMatchesApproval) classification = 'root-approved-stale-hash-blocked'
    else if (rootApproved && !approvedAndVerified) classification = 'root-approved-evidence-invalid'
    else if (approvedAndVerified) classification = 'root-approved-native-owned-adapter'
    return {
      ...candidate,
      path: candidatePath,
      contractTest,
      sourceSpecifier,
      reviewedSha256: approval?.reviewedSha256 ?? null,
      requiredTests,
      excludedProductBranches: approval?.excludedProductBranches ?? [],
      nativeOnly: approval?.nativeOnly ?? null,
      evidence: {
        sourceModuleExists: existsSync(sourceFile),
        currentSha256,
        hashMatchesApproval,
        importsNativeScreenPreview,
        runtimeEvidence,
        nativePreviewOnlyWrapper,
        contractTestExists: Boolean(testFile && existsSync(testFile)),
        contractTestNamesSourceModule: contractTestNamesModule,
        contractTestIsRequired,
        requiredTestsExist,
        missingRequiredTests: requiredTests.filter((test) => !existsSync(path.join(root, test))),
        verified: evidenceVerified,
      },
      classification,
      blocksRetirement: !approvedAndVerified,
    }
  })
  return {
    candidateManifestPath: manifest ? toRepoPath(root, candidateManifestPath) : null,
    candidateManifestStatus: manifest?.status ?? 'not-provided',
    rootApprovalManifest: {
      path: approvalManifest ? toRepoPath(root, approvalManifestPath) : null,
      sha256: approvalManifest && existsSync(approvalManifestPath)
        ? createHash('sha256').update(readFileSync(approvalManifestPath)).digest('hex').toUpperCase()
        : null,
      reviewedBy: approvalManifest?.reviewedBy ?? null,
      baseCommit: approvalManifest?.baseCommit ?? null,
    },
    classificationPolicy: 'Only a Root-listed adapter with an unchanged reviewed SHA-256, nativeOnly=true, a runtime NativeScreenPreview edge, a wrapper whose JSX is limited to NativeScreenPreview, and present required tests is classified as a Native-owned adapter. Unlisted candidates remain pending; stale or invalid approvals block retirement.',
    rootScopeRecordKinds: {
      retainedSupport: 'Hash-bound records for exact non-UI runtime dependencies. The audit requires no JSX/React.createElement/React hook runtime and exact runtime-consumer matches.',
      excludedConsumers: 'Hash-bound records for an exact excluded-owner chain. The audit requires every runtime chain edge and exclusive direct-consumer matches.',
    },
    candidates,
  }
}

function evaluateScopedNativeBridgeCandidates(root, approvalManifest, adapterCandidates, edges, roots, adjacency) {
  const approvals = new Map((approvalManifest?.scopedNativeBridges ?? []).map((record) => [normalizeReferencedPath(record.path), record]))
  const candidates = adapterCandidates
    .filter((candidate) => candidate.evidence.importsNativeScreenPreview &&
      candidate.evidence.runtimeEvidence?.isUiRuntime &&
      !candidate.evidence.nativePreviewOnlyWrapper)
    .map((candidate) => {
      const file = candidate.path
      const absolutePath = path.join(root, file)
      const currentSha256 = isFile(absolutePath)
        ? createHash('sha256').update(readFileSync(absolutePath)).digest('hex').toUpperCase()
        : null
      const branchEvidence = scopedNativeBridgeEvidence(root, file)
      const sourceBranches = sourceBranchesFromBridgeEvidence(branchEvidence)
      const consumerDetails = productionRuntimeConsumerDetails(file, edges, roots, adjacency)
      const actualRuntimeConsumerContexts = consumerDetails.perConsumer
        .filter((consumer) => consumer.reachable)
        .map((consumer) => {
          const scopes = [...new Set(consumer.scopes.map((scope) => scope.scope))]
          const importerPath = path.join(root, consumer.path)
          return {
            path: consumer.path,
            reviewedSha256: isFile(importerPath)
              ? createHash('sha256').update(readFileSync(importerPath)).digest('hex').toUpperCase()
              : null,
            scope: scopes.length === 1 ? scopes[0] : 'mixed-runtime-contexts',
          }
        })
      const approval = approvals.get(file)
      const approvedConsumers = approval?.exactRuntimeConsumers ?? []
      const consumerPathsMatch = samePathSet(
        approvedConsumers.map((consumer) => normalizeReferencedPath(consumer.path)),
        actualRuntimeConsumerContexts.map((consumer) => consumer.path),
      )
      const consumerEvidenceMatches = consumerPathsMatch && actualRuntimeConsumerContexts.every((actual) => {
        const reviewed = approvedConsumers.find((consumer) => normalizeReferencedPath(consumer.path) === actual.path)
        return reviewed &&
          String(reviewed.reviewedSha256 ?? '').toUpperCase() === actual.reviewedSha256 &&
          reviewed.scope === actual.scope
      })
      const nativePreviewRoutesMatch = sameStructuredEvidence(approval?.nativePreviewRoutes, branchEvidence.nativePreviewRoutes)
      const conditionalBranchesMatch = sameStructuredEvidence(approval?.conditionalSourceBranches, branchEvidence.conditionalSourceBranches)
      const allowedSourceBranches = approval?.excludedSourceBranches ?? []
      const ownersForBranch = (branch) => branch.owners ?? [branch.owner]
      const approvedBranchEvidence = allowedSourceBranches.map(({ owner, owners, excludedRuntimeEdges, ...branch }) => branch)
      const excludedEdges = excludedBranchEdges(root, file, allowedSourceBranches, edges)
      const excludedSourceBranchesMatch = sameStructuredEvidence(sourceBranches, approvedBranchEvidence) &&
        allowedSourceBranches.every((branch) => ownersForBranch(branch).length > 0 && ownersForBranch(branch).every((owner) => ['SME', 'KIDS HU', 'KIDS RO', 'KIDS SK', 'PI Italy'].includes(owner)))
      const includedScopeValid = approval?.includedScope?.product === 'PI' && approval?.includedScope?.releases === 'all'
      const nativeContextTests = (approval?.nativeContextTests ?? []).map(normalizeReferencedPath)
      const excludedContextTests = approval?.excludedContextTests ?? []
      const requiredTests = (approval?.requiredTests ?? []).map(normalizeReferencedPath)
      const allTestPaths = [...new Set([
        ...requiredTests,
        ...nativeContextTests,
        ...excludedContextTests.map((item) => normalizeReferencedPath(item.path)),
      ])]
      const testPathsExist = allTestPaths.every((test) => isFile(path.join(root, test)))
      const sourceSpecifier = file.startsWith('src/') ? '@/' + file.slice(4).replace(/\.[^.]+$/, '') : file
      const nativeRouteNames = branchEvidence.nativePreviewRoutes.map((route) => route.routeScreen).filter(Boolean)
      const nativeContextTestsMeaningful = nativeContextTests.length > 0 && nativeContextTests.every((test) => {
        const testPath = path.join(root, test)
        if (!isFile(testPath)) return false
        const contents = readFileSync(testPath, 'utf8')
        return (contents.includes(sourceSpecifier) || contents.includes(file)) &&
          nativeRouteNames.some((route) => contents.includes(route))
      })
      const branchOwners = [...new Set(allowedSourceBranches.flatMap(ownersForBranch))]
      const excludedContextTestsMeaningful = branchOwners.every((owner) => excludedContextTests.some((item) => {
        if (item.owner !== owner) return false
        const test = normalizeReferencedPath(item.path)
        const testPath = path.join(root, test)
        if (!isFile(testPath)) return false
        const contents = readFileSync(testPath, 'utf8')
        const ownerTargets = allowedSourceBranches.filter((branch) => ownersForBranch(branch).includes(owner)).flatMap((branch) => branch.jsxTargets ?? [])
        return (contents.includes(sourceSpecifier) || contents.includes(file)) && ownerTargets.some((target) => contents.includes(target))
      }))
      const currentHashMatches = Boolean(currentSha256 && currentSha256 === String(approval?.reviewedSha256 ?? '').toUpperCase())
      const nativeOnly = approval?.nativeOnly === true
      const evidenceVerified = Boolean(
        approval && currentHashMatches && nativeOnly && includedScopeValid && nativePreviewRoutesMatch &&
        conditionalBranchesMatch && excludedSourceBranchesMatch && excludedEdges.valid && consumerEvidenceMatches && testPathsExist &&
        nativeContextTestsMeaningful && excludedContextTestsMeaningful,
      )
      const scopeWarnings = []
      if (approval?.includedScope?.releases === 'all' && branchEvidence.conditionalSourceBranches.some((branch) =>
        branch.guardBindings.some((binding) => /designSystem/.test(binding.initializer ?? '') && /current/.test(binding.initializer ?? '')),
      )) {
        scopeWarnings.push('Native branch is gated by designSystem=current; Root review must confirm every included PI release uses this shared design-system axis.')
      }
      let classification = 'candidate-pending-root-scoped-bridge-review'
      if (approval && !currentHashMatches) classification = 'root-scoped-bridge-stale-hash-blocked'
      else if (approval && !evidenceVerified) classification = 'root-scoped-bridge-evidence-invalid'
      else if (evidenceVerified) classification = 'root-approved-scoped-native-bridge'
      const blockingConsumerScopes = actualRuntimeConsumerContexts.filter((consumer) =>
        consumer.scope !== 'excluded-owner',
      )
      return {
        path: file,
        classification,
        reviewedSha256: approval?.reviewedSha256 ?? null,
        currentSha256,
        includedScope: approval?.includedScope ?? null,
        nativeOnly: approval?.nativeOnly ?? null,
        branchEvidence,
        sourceBranches,
        allowedSourceBranches,
        reviewedExcludedRuntimeEdges: evidenceVerified ? excludedEdges.edges : [],
        actualRuntimeConsumerContexts,
        deadRuntimeConsumers: consumerDetails.unreachableRuntimeConsumers,
        flowPrototypeConsumers: consumerDetails.flowPrototypeConsumers.map((consumer) => consumer.path),
        excludedOwnerConsumers: consumerDetails.excludedConsumers.map((consumer) => consumer.path),
        blockingConsumerScopes,
        nativeContextTests,
        excludedContextTests,
        requiredTests,
        scopeWarnings,
        blocksPiWebFallbackGuard: blockingConsumerScopes.length > 0 && !evidenceVerified,
        evidence: {
          currentHashMatches,
          nativePreviewRoutesMatch,
          conditionalBranchesMatch,
          excludedSourceBranchesMatch,
          excludedRuntimeEdgesValid: excludedEdges.valid,
          consumerPathsMatch,
          consumerEvidenceMatches,
          includedScopeValid,
          nativeContextTestsMeaningful,
          excludedContextTestsMeaningful,
          testPathsExist,
          verified: evidenceVerified,
        },
      }
    })
  return {
    approvalManifestArray: 'scopedNativeBridges',
    recordApi: {
      requiredFields: [
        'path',
        'reviewedSha256',
        'nativeOnly',
        'includedScope',
        'nativePreviewRoutes',
        'conditionalSourceBranches',
        'excludedSourceBranches',
        'exactRuntimeConsumers',
        'nativeContextTests',
        'excludedContextTests',
        'requiredTests',
      ],
      consumerFields: ['path', 'reviewedSha256', 'scope'],
      excludedBranchFields: ['owner', 'functionName', 'guardExpression', 'guardBindings', 'jsxTargets'],
      scopeRule: 'Approval is path/hash/context specific. Any source hash, branch expression, returned Source target, production-reachable consumer, or required context test change invalidates it. Dead importers are reported separately.',
    },
    candidates,
  }
}

function classifyConsumerPath(file) {
  if (!file) return 'unknown'
  if (file.startsWith('native-spike/')) return 'native'
  if (file.startsWith('tests/') || file.includes('.test.')) return 'test'
  if (file.startsWith('src/flows/')) return 'flow-preview'
  if (file.startsWith('src/app/screens/design-system/') || file.startsWith('src/app/screens/tools/')) return 'platform-preview'
  if (file.startsWith('src/app/screens/flow-library/')) return 'flow-platform'
  if (file.startsWith('src/app/navigation/legacyExcludedRouter')) return 'excluded-source-context'
  if (file.startsWith('src/app/registry/domains/')) return 'metadata'
  return 'runtime-or-tool'
}

function packageManifest(options) {
  const root = options.root
  const sourceManifestPath = path.resolve(root, options.sourceManifest)
  const sourceManifest = JSON.parse(readFileSync(sourceManifestPath, 'utf8'))
  const adapterCandidateManifestPath = path.resolve(root, options.adapterCandidates ?? DEFAULT_ADAPTER_CANDIDATES)
  const adapterApprovalManifestPath = path.resolve(root, options.adapterApprovals ?? DEFAULT_ADAPTER_APPROVALS)
  const adapterCandidateManifest = existsSync(adapterCandidateManifestPath)
    ? JSON.parse(readFileSync(adapterCandidateManifestPath, 'utf8'))
    : null
  const adapterApprovalManifest = existsSync(adapterApprovalManifestPath)
    ? JSON.parse(readFileSync(adapterApprovalManifestPath, 'utf8'))
    : null
  const files = options.files
  const { edges, dynamicPatterns } = buildImportGraph(root, files)
  const metadata = parseScreenMetadata(root, files)
  const experienceSourceModules = parseExperienceSourceModules(root, files)
  const oldRouteGroup = (sourceManifest.oldScreenRouteBranches ?? []).find((group) =>
    /Old Source customer route modules/i.test(group.disposition ?? ''),
  )
  if (!oldRouteGroup) throw new Error('L15 consumer manifest has no Old Source customer route module group.')

  const sourceRouteGroups = []
  const routeGroupPaths = new Set()
  for (const group of sourceManifest.oldScreenRouteBranches ?? []) {
    const modules = []
    for (const specifier of group.specifierModules ?? []) {
      const resolved = resolveLocalSpecifier(root, 'src/app/AppScreenRouter.tsx', specifier)
      if (resolved?.path) {
        modules.push({ path: resolved.path, specifier })
        routeGroupPaths.add(resolved.path)
      }
    }
    sourceRouteGroups.push({ disposition: group.disposition, routes: group.routes ?? [], modules })
  }

  const resolvedOldRoots = []
  const unresolvedOldRoots = []
  for (const specifier of oldRouteGroup.specifierModules ?? []) {
    const resolved = resolveLocalSpecifier(root, 'src/app/AppScreenRouter.tsx', specifier)
    if (resolved?.path) resolvedOldRoots.push({ path: resolved.path, specifier })
    else unresolvedOldRoots.push({ specifier, path: resolved?.unresolvedPath ?? null, reason: 'Old Source screen specifier did not resolve to a repository file.' })
  }
  const oldRootPaths = [...new Set(resolvedOldRoots.map((entry) => entry.path))]
  const oldRootSet = new Set(oldRootPaths)
  const nativePreviewAdapterCandidates = inspectNativePreviewAdapterCandidates(
    root,
    adapterCandidateManifest,
    adapterCandidateManifestPath,
    adapterApprovalManifest,
    adapterApprovalManifestPath,
    edges,
    oldRootPaths,
  )
  const retainedList = (sourceManifest.retainedSharedAndExcluded ?? []).map((entry) => ({
    path: normalizeReferencedPath(entry.path),
    reason: entry.reason,
    authority: 'L15 inventory only; does not suppress runtime/UI classification.',
  }))
  const approvedAdapterPaths = new Set(nativePreviewAdapterCandidates.candidates
    .filter((candidate) => candidate.classification === 'root-approved-native-owned-adapter')
    .map((candidate) => candidate.path))
  for (const candidate of nativePreviewAdapterCandidates.candidates) {
    if (approvedAdapterPaths.has(candidate.path)) {
      if (!retainedList.some((entry) => entry.path === candidate.path && entry.authority.startsWith('Root-approved'))) {
        retainedList.push({
          path: candidate.path,
          reason: 'Root-approved NativeScreenPreview compatibility adapter; preserve wrapper contract and metadata.',
          authority: 'Root hash-bound adapter approval.',
        })
      }
    }
  }
  const retainedPaths = new Set(retainedList.map((entry) => entry.path))
  const importerMap = new Map()
  const rawExportReferences = []
  const nativeTypeConsumers = []
  const platformPreviewConsumers = []
  const excludedContextConsumers = []
  const testConsumerEdges = []
  const unresolvedLocalEdges = []
  for (const edge of edges) {
    if (!edge.to) {
      if (edge.unresolvedPath) unresolvedLocalEdges.push(edge)
      continue
    }
    const consumer = { consumer: edge.from, kind: edge.kind, specifier: edge.specifier, line: edge.line }
    addConsumer(importerMap, edge.to, consumer)
    if (edge.kind === 'raw-source') rawExportReferences.push({ path: edge.to, ...consumer })
    if (edge.kind === 'type-only' && edge.from.startsWith('native-spike/')) nativeTypeConsumers.push({ path: edge.to, ...consumer })
    if (['platform-preview', 'flow-platform', 'flow-preview'].includes(classifyConsumerPath(edge.from))) {
      platformPreviewConsumers.push({ path: edge.to, consumer: edge.from, kind: edge.kind, specifier: edge.specifier })
    }
    if (classifyConsumerPath(edge.from) === 'excluded-source-context') {
      excludedContextConsumers.push({ path: edge.to, consumer: edge.from, kind: edge.kind, specifier: edge.specifier })
    }
    if (classifyConsumerPath(edge.from) === 'test') testConsumerEdges.push({ path: edge.to, ...consumer })
  }

  const metadataReferences = metadata.map((record) => ({
    path: normalizeReferencedPath(record.componentPath),
    consumer: record.file,
    screenId: record.screenId,
    products: record.products,
    countries: record.countries,
    designSystems: record.designSystems,
  }))
  for (const reference of metadataReferences) {
    addConsumer(importerMap, reference.path, { ...reference, kind: 'screen-metadata' })
  }
  for (const reference of experienceSourceModules) {
    addConsumer(importerMap, reference.path, { ...reference, kind: 'experience-sourceModules-metadata' })
  }
  const metadataByPath = new Map()
  for (const reference of metadataReferences) addConsumer(metadataByPath, reference.path, reference)
  const sourceModulesByPath = new Map()
  for (const reference of experienceSourceModules) addConsumer(sourceModulesByPath, reference.path, reference)
  const rawByPath = new Map()
  for (const reference of rawExportReferences) addConsumer(rawByPath, reference.path, reference)
  const nativeTypeByPath = new Map()
  for (const reference of nativeTypeConsumers) addConsumer(nativeTypeByPath, reference.path, reference)

  const typeAdjacency = buildAdjacency(edges, true)
  const sourceClosure = walkReachable(oldRootPaths, typeAdjacency).reached
  const runtimeAdjacency = buildAdjacency(edges, false)
  const nativeRoots = getNativeRoots(root)
  const nativeReachability = walkReachable(nativeRoots, runtimeAdjacency)
  const productionRoots = getProductionRoots(root, nativeRoots)
  const ownerScopeRoots = minimalReachabilityRoots(productionRoots, runtimeAdjacency)
  const productionReachability = walkReachable(productionRoots, runtimeAdjacency)
  const scopedNativeBridgeCandidates = evaluateScopedNativeBridgeCandidates(
    root,
    adapterApprovalManifest,
    nativePreviewAdapterCandidates.candidates,
    edges,
    ownerScopeRoots,
    runtimeAdjacency,
  )
  const approvedScopedNativeBridgePaths = new Set(scopedNativeBridgeCandidates.candidates
    .filter((candidate) => candidate.classification === 'root-approved-scoped-native-bridge')
    .map((candidate) => candidate.path))
  const reviewedExcludedRuntimeEdges = scopedNativeBridgeCandidates.candidates.flatMap((candidate) => candidate.reviewedExcludedRuntimeEdges)
  const projectedEdgeKeys = new Set(reviewedExcludedRuntimeEdges.map((edge) => JSON.stringify([edge.from, edge.to, edge.specifier])))
  const piRuntimeEdges = edges.filter((edge) => !projectedEdgeKeys.has(JSON.stringify([edge.from, edge.to, edge.specifier])))
  const piRuntimeAdjacency = buildAdjacency(piRuntimeEdges, false)
  const piReachability = walkReachable(productionRoots, piRuntimeAdjacency)
  const platformRoots = sourceRouteGroups
    .filter((group) => /Platform controls/i.test(group.disposition))
    .flatMap((group) => group.modules.map((module) => module.path))
  const isPlatformUi = (candidate) =>
    candidate.startsWith('src/app/screens/flow-library/') ||
    candidate.startsWith('src/app/screens/design-system/') ||
    candidate.startsWith('src/app/screens/tools/')
  const sourceScreenPaths = [...new Set([...sourceClosure, ...productionReachability.reached])]
    .filter((candidate) => candidate.startsWith('src/app/screens/') && !isPlatformUi(candidate))
    .sort()
  const uiEvidenceByPath = new Map(sourceScreenPaths.map((candidate) => [candidate, uiRuntimeEvidence(root, candidate)]))
  const allOldSourceUiPaths = sourceScreenPaths.filter((candidate) => {
    const evidence = uiEvidenceByPath.get(candidate)
    return evidence?.isUiRuntime && !evidence.isNativePreviewOnlyWrapper
  })
  const nonUiSourceScreenDependencies = sourceScreenPaths.filter((candidate) => {
    const evidence = uiEvidenceByPath.get(candidate)
    return !evidence?.isUiRuntime && !evidence?.isNativePreviewOnlyWrapper
  })
  const nativePreviewOnlyWrapperPaths = sourceScreenPaths.filter((candidate) => uiEvidenceByPath.get(candidate)?.isNativePreviewOnlyWrapper)
  const retainedSupportRecords = evaluateRetainedSupportRecords(root, adapterApprovalManifest, sourceClosure, edges, uiEvidenceByPath)
  const rootApprovedSupportPaths = new Set(retainedSupportRecords
    .filter((record) => record.classification === 'root-approved-retained-support')
    .map((record) => record.path))
  const supportRecordByPath = new Map(retainedSupportRecords.map((record) => [record.path, record]))
  const pureSupportCandidates = nonUiSourceScreenDependencies.map((candidate) => {
    const record = supportRecordByPath.get(candidate)
    const absolutePath = path.join(root, candidate)
    return {
      path: candidate,
      currentSha256: existsSync(absolutePath)
        ? createHash('sha256').update(readFileSync(absolutePath)).digest('hex').toUpperCase()
        : null,
      uiEvidence: uiEvidenceByPath.get(candidate),
      exactRuntimeConsumers: directRuntimeConsumers(candidate, edges),
      rootReviewStatus: record?.classification ?? 'pure-support-pending-root-review',
      reviewedRecord: record ?? null,
    }
  })
  const excludedConsumerRecords = evaluateExcludedConsumerRecords(
    root,
    adapterApprovalManifest,
    edges,
    ownerScopeRoots,
    runtimeAdjacency,
    productionReachability.reached,
    productionReachability.previous,
  )
  const excludedRecordByPath = new Map(excludedConsumerRecords.map((record) => [record.path, record]))
  const runtimeConsumerDetailsByPath = new Map(allOldSourceUiPaths
    .filter((candidate) => productionReachability.reached.has(candidate))
    .map((candidate) => [candidate, productionRuntimeConsumerDetails(candidate, edges, ownerScopeRoots, runtimeAdjacency)]))
  const excludedOwnerCandidates = allOldSourceUiPaths.flatMap((candidate) => {
    const consumerDetails = runtimeConsumerDetailsByPath.get(candidate)
    if (!consumerDetails?.exactExcludedChains.length) return []
    const exactRuntimeChains = consumerDetails.exactExcludedChains
    const chainContexts = exactRuntimeChains.map(excludedContextForChain)
    const inferredExcludedOwners = [...new Set(chainContexts.flatMap((context) => context ? [context.excludedOwner] : []))].sort()
    const inferredExperienceIds = [...new Set(chainContexts.flatMap((context) => context ? [context.experienceId] : []))].sort()
    if (!inferredExcludedOwners.length || !inferredExperienceIds.length) return []
    const actualRuntimeConsumers = consumerDetails.productionReachableConsumers
    const chainParents = [...new Set(exactRuntimeChains.map((chain) => chain[chain.length - 2]).filter(Boolean))].sort()
    const allExcludedConsumersCovered = samePathSet(
      consumerDetails.excludedConsumers.map((consumer) => consumer.path),
      chainParents,
    )
    const allChainsBelongToExcludedOwners = chainContexts.length > 0 && chainContexts.every(Boolean)
    const exclusiveToChain = allExcludedConsumersCovered && allChainsBelongToExcludedOwners &&
      consumerDetails.inScopeConsumers.length === 0 && !consumerDetails.truncated
    const reviewed = excludedRecordByPath.get(candidate)
    const exactReview = reviewed?.classification === 'root-approved-excluded-consumer' &&
      samePathSet(reviewed.excludedOwners, inferredExcludedOwners) &&
      samePathSet(reviewed.experienceIds, inferredExperienceIds) &&
      sameRuntimeChainSet(reviewed.exactRuntimeChains, exactRuntimeChains)
    const chain = exactRuntimeChains[0]
    return [{
      path: candidate,
      excludedOwner: inferredExcludedOwners.length === 1 ? inferredExcludedOwners[0] : null,
      excludedOwners: inferredExcludedOwners,
      experienceId: inferredExperienceIds.length === 1 ? inferredExperienceIds[0] : null,
      experienceIds: inferredExperienceIds,
      exactRuntimeChain: chain,
      exactRuntimeChains,
      flowPrototypeChains: consumerDetails.exactFlowPrototypeChains,
      inScopeRuntimeChains: consumerDetails.exactInScopeChains,
      runtimeChainsTruncated: consumerDetails.truncated,
      actualRuntimeConsumers,
      allRuntimeConsumers: consumerDetails.allRuntimeConsumers,
      flowPrototypeConsumers: consumerDetails.flowPrototypeConsumers.map((consumer) => consumer.path),
      inScopeRuntimeConsumers: consumerDetails.inScopeConsumers.map((consumer) => consumer.path),
      unreachableRuntimeConsumers: consumerDetails.unreachableRuntimeConsumers,
      chainParents,
      exclusiveToChain,
      currentSha256: uiEvidenceByPath.get(candidate)?.sourceFileExists
        ? createHash('sha256').update(readFileSync(path.join(root, candidate))).digest('hex').toUpperCase()
        : null,
      rootReviewStatus: exactReview ? 'root-approved-excluded-consumer' : 'pending-root-excluded-consumer-review',
      ownerChainIsExclusive: exclusiveToChain,
      scopeDisposition: exclusiveToChain ? 'preserve-out-of-scope-owner' : 'mixed-or-unresolved-runtime-consumers',
      blocksPiWebFallbackGuard: !exclusiveToChain,
      blocksDeletion: true,
    }]
  })
  const excludedOwnerPathSet = new Set(excludedOwnerCandidates
    .filter((candidate) => candidate.exclusiveToChain)
    .map((candidate) => candidate.path))
  const flowOwnedPrototypeChains = [...runtimeConsumerDetailsByPath.entries()]
    .flatMap(([target, details]) => details.exactFlowPrototypeChains.map((chain) => ({
      target,
      flowPath: chain.find((file) => file.startsWith('src/flows/')) ?? null,
      chain,
    })))
  const flowPrototypeOnlyPathSet = new Set([...runtimeConsumerDetailsByPath.entries()]
    .filter(([, details]) =>
      details.exactFlowPrototypeChains.length > 0 &&
      details.exactExcludedChains.length === 0 &&
      details.exactInScopeChains.length === 0 &&
      !details.truncated,
    )
    .map(([candidate]) => candidate))
  const retiredSourceUiPaths = allOldSourceUiPaths.filter(
    (candidate) => !approvedAdapterPaths.has(candidate) && !approvedScopedNativeBridgePaths.has(candidate) &&
      !excludedOwnerPathSet.has(candidate) && !flowPrototypeOnlyPathSet.has(candidate),
  )
  const inScopeRuntimeChainsByPath = new Map([...runtimeConsumerDetailsByPath.entries()]
    .map(([candidate, details]) => [candidate, details.exactInScopeChains]))
  const reachableRetiredPiUi = retiredSourceUiPaths
    .filter((candidate) => piReachability.reached.has(candidate) && (inScopeRuntimeChainsByPath.get(candidate) ?? []).length > 0)
    .map((candidate) => ({
      path: candidate,
      chain: (inScopeRuntimeChainsByPath.get(candidate) ?? [])[0],
      exactRuntimeChains: inScopeRuntimeChainsByPath.get(candidate) ?? [],
      uiEvidence: uiEvidenceByPath.get(candidate),
    }))
  const reachablePendingNativePreviewAdapters = nativePreviewAdapterCandidates.candidates
    .filter((candidate) =>
      candidate.classification !== 'root-approved-native-owned-adapter' &&
      candidate.evidence.nativePreviewOnlyWrapper &&
      piReachability.reached.has(candidate.path) &&
      !excludedOwnerPathSet.has(candidate.path),
    )
    .map((candidate) => ({
      path: candidate.path,
      classification: candidate.classification,
      chain: reachabilityPath(candidate.path, productionReachability.previous),
      currentSha256: candidate.evidence.currentSha256,
    }))
  const reachablePendingScopedNativeBridges = scopedNativeBridgeCandidates.candidates
    .filter((candidate) =>
      candidate.classification !== 'root-approved-scoped-native-bridge' &&
      candidate.blocksPiWebFallbackGuard &&
      productionReachability.reached.has(candidate.path),
    )
    .map((candidate) => ({
      path: candidate.path,
      classification: candidate.classification,
      currentSha256: candidate.currentSha256,
      blockingConsumerScopes: candidate.blockingConsumerScopes,
      scopeWarnings: candidate.scopeWarnings,
    }))
  const reachableDynamicPatterns = dynamicPatterns.filter((pattern) => productionReachability.reached.has(pattern.file))
  const platformPreviewChains = []
  const platformTargetPaths = [...new Set([...sourceScreenPaths, ...retainedPaths])]
    .filter((candidate) => candidate.startsWith('src/app/screens/'))
  for (const platformRoot of platformRoots) {
    const reachable = walkReachable([platformRoot], runtimeAdjacency)
    for (const target of platformTargetPaths) {
      if (!reachable.reached.has(target)) continue
      const excludedOwner = excludedOwnerCandidates.find((candidate) => candidate.path === target)
      const rootApprovedAdapter = approvedAdapterPaths.has(target)
      const rootApprovedScopedBridge = approvedScopedNativeBridgePaths.has(target)
      const evidence = uiEvidenceByPath.get(target)
      const isUi = Boolean(evidence?.isUiRuntime && !evidence.isNativePreviewOnlyWrapper)
      const isWrapperCandidate = nativePreviewOnlyWrapperPaths.includes(target)
      const chain = reachabilityPath(target, reachable.previous)
      const chainScope = runtimeChainScope(chain)
      platformPreviewChains.push({
        platformRoot,
        target,
        disposition: rootApprovedAdapter
          ? 'root-approved-native-adapter'
          : rootApprovedScopedBridge
            ? 'root-approved-scoped-native-bridge'
          : chainScope.scope === 'flow-owned-prototype'
            ? 'flow-owned-prototype'
            : chainScope.scope === 'excluded-owner' || excludedOwner?.exclusiveToChain
              ? excludedOwner?.rootReviewStatus ?? 'excluded-owner-runtime-chain'
            : chainScope.scope === 'design-system-platform'
              ? 'in-scope-design-system-platform'
              : chainScope.scope === 'platform-tool'
                ? 'platform-tool-review'
            : isWrapperCandidate ? 'native-preview-wrapper-pending-root-approval'
              : isUi ? 'in-scope-legacy-ui-or-pending-classification' : 'non-ui-support-dependency',
        chain,
      })
    }
  }
  const sourceAppShell = 'src/app/AppShell.tsx'
  const sourceShellReachability = walkReachable([sourceAppShell], runtimeAdjacency)
  const sourceFallbackReachable = oldRootPaths.filter((candidate) => sourceShellReachability.reached.has(candidate))
  const sourceFallbackUiReachable = sourceFallbackReachable.filter((candidate) => {
    const evidence = uiEvidenceByPath.get(candidate)
    return evidence?.isUiRuntime && !evidence.isNativePreviewOnlyWrapper &&
      (inScopeRuntimeChainsByPath.get(candidate) ?? []).length > 0 &&
      !excludedOwnerPathSet.has(candidate) && !flowPrototypeOnlyPathSet.has(candidate) && !approvedScopedNativeBridgePaths.has(candidate)
  })
  const sourceFallbackExcludedOwnerPaths = sourceFallbackReachable.filter((candidate) => excludedOwnerPathSet.has(candidate))
  const sourceFallbackNativePreviewWrappers = sourceFallbackReachable.filter((candidate) => nativePreviewOnlyWrapperPaths.includes(candidate))
  const sourceFallbackFlowPrototypePaths = sourceFallbackReachable.filter((candidate) => flowPrototypeOnlyPathSet.has(candidate))

  const directAppScreenRouterTests = sourceManifest.testConsumers?.DirectAppScreenPathTests ?? []
  const actualSourceScreenTests = [...new Set(testConsumerEdges.filter((edge) => oldRootSet.has(edge.path)).map((edge) => edge.consumer))]
  const archiveOnlyTests = [...new Set([...directAppScreenRouterTests, ...actualSourceScreenTests])].sort()
  const nativeEquivalentProofTests = sourceManifest.testConsumers?.NativeRouteAndBridgeTests ?? []
  const flow = sourceManifest.flowSourceZip ?? {}
  const flowRawReferences = (flow.generatedSourceInput ?? []).map((reference) => ({
    reference,
    path: normalizeReferencedPath(reference),
    consumer: flow.screenSourceRegistry ?? 'src/app/screens/flow-library/components/screenSources.ts',
    category: 'Source/ZIP raw input',
  }))
  const blockersFor = (candidatePath) => {
    const blockers = []
    const metadataRefs = metadataByPath.get(candidatePath) ?? []
    const sourceModuleRefs = sourceModulesByPath.get(candidatePath) ?? []
    const rawRefs = rawByPath.get(candidatePath) ?? []
    const typeRefs = nativeTypeByPath.get(candidatePath) ?? []
    const consumers = importerMap.get(candidatePath) ?? []
    const directNonRoute = consumers.filter((consumer) => {
      if (['screen-metadata', 'experience-sourceModules-metadata', 'raw-source', 'type-only'].includes(consumer.kind)) return false
      if (consumer.consumer === 'src/app/AppScreenRouter.tsx') return false
      if (oldRootSet.has(consumer.consumer)) return false
      if (consumer.consumer.startsWith('tests/') || consumer.consumer.includes('.test.')) return false
      return true
    })
    const oldScreenParentConsumers = consumers.filter((consumer) =>
      oldRootSet.has(consumer.consumer) && consumer.consumer !== candidatePath,
    )
    if (metadataRefs.length) blockers.push({ reason: 'ScreenRegistry componentPath metadata still names this file.', consumers: metadataRefs })
    if (sourceModuleRefs.length) blockers.push({ reason: 'ExperienceManifest sourceModules metadata still names this file; it is a deletion blocker, not a runtime edge.', consumers: sourceModuleRefs })
    if (rawRefs.length) blockers.push({ reason: 'Raw source/ZIP import references this file.', consumers: rawRefs })
    if (typeRefs.length) blockers.push({ reason: 'Native type-only import still needs this file for type checking.', consumers: typeRefs })
    if (directNonRoute.length) blockers.push({ reason: 'Runtime/tool consumer exists outside old PI router and its screen set.', consumers: directNonRoute })
    if (oldScreenParentConsumers.length) blockers.push({ reason: 'Another old Source screen module still imports this file; retire the exact dependency chain together.', consumers: oldScreenParentConsumers })
    const unresolved = unresolvedLocalEdges.filter((edge) => edge.unresolvedPath === candidatePath)
    if (unresolved.length) blockers.push({ reason: 'Unresolved local import points to this path.', consumers: unresolved })
    return blockers
  }
  const nativeEquivalentFor = (candidatePath) => {
    const evidence = NATIVE_EQUIVALENT_EVIDENCE.find((item) => item.sourcePath === candidatePath)
    if (!evidence) return null
    const evidencePaths = [evidence.nativePath, ...evidence.tests]
    return {
      ...evidence,
      status: evidencePaths.every((file) => existsSync(path.join(root, file))) ? 'implementation-and-test-files-found' : 'evidence-file-missing',
      evidenceFiles: evidencePaths.filter((file) => existsSync(path.join(root, file))),
      testsExecutedByAudit: false,
    }
  }

  const retireableUniquePaths = []
  const blockedPaths = []
  const nonUiRouteRoots = []
  const retainedSharedPaths = []
  for (const retained of retainedList) {
    retainedSharedPaths.push({
      path: retained.path,
      reason: retained.reason,
      authority: retained.authority,
      consumers: importerMap.get(retained.path) ?? [],
    })
  }
  for (const support of retainedSupportRecords.filter((record) => rootApprovedSupportPaths.has(record.path))) {
    if (retainedSharedPaths.some((entry) => entry.path === support.path)) continue
    retainedSharedPaths.push({
      path: support.path,
      reason: 'Root-approved hash-bound pure support dependency; preserve it while reviewing UI retirement.',
      authority: 'Root hash-bound retainedSupport record.',
      consumers: importerMap.get(support.path) ?? [],
    })
  }
  for (const bridge of scopedNativeBridgeCandidates.candidates.filter((candidate) => candidate.classification === 'root-approved-scoped-native-bridge')) {
    if (retainedSharedPaths.some((entry) => entry.path === bridge.path)) continue
    retainedSharedPaths.push({
      path: bridge.path,
      reason: 'Root-approved hash-bound scoped Native bridge; preserve only its reviewed excluded Source branches.',
      authority: 'Root scopedNativeBridges record.',
      consumers: importerMap.get(bridge.path) ?? [],
    })
  }
  for (const candidate of resolvedOldRoots) {
    if (approvedAdapterPaths.has(candidate.path) || approvedScopedNativeBridgePaths.has(candidate.path) || excludedOwnerPathSet.has(candidate.path)) continue
    const runtimeEvidence = uiEvidenceByPath.get(candidate.path)
    if (!runtimeEvidence?.isUiRuntime && !runtimeEvidence?.isNativePreviewOnlyWrapper) {
      nonUiRouteRoots.push({
        path: candidate.path,
        runtimeEvidence,
        disposition: 'not-a-UI-retirement-candidate',
        deletionBlockers: {
          runtimeConsumers: directRuntimeConsumers(candidate.path, edges),
          screenRegistryMetadata: metadataByPath.get(candidate.path) ?? [],
          experienceSourceModulesMetadata: sourceModulesByPath.get(candidate.path) ?? [],
          rawSourceConsumers: rawByPath.get(candidate.path) ?? [],
          nativeTypeConsumers: nativeTypeByPath.get(candidate.path) ?? [],
        },
      })
      continue
    }
    const consumers = importerMap.get(candidate.path) ?? []
    const blockers = blockersFor(candidate.path)
    const nativeEquivalentProof = nativeEquivalentFor(candidate.path)
    const adapterCandidate = nativePreviewAdapterCandidates.candidates.find((item) => item.path === candidate.path)
    if (runtimeEvidence.isNativePreviewOnlyWrapper && adapterCandidate?.classification !== 'root-approved-native-owned-adapter') {
      blockers.push({
        reason: 'NativeScreenPreview-only wrapper needs Root hash-bound approval before it can leave the PI retirement guard.',
        consumers: [{ consumer: 'Task6 Native adapter review', path: candidate.path, candidateStatus: adapterCandidate?.classification ?? 'not-listed' }],
      })
    }
    const nativeRuntime = consumers.filter((consumer) => consumer.consumer.startsWith('native-spike/') && consumer.kind !== 'type-only')
    if (nativeRuntime.length) blockers.push({ reason: 'Native runtime import reaches this Source UI file.', consumers: nativeRuntime })
    if (!nativeEquivalentProof) {
      blockers.push({
        reason: 'No path-specific Native-equivalent implementation/test proof is mapped; Root must decide whether this feature is retired or needs an equivalent.',
        consumers: [{ consumer: 'Task6 conservative proof map', path: candidate.path }],
      })
    } else if (nativeEquivalentProof.status !== 'implementation-and-test-files-found') {
      blockers.push({
        reason: 'Path-specific Native-equivalent evidence file is missing.',
        consumers: [{ consumer: 'Task6 conservative proof map', evidence: nativeEquivalentProof }],
      })
    }
    if (blockers.length) {
      blockedPaths.push({
        path: candidate.path,
        reason: blockers.map((blocker) => blocker.reason).join(' '),
        consumers: blockers.flatMap((blocker) => blocker.consumers),
      })
    } else {
      const routerConsumers = consumers.filter((consumer) => consumer.consumer === 'src/app/AppScreenRouter.tsx')
      retireableUniquePaths.push({
        path: candidate.path,
        sourceRouteSpecifier: candidate.specifier,
        state: routerConsumers.length ? 'candidate-after-AppScreenRouter-route-unlink' : 'reviewable-by-Root',
        nativeEquivalentProof,
        currentRouterConsumers: routerConsumers,
        archiveOnlyTestConsumers: consumers
          .filter((consumer) => consumer.consumer.startsWith('tests/') || consumer.consumer.includes('.test.'))
          .map((consumer) => consumer.consumer),
        requiredBeforeDelete: [
          ...(routerConsumers.length ? ['Remove the corresponding old PI branch/import from AppScreenRouter after archive verification.'] : []),
          'Root reviews this exact path; audit tool never deletes files.',
        ],
      })
    }
  }
  for (const unresolved of unresolvedOldRoots) {
    blockedPaths.push({ path: unresolved.path ?? unresolved.specifier, reason: unresolved.reason, consumers: [{ consumer: 'L15 consumer manifest', specifier: unresolved.specifier }] })
  }
  const sharedDependencyMap = new Map()
  for (const dependency of sourceClosure) {
    if (oldRootSet.has(dependency) || approvedAdapterPaths.has(dependency) || approvedScopedNativeBridgePaths.has(dependency) || rootApprovedSupportPaths.has(dependency)) continue
    const outsideConsumers = (importerMap.get(dependency) ?? []).filter((consumer) =>
      !sourceClosure.has(consumer.consumer) &&
      consumer.consumer !== 'src/app/AppScreenRouter.tsx' &&
      !consumer.consumer.startsWith('tests/') &&
      !consumer.consumer.includes('.test.'),
    )
    if (outsideConsumers.length) {
      sharedDependencyMap.set(dependency, {
        path: dependency,
        authority: 'Runtime consumer evidence only; not an exclusion or UI guard allowlist.',
        reason: outsideConsumers.some((consumer) => consumer.consumer.startsWith('native-spike/'))
          ? 'Old Source screen dependency is also consumed by Native code.'
          : 'Old Source screen dependency has consumers outside the retired PI route set.',
        consumers: outsideConsumers,
      })
    }
  }
  for (const shared of sharedDependencyMap.values()) {
    if (!retainedSharedPaths.some((entry) => entry.path === shared.path)) retainedSharedPaths.push(shared)
  }

  const sourceArchiveCopy = normalizeReferencedPath(sourceManifest.routerArchive?.copy)
  const archiveAbsolute = sourceArchiveCopy ? path.join(root, sourceArchiveCopy) : null
  const archiveHash = archiveAbsolute && existsSync(archiveAbsolute)
    ? createHash('sha256').update(readFileSync(archiveAbsolute)).digest('hex').toUpperCase()
    : null
  const sourceArchive = {
    path: sourceArchiveCopy,
    verified: Boolean(sourceManifest.routerArchive?.copyVerified && archiveHash && archiveHash === String(sourceManifest.routerArchive?.sha256 ?? '').toUpperCase()),
    sha256Expected: sourceManifest.routerArchive?.sha256 ?? null,
    sha256Observed: archiveHash,
    bytes: archiveAbsolute && existsSync(archiveAbsolute) ? readFileSync(archiveAbsolute).length : null,
    externalArchiveBuildConfig: sourceManifest.routerArchive?.externalArchiveBuildConfig ?? null,
  }
  const declaredRouteTargets = new Set([...oldRootPaths, ...routeGroupPaths, ...retainedPaths])
  return {
    schemaVersion: 1,
    status: 'audit-only-no-deletions',
    pathRetentionPolicy: 'Legacy route-manifest retained paths are inventory-only. Only hash-bound Root adapter/support/excluded-consumer records affect runtime/UI classification; no transitive retained closure is used.',
    sourceArchive,
    sourceRouterSnapshot: {
      currentPath: 'src/app/AppScreenRouter.tsx',
      currentSha256: existsSync(path.join(root, 'src/app/AppScreenRouter.tsx'))
        ? createHash('sha256').update(readFileSync(path.join(root, 'src/app/AppScreenRouter.tsx'))).digest('hex').toUpperCase()
        : null,
      archiveSha256: archiveHash,
    },
    retiredPiScreenRoots: resolvedOldRoots,
    sourceRouteGroups,
    dependencyGraph: {
      sourceClosureNodeCount: sourceClosure.size,
      sourceClosureNodes: [...sourceClosure].sort(),
      edgesWithinClosure: edges.filter((edge) => edge.to && sourceClosure.has(edge.from) && sourceClosure.has(edge.to)),
      incomingEdgesToScreenRoots: resolvedOldRoots.map((candidate) => ({
        path: candidate.path,
        consumers: importerMap.get(candidate.path) ?? [],
      })),
    },
    sourceUiClassification: {
      evidencePolicy: 'UI requires JSX other than NativeScreenPreview, React createElement/createPortal rendering, or React/custom hook runtime. Folder location alone never classifies UI. NativeScreenPreview-only wrappers are reported separately and require exact Root approval.',
      actualUiRuntimePaths: allOldSourceUiPaths.map((candidate) => ({ path: candidate, evidence: uiEvidenceByPath.get(candidate) })),
      nativePreviewOnlyWrappers: nativePreviewOnlyWrapperPaths.map((candidate) => ({
        path: candidate,
        classification: nativePreviewAdapterCandidates.candidates.find((item) => item.path === candidate)?.classification ?? 'not-listed',
        evidence: uiEvidenceByPath.get(candidate),
      })),
      pureSupportCandidates,
      retainedSupportRecords,
      excludedOwnerCandidates,
      excludedConsumerRecords,
      flowOwnedPrototypeChains,
      nonUiRouteRoots,
      rootApprovalManifestExtensionApi: {
        retainedSupport: {
          requiredFields: ['path', 'reviewedSha256', 'exactRuntimeConsumers', 'requiredTests', 'reason'],
          verification: 'Hash must match; AST must show no JSX, createElement/createPortal UI, or hook runtime; actual direct runtime consumer set must exactly match exactRuntimeConsumers; every required test path must exist.',
          scope: 'A pure support record never masks transitive UI imports or other paths.'
        },
        excludedConsumers: {
          requiredFields: ['path', 'reviewedSha256', 'excludedOwners or excludedOwner', 'experienceIds or experienceId', 'exactRuntimeChains', 'requiredTests', 'reason'],
          verification: 'Hash must match; exactRuntimeChains must cover every runtime consumer; each ordered chain must start at a minimal production root, end at path, and match runtime import edges; every chain must resolve to one of the named excluded owners/experiences; required tests must exist.',
          scope: 'An excluded-owner record preserves only the named exclusive context; any added in-scope runtime importer invalidates it.'
        },
        scopedNativeBridges: scopedNativeBridgeCandidates.recordApi,
      },
      scopedNativeBridgeCandidates: scopedNativeBridgeCandidates.candidates,
    },
    retireableUniquePaths,
    retainedSharedPaths,
    nativePreviewAdapterCandidates,
    scopedNativeBridgeCandidates,
    blockedPaths,
    screenRegistryMetadataReferences: metadataReferences.filter((reference) => oldRootSet.has(reference.path)),
    experienceSourceModuleMetadataReferences: experienceSourceModules,
    experienceSourceModuleRefsToOldSourceUi: experienceSourceModules.filter((reference) => allOldSourceUiPaths.includes(reference.path)),
    experienceSourceModuleRefsToNonUiDependencies: experienceSourceModules.filter((reference) => nonUiSourceScreenDependencies.includes(reference.path)),
    experienceSourceModuleRefsToNativePreviewWrappers: experienceSourceModules.filter((reference) => nativePreviewOnlyWrapperPaths.includes(reference.path)),
    nativeTypeConsumers: nativeTypeConsumers.filter((reference) => sourceClosure.has(reference.path)),
    rawExportReferences,
    rawExportReferencesToOldSourceUi: rawExportReferences.filter((reference) => allOldSourceUiPaths.includes(reference.path)),
    rawExportReferencesToNativePreviewWrappers: rawExportReferences.filter((reference) => nativePreviewOnlyWrapperPaths.includes(reference.path)),
    flowRawReferences,
    platformPreviewConsumers: platformPreviewConsumers.filter((reference) => declaredRouteTargets.has(reference.path)),
    platformPreviewChains,
    excludedContextConsumers: excludedContextConsumers.filter((reference) => declaredRouteTargets.has(reference.path)),
    sourceTests: {
      classification: 'archive-only',
      blocksRetirement: false,
      paths: archiveOnlyTests,
      directOldScreenImports: actualSourceScreenTests,
      note: 'Source tests were not changed; archive-only classification does not weaken Native-equivalent proof.',
    },
    nativeEquivalentProof: {
      tests: nativeEquivalentProofTests,
      changedByAudit: false,
    },
    flowSourceZip: {
      registry: flow.screenSourceRegistry ?? null,
      generatedSourceInput: flow.generatedSourceInput ?? [],
      packageBuilder: flow.packageBuilder ?? [],
      tests: flow.tests ?? [],
      compatibility: flow.compatibility ?? null,
    },
    normalProductionGraphGuard: {
      name: 'Full normal production graph (Source entry plus Native entrypoints)',
      scopeProjection: {
        excludedRuntimeEdges: reviewedExcludedRuntimeEdges,
        preservedFullGraph: true,
        rule: 'Only exact imported JSX edges of hash/branch/consumer/test-verified excluded branches are projected. Any other path remains in the PI traversal.',
      },
      roots: productionRoots,
      reachableRetiredPiUi,
      reachablePendingNativePreviewAdapters,
      reachablePendingScopedNativeBridges,
      excludedOwnerCandidates,
      flowOwnedPrototypeChains,
      nonUiSourceScreenDependencies,
      passed: reachableRetiredPiUi.length === 0 && reachablePendingNativePreviewAdapters.length === 0 && reachablePendingScopedNativeBridges.length === 0,
      platformPreviewChains,
      reachableDynamicPatterns,
      edgePolicy: 'Runtime graph edges are evaluated against AST-proven UI/hook files only; pure models, raw source, type-only edges, metadata, Flow-owned prototypes, exact excluded-owner chains, NativeScreenPreview wrappers, and conditional scoped Native bridge candidates are separate classifications.',
    },
    nativeOwnedProductionGraph: {
      roots: nativeRoots,
      reachableRetiredPiUi: retiredSourceUiPaths.filter((candidate) => nativeReachability.reached.has(candidate)),
      passed: retiredSourceUiPaths.every((candidate) => !nativeReachability.reached.has(candidate)),
    },
    sourceFallbackGraph: {
      root: sourceAppShell,
      appScreenRouterReachable: sourceShellReachability.reached.has('src/app/AppScreenRouter.tsx'),
      reachableOldSourceUiPaths: sourceFallbackUiReachable,
      reachableLegacyRouteRoots: sourceFallbackReachable,
      reachableExcludedOwnerPaths: sourceFallbackExcludedOwnerPaths,
      reachableNativePreviewWrappers: sourceFallbackNativePreviewWrappers,
      reachableFlowPrototypePaths: sourceFallbackFlowPrototypePaths,
      disposition: 'Actual Source UI, pure support, exact excluded-owner chains, and NativeScreenPreview wrappers are reported separately; retained-runtime reachability does not suppress in-scope UI edges.',
    },
    diagnostics: {
      scannedCodeFiles: files.length,
      importEdges: edges.length,
      unresolvedLocalImportEdges: unresolvedLocalEdges.length,
      dynamicImports: dynamicPatterns,
      deletionPerformed: false,
    },
  }
}

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    sourceManifest: DEFAULT_SOURCE_MANIFEST,
    adapterCandidates: DEFAULT_ADAPTER_CANDIDATES,
    adapterApprovals: DEFAULT_ADAPTER_APPROVALS,
    output: null,
    stdout: false,
    check: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--root') options.root = argv[++index]
    else if (argument === '--source-manifest') options.sourceManifest = argv[++index]
    else if (argument === '--adapter-candidates' || argument === '--adapter-manifest') options.adapterCandidates = argv[++index]
    else if (argument === '--adapter-approvals') options.adapterApprovals = argv[++index]
    else if (argument === '--output') options.output = argv[++index]
    else if (argument === '--stdout') options.stdout = true
    else if (argument === '--check') options.check = true
    else if (argument === '--help' || argument === '-h') options.help = true
    else throw new Error('Unknown argument: ' + argument)
  }
  return options
}

export function buildRetiredPiUiManifest(options = {}) {
  const root = path.resolve(options.root ?? process.cwd())
  const files = walkCodeFiles(root, ['src', 'native-spike', 'scripts', 'tests', 'docs'])
  return packageManifest({
    ...options,
    root,
    sourceManifest: options.sourceManifest ?? DEFAULT_SOURCE_MANIFEST,
    files,
  })
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  if (options.help) {
    process.stdout.write('Usage: node scripts/native-spike/audit-retired-pi-ui.mjs [--root PATH] [--source-manifest PATH] [--adapter-candidates PATH] [--adapter-approvals PATH] [--output PATH] [--stdout] [--check]' + String.fromCharCode(10))
    return 0
  }
  const root = path.resolve(options.root)
  const manifest = buildRetiredPiUiManifest({ ...options, root })
  const json = JSON.stringify(manifest, null, 2)
  if (options.output) {
    const output = path.resolve(root, options.output)
    mkdirSync(path.dirname(output), { recursive: true })
    writeFileSync(output, json, 'utf8')
  }
  if (options.stdout || !options.output) process.stdout.write(json)
  if (options.check && (!manifest.sourceArchive.verified || !manifest.normalProductionGraphGuard.passed)) return 1
  return 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main()
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.stack ?? error.message : String(error)) + String.fromCharCode(10))
    process.exitCode = 1
  }
}
