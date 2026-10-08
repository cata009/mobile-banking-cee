import type { CustomIconDefinition } from '../../iconTypes'

export const PLATFORM_CUSTOM_ICONS = {
  'demo-chevron-down': {
    source: 'custom',
    label: 'Demo topbar chevron down',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '6 8 12 8',
    usage: ['DemoTopBar'],
    notes: 'Deduplicated from product, country and release dropdown triggers.',
    render: () => (
      <path
        d="M18 9.27483C17.8177 9.07048 17.5943 8.90697 17.3444 8.79501C17.0946 8.68305 16.8238 8.62517 16.55 8.62517C16.2762 8.62517 16.0054 8.68305 15.7556 8.79501C15.5057 8.90697 15.2823 9.07048 15.1 9.27483L12 12.4228L8.9 9.27483C8.71773 9.07048 8.49433 8.90697 8.24444 8.79501C7.99455 8.68305 7.72382 8.62517 7.45 8.62517C7.17618 8.62517 6.90545 8.68305 6.65556 8.79501C6.40567 8.90697 6.18227 9.07048 6 9.27483L12 15.3748L18 9.27483Z"
        fill="currentColor"
      />
    ),
  },
  'demo-settings': {
    source: 'custom',
    label: 'Demo settings',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    usage: ['DemoTopBar'],
    render: () => (
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        d="M10.6628 14.7471C12.3527 15.4297 14.274 14.6148 14.9585 12.9248C15.6411 11.2347 14.8244 9.31128 13.1344 8.62865C11.4445 7.94602 9.52319 8.76284 8.84061 10.4529C8.15804 12.1429 8.9748 14.0644 10.6628 14.7471ZM2.1137 17.6697L1.02121 15.0585L3.50848 12.8857V11.1779L1 9.01752L2.07481 6.39923L5.38232 6.62199L6.57734 5.4251L6.33162 2.11202L8.94263 1.02122L11.1258 3.52105H12.8123L14.9831 1L17.6012 2.0749L17.3785 5.38091L18.5735 6.57779L21.8881 6.33028L22.9806 8.9415L20.4915 11.1143V12.8239L23 14.9825L21.9252 17.6025L18.6442 17.3798L17.4244 18.5996L17.6701 21.888L15.0574 22.9806L12.8989 20.5055H11.1665L9.01687 23L6.40056 21.9269L6.62154 18.6438L5.40177 17.4257L2.1137 17.6697Z"
        fill="currentColor"
      />
    ),
  },
  'demo-reset': {
    source: 'custom',
    label: 'Demo reset',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '3 1 18 22',
    usage: ['DemoTopBar'],
    render: () => (
      <>
        <path
          d="M11.4114 6.04748C11.511 6.03553 11.6104 6.02359 11.7107 6.01866C14.9887 5.85847 17.7858 8.41112 17.9449 11.7097C18.0303 13.4717 17.341 15.0907 16.1857 16.2457L17.7304 17.6014C19.2205 16.0567 20.1025 13.9248 19.9905 11.61C19.7766 7.17639 16.0176 3.74445 11.6109 3.96032C11.5286 3.96442 11.4471 3.97395 11.3653 3.98351C11.3237 3.98839 11.2819 3.99327 11.24 3.99745L12.1336 3.04528C12.6877 2.45679 12.3399 1.36506 11.9266 1L7.94008 5.23011L12.3461 9.11785C12.7273 8.71361 12.9726 7.52426 12.3707 6.99352L11.3356 6.05647C11.3609 6.05355 11.3862 6.05052 11.4114 6.04748Z"
          fill="currentColor"
        />
        <path
          d="M6.26959 6.39924C4.77951 7.94402 3.8975 10.0752 4.00954 12.39C4.22339 16.8229 7.9817 20.2549 12.3884 20.0397C12.4669 20.0358 12.5448 20.0267 12.6229 20.0175C12.6685 20.0122 12.7142 20.0069 12.76 20.0026L11.8664 20.954C11.3116 21.5425 11.6594 22.6343 12.0734 23L16.0599 18.7699L11.6532 14.8815C11.2727 15.2864 11.0267 16.4751 11.6286 17.0065L12.6644 17.9435C12.6391 17.9464 12.6138 17.9495 12.5886 17.9525C12.489 17.9645 12.3896 17.9764 12.2893 17.9813C9.01061 18.1415 6.21425 15.5882 6.05506 12.2896C5.96966 10.5283 6.65901 8.90926 7.81363 7.75428L6.26959 6.39924Z"
          fill="currentColor"
        />
      </>
    ),
  },
  play: {
    source: 'custom',
    label: 'Play',
    category: 'Header',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    usage: ['DemoTopBar', 'DesignSystemPage Icons inventory'],
    notes: '24x24 circular play control from the supplied UniCredit header SVG.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM9.09199 7.32853V16.6715H9.09258L18.0103 11.9999L9.09199 7.32853Z"
        fill="currentColor"
      />
    ),
  },
  'file-pdf': {
    source: 'custom',
    label: 'PDF file',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    usage: ['FlowLibraryScreen PDF export action'],
    notes: 'Compact document glyph labelled PDF for Flow Library exports.',
    render: () => (
      <>
        <path d="M6.5 2.75h7l4 4v14.5H6.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M13.5 2.75v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <text x="12" y="16.4" fill="currentColor" fontSize="5.3" fontWeight="700" textAnchor="middle">
          PDF
        </text>
      </>
    ),
  },
  'file-word': {
    source: 'custom',
    label: 'Word file',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    usage: ['FlowLibraryScreen Word export action'],
    notes: 'Compact document glyph labelled W for Flow Library Word exports.',
    render: () => (
      <>
        <path d="M6.5 2.75h7l4 4v14.5H6.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M13.5 2.75v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <text x="12" y="16.4" fill="currentColor" fontSize="7" fontWeight="700" textAnchor="middle">
          W
        </text>
      </>
    ),
  },
} satisfies Record<string, CustomIconDefinition>
