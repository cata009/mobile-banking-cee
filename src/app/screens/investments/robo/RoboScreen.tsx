import { type ReactNode } from 'react'
import PageHeader from '@/app/components/PageHeader'
import { AppIcon } from '@/app/components/icons'
import { cn } from '@/app/components/ui/utils'
import { useCollapsingHeader } from '@/hooks/useCollapsingHeader'

export interface RoboScreenProps {
  title: string
  description?: string
  onBack: () => void
  onClose: () => void
  headerAction?: 'close' | 'help' | 'none'
  children: ReactNode
  footer?: ReactNode
  overlay?: ReactNode
  dataScreen: string
  titleClassName?: string
  descriptionTopClassName?: string
  contentTopClassName?: string
}

export function RoboScreen({
  title,
  description,
  onBack,
  onClose,
  headerAction = 'close',
  children,
  footer,
  overlay,
  dataScreen,
  titleClassName,
  descriptionTopClassName = 'mt-[16px]',
  contentTopClassName = 'pt-[32px]',
}: RoboScreenProps) {
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64)

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
      data-robo-screen={dataScreen}
    >
      <PageHeader
        title={title}
        onBack={onBack}
        includeSafeArea
        compact
        renderLargeTitle={false}
        collapsedTitleProgress={headerProgress}
        showHelp={headerAction === 'help'}
        onHelpClick={() => undefined}
        rightActionIcon={
          headerAction === 'close' ? <AppIcon name="close-flow" color="var(--uc-text)" size={20} /> : undefined
        }
        rightActionLabel="Close"
        onRightActionClick={onClose}
        hideCollapsedTitleWhenHidden
      />
      <main
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[24px] pb-[24px] scrollbar-hide"
        data-robo-scroll-container
        onScroll={handleScroll}
      >
        <h1 className={cn('uc-type-h1 pt-[8px] text-[var(--uc-text)]', titleClassName)}>{title}</h1>
        {description ? (
          <div
            className={descriptionTopClassName}
            data-testid={dataScreen === 'goal-detail' ? 'robo-goal-detail-meta' : undefined}
          >
            <p className="text-[16px] leading-[21px] text-[var(--uc-text)]">{description}</p>
          </div>
        ) : null}
        <div className={contentTopClassName}>{children}</div>
      </main>
      {footer ? <footer className="shrink-0 px-[24px] pb-[34px] pt-[12px]">{footer}</footer> : null}
      {overlay}
    </div>
  )
}
