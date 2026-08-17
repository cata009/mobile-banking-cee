/**
 * HU Kids Home, Saving, and Earning surfaces: balances, quick-action rails, and the pending-action carousel.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx.
 */
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
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
  const dismissedStorageKey = "hu-kids-dismissed-pending-actions";
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissedActionIds, setDismissedActionIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") {
      return new Set();
    }

    try {
      const storedIds = JSON.parse(window.sessionStorage.getItem(dismissedStorageKey) ?? "[]");
      return new Set(Array.isArray(storedIds) ? storedIds.filter((id): id is string => typeof id === "string") : []);
    } catch {
      return new Set();
    }
  });
  const dragStateRef = useRef({
    hasDragged: false,
    isActive: false,
    scrollLeft: 0,
    startX: 0,
  });
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<number | null>(null);
  const visibleActions = useMemo(
    () => actions.filter((action) => !dismissedActionIds.has(action.id)),
    [actions, dismissedActionIds],
  );

  const scrollToAction = (index: number, behavior: ScrollBehavior = "smooth") => {
    const rail = railRef.current;
    const cards = rail?.querySelectorAll<HTMLElement>("[data-hu-request-card]");
    const card = cards?.[index];

    if (!rail || !card) {
      return;
    }

    rail.scrollTo({
      behavior,
      left: Math.max(0, card.offsetLeft - 24),
    });
    setActiveIndex(index);
  };

  const updateActiveIndex = () => {
    const rail = railRef.current;
    const cards = rail?.querySelectorAll<HTMLElement>("[data-hu-request-card]");

    if (!rail || !cards?.length) {
      setActiveIndex(0);
      return;
    }

    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;
    let nextIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextIndex = index;
      }
    });

    setActiveIndex(nextIndex);
  };

  const dismissAction = (actionId: string) => {
    const nextDismissedIds = new Set(dismissedActionIds);
    nextDismissedIds.add(actionId);
    setDismissedActionIds(nextDismissedIds);

    try {
      window.sessionStorage.setItem(dismissedStorageKey, JSON.stringify([...nextDismissedIds]));
    } catch {
      // The in-memory dismissal remains functional if browser storage is unavailable.
    }

    const remainingCount = Math.max(0, visibleActions.length - 1);
    const nextIndex = remainingCount === 0 ? 0 : Math.min(activeIndex, remainingCount - 1);
    setActiveIndex(nextIndex);

    window.requestAnimationFrame(() => scrollToAction(nextIndex, "auto"));
  };

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
    <section aria-label="Pending events" className="mt-[24px]" data-hu-request-rail>
      {visibleActions.length > 0 ? (
        <>
          <div
            ref={railRef}
            className="cursor-grab touch-pan-x snap-x snap-mandatory scroll-px-[24px] select-none overflow-x-auto overscroll-x-contain px-[24px] active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onClickCapture={handleClickCapture}
            onPointerCancel={finishPointerDrag}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerDrag}
            onScroll={updateActiveIndex}
          >
            <div className="flex w-max gap-[12px] pr-[24px]" role="list">
              {visibleActions.map((action) => (
                <HuPendingActionCard
                  key={action.id}
                  action={action}
                  onClick={() => openAction(action)}
                  onDismiss={() => dismissAction(action.id)}
                />
              ))}
            </div>
          </div>

          {visibleActions.length > 1 ? (
            <div className="mt-[10px] flex h-[44px] items-center justify-center gap-[8px]" aria-label="Event carousel pagination">
              <button
                aria-label="Previous event"
                className="grid size-[44px] place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)] transition-transform active:scale-[0.96] disabled:opacity-40"
                disabled={activeIndex === 0}
                onClick={() => scrollToAction(Math.max(0, activeIndex - 1))}
                type="button"
              >
                <AppIcon name="chevron-left" size={20} />
              </button>
              <span className="min-w-[52px] text-center text-[14px] font-semibold leading-[18px] text-[var(--uc-text)]" aria-live="polite">
                {activeIndex + 1} of {visibleActions.length}
              </span>
              <button
                aria-label="Next event"
                className="grid size-[44px] place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)] transition-transform active:scale-[0.96] disabled:opacity-40"
                disabled={activeIndex === visibleActions.length - 1}
                onClick={() => scrollToAction(Math.min(visibleActions.length - 1, activeIndex + 1))}
                type="button"
              >
                <AppIcon className="rotate-180" name="chevron-left" size={20} />
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mx-[24px] flex min-h-[112px] items-center gap-[14px] rounded-[20px] bg-[var(--hu-theme-card-bg)] px-[18px] py-[16px] shadow-sm" aria-live="polite">
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
            <AppIcon name="check" size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">You're all caught up</h2>
            <p className="mt-[4px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">New requests and approvals will appear here.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export function HuPendingActionCard({
  action,
  onClick,
  onDismiss,
}: {
  action: HuPendingAction;
  onClick: () => void;
  onDismiss: () => void;
}) {
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
    <article
      className="relative h-[152px] w-[calc(100vw-48px)] min-w-[288px] max-w-[327px] shrink-0 snap-start snap-always overflow-hidden rounded-[20px] bg-[var(--hu-theme-card-bg)] shadow-sm"
      data-hu-request-card
      role="listitem"
    >
      <button
        aria-label={`Open ${action.title} event from ${action.person}`}
        className="relative z-[2] block h-full w-full text-left transition-transform active:scale-[0.99]"
        draggable={false}
        onClick={onClick}
        onDragStart={(event) => event.preventDefault()}
        type="button"
      >
        <div className={cn("relative z-[2] h-full px-[18px] py-[18px]", isMoneyRequest ? "w-[232px]" : "w-full pr-[82px]")}> 
          <div className="flex items-center gap-[8px]">
            <h2 className="min-w-0 text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{action.title}</h2>
          </div>
          <span
            className="mt-[8px] inline-flex rounded-full px-[8px] py-[3px] text-[14px] font-bold uppercase leading-[16px] tracking-[0]"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {action.status}
          </span>
          <p className="mt-[9px] truncate text-[16px] font-semibold leading-[20px] tracking-[0] text-[var(--uc-text)]">{action.person}</p>
          <p className="mt-[3px] line-clamp-1 text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">{action.description}</p>
        </div>
      </button>

      <button
        aria-label={`Dismiss ${action.title} event`}
        className="absolute right-[10px] top-[10px] z-[4] grid size-[44px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)] shadow-sm backdrop-blur-[12px] transition-transform active:scale-[0.94]"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDismiss();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <AppIcon name="close-x" size={20} />
      </button>

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
    </article>
  );
}

export function HuRequestMoneyArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0 right-0 w-[106px] bg-[var(--uc-green-deep)]"
      style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div className="absolute left-[18px] top-[46px] h-[58px] w-[88px] -rotate-[14deg] overflow-hidden rounded-[6px] bg-[color-mix(in_srgb,var(--uc-green-success)_78%,var(--uc-yellow-gold))] shadow-sm">
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
