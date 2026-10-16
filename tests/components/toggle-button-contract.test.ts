import { describe, expect, it } from 'vitest'
import { resolveToggleButton } from '@/app/components/contracts/toggleButton'

describe('toggle preservation contract', () => {
  it('keeps the original baseline geometry and CSS timing', () => {
    expect(resolveToggleButton({ checked: true, interactive: true })).toMatchObject({
      width: 60,
      height: 30,
      knobSize: 22,
      knobTop: 4,
      knobLeft: 34,
      movementDurationMs: 200,
      transitionProperty: 'left',
      opacity: 1,
      trackColor: 'var(--uc-surface)',
    })
    expect(resolveToggleButton({ checked: false })).toMatchObject({ knobLeft: 4, mode: 'visual' })
  })
  it('preserves disabled semantics only in the interactive mode', () => {
    expect(resolveToggleButton({ checked: true, disabled: true, interactive: true })).toMatchObject({
      opacity: 0.5,
      disabled: true,
    })
    expect(resolveToggleButton({ checked: true, disabled: true })).toMatchObject({ opacity: 1, mode: 'visual' })
  })
  it.each([true, false])('normalizes the approved Prime styling alias to baseline checked=%s', checked => {
    expect(resolveToggleButton({ variant: 'prime-mail', checked, interactive: true })).toEqual(
      resolveToggleButton({ variant: 'baseline', checked, interactive: true }),
    )
  })
})
