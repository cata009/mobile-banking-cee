import { resolveTransactionRow } from './transactionRow'
export function transactionRowWeb(options: Parameters<typeof resolveTransactionRow>[0]) {
  const state = resolveTransactionRow(options)
  return {
    ...state,
    evoSizing: state.compact
      ? 'min-h-[64px] py-[8px]'
      : state.pending
        ? 'min-h-[92px] py-[16px]'
        : 'min-h-[80px] py-[16px]',
  }
}
