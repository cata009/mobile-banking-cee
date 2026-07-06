import {
  ArrowLeft,
  AudioLines,
  Building2,
  Camera,
  Compass,
  CreditCard,
  FileText,
  Images,
  Landmark,
  LineChart,
  MapPin,
  Mic,
  MonitorUp,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

export function UniCreditAvatar() {
  return (
    <div className="mpc-avatar" aria-hidden="true">
      <div className="mpc-avatar-mark">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.86433 3.04455C10.047 2.80098 9.98611 2.61831 9.86433 2.49653C9.80344 2.43564 8.0376 1.40049 8.0376 1.40049C7.91582 1.3396 7.85493 1.15693 7.85493 1.03515C7.85493 0.791582 8.0376 0.608909 8.34206 0.487127C9.43809 0.182673 13.396 0 14.7356 0C15.3445 0 16.6232 0 17.4148 0.0608909C18.3282 0.121782 19.0589 0.304455 19.1806 0.730691C19.546 1.58316 18.9371 2.13118 18.5717 2.49653C18.3891 2.6792 15.5272 5.3584 12.1782 8.28117C9.25542 10.8386 5.96731 13.4569 4.0188 14.9183C1.3396 16.9277 0.791582 17.2321 0.791582 17.2321C0.730691 17.293 0.608909 17.293 0.487127 17.293C0.182673 17.293 0 17.1104 0 16.8059C0 16.6841 0.0608909 16.6232 0.0608909 16.5014C0.0608909 16.5014 5.3584 8.89008 6.27177 7.61137C7.24602 6.33266 9.55988 3.349 9.55988 3.349C9.55988 3.349 9.68166 3.28811 9.86433 3.04455Z"
            fill="white"
          />
        </svg>
      </div>
      <span className="mpc-avatar-status" />
    </div>
  );
}

export function ChatBubbleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.8086 9.24999C17.0496 9.24999 16.4336 8.63399 16.4336 7.87499C16.4336 7.11599 17.0496 6.49999 17.8086 6.49999C18.5676 6.49999 19.1836 7.11599 19.1836 7.87499C19.1836 8.63399 18.5676 9.24999 17.8086 9.24999ZM12.9963 9.24999C12.2373 9.24999 11.6213 8.63399 11.6213 7.87499C11.6213 7.11599 12.2373 6.49999 12.9963 6.49999C13.7553 6.49999 14.3713 7.11599 14.3713 7.87499C14.3713 8.63399 13.7553 9.24999 12.9963 9.24999ZM8.18364 9.24999C7.42464 9.24999 6.80864 8.63399 6.80864 7.87499C6.80864 7.11599 7.42464 6.49999 8.18364 6.49999C8.94265 6.49999 9.55864 7.11599 9.55864 7.87499C9.55864 8.63399 8.94265 9.24999 8.18364 9.24999ZM4.74658 1C3.22789 1 1.99658 2.23131 1.99658 3.75L1.99796 23H2.21933C3.61839 23 4.52108 22.2032 5.42308 20.7931L8.66258 15.4375H21.2466C22.7653 15.4375 23.9966 14.2062 23.9966 12.6875V1H4.74658Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ExportIcon({ variant = "mono" }: { variant?: "mono" | "color" } = {}) {
  const isColor = variant === "color";
  const mainFill = isColor ? "url(#mpc-export-main-gradient)" : "currentColor";
  const accentFill = isColor ? "url(#mpc-export-accent-gradient)" : "currentColor";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      {isColor ? (
        <defs>
          <linearGradient id="mpc-export-main-gradient" x1="12" y1="8" x2="58" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00a7b3" />
            <stop offset="0.52" stopColor="#008c95" />
            <stop offset="1" stopColor="#0072ce" />
          </linearGradient>
          <linearGradient id="mpc-export-accent-gradient" x1="55" y1="4" x2="70" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#004f95" />
            <stop offset="1" stopColor="#0072ce" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d="M36 0C40.1009 27.3466 44.6534 31.8991 72 36C44.6534 40.1009 40.1009 44.6534 36 72C31.8991 44.6534 27.3466 40.1009 0 36C27.3466 31.8991 31.8991 27.3466 36 0Z"
        fill={mainFill}
      />
      <path
        d="M62.1468 4.5459C63.0102 10.3031 63.9686 11.2615 69.7258 12.1248C63.9686 12.9882 63.0102 13.9466 62.1468 19.7038C61.2835 13.9466 60.3251 12.9882 54.5679 12.1248C60.3251 11.2615 61.2835 10.3031 62.1468 4.5459Z"
        fill={accentFill}
      />
    </svg>
  );
}

export function BackIcon() {
  return <ArrowLeft size={24} strokeWidth={3} aria-hidden="true" />;
}

export function AddIcon() {
  return <Plus size={24} strokeWidth={3} aria-hidden="true" />;
}

export function CameraIcon() {
  return <Camera size={16} strokeWidth={1.9} aria-hidden="true" />;
}

export function PhotosIcon() {
  return <Images size={16} strokeWidth={1.9} aria-hidden="true" />;
}

export function FileAttachmentIcon() {
  return <FileText size={16} strokeWidth={1.9} aria-hidden="true" />;
}

export function SendIcon() {
  return <Send size={17} fill="currentColor" strokeWidth={1.8} aria-hidden="true" />;
}

export function MicrophoneIcon() {
  return <Mic size={16} strokeWidth={2.4} aria-hidden="true" />;
}

export function VoiceModeIcon() {
  return <AudioLines size={22} strokeWidth={2.5} aria-hidden="true" />;
}

export function CloseIcon() {
  return <X size={22} strokeWidth={2.5} aria-hidden="true" />;
}

export function ConversationsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MoreIcon() {
  return <MoreHorizontal size={22} strokeWidth={2.4} aria-hidden="true" />;
}

export function ShareActionIcon() {
  return <Share2 size={16} strokeWidth={1.9} aria-hidden="true" />;
}

export function RenameActionIcon() {
  return <Pencil size={16} strokeWidth={1.9} aria-hidden="true" />;
}

export function DeleteActionIcon() {
  return <Trash2 size={16} strokeWidth={1.9} aria-hidden="true" />;
}

export function ThinkingStatusIcon() {
  return <Sparkles size={18} strokeWidth={2.4} aria-hidden="true" />;
}

export function SearchModeIcon() {
  return <Search size={20} strokeWidth={2.4} aria-hidden="true" />;
}

export function DiscoveryModeIcon() {
  return <Compass size={20} strokeWidth={2.3} aria-hidden="true" />;
}

export function SuggestedTopicIcon({ variant }: { variant?: "payments" | "offers" | "security" | "insights" } = {}) {
  if (!variant) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="4.5" y="4.9" width="13" height="12.2" rx="2.2" stroke="currentColor" strokeWidth="1.55" />
        <path d="M8.2 9.1H13.8" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        <path d="M8.2 13H12.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "offers") return <Tag size={22} strokeWidth={2.2} aria-hidden="true" />;
  if (variant === "security") return <ShieldCheck size={22} strokeWidth={2.2} aria-hidden="true" />;
  if (variant === "insights") return <LineChart size={22} strokeWidth={2.2} aria-hidden="true" />;
  return <CreditCard size={22} strokeWidth={2.2} aria-hidden="true" />;
}

export function PanelIcon({ name }: { name: "smart" | "rates" | "location" | "share" }) {
  if (name === "rates") return <Landmark size={28} strokeWidth={2.2} aria-hidden="true" />;
  if (name === "location") return <MapPin size={28} strokeWidth={2.2} aria-hidden="true" />;
  if (name === "share") return <MonitorUp size={28} strokeWidth={2.2} aria-hidden="true" />;
  return <Building2 size={28} strokeWidth={2.2} aria-hidden="true" />;
}
