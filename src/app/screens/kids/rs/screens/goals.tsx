/**
 * RS Teens Goals — list / detail / create. Goals carry a real AppIcon (not an
 * emoji), a progress bar, an auto-save helper, and contribution history.
 */
import { useState } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { ListCard, ProgressBar, Banner, SectionLabel } from "../ui";
import { formatRsd, formatRsdFull, toProgress } from "../money";
import type { RsGoal, RsGoalContribution } from "../types";

const ADD_CHIPS = [200, 500, 1000];

export function RsGoalsScreen({
  goals,
  showAmounts,
  onCreateGoal,
  onSelectGoal,
}: {
  goals: RsGoal[];
  showAmounts: boolean;
  onCreateGoal: () => void;
  onSelectGoal: (id: string) => void;
}) {
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="flex flex-col gap-4 px-[20px] pt-2">
      <ListCard className="!p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>
              Ušteđevina ukupno
            </span>
            <span className="text-[24px] font-bold" style={{ color: "var(--uc-text)" }}>
              {showAmounts ? formatRsdFull(totalSaved) : "•••• RSD"}
            </span>
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "var(--uc-text-muted)" }}>
            {toProgress(totalSaved, totalTarget)}% od {formatRsd(totalTarget)}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar progress={toProgress(totalSaved, totalTarget)} accent="var(--hu-theme-accent-strong)" />
        </div>
      </ListCard>

      <button
        type="button"
        onClick={onCreateGoal}
        className="flex h-[52px] items-center justify-center gap-2 rounded-2xl text-[15px] font-bold text-white transition active:scale-[0.98]"
        style={{ background: "linear-gradient(145deg, var(--hu-theme-accent-strong), var(--hu-theme-accent))" }}
      >
        <AppIcon name="add-circle" size={20} />
        Novi cilj
      </button>

      <SectionLabel>Tvoji ciljevi</SectionLabel>
      <div className="flex flex-col gap-2">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} showAmounts={showAmounts} onClick={() => onSelectGoal(goal.id)} />
        ))}
      </div>
    </div>
  );
}

