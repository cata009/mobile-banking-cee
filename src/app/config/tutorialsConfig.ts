import type { CountryId } from "@/app/state/demoTypes";

export type BankingTutorialSlideKind = "hero" | "checklist" | "confirmation";

export interface BankingTutorialSlide {
  title: string;
  body: string;
  helper: string;
  kind: BankingTutorialSlideKind;
}

export interface BankingTutorial {
  id: string;
  title: string;
  shortTitle: string;
  accent: string;
  slides: BankingTutorialSlide[];
}

const COMMON_TUTORIALS: BankingTutorial[] = [
  {
    id: "credit-card-online",
    title: "HOW TO GET A CREDIT CARD 100% ONLINE, DIRECTLY FROM MOBILE BANKING",
    shortTitle: "Credit card online",
    accent: "#E2001A",
    slides: buildSlides(
      "Credit card online",
      "Choose the credit card offer, check the eligible amount, confirm the delivery address, and sign the request in the app.",
    ),
  },
  {
    id: "refund-credit-card",
    title: "HOW DO I REFUND CREDIT CARD AMOUNTS THROUGH MOBILE BANKING",
    shortTitle: "Credit card refund",
    accent: "#007A78",
    slides: buildSlides(
      "Credit card refund",
      "Open your credit card, choose refund, select the source account, review the amount, and confirm the payment.",
    ),
  },
  {
    id: "personal-loan-online",
    title: "HOW TO GET A PERSONAL ACHIEVEMENT LOAN 100% ONLINE, DIRECTLY FROM MOBILE BANKING",
    shortTitle: "Personal loan online",
    accent: "#334E68",
    slides: buildSlides(
      "Personal loan online",
      "Start from Products, review the simulation, add the required details, and sign the loan request from your phone.",
    ),
  },
  {
    id: "refinance-loan-card",
    title: "HOW TO REFINANCE A LOAN OR CREDIT CARD 100% ONLINE, DIRECTLY FROM MOBILE BANKING",
    shortTitle: "Refinancing",
    accent: "#7C3AED",
    slides: buildSlides(
      "Refinancing",
      "Compare the refinancing offer, add the loan or card you want to refinance, then review and sign the request.",
    ),
  },
  {
    id: "salary-transfer",
    title: "HOW DO I TRANSFER MY SALARY TO UNICREDIT BANK, DIRECTLY FROM MOBILE BANKING",
    shortTitle: "Salary transfer",
    accent: "#9A3412",
    slides: buildSlides(
      "Salary transfer",
      "Generate the salary transfer request, confirm your personal details, and send the signed document from Mobile Banking.",
    ),
  },
  {
    id: "virtual-card",
    title: "HOW TO ISSUE A VIRTUAL CARD, DIRECTLY FROM MOBILE BANKING",
    shortTitle: "Virtual card",
    accent: "#2563EB",
    slides: buildSlides(
      "Virtual card",
      "Select Cards, choose a virtual card, confirm the account and limits, and activate it immediately after signing.",
    ),
  },
  {
    id: "currency-exchange",
    title: "HOW TO EXCHANGE CURRENCY VIA MOBILE BANKING",
    shortTitle: "Currency exchange",
    accent: "#0F766E",
    slides: buildSlides(
      "Currency exchange",
      "Pick the source and destination accounts, review the exchange rate, and sign the conversion in the app.",
    ),
  },
  {
    id: "google-pay",
    title: "HOW TO ENROLL CARDS IN GOOGLE PAY",
    shortTitle: "Google Pay",
    accent: "#188038",
    slides: buildSlides(
      "Google Pay",
      "Open the card, choose Add to Google Pay, accept the terms, and finish the wallet activation on your device.",
    ),
  },
  {
    id: "apple-pay",
    title: "HOW TO ENROLL CARDS IN APPLE PAY",
    shortTitle: "Apple Pay",
    accent: "#262626",
    slides: buildSlides(
      "Apple Pay",
      "Open the card, choose Add to Apple Wallet, accept the terms, and finish the wallet activation on your device.",
    ),
  },
];

function buildSlides(topic: string, body: string): BankingTutorialSlide[] {
  return [
    {
      title: topic,
      body,
      helper: "Start from the relevant product area in Mobile Banking.",
      kind: "hero",
    },
    {
      title: "Choose the option",
      body: "Use the main action shown on the screen and follow the guided flow.",
      helper: "The app keeps the next step visible at the bottom of the screen.",
      kind: "checklist",
    },
    {
      title: "Review the details",
      body: "Check the amount, account, product details, terms, and personal information before continuing.",
      helper: "You can go back at any moment before signing.",
      kind: "checklist",
    },
    {
      title: "Sign securely",
      body: "Confirm the operation with the same secure authorization used for other Mobile Banking actions.",
      helper: "Sensitive actions stay inside the trusted app flow.",
      kind: "hero",
    },
    {
      title: "Done",
      body: "After confirmation, the app shows the result and keeps the document or request status available for review.",
      helper: "You can return to More and open another tutorial at any time.",
      kind: "confirmation",
    },
  ];
}

function withCountryOverrides(country: CountryId, tutorial: BankingTutorial): BankingTutorial {
  if (tutorial.id !== "currency-exchange") {
    return tutorial;
  }

  if (country === "RO") {
    return {
      ...tutorial,
      title: "HOW TO EXCHANGE CURRENCY AT THE BNR RATE VIA MOBILE BANKING",
      shortTitle: "BNR rate exchange",
      slides: buildSlides(
        "BNR rate exchange",
        "Pick the source and destination accounts, review the BNR exchange-rate screen, and sign the conversion in the app.",
      ),
    };
  }

  return tutorial;
}

export function getTutorialsForCountry(country: CountryId): BankingTutorial[] {
  return COMMON_TUTORIALS.map((tutorial) => withCountryOverrides(country, tutorial));
}
