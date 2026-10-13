export type Screen =
  | 'prelogin-inactive'
  | 'prelogin-active'
  | 'co-apping-session'
  | 'homepage'
  | 'language-selector'
  | 'analytics' // Spending analytics
  | 'messages' // Messages inbox/outbox
  | 'payments' // Payments menu
  | 'products' // Products menu
  | 'my-banker' // My Banker peer-based product recommendations (RS future)
  | 'product-detail' // Product detail opened from Products bottom sheet
  | 'smart-investment' // Future Gain smart investment information and currency preview
  | 'future-gain-peer-insights' // Future Gain GDPR consent and peer goal carousel
  | 'investments' // Investments portfolio
  | 'investments-history' // Investments history transactions/orders flow
  | 'investment-orders-to-approve' // Pending investments awaiting approval
  | 'prime' // Prime screen
  | 'appointments' // Prime appointment booking and meeting management
  | 'request-call' // Prime callback request flow
  | 'more' // More screen
  | 'documents' // Documents screen
  | 'settings' // Settings screen
  | 'contacts' // Contacts screen
  | 'transactions' // All transactions across the current accounts
  | 'account-detail' // Account details and transactions
  | 'account-details-info' // Account details information
  | 'account-options' // Account options menu
  | 'card-details-info' // Card details information
  | 'card-options' // Card options menu
  | 'transaction-detail' // Transaction details and redo payment entry
  | 'card-detail' // Card details, carousel, and transactions
  | 'domestic-payment' // Domestic payment create form
  | 'payment-review' // Domestic payment review data
  | 'payment-sign' // Domestic payment sign screen
  | 'payment-success' // Domestic payment success screen
  | 'flow-library' // Full-width future flow preview library
  | 'design-system' // Full-width component inventory
  | 'tools' // Full-width stakeholder tools (side-by-side, translation tools)
