import { useState } from "react";
import CoAppingChatAssistant from "@/app/components/CoAppingChatAssistant";

function ChatBubbleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.8086 9.24999C17.0496 9.24999 16.4336 8.63399 16.4336 7.87499C16.4336 7.11599 17.0496 6.49999 17.8086 6.49999C18.5676 6.49999 19.1836 7.11599 19.1836 7.87499C19.1836 8.63399 18.5676 9.24999 17.8086 9.24999ZM12.9963 9.24999C12.2373 9.24999 11.6213 8.63399 11.6213 7.87499C11.6213 7.11599 12.2373 6.49999 12.9963 6.49999C13.7553 6.49999 14.3713 7.11599 14.3713 7.87499C14.3713 8.63399 13.7553 9.24999 12.9963 9.24999ZM8.18364 9.24999C7.42464 9.24999 6.80864 8.63399 6.80864 7.87499C6.80864 7.11599 7.42464 6.49999 8.18364 6.49999C8.94265 6.49999 9.55864 7.11599 9.55864 7.87499C9.55864 8.63399 8.94265 9.24999 8.18364 9.24999ZM4.74658 1C3.22789 1 1.99658 2.23131 1.99658 3.75L1.99796 23H2.21933C3.61839 23 4.52108 22.2032 5.42308 20.7931L8.66258 15.4375H21.2466C22.7653 15.4375 23.9966 14.2062 23.9966 12.6875V1H4.74658Z"
        fill="white"
      />
    </svg>
  );
}

export default function CoAppingChatLauncher() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="absolute bottom-[92px] right-[16px] z-20 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#004f95] text-white shadow-[0_8px_22px_rgba(0,79,149,0.28)]"
        aria-label="Open Smart Assistant chat"
      >
        <ChatBubbleIcon />
        <span className="absolute right-[4px] top-[4px] h-[12px] w-[12px] rounded-full border-[2px] border-white bg-[#35a854]" />
      </button>

      {isChatOpen && <CoAppingChatAssistant onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
