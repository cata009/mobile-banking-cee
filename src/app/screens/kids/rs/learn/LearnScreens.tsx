/**
 * RS Teens "Uči" (Learn) screens — signature feature #2.
 *
 *  - LearnIndex    : grid of modules with progress + reward preview
 *  - LearnTopic    : a module's lessons with completion state
 *  - LearnLesson   : the lesson player — content blocks → quiz → reward credit
 *
 * Completing a lesson credits its reward to the balance and logs an approval,
 * closing the loop between learning and money (the RO app had no Learn leg).
 */
import { useState } from "react";
import { cn } from "@/app/components/ui/utils";
import { AppIcon } from "@/app/components/icons";
import { ListCard, ProgressBar, Banner, SectionLabel } from "../ui";
import {
  RS_LEARN_MODULES,
  getRsLearnModuleProgress,
  getRsLearnOverallProgress,
} from "./topics";
import { LearnArtTile, RS_LEARN_MODULE_ART } from "./artwork";
import { formatRsd } from "../money";
import type { RsLearnLesson, RsLearnLessonContentBlock, RsLearnModule, RsLearnProgress } from "../types";

/* ----------------------------------------------------------------------- */
/* Index — the bottom-nav "Uči" tab                                          */
/* ----------------------------------------------------------------------- */

