import { resolveTransactionRow } from './transactionRow'
export function transactionRowWeb(options: Parameters<typeof resolveTransactionRow>[0]) {
  const state = resolveTransactionRow(options)
  return {
    ...state,
    baselineSizing: state.pending ? 'min-h-[80px] py-[2px]' : 'min-h-[80px] py-[18px]',
    baselineContentGap: state.pending ? 'gap-[2px]' : 'gap-[4px]',
    evoSizing: state.compact
      ? 'min-h-[64px] py-[8px]'
      : state.pending
        ? 'min-h-[92px] py-[16px]'
        : 'min-h-[80px] py-[16px]',
  }
}
