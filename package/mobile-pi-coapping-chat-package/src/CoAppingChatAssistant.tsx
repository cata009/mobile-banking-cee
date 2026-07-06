import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  MouseEvent as ReactMouseEvent,
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
  DeleteActionIcon,
  DiscoveryModeIcon,
  ExportIcon,
  FileAttachmentIcon,
  MicrophoneIcon,
  MoreIcon,
  PhotosIcon,
  RenameActionIcon,
  SearchModeIcon,
  SendIcon,
  ShareActionIcon,
  SuggestedTopicIcon,
  ThinkingStatusIcon,
  VoiceModeIcon,
} from "./icons";
import type {
  CoAppingChatAction,
  CoAppingChatLabels,
  CoAppingChatContext,
  CoAppingChatMessage,
  CoAppingFollowUpSuggestion,
  CoAppingReplyResolver,
  CoAppingRichBlock,
  CoAppingSuggestedTopic,
} from "./types";

export interface CoAppingChatAssistantProps {
  onClose: () => void;
  labels?: Partial<CoAppingChatLabels>;
  initialMessages?: CoAppingChatMessage[];
  suggestedTopics?: CoAppingSuggestedTopic[];
  entryContext?: CoAppingChatContext | null;
  resolveReply?: CoAppingReplyResolver;
  typingDelayMs?: number;
  onAction?: (action: CoAppingChatAction) => void;
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function formatClockTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getLocalDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function isSameLocalDay(firstDate: Date, secondDate: Date) {
  return getLocalDayKey(firstDate) === getLocalDayKey(secondDate);
}

function parseClockTime(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

function withClockTime(date: Date, time: string) {
  const parsedTime = parseClockTime(time);
  const nextDate = new Date(date);
  if (parsedTime) {
    nextDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  }
  return nextDate;
}

function formatMessageTimeLabel(message: CoAppingChatMessage) {
  if (!message.createdAt) return message.time;

  const messageDate = new Date(message.createdAt);
  if (Number.isNaN(messageDate.getTime())) return message.time;

  const now = new Date();
  const clockTime = formatClockTime(messageDate);

  if (isSameLocalDay(messageDate, now)) {
    return `Today ${clockTime}`;
  }

  if (isSameLocalDay(messageDate, addDays(now, -1))) {
    return `Yesterday ${clockTime}`;
  }

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(messageDate.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  }).format(messageDate);

  return `${dateLabel} ${clockTime}`;
}

function getConversationDateFromSubtitle(subtitle: string, time: string) {
  const today = new Date();

  if (/^Yesterday\b/i.test(subtitle)) {
    return withClockTime(addDays(today, -1), time).toISOString();
  }

  const datedMatch = subtitle.match(/^(\d{1,2})\s+([A-Za-z]{3})\b/);
  if (datedMatch) {
    const monthIndex = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(
      datedMatch[2].toLowerCase(),
    );
    if (monthIndex >= 0) {
      const date = withClockTime(new Date(today.getFullYear(), monthIndex, Number(datedMatch[1])), time);
      if (date.getTime() > today.getTime()) date.setFullYear(date.getFullYear() - 1);
      return date.toISOString();
    }
  }

  const weekdayMatch = subtitle.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i);
  if (weekdayMatch) {
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const targetDay = weekdays.indexOf(weekdayMatch[1].toLowerCase());
    const dayDelta = (today.getDay() - targetDay + 7) % 7;
    return withClockTime(addDays(today, -dayDelta), time).toISOString();
  }

  return withClockTime(today, time).toISOString();
}

function withConversationMessageDates(messages: CoAppingChatMessage[], subtitle: string) {
  return messages.map((message) => ({
    ...message,
    createdAt: message.createdAt ?? getConversationDateFromSubtitle(subtitle, message.time),
  }));
}

function getThinkingStatusText(input: string) {
  const normalizedInput = input.toLowerCase();

  if (/\b(card|pin|secure|security|lost|limit|blocked)\b/.test(normalizedInput)) {
    return "Checking card functions and security settings...";
  }

  if (/\b(payment|payments|transfer|rent|loan|repay)\b/.test(normalizedInput)) {
    return "Checking payment options and account limits...";
  }

  if (/\b(invest|investment|savings|saving|fund|portfolio|fees)\b/.test(normalizedInput)) {
    return "Reviewing savings and investment context...";
  }

  if (/\b(spending|subscriptions|subscription|balance|budget|cash)\b/.test(normalizedInput)) {
    return "Reviewing spending patterns and account activity...";
  }

  if (/\b(offer|offers|cashback|product|products|travel)\b/.test(normalizedInput)) {
    return "Looking up relevant offers and product options...";
  }

  if (/\b(document|documents|confirmation)\b/.test(normalizedInput)) {
    return "Checking documents and recent account activity...";
  }

  return "Checking your banking context...";
}

function splitReplyStreamTokens(text: string) {
  return text.match(/\S+\s*/g) ?? (text ? [text] : []);
}

function getReplyStreamDelayMs(tokenCount: number) {
  if (tokenCount > 80) return 24;
  if (tokenCount > 45) return 30;
  return 36;
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

function InlineFormattedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
        }
        return part.replace(/\*\*/g, "");
      })}
    </>
  );
}

function AgentFormattedResponse({ text, isStreaming = false }: { text: string; isStreaming?: boolean }) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className={["mpc-agent-copy", isStreaming ? "mpc-agent-copy-streaming" : ""].filter(Boolean).join(" ")}>
      {lines.map((line, index) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={`${line}-${index}`} className="mpc-agent-heading">
              <InlineFormattedText text={line.slice(4)} />
            </h3>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <div key={`${line}-${index}`} className="mpc-agent-list-row">
              <span className="mpc-agent-list-marker" aria-hidden="true" />
              <span>
                <InlineFormattedText text={line.slice(2)} />
              </span>
            </div>
          );
        }

        const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
          return (
            <div key={`${line}-${index}`} className="mpc-agent-step-row">
              <span className="mpc-agent-step-marker" aria-hidden="true">
                {numberedMatch[1]}
              </span>
              <span>
                <InlineFormattedText text={numberedMatch[2]} />
              </span>
            </div>
          );
        }

        return (
          <p key={`${line}-${index}`} className="mpc-agent-paragraph">
            <InlineFormattedText text={line} />
          </p>
        );
      })}
      {isStreaming ? <span className="mpc-agent-stream-cursor" aria-hidden="true" /> : null}
    </div>
  );
}

