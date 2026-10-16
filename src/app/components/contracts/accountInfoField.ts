export function resolveAccountInfoField({ hasTrailing = false }: { hasTrailing?: boolean } = {}) {
  return {
    variant: hasTrailing ? 'with-icon' : 'default',
    hasTrailing,
    height: 80,
    trailingSlot: 40,
    gap: 16,
    textGap: 4,
    fontSize: 16,
    lineHeight: 'normal',
    textToken: '--uc-text',
    layoutClass: hasTrailing ? 'grid grid-cols-[minmax(0,1fr)_40px] gap-[16px]' : 'flex',
  } as const
}
