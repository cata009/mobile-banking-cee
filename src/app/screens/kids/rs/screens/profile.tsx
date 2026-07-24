/**
 * RS Teens Profile — Nikola header, parent link, chores→reward loop, and the
 * menu entries to approvals / insights / card settings / theme.
 */
import { AppIcon, type IconName } from "@/app/components/icons";
import { ListCard, SectionLabel } from "../ui";
import { RS_TEEN_PROFILE } from "../data";
import { formatRsd } from "../money";
import { getRsLearnOverallProgress } from "../learn/topics";
import type { RsLearnProgress, RsTask } from "../types";

export function RsProfileScreen({
  tasks,
  learnProgress,
  pendingCount,
  onMarkTask,
  onOpenApprovals,
  onOpenInsights,
  onOpenCardSettings,
  onOpenActivity,
  onOpenTheme,
}: {
  tasks: RsTask[];
  learnProgress: RsLearnProgress;
  pendingCount: number;
  onMarkTask: (taskId: string) => void;
  onOpenApprovals: () => void;
  onOpenInsights: () => void;
  onOpenCardSettings: () => void;
  onOpenActivity: () => void;
  onOpenTheme: () => void;
}) {
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const learnPct = getRsLearnOverallProgress(learnProgress.completed);
  const totalReward = todoTasks.reduce((sum, t) => sum + t.reward, 0);

  return (
    <div className="flex flex-col gap-4 px-[20px] pt-2">
      {/* Identity */}
      <ListCard className="!p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full text-[20px] font-bold text-white" style={{ background: `color-mix(in srgb, ${RS_TEEN_PROFILE.accent} 85%, #000)` }}>
            {RS_TEEN_PROFILE.avatar}
          </span>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold" style={{ color: "var(--uc-text)" }}>
              {RS_TEEN_PROFILE.name}, {RS_TEEN_PROFILE.age}
            </span>
            <span className="text-[13px]" style={{ color: "var(--uc-text-muted)" }}>
              {RS_TEEN_PROFILE.city}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-[14px] p-3" style={{ background: "color-mix(in srgb, var(--uc-product-blue) 8%, transparent)" }}>
          <div className="flex items-center gap-2">
            <AppIcon name="hu-kids-learn" size={16} style={{ color: "var(--uc-product-blue-deep)" }} />
            <span className="text-[13px] font-semibold" style={{ color: "var(--uc-text)" }}>Uči napredak</span>
          </div>
          <span className="text-[14px] font-bold" style={{ color: "var(--uc-product-blue-deep)" }}>{learnPct}%</span>
        </div>
      </ListCard>

      {/* Parent link */}
      <ListCard className="!p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: `color-mix(in srgb, ${RS_TEEN_PROFILE.parentAccent} 85%, #000)` }}>
            {RS_TEEN_PROFILE.parentAvatar}
          </span>
          <div className="flex flex-1 flex-col">
            <span className="text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{RS_TEEN_PROFILE.parentName}</span>
            <span className="text-[12px]" style={{ color: "var(--uc-text-muted)" }}>Postavlja limite i odobrava plaćanja</span>
          </div>
          <AppIcon name="chevron-link" size={18} className="opacity-40" />
        </div>
      </ListCard>

      {/* Tasks */}
      <div>
        <SectionLabel>Zadaci</SectionLabel>
        <ListCard className="!p-0">
          {todoTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--uc-green-main) 14%, transparent)", color: "var(--uc-green-deep)" }}>
                <AppIcon name="check" size={24} />
              </span>
              <span className="text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>Svi zadaci su završeni.</span>
            </div>
          ) : (
            todoTasks.map((task) => (
              <TaskRow key={task.id} task={task} onMark={() => onMarkTask(task.id)} />
            ))
          )}
        </ListCard>
        {todoTasks.length > 0 && (
          <p className="mt-2 px-1 text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
            Možeš zaraditi {formatRsd(totalReward)} kad završiš sve — Tata potvrđuje.
          </p>
        )}
      </div>

      {/* Menu */}
      <SectionLabel>Više</SectionLabel>
      <ListCard className="!p-0">
        <MenuRow icon="shield-check" title="Odobrenja" badge={pendingCount} onClick={onOpenApprovals} accent="var(--uc-product-blue)" />
        <MenuRow icon="receipt-text" title="Uvid u troškove" onClick={onOpenInsights} accent="var(--uc-product-pink)" />
        <MenuRow icon="nav-analytics" title="Aktivnost" onClick={onOpenActivity} accent="var(--uc-product-mauve)" />
        <MenuRow icon="sliders-horizontal" title="Podešavanja kartice" onClick={onOpenCardSettings} accent="var(--uc-product-slate)" last />
      </ListCard>

      <button
        type="button"
        onClick={onOpenTheme}
        className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold"
        style={{ background: "var(--hu-theme-card-bg)", color: "var(--uc-text)" }}
      >
        <AppIcon name="palette" size={18} />
        Promeni temu
      </button>
    </div>
  );
}

function TaskRow({ task, onMark }: { task: RsTask; onMark: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--uc-green-main) 12%, transparent)", color: "var(--uc-green-deep)" }}>
        <AppIcon name={task.icon} size={17} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{task.title}</span>
        <span className="text-[12px]" style={{ color: "var(--uc-text-muted)" }}>{task.recurrence}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-bold" style={{ color: "var(--uc-green-deep)" }}>+{formatRsd(task.reward)}</span>
        <button type="button" onClick={onMark} className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90" style={{ background: "var(--uc-green-main)", color: "#fff" }}>
          <AppIcon name="check" size={16} />
        </button>
      </div>
    </div>
  );
}

function MenuRow({
  icon,
  title,
  badge,
  onClick,
  accent,
  last,
}: {
  icon: IconName;
  title: string;
  badge?: number;
  onClick: () => void;
  accent: string;
  last?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-black/5 ${last ? "" : "border-b border-[color-mix(in_srgb,var(--uc-border)_50%,transparent)]"}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}>
        <AppIcon name={icon} size={17} />
      </span>
      <span className="flex-1 text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{title}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: "var(--uc-red-main)" }}>
          {badge}
        </span>
      )}
      <AppIcon name="chevron-link" size={18} className="opacity-40" />
    </button>
  );
}
