import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import { AppIcon, type IconName } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import BottomNavigation from "@/app/components/BottomNavigation";
import Card from "@/app/components/cards/Card";
import FaceIdAnimation from "@/app/components/FaceIdAnimation";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import PageHeader from "@/app/components/PageHeader";
import StatusBar from "@/app/components/StatusBar";
import { useDemo } from "@/app/state/demoStore";
import type { ThemeMode } from "@/app/state/demoTypes";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import PrimaryButton from "@/app/components/PrimaryButton";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import LinkButton from "@/app/components/ui/LinkButton";
import { cn } from "@/app/components/ui/utils";
import { getDocumentsCountForCountry } from "@/app/config/documentsConfig";
import { getMoreCardsForCountry, type MoreCardType } from "@/app/config/moreCardsConfig";
import {
  getPaymentsMenuForCountry,
  type NewPaymentAction,
  type NewPaymentSheetConfig,
  type PaymentHeroItem,
} from "@/app/config/paymentsMenuConfig";
import {
  getProductsMenuForCountry,
  type ProductsCard,
  type ProductsOffer,
} from "@/app/config/productsMenuConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatMoney, formatMoneyNumber } from "@/app/registry/countryConfig";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import { ContactsCard } from "@/app/screens/more/cards/ContactsCard";
import { DocumentsCard } from "@/app/screens/more/cards/DocumentsCard";
import { MyRequestsCard } from "@/app/screens/more/cards/MyRequestsCard";
import { SettingsCard } from "@/app/screens/more/cards/SettingsCard";
import { TutorialCard } from "@/app/screens/more/cards/TutorialCard";
import MessagesScreen from "@/app/screens/messages/MessagesScreen";
import { TransactionDetailScreen } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import huLearnAskHelpSrc from "../../../assets/kids/learn/hu-learn-ask-help.png";
import huLearnBalanceSrc from "../../../assets/kids/learn/hu-learn-balance.png";
import huLearnBoostSrc from "../../../assets/kids/learn/hu-learn-boost.png";
import huLearnCardFreezeSrc from "../../../assets/kids/learn/hu-learn-card-freeze.png";
import huLearnCardPaySrc from "../../../assets/kids/learn/hu-learn-card-pay.png";
import huLearnCardPrivateSrc from "../../../assets/kids/learn/hu-learn-card-private.png";
import huLearnMoneyCheckSrc from "../../../assets/kids/learn/hu-learn-money-check.png";
import huLearnPauseSrc from "../../../assets/kids/learn/hu-learn-pause.png";
import huLearnPrivateCodesSrc from "../../../assets/kids/learn/hu-learn-private-codes.png";
import huLearnReportSafetySrc from "../../../assets/kids/learn/hu-learn-report-safety.png";
import huLearnRequestAmountSrc from "../../../assets/kids/learn/hu-learn-request-amount.png";
import huLearnRequestReasonSrc from "../../../assets/kids/learn/hu-learn-request-reason.png";
import huLearnRequestWaitSrc from "../../../assets/kids/learn/hu-learn-request-wait.png";
import huLearnSpendTodaySrc from "../../../assets/kids/learn/hu-learn-spend-today.png";
import huLearnTargetSrc from "../../../assets/kids/learn/hu-learn-target.png";
import huLearnTopicCardConfidenceSrc from "../../../assets/kids/learn/hu-learn-topic-card-confidence.png";
import huLearnTopicMoneyBasicsSrc from "../../../assets/kids/learn/hu-learn-topic-money-basics.png";
import huLearnTopicOnlineSafetySrc from "../../../assets/kids/learn/hu-learn-topic-online-safety.png";
import huLearnTopicRequestMoneySrc from "../../../assets/kids/learn/hu-learn-topic-request-money.png";
import huLearnTopicSavingGoalsSrc from "../../../assets/kids/learn/hu-learn-topic-saving-goals.png";
import womanProfileSrc from "../../../assets/kids/woman-profile.png";
import type { AccountTransaction } from "@/data/accountDetails";
import {
  getKidsHomeConcept,
  getPocketProgress,
  isKidsHomeCountry,
  type KidsBottomNavId,
  type KidsHomeAction,
  type KidsHomeCountry,
  type KidsHomeFeedItem,
  type KidsHomePocket,
  type KidsHomeStyle,
  type KidsMarketHomeConcept,
} from "@/data/kidsMarketHomeConcepts";
import {
  RO_KIDS_GOALS,
  RO_KIDS_LEARN_MODULES,
  goalProgress,
  type LearnModule,
  type SavingGoal,
} from "@/data/roKidsBanking";
import type { CountryId } from "@/app/state/demoTypes";

interface KidsMarketHomeAppProps {
  country: CountryId;
}

const TONE_CLASSES: Record<KidsHomeAction["tone"], { bg: string; text: string; iconBg: string }> = {
  red: {
    bg: "bg-[color-mix(in_srgb,var(--uc-red-main)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-red-main)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-red-main)_16%,var(--uc-surface))]",
  },
  teal: {
    bg: "bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-action)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-action)_16%,var(--uc-surface))]",
  },
  blue: {
    bg: "bg-[color-mix(in_srgb,var(--uc-product-blue)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-product-blue)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-product-blue)_16%,var(--uc-surface))]",
  },
  green: {
    bg: "bg-[color-mix(in_srgb,var(--uc-green-status)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-green-status)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-green-status)_16%,var(--uc-surface))]",
  },
  yellow: {
    bg: "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_18%,var(--uc-surface))]",
    text: "text-[var(--uc-primary-k1)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_28%,var(--uc-surface))]",
  },
  orange: {
    bg: "bg-[color-mix(in_srgb,var(--uc-orange-main)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-orange-main)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-orange-main)_16%,var(--uc-surface))]",
  },
  neutral: {
    bg: "bg-[var(--uc-surface)]",
    text: "text-[var(--uc-text)]",
    iconBg: "bg-[var(--uc-neutral-100)]",
  },
};

function formatKidsMoney(amount: number, country: KidsHomeCountry) {
  return formatMoney(amount, country, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatSignedKidsMoney(amount: number, country: KidsHomeCountry) {
  const formatted = formatKidsMoney(Math.abs(amount), country);
  return `${amount >= 0 ? "+" : "-"}${formatted}`;
}

function resolveIconName(icon: string): IconName {
  return icon as IconName;
}

const SK_TASKS = [
  { title: "Clean your room", status: "TO DO", reward: 5, icon: "nav-home", tone: "green" },
  { title: "Do your homework", status: "TO DO", reward: 12, icon: "book-open", tone: "teal" },
  { title: "Fruit per day", status: "Rejected by parent", reward: 8, icon: "gift", tone: "orange" },
] as const;

const SK_LESSONS = [
  { title: "ESG", icon: "piggy-bank", tone: "green" },
  { title: "Skills for transition", icon: "send", tone: "orange" },
  { title: "Saving habits", icon: "gift", tone: "teal" },
  { title: "What is a budget?", icon: "receipt-text", tone: "blue" },
] as const;

const SK_MORE_ITEMS = [
  { title: "Analytics", icon: "receipt-text", tone: "teal" },
  { title: "My profile", icon: "user-round", tone: "orange" },
  { title: "Settings", icon: "shield-check", tone: "green" },
  { title: "Contacts and info", icon: "header-messages", tone: "blue" },
  { title: "My family", icon: "users", tone: "orange" },
] as const;

type RsKidsNavId = "home" | "analytics" | "payments" | "products" | "more";
type RsKidsActionId = "ask" | "goal" | "freeze" | "more";

const RS_KIDS_RUNTIME_COUNTRY: Extract<CountryId, "RS"> = "RS";

const RS_KIDS_ACTIONS: Array<{ id: RsKidsActionId; label: string; icon: IconName }> = [
  { id: "ask", label: "Ask family", icon: "circle-dollar-sign" },
  { id: "goal", label: "Add to goal", icon: "piggy-bank" },
  { id: "freeze", label: "Freeze card", icon: "shield-check" },
  { id: "more", label: "More", icon: "nav-more" },
];

const RS_KIDS_MONEY_MOMENTS = [
  { label: "Allowance", value: "2 days", detail: "5,000 RSD lands Friday", icon: "calendar-days" },
  { label: "Request", value: "Ready", detail: "School trip note for Mum", icon: "send" },
  { label: "Safety", value: "On", detail: "Online payments are off", icon: "shield-check" },
] as const;

const RS_KIDS_EARN_TASKS = [
  { title: "Math worksheet", reward: 400, status: "Due today", icon: "book-open" },
  { title: "Take out recycling", reward: 300, status: "Ready after school", icon: "clipboard-check" },
] as const;

const RS_KIDS_SAFETY_ITEMS = [
  { label: "Card", value: "Active", icon: "credit-card" },
  { label: "Online", value: "Off", icon: "lock" },
  { label: "Weekly limit", value: "5,000 RSD", icon: "shield-check" },
  { label: "Parent view", value: "Payments", icon: "users" },
] as const;

const RS_KIDS_SPENDING_CATEGORIES = [
  { label: "Food", amount: 460, width: 34, toneClassName: "bg-[var(--uc-product-pink)]" },
  { label: "School", amount: 890, width: 66, toneClassName: "bg-[var(--uc-product-blue)]" },
  { label: "Fun", amount: 0, width: 12, toneClassName: "bg-[var(--uc-yellow-gold)]" },
] as const;

export default function KidsMarketHomeApp({ country }: KidsMarketHomeAppProps) {
  const resolvedCountry = isKidsHomeCountry(country) ? country : "CZ";
  const concept = getKidsHomeConcept(resolvedCountry);
  const [activeTab, setActiveTab] = useState<KidsBottomNavId>("home");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const primaryPocket = concept.pockets[0];
  const progress = primaryPocket ? getPocketProgress(primaryPocket) : 0;
  const isSkDocumentMode = concept.style === "sk-bulbank-kids";

  useEffect(() => {
    if (!concept.nav.some((item) => item.id === activeTab)) {
      setActiveTab("home");
    }
  }, [activeTab, concept.nav]);

  const activePanelTitle = useMemo(() => {
    const active = concept.nav.find((item) => item.id === activeTab);
    return active?.label ?? "Home";
  }, [activeTab, concept.nav]);

  if (concept.style === "hu-smart-fintech") {
    return <HuCeeLightRestyleApp concept={concept} />;
  }

  if (concept.style === "rs-safe-spend-coach") {
    return <RsKidsSafeSpendApp concept={concept} />;
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
      <div className="flex-1 overflow-y-auto pb-[104px] pt-[2px]">
        <KidsMarketHeader
          activeTab={activeTab}
          concept={concept}
          isBalanceVisible={isBalanceVisible}
          onToggleBalance={() => setIsBalanceVisible((current) => !current)}
        />

        <main className="space-y-[16px] px-[16px]">
          {!isSkDocumentMode || activeTab === "home" ? (
            <ConceptHero
              concept={concept}
              isBalanceVisible={isBalanceVisible}
              primaryPocketProgress={progress}
            />
          ) : null}

          {isSkDocumentMode ? (
            <SkBulbankContent activeTab={activeTab} concept={concept} />
          ) : (
            <>
              {activeTab !== "home" ? (
                <ActiveNavPreview
                  activeTab={activeTab}
                  concept={concept}
                  panelTitle={activePanelTitle}
                />
              ) : null}

              <ActionGrid actions={concept.actions} />

              <PocketSection concept={concept} />

              <CoachSection concept={concept} />

              <ActivitySection concept={concept} />
            </>
          )}
        </main>
      </div>

      <KidsConceptBottomNav
        activeTab={activeTab}
        items={concept.nav}
        style={concept.style}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

function RsKidsSafeSpendApp({ concept }: { concept: KidsMarketHomeConcept }) {
  const [activeNav, setActiveNav] = useState<RsKidsNavId>("home");
  const [showAmounts, setShowAmounts] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--uc-phone-status-fg", "var(--uc-static-white)");
    root.style.setProperty(
      "--uc-phone-dynamic-island-bg",
      "color-mix(in srgb, var(--uc-static-black) 84%, var(--uc-teal-blue))",
    );
    root.style.setProperty(
      "--uc-phone-dynamic-island-sensor-bg",
      "color-mix(in srgb, var(--uc-static-black) 92%, transparent)",
    );
    root.style.setProperty(
      "--uc-phone-system-bar-bg",
      "linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 26%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 8%, transparent) 62%, transparent 100%)",
    );

    return () => {
      root.style.removeProperty("--uc-phone-status-fg");
      root.style.removeProperty("--uc-phone-dynamic-island-bg");
      root.style.removeProperty("--uc-phone-dynamic-island-sensor-bg");
      root.style.removeProperty("--uc-phone-system-bar-bg");
    };
  }, []);

  return (
    <RsKidsShell>
      {activeNav === "home" ? (
        <div className="scrollbar-hide relative z-[1] flex-1 overflow-y-auto pb-[104px]" data-rs-kids-page="home">
          <RsKidsHomePage
            concept={concept}
            onNavChange={setActiveNav}
            onToggleAmounts={() => setShowAmounts((current) => !current)}
            showAmounts={showAmounts}
          />
        </div>
      ) : null}

      {activeNav === "analytics" ? <RsKidsSpendingPage concept={concept} showAmounts={showAmounts} /> : null}
      {activeNav === "payments" ? <RsKidsPaymentsPage /> : null}
      {activeNav === "products" ? <RsKidsProductsPage /> : null}
      {activeNav === "more" ? <RsKidsMorePage /> : null}

      <RsKidsBottomNav activeNav={activeNav} onChange={setActiveNav} />
    </RsKidsShell>
  );
}

function RsKidsShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden text-[var(--uc-text)]"
      data-rs-kids-experience="safe-spend-coach"
      style={
        {
          "--rs-kids-accent": "var(--uc-teal-blue)",
          "--rs-kids-accent-2": "var(--uc-product-blue)",
          "--rs-kids-reward": "var(--uc-yellow-gold)",
          "--rs-kids-page-bg":
            "linear-gradient(180deg, color-mix(in srgb, var(--uc-primary-k1) 82%, var(--uc-teal-blue)) 0px, color-mix(in srgb, var(--uc-primary-k1) 70%, var(--uc-product-blue)) 310px, color-mix(in srgb, var(--uc-app-bg) 88%, var(--uc-teal-soft)) 430px, var(--uc-app-bg) 610px)",
          "--rs-kids-card-bg": "color-mix(in srgb, var(--uc-surface) 92%, var(--uc-teal-soft))",
          "--rs-kids-nav-bg": "color-mix(in srgb, var(--uc-bottom-bar-bg) 88%, var(--uc-teal-blue))",
        } as CSSProperties
      }
    >
      <div className="absolute inset-0" style={{ background: "var(--rs-kids-page-bg)" }} />
      <div aria-hidden="true" className="rs-kids-ambient-field pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
      {children}
    </div>
  );
}

function RsKidsHomePage({
  concept,
  onNavChange,
  onToggleAmounts,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  onNavChange: (nav: RsKidsNavId) => void;
  onToggleAmounts: () => void;
  showAmounts: boolean;
}) {
  return (
    <>
      <div className="px-[24px] pt-[54px]">
        <RsKidsHeader concept={concept} onToggleAmounts={onToggleAmounts} showAmounts={showAmounts} />
        <RsKidsHero concept={concept} showAmounts={showAmounts} />
      </div>

      <RsKidsActionRail onNavChange={onNavChange} />

      <div className="mt-[22px] space-y-[16px] px-[24px]">
        <RsKidsMoneyMomentCard concept={concept} />
        <RsKidsGoalSpotlight concept={concept} showAmounts={showAmounts} />
        <RsKidsEarnNextCard showAmounts={showAmounts} />
        <RsKidsCardSafetyCard concept={concept} />
        <RsKidsActivityCard concept={concept} showAmounts={showAmounts} />
        <RsKidsMoneyMapCard concept={concept} showAmounts={showAmounts} />
      </div>
    </>
  );
}

function RsKidsHeader({
  concept,
  onToggleAmounts,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  onToggleAmounts: () => void;
  showAmounts: boolean;
}) {
  return (
    <header className="flex h-[40px] items-center justify-between text-[var(--uc-static-white)]">
      <UniCreditLogo className="h-[24px] w-auto" textColor="var(--uc-static-white)" />
      <div className="flex items-center gap-[10px]">
        <button
          aria-label={showAmounts ? "Hide amounts" : "Show amounts"}
          className="grid size-[30px] place-items-center rounded-full border border-[color-mix(in_srgb,var(--uc-static-white)_18%,transparent)] bg-[color-mix(in_srgb,var(--uc-static-white)_12%,transparent)]"
          onClick={onToggleAmounts}
          type="button"
        >
          <AppIcon name={showAmounts ? "amount-hide" : "amount-show"} size={18} />
        </button>
        <button
          aria-label="Messages"
          className="relative grid size-[30px] place-items-center rounded-full border border-[color-mix(in_srgb,var(--uc-static-white)_18%,transparent)] bg-[color-mix(in_srgb,var(--uc-static-white)_12%,transparent)]"
          type="button"
        >
          <AppIcon name="header-messages" size={20} />
          <span className="absolute right-[5px] top-[5px] size-[7px] rounded-full bg-[var(--uc-red-main)]" />
        </button>
        <ProfileAvatar initials={concept.avatar} size={36} />
      </div>
    </header>
  );
}

