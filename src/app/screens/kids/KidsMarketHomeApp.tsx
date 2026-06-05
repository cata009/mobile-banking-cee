import { useEffect, useMemo, useState } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import Card from "@/app/components/cards/Card";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { cn } from "@/app/components/ui/utils";
import { formatMoney } from "@/app/registry/countryConfig";
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
