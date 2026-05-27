export interface Transaction {
  id: number
  name: string
  description1?: string
  date: Date
  amount: number
  currency: string
  pfmCategory: string
  // Extended fields for details page
  status: "Booked" | "Pending" | "Rejected"
  postingDate: Date
  longDescription: string
  typeLabel: string
  paidFrom: string
  pfmSubcategory: string
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Taxes and Penalties": "#7757A4",
  Income: "#3D7D43",
  Utilities: "#546100",
  "Exclude from budget": "#535453",
  Shopping: "#AA4B22",
  Insurance: "#359F42",
  Groceries: "#A33694",
  Home: "#899E00",
  Education: "#5E3D32",
  Lifestyle: "#DD1860",
  Transportation: "#0D5870",
  "Leisure time": "#004F95",
  Healthcare: "#E30000",
  Cash: "#7E5B01",
  Investments: "#004C3D",
  Children: "#004F95",
  Wallet: "#AA4B22",
  Transfers: "#0D5870",
  Finance: "#004C3D",
  Uncategorized: "#01315C",
  ATM: "#388BCA",
  FX: "#244858",
  Internal: "#0D5870",
}

// Local asset path - no external requests
export const PFM_BASE_URL = "/assets/mobile-banking/"

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["Uncategorized"]
}

// ============================================================================
// CATEGORY TO FILENAME MAPPING - ensures exact match with local files
// Files have SPACES in names: "PFM-Leisure time.svg" (not underscores)
// ============================================================================

const CATEGORY_TO_FILENAME: Record<string, string> = {
  // Categories with spaces - keep spaces (files have spaces in names)
  "Taxes and Penalties": "Taxes and Penalties",
  "Leisure time": "Leisure time",
  "Exclude from budget": "Exclude from budget",
  
  // Single-word categories - direct mapping
  "Income": "Income",
  "Utilities": "Utilities",
  "Shopping": "Shopping",
  "Insurance": "Insurance",
  "Groceries": "Groceries",
  "Home": "Home",
  "Education": "Education",
  "Lifestyle": "Lifestyle",
  "Transportation": "Transportation",
  "Healthcare": "Healthcare",
  "Cash": "Cash",
  "Investments": "Investments",
  "Children": "Children",
  "Wallet": "Wallet",
  "Transfers": "Transfers",
  "Finance": "Finance",
  "Uncategorized": "Uncategorized",
  "ATM": "ATM",
  "FX": "FX",
  "Internal": "Internal",
  
  // Common variant mappings
  "Leisure": "Leisure time",
  "Taxes": "Taxes and Penalties",
  "Tax": "Taxes and Penalties",
  "Exclude": "Exclude from budget",
  "Excluded": "Exclude from budget",
}

/**
 * Resolves a category name to the exact local PFM icon URL.
 * Uses explicit mapping first, then uses category name directly.
 */
export function getPfmIconUrl(category: string): string {
  const c = (category || "Uncategorized").trim()
  
  // Try exact mapping first
  const mapped = CATEGORY_TO_FILENAME[c]
  if (mapped) {
    return `${PFM_BASE_URL}PFM-${mapped}.svg`
  }
  
  // Fallback: use category directly (no underscore conversion)
  return `${PFM_BASE_URL}PFM-${c}.svg`
}

export function formatTransactionDate(date: Date): string {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isSameYear = date.getFullYear() === now.getFullYear()

  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const time = `${hours}:${minutes}`

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const day = date.getDate().toString().padStart(2, "0")
  const month = months[date.getMonth()]

  if (isToday) {
    return `Today ${time}`
  } else if (isSameYear) {
    return `${day} ${month} ${time}`
  } else {
    return `${day} ${month} ${date.getFullYear()} ${time}`
  }
}

export function formatAmount(amount: number): { sign: string; integer: string; decimal: string } {
  const abs = Math.abs(amount)
  const sign = amount >= 0 ? "+" : "−" // Using proper Unicode minus (U+2212)
  const integerPart = Math.floor(abs)
  const decimalPart = Math.round((abs - integerPart) * 100)
    .toString()
    .padStart(2, "0")
  const formattedInteger = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return {
    sign,
    integer: formattedInteger,
    decimal: `,${decimalPart}`,
  }
}