function RichActionButton({
  action,
  onAction,
}: {
  action?: CoAppingChatAction;
  onAction?: (action: CoAppingChatAction) => void;
}) {
  if (!action) return null;

  return (
    <button type="button" className="mpc-rich-action" onClick={() => onAction?.(action)}>
      {action.label}
    </button>
  );
}

function RichMetricGrid({ metrics }: { metrics: Array<{ label: string; value: string; helper?: string }> }) {
  return (
    <div className="mpc-rich-metric-grid">
      {metrics.map((metric) => (
        <div key={`${metric.label}-${metric.value}`} className="mpc-rich-metric">
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.helper ? <small>{metric.helper}</small> : null}
        </div>
      ))}
    </div>
  );
}

function RichBlock({
  block,
  onAction,
}: {
  block: CoAppingRichBlock;
  onAction?: (action: CoAppingChatAction) => void;
}) {
  if (block.type === "investment-summary") {
    return (
      <div className="mpc-rich-card mpc-rich-card-summary">
        <div className="mpc-rich-card-head">
          <span>{block.eyebrow}</span>
          <strong>{block.title}</strong>
        </div>
        <p>{block.body}</p>
        <RichMetricGrid metrics={block.metrics} />
        <RichActionButton action={block.action} onAction={onAction} />
      </div>
    );
  }

  if (block.type === "investment-allocation") {
    return (
      <div className="mpc-rich-card">
        <div className="mpc-rich-card-head">
          <strong>{block.title}</strong>
          <span>{block.body}</span>
        </div>
        <div className="mpc-allocation-list">
          {block.items.map((item) => (
            <div key={item.label} className="mpc-allocation-row">
              <div className="mpc-allocation-row-copy">
                <strong>{item.label}</strong>
                <span>{item.helper}</span>
              </div>
              <div className="mpc-allocation-value">{item.value}%</div>
              <div className="mpc-allocation-track" aria-hidden="true">
                <span style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <RichActionButton action={block.action} onAction={onAction} />
      </div>
    );
  }

  if (block.type === "investment-projection") {
    return (
      <div className="mpc-rich-card">
        <div className="mpc-rich-card-head">
          <strong>{block.title}</strong>
          <span>{block.body}</span>
        </div>
        <div className="mpc-projection-list">
          {block.scenarios.map((scenario) => (
            <div
              key={scenario.label}
              className={["mpc-projection-row", scenario.emphasis ? "mpc-projection-row-emphasis" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{scenario.label}</span>
              <strong>{scenario.value}</strong>
              <small>{scenario.detail}</small>
            </div>
          ))}
        </div>
        <RichActionButton action={block.action} onAction={onAction} />
      </div>
    );
  }

  if (block.type === "product-cards") {
    return (
      <div className="mpc-rich-card mpc-rich-card-products">
        <div className="mpc-rich-card-head">
          <strong>{block.title}</strong>
          <span>{block.body}</span>
        </div>
        <div className="mpc-product-card-row">
          {block.products.map((product) => (
            <button
              key={product.id}
              type="button"
              className={["mpc-product-card", product.tone ? `mpc-product-card-${product.tone}` : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => product.action && onAction?.(product.action)}
            >
              <strong>{product.title}</strong>
              <span>{product.subtitle}</span>
              <small>{product.meta}</small>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mpc-rich-card">
      <div className="mpc-rich-card-head">
        <strong>{block.title}</strong>
        <span>{block.body}</span>
      </div>
      <RichMetricGrid metrics={block.metrics} />
      <RichActionButton action={block.action} onAction={onAction} />
    </div>
  );
}

function RichBlocks({
  blocks,
  onAction,
}: {
  blocks?: CoAppingRichBlock[];
  onAction?: (action: CoAppingChatAction) => void;
}) {
  if (!blocks?.length) return null;

  return (
    <div className="mpc-rich-stack">
      {blocks.map((block, index) => (
        <RichBlock key={`${block.type}-${index}`} block={block} onAction={onAction} />
      ))}
    </div>
  );
}

function ChatStatusBar() {
  return (
    <div className="mpc-chat-status-bar" aria-hidden="true">
      <span className="mpc-chat-status-time">{getCurrentTime()}</span>
      <span className="mpc-chat-status-island">
        <span />
        <span />
      </span>
      <span className="mpc-chat-status-icons">
        <span className="mpc-chat-signal">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="mpc-chat-wifi">
          <span />
          <span />
        </span>
        <span className="mpc-chat-battery">
          <span />
        </span>
      </span>
    </div>
  );
}

function BubbleMessage({
  message,
  onAction,
}: {
  message: CoAppingChatMessage;
  onAction?: (action: CoAppingChatAction) => void;
}) {
  const isAgent = message.role === "agent";
  const timeLabel = formatMessageTimeLabel(message);

  if (isAgent) {
    return (
      <div className="mpc-message mpc-message-agent" aria-live={message.isStreaming ? "polite" : undefined}>
        <AgentFormattedResponse text={message.text} isStreaming={message.isStreaming} />
        {!message.isStreaming ? <RichBlocks blocks={message.richBlocks} onAction={onAction} /> : null}
        {!message.isStreaming ? (
          <div className="mpc-agent-meta">
            <div className="mpc-response-feedback" aria-label="Response feedback">
              <button type="button" className="mpc-feedback-button" aria-label="Good response">
                <ThumbsUpFeedbackIcon />
              </button>
              <button type="button" className="mpc-feedback-button" aria-label="Bad response">
                <ThumbsDownFeedbackIcon />
              </button>
            </div>
            <div className="mpc-message-time mpc-message-time-agent">{timeLabel}</div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mpc-message mpc-message-user">
      <div className="mpc-bubble mpc-bubble-user">{message.text}</div>
      <div className="mpc-message-time">{timeLabel}</div>
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

const polishedAgentReplies: Record<string, string> = {
  "intro-hi": "### Welcome back\nI am ready to help with banking tasks, product questions, and this CZ future chatbot preview.",
  "intro-help":
    "### What I can help with\n- **Payments:** transfers, templates, limits, and confirmation documents.\n- **Cards:** security, limits, travel usage, and lost-card actions.\n- **Spending:** subscriptions, budget signals, and balance explanations.\n- **Products:** investments, loans, offers, and next-best actions.",
  "payments-agent-1":
    "### Payment flow\nStart from **Payments** and move through the flow step by step:\n1. Choose the payment type.\n2. Add beneficiary and amount details.\n3. Review fees, limits, and execution date.\n4. Confirm with the standard signing step.\nThe assistant should keep the user oriented before each irreversible action.",
  "payments-agent-2":
    "### Template reuse\nYes, when the payment type supports it.\n- After success, expose **Save as template** as a secondary action.\n- Keep it available from Payments for repeated transfers.\n- Let the user edit details before sending again.",
  "investments-agent-1":
    "### Before you invest\nI can help you prepare, but this is **not personal financial advice**.\nStart with three checks:\n1. What is the money for?\n2. When might you need it?\n3. How much movement in value can you tolerate?",
  "investments-agent-2":
    "### Long-term goal check\nFor a longer-term goal, compare the basics before choosing a product:\n- **Emergency reserve:** money you may need soon should stay easier to access.\n- **Time horizon:** longer horizons can absorb more movement, but not unlimited risk.\n- **Volatility preference:** lower volatility may feel safer, higher potential return usually moves more.\nIn Investments, compare portfolio value, product type, currency exposure, and performance history.",
  "investments-agent-3":
    "### Go to Investments\nYes. Open **Investments** to review:\n- Portfolio value\n- Available funds\n- Product type distribution\n- Investment history\n**Placeholder action:** Go to Investments. A deeper contextual link can be wired once the final destination contract is defined.",
  "investments-agent-4":
    "### Compare more than recent performance\nGood instinct. A strong recent month is context, not a decision by itself.\n1. Start with the objective: emergency reserve, short-term purchase, medium-term goal, or long-term growth.\n2. Compare risk profile, holding period, currency, and product category.\n3. Check whether the investment can move up and down in value.\nIf the money may be needed soon, a lower-volatility option is usually easier to live with.",
  "investments-agent-5":
    "### Fees and recurring investing\nBefore committing, check product documents and fee information.\n- A recurring investment can reduce the pressure of choosing a perfect entry day.\n- Each recurring order still buys at the market conditions available at that time.\n- In the app, compare fund category, current value, historical evolution, currency exposure, and order type support.",
  "investments-agent-6":
    "### Review your portfolio first\nStart with the summary, then move into details:\n1. Check total value and performance.\n2. Review product type and currency distribution.\n3. Look for concentration in one category or currency.\n4. Open each position for amount, currency, gain/loss, order type, and pending orders.\nThe decision path should stay clear: **goal -> product -> risk -> decision**.",
  "investments-agent-7":
    "### Suggested next step\nOpen **Investments** and start from the Performance tab.\n- Review Product Type and Currency tabs.\n- Open a single fund only after checking the portfolio shape.\n- Future deep link placeholder: app://investments/overview?source=smart-assistant&topic=investment-readiness",
  "security-agent-1":
    "### Card security controls\nOnline card security should be visible, not hidden.\n- Online payments\n- Contactless payments\n- Temporary block or freeze\n- Card limits\n- Transaction notifications\nThe card details page should make these actions easy to verify.",
  "security-agent-2":
    "### If you suspect fraud\n1. Block or freeze the card first.\n2. Review recent transactions.\n3. Contact support for anything unfamiliar.\nThe assistant can guide the route, but sensitive servicing still needs the proper authorization flow.",
  "insights-agent-1":
    "### Why the budget changed\nSpending insights compare current transactions with previous patterns.\nLook for:\n- category changes\n- recurring payments\n- upcoming obligations\n- unusually large card payments\nThese are the signals that make a balance or budget explanation credible.",
  "insights-agent-2":
    "### Subscription discovery\nYes. Subscriptions are a strong AI prompt because they connect analysis with action:\n- review the merchant\n- pause or update where supported\n- cancel outside the banking app when needed\n- keep only what still matters",
  "balance-agent-1":
    "### Available vs total balance\nThe difference usually comes from money that is visible but not fully available.\nCommon causes:\n- card reservations\n- pending payments\n- blocked amounts\n- overdraft rules\nThe assistant should point to transaction details as evidence.",
  "balance-agent-2":
    "### Show pending first\nYes. Pending card transactions are often the clearest explanation.\nShow them before less common causes like reserved funds or manual restrictions, so the answer feels grounded in real activity.",
  "travel-agent-1":
    "### Travel budget setup\nBefore the trip, check:\n1. available balance\n2. expected card payments\n3. recurring payments due while away\nThen set a temporary card limit matching the amount you are comfortable spending.",
  "travel-agent-2":
    "### Keep it temporary\nThat is the cleanest approach.\n- Use a limit only for the travel days.\n- Keep notifications on.\n- Review currency conversion and ATM fees before using the card abroad.",
  "lost-card-agent-1":
    "### First action: freeze the card\nFreeze or block the card first so it cannot be used.\nThen:\n1. Check recent transactions.\n2. Mark anything unfamiliar.\n3. Contact support if needed.",
  "lost-card-agent-2":
    "### If you find it later\nIf the app offers a **temporary freeze**, you can usually unfreeze it.\nIf the card was permanently blocked, the safer route is normally a replacement card flow.",
  "offers-agent-1":
    "### Choose offers intentionally\nPrefer offers that match planned purchases, not offers that create new spending.\nCheck:\n- merchant\n- cashback percentage\n- minimum amount\n- expiry date\n- online vs in-store eligibility",
  "offers-agent-2":
    "### Location and filters\nYes. A future assistant can filter by location, category, active status, and expiry.\nFor now, open **Products > ShopSmart** and narrow the list with filters.",
  "loan-agent-1":
    "### Early repayment checks\nPartial repayment can reduce interest, but review the trade-offs first:\n- loan type\n- remaining amount\n- fees\n- whether the change affects installment, duration, or both",
  "loan-agent-2":
    "### Where to start\nOpen the loan detail page first.\nThe assistant can later route directly to repayment options once the product contract and eligible loan rules are confirmed.",
  "subs-agent-1":
    "### Find forgotten subscriptions\nStart with recurring card payments and repeated merchants.\nLook for:\n- similar monthly amounts\n- repeated merchant names\n- stable billing cadence\nThen decide whether to keep, update, or cancel outside the banking app when needed.",
  "subs-agent-2":
    "### Filter by category\nYes, once categories are available.\nThe assistant can combine merchant names, category tags, and recurring cadence to surface a focused subscription list.",
  "saving-agent-1":
    "### Find a realistic monthly amount\nStart with a simple affordability check:\n1. income\n2. fixed costs\n3. subscriptions\n4. average card spending\nChoose an amount that still leaves a buffer for unexpected expenses.",
  "saving-agent-2":
    "### Make it automatic\nYes. Use recurring savings or a standing order where available.\nA future assistant can suggest an amount based on spending history and balance patterns.",
  "limit-agent-1":
    "### Temporary card limits\nTemporary limits are safer than permanent changes when the higher amount is only needed briefly.\nSet:\n- amount\n- channel\n- duration\nThen confirm before authorizing.",
  "limit-agent-2":
    "### Keep channels separate\nYes. Increase only the limit you actually need.\nIf the purchase is online, avoid raising ATM withdrawal limits at the same time.",
  "order-agent-1":
    "### Template or standing order?\nUse a **standing order** when the amount and date are predictable.\nUse a **template** when you want to review and manually send each payment.",
  "order-agent-2":
    "### Later changes\nYes. Regular payment instructions should be reviewable from the payments management area.\nExpected actions: edit, pause, cancel, or reactivate.",
  "docs-agent-1":
    "### Find a confirmation\nOpen transaction history, find the payment, then look for details or document actions.\nIf generated, the confirmation should also appear in **Documents**.",
  "docs-agent-2":
    "### Sharing documents\nYes, when the share action is available.\nThe assistant should guide the user to the correct source, not expose documents directly inside the chat.",
  "fees-agent-1":
    "### Card fees abroad\nIt depends on:\n- card type\n- currency conversion\n- ATM usage\n- merchant conversion choice\nBefore travelling, review fees, exchange rates, and dynamic currency conversion guidance.",
  "fees-agent-2":
    "### Pay in local currency\nIn many cases, paying in local currency avoids merchant conversion markup.\nThe assistant can explain the pattern, while final fee information should come from official pricing documents.",
};

const navigateInvestmentsAction: CoAppingChatAction = {
  id: "open-investments",
  label: "Open Investments",
  type: "navigate",
  target: "investments",
};

const navigateAnalyticsAction: CoAppingChatAction = {
  id: "open-analytics",
  label: "Open Spending",
  type: "navigate",
  target: "analytics",
};

const navigateCardAction: CoAppingChatAction = {
  id: "open-card-detail",
  label: "Open card details",
  type: "navigate",
  target: "card-detail",
};

function sendMessageAction(id: string, label: string, prompt = label): CoAppingChatAction {
  return {
    id,
    label,
    prompt,
    type: "send-message",
  };
}

function followUp(id: string, label: string, prompt = label): CoAppingFollowUpSuggestion {
  return {
    id,
    label,
    prompt,
    action: sendMessageAction(id, label, prompt),
  };
}

function navigateFollowUp(id: string, action: CoAppingChatAction): CoAppingFollowUpSuggestion {
  return {
    id,
    label: action.label,
    action,
  };
}

const investmentEntryFollowUps: CoAppingFollowUpSuggestion[] = [
  followUp("start-investment-goal", "Start an investment goal"),
  followUp("review-portfolio", "Review my portfolio"),
  followUp("learn-investing", "Learn how it works"),
];

const investmentGoalTypeFollowUps: CoAppingFollowUpSuggestion[] = [
  followUp("goal-grow-savings", "Grow my savings"),
  followUp("goal-future-purchase", "Future purchase"),
  followUp("goal-retirement", "Long-term reserve"),
];

const investmentHorizonFollowUps: CoAppingFollowUpSuggestion[] = [
  followUp("horizon-3-5", "In 3-5 years"),
  followUp("horizon-5-10", "In 5-10 years"),
  followUp("horizon-unsure", "Not sure yet"),
];

const investmentAmountFollowUps: CoAppingFollowUpSuggestion[] = [
  followUp("amount-5000", "5,000 CZK"),
  followUp("amount-10000", "10,000 CZK"),
  followUp("amount-unsure", "I'm not sure yet"),
];

const investmentMonthlyFollowUps: CoAppingFollowUpSuggestion[] = [
  followUp("monthly-500", "500 CZK monthly"),
  followUp("monthly-1000", "1,000 CZK monthly"),
  followUp("monthly-not-now", "Not now"),
];

const investmentPortfolioFollowUps: CoAppingFollowUpSuggestion[] = [
  followUp("check-performance", "Check performance"),
  followUp("top-up-investment", "Top up investment"),
  followUp("start-new-goal", "Start a new goal", "Start an investment goal"),
];

const investmentProjectionFollowUps: CoAppingFollowUpSuggestion[] = [
  navigateFollowUp("open-investments", navigateInvestmentsAction),
  followUp("adjust-amount", "Adjust amount"),
  followUp("review-portfolio-next", "Review portfolio", "Review my portfolio"),
];

const investmentAllocationBlock: CoAppingRichBlock = {
  type: "investment-allocation",
  title: "Balanced portfolio preview",
  body: "A model mix for a medium-term goal. Final selection still needs product documents and risk confirmation.",
  items: [
    { label: "Global equities", value: 55, helper: "Growth engine, higher movement" },
    { label: "Bonds", value: 25, helper: "Stability and income layer" },
    { label: "European equities", value: 10, helper: "Regional exposure" },
    { label: "Defensive/liquidity", value: 10, helper: "Buffer for rebalancing" },
  ],
  action: navigateInvestmentsAction,
};

const investmentSummaryBlock: CoAppingRichBlock = {
  type: "investment-summary",
  eyebrow: "Portfolio snapshot",
  title: "Investment review",
  body: "Use this as a review surface before opening a specific fund or order flow.",
  metrics: [
    { label: "Current value", value: "5,620 EUR", helper: "Demo portfolio" },
    { label: "Return", value: "+12.4%", helper: "+620 EUR since start" },
    { label: "Next review", value: "Jul 2026", helper: "Planned check-in" },
  ],
  action: navigateInvestmentsAction,
};

const investmentProjectionBlock: CoAppingRichBlock = {
  type: "investment-projection",
  title: "Five-year simulation",
  body: "Illustrative scenario for 5,000 CZK now plus 1,000 CZK monthly. Not a guarantee.",
  scenarios: [
    { label: "Lower", value: "61k CZK", detail: "More conservative market path" },
    { label: "Expected", value: "74k CZK", detail: "Middle scenario", emphasis: true },
    { label: "Higher", value: "89k CZK", detail: "Stronger market path" },
  ],
  action: navigateInvestmentsAction,
};

const investmentProductCardsBlock: CoAppingRichBlock = {
  type: "product-cards",
  title: "Relevant investment surfaces",
  body: "The assistant can keep the chat conversational, then hand off to real product areas.",
  products: [
    {
      id: "portfolio",
      title: "Portfolio",
      subtitle: "Value, performance, allocation",
      meta: "Open overview",
      tone: "blue",
      action: navigateInvestmentsAction,
    },
    {
      id: "history",
      title: "History",
      subtitle: "Orders and confirmations",
      meta: "Open activity",
      tone: "neutral",
      action: {
        id: "open-investments-history",
        label: "Open History",
        type: "navigate",
        target: "investments-history",
      },
    },
  ],
};

const cardSecurityProductBlock: CoAppingRichBlock = {
  type: "product-cards",
  title: "Card controls",
  body: "For secure card tasks, the assistant should expose the exact destination and keep strong authentication in the app.",
  products: [
    {
      id: "debit-card",
      title: "Debit Card",
      subtitle: "5173 **** **** 5601",
      meta: "Limits, online payments, freeze",
      tone: "blue",
      action: navigateCardAction,
    },
    {
      id: "pin-check",
      title: "PIN and security",
      subtitle: "Sensitive controls",
      meta: "Requires authorization",
      tone: "dark",
      action: navigateCardAction,
    },
  ],
};

const spendingInsightBlock: CoAppingRichBlock = {
  type: "spending-insight",
  title: "Subscription signal",
  body: "Recurring payments are a good bridge between insight and action.",
  metrics: [
    { label: "Detected", value: "6", helper: "Monthly merchants" },
    { label: "Largest", value: "429 CZK", helper: "Streaming bundle" },
    { label: "Review", value: "2", helper: "Price changed recently" },
  ],
  action: navigateAnalyticsAction,
};

const richMessageEnhancements: Record<string, Pick<CoAppingChatMessage, "richBlocks" | "followUps">> = {
  "investments-agent-1": {
    richBlocks: [investmentProductCardsBlock],
    followUps: investmentEntryFollowUps,
  },
  "investments-agent-3": {
    richBlocks: [investmentSummaryBlock],
    followUps: investmentPortfolioFollowUps,
  },
  "investments-agent-5": {
    richBlocks: [investmentAllocationBlock],
    followUps: [
      followUp("see-projection", "See projection"),
      followUp("why-balanced", "Why this portfolio?"),
      navigateFollowUp("open-investments", navigateInvestmentsAction),
    ],
  },
  "investments-agent-6": {
    richBlocks: [investmentSummaryBlock, investmentAllocationBlock],
    followUps: investmentPortfolioFollowUps,
  },
  "investments-agent-7": {
    richBlocks: [investmentProjectionBlock],
    followUps: investmentProjectionFollowUps,
  },
  "security-agent-1": {
    richBlocks: [cardSecurityProductBlock],
    followUps: [
      navigateFollowUp("open-card-detail", navigateCardAction),
      followUp("check-card-limits", "Check card limits"),
      followUp("review-online-payments", "Review online payments"),
    ],
  },
  "insights-agent-2": {
    richBlocks: [spendingInsightBlock],
    followUps: [
      navigateFollowUp("open-spending", navigateAnalyticsAction),
      followUp("review-subscriptions", "Review subscriptions"),
      followUp("find-price-changes", "Find price changes"),
    ],
  },
};

function getContextualAssistantEnhancement(
  input: string,
  fallbackText: string,
): Pick<CoAppingChatMessage, "text" | "richBlocks" | "followUps"> {
  const normalized = input.toLowerCase();

  if (/\b(start|create|new)\b.*\b(goal|investment)\b|\bstart an investment goal\b/.test(normalized)) {
    return {
      text:
        "### Let's shape the goal\nI can set up a planning path before any product decision.\nChoose the goal type first, then we will narrow the horizon, starting amount, monthly contribution, and risk comfort.\nNothing is submitted from chat; this is a guided preview before opening Investments.",
      richBlocks: [investmentProductCardsBlock],
      followUps: investmentGoalTypeFollowUps,
    };
  }

  if (/\b(grow my savings|future purchase|long-term reserve|retirement)\b/.test(normalized)) {
    return {
      text:
        "### Goal selected\nGood. The next important signal is time horizon.\nA longer horizon can usually tolerate more movement than money you may need soon. Pick the closest option so the preview can stay realistic.",
      followUps: investmentHorizonFollowUps,
    };
  }

  if (/\b(3-5|5-10|not sure yet)\b/.test(normalized)) {
    return {
      text:
        "### Time horizon captured\nNow choose an initial amount for the simulation.\nThis amount is only used for the demo projection; the real app would confirm source of funds, product documents, and risk profile before any order.",
      followUps: investmentAmountFollowUps,
    };
  }

  if (/\b(5,000|10000|10,000|i'm not sure yet|im not sure yet)\b/.test(normalized)) {
    return {
      text:
        "### Starting amount noted\nA recurring contribution can make the plan feel less dependent on one perfect entry day.\nChoose a monthly amount or skip it for now.",
      followUps: investmentMonthlyFollowUps,
    };
  }

  if (/\b(500 czk monthly|1,000 czk monthly|1000 czk monthly|not now)\b/.test(normalized)) {
    return {
      text:
        "### Model portfolio preview\nBased on a medium-term goal, I would show a balanced portfolio preview before taking the user into Investments.\nThe preview explains the mix, expected movement, and what must still be checked in the real product flow.",
      richBlocks: [investmentAllocationBlock],
      followUps: [
        followUp("see-projection", "See projection"),
        followUp("why-balanced", "Why this portfolio?"),
        navigateFollowUp("open-investments", navigateInvestmentsAction),
      ],
    };
  }

  if (/\b(see projection|simulation|projection)\b/.test(normalized)) {
    return {
      text:
        "### Projection preview\nHere is the kind of simulation that makes the assistant feel useful without pretending the future is certain.\nThe important part is to frame it as illustrative and keep the CTA inside the authenticated Investments flow.",
      richBlocks: [investmentProjectionBlock],
      followUps: investmentProjectionFollowUps,
    };
  }

  if (/\b(review my portfolio|review portfolio|check portfolio|current portfolio)\b/.test(normalized)) {
    return {
      text:
        "### Portfolio check\nYour investment overview should answer three questions quickly:\n1. What is the current value?\n2. How has it performed?\n3. Is the allocation still close to the goal?\nFrom there, the user can inspect funds, currency exposure, and history.",
      richBlocks: [investmentSummaryBlock, investmentAllocationBlock],
      followUps: investmentPortfolioFollowUps,
    };
  }

  if (/\b(check performance|performance)\b/.test(normalized)) {
    return {
      text:
        "### Performance context\nRecent performance is useful, but it should be read together with allocation, time horizon, and risk.\nIf the user sees a strong month, the assistant should explain what changed and avoid pushing a product decision too quickly.",
      richBlocks: [investmentSummaryBlock],
      followUps: [
        navigateFollowUp("open-investments", navigateInvestmentsAction),
        followUp("top-up-investment", "Top up investment"),
        followUp("learn-investing", "Learn how it works"),
      ],
    };
  }

  if (/\b(top up|add money|increase investment)\b/.test(normalized)) {
    return {
      text:
        "### Top-up amount\nBefore opening an order flow, ask for an amount and keep the user aware that product documents and risk checks still apply.\nFor demo purposes, choose one of the quick amounts or type a custom value.",
      followUps: [
        followUp("topup-500", "500 CZK"),
        followUp("topup-1000", "1,000 CZK"),
        followUp("topup-2500", "2,500 CZK"),
        followUp("topup-cancel", "Not now"),
      ],
    };
  }

  if (/\b(learn how it works|how it works|why this portfolio|explain risk)\b/.test(normalized)) {
    return {
      text:
        "### How the investment preview works\nThe assistant first clarifies the goal, then shows a model allocation and a scenario range.\n- Allocation explains what the money is exposed to.\n- Projection shows possible outcomes, not promises.\n- CTA opens the real Investments area for documents, suitability, and authorization.\nThis keeps the chat helpful while the bank app remains the source of truth.",
      richBlocks: [investmentAllocationBlock],
      followUps: investmentEntryFollowUps,
    };
  }

  if (/\b(pin|card secure|card security|secure card|online payments|card limits)\b/.test(normalized)) {
    return {
      text: fallbackText,
      richBlocks: [cardSecurityProductBlock],
      followUps: [
        navigateFollowUp("open-card-detail", navigateCardAction),
        followUp("check-card-limits", "Check card limits"),
        followUp("review-online-payments", "Review online payments"),
      ],
    };
  }

  if (/\b(subscription|subscriptions|spending insight|price changes)\b/.test(normalized)) {
    return {
      text: fallbackText,
      richBlocks: [spendingInsightBlock],
      followUps: [
        navigateFollowUp("open-spending", navigateAnalyticsAction),
        followUp("review-subscriptions", "Review subscriptions"),
        followUp("find-price-changes", "Find price changes"),
      ],
    };
  }

  if (/\b(invest|investment|savings|portfolio|fund|fees)\b/.test(normalized)) {
    return {
      text: fallbackText,
      richBlocks: [investmentProductCardsBlock],
      followUps: investmentEntryFollowUps,
    };
  }

  return { text: fallbackText };
}

fallbackConversationMessages.forEach((message) => {
  if (message.role === "agent" && polishedAgentReplies[message.id]) {
    message.text = polishedAgentReplies[message.id];
  }
  const enhancement = richMessageEnhancements[message.id];
  if (message.role === "agent" && enhancement) {
    message.richBlocks = enhancement.richBlocks;
    message.followUps = enhancement.followUps;
  }
});

mockedConversationHistories.forEach((conversation) => {
  conversation.messages.forEach((message) => {
    if (message.role === "agent" && polishedAgentReplies[message.id]) {
      message.text = polishedAgentReplies[message.id];
    }
    const enhancement = richMessageEnhancements[message.id];
    if (message.role === "agent" && enhancement) {
      message.richBlocks = enhancement.richBlocks;
      message.followUps = enhancement.followUps;
    }
  });
});

type AttachmentSource = "camera" | "photos" | "files";
type VoiceCaptureStatus = "idle" | "recording" | "transcribing";

const assistantGreetingName = "Teodora";

function getGreetingLabel(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

const CONVERSATION_LIST_EXIT_MS = 520;
const CHAT_CLOSE_EXIT_MS = 480;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

export function CoAppingChatAssistant({
  onClose,
  onAction,
  labels,
  initialMessages = defaultInitialMessages,
  suggestedTopics = defaultSuggestedTopics,
  entryContext = null,
  resolveReply = defaultReplyResolver,
  typingDelayMs = 1150,
}: CoAppingChatAssistantProps) {
  const mergedLabels = { ...defaultChatLabels, ...labels };
  const savedConversationMessagesRef = useRef<CoAppingChatMessage[]>(
    initialMessages.length > 0 ? initialMessages : fallbackConversationMessages,
  );
  const [messages, setMessages] = useState<CoAppingChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [thinkingStatusText, setThinkingStatusText] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
  const [isConversationListExiting, setIsConversationListExiting] = useState(false);
  const [assistantMode, setAssistantMode] = useState<"search" | "discovery">("search");
  const [conversationSearch, setConversationSearch] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>("idle");
  const [showConversationScrollTop, setShowConversationScrollTop] = useState(false);
  const [showChatScrollBottom, setShowChatScrollBottom] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const streamTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const conversationListExitTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const wasConversationListOpenRef = useRef(false);
  const dragStartYRef = useRef(0);
  const conversationListRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const followUpShelfRef = useRef<HTMLDivElement | null>(null);
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
  const streamingMessageIdRef = useRef<string | null>(null);
  const followUpDragRef = useRef({
    pointerId: 0,
    startX: 0,
    scrollLeft: 0,
    active: false,
    moved: false,
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (streamTimeoutRef.current) window.clearTimeout(streamTimeoutRef.current);
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
      if (conversationListExitTimeoutRef.current) window.clearTimeout(conversationListExitTimeoutRef.current);
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

  useEffect(() => {
    if (isConversationListOpen) {
      if (conversationListExitTimeoutRef.current) {
        window.clearTimeout(conversationListExitTimeoutRef.current);
        conversationListExitTimeoutRef.current = null;
      }
      wasConversationListOpenRef.current = true;
      setIsConversationListExiting(false);
      return;
    }

    if (!wasConversationListOpenRef.current) return;

    setIsConversationListExiting(true);
    wasConversationListOpenRef.current = false;
    conversationListExitTimeoutRef.current = window.setTimeout(() => {
      setIsConversationListExiting(false);
      conversationListExitTimeoutRef.current = null;
    }, CONVERSATION_LIST_EXIT_MS);
  }, [isConversationListOpen]);

  const requestClose = () => {
    if (isClosing) return;
    cancelVoiceCapture();
    setIsMoreMenuOpen(false);
    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, CHAT_CLOSE_EXIT_MS);
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

  const stopReplyStream = () => {
    if (streamTimeoutRef.current) {
      window.clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
    streamingMessageIdRef.current = null;
    setStreamingMessageId(null);
  };

  const startReplyStream = (reply: CoAppingChatMessage) => {
    stopReplyStream();

    const tokens = splitReplyStreamTokens(reply.text);
    const streamDelayMs = getReplyStreamDelayMs(tokens.length);
    let tokenIndex = Math.min(1, tokens.length);
    const replyId = reply.id;

    streamingMessageIdRef.current = replyId;
    setStreamingMessageId(replyId);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        ...reply,
        text: tokens.slice(0, tokenIndex).join(""),
        isStreaming: true,
      },
    ]);

    const revealNextToken = () => {
      if (streamingMessageIdRef.current !== replyId) return;

      tokenIndex += 1;
      const isComplete = tokenIndex >= tokens.length;
      const nextText = isComplete ? reply.text : tokens.slice(0, tokenIndex).join("");

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === replyId
            ? {
                ...message,
                text: nextText,
                isStreaming: !isComplete,
              }
            : message,
        ),
      );

      if (isComplete) {
        streamingMessageIdRef.current = null;
        streamTimeoutRef.current = null;
        setStreamingMessageId(null);
        return;
      }

      streamTimeoutRef.current = window.setTimeout(revealNextToken, streamDelayMs);
    };

    streamTimeoutRef.current = window.setTimeout(revealNextToken, streamDelayMs);
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping || streamingMessageId) return;

    const userMessage: CoAppingChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      time: getCurrentTime(),
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setIsConversationListOpen(false);
    setMessages(nextMessages);
    setDraft("");
    setIsVoiceMode(false);
    setIsAttachmentMenuOpen(false);
    setIsMoreMenuOpen(false);
    setVoiceStatus("idle");
    setThinkingStatusText(getThinkingStatusText(trimmed));
    setIsTyping(true);

    timeoutRef.current = window.setTimeout(async () => {
      const resolvedText = await resolveReply(trimmed, nextMessages);
      const enhancedReply = getContextualAssistantEnhancement(trimmed, resolvedText);
      const reply: CoAppingChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        text: enhancedReply.text,
        time: getCurrentTime(),
        createdAt: new Date().toISOString(),
        richBlocks: enhancedReply.richBlocks,
        followUps: enhancedReply.followUps,
      };
      setIsTyping(false);
      setThinkingStatusText("");
      startReplyStream(reply);
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
    if (voiceCaptureActiveRef.current || isTyping || streamingMessageId) return;

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

  const handleAction = (action: CoAppingChatAction) => {
    if (action.type === "navigate") {
      onAction?.(action);
      setIsAttachmentMenuOpen(false);
      setIsMoreMenuOpen(false);
      return;
    }

    sendMessage(action.prompt ?? action.label);
  };

  const handleFollowUpClick = (suggestion: CoAppingFollowUpSuggestion) => {
    if (suggestion.action) {
      handleAction(suggestion.action);
      return;
    }

    sendMessage(suggestion.prompt ?? suggestion.label);
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

  const handleFollowUpPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = followUpShelfRef.current;
    if (!node) return;

    followUpDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: node.scrollLeft,
      active: true,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFollowUpPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = followUpDragRef.current;
    const node = followUpShelfRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId || !node) return;

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 3) drag.moved = true;
    node.scrollLeft = drag.scrollLeft - deltaX;
  };

  const handleFollowUpPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = followUpDragRef.current;
    if (event.currentTarget.hasPointerCapture(drag.pointerId)) {
      event.currentTarget.releasePointerCapture(drag.pointerId);
    }
    drag.active = false;
  };

  const handleFollowUpChipClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    suggestion: CoAppingFollowUpSuggestion,
  ) => {
    if (followUpDragRef.current.moved) {
      event.preventDefault();
      followUpDragRef.current.moved = false;
      return;
    }

    handleFollowUpClick(suggestion);
  };

  const handleAttachmentChoice = (source: AttachmentSource) => {
    setIsAttachmentMenuOpen(false);

    const input =
      source === "camera" ? cameraInputRef.current : source === "photos" ? photosInputRef.current : filesInputRef.current;

    window.setTimeout(() => input?.click(), 0);
  };

  const resetPendingReply = () => {
    cancelVoiceCapture();
    stopReplyStream();
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTyping(false);
    setThinkingStatusText("");
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

  useEffect(() => {
    if (!entryContext) return;

    resetPendingReply();
    setMessages([]);
    setDraft("");
    setIsVoiceMode(false);
    setIsAttachmentMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsConversationListOpen(false);
    setAssistantMode("search");
    setConversationSearch("");
    setShowChatScrollBottom(false);
  }, [entryContext?.id]);

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
    return conversationMessages[conversationMessages.length - 1]
      ? formatMessageTimeLabel(conversationMessages[conversationMessages.length - 1])
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
        setMessages(withConversationMessageDates(conversation.messages, conversation.subtitle));
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
  const isConversationListVisible = isConversationListOpen || isConversationListExiting;
  const isDiscoveryMode = assistantMode === "discovery";
  const inputPlaceholder =
    voiceStatus === "recording"
      ? "Listening... speak in English"
      : voiceStatus === "transcribing"
        ? "Parsing voice..."
        : isVoiceMode
          ? "Listening..."
          : mergedLabels.inputPlaceholder;
  const showSuggestedTopics = messages.length === 0 && !isTyping && !isConversationListVisible && !isDiscoveryMode;
  const activeSuggestedTopics = entryContext?.suggestedTopics?.length
    ? entryContext.suggestedTopics
    : suggestedTopics;
  const newConversationGreeting = entryContext?.title ?? `${getGreetingLabel()}, ${assistantGreetingName}`;
  const hasActiveConversation = messages.length > 0;
  const isConversationDetailOpen = !isConversationListVisible && !isDiscoveryMode && hasActiveConversation;
  const isNewConversationOpen = !isConversationListVisible && !isDiscoveryMode && !hasActiveConversation;
  const showConversationOptions = isConversationDetailOpen || (isDiscoveryMode && hasActiveConversation);
  const lastMessageId = messages[messages.length - 1]?.id ?? "";
  const lastMessageText = messages[messages.length - 1]?.text ?? "";
  const latestMessage = messages[messages.length - 1];
  const activeFollowUps =
    !isConversationListVisible && !isDiscoveryMode && latestMessage?.role === "agent" && !latestMessage.isStreaming
      ? (latestMessage.followUps ?? [])
      : [];
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
  }, [isConversationDetailOpen, isTyping, lastMessageId, lastMessageText]);

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
      aria-label="CZ chatbot"
    >
      <ChatStatusBar />
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
          {isConversationListVisible ? (
            <button
              type="button"
              onClick={startNewConversation}
              className="mpc-chat-control-button"
              aria-label="Back to new conversation"
            >
              <BackIcon />
            </button>
          ) : isConversationDetailOpen ? (
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
          ) : isNewConversationOpen || isDiscoveryMode ? (
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

          {isConversationListVisible ? (
            <span className="mpc-chat-header-center-spacer" aria-hidden="true" />
          ) : (
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
          )}

          {isConversationListVisible ? (
            <button
              type="button"
              onClick={startNewConversation}
              className="mpc-chat-control-button"
              aria-label="Start new conversation"
            >
              <AddIcon />
            </button>
          ) : showConversationOptions ? (
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
                    <span className="mpc-more-menu-item-icon">
                      <ShareActionIcon />
                    </span>
                    <span>Share</span>
                  </button>
                  <button type="button" role="menuitem" className="mpc-more-menu-item">
                    <span className="mpc-more-menu-item-icon">
                      <RenameActionIcon />
                    </span>
                    <span>Rename conversation</span>
                  </button>
                  <button type="button" role="menuitem" className="mpc-more-menu-item">
                    <span className="mpc-more-menu-item-icon">
                      <DeleteActionIcon />
                    </span>
                    <span>Delete conversation</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : isNewConversationOpen || isDiscoveryMode ? (
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
      ) : isConversationListVisible ? (
        <div
          className={["mpc-conversation-list", isConversationListExiting ? "mpc-conversation-list-exiting" : ""]
            .filter(Boolean)
            .join(" ")}
          ref={conversationListRef}
          onScroll={handleConversationListScroll}
        >
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
          <div
            className={["mpc-chat-stack", showSuggestedTopics ? "mpc-chat-stack-empty" : ""].filter(Boolean).join(" ")}
          >
            {showSuggestedTopics ? (
              <div className="mpc-new-conversation-hero">
                <div className="mpc-new-conversation-mark" aria-hidden="true">
                  <ExportIcon variant="color" />
                </div>
                <h2 className="mpc-new-conversation-title">{newConversationGreeting}</h2>
              </div>
            ) : null}

            {messages.map((message) => (
              <BubbleMessage key={message.id} message={message} onAction={handleAction} />
            ))}

            {isTyping && (
              <div className="mpc-message mpc-message-agent">
                <div className="mpc-thinking-status" role="status" aria-live="polite">
                  <span className="mpc-thinking-status-icon">
                    <ThinkingStatusIcon />
                  </span>
                  <span>{thinkingStatusText || "Checking your banking context..."}</span>
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

      {isConversationListVisible ? (
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
        </div>
      ) : null}

      {showSuggestedTopics && (
        <div className="mpc-topic-area mpc-topic-shelf">
          <div className="mpc-topic-list">
            {activeSuggestedTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => sendMessage(topic.prompt ?? topic.label)}
                className="mpc-topic-row"
              >
                <SuggestedTopicIcon />
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isDiscoveryMode && <div className="mpc-chat-composer">
        {isConversationListVisible ? (
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
            {activeFollowUps.length > 0 ? (
              <div
                className="mpc-follow-up-shelf"
                ref={followUpShelfRef}
                onPointerDown={handleFollowUpPointerDown}
                onPointerMove={handleFollowUpPointerMove}
                onPointerUp={handleFollowUpPointerEnd}
                onPointerCancel={handleFollowUpPointerEnd}
                aria-label="Suggested next actions"
              >
                {activeFollowUps.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="mpc-follow-up-chip"
                    onClick={(event) => handleFollowUpChipClick(event, suggestion)}
                  >
                    {suggestion.label}
                  </button>
                ))}
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
