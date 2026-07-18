/**
 * HU Kids Learn surfaces: the Learn index, topic cards, topic detail, and the
 * slide-and-quiz lesson player.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import { useEffect, useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import { AppIcon } from "@/app/components/icons";
import LinkButton from "@/app/components/ui/LinkButton";
import { cn } from "@/app/components/ui/utils";
import { HuKidsPiMenuFrame } from "./chrome";
import { HuKidsGoalPageHeader } from "./goals";
import {
  HU_LEARN_ART_SLOT_CLASS,
  HU_LEARN_CARD_SURFACE_STYLE,
  getHuLearnCompletedLessonsCount,
  getHuLearnLessonImageSrc,
  getHuLearnTopicImageSrc,
  getHuLearnTopicProgress,
} from "./learnArtwork";
import type { HuThemePreset } from "./theme";
import type {
  HuLearnArtVariant,
  HuLearnLesson,
  HuLearnTopic,
  HuLearnVisual,
} from "./types";

export function HuKidsLearnPage({
  completedLessonIds,
  onBack,
  onMessages,
  onSelectTopic,
  theme,
  topics,
}: {
  completedLessonIds: string[];
  onBack?: () => void;
  onMessages?: () => void;
  onSelectTopic: (topicId: string) => void;
  theme: HuThemePreset;
  topics: HuLearnTopic[];
}) {
  const suggestedTopic = topics.find((topic) => topic.id === "saving-goals") ?? topics[0];
  const [collapsedTitleProgress, setCollapsedTitleProgress] = useState(0);
  const headerVariant = theme.id === "nordlys" || theme.id === "blue-lines" ? "dark" : "gray";

  return (
    <HuKidsPiMenuFrame
      bottomPadding={80}
      header={onBack ? (
        <PageHeader
          collapsedTitleProgress={collapsedTitleProgress}
          onBack={onBack}
          showHelp={false}
          title="Learn"
          variant={headerVariant}
        />
      ) : undefined}
      onMessages={onMessages}
      onScroll={(event) => {
        setCollapsedTitleProgress(Math.min(event.currentTarget.scrollTop / 64, 1));
      }}
      theme={theme}
      title="Learn"
    >
      <section className="px-[16px] pt-[16px]">
        <div>
          <p className="px-[2px] text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">New</p>
          <HuLearnTopicCard
            className="mt-[10px]"
            completedLessonIds={completedLessonIds}
            featured
            onClick={() => onSelectTopic(suggestedTopic?.id ?? "")}
            topic={suggestedTopic}
          />
        </div>

        <section className="mt-[22px]">
          <div className="px-[2px]">
            <p className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">All topics</p>
          </div>
          <div className="mt-[10px] grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
            {topics
              .filter((topic) => topic.id !== suggestedTopic?.id)
              .map((topic) => (
                <HuLearnTopicCard
                  key={topic.id}
                  completedLessonIds={completedLessonIds}
                  onClick={() => onSelectTopic(topic.id)}
                  topic={topic}
                />
              ))}
          </div>
        </section>
      </section>
    </HuKidsPiMenuFrame>
  );
}

export function HuLearnEducationCard({
  completedLessonIds,
  onOpenLearn,
  onSelectTopic,
  topics,
  totalTopics,
}: {
  completedLessonIds: string[];
  onOpenLearn?: () => void;
  onSelectTopic: (topicId: string) => void;
  topics: HuLearnTopic[];
  totalTopics: number;
}) {
  return (
    <section
      className="rounded-[16px] border border-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] bg-[var(--uc-surface)] px-[16px] pb-[14px] pt-[16px] shadow-sm"
      data-hu-learn-education-card
    >
      <div>
        <button
          className="block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
          onClick={onOpenLearn}
          type="button"
        >
          <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">Education</h2>
        </button>
        <p className="mt-[3px] text-[14px] font-normal leading-[18px] tracking-[0] text-[var(--uc-text-muted)]">
          Money lessons for safer spending and saving.
        </p>
      </div>

      <div className="mt-[20px] flex flex-col">
        {topics.map((topic, index) => (
          <HuLearnEducationRow
            key={topic.id}
            completedLessonIds={completedLessonIds}
            onClick={() => onSelectTopic(topic.id)}
            showDivider={index < topics.length - 1}
            topic={topic}
          />
        ))}
      </div>

      {totalTopics > 2 ? (
        <LinkButton
          className="mx-auto mt-[16px] h-[24px] text-[var(--hu-theme-accent-strong)]"
          iconSize={24}
          onClick={onOpenLearn}
        >
          SHOW MORE
        </LinkButton>
      ) : null}
    </section>
  );
}

function HuLearnEducationRow({
  completedLessonIds,
  onClick,
  showDivider,
  topic,
}: {
  completedLessonIds: string[];
  onClick: () => void;
  showDivider: boolean;
  topic: HuLearnTopic;
}) {
  const imageSrc = getHuLearnTopicImageSrc(topic);
  const progress = getHuLearnTopicProgress(topic, completedLessonIds);

  return (
    <button
      className={cn(
        "flex min-h-[100px] w-full items-center gap-[8px] py-[12px] text-left transition-opacity hover:opacity-90",
        showDivider ? "border-b border-[color-mix(in_srgb,var(--uc-text)_12%,transparent)]" : "",
      )}
      data-hu-learn-education-row={topic.id}
      onClick={onClick}
      type="button"
    >
      <span className="relative grid size-[80px] shrink-0 place-items-center overflow-hidden rounded-[12px] bg-[color-mix(in_srgb,var(--uc-static-white)_56%,var(--hu-theme-accent)_8%)]">
        {imageSrc ? (
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
            draggable={false}
            src={imageSrc}
          />
        ) : (
          <AppIcon name="hu-kids-learn" size={28} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold leading-[19px] tracking-[0] text-[var(--uc-text)]">
          {topic.title}
        </span>
        <span className="mt-[5px] line-clamp-2 block text-[13px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
          {topic.subtitle}
        </span>
        <span className="mt-[8px] block h-[6px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--uc-text)_12%,transparent)]">
          <span className="block h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
        </span>
      </span>
    </button>
  );
}

function HuLearnTopicCard({
  className,
  completedLessonIds,
  featured = false,
  onClick,
  topic,
}: {
  className?: string;
  completedLessonIds: string[];
  featured?: boolean;
  onClick: () => void;
  topic?: HuLearnTopic;
}) {
  if (!topic) {
    return null;
  }

  const progress = getHuLearnTopicProgress(topic, completedLessonIds);
  const completedCount = getHuLearnCompletedLessonsCount(topic, completedLessonIds);
  const imageSrc = getHuLearnTopicImageSrc(topic);

  return (
    <button
      className={cn(
        "group relative flex w-full items-end overflow-hidden rounded-[8px] border p-[14px] pb-[24px] text-left transition-opacity hover:opacity-90",
        featured ? "min-h-[208px] pt-[124px]" : "min-h-[184px] pt-[104px]",
        className,
      )}
      data-hu-learn-topic-card={topic.id}
      onClick={onClick}
      style={HU_LEARN_CARD_SURFACE_STYLE}
      type="button"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--hu-learn-card-glow)" }} />
      <HuLearnTopicArt imageSrc={imageSrc} variant={featured ? "topic-featured" : "topic-card"} visual={topic.visual} />

      <div className="relative z-[1] w-full">
        <p className={cn("font-bold tracking-[0] text-[var(--uc-text)]", featured ? "text-[22px] leading-[26px]" : "text-[17px] leading-[20px]")}>
          {topic.title}
        </p>
        <p className={cn("mt-[5px] font-normal tracking-[0] text-[var(--uc-text-muted)]", featured ? "text-[14px] leading-[18px]" : "text-[12px] leading-[15px]")}>
          {topic.subtitle}
        </p>
        <p className="mt-[7px] text-[11px] font-bold leading-[13px] tracking-[0] text-[var(--hu-theme-accent-strong)]">
          {completedCount}/{topic.lessons.length} lessons
        </p>
      </div>

      <div className="absolute inset-x-[14px] bottom-[11px] h-[5px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--uc-text)_12%,transparent)]">
        <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}

export function HuKidsLearnTopicPage({
  completedLessonIds,
  onBack,
  onOpenLesson,
  theme,
  topic,
}: {
  completedLessonIds: string[];
  onBack: () => void;
  onOpenLesson: (topicId: string, lessonId: string) => void;
  theme: HuThemePreset;
  topic: HuLearnTopic | null;
}) {
  if (!topic) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Learn" />
      </div>
    );
  }

  const progress = getHuLearnTopicProgress(topic, completedLessonIds);
  const imageSrc = getHuLearnTopicImageSrc(topic);

  return (
    <div className="relative z-[1] flex min-h-0 flex-1 flex-col" data-hu-learn-topic={topic.id}>
      <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Learn" />
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[38px]">
        <section className="relative overflow-hidden px-[24px] pb-[8px] pt-[18px]">
          <HuLearnTopicArt imageSrc={imageSrc} variant="topic-hero" visual={topic.visual} />
          <div className="relative z-[1] max-w-[295px] pt-[138px]">
            <h1 className="text-[34px] font-bold leading-[38px] tracking-[0] text-[var(--hu-theme-hero-fg)]">
              {topic.title}
            </h1>
            <p className="mt-[10px] text-[15px] font-normal leading-[20px] tracking-[0] text-[var(--hu-theme-hero-muted)]">
              {topic.helper}
            </p>
          </div>
          <div className="relative z-[1] mt-[14px] h-[6px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--hu-theme-hero-fg)_20%,transparent)]">
            <div className="h-full rounded-full bg-[var(--hu-theme-accent-strong)]" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="px-[24px] pt-[14px]">
          <div className="flex flex-col gap-[10px]">
            {topic.lessons.map((lesson, index) => (
              <HuLearnLessonListCard
                key={lesson.id}
                completed={completedLessonIds.includes(lesson.id)}
                index={index}
                lesson={lesson}
                onClick={() => onOpenLesson(topic.id, lesson.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function HuLearnLessonListCard({
  completed,
  index,
  lesson,
  onClick,
}: {
  completed: boolean;
  index: number;
  lesson: HuLearnLesson;
  onClick: () => void;
}) {
  const imageSrc = getHuLearnLessonImageSrc(lesson);

  return (
    <button
      className="relative min-h-[104px] overflow-hidden rounded-[18px] border p-[16px] text-left transition-transform active:scale-[0.99]"
      data-hu-learn-lesson-card={lesson.id}
      onClick={onClick}
      style={HU_LEARN_CARD_SURFACE_STYLE}
      type="button"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "var(--hu-learn-card-glow)" }} />
      <HuLearnTopicArt imageSrc={imageSrc} variant="lesson-row" visual={lesson.visual} />
      <div className="relative z-[1] pr-[112px]">
        <p className="text-[14px] font-normal leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">Lesson {index + 1}</p>
        <h2 className="mt-[5px] text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{lesson.title}</h2>
        <p className="mt-[9px] flex items-center gap-[7px] text-[14px] font-bold leading-[16px] tracking-[0] text-[var(--uc-text-muted)]">
          {completed ? (
            <>
              <AppIcon name="prime-check" size={15} color="var(--hu-theme-accent-strong)" />
              Completed
            </>
          ) : (
            "Ready to start"
          )}
        </p>
      </div>
    </button>
  );
}

export function HuKidsLearnLessonPage({
  completed,
  lesson,
  onBack,
  onComplete,
  theme,
  topic,
}: {
  completed: boolean;
  lesson: HuLearnLesson | null;
  onBack: () => void;
  onComplete: () => void;
  theme: HuThemePreset;
  topic: HuLearnTopic | null;
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    setCurrentSlideIndex(0);
    if (completed && lesson?.quiz) {
      const initial: Record<number, number> = {};
      lesson.quiz.forEach((q, idx) => {
        initial[idx] = q.correctIndex;
      });
      setSelectedAnswers(initial);
    } else {
      setSelectedAnswers({});
    }
  }, [lesson, completed]);

  if (!topic || !lesson) {
    return (
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
        <HuKidsGoalPageHeader onBack={onBack} theme={theme} title="Lesson" />
      </div>
    );
  }

  const imageSrc = getHuLearnLessonImageSrc(lesson);
  // Per-slide image: use the artwork of the sibling lesson at the current slide index,
  // so the illustration changes as the user moves between slides. Falls back to the
  // current lesson image when no sibling is available.
  const slideLesson = topic?.lessons[currentSlideIndex];
  const slideImageSrc = slideLesson ? getHuLearnLessonImageSrc(slideLesson) : imageSrc;

  const totalSlides = (lesson.slides?.length ?? 0) + 1; // slides + quiz page
  const hasQuiz = lesson.quiz && lesson.quiz.length > 0;

  const allCorrect = hasQuiz
    ? lesson.quiz.every((q, idx) => selectedAnswers[idx] === q.correctIndex)
    : true;

  const handleContinue = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <BottomSheet
      bodyClassName="flex min-h-0 flex-1 flex-col !mb-0"
      fillHeight
      headerClassName="!mb-[12px]"
      onClose={onBack}
      title={
        currentSlideIndex < (lesson.slides?.length ?? 0)
          ? (lesson.slides?.[currentSlideIndex]?.title ?? lesson.title)
          : "Quick Quiz"
      }
    >
      <div className="flex min-h-0 flex-1 flex-col" data-hu-learn-lesson={lesson.id}>
      {/* Slide Segmented Indicator */}
      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[36px] pt-[14px]">
        {currentSlideIndex < (lesson.slides?.length ?? 0) ? (
          // Slide View — order: image, progress, h1, p
          <div className="flex flex-col gap-[16px]">
            {/* Slide progress indicator (above image) */}
            <div className="flex gap-[6px] justify-center">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-[4px] flex-1 rounded-full transition-all duration-300",
                    idx <= currentSlideIndex
                      ? "bg-[var(--hu-theme-accent-strong)]"
                      : "bg-[color-mix(in_srgb,var(--uc-text)_12%,transparent)]"
                  )}
                />
              ))}
            </div>
            {slideImageSrc ? (
              <img
                alt=""
                aria-hidden="true"
                className="h-[150px] w-full select-none object-contain"
                draggable={false}
                src={slideImageSrc}
              />
            ) : null}
            <div className="flex flex-col gap-[14px]">
              <p className="text-[16px] font-normal leading-[22px] tracking-[0] text-[var(--uc-text-muted)]">
                {lesson.slides?.[currentSlideIndex]?.text}
              </p>
              {lesson.slides?.[currentSlideIndex]?.points?.length ? (
                <ul className="flex flex-col gap-[10px]">
                  {lesson.slides[currentSlideIndex].points!.map((point, pointIdx) => (
                    <li
                      key={pointIdx}
                      className="flex items-start gap-[10px] text-[15px] font-normal leading-[21px] tracking-[0] text-[var(--uc-text)]"
                    >
                      <span className="mt-[7px] size-[6px] shrink-0 rounded-full bg-[var(--hu-theme-accent-strong)]" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : (
          // Quiz View — flat layout, no card containers
          <div className="flex flex-col gap-[18px]">
            <div>
              <p className="text-[14px] font-normal leading-[18px] text-[var(--uc-text-muted)]">
                Answer both questions correctly to complete the lesson.
              </p>
            </div>

            {lesson.quiz?.map((q, qIndex) => {
              const selectedOption = selectedAnswers[qIndex];
              const isAnswered = selectedOption !== undefined;
              const isCorrect = selectedOption === q.correctIndex;
              const questionId = `hu-learn-${lesson.id}-${qIndex}-question`;
              const feedbackId = `hu-learn-${lesson.id}-${qIndex}-feedback`;

              return (
                <div
                  key={qIndex}
                  role="radiogroup"
                  aria-labelledby={questionId}
                >
                  <p className="text-[12px] font-bold text-[var(--hu-theme-accent-strong)] uppercase tracking-wider">
                    Question {qIndex + 1}
                  </p>
                  <h3 id={questionId} className="mt-[4px] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
                    {q.question}
                  </h3>
                  <div className="mt-[12px] flex flex-col gap-[8px]">
                    {q.options.map((option, optIndex) => {
                      const isSelected = selectedOption === optIndex;
                      const isOptionCorrect = optIndex === q.correctIndex;

                      let optionClass =
                        "border border-[color-mix(in_srgb,var(--uc-text)_10%,transparent)] bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]";
                      if (isSelected) {
                        if (isOptionCorrect) {
                          optionClass =
                            "border-2 border-[var(--uc-green-main)] bg-[color-mix(in_srgb,var(--uc-green-main)_10%,transparent)] text-[var(--uc-text)] font-semibold";
                        } else {
                          optionClass =
                            "border-2 border-[var(--uc-red-main)] bg-[color-mix(in_srgb,var(--uc-red-main)_10%,transparent)] text-[var(--uc-text)] font-semibold";
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          aria-checked={isSelected}
                          aria-describedby={isAnswered ? feedbackId : undefined}
                          role="radio"
                          className={cn(
                            "flex w-full items-center justify-between rounded-[12px] px-[16px] py-[12px] text-left text-[14px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                            optionClass
                          )}
                          onClick={() => {
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [qIndex]: optIndex,
                            }));
                          }}
                        >
                          <span className="flex-1 pr-2">{option}</span>
                          <span
                            className={cn(
                              "size-[18px] rounded-full border flex items-center justify-center shrink-0",
                              isSelected
                                ? isOptionCorrect
                                  ? "border-[var(--uc-green-main)] bg-[var(--uc-green-main)] text-white"
                                  : "border-[var(--uc-red-main)] bg-[var(--uc-red-main)] text-white"
                                : "border-[color-mix(in_srgb,var(--uc-text)_20%,transparent)]"
                            )}
                          >
                            {isSelected && <span className="size-[8px] rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <p
                      id={feedbackId}
                      aria-live="polite"
                      className={cn(
                        "mt-[10px] text-[13px] font-medium flex items-center gap-1",
                        isCorrect ? "text-[var(--uc-green-main)]" : "text-[var(--uc-red-main)]"
                      )}
                    >
                      {isCorrect ? "Correct. Great job." : "Incorrect. Try another option."}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Navigation footer — chevron Previous (left, hidden on slide 1) + NEXT/DONE (right), like Tutorials */}
      <div className="shrink-0 flex h-[72px] items-center justify-between border-t border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[16px]">
        {currentSlideIndex > 0 ? (
          <button
            aria-label="Previous lesson step"
            className="grid size-[32px] place-items-center bg-transparent text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            onClick={handlePrevious}
            type="button"
          >
            <AppIcon name="chevron-left" color="currentColor" size={24} />
          </button>
        ) : (
          <span className="size-[32px] shrink-0" aria-hidden="true" />
        )}
        {currentSlideIndex < (lesson.slides?.length ?? 0) ? (
          <button
            className="text-[14px] font-bold leading-[18px] tracking-[0] text-[var(--hu-theme-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            onClick={handleContinue}
            type="button"
          >
            NEXT
          </button>
        ) : (
          <button
            className={cn(
              "text-[14px] font-bold leading-[18px] tracking-[0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]",
              completed || allCorrect
                ? "text-[var(--hu-theme-accent-strong)]"
                : "text-[var(--uc-text-muted)] cursor-not-allowed",
            )}
            onClick={onComplete}
            disabled={!allCorrect}
            type="button"
          >
            {completed ? "LESSON COMPLETED" : "DONE"}
          </button>
        )}
      </div>
      </div>
    </BottomSheet>
  );
}

function HuLearnTopicArt({
  className,
  imageSrc,
  variant,
  visual,
}: {
  className?: string;
  imageSrc?: string;
  variant: HuLearnArtVariant;
  visual: HuLearnVisual;
}) {
  return (
    <div
      aria-hidden="true"
      data-hu-learn-art-slot={variant}
      className={cn(
        "pointer-events-none absolute z-0",
        imageSrc
          ? "overflow-visible border-0 shadow-none"
          : "overflow-hidden border shadow-[0_16px_24px_color-mix(in_srgb,var(--uc-static-black)_18%,transparent)]",
        HU_LEARN_ART_SLOT_CLASS[variant],
        className,
      )}
      style={{
        background: imageSrc ? "transparent" : "var(--hu-learn-art-bg)",
        borderColor: imageSrc ? "transparent" : "var(--hu-learn-card-border)",
      }}
    >
      {imageSrc ? (
        <img
          alt=""
          className="relative z-[1] h-full w-full select-none object-contain"
          data-hu-learn-art-image={variant}
          draggable={false}
          src={imageSrc}
        />
      ) : null}
      {!imageSrc && visual === "balance" ? (
        <>
          <span className="absolute left-[15%] top-[24%] size-[42%] rounded-full border-[4px] border-[color-mix(in_srgb,var(--uc-yellow-gold)_78%,var(--uc-static-white))] bg-[color-mix(in_srgb,var(--uc-yellow-gold)_24%,var(--hu-learn-art-soft))]" />
          <span className="absolute left-[34%] top-[29%] size-[42%] rounded-full border-[4px] border-[color-mix(in_srgb,var(--hu-learn-art-ink)_74%,var(--uc-static-white))] bg-[color-mix(in_srgb,var(--hu-learn-art-soft)_84%,var(--hu-theme-accent))]" />
          <span className="absolute bottom-[18%] right-[18%] h-[28%] w-[7%] rounded-full bg-[var(--hu-theme-accent-strong)]" />
          <span className="absolute bottom-[18%] right-[31%] h-[20%] w-[7%] rounded-full bg-[color-mix(in_srgb,var(--hu-theme-accent-2)_68%,var(--uc-static-white))]" />
        </>
      ) : null}
      {!imageSrc && visual === "goals" ? (
        <>
          <span className="absolute left-[16%] top-[16%] size-[58%] rounded-full border-[7px] border-[color-mix(in_srgb,var(--hu-learn-art-ink)_78%,var(--uc-static-white))]" />
          <span className="absolute left-[32%] top-[32%] size-[28%] rounded-full border-[5px] border-[color-mix(in_srgb,var(--uc-static-white)_86%,var(--hu-learn-art-soft))] opacity-90" />
          <span className="absolute right-[15%] top-[22%] h-[56%] w-[8%] rotate-45 rounded-full bg-[var(--uc-yellow-gold)]" />
        </>
      ) : null}
      {!imageSrc && visual === "safety" ? (
        <>
          <span className="absolute left-[28%] top-[14%] h-[66%] w-[44%] rounded-b-[28%] rounded-t-[18%] bg-[color-mix(in_srgb,var(--hu-learn-art-ink)_74%,var(--uc-static-white))]" />
          <span className="absolute left-[39%] top-[38%] h-[22%] w-[24%] rounded-[8px] border-[3px] border-[color-mix(in_srgb,var(--uc-static-white)_86%,var(--hu-learn-art-soft))] opacity-90" />
          <span className="absolute left-[47%] top-[56%] h-[14%] w-[7%] rounded-full bg-[color-mix(in_srgb,var(--uc-static-white)_86%,var(--hu-learn-art-soft))] opacity-90" />
        </>
      ) : null}
      {!imageSrc && visual === "request" ? (
        <>
          <span className="absolute left-[15%] top-[22%] h-[50%] w-[63%] rounded-[22%] bg-[var(--hu-learn-art-soft)]" />
          <span className="absolute bottom-[18%] left-[36%] h-[18%] w-[18%] rotate-45 rounded-[4px] bg-[var(--hu-learn-art-soft)]" />
          <span className="absolute right-[13%] top-[16%] size-[32%] rounded-full bg-[var(--uc-yellow-gold)] shadow-sm" />
          <span className="absolute right-[24%] top-[25%] h-[18%] w-[5%] rounded-full bg-[var(--uc-static-white)]" />
        </>
      ) : null}
      {!imageSrc && visual === "card" ? (
        <>
          <span className="absolute left-[14%] top-[25%] h-[56%] w-[70%] -rotate-[8deg] rounded-[14%] bg-[var(--hu-learn-art-soft)] shadow-sm" />
          <span className="absolute left-[24%] top-[38%] h-[9%] w-[27%] rounded-full bg-[var(--hu-theme-accent-strong)]" />
          <span className="absolute bottom-[25%] left-[24%] h-[8%] w-[43%] rounded-full bg-[color-mix(in_srgb,var(--uc-text)_22%,transparent)]" />
          <span className="absolute right-[19%] top-[47%] size-[18%] rounded-full bg-[var(--uc-red-main)]" />
          <span className="absolute right-[10%] top-[47%] size-[18%] rounded-full bg-[var(--uc-yellow-gold)] opacity-90" />
        </>
      ) : null}
    </div>
  );
}