function RsKidsHero({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  const totalBalance = showAmounts ? formatKidsMoney(concept.balance, concept.country) : "****";
  const safeToday = showAmounts ? formatKidsMoney(concept.safeToday, concept.country) : "****";

  return (
    <section className="relative mt-[30px] overflow-hidden rounded-[24px] border border-[color-mix(in_srgb,var(--uc-static-white)_14%,transparent)] bg-[color-mix(in_srgb,var(--uc-primary-k1)_84%,var(--uc-teal-blue))] p-[18px] text-[var(--uc-static-white)] shadow-[0_20px_54px_color-mix(in_srgb,var(--uc-static-black)_26%,transparent)]">
      <div aria-hidden="true" className="rs-kids-signal-field absolute inset-[-22%]" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase leading-[15px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_68%,transparent)]">
              {concept.childName}'s money signal
            </p>
            <h1 className="mt-[8px] text-[40px] font-bold leading-[42px] tracking-[0]">
              {safeToday}
            </h1>
            <p className="mt-[7px] text-[16px] font-bold leading-[20px] tracking-[0]">
              {concept.heroTitle}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-[6px] rounded-full bg-[color-mix(in_srgb,var(--uc-green-success)_22%,var(--uc-static-black))] px-[10px] py-[7px] text-[12px] font-bold leading-[14px] text-[var(--uc-static-white)]">
            <AppIcon name="prime-check" size={15} />
            On track
          </span>
        </div>

        <p className="mt-[14px] text-[14px] font-normal leading-[18px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_74%,transparent)]">
          Total balance {totalBalance}. Hoodie goal stays safe if lunch stays under plan.
        </p>

        <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
          {concept.metrics.map((metric) => (
            <div key={metric.label} className="min-h-[76px] rounded-[16px] bg-[color-mix(in_srgb,var(--uc-static-white)_12%,transparent)] p-[10px] backdrop-blur-sm">
              <p className="text-[16px] font-bold leading-[19px] tracking-[0]">{metric.value}</p>
              <p className="mt-[5px] text-[11px] font-bold leading-[13px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_70%,transparent)]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RsKidsActionRail({ onNavChange }: { onNavChange: (nav: RsKidsNavId) => void }) {
  const handleAction = (actionId: RsKidsActionId) => {
    if (actionId === "more") {
      onNavChange("more");
    }
  };

  return (
    <section className="mt-[22px] px-[24px]">
      <div className="grid grid-cols-4 gap-[14px]">
        {RS_KIDS_ACTIONS.map((action) => (
          <button
            key={action.id}
            className="flex min-w-0 flex-col items-center gap-[9px]"
            onClick={() => handleAction(action.id)}
            type="button"
          >
            <span className="grid size-[62px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-surface)_82%,var(--rs-kids-accent))] text-[var(--uc-text)] shadow-sm">
              <AppIcon name={action.icon} size={26} />
            </span>
            <span className="min-h-[32px] text-center text-[12px] font-bold leading-[14px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_76%,transparent)]">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function RsKidsMoneyMomentCard({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section className="rounded-[18px] bg-[var(--rs-kids-card-bg)] px-[16px] py-[16px] shadow-sm">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">Next money moment</h2>
          <p className="mt-[5px] text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
            {concept.coach[1]?.body}
          </p>
        </div>
        <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--rs-kids-accent)_14%,var(--uc-surface))] text-[var(--rs-kids-accent)]">
          <AppIcon name="calendar-days" size={21} />
        </span>
      </div>

      <div className="mt-[14px] space-y-[8px]">
        {RS_KIDS_MONEY_MOMENTS.map((moment) => (
          <div key={moment.label} className="flex items-center gap-[10px] rounded-[14px] bg-[color-mix(in_srgb,var(--uc-surface)_82%,var(--rs-kids-accent))] p-[10px]">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--rs-kids-accent)]">
              <AppIcon name={moment.icon} size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">{moment.label}</p>
              <p className="truncate text-[12px] font-normal leading-[15px] tracking-[0] text-[var(--uc-text-muted)]">{moment.detail}</p>
            </div>
            <span className="shrink-0 text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--rs-kids-accent)]">{moment.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RsKidsGoalSpotlight({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  const goal = concept.pockets[0];
  const progress = getPocketProgress(goal);
  const savedAmount = showAmounts ? formatKidsMoney(goal.savedAmount, concept.country) : "****";
  const targetAmount = showAmounts ? formatKidsMoney(goal.targetAmount, concept.country) : "****";

  return (
    <section className="rounded-[18px] bg-[var(--uc-surface)] px-[16px] py-[16px] shadow-sm">
      <div className="flex items-center gap-[14px]">
        <div
          className="grid size-[92px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--rs-kids-accent) ${progress}%, color-mix(in srgb, var(--uc-surface-muted) 78%, var(--rs-kids-accent)) 0)`,
          }}
        >
          <div className="grid size-[68px] place-items-center rounded-full bg-[var(--uc-surface)] text-center">
            <p className="text-[20px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{progress}%</p>
            <p className="text-[10px] font-bold uppercase leading-[12px] tracking-[0] text-[var(--uc-text-muted)]">{goal.emojiLabel}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold uppercase leading-[15px] tracking-[0] text-[var(--rs-kids-accent)]">Goal spotlight</p>
          <h2 className="mt-[4px] text-[19px] font-bold leading-[23px] tracking-[0] text-[var(--uc-text)]">{goal.title}</h2>
          <p className="mt-[5px] text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">{goal.helper}</p>
          <p className="mt-[8px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">
            {savedAmount} of {targetAmount}
          </p>
        </div>
      </div>
      <button className="mt-[14px] flex h-[38px] w-full items-center justify-center rounded-full bg-[var(--rs-kids-accent)] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-inverse)]" type="button">
        Boost goal
      </button>
    </section>
  );
}

function RsKidsEarnNextCard({ showAmounts }: { showAmounts: boolean }) {
  const totalReward = RS_KIDS_EARN_TASKS.reduce((sum, task) => sum + task.reward, 0);

  return (
    <section className="rounded-[18px] bg-[color-mix(in_srgb,var(--uc-surface)_90%,var(--uc-yellow-gold))] px-[16px] py-[16px] shadow-sm">
      <div className="flex items-start justify-between gap-[12px]">
        <div>
          <h2 className="text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">Earn next</h2>
          <p className="mt-[5px] text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
            {showAmounts ? `${totalReward} RSD waiting in tasks` : "Rewards hidden"}
          </p>
        </div>
        <span className="grid size-[42px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-yellow-gold)_26%,var(--uc-surface))] text-[var(--uc-primary-k1)]">
          <AppIcon name="trophy" size={21} />
        </span>
      </div>

      <div className="mt-[14px] space-y-[10px]">
        {RS_KIDS_EARN_TASKS.map((task) => (
          <div key={task.title} className="flex items-center gap-[11px] rounded-[14px] bg-[var(--uc-surface)] p-[11px]">
            <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-yellow-gold)_20%,var(--uc-surface))] text-[var(--uc-primary-k1)]">
              <AppIcon name={task.icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">{task.title}</p>
              <p className="text-[12px] font-normal leading-[15px] tracking-[0] text-[var(--uc-text-muted)]">{task.status}</p>
            </div>
            <span className="shrink-0 text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">
              {showAmounts ? `+${task.reward}` : "+****"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RsKidsCardSafetyCard({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section className="rounded-[18px] bg-[var(--uc-surface)] px-[16px] py-[16px] shadow-sm">
      <div className="flex items-start gap-[14px]">
        <div className="shrink-0 rounded-[10px] bg-[var(--uc-surface-muted)] p-[8px]">
          <Card ariaLabel="Serbia Kids card" size="medium" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">Card safety</h2>
          <p className="mt-[5px] text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">{concept.cardStatus}</p>
          <p className="mt-[8px] text-[12px] font-bold leading-[15px] tracking-[0] text-[var(--rs-kids-accent)]">Mum can review payments, not private goal names.</p>
        </div>
      </div>

      <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
        {RS_KIDS_SAFETY_ITEMS.map((item) => (
          <div key={item.label} className="rounded-[14px] bg-[color-mix(in_srgb,var(--uc-surface-muted)_78%,var(--rs-kids-accent))] p-[10px]">
            <div className="flex items-center gap-[7px] text-[var(--rs-kids-accent)]">
              <AppIcon name={item.icon} size={16} />
              <span className="text-[11px] font-bold uppercase leading-[13px] tracking-[0]">{item.label}</span>
            </div>
            <p className="mt-[6px] text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RsKidsActivityCard({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  return (
    <section className="rounded-[18px] bg-[var(--uc-surface)] px-[16px] py-[16px] shadow-sm">
      <div className="flex items-center justify-between gap-[12px]">
        <h2 className="text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">Recent activity</h2>
        <button className="text-[12px] font-bold uppercase leading-[15px] tracking-[0] text-[var(--rs-kids-accent)]" type="button">
          See all
        </button>
      </div>
      <div className="mt-[14px] space-y-[12px]">
        {concept.feed.map((item) => (
          <RsKidsActivityRow key={`${item.title}-${item.time}`} item={item} country={concept.country} showAmounts={showAmounts} />
        ))}
      </div>
    </section>
  );
}

function RsKidsActivityRow({
  country,
  item,
  showAmounts,
}: {
  country: KidsHomeCountry;
  item: KidsHomeFeedItem;
  showAmounts: boolean;
}) {
  const isPositive = item.amount >= 0;
  const icon: IconName = item.category === "Family" ? "users" : item.category === "School" ? "book-open" : "receipt-text";

  return (
    <div className="flex items-center gap-[12px]">
      <span
        className={cn(
          "grid size-[36px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]",
          isPositive ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-product-pink)]",
        )}
      >
        <AppIcon name={icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">{item.title}</p>
        <p className="mt-[3px] text-[12px] font-normal leading-[15px] tracking-[0] text-[var(--uc-text-muted)]">
          {item.category} · {item.time}
        </p>
      </div>
      <p className={cn("shrink-0 text-right text-[14px] font-bold leading-[17px] tracking-[0]", isPositive ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-text)]")}>
        {showAmounts ? formatSignedKidsMoney(item.amount, country) : isPositive ? "+****" : "-****"}
      </p>
    </div>
  );
}

function RsKidsMoneyMapCard({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  const goalsTotal = concept.pockets.reduce((sum, pocket) => sum + pocket.savedAmount, 0);

  return (
    <section className="rounded-[18px] bg-[var(--uc-surface)] px-[16px] py-[16px] shadow-sm">
      <h2 className="text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">Money map</h2>
      <div className="mt-[14px] space-y-[12px]">
        <RsKidsMoneyMapRow icon="wallet-cards" label="Spend today" value={showAmounts ? formatKidsMoney(concept.safeToday, concept.country) : "****"} />
        <RsKidsMoneyMapRow icon="piggy-bank" label="Goals" value={showAmounts ? formatKidsMoney(goalsTotal, concept.country) : "****"} />
        <RsKidsMoneyMapRow icon="lock" label="Parent-safe reserve" value={showAmounts ? formatKidsMoney(concept.balance - concept.safeToday, concept.country) : "****"} />
      </div>
    </section>
  );
}

function RsKidsMoneyMapRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--rs-kids-accent)_13%,var(--uc-surface))] text-[var(--rs-kids-accent)]">
        <AppIcon name={icon} size={18} />
      </span>
      <p className="min-w-0 flex-1 text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">{label}</p>
      <p className="shrink-0 text-right text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">{value}</p>
    </div>
  );
}

function RsKidsSpendingPage({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  return (
    <RsKidsMenuFrame subtitle="A coach view for daily choices." title="Spending coach">
      <div className="space-y-[14px] px-[20px] pt-[16px]">
        <section className="rounded-[18px] bg-[var(--uc-surface)] p-[16px] shadow-sm">
          <p className="text-[13px] font-bold uppercase leading-[15px] tracking-[0] text-[var(--rs-kids-accent)]">Today decision</p>
          <h2 className="mt-[6px] text-[24px] font-bold leading-[28px] tracking-[0] text-[var(--uc-text)]">
            {showAmounts ? formatKidsMoney(concept.safeToday, concept.country) : "****"} is safe before Friday
          </h2>
          <p className="mt-[8px] text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
            If lunch stays under 600 RSD, the Concert hoodie target remains on pace.
          </p>
        </section>

        <section className="rounded-[18px] bg-[var(--uc-surface)] p-[16px] shadow-sm">
          <h2 className="text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">This week by category</h2>
          <div className="mt-[14px] space-y-[13px]">
            {RS_KIDS_SPENDING_CATEGORIES.map((category) => (
              <div key={category.label}>
                <div className="flex items-center justify-between text-[13px] font-bold leading-[16px] tracking-[0]">
                  <span className="text-[var(--uc-text)]">{category.label}</span>
                  <span className="text-[var(--uc-text-muted)]">{showAmounts ? `${category.amount} RSD` : "****"}</span>
                </div>
                <div className="mt-[7px] h-[9px] overflow-hidden rounded-full bg-[var(--uc-surface-muted)]">
                  <div className={cn("h-full rounded-full", category.toneClassName)} style={{ width: `${category.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <RsKidsMoneyMomentCard concept={concept} />
      </div>
    </RsKidsMenuFrame>
  );
}

function RsKidsMenuFrame({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="bg-[color-mix(in_srgb,var(--uc-primary-k1)_86%,var(--rs-kids-accent))] px-[24px] pb-[22px] pt-[54px] text-[var(--uc-static-white)]">
        <div className="flex min-h-[40px] items-start justify-between gap-[12px]">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-[32px] tracking-[0]">{title}</h1>
            {subtitle ? (
              <p className="mt-[5px] text-[13px] font-normal leading-[17px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_72%,transparent)]">
                {subtitle}
              </p>
            ) : null}
          </div>
          <HeaderActionRail>
            <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={() => undefined} />
            <HeaderActionButton icon="messages" label="Messages" onClick={() => undefined} />
          </HeaderActionRail>
        </div>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[104px]">
        {children}
      </div>
    </div>
  );
}

function RsKidsPaymentHeroSheet({
  config,
  heroId,
  onClose,
}: {
  config: NewPaymentSheetConfig;
  heroId: PaymentHeroItem["id"];
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const localizedConfig: NewPaymentSheetConfig = {
    ...config,
    title: t(`runtime.payments.primaryItems.${heroId}.title`, config.title),
    actions: config.actions.map((action) => ({
      ...action,
      title: t(`runtime.payments.newPayment.actions.${action.id}.title`, action.title),
      description: t(`runtime.payments.newPayment.actions.${action.id}.description`, action.description),
    })),
    infoBanner: {
      title: t("runtime.payments.newPayment.infoBanner.title", config.infoBanner.title),
      description: t("runtime.payments.newPayment.infoBanner.description", config.infoBanner.description),
    },
  };
  const handleActionSelect = (_action: NewPaymentAction) => {
    onClose();
  };

  return (
    <BottomSheet title={localizedConfig.title} onClose={onClose}>
      <div className="flex flex-col">
        {localizedConfig.actions.map((action) => (
          <NewPaymentActionListItem key={action.id} action={action} onSelect={handleActionSelect} />
        ))}
      </div>
      <NewPaymentDiscoverBanner
        title={localizedConfig.infoBanner.title}
        description={localizedConfig.infoBanner.description}
      />
    </BottomSheet>
  );
}

function RsKidsPaymentsPage() {
  const { t } = useLanguage();
  const menu = getPaymentsMenuForCountry(RS_KIDS_RUNTIME_COUNTRY);
  const [selectedPrimaryItemId, setSelectedPrimaryItemId] = useState<PaymentHeroItem["id"] | null>(null);
  const selectedHeroSheet = selectedPrimaryItemId ? menu.heroSheets[selectedPrimaryItemId] : null;
  const localizedPrimaryItems = menu.primaryItems.map((item) => ({
    ...item,
    title: t(`runtime.payments.primaryItems.${item.id}.title`, item.title),
    description: t(`runtime.payments.primaryItems.${item.id}.description`, item.description),
  }));
  const localizedOtherItems = menu.otherItems.map((item) => ({
    ...item,
    label: t(`runtime.payments.otherItems.${item.id}`, item.label),
  }));

  return (
    <>
      <RsKidsMenuFrame subtitle="Payments stay supervised in Kids mode." title={t("runtime.payments.title", menu.title)}>
        <div className="flex flex-col gap-[13px] px-[20px] pt-[16px]">
          {localizedPrimaryItems.map((item) => (
            <PaymentHeroCard
              key={item.id}
              item={item}
              onSelect={(selectedItem) => setSelectedPrimaryItemId(selectedItem.id)}
            />
          ))}
        </div>

        <section className="px-[20px] pt-[16px]">
          <SectionHeadingDivider title={t("runtime.payments.other", menu.otherTitle)} />
          <div className="scrollbar-hide overflow-x-auto overflow-y-hidden pt-[8px]">
            <div className="flex w-max gap-[18px] pr-[20px]">
              {localizedOtherItems.map((item) => (
                <PaymentOtherShortcut key={item.id} item={item} onClick={() => undefined} />
              ))}
            </div>
          </div>
        </section>
      </RsKidsMenuFrame>

      {selectedHeroSheet && selectedPrimaryItemId ? (
        <RsKidsPaymentHeroSheet
          config={selectedHeroSheet}
          heroId={selectedPrimaryItemId}
          onClose={() => setSelectedPrimaryItemId(null)}
        />
      ) : null}
    </>
  );
}

function RsKidsProductsPage() {
  const { t } = useLanguage();
  const config = getProductsMenuForCountry(RS_KIDS_RUNTIME_COUNTRY);
  const localizedProducts = config.products.map((card) => ({
    ...card,
    title: t(`runtime.productsMenu.cards.${getHuKidsProductCardTranslationId(card)}`, card.title),
  }));
  const localizedOffers = config.offers.map((offer) => ({
    ...offer,
    title: t(`runtime.productsMenu.offers.${offer.id}.title`, offer.title),
    description: t(`runtime.productsMenu.offers.${offer.id}.description`, offer.description),
  }));

  return (
    <RsKidsMenuFrame subtitle="Products are shown as Kids-safe discovery cards." title={t("runtime.productsMenu.title", config.title)}>
      {localizedOffers.length > 0 ? (
        <section className="px-[20px] pt-[16px]">
          <SectionHeadingDivider title={t("runtime.productsMenu.offersForYou", config.offersTitle)} />
          <div className="mt-[12px] grid gap-[10px]">
            {localizedOffers.slice(0, 2).map((offer) => (
              <button
                key={offer.id}
                className="rounded-[14px] bg-[var(--uc-surface)] p-[14px] text-left shadow-sm"
                onClick={() => handleHuKidsOfferClick(offer)}
                type="button"
              >
                <span className="block whitespace-pre-line text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">
                  {offer.title}
                </span>
                <span className="mt-[7px] block whitespace-pre-line text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
                  {offer.description}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-[20px] pt-[16px]">
        {config.productsTitle ? (
          <SectionHeadingDivider title={t("runtime.productsMenu.ourProducts", config.productsTitle)} />
        ) : null}
        <div className="grid grid-cols-[repeat(2,164px)] justify-center gap-[16px] pt-[16px]">
          {localizedProducts.map((card) => (
            <ProductMenuCard
              key={card.id}
              card={card}
              variant="standard"
              onClick={handleHuKidsProductClick}
            />
          ))}
        </div>
      </section>
    </RsKidsMenuFrame>
  );
}

function RsKidsMorePage() {
  const { t } = useLanguage();
  const availableCards = getMoreCardsForCountry(RS_KIDS_RUNTIME_COUNTRY);
  const documentsCount = getDocumentsCountForCountry(RS_KIDS_RUNTIME_COUNTRY);
  const cardLabels: Record<MoreCardType, string> = {
    contacts: t("more.cards.contacts", "Contacts"),
    documents: t("more.cards.documents", "Documents"),
    settings: t("more.cards.settings", "Settings"),
    "gdpr-consent": t("more.cards.gdprConsent", "GDPR Consent"),
    "third-party-consent": t("more.cards.thirdPartyConsent", "Consent to third parties"),
    "digital-activities": t("more.cards.digitalActivities", "Digital activity record"),
    "my-requests": t("more.cards.myRequests", "My applications"),
    tutorial: t("more.cards.tutorial", "Tutorials"),
  };

  const renderCard = (cardType: MoreCardType) => {
    switch (cardType) {
      case "contacts":
        return <ContactsCard key="contacts" title={cardLabels.contacts} onClick={() => undefined} />;
      case "documents":
        return (
          <DocumentsCard
            key="documents"
            title={cardLabels.documents}
            badgeCount={documentsCount}
            onClick={() => undefined}
          />
        );
      case "settings":
        return <SettingsCard key="settings" title={cardLabels.settings} onClick={() => undefined} />;
      case "third-party-consent":
        return <SettingsCard key="third-party-consent" title={cardLabels["third-party-consent"]} onClick={() => undefined} />;
      case "my-requests":
        return <MyRequestsCard key="my-requests" title={cardLabels["my-requests"]} onClick={() => undefined} />;
      case "tutorial":
        return <TutorialCard key="tutorial" title={cardLabels.tutorial} onClick={() => undefined} />;
      default:
        return null;
    }
  };

  return (
    <RsKidsMenuFrame subtitle="Family visibility, documents, and settings." title={t("more.title", "More")}>
      <div className="px-[16px] pt-[16px]">
        <div className="grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
          {availableCards.map((cardType) => renderCard(cardType))}
        </div>
      </div>
    </RsKidsMenuFrame>
  );
}

function RsKidsBottomNav({
  activeNav,
  onChange,
}: {
  activeNav: RsKidsNavId;
  onChange: (tab: RsKidsNavId) => void;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--rs-kids-nav-bg)] shadow-[0_-10px_28px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)] backdrop-blur-md"
      style={
        {
          "--uc-action": "var(--rs-kids-accent)",
          "--uc-bottom-bar-bg": "var(--rs-kids-nav-bg)",
        } as CSSProperties
      }
    >
      <BottomNavigation activeTab={activeNav} onTabChange={onChange} />
    </div>
  );
}

type HuLightNavId = "home" | "analytics" | "payments" | "products" | "more";
type HuLightView =
  | "home"
  | "theme"
  | "request-money"
  | "send-money"
  | "card-details"
  | "messages"
  | "transaction-detail"
  | "goals"
  | "goal-detail"
  | "create-goal"
  | "learn"
  | "learn-topic"
  | "learn-lesson";
type HuThemeId = "default" | "nordlys" | "blue-lines" | "bubbles" | "aurora" | "garden" | "solar";
type HuMoneyReason = "Food" | "School" | "Transport" | "Fun" | "Other";
type HuSendContact = "Anna" | "David" | "Grandma";
type HuPendingActionFlow = "request-money" | "send-money";
type HuPendingActionTone = "green" | "blue" | "pink" | "amber";
type HuPendingActionStatus = "pending" | "approved";
type HuMerchantLogoId = "mcdonalds" | "youtube" | "apple";
type HuTransactionReturnView = Exclude<HuLightView, "transaction-detail">;
type HuPendingAction = {
  id: string;
  title: string;
  person: string;
  description: string;
  amountLabel: string;
  status: HuPendingActionStatus;
  tone: HuPendingActionTone;
  icon: IconName;
  flow: HuPendingActionFlow;
  createdAt: string;
};
type HuKidsCard = {
  id: string;
  title: string;
  lastDigits: string;
  holderName: string;
};
type HuSendMoneyTransfer = {
  id: string;
  contactName: HuSendContact;
  amount: number;
  amountLabel: string;
  note?: string;
  status: HuPendingActionStatus;
  createdAt: string;
};
type HuKidsTransaction = AccountTransaction & {
  merchantLogo?: HuMerchantLogoId;
  subtitle?: string;
};
type HuKidsCardDetailAction = {
  id: string;
  iconName: IconName;
  label: string;
  onClick?: () => void;
};
type HuKidsTransactionDayGroup = {
  key: string;
  title: string;
  transactions: HuKidsTransaction[];
  total: number;
};
type HuLearnVisual = "balance" | "goals" | "safety" | "request" | "card";
type HuLearnArtVariant = "topic-card" | "topic-featured" | "topic-hero" | "lesson-row" | "lesson-hero";
type HuLearnArtworkKey =
  | "topic-money-basics"
  | "topic-saving-goals"
  | "topic-online-safety"
  | "topic-request-money"
  | "topic-card-confidence"
  | "balance"
  | "spend-today"
  | "money-check"
  | "target"
  | "boost"
  | "ask-help"
  | "pause"
  | "private-codes"
  | "report-safety"
  | "request-reason"
  | "request-amount"
  | "request-wait"
  | "card-pay"
  | "card-freeze"
  | "card-private";
type HuLearnLesson = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  body: string[];
  visual: HuLearnVisual;
  slides: {
    title: string;
    text: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
};
type HuLearnTopic = {
  id: string;
  moduleId: LearnModule["id"];
  title: string;
  subtitle: string;
  helper: string;
  visual: HuLearnVisual;
  lessons: HuLearnLesson[];
};
type HuKidsMenuShapeCountry = Extract<CountryId, "BA">;
type HuKidsRuntimeCountry = Extract<CountryId, "HU">;

const HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY: HuKidsMenuShapeCountry = "BA";
const HU_KIDS_RUNTIME_COUNTRY: HuKidsRuntimeCountry = "HU";

const HU_LIGHT_ACTIONS: Array<{ id: "request" | "send" | "card" | "more"; label: string; icon: IconName }> = [
  { id: "request", label: "Request money", icon: "hu-kids-request-money" },
  { id: "send", label: "Send money", icon: "nav-payments" },
  { id: "card", label: "Account details", icon: "hu-kids-account-details" },
  { id: "more", label: "More Options", icon: "hu-kids-more-options" },
];

const HU_SAVING_ACTIONS: Array<{ id: "save" | "request" | "card" | "more"; label: string; icon: IconName }> = [
  { id: "save", label: "Save money", icon: "hu-kids-saving" },
  { id: "request", label: "Request money", icon: "hu-kids-request-money" },
  { id: "card", label: "Account details", icon: "hu-kids-account-details" },
  { id: "more", label: "More Options", icon: "hu-kids-more-options" },
];

const HU_MONEY_REASONS: HuMoneyReason[] = ["Food", "School", "Transport", "Fun", "Other"];
const HU_SEND_CONTACTS: HuSendContact[] = ["Anna", "David", "Grandma"];
const HU_SEND_APPROVAL_THRESHOLD = 5000;
const HU_WEEKLY_SPENDING_LIMIT = 40000;
const HU_KIDS_WEEKLY_ALLOWANCE = 5000;

const HU_KIDS_TASKS = [
  { title: "Load dishwasher", recurrence: "Weekly", reward: 1000 },
  { title: "Brush your teeth", recurrence: "Weekly", reward: 1000 },
  { title: "Finish your homework", recurrence: "Weekly", reward: 1000 },
] as const;

const HU_KIDS_INITIAL_GOALS: SavingGoal[] = RO_KIDS_GOALS.map((goal) => ({
  ...goal,
  childId: "child-alexandra",
  currency: "HUF",
  savedAmount: goal.savedAmount * 100,
  targetAmount: goal.targetAmount * 100,
}));

const HU_KIDS_INITIAL_LEARN_MODULES: LearnModule[] = RO_KIDS_LEARN_MODULES.map((module) => ({ ...module }));

const HU_LEARN_TOPICS: HuLearnTopic[] = [
  {
    id: "money-basics",
    moduleId: "learn-balance",
    title: "Money basics",
    subtitle: "Balance, daily spend and choices that fit today.",
    helper: "Understand what money is available now and what should stay untouched.",
    visual: "balance",
    lessons: [
      {
        id: "money-basics-balance",
        title: "What is balance?",
        eyebrow: "Lesson 1",
        description: "The money you can use now, after card payments and transfers.",
        body: [
          "Your balance is the money already available in your account. It changes when you receive allowance, pay by card, move money, or save toward a goal.",
          "In this Kids home, the big number shows what Alexandra can spend today. The full amount stays lower on the page, because not all money should feel ready to spend.",
          "A good habit is to check what is available today before deciding what to buy.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Welcome to your balance!",
            text: "In your banking app, the \"balance\" is the total amount of money sitting in your account right now. Think of it as your digital wallet that holds all your funds.",
          },
          {
            title: "How it changes",
            text: "Your balance goes up when you receive pocket money or earn rewards. It goes down whenever you pay with your card, buy a game, or move money to a saving goal.",
          },
          {
            title: "Smart check routine",
            text: "Before buying anything, check your balance. A good habit is to ask yourself if you have enough money available for today's needs before spending it.",
          },
        ],
        quiz: [
          {
            question: "What is your account balance?",
            options: [
              "The total money available in your account.",
              "A list of items you want to buy.",
              "The money you spent last year.",
            ],
            correctIndex: 0,
          },
          {
            question: "When does your balance go up?",
            options: [
              "When you buy a snack.",
              "When you receive pocket money or allowance.",
              "When you freeze your card.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "money-basics-today",
        title: "Spend today, plan tomorrow",
        eyebrow: "Lesson 2",
        description: "Learn why daily money and total money are different.",
        body: [
          "Daily spend is the amount that fits today's plan. Total money includes savings, goals, and money that should stay safe.",
          "When an app separates these numbers, it helps you make faster decisions without accidentally using money saved for something important.",
        ],
        visual: "card",
        slides: [
          {
            title: "The two numbers",
            text: "Your app separates \"Daily spend\" from \"Total money\". This is because seeing all your money at once can make you feel like you can spend it all today!",
          },
          {
            title: "Protecting your savings",
            text: "If you have 10,000 HUF in total, but 8,000 HUF is saved for a new bicycle, your actual budget for snacks and games is only 2,000 HUF.",
          },
          {
            title: "Separation is key",
            text: "By keeping your daily spending money separate from your savings, you avoid accidentally spending the money you saved for important goals.",
          },
        ],
        quiz: [
          {
            question: "Why does the app separate Daily spend from Total money?",
            options: [
              "To make the screen look more colorful.",
              "To help you avoid spending money saved for goals.",
              "To show how fast you can spend everything.",
            ],
            correctIndex: 1,
          },
          {
            question: "If you have 8,000 HUF saved and a total of 10,000 HUF, what is your spending budget?",
            options: [
              "10,000 HUF",
              "8,000 HUF",
              "2,000 HUF",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "money-basics-check",
        title: "Quick money check",
        eyebrow: "Lesson 3",
        description: "A small routine before buying something.",
        body: [
          "Before spending, ask three questions: do I have enough today, do I still need money later, and would this slow down a saving goal?",
          "If the answer is unclear, wait a little or ask a parent. Waiting is also a money skill.",
        ],
        visual: "goals",
        slides: [
          {
            title: "The 3-question routine",
            text: "Before tapping your card at a store, ask: 1) Do I need this today? 2) Do I have enough in my daily budget? 3) Will this delay my saving goals?",
          },
          {
            title: "Wants vs. Needs",
            text: "A \"need\" is something essential like school lunch. A \"want\" is something nice to have, like a toy. Recognizing the difference is a huge money skill!",
          },
          {
            title: "The 24-Hour rule",
            text: "If you really want to buy a \"want\", wait 24 hours. Often, you'll realize you didn't need it as much as you thought, saving your money.",
          },
        ],
        quiz: [
          {
            question: "What is a \"need\"?",
            options: [
              "A new video game.",
              "An essential item like school lunch.",
              "A cinema ticket.",
            ],
            correctIndex: 1,
          },
          {
            question: "What is the 24-hour rule?",
            options: [
              "Waiting a day to see if you still want to buy a non-essential item.",
              "Spending all your money in 24 hours.",
              "Only buying items that last 24 hours.",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: "saving-goals",
    moduleId: "learn-goals",
    title: "Saving goals",
    subtitle: "Small steps for bigger wishes.",
    helper: "Turn wishes into reachable goals with a target and steady progress.",
    visual: "goals",
    lessons: [
      {
        id: "saving-goals-target",
        title: "Pick a clear target",
        eyebrow: "Lesson 1",
        description: "Every goal needs a name and a target amount.",
        body: [
          "A goal works best when it is specific. 'New bike' is easier to understand than 'save more'.",
          "The target amount tells you how close you are. Progress makes patience visible.",
        ],
        visual: "goals",
        slides: [
          {
            title: "Make it specific",
            text: "Saving without a plan is hard. It is much easier to save when you have a specific goal, like \"New Skateboard\" instead of just \"saving money\".",
          },
          {
            title: "Set the numbers",
            text: "Every goal needs a target amount (how much it costs) and a target date (when you want it). This gives you a clear finish line to run towards.",
          },
          {
            title: "Patience is visible",
            text: "Every time you save a little money and add it to your goal, your progress bar grows. Watching that bar go up makes your patience visible!",
          },
        ],
        quiz: [
          {
            question: "Which of these is the best saving goal?",
            options: [
              "I want to save some money eventually.",
              "Save 15,000 HUF for a skateboard by September.",
              "Buy a lot of toys.",
            ],
            correctIndex: 1,
          },
          {
            question: "How does the progress bar help you?",
            options: [
              "It shows how close you are to reaching your target.",
              "It charges your phone battery.",
              "It orders the item automatically.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "saving-goals-boost",
        title: "Boost it safely",
        eyebrow: "Lesson 2",
        description: "Add money without emptying today's budget.",
        body: [
          "Adding a little money often is easier than adding a lot once. The app can help you move money after allowance, rewards, or gifts.",
          "A smart goal should grow while daily spending still feels comfortable.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Small steps add up",
            text: "You don't need to save a huge amount all at once. Saving small amounts regularly (like 500 HUF every week) is the easiest way to reach a goal.",
          },
          {
            title: "Automatic saving",
            text: "You can set up a rule in the app to automatically move a small part of your allowance straight to your saving goal when you receive it.",
          },
          {
            title: "Power of consistency",
            text: "Consistent saving is a superpower. 500 HUF a week turns into 2,000 HUF in a month, and 24,000 HUF in a year! Keep going!",
          },
        ],
        quiz: [
          {
            question: "What is the easiest way to save for a big goal?",
            options: [
              "Wait and try to save all the money at the very end.",
              "Save small, consistent amounts regularly.",
              "Hope you find money on the ground.",
            ],
            correctIndex: 1,
          },
          {
            question: "If you save 500 HUF a week, how much do you save in a month?",
            options: [
              "1,000 HUF",
              "2,000 HUF",
              "5,000 HUF",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "saving-goals-share",
        title: "Ask for help",
        eyebrow: "Lesson 3",
        description: "Parents can help without seeing every private thought.",
        body: [
          "You can ask a parent to help with a goal when you need a boost. The important part is explaining the amount and why it matters.",
          "Goal support should feel safe, not pressured.",
        ],
        visual: "request",
        slides: [
          {
            title: "Talk about your goals",
            text: "If you are saving for something big or important, it's a great idea to share your goal progress with your parents or family.",
          },
          {
            title: "Show your effort",
            text: "Parents love to see that you are responsible. Show them the app progress showing you saved 50% of the goal by yourself first.",
          },
          {
            title: "Savings match",
            text: "Sometimes, parents might offer to match your savings (e.g., they pay the remaining 50%) or give you a boost in exchange for extra chores.",
          },
        ],
        quiz: [
          {
            question: "What is a good way to show responsibility to parents?",
            options: [
              "Show them you've already saved a part of the goal yourself.",
              "Demand they buy the item immediately.",
              "Keep your goal completely secret.",
            ],
            correctIndex: 0,
          },
          {
            question: "What does \"matching savings\" mean?",
            options: [
              "Finding two identical coins.",
              "Parents contributing to your goal to reward your saving efforts.",
              "Spending the same amount as your friend.",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "online-safety",
    moduleId: "learn-scam",
    title: "Online safety",
    subtitle: "Spot strange links, prizes and urgent messages.",
    helper: "Pause before sharing codes, card details, or personal information.",
    visual: "safety",
    lessons: [
      {
        id: "online-safety-pause",
        title: "Pause before tapping",
        eyebrow: "Lesson 1",
        description: "Urgent messages are often trying to rush you.",
        body: [
          "A message saying 'act now' or 'you won' can feel exciting. Scams use that feeling to make people move too fast.",
          "Slow down, check the sender, and ask a parent before opening strange links.",
        ],
        visual: "safety",
        slides: [
          {
            title: "The excitement trap",
            text: "Have you seen a message saying \"You won a free game console! Tap here to claim in 2 minutes!\"? This excitement is a trick used by scammers."
          },
          {
            title: "Why they rush you",
            text: "Scammers create a fake sense of urgency. They want to rush you so you tap the link or share details before you have time to think."
          },
          {
            title: "The rule of thumb",
            text: "Real banks or companies will never threaten you or demand immediate action. If a message says \"act now\", stop and ask an adult."
          }
        ],
        quiz: [
          {
            question: "Why do scammers make messages feel very urgent?",
            options: [
              "To help you get your reward faster.",
              "To make you act quickly without thinking.",
              "Because their computers are slow."
            ],
            correctIndex: 1
          },
          {
            question: "What should you do with a link promising a free prize?",
            options: [
              "Tap it immediately.",
              "Ignore it and ask a parent to verify.",
              "Forward it to all contacts."
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "online-safety-private",
        title: "Keep codes private",
        eyebrow: "Lesson 2",
        description: "PINs, passwords, and login codes are never chat messages.",
        body: [
          "A bank, parent, or friend should not ask for your PIN in a message. If someone asks, stop and tell an adult.",
          "Private codes protect your money like a key protects a door.",
        ],
        visual: "card",
        slides: [
          {
            title: "Keys to your vault",
            text: "Your PIN code, account passwords, and verification codes are completely private. They are the keys that protect your digital money."
          },
          {
            title: "The support lie",
            text: "Scammers might message you pretending to be game administrators or bank support, claiming they need your PIN to fix your account. Say NO!"
          },
          {
            title: "Keep it hidden",
            text: "Never share codes in chat apps. When entering your PIN at an ATM or store terminal, cover the keypad with your hand."
          }
        ],
        quiz: [
          {
            question: "When is it okay to send your PIN in a chat message?",
            options: [
              "When a friend needs to borrow money.",
              "When support claims your account is locked.",
              "Never, PIN codes must always stay private."
            ],
            correctIndex: 2
          },
          {
            question: "What should you do when typing your PIN at a store?",
            options: [
              "Cover the keypad with your other hand.",
              "Say the numbers out loud.",
              "Let the person behind you check it."
            ],
            correctIndex: 0
          }
        ]
      },
      {
        id: "online-safety-report",
        title: "Report what feels wrong",
        eyebrow: "Lesson 3",
        description: "Freezing a card and asking for help are strong choices.",
        body: [
          "If something feels wrong, you can freeze your card and speak with a parent. Acting quickly helps keep money safe.",
          "Safety is not about never making mistakes. It is about knowing what to do next.",
        ],
        visual: "safety",
        slides: [
          {
            title: "Don't be embarrassed",
            text: "If you accidentally tapped a suspicious link or shared card info, don't worry. The most important thing is to act quickly."
          },
          {
            title: "The Freeze button",
            text: "Open your app and tap \"Freeze\" on your card. This immediately locks it, preventing anyone from taking money out."
          },
          {
            title: "Tell an adult",
            text: "Tell a parent or guardian right away. They can help contact the bank to block the card permanently and get a safe new one."
          }
        ],
        quiz: [
          {
            question: "What is the first thing you should do if you lose your card?",
            options: [
              "Freeze the card in your banking app.",
              "Wait a few weeks to see if it shows up.",
              "Delete the banking app."
            ],
            correctIndex: 0
          },
          {
            question: "Who should you talk to if you think your account is unsafe?",
            options: [
              "Your classmates.",
              "A parent or guardian immediately.",
              "Nobody, keep it secret."
            ],
            correctIndex: 1
          }
        ]
      },
    ],
  },
  {
    id: "request-money",
    moduleId: "learn-request",
    title: "Request money",
    subtitle: "Ask clearly and follow the status.",
    helper: "Requests are easier to approve when the amount and reason are simple.",
    visual: "request",
    lessons: [
      {
        id: "request-money-reason",
        title: "Explain the reason",
        eyebrow: "Lesson 1",
        description: "A good request says what the money is for.",
        body: [
          "A request with a reason helps your parent understand the situation. 'Food after practice' is clearer than just asking for money.",
          "The app keeps the status visible, so you know whether it is waiting, approved, or declined.",
        ],
        visual: "request",
        slides: [
          {
            title: "Money is a conversation",
            text: "When you send a money request in the app, your parents see a notification. It's always best to write a short, polite reason explaining what it's for."
          },
          {
            title: "Clear vs. Vague",
            text: "A request for 1,500 HUF with the note \"Bus ticket home\" is much easier for parents to approve than a blank request for the same amount."
          },
          {
            title: "Building trust",
            text: "Explaining your needs shows that you respect their household budget and understand the value of money."
          }
        ],
        quiz: [
          {
            question: "Why is adding a reason to a request helpful?",
            options: [
              "It helps parents understand the need so they can approve it easily.",
              "It makes the notification sound louder.",
              "It is required to type at least 50 words."
            ],
            correctIndex: 0
          },
          {
            question: "Which request note is the most responsible?",
            options: [
              "\"give me money\"",
              "\"2,000 HUF for art class sketchbook\"",
              "\"cash please\""
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "request-money-amount",
        title: "Choose a fair amount",
        eyebrow: "Lesson 2",
        description: "Small, realistic requests build trust.",
        body: [
          "A fair amount matches the real need. Asking for the right amount makes approvals faster and helps everyone feel confident.",
          "If you are not sure how much something costs, estimate and add a short note.",
        ],
        visual: "balance",
        slides: [
          {
            title: "Check the price first",
            text: "Before sending a request, find out how much the item actually costs. Don't guess a random high number."
          },
          {
            title: "Stick to the facts",
            text: "If school lunch costs 1,200 HUF, request exactly 1,200 HUF. Do not request 3,000 HUF unless you have agreed on buying something extra."
          },
          {
            title: "Trust is a currency",
            text: "Requesting fair, accurate amounts builds trust. When parents see you only ask for what you need, they trust you with larger amounts later."
          }
        ],
        quiz: [
          {
            question: "How should you determine the request amount?",
            options: [
              "Ask for a large round number to get extra cash.",
              "Check the actual cost and request that exact amount.",
              "Ask for a different amount every day."
            ],
            correctIndex: 1
          },
          {
            question: "What is the benefit of requesting fair amounts?",
            options: [
              "It builds trust with your parents.",
              "It gives you free coupon codes.",
              "It doubles your allowance."
            ],
            correctIndex: 0
          }
        ]
      },
      {
        id: "request-money-wait",
        title: "Waiting is normal",
        eyebrow: "Lesson 3",
        description: "Pending means your parent still needs to check.",
        body: [
          "A pending request is not a no. It simply means the adult has not decided yet.",
          "While waiting, keep the plan simple and avoid making the same request many times.",
        ],
        visual: "goals",
        slides: [
          {
            title: "What \"Pending\" means",
            text: "After sending a request, the app status shows \"Pending\". This means the request is waiting for your parent to read and approve it."
          },
          {
            title: "Avoid notification spam",
            text: "Do not send the same request multiple times. Spamming notifications will not speed up the approval—it might annoy them instead!"
          },
          {
            title: "Be patient",
            text: "Parents are often busy with work or chores. Be patient, and if it's super urgent, a polite phone call or in-person talk is always best."
          }
        ],
        quiz: [
          {
            question: "What does a \"Pending\" status mean?",
            options: [
              "The request failed.",
              "The request is waiting for your parent's review.",
              "The bank has declined it."
            ],
            correctIndex: 1
          },
          {
            question: "What should you do if your request is pending?",
            options: [
              "Send the same request repeatedly.",
              "Wait patiently or talk in person if urgent.",
              "Delete the request immediately."
            ],
            correctIndex: 1
          }
        ]
      },
    ],
  },
  {
    id: "card-confidence",
    moduleId: "learn-card",
    title: "Card confidence",
    subtitle: "Pay, freeze and protect your card.",
    helper: "Learn what your card can do and how to keep it safe.",
    visual: "card",
    lessons: [
      {
        id: "card-confidence-pay",
        title: "Before you pay",
        eyebrow: "Lesson 1",
        description: "Check the amount and merchant before confirming.",
        body: [
          "Before paying, look at the amount, merchant, and what you are buying. A few seconds can prevent surprises.",
          "After paying, recent transactions help you remember where the money went.",
        ],
        visual: "card",
        slides: [
          {
            title: "Look at the screen",
            text: "Before tapping your card or phone at a store checkout, look at the merchant terminal screen. Always verify the total price is correct."
          },
          {
            title: "Keep your receipt",
            text: "It is good practice to ask for a receipt or check the instant notification in your app right after paying to confirm the amount."
          },
          {
            title: "Track your history",
            text: "Your transaction history lists all your card payments. Checking it once a week helps you see exactly where your pocket money goes."
          }
        ],
        quiz: [
          {
            question: "What should you do before tapping your card at checkout?",
            options: [
              "Check the price displayed on the terminal screen.",
              "Tuck the card away quickly.",
              "Tell the cashier your balance."
            ],
            correctIndex: 0
          },
          {
            question: "How does transaction history help you?",
            options: [
              "It increases your saving balance.",
              "It shows exactly where and when you spent money.",
              "It prints paper money."
            ],
            correctIndex: 1
          }
        ]
      },
      {
        id: "card-confidence-freeze",
        title: "Freeze if unsure",
        eyebrow: "Lesson 2",
        description: "Freezing is a fast safety action.",
        body: [
          "If you cannot find your card or something looks strange, freezing it helps protect your money.",
          "You can unfreeze it later when everything is okay again.",
        ],
        visual: "safety",
        slides: [
          {
            title: "Lost card? Don't panic",
            text: "If you cannot find your debit card, do not worry. You can temporarily lock it immediately from the app using the \"Freeze\" feature."
          },
          {
            title: "How it works",
            text: "Freezing blocks all payments. If someone finds your card on the floor, they won't be able to spend a single HUF. Your money remains safe."
          },
          {
            title: "Unfreeze in seconds",
            text: "If you find your card under your gym bag later, just toggle \"Unfreeze\" in the app. The card becomes active and ready to use instantly."
          }
        ],
        quiz: [
          {
            question: "What happens when you \"Freeze\" your card?",
            options: [
              "The card is deleted forever.",
              "All transactions on the card are blocked until you unfreeze it.",
              "Your phone screen locks."
            ],
            correctIndex: 1
          },
          {
            question: "What should you do if you find your frozen card under your desk?",
            options: [
              "Unfreeze it in the app and continue using it.",
              "Throw it in the bin.",
              "Order a new card immediately."
            ],
            correctIndex: 0
          }
        ]
      },
      {
        id: "card-confidence-details",
        title: "Card details are private",
        eyebrow: "Lesson 3",
        description: "Only reveal details when you really need them.",
        body: [
          "Card number, expiry date, and CVV should be treated carefully. Do not share screenshots or read them out loud in public.",
          "If you copy details, make sure you know exactly where they are going.",
        ],
        visual: "card",
        slides: [
          {
            title: "Private numbers",
            text: "Your debit card has important numbers: the 16-digit card number, the expiry date, and the 3-digit CVV code on the back."
          },
          {
            title: "No card selfies",
            text: "Never send pictures of your card in chat apps, even if a friend claims they want to send you money. They only need your IBAN for that, never your card details."
          },
          {
            title: "Online shopping safety",
            text: "If you want to buy something online, ask a parent to verify the website is safe before you enter your private card numbers."
          }
        ],
        quiz: [
          {
            question: "What is the 3-digit code on the back of your card?",
            options: [
              "The PIN code.",
              "The CVV security code.",
              "Your birth date."
            ],
            correctIndex: 1
          },
          {
            question: "What details are needed for someone to send money directly to your account?",
            options: [
              "Your card number and CVV code.",
              "Only your IBAN or account number.",
              "Your online banking password."
            ],
            correctIndex: 1
          }
        ]
      },
    ],
  },
  {
    id: "smart-budgeting",
    moduleId: "learn-balance",
    title: "Smart Budgeting",
    subtitle: "Learn how to divide your money into categories.",
    helper: "Allocate your funds systematically to cover needs, wants, and savings.",
    visual: "balance",
    lessons: [
      {
        id: "budgeting-categories",
        title: "Categorize it",
        eyebrow: "Lesson 1",
        description: "A budget is simply a plan for your money.",
        body: [],
        visual: "balance",
        slides: [
          {
            title: "Welcome to budgeting!",
            text: "A budget is simply a plan for your money. Instead of keeping all your cash in one pile, you divide it into different boxes.",
          },
          {
            title: "The 50-30-20 rule",
            text: "Try the 50-30-20 rule! 50% for Needs (school, transport), 30% for Wants (games, snacks), and 20% for Savings (your goals).",
          },
          {
            title: "Why it helps",
            text: "Categorizing helps you see where your money goes. If you spend too much on games, your snack box gets empty!",
          },
        ],
        quiz: [
          {
            question: "What is a budget?",
            options: [
              "A plan for how to divide and spend your money.",
              "A list of games you want to buy.",
              "A way to get free items from stores.",
            ],
            correctIndex: 0,
          },
          {
            question: "Under the 50-30-20 rule, what is 20% reserved for?",
            options: [
              "Fun and games.",
              "Essential school needs.",
              "Savings and goals.",
            ],
            correctIndex: 2,
          },
        ],
      },
      {
        id: "budgeting-tracking",
        title: "Track your cash",
        eyebrow: "Lesson 2",
        description: "Monitoring and checking every expense you make.",
        body: [],
        visual: "card",
        slides: [
          {
            title: "The tracking habit",
            text: "Tracking means writing down or checking every transaction. If you don't track, your money will \"disappear\" without you noticing!",
          },
          {
            title: "Look at history",
            text: "Look at your app history every few days. Do you see a lot of small transactions? Those small snacks add up to a big amount!",
          },
          {
            title: "Habits lead to wealth",
            text: "Keep a diary or let the app categorize your spending automatically. Knowing your habits is the first step to wealth.",
          },
        ],
        quiz: [
          {
            question: "What does tracking your cash mean?",
            options: [
              "Running after dropped coins.",
              "Monitoring and checking every expense you make.",
              "Asking your parents for money.",
            ],
            correctIndex: 1,
          },
          {
            question: "Why do small expenses matter?",
            options: [
              "They don't matter at all.",
              "They add up to a large sum over time.",
              "They are always free.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "budgeting-adjust",
        title: "Adjust the plan",
        eyebrow: "Lesson 3",
        description: "Plans change, and that is okay!",
        body: [],
        visual: "goals",
        slides: [
          {
            title: "Be flexible",
            text: "Plans change, and that's okay! If you spent too much on a birthday gift this month, you can reduce your snack spending next week.",
          },
          {
            title: "Making trade-offs",
            text: "Adjusting means making trade-offs. If you want a more expensive game, you must choose to spend less on movie tickets.",
          },
          {
            title: "You're in control",
            text: "A budget is not a prison—it is a tool that you control. Adjusting it shows mature financial thinking.",
          },
        ],
        quiz: [
          {
            question: "What is a financial trade-off?",
            options: [
              "Exchanging old toys for new ones.",
              "Choosing to spend less on one thing to save for another.",
              "Getting money from the bank.",
            ],
            correctIndex: 1,
          },
          {
            question: "Is a budget fixed forever?",
            options: [
              "No, you can adjust it when your plans change.",
              "Yes, it can never be altered.",
              "Yes, only parents can change it.",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: "earning-money",
    moduleId: "learn-goals",
    title: "Earning and Chores",
    subtitle: "How money is earned and how to manage rewards.",
    helper: "Explore how work leads to earning and how to take initiative.",
    visual: "goals",
    lessons: [
      {
        id: "earning-work",
        title: "Value of work",
        eyebrow: "Lesson 1",
        description: "Understanding where money comes from.",
        body: [],
        visual: "request",
        slides: [
          {
            title: "Exchange of value",
            text: "Money doesn't grow on trees—it comes from work. Adults exchange their time, skills, and effort for a salary.",
          },
          {
            title: "Parents' effort",
            text: "Understanding this helps you appreciate the pocket money you receive. It represents your parents' hard work and time.",
          },
          {
            title: "Spending time",
            text: "When you buy something, you are actually spending the hours of work it took to earn that money. Think about that exchange!",
          },
        ],
        quiz: [
          {
            question: "Where does money come from?",
            options: [
              "Trees in the bank garden.",
              "Exchange of time, skills, and work.",
              "The ATM screen.",
            ],
            correctIndex: 1,
          },
          {
            question: "What does your pocket money represent?",
            options: [
              "Free cash that has no value.",
              "Your parents' hard work and time.",
              "A bank loan.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "earning-rewards",
        title: "Chores and rewards",
        eyebrow: "Lesson 2",
        description: "Doing tasks responsibly builds a strong work ethic.",
        body: [],
        visual: "balance",
        slides: [
          {
            title: "Helping out",
            text: "Many families use chores as a way for kids to earn extra money. Chores are tasks that help the whole household run smoothly.",
          },
          {
            title: "Duty vs. Extra",
            text: "Basic chores (like cleaning your room) are part of being a family member. Special chores (like washing the car) can earn you rewards!",
          },
          {
            title: "Strong work ethic",
            text: "Doing tasks responsibly builds a strong work ethic. It teaches you that effort leads directly to financial reward.",
          },
        ],
        quiz: [
          {
            question: "Which chore is usually a basic family duty (unpaid)?",
            options: [
              "Washing your parent's car.",
              "Cleaning your own bedroom.",
              "Painting the garden fence.",
            ],
            correctIndex: 1,
          },
          {
            question: "What does earning money from chores teach you?",
            options: [
              "That effort leads to reward.",
              "That you should be paid for sleeping.",
              "That work is always easy.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "earning-hustle",
        title: "Side hustles",
        eyebrow: "Lesson 3",
        description: "A small business you start by yourself.",
        body: [],
        visual: "goals",
        slides: [
          {
            title: "Your small business",
            text: "A side hustle is a small business you start by yourself. It's a fun way to earn money using your talents!",
          },
          {
            title: "Using your talents",
            text: "Do you like drawing? You can make custom stickers. Are you good at math? You can help a younger student with homework.",
          },
          {
            title: "Safety first",
            text: "Always check with your parents before starting a side hustle. Safety and school should always come first.",
          },
        ],
        quiz: [
          {
            question: "What is a side hustle?",
            options: [
              "A school sport event.",
              "A small business you start to earn money using your skills.",
              "Asking parents for a raise.",
            ],
            correctIndex: 1,
          },
          {
            question: "What should you do before starting a small business?",
            options: [
              "Buy expensive equipment immediately.",
              "Check with your parents for safety and approval.",
              "Quit school.",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "digital-security",
    moduleId: "learn-scam",
    title: "Digital Security",
    subtitle: "Safeguard your mobile banking app and accounts.",
    helper: "Protect passwords, app lock, and secure your network access.",
    visual: "safety",
    lessons: [
      {
        id: "security-biometric",
        title: "App lock & biometrics",
        eyebrow: "Lesson 1",
        description: "Your banking app is protected by passwords or Face ID.",
        body: [],
        visual: "card",
        slides: [
          {
            title: "App protection",
            text: "Your banking app is protected by a password or Face ID / Touch ID. This is called biometric security.",
          },
          {
            title: "No sharing passcodes",
            text: "Never share your app passcode with friends. If they get access, they can see your balance or make unauthorized transfers.",
          },
          {
            title: "Lost phone safety",
            text: "If you lose your phone, biometric locks ensure that nobody who finds it can open your banking app. It stays secure!",
          },
        ],
        quiz: [
          {
            question: "What is biometric security?",
            options: [
              "Locking your phone in a drawer.",
              "Using Face ID or Touch ID to protect your app.",
              "Changing your passcode every hour.",
            ],
            correctIndex: 1,
          },
          {
            question: "Who should you share your banking app passcode with?",
            options: [
              "Your best school friend.",
              "Nobody—it must remain private.",
              "A gaming partner.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "security-phishing",
        title: "Avoid phishing",
        eyebrow: "Lesson 2",
        description: "Fake messages sent by scammers to steal your passwords.",
        body: [],
        visual: "safety",
        slides: [
          {
            title: "Phishing traps",
            text: "Phishing is when scammers send fake emails or messages pretending to be a bank, asking you to tap a link and enter details.",
          },
          {
            title: "Fake verification",
            text: "They might say: \"Your card is blocked! Tap here to verify your identity.\" This is a fake website designed to steal your passwords.",
          },
          {
            title: "Real bank behavior",
            text: "Real banks never send links asking for passwords or PIN codes. If you see such an email, delete it and tell a parent.",
          },
        ],
        quiz: [
          {
            question: "What is phishing?",
            options: [
              "Catching fish in the river.",
              "Fake messages sent by scammers to steal your passwords.",
              "Changing your profile picture.",
            ],
            correctIndex: 1,
          },
          {
            question: "What will a real bank never send you?",
            options: [
              "Monthly account statements.",
              "Links asking you to type your password or PIN.",
              "Educational articles.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "security-wifi",
        title: "Public Wi-Fi risks",
        eyebrow: "Lesson 3",
        description: "Hackers can monitor the data sent over open networks.",
        body: [],
        visual: "safety",
        slides: [
          {
            title: "Open connection danger",
            text: "Public Wi-Fi in cafes or malls is convenient, but it is not secure. Hackers can monitor the data sent over these networks.",
          },
          {
            title: "No banking on public Wi-Fi",
            text: "Never log in to your banking app or enter card details while connected to public Wi-Fi. It is easy for others to intercept.",
          },
          {
            title: "Secure alternatives",
            text: "Wait until you are on your home Wi-Fi or use your mobile data plan. Safe connection protects your financial vault.",
          },
        ],
        quiz: [
          {
            question: "Why is public Wi-Fi unsafe for banking?",
            options: [
              "The signal is too slow.",
              "Hackers can intercept data sent over open networks.",
              "It drains your battery.",
            ],
            correctIndex: 1,
          },
          {
            question: "What should you use instead of public Wi-Fi to open your bank app?",
            options: [
              "Any free public network.",
              "Mobile data or your secure home network.",
              "Your classmate's hotspot.",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "family-banking",
    moduleId: "learn-request",
    title: "Family Banking",
    subtitle: "How parents and kids work together on finance.",
    helper: "Discuss big purchases, build trust, and plan team savings goals.",
    visual: "request",
    lessons: [
      {
        id: "family-decisions",
        title: "Joint decisions",
        eyebrow: "Lesson 1",
        description: "Talking about big purchases together.",
        body: [],
        visual: "request",
        slides: [
          {
            title: "Team sport",
            text: "Money is a team sport in a family. Talking about big purchases together prevents surprises and helps everyone plan.",
          },
          {
            title: "Ask first",
            text: "If you want to buy an expensive gaming console, discuss it with your parents first. They can help you make a plan to save for it.",
          },
          {
            title: "Building harmony",
            text: "Shared financial decisions build harmony and teach you how real-world budgeting works in a household.",
          },
        ],
        quiz: [
          {
            question: "Why talk about big purchases with family?",
            options: [
              "To get their permission to spend their money.",
              "To prevent surprises and make a plan together.",
              "To make them feel bad.",
            ],
            correctIndex: 1,
          },
          {
            question: "Money management in a family works best as:",
            options: [
              "A team sport with open discussion.",
              "A competition to spend fastest.",
              "A secret game.",
            ],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "family-trust",
        title: "Trust & honesty",
        eyebrow: "Lesson 2",
        description: "Financial trust is earned through honest actions.",
        body: [],
        visual: "balance",
        slides: [
          {
            title: "Earning trust",
            text: "Financial trust is earned through honest actions. If you make a mistake (like spending too much), be honest about it.",
          },
          {
            title: "Honesty over secrecy",
            text: "Hiding expenses or lying about how much a game cost will break trust. Broken trust is much harder to fix than a low balance.",
          },
          {
            title: "Gaining freedom",
            text: "When you are honest about money, your parents will feel confident giving you more freedom and responsibilities.",
          },
        ],
        quiz: [
          {
            question: "What is the best action if you spend too much by mistake?",
            options: [
              "Hide the transaction history.",
              "Be honest and talk to a parent about it.",
              "Ask a friend to lie for you.",
            ],
            correctIndex: 1,
          },
          {
            question: "What does financial honesty build?",
            options: [
              "Extra pocket money instantly.",
              "Long-term trust and freedom.",
              "High interest rates.",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "family-goals",
        title: "Shared savings goals",
        eyebrow: "Lesson 3",
        description: "Working together on shared targets.",
        body: [],
        visual: "goals",
        slides: [
          {
            title: "Team goals",
            text: "A shared goal is a saving target that you and your parents work on together. For example, saving for a family trip or a new computer.",
          },
          {
            title: "Milestone bonuses",
            text: "You can contribute a part of your savings, and your parents can match it or add a bonus when you reach milestones.",
          },
          {
            title: "Team spirit",
            text: "Working together makes saving faster and teaches you the joy of reaching a target as a team.",
          },
        ],
        quiz: [
          {
            question: "What is a shared saving goal?",
            options: [
              "A competition to see who saves more.",
              "A saving target that you and your parents work on together.",
              "Borrowing money from siblings.",
            ],
            correctIndex: 1,
          },
          {
            question: "How does a shared goal help you?",
            options: [
              "It makes saving faster and teaches teamwork.",
              "It lets you spend without limits.",
              "It deletes all your tasks.",
            ],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
];

function getHuLearnInitialCompletedLessonIds(modules: LearnModule[]) {
  return HU_LEARN_TOPICS.flatMap((topic) => {
    const module = modules.find((item) => item.id === topic.moduleId);
    const completedCount = module?.isCompleted
      ? topic.lessons.length
      : Math.max(0, Math.min(topic.lessons.length, Math.floor(((module?.progress ?? 0) / 100) * topic.lessons.length)));

    return topic.lessons.slice(0, completedCount).map((lesson) => lesson.id);
  });
}

const HU_PENDING_ACTIONS: HuPendingAction[] = [
  {
    id: "grandpa-food",
    title: "Request Money",
    person: "Grandpa Andrei",
    description: "30 Ron for Food",
    amountLabel: "30 RON",
    status: "pending",
    tone: "green",
    icon: "hu-kids-request-money",
    flow: "request-money",
    createdAt: "Today 14:31",
  },
  {
    id: "mom-trip",
    title: "School trip",
    person: "Mom",
    description: "4.000 HUF waiting for approval",
    amountLabel: "4.000 HUF",
    status: "pending",
    tone: "blue",
    icon: "book-open",
    flow: "request-money",
    createdAt: "Today 12:10",
  },
  {
    id: "dad-reward",
    title: "Task reward",
    person: "Dad",
    description: "Clean room reward approved",
    amountLabel: "2.500 HUF",
    status: "approved",
    tone: "pink",
    icon: "clipboard-check",
    flow: "request-money",
    createdAt: "Yesterday",
  },
];

const HU_KIDS_CARDS: HuKidsCard[] = [
  {
    id: "alexandra-standard-main",
    title: "Mastercard Standard",
    lastDigits: "4007",
    holderName: "ALEXANDRA",
  },
];

const HU_SEND_MONEY_TRANSFERS: HuSendMoneyTransfer[] = [
  {
    id: "hu-send-anna-project",
    contactName: "Anna",
    amount: 1200,
    amountLabel: "1.200 HUF",
    note: "Class project tickets",
    status: "approved",
    createdAt: "Yesterday",
  },
];

const HU_KIDS_TRANSACTIONS: HuKidsTransaction[] = [
  {
    id: "hu-kids-from-dad",
    day: "12",
    month: "JUN",
    monthKey: "2026-06",
    monthTitle: "Today",
    label: "From Dad",
    details: "Salary November",
    subtitle: "Salary November",
    amount: 11824.33,
    type: "credit",
    category: "Income",
    pfmCategory: "Income",
    pfmSubcategory: "Allowance",
    status: "Booked",
  },
  {
    id: "hu-kids-mcdonalds",
    day: "12",
    month: "JUN",
    monthKey: "2026-06",
    monthTitle: "Today",
    label: "McDonalds",
    details: "Lunch with card",
    amount: -940.21,
    type: "debit",
    category: "Leisure time",
    pfmCategory: "Leisure time",
    pfmSubcategory: "Fast food",
    status: "Booked",
    merchantLogo: "mcdonalds",
  },
  {
    id: "hu-kids-youtube",
    day: "11",
    month: "JUN",
    monthKey: "2026-06",
    monthTitle: "Today",
    label: "YouTube",
    details: "Monthly subscription",
    subtitle: "Monthly, due tomorrow",
    amount: -550,
    type: "debit",
    category: "Leisure time",
    pfmCategory: "Leisure time",
    pfmSubcategory: "Streaming",
    status: "Pending",
    merchantLogo: "youtube",
  },
  {
    id: "hu-kids-apple-refund",
    day: "10",
    month: "JUN",
    monthKey: "2026-06",
    monthTitle: "Today",
    label: "Refund from Apple",
    details: "Expected by 15 June",
    subtitle: "Expected by 15 June",
    amount: 612.8,
    type: "credit",
    category: "Shopping",
    pfmCategory: "Shopping",
    pfmSubcategory: "Refund",
    status: "Pending",
    merchantLogo: "apple",
  },
];

function formatHuKidsAmount(amount: number) {
  return `${new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0 }).format(amount)} HUF`;
}

function formatHuFullAmount(amount: number) {
  return new Intl.NumberFormat("hu-HU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function formatHuKidsGoalAmount(amount: number, showAmounts = true) {
  return showAmounts ? formatHuKidsAmount(amount) : formatHuMaskedMoney();
}

const HU_MASKED_INTEGER = "****";
const HU_MASKED_DECIMALS = ",**";
const HU_MASKED_AMOUNT = `${HU_MASKED_INTEGER}${HU_MASKED_DECIMALS}`;

function formatHuMaskedMoney(currency = "HUF") {
  return `${HU_MASKED_AMOUNT} ${currency}`;
}

function formatHuMaskedSignedMoney(isPositive: boolean, currency = "HUF") {
  return `${isPositive ? "+" : "-"}${formatHuMaskedMoney(currency)}`;
}

function getHuKidsTransactionDayTitle(transaction: HuKidsTransaction) {
  if (transaction.day === "12") {
    return "Today";
  }

  if (transaction.day === "11") {
    return "Yesterday";
  }

  return `${Number(transaction.day)} ${transaction.month}`;
}

function groupHuKidsTransactionsByDay(transactions: HuKidsTransaction[]): HuKidsTransactionDayGroup[] {
  const groups = new Map<string, HuKidsTransactionDayGroup>();

  transactions.forEach((transaction) => {
    const key = `${transaction.monthKey}-${transaction.day}`;
    const existing = groups.get(key);

    if (existing) {
      existing.transactions.push(transaction);
      existing.total += transaction.amount;
      return;
    }

    groups.set(key, {
      key,
      title: getHuKidsTransactionDayTitle(transaction),
      transactions: [transaction],
      total: transaction.amount,
    });
  });

  return Array.from(groups.values())
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((group) => ({
      ...group,
      transactions: group.transactions.sort((a, b) => Number(b.day) - Number(a.day)),
    }));
}

function formatHuKidsDayTotal(total: number, showAmounts: boolean) {
  const isPositive = total >= 0;
  const sign = isPositive ? "+" : "-";

  if (!showAmounts) {
    return `${sign}${HU_MASKED_AMOUNT}`;
  }

  return `${sign}${formatMoneyNumber(Math.abs(total), HU_KIDS_RUNTIME_COUNTRY)}`;
}

type HuThemeMotionLayerSpec = {
  role: string;
  background: string;
  className?: string;
  blendMode?: CSSProperties["mixBlendMode"];
  opacity?: number;
};

type HuThemePreset = {
  id: HuThemeId;
  name: string;
  hint: string;
  accent: string;
  accent2: string;
  accent3: string;
  accentStrong?: string;
  pageBackground: string;
  /** Opaque solid that equals the first stop of pageBackground. Used as the
   *  sticky hero header background so it occludes scrolled content while
   *  blending seamlessly into the top of the page gradient. */
  pageTopColor?: string;
  motionBackground: string;
  swatchBackground: string;
  surfaceWeight: number;
  navWeight: number;
  motionLayers?: HuThemeMotionLayerSpec[];
  motionHeight?: number;
  motionMask?: string;
  heroForeground?: string;
  heroMutedForeground?: string;
  heroControlBackground?: string;
  heroControlForeground?: string;
  heroControlBorder?: string;
};

const HU_THEME_PRESETS: HuThemePreset[] = [
  {
    id: "default",
    name: "Standard",
    hint: "no theme",
    accent: "var(--uc-action)",
    accent2: "var(--uc-surface)",
    accent3: "var(--uc-text-muted)",
    pageBackground: "var(--uc-app-bg)",
    motionBackground: "none",
    swatchBackground:
      "linear-gradient(135deg, var(--uc-surface) 0%, var(--uc-app-bg) 58%, var(--uc-border) 100%)",
    surfaceWeight: 100,
    navWeight: 100,
  },
  {
    id: "nordlys",
    name: "Nordlys",
    hint: "polar night",
    accent: "var(--uc-product-blue-deep)",
    accent2: "var(--uc-teal-bright)",
    accent3: "var(--uc-yellow-gold)",
    accentStrong: "color-mix(in srgb, var(--uc-product-blue-deep) 85%, var(--uc-text))",
    pageBackground:
      "linear-gradient(180deg, #03141C 0px, #042430 240px, #0A3A4A 400px, #155666 455px, color-mix(in srgb, var(--uc-app-bg) 52%, var(--uc-teal-blue)) 486px, color-mix(in srgb, var(--uc-app-bg) 78%, var(--uc-teal-soft)) 530px, var(--uc-app-bg) 600px)",
    pageTopColor: "#03141C",
    motionBackground: "none",
    swatchBackground:
      "radial-gradient(55% 38% at 72% 86%, rgba(251, 184, 0, 0.95), rgba(240, 135, 29, 0.5) 45%, transparent 72%), linear-gradient(116deg, transparent 30%, rgba(62, 214, 200, 0.85) 46%, rgba(79, 198, 221, 0.5) 58%, transparent 74%), radial-gradient(140% 110% at 50% -20%, #155666, #0A3A4A 45%, #03141C 100%)",
    surfaceWeight: 92,
    navWeight: 90,
    motionHeight: 560,
    motionMask: "linear-gradient(180deg, var(--uc-static-black) 64%, transparent 100%)",
    heroForeground: "var(--uc-static-white)",
    heroMutedForeground: "rgba(255, 255, 255, 0.68)",
    heroControlBackground: "rgba(255, 255, 255, 0.14)",
    heroControlForeground: "var(--uc-static-white)",
    heroControlBorder: "rgba(255, 255, 255, 0.22)",
    motionLayers: [
      {
        role: "polar-veil",
        background:
          "radial-gradient(150% 110% at 50% -20%, rgba(21, 86, 102, 0.55), rgba(21, 86, 102, 0) 62%)",
        className: "hu-nordlys-veil opacity-[0.7]",
        blendMode: "screen",
      },
      {
        role: "silk-beam-a",
        background:
          "linear-gradient(112deg, transparent 28%, color-mix(in srgb, var(--uc-teal-bright) 52%, transparent) 44%, color-mix(in srgb, var(--uc-teal-blue) 34%, transparent) 56%, transparent 72%)",
        className: "hu-nordlys-silk-a opacity-[0.5] dark:opacity-[0.42]",
        blendMode: "screen",
      },
      {
        role: "silk-beam-b",
        background:
          "linear-gradient(248deg, transparent 34%, color-mix(in srgb, var(--uc-product-blue) 42%, transparent) 49%, color-mix(in srgb, var(--uc-teal-blue) 22%, transparent) 57%, transparent 70%)",
        className: "hu-nordlys-silk-b opacity-[0.38] dark:opacity-[0.32]",
        blendMode: "screen",
      },
      {
        role: "prism-glint",
        background:
          "linear-gradient(116deg, transparent 47.4%, rgba(214, 248, 252, 0.85) 48.4%, rgba(143, 211, 224, 0.45) 49.2%, transparent 50.2%)",
        className: "hu-nordlys-glint",
        blendMode: "screen",
      },
      {
        role: "polar-ember",
        background:
          "radial-gradient(44% 26% at 86% 71%, color-mix(in srgb, var(--uc-static-white) 36%, var(--uc-yellow-gold)), color-mix(in srgb, var(--uc-yellow-gold) 82%, transparent) 16%, color-mix(in srgb, var(--uc-orange-bright) 34%, transparent) 46%, transparent 72%)",
        className: "hu-nordlys-ember",
        blendMode: "screen",
      },
    ],
  },
  {
    id: "blue-lines",
    name: "Blue Lines",
    hint: "kinetic lines",
    accent: "var(--uc-product-blue)",
    accent2: "var(--uc-teal-bright)",
    accent3: "var(--uc-product-blue-deep)",
    accentStrong: "color-mix(in srgb, var(--uc-product-blue) 65%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 10%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 26%, var(--uc-product-blue)) 0%, var(--uc-app-bg) 390px)",
    pageTopColor: "color-mix(in srgb, var(--uc-static-black) 26%, var(--uc-product-blue))",
    motionBackground:
      "radial-gradient(circle at 74% 18%, color-mix(in srgb, var(--hu-theme-accent-2) 28%, transparent), transparent 30%), repeating-linear-gradient(124deg, transparent 0 13px, color-mix(in srgb, var(--hu-theme-accent) 72%, transparent) 14px 16px, transparent 17px 31px), repeating-linear-gradient(64deg, transparent 0 30px, color-mix(in srgb, var(--hu-theme-accent-3) 46%, transparent) 31px 32px, transparent 33px 58px)",
    swatchBackground:
      "radial-gradient(circle at 68% 28%, var(--uc-teal-bright), transparent 35%), linear-gradient(135deg, var(--uc-primary-k1), var(--uc-product-blue) 54%, var(--uc-teal-main))",
    surfaceWeight: 87,
    navWeight: 78,
    motionLayers: [
      {
        role: "meridian-veil",
        background:
          "radial-gradient(130% 95% at 84% -14%, color-mix(in srgb, var(--uc-teal-blue) 64%, transparent), color-mix(in srgb, var(--uc-product-blue) 36%, transparent) 42%, transparent 62%)",
        className: "hu-motion-breathe-38 opacity-[0.85]",
        blendMode: "screen",
      },
      {
        role: "meridian-blades",
        background:
          "linear-gradient(118deg, transparent 29%, color-mix(in srgb, var(--uc-teal-bright) 78%, transparent) 33%, color-mix(in srgb, var(--uc-teal-bright) 78%, transparent) 34.4%, transparent 38.5%, transparent 46%, color-mix(in srgb, var(--uc-static-white) 72%, transparent) 49.6%, color-mix(in srgb, var(--uc-teal-blue) 62%, transparent) 51.2%, transparent 55.5%, transparent 62%, color-mix(in srgb, var(--uc-teal-bright) 44%, transparent) 64.6%, transparent 67.5%)",
        className: "hu-motion-slide-28 opacity-[0.8] dark:opacity-[0.6]",
        blendMode: "screen",
      },
      {
        role: "meridian-counter-band",
        background:
          "linear-gradient(118deg, transparent 52%, color-mix(in srgb, var(--uc-product-blue-deep) 46%, transparent) 64%, transparent 79%)",
        className: "hu-motion-slide-counter-40 opacity-[0.9]",
        blendMode: "soft-light",
      },
    ],
  },
  {
    id: "bubbles",
    name: "Blockcraft",
    hint: "pixel blocks",
    accent: "var(--uc-green-olive)",
    accent2: "var(--uc-green-deep)",
    accent3: "var(--uc-yellow-brown)",
    accentStrong: "color-mix(in srgb, var(--uc-green-olive) 65%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 90%, var(--uc-text))",
    pageBackground:
      "linear-gradient(180deg, color-mix(in srgb, var(--uc-green-olive) 30%, var(--uc-app-bg)) 0%, color-mix(in srgb, var(--uc-yellow-brown) 10%, var(--uc-app-bg)) 275px, var(--uc-app-bg) 395px)",
    pageTopColor: "color-mix(in srgb, var(--uc-green-olive) 30%, var(--uc-app-bg))",
    motionBackground:
      "linear-gradient(90deg, transparent 0 10%, color-mix(in srgb, var(--hu-theme-accent) 34%, transparent) 10% 21%, transparent 21% 100%), linear-gradient(0deg, transparent 0 18%, color-mix(in srgb, var(--hu-theme-accent-3) 26%, transparent) 18% 30%, transparent 30% 100%), radial-gradient(80% 55% at 72% 0%, color-mix(in srgb, var(--hu-theme-accent-2) 32%, transparent), transparent 70%)",
    swatchBackground:
      "linear-gradient(90deg, color-mix(in srgb, var(--uc-green-olive) 90%, var(--uc-static-white)) 0 22%, var(--uc-green-deep) 22% 44%, var(--uc-yellow-brown) 44% 66%, var(--uc-green-olive) 66% 100%)",
    surfaceWeight: 88,
    navWeight: 80,
    motionLayers: [
      {
        role: "blockcraft-sky-veil",
        background:
          "radial-gradient(120% 80% at 52% -18%, color-mix(in srgb, var(--uc-green-olive) 42%, transparent), transparent 62%), radial-gradient(72% 42% at 82% 4%, color-mix(in srgb, var(--uc-yellow-gold) 30%, transparent), transparent 68%)",
        className: "hu-motion-breathe-38 opacity-[0.82]",
        blendMode: "soft-light",
      },
      {
        role: "blockcraft-grid",
        background:
          "conic-gradient(from 45deg at 22% 24%, color-mix(in srgb, var(--uc-static-white) 24%, transparent) 0 25%, color-mix(in srgb, var(--uc-green-olive) 36%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 34%, transparent) 0 75%, transparent 0 100%), conic-gradient(from 45deg at 72% 38%, color-mix(in srgb, var(--uc-yellow-gold) 24%, transparent) 0 25%, color-mix(in srgb, var(--uc-yellow-brown) 34%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 28%, transparent) 0 75%, transparent 0 100%), linear-gradient(180deg, color-mix(in srgb, var(--uc-green-deep) 10%, transparent), transparent 58%)",
        className: "hu-motion-craft-cubes-36 opacity-[0.58] dark:opacity-[0.5]",
        blendMode: "soft-light",
      },
      {
        role: "blockcraft-pixels",
        background:
          "conic-gradient(from 45deg at 18% 20%, color-mix(in srgb, var(--uc-static-white) 22%, transparent) 0 25%, color-mix(in srgb, var(--uc-green-olive) 46%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 42%, transparent) 0 75%, transparent 0), conic-gradient(from 45deg at 62% 66%, color-mix(in srgb, var(--uc-yellow-gold) 28%, transparent) 0 25%, color-mix(in srgb, var(--uc-yellow-brown) 44%, transparent) 0 50%, color-mix(in srgb, var(--uc-green-deep) 34%, transparent) 0 75%, transparent 0)",
        className: "hu-motion-craft-float-42 opacity-[0.7] dark:opacity-[0.56]",
        blendMode: "screen",
      },
    ],
  },
  {
    id: "aurora",
    name: "Aurora",
    hint: "magenta glow",
    accent: "var(--uc-product-pink)",
    accent2: "var(--uc-product-mauve)",
    accent3: "var(--uc-red-main)",
    accentStrong: "color-mix(in srgb, var(--uc-product-pink) 46%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 85%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-product-pink) 30%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 385px)",
    pageTopColor: "color-mix(in srgb, var(--uc-product-pink) 30%, var(--uc-app-bg))",
    motionBackground:
      "radial-gradient(circle at 18% 24%, color-mix(in srgb, var(--hu-theme-accent-3) 38%, transparent), transparent 28%), radial-gradient(circle at 70% 10%, color-mix(in srgb, var(--hu-theme-accent) 48%, transparent), transparent 34%), linear-gradient(130deg, color-mix(in srgb, var(--hu-theme-accent-2) 42%, transparent), transparent 52%), repeating-linear-gradient(38deg, transparent 0 28px, color-mix(in srgb, var(--hu-theme-accent) 26%, transparent) 29px 30px, transparent 31px 54px)",
    swatchBackground:
      "linear-gradient(135deg, var(--uc-product-mauve), var(--uc-product-pink) 52%, var(--uc-red-main))",
    surfaceWeight: 87,
    navWeight: 78,
    motionLayers: [
      {
        role: "aurora-veil",
        background:
          "radial-gradient(120% 90% at 26% -14%, color-mix(in srgb, var(--uc-product-mauve) 48%, transparent), transparent 60%)",
        className: "hu-motion-breathe-38 opacity-[0.75]",
        blendMode: "screen",
      },
      {
        role: "aurora-curtains",
        background:
          "linear-gradient(96deg, transparent 16%, color-mix(in srgb, var(--uc-product-pink) 40%, transparent) 30%, transparent 44%, transparent 56%, color-mix(in srgb, var(--uc-product-mauve) 34%, transparent) 70%, transparent 84%)",
        className: "hu-motion-sway-32 opacity-[0.55] dark:opacity-[0.5]",
        blendMode: "screen",
      },
      {
        role: "aurora-glow-arc",
        background:
          "radial-gradient(56% 38% at 72% 16%, color-mix(in srgb, var(--uc-red-main) 26%, transparent), transparent 62%)",
        className: "hu-motion-drift-46 opacity-[0.8]",
        blendMode: "soft-light",
      },
    ],
  },
  {
    id: "garden",
    name: "Garden",
    hint: "fresh lines",
    accent: "var(--uc-green-success)",
    accent2: "var(--uc-yellow-gold)",
    accent3: "var(--uc-green-deep)",
    accentStrong: "color-mix(in srgb, var(--uc-green-success) 60%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 95%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-green-success) 28%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 385px)",
    pageTopColor: "color-mix(in srgb, var(--uc-green-success) 28%, var(--uc-app-bg))",
    motionBackground:
      "radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--hu-theme-accent-2) 34%, transparent), transparent 28%), repeating-linear-gradient(110deg, transparent 0 12px, color-mix(in srgb, var(--hu-theme-accent) 56%, transparent) 13px 14px, transparent 15px 28px), repeating-linear-gradient(150deg, transparent 0 38px, color-mix(in srgb, var(--hu-theme-accent-3) 28%, transparent) 39px 41px, transparent 42px 76px)",
    swatchBackground:
      "linear-gradient(135deg, var(--uc-green-deep), var(--uc-green-success) 58%, var(--uc-yellow-gold))",
    surfaceWeight: 88,
    navWeight: 80,
    motionLayers: [
      {
        role: "canopy-shade",
        background:
          "radial-gradient(64% 42% at 18% -6%, color-mix(in srgb, var(--uc-green-deep) 52%, transparent), transparent 64%), radial-gradient(58% 38% at 86% 4%, color-mix(in srgb, var(--uc-green-success) 44%, transparent), transparent 62%)",
        className: "hu-motion-sway-34 opacity-[0.85]",
        blendMode: "soft-light",
      },
      {
        role: "sun-pockets",
        background:
          "radial-gradient(30% 20% at 72% 22%, color-mix(in srgb, var(--uc-yellow-gold) 58%, transparent), transparent 70%), radial-gradient(20% 14% at 38% 34%, color-mix(in srgb, var(--uc-yellow-gold) 34%, transparent), transparent 70%)",
        className: "hu-motion-breathe-26 opacity-[0.75]",
        blendMode: "screen",
      },
      {
        role: "leaf-dapple",
        background:
          "radial-gradient(16% 11% at 56% 12%, color-mix(in srgb, var(--uc-green-success) 50%, transparent), transparent 70%), radial-gradient(13% 9% at 12% 38%, color-mix(in srgb, var(--uc-teal-bright) 30%, transparent), transparent 70%)",
        className: "hu-motion-drift-34 opacity-[0.6]",
        blendMode: "screen",
      },
    ],
  },
  {
    id: "solar",
    name: "Solar",
    hint: "warm rings",
    accent: "var(--uc-orange-main)",
    accent2: "var(--uc-yellow-gold)",
    accent3: "var(--uc-red-main)",
    accentStrong: "color-mix(in srgb, var(--uc-orange-main) 60%, var(--uc-text))",
    heroMutedForeground: "color-mix(in srgb, var(--uc-text-muted) 95%, var(--uc-text))",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-orange-main) 30%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 380px)",
    pageTopColor: "color-mix(in srgb, var(--uc-orange-main) 30%, var(--uc-app-bg))",
    motionBackground:
      "radial-gradient(circle at 56% 22%, color-mix(in srgb, var(--hu-theme-accent-2) 38%, transparent), transparent 28%), repeating-radial-gradient(circle at 42% 22%, transparent 0 16px, color-mix(in srgb, var(--hu-theme-accent) 32%, transparent) 17px 18px, transparent 19px 34px), linear-gradient(140deg, color-mix(in srgb, var(--hu-theme-accent-3) 22%, transparent), transparent 55%)",
    swatchBackground:
      "radial-gradient(circle at 70% 28%, var(--uc-yellow-gold), transparent 30%), linear-gradient(135deg, var(--uc-red-main), var(--uc-orange-main) 58%, var(--uc-yellow-gold))",
    surfaceWeight: 88,
    navWeight: 80,
    motionLayers: [
      {
        role: "halo-glow",
        background:
          "radial-gradient(46% 30% at 70% 12%, color-mix(in srgb, var(--uc-yellow-gold) 66%, transparent), color-mix(in srgb, var(--uc-orange-main) 34%, transparent) 46%, transparent 70%)",
        className: "hu-motion-breathe-26 opacity-[0.85]",
        blendMode: "screen",
      },
      {
        role: "halo-rings",
        background:
          "repeating-radial-gradient(circle at 70% 12%, transparent 0 54px, color-mix(in srgb, var(--uc-orange-main) 38%, transparent) 55px 57.5px, transparent 58.5px 118px)",
        className: "hu-motion-breathe-38 opacity-[0.5] dark:opacity-[0.45]",
        blendMode: "screen",
      },
      {
        role: "warm-band",
        background:
          "linear-gradient(150deg, color-mix(in srgb, var(--uc-red-main) 18%, transparent), transparent 55%)",
        className: "hu-motion-drift-46 opacity-[0.8]",
        blendMode: "soft-light",
      },
    ],
  },
];

function getHuTheme(themeId: HuThemeId) {
  return HU_THEME_PRESETS.find((theme) => theme.id === themeId) ?? HU_THEME_PRESETS[0];
}

function getHuThemeStyle(theme: HuThemePreset): CSSProperties {
  const isStandard = theme.id === "default";

  return {
    "--hu-theme-accent": theme.accent,
    "--hu-theme-accent-2": theme.accent2,
    "--hu-theme-accent-3": theme.accent3,
    "--hu-theme-accent-strong": theme.accentStrong ?? "var(--hu-theme-accent)",
    "--hu-theme-app-bg": isStandard
      ? "var(--uc-app-bg)"
      : "color-mix(in srgb, var(--uc-app-bg) 94%, var(--hu-theme-accent))",
    "--hu-theme-subpage-bg": isStandard
      ? "var(--uc-surface)"
      : "linear-gradient(180deg, color-mix(in srgb, var(--hu-theme-accent) 22%, var(--uc-surface)) 0%, color-mix(in srgb, var(--hu-theme-accent-2) 16%, var(--uc-surface)) 50%, color-mix(in srgb, var(--hu-theme-accent) 12%, var(--uc-bottom-bar-bg)) 100%)",
    // Must EXACTLY match the subpage-bg gradient's top stop (accent 22%) so the
    // opaque sticky header occludes scrolled content while blending seamlessly
    // into the page gradient — no color step / hairline at the header/content seam.
    "--hu-theme-subpage-header-bg": isStandard
      ? "var(--uc-surface)"
      : "color-mix(in srgb, var(--hu-theme-accent) 22%, var(--uc-surface))",
    "--hu-theme-pi-card-bg": isStandard
      ? "var(--uc-surface)"
      : "var(--uc-surface)",
    "--hu-theme-pi-card-shadow": isStandard
      ? "var(--hu-theme-native-card-shadow)"
      : "0 2px 12px color-mix(in srgb, var(--uc-static-black) 12%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--hu-theme-accent) 16%, var(--uc-border))",
    "--hu-theme-native-card-bg":
      "linear-gradient(105deg, var(--uc-surface-muted) 0%, var(--uc-neutral-200) 48%, var(--uc-neutral-300) 100%)",
    "--hu-theme-native-card-shadow":
      "inset 0 0 0 1px color-mix(in srgb, var(--uc-text) 6%, transparent), 0 10px 22px color-mix(in srgb, var(--uc-static-black) 7%, transparent)",
    "--hu-theme-page-bg": theme.pageBackground,
    // Opaque sticky-header backing for hero pages (Home/Earning/Saving): equals
    // the page gradient's first stop so the header occludes scrolled content
    // while blending into the top of the hero atmosphere.
    "--hu-theme-hero-header-bg": isStandard
      ? "var(--uc-app-bg)"
      : theme.pageTopColor ?? "var(--uc-app-bg)",
    "--hu-theme-motion-bg": theme.motionBackground,
    "--hu-theme-swatch-bg": theme.swatchBackground,
    // Surfaces stay CLEAN by default (native surface). The theme lives in the
    // page atmosphere, not as pigment mixed into every card. Home/Analytics
    // scope swaps these to the translucent glass variants via HuThemeShell so
    // the atmosphere only bleeds through on the L1 hero page, never on detail
    // or menu pages (which would otherwise leak the dark/colored top).
    "--hu-theme-card-bg": "var(--uc-surface)",
    "--hu-theme-card-strong-bg": "var(--uc-surface-muted)",
    "--hu-theme-glass-bg": isStandard
      ? "var(--uc-surface)"
      : "color-mix(in srgb, var(--uc-surface) 78%, transparent)",
    "--hu-theme-glass-strong-bg": isStandard
      ? "var(--uc-surface-muted)"
      : "color-mix(in srgb, var(--uc-surface) 68%, transparent)",
    "--hu-theme-control-bg": "var(--uc-surface-muted)",
    "--hu-theme-control-fg": "var(--uc-text)",
    "--hu-theme-progress-bg": "var(--uc-surface-muted)",
    "--hu-learn-card-bg": isStandard
      ? "linear-gradient(135deg, var(--uc-app-bg) 0%, color-mix(in srgb, var(--uc-app-bg) 62%, var(--uc-neutral-400)) 100%)"
      : "linear-gradient(135deg, color-mix(in srgb, var(--uc-neutral-white) 94%, var(--hu-theme-accent)) 0%, color-mix(in srgb, var(--uc-neutral-white) 90%, var(--hu-theme-accent-2)) 58%, color-mix(in srgb, var(--uc-neutral-white) 86%, var(--hu-theme-accent-3)) 100%)",
    "--hu-learn-card-border": isStandard
      ? "color-mix(in srgb, var(--uc-text) 8%, transparent)"
      : "color-mix(in srgb, var(--uc-text) 11%, transparent)",
    "--hu-learn-card-glow": isStandard
      ? "radial-gradient(circle at 84% 18%, color-mix(in srgb, var(--uc-static-white) 38%, transparent), transparent 35%)"
      : "radial-gradient(circle at 86% 14%, color-mix(in srgb, var(--hu-theme-accent-strong) 12%, transparent), transparent 36%), radial-gradient(circle at 10% 110%, color-mix(in srgb, var(--hu-theme-accent-2) 8%, transparent), transparent 48%)",
    "--hu-learn-card-shadow": isStandard
      ? "0 10px 22px color-mix(in srgb, var(--uc-static-black) 8%, transparent)"
      : "0 14px 30px color-mix(in srgb, var(--uc-static-black) 13%, transparent)",
    "--hu-learn-art-bg": isStandard
      ? "radial-gradient(circle at 28% 22%, color-mix(in srgb, var(--uc-static-white) 42%, transparent), transparent 34%), linear-gradient(135deg, color-mix(in srgb, var(--uc-neutral-white) 72%, var(--uc-neutral-400)), color-mix(in srgb, var(--uc-neutral-white) 52%, var(--uc-neutral-500)))"
      : "radial-gradient(circle at 28% 22%, color-mix(in srgb, var(--uc-static-white) 30%, transparent), transparent 35%), linear-gradient(135deg, color-mix(in srgb, var(--uc-neutral-white) 84%, var(--hu-theme-accent)), color-mix(in srgb, var(--uc-neutral-white) 74%, var(--hu-theme-accent-2)))",
    "--hu-learn-art-soft": isStandard
      ? "color-mix(in srgb, var(--uc-neutral-white) 68%, var(--uc-neutral-400))"
      : "color-mix(in srgb, var(--uc-neutral-white) 78%, var(--hu-theme-accent))",
    "--hu-learn-art-ink": isStandard
      ? "color-mix(in srgb, var(--uc-text) 78%, var(--uc-neutral-400))"
      : "color-mix(in srgb, var(--uc-text) 72%, var(--hu-theme-accent-strong))",
    "--hu-theme-nav-bg": isStandard
      ? "var(--uc-bottom-bar-bg)"
      : "color-mix(in srgb, var(--uc-bottom-bar-bg) 80%, transparent)",
    "--hu-theme-hero-fg": theme.heroForeground ?? "var(--uc-text)",
    "--hu-theme-hero-muted":
      theme.heroMutedForeground ?? "color-mix(in srgb, var(--uc-text-muted) 82%, var(--hu-theme-accent-3))",
    "--hu-theme-hero-control-bg":
      theme.heroControlBackground ??
      (isStandard ? "var(--uc-surface)" : "color-mix(in srgb, var(--uc-surface) 58%, transparent)"),
    "--hu-theme-hero-control-fg": theme.heroControlForeground ?? "var(--uc-text)",
    "--hu-theme-hero-control-border": theme.heroControlBorder ?? "transparent",
    // NOTE: the global UniCredit design tokens (--uc-surface, --uc-action,
    // --uc-brand, --card, --secondary, --border, ...) are intentionally NOT
    // overridden here. The theme is an atmosphere layer + functional accent,
    // not a repaint of the whole design system. Components keep their native
    // identity; theme presence comes only through the page background, the
    // translucent glass cards on Home, and accent-strong on functional bits
    // (progress fill, links, active nav tab, selected states).
  } as CSSProperties;
}

function HuCeeLightRestyleApp({ concept }: { concept: KidsMarketHomeConcept }) {
  const [activeNav, setActiveNav] = useState<HuLightNavId>("home");
  const [showAmounts, setShowAmounts] = useState(true);
  const [view, setView] = useState<HuLightView>("home");
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [appliedThemeId, setAppliedThemeId] = useState<HuThemeId>("default");
  const [draftThemeId, setDraftThemeId] = useState<HuThemeId>("default");
  const [motionProgress, setMotionProgress] = useState(0);
  const [pendingActions, setPendingActions] = useState<HuPendingAction[]>(HU_PENDING_ACTIONS);
  const [selectedPendingActionId, setSelectedPendingActionId] = useState(HU_PENDING_ACTIONS[0]?.id ?? "");
  const [sendMoneyTransfers, setSendMoneyTransfers] = useState<HuSendMoneyTransfer[]>(HU_SEND_MONEY_TRANSFERS);
  const [selectedCardId, setSelectedCardId] = useState(HU_KIDS_CARDS[0]?.id ?? "");
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null);
  const [transactionReturnView, setTransactionReturnView] = useState<HuTransactionReturnView>("home");
  const [goals, setGoals] = useState<SavingGoal[]>(HU_KIDS_INITIAL_GOALS);
  const [selectedGoalId, setSelectedGoalId] = useState(HU_KIDS_INITIAL_GOALS[0]?.id ?? "");
  const [learnModules] = useState<LearnModule[]>(HU_KIDS_INITIAL_LEARN_MODULES);
  const [completedLearnLessonIds, setCompletedLearnLessonIds] = useState<string[]>(() =>
    getHuLearnInitialCompletedLessonIds(HU_KIDS_INITIAL_LEARN_MODULES),
  );
  const [selectedLearnTopicId, setSelectedLearnTopicId] = useState(HU_LEARN_TOPICS[0]?.id ?? "");
  const [selectedLearnLessonId, setSelectedLearnLessonId] = useState(HU_LEARN_TOPICS[0]?.lessons[0]?.id ?? "");
  const appliedTheme = getHuTheme(appliedThemeId);
  const draftTheme = getHuTheme(draftThemeId);
  const learnTopics = useMemo(() => HU_LEARN_TOPICS, []);
  const phoneChromeTheme = view === "theme" ? draftTheme : appliedTheme;
  const activeNavUsesHeroThemeField = activeNav === "home" || activeNav === "analytics" || activeNav === "products";
  const phoneChromeIsThemed = view === "theme" || phoneChromeTheme.id !== "default";
  const phoneChromeUsesLightForeground =
    view === "theme" || phoneChromeTheme.id === "nordlys" || phoneChromeTheme.id === "blue-lines";

  const handleNavChange = (tab: HuLightNavId) => {
    setActiveNav(tab);
    setMotionProgress(0);
    setIsMoreSheetOpen(false);
  };

  const handleOpenRequestMoney = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("request-money");
  };

  const handleOpenSendMoney = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("send-money");
  };

  const handleOpenMessages = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("messages");
  };

  const handleOpenGoals = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("goals");
  };

  const handleOpenCreateGoal = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("create-goal");
  };

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("goal-detail");
  };

  const handleOpenLearnTopic = (topicId: string) => {
    setSelectedLearnTopicId(topicId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("learn-topic");
  };

  const handleOpenLearnLesson = (topicId: string, lessonId: string) => {
    setSelectedLearnTopicId(topicId);
    setSelectedLearnLessonId(lessonId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setActiveNav("analytics");
    setView("learn-lesson");
  };

  const handleOpenLearn = () => {
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("learn");
  };

  const handleOpenCardDetails = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("card-details");
  };

  const handleOpenTransactionDetail = (transaction: AccountTransaction, returnView: HuTransactionReturnView) => {
    setSelectedTransaction(transaction);
    setTransactionReturnView(returnView);
    setIsMoreSheetOpen(false);
    setMotionProgress(0);
    setView("transaction-detail");
  };

  const handleCreateMoneyRequest = (amount: number, reason: HuMoneyReason, note: string) => {
    const amountLabel = formatHuKidsAmount(amount);
    const action: HuPendingAction = {
      id: `hu-money-request-${Date.now()}`,
      title: "Request Money",
      person: "Mom",
      description: `${amountLabel} for ${reason}${note.trim() ? ` - ${note.trim()}` : ""}`,
      amountLabel,
      status: "pending",
      tone: "green",
      icon: "hu-kids-request-money",
      flow: "request-money",
      createdAt: "Just now",
    };

    setPendingActions((current) => [action, ...current]);
    setSelectedPendingActionId(action.id);
  };

  const handleCreateSendMoney = (contactName: HuSendContact, amount: number, note: string) => {
    const amountLabel = formatHuKidsAmount(amount);
    const cleanNote = note.trim();
    const needsApproval = amount > HU_SEND_APPROVAL_THRESHOLD;
    const transfer: HuSendMoneyTransfer = {
      id: `hu-send-money-${Date.now()}`,
      contactName,
      amount,
      amountLabel,
      note: cleanNote || undefined,
      status: needsApproval ? "pending" : "approved",
      createdAt: "Just now",
    };
    const action: HuPendingAction = {
      id: `${transfer.id}-action`,
      title: needsApproval ? "Send Money" : "Money sent",
      person: contactName,
      description: `${amountLabel} to ${contactName}${cleanNote ? ` - ${cleanNote}` : ""}`,
      amountLabel,
      status: transfer.status,
      tone: needsApproval ? "amber" : "blue",
      icon: "send",
      flow: "send-money",
      createdAt: transfer.createdAt,
    };

    setSendMoneyTransfers((current) => [transfer, ...current]);
    setPendingActions((current) => [action, ...current]);
    setSelectedPendingActionId(action.id);
  };

  const handleCreateGoal = (title: string, targetAmount: number) => {
    const cleanTitle = title.trim() || "New goal";
    const goal: SavingGoal = {
      id: `hu-goal-${Date.now()}`,
      childId: "child-alexandra",
      title: cleanTitle,
      targetAmount,
      savedAmount: 0,
      currency: "HUF",
      icon: "Goal",
    };

    setGoals((current) => [goal, ...current]);
    setSelectedGoalId(goal.id);
    setView("goal-detail");
    setActiveNav("analytics");
    setMotionProgress(0);
  };

  const handleAddGoalMoney = (goalId: string, amount: number) => {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? { ...goal, savedAmount: Math.min(goal.targetAmount, goal.savedAmount + amount) }
          : goal,
      ),
    );
  };

  const handleCompleteLearnLesson = (lessonId: string) => {
    setCompletedLearnLessonIds((current) => (current.includes(lessonId) ? current : [...current, lessonId]));
  };

  useEffect(() => {
    const root = document.documentElement;
    const foreground = phoneChromeUsesLightForeground
      ? "var(--uc-static-white)"
      : phoneChromeTheme.heroForeground ?? "var(--uc-text)";
    const islandBackground = phoneChromeIsThemed
      ? `color-mix(in srgb, var(--uc-static-black) 72%, ${phoneChromeTheme.accent})`
      : "color-mix(in srgb, var(--uc-static-black) 90%, transparent)";
    const sensorBackground = phoneChromeIsThemed
      ? `color-mix(in srgb, var(--uc-static-black) 82%, ${phoneChromeTheme.accent3})`
      : "color-mix(in srgb, var(--uc-static-black) 96%, transparent)";
    const systemBarBackground = phoneChromeIsThemed
      ? phoneChromeUsesLightForeground
        ? "linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 24%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 10%, transparent) 52%, transparent 100%)"
        : `linear-gradient(180deg, color-mix(in srgb, var(--uc-surface) 46%, ${phoneChromeTheme.accent}) 0%, color-mix(in srgb, var(--uc-surface) 18%, transparent) 56%, transparent 100%)`
      : "transparent";

    root.style.setProperty("--uc-phone-status-fg", foreground);
    root.style.setProperty("--uc-phone-dynamic-island-bg", islandBackground);
    root.style.setProperty("--uc-phone-dynamic-island-sensor-bg", sensorBackground);
    root.style.setProperty("--uc-phone-system-bar-bg", systemBarBackground);

    return () => {
      root.style.removeProperty("--uc-phone-status-fg");
      root.style.removeProperty("--uc-phone-dynamic-island-bg");
      root.style.removeProperty("--uc-phone-dynamic-island-sensor-bg");
      root.style.removeProperty("--uc-phone-system-bar-bg");
    };
  }, [
    phoneChromeIsThemed,
    phoneChromeTheme.accent,
    phoneChromeTheme.accent3,
    phoneChromeTheme.heroForeground,
    phoneChromeUsesLightForeground,
  ]);

  const shellTheme = view === "theme" ? draftTheme : appliedTheme;
  const isThemeChangeView = view === "theme";
  const isPiMenuView = view === "home" && !activeNavUsesHeroThemeField;
  const shellScope = view === "home" ? activeNav : view;
  const shellBackground = isThemeChangeView ? "var(--uc-app-bg)" : "var(--hu-theme-page-bg)";
  const shellMotionProgress =
    view === "home" && activeNavUsesHeroThemeField ? motionProgress : isThemeChangeView ? 0.05 : 0.08;
  const shellMotionFade = isThemeChangeView ? "var(--uc-app-bg)" : "var(--hu-theme-page-bg)";

  const renderActiveHuKidsView = () => {
    if (view === "theme") {
      return (
        <HuThemeChangePage
          appliedThemeId={appliedThemeId}
          concept={concept}
          draftTheme={draftTheme}
          draftThemeId={draftThemeId}
          onApply={() => {
            setAppliedThemeId(draftThemeId);
            setMotionProgress(0);
            setView("home");
          }}
          onBack={() => {
            setDraftThemeId(appliedThemeId);
            setView("home");
          }}
          onSelectTheme={setDraftThemeId}
          showAmounts={showAmounts}
        />
      );
    }

    if (view === "request-money") {
      const latestRequest = pendingActions.find((action) => action.id === selectedPendingActionId) ?? pendingActions[0];

      return (
        <HuRequestMoneyScreen
          latestRequest={latestRequest}
          onBack={() => {
            setView("home");
            setActiveNav("home");
            setMotionProgress(0);
          }}
          onSubmit={handleCreateMoneyRequest}
          theme={appliedTheme}
        />
      );
    }

    if (view === "send-money") {
      const latestTransfer = sendMoneyTransfers[0];

      return (
        <HuSendMoneyScreen
          latestTransfer={latestTransfer}
          onBack={() => {
            setView("home");
            setActiveNav("home");
            setMotionProgress(0);
          }}
          onSubmit={handleCreateSendMoney}
          theme={appliedTheme}
        />
      );
    }

    if (view === "card-details") {
      const selectedCard = HU_KIDS_CARDS.find((card) => card.id === selectedCardId) ?? HU_KIDS_CARDS[0];

      return (
        <HuKidsCardDetailsPage
          card={selectedCard}
          onBack={() => {
            setView("home");
            setActiveNav("home");
            setMotionProgress(0);
          }}
          onTransactionClick={(transaction) => handleOpenTransactionDetail(transaction, "card-details")}
          showAmounts={showAmounts}
          theme={appliedTheme}
        />
      );
    }

    if (view === "messages") {
      return (
        <div className="relative z-[1] min-h-0 flex-1 overflow-hidden">
          <MessagesScreen
            onBack={() => {
              setView("home");
              setMotionProgress(0);
            }}
          />
        </div>
      );
    }

    if (view === "goals") {
      return (
        <HuKidsGoalsPage
          goals={goals}
          onBack={() => {
            setView("home");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onCreateGoal={handleOpenCreateGoal}
          onSelectGoal={handleSelectGoal}
          showAmounts={showAmounts}
          theme={appliedTheme}
        />
      );
    }

    if (view === "goal-detail") {
      const selectedGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0] ?? null;

      return (
        <HuKidsGoalDetailPage
          goal={selectedGoal}
          onAddMoney={(amount) => {
            if (selectedGoal) {
              handleAddGoalMoney(selectedGoal.id, amount);
            }
          }}
          onAskParent={handleOpenRequestMoney}
          onBack={() => {
            setView("goals");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          showAmounts={showAmounts}
          theme={appliedTheme}
        />
      );
    }

    if (view === "create-goal") {
      return (
        <HuKidsCreateGoalPage
          onBack={() => {
            setView("goals");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onCreateGoal={handleCreateGoal}
          theme={appliedTheme}
        />
      );
    }

    if (view === "learn") {
      return (
        <HuKidsLearnPage
          completedLessonIds={completedLearnLessonIds}
          learnModules={learnModules}
          onSelectTopic={handleOpenLearnTopic}
          onMessages={handleOpenMessages}
          theme={appliedTheme}
          topics={learnTopics}
          onBack={() => {
            setView("home");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
        />
      );
    }

    if (view === "learn-topic") {
      const selectedTopic = learnTopics.find((topic) => topic.id === selectedLearnTopicId) ?? learnTopics[0] ?? null;

      return (
        <HuKidsLearnTopicPage
          completedLessonIds={completedLearnLessonIds}
          onBack={() => {
            setView("learn");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onOpenLesson={handleOpenLearnLesson}
          theme={appliedTheme}
          topic={selectedTopic}
        />
      );
    }

    if (view === "learn-lesson") {
      const selectedTopic = learnTopics.find((topic) => topic.id === selectedLearnTopicId) ?? learnTopics[0] ?? null;
      const selectedLesson =
        selectedTopic?.lessons.find((lesson) => lesson.id === selectedLearnLessonId) ?? selectedTopic?.lessons[0] ?? null;

      return (
        <HuKidsLearnLessonPage
          completed={selectedLesson ? completedLearnLessonIds.includes(selectedLesson.id) : false}
          lesson={selectedLesson}
          onBack={() => {
            setView("learn-topic");
            setActiveNav("analytics");
            setMotionProgress(0);
          }}
          onComplete={() => {
            if (selectedLesson) {
              handleCompleteLearnLesson(selectedLesson.id);
            }
          }}
          theme={appliedTheme}
          topic={selectedTopic}
        />
      );
    }

    if (view === "transaction-detail" && selectedTransaction) {
      return (
        <div className="relative z-[1] min-h-0 flex-1 overflow-hidden">
          <TransactionDetailScreen
            country={HU_KIDS_RUNTIME_COUNTRY}
            product={null}
            transaction={selectedTransaction}
            onBack={() => setView(transactionReturnView)}
            onRedoPayment={() => undefined}
          />
        </div>
      );
    }

    return (
      <>
        {activeNavUsesHeroThemeField ? (
          <>
            <div className="relative z-[1] h-[54px] flex-shrink-0" />

            <div className="relative z-[2] flex-shrink-0">
              <HuLightHeader
                showAmounts={showAmounts}
                onMessages={handleOpenMessages}
                onToggleAmounts={() => setShowAmounts((current) => !current)}
              />
            </div>

            <div
              className="scrollbar-hide relative z-[1] flex-1 overflow-y-auto pb-[104px]"
              onScroll={(event) => {
                const nextProgress = Math.min(event.currentTarget.scrollTop / 210, 1);
                setMotionProgress(nextProgress);
              }}
            >
              {activeNav === "home" ? (
                <HuHomeContent
                  concept={concept}
                  onCardDetails={handleOpenCardDetails}
                  onMessages={handleOpenMessages}
                  onMoreOptions={() => setIsMoreSheetOpen(true)}
                  onRequestMoney={handleOpenRequestMoney}
                  onSendMoney={handleOpenSendMoney}
                  onTransactionClick={(transaction) => handleOpenTransactionDetail(transaction, "home")}
                  pendingActions={pendingActions}
                  onToggleAmounts={() => setShowAmounts((current) => !current)}
                  showAmounts={showAmounts}
                />
              ) : activeNav === "analytics" ? (
                <HuEarningContent
                  completedLessonIds={completedLearnLessonIds}
                  onOpenLearn={handleOpenLearn}
                  onToggleAmounts={() => setShowAmounts((current) => !current)}
                  showAmounts={showAmounts}
                  topics={learnTopics}
                />
              ) : activeNav === "products" ? (
                <HuSavingContent
                  concept={concept}
                  goals={goals}
                  onCardDetails={handleOpenCardDetails}
                  onMessages={handleOpenMessages}
                  onCreateGoal={handleOpenCreateGoal}
                  onMoreOptions={() => setIsMoreSheetOpen(true)}
                  onOpenGoals={handleOpenGoals}
                  onRequestMoney={handleOpenRequestMoney}
                  onSelectGoal={handleSelectGoal}
                  onSendMoney={handleOpenSendMoney}
                  onToggleAmounts={() => setShowAmounts((current) => !current)}
                  showAmounts={showAmounts}
                />
              ) : null}
            </div>
          </>
        ) : (
          <>
            {activeNav === "payments" ? <HuKidsPaymentsPage onMessages={handleOpenMessages} theme={appliedTheme} /> : null}
            {activeNav === "more" ? <HuKidsMorePage theme={appliedTheme} /> : null}
          </>
        )}

        <HuLightBottomNav activeNav={activeNav} onChange={handleNavChange} />

        {isMoreSheetOpen ? (
          <HuMoreOptionsSheet
            currentTheme={appliedTheme}
            onClose={() => setIsMoreSheetOpen(false)}
            onOpenThemes={() => {
              setDraftThemeId(appliedThemeId);
              setIsMoreSheetOpen(false);
              setView("theme");
            }}
          />
        ) : null}
      </>
    );
  };

  return (
    <HuThemeShell
      shellBackground={shellBackground}
      theme={shellTheme}
      themeScope={shellScope}
    >
      {!isPiMenuView && !isThemeChangeView ? (
        <HuThemeMotionLayer
          fadeTo={shellMotionFade}
          motionProgress={shellMotionProgress}
          preview={isThemeChangeView}
          theme={shellTheme}
        />
      ) : null}
      {renderActiveHuKidsView()}
    </HuThemeShell>
  );
}

function HuKidsPiMenuHeader({ onMessages, title }: { onMessages?: () => void; title: string }) {
  const { t } = useLanguage();

  return (
    <div className="w-full">
      <div className="px-[24px] pb-[22px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1 className="uc-type-h1 min-w-0 flex-1 text-[var(--hu-kids-menu-title-fg)]">{title}</h1>
          <HeaderActionRail>
            <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={() => undefined} />
            <HeaderActionButton
              icon="messages"
              label={t("runtime.actions.messages", "Messages")}
              onClick={onMessages}
            />
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}

function HuKidsPiMenuFrame({
  children,
  header,
  onMessages,
  theme,
  title,
}: {
  children: ReactNode;
  header?: ReactNode;
  onMessages?: () => void;
  theme: HuThemePreset;
  title: string;
}) {
  const isThemed = theme.id !== "default";
  // Pi-menu pages need a fully opaque tinted background + white cards that pop.
  // The dark HuThemeShell page-bg must NOT bleed through anywhere.
  const frameStyle = {
    "--hu-kids-menu-bg": isThemed ? "var(--hu-theme-subpage-bg)" : "var(--uc-surface)",
    "--hu-kids-menu-header-bg": isThemed ? "var(--hu-theme-subpage-header-bg)" : "var(--uc-surface)",
    "--hu-kids-menu-title-fg": "var(--uc-text)",
    ...(isThemed ? { "--uc-action": "var(--hu-theme-accent-strong)" } : {}),
  } as CSSProperties;
  // When themed: ALL card backgrounds → clean white so they pop off the tinted page.
  // When default: keep native PI gray gradients (existing behavior).
  const contentStyle = {
    "--pi-payment-hero-bg": isThemed ? "var(--uc-surface)" : "var(--hu-theme-native-card-bg)",
    "--pi-payment-hero-shadow": isThemed ? "var(--hu-theme-pi-card-shadow)" : "var(--hu-theme-native-card-shadow)",
    "--pi-menu-card-bg": isThemed ? "var(--uc-surface)" : "var(--hu-theme-native-card-bg)",
    "--pi-menu-card-shadow": isThemed ? "var(--hu-theme-pi-card-shadow)" : "var(--hu-theme-native-card-shadow)",
    "--pi-offer-card-bg": isThemed ? "var(--uc-surface)" : "var(--uc-surface)",
    "--pi-shortcut-icon-fg": "var(--uc-text-inverse)",
    ...(isThemed
      ? {
          "--uc-action": "var(--hu-theme-accent-strong)",
          "--pi-shortcut-icon-bg": "var(--hu-theme-accent-strong)",
        }
      : {}),
  } as CSSProperties;

  return (
    <div
      className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--hu-kids-menu-bg)] text-[var(--uc-text)]"
      data-hu-kids-themed-section={theme.id}
      style={frameStyle}
    >
      {/* Header zone (status-bar spacer + title) and the scroll area are all
          transparent so the single frame gradient flows continuously from the
          status bar through the title into the content — no flat header band,
          no color step/kink. The menu header never overlaps scrolled content
          (scroll is confined to the inner area below the title), so it does
          NOT need an opaque backing. */}
      <div className="relative z-[1] h-[54px] flex-shrink-0" />
      <div
        className="relative z-[1]"
        style={isThemed ? ({ "--uc-text": "var(--hu-kids-menu-title-fg)" } as CSSProperties) : undefined}
      >
        {header ?? <HuKidsPiMenuHeader onMessages={onMessages} title={title} />}
      </div>
      <div
        className="scrollbar-hide relative z-[1] min-h-0 flex-1 overflow-y-auto pb-[104px]"
      >
        <div className="min-h-full" style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

function HuKidsPaymentHeroSheet({
  config,
  heroId,
  onClose,
}: {
  config: NewPaymentSheetConfig;
  heroId: PaymentHeroItem["id"];
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const localizedConfig: NewPaymentSheetConfig = {
    ...config,
    title: t(`runtime.payments.primaryItems.${heroId}.title`, config.title),
    actions: config.actions.map((action) => ({
      ...action,
      title: t(`runtime.payments.newPayment.actions.${action.id}.title`, action.title),
      description: t(`runtime.payments.newPayment.actions.${action.id}.description`, action.description),
    })),
    infoBanner: {
      title: t("runtime.payments.newPayment.infoBanner.title", config.infoBanner.title),
      description: t("runtime.payments.newPayment.infoBanner.description", config.infoBanner.description),
    },
  };
  const handleActionSelect = (_action: NewPaymentAction) => {
    onClose();
  };

  return (
    <BottomSheet title={localizedConfig.title} onClose={onClose}>
      <div className="flex flex-col">
        {localizedConfig.actions.map((action) => (
          <NewPaymentActionListItem key={action.id} action={action} onSelect={handleActionSelect} />
        ))}
      </div>
      <NewPaymentDiscoverBanner
        title={localizedConfig.infoBanner.title}
        description={localizedConfig.infoBanner.description}
      />
    </BottomSheet>
  );
}

function HuKidsPaymentsPage({ onMessages, theme }: { onMessages?: () => void; theme: HuThemePreset }) {
  const { t } = useLanguage();
  const menu = getPaymentsMenuForCountry(HU_KIDS_RUNTIME_COUNTRY);
  const [selectedPrimaryItemId, setSelectedPrimaryItemId] = useState<PaymentHeroItem["id"] | null>(null);
  const selectedHeroSheet = selectedPrimaryItemId ? menu.heroSheets[selectedPrimaryItemId] : null;
  const localizedPrimaryItems = menu.primaryItems.map((item) => ({
    ...item,
    title: t(`runtime.payments.primaryItems.${item.id}.title`, item.title),
    description: t(`runtime.payments.primaryItems.${item.id}.description`, item.description),
  }));
  const localizedOtherItems = menu.otherItems.map((item) => ({
    ...item,
    label: t(`runtime.payments.otherItems.${item.id}`, item.label),
  }));

  return (
    <>
      <HuKidsPiMenuFrame onMessages={onMessages} theme={theme} title={t("runtime.payments.title", menu.title)}>
        <div className="flex flex-col gap-[13px] px-[20px] pt-[8px]">
          {localizedPrimaryItems.map((item) => (
            <PaymentHeroCard
              key={item.id}
              item={item}
              onSelect={(selectedItem) => setSelectedPrimaryItemId(selectedItem.id)}
            />
          ))}
        </div>

        <section className="px-[20px] pt-[16px]">
          <SectionHeadingDivider title={t("runtime.payments.other", menu.otherTitle)} />
          <div className="scrollbar-hide overflow-x-auto overflow-y-hidden pt-[8px]">
            <div className="flex w-max gap-[18px] pr-[20px]">
              {localizedOtherItems.map((item) => (
                <PaymentOtherShortcut key={item.id} item={item} onClick={() => undefined} />
              ))}
            </div>
          </div>
        </section>
      </HuKidsPiMenuFrame>

      {selectedHeroSheet && selectedPrimaryItemId ? (
        <HuKidsPaymentHeroSheet
          config={selectedHeroSheet}
          heroId={selectedPrimaryItemId}
          onClose={() => setSelectedPrimaryItemId(null)}
        />
      ) : null}
    </>
  );
}

function handleHuKidsProductClick(_card: ProductsCard) {
  return undefined;
}

function handleHuKidsOfferClick(_offer: ProductsOffer) {
  return undefined;
}

function getHuKidsProductCardTranslationId(card: ProductsCard) {
  if (card.id === "account") return "account";
  if (card.id === "cards") return "cards";
  if (card.id === "mortgages-loans") return "mortgages-loans";
  if (card.id === "investments-savings") return "investments-savings";
  return card.id;
}

function HuKidsProductsPage({ onMessages, theme }: { onMessages?: () => void; theme: HuThemePreset }) {
  const { t } = useLanguage();
  const config = getProductsMenuForCountry(HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY);
  const localizedProducts = config.products.map((card) => ({
    ...card,
    title: t(`runtime.productsMenu.cards.${getHuKidsProductCardTranslationId(card)}`, card.title),
  }));
  const localizedOffers = config.offers.map((offer) => ({
    ...offer,
    title: t(`runtime.productsMenu.offers.${offer.id}.title`, offer.title),
    description: t(`runtime.productsMenu.offers.${offer.id}.description`, offer.description),
  }));

  return (
    <HuKidsPiMenuFrame onMessages={onMessages} theme={theme} title={t("runtime.productsMenu.title", config.title)}>
      {localizedOffers.length > 0 ? (
        <section className="pt-[16px]">
          <SectionHeadingDivider title={t("runtime.productsMenu.offersForYou", config.offersTitle)} className="px-[24px]" />
          <div className="grid grid-cols-[327px] justify-center gap-[12px] px-[24px] pt-[16px]">
            {localizedOffers.map((offer) => (
              <button
                key={offer.id}
                className="rounded-[8px] p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
                onClick={() => handleHuKidsOfferClick(offer)}
                style={{ background: "var(--pi-offer-card-bg, var(--uc-surface-muted))" }}
                type="button"
              >
                <span className="block whitespace-pre-line text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
                  {offer.title}
                </span>
                <span className="mt-[8px] block whitespace-pre-line text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                  {offer.description}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="pt-[16px]">
        {config.productsTitle ? (
          <SectionHeadingDivider title={t("runtime.productsMenu.ourProducts", config.productsTitle)} className="px-[24px]" />
        ) : null}
        <div className="grid grid-cols-[repeat(2,164px)] justify-center gap-[16px] pt-[16px]">
          {localizedProducts.map((card) => (
            <ProductMenuCard
              key={card.id}
              card={card}
              variant="standard"
              onClick={handleHuKidsProductClick}
            />
          ))}
        </div>
      </section>
    </HuKidsPiMenuFrame>
  );
}

function HuKidsMorePage({ onMessages, theme }: { onMessages?: () => void; theme: HuThemePreset }) {
  const { t } = useLanguage();
  const availableCards = getMoreCardsForCountry(HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY);
  const documentsCount = getDocumentsCountForCountry(HU_KIDS_RUNTIME_COUNTRY);
  const cardLabels: Record<MoreCardType, string> = {
    contacts: t("more.cards.contacts", "Contact"),
    documents: t("more.cards.documents", "Documents"),
    settings: t("more.cards.settings", "settings"),
    "gdpr-consent": t("more.cards.gdprConsent", "GDPR Consent"),
    "third-party-consent": t("more.cards.thirdPartyConsent", "Third party consents"),
    "digital-activities": t("more.cards.digitalActivities", "Digital activity record"),
    "my-requests": t("more.cards.myRequests", "Product applications and cancellations"),
    tutorial: t("more.cards.tutorial", "Tutorials"),
  };

  const renderCard = (cardType: MoreCardType) => {
    switch (cardType) {
      case "contacts":
        return <ContactsCard key="contacts" title={cardLabels.contacts} onClick={() => undefined} />;
      case "documents":
        return (
          <DocumentsCard
            key="documents"
            title={cardLabels.documents}
            badgeCount={documentsCount}
            onClick={() => undefined}
          />
        );
      case "settings":
        return <SettingsCard key="settings" title={cardLabels.settings} onClick={() => undefined} />;
      case "my-requests":
        return <MyRequestsCard key="my-requests" title={cardLabels["my-requests"]} onClick={() => undefined} />;
      case "tutorial":
        return <TutorialCard key="tutorial" title={cardLabels.tutorial} onClick={() => undefined} />;
      default:
        return null;
    }
  };

  return (
    <HuKidsPiMenuFrame
      header={
        <MoreHeader
          actionVariant="contact-messages"
          onContactPhone={() => undefined}
          onLogout={() => undefined}
          onMessages={onMessages}
          onProfile={() => undefined}
        />
      }
      theme={theme}
      title={t("more.title", "More")}
    >
      <div className="px-[16px] pt-[16px]">
        <div className="grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
          {availableCards.map((cardType) => renderCard(cardType))}
        </div>
      </div>
    </HuKidsPiMenuFrame>
  );
}

function HuThemeShell({
  children,
  className,
  shellBackground = "var(--hu-theme-page-bg)",
  theme,
  themeScope,
}: {
  children: ReactNode;
  className?: string;
  shellBackground?: string;
  theme: HuThemePreset;
  themeScope?: string;
}) {
  // Only the L1 hero pages (Home / Analytics) float translucent glass cards
  // over the live atmosphere. Detail and menu views keep solid clean surfaces
  // so the dark/colored page top never leaks behind their content.
  const usesGlassSurfaces =
    theme.id !== "default" && (themeScope === "home" || themeScope === "analytics");
  const shellStyle = {
    ...getHuThemeStyle(theme),
    ...(usesGlassSurfaces
      ? {
          "--hu-theme-card-bg": "var(--hu-theme-glass-bg)",
          "--hu-theme-card-strong-bg": "var(--hu-theme-glass-strong-bg)",
        }
      : {}),
    "--hu-theme-shell-bg": shellBackground,
    background: "var(--hu-theme-shell-bg)",
  } as CSSProperties;

  return (
    <div
      className={cn("relative flex h-full w-full flex-col overflow-hidden text-[var(--uc-text)]", className)}
      data-hu-theme={theme.id}
      data-hu-kids-theme-scope={themeScope}
      style={shellStyle}
    >
      <div className="absolute inset-0" style={{ background: "var(--hu-theme-shell-bg)" }} />
      {children}
    </div>
  );
}

function HuRequestMoneyScreen({
  latestRequest,
  onBack,
  onSubmit,
  theme,
}: {
  latestRequest?: HuPendingAction;
  onBack: () => void;
  onSubmit: (amount: number, reason: HuMoneyReason, note: string) => void;
  theme: HuThemePreset;
}) {
  const [amount, setAmount] = useState("3000");
  const [reason, setReason] = useState<HuMoneyReason>("Food");
  const [note, setNote] = useState("");
  const parsedAmount = Number(amount.replace(/[^\d]/g, ""));
  const canSubmit = parsedAmount > 0;
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  const submitRequest = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(parsedAmount, reason, note);
    setNote("");
  };

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <PageHeader
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Request money"
          variant={headerVariant}
          collapsedTitleProgress={1}
        />

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
              Ask your parent for money
            </p>
            <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
              Your request will show as a pending action until it is approved.
            </p>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Amount
            </label>
            <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
              <input
                className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
                inputMode="numeric"
                onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
                value={amount}
              />
              <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
            </div>

            <div className="mt-[18px]">
              <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
                Reason
              </p>
              <div className="mt-[10px] flex flex-wrap gap-[8px]">
                {HU_MONEY_REASONS.map((item) => {
                  const selected = item === reason;

                  return (
                    <button
                      key={item}
                      className={cn(
                        "h-[36px] rounded-full px-[14px] text-[13px] font-bold leading-[16px] tracking-[0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                        selected
                          ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                          : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]"
                      )}
                      onClick={() => setReason(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Note
            </label>
            <textarea
              className="mt-[8px] h-[92px] w-full resize-none rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[15px] font-normal leading-[19px] tracking-[0] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Example: lunch after school"
              value={note}
            />

            <PrimaryButton className="mt-[18px] !w-full" disabled={!canSubmit} onClick={submitRequest}>
              Send request
            </PrimaryButton>
          </section>

          {latestRequest ? (
            <section className="mt-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
              <div className="flex items-start gap-[12px]">
                <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-green-success)_16%,var(--hu-theme-card-bg))] text-[var(--uc-green-success)]">
                  <AppIcon name={latestRequest.icon} size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-[10px]">
                    <p className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
                      {latestRequest.title}
                    </p>
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--uc-green-success)_14%,var(--hu-theme-card-bg))] px-[8px] py-[3px] text-[10px] font-bold uppercase leading-[12px] tracking-[0] text-[var(--uc-green-success)]">
                      {latestRequest.status}
                    </span>
                  </div>
                  <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                    {latestRequest.description}
                  </p>
                  <p className="mt-[10px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">
                    {latestRequest.createdAt} - {latestRequest.person}
                  </p>
                </div>
              </div>
              <button
                className="mt-[16px] h-[42px] w-full rounded-[10px] bg-[var(--hu-theme-control-bg)] text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--hu-theme-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
                onClick={onBack}
                type="button"
              >
                Back to home
              </button>
            </section>
          ) : null}
        </main>
    </div>
  );
}

function HuSendMoneyScreen({
  latestTransfer,
  onBack,
  onSubmit,
  theme,
}: {
  latestTransfer?: HuSendMoneyTransfer;
  onBack: () => void;
  onSubmit: (contactName: HuSendContact, amount: number, note: string) => void;
  theme: HuThemePreset;
}) {
  const [contactName, setContactName] = useState<HuSendContact>("Anna");
  const [amount, setAmount] = useState("1200");
  const [note, setNote] = useState("Class project tickets");
  const parsedAmount = Number(amount.replace(/[^\d]/g, ""));
  const canSubmit = parsedAmount > 0;
  const needsApproval = parsedAmount > HU_SEND_APPROVAL_THRESHOLD;
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  const submitTransfer = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(contactName, parsedAmount, note);
  };

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <PageHeader
          collapsedTitleProgress={1}
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Send money"
          variant={headerVariant}
        />

        <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <div className="flex items-start gap-[12px]">
              <span
                className={cn(
                  "grid size-[44px] shrink-0 place-items-center rounded-full",
                  needsApproval
                    ? "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--hu-theme-card-bg))] text-[color-mix(in_srgb,var(--uc-yellow-gold)_78%,var(--uc-text))]"
                    : "bg-[color-mix(in_srgb,var(--hu-theme-accent)_14%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent-strong)]",
                )}
              >
                <AppIcon name={needsApproval ? "shield-check" : "send"} size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
                  {needsApproval ? "This transfer needs approval" : "Ready to send"}
                </p>
                <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                  {needsApproval
                    ? `Above ${formatHuKidsAmount(HU_SEND_APPROVAL_THRESHOLD)}, so Mom approves first.`
                    : "Small transfers can finish right away."}
                </p>
              </div>
            </div>

            <div className="mt-[18px]">
              <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
                Person
              </p>
              <div className="mt-[10px] grid grid-cols-3 gap-[8px]">
                {HU_SEND_CONTACTS.map((contact) => {
                  const selected = contact === contactName;

                  return (
                    <button
                      key={contact}
                      aria-pressed={selected}
                      className={cn(
                        "h-[36px] rounded-full px-[12px] text-[13px] font-bold leading-[16px] tracking-[0] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                        selected
                          ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                          : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]",
                      )}
                      onClick={() => setContactName(contact)}
                      type="button"
                    >
                      {contact}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Amount
            </label>
            <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
              <input
                className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
                inputMode="numeric"
                onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
                value={amount}
              />
              <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
            </div>

            <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              Note
            </label>
            <textarea
              className="mt-[8px] h-[92px] w-full resize-none rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] py-[12px] text-[15px] font-normal leading-[19px] tracking-[0] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              value={note}
            />

            <PrimaryButton className="mt-[18px] !w-full" disabled={!canSubmit} onClick={submitTransfer}>
              {needsApproval ? "Ask Mom to approve" : "Send money"}
            </PrimaryButton>
          </section>

          {latestTransfer ? (
            <section className="mt-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
              <div className="flex items-start gap-[12px]">
                <span
                  className={cn(
                    "grid size-[44px] shrink-0 place-items-center rounded-full",
                    latestTransfer.status === "approved"
                      ? "bg-[color-mix(in_srgb,var(--hu-theme-accent)_14%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent-strong)]"
                      : "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--hu-theme-card-bg))] text-[color-mix(in_srgb,var(--uc-yellow-gold)_78%,var(--uc-text))]",
                  )}
                >
                  <AppIcon name={latestTransfer.status === "approved" ? "prime-check" : "shield-check"} size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-[10px]">
                    <p className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
                      {latestTransfer.status === "approved" ? "Money sent" : "Needs parent approval"}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-[8px] py-[3px] text-[10px] font-bold uppercase leading-[12px] tracking-[0]",
                        latestTransfer.status === "approved"
                          ? "bg-[color-mix(in_srgb,var(--hu-theme-accent)_12%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent-strong)]"
                          : "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--hu-theme-card-bg))] text-[color-mix(in_srgb,var(--uc-yellow-gold)_78%,var(--uc-text))]",
                      )}
                    >
                      {latestTransfer.status}
                    </span>
                  </div>
                  <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                    {latestTransfer.amountLabel} to {latestTransfer.contactName}
                    {latestTransfer.note ? ` - ${latestTransfer.note}` : ""}
                  </p>
                  <p className="mt-[10px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">
                    {latestTransfer.createdAt}
                  </p>
                </div>
              </div>
              <button
                className="mt-[16px] h-[42px] w-full rounded-[10px] bg-[var(--hu-theme-control-bg)] text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--hu-theme-accent-strong)]"
                onClick={onBack}
                type="button"
              >
                Back to home
              </button>
            </section>
          ) : null}
        </main>
    </div>
  );
}

function HuKidsCardDetailsPage({
  card,
  onBack,
  onTransactionClick,
  showAmounts,
  theme,
}: {
  card: HuKidsCard;
  onBack: () => void;
  onTransactionClick: (transaction: AccountTransaction) => void;
  showAmounts: boolean;
  theme: HuThemePreset;
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
    { id: "card-details", iconName: "eye", label: isCardBackVisible ? "Hide\ndetails" : "Card\ndetails", onClick: revealCardDetails },
    { id: "manage-card", iconName: "account-options", label: "Manage\ncard" },
    {
      id: "block-card",
      iconName: "lock",
      label: isCardFrozen ? "Unblock\ncard" : "Block\ncard",
      onClick: () => setIsCardFrozen((current) => !current),
    },
  ];

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
            title="Cards"
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

            <HuKidsCardDetailsActionRail actions={quickActions} />
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
        <p className="min-w-0 flex-1 truncate text-left text-[14px] font-bold leading-[20px] tracking-[0] text-[var(--uc-static-white)]">
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
  const cardNumber = "5319 7200 0000 4007";
  const expiry = "09/29";
  const cvv = "214";
  const cardNumberDisplay = showAmounts ? cardNumber : "5319 7200 **** 4007";

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
            <Card
              ariaLabel={`${card.title} card ending ${card.lastDigits}`}
              className={cn("h-full w-full transition-[filter,transform] duration-500", isFrozen ? "saturate-[0.68]" : "")}
              size="large"
              style={{ height: 206, width: 327 }}
            />
            <HuKidsCardFreezeOverlay isFrozen={isFrozen} />
          </button>

          <div
            className="absolute inset-0 overflow-hidden rounded-[10px] border border-[color-mix(in_srgb,var(--uc-static-white)_34%,var(--uc-border-muted))] bg-[linear-gradient(135deg,#ff8a18_0%,#f3771c_48%,#b6421d_100%)] p-[18px] text-[var(--uc-static-white)] shadow-[0_18px_32px_color-mix(in_srgb,var(--uc-static-black)_28%,transparent)]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute left-[-64px] top-[38px] h-[92px] w-[260px] rotate-45 rounded-full border-[28px] border-[color-mix(in_srgb,var(--uc-static-white)_34%,transparent)]" />
              <div className="absolute right-[-42px] top-[-38px] h-[170px] w-[170px] rounded-full border-[24px] border-[color-mix(in_srgb,var(--uc-static-white)_16%,transparent)]" />
            </div>

            <div className="relative z-[1] flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-bold uppercase leading-[14px] tracking-[0] opacity-80">Card details</p>
                  <p className="mt-[4px] text-[18px] font-bold leading-[22px] tracking-[0]">{card.title}</p>
                </div>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--uc-static-black)_22%,transparent)] px-[10px] py-[5px] text-[11px] font-bold uppercase leading-[13px] tracking-[0]">
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

function HuKidsCardDetailsActionRail({ actions }: { actions: HuKidsCardDetailAction[] }) {
  return (
    <div className="mt-[28px] grid grid-cols-3 items-start gap-[18px]" data-hu-card-details-actions>
      {actions.map((action) => (
        <button
          key={action.id}
          aria-label={action.label.replace(/\s+/g, " ").trim()}
          className="flex min-w-0 flex-col items-center gap-[12px] text-center transition-transform active:scale-[0.98]"
          onClick={action.onClick}
          type="button"
        >
          <span className="grid size-[68px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm">
            <AppIcon name={action.iconName} size={28} />
          </span>
          <span className="min-h-[38px] whitespace-pre-line text-[16px] font-normal leading-[19px] tracking-[0] text-[var(--uc-text-muted)]">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function HuKidsCardFreezeOverlay({ isFrozen }: { isFrozen: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-700",
        isFrozen ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--uc-static-white)_42%,transparent),color-mix(in_srgb,var(--uc-teal-bright)_42%,transparent)_46%,color-mix(in_srgb,var(--uc-product-blue)_30%,transparent))] backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(132deg,transparent_0_17px,color-mix(in_srgb,var(--uc-static-white)_64%,transparent)_18px_19px,transparent_20px_42px)]" />
      <div className="absolute left-[18px] top-[18px] rounded-full bg-[color-mix(in_srgb,var(--uc-static-black)_34%,transparent)] px-[11px] py-[6px] text-[11px] font-bold uppercase leading-[13px] tracking-[0] text-[var(--uc-static-white)] shadow-sm">
        Frozen
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
        <span className="block text-[10px] font-bold uppercase leading-[12px] tracking-[0] opacity-70">{label}</span>
        <span className="mt-[3px] block truncate text-[15px] font-bold leading-[18px] tracking-[0]">{value}</span>
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
                total={formatHuKidsDayTotal(group.total, showAmounts)}
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

function HuHomeContent({
  concept,
  onCardDetails,
  onMessages,
  onMoreOptions,
  onRequestMoney,
  onSendMoney,
  onTransactionClick,
  onToggleAmounts,
  pendingActions,
  preview = false,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  onCardDetails: (cardId: string) => void;
  onMessages: () => void;
  onMoreOptions: () => void;
  onRequestMoney: () => void;
  onSendMoney: () => void;
  onTransactionClick: (transaction: AccountTransaction) => void;
  onToggleAmounts: () => void;
  pendingActions?: HuPendingAction[];
  preview?: boolean;
  showAmounts: boolean;
}) {
  return (
    <main className={cn(preview ? "pointer-events-none" : undefined)}>
        <HuLightBalance concept={concept} showAmounts={showAmounts} />
        <HuLightActionRail
          onCardDetails={() => onCardDetails(HU_KIDS_CARDS[0]?.id ?? "")}
          onMoreOptions={onMoreOptions}
          onRequestMoney={onRequestMoney}
          onSendMoney={onSendMoney}
        />
        <HuRequestMoneyRail
          actions={pendingActions ?? HU_PENDING_ACTIONS}
          onRequestMoney={onRequestMoney}
          onSendMoney={onSendMoney}
        />

        <div className="mt-[24px] space-y-[24px] px-[24px]">
          <HuSpendingCard showAmounts={showAmounts} />
          <HuTransactionsCard onTransactionClick={onTransactionClick} showAmounts={showAmounts} />
          <HuCardsPanel onCardDetails={onCardDetails} />
          <HuAllMoneyCard showAmounts={showAmounts} />
        </div>
    </main>
  );
}

function HuSavingContent({
  concept,
  goals,
  onCardDetails,
  onMessages,
  onCreateGoal,
  onMoreOptions,
  onOpenGoals,
  onRequestMoney,
  onSelectGoal,
  onSendMoney,
  onToggleAmounts,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  goals: SavingGoal[];
  onCardDetails: (cardId: string) => void;
  onMessages: () => void;
  onCreateGoal: () => void;
  onMoreOptions: () => void;
  onOpenGoals: () => void;
  onRequestMoney: () => void;
  onSelectGoal: (goalId: string) => void;
  onSendMoney: () => void;
  onToggleAmounts: () => void;
  showAmounts: boolean;
}) {
  return (
    <main>
        <HuSavingBalance showAmounts={showAmounts} />
        <HuSavingActionRail
          onCardDetails={() => onCardDetails(HU_KIDS_CARDS[0]?.id ?? "")}
          onMoreOptions={onMoreOptions}
          onRequestMoney={onRequestMoney}
          onSaveMoney={onOpenGoals}
        />

        <div className="mt-[28px] space-y-[28px] px-[24px]">
          <HuSavingFocusCard onCreateGoal={onCreateGoal} onOpenGoals={onOpenGoals} showAmounts={showAmounts} />
          <HuKidsGoalsSection
            goals={goals}
            onCreateGoal={onCreateGoal}
            onSelectGoal={onSelectGoal}
            showAmounts={showAmounts}
          />
          <HuTransactionsCard showAmounts={showAmounts} />
        </div>
    </main>
  );
}

function HuEarningContent({
  completedLessonIds,
  onOpenLearn,
  onToggleAmounts,
  showAmounts,
  topics,
}: {
  completedLessonIds: string[];
  onOpenLearn: () => void;
  onToggleAmounts: () => void;
  showAmounts: boolean;
  topics: HuLearnTopic[];
}) {
  const completedTopics = topics.filter((topic) => getHuLearnTopicProgress(topic, completedLessonIds) === 100).length;

  return (
    <main>
        <HuEarningBalance showAmounts={showAmounts} />

        <div className="mt-[28px] space-y-[28px] px-[24px]">
          <HuAllowanceCard showAmounts={showAmounts} />
          <HuTasksCard showAmounts={showAmounts} />
          <HuEducationCard
            completedTopics={completedTopics}
            totalTopics={topics.length}
            onClick={onOpenLearn}
          />
        </div>
    </main>
  );
}

function HuEarningBalance({
  showAmounts,
}: {
  showAmounts: boolean;
}) {
  const totalRewards = HU_KIDS_TASKS.reduce((sum, task) => sum + task.reward, 0);

  return (
    <section className="mt-[68px] px-[24px] text-center">
      <p className="text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        Earn this week
      </p>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{formatHuFullAmount(totalRewards).replace(/ HUF$/, "")}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">HUF</span>
          </>
        ) : (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">HUF</span>
          </>
        )}
      </div>
      <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        from {HU_KIDS_TASKS.length} active tasks
      </p>
    </section>
  );
}

function HuAllowanceCard({ showAmounts = true }: { showAmounts?: boolean }) {
  return (
    <section
      className="flex w-full flex-col gap-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px]"
    >
      <div className="flex items-start gap-[12px]">
        <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent)_10%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent)]">
          <AppIcon name="piggy-bank" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Allowance</h2>
          <p className="text-[14px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
            Weekly pocket money
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-[6px]">
        {showAmounts ? (
          <>
            <span className="text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">
              {formatHuFullAmount(HU_KIDS_WEEKLY_ALLOWANCE).replace(/ HUF$/, "")}
            </span>
            <span className="text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF / week</span>
          </>
        ) : (
          <>
            <span className="text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">{HU_MASKED_INTEGER}</span>
            <span className="text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF / week</span>
          </>
        )}
      </div>
    </section>
  );
}

function HuEducationCard({
  completedTopics,
  onClick,
  totalTopics,
}: {
  completedTopics: number;
  onClick: () => void;
  totalTopics: number;
}) {
  const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <button
      type="button"
      className="flex w-full flex-col gap-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px] text-left transition-transform active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex items-start gap-[12px]">
        <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent)_10%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent)]">
          <AppIcon name="hu-kids-learn" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Education</h2>
          <p className="text-[14px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
            Financial education
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[12px]">
        <div className="flex-1">
          <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
            <div
              className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-[8px] flex items-baseline justify-between">
            <span className="text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
              {completedTopics}/{totalTopics}
            </span>
            <span className="text-[12px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
              topics done
            </span>
          </div>
        </div>
        <span className="grid size-[32px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent)_10%,var(--hu-theme-card-bg))] text-[var(--hu-theme-accent)]">
          <AppIcon name="arrow-right" size={20} />
        </span>
      </div>
    </button>
  );
}

function HuThemeMotionLayer({
  fadeTo = "var(--uc-app-bg)",
  motionProgress = 0,
  preview = false,
  theme,
}: {
  fadeTo?: string;
  motionProgress?: number;
  preview?: boolean;
  theme?: HuThemePreset;
}) {
  const opacity = preview ? 0.9 : Math.max(0, 1 - motionProgress * 1.35);
  const translateY = preview ? 0 : motionProgress * -30;
  const scale = preview ? 1 : 1 + motionProgress * 0.025;
  const layers = theme?.motionLayers;

  if (layers && layers.length > 0) {
    const maskImage =
      theme.motionMask ?? "linear-gradient(180deg, var(--uc-static-black) 58%, transparent 97%)";

    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-28px] right-[-28px] top-0 z-0 overflow-hidden transition-opacity duration-200"
        style={{
          height: theme.motionHeight ?? 410,
          maskImage,
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          WebkitMaskImage: maskImage,
        }}
      >
        {layers.map((layer) => (
          <div
            key={layer.role}
            className={cn("absolute inset-[-12%]", layer.className)}
            style={{
              background: layer.background,
              mixBlendMode: layer.blendMode,
              opacity: layer.opacity,
            }}
          />
        ))}
        <div
          className="absolute inset-x-0 bottom-0 h-[150px]"
          style={{ background: `linear-gradient(180deg, transparent, ${fadeTo})` }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[410px] overflow-hidden transition-opacity duration-200"
      style={{ opacity, transform: `translateY(${translateY}px) scale(${scale})` }}
    >
      <div className="hu-theme-motion-field absolute inset-[-20%]" style={{ background: "var(--hu-theme-motion-bg)" }} />
      <div
        className="absolute inset-x-0 bottom-0 h-[150px]"
        style={{ background: `linear-gradient(180deg, transparent, ${fadeTo})` }}
      />
    </div>
  );
}

function HuMoreOptionsSheet({
  currentTheme,
  onClose,
  onOpenThemes,
}: {
  currentTheme: HuThemePreset;
  onClose: () => void;
  onOpenThemes: () => void;
}) {
  return (
    <BottomSheet
      meta={
        <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent)_12%,var(--uc-surface))] px-[10px] py-[4px] text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
          {currentTheme.name} active
        </span>
      }
      onClose={onClose}
      subtitle="Personalize Alexandra's home with motion, color, and blended cards."
      title="More options"
    >
      <div className="space-y-[10px]">
        <button
          aria-label="Change theme"
          className="flex w-full items-center gap-[14px] rounded-[12px] bg-[var(--hu-theme-card-bg)] p-[14px] text-left"
          onClick={onOpenThemes}
          type="button"
        >
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
            <AppIcon name="palette" size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">
              Themes
            </span>
            <span className="mt-[3px] block text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
              Choose the home look, preview it live, then apply.
            </span>
          </span>
          <AppIcon color="var(--uc-icon-muted)" name="chevron-link" size={28} />
        </button>

        <div className="grid grid-cols-2 gap-[10px]">
          <button
            className="flex items-center gap-[10px] rounded-[12px] bg-[var(--uc-surface-muted)] p-[12px] text-left"
            type="button"
          >
            <span className="grid size-[34px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)]">
              <AppIcon name="sliders-horizontal" size={18} />
            </span>
            <span className="text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">Card controls</span>
          </button>
          <button
            className="flex items-center gap-[10px] rounded-[12px] bg-[var(--uc-surface-muted)] p-[12px] text-left"
            type="button"
          >
            <span className="grid size-[34px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)]">
              <AppIcon name="shield-check" size={18} />
            </span>
            <span className="text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">Safety limits</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

type HuKidsAppearanceMode = ThemeMode | "system";

const HU_KIDS_APPEARANCE_STORAGE_KEY = "hu-kids-appearance-mode";

function getSystemThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredHuKidsAppearanceMode(): HuKidsAppearanceMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(HU_KIDS_APPEARANCE_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function storeHuKidsAppearanceMode(mode: HuKidsAppearanceMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HU_KIDS_APPEARANCE_STORAGE_KEY, mode);
  }
}

function resolveHuKidsAppearanceMode(mode: HuKidsAppearanceMode, systemThemeMode: ThemeMode): ThemeMode {
  return mode === "system" ? systemThemeMode : mode;
}

function HuThemeChangePage({
  appliedThemeId,
  concept,
  draftTheme,
  draftThemeId,
  onApply,
  onBack,
  onSelectTheme,
  showAmounts,
}: {
  appliedThemeId: HuThemeId;
  concept: KidsMarketHomeConcept;
  draftTheme: HuThemePreset;
  draftThemeId: HuThemeId;
  onApply: () => void;
  onBack: () => void;
  onSelectTheme: (themeId: HuThemeId) => void;
  showAmounts: boolean;
}) {
  const isApplied = appliedThemeId === draftThemeId;
  const { themeMode, setThemeMode } = useDemo();

  const [selectedAppearance, setSelectedAppearance] = useState<HuKidsAppearanceMode>(getStoredHuKidsAppearanceMode);
  const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(getSystemThemeMode);
  const internalThemeModeRequestRef = useRef<ThemeMode | null>(null);
  const latestThemeModeRef = useRef(themeMode);
  const skipSystemSyncRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setSystemThemeMode(event.matches ? "dark" : "light");
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const requestedMode = internalThemeModeRequestRef.current;

    if (requestedMode === themeMode) {
      internalThemeModeRequestRef.current = null;
      latestThemeModeRef.current = themeMode;
      return;
    }

    if (themeMode !== latestThemeModeRef.current) {
      skipSystemSyncRef.current = true;
      setSelectedAppearance(themeMode);
      storeHuKidsAppearanceMode(themeMode);
      latestThemeModeRef.current = themeMode;
    }
  }, [themeMode]);

  useEffect(() => {
    if (selectedAppearance !== "system") {
      return;
    }

    if (skipSystemSyncRef.current) {
      skipSystemSyncRef.current = false;
      return;
    }

    if (themeMode !== systemThemeMode) {
      internalThemeModeRequestRef.current = systemThemeMode;
      setThemeMode(systemThemeMode);
    }
  }, [selectedAppearance, setThemeMode, systemThemeMode, themeMode]);

  const handleAppearanceSelect = (mode: HuKidsAppearanceMode) => {
    setSelectedAppearance(mode);
    storeHuKidsAppearanceMode(mode);

    const targetMode = resolveHuKidsAppearanceMode(mode, systemThemeMode);
    if (themeMode !== targetMode) {
      internalThemeModeRequestRef.current = targetMode;
      setThemeMode(targetMode);
    }
  };

  return (
    <>
      <div className="relative z-[3] flex-shrink-0">
        <PageHeader
          collapsedTitleProgress={1}
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Change theme"
          variant="gray"
        />
      </div>

      <main className="relative z-[2] flex min-h-0 flex-1 flex-col items-center overflow-hidden px-[24px] pb-[24px]">
        <div className="mt-[12px] flex w-full justify-center">
          <HuHomePreview concept={concept} showAmounts={showAmounts} theme={draftTheme} />
        </div>

        <div className="mt-[28px] w-full">
          <HuThemeCarousel
            appliedThemeId={appliedThemeId}
            selectedThemeId={draftThemeId}
            onSelectTheme={onSelectTheme}
          />
        </div>

        {/* Appearance Control (Light, Dark, System) */}
        <div className="mt-[16px] flex justify-center w-full">
          <div className="flex items-center gap-[4px] rounded-full p-[3px] bg-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] border border-[color-mix(in_srgb,var(--uc-text)_4%,transparent)] backdrop-blur-sm">
            {(["light", "dark", "system"] as const).map((mode) => {
              const isSelected = selectedAppearance === mode;
              return (
                <button
                  key={mode}
                  aria-pressed={isSelected}
                  type="button"
                  onClick={() => handleAppearanceSelect(mode)}
                  className={cn(
                    "rounded-full px-[14px] py-[5px] text-[11px] font-bold leading-none capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                    isSelected
                      ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                      : "text-[color-mix(in_srgb,var(--uc-text)_50%,transparent)] hover:text-[var(--uc-text)] font-medium"
                  )}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto w-full px-[6px] pt-[14px]">
          <PrimaryButton
            className="!w-full shadow-[0_12px_32px_color-mix(in_srgb,var(--uc-static-black)_28%,transparent)]"
            onClick={onApply}
          >
            {isApplied ? "Apply current theme" : "Apply"}
          </PrimaryButton>
        </div>
      </main>
    </>
  );
}

function HuHomePreview({
  concept,
  showAmounts,
  theme,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const { themeMode } = useDemo();
  const isDark = themeMode === "dark";

  const phoneChromeUsesLightForeground =
    theme.id === "nordlys" ||
    theme.id === "blue-lines" ||
    (theme.id === "bubbles" && themeMode === "dark") ||
    (theme.id === "aurora" && themeMode === "dark") ||
    (theme.id === "garden" && themeMode === "dark") ||
    (theme.id === "solar" && themeMode === "dark");

  return (
    <div
      className={cn(
        "relative flex h-auto w-full items-center justify-center rounded-[24px] py-[12px] px-[16px] transition-colors duration-200",
        isDark
          ? "bg-[var(--uc-surface)] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          : "bg-[var(--uc-surface)] border border-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Phone frame bezel */}
      <div className="relative overflow-hidden rounded-[24px] border-[5px] border-[#151515] bg-[#151515] shadow-[0_16px_40px_rgba(0,0,0,0.4)] w-[162px] h-[339px] flex items-center justify-center">
        {/* Dynamic Island inside preview */}
        <div className="absolute top-[8px] z-[50] h-[8px] w-[38px] rounded-full bg-[#151515]" />

        {/* Screen container with isolation and translateZ to ensure perfect round corner clipping */}
        <div
          className="relative h-[329px] w-[152px] overflow-hidden rounded-[19px] bg-[var(--uc-app-bg)] isolate"
          style={{ transform: "translateZ(0)" }}
        >
          <div className="h-[812px] w-[375px] origin-top-left scale-[0.40533] rounded-[47px] overflow-hidden">
            <HuThemeShell theme={theme} themeScope="home">
              <HuThemeMotionLayer motionProgress={0.04} preview theme={theme} />
              <StatusBar variant={phoneChromeUsesLightForeground ? "dark" : "light"} />
              <div className="relative z-[1] h-[54px] flex-shrink-0" />
              <div className="relative z-[2] flex-shrink-0">
                <HuLightHeader showAmounts={showAmounts} onMessages={() => undefined} onToggleAmounts={() => undefined} preview />
              </div>
              <div className="scrollbar-hide relative z-[1] flex-1 overflow-hidden pb-[104px]">
                <HuHomeContent
                  concept={concept}
                  onCardDetails={() => undefined}
                  onMessages={() => undefined}
                  onMoreOptions={() => undefined}
                  onRequestMoney={() => undefined}
                  onSendMoney={() => undefined}
                  pendingActions={HU_PENDING_ACTIONS}
                  onToggleAmounts={() => undefined}
                  preview
                  showAmounts={showAmounts}
                />
              </div>
              <HuLightBottomNav activeNav="home" onChange={() => undefined} />
              {/* Home indicator bar */}
              <div className="absolute inset-x-0 bottom-[8px] z-[40] flex justify-center">
                <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-text)] opacity-[0.3]" />
              </div>
            </HuThemeShell>
          </div>
        </div>
      </div>
    </div>
  );
}

function HuThemeCarousel({
  appliedThemeId,
  onSelectTheme,
  selectedThemeId,
}: {
  appliedThemeId: HuThemeId;
  onSelectTheme: (themeId: HuThemeId) => void;
  selectedThemeId: HuThemeId;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isActive: false,
    scrollLeft: 0,
    startX: 0,
  });
  const suppressClickRef = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      isActive: true,
      scrollLeft: carouselRef.current?.scrollLeft ?? 0,
      startX: event.clientX,
    };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;

    if (!dragStateRef.current.isActive || !carousel) {
      return;
    }

    const dragDelta = event.clientX - dragStateRef.current.startX;

    if (Math.abs(dragDelta) > 12) {
      suppressClickRef.current = true;
    }

    carousel.scrollLeft = dragStateRef.current.scrollLeft - dragDelta;
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hadDragged = suppressClickRef.current;

    dragStateRef.current.isActive = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (hadDragged) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 160);
    }
  };

  const handleThemeClick = (themeId: HuThemeId) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onSelectTheme(themeId);
  };

  return (
    <div
      ref={carouselRef}
      className="scrollbar-hide flex w-full cursor-grab touch-pan-x select-none gap-[16px] overflow-x-auto px-[6px] py-[8px] active:cursor-grabbing"
      onPointerCancel={finishPointerDrag}
      onPointerDown={handlePointerDown}
      onPointerLeave={finishPointerDrag}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
    >
      {HU_THEME_PRESETS.map((theme) => {
        const isSelected = theme.id === selectedThemeId;
        const isApplied = theme.id === appliedThemeId;

        return (
          <button
            key={theme.id}
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={isSelected}
            className="flex w-[78px] shrink-0 flex-col items-center text-center"
            draggable={false}
            onClick={() => handleThemeClick(theme.id)}
            onDragStart={(event) => event.preventDefault()}
            type="button"
          >
            <span
              className={cn(
                "relative grid size-[64px] place-items-center rounded-full border transition-transform duration-200",
                isSelected
                  ? "scale-[1.04] border-[var(--uc-text)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--uc-text)_18%,transparent)]"
                  : "border-[color-mix(in_srgb,var(--uc-text)_18%,transparent)]",
              )}
              style={{ background: theme.swatchBackground }}
            >
              {isSelected ? (
                <span className="grid size-[34px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-app-bg)_62%,transparent)] text-[var(--uc-text)]">
                  <AppIcon name="prime-check" size={18} />
                </span>
              ) : null}
              {!isSelected && isApplied ? (
                <span className="absolute bottom-[-3px] right-[-3px] grid size-[22px] place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-app-bg)] shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
                  <AppIcon name="prime-check" size={13} />
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "mt-[8px] max-w-full truncate text-[12px] leading-[15px] tracking-[0]",
                isSelected ? "font-bold text-[var(--uc-text)]" : "font-normal text-[color-mix(in_srgb,var(--uc-text)_68%,transparent)]",
              )}
            >
              {theme.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HuLightHeader({
  onMessages,
  preview = false,
  showAmounts,
  onToggleAmounts,
}: {
  onMessages?: () => void;
  preview?: boolean;
  showAmounts: boolean;
  onToggleAmounts: () => void;
}) {
  return (
    <header className="relative z-[2] flex h-[40px] items-center justify-between px-[24px]">
      <UniCreditLogo className="h-[24px] w-auto" textColor="var(--hu-theme-hero-fg)" />

      <div className="flex items-center gap-[10px]">
        <button
          aria-label={showAmounts ? "Hide amounts" : "Show amounts"}
          className="grid size-[26px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]"
          disabled={preview}
          onClick={onToggleAmounts}
          type="button"
        >
          <AppIcon name={showAmounts ? "amount-hide" : "amount-show"} size={15} />
        </button>
        <button
          aria-label="Messages"
          className="grid size-[26px] place-items-center rounded-full border border-[color-mix(in_srgb,var(--hu-theme-hero-control-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--hu-theme-hero-control-bg)_72%,transparent)] text-[var(--hu-theme-hero-control-fg)] backdrop-blur-[10px]"
          disabled={preview}
          onClick={onMessages}
          type="button"
        >
          <AppIcon name="header-messages" size={17} />
        </button>
        <button aria-label="Profile" className="grid size-[34px] place-items-center rounded-full" type="button">
          <ProfileAvatar
            imageAlt="Alexandra profile"
            imageSrc={womanProfileSrc}
            size={34}
            variant="photo"
          />
        </button>
      </div>
    </header>
  );
}

function HuLightBalance({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  const displayName = concept.childName || "Alexandra";

  return (
    <section className="mt-[68px] px-[24px] text-center">
      <p className="text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        Welcome back {displayName}
      </p>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">4.500</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">,34 HUF</span>
          </>
        ) : (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">{HU_MASKED_DECIMALS} HUF</span>
          </>
        )}
      </div>
      <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        are available for you to spend today
      </p>
      <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        Your weekly spending limit:{" "}
        <span className="font-bold">
          {showAmounts ? `${formatHuFullAmount(HU_WEEKLY_SPENDING_LIMIT)} HUF` : `${HU_MASKED_INTEGER}${HU_MASKED_DECIMALS} HUF`}
        </span>
      </p>
    </section>
  );
}

function HuSavingBalance({
  showAmounts,
}: {
  showAmounts: boolean;
}) {
  return (
    <section className="mt-[68px] px-[24px] text-center">
      <p className="text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        All your savings
      </p>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">4.500</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">,34 HUF</span>
          </>
        ) : (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">{HU_MASKED_DECIMALS} HUF</span>
          </>
        )}
      </div>
      <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        You have saved on your accounts and goals
      </p>
    </section>
  );
}

function HuLightActionRail({
  onCardDetails,
  onMoreOptions,
  onRequestMoney,
  onSendMoney,
}: {
  onCardDetails: () => void;
  onMoreOptions: () => void;
  onRequestMoney: () => void;
  onSendMoney: () => void;
}) {
  return (
    <section className="mt-[66px] px-[24px]">
      <div className="grid grid-cols-4 gap-[18px]">
        {HU_LIGHT_ACTIONS.map((action) => (
          <button
            key={action.label}
            aria-label={action.label}
            className="flex min-w-0 flex-col items-center gap-[10px]"
            onClick={
              action.id === "more"
                ? onMoreOptions
                : action.id === "request"
                ? onRequestMoney
                : action.id === "card"
                ? onCardDetails
                : action.id === "send"
                ? onSendMoney
                : undefined
            }
            type="button"
          >
            <span className="grid size-[64px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]">
              <AppIcon name={action.icon} size={24} />
            </span>
            <span className="min-h-[32px] max-w-[76px] text-center text-[14px] font-medium leading-[16px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
              {action.label.split(" ").map((word) => (
                <span key={word} className="block h-[16px]">
                  {word}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HuSavingActionRail({
  onCardDetails,
  onMoreOptions,
  onRequestMoney,
  onSaveMoney,
}: {
  onCardDetails: () => void;
  onMoreOptions: () => void;
  onRequestMoney: () => void;
  onSaveMoney: () => void;
}) {
  return (
    <section className="mt-[66px] px-[24px]">
      <div className="grid grid-cols-4 gap-[18px]">
        {HU_SAVING_ACTIONS.map((action) => (
          <button
            key={action.id}
            className="flex min-w-0 flex-col items-center gap-[10px]"
            onClick={
              action.id === "save"
                ? onSaveMoney
                : action.id === "request"
                ? onRequestMoney
                : action.id === "card"
                ? onCardDetails
                : action.id === "more"
                ? onMoreOptions
                : undefined
            }
            type="button"
          >
            <span className="grid size-[64px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]">
              <AppIcon name={action.icon} size={24} />
            </span>
            <span className="min-h-[32px] max-w-[76px] text-center text-[14px] font-medium leading-[16px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
              {action.label.split(" ").map((word) => (
                <span key={word} className="block h-[16px]">
                  {word}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HuRequestMoneyRail({
  actions,
  onRequestMoney,
  onSendMoney,
}: {
  actions: HuPendingAction[];
  onRequestMoney: () => void;
  onSendMoney: () => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    hasDragged: false,
    isActive: false,
    scrollLeft: 0,
    startX: 0,
  });
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);

  const clearSuppressClick = () => {
    suppressClickRef.current = false;

    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
    },
    [],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    clearSuppressClick();

    dragStateRef.current = {
      hasDragged: false,
      isActive: true,
      scrollLeft: railRef.current?.scrollLeft ?? 0,
      startX: event.clientX,
    };

    if (event.pointerType === "mouse") {
      event.preventDefault();
    }

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!dragStateRef.current.isActive || !rail) {
      return;
    }

    const dragDelta = event.clientX - dragStateRef.current.startX;

    if (Math.abs(dragDelta) > 8) {
      dragStateRef.current.hasDragged = true;
      suppressClickRef.current = true;
      event.preventDefault();
    }

    rail.scrollLeft = dragStateRef.current.scrollLeft - dragDelta;
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hadDragged = dragStateRef.current.hasDragged;
    dragStateRef.current.isActive = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!hadDragged) {
      return;
    }

    suppressClickRef.current = true;
    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false;
      suppressClickTimerRef.current = null;
    }, 260);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    clearSuppressClick();
  };

  const openAction = (action: HuPendingAction) => {
    if (action.flow === "send-money") {
      onSendMoney();
      return;
    }

    onRequestMoney();
  };

  return (
    <section className="mt-[24px]" data-hu-request-rail>
      <div
        ref={railRef}
        className="cursor-grab touch-pan-x select-none overflow-x-auto px-[24px] active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onClickCapture={handleClickCapture}
        onPointerCancel={finishPointerDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
      >
        <div className="flex w-max gap-[12px] pr-[24px]">
          {actions.map((action) => (
            <HuPendingActionCard key={action.id} action={action} onClick={() => openAction(action)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HuPendingActionCard({ action, onClick }: { action: HuPendingAction; onClick: () => void }) {
  const toneStyles: Record<HuPendingActionTone, { bg: string; fg: string }> = {
    green: {
      bg: "color-mix(in srgb, var(--uc-green-success) 14%, var(--hu-theme-card-bg))",
      fg: "var(--uc-green-success)",
    },
    blue: {
      bg: "color-mix(in srgb, var(--hu-theme-accent-2) 15%, var(--hu-theme-card-bg))",
      fg: "var(--hu-theme-accent-strong)",
    },
    pink: {
      bg: "color-mix(in srgb, var(--uc-magenta-main) 15%, var(--hu-theme-card-bg))",
      fg: "var(--uc-magenta-main)",
    },
    amber: {
      bg: "color-mix(in srgb, var(--uc-yellow-gold) 18%, var(--hu-theme-card-bg))",
      fg: "color-mix(in srgb, var(--uc-yellow-gold) 74%, var(--uc-text))",
    },
  };
  const tone = toneStyles[action.tone];
  const isMoneyRequest = action.icon === "hu-kids-request-money";

  return (
    <button
      className="relative h-[126px] w-[327px] shrink-0 overflow-hidden rounded-[16px] bg-[var(--hu-theme-card-bg)] text-left shadow-sm transition-transform active:scale-[0.99]"
      data-hu-request-card
      draggable={false}
      onClick={onClick}
      onDragStart={(event) => event.preventDefault()}
      type="button"
    >
      <div className={cn("relative z-[1] h-full px-[18px] py-[18px]", isMoneyRequest ? "w-[226px]" : "w-full pr-[78px]")}>
        <div className="flex items-start justify-between gap-[10px]">
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{action.title}</h2>
          <span
            className="rounded-full px-[8px] py-[3px] text-[10px] font-bold uppercase leading-[12px] tracking-[0]"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {action.status}
          </span>
        </div>
        <p className="mt-[14px] text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
          {action.person}
        </p>
        <p className="mt-[10px] line-clamp-2 text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
          {action.description}
        </p>
      </div>
      {isMoneyRequest ? (
        <HuRequestMoneyArt />
      ) : (
        <span
          className="absolute bottom-[18px] right-[18px] grid size-[46px] place-items-center rounded-full"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <AppIcon name={action.icon} size={24} />
        </span>
      )}
    </button>
  );
}

function HuRequestMoneyArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0 right-0 w-[126px] bg-[var(--uc-green-deep)]"
      style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div className="absolute left-[30px] top-[34px] h-[58px] w-[102px] -rotate-[14deg] overflow-hidden rounded-[6px] bg-[color-mix(in_srgb,var(--uc-green-success)_78%,var(--uc-yellow-gold))] shadow-sm">
        <div className="absolute -left-[16px] top-[4px] h-[54px] w-[54px] rotate-45 border-[9px] border-[var(--uc-static-white)] opacity-80" />
        <div className="absolute left-[24px] top-[10px] h-[40px] w-[40px] rotate-45 border-[8px] border-[var(--uc-static-white)] opacity-80" />
        <span className="absolute right-[10px] top-[12px] text-[6px] font-bold leading-[7px] text-[var(--uc-text)]">
          budem
        </span>
        <span className="absolute bottom-[12px] right-[18px] size-[16px] rounded-full bg-[var(--uc-red-main)]" />
        <span className="absolute bottom-[12px] right-[9px] size-[16px] rounded-full bg-[var(--uc-yellow-gold)] opacity-90" />
      </div>
    </div>
  );
}

function HuKidsGoalsSection({
  goals,
  onCreateGoal,
  onSelectGoal,
  showAmounts,
}: {
  goals: SavingGoal[];
  onCreateGoal: () => void;
  onSelectGoal: (goalId: string) => void;
  showAmounts: boolean;
}) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <div className="flex items-center justify-between gap-[12px]">
        <div>
          <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Saving goals</h2>
          <p className="mt-[4px] text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
            Goals from Kids RO, adapted for Alexandra.
          </p>
        </div>
        <button
          className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]"
          onClick={onCreateGoal}
          type="button"
        >
          <AppIcon name="add-circle" size={20} />
        </button>
      </div>

      <div className="mt-[16px] flex flex-col gap-[10px]">
        {goals.slice(0, 3).map((goal) => (
          <HuKidsGoalCard
            key={goal.id}
            goal={goal}
            onClick={() => onSelectGoal(goal.id)}
            showAmounts={showAmounts}
          />
        ))}
      </div>
    </section>
  );
}

function HuKidsGoalCard({
  goal,
  onClick,
  showAmounts,
}: {
  goal: SavingGoal;
  onClick: () => void;
  showAmounts: boolean;
}) {
  const progress = goalProgress(goal);

  return (
    <button
      className="w-full rounded-[14px] bg-[var(--hu-theme-card-strong-bg)] p-[14px] text-left transition-transform active:scale-[0.99]"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start gap-[12px]">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name="trophy" size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-[8px]">
            <h3 className="min-w-0 flex-1 text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
              {goal.title}
            </h3>
            <span className="shrink-0 rounded-full bg-[var(--hu-theme-control-bg)] px-[8px] py-[3px] text-[11px] font-bold leading-[13px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
              {progress}%
            </span>
          </div>
          <p className="mt-[5px] text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
            {formatHuKidsGoalAmount(goal.savedAmount, showAmounts)} / {formatHuKidsGoalAmount(goal.targetAmount, showAmounts)}
          </p>
          <div className="mt-[10px] h-[8px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
            <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </button>
  );
}

function HuKidsGoalPageHeader({
  onBack,
  theme,
  title,
}: {
  onBack: () => void;
  theme: HuThemePreset;
  title: string;
}) {
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  return (
    <PageHeader
      collapsedTitleProgress={1}
      compact
      includeSafeArea
      onBack={onBack}
      showHelp={false}
      title={title}
      variant={headerVariant}
    />
  );
}

function HuKidsGoalsPage({
  goals,
  onBack,
  onCreateGoal,
  onSelectGoal,
  showAmounts,
  theme,
}: {
  goals: SavingGoal[];
  onBack: () => void;
  onCreateGoal: () => void;
  onSelectGoal: (goalId: string) => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Saving goals" />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
        <div className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <div className="flex items-start gap-[12px]">
            <span className="grid size-[46px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
              <AppIcon name="hu-kids-saving" size={25} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold leading-[24px] tracking-[0] text-[var(--uc-text)]">Save for what matters</h1>
              <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                The full Kids RO goals model is now available in HU Kids.
              </p>
            </div>
          </div>
          <PrimaryButton className="mt-[18px] !w-full" onClick={onCreateGoal}>
            Create saving goal
          </PrimaryButton>
        </div>

        <div className="mt-[14px] flex flex-col gap-[10px]">
          {goals.map((goal) => (
            <HuKidsGoalCard
              key={goal.id}
              goal={goal}
              onClick={() => onSelectGoal(goal.id)}
              showAmounts={showAmounts}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function HuKidsGoalDetailPage({
  goal,
  onAddMoney,
  onAskParent,
  onBack,
  showAmounts,
  theme,
}: {
  goal: SavingGoal | null;
  onAddMoney: (amount: number) => void;
  onAskParent: () => void;
  onBack: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  if (!goal) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Saving goal" />
        <main className="px-[24px] pt-[18px]">
          <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
            <h1 className="text-[20px] font-bold leading-[24px] tracking-[0] text-[var(--uc-text)]">No goal selected</h1>
            <p className="mt-[6px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">Create a goal to start saving.</p>
          </section>
        </main>
      </div>
    );
  }

  const progress = goalProgress(goal);

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title={goal.title} />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
        <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <div className="flex items-center gap-[14px]">
            <span className="grid size-[54px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
              <AppIcon name="trophy" size={28} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">Saved so far</p>
              <h1 className="mt-[4px] text-[30px] font-bold leading-[34px] tracking-[0] text-[var(--uc-text)]">
                {formatHuKidsGoalAmount(goal.savedAmount, showAmounts)}
              </h1>
              <p className="mt-[2px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                Target {formatHuKidsGoalAmount(goal.targetAmount, showAmounts)}
              </p>
            </div>
          </div>

          <div className="mt-[18px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
            <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-[10px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
            {progress}% complete
          </p>
        </section>

        <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
          <button
            className="h-[44px] rounded-[12px] bg-[var(--hu-theme-accent-strong)] text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text-inverse)]"
            onClick={() => onAddMoney(1000)}
            type="button"
          >
            Add 1.000 HUF
          </button>
          <button
            className="h-[44px] rounded-[12px] bg-[var(--hu-theme-control-bg)] text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--hu-theme-accent-strong)]"
            onClick={onAskParent}
            type="button"
          >
            Ask parent
          </button>
        </div>

        <section className="mt-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <div className="flex items-start gap-[12px]">
            <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
              <AppIcon name="gift" size={22} />
            </span>
            <div>
              <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Contributors</h2>
              <p className="mt-[6px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                Mom helped last week with +2.000 HUF. Wishlist sharing stays a future release item.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function HuKidsCreateGoalPage({
  onBack,
  onCreateGoal,
  theme,
}: {
  onBack: () => void;
  onCreateGoal: (title: string, targetAmount: number) => void;
  theme: HuThemePreset;
}) {
  const [title, setTitle] = useState("Skate lessons");
  const [target, setTarget] = useState("30000");
  const amount = Number(target.replace(/[^\d]/g, ""));
  const canCreate = title.trim().length > 0 && amount > 0;

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Create goal" />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[18px]">
        <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm">
          <label className="block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
            Goal name
          </label>
          <input
            className="mt-[8px] h-[48px] w-full rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What are you saving for?"
            value={title}
          />

          <label className="mt-[18px] block text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
            Target
          </label>
          <div className="mt-[8px] flex h-[58px] items-center rounded-[12px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[14px] focus-within:ring-2 focus-within:ring-[var(--uc-action)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--uc-app-bg)]">
            <input
              className="min-w-0 flex-1 bg-transparent text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)] outline-none"
              inputMode="numeric"
              onChange={(event) => setTarget(event.target.value.replace(/[^\d]/g, ""))}
              value={target}
            />
            <span className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">HUF</span>
          </div>

          <PrimaryButton className="mt-[18px] !w-full" disabled={!canCreate} onClick={() => onCreateGoal(title, amount)}>
            Create goal
          </PrimaryButton>
        </section>
      </main>
    </div>
  );
}

function getHuLearnCompletedLessonsCount(topic: HuLearnTopic, completedLessonIds: string[]) {
  return topic.lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
}

function getHuLearnTopicProgress(topic: HuLearnTopic, completedLessonIds: string[]) {
  if (topic.lessons.length === 0) {
    return 0;
  }

  return Math.round((getHuLearnCompletedLessonsCount(topic, completedLessonIds) / topic.lessons.length) * 100);
}

const HU_LEARN_CARD_SURFACE_STYLE = {
  background: "var(--hu-learn-card-bg)",
  borderColor: "var(--hu-learn-card-border)",
  boxShadow: "var(--hu-learn-card-shadow)",
} as CSSProperties;

// Logical PNG slots are intentionally stable so final learning artwork can be swapped without relayout.
const HU_LEARN_ART_SLOT_CLASS: Record<HuLearnArtVariant, string> = {
  "topic-card": "right-[6px] top-[8px] h-[92px] w-[98px] rounded-[22px]",
  "topic-featured": "right-[10px] top-[6px] h-[122px] w-[140px] rounded-[28px]",
  "topic-hero": "right-[12px] top-[8px] h-[146px] w-[166px] rounded-[32px]",
  "lesson-row": "right-[8px] top-[10px] h-[88px] w-[100px] rounded-[22px]",
  "lesson-hero": "bottom-[2px] right-[-8px] h-[230px] w-[250px] rounded-[42px]",
};

const HU_LEARN_ARTWORK_SRC: Record<HuLearnArtworkKey, string> = {
  "topic-money-basics": huLearnTopicMoneyBasicsSrc,
  "topic-saving-goals": huLearnTopicSavingGoalsSrc,
  "topic-online-safety": huLearnTopicOnlineSafetySrc,
  "topic-request-money": huLearnTopicRequestMoneySrc,
  "topic-card-confidence": huLearnTopicCardConfidenceSrc,
  balance: huLearnBalanceSrc,
  "spend-today": huLearnSpendTodaySrc,
  "money-check": huLearnMoneyCheckSrc,
  target: huLearnTargetSrc,
  boost: huLearnBoostSrc,
  "ask-help": huLearnAskHelpSrc,
  pause: huLearnPauseSrc,
  "private-codes": huLearnPrivateCodesSrc,
  "report-safety": huLearnReportSafetySrc,
  "request-reason": huLearnRequestReasonSrc,
  "request-amount": huLearnRequestAmountSrc,
  "request-wait": huLearnRequestWaitSrc,
  "card-pay": huLearnCardPaySrc,
  "card-freeze": huLearnCardFreezeSrc,
  "card-private": huLearnCardPrivateSrc,
};

const HU_LEARN_TOPIC_ARTWORK: Record<string, HuLearnArtworkKey> = {
  "money-basics": "topic-money-basics",
  "saving-goals": "topic-saving-goals",
  "online-safety": "topic-online-safety",
  "request-money": "topic-request-money",
  "card-confidence": "topic-card-confidence",
  "smart-budgeting": "money-check",
  "earning-money": "boost",
  "digital-security": "private-codes",
  "family-banking": "ask-help",
};

const HU_LEARN_LESSON_ARTWORK: Record<string, HuLearnArtworkKey> = {
  "money-basics-balance": "balance",
  "money-basics-today": "spend-today",
  "money-basics-check": "money-check",
  "saving-goals-target": "target",
  "saving-goals-boost": "boost",
  "saving-goals-share": "ask-help",
  "online-safety-pause": "pause",
  "online-safety-private": "private-codes",
  "online-safety-report": "report-safety",
  "request-money-reason": "request-reason",
  "request-money-amount": "request-amount",
  "request-money-wait": "request-wait",
  "card-confidence-pay": "card-pay",
  "card-confidence-freeze": "card-freeze",
  "card-confidence-details": "card-private",
  "budgeting-categories": "balance",
  "budgeting-tracking": "spend-today",
  "budgeting-adjust": "card-freeze",
  "earning-work": "boost",
  "earning-rewards": "target",
  "earning-hustle": "card-pay",
  "security-biometric": "card-private",
  "security-phishing": "pause",
  "security-wifi": "report-safety",
  "family-decisions": "ask-help",
  "family-trust": "request-wait",
  "family-goals": "request-reason",
};

function getHuLearnArtworkSrc(key?: HuLearnArtworkKey) {
  return key ? HU_LEARN_ARTWORK_SRC[key] : undefined;
}

function getHuLearnTopicImageSrc(topic?: HuLearnTopic | null) {
  return getHuLearnArtworkSrc(topic ? HU_LEARN_TOPIC_ARTWORK[topic.id] : undefined);
}

function getHuLearnLessonImageSrc(lesson?: HuLearnLesson | null) {
  return getHuLearnArtworkSrc(lesson ? HU_LEARN_LESSON_ARTWORK[lesson.id] : undefined);
}

function HuKidsLearnPage({
  completedLessonIds,
  learnModules,
  onBack,
  onMessages,
  onSelectTopic,
  theme,
  topics,
}: {
  completedLessonIds: string[];
  learnModules: LearnModule[];
  onBack?: () => void;
  onMessages?: () => void;
  onSelectTopic: (topicId: string) => void;
  theme: HuThemePreset;
  topics: HuLearnTopic[];
}) {
  const completedTopics = topics.filter((topic) => getHuLearnTopicProgress(topic, completedLessonIds) === 100).length;
  const suggestedTopic = topics.find((topic) => topic.id === "saving-goals") ?? topics[0];

  return (
    <HuKidsPiMenuFrame header={onBack ? (
      <div className="w-full bg-[var(--hu-kids-menu-header-bg)]">
        <div className="px-[24px] pb-[22px]">
          <div className="flex min-h-[32px] items-start gap-[8px]">
            <button
              type="button"
              className="grid size-[32px] shrink-0 place-items-center text-[var(--uc-text)]"
              onClick={onBack}
              aria-label="Back"
            >
              <AppIcon name="chevron-left" size={24} />
            </button>
            <h1 className="uc-type-h1 min-w-0 flex-1 text-[var(--hu-kids-menu-title-fg)]">Learn</h1>
            <HeaderActionRail>
              <HeaderActionButton icon="messages" label="Messages" onClick={onMessages} />
            </HeaderActionRail>
          </div>
        </div>
      </div>
    ) : undefined} onMessages={onMessages} theme={theme} title="Learn">
      <section className="px-[16px] pt-[16px]">
        <div className="flex items-end justify-between gap-[12px] px-[2px]">
          <div>
            <p className="text-[13px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
              Financial education
            </p>
            <h2 className="mt-[4px] text-[26px] font-bold leading-[30px] tracking-[0] text-[var(--uc-text)]">
              Money lessons
            </h2>
          </div>
          <p className="shrink-0 text-right text-[12px] font-bold leading-[15px] tracking-[0] text-[var(--uc-text-muted)]">
            {completedTopics}/{topics.length}
            <br />
            topics done
          </p>
        </div>

        <div className="mt-[16px]">
          <p className="px-[2px] text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">New</p>
          <HuLearnTopicCard
            className="mt-[10px]"
            completedLessonIds={completedLessonIds}
            featured
            onClick={() => onSelectTopic(suggestedTopic?.id ?? "")}
            topic={suggestedTopic}
          />
        </div>

        <section className="mt-[22px]">
          <div className="flex items-center justify-between px-[2px]">
            <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">All topics</p>
            <p className="text-[12px] font-bold leading-[15px] tracking-[0] text-[var(--uc-text-muted)]">
              {learnModules.length} from Kids RO
            </p>
          </div>
          <div className="mt-[10px] grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
            {topics
              .filter((topic) => topic.id !== suggestedTopic?.id)
              .map((topic) => (
                <HuLearnTopicCard
                  key={topic.id}
                  completedLessonIds={completedLessonIds}
                  onClick={() => onSelectTopic(topic.id)}
                  topic={topic}
                />
              ))}
          </div>
        </section>
      </section>
    </HuKidsPiMenuFrame>
  );
}

function HuLearnTopicCard({
  className,
  completedLessonIds,
  featured = false,
  onClick,
  topic,
}: {
  className?: string;
  completedLessonIds: string[];
  featured?: boolean;
  onClick: () => void;
  topic?: HuLearnTopic;
}) {
  if (!topic) {
    return null;
  }

  const progress = getHuLearnTopicProgress(topic, completedLessonIds);
  const completedCount = getHuLearnCompletedLessonsCount(topic, completedLessonIds);
  const imageSrc = getHuLearnTopicImageSrc(topic);

  return (
    <button
      className={cn(
        "group relative flex w-full items-end overflow-hidden rounded-[8px] border p-[14px] pb-[24px] text-left transition-opacity hover:opacity-90",
        featured ? "min-h-[208px] pt-[124px]" : "min-h-[184px] pt-[104px]",
        className,
      )}
      data-hu-learn-topic-card={topic.id}
      onClick={onClick}
      style={HU_LEARN_CARD_SURFACE_STYLE}
      type="button"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--hu-learn-card-glow)" }} />
      <HuLearnTopicArt imageSrc={imageSrc} variant={featured ? "topic-featured" : "topic-card"} visual={topic.visual} />

      <div className="relative z-[1] w-full">
        <p className={cn("font-bold tracking-[0] text-[var(--uc-text)]", featured ? "text-[22px] leading-[26px]" : "text-[17px] leading-[20px]")}>
          {topic.title}
        </p>
        <p className={cn("mt-[5px] font-normal tracking-[0] text-[var(--uc-text-muted)]", featured ? "text-[14px] leading-[18px]" : "text-[12px] leading-[15px]")}>
          {topic.subtitle}
        </p>
        <p className="mt-[7px] text-[11px] font-bold leading-[13px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
          {completedCount}/{topic.lessons.length} lessons
        </p>
      </div>

      <div className="absolute inset-x-[14px] bottom-[11px] h-[5px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--uc-text)_12%,transparent)]">
        <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}

function HuKidsLearnTopicPage({
  completedLessonIds,
  onBack,
  onOpenLesson,
  theme,
  topic,
}: {
  completedLessonIds: string[];
  onBack: () => void;
  onOpenLesson: (topicId: string, lessonId: string) => void;
  theme: HuThemePreset;
  topic: HuLearnTopic | null;
}) {
  if (!topic) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Learn" />
      </div>
    );
  }

  const progress = getHuLearnTopicProgress(topic, completedLessonIds);
  const completedCount = getHuLearnCompletedLessonsCount(topic, completedLessonIds);
  const imageSrc = getHuLearnTopicImageSrc(topic);

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col" data-hu-learn-topic={topic.id}>
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Learn" />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[38px]">
        <section className="relative min-h-[316px] overflow-hidden px-[24px] pb-[22px] pt-[18px]">
          <HuLearnTopicArt imageSrc={imageSrc} variant="topic-hero" visual={topic.visual} />
          <div className="relative z-[1] max-w-[295px] pt-[138px]">
            <p className="text-[13px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
              {completedCount === topic.lessons.length ? "Completed" : "Course"}
            </p>
            <h1 className="mt-[8px] text-[34px] font-bold leading-[38px] tracking-[0] text-[var(--hu-theme-hero-fg)]">
              {topic.title}
            </h1>
            <p className="mt-[10px] text-[15px] font-normal leading-[20px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
              {topic.helper}
            </p>
          </div>
          <div className="relative z-[1] mt-[18px] h-[6px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--hu-theme-hero-fg)_20%,transparent)]">
            <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="px-[24px] pt-[16px]">
          <div className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[14px] shadow-sm">
            <div className="flex items-center justify-between gap-[12px]">
              <p className="text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">Lessons completed</p>
              <p className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
                {completedCount}/{topic.lessons.length}
              </p>
            </div>
          </div>

          <div className="mt-[14px] flex flex-col gap-[10px]">
            {topic.lessons.map((lesson, index) => (
              <HuLearnLessonListCard
                key={lesson.id}
                completed={completedLessonIds.includes(lesson.id)}
                index={index}
                lesson={lesson}
                onClick={() => onOpenLesson(topic.id, lesson.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function HuLearnLessonListCard({
  completed,
  index,
  lesson,
  onClick,
}: {
  completed: boolean;
  index: number;
  lesson: HuLearnLesson;
  onClick: () => void;
}) {
  const imageSrc = getHuLearnLessonImageSrc(lesson);

  return (
    <button
      className="relative min-h-[104px] overflow-hidden rounded-[18px] border p-[16px] text-left transition-transform active:scale-[0.99]"
      data-hu-learn-lesson-card={lesson.id}
      onClick={onClick}
      style={HU_LEARN_CARD_SURFACE_STYLE}
      type="button"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--hu-learn-card-glow)" }} />
      <HuLearnTopicArt imageSrc={imageSrc} variant="lesson-row" visual={lesson.visual} />
      <div className="relative z-[1] pr-[112px]">
        <p className="text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">Lesson {index + 1}</p>
        <h2 className="mt-[5px] text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{lesson.title}</h2>
        <p className="mt-[9px] flex items-center gap-[7px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
          {completed ? (
            <>
              <AppIcon name="prime-check" size={15} color="var(--hu-theme-accent-strong)" />
              Completed
            </>
          ) : (
            "Ready to start"
          )}
        </p>
      </div>
    </button>
  );
}

function HuKidsLearnLessonPage({
  completed,
  lesson,
  onBack,
  onComplete,
  theme,
  topic,
}: {
  completed: boolean;
  lesson: HuLearnLesson | null;
  onBack: () => void;
  onComplete: () => void;
  theme: HuThemePreset;
  topic: HuLearnTopic | null;
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    setCurrentSlideIndex(0);
    if (completed && lesson?.quiz) {
      const initial: Record<number, number> = {};
      lesson.quiz.forEach((q, idx) => {
        initial[idx] = q.correctIndex;
      });
      setSelectedAnswers(initial);
    } else {
      setSelectedAnswers({});
    }
  }, [lesson, completed]);

  if (!topic || !lesson) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Lesson" />
      </div>
    );
  }

  const lessonIndex = topic.lessons.findIndex((item) => item.id === lesson.id);
  const progress = ((lessonIndex + 1) / topic.lessons.length) * 100;
  const imageSrc = getHuLearnLessonImageSrc(lesson);

  const totalSlides = (lesson.slides?.length ?? 0) + 1; // slides + quiz page
  const hasQuiz = lesson.quiz && lesson.quiz.length > 0;

  const allCorrect = hasQuiz
    ? lesson.quiz.every((q, idx) => selectedAnswers[idx] === q.correctIndex)
    : true;

  const handleContinue = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleBackSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col" data-hu-learn-lesson={lesson.id}>
      <HuKidsGoalPageHeader onBack={handleBackSlide} theme={theme} title="Lesson" />

      {/* Slide Segmented Indicator */}
      <div className="flex gap-[6px] justify-center mt-[10px] px-[24px]">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-[4px] flex-1 rounded-full transition-all duration-300",
              idx <= currentSlideIndex
                ? "bg-[var(--hu-theme-accent-strong)]"
                : "bg-[color-mix(in_srgb,var(--uc-text)_12%,transparent)]"
            )}
          />
        ))}
      </div>

      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[24px] pb-[36px] pt-[14px]">
        {currentSlideIndex < (lesson.slides?.length ?? 0) ? (
          // Slide View
          <div className="flex flex-col gap-[14px]">
            <section
              className="relative min-h-[162px] overflow-hidden rounded-[22px] border p-[22px] pr-[150px]"
              style={HU_LEARN_CARD_SURFACE_STYLE}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--hu-learn-card-glow)" }} />
              <p className="text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
                {lesson.eyebrow} - Slide {currentSlideIndex + 1} of {lesson.slides?.length ?? 3}
              </p>
              <h1 className="mt-[10px] text-[22px] font-bold leading-[26px] tracking-[0] text-[var(--uc-text)]">{lesson.title}</h1>
              <HuLearnTopicArt imageSrc={imageSrc} variant="topic-hero" visual={lesson.visual} />
            </section>

            <section className="rounded-[18px] bg-[var(--hu-theme-card-bg)] p-[20px] shadow-sm border border-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] min-h-[160px]">
              <h2 className="text-[19px] font-bold leading-[23px] tracking-[0] text-[var(--uc-text)]">
                {lesson.slides?.[currentSlideIndex]?.title ?? "Learn"}
              </h2>
              <p className="mt-[12px] text-[16px] font-normal leading-[22px] tracking-[0] text-[var(--uc-text-muted)]">
                {lesson.slides?.[currentSlideIndex]?.text}
              </p>
            </section>

            <button
              className="mt-[12px] h-[48px] w-full rounded-[14px] bg-[var(--hu-theme-accent-strong)] text-[15px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
              onClick={handleContinue}
              type="button"
            >
              Continue
            </button>
          </div>
        ) : (
          // Quiz View
          <div className="flex flex-col gap-[14px]">
            <section
              className="relative min-h-[120px] overflow-hidden rounded-[22px] border p-[20px]"
              style={HU_LEARN_CARD_SURFACE_STYLE}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--hu-learn-card-glow)" }} />
              <p className="text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
                {lesson.eyebrow} - Checkpoint
              </p>
              <h1 className="mt-[8px] text-[24px] font-bold leading-[28px] tracking-[0] text-[var(--uc-text)]">Quick Quiz</h1>
              <p className="mt-[6px] text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
                Answer both questions correctly to complete the lesson.
              </p>
            </section>

            {lesson.quiz?.map((q, qIndex) => {
              const selectedOption = selectedAnswers[qIndex];
              const isAnswered = selectedOption !== undefined;
              const isCorrect = selectedOption === q.correctIndex;
              const questionId = `hu-learn-${lesson.id}-${qIndex}-question`;
              const feedbackId = `hu-learn-${lesson.id}-${qIndex}-feedback`;

              return (
                <div
                  key={qIndex}
                  className="rounded-[18px] bg-[var(--hu-theme-card-bg)] p-[18px] shadow-sm border border-[color-mix(in_srgb,var(--uc-text)_6%,transparent)]"
                  role="radiogroup"
                  aria-labelledby={questionId}
                >
                  <p className="text-[12px] font-bold text-[var(--hu-theme-accent-strong)] uppercase tracking-wider">
                    Question {qIndex + 1}
                  </p>
                  <h3 id={questionId} className="mt-[4px] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
                    {q.question}
                  </h3>
                  <div className="mt-[12px] flex flex-col gap-[8px]">
                    {q.options.map((option, optIndex) => {
                      const isSelected = selectedOption === optIndex;
                      const isOptionCorrect = optIndex === q.correctIndex;

                      let optionClass =
                        "border border-[color-mix(in_srgb,var(--uc-text)_10%,transparent)] bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]";
                      if (isSelected) {
                        if (isOptionCorrect) {
                          optionClass =
                            "border-2 border-[var(--uc-green-main)] bg-[color-mix(in_srgb,var(--uc-green-main)_10%,transparent)] text-[var(--uc-text)] font-semibold";
                        } else {
                          optionClass =
                            "border-2 border-[var(--uc-red-main)] bg-[color-mix(in_srgb,var(--uc-red-main)_10%,transparent)] text-[var(--uc-text)] font-semibold";
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          aria-checked={isSelected}
                          aria-describedby={isAnswered ? feedbackId : undefined}
                          role="radio"
                          className={cn(
                            "flex w-full items-center justify-between rounded-[12px] px-[16px] py-[12px] text-left text-[14px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                            optionClass
                          )}
                          onClick={() => {
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [qIndex]: optIndex,
                            }));
                          }}
                        >
                          <span className="flex-1 pr-2">{option}</span>
                          <span
                            className={cn(
                              "size-[18px] rounded-full border flex items-center justify-center shrink-0",
                              isSelected
                                ? isOptionCorrect
                                  ? "border-[var(--uc-green-main)] bg-[var(--uc-green-main)] text-white"
                                  : "border-[var(--uc-red-main)] bg-[var(--uc-red-main)] text-white"
                                : "border-[color-mix(in_srgb,var(--uc-text)_20%,transparent)]"
                            )}
                          >
                            {isSelected && <span className="size-[8px] rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <p
                      id={feedbackId}
                      aria-live="polite"
                      className={cn(
                        "mt-[10px] text-[13px] font-medium flex items-center gap-1",
                        isCorrect ? "text-[var(--uc-green-main)]" : "text-[var(--uc-red-main)]"
                      )}
                    >
                      {isCorrect ? "Correct. Great job." : "Incorrect. Try another option."}
                    </p>
                  )}
                </div>
              );
            })}

            <button
              className={cn(
                "mt-[12px] h-[48px] w-full rounded-[14px] text-[15px] font-bold leading-[19px] tracking-[0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                completed
                  ? "bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]"
                  : allCorrect
                  ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                  : "bg-[color-mix(in_srgb,var(--uc-text)_10%,transparent)] text-[var(--uc-text-muted)] cursor-not-allowed",
              )}
              onClick={onComplete}
              disabled={!allCorrect}
              type="button"
            >
              {completed ? "Lesson completed" : "Mark lesson complete"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function HuLearnTopicArt({
  className,
  imageSrc,
  variant,
  visual,
}: {
  className?: string;
  imageSrc?: string;
  variant: HuLearnArtVariant;
  visual: HuLearnVisual;
}) {
  return (
    <div
      aria-hidden="true"
      data-hu-learn-art-slot={variant}
      className={cn(
        "pointer-events-none absolute z-0",
        imageSrc
          ? "overflow-visible border-0 shadow-none"
          : "overflow-hidden border shadow-[0_16px_24px_color-mix(in_srgb,var(--uc-static-black)_18%,transparent)]",
        HU_LEARN_ART_SLOT_CLASS[variant],
        className,
      )}
      style={{
        background: imageSrc ? "transparent" : "var(--hu-learn-art-bg)",
        borderColor: imageSrc ? "transparent" : "var(--hu-learn-card-border)",
      }}
    >
      {imageSrc ? (
        <img
          alt=""
          className="relative z-[1] h-full w-full select-none object-contain"
          data-hu-learn-art-image={variant}
          draggable={false}
          src={imageSrc}
        />
      ) : null}
      {!imageSrc && visual === "balance" ? (
        <>
          <span className="absolute left-[15%] top-[24%] size-[42%] rounded-full border-[4px] border-[color-mix(in_srgb,var(--uc-yellow-gold)_78%,var(--uc-static-white))] bg-[color-mix(in_srgb,var(--uc-yellow-gold)_24%,var(--hu-learn-art-soft))]" />
          <span className="absolute left-[34%] top-[29%] size-[42%] rounded-full border-[4px] border-[color-mix(in_srgb,var(--hu-learn-art-ink)_74%,var(--uc-static-white))] bg-[color-mix(in_srgb,var(--hu-learn-art-soft)_84%,var(--hu-theme-accent))]" />
          <span className="absolute bottom-[18%] right-[18%] h-[28%] w-[7%] rounded-full bg-[var(--hu-theme-accent-strong)]" />
          <span className="absolute bottom-[18%] right-[31%] h-[20%] w-[7%] rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent-2)_68%,var(--uc-static-white))]" />
        </>
      ) : null}
      {!imageSrc && visual === "goals" ? (
        <>
          <span className="absolute left-[16%] top-[16%] size-[58%] rounded-full border-[7px] border-[color-mix(in_srgb,var(--hu-learn-art-ink)_78%,var(--uc-static-white))]" />
          <span className="absolute left-[32%] top-[32%] size-[28%] rounded-full border-[5px] border-[color-mix(in_srgb,var(--uc-static-white)_86%,var(--hu-learn-art-soft))] opacity-90" />
          <span className="absolute right-[15%] top-[22%] h-[56%] w-[8%] rotate-45 rounded-full bg-[var(--uc-yellow-gold)]" />
        </>
      ) : null}
      {!imageSrc && visual === "safety" ? (
        <>
          <span className="absolute left-[28%] top-[14%] h-[66%] w-[44%] rounded-b-[28%] rounded-t-[18%] bg-[color-mix(in_srgb,var(--hu-learn-art-ink)_74%,var(--uc-static-white))]" />
          <span className="absolute left-[39%] top-[38%] h-[22%] w-[24%] rounded-[8px] border-[3px] border-[color-mix(in_srgb,var(--uc-static-white)_86%,var(--hu-learn-art-soft))] opacity-90" />
          <span className="absolute left-[47%] top-[56%] h-[14%] w-[7%] rounded-full bg-[color-mix(in_srgb,var(--uc-static-white)_86%,var(--hu-learn-art-soft))] opacity-90" />
        </>
      ) : null}
      {!imageSrc && visual === "request" ? (
        <>
          <span className="absolute left-[15%] top-[22%] h-[50%] w-[63%] rounded-[22%] bg-[var(--hu-learn-art-soft)]" />
          <span className="absolute bottom-[18%] left-[36%] h-[18%] w-[18%] rotate-45 rounded-[4px] bg-[var(--hu-learn-art-soft)]" />
          <span className="absolute right-[13%] top-[16%] size-[32%] rounded-full bg-[var(--uc-yellow-gold)] shadow-sm" />
          <span className="absolute right-[24%] top-[25%] h-[18%] w-[5%] rounded-full bg-[var(--uc-static-white)]" />
        </>
      ) : null}
      {!imageSrc && visual === "card" ? (
        <>
          <span className="absolute left-[14%] top-[25%] h-[56%] w-[70%] -rotate-[8deg] rounded-[14%] bg-[var(--hu-learn-art-soft)] shadow-sm" />
          <span className="absolute left-[24%] top-[38%] h-[9%] w-[27%] rounded-full bg-[var(--hu-theme-accent-strong)]" />
          <span className="absolute bottom-[25%] left-[24%] h-[8%] w-[43%] rounded-full bg-[color-mix(in_srgb,var(--uc-text)_22%,transparent)]" />
          <span className="absolute right-[19%] top-[47%] size-[18%] rounded-full bg-[var(--uc-red-main)]" />
          <span className="absolute right-[10%] top-[47%] size-[18%] rounded-full bg-[var(--uc-yellow-gold)] opacity-90" />
        </>
      ) : null}
    </div>
  );
}

function HuSavingFocusCard({
  onCreateGoal,
  onOpenGoals,
  showAmounts,
}: {
  onCreateGoal: () => void;
  onOpenGoals: () => void;
  showAmounts: boolean;
}) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <div className="flex items-start justify-between gap-[14px]">
        <div className="min-w-0">
          <p className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Saving account</p>
          <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            Festival pass and sneakers stay on track.
          </p>
        </div>
        <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name="piggy-bank" size={23} />
        </span>
      </div>
      <div className="mt-[18px] flex items-end justify-between gap-[12px]">
        <div>
          <p className="text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">Saved so far</p>
          <p className="mt-[6px] text-[25px] font-bold leading-[29px] tracking-[0] text-[var(--uc-text)]">
            {showAmounts ? "11.824" : HU_MASKED_INTEGER}
            <span className="text-[16px] font-normal leading-[20px]">
              {showAmounts ? ",33 HUF" : `${HU_MASKED_DECIMALS} HUF`}
            </span>
          </p>
        </div>
        <button
          className="flex h-[36px] items-center rounded-full bg-[var(--hu-theme-accent-strong)] px-[14px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-inverse)]"
          onClick={onCreateGoal}
          type="button"
        >
          Add goal
        </button>
      </div>
      <div className="mt-[16px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
        <div className="h-full w-[62%] rounded-full bg-[var(--hu-theme-accent-strong)]" />
      </div>
      <button
        className="mt-[14px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--hu-theme-accent-strong)]"
        onClick={onOpenGoals}
        type="button"
      >
        See saving goals
      </button>
    </section>
  );
}

function HuSpendingCard({ showAmounts }: { showAmounts: boolean }) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Spending this week</h2>
      <div className="mt-[20px] flex items-start justify-between gap-[12px]">
        <HuAmountColumn label="Spent" value={showAmounts ? "25.000" : HU_MASKED_INTEGER} suffix={showAmounts ? ",00 HUF" : `${HU_MASKED_DECIMALS} HUF`} />
        <HuAmountColumn align="right" label="Remaining" value={showAmounts ? "50.000" : HU_MASKED_INTEGER} suffix={showAmounts ? ",00 HUF" : `${HU_MASKED_DECIMALS} HUF`} />
      </div>
      <div className="mt-[22px] h-[14px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
        <div className="h-full w-[90%] rounded-full bg-[var(--hu-theme-accent-strong)]" />
      </div>
      <div className="mt-[18px] flex items-center justify-between gap-[12px] text-[13px] leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
        <p>
          Weekly limit: <span className="font-bold text-[var(--uc-text)]">{showAmounts ? "75.000,00 HUF" : formatHuMaskedMoney()}</span>
        </p>
        <p>
          Days left: <span className="font-bold text-[var(--uc-text)]">2</span>
        </p>
      </div>
    </section>
  );
}

function HuAmountColumn({
  align = "left",
  label,
  suffix,
  value,
}: {
  align?: "left" | "right";
  label: string;
  suffix: string;
  value: string;
}) {
  return (
    <div className={cn("min-w-0", align === "right" ? "text-right" : "text-left")}>
      <p className="text-[17px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{label}</p>
      <p className="mt-[14px] whitespace-nowrap text-[22px] font-bold leading-[25px] tracking-[0] text-[var(--uc-text)]">
        {value}
        <span className="text-[16px] font-normal leading-[20px]">{suffix}</span>
      </p>
    </div>
  );
}

function HuTransactionsCard({
  onTransactionClick,
  showAmounts,
}: {
  onTransactionClick?: (transaction: AccountTransaction) => void;
  showAmounts: boolean;
}) {
  const visibleTransactions = HU_KIDS_TRANSACTIONS.slice(0, 3);

  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] pb-[18px] pt-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Your recent transactions</h2>
      <div className="mt-[18px]">
        {visibleTransactions.map((transaction, index) => (
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
      <LinkButton className="mx-auto mt-[22px] text-[var(--hu-theme-accent-strong)]">
        SEE MORE TRANSACTIONS
      </LinkButton>
    </section>
  );

  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] pb-[18px] pt-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Your recent transactions</h2>
      <div className="mt-[18px]">
        <HuTransactionRow
          amount={showAmounts ? "+11.824,33 RON" : `+${formatHuMaskedMoney("RON")}`}
          icon="add-money"
          isPositive
          source="From Dad"
          subtitle="Salary November"
          time="Today 14:31"
        />
        <div className="my-[16px] h-px bg-[var(--uc-border)]" />
        <HuTransactionRow
          amount={showAmounts ? "-94,21 RON" : `-${formatHuMaskedMoney("RON")}`}
          icon="gift"
          merchantLogo="mcdonalds"
          source="McDonalds"
          time="Today 11:24"
        />
      </div>
      <LinkButton className="mx-auto mt-[22px] text-[var(--hu-theme-accent-strong)]">
        SEE MORE TRANSACTIONS
      </LinkButton>
    </section>
  );
}

function HuTransactionRow({
  amount,
  icon,
  isPositive = false,
  merchantLogo,
  source,
  subtitle,
  time,
}: {
  amount: string;
  icon: IconName;
  isPositive?: boolean;
  merchantLogo?: "mcdonalds";
  source: string;
  subtitle?: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-[12px]">
      {merchantLogo ? (
        <HuMerchantLogo merchant={merchantLogo} />
      ) : (
        <span
          className={cn(
            "grid size-[34px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]",
            isPositive ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-product-pink)]",
          )}
        >
          <AppIcon name={icon} size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-[8px]">
          <p className="truncate text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{source}</p>
          <p
            className={cn(
              "shrink-0 text-right text-[16px] font-bold leading-[20px] tracking-[0]",
              isPositive ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-text)]",
            )}
          >
            {amount}
          </p>
        </div>
        {subtitle ? (
          <p className="mt-[10px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            {subtitle}
          </p>
        ) : null}
        <p className={cn("text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]", subtitle ? "mt-[8px]" : "mt-[10px]")}>
          {time}
        </p>
      </div>
    </div>
  );
}

function HuMerchantLogo({ merchant }: { merchant: "mcdonalds" }) {
  if (merchant === "mcdonalds") {
    return (
      <span
        aria-label="McDonalds merchant logo"
        className="relative grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#DB0007] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        <span className="absolute bottom-[6px] left-[7px] h-[19px] w-[8px] rounded-t-full border-l-[3px] border-r-[3px] border-t-[3px] border-[#FFC72C]" />
        <span className="absolute bottom-[6px] right-[7px] h-[19px] w-[8px] rounded-t-full border-l-[3px] border-r-[3px] border-t-[3px] border-[#FFC72C]" />
        <span className="absolute bottom-[6px] h-[15px] w-[4px] rounded-t-full bg-[#FFC72C]" />
      </span>
    );
  }

  return null;
}

function HuKidsTransactionRow({
  compact = false,
  onClick,
  showAmounts,
  transaction,
}: {
  compact?: boolean;
  onClick?: (transaction: AccountTransaction) => void;
  showAmounts: boolean;
  transaction: HuKidsTransaction;
}) {
  const isPositive = transaction.amount > 0;
  const formattedAmount = showAmounts
    ? `${isPositive ? "+" : "-"}${formatMoneyNumber(Math.abs(transaction.amount), HU_KIDS_RUNTIME_COUNTRY)} HUF`
    : formatHuMaskedSignedMoney(isPositive);
  const amountMatch = formattedAmount.match(/^([+-]?\d[\d\s.]*)((?:,\d+)?)(.*)$/);
  const amountInteger = amountMatch?.[1] ?? formattedAmount;
  const amountDecimal = amountMatch ? `${amountMatch[2]}${amountMatch[3]}` : "";
  const rowContent = (
    <>
      {transaction.merchantLogo ? (
        <HuMerchantLogoMark merchant={transaction.merchantLogo} />
      ) : (
        <span
          className={cn(
            "grid size-[34px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]",
            isPositive ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-product-pink)]",
          )}
        >
          <AppIcon name={isPositive ? "add-money" : "gift"} size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-[8px]">
          <p className="truncate text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{transaction.label}</p>
          {isPositive ? (
            <p className="shrink-0 text-right tracking-[0] text-[var(--uc-green-olive)]">
              <span className="text-[18px] font-bold leading-[20px]">{amountInteger}</span>
              <span className="text-[14px] font-normal leading-[20px]">{amountDecimal}</span>
            </p>
          ) : (
            <p className="shrink-0 text-right text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">
              {formattedAmount}
            </p>
          )}
        </div>
        {transaction.subtitle ?? transaction.details ? (
          <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            {transaction.subtitle ?? transaction.details}
          </p>
        ) : null}
        <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
          {transaction.monthTitle} {transaction.day}:31
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        className={cn(
          "flex w-full items-start gap-[12px] rounded-[12px] text-left transition-colors active:bg-[color-mix(in_srgb,var(--uc-text)_6%,transparent)]",
          compact ? "py-0" : "px-[16px] py-[10px]",
        )}
        onClick={() => onClick(transaction)}
        type="button"
      >
        {rowContent}
      </button>
    );
  }

  return (
    <div className={cn("flex items-start gap-[12px]", compact ? undefined : "px-[16px] py-[10px]")}>
      {rowContent}
    </div>
  );
}

function HuMerchantLogoMark({ merchant }: { merchant: HuMerchantLogoId }) {
  if (merchant === "mcdonalds") {
    return (
      <span
        aria-label="McDonalds merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#DA291C] text-[#FFC72C] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_28%,transparent)]"
        role="img"
      >
        {/* Simple Icons: McDonald's — CC0 */}
        <svg aria-hidden="true" className="h-[20px] w-[20px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.243 3.006c2.066 0 3.742 8.714 3.742 19.478H24c0-11.588-3.042-20.968-6.766-20.968-2.127 0-4.007 2.81-5.248 7.227-1.241-4.416-3.121-7.227-5.231-7.227C3.031 1.516 0 10.888 0 22.476h3.014c0-10.763 1.658-19.47 3.724-19.47 2.066 0 3.741 8.05 3.741 17.98h2.997c0-9.93 1.684-17.98 3.75-17.98Z" />
        </svg>
      </span>
    );
  }

  if (merchant === "youtube") {
    return (
      <span
        aria-label="YouTube merchant logo"
        className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#FF0000] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_24%,transparent)]"
        role="img"
      >
        {/* Simple Icons: YouTube — CC0 */}
        <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </span>
    );
  }

  // Default: apple — Simple Icons: Apple — CC0
  return (
    <span
      aria-label="Apple merchant logo"
      className="grid size-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--uc-static-black)] text-[var(--uc-static-white)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]"
      role="img"
    >
      <svg aria-hidden="true" className="h-[20px] w-[20px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    </span>
  );
}

function HuCardsPanel({ onCardDetails }: { onCardDetails: (cardId: string) => void }) {
  const card = HU_KIDS_CARDS[0];

  if (!card) {
    return null;
  }

  return (
    <section className="h-[102px] rounded-[8px] bg-[var(--hu-theme-card-bg)] p-[16px] shadow-sm" data-hu-cards-panel>
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Your cards</h2>
      <button
        aria-label={`Open ${card.title} ending ${card.lastDigits}`}
        className="mt-[12px] flex h-[40px] w-full items-center gap-[8px] rounded-[4px] text-left transition-transform active:scale-[0.99]"
        onClick={() => onCardDetails(card.id)}
        type="button"
      >
        <Card
          ariaLabel={`${card.title} card ending ${card.lastDigits}`}
          className="shadow-[0_4px_8px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)]"
          size="figma"
        />
        <span className="flex min-w-0 flex-col gap-[4px]">
          <span className="truncate text-[14px] font-bold leading-[15px] tracking-[0] text-[var(--uc-text)]">
            {card.title}
          </span>
          <span className="text-[14px] font-normal leading-[15px] tracking-[0] text-[var(--uc-text)]">
            *{card.lastDigits}
          </span>
        </span>
      </button>
    </section>
  );
}

function HuTasksCard({ showAmounts = true }: { showAmounts?: boolean }) {
  return (
    <section className="flex w-full flex-col gap-[24px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px]">
      {/* Header */}
      <div className="flex flex-col gap-[4px]">
        <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Tasks</h2>
        <p className="text-[14px] leading-[20px] tracking-[0] text-[var(--uc-text)]">
          You have{" "}
          <span className="font-bold">{HU_KIDS_TASKS.length} tasks</span>{" "}
          to do
        </p>
      </div>

      {/* Task rows */}
      <div className="flex flex-col gap-[12px]">
        {HU_KIDS_TASKS.map((task, index) => (
          <div key={task.title}>
            <HuTaskRow task={task} showAmounts={showAmounts} />
            {index < HU_KIDS_TASKS.length - 1 && (
              <div className="mt-[12px] h-px w-full bg-[var(--uc-border-muted)]" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-center">
        <button
          type="button"
          className="flex items-center gap-[4px] whitespace-nowrap text-[14px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--hu-theme-accent-strong)]"
        >
          <AppIcon name="add-circle" size={16} />
          <span>ADD NEW TASK</span>
        </button>
      </div>
    </section>
  );
}

function HuTaskRow({
  task,
  showAmounts = true,
}: {
  task: (typeof HU_KIDS_TASKS)[number];
  showAmounts?: boolean;
}) {
  const formattedReward = formatHuFullAmount(task.reward);
  const [integerPart, decimalPart] = formattedReward.split(",");

  return (
    <div className="flex min-h-[48px] items-center gap-[8px]">
      {/* Left side: checkbox + text */}
      <div className="flex flex-1 items-center gap-[8px]">
        {/* Unchecked checkbox */}
        <span className="grid size-[32px] shrink-0 place-items-center">
          <span className="size-[24px] rounded-[4px] border border-[var(--uc-border)] bg-[var(--hu-theme-card-bg)]" />
        </span>
        <div className="flex min-w-0 flex-col gap-[4px]">
          <p className="min-h-[24px] text-[16px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
            {task.title}
          </p>
          <p className="text-[14px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
            {task.recurrence}
          </p>
        </div>
      </div>

      {/* Right side: amount */}
      <div className="flex shrink-0 items-baseline gap-[-1px] text-[var(--uc-text)]">
        {showAmounts ? (
          <>
            <span className="text-[18px] font-bold leading-[22px] tracking-[0]">{integerPart}</span>
            <span className="text-[14px] font-normal leading-[18px] tracking-[0]">,{decimalPart} HUF</span>
          </>
        ) : (
          <>
            <span className="text-[18px] font-bold leading-[22px] tracking-[0]">{HU_MASKED_INTEGER}</span>
            <span className="text-[14px] font-normal leading-[18px] tracking-[0]">{HU_MASKED_DECIMALS} HUF</span>
          </>
        )}
      </div>
    </div>
  );
}

function HuAllMoneyCard({ showAmounts }: { showAmounts: boolean }) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">All your money</h2>
      <p className="mt-[4px] text-[29px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">
        {showAmounts ? "35.628" : HU_MASKED_INTEGER}
        <span className="text-[20px] font-normal leading-[24px]">
          {showAmounts ? ",00 HUF" : `${HU_MASKED_DECIMALS} HUF`}
        </span>
      </p>
      <div className="mt-[24px] space-y-[22px]">
        <HuMoneyBucket colorClass="bg-[var(--uc-product-blue)]" icon="mcash" label="Accounts" showAmounts={showAmounts} />
        <HuMoneyBucket colorClass="bg-[var(--uc-green-bright)]" icon="piggy-bank" label="Saving account" showAmounts={showAmounts} />
        <HuMoneyBucket colorClass="bg-[var(--uc-product-pink)]" icon="gift" label="Goals" showAmounts={showAmounts} />
      </div>
    </section>
  );
}

function HuMoneyBucket({
  colorClass,
  icon,
  label,
  showAmounts,
}: {
  colorClass: string;
  icon: IconName;
  label: string;
  showAmounts: boolean;
}) {
  return (
    <div className="flex items-center gap-[18px]">
      <span className={cn("grid size-[34px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]", colorClass)}>
        <AppIcon name={icon} size={18} />
      </span>
      <p className="min-w-0 flex-1 text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">{label}</p>
      <p className="shrink-0 text-right text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
        {showAmounts ? "11.824,33 HUF" : formatHuMaskedMoney()}
      </p>
    </div>
  );
}

function HuLightBottomNav({
  activeNav,
  onChange,
}: {
  activeNav: HuLightNavId;
  onChange: (tab: HuLightNavId) => void;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--hu-theme-nav-bg)] shadow-[0_-10px_28px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)] backdrop-blur-md"
      style={
        {
          "--uc-action": "var(--hu-theme-accent-strong)",
          "--uc-bottom-bar-bg": "var(--hu-theme-nav-bg)",
        } as CSSProperties
      }
    >
      <BottomNavigation
        activeTab={activeNav}
        iconOverrides={{ analytics: "hu-kids-learn", products: "hu-kids-saving" }}
        labelOverrides={{ analytics: "Earning", products: "Saving" }}
        onTabChange={onChange}
      />
    </div>
  );
}

function KidsMarketHeader({
  activeTab,
  concept,
  isBalanceVisible,
  onToggleBalance,
}: {
  activeTab: KidsBottomNavId;
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  onToggleBalance: () => void;
}) {
  if (concept.style === "sk-bulbank-kids") {
    const pageTitle =
      activeTab === "education"
        ? "Education"
        : activeTab === "tasks"
          ? "Tasks"
          : activeTab === "more"
            ? "More"
            : concept.heroTitle;

    return (
      <header className="flex items-center justify-between px-[16px] pb-[14px]">
        <div className="min-w-0">
          <p className="uc-type-p2 truncate text-[var(--uc-text-muted)]">{concept.conceptLabel}</p>
          <h1 className="text-[28px] font-bold italic leading-[32px] tracking-[0] text-[var(--uc-text)]">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-[8px]">
          <button
            aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
            className="grid size-[36px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
            onClick={onToggleBalance}
            type="button"
          >
            <AppIcon name={isBalanceVisible ? "eye" : "eye-off"} size={20} />
          </button>
          <button
            aria-label="Messages"
            className="relative grid size-[36px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
            type="button"
          >
            <AppIcon name="header-messages" size={20} />
            <span className="absolute right-[6px] top-[7px] size-[7px] rounded-full bg-[var(--uc-red-main)]" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-[16px] pb-[14px]">
      <div className="flex min-w-0 items-center gap-[10px]">
        <ProfileAvatar initials={concept.avatar} size={40} />
        <div className="min-w-0">
          <p className="uc-type-p2 truncate text-[var(--uc-text-muted)]">{concept.conceptLabel}</p>
          <h1 className="uc-type-h3 truncate text-[var(--uc-text)]">{concept.greeting}</h1>
        </div>
      </div>

      <div className="flex items-center gap-[8px]">
        <button
          aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
          className="grid size-[36px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
          onClick={onToggleBalance}
          type="button"
        >
          <AppIcon name={isBalanceVisible ? "eye" : "eye-off"} size={20} />
        </button>
        <button
          aria-label="Parent safety"
          className="grid size-[36px] place-items-center rounded-full bg-[var(--uc-surface)] text-[var(--uc-action)] shadow-sm"
          type="button"
        >
          <AppIcon name="shield-check" size={20} />
        </button>
      </div>
    </header>
  );
}

function ConceptHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
  if (concept.style === "ba-family-hub") {
    return (
      <BaFamilyHubHero
        concept={concept}
        isBalanceVisible={isBalanceVisible}
        primaryPocketProgress={primaryPocketProgress}
      />
    );
  }

  if (concept.style === "ba-bl-card-first") {
    return (
      <BaBlCardFirstHero
        concept={concept}
        isBalanceVisible={isBalanceVisible}
        primaryPocketProgress={primaryPocketProgress}
      />
    );
  }

  if (concept.style === "si-goal-coach") {
    return (
      <SiGoalCoachHero
        concept={concept}
        isBalanceVisible={isBalanceVisible}
        primaryPocketProgress={primaryPocketProgress}
      />
    );
  }

  if (concept.style === "hu-smart-fintech") {
    return (
      <HuSmartHero
        concept={concept}
        isBalanceVisible={isBalanceVisible}
        primaryPocketProgress={primaryPocketProgress}
      />
    );
  }

  if (concept.style === "sk-bulbank-kids") {
    return <SkBulbankProductsHero concept={concept} isBalanceVisible={isBalanceVisible} />;
  }

  if (concept.style === "sk-guided-flow") {
    return (
      <SkGuidedHero
        concept={concept}
        isBalanceVisible={isBalanceVisible}
        primaryPocketProgress={primaryPocketProgress}
      />
    );
  }

  return (
    <CzPocketHero
      concept={concept}
      isBalanceVisible={isBalanceVisible}
      primaryPocketProgress={primaryPocketProgress}
    />
  );
}

function CzPocketHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-sm">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{concept.heroSubtitle}</p>
          <h2 className="mt-[4px] text-[30px] font-bold leading-[34px] tracking-[0] text-[var(--uc-text)]">
            {isBalanceVisible ? formatKidsMoney(concept.balance, concept.country) : "****"}
          </h2>
          <p className="uc-type-p2 mt-[4px] text-[var(--uc-text-muted)]">{concept.heroTitle}</p>
        </div>
        <div className="shrink-0 rounded-[8px] bg-[var(--uc-red-main)] px-[10px] py-[8px] text-[var(--uc-static-white)]">
          <p className="text-[11px] font-bold leading-[13px] tracking-[0]">safe today</p>
          <p className="text-[18px] font-bold leading-[22px] tracking-[0]">
            {formatKidsMoney(concept.safeToday, concept.country)}
          </p>
        </div>
      </div>

      <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
        {concept.metrics.map((metric) => (
          <div key={metric.label} className="min-h-[82px] rounded-[8px] bg-[var(--uc-neutral-100)] p-[10px]">
            <p className="text-[11px] font-bold leading-[13px] tracking-[0] text-[var(--uc-text-muted)]">
              {metric.label}
            </p>
            <p className="mt-[6px] text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
              {metric.value}
            </p>
            <p className="uc-type-p2 mt-[2px] text-[var(--uc-text-muted)]">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-[16px]">
        <div className="flex items-center justify-between">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">Pocket progress</p>
          <span className="uc-type-p2 text-[var(--uc-text-muted)]">{primaryPocketProgress}%</span>
        </div>
        <div className="mt-[8px] h-[8px] overflow-hidden rounded-full bg-[var(--uc-neutral-200)]">
          <div
            className="h-full rounded-full bg-[var(--uc-action)]"
            style={{ width: `${primaryPocketProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function SkGuidedHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
  return (
    <section className="rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-sm">
      <div className="flex items-start gap-[14px]">
        <div
          className="grid size-[104px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--uc-action) ${Math.max(12, primaryPocketProgress)}%, var(--uc-neutral-200) 0)`,
          }}
        >
          <div className="grid size-[74px] place-items-center rounded-full bg-[var(--uc-surface)]">
            <div className="text-center">
              <p className="text-[22px] font-bold leading-[24px] tracking-[0] text-[var(--uc-text)]">
                {isBalanceVisible ? formatKidsMoney(concept.safeToday, concept.country) : "**"}
              </p>
              <p className="text-[11px] font-bold leading-[13px] tracking-[0] text-[var(--uc-text-muted)]">
                safe
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{concept.conceptLabel}</p>
          <h2 className="mt-[4px] text-[24px] font-bold leading-[28px] tracking-[0] text-[var(--uc-text)]">
            {concept.heroTitle}
          </h2>
          <p className="uc-type-p2 mt-[6px] text-[var(--uc-text-muted)]">{concept.heroSubtitle}</p>
          <div className="mt-[10px] inline-flex items-center gap-[6px] rounded-full bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))] px-[10px] py-[5px] text-[var(--uc-action)]">
            <AppIcon name="calendar-days" size={16} />
            <span className="text-[12px] font-bold leading-[14px] tracking-[0]">{concept.allowanceNext}</span>
          </div>
        </div>
      </div>

      <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
        {concept.metrics.map((metric) => (
          <div key={metric.label} className="rounded-[8px] border border-[var(--uc-border)] p-[10px]">
            <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">
              {metric.value}
            </p>
            <p className="uc-type-p2 mt-[3px] text-[var(--uc-text-muted)]">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HuSmartHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] bg-[var(--uc-primary-k1)] text-[var(--uc-static-white)] shadow-sm">
      <div
        className="p-[16px]"
        style={{
          background: "linear-gradient(145deg, var(--uc-primary-k1), var(--uc-neutral-700))",
        }}
      >
        <div className="flex items-start justify-between gap-[12px]">
          <div className="min-w-0">
            <p className="text-[12px] font-bold leading-[14px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_68%,transparent)]">
              {concept.heroSubtitle}
            </p>
            <h2 className="mt-[6px] text-[34px] font-bold leading-[38px] tracking-[0]">
              {isBalanceVisible ? formatKidsMoney(concept.balance, concept.country) : "****"}
            </h2>
            <p className="mt-[4px] text-[15px] font-bold leading-[18px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_80%,transparent)]">
              {concept.heroTitle}
            </p>
          </div>
          <Card
            ariaLabel="Kids card"
            className="border border-[color-mix(in_srgb,var(--uc-static-white)_20%,transparent)]"
            size="medium"
            style={{ filter: "saturate(0.9) brightness(1.1)" }}
          />
        </div>

        <div className="mt-[18px] grid grid-cols-3 gap-[8px]">
          {concept.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-[8px] bg-[color-mix(in_srgb,var(--uc-static-white)_12%,transparent)] p-[10px]"
            >
              <p className="text-[18px] font-bold leading-[22px] tracking-[0]">{metric.value}</p>
              <p className="mt-[3px] text-[11px] font-bold leading-[13px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_70%,transparent)]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-[16px] flex items-center justify-between rounded-[8px] bg-[color-mix(in_srgb,var(--uc-static-white)_10%,transparent)] px-[12px] py-[10px]">
          <div>
            <p className="text-[12px] font-bold leading-[14px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_72%,transparent)]">
              spendable today
            </p>
            <p className="text-[20px] font-bold leading-[24px] tracking-[0]">
              {formatKidsMoney(concept.safeToday, concept.country)}
            </p>
          </div>
          <div className="w-[116px]">
            <div className="h-[7px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]">
              <div className="h-full rounded-full bg-[var(--uc-yellow-gold)]" style={{ width: `${primaryPocketProgress}%` }} />
            </div>
            <p className="mt-[5px] text-right text-[11px] font-bold leading-[13px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_76%,transparent)]">
              pocket {primaryPocketProgress}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BaFamilyHubHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-sm">
      <div className="bg-[var(--uc-red-main)] px-[16px] py-[14px] text-[var(--uc-static-white)]">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="min-w-0">
            <p className="text-[12px] font-bold leading-[14px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_78%,transparent)]">
              {concept.heroSubtitle}
            </p>
            <h2 className="mt-[5px] text-[25px] font-bold leading-[29px] tracking-[0]">{concept.heroTitle}</h2>
          </div>
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]">
            <AppIcon name="users" color="var(--uc-static-white)" size={22} />
          </span>
        </div>
      </div>

      <div className="space-y-[12px] p-[14px]">
        <div className="grid grid-cols-[1fr_118px] gap-[10px]">
          <div className="rounded-[8px] bg-[var(--uc-neutral-100)] p-[12px]">
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">Money you can use</p>
            <p className="mt-[4px] text-[28px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">
              {isBalanceVisible ? formatKidsMoney(concept.balance, concept.country) : "****"}
            </p>
            <p className="uc-type-p2 mt-[4px] text-[var(--uc-text-muted)]">{concept.allowanceLabel}</p>
          </div>
          <div className="rounded-[8px] bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] p-[12px] text-[var(--uc-action)]">
            <p className="text-[11px] font-bold leading-[13px] tracking-[0]">safe today</p>
            <p className="mt-[6px] text-[22px] font-bold leading-[26px] tracking-[0]">
              {formatKidsMoney(concept.safeToday, concept.country)}
            </p>
            <p className="uc-type-p2 mt-[4px] text-[var(--uc-text-muted)]">{concept.allowanceNext}</p>
          </div>
        </div>

        <div className="rounded-[8px] border border-[var(--uc-border)] p-[12px]">
          <div className="flex items-center gap-[10px]">
            <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-red-main)_10%,var(--uc-surface))] text-[var(--uc-red-main)]">
              <AppIcon name="shield-check" size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">Family approval lane</p>
              <p className="uc-type-p2 mt-[2px] text-[var(--uc-text-muted)]">{concept.approvalCopy}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[8px]">
          {concept.metrics.map((metric) => (
            <div key={metric.label} className="rounded-[8px] bg-[var(--uc-neutral-100)] p-[10px]">
              <p className="text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">{metric.value}</p>
              <p className="uc-type-p2 mt-[4px] text-[var(--uc-text-muted)]">{metric.label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="uc-type-n5-strong text-[var(--uc-text)]">{concept.pockets[0]?.title}</p>
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{primaryPocketProgress}%</p>
          </div>
          <div className="mt-[7px] h-[8px] overflow-hidden rounded-full bg-[var(--uc-neutral-200)]">
            <div className="h-full rounded-full bg-[var(--uc-red-main)]" style={{ width: `${primaryPocketProgress}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function BaBlCardFirstHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-sm">
      <div className="flex items-start justify-between gap-[14px]">
        <div className="min-w-0 flex-1">
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{concept.heroSubtitle}</p>
          <h2 className="mt-[5px] text-[25px] font-bold leading-[29px] tracking-[0] text-[var(--uc-text)]">{concept.heroTitle}</h2>
          <p className="mt-[8px] text-[30px] font-bold leading-[34px] tracking-[0] text-[var(--uc-text)]">
            {isBalanceVisible ? formatKidsMoney(concept.balance, concept.country) : "****"}
          </p>
        </div>
        <div className="shrink-0 rounded-[8px] bg-[var(--uc-neutral-100)] p-[8px]">
          <Card ariaLabel="Kids payment card" size="medium" />
        </div>
      </div>

      <div className="mt-[14px] grid grid-cols-[1fr_1fr] gap-[8px]">
        <div className="rounded-[8px] bg-[var(--uc-primary-k1)] p-[12px] text-[var(--uc-static-white)]">
          <p className="text-[11px] font-bold leading-[13px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_74%,transparent)]">
            card status
          </p>
          <p className="mt-[5px] text-[16px] font-bold leading-[19px] tracking-[0]">{concept.cardStatus}</p>
        </div>
        <div className="rounded-[8px] bg-[color-mix(in_srgb,var(--uc-red-main)_10%,var(--uc-surface))] p-[12px] text-[var(--uc-red-main)]">
          <p className="text-[11px] font-bold leading-[13px] tracking-[0]">safe today</p>
          <p className="mt-[5px] text-[22px] font-bold leading-[26px] tracking-[0]">
            {formatKidsMoney(concept.safeToday, concept.country)}
          </p>
        </div>
      </div>

      <div className="mt-[14px] rounded-[8px] border border-[var(--uc-border)] p-[12px]">
        <div className="flex items-center justify-between gap-[10px]">
          <div className="min-w-0">
            <p className="text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">Next approval</p>
            <p className="uc-type-p2 mt-[2px] text-[var(--uc-text-muted)]">{concept.approvalCopy}</p>
          </div>
          <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--uc-neutral-100)] text-[var(--uc-action)]">
            <AppIcon name="send" size={18} />
          </span>
        </div>
      </div>

      <div className="mt-[14px] grid grid-cols-3 gap-[8px]">
        {concept.metrics.map((metric) => (
          <div key={metric.label} className="rounded-[8px] bg-[var(--uc-neutral-100)] p-[10px]">
            <p className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">{metric.value}</p>
            <p className="uc-type-p2 mt-[3px] text-[var(--uc-text-muted)]">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-[14px] h-[7px] overflow-hidden rounded-full bg-[var(--uc-neutral-200)]">
        <div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${primaryPocketProgress}%` }} />
      </div>
    </section>
  );
}

function SiGoalCoachHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
  return (
    <section className="rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-sm">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">{concept.heroSubtitle}</p>
          <h2 className="mt-[4px] text-[26px] font-bold leading-[30px] tracking-[0] text-[var(--uc-text)]">{concept.heroTitle}</h2>
        </div>
        <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] px-[9px] py-[6px] text-[var(--uc-action)]">
          <AppIcon name="calendar-days" size={16} />
          <span className="text-[12px] font-bold leading-[14px] tracking-[0]">week</span>
        </span>
      </div>

      <div className="mt-[14px] rounded-[8px] bg-[var(--uc-neutral-100)] p-[14px]">
        <div className="flex items-end justify-between gap-[12px]">
          <div>
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">Money runway</p>
            <p className="mt-[4px] text-[31px] font-bold leading-[35px] tracking-[0] text-[var(--uc-text)]">
              {isBalanceVisible ? formatKidsMoney(concept.balance, concept.country) : "****"}
            </p>
          </div>
          <div className="text-right">
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">safe today</p>
            <p className="text-[20px] font-bold leading-[24px] tracking-[0] text-[var(--uc-action)]">
              {formatKidsMoney(concept.safeToday, concept.country)}
            </p>
          </div>
        </div>
        <div className="mt-[12px] h-[8px] overflow-hidden rounded-full bg-[var(--uc-neutral-200)]">
          <div className="h-full rounded-full bg-[var(--uc-action)]" style={{ width: `${primaryPocketProgress}%` }} />
        </div>
      </div>

      <div className="mt-[12px] grid grid-cols-3 gap-[8px]">
        {concept.metrics.map((metric) => (
          <div key={metric.label} className="rounded-[8px] border border-[var(--uc-border)] p-[10px]">
            <p className="text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">{metric.value}</p>
            <p className="uc-type-p2 mt-[4px] text-[var(--uc-text-muted)]">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-[12px] flex items-center gap-[10px] rounded-[8px] bg-[color-mix(in_srgb,var(--uc-green-status)_10%,var(--uc-surface))] p-[12px]">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-green-status)_18%,var(--uc-surface))] text-[var(--uc-green-status)]">
          <AppIcon name="book-open" size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">Coach suggestion</p>
          <p className="uc-type-p2 mt-[2px] text-[var(--uc-text-muted)]">{concept.coach[0]?.body}</p>
        </div>
      </div>
    </section>
  );
}

function SkBulbankProductsHero({
  concept,
  isBalanceVisible,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
}) {
  return (
    <section className="space-y-[10px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-bold leading-[28px] tracking-[0] text-[var(--uc-text)]">Accounts</h2>
        <button
          aria-label="Expand accounts"
          className="grid size-[28px] place-items-center rounded-full text-[var(--uc-text)]"
          type="button"
        >
          <AppIcon name="chevron-down" size={18} />
        </button>
      </div>

      <article className="rounded-[8px] bg-[color-mix(in_srgb,var(--uc-orange-main)_8%,var(--uc-surface))] p-[12px] shadow-sm">
        <div className="flex items-center gap-[10px]">
          <span className="grid h-[24px] w-[34px] shrink-0 place-items-center rounded-[4px] bg-[var(--uc-product-blue)] text-[10px] font-bold leading-[12px] tracking-[0] text-[var(--uc-static-white)]">
            EU
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">{concept.allowanceLabel}</p>
            <p className="truncate text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              SK31UNCR7000123456789
            </p>
          </div>
        </div>
        <p className="mt-[8px] text-right text-[25px] font-bold leading-[29px] tracking-[0] text-[var(--uc-text)]">
          {isBalanceVisible ? formatMoney(concept.balance, concept.country, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "****"}
        </p>
        <div className="mt-[8px] h-[7px] rounded-full bg-[color-mix(in_srgb,var(--uc-orange-main)_22%,var(--uc-surface))]" />
      </article>
    </section>
  );
}

function SkBulbankContent({
  activeTab,
  concept,
}: {
  activeTab: KidsBottomNavId;
  concept: KidsMarketHomeConcept;
}) {
  if (activeTab === "education") {
    return <SkEducationPanel />;
  }

  if (activeTab === "tasks") {
    return <SkTasksPanel concept={concept} />;
  }

  if (activeTab === "more") {
    return <SkMorePanel />;
  }

  return (
    <>
      <SkBulbankShortcuts concept={concept} />
      <SkBulbankCardSection concept={concept} />
      <SkBulbankOffer concept={concept} />
      <SkEducationPreview />
      <SkTasksPreview concept={concept} />
    </>
  );
}

function SkBulbankShortcuts({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section>
      <h2 className="text-[24px] font-bold leading-[28px] tracking-[0] text-[var(--uc-text)]">Shortcuts</h2>
      <div className="mt-[14px] flex justify-center gap-[42px]">
        {concept.actions.map((action) => (
          <button key={action.label} className="flex w-[92px] flex-col items-center gap-[8px]" type="button">
            <span className="grid size-[56px] place-items-center rounded-full bg-[var(--uc-orange-main)] text-[var(--uc-static-white)] shadow-sm">
              <AppIcon name={resolveIconName(action.icon)} size={28} />
            </span>
            <span className="text-center text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text)]">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function SkBulbankCardSection({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section className="space-y-[10px]">
      <h2 className="text-[24px] font-bold leading-[28px] tracking-[0] text-[var(--uc-text)]">Cards</h2>
      <article className="rounded-[8px] bg-[var(--uc-surface)] p-[12px] shadow-sm">
        <div className="flex items-center gap-[12px]">
          <Card ariaLabel="Kids debit card" size="figma" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">{concept.cardStatus}</p>
            <p className="text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">**** **** **** 4007</p>
          </div>
        </div>
        <p className="mt-[8px] text-right text-[23px] font-bold leading-[27px] tracking-[0] text-[var(--uc-text)]">
          {formatMoney(1000, concept.country, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </article>
    </section>
  );
}

function SkBulbankOffer({ concept }: { concept: KidsMarketHomeConcept }) {
  const progress = getPocketProgress(concept.pockets[0]);

  return (
    <section className="overflow-hidden rounded-[8px] bg-[var(--uc-orange-main)] text-[var(--uc-static-white)] shadow-sm">
      <div className="flex min-h-[96px] items-center justify-between gap-[12px] p-[14px]">
        <div className="min-w-0">
          <p className="text-[24px] font-bold leading-[27px] tracking-[0]">Get a savings</p>
          <p className="mt-[4px] text-[13px] font-bold leading-[16px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_82%,transparent)]">
            {concept.pockets[0]?.helper}
          </p>
        </div>
        <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]">
          <AppIcon name="piggy-bank" color="var(--uc-static-white)" size={28} />
        </span>
      </div>
      <div className="h-[7px] bg-[color-mix(in_srgb,var(--uc-static-white)_28%,transparent)]">
        <div className="h-full bg-[var(--uc-yellow-gold)]" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

function SkEducationPreview() {
  return (
    <section>
      <SectionHeadingDivider title="Education" />
      <div className="mt-[10px] rounded-[8px] bg-[var(--uc-surface)] p-[14px] shadow-sm">
        <div className="flex overflow-hidden rounded-[4px] border border-[var(--uc-orange-main)]">
          <div className="flex-1 bg-[var(--uc-orange-main)] py-[8px] text-center text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-static-white)]">
            In progress
          </div>
          <div className="flex-1 py-[8px] text-center text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
            Explore
          </div>
        </div>
        <div className="mt-[16px] text-center">
          <p className="text-[32px] font-bold italic leading-[36px] tracking-[0] text-[var(--uc-text)]">4/12</p>
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">Financial education</p>
        </div>
        <div className="mt-[12px] flex items-center gap-[8px]">
          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--uc-orange-main)_10%,var(--uc-surface))]">
            <div className="h-full w-[34%] rounded-full bg-[var(--uc-orange-main)]" />
          </div>
          <span className="grid size-[24px] place-items-center rounded-full bg-[var(--uc-green-status)] text-[var(--uc-static-white)]">
            <AppIcon name="check" size={14} />
          </span>
        </div>
        <p className="uc-type-p2 mt-[12px] text-center text-[var(--uc-text-muted)]">
          Keep up with the good work Maria. You have learned 4 of 12 money lessons.
        </p>
      </div>
    </section>
  );
}

function SkEducationPanel() {
  return (
    <section className="space-y-[14px]">
      <SkEducationPreview />
      <div>
        <SectionHeadingDivider title="Next lesson" />
        <div className="mt-[10px] grid grid-cols-2 gap-[8px]">
          {SK_LESSONS.map((lesson) => (
            <article key={lesson.title} className="min-h-[112px] rounded-[8px] bg-[var(--uc-surface)] p-[12px] shadow-sm">
              <p className="text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">{lesson.title}</p>
              <div className="mt-[16px] flex justify-end">
                <SkToneIcon icon={lesson.icon} tone={lesson.tone} size={48} iconSize={24} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkTasksPreview({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section>
      <SectionHeadingDivider title="Tasks" />
      <div className="mt-[10px] space-y-[8px]">
        {SK_TASKS.slice(0, 2).map((task) => (
          <SkTaskRow key={task.title} task={task} country={concept.country} />
        ))}
      </div>
    </section>
  );
}

function SkTasksPanel({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section className="space-y-[14px]">
      <div className="flex overflow-hidden rounded-[4px] border border-[var(--uc-orange-main)]">
        <div className="flex-1 bg-[var(--uc-orange-main)] py-[9px] text-center text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-static-white)]">
          To do
        </div>
        <div className="flex-1 py-[9px] text-center text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
          Completed
        </div>
      </div>
      <div className="space-y-[10px]">
        {SK_TASKS.map((task) => (
          <SkTaskRow key={task.title} task={task} country={concept.country} />
        ))}
      </div>
    </section>
  );
}

function SkTaskRow({
  task,
  country,
}: {
  task: (typeof SK_TASKS)[number];
  country: KidsHomeCountry;
}) {
  return (
    <article className="flex min-h-[82px] items-center gap-[12px] rounded-[8px] bg-[var(--uc-surface)] p-[12px] shadow-sm">
      <SkToneIcon icon={task.icon} tone={task.tone} size={36} iconSize={18} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold uppercase leading-[17px] tracking-[0] text-[var(--uc-text)]">{task.title}</p>
        <p
          className={cn(
            "mt-[2px] text-[11px] font-bold uppercase leading-[13px] tracking-[0]",
            task.status.toLowerCase().includes("rejected") ? "text-[var(--uc-red-main)]" : "text-[var(--uc-text-muted)]",
          )}
        >
          {task.status}
        </p>
      </div>
      <p className="shrink-0 text-[20px] font-bold italic leading-[24px] tracking-[0] text-[var(--uc-text)]">
        {formatKidsMoney(task.reward, country)}
      </p>
    </article>
  );
}

function SkMorePanel() {
  return (
    <section>
      <div className="grid grid-cols-2 gap-[8px]">
        {SK_MORE_ITEMS.map((item) => (
          <article key={item.title} className="min-h-[108px] rounded-[8px] bg-[var(--uc-surface)] p-[12px] shadow-sm">
            <p className="text-[14px] font-bold leading-[17px] tracking-[0] text-[var(--uc-text)]">{item.title}</p>
            <div className="mt-[18px] flex justify-end">
              <SkToneIcon icon={item.icon} tone={item.tone} size={44} iconSize={22} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SkToneIcon({
  icon,
  tone,
  size,
  iconSize,
}: {
  icon: string;
  tone: KidsHomeAction["tone"];
  size: number;
  iconSize: number;
}) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full", toneClasses.iconBg, toneClasses.text)}
      style={{ width: size, height: size }}
    >
      <AppIcon name={resolveIconName(icon)} size={iconSize} />
    </span>
  );
}

function ActiveNavPreview({
  activeTab,
  concept,
  panelTitle,
}: {
  activeTab: KidsBottomNavId;
  concept: KidsMarketHomeConcept;
  panelTitle: string;
}) {
  const body =
    activeTab === "activity" || activeTab === "insights"
      ? concept.feed.map((item) => `${item.title} ${formatSignedKidsMoney(item.amount, concept.country)}`).join(" - ")
      : activeTab === "goals" || activeTab === "pockets" || activeTab === "plan"
        ? concept.pockets.map((pocket) => `${pocket.title} ${getPocketProgress(pocket)}%`).join(" - ")
        : activeTab === "requests" || activeTab === "family"
          ? `${concept.parentName} approval view. ${concept.approvalCopy}`
        : activeTab === "card"
          ? `${concept.cardStatus}. ${concept.approvalCopy}`
          : concept.coach[0]?.body ?? concept.approvalCopy;

  return (
    <section className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[14px]">
      <div className="flex items-center justify-between gap-[12px]">
        <div className="min-w-0">
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">Bottom nav preview</p>
          <h2 className="uc-type-h4 mt-[2px] truncate text-[var(--uc-text)]">{panelTitle}</h2>
        </div>
        <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--uc-neutral-100)] text-[var(--uc-action)]">
          <AppIcon name="arrow-right" size={18} />
        </span>
      </div>
      <p className="uc-type-p2 mt-[10px] text-[var(--uc-text-muted)]">{body}</p>
    </section>
  );
}

function ActionGrid({ actions }: { actions: KidsHomeAction[] }) {
  return (
    <section>
      <SectionHeadingDivider title="Quick moves" />
      <div className="mt-[10px] grid grid-cols-2 gap-[8px]">
        {actions.map((action) => {
          const tone = TONE_CLASSES[action.tone];

          return (
            <button
              key={action.label}
              className={cn("min-h-[88px] rounded-[8px] p-[12px] text-left", tone.bg)}
              type="button"
            >
              <span className={cn("grid size-[32px] place-items-center rounded-full", tone.iconBg, tone.text)}>
                <AppIcon name={resolveIconName(action.icon)} size={18} />
              </span>
              <span className="mt-[10px] block text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">
                {action.label}
              </span>
              <span className="uc-type-p2 mt-[2px] block text-[var(--uc-text-muted)]">{action.detail}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PocketSection({ concept }: { concept: KidsMarketHomeConcept }) {
  const title =
    concept.style === "hu-smart-fintech"
      ? "Smart pockets"
      : concept.style === "si-goal-coach"
        ? "Goal plan"
        : concept.style === "ba-family-hub"
          ? "Family goals"
          : "Saving goals";

  return (
    <section>
      <SectionHeadingDivider title={title} count={concept.pockets.length} countAlign="end" />
      <div className="mt-[10px] flex gap-[8px] overflow-x-auto pb-[2px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {concept.pockets.map((pocket) => (
          <PocketCard key={pocket.title} country={concept.country} pocket={pocket} style={concept.style} />
        ))}
      </div>
    </section>
  );
}

function PocketCard({
  country,
  pocket,
  style,
}: {
  country: KidsHomeCountry;
  pocket: KidsHomePocket;
  style: KidsHomeStyle;
}) {
  const progress = getPocketProgress(pocket);
  const smart = style === "hu-smart-fintech";

  return (
    <article className="w-[178px] shrink-0 rounded-[8px] bg-[var(--uc-surface)] p-[12px] shadow-sm">
      <div className="flex items-center justify-between gap-[10px]">
        <span
          className={cn(
            "grid size-[40px] place-items-center rounded-[8px] text-[12px] font-bold leading-[14px] tracking-[0]",
            smart
              ? "bg-[var(--uc-primary-k1)] text-[var(--uc-static-white)]"
              : "bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))] text-[var(--uc-action)]",
          )}
        >
          {pocket.emojiLabel}
        </span>
        <span className="uc-type-p2 text-[var(--uc-text-muted)]">{progress}%</span>
      </div>
      <h3 className="mt-[12px] text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">
        {pocket.title}
      </h3>
      <p className="uc-type-p2 mt-[4px] text-[var(--uc-text-muted)]">
        {formatKidsMoney(pocket.savedAmount, country)} / {formatKidsMoney(pocket.targetAmount, country)}
      </p>
      <div className="mt-[10px] h-[7px] overflow-hidden rounded-full bg-[var(--uc-neutral-200)]">
        <div
          className={cn("h-full rounded-full", smart ? "bg-[var(--uc-yellow-gold)]" : "bg-[var(--uc-action)]")}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="uc-type-p2 mt-[8px] text-[var(--uc-text-muted)]">{pocket.helper}</p>
    </article>
  );
}

function CoachSection({ concept }: { concept: KidsMarketHomeConcept }) {
  const title =
    concept.style === "cz-pocket-plan"
      ? "Trust notes"
      : concept.style === "ba-family-hub"
        ? "Family clarity"
        : concept.style === "ba-bl-card-first"
          ? "Card coach"
          : "Smart coach";

  return (
    <section>
      <SectionHeadingDivider title={title} />
      <div className="mt-[10px] space-y-[8px]">
        {concept.coach.map((item) => (
          <article
            key={item.title}
            className="flex items-start justify-between gap-[12px] rounded-[8px] bg-[var(--uc-surface)] p-[12px] shadow-sm"
          >
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">{item.title}</h3>
              <p className="uc-type-p2 mt-[4px] text-[var(--uc-text-muted)]">{item.body}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--uc-neutral-100)] px-[9px] py-[5px] text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--uc-action)]">
              {item.value}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActivitySection({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section>
      <SectionHeadingDivider title="Recent activity" />
      <div className="mt-[10px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-sm">
        {concept.feed.map((item, index) => (
          <ActivityRow
            key={`${item.title}-${item.time}`}
            country={concept.country}
            item={item}
            showBorder={index < concept.feed.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function ActivityRow({
  country,
  item,
  showBorder,
}: {
  country: KidsHomeCountry;
  item: KidsHomeFeedItem;
  showBorder: boolean;
}) {
  const isPositive = item.amount >= 0;

  return (
    <div className={cn("flex items-center gap-[10px] px-[12px] py-[12px]", showBorder ? "border-b border-[var(--uc-border)]" : "")}>
      <span className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--uc-neutral-100)] text-[var(--uc-action)]">
        <AppIcon name={isPositive ? "gift" : "receipt-text"} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">{item.title}</p>
        <p className="uc-type-p2 mt-[2px] text-[var(--uc-text-muted)]">{item.category} - {item.time}</p>
      </div>
      <span className={cn("shrink-0 text-[15px] font-bold leading-[18px] tracking-[0]", isPositive ? "text-[var(--uc-green-status)]" : "text-[var(--uc-text)]")}>
        {formatSignedKidsMoney(item.amount, country)}
      </span>
    </div>
  );
}

function KidsConceptBottomNav({
  activeTab,
  items,
  style,
  onTabChange,
}: {
  activeTab: KidsBottomNavId;
  items: KidsMarketHomeConcept["nav"];
  style: KidsHomeStyle;
  onTabChange: (tab: KidsBottomNavId) => void;
}) {
  const smart = style === "hu-smart-fintech";
  const cardFirst = style === "ba-bl-card-first";

  return (
    <nav
      aria-label="Kids bottom navigation"
      className="absolute inset-x-0 bottom-0 z-10 border-t border-[var(--uc-border)] bg-[color-mix(in_srgb,var(--uc-surface)_96%,transparent)] px-[14px] pb-[11px] pt-[7px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.08)]"
      data-phone-bottom-navigation="true"
    >
      <div className="flex h-[62px] items-center justify-between gap-[4px]">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isCenter = (smart || cardFirst) && item.id === "card";
          const color = isActive ? "var(--uc-action)" : "var(--uc-icon-muted)";

          return (
            <button
              key={item.id}
              aria-current={isActive ? "page" : undefined}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px]"
              onClick={() => onTabChange(item.id)}
              type="button"
            >
              <span
                className={cn(
                  "grid place-items-center",
                  isCenter
                    ? "size-[42px] rounded-full bg-[var(--uc-primary-k1)] text-[var(--uc-static-white)] shadow-sm"
                    : "size-[28px]",
                )}
              >
                <AppIcon
                  name={resolveIconName(item.icon)}
                  color={isCenter ? "var(--uc-static-white)" : color}
                  size={isCenter ? 22 : 20}
                />
              </span>
              <span
                className={cn(
                  "max-w-full truncate text-center text-[11px] font-bold leading-[13px] tracking-[0]",
                  isActive ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]",
                  isCenter ? "mt-[1px]" : "",
                )}
              >
                {item.label}
              </span>
              <span className="h-[2px] w-[20px]">
                {isActive ? <span className="block h-[2px] w-[20px] rounded-full bg-[var(--uc-action)]" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
