import type { CustomIconDefinition } from '../../iconTypes'

export const PRODUCTS_CUSTOM_ICONS = {
  'shopsmart-store': {
    source: 'custom',
    label: 'Shopsmart store',
    category: 'Contacts',
    width: 20,
    height: 20,
    // Cropped to the glyph the way the sibling contact icons are: at 32x32 the
    // artwork only filled the middle 20px and read a size smaller beside them.
    viewBox: '6 7 20 18',
    usage: ['ShopsmartOfferCard'],
    render: () => (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24.7499 12.25C24.7499 12.94 24.1899 13.5 23.4999 13.5C22.8099 13.5 22.2499 12.94 22.2499 12.25C22.2499 12.94 21.6899 13.5 20.9999 13.5C20.3099 13.5 19.7499 12.94 19.7499 12.25C19.7499 12.94 19.1899 13.5 18.4999 13.5C17.8099 13.5 17.2499 12.94 17.2499 12.25C17.2499 12.94 16.6899 13.5 15.9999 13.5C15.3099 13.5 14.7499 12.94 14.7499 12.25C14.7499 12.94 14.1899 13.5 13.4999 13.5C12.8099 13.5 12.2499 12.94 12.2499 12.25C12.2499 12.94 11.6899 13.5 10.9999 13.5C10.3099 13.5 9.74991 12.94 9.74991 12.25C9.74991 12.94 9.18991 13.5 8.49991 13.5C7.80991 13.5 7.24991 12.94 7.24991 12.25V9.125H24.7499V12.25ZM19.7501 21.1787H24.7501V15.375H19.7501V21.1787ZM14.1249 23.5H17.8749V15.375H14.1249V23.5ZM7.24991 21.1787H12.2499V15.375H7.24991V21.1787ZM8.5 7.25C7.11937 7.25 6 8.36937 6 9.75V24.75H23.5C24.8806 24.75 26 23.6306 26 22.25V7.25H8.5Z"
        fill="currentColor"
      />
    ),
  },
  'insurance-calendar': {
    source: 'custom',
    label: 'Insurance calendar',
    category: 'System',
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    usage: ['RsPropertyInsurancePreviews insurance start date'],
    notes: 'Exact 32px calendar glyph supplied for the RS property-insurance start-date field.',
    render: () => (
      <path
        d="M25.125 14.125V23.5C25.125 24.8805 23.9659 25.9998 22.5361 26H7V14.125H25.125ZM9.5 23.708H12.625V20.583H9.5V23.708ZM14.5 23.708H17.625V20.583H14.5V23.708ZM9.5 19.333H12.625V16.208H9.5V19.333ZM14.5 19.333H17.625V16.208H14.5V19.333ZM19.5 19.333H22.625V16.208H19.5V19.333ZM25.125 12.25H7V8.5C7 7.11951 8.15913 6.00022 9.58887 6H25.125V12.25ZM10.2363 7.875C9.52117 7.87515 8.94238 8.43447 8.94238 9.125C8.94238 9.81491 9.52117 10.3748 10.2363 10.375C10.9516 10.375 11.5312 9.815 11.5312 9.125C11.5312 8.43438 10.9516 7.875 10.2363 7.875ZM21.8887 7.875C21.1734 7.875 20.5938 8.43438 20.5938 9.125C20.5938 9.815 21.1734 10.375 21.8887 10.375C22.6038 10.3749 23.1826 9.81491 23.1826 9.125C23.1826 8.43446 22.6038 7.87515 21.8887 7.875Z"
        fill="currentColor"
      />
    ),
  },
} satisfies Record<string, CustomIconDefinition>
