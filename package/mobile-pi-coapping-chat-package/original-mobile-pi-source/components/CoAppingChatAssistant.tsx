import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Send } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "agent" | "user";
  text: string;
  time: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "hello",
    role: "agent",
    text: "Hi Mihai!",
    time: "10:00",
  },
  {
    id: "intro",
    role: "agent",
    text: "I am your Smart Assistant. I can help you understand this banking simulation, products, payments, cards, and security options.",
    time: "10:00",
  },
];

const SUGGESTED_TOPICS = [
  "How do payments work?",
  "Show me product offers",
  "Is my card secure?",
  "Explain spending insights",
];

function getAssistantReply(input: string) {
  const normalized = input.toLowerCase();

  if (normalized.includes("payment") || normalized.includes("transfer")) {
    return "In the demo you can start from Payments, choose a domestic transfer, review the recipient and amount, then sign the payment. I can also guide you through each step.";
  }

  if (normalized.includes("product") || normalized.includes("offer")) {
    return "The Products area groups accounts, cards, loans, protection, investments, and contextual offers. Each card is meant to explain the next best action without leaving the banking flow.";
  }

  if (normalized.includes("card") || normalized.includes("secure") || normalized.includes("security")) {
    return "For cards and security, the demo highlights card details, transaction review, consent, messages, and support access. In a real app, sensitive actions would require strong authentication.";
  }

  if (normalized.includes("spending") || normalized.includes("insight") || normalized.includes("budget")) {
    return "Spending insights summarize categories, recent movements, and patterns so the customer can understand where money goes before choosing a product or payment action.";
  }

  return "I can help with accounts, payments, products, cards, security, and how this simulation is structured. Pick a topic below or ask a specific question.";
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function UniCreditAvatar() {
  return (
    <div className="relative h-[32px] w-[32px] shrink-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.16)]">
      <div className="absolute left-[4px] top-[4px] grid h-[24px] w-[24px] place-items-center rounded-full bg-[var(--uc-brand)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="18"
          viewBox="0 0 20 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.86433 3.04455C10.047 2.80098 9.98611 2.61831 9.86433 2.49653C9.80344 2.43564 8.0376 1.40049 8.0376 1.40049C7.91582 1.3396 7.85493 1.15693 7.85493 1.03515C7.85493 0.791582 8.0376 0.608909 8.34206 0.487127C9.43809 0.182673 13.396 0 14.7356 0C15.3445 0 16.6232 0 17.4148 0.0608909C18.3282 0.121782 19.0589 0.304455 19.1806 0.730691C19.546 1.58316 18.9371 2.13118 18.5717 2.49653C18.3891 2.6792 15.5272 5.3584 12.1782 8.28117C9.25542 10.8386 5.96731 13.4569 4.0188 14.9183C1.3396 16.9277 0.791582 17.2321 0.791582 17.2321C0.730691 17.293 0.608909 17.293 0.487127 17.293C0.182673 17.293 0 17.1104 0 16.8059C0 16.6841 0.0608909 16.6232 0.0608909 16.5014C0.0608909 16.5014 5.3584 8.89008 6.27177 7.61137C7.24602 6.33266 9.55988 3.349 9.55988 3.349C9.55988 3.349 9.68166 3.28811 9.86433 3.04455Z"
            fill="white"
          />
        </svg>
      </div>
      <span className="absolute bottom-[1px] right-[1px] h-[8px] w-[8px] rounded-full border border-white bg-[#35a854]" />
    </div>
  );
}

function BubbleMessage({ message }: { message: ChatMessage }) {
  const isAgent = message.role === "agent";

  if (isAgent) {
    return (
      <div className="flex w-full flex-col gap-[4px] pl-[16px] pr-[72px]">
        <div className="flex items-end gap-[8px]">
          <UniCreditAvatar />
          <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
            <div className="w-fit max-w-full rounded-[16px] bg-[#004f95] px-[12px] py-[10px] text-[16px] leading-[22px] text-white">
              {message.text}
            </div>
          </div>
        </div>
        <div className="pl-[40px] text-[14px] leading-[20px] text-[#666666]">{message.time}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-end gap-[4px] pl-[86px] pr-[16px]">
      <div className="max-w-full rounded-[16px] bg-white px-[12px] py-[10px] text-[16px] leading-[22px] text-[#262626] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {message.text}
      </div>
      <div className="text-[14px] leading-[20px] text-[#666666]">{message.time}</div>
    </div>
  );
}

interface CoAppingChatAssistantProps {
  onClose: () => void;
}

export default function CoAppingChatAssistant({ onClose }: CoAppingChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const sentAt = getCurrentTime();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      time: sentAt,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setDraft("");
    setIsTyping(true);

    timeoutRef.current = window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        text: getAssistantReply(trimmed),
        time: getCurrentTime(),
      };
      setMessages((currentMessages) => [...currentMessages, reply]);
      setIsTyping(false);
      timeoutRef.current = null;
    }, 650);
  };

  return (
    <section
      className="absolute inset-0 z-[120] flex h-full w-full flex-col overflow-hidden bg-[#f5f5f5] text-[#262626]"
      aria-label="Co-apping AI chat"
    >
      <header className="relative h-[112px] shrink-0 bg-white shadow-[inset_0_-1px_0_#e0e0e0]">
        <div className="h-[54px] shrink-0" aria-hidden="true" />

        <div className="flex h-[58px] items-center gap-[8px] px-[4px] pb-[6px]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[40px] w-[32px] items-center justify-center text-[#262626]"
            aria-label="Back to previous screen"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <UniCreditAvatar />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[16px] font-bold leading-[18px] text-[#262626]">
              Smart Assistant
            </h1>
            <p className="text-[12px] leading-[16px] text-[#35a854]">Online now</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-[12px] pt-[16px] scrollbar-hide">
        <div className="flex flex-col gap-[16px]">
          {messages.map((message) => (
            <BubbleMessage key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex w-full flex-col gap-[4px] pl-[16px] pr-[72px]">
              <div className="flex items-end gap-[8px]">
                <UniCreditAvatar />
                <div className="flex h-[36px] items-center gap-[5px] rounded-[16px] bg-[#004f95] px-[12px]">
                  <span className="h-[6px] w-[6px] rounded-full bg-white/75" />
                  <span className="h-[6px] w-[6px] rounded-full bg-white/55" />
                  <span className="h-[6px] w-[6px] rounded-full bg-white/35" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 rounded-t-[32px] bg-white px-[16px] pb-[8px] pt-[16px] shadow-[0_-4px_18px_rgba(0,0,0,0.1)]">
        <div className="mb-[12px]">
          <p className="mb-[8px] text-[12px] font-bold uppercase leading-[16px] text-[#666666]">
            Suggested topics
          </p>
          <div className="flex flex-wrap gap-[8px]">
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => sendMessage(topic)}
                className="rounded-full border border-[#d7d7d7] bg-[#f5f5f5] px-[12px] py-[8px] text-[14px] leading-[18px] text-[#262626]"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <form
          className="flex h-[44px] items-center gap-[12px]"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(draft);
          }}
        >
          <button
            type="button"
            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#262626]"
            aria-label="Add attachment"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[16px] leading-[22px] text-[#262626] outline-none placeholder:text-[#666666]"
            placeholder="Write a message"
            aria-label="Write a message"
          />
          <button
            type="submit"
            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#004f95] text-white"
            aria-label="Send message"
          >
            <Send size={20} fill="white" strokeWidth={2.2} />
          </button>
        </form>

        <div className="flex h-[34px] items-end justify-center pb-[8px]">
          <div className="h-[5px] w-[134px] rounded-full bg-black" />
        </div>
      </div>
    </section>
  );
}