export const transactionsByAccount: Record<number, Transaction[]> = {
  // RON account (index 0)
  0: [
    {
      id: 1,
      name: "Dante International",
      description1: "Salary November",
      date: new Date(new Date().setHours(14, 31)),
      amount: 11824.33,
      currency: "RON",
      pfmCategory: "Income",
      status: "Booked",
      postingDate: new Date(2025, 10, 7),
      longDescription: "Salary payment - Dante International SRL",
      typeLabel: "Incoming payment",
      paidFrom: "Current Account RO57BAC0000000791355033",
      pfmSubcategory: "Salary",
    },
    {
      id: 2,
      name: "Bar Magenta",
      description1: "Restaurant payment",
      date: new Date(new Date().setHours(11, 24)),
      amount: -294.21,
      currency: "RON",
      pfmCategory: "Lifestyle",
      status: "Booked",
      postingDate: new Date(2025, 10, 7),
      longDescription: "Retail Bar Magenta - Milano",
      typeLabel: "Card Payment",
      paidFrom: "Premium 5173 XXXX XXXX 8314",
      pfmSubcategory: "Restaurants",
    },
    {
      id: 3,
      name: "Andreea Popescu",
      description1: "Gift for the children",
      date: new Date(2025, 10, 7, 22, 44),
      amount: 500.0,
      currency: "RON",
      pfmCategory: "Children",
      status: "Booked",
      postingDate: new Date(2025, 10, 7),
      longDescription: "Transfer from Andreea Popescu - Gift",
      typeLabel: "Incoming payment",
      paidFrom: "Current Account RO57BAC0000000791355033",
      pfmSubcategory: "Gifts",
    },
    {
      id: 4,
      name: "Youtube",
      description1: "Premium subscription",
      date: new Date(2025, 10, 7, 14, 21),
      amount: -75.0,
      currency: "RON",
      pfmCategory: "Leisure time",
      status: "Pending",
      postingDate: new Date(2025, 10, 7),
      longDescription: "Youtube Premium - Monthly subscription",
      typeLabel: "Card Payment",
      paidFrom: "Premium 5173 XXXX XXXX 8314",
      pfmSubcategory: "Subscriptions",
    },
  ],
  // USD account (index 1)
  1: [
    {
      id: 5,
      name: "Upwork",
      description1: "Contract payout",
      date: new Date(new Date().setHours(9, 12)),
      amount: 650.0,
      currency: "USD",
      pfmCategory: "Income",
      status: "Booked",
      postingDate: new Date(2026, 0, 12),
      longDescription: "Upwork Escrow Inc. - Freelance payout",
      typeLabel: "Incoming payment",
      paidFrom: "USD Account RO27BAC0000000412876521",
      pfmSubcategory: "Freelance",
    },
    {
      id: 6,
      name: "CVS Pharmacy",
      description1: "Healthcare purchase",
      date: new Date(2026, 0, 12, 13, 41),
      amount: -18.4,
      currency: "USD",
      pfmCategory: "Healthcare",
      status: "Booked",
      postingDate: new Date(2026, 0, 12),
      longDescription: "CVS Pharmacy #4521 - New York",
      typeLabel: "Card Payment",
      paidFrom: "Debit Card 4532 XXXX XXXX 9821",
      pfmSubcategory: "Pharmacy",
    },
    {
      id: 7,
      name: "ATM Withdrawal",
      description1: "Cash withdrawal",
      date: new Date(2025, 11, 30, 21, 35),
      amount: -100.0,
      currency: "USD",
      pfmCategory: "ATM",
      status: "Booked",
      postingDate: new Date(2025, 11, 30),
      longDescription: "ATM Withdrawal - Chase Bank Manhattan",
      typeLabel: "ATM Withdrawal",
      paidFrom: "Debit Card 4532 XXXX XXXX 9821",
      pfmSubcategory: "Cash",
    },
    {
      id: 8,
      name: "Transfer from RON",
      description1: "Internal transfer",
      date: new Date(2026, 0, 12, 13, 5),
      amount: 150.0,
      currency: "USD",
      pfmCategory: "Internal",
      status: "Rejected",
      postingDate: new Date(2026, 0, 12),
      longDescription: "Internal transfer - Currency conversion RON to USD",
      typeLabel: "Transfer",
      paidFrom: "Current Account RO57BAC0000000791355033",
      pfmSubcategory: "Internal",
    },
  ],
  // EUR account (index 2)
  2: [
    {
      id: 9,
      name: "Allianz",
      description1: "Insurance premium",
      date: new Date(2026, 0, 12, 10, 18),
      amount: -12.5,
      currency: "EUR",
      pfmCategory: "Insurance",
      status: "Booked",
      postingDate: new Date(2026, 0, 12),
      longDescription: "Allianz SE - Travel insurance premium",
      typeLabel: "Direct Debit",
      paidFrom: "EUR Account RO18BAC0000000523198742",
      pfmSubcategory: "Travel Insurance",
    },
    {
      id: 10,
      name: "IKEA",
      description1: "Home purchase",
      date: new Date(2026, 0, 12, 10, 20),
      amount: -49.9,
      currency: "EUR",
      pfmCategory: "Home",
      status: "Pending",
      postingDate: new Date(2026, 0, 12),
      longDescription: "IKEA Deutschland GmbH - Berlin Store",
      typeLabel: "Card Payment",
      paidFrom: "Credit Card 5412 XXXX XXXX 3367",
      pfmSubcategory: "Furniture",
    },
    {
      id: 11,
      name: "Spotify",
      description1: "Subscription",
      date: new Date(2025, 11, 30, 21, 35),
      amount: -9.99,
      currency: "EUR",
      pfmCategory: "Lifestyle",
      status: "Booked",
      postingDate: new Date(2025, 11, 30),
      longDescription: "Spotify AB - Premium subscription",
      typeLabel: "Card Payment",
      paidFrom: "Credit Card 5412 XXXX XXXX 3367",
      pfmSubcategory: "Music",
    },
    {
      id: 12,
      name: "Currency exchange",
      description1: "FX conversion",
      date: new Date(2026, 0, 12, 13, 41),
      amount: -2.0,
      currency: "EUR",
      pfmCategory: "FX",
      status: "Booked",
      postingDate: new Date(2026, 0, 12),
      longDescription: "FX Fee - EUR to RON conversion",
      typeLabel: "Fee",
      paidFrom: "EUR Account RO18BAC0000000523198742",
      pfmSubcategory: "Fees",
    },
  ],
  // All accounts (index 3)
  3: [
    {
      id: 13,
      name: "Tax payment",
      description1: "Taxes and Penalties",
      date: new Date(2026, 0, 12, 13, 41),
      amount: -210.0,
      currency: "RON",
      pfmCategory: "Taxes and Penalties",
      status: "Booked",
      postingDate: new Date(2026, 0, 12),
      longDescription: "ANAF - Income tax Q4 2025",
      typeLabel: "Tax Payment",
      paidFrom: "Current Account RO57BAC0000000791355033",
      pfmSubcategory: "Income Tax",
    },
    {
      id: 14,
      name: "Transfer to savings",
      description1: "Internal transfer",
      date: new Date(2025, 11, 30, 21, 35),
      amount: -500.0,
      currency: "RON",
      pfmCategory: "Transfers",
      status: "Booked",
      postingDate: new Date(2025, 11, 30),
      longDescription: "Transfer to Savings Account - Monthly savings",
      typeLabel: "Transfer",
      paidFrom: "Current Account RO57BAC0000000791355033",
      pfmSubcategory: "Savings",
    },
    {
      id: 15,
      name: "Broker deposit",
      description1: "Investments top-up",
      date: new Date(new Date().setHours(12, 59)),
      amount: -300.0,
      currency: "RON",
      pfmCategory: "Investments",
      status: "Pending",
      postingDate: new Date(),
      longDescription: "Trading 212 - Investment account deposit",
      typeLabel: "Transfer",
      paidFrom: "Current Account RO57BAC0000000791355033",
      pfmSubcategory: "Stocks",
    },
    {
      id: 16,
      name: "Wallet top-up",
      description1: "Cash in",
      date: new Date(new Date().setHours(9, 5)),
      amount: 200.0,
      currency: "RON",
      pfmCategory: "Wallet",
      status: "Booked",
      postingDate: new Date(),
      longDescription: "Digital Wallet top-up - Cash deposit",
      typeLabel: "Deposit",
      paidFrom: "ATM Deposit - Bucharest",
      pfmSubcategory: "Cash",
    },
  ],
  // Open new account (index 4) - empty
  4: [],
}

// Helper to find transaction by ID across all accounts
export function findTransactionById(id: number): Transaction | null {
  for (const accountTransactions of Object.values(transactionsByAccount)) {
    const found = accountTransactions.find((t) => t.id === id)
    if (found) return found
  }
  return null
}
