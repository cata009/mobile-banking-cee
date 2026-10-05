import type { ReactNode, Ref, UIEventHandler } from "react";
import PageHeader from "@/app/components/PageHeader";

interface CzRoboLevelOneShellProps {
  title: string;
  onBack: () => void;
  onHelpClick?: () => void;
  children: ReactNode;
  scrollRef?: Ref<HTMLDivElement>;
  onScroll?: UIEventHandler<HTMLDivElement>;
  bottomInset?: number;
}

export default function CzRoboLevelOneShell({
  title,
  onBack,
  onHelpClick,
  children,
  scrollRef,
  onScroll,
  bottomInset = 0,
}: CzRoboLevelOneShellProps) {
  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]"
      data-cz-robo-level-one-shell="true"
    >
      <PageHeader
        title=""
        onBack={onBack}
        variant="gray"
        backIconName="close-flow"
        backLabel="Back to mobile banking"
        includeSafeArea
        renderLargeTitle={false}
        hideCollapsedTitleWhenHidden
        showHelp
        onHelpClick={onHelpClick}
      />
      <div className="mt-[8px] min-h-0 flex-1 overflow-hidden rounded-t-[24px] bg-[var(--uc-surface)] shadow-[0_-8px_20px_rgba(0,0,0,0.045)]">
        <div
          ref={scrollRef}
          className="h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide"
          onScroll={onScroll}
          style={bottomInset > 0 ? { paddingBottom: bottomInset } : undefined}
        >
          <h1 className="uc-type-h1 px-[16px] pb-[8px] pt-[16px] text-[var(--uc-text)]">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
