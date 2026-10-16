import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

type WrapperCase = {
  path: string
  component: string
  screen: string
  propsType: string
  entityId?: string
  routeAliases?: readonly string[]
}

const cases: readonly WrapperCase[] = [
  {
    path: 'src/app/screens/accounts/AccountDetailsInfoScreen.tsx',
    component: 'AccountDetailsInfoScreen',
    screen: 'account-info',
    propsType: 'AccountDetailsInfoScreenProps',
    entityId: 'selectedProductId',
    routeAliases: ['productId', 'accountId'],
  },
  {
    path: 'src/app/screens/accounts/AccountOptionsScreen.tsx',
    component: 'AccountOptionsScreen',
    screen: 'account-options',
    propsType: 'AccountOptionsScreenProps',
  },
  {
    path: 'src/app/screens/cards/CardDetailsInfoScreen.tsx',
    component: 'CardDetailsInfoScreen',
    screen: 'card-info',
    propsType: 'CardDetailsInfoScreenProps',
    entityId: 'selectedCardId',
    routeAliases: ['productId', 'cardId'],
  },
  {
    path: 'src/app/screens/cards/CardOptionsScreen.tsx',
    component: 'CardOptionsScreen',
    screen: 'card-options',
    propsType: 'CardOptionsScreenProps',
    entityId: 'selectedCardId',
    routeAliases: ['productId', 'cardId'],
  },
] as const

function readWrapper(path: string) {
  const text = readFileSync(resolve(process.cwd(), path), 'utf8')
  const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let preview: ts.JsxSelfClosingElement | undefined
  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sourceFile) === 'NativeScreenPreview') preview = node
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return { text, sourceFile, preview }
}

function jsxAttribute(element: ts.JsxSelfClosingElement, name: string) {
  return element.attributes.properties.find(
    (attribute): attribute is ts.JsxAttribute => ts.isJsxAttribute(attribute) && attribute.name.getText() === name,
  )
}

function jsxExpression(element: ts.JsxSelfClosingElement, name: string): ts.Expression {
  const initializer = jsxAttribute(element, name)?.initializer
  if (!initializer || !ts.isJsxExpression(initializer) || !initializer.expression)
    throw new Error(`NativeScreenPreview.${name} must receive an expression`)
  return initializer.expression
}

function objectProperty(object: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
  const property = object.properties.find(
    (entry): entry is ts.PropertyAssignment =>
      ts.isPropertyAssignment(entry) &&
      (ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)) &&
      entry.name.text === name,
  )
  return property?.initializer
}

describe('legacy PI detail adapters delegate to NativeScreenPreview', () => {
  it.each(cases)('$path keeps its source props and maps the canonical Native route', (item) => {
    const { text, sourceFile, preview } = readWrapper(item.path)
    expect(preview, 'the old Source UI body must be replaced by a NativeScreenPreview wrapper').toBeDefined()
    if (!preview) return

    const defaultExport = sourceFile.statements.find(
      (statement): statement is ts.FunctionDeclaration =>
        ts.isFunctionDeclaration(statement) &&
        statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword) === true,
    )
    expect(defaultExport?.name?.text).toBe(item.component)

    const imports = sourceFile.statements
      .filter(ts.isImportDeclaration)
      .map((statement) =>
        ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : statement.moduleSpecifier.getText(sourceFile),
      )
    expect(imports).toEqual(['@/app/components/demo/NativeScreenPreview'])

    const routeExpression = jsxExpression(preview, 'route')
    expect(ts.isObjectLiteralExpression(routeExpression)).toBe(true)
    if (!ts.isObjectLiteralExpression(routeExpression)) return
    expect(objectProperty(routeExpression, 'screen')?.getText(sourceFile)).toBe(`'${item.screen}'`)

    if (item.entityId && item.routeAliases) {
      const params = objectProperty(routeExpression, 'params')
      expect(params && ts.isConditionalExpression(params)).toBe(true)
      if (!params || !ts.isConditionalExpression(params)) return
      expect(params.condition.getText(sourceFile)).toBe(item.entityId)
      expect(params.whenFalse.getText(sourceFile)).toBe('undefined')
      expect(ts.isObjectLiteralExpression(params.whenTrue)).toBe(true)
      if (!ts.isObjectLiteralExpression(params.whenTrue)) return
      for (const alias of item.routeAliases)
        expect(objectProperty(params.whenTrue, alias)?.getText(sourceFile)).toBe(item.entityId)
    } else {
      expect(objectProperty(routeExpression, 'params')).toBeUndefined()
    }

    expect(jsxExpression(preview, 'onBack').getText(sourceFile)).toBe('onBack')
    expect(jsxExpression(preview, 'onNavigate').getText(sourceFile)).toBe("(_route, action) => action === 'push'")
    expect(jsxAttribute(preview, 'snapshot')).toBeUndefined()
    expect(jsxAttribute(preview, 'events')).toBeUndefined()

    const props = sourceFile.statements.find(
      (statement): statement is ts.InterfaceDeclaration =>
        ts.isInterfaceDeclaration(statement) && statement.name.text === item.propsType,
    )
    expect(props).toBeDefined()
    if (!props) return
    const members = props.members
      .filter((member): member is ts.PropertySignature => ts.isPropertySignature(member))
      .map((member) => ({ name: member.name.getText(sourceFile), optional: Boolean(member.questionToken) }))
    const expectedProps = item.entityId
      ? [
          { name: item.entityId, optional: true },
          { name: 'onBack', optional: false },
        ]
      : [{ name: 'onBack', optional: false }]
    expect(members).toEqual(expectedProps)
    expect(text).not.toMatch(/PageHeader|useDemo|useProducts|SectionHeadingDivider/)
  })
})
