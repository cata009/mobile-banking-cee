import { useMemo, useState, type UIEvent } from "react";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import activateAccountImage from "@/assets/products/detail/img_illustration_activateaccount.png";
import activateTokenImage from "@/assets/products/detail/img_illustration_activatetoken.png";
import blockingImage from "@/assets/products/detail/img_illustration_blocking.png";
import documentsImage from "@/assets/products/detail/img_illustration_documents.png";
import forgottenCredentialsImage from "@/assets/products/detail/img_illustration_forgottencredentials.png";
import homeInsuranceImage from "@/assets/products/detail/img_illustration_homeinsurance_RS.png";
import huMissingSecondaryIdentifierImage from "@/assets/products/detail/img_illustration_hu_missing_secondary_identifier.png";
import scanQrCodeImage from "@/assets/products/detail/img_illustration_scanqrcode.png";
import touchFaceIdImage from "@/assets/products/detail/img_illustration_touchfaceid.png";
import travelInsuranceImage from "@/assets/products/detail/img_illustration_travelinsurance_RS.png";

type ProductDetailImageKey =
  | "activate-account"
  | "activate-token"
  | "blocking"
  | "documents"
  | "forgotten-credentials"
  | "home-insurance"
  | "hu-missing-secondary-identifier"
  | "scan-qr-code"
  | "touch-face-id"
  | "travel-insurance";

interface ProductDetailContent {
  heading: string;
  body: readonly string[];
}

const PRODUCT_DETAIL_IMAGES: Record<ProductDetailImageKey, string> = {
  "activate-account": activateAccountImage,
  "activate-token": activateTokenImage,
  blocking: blockingImage,
  documents: documentsImage,
  "forgotten-credentials": forgottenCredentialsImage,
  "home-insurance": homeInsuranceImage,
  "hu-missing-secondary-identifier": huMissingSecondaryIdentifierImage,
  "scan-qr-code": scanQrCodeImage,
  "touch-face-id": touchFaceIdImage,
  "travel-insurance": travelInsuranceImage,
};

const PRODUCT_DETAIL_IMAGE_BY_OPTION: Record<string, ProductDetailImageKey> = {
  "branch-appointment": "documents",
  "car-insurance": "travel-insurance",
  "credit-card": "touch-face-id",
  "credit-card-consumer-financing": "touch-face-id",
  "current-account": "activate-account",
  "debit-card": "touch-face-id",
  "digital-activity-record": "documents",
  "genius-protect": "blocking",
  "home-insurance": "home-insurance",
  "life-insurance": "blocking",
  "mortgage-loan": "home-insurance",
  "mutual-funds": "hu-missing-secondary-identifier",
  "my-applications": "documents",
  "my-car": "travel-insurance",
  overdraft: "forgotten-credentials",
  "personal-loan": "activate-token",
  "round-up": "scan-qr-code",
  "saving-account": "activate-account",
  "service-requests": "documents",
  "start-invest": "hu-missing-secondary-identifier",
  "term-deposit": "activate-account",
  travel: "travel-insurance",
  "travel-insurance": "travel-insurance",
  umbrella: "blocking",
  "virtual-card": "scan-qr-code",
};

const PRODUCT_DETAIL_IMAGE_BY_CARD: Record<string, ProductDetailImageKey> = {
  account: "activate-account",
  cards: "touch-face-id",
  insurance: "travel-insurance",
  "investments-savings": "hu-missing-secondary-identifier",
  "mortgages-loans": "home-insurance",
  "additional-services": "documents",
  "market-hedging": "hu-missing-secondary-identifier",
  "partner-offers": "documents",
  shopsmart: "scan-qr-code",
};

