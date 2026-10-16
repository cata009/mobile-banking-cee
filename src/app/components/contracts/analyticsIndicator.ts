export function buildCenteredPeriodIndicator(periodKeys: readonly string[], activeIndex: number) {
  if (periodKeys.length <= 5) return [...periodKeys]

  let start = Math.max(0, activeIndex - 2)
  const end = Math.min(periodKeys.length, start + 5)

  if (end - start < 5) start = Math.max(0, end - 5)
  return periodKeys.slice(start, end)
}

export function resolveAnalyticsIndicator({
  periodKeys,
  activePeriodKey,
}: {
  periodKeys: readonly string[]
  activePeriodKey: string
}) {
  return {
    periodKeys,
    activePeriodKey,
    gap: 10,
    dotSize: 6,
    activeWidth: 30,
    paddingTop: 7,
    paddingBottom: 14,
    decorative: true,
    activeClass: 'h-[6px] w-[30px] rounded-full bg-[var(--uc-action)]',
    inactiveClass: 'size-[6px] rounded-full bg-[var(--uc-text-subtle)]',
  } as const
}
