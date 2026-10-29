import type {
  NewPaymentActionIcon,
  PaymentHeroId,
} from '@/app/config/paymentsMenuConfig';

type RoSheet = {
  title: string;
  actions: readonly {
    id: string;
    title: string;
    description: string;
    icon: NewPaymentActionIcon | 'ropay';
  }[];
};

/** Romanian baseline copy transcribed from the supplied app screenshots. */
export const RO_SHEETS: Partial<Record<PaymentHeroId, RoSheet>> = {
  'new-payment': {
    title: 'Payment to account',
    actions: [
      {
        id: 'domestic-payment',
        title: 'PAYMENT TO NEW BENEFICIARY',
        description: 'Make a payment to an individual or to a company',
        icon: 'domestic',
      },
      {
        id: 'templates-beneficiaries',
        title: 'TEMPLATES & BENEFICIARY',
        description: "Reuse details from a payment you've made in the past",
        icon: 'templates',
      },
      {
        id: 'foreign-payment',
        title: 'FOREIGN PAYMENTS',
        description: 'Make a foreign or SEPA payment',
        icon: 'foreign',
      },
      {
        id: 'treasury-payment',
        title: 'TREASURY PAYMENT',
        description: 'Make a budget payment',
        icon: 'domestic',
      },
      {
        id: 'own-account-transfer',
        title: 'TRANSFER BETWEEN YOUR OWN ACCOUNTS',
        description: 'Same currency transfer only',
        icon: 'exchange',
      },
    ],
  },
  'scan-pay': {
    title: 'RoPay',
    actions: [
      {
        id: 'ropay-alias',
        title: 'PAY REMOTE WITH ROPAY ALIAS',
        description: 'pay remote with RoPay Alias',
        icon: 'ropay',
      },
      {
        id: 'ropay-qr',
        title: 'PAY WITH QR CODE',
        description: 'pay with qr code',
        icon: 'ropay',
      },
      {
        id: 'ropay-request',
        title: 'REQUEST WITH QR CODE',
        description: 'request with QR code',
        icon: 'ropay',
      },
    ],
  },
  'manage-ebills': {
    title: 'Bill Payments & Donations',
    actions: [
      {
        id: 'new-bill',
        title: 'NEW BILL PAYMENT',
        description: 'Bill Payments & Donations',
        icon: 'domestic',
      },
      {
        id: 'direct-debit',
        title: 'DIRECT DEBIT',
        description: 'Create and manage your intrabank Direct Debit mandates',
        icon: 'templates',
      },
      {
        id: 'scan-paycode',
        title: 'SCAN PAYCODE',
        description:
          'Easily create a payment by scanning the barcode on the invoice',
        icon: 'slip',
      },
    ],
  },
};
