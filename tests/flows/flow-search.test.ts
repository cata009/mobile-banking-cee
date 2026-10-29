import { describe, expect, it } from 'vitest'
import { FLOW_DEFINITIONS } from '@/app/screens/flow-library/flows'
import { buildFlowSearchEntries, searchFlows, resolveSelectedPassage } from '@/features/flow-collaboration/search'

describe('Specs full-text search', () => {
  const original = FLOW_DEFINITIONS['mobile-pi-ethoca']
  const flow = { ...original, overview: { ...original.overview, rules: [{ id: 'rule-new', group: 'Logo', statement: 'Plată fără siglă: păstrează simbolul standard.' }] } }
  it('finds text in rules with diacritics normalized and carries a real section target', () => {
    const result = searchFlows([flow], 'plata fara sigla')
    expect(result).toHaveLength(1)
    expect(result[0]?.matches[0]).toMatchObject({ section: 'spec', targetId: 'rule-rule-new', text: expect.stringContaining('Plată fără siglă') })
    expect(searchFlows([flow], 'no-such-phrase')).toEqual([])
  })
  it('indexes scenario steps with their scenario and step identifiers', () => {
    const scenario = { ...original.scenarios[0]!, id: 'review-case', steps: [{ ...original.scenarios[0]!.steps[0]!, id: 'review-one', description: 'Distinctive scenario instruction' }] }
    const result = searchFlows([{ ...original, scenarios: [scenario] }], 'distinctive scenario')
    expect(result[0]?.matches[0]).toMatchObject({ section: 'journey', scenarioId: 'review-case', stepId: 'review-one' })
  })
  it('provides deterministic distinct paragraph anchors and preserves plain text markup', () => {
    const withNote = { ...original, overview: { ...original.overview, notes: [{ title: 'Safety', body: '<script>literal text</script>' }] } }
    const entries = buildFlowSearchEntries(withNote)
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length)
    expect(searchFlows([withNote], 'literal text')[0]?.matches[0]?.text).toBe('<script>literal text</script>')
    expect(buildFlowSearchEntries(withNote).map((e) => e.id)).toEqual(entries.map((e) => e.id))
  })
  it('does not silently anchor duplicate selected text to the first screen', () => {
    const entries = [
      { id: 'screen.vehicles.purpose', label: 'Vehicles', text: 'Same paragraph', section: 'spec' as const, targetId: 'spec-section-screen-spec' },
      { id: 'screen.attention.purpose', label: 'Attention', text: 'Same paragraph', section: 'spec' as const, targetId: 'spec-section-screen-spec' },
    ]
    expect(resolveSelectedPassage(entries, 'Same paragraph')).toBeNull()
    expect(resolveSelectedPassage(entries, 'Same paragraph', 'screen.attention.')).toMatchObject({ id: 'screen.attention.purpose' })
  })
})