const PRODUCT_DETAIL_CONTENT_BY_OPTION: Record<string, ProductDetailContent> = {
  "branch-appointment": {
    heading: "Plan the right visit before you go",
    body: [
      "Book time with a branch specialist for topics that need personal guidance, documents or a more detailed discussion.",
      "Choose the reason for the visit and prepare the next step so the meeting can stay focused and useful.",
    ],
  },
  "car-insurance": {
    heading: "Protection for your car and the road ahead",
    body: [
      "Explore car insurance options for everyday driving, unexpected damage and assistance when you need support on the road.",
      "Compare cover levels and important exclusions before moving into the official quote and document flow.",
    ],
  },
  "credit-card": {
    heading: "Flexible card spending with clear control",
    body: [
      "Use a credit card for purchases, reservations and larger expenses while keeping repayment and available limit visible in the app.",
      "Check card limits, fees, repayment rules and eligibility before starting the application.",
    ],
  },
  "credit-card-consumer-financing": {
    heading: "A credit card offer for planned flexibility",
    body: [
      "Review a credit card option designed for purchases where flexible repayment and available limit matter.",
      "The next step confirms pricing, repayment conditions, eligibility and required documents in the official flow.",
    ],
  },
  "current-account": {
    heading: "Built for everyday money movement",
    body: [
      "Use a current account as the base for salary, spending, transfers, standing payments and linked card services.",
      "Compare account conditions, digital banking features and the documents needed before continuing.",
    ],
  },
  "debit-card": {
    heading: "Pay directly from your account",
    body: [
      "A debit card helps you pay in stores, online and abroad while keeping spending connected to your current account balance.",
      "Review card type, limits, delivery options and wallet availability before ordering or replacing a card.",
    ],
  },
  "digital-activity-record": {
    heading: "Keep track of important digital actions",
    body: [
      "Digital activity records help you review selected app activity, requests and confirmations in one place.",
      "Use this area when you need to check what happened, when it happened and which channel was used.",
    ],
  },
  "genius-protect": {
    heading: "A practical safety layer for daily life",
    body: [
      "Explore protection options designed to help with common risks, claims and support moments.",
      "Review coverage, limits and exclusions carefully before starting the insurance request.",
    ],
  },
  "home-insurance": {
    heading: "Cover the place you call home",
    body: [
      "Home insurance can help protect your property, belongings and selected household risks.",
      "Compare cover levels, insured events and exclusions before continuing to a quote or application.",
    ],
  },
  "life-insurance": {
    heading: "Plan protection for the people who depend on you",
    body: [
      "Life insurance helps you prepare for serious events and protect long-term family plans.",
      "The next step confirms the insured amount, health questions, exclusions and official documents.",
    ],
  },
  "mortgage-loan": {
    heading: "Financing for a home purchase or renovation",
    body: [
      "Explore mortgage options when planning a property purchase, refinancing or a larger housing project.",
      "Review indicative terms, required documents and affordability checks before moving into the full application.",
    ],
  },
  "mutual-funds": {
    heading: "Invest with a diversified fund approach",
    body: [
      "Mutual funds can help spread investments across markets, asset classes or strategies in one product family.",
      "Review risk level, costs, documents and suitability requirements before investing.",
    ],
  },
  "my-applications": {
    heading: "Follow the requests you already started",
    body: [
      "Use My applications to return to product requests, check their status and continue where an application was left.",
      "This keeps draft requests, missing steps and final confirmations easier to find.",
    ],
  },
  "my-car": {
    heading: "Coverage shaped around your car",
    body: [
      "Review car protection options for damage, assistance and selected events that can interrupt daily mobility.",
      "Continue only after checking coverage details, claim rules and the final insurance documents.",
    ],
  },
  overdraft: {
    heading: "Extra flexibility when your balance is short",
    body: [
      "An overdraft can provide a reserve on your current account for short-term cash-flow gaps.",
      "Review the available limit, interest, fees and repayment expectations before applying.",
    ],
  },
  "personal-loan": {
    heading: "Borrow for a planned personal expense",
    body: [
      "A personal loan can support larger purchases, repairs or projects with a fixed repayment plan.",
      "Check the indicative amount, term, monthly payment and document requirements before continuing.",
    ],
  },
  "round-up": {
    heading: "Save small amounts from everyday payments",
    body: [
      "Round Up can set aside spare change from card payments and move it toward a selected saving goal.",
      "Choose the funding account, destination and rounding rule before activating the service.",
    ],
  },
  "saving-account": {
    heading: "Keep money aside while staying flexible",
    body: [
      "A saving account helps separate reserves from everyday spending while keeping access simple.",
      "Review interest, withdrawal rules and account conditions before opening the product.",
    ],
  },
  "service-requests": {
    heading: "Start a service request from the app",
    body: [
      "Service requests help you ask for account, card or banking changes without searching for the right branch channel.",
      "Select the request type and review the required information before submitting.",
    ],
  },
  "start-invest": {
    heading: "Begin with an investment starting point",
    body: [
      "Use this entry point when you want to explore investment products and understand the first steps.",
      "Suitability, risk profile, documents and final confirmation stay inside the official investment flow.",
    ],
  },
  "term-deposit": {
    heading: "Lock money for a defined period",
    body: [
      "A term deposit can help keep savings disciplined for a selected period with conditions known upfront.",
      "Review the term, interest, early withdrawal rules and maturity instructions before opening.",
    ],
  },
  travel: {
    heading: "Travel with coverage prepared in advance",
    body: [
      "Travel insurance can help with selected unexpected events before or during a trip.",
      "Review destination, travel dates, covered events and exclusions before buying coverage.",
    ],
  },
  "travel-insurance": {
    heading: "Travel with coverage prepared in advance",
    body: [
      "Travel insurance can help with selected unexpected events before or during a trip.",
      "Review destination, travel dates, covered events and exclusions before buying coverage.",
    ],
  },
  umbrella: {
    heading: "Wider protection for selected risks",
    body: [
      "Umbrella-style protection can group selected coverage needs under a broader insurance offer.",
      "Review covered events, limits and exclusions before continuing to the quote step.",
    ],
  },
  "virtual-card": {
    heading: "A card for safer digital purchases",
    body: [
      "A virtual card can be used for online payments without waiting for physical card delivery.",
      "Review how limits, card details and wallet activation work before creating it.",
    ],
  },
};

