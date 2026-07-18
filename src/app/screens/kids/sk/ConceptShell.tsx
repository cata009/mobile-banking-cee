/**
 * Shared chrome for the non-HU Kids concepts: header, hero dispatcher, action
 * grid, pockets, coach, activity, and bottom navigation.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 2).
 */
import ProfileAvatar from "@/app/components/ProfileAvatar";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { AppIcon } from "@/app/components/icons";
import Card from "@/app/components/cards/Card";
import { cn } from "@/app/components/ui/utils";
import {
  getPocketProgress,
  type KidsBottomNavId,
  type KidsHomeAction,
  type KidsHomeCountry,
  type KidsHomeFeedItem,
  type KidsHomePocket,
  type KidsHomeStyle,
  type KidsMarketHomeConcept,
} from "@/data/kidsMarketHomeConcepts";
import { TONE_CLASSES, formatKidsMoney, formatSignedKidsMoney, resolveIconName } from "../shared/money";
import { SkBulbankProductsHero, SkGuidedHero } from "./SkBulbankScreens";

export function KidsMarketHeader({
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

export function ConceptHero({
  concept,
  isBalanceVisible,
  primaryPocketProgress,
}: {
  concept: KidsMarketHomeConcept;
  isBalanceVisible: boolean;
  primaryPocketProgress: number;
}) {
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

  return (
    <SkGuidedHero
      concept={concept}
      isBalanceVisible={isBalanceVisible}
      primaryPocketProgress={primaryPocketProgress}
    />
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

export function ActiveNavPreview({
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

export function ActionGrid({ actions }: { actions: KidsHomeAction[] }) {
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

export function PocketSection({ concept }: { concept: KidsMarketHomeConcept }) {
  const title = concept.style === "hu-smart-fintech" ? "Smart pockets" : "Saving goals";

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

export function CoachSection({ concept }: { concept: KidsMarketHomeConcept }) {
  return (
    <section>
      <SectionHeadingDivider title="Smart coach" />
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

export function ActivitySection({ concept }: { concept: KidsMarketHomeConcept }) {
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

export function KidsConceptBottomNav({
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

  return (
    <nav
      aria-label="Kids bottom navigation"
      className="absolute inset-x-0 bottom-0 z-10 border-t border-[var(--uc-border)] bg-[color-mix(in_srgb,var(--uc-surface)_96%,transparent)] px-[14px] pb-[11px] pt-[7px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.08)]"
      data-phone-bottom-navigation="true"
    >
      <div className="flex h-[62px] items-center justify-between gap-[4px]">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isCenter = smart && item.id === "card";
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
