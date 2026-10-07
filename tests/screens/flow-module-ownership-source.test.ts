import { FLOW_SCREEN_SOURCES } from '@/app/screens/flow-library/components/screenSources'
import { findFunctionSource } from '@/app/screens/flow-library/handoff/sourceSlices'
import { expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { INVESTMENTS_BULK_APPROVAL_FLOW } from '@/flows/shared/investments-bulk-approval'
import { buildFlowReferencePackage } from '@/app/screens/flow-library/handoff/referencePackage'
it('finds extracted screen source in dependency modules and keeps every archive source byte', async () => {
  const source = {
    file: 'src/flows/shared/investments-bulk-approval/dispatcher.tsx',
    source: 'export { BulkSelectionScreen } from "./Selection";\n',
    dependencies: [
      {
        file: 'src/flows/shared/investments-bulk-approval/Selection.tsx',
        source:
          'import PrimaryButton from "@/app/components/PrimaryButton";\nfunction BulkSelectionScreen() { return <PrimaryButton className="uc-type-n5">Select orders</PrimaryButton>; }\n',
      },
    ],
  }
  const bytes = await buildFlowReferencePackage(INVESTMENTS_BULK_APPROVAL_FLOW, source).arrayBuffer()
  const files = unzipSync(new Uint8Array(bytes))
  const components = strFromU8(files['screens/COMPONENTS.md']!)
  expect(components).toContain('PrimaryButton')
  expect(components).toContain('src/flows/shared/investments-bulk-approval/Selection.tsx')
  expect(components).toContain('uc-type-n5')
  expect(strFromU8(files[source.file]!)).toBe(source.source)
  expect(strFromU8(files['screens/dispatcher.tsx']!)).toBe(source.source)
  expect(strFromU8(files[source.dependencies[0]!.file]!)).toBe(source.dependencies[0]!.source)
})

it('keeps the real registered source complete and every declared Bulk screen discoverable', () => {
  expect(Object.keys(FLOW_SCREEN_SOURCES)).toEqual(['investments-bulk-approval'])
  const source = FLOW_SCREEN_SOURCES['investments-bulk-approval']!
  for (const name of Object.values(INVESTMENTS_BULK_APPROVAL_FLOW.implementation!.screenSource!.screens)) {
    expect(findFunctionSource(source, name!)?.slice.code, name).toContain('function ' + name)
  }
  expect(source.source).toContain('function renderInvestmentsBulkApprovalPreview')
  expect(source.source).not.toMatch(/^export \{.*\} from/m)
})
it('retains primary-source precedence and leaves missing function lookups explicit', () => {
  const primary = {
    file: 'main.tsx',
    source: 'function Screen() { return "primary"; }',
    dependencies: [{ file: 'other.tsx', source: 'function Screen() { return "dependency"; }' }],
  }
  expect(findFunctionSource(primary, 'Screen')?.file).toBe('main.tsx')
  expect(findFunctionSource(primary, 'Missing')).toBeUndefined()
})
