import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  PointerEvent as ReactPointerEvent,
  UIEvent as ReactUIEvent,
} from "react";
import {
  defaultChatLabels,
  defaultInitialMessages,
  defaultReplyResolver,
  defaultSuggestedTopics,
} from "./defaults";
import {
  AddIcon,
  BackIcon,
  CameraIcon,
  CloseIcon,
  ConversationsIcon,
  DiscoveryModeIcon,
  FileAttachmentIcon,
  MicrophoneIcon,
  MoreIcon,
  PhotosIcon,
  SearchModeIcon,
  SendIcon,
  SuggestedTopicIcon,
  VoiceModeIcon,
} from "./icons";
import type {
  CoAppingChatLabels,
  CoAppingChatMessage,
  CoAppingReplyResolver,
  CoAppingSuggestedTopic,
} from "./types";

export interface CoAppingChatAssistantProps {
  onClose: () => void;
  labels?: Partial<CoAppingChatLabels>;
  initialMessages?: CoAppingChatMessage[];
  suggestedTopics?: CoAppingSuggestedTopic[];
  resolveReply?: CoAppingReplyResolver;
  typingDelayMs?: number;
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function ScrollTopIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 4.25L4.75 9.5L5.95 10.7L9.15 7.5V15.75H10.85V7.5L14.05 10.7L15.25 9.5L10 4.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ScrollBottomIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 15.75L15.25 10.5L14.05 9.3L10.85 12.5V4.25H9.15V12.5L5.95 9.3L4.75 10.5L10 15.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ThumbsUpFeedbackIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M5.45 6.58L7.96 2.5C8.18 2.13 8.59 1.92 9.02 1.96C9.68 2.02 10.13 2.66 9.96 3.3L9.38 5.5H12.42C13.18 5.5 13.75 6.2 13.6 6.94L12.78 11.02C12.61 11.88 11.86 12.5 10.98 12.5H6.25C5.81 12.5 5.45 12.14 5.45 11.7V6.58ZM2.25 6.25H4.25V12.5H2.25V6.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ThumbsDownFeedbackIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10.55 9.42L8.04 13.5C7.82 13.87 7.41 14.08 6.98 14.04C6.32 13.98 5.87 13.34 6.04 12.7L6.62 10.5H3.58C2.82 10.5 2.25 9.8 2.4 9.06L3.22 4.98C3.39 4.12 4.14 3.5 5.02 3.5H9.75C10.19 3.5 10.55 3.86 10.55 4.3V9.42ZM11.75 3.5H13.75V9.75H11.75V3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BubbleMessage({ message }: { message: CoAppingChatMessage }) {
  const isAgent = message.role === "agent";

  if (isAgent) {
    return (
      <div className="mpc-message mpc-message-agent">
        <div className="mpc-agent-copy">{message.text}</div>
        <div className="mpc-agent-meta">
          <div className="mpc-response-feedback" aria-label="Response feedback">
            <button type="button" className="mpc-feedback-button" aria-label="Good response">
              <ThumbsUpFeedbackIcon />
            </button>
            <button type="button" className="mpc-feedback-button" aria-label="Bad response">
              <ThumbsDownFeedbackIcon />
            </button>
          </div>
          <div className="mpc-message-time mpc-message-time-agent">{message.time}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mpc-message mpc-message-user">
      <div className="mpc-bubble mpc-bubble-user">{message.text}</div>
      <div className="mpc-message-time">{message.time}</div>
    </div>
  );
}

const fallbackConversationMessages: CoAppingChatMessage[] = [
  {
    id: "intro-hi",
    role: "agent",
    text: "Hi Mihai!",
    time: "10:00",
  },
  {
    id: "intro-help",
    role: "agent",
    text:
      "I am your Smart Assistant. I can help you understand this banking simulation, products, payments, cards, and security options.",
    time: "10:00",
  },
];

const mockedConversationHistories: Array<{
  id: string;
  title: string;
  subtitle: string;
  messages: CoAppingChatMessage[];
}> = [
  {
    id: "payments-help",
    title: "How do payments work?",
    subtitle: "Yesterday at 17:45",
    messages: [
      {
        id: "payments-user-1",
        role: "user",
        text: "How do payments work in this Czech future preview?",
        time: "17:41",
      },
      {
        id: "payments-agent-1",
        role: "agent",
        text:
          "Payments start from the Payments tab. You can choose a new transfer, fill beneficiary details, review fees and limits, then authorize with the standard signing step before the payment is submitted.",
        time: "17:42",
      },
      {
        id: "payments-user-2",
        role: "user",
        text: "Can I save a payment as a template after sending it?",
        time: "17:44",
      },
      {
        id: "payments-agent-2",
        role: "agent",
        text:
          "Yes. After a successful transfer, the journey can expose template creation when the payment type supports it. The template then becomes available from Payments for repeated use.",
        time: "17:45",
      },
    ],
  },
  {
    id: "investment-advice",
    title: "Investment advice for my savings",
    subtitle: "Monday at 09:52",
    messages: [
      {
        id: "investments-user-1",
        role: "user",
        text:
          "I have some savings and I want advice before I start investing. What should I check in the app?",
        time: "09:16",
      },
      {
        id: "investments-agent-1",
        role: "agent",
        text:
          "I can help you prepare, but this is not personal financial advice. A good first step is to decide what the money is for, when you may need it, and how much risk you are comfortable with.",
        time: "09:18",
      },
      {
        id: "investments-user-2",
        role: "user",
        text: "I am thinking about a longer term goal, not money I need this month.",
        time: "09:21",
      },
      {
        id: "investments-agent-2",
        role: "agent",
        text:
          "For a longer term goal, review three things before choosing a product: your emergency reserve, the time horizon, and whether you prefer lower volatility or potential higher return. In the Investments area you can compare portfolio value, product type, currency exposure, and historical performance.",
        time: "09:24",
      },
      {
        id: "investments-user-3",
        role: "user",
        text: "Can you take me to the right place?",
        time: "09:31",
      },
      {
        id: "investments-agent-3",
        role: "agent",
        text:
          "Yes. Open Investments to review your portfolio, available funds, product type distribution, and investment history. Placeholder action: Go to Investments. A deeper contextual link can be wired later when the final destination contract is defined.",
        time: "09:34",
      },
      {
        id: "investments-user-4",
        role: "user",
        text:
          "Before I open it, can you explain what I should compare there? I do not want to choose only because one fund had a good recent month.",
        time: "09:38",
      },
      {
        id: "investments-agent-4",
        role: "agent",
        text:
          "That is a good instinct. Recent performance can be useful context, but it should not be the only reason to pick a product. Start with the objective: emergency reserve, short-term purchase, medium-term goal, or long-term growth. Then compare the risk profile, expected holding period, currency, product category, and whether the investment can move up and down in value. If the money may be needed soon, a lower-volatility option is usually easier to live with than a product that can fluctuate strongly.",
        time: "09:40",
      },
      {
        id: "investments-user-5",
        role: "user",
        text: "What about fees and recurring investing? I might add a smaller amount each month.",
        time: "09:43",
      },
      {
        id: "investments-agent-5",
        role: "agent",
        text:
          "Check the product documents and fee information before committing. A recurring investment can help avoid trying to guess the perfect entry day, but the user still needs to understand that every recurring order buys at the market conditions available at that time. In the app, the assistant could guide you to compare fund category, current value, historical evolution, currency exposure, and whether the product supports one-off or recurrent orders.",
        time: "09:45",
      },
      {
        id: "investments-user-6",
        role: "user",
        text: "If I already have some products, what should I review first?",
        time: "09:47",
      },
      {
        id: "investments-agent-6",
        role: "agent",
        text:
          "Review the portfolio summary first. Look at total value, performance, product type distribution, and currency distribution. If one category is much larger than expected, it may mean the portfolio is more concentrated than you intended. Then open the product list to see each position individually: amount, currency, gain or loss, order type, and whether there are pending orders waiting for approval. The goal is not to overload the user with advice, but to make the decision path clear: understand your goal, understand the product, review risk, then decide.",
        time: "09:49",
      },
      {
        id: "investments-agent-7",
        role: "agent",
        text:
          "Suggested next step: open Investments and start from the Performance tab. From there, review Product Type and Currency tabs before opening any single fund. Future deep link placeholder: app://investments/overview?source=smart-assistant&topic=investment-readiness. This can later route directly to the investment overview once the navigation contract is finalized.",
        time: "09:52",
      },
    ],
  },
  {
    id: "card-security",
    title: "Is my card secure?",
    subtitle: "28 Jun at 12:10",
    messages: [
      {
        id: "security-user-1",
        role: "user",
        text: "Is my card secure if I use it online?",
        time: "12:05",
      },
      {
        id: "security-agent-1",
        role: "agent",
        text:
          "Card security depends on active controls such as online payments, contactless payments, temporary block, card limits, and transaction notifications. The card details page should make these actions visible and easy to verify.",
        time: "12:06",
      },
      {
        id: "security-user-2",
        role: "user",
        text: "What should I do if I suspect fraud?",
        time: "12:08",
      },
      {
        id: "security-agent-2",
        role: "agent",
        text:
          "Block the card first, review recent transactions, then contact support. A future assistant can guide the user to the right card action without replacing the actual authorization and servicing flow.",
        time: "12:10",
      },
    ],
  },
  {
    id: "spending-insights",
    title: "Explain spending insights",
    subtitle: "26 Jun at 18:05",
    messages: [
      {
        id: "insights-user-1",
        role: "user",
        text: "Explain spending insights and why my monthly budget changed.",
        time: "18:00",
      },
      {
        id: "insights-agent-1",
        role: "agent",
        text:
          "Spending insights compare current transactions with previous patterns. The assistant should mention categories, recurring payments, upcoming obligations, and any unusually large card payments that affect available balance.",
        time: "18:02",
      },
      {
        id: "insights-user-2",
        role: "user",
        text: "Can it point me to subscriptions?",
        time: "18:04",
      },
      {
        id: "insights-agent-2",
        role: "agent",
        text:
          "Yes. Subscriptions and recurrent payments are useful discovery prompts because they connect spending analytics with a clear next action: review, pause, update, or cancel where supported.",
        time: "18:05",
      },
    ],
  },
  {
    id: "balance-difference",
    title: "Why is my balance different?",
    subtitle: "20 Jun at 08:55",
    messages: [
      {
        id: "balance-user-1",
        role: "user",
        text: "Why is my available balance different from total account balance?",
        time: "08:51",
      },
      {
        id: "balance-agent-1",
        role: "agent",
        text:
          "Available balance can differ when card reservations, pending payments, blocked amounts, or overdraft rules are applied. The assistant can explain the difference and point to transaction details for evidence.",
        time: "08:53",
      },
      {
        id: "balance-user-2",
        role: "user",
        text: "Should pending card transactions be included in the explanation?",
        time: "08:54",
      },
      {
        id: "balance-agent-2",
        role: "agent",
        text:
          "Yes. Pending card transactions are often the clearest reason for the difference, so they should be shown before less common causes like reserved funds or manual account restrictions.",
        time: "08:55",
      },
    ],
  },
  {
    id: "travel-budget",
    title: "Can I set a travel budget before my trip?",
    subtitle: "18 Jun at 19:30",
    messages: [
      {
        id: "travel-user-1",
        role: "user",
        text: "I am travelling next month and want to avoid overspending. Can the app help me set a budget?",
        time: "19:22",
      },
      {
        id: "travel-agent-1",
        role: "agent",
        text:
          "Yes. Start by checking your available balance, expected card payments, and recurring payments due during the trip. Then set a temporary card limit that matches the amount you are comfortable spending.",
        time: "19:24",
      },
      {
        id: "travel-user-2",
        role: "user",
        text: "Should I change the limit only for the travel days?",
        time: "19:27",
      },
      {
        id: "travel-agent-2",
        role: "agent",
        text:
          "That is the cleanest approach. Use a temporary limit for the trip, keep notifications on, and review currency conversion fees before using the card abroad.",
        time: "19:30",
      },
    ],
  },
  {
    id: "lost-card",
    title: "What should I do if I lose my card?",
    subtitle: "17 Jun at 21:15",
    messages: [
      {
        id: "lost-card-user-1",
        role: "user",
        text: "I cannot find my card. What should I do first?",
        time: "21:10",
      },
      {
        id: "lost-card-agent-1",
        role: "agent",
        text:
          "Freeze or block the card first so it cannot be used. Then check recent transactions and contact support if anything looks unfamiliar.",
        time: "21:11",
      },
      {
        id: "lost-card-user-2",
        role: "user",
        text: "Can I unblock it if I find it later?",
        time: "21:13",
      },
      {
        id: "lost-card-agent-2",
        role: "agent",
        text:
          "If the app exposes a temporary freeze, you can usually unfreeze it. If the card was permanently blocked, a replacement flow is normally required.",
        time: "21:15",
      },
    ],
  },
  {
    id: "cashback-offers",
    title: "Which offers are worth activating?",
    subtitle: "16 Jun at 18:20",
    messages: [
      {
        id: "offers-user-1",
        role: "user",
        text: "I see many offers. How do I know which ones are worth activating?",
        time: "18:14",
      },
      {
        id: "offers-agent-1",
        role: "agent",
        text:
          "Look for offers that match planned purchases rather than creating new spending. Check the merchant, cashback percentage, minimum amount, expiry date, and whether online or physical-store purchases are eligible.",
        time: "18:16",
      },
      {
        id: "offers-user-2",
        role: "user",
        text: "Can you show offers close to me?",
        time: "18:19",
      },
      {
        id: "offers-agent-2",
        role: "agent",
        text:
          "Yes. A future assistant can filter offers by location, category, active status, and expiry. For now, open Products > ShopSmart and use filters to narrow the list.",
        time: "18:20",
      },
    ],
  },
  {
    id: "loan-repayment",
    title: "Can I repay part of my loan early?",
    subtitle: "14 Jun at 16:05",
    messages: [
      {
        id: "loan-user-1",
        role: "user",
        text: "Can I repay part of my loan early and reduce future costs?",
        time: "15:58",
      },
      {
        id: "loan-agent-1",
        role: "agent",
        text:
          "Partial early repayment can reduce interest, but you should review the loan type, remaining amount, fees, and whether the repayment changes the installment or the duration.",
        time: "16:00",
      },
      {
        id: "loan-user-2",
        role: "user",
        text: "Where should I look in the app?",
        time: "16:03",
      },
      {
        id: "loan-agent-2",
        role: "agent",
        text:
          "Open the loan detail page first. The assistant can later route directly to repayment options once the product contract and eligible loan rules are confirmed.",
        time: "16:05",
      },
    ],
  },
  {
    id: "subscription-audit",
    title: "Help me find subscriptions in my spending",
    subtitle: "12 Jun at 09:45",
    messages: [
      {
        id: "subs-user-1",
        role: "user",
        text: "I want to find subscriptions I may have forgotten about.",
        time: "09:39",
      },
      {
        id: "subs-agent-1",
        role: "agent",
        text:
          "Start from recurring card payments and repeated merchants. Look for monthly amounts with similar descriptions, then decide whether to keep, update, or cancel them outside the banking app when needed.",
        time: "09:41",
      },
      {
        id: "subs-user-2",
        role: "user",
        text: "Can I see only entertainment subscriptions?",
        time: "09:44",
      },
      {
        id: "subs-agent-2",
        role: "agent",
        text:
          "Yes, once categories are available. The assistant can combine merchant names, categories, and recurring cadence to surface a focused list.",
        time: "09:45",
      },
    ],
  },
  {
    id: "monthly-savings",
    title: "How much should I move to savings monthly?",
    subtitle: "10 Jun at 11:30",
    messages: [
      {
        id: "saving-user-1",
        role: "user",
        text: "I want to save every month but I do not know what amount is realistic.",
        time: "11:22",
      },
      {
        id: "saving-agent-1",
        role: "agent",
        text:
          "A useful starting point is to review income, fixed costs, subscriptions, and average card spending. Then choose an amount that still leaves a buffer for unexpected expenses.",
        time: "11:24",
      },
      {
        id: "saving-user-2",
        role: "user",
        text: "Can the app remind me?",
        time: "11:29",
      },
      {
        id: "saving-agent-2",
        role: "agent",
        text:
          "Yes. Use recurring savings or a standing order where available. A future assistant can suggest an amount based on spending history and account balance patterns.",
        time: "11:30",
      },
    ],
  },
  {
    id: "card-limit-weekend",
    title: "Can I change my card limits for one weekend?",
    subtitle: "8 Jun at 19:40",
    messages: [
      {
        id: "limit-user-1",
        role: "user",
        text: "I need a higher card limit this weekend. Can I make it temporary?",
        time: "19:34",
      },
      {
        id: "limit-agent-1",
        role: "agent",
        text:
          "Temporary limits are safer than permanent changes when the higher amount is only needed for a short period. Check card limits, set the amount, and confirm the duration before authorizing.",
        time: "19:36",
      },
      {
        id: "limit-user-2",
        role: "user",
        text: "Should online and ATM limits be separate?",
        time: "19:39",
      },
      {
        id: "limit-agent-2",
        role: "agent",
        text:
          "Yes. Keep only the limit you actually need increased. If the purchase is online, avoid raising ATM withdrawal limits at the same time.",
        time: "19:40",
      },
    ],
  },
  {
    id: "standing-order",
    title: "Set up regular rent payment",
    subtitle: "6 Jun at 14:05",
    messages: [
      {
        id: "order-user-1",
        role: "user",
        text: "I pay rent every month. Should I use a template or a standing order?",
        time: "13:58",
      },
      {
        id: "order-agent-1",
        role: "agent",
        text:
          "Use a standing order when the amount and date are predictable. Use a template when you want to review and manually send each payment.",
        time: "14:00",
      },
      {
        id: "order-user-2",
        role: "user",
        text: "Can I still change it later?",
        time: "14:04",
      },
      {
        id: "order-agent-2",
        role: "agent",
        text:
          "Yes. You should be able to review, edit, pause, or cancel regular payment instructions from the payments management area.",
        time: "14:05",
      },
    ],
  },
  {
    id: "documents-confirmation",
    title: "Where can I find confirmation documents?",
    subtitle: "4 Jun at 10:10",
    messages: [
      {
        id: "docs-user-1",
        role: "user",
        text: "I need confirmation for a payment I made last week.",
        time: "10:05",
      },
      {
        id: "docs-agent-1",
        role: "agent",
        text:
          "Open transaction history, find the payment, and look for details or document actions. If the confirmation is generated, it should also be available in Documents.",
        time: "10:07",
      },
      {
        id: "docs-user-2",
        role: "user",
        text: "Can I share it from the app?",
        time: "10:09",
      },
      {
        id: "docs-agent-2",
        role: "agent",
        text:
          "Yes, when the share action is available. The assistant should not expose documents directly, but it can guide the user to the correct source.",
        time: "10:10",
      },
    ],
  },
  {
    id: "exchange-fees",
    title: "Will I pay fees abroad?",
    subtitle: "2 Jun at 13:25",
    messages: [
      {
        id: "fees-user-1",
        role: "user",
        text: "Will I pay fees if I use my card abroad?",
        time: "13:18",
      },
      {
        id: "fees-agent-1",
        role: "agent",
        text:
          "It depends on card type, currency conversion, ATM usage, and merchant choice. Before traveling, review fees, exchange rates, and whether the merchant offers dynamic currency conversion.",
        time: "13:20",
      },
      {
        id: "fees-user-2",
        role: "user",
        text: "Should I pay in local currency?",
        time: "13:23",
      },
      {
        id: "fees-agent-2",
        role: "agent",
        text:
          "In many cases, paying in local currency avoids merchant conversion markup. The app can explain this as guidance, while the final fee information should come from official pricing documents.",
        time: "13:25",
      },
    ],
  },
];

const suggestedTopicIconVariants = ["payments", "offers", "security", "insights"] as const;
type AttachmentSource = "camera" | "photos" | "files";
type VoiceCaptureStatus = "idle" | "recording" | "transcribing";

const discoveryHero = {
  eyebrow: "Featured for Czech customers",
  title: "Build an investment habit without leaving daily banking",
  body: "Explore low-friction ways to move from idle savings into a planned portfolio, with risk checks before any product step.",
  image:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=760&q=80",
  tag: "Investments",
};

const discoveryPromos = [
  {
    id: "travel-card-controls",
    title: "Travel with card controls ready",
    body: "Review limits, freeze options, and card security before the next trip.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=420&q=80",
    tag: "Cards",
  },
  {
    id: "subscriptions",
    title: "Find subscriptions before they renew",
    body: "Spot recurring payments and decide what to keep, pause, or review.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=420&q=80",
    tag: "Spending",
  },
];

const discoveryArticles = [
  {
    id: "emergency-buffer",
    title: "How much cash should stay outside investments?",
    meta: "3 min read",
    icon: "security" as const,
  },
  {
    id: "card-safety",
    title: "Five card settings worth checking after payday",
    meta: "Security guide",
    icon: "payments" as const,
  },
  {
    id: "offers",
    title: "Product offers that match active banking moments",
    meta: "Personalized ideas",
    icon: "offers" as const,
  },
];

function DiscoveryFeed() {
  return (
    <div className="mpc-discovery-feed">
      <button type="button" className="mpc-discovery-hero">
        <img src={discoveryHero.image} alt="" loading="lazy" />
        <span className="mpc-discovery-hero-shade" />
        <span className="mpc-discovery-chip">{discoveryHero.tag}</span>
        <span className="mpc-discovery-hero-copy">
          <span>{discoveryHero.eyebrow}</span>
          <strong>{discoveryHero.title}</strong>
          <small>{discoveryHero.body}</small>
        </span>
      </button>

      <div className="mpc-discovery-section-head">
        <strong>Recommended next</strong>
        <span>Banking prompts and product stories</span>
      </div>

      <div className="mpc-discovery-promo-grid">
        {discoveryPromos.map((promo) => (
          <button key={promo.id} type="button" className="mpc-discovery-promo">
            <img src={promo.image} alt="" loading="lazy" />
            <span className="mpc-discovery-promo-copy">
              <small>{promo.tag}</small>
              <strong>{promo.title}</strong>
              <span>{promo.body}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mpc-discovery-section-head mpc-discovery-section-head-tight">
        <strong>Useful reads</strong>
      </div>

      <div className="mpc-discovery-article-list">
        {discoveryArticles.map((article) => (
          <button key={article.id} type="button" className="mpc-discovery-article">
            <span className="mpc-discovery-article-icon">
              <SuggestedTopicIcon variant={article.icon} />
            </span>
            <span>
              <strong>{article.title}</strong>
              <small>{article.meta}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

export function CoAppingChatAssistant({
  onClose,
  labels,
  initialMessages = defaultInitialMessages,
  suggestedTopics = defaultSuggestedTopics,
  resolveReply = defaultReplyResolver,
  typingDelayMs = 650,
}: CoAppingChatAssistantProps) {
  const mergedLabels = { ...defaultChatLabels, ...labels };
  const savedConversationMessagesRef = useRef<CoAppingChatMessage[]>(
    initialMessages.length > 0 ? initialMessages : fallbackConversationMessages,
  );
  const [messages, setMessages] = useState<CoAppingChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<"search" | "discovery">("search");
  const [conversationSearch, setConversationSearch] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>("idle");
  const [showConversationScrollTop, setShowConversationScrollTop] = useState(false);
  const [showChatScrollBottom, setShowChatScrollBottom] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const dragStartYRef = useRef(0);
  const conversationListRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const photosInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const voiceCaptureActiveRef = useRef(false);
  const voiceChunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
      try {
        speechRecognitionRef.current?.abort();
      } catch {
        // Browser speech APIs may throw if abort is called after auto-stop.
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!isConversationListOpen) {
      setShowConversationScrollTop(false);
      return;
    }

    conversationListRef.current?.scrollTo({ top: 0 });
    setShowConversationScrollTop(false);
  }, [conversationSearch, isConversationListOpen]);

  const requestClose = () => {
    if (isClosing) return;
    cancelVoiceCapture();
    setIsMoreMenuOpen(false);
    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, 220);
  };

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragY(Math.max(0, event.clientY - dragStartYRef.current));
  };

  const handleDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);

    const finalDragY = Math.max(0, event.clientY - dragStartYRef.current);
    setDragY(finalDragY);

    if (finalDragY > 96) {
      requestClose();
      return;
    }

    setDragY(0);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: CoAppingChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      time: getCurrentTime(),
    };

    const nextMessages = [...messages, userMessage];
    setIsConversationListOpen(false);
    setMessages(nextMessages);
    setDraft("");
    setIsVoiceMode(false);
    setIsAttachmentMenuOpen(false);
    setIsMoreMenuOpen(false);
    setVoiceStatus("idle");
    setIsTyping(true);

    timeoutRef.current = window.setTimeout(async () => {
      const resolvedText = await resolveReply(trimmed, nextMessages);
      const reply: CoAppingChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        text: resolvedText,
        time: getCurrentTime(),
      };
      setMessages((currentMessages) => [...currentMessages, reply]);
      setIsTyping(false);
      timeoutRef.current = null;
    }, typingDelayMs);
  };

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const resetVoiceRefs = () => {
    speechRecognitionRef.current = null;
    mediaRecorderRef.current = null;
    voiceChunksRef.current = [];
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
  };

  const completeVoiceCapture = (options?: { showFallback?: boolean }) => {
    if (!voiceCaptureActiveRef.current) return;

    voiceCaptureActiveRef.current = false;
    const transcript = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim().replace(/\s+/g, " ");

    stopMediaStream();
    resetVoiceRefs();
    setVoiceStatus("idle");
    setIsVoiceMode(false);

    if (transcript) {
      sendMessage(transcript);
      return;
    }

    if (options?.showFallback) {
      setDraft("Voice recorded, but I could not transcribe it. Try again in English.");
    }
  };

  const cancelVoiceCapture = () => {
    if (!voiceCaptureActiveRef.current && voiceStatus === "idle") return;

    voiceCaptureActiveRef.current = false;
    try {
      speechRecognitionRef.current?.abort();
    } catch {
      // Ignore browser speech API lifecycle races.
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    stopMediaStream();
    resetVoiceRefs();
    setVoiceStatus("idle");
    setIsVoiceMode(false);
  };

  const stopVoiceCapture = () => {
    if (!voiceCaptureActiveRef.current) return;

    setVoiceStatus("transcribing");

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        completeVoiceCapture({ showFallback: true });
      }
      return;
    }

    completeVoiceCapture({ showFallback: true });
  };

  const startVoiceCapture = async () => {
    if (voiceCaptureActiveRef.current || isTyping) return;

    cancelVoiceCapture();
    setIsAttachmentMenuOpen(false);
    setIsConversationListOpen(false);
    setDraft("");
    setIsVoiceMode(true);
    setVoiceStatus("recording");
    voiceCaptureActiveRef.current = true;
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    voiceChunksRef.current = [];

    let hasAudioCapture = false;

    try {
      const mediaStream = await navigator.mediaDevices?.getUserMedia?.({ audio: true });
      if (mediaStream) {
        hasAudioCapture = true;
        mediaStreamRef.current = mediaStream;
        const recorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            voiceChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = stopMediaStream;
        recorder.start();
      }
    } catch {
      hasAudioCapture = false;
    }

    const RecognitionConstructor = getSpeechRecognitionConstructor();
    if (RecognitionConstructor) {
      try {
        const recognition = new RecognitionConstructor();
        speechRecognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (event) => {
          let finalText = finalTranscriptRef.current;
          let interimText = "";

          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcriptPart = result[0]?.transcript ?? "";

            if (result.isFinal) {
              finalText = `${finalText} ${transcriptPart}`.trim();
            } else {
              interimText = `${interimText} ${transcriptPart}`.trim();
            }
          }

          finalTranscriptRef.current = finalText;
          interimTranscriptRef.current = interimText;
          setDraft(`${finalText} ${interimText}`.trim());
        };
        recognition.onerror = (event) => {
          if (!voiceCaptureActiveRef.current) return;

          voiceCaptureActiveRef.current = false;
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
          }
          stopMediaStream();
          resetVoiceRefs();
          setVoiceStatus("idle");
          setIsVoiceMode(false);
          setDraft(
            event.error === "no-speech"
              ? "I could not hear that. Try again in English."
              : "Voice recognition is not available. Try typing your question.",
          );
        };
        recognition.onend = () => completeVoiceCapture({ showFallback: hasAudioCapture });
        recognition.start();
        return;
      } catch {
        speechRecognitionRef.current = null;
      }
    }

