import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

type WrapperCase = {
  path: string
  component: string
  screen: string
  flowStep?: 'create' | 'review' | 'sign' | 'success'
  paymentEntryRequest?: boolean
  previewComponent: 'NativeScreenPreview' | 'PaymentFlowPreview'
}

const wrappers: readonly WrapperCase[] = [
  {
    path: 'src/app/screens/payments/PaymentsScreen.tsx',
    component: 'PaymentsScreen',
    screen: 'payments',
    paymentEntryRequest: true,
    previewComponent: 'NativeScreenPreview',
  },
  {
    path: 'src/app/screens/payments/DomesticPaymentFlowScreens.tsx',
    component: 'DomesticPaymentCreateScreen',
    screen: 'payment-create',
    flowStep: 'create',
    previewComponent: 'PaymentFlowPreview',
  },
  {
    path: 'src/app/screens/payments/DomesticPaymentFlowScreens.tsx',
    component: 'PaymentReviewScreen',
    screen: 'payment-create',
    flowStep: 'review',
    previewComponent: 'PaymentFlowPreview',
  },
  {
    path: 'src/app/screens/payments/DomesticPaymentFlowScreens.tsx',
    component: 'PaymentSignScreen',
    screen: 'payment-create',
    flowStep: 'sign',
    previewComponent: 'PaymentFlowPreview',
  },
  {
    path: 'src/app/screens/payments/DomesticPaymentFlowScreens.tsx',
    component: 'PaymentSuccessScreen',
    screen: 'payment-create',
    flowStep: 'success',
    previewComponent: 'PaymentFlowPreview',
  },
  {
    path: 'src/app/screens/payments/Evo2027DomesticPaymentFlow.tsx',
    component: 'Evo2027DomesticPaymentCreateScreen',
    screen: 'payment-create',
    flowStep: 'create',
    previewComponent: 'PaymentFlowPreview',
  },
  {
    path: 'src/app/screens/payments/Evo2027DomesticPaymentFlow.tsx',
    component: 'Evo2027PaymentReviewScreen',
    screen: 'payment-create',
    flowStep: 'review',
    previewComponent: 'PaymentFlowPreview',
  },
] as const

function readExport(path: string, component: string, previewComponent: string) {
  const text = readFileSync(resolve(process.cwd(), path), 'utf8')
  const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const declaration = sourceFile.statements.find(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === component,
  )
  let preview: ts.JsxSelfClosingElement | undefined
  if (declaration?.body) {
    const visit = (node: ts.Node) => {
      if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sourceFile) === previewComponent) preview = node
      ts.forEachChild(node, visit)
    }
    visit(declaration.body)
  }
  return { text, sourceFile, declaration, preview }
}

function attributeExpression(element: ts.JsxSelfClosingElement, name: string) {
  const initializer = element.attributes.properties.find(
    (attribute): attribute is ts.JsxAttribute => ts.isJsxAttribute(attribute) && attribute.name.getText() === name,
  )?.initializer
  return initializer && ts.isJsxExpression(initializer) ? initializer.expression : undefined
}

function propertyValue(object: ts.Expression | undefined, name: string) {
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined
  const property = object.properties.find((entry) => {
    if (ts.isPropertyAssignment(entry))
      return (ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)) && entry.name.text === name
    return ts.isShorthandPropertyAssignment(entry) && entry.name.text === name
  })
  if (property && ts.isPropertyAssignment(property)) return property.initializer
  if (property && ts.isShorthandPropertyAssignment(property)) return property.name
  return undefined
}

describe('Source payment screen adapters delegate to NativeScreenPreview', () => {
  it.each(wrappers)('$path exports a $component Native preview', (item) => {
    const { sourceFile, declaration, preview } = readExport(item.path, item.component, item.previewComponent)
    expect(declaration, `${item.component} must keep its Source caller export`).toBeDefined()
    expect(preview, `${item.component} must render a Native preview`).toBeDefined()
    if (!declaration || !preview) return

    expect(
      preview.attributes.properties.some(
        (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'route',
      ),
    ).toBe(true)
    const route = attributeExpression(preview, 'route')
    expect(propertyValue(route, 'screen')?.getText(sourceFile)).toBe(`'${item.screen}'`)

    if (item.previewComponent === 'NativeScreenPreview') {
      const snapshot = attributeExpression(preview, 'snapshot')
      expect(propertyValue(snapshot, 'paymentFlow')).toBeDefined()
      const events = attributeExpression(preview, 'events')
      expect(propertyValue(events, 'onPaymentFlowChange')).toBeDefined()
      if (item.paymentEntryRequest) {
        // Payment selections are consumed by the route owner; an un-emitted event cannot deliver them.
        expect(attributeExpression(preview, 'onNavigate')?.getText(sourceFile)).toBe('onNavigate')
        expect(declaration.body?.getText(sourceFile)).toContain('handlePaymentEntryRequest(route, props, country, release)')
      }
    } else {
      expect(attributeExpression(preview, 'initialFlow')).toBeDefined()
      expect(attributeExpression(preview, 'onFlowChange')).toBeDefined()
      expect(declaration.body?.getText(sourceFile)).toContain('paymentFlow')
      if (item.flowStep === 'create' || item.flowStep === 'review')
        expect(declaration.body?.getText(sourceFile)).toContain('draft')
    }

    expect(attributeExpression(preview, 'onBack')).toBeDefined()
    expect(declaration.body?.getText(sourceFile)).not.toMatch(
      /Evo2027PaymentsHub|StandardSignScreen|StandardSuccessScreen/,
    )
  })

  it('keeps the canonical Source flow metadata available to the payment steps', () => {
    for (const item of wrappers.filter((wrapper) => wrapper.flowStep)) {
      const { sourceFile, declaration, preview } = readExport(item.path, item.component, item.previewComponent)
      expect(preview).toBeDefined()
      if (!preview) continue
      expect(attributeExpression(preview, 'initialFlow')).toBeDefined()
      expect(declaration?.body?.getText(sourceFile)).toContain('paymentFlow')
    }
  })

  it('keeps the shared flow host inside the NativeScreenPreview bridge', () => {
    const paths = [
      'src/app/screens/payments/DomesticPaymentFlowScreens.tsx',
      'src/app/screens/payments/Evo2027DomesticPaymentFlow.tsx',
    ]
    for (const path of paths) {
      const { sourceFile } = readExport(
        path,
        wrappers.find((item) => item.path === path)!.component,
        'PaymentFlowPreview',
      )
      const preview = sourceFile.statements
        .filter(ts.isFunctionDeclaration)
        .find((statement) => statement.name?.text === 'PaymentFlowPreview')
      let nativePreview: ts.JsxSelfClosingElement | undefined
      if (preview?.body) {
        const visit = (node: ts.Node) => {
          if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sourceFile) === 'NativeScreenPreview')
            nativePreview = node
          ts.forEachChild(node, visit)
        }
        visit(preview.body)
      }
      expect(nativePreview).toBeDefined()
      if (!nativePreview) continue
      const flow = propertyValue(attributeExpression(nativePreview, 'snapshot'), 'paymentFlow')
      expect(['flow', 'paymentFlow']).toContain(flow?.getText(sourceFile))
      const events = propertyValue(attributeExpression(nativePreview, 'events'), 'onPaymentFlowChange')
      expect(events).toBeDefined()
    }
  })
})
