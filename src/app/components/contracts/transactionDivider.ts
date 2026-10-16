/** Month/date separators differ deliberately in title size and line visibility. */
export function resolveTransactionDivider({
  dateSeparator = false,
  total,
}: { dateSeparator?: boolean; total?: string } = {}) {
  return {
    dateSeparator,
    hasTotal: Boolean(total),
    hasLine: !dateSeparator,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    fontSize: dateSeparator ? 14 : 16,
    lineHeight: 'normal',
    titleToken: '--uc-text-muted',
    totalToken: '--uc-text',
    lineToken: '--uc-border',
    titleClass: dateSeparator ? 'uc-type-n5-strong' : 'uc-type-n4-strong',
  } as const
}
