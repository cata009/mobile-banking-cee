import type { Transaction } from "./transactions-data"

// Extended transaction data for Account Details with multiple months
export interface AccountDetailsTransaction extends Transaction {
  month: string // "November 2025", "October 2025", etc.
  dayKey: string // "Today", "07 November", "30 October", etc.
}

// Generate transactions organized by month and day for each account
export function generateAccountDetailsTransactions(accountIndex: number): AccountDetailsTransaction[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDay = now.getDate()

  // Helper to format day key
  const formatDayKey = (date: Date): string => {
    const today = new Date()
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today"
    }
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
    return `${date.getDate().toString().padStart(2, "0")} ${months[date.getMonth()]}`
  }

  const formatMonth = (date: Date): string => {
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
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  // RON Account transactions (index 0)
  if (accountIndex === 0) {
    return [
      // November - Today
      {
        id: 101,
        name: "Dante International",
        description1: "Salary November",
        date: new Date(currentYear, currentMonth, currentDay, 14, 31),
        amount: 11824.33,
        currency: "RON",
        pfmCategory: "Income",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, currentDay),
        longDescription: "Salary payment - Dante International SRL",
        typeLabel: "Incoming payment",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Salary",
        month: formatMonth(new Date(currentYear, currentMonth, currentDay)),
        dayKey: "Today",
      },
      {
        id: 102,
        name: "Bar Magenta",
        description1: "",
        date: new Date(currentYear, currentMonth, currentDay, 11, 24),
        amount: -294.21,
        currency: "RON",
        pfmCategory: "Lifestyle",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, currentDay),
        longDescription: "Retail Bar Magenta - Milano",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Restaurants",
        month: formatMonth(new Date(currentYear, currentMonth, currentDay)),
        dayKey: "Today",
      },
      // November - 07
      {
        id: 103,
        name: "Andreea Popescu",
        description1: "Gift for the children",
        date: new Date(currentYear, currentMonth, 7, 22, 44),
        amount: 500.0,
        currency: "RON",
        pfmCategory: "Children",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, 7),
        longDescription: "Transfer from Andreea Popescu - Gift",
        typeLabel: "Incoming payment",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Gifts",
        month: formatMonth(new Date(currentYear, currentMonth, 7)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth, 7)),
      },
      {
        id: 104,
        name: "Youtube",
        description1: "",
        date: new Date(currentYear, currentMonth, 7, 14, 21),
        amount: -75.0,
        currency: "RON",
        pfmCategory: "Leisure time",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, 7),
        longDescription: "Youtube Premium - Monthly subscription",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Subscriptions",
        month: formatMonth(new Date(currentYear, currentMonth, 7)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth, 7)),
      },
      // October - 27
      {
        id: 105,
        name: "Kindergarden 256",
        description1: "Tax for current month",
        date: new Date(currentYear, currentMonth - 1, 27, 17, 20),
        amount: -600.0,
        currency: "RON",
        pfmCategory: "Education",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 27),
        longDescription: "Kindergarden 256 - Monthly fee",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Education",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 27)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 27)),
      },
      {
        id: 106,
        name: "Youtube",
        description1: "",
        date: new Date(currentYear, currentMonth - 1, 27, 17, 19),
        amount: -75.0,
        currency: "RON",
        pfmCategory: "Leisure time",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 27),
        longDescription: "Youtube Premium - Monthly subscription",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Subscriptions",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 27)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 27)),
      },
      {
        id: 107,
        name: "Disney+",
        description1: "",
        date: new Date(currentYear, currentMonth - 1, 27, 17, 15),
        amount: -55.99,
        currency: "RON",
        pfmCategory: "Leisure time",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 27),
        longDescription: "Disney+ - Monthly subscription",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Subscriptions",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 27)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 27)),
      },
      // October - 15
      {
        id: 108,
        name: "Salary October",
        description1: "Dante International",
        date: new Date(currentYear, currentMonth - 1, 15, 9, 0),
        amount: 12000.0,
        currency: "RON",
        pfmCategory: "Income",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 15),
        longDescription: "Salary payment - Dante International SRL",
        typeLabel: "Incoming payment",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Salary",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 15)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 15)),
      },
      // October - 05
      {
        id: 109,
        name: "Enel Energie",
        description1: "Electricity bill",
        date: new Date(currentYear, currentMonth - 1, 5, 10, 30),
        amount: -320.5,
        currency: "RON",
        pfmCategory: "Utilities",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 5),
        longDescription: "Enel Energie - Monthly electricity",
        typeLabel: "Direct Debit",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Electricity",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 5)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 5)),
      },
      {
        id: 110,
        name: "Digi",
        description1: "Internet & TV",
        date: new Date(currentYear, currentMonth - 1, 5, 10, 15),
        amount: -89.0,
        currency: "RON",
        pfmCategory: "Utilities",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 5),
        longDescription: "Digi RCS&RDS - Internet & Cable TV",
        typeLabel: "Direct Debit",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Internet",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 5)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 5)),
      },
      // September - 28
      {
        id: 111,
        name: "Carrefour",
        description1: "Groceries",
        date: new Date(currentYear, currentMonth - 2, 28, 18, 45),
        amount: -456.78,
        currency: "RON",
        pfmCategory: "Groceries",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 2, 28),
        longDescription: "Carrefour Hypermarket - Weekly groceries",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Supermarket",
        month: formatMonth(new Date(currentYear, currentMonth - 2, 28)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 2, 28)),
      },
      {
        id: 112,
        name: "OMV",
        description1: "Fuel",
        date: new Date(currentYear, currentMonth - 2, 28, 14, 20),
        amount: -250.0,
        currency: "RON",
        pfmCategory: "Transportation",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 2, 28),
        longDescription: "OMV Petrom - Fuel purchase",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Fuel",
        month: formatMonth(new Date(currentYear, currentMonth - 2, 28)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 2, 28)),
      },
      // September - 15
      {
        id: 113,
        name: "Salary September",
        description1: "Dante International",
        date: new Date(currentYear, currentMonth - 2, 15, 9, 0),
        amount: 12000.0,
        currency: "RON",
        pfmCategory: "Income",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 2, 15),
        longDescription: "Salary payment - Dante International SRL",
        typeLabel: "Incoming payment",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Salary",
        month: formatMonth(new Date(currentYear, currentMonth - 2, 15)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 2, 15)),
      },
      // August - 25
      {
        id: 114,
        name: "Vacation booking",
        description1: "Booking.com",
        date: new Date(currentYear, currentMonth - 3, 25, 12, 0),
        amount: -1500.0,
        currency: "RON",
        pfmCategory: "Leisure time",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 3, 25),
        longDescription: "Booking.com - Hotel reservation",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Travel",
        month: formatMonth(new Date(currentYear, currentMonth - 3, 25)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 3, 25)),
      },
      // August - 15
      {
        id: 115,
        name: "Salary August",
        description1: "Dante International",
        date: new Date(currentYear, currentMonth - 3, 15, 9, 0),
        amount: 12000.0,
        currency: "RON",
        pfmCategory: "Income",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 3, 15),
        longDescription: "Salary payment - Dante International SRL",
        typeLabel: "Incoming payment",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Salary",
        month: formatMonth(new Date(currentYear, currentMonth - 3, 15)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 3, 15)),
      },
      // August - 10
      {
        id: 116,
        name: "Netflix",
        description1: "",
        date: new Date(currentYear, currentMonth - 3, 10, 8, 0),
        amount: -54.99,
        currency: "RON",
        pfmCategory: "Leisure time",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 3, 10),
        longDescription: "Netflix - Monthly subscription",
        typeLabel: "Card Payment",
        paidFrom: "Premium 5173 XXXX XXXX 8314",
        pfmSubcategory: "Subscriptions",
        month: formatMonth(new Date(currentYear, currentMonth - 3, 10)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 3, 10)),
      },
    ]
  }

  // USD Account (index 1)
  if (accountIndex === 1) {
    return [
      {
        id: 201,
        name: "Upwork",
        description1: "Contract payout",
        date: new Date(currentYear, currentMonth, currentDay, 9, 12),
        amount: 650.0,
        currency: "USD",
        pfmCategory: "Income",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, currentDay),
        longDescription: "Upwork Escrow Inc. - Freelance payout",
        typeLabel: "Incoming payment",
        paidFrom: "USD Account RO27BAC0000000412876521",
        pfmSubcategory: "Freelance",
        month: formatMonth(new Date(currentYear, currentMonth, currentDay)),
        dayKey: "Today",
      },
      {
        id: 202,
        name: "CVS Pharmacy",
        description1: "Healthcare purchase",
        date: new Date(currentYear, currentMonth, 7, 13, 41),
        amount: -18.4,
        currency: "USD",
        pfmCategory: "Healthcare",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, 7),
        longDescription: "CVS Pharmacy #4521 - New York",
        typeLabel: "Card Payment",
        paidFrom: "Debit Card 4532 XXXX XXXX 9821",
        pfmSubcategory: "Pharmacy",
        month: formatMonth(new Date(currentYear, currentMonth, 7)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth, 7)),
      },
      {
        id: 203,
        name: "ATM Withdrawal",
        description1: "Cash withdrawal",
        date: new Date(currentYear, currentMonth - 1, 30, 21, 35),
        amount: -100.0,
        currency: "USD",
        pfmCategory: "ATM",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 30),
        longDescription: "ATM Withdrawal - Chase Bank Manhattan",
        typeLabel: "ATM Withdrawal",
        paidFrom: "Debit Card 4532 XXXX XXXX 9821",
        pfmSubcategory: "Cash",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 30)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 30)),
      },
      {
        id: 204,
        name: "Amazon",
        description1: "Shopping",
        date: new Date(currentYear, currentMonth - 1, 15, 16, 20),
        amount: -89.99,
        currency: "USD",
        pfmCategory: "Shopping",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 15),
        longDescription: "Amazon.com - Electronics purchase",
        typeLabel: "Card Payment",
        paidFrom: "Debit Card 4532 XXXX XXXX 9821",
        pfmSubcategory: "Electronics",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 15)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 15)),
      },
    ]
  }

  // EUR Account (index 2)
  if (accountIndex === 2) {
    return [
      {
        id: 301,
        name: "Allianz",
        description1: "Insurance premium",
        date: new Date(currentYear, currentMonth, currentDay, 10, 18),
        amount: -12.5,
        currency: "EUR",
        pfmCategory: "Insurance",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, currentDay),
        longDescription: "Allianz SE - Travel insurance premium",
        typeLabel: "Direct Debit",
        paidFrom: "EUR Account RO18BAC0000000523198742",
        pfmSubcategory: "Travel Insurance",
        month: formatMonth(new Date(currentYear, currentMonth, currentDay)),
        dayKey: "Today",
      },
      {
        id: 302,
        name: "IKEA",
        description1: "Home purchase",
        date: new Date(currentYear, currentMonth, 7, 10, 20),
        amount: -49.9,
        currency: "EUR",
        pfmCategory: "Home",
        status: "Pending",
        postingDate: new Date(currentYear, currentMonth, 7),
        longDescription: "IKEA Deutschland GmbH - Berlin Store",
        typeLabel: "Card Payment",
        paidFrom: "Credit Card 5412 XXXX XXXX 3367",
        pfmSubcategory: "Furniture",
        month: formatMonth(new Date(currentYear, currentMonth, 7)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth, 7)),
      },
      {
        id: 303,
        name: "Spotify",
        description1: "Subscription",
        date: new Date(currentYear, currentMonth - 1, 30, 21, 35),
        amount: -9.99,
        currency: "EUR",
        pfmCategory: "Lifestyle",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 30),
        longDescription: "Spotify AB - Premium subscription",
        typeLabel: "Card Payment",
        paidFrom: "Credit Card 5412 XXXX XXXX 3367",
        pfmSubcategory: "Music",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 30)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 30)),
      },
    ]
  }

  // All accounts (index 3)
  if (accountIndex === 3) {
    return [
      {
        id: 401,
        name: "Tax payment",
        description1: "Taxes and Penalties",
        date: new Date(currentYear, currentMonth, currentDay, 13, 41),
        amount: -210.0,
        currency: "RON",
        pfmCategory: "Taxes and Penalties",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth, currentDay),
        longDescription: "ANAF - Income tax Q4 2025",
        typeLabel: "Tax Payment",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Income Tax",
        month: formatMonth(new Date(currentYear, currentMonth, currentDay)),
        dayKey: "Today",
      },
      {
        id: 402,
        name: "Transfer to savings",
        description1: "Internal transfer",
        date: new Date(currentYear, currentMonth - 1, 30, 21, 35),
        amount: -500.0,
        currency: "RON",
        pfmCategory: "Transfers",
        status: "Booked",
        postingDate: new Date(currentYear, currentMonth - 1, 30),
        longDescription: "Transfer to Savings Account - Monthly savings",
        typeLabel: "Transfer",
        paidFrom: "Current Account RO57BAC0000000791355033",
        pfmSubcategory: "Savings",
        month: formatMonth(new Date(currentYear, currentMonth - 1, 30)),
        dayKey: formatDayKey(new Date(currentYear, currentMonth - 1, 30)),
      },
    ]
  }

  return []
}

