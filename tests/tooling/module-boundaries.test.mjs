import { expect, it } from 'vitest'
import { checkModuleImports } from '../../scripts/audit-module-boundaries.mjs'

it('keeps feature model imports pure and permits type-only contracts', () => {
  expect(
    checkModuleImports(
      'src/features/cards/model.ts',
      "import type { DemoState } from '@/app/state/demoTypes'; export const empty = {};",
    ),
  ).toEqual([])
  expect(checkModuleImports('src/features/cards/model.ts', "import { useState } from 'react';")).toHaveLength(1)
  expect(
    checkModuleImports('src/features/cards/model.ts', "import { Home } from '@/experiences/pi/ro/Home';"),
  ).toHaveLength(1)
})

it('prevents metadata entries from loading renderer modules indirectly through re-exports', () => {
  expect(checkModuleImports('src/flows/shared/flow/index.ts', "export { definition } from './definition';")).toEqual([])
  expect(checkModuleImports('src/flows/shared/flow/index.ts', "export { Preview } from './preview';")).toHaveLength(1)
})

it('recognizes actual extensionless renderer and hook dependencies', () => {
  expect(checkModuleImports('src/app/screens/flow-library/flows/index.ts', "export { renderInvestmentsBulkApprovalPreview } from '../components/investmentsBulkApprovalPreviews';")).toHaveLength(1)
  expect(checkModuleImports('src/features/cards/model.ts', "import { useProducts } from '@/hooks/useProducts';")).toHaveLength(1)
})

it('resolves an existing directory import through its index without reading the directory', () => {
  expect(() => checkModuleImports('src/features/cards/model.ts', "import { translations } from '@/translations';")).not.toThrow()
})
