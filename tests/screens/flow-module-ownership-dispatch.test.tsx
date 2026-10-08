// @vitest-environment jsdom
import { isValidElement } from 'react'
import { expect, it } from 'vitest'
import { FLOW_DEFINITIONS, FLOW_ORDER } from '@/app/screens/flow-library/flows'
import { renderFlowPreview } from '@/app/screens/flow-library/components/flowPreviews'
import type { FlowScreenKind } from '@/app/screens/flow-library/flows/types'
it('dispatches every declared screen kind through the owned preview entry for every supported country', () => {
  for (const id of FLOW_ORDER) {
    const flow = FLOW_DEFINITIONS[id]
    const kinds = new Set<FlowScreenKind>([
      ...(Object.keys(flow.screenSpecs) as FlowScreenKind[]),
      ...flow.scenarios.flatMap((scenario) => scenario.steps.map((step) => step.screen)),
    ])
    for (const countryName of flow.countryScope)
      for (const kind of kinds)
        expect(isValidElement(renderFlowPreview(kind, { countryName })), `${id}:${countryName}:${kind}`).toBe(true)
  }
  for (const unknown of ['unknown-runtime-kind', 'constructor', 'toString', '__proto__'])
    expect(renderFlowPreview(unknown as FlowScreenKind)).toBeNull()
})