function GoalCard({
  goal,
  showAmounts,
  onClick,
}: {
  goal: RsGoal;
  showAmounts: boolean;
  onClick: () => void;
}) {
  const progress = toProgress(goal.savedAmount, goal.targetAmount);
  const done = goal.savedAmount >= goal.targetAmount;
  return (
    <ListCard onClick={onClick} className="!p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: `color-mix(in srgb, ${goal.accent} 16%, transparent)`, color: goal.accent }}
        >
          <AppIcon name={goal.icon} size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>
            {goal.title}
          </span>
          <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>
            {goal.helper}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-bold" style={{ color: "var(--uc-text)" }}>
            {showAmounts ? `${Math.round((goal.savedAmount / goal.targetAmount) * 100)}%` : "•••"}
          </span>
          {done && (
            <span className="text-[10px] font-bold" style={{ color: "var(--uc-green-deep)" }}>
              OSTVARENO
            </span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar progress={progress} accent={goal.accent} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px]" style={{ color: "var(--uc-text-muted)" }}>
        <span>{showAmounts ? formatRsd(goal.savedAmount) : "••••"}</span>
        <span>{formatRsd(goal.targetAmount)}</span>
      </div>
    </ListCard>
  );
}

/* ----------------------------------------------------------------------- */
/* Detail                                                                    */
/* ----------------------------------------------------------------------- */

export function RsGoalDetailScreen({
  goal,
  contributions,
  showAmounts,
  onBack,
  onAddMoney,
  onAskParent,
  onComplete,
}: {
  goal: RsGoal | null;
  contributions: RsGoalContribution[];
  showAmounts: boolean;
  onBack: () => void;
  onAddMoney: (amount: number) => void;
  onAskParent: () => void;
  onComplete: () => void;
}) {
  if (!goal) {
    return (
      <EmptyDetail onBack={onBack} />
    );
  }
  const progress = toProgress(goal.savedAmount, goal.targetAmount);
  const done = goal.savedAmount >= goal.targetAmount;
  return (
    <div className="flex h-full flex-col">
      <Header title={goal.title} onBack={onBack} />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[120px]">
        <div
          className="flex flex-col items-center gap-2 rounded-[24px] py-7"
          style={{ background: `linear-gradient(160deg, ${goal.accent}, color-mix(in srgb, ${goal.accent} 50%, var(--hu-theme-card-bg)))`, color: "#fff" }}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <AppIcon name={goal.icon} size={32} />
          </span>
          <span className="text-[13px] font-semibold uppercase tracking-wide opacity-90">
            {progress}% ostvareno
          </span>
          <span className="text-[28px] font-bold">
            {showAmounts ? formatRsdFull(goal.savedAmount) : "•••• RSD"}
          </span>
          <span className="text-[13px] opacity-90">od {formatRsd(goal.targetAmount)}</span>
        </div>

        <div className="mt-4">
          <ProgressBar progress={progress} accent={goal.accent} height={8} />
        </div>

        <SectionLabel className="!px-0">Dodaj novac</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {ADD_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onAddMoney(c)}
              disabled={done}
              className="rounded-full border px-4 py-2 text-[13px] font-semibold transition active:scale-95 disabled:opacity-40"
              style={{ borderColor: "color-mix(in srgb, var(--uc-product-blue) 35%, transparent)", color: "var(--uc-product-blue-deep)" }}
            >
              {formatRsd(c)}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onAskParent}
            className="flex-1 rounded-2xl border py-3 text-[14px] font-semibold"
            style={{ borderColor: "color-mix(in srgb, var(--uc-text-muted) 30%, transparent)", color: "var(--uc-text)" }}
          >
            Traži od Tate
          </button>
          {!done ? (
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 rounded-2xl py-3 text-[14px] font-bold text-white"
              style={{ background: "var(--uc-green-main)" }}
            >
              Ostvari cilj
            </button>
          ) : (
            <div className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-3 text-[14px] font-bold" style={{ background: "color-mix(in srgb, var(--uc-green-main) 16%, transparent)", color: "var(--uc-green-deep)" }}>
              <AppIcon name="trophy" size={18} /> Ostvareno
            </div>
          )}
        </div>

        <SectionLabel className="!px-0">Istorija</SectionLabel>
        {contributions.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--uc-text-muted)" }}>
            Još uvek bez doprinosa.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {contributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-[12px] p-3" style={{ background: "var(--hu-theme-card-bg)" }}>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{c.title}</span>
                  <span className="text-[12px]" style={{ color: "var(--uc-text-muted)" }}>{c.subtitle}</span>
                </div>
                <span className="text-[14px] font-bold" style={{ color: "var(--uc-green-deep)" }}>+{formatRsd(c.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Create                                                                    */
/* ----------------------------------------------------------------------- */

const CREATE_OPTIONS: { icon: IconName; title: string; accent: string }[] = [
  { icon: "wallet-cards", title: "Telefon", accent: "var(--uc-product-blue)" },
  { icon: "trophy", title: "Dogadjaj", accent: "var(--uc-product-pink)" },
  { icon: "bike", title: "Bicikl", accent: "var(--uc-green-main)" },
  { icon: "gift", title: "Poklon", accent: "var(--uc-product-mauve)" },
  { icon: "book-open", title: "Knjige", accent: "var(--uc-product-blue-deep)" },
  { icon: "piggy-bank", title: "Fond", accent: "var(--uc-product-slate)" },
  { icon: "camera", title: "Kamera", accent: "var(--uc-product-pink)" },
  { icon: "shopping-bag", title: "Kupovina", accent: "var(--uc-product-brown)" },
];

export function RsCreateGoalScreen({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (title: string, target: number, icon: IconName, accent: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [targetText, setTargetText] = useState("");
  const [picked, setPicked] = useState(0);
  const target = Number.parseFloat(targetText) || 0;
  const canCreate = title.trim().length > 0 && target > 0;
  const pickedOption = CREATE_OPTIONS[picked] ?? CREATE_OPTIONS[0]!;

  return (
    <div className="flex h-full flex-col">
      <Header title="Novi cilj" onBack={onBack} />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[120px]">
        <Banner icon="trophy" title="Postavi konkretan cilj" body="Iznos + rok = ostvariv cilj. Izaberi ikonicu, daj ime, postavi iznos." />
        <SectionLabel className="!px-0">Ime cilja</SectionLabel>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="npr. Exit karta"
          className="w-full rounded-2xl p-4 text-[15px] outline-none"
          style={{ background: "var(--hu-theme-card-bg)", color: "var(--uc-text)" }}
        />
        <SectionLabel className="!px-0">Ciljni iznos (RSD)</SectionLabel>
        <input
          inputMode="decimal"
          value={targetText}
          onChange={(e) => setTargetText(e.target.value.replace(/[^\d.]/g, ""))}
          placeholder="9000"
          className="w-full rounded-2xl p-4 text-[15px] outline-none"
          style={{ background: "var(--hu-theme-card-bg)", color: "var(--uc-text)" }}
        />
        <SectionLabel className="!px-0">Ikonica</SectionLabel>
        <div className="grid grid-cols-4 gap-3">
          {CREATE_OPTIONS.map((opt, i) => (
            <button
              key={opt.title}
              type="button"
              onClick={() => setPicked(i)}
              className="flex flex-col items-center gap-1.5 rounded-[16px] p-3 transition active:scale-95"
              style={{
                background: picked === i ? `color-mix(in srgb, ${opt.accent} 18%, var(--hu-theme-card-bg))` : "var(--hu-theme-card-bg)",
                border: picked === i ? `2px solid ${opt.accent}` : "2px solid transparent",
              }}
            >
              <span style={{ color: opt.accent }}>
                <AppIcon name={opt.icon} size={24} />
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--uc-text)" }}>{opt.title}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!canCreate}
          onClick={() => onCreate(title.trim(), target, pickedOption.icon, pickedOption.accent)}
          className="mt-6 h-[52px] w-full rounded-2xl text-[16px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
          style={{ background: "linear-gradient(145deg, var(--hu-theme-accent-strong), var(--hu-theme-accent))" }}
        >
          Napravi cilj
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* shared bits                                                               */
/* ----------------------------------------------------------------------- */

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
      <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
        <AppIcon name="chevron-left" size={22} />
      </button>
      <h1 className="text-[18px] font-bold" style={{ color: "var(--uc-text)" }}>{title}</h1>
    </div>
  );
}

function EmptyDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-[40px] text-center">
      <p className="text-[15px]" style={{ color: "var(--uc-text-muted)" }}>
        Cilj više ne postoji.
      </p>
      <button type="button" onClick={onBack} className="rounded-2xl bg-[var(--uc-product-blue)] px-6 py-3 text-[14px] font-bold text-white">
        Nazad
      </button>
    </div>
  );
}
