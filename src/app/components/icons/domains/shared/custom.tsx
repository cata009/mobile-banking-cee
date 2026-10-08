import type { CustomIconDefinition } from '../../iconTypes'

export const SHARED_CUSTOM_ICONS = {
  'header-profile': {
    source: 'custom',
    label: 'Header profile',
    category: 'Header',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['HeaderActionIcons', 'Payments header', 'Products header', 'More header'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 20C15.5229 20 20 15.5229 20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5229 4.47715 20 10 20ZM9.95831 5C11.2528 5 12.3021 6.04938 12.3021 7.34375C12.3021 8.63812 11.2528 9.6875 9.95831 9.6875C8.664 9.6875 7.61456 8.63812 7.61456 7.34375C7.61456 6.04938 8.664 5 9.95831 5ZM15 15H5.625C5.66906 12.7459 7.50719 10.9409 9.76188 10.9375H15V15Z"
        fill="currentColor"
      />
    ),
  },
  'header-messages': {
    source: 'custom',
    label: 'Header messages',
    category: 'Header',
    width: 20,
    height: 20,
    viewBox: '5 8 22 15',
    usage: ['HeaderActionIcons', 'Payments header', 'Products header', 'More header'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 10.67V9.5H26V10.67L16 17.5413L6 10.67ZM6 12.3381L16 19.2094L26 12.3387V18.6669C26 20.5075 24.5075 22 22.6669 22H6V12.3381Z"
        fill="currentColor"
      />
    ),
  },
  'help-circle': {
    source: 'custom',
    label: 'Help circle',
    category: 'Header',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['HeaderActionIcons', 'PageHeader help', 'Products header', 'Payments header'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.125 7.03187C13.125 6.99563 13.1175 6.96438 13.1163 6.92875C13.0731 8.0425 12.58 8.92437 11.5631 9.6875L11.195 9.9675C10.7419 10.3181 10.5556 10.5344 10.4544 10.8381V11.0844C10.4544 11.9294 9.84188 12.6175 9.08875 12.6175H8.43625L8.45062 10.9981C8.46875 9.965 8.69063 9.68 9.71313 8.82375L10.1594 8.5C10.8806 7.97937 11.0825 7.50937 11.115 6.98562C11.0813 6.305 10.6894 6.00812 9.8125 6.00812C9.4625 6.00812 9.06312 6.08687 8.65 6.175C8.34062 6.24312 8.04625 6.20312 7.77313 6.05813C7.35687 5.88875 7.05062 5.5425 6.93375 5.09312L6.875 4.8675L8.62438 4.45125C9.04438 4.36188 9.53687 4.31187 9.99875 4.31187C11.9725 4.31187 13.0712 5.24375 13.1163 6.92875C13.1187 6.87562 13.125 6.82438 13.125 6.77V7.03187ZM9.4145 16.25C8.80138 16.25 8.302 15.7475 8.302 15.1306C8.302 14.5131 8.80138 14.0112 9.4145 14.0112C10.0289 14.0112 10.5289 14.5131 10.5289 15.1306C10.5289 15.7475 10.0289 16.25 9.4145 16.25ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 4.4775 15.5225 0 10 0Z"
        fill="currentColor"
      />
    ),
  },
  'nav-home': {
    source: 'custom',
    label: 'Bottom nav home',
    category: 'Navigation',
    width: 20,
    height: 20,
    viewBox: '6 5 20 21',
    usage: ['BottomNavigation'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0787 5L7 12.2188V21.441C7 23.959 9.00688 26 11.4829 26H14.0641V20.0938C14.0641 19.3692 14.6417 18.7812 15.3547 18.7812H16.6453C17.3577 18.7812 17.9359 19.3692 17.9359 20.0938V26H20.5171C22.9932 26 25 23.959 25 21.441V12.2188L16.0787 5Z"
        fill="currentColor"
      />
    ),
  },
  'nav-analytics': {
    source: 'custom',
    label: 'Bottom nav analytics',
    category: 'Navigation',
    width: 20,
    height: 20,
    viewBox: '6 6 20 20',
    usage: ['BottomNavigation'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.8399 17.112V8.27267C9.95559 8.28642 6 12.2489 6 17.1357C6 22.0313 9.96871 26 14.8643 26C19.7605 26 23.7286 22.0313 23.7286 17.1357C23.7286 17.127 23.728 17.1207 23.728 17.112H14.8399ZM17.136 6C17.1285 6 17.1198 6.00125 17.1116 6.00125V14.8399H25.9997C25.9866 9.95621 22.0235 6 17.136 6"
        fill="currentColor"
      />
    ),
  },
  'nav-payments': {
    source: 'custom',
    label: 'Bottom nav payments',
    category: 'Navigation',
    width: 20,
    height: 20,
    viewBox: '4 8 24 16',
    usage: ['BottomNavigation'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 10.9999V21.5H22.5623L21.4374 23H4V10.9999H5.5ZM23.5 8L28 14.0001L23.5 20.0001H7.00013V8H23.5ZM17.176 10C16.6343 10.5531 16.6343 11.448 17.176 12L18.4459 13.2933H11L11.0006 14.7072H18.4459L17.176 16C16.6343 16.552 16.6343 17.448 17.176 18L21.1053 14L17.176 10Z"
        fill="currentColor"
      />
    ),
  },
  'nav-products': {
    source: 'custom',
    label: 'Bottom nav products',
    category: 'Navigation',
    width: 20,
    height: 20,
    viewBox: '6 6 20 20',
    usage: ['BottomNavigation'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 17H26V22.4C26 24.3882 24.3882 26 22.4 26H17V17ZM21.1415 6L26 15H19.1442C17.4959 15 16.4659 13.2232 17.2901 11.8007L21.1415 6ZM6 21.4996C6.00022 19.0145 8.01495 17 10.5001 17C12.9853 17 14.9999 19.0147 15 21.4998C15.0001 23.985 12.9856 25.9998 10.5005 26C8.01498 26 6.00009 23.9851 6 21.4996ZM9.6 6H15V15H6V9.6C6 7.61178 7.61178 6 9.6 6Z"
        fill="currentColor"
      />
    ),
  },
  'nav-more': {
    source: 'custom',
    label: 'Bottom nav more',
    category: 'Navigation',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['BottomNavigation'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 6.875C9.31 6.875 8.75 6.315 8.75 5.625C8.75 4.935 9.31 4.375 10 4.375C10.69 4.375 11.25 4.935 11.25 5.625C11.25 6.315 10.69 6.875 10 6.875ZM10 11.25C9.31 11.25 8.75 10.69 8.75 10C8.75 9.31 9.31 8.75 10 8.75C10.69 8.75 11.25 9.31 11.25 10C11.25 10.69 10.69 11.25 10 11.25ZM10 15.625C9.31 15.625 8.75 15.065 8.75 14.375C8.75 13.685 9.31 13.125 10 13.125C10.69 13.125 11.25 13.685 11.25 14.375C11.25 15.065 10.69 15.625 10 15.625ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5225 4.4775 20 10 20C15.5225 20 20 15.5225 20 10C20 4.4775 15.5225 0 10 0Z"
        fill="currentColor"
      />
    ),
  },
  'amount-hide': {
    source: 'custom',
    label: 'Hide amounts',
    category: 'Accounts',
    width: 20,
    height: 20,
    viewBox: '6 6 20 20',
    usage: ['AmountVisibilityButton'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7776 18.3322C11.8595 17.8334 10.9707 17.0822 10.0638 16.0002C11.2794 14.5483 12.4613 13.6827 13.7276 13.2414C13.2032 13.8008 12.8757 14.5477 12.8757 15.3752C12.8757 16.1702 13.1813 16.8872 13.6707 17.439L15.4514 15.6583C15.4064 15.5721 15.3745 15.479 15.3745 15.3752C15.3745 15.0296 15.6552 14.7502 15.9995 14.7502C16.1038 14.7502 16.1976 14.7815 16.2832 14.8265L22.6046 8.50505C20.8421 6.95065 18.5345 6 16.0002 6C10.4776 6 6 10.477 6 16.0002C6 18.5347 6.95064 20.8422 8.50503 22.6048L12.7776 18.3322ZM15.9997 18.4999C17.7254 18.4999 19.1242 17.1005 19.1242 15.3749C19.1242 14.9018 19.0072 14.4612 18.8166 14.0605L14.6797 18.1981C15.0822 18.3862 15.5259 18.4999 15.9997 18.4999ZM19.2024 13.6748L23.4887 9.38845C25.0468 11.1516 26 13.4623 26 15.9998C26 21.5231 21.5225 26.0001 15.9998 26.0001C13.4623 26.0001 11.1517 25.0469 9.38853 23.4894L14.0305 18.8468C14.6586 19.0299 15.3068 19.1249 15.9942 19.1249C18.1955 19.1249 19.9981 18.2368 21.9387 15.9998C21.0149 14.9348 20.1218 14.1773 19.2024 13.6748Z"
        fill="currentColor"
      />
    ),
  },
  'amount-show': {
    source: 'custom',
    label: 'Show amounts',
    category: 'Accounts',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['AmountVisibilityButton'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99181 12.8646C7.97457 12.8646 6.30395 12.0872 4.55541 10C5.66973 8.66972 6.75311 7.87566 7.91384 7.47118C7.43317 7.98394 7.13296 8.66857 7.13296 9.42711C7.13296 11.0089 8.41514 12.2917 9.99639 12.2917C11.5782 12.2917 12.8604 11.0089 12.8604 9.42711C12.8604 8.67659 12.5659 7.99998 12.0938 7.48894C13.2414 7.90373 14.3162 8.70352 15.4408 10C13.6619 12.0505 12.0091 12.8646 9.99181 12.8646ZM9.99634 8.85421C10.313 8.85421 10.5689 9.11074 10.5689 9.42682C10.5689 9.74289 10.313 9.99942 9.99634 9.99942C9.68083 9.99942 9.42373 9.74289 9.42373 9.42682C9.42373 9.11074 9.68083 8.85421 9.99634 8.85421ZM9.99723 0.833374C4.93494 0.833374 0.830566 4.93775 0.830566 10C0.830566 15.0629 4.93494 19.1667 9.99723 19.1667C15.0595 19.1667 19.1639 15.0629 19.1639 10C19.1639 4.93775 15.0595 0.833374 9.99723 0.833374Z"
        fill="currentColor"
      />
    ),
  },
  'radio-unselected': {
    source: 'custom',
    label: 'Radio unselected',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['RadioButton'],
    render: () => <circle cx="10" cy="10" r="9.5" fill="var(--uc-surface)" stroke="currentColor" strokeWidth="1" />,
  },
  'radio-selected': {
    source: 'custom',
    label: 'Radio selected',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['RadioButton'],
    render: () => (
      <>
        <circle cx="10" cy="10" r="9.5" fill="var(--uc-surface)" stroke="currentColor" strokeWidth="1" />
        <circle cx="10" cy="10" r="4.5" fill="var(--uc-action)" />
      </>
    ),
  },
  'chevron-link': {
    source: 'custom',
    label: 'Chevron link',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: [
      'AccountDetailsInfoScreen',
      'AccountOptionsScreen',
      'ContactsNavigationCard',
      'NavigationLink',
      'NewPaymentActionListItem',
      'PrimeIconLabelValue',
      'ProductAccordion',
      'KidsMarketHomeApp',
      'TemplateCodePreviews',
    ],
    render: () => (
      <path
        id="Icon"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.6759 9C12.7747 9.93494 12.7747 11.4522 13.6759 12.388L16.9391 16L13.6759 19.612C12.7747 20.5478 12.7747 22.0642 13.6759 23L20 16L13.6759 9Z"
        fill="currentColor"
      />
    ),
  },
  'chevron-left': {
    source: 'custom',
    label: 'Chevron left',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '12 9 7.25 14',
    usage: ['Icon inventory'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.6759 9C12.7747 9.93494 12.7747 11.4522 13.6759 12.388L16.9391 16L13.6759 19.612C12.7747 20.5478 12.7747 22.0642 13.6759 23L20 16L13.6759 9Z"
        fill="currentColor"
        transform="translate(32 0) scale(-1 1)"
      />
    ),
  },
  'chevron-right': {
    source: 'custom',
    label: 'Chevron right',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '12.75 9 7.25 14',
    usage: ['App2027ProductsShelf'],
    notes:
      'Same wide chevron weight as chevron-down-wide and chevron-left, pointing right. Use it for see-all heading rows; chevron-link is the thin 32x32 list-row glyph.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.6759 9C12.7747 9.93494 12.7747 11.4522 13.6759 12.388L16.9391 16L13.6759 19.612C12.7747 20.5478 12.7747 22.0642 13.6759 23L20 16L13.6759 9Z"
        fill="currentColor"
      />
    ),
  },
  'chevron-down': {
    source: 'custom',
    label: 'Chevron down',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '10 12 12 8',
    usage: ['ProductAccordion'],
    render: () => (
      <path
        d="M12.1207 13.2901L16.0007 17.1701L19.8807 13.2901C20.2707 12.9001 20.9007 12.9001 21.2907 13.2901C21.6807 13.6801 21.6807 14.3101 21.2907 14.7001L16.7007 19.2901C16.3107 19.6801 15.6807 19.6801 15.2907 19.2901L10.7007 14.7001C10.3107 14.3101 10.3107 13.6801 10.7007 13.2901C11.0907 12.9101 11.7307 12.9001 12.1207 13.2901Z"
        fill="currentColor"
      />
    ),
  },
  'chevron-down-wide': {
    source: 'custom',
    label: 'Chevron down wide',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '9 12 14 8',
    usage: ['AccordionSection'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 12.6759C22.0651 11.7747 20.5478 11.7747 19.612 12.6759L16 15.9391L12.388 12.6759C11.4522 11.7747 9.93578 11.7747 9 12.6759L16 19L23 12.6759Z"
        fill="currentColor"
      />
    ),
  },
  'chevron-up': {
    source: 'custom',
    label: 'Chevron up',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '9 12 14 8',
    usage: ['Icon inventory'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 12.6759C22.0651 11.7747 20.5478 11.7747 19.612 12.6759L16 15.9391L12.388 12.6759C11.4522 11.7747 9.93578 11.7747 9 12.6759L16 19L23 12.6759Z"
        fill="currentColor"
        transform="rotate(180 16 16)"
      />
    ),
  },
  'back-heavy': {
    source: 'custom',
    label: 'Back heavy',
    category: 'Navigation',
    width: 20,
    height: 20,
    viewBox: '6 1 12.5 22.1',
    usage: ['PageHeader', 'DomesticPaymentFlowScreens', 'PrimeScreen'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.8452 1.01411C18.3901 2.48329 18.3901 4.86754 16.8452 6.33811L11.2511 12.0141L16.8452 17.6901C18.3901 19.1607 18.3901 21.5435 16.8452 23.0141L6.00391 12.0141L16.8452 1.01411Z"
        fill="currentColor"
      />
    ),
  },
  'back-line': {
    source: 'custom',
    label: 'Back line',
    category: 'Navigation',
    width: 20,
    height: 20,
    viewBox: '10 6 8 20',
    usage: ['BackButton'],
    render: () => (
      <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  'info-circle': {
    source: 'custom',
    label: 'Info circle',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['NewPaymentDiscoverBanner', 'DesignSystemPage', 'InfoBanner'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0001 7.20062C9.15635 7.20062 8.4726 6.51687 8.4726 5.67312C8.4726 4.83 9.15635 4.14562 10.0001 4.14562C10.8438 4.14562 11.5276 4.83 11.5276 5.67312C11.5276 6.51687 10.8438 7.20062 10.0001 7.20062ZM11.2587 13.4269C11.2587 14.7 10.8425 15.855 8.75874 15.855V9.07563H11.2587V13.4269ZM10 1.875C5.5125 1.875 1.875 5.51312 1.875 10C1.875 14.4875 5.5125 18.125 10 18.125C14.4875 18.125 18.125 14.4875 18.125 10C18.125 5.51312 14.4875 1.875 10 1.875Z"
        fill="currentColor"
      />
    ),
  },
  'close-x': {
    source: 'custom',
    label: 'Close',
    category: 'System',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: [
      'BottomSheet',
      'DemoFeatureSidePanel',
      'HelperCard',
      'NewPaymentDiscoverBanner',
      'KidsMarketHomeApp',
      'TemplateCodePreviews',
    ],
    notes: 'Custom close icon replacing the old lucide X wrapper.',
    render: () => (
      <path
        id="Icon"
        d="M22.3 9.70997V9.70997C21.91 9.31997 21.28 9.31997 20.89 9.70997L16 14.59L11.11 9.69997C10.72 9.30997 10.09 9.30997 9.69997 9.69997V9.69997C9.30997 10.09 9.30997 10.72 9.69997 11.11L14.59 16L9.69997 20.89C9.30997 21.28 9.30997 21.91 9.69997 22.3V22.3C10.09 22.69 10.72 22.69 11.11 22.3L16 17.41L20.89 22.3C21.28 22.69 21.91 22.69 22.3 22.3V22.3C22.69 21.91 22.69 21.28 22.3 20.89L17.41 16L22.3 11.11C22.68 10.73 22.68 10.09 22.3 9.70997Z"
        fill="currentColor"
      />
    ),
  },
  'close-flow': {
    source: 'custom',
    label: 'Close flow',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['CzFutureRoboAdvisorFlow', 'RsPropertyInsurancePreviews'],
    notes:
      'The header X that leaves a multi-step flow. Sharp 20x20 glyph, distinct from close-x, which dismisses a sheet or a panel.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1431 0L10 8.14313L1.85625 0L0 1.85687L8.14313 10L0 18.1431L1.85625 20L10 11.8569L18.1431 20L20 18.1431L11.8569 10L20 1.85687L18.1431 0Z"
        fill="currentColor"
      />
    ),
  },
  plus: {
    source: 'custom',
    label: 'Add',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['App2027GroupAddButton'],
    notes:
      'Bare plus, no disc. The filled add-circle glyph inside a roundel reads as two stacked circles; a group header wants the lighter mark.',
    render: () => (
      <path fillRule="evenodd" clipRule="evenodd" d="M9 3H11V9H17V11H11V17H9V11H3V9H9V3Z" fill="currentColor" />
    ),
  },
  refresh: {
    source: 'custom',
    label: 'Refresh',
    category: 'System',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['SideBySideTool reload frames'],
    notes: 'Circular two-arrow refresh glyph for general reload/reset actions. Color via AppIcon color prop.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.3064 6.58828C5.5363 4.72748 7.6202 3.5 10 3.5C12.5412 3.5 14.7518 4.90369 15.9317 7H13.5C13.0858 7 12.75 7.33579 12.75 7.75C12.75 8.16421 13.0858 8.5 13.5 8.5H17.25C17.6642 8.5 18 8.16421 18 7.75V4C18 3.58579 17.6642 3.25 17.25 3.25C16.8358 3.25 16.5 3.58579 16.5 4V5.79937C15.029 3.90369 12.6594 2.75 10 2.75C6.89546 2.75 4.16929 4.44847 2.7081 6.97663C2.5246 7.29361 2.73363 7.6882 3.09961 7.75353C3.39152 7.80568 3.67842 7.65736 3.83005 7.40197C3.97976 7.14954 4.13818 6.90349 4.3064 6.58828ZM3.09961 12.2465C2.73363 12.3118 2.5246 12.7064 2.7081 13.0234C4.16929 15.5515 6.89546 17.25 10 17.25C12.6594 17.25 15.029 16.0963 16.5 14.2006V16C16.5 16.4142 16.8358 16.75 17.25 16.75C17.6642 16.75 18 16.4142 18 16V12.25C18 11.8358 17.6642 11.5 17.25 11.5H13.5C13.0858 11.5 12.75 11.8358 12.75 12.25C12.75 12.6642 13.0858 13 13.5 13H15.9317C14.7518 15.0963 12.5412 16.5 10 16.5C7.6202 16.5 5.5363 15.2725 4.3064 13.4117C4.13818 13.0965 3.97976 12.8505 3.83005 12.598C3.67842 12.3426 3.39152 12.1943 3.09961 12.2465Z"
        fill="currentColor"
      />
    ),
  },
  'copy-documents': {
    source: 'custom',
    label: 'Copy documents',
    category: 'Accounts',
    width: 20,
    height: 20,
    viewBox: '7 6 18 20',
    usage: ['AccountBalanceCard', 'AccountDetailsInfoScreen', 'CardDetailsInfoScreen'],
    notes: 'Deduplicated exact account copy icon.',
    render: () => (
      <path
        d="M22 10.375C23.3806 10.375 24.5 11.4944 24.5 12.875V26H14.5C13.1194 26 12 24.8806 12 23.5V10.375H22ZM17 6C18.3806 6 19.5 7.11937 19.5 8.5V9.125H10.75V21.625H9.5C8.11937 21.625 7 20.5056 7 19.125V6H17Z"
        fill="currentColor"
      />
    ),
  },
} satisfies Record<string, CustomIconDefinition>
