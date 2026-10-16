import { AppIcon } from "@/app/components/icons";

export function CollapsingCardHeader({
  progress,
  onBack,
  onHelpClick,
}: {
  progress: number
  onBack: () => void
  onHelpClick?: () => void
}) {
  return (
    <div className="sticky top-0 z-30 bg-[var(--uc-app-bg)] pt-[var(--uc-phone-top-reserve,54px)]">
      <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
        <button onClick={onBack} className="flex h-[40px] w-[40px] items-center justify-center" aria-label="Back">
          <AppIcon name="back-heavy" color="var(--uc-text)" />
        </button>
        <h1
          className="uc-type-n4-strong pointer-events-none truncate text-center text-[var(--uc-text)]"
          style={{
            opacity: progress,
            transform: `translateY(${(1 - progress) * 6}px)`,
          }}
        >
          Cards
        </h1>
        <button onClick={onHelpClick} className="flex h-[40px] w-[40px] items-center justify-center" aria-label="Help">
          <AppIcon name="help-circle" color="var(--uc-text)" />
        </button>
      </div>
    </div>
  )
}
