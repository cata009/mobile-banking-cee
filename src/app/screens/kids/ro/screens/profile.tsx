/**
 * RO Teens Profile surface: identity, the parent-supervision link, the
 * chores→reward loop, and shortcuts into approvals / insights / limits / themes.
 */
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { formatRon } from "../money";
import { RO_TEEN_PROFILE } from "../data";
import { RoCard } from "../ui";
import type { RoTask } from "../types";

type MenuLink = { id: string; label: string; caption: string; icon: IconName; badge?: number; onClick: () => void };

export function RoProfileScreen({
  tasks,
  pendingCount,
  onMarkTask,
  onOpenApprovals,
  onOpenInsights,
  onOpenCardSettings,
  onOpenTheme,
}: {
  tasks: RoTask[];
  pendingCount: number;
  onMarkTask: (taskId: string) => void;
  onOpenApprovals: () => void;
  onOpenInsights: () => void;
  onOpenCardSettings: () => void;
  onOpenTheme: () => void;
}) {
  const openTasks = tasks.filter((task) => task.status === "todo");
  const earnable = tasks
    .filter((task) => task.status !== "approved")
    .reduce((sum, task) => sum + task.reward, 0);

  const links: MenuLink[] = [
    { id: "approvals", label: "Cereri & aprobări", caption: "Ce așteaptă la Mama", icon: "shield-check", badge: pendingCount, onClick: onOpenApprovals },
    { id: "insights", label: "Unde se duc banii", caption: "Cheltuieli pe categorii", icon: "receipt-text", onClick: onOpenInsights },
    { id: "limits", label: "Limite & control card", caption: "Plafoane și plăți", icon: "sliders-horizontal", onClick: onOpenCardSettings },
    { id: "theme", label: "Personalizează", caption: "Teme și aspect", icon: "palette", onClick: onOpenTheme },
  ];

  return (
    <main className="mt-[8px] px-[20px] pb-[8px]">
      {/* Identity */}
      <RoCard className="flex items-center gap-[14px]">
        <ProfileAvatar initials={RO_TEEN_PROFILE.initials} size={56} variant="initials" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">
            {RO_TEEN_PROFILE.fullName}
          </p>
          <p className="truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
            {RO_TEEN_PROFILE.age} ani · {RO_TEEN_PROFILE.city}
          </p>
        </div>
      </RoCard>

      {/* Parent link */}
      <RoCard className="mt-[12px] flex items-center gap-[13px]">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-product-pink)_16%,var(--uc-surface))] text-[var(--uc-product-pink)]">
          <AppIcon name="shield-check" size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">
            Cont supravegheat de {RO_TEEN_PROFILE.parentName}
          </p>
          <p className="mt-[2px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
            {RO_TEEN_PROFILE.parentFullName} aprobă plățile mari și cererile tale.
          </p>
        </div>
      </RoCard>

      {/* Chores → reward loop */}
      <section className="mt-[22px]">
        <div className="mb-[10px] flex items-center justify-between">
          <h2 className="text-[17px] font-bold leading-[21px] text-[var(--hu-theme-hero-fg)]">Sarcini & recompense</h2>
          <span className="text-[13px] font-bold text-[var(--hu-theme-accent-strong)]">
            {formatRon(earnable)} disponibili
          </span>
        </div>
        <RoCard padded={false} className="px-[16px]">
          {openTasks.length === 0 ? (
            <p className="py-[16px] text-center text-[14px] text-[var(--uc-text-muted)]">
              Toate sarcinile sunt bifate. 💪
            </p>
          ) : (
            openTasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-[12px] py-[12px]",
                  index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined,
                )}
              >
                <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
                  <AppIcon name={task.icon} size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">{task.title}</p>
                  <p className="truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
                    {task.recurrence} · {formatRon(task.reward)}
                  </p>
                </div>
                <button
                  type="button"
                  className="h-[36px] shrink-0 rounded-full bg-[var(--hu-theme-accent-strong)] px-[14px] text-[13px] font-bold text-[var(--uc-text-inverse)] active:scale-95"
                  onClick={() => onMarkTask(task.id)}
                >
                  Gata
                </button>
              </div>
            ))
          )}
        </RoCard>
      </section>

      {/* Menu */}
      <section className="mt-[22px]">
        <RoCard padded={false} className="px-[16px]">
          {links.map((link, index) => (
            <button
              key={link.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-[13px] py-[14px] text-left transition active:opacity-70",
                index > 0 ? "border-t border-[var(--uc-border-muted)]" : undefined,
              )}
              onClick={link.onClick}
            >
              <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
                <AppIcon name={link.icon} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold leading-[19px] text-[var(--uc-text)]">
                  {link.label}
                </span>
                <span className="block truncate text-[13px] leading-[17px] text-[var(--uc-text-muted)]">
                  {link.caption}
                </span>
              </span>
              {link.badge && link.badge > 0 ? (
                <span className="grid min-h-[20px] min-w-[20px] place-items-center rounded-full bg-[var(--uc-red-main)] px-[6px] text-[11px] font-bold text-[var(--uc-static-white)]">
                  {link.badge}
                </span>
              ) : (
                <AppIcon name="arrow-right" size={18} />
              )}
            </button>
          ))}
        </RoCard>
      </section>
    </main>
  );
}
