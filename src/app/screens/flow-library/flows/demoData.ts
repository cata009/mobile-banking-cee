/**
 * Canonical demo data for every Flow Library preview.
 *
 * Values are taken directly from the RO Enablers Figma (Round Up flow,
 * node 2344:10093) so the previews match the source design and the on-screen
 * spec cannot drift from what is rendered.
 */

export const FLOW_DEMO = {
  cardholder: "PETER JAGODIC",

  currentAccount: {
    name: "My RON Account",
    iban: "RO62BACX000007913550021",
    balance: "5.589,00",
    currency: "RON",
  },
  savingsAccount: {
    name: "Saving Account",
    iban: "RO62BACX000007913550007",
    available: "9.089,00",
    currency: "RON",
    interestRate: "2.5%",
  },

  // Round Up home promo + card row use this card.
  homeCard: { label: "Mastercard Classic", pan: "5173 **** **** 4007", balance: "5.589,00 RON" },

  // Card PIN flow cards.
  creditCard: {
    label: "Mastercard Credit Standard",
    pan: "5123 **** **** 5555",
    last4: "5555",
    freeToSpend: "410.55",
    currency: "RON",
    pin: ["4", "3", "2", "4"],
  },
  debitCard: {
    label: "Mastercard Debit Standard",
    pan: "5123 **** **** 4007",
    last4: "4007",
    freeToSpend: "341.50",
    currency: "RON",
    pin: ["1", "9", "8", "5"],
  },
  newPin: "8615",

  roundUp: {
    interestRate: "2.5%",
    thresholdOptions: ["Next 5 RON", "Next 10 RON"] as const,
    boostOptions: ["No boost", "+2 RON", "+5 RON"] as const,

    info: {
      heading: "Save automatically with every card payment",
      body:
        "Round Up helps you save automatically by rounding up your card payments to the next 5 RON or 10 RON amount. You can also add an optional boost to save even more.",
      example:
        "For example, if you spend 7.50 RON, we round it up to 10.00 RON and save 2.50 RON for you. The saved amount goes into your savings account. If you don't have one yet, you can open it during setup.",
      steps: [
        { title: "Choose your current account", desc: "Select the account used for card payments." },
        { title: "Choose savings account", desc: "Select or open the account where savings go." },
        { title: "Choose your saving options", desc: "Decide whether to round up to the next 5 RON or 10 RON amount, and optionally add a boost." },
        { title: "Pay and save automatically", desc: "Every eligible card payment tops up your savings." },
      ],
    },

    // Two states shown in the Set up / Manage screens.
    setup: {
      empty: {
        threshold: "Next 5 RON",
        boost: "+2 RON",
        termsChecked: false,
        example:
          "If you spend 12.50 RON, we round it up to 15.00 RON and save you 2.50 RON. With the +2 RON extra boost, your total saving is 4.50 RON.",
      },
      filled: {
        threshold: "Next 10 RON",
        boost: "+2 RON",
        termsChecked: true,
        example:
          "If you spend 12.50 RON, we round it up to 20.00 RON and save you 7.50 RON. With the +2 RON extra boost, your total saving is 9.50 RON.",
      },
    },

    monthLabel: "April 2026",
    transfers: [
      { day: "15", month: "APR", amount: "+1.25 RON" },
      { day: "14", month: "APR", amount: "+0.29 RON" },
    ],
  },

  savingsAccountIntro: {
    title: "Open a savings account",
    heading: "Make your money worth.",
    body:
      "When you open a savings account with UniCredit Bank, in RON, EUR or USD, you receive the flexibility of a current account and the advantage of saving with more convenient interest rates. You can transfer money between your current and savings accounts anytime, without losing the interest calculated until you withdraw.",
    benefits: [
      "0 FEES: your savings account can be funded anytime and has no activation, administration or closing fees.",
      "FLEXIBLE: permanent access to your money — withdraw or deposit anytime.",
      "PROFITABLE: a convenient interest rate for each currency: RON, EUR, USD.",
    ],
  },

  cardTransactions: {
    period: "October 2025",
    rows: [{ day: "1", month: "OCT", title: "Transaction Details", amount: "-50.00 RON" }],
  },

} as const;

export type FlowDemoData = typeof FLOW_DEMO;
