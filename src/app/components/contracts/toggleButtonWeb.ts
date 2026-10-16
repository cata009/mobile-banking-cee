import { resolveToggleButton, type ToggleButtonOptions } from './toggleButton'

const positions = { 4: 'left-[4px]', 34: 'left-[34px]' } as const
const widths = { 60: 'w-[60px]' } as const
export function toggleButtonWeb(options: ToggleButtonOptions) {
  const state = resolveToggleButton(options)
  return {
    ...state,
    buttonClass: 'inline-flex rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--uc-action)_30%,transparent)] disabled:cursor-not-allowed disabled:opacity-50',
    frameClass: `relative inline-flex h-[30px] ${widths[state.width]} shrink-0 overflow-hidden`,
    knobClass: 'absolute top-[4px] h-[22px] w-[22px] transition-[left] duration-200 ease-out',
    knobPositionClass: positions[state.knobLeft],
  } as const
}