// Get unique months from transactions
export function getAvailableMonths(transactions: AccountDetailsTransaction[]): string[] {
  const months = new Set<string>()
  transactions.forEach((t) => months.add(t.month))

  const monthOrder = [
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

  // Sort oldest→newest so chips render left→right chronologically
  return Array.from(months).sort((a, b) => {
    const [monthA, yearA] = a.split(" ")
    const [monthB, yearB] = b.split(" ")
    if (yearA !== yearB) return Number.parseInt(yearA) - Number.parseInt(yearB)
    return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB)
  })
}

// Group transactions by day within a month
export interface DayGroup {
  dayKey: string
  transactions: AccountDetailsTransaction[]
  dailyTotal: number
}

export interface MonthGroup {
  month: string
  days: DayGroup[]
  totalIncome: number
  totalExpenses: number
  monthlyTotal: number
}

export function groupTransactionsByMonthAndDay(transactions: AccountDetailsTransaction[]): MonthGroup[] {
  const monthMap = new Map<string, Map<string, AccountDetailsTransaction[]>>()

  // Group by month, then by day
  transactions.forEach((t) => {
    if (!monthMap.has(t.month)) {
      monthMap.set(t.month, new Map())
    }
    const dayMap = monthMap.get(t.month)!
    if (!dayMap.has(t.dayKey)) {
      dayMap.set(t.dayKey, [])
    }
    dayMap.get(t.dayKey)!.push(t)
  })

  // Convert to MonthGroup array
  const result: MonthGroup[] = []

  monthMap.forEach((dayMap, month) => {
    const days: DayGroup[] = []
    let totalIncome = 0
    let totalExpenses = 0

    dayMap.forEach((dayTransactions, dayKey) => {
      // Sort transactions by time (newest first)
      dayTransactions.sort((a, b) => b.date.getTime() - a.date.getTime())

      const dailyTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0)
      days.push({ dayKey, transactions: dayTransactions, dailyTotal })

      // Calculate monthly totals
      dayTransactions.forEach((t) => {
        if (t.amount >= 0) {
          totalIncome += t.amount
        } else {
          totalExpenses += Math.abs(t.amount)
        }
      })
    })

    // Sort days (Today first, then by date descending)
    days.sort((a, b) => {
      if (a.dayKey === "Today") return -1
      if (b.dayKey === "Today") return 1
      // Parse day numbers and compare
      const dayA = Number.parseInt(a.dayKey.split(" ")[0])
      const dayB = Number.parseInt(b.dayKey.split(" ")[0])
      return dayB - dayA
    })

    result.push({
      month,
      days,
      totalIncome,
      totalExpenses,
      monthlyTotal: totalIncome - totalExpenses,
    })
  })

  // Sort months (newest first)
  result.sort((a, b) => {
    const monthOrder = [
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
    const [monthA, yearA] = a.month.split(" ")
    const [monthB, yearB] = b.month.split(" ")
    if (yearA !== yearB) return Number.parseInt(yearB) - Number.parseInt(yearA)
    return monthOrder.indexOf(monthB) - monthOrder.indexOf(monthA)
  })

  return result
}
