/**
 * SK Kids (Bulbank concept) surfaces: Products home, Education, Tasks, and More.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 2).
 */
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { AppIcon } from "@/app/components/icons";
import Card from "@/app/components/cards/Card";
import { cn } from "@/app/components/ui/utils";
import { formatMoney } from "@/app/registry/countryConfig";
import {
  getPocketProgress,
  type KidsBottomNavId,
  type KidsHomeAction,
  type KidsHomeCountry,
  type KidsMarketHomeConcept,
} from "@/data/kidsMarketHomeConcepts";
import { TONE_CLASSES, formatKidsMoney, resolveIconName } from "../shared/money";
import { SK_LESSONS, SK_MORE_ITEMS, SK_TASKS } from "./data";

export function SkGuidedHero({
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

export function SkBulbankProductsHero({
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

export function SkBulbankContent({
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
  const primaryPocket = concept.pockets[0];
  const progress = getPocketProgress(primaryPocket);

  return (
    <section className="overflow-hidden rounded-[8px] bg-[var(--uc-orange-main)] text-[var(--uc-static-white)] shadow-sm">
      <div className="flex min-h-[96px] items-center justify-between gap-[12px] p-[14px]">
        <div className="min-w-0">
          <p className="text-[24px] font-bold leading-[27px] tracking-[0]">Get a savings</p>
          <p className="mt-[4px] text-[13px] font-bold leading-[16px] tracking-[0] text-[color-mix(in_srgb,var(--uc-static-white)_82%,transparent)]">
            {primaryPocket.helper}
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
            <AppIcon name="prime-check" size={14} />
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
