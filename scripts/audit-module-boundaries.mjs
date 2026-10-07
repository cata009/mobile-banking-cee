import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, posix, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
function resolveModule(target) {
  const candidates = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`, `${target}/index.tsx`]
  return candidates.find(candidate => candidate.startsWith('src/') && existsSync(join(repoRoot, candidate)) && statSync(join(repoRoot, candidate)).isFile())
}
function runtimeSpecifiers(file, source) {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const values = []
  for (const node of ast.statements) {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause
      const types = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) && !clause.name && clause.namedBindings.elements.every(element => element.isTypeOnly)
      if (!types) values.push(node.moduleSpecifier.text)
    }
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const types = node.exportClause && ts.isNamedExports(node.exportClause) && node.exportClause.elements.every(element => element.isTypeOnly)
      if (!types) values.push(node.moduleSpecifier.text)
    }
  }
  return values
}
function moduleTarget(specifier, from) {
  return specifier.startsWith('@/') ? `src/${specifier.slice(2)}`
    : specifier.startsWith('.') ? posix.normalize(posix.join(posix.dirname(from), specifier)) : specifier
}
function importsUi(target, seen = new Set()) {
  if (/^(?:react(?:-dom)?(?:\/|$)|src\/hooks\/|src\/app\/(?:components|contexts)|src\/app\/state\/demoStore)/.test(target)
    || /(?:^|\/)(?:preview|use[A-Z]\w*)(?:\.|\/|$)/.test(target)
    || target.endsWith('.tsx')) return true
  const module = resolveModule(target)
  if (!module || seen.has(module)) return false
  if (module.endsWith('.tsx')) return true
  seen.add(module)
  return runtimeSpecifiers(module, readFileSync(join(repoRoot, module), 'utf8')).some(specifier => importsUi(moduleTarget(specifier, module), seen))
}

export function checkModuleImports(file, source) {
  const path = file.replaceAll('\\', '/')
  const feature = path.startsWith('src/features/')
  const model = feature && /\/(?:model|demoClock|groupCount|\w+Selection|\w+Selectors?)\.tsx?$/.test(path)
  const metadata =
    (path.startsWith('src/experiences/') && path.endsWith('/manifest.ts')) ||
    (path.startsWith('src/flows/') && /\/(?:index|definition)\.ts$/.test(path)) || path === 'src/app/screens/flow-library/flows/index.ts'
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)
  const violations = []
  const check = (specifier) => {
    const target = specifier.startsWith('@/')
      ? `src/${specifier.slice(2)}`
      : specifier.startsWith('.')
        ? posix.normalize(posix.join(posix.dirname(path), specifier))
        : specifier
    if (feature && /^(?:src\/experiences|src\/flows)\//.test(target))
      violations.push(`${path}: feature imports composition ${specifier}`)
    const ui =
      /^(?:react(?:-dom)?(?:\/|$)|src\/app\/(?:components|contexts)|src\/app\/state\/demoStore)/.test(target) ||
      /(?:^|\/)preview(?:\.|\/|$)/.test(target) ||
      target.endsWith('.tsx') ||
      (target.startsWith('src/app/screens/') && !target.includes('/flow-library/flows/'))
    if ((model || metadata) && (ui || importsUi(target))) violations.push(`${path}: pure model/metadata imports UI ${specifier}`)
  }
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause
      const onlyNamedTypes =
        clause?.namedBindings &&
        ts.isNamedImports(clause.namedBindings) &&
        !clause.name &&
        clause.namedBindings.elements.every((element) => element.isTypeOnly)
      if (!onlyNamedTypes) check(node.moduleSpecifier.text)
    }
    if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const onlyTypes =
        node.exportClause &&
        ts.isNamedExports(node.exportClause) &&
        node.exportClause.elements.every((element) => element.isTypeOnly)
      if (!onlyTypes) check(node.moduleSpecifier.text)
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments[0] && ts.isStringLiteral(node.arguments[0])) check(node.arguments[0].text)
      else if (model || metadata) violations.push(`${path}: pure model/metadata uses an opaque dynamic import`)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return violations
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(path)
    }
  }
  for (const dir of ['features', 'experiences', 'flows']) {
    try {
      walk(join(root, 'src', dir))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  files.push(join(root, 'src/app/screens/flow-library/flows/index.ts'))
  const violations = files.flatMap((path) => checkModuleImports(relative(root, path), readFileSync(path, 'utf8')))
  if (violations.length) throw new Error(`Module boundary violations:\n${violations.join('\n')}`)
  console.log(`Module boundaries ok: ${files.length} files`)
}
