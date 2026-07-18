/**
 * Template preview identifiers, row shapes, and the mock content each template
 * renders.
 *
 * Extracted verbatim from TemplateCodePreviews.tsx so the preview components
 * read as layout rather than as layout mixed with fixture data.
 */
import type { IconName } from "@/app/components/icons";
import { MESSAGES_CONFIG_BY_COUNTRY } from "@/app/config/messagesConfig";
import type { MoreCardType } from "@/app/config/moreCardsConfig";

export type TemplateCodePreviewId =
  | "messages-inbox"
  | "recurrent-payment"
  | "product-detail"
  | "sign-pin"
  | "generate-token"
  | "message-detail"
  | "push-request-form"
  | "account-selection-panel"
  | "apple-pay-activation"
  | "successful-payment"
  | "tutorial-intro"
  | "product-selection"
  | "travel-insurance-detail"
  | "documents"
  | "settings"
  | "account-options"
  | "activate-mtoken"
  | "analytics-overview"
  | "cards-overview"
  | "contact-info-sheet"
  | "account-detail-homepage"
  | "domestic-payment-form"
  | "review-request"
  | "review-data"
  | "transaction-detail"
  | "informative-status"
  | "pending-status"
  | "success-status"
  | "error-status"
  | "warning-status"
  | "home-dashboard"
  | "payments-menu"
  | "new-payment-sheet"
  | "products-menu"
  | "more-menu"
  | "contacts-directory"
  | "messages-outbox"
  | "prime-benefits"
  | "prelogin-inactive"
  | "prelogin-active"
  | "language-selector-sheet"
  | "more-panel-menu"
  | "co-apping-session"
  | "account-transactions-list"
  | "spending-money-out"
  | "products-shopsmart"
  | "logout-confirmation";

export type TemplateCodePreviewProps = {
  previewId: TemplateCodePreviewId;
  presentationOnly?: boolean;
};

export type TemplateTab = {
  label: string;
  active?: boolean;
};

export type StandingOrderRow = {
  title: string;
  date: string;
  amount: string;
  currency: string;
};

export type FeedbackStatusKind = "informative" | "pending" | "success" | "error" | "warning";

export type FeedbackStatusTemplateConfig = {
  title: string;
  kind: FeedbackStatusKind;
  iconColor: string;
  heading: string;
  body: string;
  buttonLabel: string;
};

export type RadioOption = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  icon?: IconName;
};

export type FieldLine = {
  label: string;
  value?: string;
  placeholder?: string;
  action?: string;
};

export const messageRows = MESSAGES_CONFIG_BY_COUNTRY.RO.inbox;

export const outboxRows = MESSAGES_CONFIG_BY_COUNTRY.RO.outbox;

export const standingOrderRows: StandingOrderRow[] = [
  { title: "Radu standing order", date: "02.05.2025", amount: "120.000.00", currency: "RSD" },
  { title: "Radu standing order", date: "02.05.2025", amount: "120.000.00", currency: "RSD" },
  { title: "Radu standing order", date: "02.05.2025", amount: "120.000.00", currency: "RSD" },
];

export const feedbackBody = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

export const productSelectionOptions: RadioOption[] = [
  { title: "Current account", subtitle: "EUR - 59378215528495028873", selected: true },
  { title: "Debit card", subtitle: "Mastercard - 4322 **** **** 6546" },
];

export const accountSelectionOptions: RadioOption[] = [
  { title: "Click Gold", subtitle: "EUR - 59378215528495028873", selected: true },
  { title: "Click Gold", subtitle: "RON - 59378215528495028873" },
  { title: "Click Gold", subtitle: "USD - 59378215528495028873" },
];

export const moreCardMeta: Record<MoreCardType, { title: string; description: string; icon: IconName }> = {
  contacts: {
    title: "Contacts",
    description: "Support, branches, and useful numbers",
    icon: "contact-phone",
  },
  documents: {
    title: "Documents",
    description: "Statements and bank documents",
    icon: "account-option-statement",
  },
  settings: {
    title: "Settings",
    description: "App preferences and security",
    icon: "demo-settings",
  },
  "gdpr-consent": {
    title: "GDPR consent",
    description: "Manage personal data permissions",
    icon: "info-circle",
  },
  "third-party-consent": {
    title: "Consent to third parties",
    description: "Open banking access and sharing",
    icon: "account-option-share-info",
  },
  "digital-activities": {
    title: "Digital activity record",
    description: "Recent online banking activity",
    icon: "filters",
  },
  "my-requests": {
    title: "My applications",
    description: "Submitted service requests",
    icon: "payment-templates",
  },
  tutorial: {
    title: "Tutorials",
    description: "Guided help for app features",
    icon: "help-circle",
  },
};

export const preloginProducts: Array<{ title: string; description: string; icon: IconName }> = [
  { title: "Accounts", description: "Everyday banking and balances", icon: "wallet-cards" },
  { title: "Cards", description: "Debit and credit card services", icon: "credit-card" },
  { title: "Loans", description: "Personal and mortgage options", icon: "landmark" },
];

export const languageSelectorOptions: RadioOption[] = [
  { title: "ENGLISH", subtitle: "Use the app in English", selected: true },
  { title: "ROMANA", subtitle: "Foloseste aplicatia in romana" },
];

export const accountTransactionTemplateRows: Array<{ title: string; category: string; amount: string; icon: IconName }> = [
  { title: "Kindergarten 45", category: "School fees", amount: "-247,00 RON", icon: "account-option-statement" },
  { title: "Salary", category: "Incoming payment", amount: "+8.200,00 RON", icon: "landmark" },
  { title: "Online card payment", category: "Shopping", amount: "-74,50 RON", icon: "shopping-bag" },
  { title: "Transfer to savings", category: "Internal transfer", amount: "-500,00 RON", icon: "repeat" },
];

