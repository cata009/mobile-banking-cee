import type { CustomIconDefinition } from '../../iconTypes'

export const ANALYTICS_CUSTOM_ICONS = {
  'analytics-donut-toggle': {
    source: 'custom',
    label: 'Analytics donut toggle',
    category: 'Actions',
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    usage: ['Evo2027AnalyticsScreen expense chart mode toggle'],
    notes: 'Exact 16x16 artwork supplied for the Evo 2027 analytics selector.',
    render: () => (
      <>
        <path
          d="M7.54175 0.666016V3.1135C5.25696 3.34404 3.43921 5.11366 3.13396 7.37461L3.11425 7.54098H0.666748C0.89179 3.84133 3.84208 0.891056 7.54175 0.666016Z"
          fill="currentColor"
        />
        <path
          d="M12.858 8.4439H15.3334C15.2417 9.99489 14.6537 11.4735 13.66 12.6633L13.5001 12.8485L11.7492 11.1022C12.3235 10.3959 12.6971 9.54985 12.8318 8.65198L12.858 8.4439Z"
          fill="currentColor"
        />
        <path
          d="M3.14633 8.45765C3.31454 10.2552 4.46404 11.8122 6.13237 12.502C7.80071 13.1922 9.71425 12.9021 11.1025 11.7485L12.8492 13.4993C11.5141 14.6873 9.78712 15.3404 8.00008 15.3326C4.12212 15.3404 0.909206 12.3273 0.666748 8.45765H3.14633Z"
          fill="currentColor"
        />
        <path
          d="M15.2615 7.34757C14.9791 3.746 12.0838 0.885556 8.45842 0.666016V3.1135L8.62342 3.13367C10.8711 3.44442 12.6205 5.26628 12.8263 7.54098H15.2738L15.2615 7.34757Z"
          fill="currentColor"
        />
      </>
    ),
  },
  'analytics-bars-toggle': {
    source: 'custom',
    label: 'Analytics bars toggle',
    category: 'Actions',
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    usage: ['Evo2027AnalyticsScreen expense chart mode toggle'],
    notes: 'Exact 16x16 artwork supplied for the Evo 2027 analytics selector.',
    render: () => (
      <>
        <path
          d="M11.6667 4.33268V15.3327C13.6917 15.3327 15.3334 13.6909 15.3334 11.666V0.666016C13.3085 0.666016 11.6667 2.30777 11.6667 4.33268Z"
          fill="currentColor"
        />
        <path
          d="M0.666748 11.666V15.3327C2.69166 15.3327 4.33341 13.6909 4.33341 11.666V7.99935C2.3085 7.99935 0.666748 9.6411 0.666748 11.666Z"
          fill="currentColor"
        />
        <path
          d="M6.16675 15.3327V7.08268C6.16675 5.05777 7.8085 3.41602 9.83342 3.41602V11.666C9.83342 13.6909 8.19167 15.3327 6.16675 15.3327Z"
          fill="currentColor"
        />
      </>
    ),
  },
} satisfies Record<string, CustomIconDefinition>
