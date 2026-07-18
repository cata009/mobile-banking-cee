/**
 * HU Kids tasks: the dedicated page, the Earning card, task rows, and the detail sheet.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx.
 */
import { useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import LinkButton from "@/app/components/ui/LinkButton";
import { cn } from "@/app/components/ui/utils";
import { type HuThemePreset } from "../theme";
import { HuKidsPiMenuFrame } from "../chrome";
import { HU_MASKED_DECIMALS, HU_MASKED_INTEGER, formatHuFullAmount, formatHuMaskedMoney } from "../money";
import type { HuKidsTask } from "../types";

export function HuKidsTasksPage({
  onBack,
  onSelectTask,
  showAmounts,
  tasks,
  theme,
}: {
  onBack: () => void;
  onSelectTask: (taskId: string) => void;
  showAmounts: boolean;
  tasks: HuKidsTask[];
  theme: HuThemePreset;
}) {
  const [collapsedTitleProgress, setCollapsedTitleProgress] = useState(0);
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "transparent";

  return (
    <HuKidsPiMenuFrame
      header={
        <PageHeader
          collapsedTitleProgress={collapsedTitleProgress}
          compact
          onBack={onBack}
          showHelp={false}
          title="Tasks"
          variant={headerVariant}
        />
      }
      onScroll={(event) => {
        setCollapsedTitleProgress(Math.min(event.currentTarget.scrollTop / 64, 1));
      }}
      theme={theme}
      title="Tasks"
    >
      <section className="px-[16px] pt-[16px]">
        <HuTasksCard embedded onSelectTask={onSelectTask} showAmounts={showAmounts} tasks={tasks} />
      </section>
    </HuKidsPiMenuFrame>
  );
}

export function HuTasksCard({
  embedded = false,
  limit,
  onSelectTask,
  onShowMore,
  showAmounts = true,
  tasks,
}: {
  embedded?: boolean;
  limit?: number;
  onSelectTask: (taskId: string) => void;
  onShowMore?: () => void;
  showAmounts?: boolean;
  tasks: HuKidsTask[];
}) {
  const openTasks = tasks.filter((task) => task.status !== "approved").length;
  const previewTasks = typeof limit === "number" ? tasks.slice(0, limit) : tasks;
  const hasMore = typeof limit === "number" && tasks.length > previewTasks.length;

  return (
    <section className={embedded
      ? "flex w-full flex-col gap-[16px]"
      : "flex w-full flex-col gap-[24px] rounded-[16px] bg-[var(--hu-theme-card-bg)] p-[16px]"
    }>
      {/* Header (hidden on embedded/dedicated page to avoid duplication with page header) */}
      {embedded ? null : (
        <div className="flex flex-col gap-[4px]">
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Tasks</h2>
          <p className="text-[14px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
            You have{" "}
            <span className="font-bold">{openTasks} tasks</span>{" "}
            to do
          </p>
        </div>
      )}

      {/* Task rows */}
      <div className="flex flex-col gap-[12px]">
        {previewTasks.map((task, index) => (
          <div key={task.title}>
            <HuTaskRow task={task} onClick={() => onSelectTask(task.id)} showAmounts={showAmounts} />
            {index < previewTasks.length - 1 && (
              <div className="mt-[12px] h-px w-full bg-[var(--uc-border-muted)]" />
            )}
          </div>
        ))}
      </div>

      {hasMore && onShowMore ? (
        <LinkButton
          className="mx-auto mt-[16px] h-[24px] text-[var(--hu-theme-accent-strong)]"
          iconSize={24}
          onClick={onShowMore}
        >
          SHOW MORE
        </LinkButton>
      ) : null}
    </section>
  );
}

export function HuTaskRow({
  onClick,
  task,
  showAmounts = true,
}: {
  onClick: () => void;
  task: HuKidsTask;
  showAmounts?: boolean;
}) {
  const formattedReward = formatHuFullAmount(task.reward);
  const [integerPart, decimalPart] = formattedReward.split(",");
  const completed = task.status !== "todo";
  const statusLabel =
    task.status === "waiting-parent"
      ? "Waiting parent"
      : task.status === "approved"
        ? "Approved"
        : "Pending";

  return (
    <button className="flex min-h-[48px] w-full items-center gap-[8px] text-left" onClick={onClick} type="button">
      {/* Left side: checkbox + text */}
      <div className="flex flex-1 items-center gap-[8px]">
        {/* Unchecked checkbox */}
        <span className="grid size-[32px] shrink-0 place-items-center">
          <span className={cn(
            "grid size-[24px] place-items-center rounded-[4px] border",
            completed
              ? "border-[var(--hu-theme-accent-strong)] bg-[var(--hu-theme-accent-strong)] text-[var(--uc-static-white)]"
              : "border-[var(--uc-border)] bg-[var(--hu-theme-card-bg)]",
          )}>
            {completed ? <AppIcon name="prime-check" size={14} /> : null}
          </span>
        </span>
        <div className="flex min-w-0 flex-col gap-[4px]">
          <p className="min-h-[24px] text-[16px] font-bold leading-[18px] tracking-[0] text-[var(--uc-text)]">
            {task.title}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-[6px]">
            <span className="text-[14px] font-normal leading-[20px] tracking-[0] text-[var(--uc-text-muted)]">
              {task.recurrence}
            </span>
            <span
              className={cn(
                "rounded-full px-[7px] py-[2px] text-[11px] font-bold leading-[13px] tracking-[0]",
                task.status === "approved"
                  ? "bg-[color-mix(in_srgb,var(--uc-green-success)_14%,var(--uc-surface))] text-[var(--uc-green-success)]"
                  : task.status === "waiting-parent"
                    ? "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_22%,var(--uc-surface))] text-[var(--uc-yellow-brown)]"
                    : "bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]",
              )}
            >
              {statusLabel}
            </span>
          </div>
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
    </button>
  );
}

export function HuTaskDetailSheet({
  onClose,
  onMarkDone,
  showAmounts,
  task,
}: {
  onClose: () => void;
  onMarkDone: (taskId: string) => void;
  showAmounts: boolean;
  task: HuKidsTask | null;
}) {
  if (!task) {
    return null;
  }

  const waiting = task.status === "waiting-parent";
  const approved = task.status === "approved";

  return (
    <BottomSheet
      title={task.title}
      subtitle={waiting ? "Waiting parent" : approved ? "Approved" : task.recurrence}
      onClose={onClose}
    >
      <div className="pb-[8px]">
        <div className="flex items-start gap-[14px]">
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
            <AppIcon name="clipboard-check" size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {task.recurrence} task. Mark it as done when you have finished it. Your parent confirms it before the reward is paid.
            </p>
            <p className="mt-[12px] text-[13px] font-bold uppercase leading-[16px] text-[var(--uc-text-muted)]">Reward</p>
            <p className="mt-[4px] text-[24px] font-bold leading-[28px] text-[var(--uc-text)]">
              {showAmounts ? `${formatHuFullAmount(task.reward)} HUF` : formatHuMaskedMoney()}
            </p>
          </div>
        </div>
        {approved ? (
          <div className="mt-[12px] rounded-[12px] bg-[var(--hu-theme-control-bg)] p-[14px]">
            <p className="text-[14px] font-bold leading-[18px] text-[var(--hu-theme-accent-strong)]">
              Approved by parent
            </p>
            <p className="mt-[4px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
              The reward is ready.
            </p>
          </div>
        ) : null}
        {waiting ? (
          <PrimaryButton className="mt-[16px] !w-full" onClick={onClose}>
            Ok, I got it
          </PrimaryButton>
        ) : (
          <PrimaryButton
            className="mt-[16px] !w-full"
            disabled={approved}
            onClick={() => onMarkDone(task.id)}
          >
            {approved ? "Approved" : "Mark as done"}
          </PrimaryButton>
        )}
      </div>
    </BottomSheet>
  );
}