export const spendingMoneyOutRows: Array<{ title: string; amount: string; share: string; icon: IconName; barClass: string }> = [
  { title: "Groceries", amount: "-1.245,80 RON", share: "42%", icon: "shopping-bag", barClass: "bg-[var(--uc-product-pink)]" },
  { title: "Home", amount: "-760,00 RON", share: "26%", icon: "landmark", barClass: "bg-[var(--uc-action)]" },
  { title: "Transport", amount: "-420,30 RON", share: "14%", icon: "credit-card", barClass: "bg-[var(--uc-product-blue)]" },
  { title: "Leisure", amount: "-318,50 RON", share: "11%", icon: "wallet-cards", barClass: "bg-[var(--uc-orange-status)]" },
];

export const pushRequestSections: Array<{ title: string; fields: FieldLine[] }> = [
  {
    title: "PAYER",
    fields: [
      { label: "Payer name", value: "John Doe" },
      { label: "Payer IBAN", value: "RO49AAAA1B31007593840000" },
    ],
  },
  {
    title: "YOUR ACCOUNT",
    fields: [
      { label: "Select account", value: "RON - 59378215528495028873", action: "Change" },
      { label: "Available balance", value: "12.250,00 RON" },
    ],
  },
  {
    title: "PAYMENT INFORMATION",
    fields: [
      { label: "Amount", placeholder: "0,00 RON" },
      { label: "Message for payer", placeholder: "Add details" },
      { label: "Request expires", value: "29.05.2026" },
    ],
  },
];

export const tokenOptions: RadioOption[] = [
  { title: "Log in to Online Banking", selected: true },
  { title: "Confirm transaction" },
  { title: "Cancel transaction" },
];

export const domesticPaymentFields = {
  fromAccount: [
    { label: "Account number", value: "123546545476745", helper: "Primary Account\n300.020,00 CZK", right: "chevron-down" as IconName },
  ],
  beneficiary: [
    { label: "Beneficiary", value: "Kindergarten 45" },
    { label: "Prefix", value: "19" },
    { label: "Account number (mandatory)", value: "2000145399", right: "camera" as IconName },
    { label: "Bank code (mandatory)", value: "0800", helper: "Ceska sporitelna, a.s.", right: "camera" as IconName },
  ],
};

export const reviewRequestSections: Array<{ title: string; rows: FieldLine[] }> = [
  {
    title: "PAYER",
    rows: [
      { label: "Contact", value: "Amy Adams" },
      { label: "Payer alias", value: "Amy Adams" },
      { label: "Phone number", value: "+40 123456678" },
      { label: "Payer bank", value: "UniCredit Bank Bucharest" },
      { label: "Payer IBAN", value: "RO12RZBR5663123456" },
    ],
  },
  {
    title: "YOUR ACCOUNT",
    rows: [
      { label: "Account name", value: "Primary Account" },
      { label: "Account number", value: "1234567890123456" },
    ],
  },
  {
    title: "PAYMENT INFORMATION",
    rows: [
      { label: "Amount", value: "100 RON" },
      { label: "Payment details", value: "Robert's gift" },
      { label: "Reference number/E2E", value: "905430585" },
    ],
  },
];

export const reviewDataRows: FieldLine[] = [
  { label: "Payer account", value: "Primary Account name" },
  { label: "Payer account number", value: "1208187008/2700" },
  { label: "Beneficiary name", value: "John Wilson" },
  { label: "Beneficiary account number", value: "19-2000145399/0800" },
  { label: "Amount", value: "24700,00 CZK" },
  { label: "Instant Payment", value: "Yes" },
  { label: "Due date", value: "15.02.2026" },
  { label: "Express Payment (a fee is charged)", value: "No" },
  { label: "Information for beneficiary", value: "Payment april - Martin Luka" },
];

export const transactionDetailRows: FieldLine[] = [
  { label: "Account number", value: "1208187008/2700", action: "copy" },
  { label: "Account title", value: "Primary Account" },
  { label: "Account owner", value: "John Snow" },
  { label: "Booking date", value: "15.02.2026" },
  { label: "Beneficiary Name", value: "Martin Luka" },
  { label: "Beneficiary Bank Name", value: "UniCredit Bank Czech Republic and S\nZeletavska 1525/1" },
  { label: "Beneficiary account number", value: "CZ40270000000021070555322", action: "copy" },
  { label: "Amount", value: "-24.700,00 CZK" },
  { label: "Payment details", value: "Payment april - Martin Luka" },
  { label: "Reference number", value: "6041300502" },
];

export const feedbackStatusTemplates: Record<
  Extract<TemplateCodePreviewId, "informative-status" | "pending-status" | "success-status" | "error-status" | "warning-status">,
  FeedbackStatusTemplateConfig
> = {
  "informative-status": {
    title: "Informative",
    kind: "informative",
    iconColor: "var(--uc-text)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "pending-status": {
    title: "Pending",
    kind: "pending",
    iconColor: "var(--uc-text)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "success-status": {
    title: "Successfully requested",
    kind: "success",
    iconColor: "var(--uc-green-olive)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "error-status": {
    title: "Something went wrong",
    kind: "error",
    iconColor: "var(--uc-status-red)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
  "warning-status": {
    title: "Something went wrong",
    kind: "warning",
    iconColor: "var(--uc-orange-status)",
    heading: "Lorem ipsum",
    body: feedbackBody,
    buttonLabel: "Ok, got it",
  },
};
