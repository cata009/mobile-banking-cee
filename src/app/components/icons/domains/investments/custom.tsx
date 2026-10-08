import type { CustomIconDefinition } from '../../iconTypes'

export const INVESTMENTS_CUSTOM_ICONS = {
  'robo-nav-portfolio': {
    source: 'custom',
    label: 'CZ Robo Portfolio navigation',
    category: 'Navigation',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    usage: ['CZ Robo bottom navigation'],
    notes: 'Exact 24x24 Portfolio icon supplied for CZ Robo navigation.',
    render: () => (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.1758 3.83873C18.4925 3.83873 19.5602 4.94015 19.5602 6.2992V19.4517H3.38513C2.0677 19.4517 1 18.3503 1 16.9913V1H6.27452L7.87952 3.83873H17.1758ZM13.3831 16.613C14.5224 16.613 15.447 15.6592 15.447 14.484V8.09682C14.3077 8.09682 13.3831 9.04992 13.3831 10.2259V16.613ZM9.25542 16.613C10.3954 16.613 11.3193 15.6592 11.3193 14.484V9.51618C10.1793 9.51618 9.25542 10.4693 9.25542 11.6452V16.613ZM5.12771 16.613C6.26764 16.613 7.19156 15.6592 7.19156 14.484V11.6452C6.05163 11.6452 5.12771 12.5983 5.12771 13.7743V16.613Z"
          fill="currentColor"
        />
        <path
          d="M20.9506 20.871V7.42177C22.1077 7.59138 23 8.60694 23 9.84746V23H6.82489C5.61753 23 4.63032 22.0717 4.47209 20.871H20.9506Z"
          fill="currentColor"
        />
      </>
    ),
  },
  'robo-nav-invest': {
    source: 'custom',
    label: 'CZ Robo Invest navigation',
    category: 'Navigation',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    usage: ['CZ Robo bottom navigation'],
    notes: 'Exact 24x24 Invest icon supplied for CZ Robo navigation.',
    render: () => (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1 4.06896C1 2.9262 1.92333 2 3.06255 2H16.1253V10.9655C16.1253 12.1082 15.202 13.0344 14.0628 13.0344H1V4.06896ZM11.5437 7.59998L12.74 8.79998C13.2508 9.31239 14.0793 9.31239 14.5901 8.79998L10.8892 5.08689L7.18764 8.79998C7.69846 9.31239 8.52691 9.31239 9.03843 8.79998L10.2347 7.59998V11.5593H11.5437V7.59998Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.0623 14.4138C15.9578 14.4138 17.4999 12.8662 17.4999 10.9656H23V19.931C23 21.0738 22.0774 22 20.9375 22H7.87467V14.4138H14.0623ZM14.327 16.7786L18.0293 20.4917L21.7308 16.7786C21.22 16.2662 20.3909 16.2662 19.8794 16.7786L18.6831 17.9786V14.0186L17.3748 14.0193V17.9786L16.1785 16.7786C15.667 16.2662 14.8385 16.2662 14.327 16.7786Z"
          fill="currentColor"
        />
      </>
    ),
  },
  'robo-nav-explore': {
    source: 'custom',
    label: 'CZ Robo Explore navigation',
    category: 'Navigation',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    usage: ['CZ Robo bottom navigation'],
    notes: 'Exact 24x24 Explore icon supplied for CZ Robo navigation.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.875 13.0345H16.8125C16.0535 13.0345 15.4375 12.4166 15.4375 11.6552V9.58621H17.5C18.259 9.58621 18.875 10.2041 18.875 10.9655V13.0345ZM18.875 17.8621H16.8125C16.0535 17.8621 15.4375 17.2441 15.4375 16.4828V14.4138H17.5C18.259 14.4138 18.875 15.0317 18.875 15.7931V17.8621ZM14.0625 13.0345H12C11.241 13.0345 10.625 12.4166 10.625 11.6552V9.58621H12.6875C13.4465 9.58621 14.0625 10.2041 14.0625 10.9655V13.0345ZM14.0625 17.8621H12C11.241 17.8621 10.625 17.2441 10.625 16.4828V14.4138H12.6875C13.4465 14.4138 14.0625 15.0317 14.0625 15.7931V17.8621ZM9.25 13.0345H7.1875C6.4285 13.0345 5.8125 12.4166 5.8125 11.6552V9.58621H7.875C8.634 9.58621 9.25 10.2041 9.25 10.9655V13.0345ZM9.25 17.8621H7.1875C6.4285 17.8621 5.8125 17.2441 5.8125 16.4828V14.4138H7.875C8.634 14.4138 9.25 15.0317 9.25 15.7931V17.8621ZM20.25 5.44828H10.625L7.875 2H1V19.2414C1 20.7648 2.23131 22 3.75 22H23V8.2069C23 6.68345 21.7687 5.44828 20.25 5.44828Z"
        fill="currentColor"
      />
    ),
  },
  'investment-trend-up': {
    source: 'custom',
    label: 'Investment trend up',
    category: 'Accounts',
    width: 23,
    height: 17,
    viewBox: '0 0 23 17',
    usage: ['CompactProductCard portfolio performance'],
    notes:
      'Figma arrow for a portfolio in profit. Non-square: rendered at its natural size, colour passed by the caller (--uc-green-olive).',
    render: () => (
      <>
        <path
          d="M2.94378 13.0448C2.14061 14.4004 2.54802 15.5443 3.89082 16.5266C5.33147 14.362 6.79053 12.2135 8.19231 10.0264C8.614 9.36668 8.96098 9.26901 9.62605 9.71028C10.9072 10.559 12.2452 11.3221 13.6374 12.1646C14.1811 11.2422 14.6153 10.5064 15.02 9.81836C12.559 8.39409 10.1952 7.02591 7.71977 5.59144C6.14568 8.02885 4.45976 10.4868 2.94319 13.0426L2.94378 13.0448Z"
          fill="currentColor"
        />
        <path
          d="M8.93725 2.78164C9.60295 4.40772 10.8011 5.06047 12.3709 4.69148C13.256 4.48247 14.1282 4.2253 15.0062 3.99003C15.068 4.09785 15.1313 4.20289 15.1931 4.31071C14.0051 6.42878 12.8144 8.54524 11.6227 10.6667C12.4299 11.1919 13.1432 11.6554 13.9443 12.1752C15.2477 9.92764 16.4748 7.81552 17.8494 5.44799C18.7494 7.83489 18.609 10.7353 22.1454 10.5503L19.3185 -7.06982e-06L8.93506 2.78223L8.93725 2.78164Z"
          fill="currentColor"
        />
      </>
    ),
  },
  'investment-trend-down': {
    source: 'custom',
    label: 'Investment trend down',
    category: 'Accounts',
    width: 17,
    height: 23,
    viewBox: '0 0 17 23',
    usage: ['CompactProductCard portfolio performance'],
    notes: 'The loss counterpart of investment-trend-up, drawn falling rather than mirrored.',
    render: () => (
      <>
        <path
          d="M3.69417 2.94378C2.33857 2.14061 1.19471 2.54802 0.212314 3.89082C2.37698 5.33147 4.52546 6.79053 6.71256 8.19231C7.37228 8.614 7.46995 8.96098 7.02867 9.62605C6.17994 10.9072 5.41684 12.2452 4.57438 13.6374C5.49677 14.1811 6.23257 14.6153 6.9206 15.02C8.34487 12.559 9.71305 10.1952 11.1475 7.71977C8.71011 6.14568 6.25211 4.45976 3.69636 2.94319L3.69417 2.94378Z"
          fill="currentColor"
        />
        <path
          d="M13.9568 8.93725C12.3308 9.60295 11.678 10.8011 12.047 12.3709C12.256 13.256 12.5132 14.1282 12.7484 15.0062C12.6406 15.068 12.5356 15.1313 12.4278 15.1931C10.3097 14.0051 8.19323 12.8144 6.0718 11.6227C5.54661 12.4299 5.08305 13.1432 4.56326 13.9443C6.81083 15.2477 8.92295 16.4748 11.2905 17.8494C8.90358 18.7494 6.00322 18.609 6.1882 22.1454L16.7385 19.3185L13.9562 8.93506L13.9568 8.93725Z"
          fill="currentColor"
        />
      </>
    ),
  },
  'trade-buy': {
    source: 'custom',
    label: 'Trade buy / positive',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['InvestmentHistoryScreen trade direction'],
    notes: 'Arrow-up glyph for investment buys/positive movements. Color passed via AppIcon color prop (#3D7D43).',
    render: () => (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.2836 9.7076C15.9136 9.07763 16.9907 9.5238 16.9907 10.4147L16.9907 23.0005C16.9907 23.5528 16.543 24.0005 15.9907 24.0005C15.4384 24.0005 14.9907 23.5528 14.9907 23.0005L14.9907 10.4147C14.9907 10.1495 15.0961 9.89513 15.2836 9.7076Z"
          fill="currentColor"
        />
        <path
          d="M15.072 8.38948C15.5413 7.91119 16.2896 7.87254 16.8039 8.27836L16.9283 8.3901L23.7049 15.305C24.0915 15.6995 24.0851 16.3326 23.6906 16.7192C23.3265 17.076 22.759 17.098 22.3698 16.789L22.2765 16.7049L15.999 10.2995L9.71375 16.7054C9.35669 17.0692 8.78974 17.1023 8.39459 16.801L8.2996 16.7187C7.93573 16.3616 7.90265 15.7947 8.20395 15.3995L8.28625 15.3046L15.072 8.38948Z"
          fill="currentColor"
        />
      </>
    ),
  },
  'trade-sell': {
    source: 'custom',
    label: 'Trade sell',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['InvestmentHistoryScreen trade direction'],
    notes: 'Arrow-down glyph for investment sells. Color passed via AppIcon color prop (#CF3524).',
    render: () => (
      <>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.9907 22C16.543 22 16.9907 21.5523 16.9907 21L16.9907 9C16.9907 8.44772 16.543 8 15.9907 8C15.4384 8 14.9907 8.44772 14.9907 9L14.9907 21C14.9907 21.5523 15.4384 22 15.9907 22Z"
          fill="currentColor"
        />
        <path
          d="M15.072 23.611C15.5413 24.0893 16.2896 24.128 16.8039 23.7221L16.9283 23.6104L23.7049 16.6955C24.0915 16.301 24.0851 15.6679 23.6906 15.2813C23.3265 14.9245 22.759 14.9025 22.3698 15.2115L22.2765 15.2956L15.999 21.701L9.71375 15.2951C9.35669 14.9313 8.78974 14.8982 8.39459 15.1995L8.2996 15.2818C7.93573 15.6389 7.90265 16.2058 8.20395 16.6009L8.28625 16.6959L15.072 23.611Z"
          fill="currentColor"
        />
      </>
    ),
  },
  'robo-withdraw': {
    source: 'custom',
    label: 'Robo goal withdraw',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['CzFutureRoboAdvisorFlow'],
    notes: 'Exact 20x20 Withdraw glyph supplied for existing Robo goal detail.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.1424 12.2233C17.9595 11.15 16.0395 11.15 14.8567 12.2233L12.0864 14.7378L12.0864 0.00111154L9.05665 5.6575e-07L9.05666 14.7378L6.28523 12.2233C5.10237 11.15 3.18466 11.15 1.99951 12.2233L10.5709 20L19.1424 12.2233Z"
        fill="currentColor"
      />
    ),
  },
  'robo-goal-settings': {
    source: 'custom',
    label: 'Robo goal settings',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['CzFutureRoboAdvisorFlow'],
    notes: 'Exact 32x32 Goal settings glyph supplied for existing Robo goal detail.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.0212 18.5281C15.6247 19.0923 14.0369 18.4188 13.4712 17.0222C12.9071 15.6255 13.5821 14.036 14.9786 13.4719C16.3752 12.9077 17.963 13.5828 18.527 14.9794C19.0911 16.3761 18.4162 17.964 17.0212 18.5281ZM24.9875 21.1543L25.9807 18.7805L23.7196 16.8052V15.2527L26 13.2887L25.0229 10.9084L22.0161 11.1109L20.9297 10.0228L21.1531 7.01093L18.7794 6.01929L16.7947 8.29187H15.2616L13.2881 6L10.908 6.97718L11.1105 9.98264L10.0241 11.0707L7.01085 10.8457L6.01768 13.2195L8.28043 15.1948V16.749L6 18.7113L6.9771 21.0932L9.95982 20.8907L11.0687 21.9997L10.8453 24.9891L13.2206 25.9823L15.1828 23.7322H16.7577L18.7119 26L21.0904 25.0244L20.8895 22.0399L21.9984 20.9325L24.9875 21.1543Z"
        fill="currentColor"
      />
    ),
  },
  'investment-history': {
    source: 'custom',
    label: 'Investment history',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['InvestmentActionBar'],
    notes: 'Investment History glyph from supplied SVG.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.0693 16.6101C17.574 16.1443 17.574 15.3899 18.0693 14.9249L19.2293 13.835L11.402 13.8356V12.6437H19.2293L18.0693 11.5545C17.574 11.0887 17.574 10.3344 18.0693 9.86929L21.6587 13.2397L18.0693 16.6101ZM14.3567 22.4368C14.852 22.9019 14.852 23.6562 14.3567 24.122L10.7673 20.751L14.3567 17.3806C14.852 17.847 14.852 18.6013 14.3567 19.0664L13.196 20.1557H21.024L21.0247 21.3469H13.196L14.3567 22.4368ZM22.662 7.29581L21.3333 6.0482L20.0053 7.29581L18.6773 6.0482L17.3487 7.29581L16.0207 6.0482L14.6927 7.29581L13.364 6.0482L12.036 7.29581L10.708 6.0482L9.37933 7.29581L8 6V26H24V6.03944L22.662 7.29581Z"
        fill="currentColor"
      />
    ),
  },
  'investment-to-approve': {
    source: 'custom',
    label: 'Investment to approve',
    category: 'Actions',
    width: 21,
    height: 20,
    viewBox: '0 0 21 20',
    usage: ['InvestmentActionBar'],
    notes: 'Investment To approve glyph from supplied SVG.',
    render: () => (
      <path
        d="M20.6895 8.27539V17.6729C20.6892 18.9581 19.6372 19.9998 18.3389 20H4.82715V13.0215C5.16646 13.0698 5.51057 13.1035 5.8623 13.1035C9.01387 13.1033 11.6843 11.0856 12.6787 8.27539H20.6895ZM7.91113 16.416C8.38281 16.8867 9.1465 16.8867 9.61816 16.416L10.7217 15.3115V18.5879H11.9287V15.3115L13.0322 16.416C13.504 16.887 14.2685 16.887 14.7402 16.416L11.3252 13.001L7.91113 16.416ZM14.9277 10.0605V13.3369L13.8232 12.2334C13.3522 11.7624 12.5873 11.7624 12.1162 12.2334L15.5312 15.6484L18.9453 12.2334C18.4743 11.7624 17.7093 11.7624 17.2383 12.2334L16.1348 13.3369V10.0605H14.9277ZM5.8623 0C7.7809 4.42561e-05 9.47889 0.925778 10.5479 2.35059L6.09082 6.80664L4.32227 5.03711C3.73543 4.451 2.78516 4.45114 2.19824 5.03711L6.09082 8.93066L11.3115 3.70996C11.575 4.37686 11.7246 5.10161 11.7246 5.8623C11.7245 9.09945 9.09948 11.7245 5.8623 11.7246C2.62507 11.7246 9.4653e-05 9.0995 0 5.8623C0 2.62434 2.62501 0 5.8623 0Z"
        fill="currentColor"
      />
    ),
  },
  'investment-download-report': {
    source: 'custom',
    label: 'Investment download report',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    usage: ['InvestmentActionBar'],
    notes: 'Investment Download Report glyph from supplied SVG.',
    render: () => (
      <path
        d="M2.5 18.125C2.5 19.1606 3.33938 20 4.375 20H2.5C1.46438 20 0.625 19.1606 0.625 18.125V0H2.5V18.125ZM17.5 0C18.5356 0 19.375 0.839375 19.375 1.875V20H6.25C5.21438 20 4.375 19.1606 4.375 18.125V0H17.5ZM9.6875 10C8.47937 10 7.5 10.9794 7.5 12.1875V14.375C8.70813 14.375 9.6875 13.3956 9.6875 12.1875V10ZM12.9688 7.26562C11.7606 7.26562 10.7812 8.245 10.7812 9.45312V14.375C11.9894 14.375 12.9688 13.3956 12.9688 12.1875V7.26562ZM16.25 5.625C15.0419 5.625 14.0625 6.60437 14.0625 7.8125V14.375C15.2706 14.375 16.25 13.3956 16.25 12.1875V5.625Z"
        fill="currentColor"
      />
    ),
  },
  'invest-action': {
    source: 'custom',
    label: 'Invest action',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['InvestmentActionBar'],
    notes: 'Investments CTA glyph from supplied Figma JSON: growth line, arrow head, and three vertical bars.',
    render: () => (
      <>
        <path
          d="M5 20C8.2 16.8 11.2 15.35 14 15.35C16.72 15.35 18.78 12.44 21.05 8.55"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M22.2 3.4L30.7 4.7L24.2 11.9L22.2 3.4Z" fill="currentColor" />
        <path d="M9 21H11V28H9V21Z" fill="currentColor" />
        <path d="M15 18H17V28H15V18Z" fill="currentColor" />
        <path d="M21 16H23V28H21V16Z" fill="currentColor" />
      </>
    ),
  },
  'recurring-contribution': {
    source: 'custom',
    label: 'Recurring contribution',
    category: 'System',
    width: 18,
    height: 18,
    viewBox: '0 0 18 18',
    usage: ['InvestmentProductCard recurring contribution'],
    notes:
      'Calendar-with-refresh glyph marking recurring investment contributions. Color passed via AppIcon color prop (#262626).',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.375 3.9375V2.8125H11.25V3.9375H6.75V2.8125H5.625V3.9375H5.0625C4.44118 3.9375 3.9375 4.44118 3.9375 5.0625V12.9375C3.9375 13.5588 4.44118 14.0625 5.0625 14.0625H10.125C9.765 13.7531 9.48375 13.3706 9.28125 12.9375H5.0625V7.3125H12.9375V8.20687C13.3369 8.26875 13.7194 8.40375 14.0625 8.61188V5.0625C14.0625 4.44118 13.5588 3.9375 12.9375 3.9375H12.375ZM12.375 9.28125V8.4375L11.1094 9.70312L12.375 10.9688V10.125C13.4156 10.125 14.0962 11.2275 13.635 12.1613L14.2481 12.7744C15.2381 11.2781 14.1694 9.28125 12.375 9.28125ZM12.375 13.7812V14.625L13.6406 13.3594L12.375 12.0938V12.9375C11.3344 12.9375 10.6537 11.835 11.115 10.9012L10.5019 10.2881C9.51188 11.7844 10.5806 13.7812 12.375 13.7812ZM5.0625 6.1875H12.9375V5.0625H5.0625V6.1875Z"
        fill="currentColor"
      />
    ),
  },
  'investment-more-details': {
    source: 'custom',
    label: 'Investment more details',
    category: 'Actions',
    width: 20,
    height: 20,
    viewBox: '7 5 18 22',
    usage: ['InvestmentsHistoryScreen', 'DesignSystemPage Icons inventory'],
    notes: 'Investment order details glyph (document with info circle).',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.5944 6H8V22.875C8 24.6009 9.39911 26 11.125 26H23.625V10.0312L19.5944 6ZM16.0001 16.2773C15.4808 16.2773 15.0601 15.8565 15.0601 15.3373C15.0601 14.8185 15.4808 14.3973 16.0001 14.3973C16.5193 14.3973 16.9401 14.8185 16.9401 15.3373C16.9401 15.8565 16.5193 16.2773 16.0001 16.2773ZM16.7746 20.1088C16.7746 20.8923 16.5185 21.6031 15.2362 21.6031V17.4312H16.7746V20.1088ZM16 13C13.2385 13 11 15.2388 11 18C11 20.7615 13.2385 23 16 23C18.7615 23 21 20.7615 21 18C21 15.2388 18.7615 13 16 13ZM18.625 7.25V11H22.375L18.625 7.25Z"
        fill="currentColor"
      />
    ),
  },
  'investment-ex-ante': {
    source: 'custom',
    label: 'Investment ex-ante cost',
    category: 'Actions',
    width: 15,
    height: 20,
    viewBox: '0 0 15 20',
    usage: ['InvestmentsHistoryScreen', 'DesignSystemPage Icons inventory'],
    notes: 'Investment ex-ante cost glyph (keypad/grid). Non-square glyph kept at native 15x20.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 5.625H12.5V3.125H2.5V5.625ZM11.25 10C10.5594 10 10 9.44063 10 8.75C10 8.06 10.5594 7.5 11.25 7.5C11.94 7.5 12.5 8.06 12.5 8.75C12.5 9.44063 11.94 10 11.25 10ZM11.25 13.75C10.5594 13.75 10 13.1906 10 12.5C10 11.81 10.5594 11.25 11.25 11.25C11.94 11.25 12.5 11.81 12.5 12.5C12.5 13.1906 11.94 13.75 11.25 13.75ZM11.25 17.5C10.5594 17.5 10 16.9406 10 16.25C10 15.56 10.5594 15 11.25 15C11.94 15 12.5 15.56 12.5 16.25C12.5 16.9406 11.94 17.5 11.25 17.5ZM7.5 10C6.80937 10 6.25 9.44063 6.25 8.75C6.25 8.06 6.80937 7.5 7.5 7.5C8.19063 7.5 8.75 8.06 8.75 8.75C8.75 9.44063 8.19063 10 7.5 10ZM7.5 13.75C6.80937 13.75 6.25 13.1906 6.25 12.5C6.25 11.81 6.80937 11.25 7.5 11.25C8.19063 11.25 8.75 11.81 8.75 12.5C8.75 13.1906 8.19063 13.75 7.5 13.75ZM7.5 17.5C6.80937 17.5 6.25 16.9406 6.25 16.25C6.25 15.56 6.80937 15 7.5 15C8.19063 15 8.75 15.56 8.75 16.25C8.75 16.9406 8.19063 17.5 7.5 17.5ZM3.75 10C3.05938 10 2.5 9.44063 2.5 8.75C2.5 8.06 3.05938 7.5 3.75 7.5C4.44063 7.5 5 8.06 5 8.75C5 9.44063 4.44063 10 3.75 10ZM3.75 13.75C3.05938 13.75 2.5 13.1906 2.5 12.5C2.5 11.81 3.05938 11.25 3.75 11.25C4.44063 11.25 5 11.81 5 12.5C5 13.1906 4.44063 13.75 3.75 13.75ZM3.75 17.5C3.05938 17.5 2.5 16.9406 2.5 16.25C2.5 15.56 3.05938 15 3.75 15C4.44063 15 5 15.56 5 16.25C5 16.9406 4.44063 17.5 3.75 17.5ZM2.5 0C1.11937 0 0 1.11937 0 2.5V20H12.5C13.8806 20 15 18.8806 15 17.5V0H2.5Z"
        fill="currentColor"
      />
    ),
  },
  'investment-documents': {
    source: 'custom',
    label: 'Investment documents',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['InvestmentBuyOrderFlow'],
    notes: 'Product documents glyph (stacked document with lines) for the Documents and terms accordion.',
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8065 15.25C11.8065 15.94 12.3839 16.5 13.0968 16.5H23.4194C23.4194 15.8094 22.8413 15.25 22.129 15.25H11.8065ZM11.8065 18.375C11.8065 19.065 12.3839 19.625 13.0968 19.625H23.4194C23.4194 18.9344 22.8413 18.375 22.129 18.375H11.8065ZM11.8065 21.5C11.8065 22.19 12.3839 22.75 13.0968 22.75H23.4194C23.4194 22.0594 22.8413 21.5 22.129 21.5H11.8065ZM16.3226 13.375H11.8065V9H16.3226V13.375ZM9.87097 6.5H23.4194C24.4884 6.5 25.3548 7.33937 25.3548 8.375V26.5H11.8065C10.7374 26.5 9.87097 25.6606 9.87097 24.625V6.5ZM7.93548 8.375V24.625C7.93548 25.6606 8.80194 26.5 9.87097 26.5H7.93548C6.86645 26.5 6 25.6606 6 24.625V8.375H7.93548Z"
        fill="currentColor"
      />
    ),
  },
  'investment-important-info': {
    source: 'custom',
    label: 'Investment important information',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['InvestmentBuyOrderFlow'],
    notes: "Bell glyph for the 'Important information' row in the Documents and terms accordion.",
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.7688 8.01122V6H15.2305V8.01117C13.2572 8.44299 11.6853 9.86021 11.122 11.6836H11.1195L9 22.2498H24L21.8799 11.6836H21.8767C21.314 9.86028 19.7423 8.4431 17.7688 8.01122ZM13.9614 23.5C13.9861 24.8844 15.1106 26 16.4997 26C17.8881 26 19.0133 24.8844 19.0379 23.5H13.9614Z"
        fill="currentColor"
      />
    ),
  },
  'investment-disclaimer': {
    source: 'custom',
    label: 'Investment disclaimer',
    category: 'Actions',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['InvestmentBuyOrderFlow'],
    notes: "Exclamation-in-circle glyph for the 'Investment disclaimer' row in the Documents and terms accordion.",
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.7082 18.8106H15.2919L14.5844 11.7319C14.5844 10.1681 15.8519 8.90062 17.4163 8.90062L16.7082 18.8106ZM16.0001 23.4119C15.2182 23.4119 14.5844 22.7775 14.5844 21.9962C14.5844 21.2144 15.2182 20.5806 16.0001 20.5806C16.7819 20.5806 17.4163 21.2144 17.4163 21.9962C17.4163 22.7775 16.7819 23.4119 16.0001 23.4119ZM16 6C10.4769 6 6 10.4769 6 16C6 21.5225 10.4769 26 16 26C21.5231 26 26 21.5225 26 16C26 10.4769 21.5231 6 16 6Z"
        fill="currentColor"
      />
    ),
  },
  'robo-goal-wealth': {
    source: 'custom',
    label: 'Build wealth goal',
    category: 'Actions',
    width: 24,
    height: 24,
    viewBox: '0 0 23.25 19.5',
    usage: ['CzFutureRoboAdvisorFlow goal selection'],
    render: () => (
      <path
        d="M0 0C1.65675 0 3 1.34325 3 3V16.5H20.25C21.9068 16.5 23.25 17.8432 23.25 19.5H3C1.34325 19.5 0 18.1568 0 16.5V0ZM14.6709 10.8291L13.0801 12.4199L10.0742 9.41406L5.09668 13.7686C4.27868 12.8333 4.37343 11.4112 5.30859 10.5938L10.1758 6.33594L14.6709 10.8291ZM21.748 10.5C20.5053 10.5 19.498 9.49275 19.498 8.25V6.0918L15.4512 10.1396L13.8594 8.54883L17.9072 4.5H15.748C14.5053 4.5 13.498 3.49275 13.498 2.25H21.748V10.5Z"
        fill="currentColor"
      />
    ),
  },
  'robo-goal-inflation': {
    source: 'custom',
    label: 'Inflation protection goal',
    category: 'Actions',
    width: 24,
    height: 24,
    viewBox: '0 0 24 18.45',
    usage: ['CzFutureRoboAdvisorFlow goal selection'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.4 2.85C14.4 4.42401 13.124 5.7 11.55 5.7C9.97597 5.7 8.69998 4.42401 8.69998 2.85C8.69998 1.27599 9.97597 0 11.55 0C13.124 0 14.4 1.27599 14.4 2.85ZM4.5 5.92496C5.74264 5.92496 6.75 4.88403 6.75 3.59996C6.75 2.3159 5.74264 1.27496 4.5 1.27496C3.25736 1.27496 2.25 2.3159 2.25 3.59996C2.25 4.88403 3.25736 5.92496 4.5 5.92496ZM4.8 10.95C4.8 9.30002 5.625 7.87502 6.9 7.05002H3.6C1.575 7.05002 0 8.70002 0 10.725V16.275H4.8V10.95ZM13.875 12.45V6.89996H10.5C8.025 6.89996 6 8.99996 6 11.55V18.45H12.75C14.175 18.45 15.45 17.775 16.275 16.65C14.775 15.825 13.875 14.175 13.875 12.45ZM19.5 5.775C20.7426 5.775 21.75 4.73406 21.75 3.45C21.75 2.16594 20.7426 1.125 19.5 1.125C18.2574 1.125 17.25 2.16594 17.25 3.45C17.25 4.73406 18.2574 5.775 19.5 5.775ZM20.4 6.89996H15V12.45C15 14.475 16.65 16.125 18.6 16.125H24V10.575C24 8.54996 22.35 6.89996 20.4 6.89996Z"
        fill="currentColor"
      />
    ),
  },
  'robo-goal-unforeseen': {
    source: 'custom',
    label: 'Unforeseen circumstances goal',
    category: 'Actions',
    width: 24,
    height: 24,
    viewBox: '0 0 24 20.25',
    usage: ['CzFutureRoboAdvisorFlow goal selection'],
    render: () => (
      <path
        d="M10.9043 16.1318L12.792 11.1445L13.2637 12.4033H20.2227L12.8154 19.9102C12.3595 20.3632 11.6249 20.3632 11.1787 19.9102L3.76367 12.4033H5.2334L5.80469 11.3076L7.43262 14.6074L8.89746 9.77246L10.9043 16.1318ZM18 0C21.315 0 24 2.71865 24 6.0752C24 7.64081 23.0519 9.16178 23.0352 9.18848C22.7697 9.60463 22.1636 10.3524 21.6934 10.8848H14.2988L12.8008 6.87598L11.0322 11.5488L8.86816 4.6875L7.09863 10.5303L5.84277 7.9834L4.3291 10.8848H2.27051C1.82651 10.4147 1.2437 9.64465 0.918945 9.12598C0.90526 9.10363 3.5376e-06 7.62019 0 6.0752C0 2.71871 2.68492 8.54757e-05 5.99609 0C8.88276 0 11.4262 2.05936 12 4.81055C12.5791 2.06847 15.1178 0 18 0Z"
        fill="currentColor"
      />
    ),
  },
  'robo-goal-purchase': {
    source: 'custom',
    label: 'Major purchase goal',
    category: 'Actions',
    width: 24,
    height: 24,
    viewBox: '0 0 21 24',
    usage: ['CzFutureRoboAdvisorFlow goal selection'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5918 0L0 8.25V18.7897C0 21.6675 2.34136 24 5.23005 24H8.24145V17.25C8.24145 16.422 8.91525 15.75 9.74715 15.75H11.2529C12.084 15.75 12.7586 16.422 12.7586 17.25V24H15.7699C18.6586 24 21 21.6675 21 18.7897V8.25L10.5918 0Z"
        fill="currentColor"
      />
    ),
  },
  'robo-goal-retirement': {
    source: 'custom',
    label: 'Retirement goal',
    category: 'Actions',
    width: 24,
    height: 24,
    viewBox: '0 0 11.25 22.5',
    usage: ['CzFutureRoboAdvisorFlow goal selection'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 6.97199L0.0316423 13.5H1.09668V19.5592C1.09668 21.183 2.45112 22.5 4.12276 22.5H5.07589V13.5L6.19649 8.54549L7.24918 11.25H11.25V8.99999H8.84827L7.10331 4.53448C6.37863 4.00723 5.53277 3.61498 4.59122 3.41398L4.54414 3.40423C2.24352 2.92948 0.084894 4.68823 0 6.97199V6.97199ZM9.70647 22.5H11.25V12H9.70647V22.5ZM8.19073 0.0442297C9.23184 0.26623 9.88938 1.26673 9.66171 2.27773C9.4325 3.28948 8.40296 3.92923 7.36263 3.70723C6.32152 3.48523 5.6632 2.48473 5.89242 1.47298C6.12086 0.46198 7.15039 -0.178521 8.19073 0.0442297V0.0442297Z"
        fill="currentColor"
      />
    ),
  },
  'investment-goals-product': {
    source: 'custom',
    label: 'Investment goals product',
    category: 'Accounts',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['Future CZ Robo Homepage Investment goals product card'],
    notes: 'Exact 32x32 artwork supplied with the Future CZ Robo Homepage specification.',
    render: () => (
      <>
        <rect width="32" height="32" fill="var(--uc-surface-raised)" />
        <path
          d="M7.83871 22.2308V9.76923C7.83871 8.23992 6.56768 7 5 7V22.2308C5 23.7601 6.27103 25 7.83871 25H27C27 23.4707 25.729 22.2308 24.1613 22.2308H7.83871Z"
          fill="currentColor"
        />
        <path
          d="M10.023 16.7791C9.13806 17.5337 9.04864 18.8464 9.8229 19.7097L14.5323 15.6901L17.3767 18.4649L18.8819 16.9965L14.6288 12.8482L10.023 16.7791Z"
          fill="currentColor"
        />
        <path
          d="M23.4496 12.6229V14.6154C23.4496 15.7625 24.4027 16.6923 25.5786 16.6923V9.07692H17.7721C17.7721 10.2241 18.7252 11.1538 19.9012 11.1538H21.9443L18.1142 14.8916L19.6201 16.36L23.4496 12.6229Z"
          fill="currentColor"
        />
      </>
    ),
  },
} satisfies Record<string, CustomIconDefinition>
