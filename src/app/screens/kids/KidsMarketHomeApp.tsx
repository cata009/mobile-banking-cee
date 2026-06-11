import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import BottomNavigation from "@/app/components/BottomNavigation";
import Card from "@/app/components/cards/Card";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import PageHeader from "@/app/components/PageHeader";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import PrimaryButton from "@/app/components/PrimaryButton";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import UniCreditLogo from "@/app/components/UniCreditLogo";
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
import { formatMoney } from "@/app/registry/countryConfig";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import { ContactsCard } from "@/app/screens/more/cards/ContactsCard";
import { DocumentsCard } from "@/app/screens/more/cards/DocumentsCard";
import { MyRequestsCard } from "@/app/screens/more/cards/MyRequestsCard";
import { SettingsCard } from "@/app/screens/more/cards/SettingsCard";
import { TutorialCard } from "@/app/screens/more/cards/TutorialCard";
import womanProfileSrc from "../../../assets/kids/woman-profile.png";
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

type HuLightNavId = "home" | "analytics" | "payments" | "products" | "more";
type HuLightView = "home" | "theme";
type HuThemeId = "default" | "blue-lines" | "bubbles" | "aurora" | "garden" | "solar";
type HuKidsMenuShapeCountry = Extract<CountryId, "BA">;
type HuKidsRuntimeCountry = Extract<CountryId, "HU">;

const HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY: HuKidsMenuShapeCountry = "BA";
const HU_KIDS_RUNTIME_COUNTRY: HuKidsRuntimeCountry = "HU";

const HU_LIGHT_ACTIONS: Array<{ id: "send" | "request" | "details" | "more"; label: string; icon: IconName }> = [
  { id: "send", label: "Send money", icon: "nav-payments" },
  { id: "request", label: "Request money", icon: "hu-kids-request-money" },
  { id: "details", label: "Account Details", icon: "hu-kids-account-details" },
  { id: "more", label: "More Options", icon: "hu-kids-more-options" },
];