    if (!hasAudioCapture) {
      voiceCaptureActiveRef.current = false;
      setVoiceStatus("idle");
      setIsVoiceMode(false);
      setDraft("Voice recording is not supported in this browser.");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (value.trim() && voiceStatus === "idle") setIsVoiceMode(false);
  };

  const resetAttachmentInput = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.value = "";
  };

  const handleConversationListScroll = () => {
    const list = conversationListRef.current;
    setShowConversationScrollTop(Boolean(list && list.scrollTop > 32));
  };

  const scrollConversationListToTop = () => {
    conversationListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setShowConversationScrollTop(false);
  };

  const handleChatScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    const node = event.currentTarget;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    setShowChatScrollBottom(distanceFromBottom > 96);
  };

  const scrollChatToBottom = () => {
    const node = chatScrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    setShowChatScrollBottom(false);
  };

  const handleAttachmentChoice = (source: AttachmentSource) => {
    setIsAttachmentMenuOpen(false);

    const input =
      source === "camera" ? cameraInputRef.current : source === "photos" ? photosInputRef.current : filesInputRef.current;

    window.setTimeout(() => input?.click(), 0);
  };

  const resetPendingReply = () => {
    cancelVoiceCapture();
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTyping(false);
  };

  const startNewConversation = () => {
    resetPendingReply();
    setMessages([]);
    setDraft("");
    setIsVoiceMode(false);
    setIsAttachmentMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsConversationListOpen(false);
    setAssistantMode("search");
  };

  const openSavedConversation = () => {
    resetPendingReply();
    setMessages(savedConversationMessagesRef.current);
    setDraft("");
    setIsVoiceMode(false);
    setIsAttachmentMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsConversationListOpen(false);
  };

  const getConversationTitle = (conversationMessages: CoAppingChatMessage[], fallbackTitle: string) => {
    return conversationMessages.find((message) => message.role === "user")?.text ?? fallbackTitle;
  };

  const getConversationTimeLabel = (conversationMessages: CoAppingChatMessage[]) => {
    return conversationMessages[conversationMessages.length - 1]?.time
      ? conversationMessages[conversationMessages.length - 1].time
      : "No messages yet";
  };

  const conversationItems = [
    ...(messages.length > 0
      ? [
          {
            id: "current",
            title: getConversationTitle(messages, "Current conversation"),
            subtitle: getConversationTimeLabel(messages),
            searchText: messages.map((message) => message.text).join(" "),
            onClick: () => setIsConversationListOpen(false),
          },
        ]
      : []),
    {
      id: "intro",
      title: getConversationTitle(savedConversationMessagesRef.current, "Smart Assistant intro"),
      subtitle: getConversationTimeLabel(savedConversationMessagesRef.current),
      searchText: savedConversationMessagesRef.current.map((message) => message.text).join(" "),
      onClick: openSavedConversation,
    },
    ...mockedConversationHistories.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      subtitle: conversation.subtitle,
      searchText: conversation.messages.map((message) => message.text).join(" "),
      onClick: () => {
        resetPendingReply();
        setMessages(conversation.messages);
        setDraft("");
        setIsVoiceMode(false);
        setIsAttachmentMenuOpen(false);
        setIsMoreMenuOpen(false);
        setIsConversationListOpen(false);
      },
    })),
  ].filter((item) => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) return true;
    return `${item.title} ${item.subtitle} ${item.searchText}`.toLowerCase().includes(query);
  });

  const isDraftEmpty = draft.trim().length === 0;
  const isVoiceCaptureActive = voiceStatus !== "idle";
  const showVoiceAction = isDraftEmpty || isVoiceCaptureActive;
  const isDiscoveryMode = assistantMode === "discovery";
  const inputPlaceholder =
    voiceStatus === "recording"
      ? "Listening... speak in English"
      : voiceStatus === "transcribing"
        ? "Parsing voice..."
        : isVoiceMode
          ? "Listening..."
          : mergedLabels.inputPlaceholder;
  const showSuggestedTopics = messages.length === 0 && !isTyping && !isConversationListOpen && !isDiscoveryMode;
  const hasActiveConversation = messages.length > 0;
  const isConversationDetailOpen = !isConversationListOpen && !isDiscoveryMode && hasActiveConversation;
  const isNewConversationOpen = !isConversationListOpen && !isDiscoveryMode && !hasActiveConversation;
  const lastMessageId = messages[messages.length - 1]?.id ?? "";
  const sheetStyle = { "--mpc-sheet-offset": `${dragY}px` } as CSSProperties;

  useEffect(() => {
    if (!isConversationDetailOpen) {
      setShowChatScrollBottom(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const node = chatScrollRef.current;
      if (!node) return;
      node.scrollTo({ top: node.scrollHeight, behavior: "auto" });
      setShowChatScrollBottom(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isConversationDetailOpen, isTyping, lastMessageId]);

  return (
    <section
      className={[
        "mpc-chat-assistant",
        isClosing ? "mpc-chat-assistant-closing" : "",
        isDragging ? "mpc-chat-assistant-dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={sheetStyle}
      aria-label="Co-apping AI chat"
    >
      <div
        className="mpc-sheet-grabber"
        aria-label="Drag down to close chat"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <span />
      </div>
      <header className="mpc-chat-header">
        <div className="mpc-chat-header-row">
          {isConversationDetailOpen ? (
            <button
              type="button"
              onClick={() => {
                setIsMoreMenuOpen(false);
                setIsConversationListOpen(true);
              }}
              className="mpc-chat-control-button"
              aria-label="Back to conversations"
            >
              <BackIcon />
            </button>
          ) : isNewConversationOpen ? (
            <button
              type="button"
              onClick={requestClose}
              className="mpc-chat-control-button"
              aria-label="Back to app"
            >
              <BackIcon />
            </button>
          ) : (
            <span className="mpc-chat-control-spacer" aria-hidden="true" />
          )}

          <div className="mpc-mode-segment" aria-label="Assistant mode">
            <button
              type="button"
              onClick={() => {
                setAssistantMode("search");
                setIsMoreMenuOpen(false);
                setIsConversationListOpen(false);
              }}
              className={["mpc-mode-button", assistantMode === "search" ? "mpc-mode-button-active" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-label="Search mode"
              aria-pressed={assistantMode === "search"}
            >
              <SearchModeIcon />
            </button>
            <button
              type="button"
              onClick={() => {
                setAssistantMode("discovery");
                setIsConversationListOpen(false);
                setIsAttachmentMenuOpen(false);
                setIsMoreMenuOpen(false);
                cancelVoiceCapture();
              }}
              className={["mpc-mode-button", assistantMode === "discovery" ? "mpc-mode-button-active" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-label="Discovery mode"
              aria-pressed={assistantMode === "discovery"}
            >
              <DiscoveryModeIcon />
            </button>
          </div>

          {isConversationDetailOpen ? (
            <div className="mpc-more-menu-anchor">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen((isOpen) => !isOpen)}
                className={["mpc-chat-control-button", isMoreMenuOpen ? "mpc-chat-control-button-active" : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-label="More options"
                aria-expanded={isMoreMenuOpen}
                aria-haspopup="menu"
              >
                <MoreIcon />
              </button>
              {isMoreMenuOpen ? (
                <div className="mpc-more-menu" role="menu" aria-label="Conversation options">
                  <button type="button" role="menuitem" className="mpc-more-menu-item">
                    Share
                  </button>
                  <button type="button" role="menuitem" className="mpc-more-menu-item">
                    Rename conversation
                  </button>
                  <button type="button" role="menuitem" className="mpc-more-menu-item mpc-more-menu-item-danger">
                    Delete conversation
                  </button>
                </div>
              ) : null}
            </div>
          ) : isNewConversationOpen ? (
            <button
              type="button"
              onClick={() => {
                setAssistantMode("search");
                setIsMoreMenuOpen(false);
                setIsConversationListOpen(true);
              }}
              className="mpc-chat-control-button"
              aria-label="Open conversations"
            >
              <ConversationsIcon />
            </button>
          ) : (
            <button type="button" onClick={requestClose} className="mpc-chat-control-button" aria-label="Close assistant">
              <CloseIcon />
            </button>
          )}
        </div>
      </header>

      {isDiscoveryMode ? (
        <DiscoveryFeed />
      ) : isConversationListOpen ? (
        <div className="mpc-conversation-list" ref={conversationListRef} onScroll={handleConversationListScroll}>
          <p className="mpc-conversation-title">Conversations</p>
          {conversationItems.length > 0 ? (
            <div className="mpc-conversation-items">
              {conversationItems.map((item) => (
                <button key={item.id} type="button" className="mpc-conversation-item" onClick={item.onClick}>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="mpc-conversation-empty" role="status">
              <strong>No results</strong>
              <span>Try a different keyword or clear search.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mpc-chat-scroll" ref={chatScrollRef} onScroll={handleChatScroll}>
          <div className="mpc-chat-stack">
            {messages.map((message) => (
              <BubbleMessage key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="mpc-message mpc-message-agent">
                <div className="mpc-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isConversationDetailOpen && showChatScrollBottom ? (
        <button
          type="button"
          className="mpc-chat-scroll-bottom-button"
          onClick={scrollChatToBottom}
          aria-label="Scroll to latest message"
        >
          <ScrollBottomIcon />
        </button>
      ) : null}

      {isConversationListOpen ? (
        <div className="mpc-conversation-floating-actions" aria-label="Conversation shortcuts">
          {showConversationScrollTop ? (
            <button
              type="button"
              className="mpc-conversation-scroll-top-button"
              onClick={scrollConversationListToTop}
              aria-label="Scroll to latest conversation"
            >
              <ScrollTopIcon />
            </button>
          ) : null}
          <button type="button" className="mpc-new-conversation-button" onClick={startNewConversation}>
            New+
          </button>
        </div>
      ) : null}

      {showSuggestedTopics && (
        <div className="mpc-topic-area mpc-topic-shelf">
          <div className="mpc-topic-list">
            {suggestedTopics.map((topic, index) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => sendMessage(topic.prompt ?? topic.label)}
                className="mpc-topic-row"
              >
                <SuggestedTopicIcon variant={suggestedTopicIconVariants[index % suggestedTopicIconVariants.length]} />
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isDiscoveryMode && <div className="mpc-chat-composer">
        {isConversationListOpen ? (
          <div className="mpc-conversation-search-row">
            <SearchModeIcon />
            <input
              value={conversationSearch}
              onChange={(event) => setConversationSearch(event.target.value)}
              className="mpc-conversation-search-input"
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
            {conversationSearch ? (
              <button
                type="button"
                className="mpc-conversation-search-clear"
                onClick={() => setConversationSearch("")}
                aria-label="Clear conversation search"
              >
                <CloseIcon />
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {isVoiceCaptureActive ? (
              <div className="mpc-voice-status" role="status">
                {voiceStatus === "recording" ? "Recording voice. Tap again to send." : "Parsing voice message..."}
              </div>
            ) : null}
            <form className="mpc-input-row" onSubmit={handleSubmit}>
              <div className="mpc-attachment-wrap">
                <button
                  type="button"
                  onClick={() => setIsAttachmentMenuOpen((current) => !current)}
                  className="mpc-round-button"
                  aria-label={mergedLabels.addAttachmentLabel}
                  aria-haspopup="menu"
                  aria-expanded={isAttachmentMenuOpen}
                >
                  <AddIcon />
                </button>
                {isAttachmentMenuOpen ? (
                  <div className="mpc-attachment-menu" role="menu" aria-label="Attachment options">
                    <button type="button" role="menuitem" onClick={() => handleAttachmentChoice("camera")}>
                      <span className="mpc-attachment-option-icon">
                        <CameraIcon />
                      </span>
                      <span>Camera</span>
                    </button>
                    <button type="button" role="menuitem" onClick={() => handleAttachmentChoice("photos")}>
                      <span className="mpc-attachment-option-icon">
                        <PhotosIcon />
                      </span>
                      <span>Photos</span>
                    </button>
                    <button type="button" role="menuitem" onClick={() => handleAttachmentChoice("files")}>
                      <span className="mpc-attachment-option-icon">
                        <FileAttachmentIcon />
                      </span>
                      <span>Files</span>
                    </button>
                  </div>
                ) : null}
                <input
                  ref={cameraInputRef}
                  className="mpc-hidden-file-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  tabIndex={-1}
                  onChange={resetAttachmentInput}
                />
                <input
                  ref={photosInputRef}
                  className="mpc-hidden-file-input"
                  type="file"
                  accept="image/*"
                  tabIndex={-1}
                  onChange={resetAttachmentInput}
                />
                <input
                  ref={filesInputRef}
                  className="mpc-hidden-file-input"
                  type="file"
                  tabIndex={-1}
                  onChange={resetAttachmentInput}
                />
              </div>
              <input
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                className="mpc-chat-input"
                placeholder={inputPlaceholder}
                aria-label={mergedLabels.inputPlaceholder}
              />
              <button
                type="button"
                onClick={voiceStatus === "idle" ? startVoiceCapture : stopVoiceCapture}
                className={["mpc-mic-button", isVoiceCaptureActive ? "mpc-mic-button-active" : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={isVoiceCaptureActive ? "Finish voice message" : mergedLabels.recordVoiceLabel}
                aria-pressed={isVoiceCaptureActive}
              >
                <MicrophoneIcon />
              </button>
              <button
                type={showVoiceAction ? "button" : "submit"}
                onClick={showVoiceAction ? (voiceStatus === "idle" ? startVoiceCapture : stopVoiceCapture) : undefined}
                className={[
                  "mpc-send-button",
                  showVoiceAction ? "mpc-voice-button" : "",
                  isVoiceCaptureActive ? "mpc-voice-button-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={
                  showVoiceAction
                    ? isVoiceCaptureActive
                      ? "Finish voice message"
                      : "Start voice conversation"
                    : mergedLabels.sendLabel
                }
                aria-pressed={showVoiceAction ? isVoiceCaptureActive : undefined}
              >
                {showVoiceAction ? <VoiceModeIcon /> : <SendIcon />}
              </button>
            </form>
          </>
        )}

        <div className="mpc-home-indicator" aria-hidden="true">
          <span />
        </div>
      </div>}
    </section>
  );
}