const PRODUCT_DETAIL_CONTENT_BY_CARD: Record<string, ProductDetailContent> = {
  account: {
    heading: "Choose the account setup that fits your everyday banking",
    body: [
      "Review account options for salary, payments, cards and digital banking services.",
      "Select a product to compare conditions and continue with the official request flow.",
    ],
  },
  cards: {
    heading: "Pick the right card for how you pay",
    body: [
      "Compare card options for daily spending, online purchases, travel and digital wallet use.",
      "Limits, pricing and eligibility are confirmed before the card is issued.",
    ],
  },
  insurance: {
    heading: "Prepare coverage for important everyday risks",
    body: [
      "Explore insurance options for home, travel, car and personal protection needs.",
      "Coverage details, limits and exclusions are confirmed in the official quote flow.",
    ],
  },
  "investments-savings": {
    heading: "Grow or protect money with a dedicated product",
    body: [
      "Review saving and investment options for reserves, future goals and longer-term planning.",
      "Risk, access rules, costs and documents are confirmed before any product is opened.",
    ],
  },
  "mortgages-loans": {
    heading: "Find borrowing options for larger plans",
    body: [
      "Explore loans and mortgage-related paths before choosing the amount, term and next step.",
      "Final approval depends on affordability, documents and eligibility checks.",
    ],
  },
  "additional-services": {
    heading: "Continue with useful banking services",
    body: [
      "Use additional services for appointments, application tracking and support requests.",
      "The next screen confirms what information is required and how the request is processed.",
    ],
  },
  "market-hedging": {
    heading: "Explore protection against market movement",
    body: [
      "Market-related products can help plan around currency, rate or investment exposure in selected situations.",
      "Specialist review, suitability and documents are required before continuing.",
    ],
  },
  "partner-offers": {
    heading: "Discover partner offers connected to banking",
    body: [
      "Partner offers can highlight selected benefits, discounts or services available through the banking ecosystem.",
      "Offer availability, rules and validity are confirmed before activation.",
    ],
  },
  shopsmart: {
    heading: "Find shopping benefits you can activate",
    body: [
      "ShopSmart offers can help you discover merchant benefits and track activated deals.",
      "Review offer rules, validity and partner details before activating.",
    ],
  },
};

export interface ProductDetailScreenProps {
  title: string;
  cardId?: string | null;
  optionId?: string | null;
  onBack: () => void;
  actionLabel?: string;
  includeSafeArea?: boolean;
  onActionClick?: () => void;
}

export function getProductDetailImageSrc(optionId?: string | null, cardId?: string | null) {
  const imageKey =
    (optionId ? PRODUCT_DETAIL_IMAGE_BY_OPTION[optionId] : undefined) ??
    (cardId ? PRODUCT_DETAIL_IMAGE_BY_CARD[cardId] : undefined) ??
    "activate-account";

  return PRODUCT_DETAIL_IMAGES[imageKey];
}

export function getProductDetailContent(optionId?: string | null, cardId?: string | null, title = "Product") {
  return (
    (optionId ? PRODUCT_DETAIL_CONTENT_BY_OPTION[optionId] : undefined) ??
    (cardId ? PRODUCT_DETAIL_CONTENT_BY_CARD[cardId] : undefined) ?? {
      heading: `Learn more about ${title}`,
      body: [
        "Review the main benefits, conditions and next steps before continuing.",
        "Eligibility, pricing and documents are confirmed in the official product flow.",
      ],
    }
  );
}

export default function ProductDetailScreen({
  title,
  cardId,
  optionId,
  onBack,
  actionLabel = "Find out more",
  includeSafeArea = true,
  onActionClick,
}: ProductDetailScreenProps) {
  const [headerProgress, setHeaderProgress] = useState(0);
  const imageSrc = useMemo(() => getProductDetailImageSrc(optionId, cardId), [cardId, optionId]);
  const content = useMemo(() => getProductDetailContent(optionId, cardId, title), [cardId, optionId, title]);

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  return (
    <div
      className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-product-detail-screen="true"
      data-product-detail-option={optionId ?? ""}
    >
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={title}
          onBack={onBack}
          collapsedTitleProgress={headerProgress}
          includeSafeArea={includeSafeArea}
        />

        <main className="px-[24px] pb-[24px] pt-[16px]">
          <div className="grid h-[160px] w-full place-items-center overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)]">
            <img
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              draggable={false}
              src={imageSrc}
            />
          </div>

          <h2 className="mt-[25px] text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
            {content.heading}
          </h2>

          <div className="mt-[24px] space-y-[22px] text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text)]">
            {content.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </main>
      </div>

      <div className="px-[24px] pb-[42px]">
        <PrimaryButton className="w-full" onClick={onActionClick}>
          {actionLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}
