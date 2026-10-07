import { BottomSheet } from '@/app/components/BottomSheet'
import { AppIcon } from '@/app/components/icons'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { type AnalyticsScope } from '@/features/analytics/evo/selectors'

export function SpendingScopeSheet({
  scopes,
  selectedScopeId,
  onScopeChange,
  includeOwnTransfers,
  onToggleOwnTransfers,
  onClose,
}: {
  scopes: readonly AnalyticsScope[]
  selectedScopeId: string
  onScopeChange: (scopeId: string) => void
  includeOwnTransfers: boolean
  onToggleOwnTransfers: () => void
  onClose: () => void
}) {
  const { t } = useLanguage()

  return (
    <BottomSheet title="Show data for" onClose={onClose}>
      <div data-evo-analytics-scope-sheet className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)]">
        {scopes.map((scope, index) => {
          const selected = scope.id === selectedScopeId

          return (
            <button
              key={scope.id}
              type="button"
              role="option"
              aria-selected={selected}
              data-evo-analytics-scope-option={scope.id}
              onClick={() => {
                onScopeChange(scope.id)
                onClose()
              }}
              className={`flex min-h-[64px] w-full items-center gap-[12px] px-[16px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] ${
                index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''
              }`}
            >
              <span className="min-w-0 flex-1 truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
                {scope.label}
              </span>
              <AppIcon
                name={selected ? 'radio-selected' : 'radio-unselected'}
                size={24}
                color={selected ? 'var(--uc-action)' : 'var(--uc-icon-muted)'}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>

      {/* Moving money between your own accounts is not spending. It was counted
         as both an expense and an income, so the same money inflated both
         totals; excluded by default, and the switch says so. */}
      <button
        type="button"
        role="switch"
        data-evo-analytics-own-transfers-toggle
        aria-checked={!includeOwnTransfers}
        onClick={onToggleOwnTransfers}
        className="mt-[12px] flex w-full items-start gap-[12px] rounded-[8px] bg-[var(--uc-surface)] px-[16px] py-[14px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
            {t('runtime.evo.spending.excludeTransfers')}
          </span>
          <span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {t('runtime.evo.spending.transfersExcludedNote')}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`mt-[2px] grid h-[24px] w-[40px] shrink-0 items-center rounded-full px-[3px] transition-colors ${!includeOwnTransfers ? 'bg-[var(--uc-action)]' : 'bg-[var(--uc-surface-muted)]'}`}
        >
          <span
            className={`block size-[18px] rounded-full bg-[var(--uc-static-white)] shadow-sm transition-transform ${!includeOwnTransfers ? 'translate-x-[16px]' : ''}`}
          />
        </span>
      </button>
    </BottomSheet>
  )
}
