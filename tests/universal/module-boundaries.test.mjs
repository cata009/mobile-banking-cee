import { expect, it } from 'vitest'
import { checkModuleImports } from '../../scripts/audit-module-boundaries.mjs'

it.each(['react', 'react-native', 'react-native-web', 'react-native-svg', '@/app/state/demoStore'])(
  'blocks UI runtime %s from universal core',
  (specifier) => {
    expect(checkModuleImports('src/universal/catalog.ts', `import { example } from '${specifier}'`)).toHaveLength(1)
  },
)
it('allows type-only contracts and canonical metadata imports', () => {
  expect(
    checkModuleImports(
      'src/universal/catalog.ts',
      "import type { DemoState } from '@/app/state/demoTypes'; import { EXPERIENCE_MANIFESTS } from '@/experiences/registry'",
    ),
  ).toEqual([])
})
it('permits the actual UI layer while preventing opaque imports in pure contracts', () => {
  expect(checkModuleImports('src/universal/ui/Button.tsx', "import { Pressable } from 'react-native'")).toEqual([])
  expect(checkModuleImports('src/universal/navigation/router.ts', 'const module = import(path)')).toHaveLength(1)
})
