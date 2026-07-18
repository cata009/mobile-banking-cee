/**
 * HU Kids Home, Saving, and Earning surfaces: balances, quick-action rails, and the pending-action carousel.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx.
 */
import { useEffect, useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import huSunEmojiSrc from "@/assets/kids/figma/hu-sun-emoji.png";
import type { AccountTransaction } from "@/data/accountDetails";
import { type KidsMarketHomeConcept } from "@/data/kidsMarketHomeConcepts";
import type { SavingGoal } from "@/data/huKidsBanking";
import { HU_DEFAULT_KIDS_CARD } from "../cards";
import { HU_KIDS_WEEKLY_ALLOWANCE, HU_LIGHT_ACTIONS, HU_PENDING_ACTIONS, HU_SAVING_ACTIONS } from "../data";
import { HuKidsGoalsSection } from "../goals";
import { HuLearnEducationCard } from "../learnScreens";
import { HuAllMoneyCard, HuCardsPanel, HuSavingFocusCard, HuSpendingCard, HuTransactionsCard } from "../transactions";
import { HU_MASKED_DECIMALS, HU_MASKED_INTEGER, formatHuFullAmount, getHuKidsDecimalParts, getHuKidsSpendModel } from "../money";
import type { HuKidsTask, HuLearnTopic, HuPendingAction, HuPendingActionTone } from "../types";
import { HuTasksCard } from "./tasks";

export type HuHomeContentProps = {
  concept: KidsMarketHomeConcept;
  onCardDetails: (cardId: string) => void;
  onMoreOptions: () => void;
  onRequestMoney: () => void;
  onSendMoney: () => void;
  pendingActions?: HuPendingAction[];
  showAmounts: boolean;
} & (
  | { preview: true; onTransactionClick?: never }
  | { preview?: false; onTransactionClick: (transaction: AccountTransaction) => void }
);

export function HuHomeContent({
  concept,
  onCardDetails,
  onMoreOptions,
  onRequestMoney,
  onSendMoney,
  onTransactionClick,
  pendingActions,
  preview = false,
  showAmounts,
}: HuHomeContentProps) {
  return (
    <main className={cn(preview ? "pointer-events-none" : undefined)}>
        <HuLightBalance concept={concept} showAmounts={showAmounts} />
        <HuLightActionRail
          onCardDetails={() => onCardDetails(HU_DEFAULT_KIDS_CARD.id)}
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
          <HuCardsPanel onCardDetails={onCardDetails} />
          <HuTransactionsCard
            onTransactionClick={preview ? undefined : onTransactionClick}
            showAmounts={showAmounts}
          />
          <HuAllMoneyCard showAmounts={showAmounts} />
        </div>
    </main>
  );
}

export function HuSavingContent({
  goals,
  onCardDetails,
  onCreateGoal,
  onMoreOptions,
  onOpenGoals,
  onRequestMoney,
  onSelectGoal,
  showAmounts,
}: {
  goals: SavingGoal[];
  onCardDetails: (cardId: string) => void;
  onCreateGoal: () => void;
  onMoreOptions: () => void;
  onOpenGoals: () => void;
  onRequestMoney: () => void;
  onSelectGoal: (goalId: string) => void;
  showAmounts: boolean;
}) {
  return (
    <main>
        <HuSavingBalance showAmounts={showAmounts} />
        <HuSavingActionRail
          onCardDetails={() => onCardDetails(HU_DEFAULT_KIDS_CARD.id)}
          onMoreOptions={onMoreOptions}
          onRequestMoney={onRequestMoney}
          onSaveMoney={onOpenGoals}
        />

        <div className="mt-[24px] space-y-[24px] px-[16px]">
          <HuSavingFocusCard showAmounts={showAmounts} />
          <HuKidsGoalsSection
            goals={goals}
            onCreateGoal={onCreateGoal}
            onOpenGoals={onOpenGoals}
            onSelectGoal={onSelectGoal}
            showAmounts={showAmounts}
          />
          <HuTransactionsCard showAmounts={showAmounts} />
        </div>
    </main>
  );
}

export function HuEarningContent({
  completedLessonIds,
  onOpenLearn,
  onSelectTask,
  onShowMoreTasks,
  onSelectTopic,
  showAmounts,
  tasks,
  topics,
}: {
  completedLessonIds: string[];
  onOpenLearn: () => void;
  onSelectTopic: (topicId: string) => void;
  onSelectTask: (taskId: string) => void;
  onShowMoreTasks?: () => void;
  showAmounts: boolean;
  tasks: HuKidsTask[];
  topics: HuLearnTopic[];
}) {
  const educationTopics = topics.slice(0, 2);

  return (
    <main>
        <HuEarningBalance showAmounts={showAmounts} tasks={tasks} />

        <div className="mt-[28px] space-y-[28px] px-[24px]">
          <HuAllowanceCard showAmounts={showAmounts} />
          <HuTasksCard limit={4} onSelectTask={onSelectTask} onShowMore={onShowMoreTasks} showAmounts={showAmounts} tasks={tasks} />
          <HuLearnEducationCard
            completedLessonIds={completedLessonIds}
            onOpenLearn={onOpenLearn}
            onSelectTopic={onSelectTopic}
            topics={educationTopics}
            totalTopics={topics.length}
          />
        </div>
    </main>
  );
}

export function HuEarningBalance({
  showAmounts,
  tasks,
}: {
  showAmounts: boolean;
  tasks: HuKidsTask[];
}) {
  // "Earn this week" = weekly allowance + rewards still up for grabs.
  // Approved tasks are excluded because their reward is already paid into the balance.
  const openTasks = tasks.filter((task) => task.status !== "approved");
  const pendingRewards = openTasks.reduce((sum, task) => sum + task.reward, 0);
  const earnThisWeek = HU_KIDS_WEEKLY_ALLOWANCE + pendingRewards;

  return (
    <section className="mt-[68px] px-[24px] text-center">
      <p className="text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        Earn this week
      </p>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{formatHuFullAmount(earnThisWeek).replace(/ HUF$/, "")}</span>
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
        allowance + {openTasks.length} open tasks
      </p>
    </section>
  );
}

export function HuAllowanceCard({ showAmounts = true }: { showAmounts?: boolean }) {
  return (
    <section
      className="flex w-full flex-col gap-[16px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px]"
    >
      <div className="flex items-start justify-between gap-[14px]">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Allowance</h2>
          <p className="mt-[8px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
            Weekly pocket money
          </p>
        </div>
        <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
          <AppIcon name="piggy-bank" size={23} />
        </span>
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

export function HuLightBalance({
  concept,
  showAmounts,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
}) {
  const displayName = concept.childName || "Alexandra";
  const spendModel = getHuKidsSpendModel();
  const amountParts = getHuKidsDecimalParts(spendModel.availableToSpend);

  return (
    <section className="mt-[68px] px-[24px] text-center">
      <div className="flex items-center justify-center gap-[6px] text-[18px] font-normal leading-[22px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
        <p>Welcome back {displayName}</p>
        <img
          alt=""
          aria-hidden="true"
          className="size-[20px] shrink-0"
          draggable={false}
          src={huSunEmojiSrc}
        />
      </div>
      <div className="mt-[10px] flex items-baseline justify-center gap-[6px] text-[var(--hu-theme-hero-fg)]">
        {showAmounts ? (
          <>
            <span className="text-[46px] font-bold leading-[48px] tracking-[0]">{amountParts.integer}</span>
            <span className="text-[28px] font-normal leading-[32px] tracking-[0]">{amountParts.decimal} HUF</span>
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
    </section>
  );
}

export function HuSavingBalance({
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

export function HuLightActionRail({
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

export function HuSavingActionRail({
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

export function HuRequestMoneyRail({
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

export function HuPendingActionCard({ action, onClick }: { action: HuPendingAction; onClick: () => void }) {
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
            className="rounded-full px-[8px] py-[3px] text-[14px] font-bold uppercase leading-[16px] tracking-[0]"
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

export function HuRequestMoneyArt() {
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