type HuThemePreset = {
  id: HuThemeId;
  name: string;
  hint: string;
  accent: string;
  accent2: string;
  accent3: string;
  pageBackground: string;
  motionBackground: string;
  swatchBackground: string;
  surfaceWeight: number;
  navWeight: number;
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
    id: "blue-lines",
    name: "Blue Lines",
    hint: "kinetic lines",
    accent: "var(--uc-product-blue)",
    accent2: "var(--uc-teal-bright)",
    accent3: "var(--uc-product-blue-deep)",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-primary-k1) 18%, var(--uc-product-blue)) 0%, var(--uc-app-bg) 390px)",
    motionBackground:
      "radial-gradient(circle at 74% 18%, color-mix(in srgb, var(--hu-theme-accent-2) 28%, transparent), transparent 30%), repeating-linear-gradient(124deg, transparent 0 13px, color-mix(in srgb, var(--hu-theme-accent) 72%, transparent) 14px 16px, transparent 17px 31px), repeating-linear-gradient(64deg, transparent 0 30px, color-mix(in srgb, var(--hu-theme-accent-3) 46%, transparent) 31px 32px, transparent 33px 58px)",
    swatchBackground:
      "radial-gradient(circle at 68% 28%, var(--uc-teal-bright), transparent 35%), linear-gradient(135deg, var(--uc-primary-k1), var(--uc-product-blue) 54%, var(--uc-teal-main))",
    surfaceWeight: 87,
    navWeight: 78,
  },
  {
    id: "bubbles",
    name: "Bubbles",
    hint: "soft depth",
    accent: "var(--uc-teal-blue)",
    accent2: "var(--uc-product-blue)",
    accent3: "var(--uc-teal-soft)",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-teal-blue) 28%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 380px)",
    motionBackground:
      "radial-gradient(circle at 22% 26%, color-mix(in srgb, var(--hu-theme-accent-2) 54%, transparent), transparent 18%), radial-gradient(circle at 66% 12%, color-mix(in srgb, var(--hu-theme-accent-3) 52%, transparent), transparent 18%), radial-gradient(circle at 46% 54%, color-mix(in srgb, var(--hu-theme-accent) 42%, transparent), transparent 22%), radial-gradient(circle at 84% 46%, color-mix(in srgb, var(--hu-theme-accent-2) 40%, transparent), transparent 18%)",
    swatchBackground:
      "radial-gradient(circle at 30% 35%, var(--uc-product-blue), transparent 25%), radial-gradient(circle at 66% 62%, var(--uc-teal-bright), transparent 28%), linear-gradient(135deg, var(--uc-primary-k1), var(--uc-teal-blue))",
    surfaceWeight: 88,
    navWeight: 78,
  },
  {
    id: "aurora",
    name: "Aurora",
    hint: "magenta glow",
    accent: "var(--uc-product-pink)",
    accent2: "var(--uc-product-mauve)",
    accent3: "var(--uc-red-main)",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-product-pink) 30%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 385px)",
    motionBackground:
      "radial-gradient(circle at 18% 24%, color-mix(in srgb, var(--hu-theme-accent-3) 38%, transparent), transparent 28%), radial-gradient(circle at 70% 10%, color-mix(in srgb, var(--hu-theme-accent) 48%, transparent), transparent 34%), linear-gradient(130deg, color-mix(in srgb, var(--hu-theme-accent-2) 42%, transparent), transparent 52%), repeating-linear-gradient(38deg, transparent 0 28px, color-mix(in srgb, var(--hu-theme-accent) 26%, transparent) 29px 30px, transparent 31px 54px)",
    swatchBackground:
      "linear-gradient(135deg, var(--uc-product-mauve), var(--uc-product-pink) 52%, var(--uc-red-main))",
    surfaceWeight: 87,
    navWeight: 78,
  },
  {
    id: "garden",
    name: "Garden",
    hint: "fresh lines",
    accent: "var(--uc-green-success)",
    accent2: "var(--uc-yellow-gold)",
    accent3: "var(--uc-green-deep)",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-green-success) 28%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 385px)",
    motionBackground:
      "radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--hu-theme-accent-2) 34%, transparent), transparent 28%), repeating-linear-gradient(110deg, transparent 0 12px, color-mix(in srgb, var(--hu-theme-accent) 56%, transparent) 13px 14px, transparent 15px 28px), repeating-linear-gradient(150deg, transparent 0 38px, color-mix(in srgb, var(--hu-theme-accent-3) 28%, transparent) 39px 41px, transparent 42px 76px)",
    swatchBackground:
      "linear-gradient(135deg, var(--uc-green-deep), var(--uc-green-success) 58%, var(--uc-yellow-gold))",
    surfaceWeight: 88,
    navWeight: 80,
  },
  {
    id: "solar",
    name: "Solar",
    hint: "warm rings",
    accent: "var(--uc-orange-main)",
    accent2: "var(--uc-yellow-gold)",
    accent3: "var(--uc-red-main)",
    pageBackground: "linear-gradient(180deg, color-mix(in srgb, var(--uc-orange-main) 30%, var(--uc-app-bg)) 0%, var(--uc-app-bg) 380px)",
    motionBackground:
      "radial-gradient(circle at 56% 22%, color-mix(in srgb, var(--hu-theme-accent-2) 38%, transparent), transparent 28%), repeating-radial-gradient(circle at 42% 22%, transparent 0 16px, color-mix(in srgb, var(--hu-theme-accent) 32%, transparent) 17px 18px, transparent 19px 34px), linear-gradient(140deg, color-mix(in srgb, var(--hu-theme-accent-3) 22%, transparent), transparent 55%)",
    swatchBackground:
      "radial-gradient(circle at 70% 28%, var(--uc-yellow-gold), transparent 30%), linear-gradient(135deg, var(--uc-red-main), var(--uc-orange-main) 58%, var(--uc-yellow-gold))",
    surfaceWeight: 88,
    navWeight: 80,
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
    "--hu-theme-page-bg": theme.pageBackground,
    "--hu-theme-motion-bg": theme.motionBackground,
    "--hu-theme-swatch-bg": theme.swatchBackground,
    "--hu-theme-card-bg": isStandard
      ? "var(--uc-surface)"
      : `color-mix(in srgb, var(--uc-surface) ${theme.surfaceWeight}%, var(--hu-theme-accent))`,
    "--hu-theme-card-strong-bg": isStandard
      ? "var(--uc-surface)"
      : `color-mix(in srgb, var(--uc-surface) ${Math.max(78, theme.surfaceWeight - 6)}%, var(--hu-theme-accent-2))`,
    "--hu-theme-control-bg": isStandard
      ? "var(--uc-surface)"
      : "color-mix(in srgb, var(--uc-surface) 78%, var(--hu-theme-accent))",
    "--hu-theme-control-fg": "var(--uc-text)",
    "--hu-theme-progress-bg": isStandard
      ? "var(--uc-surface-muted)"
      : "color-mix(in srgb, var(--uc-surface-muted) 78%, var(--hu-theme-accent))",
    "--hu-theme-nav-bg": isStandard
      ? "var(--uc-bottom-bar-bg)"
      : `color-mix(in srgb, var(--uc-bottom-bar-bg) ${theme.navWeight}%, var(--hu-theme-accent))`,
    "--hu-theme-hero-muted": "color-mix(in srgb, var(--uc-text-muted) 82%, var(--hu-theme-accent-3))",
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
  const appliedTheme = getHuTheme(appliedThemeId);
  const draftTheme = getHuTheme(draftThemeId);
  const phoneChromeTheme = view === "theme" ? draftTheme : appliedTheme;
  const activeNavUsesThemeField = activeNav === "home" || activeNav === "analytics";
  const phoneChromeUsesLightForeground =
    view === "theme" || (activeNavUsesThemeField && phoneChromeTheme.id !== "default");

  const handleNavChange = (tab: HuLightNavId) => {
    setActiveNav(tab);
    setMotionProgress(0);
    setIsMoreSheetOpen(false);
  };

  useEffect(() => {
    const root = document.documentElement;
    const foreground = phoneChromeUsesLightForeground ? "var(--uc-static-white)" : "var(--uc-text)";
    const islandBackground = phoneChromeUsesLightForeground
      ? `color-mix(in srgb, var(--uc-static-black) 72%, ${phoneChromeTheme.accent})`
      : "color-mix(in srgb, var(--uc-static-black) 90%, transparent)";
    const sensorBackground = phoneChromeUsesLightForeground
      ? `color-mix(in srgb, var(--uc-static-black) 82%, ${phoneChromeTheme.accent3})`
      : "color-mix(in srgb, var(--uc-static-black) 96%, transparent)";
    const systemBarBackground = phoneChromeUsesLightForeground
      ? "linear-gradient(180deg, color-mix(in srgb, var(--uc-static-black) 24%, transparent) 0%, color-mix(in srgb, var(--uc-static-black) 10%, transparent) 52%, transparent 100%)"
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
  }, [phoneChromeTheme.accent, phoneChromeTheme.accent3, phoneChromeUsesLightForeground]);

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

  return (
    <HuThemeShell theme={appliedTheme}>
      {activeNavUsesThemeField ? (
        <>
          <HuThemeMotionLayer motionProgress={motionProgress} />
          <div className="relative z-[1] h-[54px] flex-shrink-0" />

          <div
            className="scrollbar-hide relative z-[1] flex-1 overflow-y-auto pb-[104px]"
            onScroll={(event) => {
              const nextProgress = Math.min(event.currentTarget.scrollTop / 210, 1);
              setMotionProgress(nextProgress);
            }}
          >
            {activeNav === "analytics" ? (
              <HuSavingContent
                concept={concept}
                onMoreOptions={() => setIsMoreSheetOpen(true)}
                onToggleAmounts={() => setShowAmounts((current) => !current)}
                showAmounts={showAmounts}
              />
            ) : (
              <HuHomeContent
                concept={concept}
                onMoreOptions={() => setIsMoreSheetOpen(true)}
                onToggleAmounts={() => setShowAmounts((current) => !current)}
                showAmounts={showAmounts}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {activeNav === "payments" ? <HuKidsPaymentsPage /> : null}
          {activeNav === "products" ? <HuKidsProductsPage /> : null}
          {activeNav === "more" ? <HuKidsMorePage /> : null}
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
    </HuThemeShell>
  );
}

function HuKidsPiMenuHeader({ title }: { title: string }) {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-[var(--uc-surface)]">
      <div className="px-[24px] pb-[22px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1 className="uc-type-h1 min-w-0 flex-1 text-[var(--uc-text)]">{title}</h1>
          <HeaderActionRail>
            <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={() => undefined} />
            <HeaderActionButton
              icon="messages"
              label={t("runtime.actions.messages", "Messages")}
              onClick={() => undefined}
            />
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}

function HuKidsPiMenuFrame({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
      <HuKidsPiMenuHeader title={title} />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[104px]">
        {children}
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

function HuKidsPaymentsPage() {
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
      <HuKidsPiMenuFrame title={t("runtime.payments.title", menu.title)}>
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

function HuKidsProductsPage() {
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
    <HuKidsPiMenuFrame title={t("runtime.productsMenu.title", config.title)}>
      {localizedOffers.length > 0 ? (
        <section className="pt-[16px]">
          <SectionHeadingDivider title={t("runtime.productsMenu.offersForYou", config.offersTitle)} className="px-[24px]" />
          <div className="grid grid-cols-[327px] justify-center gap-[12px] px-[24px] pt-[16px]">
            {localizedOffers.map((offer) => (
              <button
                key={offer.id}
                className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px] text-left"
                onClick={() => handleHuKidsOfferClick(offer)}
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

function HuKidsMorePage() {
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
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
      <MoreHeader
        actionVariant="contact-messages"
        onContactPhone={() => undefined}
        onLogout={() => undefined}
        onMessages={() => undefined}
        onProfile={() => undefined}
      />

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[104px]">
        <div className="px-[16px] pt-[16px]">
          <div className="grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
            {availableCards.map((cardType) => renderCard(cardType))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HuThemeShell({
  children,
  className,
  theme,
}: {
  children: ReactNode;
  className?: string;
  theme: HuThemePreset;
}) {
  return (
    <div
      className={cn("relative flex h-full w-full flex-col overflow-hidden text-[var(--uc-text)]", className)}
      data-hu-theme={theme.id}
      style={getHuThemeStyle(theme)}
    >
      <div className="absolute inset-0" style={{ background: "var(--hu-theme-page-bg)" }} />
      {children}
    </div>
  );
}

function HuHomeContent({
  concept,
  onMoreOptions,
  onToggleAmounts,
  preview = false,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  onMoreOptions: () => void;
  onToggleAmounts: () => void;
  preview?: boolean;
  showAmounts: boolean;
}) {
  return (
    <>
      <HuLightHeader showAmounts={showAmounts} onToggleAmounts={onToggleAmounts} preview={preview} />

      <main className={cn(preview ? "pointer-events-none" : undefined)}>
        <HuLightBalance concept={concept} showAmounts={showAmounts} />
        <HuLightActionRail onMoreOptions={onMoreOptions} />
        <HuRequestMoneyRail />

        <div className="mt-[28px] space-y-[28px] px-[24px]">
          <HuSpendingCard showAmounts={showAmounts} />
          <HuTransactionsCard showAmounts={showAmounts} />
          <HuCardsPanel />
          <HuTasksCard />
          <HuAllMoneyCard showAmounts={showAmounts} />
        </div>
      </main>
    </>
  );
}

function HuSavingContent({
  concept,
  onMoreOptions,
  onToggleAmounts,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  onMoreOptions: () => void;
  onToggleAmounts: () => void;
  showAmounts: boolean;
}) {
  return (
    <>
      <HuLightHeader showAmounts={showAmounts} onToggleAmounts={onToggleAmounts} />

      <main>
        <HuLightBalance concept={concept} showAmounts={showAmounts} />
        <HuLightActionRail onMoreOptions={onMoreOptions} />

        <div className="mt-[28px] space-y-[28px] px-[24px]">
          <HuSavingFocusCard showAmounts={showAmounts} />
          <HuSpendingCard showAmounts={showAmounts} />
          <HuTasksCard />
          <HuAllMoneyCard showAmounts={showAmounts} />
          <HuTransactionsCard showAmounts={showAmounts} />
        </div>
      </main>
    </>
  );
}

function HuThemeMotionLayer({
  fadeTo = "var(--uc-app-bg)",
  motionProgress = 0,
  preview = false,
}: {
  fadeTo?: string;
  motionProgress?: number;
  preview?: boolean;
}) {
  const opacity = preview ? 0.9 : Math.max(0, 1 - motionProgress * 1.35);
  const translateY = preview ? 0 : motionProgress * -30;
  const scale = preview ? 1 : 1 + motionProgress * 0.025;

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
        <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent)_12%,var(--uc-surface))] px-[10px] py-[4px] text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--hu-theme-accent)]">
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
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent)]">
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

  return (
    <HuThemeShell className="bg-[var(--uc-static-black)] text-[var(--uc-static-white)]" theme={draftTheme}>
      <div className="absolute inset-0 bg-[var(--uc-static-black)]" />
      <HuThemeMotionLayer fadeTo="var(--uc-static-black)" motionProgress={0.05} preview />

      <div className="relative z-[3] flex-shrink-0">
        <PageHeader
          collapsedTitleProgress={1}
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Change theme"
          variant="dark"
        />
      </div>

      <main className="relative z-[2] flex min-h-0 flex-1 flex-col items-center overflow-hidden px-[18px] pb-[18px]">
        <div className="mt-[8px] flex w-full justify-center">
          <HuHomePreview concept={concept} showAmounts={showAmounts} theme={draftTheme} />
        </div>

        <div className="mt-[16px] w-full">
          <HuThemeCarousel
            appliedThemeId={appliedThemeId}
            selectedThemeId={draftThemeId}
            onSelectTheme={onSelectTheme}
          />
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
    </HuThemeShell>
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
  return (
    <div className="relative flex h-[405px] w-[286px] items-center justify-center rounded-[30px] bg-[color-mix(in_srgb,var(--uc-static-white)_11%,var(--uc-static-black))] p-[16px] shadow-[0_24px_70px_color-mix(in_srgb,var(--uc-static-black)_54%,transparent),inset_0_0_0_1px_color-mix(in_srgb,var(--uc-static-white)_10%,transparent)]">
      <div className="absolute inset-[7px] rounded-[26px] border border-[color-mix(in_srgb,var(--uc-static-white)_8%,transparent)]" />
      <div className="relative h-[353px] w-[234px] overflow-hidden rounded-[22px] bg-[var(--uc-app-bg)] shadow-[0_18px_38px_color-mix(in_srgb,var(--uc-static-black)_42%,transparent)]">
        <div className="h-[812px] w-[375px] origin-top-left scale-[0.624]">
          <HuThemeShell theme={theme}>
            <HuThemeMotionLayer motionProgress={0.04} preview />
            <div className="relative z-[1] h-[54px] flex-shrink-0" />
            <div className="scrollbar-hide relative z-[1] flex-1 overflow-hidden pb-[104px]">
              <HuHomeContent
                concept={concept}
                onMoreOptions={() => undefined}
                onToggleAmounts={() => undefined}
                preview
                showAmounts={showAmounts}
              />
            </div>
            <HuLightBottomNav activeNav="home" onChange={() => undefined} />
          </HuThemeShell>
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
      className="scrollbar-hide flex w-full cursor-grab touch-pan-x select-none gap-[16px] overflow-x-auto px-[2px] pb-[2px] active:cursor-grabbing"
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
                  ? "scale-[1.04] border-[var(--uc-static-white)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]"
                  : "border-[color-mix(in_srgb,var(--uc-static-white)_18%,transparent)]",
              )}
              style={{ background: theme.swatchBackground }}
            >
              {isSelected ? (
                <span className="grid size-[34px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-static-black)_42%,transparent)] text-[var(--uc-static-white)]">
                  <AppIcon name="prime-check" size={18} />
                </span>
              ) : null}
              {!isSelected && isApplied ? (
                <span className="absolute bottom-[-3px] right-[-3px] grid size-[22px] place-items-center rounded-full bg-[var(--uc-static-white)] text-[var(--uc-static-black)]">
                  <AppIcon name="prime-check" size={13} />
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "mt-[8px] max-w-full truncate text-[12px] leading-[15px] tracking-[0]",
                isSelected ? "font-bold text-[var(--uc-static-white)]" : "font-normal text-[color-mix(in_srgb,var(--uc-static-white)_68%,transparent)]",
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
  preview = false,
  showAmounts,
  onToggleAmounts,
}: {
  preview?: boolean;
  showAmounts: boolean;
  onToggleAmounts: () => void;
}) {
  return (
    <header className="flex h-[40px] items-center justify-between px-[24px]">
      <UniCreditLogo className="h-[24px] w-auto" textColor="var(--uc-text)" />

      <div className="flex items-center gap-[12px]">
        <button
          aria-label={showAmounts ? "Hide amounts" : "Show amounts"}
          className="grid size-[28px] place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-control-fg)] shadow-sm"
          disabled={preview}
          onClick={onToggleAmounts}
          type="button"
        >
          <AppIcon name={showAmounts ? "amount-hide" : "amount-show"} size={18} />
        </button>
        <button
          aria-label="Messages"
          className="grid size-[28px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--hu-theme-control-bg)_72%,transparent)] text-[var(--uc-text)]"
          disabled={preview}
          type="button"
        >
          <AppIcon name="header-messages" size={22} />
        </button>
        <button aria-label="Profile" className="grid size-[36px] place-items-center rounded-full" type="button">
          <ProfileAvatar
            imageAlt="Alexandra profile"
            imageSrc={womanProfileSrc}
            size={36}
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
      <p className="text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--uc-text-muted)]">
        Welcome back {displayName}
      </p>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--uc-text)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">35.628</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">,34 HUF</span>
          </>
        ) : (
          <span className="text-[46px] font-bold leading-[48px] tracking-[0]">••••••</span>
        )}
      </div>
      <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        are available for you to spend
      </p>
    </section>
  );
}

function HuLightActionRail({ onMoreOptions }: { onMoreOptions: () => void }) {
  return (
    <section className="mt-[66px] px-[24px]">
      <div className="grid grid-cols-4 gap-[18px]">
        {HU_LIGHT_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="flex min-w-0 flex-col items-center gap-[10px]"
            onClick={action.id === "more" ? onMoreOptions : undefined}
            type="button"
          >
            <span className="grid size-[68px] place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)] shadow-sm">
              <AppIcon name={action.icon} size={28} />
            </span>
            <span className="min-h-[34px] max-w-[70px] text-center text-[12px] font-bold leading-[14px] tracking-[0] text-[var(--uc-text-muted)]">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HuRequestMoneyRail() {
  return (
    <section className="mt-[24px] overflow-hidden">
      <div className="flex gap-[8px] overflow-x-auto pl-[24px] pr-[16px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <article className="relative h-[126px] w-[354px] shrink-0 overflow-hidden rounded-[16px] bg-[var(--hu-theme-card-bg)] shadow-sm">
          <div className="relative z-[1] w-[226px] px-[18px] py-[18px]">
            <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Request Money</h2>
            <p className="mt-[16px] text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
              Grandpa Andrei
            </p>
            <p className="mt-[14px] text-[16px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
              30 Ron for Food
            </p>
          </div>
          <HuRequestMoneyArt />
        </article>
        <div className="h-[126px] w-[72px] shrink-0 rounded-[16px] bg-[var(--hu-theme-card-bg)]" />
      </div>
    </section>
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

function HuSavingFocusCard({ showAmounts }: { showAmounts: boolean }) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <div className="flex items-start justify-between gap-[14px]">
        <div className="min-w-0">
          <p className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Saving account</p>
          <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            Festival pass and sneakers stay on track.
          </p>
        </div>
        <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent)]">
          <AppIcon name="piggy-bank" size={23} />
        </span>
      </div>
      <div className="mt-[18px] flex items-end justify-between gap-[12px]">
        <div>
          <p className="text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">Saved so far</p>
          <p className="mt-[6px] text-[25px] font-bold leading-[29px] tracking-[0] text-[var(--uc-text)]">
            {showAmounts ? "11.824" : "â€¢â€¢â€¢â€¢"}
            <span className="text-[16px] font-normal leading-[20px]">,33 HUF</span>
          </p>
        </div>
        <button
          className="flex h-[36px] items-center rounded-full bg-[var(--hu-theme-accent)] px-[14px] text-[13px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-inverse)]"
          type="button"
        >
          Add goal
        </button>
      </div>
      <div className="mt-[16px] h-[10px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
        <div className="h-full w-[62%] rounded-full bg-[var(--hu-theme-accent)]" />
      </div>
    </section>
  );
}

function HuSpendingCard({ showAmounts }: { showAmounts: boolean }) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Spending this week</h2>
      <div className="mt-[20px] flex items-start justify-between gap-[12px]">
        <HuAmountColumn label="Spent" value={showAmounts ? "25.000" : "••••"} suffix=",00 HUF" />
        <HuAmountColumn align="right" label="Remaining" value={showAmounts ? "50.000" : "••••"} suffix=",00 HUF" />
      </div>
      <div className="mt-[22px] h-[14px] overflow-hidden rounded-full bg-[var(--hu-theme-progress-bg)]">
        <div className="h-full w-[90%] rounded-full bg-[var(--hu-theme-accent)]" />
      </div>
      <div className="mt-[18px] flex items-center justify-between gap-[12px] text-[13px] leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
        <p>
          Weekly limit: <span className="font-bold text-[var(--uc-text)]">{showAmounts ? "75.000,00 HUF" : "••••"}</span>
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

function HuTransactionsCard({ showAmounts }: { showAmounts: boolean }) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] pb-[18px] pt-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Your recent transactions</h2>
      <div className="mt-[18px]">
        <HuTransactionRow
          amount={showAmounts ? "+11.824,33 RON" : "+•••• RON"}
          icon="add-money"
          isPositive
          source="From Dad"
          subtitle="Salary November"
          time="Today 14:31"
        />
        <div className="my-[16px] h-px bg-[var(--uc-border)]" />
        <HuTransactionRow
          amount={showAmounts ? "-94,21 RON" : "-•••• RON"}
          icon="gift"
          source="McDonalds"
          time="Today 11:24"
        />
      </div>
      <button className="mx-auto mt-[22px] flex items-center gap-[6px] text-[13px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--hu-theme-accent)]" type="button">
        SEE MORE TRANSACTIONS
        <AppIcon name="chevron-link" size={24} />
      </button>
    </section>
  );
}

function HuTransactionRow({
  amount,
  icon,
  isPositive = false,
  source,
  subtitle,
  time,
}: {
  amount: string;
  icon: IconName;
  isPositive?: boolean;
  source: string;
  subtitle?: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-[12px]">
      <span
        className={cn(
          "grid size-[34px] shrink-0 place-items-center rounded-full text-[var(--uc-static-white)]",
          isPositive ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-product-pink)]",
        )}
      >
        <AppIcon name={icon} size={18} />
      </span>
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

function HuCardsPanel() {
  return (
    <section className="rounded-[8px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Your cards</h2>
      <div className="mt-[14px] grid grid-cols-3 gap-[18px]">
        {[0, 1].map((index) => (
          <article key={index} className="min-w-0 text-center">
            <Card ariaLabel="Mastercard Standard card" size="figma" />
            <h3 className="mt-[8px] text-[14px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">
              Mastercard Standard
            </h3>
            <p className="text-[14px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">*4007</p>
          </article>
        ))}
        <button className="flex min-w-0 flex-col items-center text-center" type="button">
          <span className="grid h-[42px] w-[70px] place-items-center rounded-[3px] border border-dashed border-[var(--uc-text)] text-[var(--hu-theme-accent)]">
            <AppIcon name="add-circle" size={28} />
          </span>
          <span className="mt-[9px] text-[14px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text)]">
            Add new card
          </span>
        </button>
      </div>
    </section>
  );
}

function HuTasksCard() {
  return (
    <section className="rounded-[8px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Your tasks</h2>
      <div className="mt-[18px] space-y-[18px]">
        {[0, 1].map((index) => (
          <div key={index}>
            <HuTaskRow />
            {index === 0 ? <div className="mt-[18px] h-px bg-[var(--uc-border)]" /> : null}
          </div>
        ))}
      </div>
      <button className="mx-auto mt-[28px] flex items-center gap-[6px] text-[13px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--hu-theme-accent)]" type="button">
        SEE ALL TASKS
        <AppIcon name="chevron-link" size={24} />
      </button>
    </section>
  );
}

function HuTaskRow() {
  return (
    <div className="flex items-start gap-[18px]">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--uc-product-pink)] text-[var(--uc-static-white)]">
        <AppIcon name="gift" size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">Clean your room</p>
        <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">100 HUF</p>
        <p className="mt-[4px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">Due Today</p>
      </div>
    </div>
  );
}

function HuAllMoneyCard({ showAmounts }: { showAmounts: boolean }) {
  return (
    <section className="rounded-[16px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[18px] shadow-sm">
      <h2 className="text-[16px] font-bold leading-[20px] tracking-[0] text-[var(--uc-text)]">All your money</h2>
      <p className="mt-[4px] text-[29px] font-bold leading-[32px] tracking-[0] text-[var(--uc-text)]">
        {showAmounts ? "35.628" : "••••"}
        <span className="text-[20px] font-normal leading-[24px]">,00 HUF</span>
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
        {showAmounts ? "11.824,33 HUF" : "•••• HUF"}
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
          "--uc-action": "var(--hu-theme-accent)",
          "--uc-bottom-bar-bg": "var(--hu-theme-nav-bg)",
        } as CSSProperties
      }
    >
      <BottomNavigation activeTab={activeNav} onTabChange={onChange} />
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
