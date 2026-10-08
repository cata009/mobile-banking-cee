import { useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { AppIcon } from '@/app/components/icons'
import { useLanguage } from '@/app/contexts/LanguageContext'
import {
  buildCustomSelection,
  buildPresetSelection,
  monthKeyYear,
  monthLabel,
  SPENDING_PRESET_IDS,
  type SpendingPeriodSelection,
  type SpendingPresetId,
} from '@/app/screens/analytics/evoSpendingPeriods'
import { ANALYTICS_LOCALE } from '@/features/analytics/evo/selectors'

export const PRESET_LABEL_KEYS: Record<SpendingPresetId, string> = {
  'this-month': 'presetThisMonth',
  'last-month': 'presetLastMonth',
  'last-3-months': 'presetLast3Months',
  'last-6-months': 'presetLast6Months',
  'year-to-date': 'presetYearToDate',
  'last-year': 'presetLastYear',
}

export function SpendingPeriodSheet({
  availableMonthKeys,
  current,
  onPick,
  onClose,
}: {
  availableMonthKeys: readonly string[]
  current: SpendingPeriodSelection
  onPick: (selection: SpendingPeriodSelection) => void
  onClose: () => void
}) {
  const { t } = useLanguage()
  const [customOpen, setCustomOpen] = useState(false)
  const [fromKey, setFromKey] = useState(current.monthKeys[0] ?? availableMonthKeys[0] ?? '')
  const [toKey, setToKey] = useState(
    current.monthKeys[current.monthKeys.length - 1] ?? availableMonthKeys[availableMonthKeys.length - 1] ?? '',
  )
  const latestMonthKey = availableMonthKeys[availableMonthKeys.length - 1] ?? ''
  const presetLabels = {
    thisMonth: t('runtime.evo.spending.presetThisMonth'),
    lastMonth: t('runtime.evo.spending.presetLastMonth'),
    last3Months: t('runtime.evo.spending.presetLast3Months'),
    last6Months: t('runtime.evo.spending.presetLast6Months'),
    yearToDate: t('runtime.evo.spending.presetYearToDate'),
    lastYear: t('runtime.evo.spending.presetLastYear'),
  }

  return (
    <BottomSheet title={t('runtime.evo.spending.periodSheetTitle')} onClose={onClose}>
      <div data-evo-analytics-period-sheet className="overflow-hidden rounded-[8px] bg-[var(--uc-surface)]">
        {SPENDING_PRESET_IDS.map((preset, index) => {
          const selection = buildPresetSelection(
            preset,
            latestMonthKey,
            availableMonthKeys,
            ANALYTICS_LOCALE,
            presetLabels,
          )
          const selected = !customOpen && selection.id === current.id

          return (
            <button
              key={preset}
              type="button"
              role="option"
              aria-selected={selected}
              data-evo-analytics-period-option={preset}
              onClick={() => onPick(selection)}
              className={`flex min-h-[56px] w-full items-center gap-[12px] px-[16px] py-[10px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] ${index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
                  {t(`runtime.evo.spending.${PRESET_LABEL_KEYS[preset]}`)}
                </span>
                {/* The span each preset resolves to, so the choice is made on the
                    dates rather than on the label alone. */}
                <span className="mt-[2px] block truncate text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
                  {selection.kind === 'month'
                    ? `${selection.title} ${selection.subtitle}`
                    : selection.kind === 'year'
                      ? selection.title
                      : selection.subtitle}
                </span>
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

        <button
          type="button"
          role="option"
          aria-selected={customOpen}
          data-evo-analytics-period-option="custom"
          onClick={() => setCustomOpen((open) => !open)}
          className="flex min-h-[56px] w-full items-center gap-[12px] border-t-[0.5px] border-[var(--uc-border-muted)] px-[16px] py-[10px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
        >
          <span className="min-w-0 flex-1 truncate text-[16px] font-medium leading-[20px] text-[var(--uc-text)]">
            {t('runtime.evo.spending.presetCustom')}
          </span>
          <span
            className={`grid size-[24px] place-items-center transition-transform duration-200 ${customOpen ? 'rotate-180' : ''}`}
          >
            <AppIcon name="chevron-down-wide" size={18} color="var(--uc-icon)" aria-hidden="true" />
          </span>
        </button>

        {customOpen ? (
          <div
            data-evo-analytics-period-custom
            className="border-t-[0.5px] border-[var(--uc-border-muted)] px-[16px] py-[14px]"
          >
            <div className="flex gap-[12px]">
              <label className="min-w-0 flex-1">
                <span className="mb-[4px] block text-[13px] leading-[16px] text-[var(--uc-text-muted)]">
                  {t('runtime.evo.spending.from')}
                </span>
                <select
                  data-evo-analytics-period-from
                  value={fromKey}
                  onChange={(event) => setFromKey(event.target.value)}
                  className="h-[44px] w-full rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] px-[10px] text-[15px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                >
                  {availableMonthKeys.map((key) => (
                    <option
                      key={key}
                      value={key}
                    >{`${monthLabel(key, ANALYTICS_LOCALE, 'short')} ${monthKeyYear(key)}`}</option>
                  ))}
                </select>
              </label>
              <label className="min-w-0 flex-1">
                <span className="mb-[4px] block text-[13px] leading-[16px] text-[var(--uc-text-muted)]">
                  {t('runtime.evo.spending.to')}
                </span>
                <select
                  data-evo-analytics-period-to
                  value={toKey}
                  onChange={(event) => setToKey(event.target.value)}
                  className="h-[44px] w-full rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] px-[10px] text-[15px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
                >
                  {availableMonthKeys.map((key) => (
                    <option
                      key={key}
                      value={key}
                    >{`${monthLabel(key, ANALYTICS_LOCALE, 'short')} ${monthKeyYear(key)}`}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              data-evo-analytics-period-apply
              onClick={() => onPick(buildCustomSelection(fromKey, toKey, availableMonthKeys, ANALYTICS_LOCALE))}
              className="mt-[14px] flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[var(--uc-action-strong)] text-[15px] font-bold uppercase tracking-[0.02em] text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2"
            >
              {t('runtime.evo.spending.apply')}
            </button>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  )
}
