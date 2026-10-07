export type DraftStatus = 'available' | 'rejected'
export type SummaryOrderStatus = 'Marked to sign' | 'Not signed' | 'Rejected'

export type BulkDraft = {
  id: string
  name: string
  isin: string
  orderType: 'BUY' | 'SELL' | 'REGULAR INVESTMENT'
  amount: number
  status: DraftStatus
}

export const BULK_DRAFTS: readonly BulkDraft[] = [
  {
    id: 'draft-01',
    name: 'UniCredit Balanced Income Fund',
    isin: 'LU0243534567',
    orderType: 'BUY',
    amount: 5000,
    status: 'available',
  },
  {
    id: 'draft-02',
    name: 'onemarkets Climate Focus Fund',
    isin: 'LU1953188835',
    orderType: 'SELL',
    amount: -3200,
    status: 'available',
  },
  {
    id: 'draft-03',
    name: 'Sustainable Future Mixed Fund',
    isin: 'LU1829218742',
    orderType: 'REGULAR INVESTMENT',
    amount: 750,
    status: 'available',
  },
  {
    id: 'draft-04',
    name: 'Global Dividend Fund',
    isin: 'LU0717821071',
    orderType: 'BUY',
    amount: 2400,
    status: 'available',
  },
  {
    id: 'draft-05',
    name: 'CEE Government Bond Fund',
    isin: 'LU0866173890',
    orderType: 'SELL',
    amount: -1650,
    status: 'available',
  },
  {
    id: 'draft-06',
    name: 'Emerging Markets Equity Fund',
    isin: 'LU0994726007',
    orderType: 'BUY',
    amount: 1800,
    status: 'available',
  },
  {
    id: 'draft-07',
    name: 'Euro Short Term Bond Fund',
    isin: 'LU1681043596',
    orderType: 'REGULAR INVESTMENT',
    amount: 300,
    status: 'available',
  },
  {
    id: 'draft-08',
    name: 'European Small Cap Fund',
    isin: 'LU0594300094',
    orderType: 'BUY',
    amount: 1250,
    status: 'available',
  },
  {
    id: 'draft-09',
    name: 'Strategic Income Fund',
    isin: 'LU0957146375',
    orderType: 'BUY',
    amount: 900,
    status: 'available',
  },
  {
    id: 'draft-10',
    name: 'Balanced Allocation Fund',
    isin: 'LU1181134408',
    orderType: 'BUY',
    amount: 1100,
    status: 'rejected',
  },
] as const

export const DEFAULT_SELECTED_IDS: readonly string[] = []
export const STATIC_REVIEW_SELECTED_IDS = ['draft-01', 'draft-02', 'draft-03'] as const

export function getSelectedDrafts(selectedIds: readonly string[], rejectedIds: readonly string[]): BulkDraft[] {
  return BULK_DRAFTS.filter((draft) => selectedIds.includes(draft.id) && !rejectedIds.includes(draft.id))
}

export function getSelectableDraftIds(rejectedIds: readonly string[]): string[] {
  return BULK_DRAFTS.filter((draft) => !rejectedIds.includes(draft.id)).map((draft) => draft.id)
}

export function toggleSelectedDraftIds(current: readonly string[], id: string): string[] {
  return current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]
}

export function toggleAllDraftIds(current: readonly string[], selectableDraftIds: readonly string[]): string[] {
  return current.length === selectableDraftIds.length ? [] : [...selectableDraftIds]
}

export function getSummaryOrderStatus(
  draft: BulkDraft,
  selectedIds: readonly string[],
  rejectedIds: readonly string[],
): SummaryOrderStatus {
  if (rejectedIds.includes(draft.id)) return 'Rejected'
  return selectedIds.includes(draft.id) ? 'Marked to sign' : 'Not signed'
}

export function getSummaryStatusLabel(status: SummaryOrderStatus) {
  return status === 'Not signed' ? 'Not selected to be signed' : status
}
