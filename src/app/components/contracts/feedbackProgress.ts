/** Source presentation facts only; consuming features own values, labels and decisions. */
export const FEEDBACK_PROGRESS_SOURCE = {
  fileKey: 'FKbbStgBIP9bFAMl3DPKHF',
  skeleton: '179:15689',
  output: {
    familyId: '2117:1413',
    variants: {
      'empty-title': '2117:1403',
      'full-title': '2117:1414',
      'full-no-title': '2237:1634',
      'empty-no-title': '7076:1461',
    },
  },
  slider: { familyId: '2142:1825', variants: { default: '2128:3142', max: '2142:1826' } },
  linear: {
    familyId: '2292:4808',
    variants: { '40': '2292:4802', '0': '2292:4830', '100': '2292:4851', '90': '2292:4872' },
    anomaly:
      'Source40% renders217px filled on the right of327px (~66.36%). Runtime fill and accessible value derive from the supplied real value.',
  },
  info: { familyId: '178:15151', variants: { image: '178:15148', text: '178:15149', icon: '297:18261' } },
  nps: { familyId: '2449:7800', variants: { empty: '2449:7801', selected: '2449:7817' } },
} as const

export const FEEDBACK_PROGRESS_VARIANTS = {
  'ui.feedback-skeleton': ['default'],
  'ui.feedback-output': ['empty-title', 'full-title', 'full-no-title', 'empty-no-title'],
  'ui.feedback-slider': ['default', 'max'],
  'ui.feedback-linear': ['40', '0', '100', '90'],
  'ui.feedback-info': ['image', 'text', 'icon'],
  'ui.feedback-nps': ['empty', 'selected'],
} as const

export function resolveFeedbackProgress({
  value = 0,
  min = 0,
  max = 100,
  width = 327,
}: { value?: number; min?: number; max?: number; width?: number } = {}) {
  const safe = Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min
  const fraction = max > min ? (safe - min) / (max - min) : 0
  return { value: safe, min, max, fraction, fillWidth: Math.round(width * fraction * 10000) / 10000 }
}