export function RsLearnIndexScreen({
  progress,
  showAmounts,
  onOpenTopic,
}: {
  progress: RsLearnProgress;
  showAmounts: boolean;
  onOpenTopic: (moduleId: string) => void;
}) {
  const overall = getRsLearnOverallProgress(progress.completed);
  return (
    <div className="flex flex-col gap-4 px-[20px] pt-2">
      <Banner
        icon="hu-kids-learn"
        title="Uči i zaradi"
        body="Završi lekcije i osvoji male nagrade u RSD — novac se stvarno stavlja na tvoj račun."
        accent="var(--uc-product-blue)"
      />

      <ListCard className="!p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold uppercase" style={{ color: "var(--uc-text-muted)" }}>
              Ukupan napredak
            </span>
            <span className="text-[24px] font-bold" style={{ color: "var(--uc-text)" }}>{overall}%</span>
          </div>
          <AppIcon name="hu-kids-learn" size={28} style={{ color: "var(--uc-product-blue)" }} />
        </div>
        <div className="mt-3">
          <ProgressBar progress={overall} accent="var(--uc-product-blue)" />
        </div>
      </ListCard>

      <SectionLabel>Moduli</SectionLabel>
      <div className="flex flex-col gap-2">
        {RS_LEARN_MODULES.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            progress={getRsLearnModuleProgress(mod.id, progress.completed)}
            showAmounts={showAmounts}
            onClick={() => onOpenTopic(mod.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({
  module,
  progress,
  showAmounts,
  onClick,
}: {
  module: RsLearnModule;
  progress: { done: number; total: number; pct: number };
  showAmounts: boolean;
  onClick: () => void;
}) {
  const totalReward = module.lessons.reduce((s, l) => s + l.reward, 0);
  return (
    <ListCard onClick={onClick} className="!p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `color-mix(in srgb, ${module.accent} 16%, transparent)`, color: module.accent }}
        >
          <AppIcon name={module.icon} size={24} />
        </span>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>{module.title}</span>
          <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>{module.subtitle}</span>
          <LearnArtTile moduleId={module.id} alt={`Ilustracija: ${module.title}`} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[13px] font-bold" style={{ color: "var(--uc-text)" }}>{progress.done}/{progress.total}</span>
          {progress.pct === 100 && (
            <span className="text-[10px] font-bold" style={{ color: "var(--uc-green-deep)" }}>ZAVRŠENO</span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar progress={progress.pct} accent={module.accent} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px]" style={{ color: "var(--uc-text-muted)" }}>
        <span>{progress.pct}% završeno</span>
        <span>{showAmounts ? `nagrada ${formatRsd(totalReward)}` : "nagrada ••••"}</span>
      </div>
    </ListCard>
  );
}

/* ----------------------------------------------------------------------- */
/* Topic — a module's lessons                                                */
/* ----------------------------------------------------------------------- */

export function RsLearnTopicScreen({
  moduleId,
  progress,
  onBack,
  onOpenLesson,
}: {
  moduleId: string;
  progress: RsLearnProgress;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
}) {
  const mod = RS_LEARN_MODULES.find((m) => m.id === moduleId);
  if (!mod) {
    return (
      <div className="flex h-full flex-col">
        <BackHeader title="Uči" onBack={onBack} />
        <div className="flex flex-1 items-center justify-center">
          <p style={{ color: "var(--uc-text-muted)" }}>Modul ne postoji.</p>
        </div>
      </div>
    );
  }
  const prog = getRsLearnModuleProgress(mod.id, progress.completed);
  return (
    <div className="flex h-full flex-col">
      <BackHeader title={mod.title} onBack={onBack} />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[40px]">
        {/* Module hero with real artwork */}
        <div
          className="relative mt-2 flex items-center gap-3 overflow-hidden rounded-[24px] p-4"
          style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${mod.accent} 22%, var(--hu-theme-card-bg)), var(--hu-theme-card-bg))` }}
        >
          <div className="relative z-[1] flex flex-1 flex-col">
            <span className="text-[18px] font-bold" style={{ color: "var(--uc-text)" }}>{mod.title}</span>
            <span className="text-[13px]" style={{ color: "var(--uc-text-muted)" }}>{mod.subtitle}</span>
            <span className="mt-2 text-[12px] font-semibold" style={{ color: mod.accent }}>
              {prog.done}/{prog.total} lekcija · {prog.pct}%
            </span>
          </div>
          {RS_LEARN_MODULE_ART[mod.id] && (
            <img
              src={RS_LEARN_MODULE_ART[mod.id]}
              alt={`Ilustracija: ${mod.title}`}
              className="pointer-events-none relative z-[1] h-[96px] w-[104px] flex-shrink-0 object-contain"
              style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))" }}
            />
          )}
        </div>
        <div className="mb-3 mt-3">
          <ProgressBar progress={prog.pct} accent={mod.accent} />
        </div>

        <SectionLabel className="!px-0">Lekcije</SectionLabel>
        <div className="flex flex-col gap-2">
          {mod.lessons.map((lesson, i) => {
            const done = !!progress.completed[lesson.id];
            return (
              <ListCard key={lesson.id} onClick={() => onOpenLesson(lesson.id)} className="!p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[14px] font-bold")}
                    style={{
                      background: done ? "color-mix(in srgb, var(--uc-green-main) 16%, transparent)" : `color-mix(in srgb, ${mod.accent} 12%, transparent)`,
                      color: done ? "var(--uc-green-deep)" : mod.accent,
                    }}
                  >
                    {done ? <AppIcon name="check" size={18} /> : i + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14px] font-semibold" style={{ color: "var(--uc-text)" }}>{lesson.title}</span>
                    <span className="truncate text-[12px]" style={{ color: "var(--uc-text-muted)" }}>{lesson.summary}</span>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: "var(--uc-green-deep)" }}>+{formatRsd(lesson.reward)}</span>
                </div>
              </ListCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Lesson player — content → quiz → reward                                  */
/* ----------------------------------------------------------------------- */

export function RsLearnLessonScreen({
  moduleId,
  lessonId,
  onBack,
  onComplete,
}: {
  moduleId: string;
  lessonId: string;
  onBack: () => void;
  onComplete: (lesson: RsLearnLesson) => void;
}) {
  const mod = RS_LEARN_MODULES.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  if (!mod || !lesson) {
    return (
      <div className="flex h-full flex-col">
        <BackHeader title="Uči" onBack={onBack} />
        <div className="flex flex-1 items-center justify-center">
          <p style={{ color: "var(--uc-text-muted)" }}>Lekcija ne postoji.</p>
        </div>
      </div>
    );
  }
  const answered = selectedOption !== null;
  const correctOption = lesson.quiz.options.find((o) => o.correct);
  const isCorrect = answered && selectedOption === correctOption?.id;

  return (
    <div className="flex h-full flex-col">
      <BackHeader title={lesson.title} onBack={onBack} />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-[20px] pb-[120px]">
        <div className="flex items-center gap-2 py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `color-mix(in srgb, ${mod.accent} 16%, transparent)`, color: mod.accent }}>
            <AppIcon name={mod.icon} size={20} />
          </span>
          <span className="text-[13px] font-semibold" style={{ color: "var(--uc-text-muted)" }}>{mod.title}</span>
        </div>

        {/* Content blocks */}
        <div className="mt-2 flex flex-col gap-3">
          {lesson.content.map((block, i) => (
            <ContentBlockView key={i} block={block} accent={mod.accent} />
          ))}
        </div>

        {/* Quiz */}
        <SectionLabel className="!px-0">Proveri znanje</SectionLabel>
        <div className="rounded-[18px] p-4" style={{ background: "var(--hu-theme-card-bg)" }}>
          <p className="mb-3 text-[15px] font-semibold" style={{ color: "var(--uc-text)" }}>{lesson.quiz.question}</p>
          <div className="flex flex-col gap-2">
            {lesson.quiz.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const showState = answered;
              const optCorrect = showState && opt.correct;
              const optWrong = showState && isSelected && !opt.correct;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={answered}
                  onClick={() => setSelectedOption(opt.id)}
                  className="flex items-center justify-between rounded-[12px] border px-4 py-3 text-left text-[14px] font-medium transition active:scale-[0.99] disabled:active:scale-100"
                  style={{
                    borderColor: optCorrect
                      ? "var(--uc-green-main)"
                      : optWrong
                        ? "var(--uc-red-main)"
                        : isSelected
                          ? mod.accent
                          : "color-mix(in srgb, var(--uc-border) 60%, transparent)",
                    background: optCorrect
                      ? "color-mix(in srgb, var(--uc-green-main) 10%, transparent)"
                      : optWrong
                        ? "color-mix(in srgb, var(--uc-red-main) 10%, transparent)"
                        : "transparent",
                    color: "var(--uc-text)",
                  }}
                >
                  <span>{opt.text}</span>
                  {optCorrect && <AppIcon name="check" size={18} style={{ color: "var(--uc-green-deep)" }} />}
                  {optWrong && <AppIcon name="close-x" size={18} style={{ color: "var(--uc-red-deep)" }} />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-3 rounded-[12px] p-3" style={{ background: isCorrect ? "color-mix(in srgb, var(--uc-green-main) 10%, transparent)" : "color-mix(in srgb, var(--uc-product-blue) 10%, transparent)" }}>
              <div className="flex items-center gap-2">
                <AppIcon name={isCorrect ? "check" : "info-circle"} size={16} style={{ color: isCorrect ? "var(--uc-green-deep)" : "var(--uc-product-blue-deep)" }} />
                <span className="text-[13px] font-bold" style={{ color: isCorrect ? "var(--uc-green-deep)" : "var(--uc-product-blue-deep)" }}>
                  {isCorrect ? "Tačno!" : "Skoro — vidi objašnjenje"}
                </span>
              </div>
              <p className="mt-1 text-[13px]" style={{ color: "var(--uc-text-muted)" }}>{lesson.quiz.explanation}</p>
            </div>
          )}
        </div>

        {answered && (
          <button
            type="button"
            onClick={() => onComplete(lesson)}
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-bold text-white transition active:scale-[0.98]"
            style={{ background: "linear-gradient(145deg, var(--uc-green-main), var(--uc-green-deep))" }}
          >
            <AppIcon name="add-money" size={20} />
            Pokupi nagradu +{formatRsd(lesson.reward)}
          </button>
        )}
      </div>
    </div>
  );
}

function ContentBlockView({ block, accent }: { block: RsLearnLessonContentBlock; accent: string }) {
  if (block.kind === "tip") {
    return (
      <div className="flex gap-3 rounded-[14px] p-3" style={{ background: `color-mix(in srgb, ${accent} 10%, var(--hu-theme-card-bg))` }}>
        <AppIcon name="info-circle" size={18} style={{ color: accent }} className="mt-0.5 flex-shrink-0" />
        <span className="text-[14px] leading-snug" style={{ color: "var(--uc-text)" }}>{block.text}</span>
      </div>
    );
  }
  if (block.kind === "example") {
    return (
      <div className="flex gap-3 rounded-[14px] border p-3" style={{ borderColor: "color-mix(in srgb, var(--uc-green-main) 30%, transparent)", background: "color-mix(in srgb, var(--uc-green-main) 6%, transparent)" }}>
        <AppIcon name="circle-dollar-sign" size={18} style={{ color: "var(--uc-green-deep)" }} className="mt-0.5 flex-shrink-0" />
        <span className="text-[14px] leading-snug" style={{ color: "var(--uc-text)" }}>{block.text}</span>
      </div>
    );
  }
  return <p className="text-[15px] leading-relaxed" style={{ color: "var(--uc-text)" }}>{block.text}</p>;
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-[54px] flex-shrink-0 items-center gap-2 px-[16px]">
      <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5" aria-label="Nazad">
        <AppIcon name="chevron-left" size={22} />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-[18px] font-bold" style={{ color: "var(--uc-text)" }}>{title}</h1>
    </div>
  );
}
