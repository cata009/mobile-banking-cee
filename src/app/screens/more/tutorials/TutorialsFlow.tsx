import { useEffect, useMemo, useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import { AppIcon } from "@/app/components/icons";
import { getTutorialsForCountry, type BankingTutorial, type BankingTutorialSlide } from "@/app/config/tutorialsConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { CountryId } from "@/app/state/demoTypes";

interface TutorialsFlowProps {
  country: CountryId;
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialsFlow({ country, isOpen, onClose }: TutorialsFlowProps) {
  const { t } = useLanguage();
  const tutorials = useMemo(() => getTutorialsForCountry(country), [country]);
  const [selectedTutorialId, setSelectedTutorialId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const selectedTutorial = tutorials.find((tutorial) => tutorial.id === selectedTutorialId) ?? null;

  useEffect(() => {
    if (!isOpen) {
      setSelectedTutorialId(null);
      setStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setSelectedTutorialId(null);
    setStepIndex(0);
    onClose();
  };

  const openTutorial = (tutorial: BankingTutorial) => {
    setSelectedTutorialId(tutorial.id);
    setStepIndex(0);
  };

  if (selectedTutorial) {
    return (
      <TutorialDetailOverlay
        onBack={() => {
          setSelectedTutorialId(null);
          setStepIndex(0);
        }}
        onClose={handleClose}
        onStepChange={setStepIndex}
        stepIndex={stepIndex}
        tutorial={selectedTutorial}
      />
    );
  }

  return (
    <BottomSheet title={t("more.cards.tutorial", "Tutorials")} maxHeightOffsetPx={102} onClose={handleClose}>
      <div className="-mt-[8px] pb-[8px]" data-tutorials-sheet="true">
        {tutorials.map((tutorial) => (
          <button
            aria-label={`Open tutorial: ${tutorial.title}`}
            className="flex min-h-[72px] w-full items-center justify-between gap-[16px] bg-transparent py-[10px] text-left text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-sheet-bg)]"
            key={tutorial.id}
            onClick={() => openTutorial(tutorial)}
            type="button"
          >
            <span className="max-w-[286px] font-['UniCredit:Bold',sans-serif] text-[14px] font-bold uppercase leading-[18px] tracking-[0.02em]">
              {tutorial.title}
            </span>
            <AppIcon name="chevron-link" color="var(--uc-icon)" size={32} />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

interface TutorialDetailOverlayProps {
  tutorial: BankingTutorial;
  stepIndex: number;
  onStepChange: (stepIndex: number) => void;
  onBack: () => void;
  onClose: () => void;
}

// `onBack` (return to the tutorial list without closing the sheet) is supplied
// by the caller, but the header currently renders only a close control, so it is
// intentionally not destructured here.
function TutorialDetailOverlay({ tutorial, stepIndex, onStepChange, onClose }: TutorialDetailOverlayProps) {
  const currentStep = tutorial.slides[stepIndex] ?? tutorial.slides[0];
  const isLastStep = stepIndex === tutorial.slides.length - 1;

  const goPrevious = () => {
    onStepChange(Math.max(0, stepIndex - 1));
  };

  const goNext = () => {
    if (isLastStep) {
      onClose();
      return;
    }

    onStepChange(Math.min(tutorial.slides.length - 1, stepIndex + 1));
  };

  return (
    <div className="absolute inset-0 z-50 bg-[var(--uc-overlay)]" data-tutorial-detail-screen="true">
      <section
        aria-label={`${tutorial.shortTitle} tutorial`}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 top-[var(--uc-phone-top-reserve,54px)] flex flex-col rounded-t-[12px] bg-[var(--uc-surface)] text-[var(--uc-text)]"
        role="dialog"
      >
        <div className="flex h-[44px] shrink-0 items-center border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[8px]">
          <span className="size-[32px] shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1 px-[8px] text-center">
            <h2 className="truncate font-['UniCredit:Bold',sans-serif] text-[14px] font-bold leading-[18px]">
              {tutorial.shortTitle}
            </h2>
            <p className="truncate font-['UniCredit:Regular',sans-serif] text-[11px] leading-[14px] text-[var(--uc-text-muted)]">
              Step {stepIndex + 1} of {tutorial.slides.length}
            </p>
          </div>
          <button
            aria-label="Close tutorial"
            className="grid size-[32px] place-items-center bg-transparent text-[var(--uc-icon)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            onClick={onClose}
            type="button"
          >
            <AppIcon name="close-x" color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-[104px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TutorialSlideView slide={currentStep} tutorial={tutorial} />
        </div>

        <div
          className="absolute inset-x-0 bottom-[50px] flex h-[32px] items-center justify-center gap-[6px]"
          style={{ background: "color-mix(in srgb, var(--uc-surface) 92%, transparent)" }}
        >
          {tutorial.slides.map((slide, index) => (
            <button
              aria-label={`Go to step ${index + 1}`}
              className={`h-[6px] rounded-full transition-all ${
                index === stepIndex ? "w-[30px] bg-[var(--uc-text)]" : "w-[6px] bg-[var(--uc-border-strong)]"
              }`}
              key={`${slide.title}-${index}`}
              onClick={() => onStepChange(index)}
              type="button"
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex h-[72px] items-center justify-between border-t border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[16px]">
          <button
            aria-label="Previous tutorial step"
            className="grid size-[32px] place-items-center bg-transparent text-[var(--uc-icon)] disabled:opacity-30"
            disabled={stepIndex === 0}
            onClick={goPrevious}
            type="button"
          >
            <AppIcon name="chevron-left" color="currentColor" size={24} />
          </button>
          <button
            className="font-['UniCredit:Bold',sans-serif] text-[14px] font-bold leading-[18px] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            onClick={isLastStep ? onClose : goNext}
            type="button"
          >
            {isLastStep ? "DONE" : "NEXT"}
          </button>
        </div>
      </section>
    </div>
  );
}

interface TutorialSlideViewProps {
  tutorial: BankingTutorial;
  slide: BankingTutorialSlide;
}

function TutorialSlideView({ tutorial, slide }: TutorialSlideViewProps) {
  if (slide.kind === "checklist") {
    return (
      <div className="px-[16px] pt-[56px]">
        <TutorialTextBlock slide={slide} />
        <div className="mt-[40px] space-y-[16px]">
          {["Select the product", "Check the details", "Continue securely"].map((item, index) => (
            <div className="flex min-h-[64px] items-center gap-[16px] border-b border-[var(--uc-border-muted)]" key={item}>
              <div
                className="grid size-[32px] shrink-0 place-items-center rounded-full font-['UniCredit:Bold',sans-serif] text-[14px] text-white"
                style={{ backgroundColor: tutorial.accent }}
              >
                {index + 1}
              </div>
              <span className="font-['UniCredit:Bold',sans-serif] text-[16px] leading-[20px] text-[var(--uc-text)]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <TutorialVisual accent={tutorial.accent} kind={slide.kind} />
      <div className="px-[16px] pt-[24px]">
        <TutorialTextBlock slide={slide} />
      </div>
    </>
  );
}

function TutorialTextBlock({ slide }: { slide: BankingTutorialSlide }) {
  return (
    <div className="space-y-[12px]">
      <h3 className="font-['UniCredit:Bold',sans-serif] text-[24px] font-bold leading-[31px] text-[var(--uc-text)]">
        {slide.title}
      </h3>
      <p className="font-['UniCredit:Regular',sans-serif] text-[16px] leading-[22px] text-[var(--uc-text)]">
        {slide.body}
      </p>
      <p className="font-['UniCredit:Regular',sans-serif] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">
        {slide.helper}
      </p>
    </div>
  );
}

function TutorialVisual({ accent, kind }: { accent: string; kind: BankingTutorialSlide["kind"] }) {
  const isConfirmation = kind === "confirmation";

  return (
    <div className="relative h-[439px] overflow-hidden bg-[#F5F5F5]">
      <div className="absolute left-1/2 top-[54px] h-[294px] w-[178px] -translate-x-1/2 rounded-[28px] border-[8px] border-[#262626] bg-white shadow-[0_16px_36px_rgb(38_38_38_/_0.18)]">
        <div className="mx-auto mt-[10px] h-[5px] w-[48px] rounded-full bg-[#262626]" />
        <div className="mx-[16px] mt-[24px] h-[48px] rounded-[8px]" style={{ backgroundColor: accent }} />
        <div className="mx-[16px] mt-[22px] space-y-[10px]">
          <div className="h-[10px] rounded-full bg-[#D9D9D9]" />
          <div className="h-[10px] w-[72px] rounded-full bg-[#D9D9D9]" />
          <div className="mt-[22px] h-[40px] rounded-[8px] bg-[#262626]" />
        </div>
        <div className="absolute bottom-[18px] left-1/2 grid size-[54px] -translate-x-1/2 place-items-center rounded-full border border-[#E5E5E5] bg-white">
          <div
            className="grid size-[34px] place-items-center rounded-full font-['UniCredit:Bold',sans-serif] text-[20px] text-white"
            style={{ backgroundColor: isConfirmation ? "#3D7D43" : accent }}
          >
            {isConfirmation ? "OK" : "1"}
          </div>
        </div>
      </div>
      <div className="absolute left-[24px] top-[82px] h-[74px] w-[120px] rounded-[10px] bg-white shadow-[0_10px_24px_rgb(38_38_38_/_0.12)]">
        <div className="m-[12px] h-[14px] w-[52px] rounded-full" style={{ backgroundColor: accent }} />
        <div className="mx-[12px] mt-[14px] h-[8px] rounded-full bg-[#D9D9D9]" />
        <div className="mx-[12px] mt-[8px] h-[8px] w-[64px] rounded-full bg-[#D9D9D9]" />
      </div>
      <div className="absolute right-[18px] top-[240px] h-[88px] w-[132px] rounded-[12px] bg-white shadow-[0_10px_24px_rgb(38_38_38_/_0.12)]">
        <div className="mx-[14px] mt-[14px] h-[12px] w-[78px] rounded-full bg-[#D9D9D9]" />
        <div className="mx-[14px] mt-[14px] h-[28px] rounded-[8px]" style={{ backgroundColor: accent }} />
      </div>
    </div>
  );
}
