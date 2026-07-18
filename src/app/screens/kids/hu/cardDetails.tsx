/**
 * HU Kids Card Details and Card Settings: Face ID reveal, card artwork, freeze
 * overlay, copyable fields, and the card transaction panel.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent,
} from "react";
import FaceIdAnimation from "@/app/components/FaceIdAnimation";
import NavigationRow from "@/app/components/NavigationRow";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import type { AccountTransaction } from "@/data/accountDetails";
import huCardBgCatSrc from "@/assets/kids/figma/hu-card-bg-cat.png";
import huCardFrostTextureSrc from "@/assets/kids/hu-card-frost-window-cc0.jpg";
import type { HuKidsCard } from "./cards";
import { HU_KIDS_TRANSACTIONS } from "./data";
import {
  HU_MASKED_DECIMALS,
  HU_MASKED_INTEGER,
  formatHuKidsDayTotal,
  getHuKidsDecimalParts,
  getHuKidsSpendModel,
  groupHuKidsTransactionsByDay,
} from "./money";
import { HuKidsTransactionRow } from "./transactions";
import type { HuKidsCardDetailAction, HuKidsTransaction } from "./types";

const HU_KIDS_CARD_PROGRAM_ITEMS: readonly { id: string; icon: IconName; title: string; description: string }[] = [
  { id: "apple-pay", icon: "card-options-apple-pay", title: "APPLE PAY", description: "Active" },
  { id: "mastercard-priceless", icon: "card-options-mastercard", title: "MASTERCARD PRICELESS", description: "Discover all the advantages of the program" },
  { id: "card-registrations", icon: "card-options-registrations", title: "CARD REGISTRATIONS", description: "Subscriptions and saved card" },
];

const HU_KIDS_COMMON_SETTINGS_ITEMS: readonly { id: string; icon: IconName; title: string; description: string }[] = [
  { id: "view-pin", icon: "view-pin", title: "VIEW PIN", description: "View or change your card’s PIN" },
  { id: "card-limits", icon: "card-options-limits", title: "CARD LIMITS", description: "Manage your card limits" },
  { id: "push-notifications", icon: "account-option-push-notifications", title: "PUSH NOTIFICATIONS", description: "Manage app notifications" },
];

const HU_KIDS_DEBIT_SETTINGS_ITEMS: readonly { id: string; icon: IconName; title: string; description: string }[] = [
  { id: "card-delivery-address", icon: "card-options-delivery-address", title: "CARD DELIVERY ADDRESS", description: "Select the address to deliver the card" },
  { id: "reissue-card", icon: "card-options-reissue", title: "REISSUE CARD", description: "Request the reissue of this card" },
];

function HuKidsCardOptionRows({ items }: { items: readonly { id: string; icon: IconName; title: string; description: string }[] }) {
  return (
    <div className="flex flex-col" role="list">
      {items.map((item) => (
        <div key={item.id} role="listitem" data-card-option={item.id}>
          <NavigationRow
            title={item.title}
            description={item.description}
            leadingIconName={item.icon}
            trailingAccessory="chevron"
            rowHeight={80}
          />
        </div>
      ))}
    </div>
  );
}

export function HuKidsCardSettingsPage({ onBack }: { onBack: () => void }) {
  const [headerProgress, setHeaderProgress] = useState(0);

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  const settingsItems = [...HU_KIDS_COMMON_SETTINGS_ITEMS, ...HU_KIDS_DEBIT_SETTINGS_ITEMS];

  return (
    <div
      className="relative z-[1] flex h-full w-full flex-col overflow-hidden bg-[var(--hu-theme-card-bg)]"
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto scrollbar-hide"
        onScroll={handlePageScroll}
      >
        <PageHeader
          title="Card options"
          onBack={onBack}
          showHelp={false}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
        />

        <main className="pb-[40px]">
          <HuKidsCardOptionRows items={HU_KIDS_CARD_PROGRAM_ITEMS} />

          <section className="mt-[16px]" aria-label="General settings">
            <div className="px-[24px]">
              <SectionHeadingDivider title="GENERAL SETTINGS" />
            </div>
            <div className="pt-[16px]">
              <HuKidsCardOptionRows items={settingsItems} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export function HuKidsCardDetailsPage({
  card,
  onBack,
  onTransactionClick,
  onManageCard,
  showAmounts,
}: {
  card: HuKidsCard;
  onBack: () => void;
  onTransactionClick: (transaction: AccountTransaction) => void;
  onManageCard: () => void;
  showAmounts: boolean;
}) {
  const [transactionSearch, setTransactionSearch] = useState("");
  const [isCardBackVisible, setIsCardBackVisible] = useState(false);
  const [isFaceIdVisible, setIsFaceIdVisible] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<{ message: string; visible: boolean } | null>(null);
  const toastHideTimerRef = useRef<number | null>(null);
  const toastClearTimerRef = useRef<number | null>(null);
  const cardTransactions = useMemo(() => {
    const query = transactionSearch.trim().toLowerCase();
    if (!query) {
      return HU_KIDS_TRANSACTIONS;
    }

    return HU_KIDS_TRANSACTIONS.filter((transaction) =>
      [transaction.label, transaction.details, transaction.subtitle, transaction.pfmSubcategory]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [transactionSearch]);

  const revealCardDetails = () => {
    if (isCardBackVisible) {
      setIsCardBackVisible(false);
      return;
    }

    setIsFaceIdVisible(true);
  };

  const completeCardDetailsReveal = () => {
    setIsFaceIdVisible(false);
    setIsCardBackVisible(true);
  };

  useEffect(() => {
    return () => {
      if (toastHideTimerRef.current) {
        window.clearTimeout(toastHideTimerRef.current);
      }
      if (toastClearTimerRef.current) {
        window.clearTimeout(toastClearTimerRef.current);
      }
    };
  }, []);

  const showCopyToast = (message: string) => {
    if (toastHideTimerRef.current) {
      window.clearTimeout(toastHideTimerRef.current);
    }
    if (toastClearTimerRef.current) {
      window.clearTimeout(toastClearTimerRef.current);
    }

    setCopyToast({ message, visible: true });
    toastHideTimerRef.current = window.setTimeout(() => {
      setCopyToast((current) => (current?.message === message ? { ...current, visible: false } : current));
    }, 1800);
    toastClearTimerRef.current = window.setTimeout(() => {
      setCopyToast((current) => (current?.message === message ? null : current));
    }, 2150);
  };

  const copyCardValue = async (field: string, value: string, label: string) => {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      // The demo still confirms the copy intent when browser clipboard permissions are unavailable.
    }

    setCopiedField(field);
    showCopyToast(`${label} successfully copied`);
    window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1200);
  };

  const quickActions: HuKidsCardDetailAction[] = [
    { id: "card-details", iconName: "show-card-details", label: isCardBackVisible ? "Hide\ndetails" : "Card\ndetails", onClick: revealCardDetails, hidden: isCardFrozen },
    {
      id: "block-card",
      iconName: "block-card",
      label: isCardFrozen ? "Unblock\ncard" : "Block\ncard",
      onClick: () => {
        setIsCardFrozen((current) => !current);
        // Exit the card-details (flipped) view so sensitive fields are hidden again.
        setIsCardBackVisible(false);
      },
    },
    { id: "manage-card", iconName: "account-options", label: "Manage\ncard", onClick: onManageCard },
  ];
  const visibleQuickActions = quickActions.filter((action) => !action.hidden);

  return (
    <>
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <div style={{ "--uc-text": "var(--hu-theme-hero-fg)", "--uc-icon": "var(--hu-theme-hero-fg)" } as CSSProperties}>
          <PageHeader
            compact
            collapsedTitleProgress={1}
            includeSafeArea
            onBack={onBack}
            showHelp={false}
            title="Your cards"
            variant="transparent"
          />
        </div>

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto bg-[var(--hu-theme-card-bg)] pb-[36px]">
          <section className="bg-[var(--hu-theme-card-strong-bg)] px-[24px] pb-[28px] pt-[8px]">
            <HuKidsCardRevealStage
              card={card}
              copiedField={copiedField}
              isBackVisible={isCardBackVisible}
              isFrozen={isCardFrozen}
              onCopy={copyCardValue}
              onReveal={revealCardDetails}
              showAmounts={showAmounts}
            />

            <div className={`mt-[28px] grid gap-[18px] ${visibleQuickActions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`} data-hu-card-details-actions>
              {visibleQuickActions.map((action) => (
                <button
                  key={action.id}
                  aria-label={action.label.replace(/\s+/g, " ").trim()}
                  className="flex min-w-0 flex-col items-center gap-[10px]"
                  onClick={action.onClick}
                  type="button"
                >
                  <span className="grid size-[64px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm">
                    <AppIcon name={action.iconName} size={24} />
                  </span>
                  <span className="min-h-[32px] max-w-[76px] text-center text-[14px] font-medium leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
                    {action.label.split("\n").map((word) => (
                      <span key={word} className="block h-[16px]">
                        {word}
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <HuKidsCardTransactionsPanel
            onTransactionClick={onTransactionClick}
            searchValue={transactionSearch}
            showAmounts={showAmounts}
            transactions={cardTransactions}
            onSearchChange={setTransactionSearch}
          />
        </main>
      </div>

      {isFaceIdVisible ? <FaceIdAnimation onComplete={completeCardDetailsReveal} /> : null}
      <HuKidsCopyToast toast={copyToast} />
    </>
  );
}

function HuKidsCopyToast({ toast }: { toast: { message: string; visible: boolean } | null }) {
  if (!toast) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-[18px] z-[60] flex justify-center px-[16px]"
      data-hu-copy-toast
      role="status"
    >
      <div
        className={cn(
          "flex h-[34px] w-[343px] max-w-full items-center rounded-[48px] bg-[var(--uc-static-black)] px-[16px] py-[6px] shadow-[0_12px_26px_rgb(var(--uc-shadow-rgb)_/_0.24)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          toast.visible ? "translate-y-0 opacity-100" : "translate-y-[10px] opacity-0",
        )}
      >
        <p className="min-w-0 flex-1 truncate text-center text-[14px] font-bold leading-[20px] tracking-[0] text-[var(--uc-static-white)]">
          {toast.message}
        </p>
      </div>
    </div>
  );
}

function HuKidsCardRevealStage({
  card,
  copiedField,
  isBackVisible,
  isFrozen,
  onCopy,
  onReveal,
  showAmounts,
}: {
  card: HuKidsCard;
  copiedField: string | null;
  isBackVisible: boolean;
  isFrozen: boolean;
  onCopy: (field: string, value: string, label: string) => void;
  onReveal: () => void;
  showAmounts: boolean;
}) {
  const cardNumber = "5319 7200 0000 5678";
  const expiry = "09/29";
  const cvv = "214";
  const cardNumberDisplay = showAmounts ? cardNumber : "5319 7200 **** 5678";
  const spendModel = getHuKidsSpendModel();

  return (
    <div className="relative flex justify-center">
      <div
        className="relative h-[206px] w-[327px]"
        style={{ perspective: "1100px" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: isBackVisible ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <button
            aria-label="Reveal card details"
            className="absolute inset-0 overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,var(--uc-static-white)_34%,var(--uc-border-muted))] shadow-[0_18px_32px_color-mix(in_srgb,var(--uc-static-black)_28%,transparent)] transition-transform active:scale-[0.99]"
            onClick={onReveal}
            style={{ backfaceVisibility: "hidden" }}
            type="button"
          >
            <HuKidsCardFrontArtwork
              card={card}
              isFrozen={isFrozen}
              showAmounts={showAmounts}
              spendModel={spendModel}
            />
            <HuKidsCardFreezeOverlay isFrozen={isFrozen} />
          </button>

          <div
            className="absolute inset-0 overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,var(--uc-static-white)_34%,var(--uc-border-muted))] p-[18px] text-[var(--uc-static-white)] shadow-[0_18px_32px_color-mix(in_srgb,var(--uc-static-black)_28%,transparent)]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <img
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              draggable={false}
              height={206}
              src={huCardBgCatSrc}
              width={327}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--uc-static-black)_24%,transparent)]" />

            <div className="relative z-[1] flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] opacity-80">Card details</p>
                  <p className="mt-[4px] text-[18px] font-bold leading-[22px] tracking-[0]">{card.title}</p>
                </div>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--uc-static-black)_22%,transparent)] px-[10px] py-[5px] text-[14px] font-bold uppercase leading-[16px] tracking-[0]">
                  {isFrozen ? "Frozen" : "Active"}
                </span>
              </div>

              <div className="space-y-[8px]">
                <HuKidsCardCopyField
                  copied={copiedField === "number"}
                  label="Card number"
                  value={cardNumberDisplay}
                  onCopy={() => onCopy("number", cardNumber, "Account number")}
                />
                <div className="grid grid-cols-2 gap-[8px]">
                  <HuKidsCardCopyField
                    copied={copiedField === "expiry"}
                    label="Expiry"
                    value={expiry}
                    onCopy={() => onCopy("expiry", expiry, "Expiry date")}
                  />
                  <HuKidsCardCopyField
                    copied={copiedField === "cvv"}
                    label="CVV"
                    value={cvv}
                    onCopy={() => onCopy("cvv", cvv, "CVV")}
                  />
                </div>
              </div>
            </div>

            <HuKidsCardFreezeOverlay isFrozen={isFrozen} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HuKidsCardFrontArtwork({
  card,
  isFrozen,
  showAmounts,
  spendModel,
}: {
  card: HuKidsCard;
  isFrozen: boolean;
  showAmounts: boolean;
  spendModel: ReturnType<typeof getHuKidsSpendModel>;
}) {
  const amountParts = getHuKidsDecimalParts(spendModel.availableToSpend);

  return (
    <div
      aria-label={`${card.title} card ending ${card.lastDigits}`}
      className="relative h-full w-full overflow-hidden"
      role="img"
    >
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
        height={206}
        src={huCardBgCatSrc}
        width={327}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--uc-static-black)_8%,transparent)]" />

      <div className="absolute left-[14px] top-[14px] text-left text-[var(--uc-static-white)]">
        <p className="text-[14px] font-bold leading-[16px] tracking-[0]">{toTitleCase(card.holderName)}</p>
        <p className="mt-[1px] text-[14px] font-bold leading-[16px] tracking-[0] opacity-90">**** {card.lastDigits}</p>
      </div>

      <div className="absolute right-[16px] top-[61px] h-[24px] w-[110px] overflow-hidden">
        <UniCreditLogo className="h-[24px] w-[110px] [&_svg]:!h-full [&_svg]:!w-full" textColor="var(--uc-static-white)" />
      </div>

      <div
        aria-hidden={isFrozen}
        className={cn(
          "absolute bottom-[64px] left-[14px] text-left text-[var(--uc-static-white)] transition-opacity duration-200",
          isFrozen ? "opacity-0" : "opacity-100",
        )}
      >
        {showAmounts ? (
          <p className="flex items-baseline gap-[2px]">
            <span className="text-[28px] font-bold leading-[30px] tracking-[0]">{amountParts.integer}</span>
            <span className="text-[14px] font-normal leading-[16px] tracking-[0]">{amountParts.decimal} HUF</span>
          </p>
        ) : (
          <p className="flex items-baseline gap-[2px]">
            <span className="text-[28px] font-bold leading-[30px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[14px] font-normal leading-[16px] tracking-[0]">{HU_MASKED_DECIMALS} HUF</span>
          </p>
        )}
        <p className="mt-[2px] text-[12px] font-normal leading-[15px] tracking-[0] opacity-86">Available to spend</p>
      </div>

      <div className="absolute bottom-[59px] right-[13px]">
        <HuMastercardMark />
      </div>

      <p className="absolute bottom-[15px] left-[14px] max-w-[188px] truncate text-[16px] font-bold leading-[18px] tracking-[0] text-[var(--uc-static-white)]">
        {card.title}
      </p>
    </div>
  );
}

function HuMastercardMark() {
  return (
    <svg aria-hidden="true" className="h-[54px] w-[69px]" fill="none" viewBox="0 0 69 54">
      <mask id="hu-mastercard-mask-0" height="35" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="21" x="24" y="4">
        <path d="M44.5116 4.55664H24.1418V38.0654H44.5116V4.55664Z" fill="white" />
      </mask>
      <g mask="url(#hu-mastercard-mask-0)">
        <path d="M49.2267 -0.189453H19.4265V42.8119H49.2267V-0.189453Z" fill="#FF5F00" />
      </g>
      <mask id="hu-mastercard-mask-1" height="43" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="35" x="0" y="0">
        <path d="M26.311 21.2634C26.311 14.4287 29.5173 8.44839 34.4212 4.55644C30.8376 1.70866 26.311 0 21.3129 0C9.61914 0 0.188721 9.49258 0.188721 21.2634C0.188721 33.0342 9.61914 42.5267 21.3129 42.5267C26.2167 42.5267 30.7433 40.8181 34.4212 37.9703C29.423 34.0784 26.311 28.0031 26.311 21.2634Z" fill="white" />
      </mask>
      <g mask="url(#hu-mastercard-mask-1)">
        <path d="M39.042 -4.74609H-4.62085V47.3682H39.042V-4.74609Z" fill="#EB001B" />
      </g>
      <mask id="hu-mastercard-mask-2" height="2" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="2" x="66" y="33">
        <path d="M66.5789 34.4578V33.7934H66.8618V33.6984H66.2017V33.7934H66.4846L66.5789 34.4578ZM67.8991 34.4578V33.6035H67.7105L67.4276 34.1731L67.1447 33.6035H66.9561V34.4578H67.1447V33.7934L67.3333 34.3629H67.5219L67.7105 33.7934V34.4578H67.8991Z" fill="white" />
      </mask>
      <g mask="url(#hu-mastercard-mask-2)">
        <path d="M72.6143 28.8574H61.3921V39.2043H72.6143V28.8574Z" fill="#F79E1B" />
      </g>
      <mask id="hu-mastercard-mask-3" height="43" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="35" x="34" y="0">
        <path d="M68.5593 21.2634C68.5593 33.0342 59.1289 42.5267 47.4352 42.5267C42.5314 42.5267 38.0048 40.8181 34.3269 37.9703C39.2307 34.0784 42.4371 28.0031 42.4371 21.2634C42.4371 14.4287 39.2307 8.44839 34.3269 4.55644C37.9105 1.70866 42.4371 0 47.4352 0C59.1289 0 68.5593 9.49258 68.5593 21.2634Z" fill="white" />
      </mask>
      <g mask="url(#hu-mastercard-mask-3)">
        <path d="M73.2744 -4.74609H29.6116V47.3682H73.2744V-4.74609Z" fill="#F79E1B" />
      </g>
    </svg>
  );
}

function toTitleCase(value: string) {
  return value
    .toLocaleLowerCase("en")
    .replace(/\b\p{L}/gu, (match) => match.toLocaleUpperCase("en"));
}

function HuKidsCardFreezeOverlay({ isFrozen }: { isFrozen: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="hu-card-freeze-overlay pointer-events-none absolute inset-0 overflow-hidden rounded-[10px]"
      data-frozen={isFrozen ? "true" : "false"}
      data-hu-card-freeze-overlay
    >
      <div className="hu-card-freeze-sheet absolute inset-0">
        <div className="hu-card-freeze-wash absolute inset-0" />
        <div className="hu-card-freeze-blur absolute inset-0" />
        <div className="hu-card-frost-bloom absolute inset-0" />
        <img
          alt=""
          className="hu-card-frost-photo absolute inset-0 h-full w-full object-cover"
          draggable={false}
          src={huCardFrostTextureSrc}
        />

        <div className="hu-card-freeze-front absolute inset-0" />
        <div className="hu-card-frost-rim absolute inset-0 rounded-[10px]" />
      </div>

      <div className="hu-card-freeze-badge absolute right-[14px] top-[14px] rounded-full px-[11px] py-[6px] backdrop-blur-[8px]">
        <span className="select-none text-[11px] font-bold uppercase leading-[13px] tracking-[0.9px] text-[var(--uc-text)]">
          Frozen
        </span>
      </div>
    </div>
  );
}

function HuKidsCardCopyField({
  copied,
  label,
  onCopy,
  value,
}: {
  copied: boolean;
  label: string;
  onCopy: () => void;
  value: string;
}) {
  return (
    <button
      className="flex min-h-[48px] w-full items-center justify-between gap-[10px] rounded-[10px] bg-[color-mix(in_srgb,var(--uc-static-black)_24%,transparent)] px-[12px] py-[8px] text-left transition-colors active:bg-[color-mix(in_srgb,var(--uc-static-black)_34%,transparent)]"
      onClick={onCopy}
      type="button"
    >
      <span className="min-w-0">
        <span className="block text-[14px] font-bold uppercase leading-[16px] tracking-[0] opacity-70">{label}</span>
        <span className="mt-[3px] block truncate text-[16px] font-bold leading-[18px] tracking-[0]">{value}</span>
      </span>
      <span className="grid size-[28px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]">
        {copied ? <AppIcon name="prime-check" size={16} /> : <AppIcon name="copy-documents" size={16} />}
      </span>
    </button>
  );
}

function HuKidsCardTransactionsPanel({
  onSearchChange,
  onTransactionClick,
  searchValue,
  showAmounts,
  transactions,
}: {
  onSearchChange: (value: string) => void;
  onTransactionClick: (transaction: AccountTransaction) => void;
  searchValue: string;
  showAmounts: boolean;
  transactions: HuKidsTransaction[];
}) {
  const transactionGroups = useMemo(() => groupHuKidsTransactionsByDay(transactions), [transactions]);

  return (
    <section className="bg-[var(--hu-theme-card-bg)] pb-[28px] pt-[24px]" data-hu-card-details-transactions>
      <div className="px-[24px]">
        <AccountSearchBar value={searchValue} onValueChange={onSearchChange} />
      </div>

      <div className="mt-[26px]">
        {transactionGroups.length > 0 ? (
          transactionGroups.map((group, groupIndex) => (
            <div key={group.key} className={groupIndex > 0 ? "pt-[18px]" : undefined}>
              <AccountTransactionMonthDivider
                currency="HUF"
                title={group.title}
                total={group.transactions.length > 1 ? formatHuKidsDayTotal(group.total, showAmounts) : undefined}
              />

              <div className="px-[24px] pt-[16px]">
                {group.transactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    {index > 0 ? <div className="my-[16px] h-px bg-[var(--uc-border)]" /> : null}
                    <HuKidsTransactionRow
                      compact
                      onClick={onTransactionClick}
                      showAmounts={showAmounts}
                      transaction={transaction}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="px-[24px] py-[28px] text-center text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            No transactions found
          </div>
        )}
      </div>
    </section>
  );
}
