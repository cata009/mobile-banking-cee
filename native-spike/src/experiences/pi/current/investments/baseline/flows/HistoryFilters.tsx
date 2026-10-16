import Svg, { Path } from 'react-native-svg';
import React, { useState } from 'react';
import { Pressable, ScrollView, View, StyleSheet } from 'react-native';
import {
  INVESTMENT_HISTORY_DATE_OPTIONS,
  type InvestmentHistoryFilterState,
  type InvestmentHistoryOrderStatus,
} from '@/app/config/investmentsPortfolioConfig';
import { getHistoryTypesForTab } from '@/features/investments/history/model';
import { getCountryConfig } from '@/app/registry/countryConfig';
import { parseIsoDateOnly } from '@/app/utils/dateOnly';
import type { Currency } from '@/data/products';
import type { CurrentScreenProps } from '../../../contracts';
import { Text } from '../../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { investmentColor, investmentScrollStyle } from '../Frame';
import { HistoryHomeIndicator } from './HistoryDetail';
export type HistoryFilterMode =
  | 'main'
  | 'type'
  | 'status'
  | 'currency'
  | 'calendar';
export const HISTORY_STATUSES: readonly InvestmentHistoryOrderStatus[] = [
  'EXECUTED',
  'PENDING',
  'REJECTED',
];
export const historyFilterDate = (value: string, host: CurrentScreenProps) =>
  new Intl.DateTimeFormat(getCountryConfig(host.country).locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parseIsoDateOnly(value));
const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
/** Source react-day-picker8 range interaction, expressed without its DOM runtime. */
export function selectHistoryCalendarDay(
  day: string,
  range:
    | {
        from?: string;
        to?: string;
      }
    | undefined,
):
  | {
      from?: string;
      to?: string;
    }
  | undefined {
  const { from, to } = range ?? {};
  if (from && to) {
    if (to === day && from === day) return undefined;
    if (to === day)
      return {
        from: to,
      };
    if (from === day) return undefined;
    if (from > day)
      return {
        from: day,
        to,
      };
    return {
      from,
      to: day,
    };
  }
  if (to)
    return day > to
      ? {
          from: to,
          to: day,
        }
      : {
          from: day,
          to,
        };
  if (from)
    return day < from
      ? {
          from: day,
          to: from,
        }
      : {
          from,
          to: day,
        };
  return {
    from: day,
  };
}
function Link({
  host,
  label,
  onPress,
}: {
  host: CurrentScreenProps;
  label: string;
  onPress(): void;
}) {
  const renderStyle1 = {
    color: investmentColor(host, '--uc-action'),
  } as const;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Text style={[baselineStyles.inline1, renderStyle1]}>{label}</Text>
    </Pressable>
  );
}
function Check({
  host,
  label,
  selected,
  onPress,
  radio = false,
}: {
  host: CurrentScreenProps;
  label: string;
  selected: boolean;
  onPress(): void;
  radio?: boolean;
}) {
  const renderStyle2 = {
    borderRadius: radio ? 11 : 3,
  } as const;
  const renderStyle3 = {
    borderColor: investmentColor(host, '--uc-text'),
  } as const;
  const renderStyle4 = {
    backgroundColor: investmentColor(host, '--uc-action'),
  } as const;
  const renderStyle5 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={baselineStyles.inline2}
    >
      <View style={baselineStyles.inline3}>
        <View
          style={[
            baselineStyles.inline4,
            renderStyle2,
            baselineStyles.inline5,
            renderStyle3,
          ]}
        >
          {selected ? (
            radio ? (
              <View style={[baselineStyles.inline6, renderStyle4]} />
            ) : (
              <SourceCustomIcon
                name="prime-check"
                size={15}
                color={investmentColor(host, '--uc-action')}
              />
            )
          ) : null}
        </View>
      </View>
      <Text style={[baselineStyles.inline7, renderStyle5]}>{label}</Text>
    </Pressable>
  );
}
function FilterRow({
  host,
  title,
  value,
  onPress,
  calendar = false,
}: {
  host: CurrentScreenProps;
  title: string;
  value: string;
  onPress(): void;
  calendar?: boolean;
}) {
  const renderStyle6 = {
    color: investmentColor(host, '--uc-text-muted'),
  } as const;
  const renderStyle7 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  const renderStyle8 = {
    backgroundColor: investmentColor(host, '--uc-border'),
  } as const;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={baselineStyles.inline8}
    >
      <View style={baselineStyles.inline9}>
        <View style={baselineStyles.inline10}>
          <Text style={[baselineStyles.inline11, renderStyle6]}>{title}</Text>
          <Text style={[baselineStyles.inline12, renderStyle7]}>{value}</Text>
        </View>
        <View style={[baselineStyles.inline13, renderStyle8]} />
      </View>
      <View style={baselineStyles.inline14}>
        {calendar ? (
          <Svg width={32} height={32} viewBox="0 0 32 32">
            <Path d={sourceCalendarPath} fill="#262626" />
          </Svg>
        ) : (
          <SourceCustomIcon
            name="chevron-link"
            size={32}
            color={investmentColor(host, '--uc-text')}
          />
        )}
      </View>
    </Pressable>
  );
}
function FilterDivider({
  host,
  title,
}: {
  host: CurrentScreenProps;
  title: string;
}) {
  const renderStyle9 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  const renderStyle10 = {
    backgroundColor: investmentColor(host, '--uc-border'),
  } as const;
  return (
    <View style={baselineStyles.inline15}>
      <Text style={[baselineStyles.inline16, renderStyle9]}>{title}</Text>
      <View style={[baselineStyles.inline17, renderStyle10]} />
    </View>
  );
}
function Scaffold({
  host,
  title,
  onClose,
  onApply,
  children,
}: {
  host: CurrentScreenProps;
  title: string;
  onClose(): void;
  onApply(): void;
  children: React.ReactNode;
}) {
  const renderStyle11 = {
    top: host.screenTopInset,
  } as const;
  const renderStyle12 = {
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  const renderStyle13 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  const renderStyle14 = {
    paddingTop: 24,
  } as const;
  const renderStyle15 = {
    backgroundColor: investmentColor(host, '--uc-action-strong'),
  } as const;
  const renderStyle16 = {
    color: investmentColor(host, '--uc-static-white'),
  } as const;
  return (
    <View
      testID={`baseline-history-filter-${title}`}
      style={baselineStyles.inline18}
    >
      <View
        style={[
          baselineStyles.inline19,
          renderStyle11,
          baselineStyles.inline20,
          renderStyle12,
          baselineStyles.inline21,
        ]}
      >
        <View style={baselineStyles.inline22}>
          <Text style={[baselineStyles.inline23, renderStyle13]}>{title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close filters"
            onPress={onClose}
            style={baselineStyles.inline24}
          >
            <Svg width={32} height={32} viewBox="0 0 32 32">
              <Path d={sourceClosePath} fill="#262626" />
            </Svg>
          </Pressable>
        </View>
        <ScrollView
          style={[baselineStyles.inline25, investmentScrollStyle()]}
          contentContainerStyle={renderStyle14}
        >
          {children}
        </ScrollView>
        <View style={baselineStyles.inline26}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Apply"
            onPress={onApply}
            style={[
              baselineStyles.inline27,
              renderStyle15,
              baselineStyles.inline28,
            ]}
          >
            <Text style={[baselineStyles.inline29, renderStyle16]}>Apply</Text>
          </Pressable>
        </View>
        <HistoryHomeIndicator host={host} />
      </View>
    </View>
  );
}
function CalendarRange({
  host,
  filters,
  onChange,
  onClose,
}: {
  host: CurrentScreenProps;
  filters: InvestmentHistoryFilterState;
  onChange(filters: InvestmentHistoryFilterState): void;
  onClose(): void;
}) {
  const [range, setRange] = useState<
      | {
          from?: string;
          to?: string;
        }
      | undefined
    >({
      from: filters.customStartDate,
      to: filters.customEndDate,
    }),
    [month, setMonth] = useState(() =>
      parseIsoDateOnly(filters.customStartDate),
    );
  const first = new Date(month.getFullYear(), month.getMonth(), 1),
    offset = first.getDay(),
    days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
    cells = Math.ceil((offset + days) / 7) * 7;
  const text = {
    fontFamily: 'UniCredit-regular',
    color: investmentColor(host, '--uc-text'),
  };
  const action = (label: string, onPress: () => void, disabled = false) => {
    const renderStyle17 = {
      ...(label === 'Confirm'
        ? {
            marginLeft: 'auto' as const,
            width: 172,
            borderRadius: 4,
            alignItems: 'center' as const,
            backgroundColor: investmentColor(host, '--uc-action-strong'),
            opacity: disabled ? 0.4 : 1,
          }
        : {}),
    } as const;
    const renderStyle18 = {
      fontSize: label === 'Confirm' ? 18 : 12,
      color: investmentColor(
        host,
        label === 'Confirm' ? '--uc-static-white' : '--uc-action',
      ),
    } as const;
    return (
      <Pressable
        key={label}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{
          disabled,
        }}
        disabled={disabled}
        onPress={onPress}
        style={[baselineStyles.inline30, renderStyle17]}
      >
        <Text style={[baselineStyles.inline31, renderStyle18]}>{label}</Text>
      </Pressable>
    );
  };
  const renderStyle19 = {
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  const renderStyle20 = {
    ...text,
  } as const;
  const renderStyle25 = {
    ...text,
  } as const;
  return (
    <View testID="baseline-history-calendar" style={baselineStyles.inline32}>
      <View
        style={[
          baselineStyles.inline33,
          renderStyle19,
          baselineStyles.inline34,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to filters"
          onPress={onClose}
          style={baselineStyles.inline35}
        >
          <SourceCustomIcon
            name="chevron-down"
            size={24}
            color={investmentColor(host, '--uc-text')}
          />
        </Pressable>
        <Text style={[renderStyle20, baselineStyles.inline36]}>
          Select interval
        </Text>
        <View style={baselineStyles.inline37}>
          {['START DATE', 'END DATE'].map((label, index) => {
            const renderStyle21 = {
              ...text,
            } as const;
            const renderStyle22 = {
              textAlign: index ? 'right' : 'left',
            } as const;
            const renderStyle23 = {
              ...text,
            } as const;
            const renderStyle24 = {
              textAlign: index ? 'right' : 'left',
            } as const;
            return (
              <View key={label} style={baselineStyles.inline38}>
                <Text
                  style={[
                    renderStyle21,
                    baselineStyles.inline39,
                    renderStyle22,
                  ]}
                >
                  {label}
                </Text>
                <Text
                  style={[
                    renderStyle23,
                    baselineStyles.inline40,
                    renderStyle24,
                  ]}
                >
                  {(index ? range?.to : range?.from)
                    ? historyFilterDate(
                        (index ? range?.to : range?.from)!,
                        host,
                      )
                    : '—'}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={baselineStyles.inline41}>
          <View style={baselineStyles.inline42}>
            <Text style={[renderStyle25, baselineStyles.inline43]}>
              {new Intl.DateTimeFormat('en-US', {
                month: 'long',
                year: 'numeric',
              }).format(month)}
            </Text>
            {[-1, 1].map(direction => {
              const renderStyle26 = {
                left: direction < 0 ? 0 : undefined,
                right: direction > 0 ? 0 : undefined,
              } as const;
              return (
                <Pressable
                  key={direction}
                  accessibilityRole="button"
                  accessibilityLabel={
                    direction < 0 ? 'Go to previous month' : 'Go to next month'
                  }
                  onPress={() =>
                    setMonth(
                      new Date(
                        month.getFullYear(),
                        month.getMonth() + direction,
                        1,
                      ),
                    )
                  }
                  style={[
                    baselineStyles.inline44,
                    renderStyle26,
                    baselineStyles.inline45,
                  ]}
                >
                  <SourceCustomIcon
                    name={direction < 0 ? 'chevron-left' : 'chevron-right'}
                    size={16}
                    color={investmentColor(host, '--uc-text')}
                  />
                </Pressable>
              );
            })}
          </View>
          <View>
            <View style={baselineStyles.inline46}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(label => {
                const renderStyle27 = {
                  color: investmentColor(host, '--uc-text-muted'),
                } as const;
                return (
                  <View key={label} style={baselineStyles.inline47}>
                    <Text style={[baselineStyles.inline48, renderStyle27]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
            {Array.from(
              {
                length: cells / 7,
              },
              (_, week) => {
                return (
                  <View key={week} style={baselineStyles.inline49}>
                    {Array.from(
                      {
                        length: 7,
                      },
                      (_day, day) => {
                        const date = new Date(
                            first.getFullYear(),
                            first.getMonth(),
                            week * 7 + day - offset + 1,
                          ),
                          value = iso(date),
                          selected =
                            !!(
                              range?.from &&
                              range.to &&
                              value >= range.from &&
                              value <= range.to
                            ) || range?.from === value;
                        const renderStyle28 = {
                          borderTopLeftRadius: value === range?.from ? 20 : 0,
                          borderBottomLeftRadius:
                            value === range?.from ? 20 : 0,
                          borderTopRightRadius: value === range?.to ? 20 : 0,
                          borderBottomRightRadius: value === range?.to ? 20 : 0,
                          backgroundColor: selected
                            ? investmentColor(host, '--uc-action-strong')
                            : 'transparent',
                          borderWidth: value === iso(new Date()) ? 1 : 0,
                          borderColor: investmentColor(host, '--uc-text'),
                          opacity:
                            date.getMonth() !== month.getMonth() ? 0.4 : 1,
                        } as const;
                        const renderStyle29 = {
                          color: investmentColor(
                            host,
                            selected ? '--uc-static-white' : '--uc-text',
                          ),
                        } as const;
                        return (
                          <View key={day} style={baselineStyles.inline50}>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Select date ${value}`}
                              accessibilityState={{
                                selected,
                              }}
                              onPress={() =>
                                setRange(selectHistoryCalendarDay(value, range))
                              }
                              style={[baselineStyles.inline51, renderStyle28]}
                            >
                              <Text
                                style={[baselineStyles.inline52, renderStyle29]}
                              >
                                {date.getDate()}
                              </Text>
                            </Pressable>
                          </View>
                        );
                      },
                    )}
                  </View>
                );
              },
            )}
          </View>
        </View>
        <View style={baselineStyles.inline53}>
          {action('TODAY', () => {
            const today = iso(new Date());
            setRange({
              from: today,
              to: today,
            });
          })}
          {action('RESET', () => setRange(undefined))}
          {action(
            'Confirm',
            () => {
              if (range?.from && range.to) {
                onChange({
                  ...filters,
                  datePreset: 'define',
                  customStartDate: range.from,
                  customEndDate: range.to,
                });
                onClose();
              }
            },
            !range?.from || !range.to,
          )}
        </View>
      </View>
    </View>
  );
}
export function BaselineInvestmentHistoryFilters({
  host,
  mode,
  filters,
  currencies,
  tab,
  onClose,
  onApply,
  onChange,
  onMode,
  hideAllTimeDateOption = false,
  hideCurrencyFilter = false,
}: {
  host: CurrentScreenProps;
  mode: HistoryFilterMode;
  filters: InvestmentHistoryFilterState;
  currencies: readonly Currency[];
  tab: 'transactions' | 'orders';
  onClose(): void;
  onApply(): void;
  onChange(filters: InvestmentHistoryFilterState): void;
  onMode(mode: HistoryFilterMode): void;
  hideAllTimeDateOption?: boolean;
  hideCurrencyFilter?: boolean;
}) {
  const availableTypes = getHistoryTypesForTab(tab),
    primary = [getCountryConfig(host.country).currency, 'EUR', 'USD'].filter(
      (value, index, values): value is Currency =>
        currencies.includes(value as Currency) &&
        values.indexOf(value) === index,
    ),
    other = currencies.filter(c => !primary.includes(c));
  const change = <T extends string>(values: readonly T[], value: T) =>
    values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
  if (mode === 'currency' && hideCurrencyFilter) {
    onClose();
    return null;
  }
  if (mode === 'type' || mode === 'status' || mode === 'currency') {
    const values =
        mode === 'type'
          ? availableTypes
          : mode === 'status'
          ? HISTORY_STATUSES
          : currencies,
      selection =
        mode === 'type'
          ? filters.selectedTypes
          : mode === 'status'
          ? filters.selectedStatuses
          : filters.selectedCurrencies,
      key =
        mode === 'type'
          ? 'selectedTypes'
          : mode === 'status'
          ? 'selectedStatuses'
          : 'selectedCurrencies';
    const update = (selected: readonly string[]) =>
      onChange({
        ...filters,
        [key]: selected,
      });
    const renderStyle30 = {
      borderColor: investmentColor(host, '--uc-border'),
    } as const;
    return (
      <Scaffold
        host={host}
        title={
          mode === 'type'
            ? tab === 'orders'
              ? 'Select order type'
              : 'Select transaction type'
            : mode === 'status'
            ? 'Select order status'
            : 'Select transaction currency'
        }
        onClose={() => onMode('main')}
        onApply={onApply}
      >
        <View
          style={[
            baselineStyles.inline54,
            renderStyle30,
            baselineStyles.inline55,
          ]}
        >
          <Link
            host={host}
            label="SELECT ALL"
            onPress={() => update([...values])}
          />
          <Link host={host} label="CLEAR" onPress={() => update([])} />
        </View>
        {(mode === 'currency' ? primary : values).map(value => {
          return (
            <Check
              key={value}
              host={host}
              label={value}
              selected={(selection as readonly string[]).includes(value)}
              onPress={() =>
                update(change(selection as readonly string[], value))
              }
            />
          );
        })}
        {mode === 'currency' && other.length ? (
          <Check
            host={host}
            label="Other currencies"
            selected={other.every(c => filters.selectedCurrencies.includes(c))}
            onPress={() =>
              update(
                other.every(c => filters.selectedCurrencies.includes(c))
                  ? filters.selectedCurrencies.filter(c => !other.includes(c))
                  : [...new Set([...filters.selectedCurrencies, ...other])],
              )
            }
          />
        ) : null}
      </Scaffold>
    );
  }
  return (
    <View style={baselineStyles.inline56}>
      <Scaffold
        host={host}
        title="Apply filters"
        onClose={onClose}
        onApply={onApply}
      >
        <View style={baselineStyles.inline57}>
          <View>
            <FilterDivider host={host} title="BY DATE" />
            {INVESTMENT_HISTORY_DATE_OPTIONS.filter(
              option => !hideAllTimeDateOption || option.id !== 'all-time',
            ).map(option => {
              return (
                <Check
                  key={option.id}
                  host={host}
                  label={option.label}
                  selected={filters.datePreset === option.id}
                  radio
                  onPress={() => {
                    onChange({
                      ...filters,
                      datePreset: option.id,
                    });
                    if (option.id === 'define') onMode('calendar');
                  }}
                />
              );
            })}
            {filters.datePreset === 'define' ? (
              <FilterRow
                host={host}
                title="From - To"
                value={`${historyFilterDate(
                  filters.customStartDate,
                  host,
                )} - ${historyFilterDate(filters.customEndDate, host)}`}
                calendar
                onPress={() => onMode('calendar')}
              />
            ) : null}
          </View>
          <View>
            <FilterDivider host={host} title="OTHER FILTERS" />
            <FilterRow
              host={host}
              title="By type"
              value={
                filters.selectedTypes.length === availableTypes.length
                  ? 'All'
                  : filters.selectedTypes.join(', ') || 'None'
              }
              onPress={() => onMode('type')}
            />
            {tab === 'orders' ? (
              <FilterRow
                host={host}
                title="By status"
                value={
                  filters.selectedStatuses.length === HISTORY_STATUSES.length
                    ? 'All'
                    : filters.selectedStatuses.join(', ') || 'None'
                }
                onPress={() => onMode('status')}
              />
            ) : null}
            {hideCurrencyFilter ? null : (
              <FilterRow
                host={host}
                title="By currency"
                value={
                  filters.selectedCurrencies.length === currencies.length
                    ? 'All'
                    : filters.selectedCurrencies.join(', ') || 'None'
                }
                onPress={() => onMode('currency')}
              />
            )}
          </View>
        </View>
      </Scaffold>
      {mode === 'calendar' ? (
        <CalendarRange
          host={host}
          filters={filters}
          onChange={onChange}
          onClose={() => onMode('main')}
        />
      ) : null}
    </View>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
  },
  inline2: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  inline3: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline4: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline5: {
    borderWidth: 1,
  },
  inline6: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  inline7: {
    marginLeft: 8,
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 18,
  },
  inline8: {
    height: 96,
    width: '100%',
    // Source buttons leave a 7px inline line-box gap between filter rows.
    marginBottom: 7,
  },
  inline9: {
    position: 'absolute',
    left: 24,
    top: 7,
    height: 82,
    width: 295,
    gap: 4,
  },
  inline10: {
    height: 40,
    justifyContent: 'center',
    gap: 4,
  },
  inline11: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
  },
  inline12: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 22,
  },
  inline13: {
    height: 1,
    width: 295,
  },
  inline14: {
    position: 'absolute',
    left: 331,
    top: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline15: {
    height: 32,
    marginBottom: 16,
    paddingLeft: 24,
    paddingRight: 16,
    paddingTop: 6,
    justifyContent: 'center',
  },
  inline16: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 22,
  },
  inline17: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    width: 343,
    height: 1,
  },
  inline18: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.51)',
  },
  inline19: {
    position: 'absolute',
  },
  inline20: {
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  inline21: {
    paddingTop: 24,
  },
  inline22: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
  },
  inline23: {
    width: 287,
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  inline24: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline25: {
    flex: 1,
  },
  inline26: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inline27: {
    height: 48,
    borderRadius: 4,
  },
  inline28: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline29: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
  },
  inline30: {
    height: 48,
    justifyContent: 'center',
  },
  inline31: {
    fontFamily: 'UniCredit-bold',
  },
  inline32: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  inline33: {
    position: 'absolute',
    top: 164,
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  inline34: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inline35: {
    height: 28,
    width: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline36: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 32,
    marginTop: 10,
  },
  inline37: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 28,
  },
  inline38: {
    flex: 1,
  },
  inline39: {
    fontFamily: 'UniCredit-bold',
    fontSize: 12,
  },
  inline40: {
    fontSize: 16,
    marginTop: 6,
  },
  inline41: {
    marginTop: 18,
    gap: 14,
  },
  inline42: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline43: {
    fontFamily: 'UniCredit-bold',
    fontSize: 26,
  },
  inline44: {
    position: 'absolute',
  },
  inline45: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline46: {
    flexDirection: 'row',
  },
  inline47: {
    height: 32,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline48: {
    fontFamily: 'UniCredit-bold',
    fontSize: 12,
  },
  inline49: {
    flexDirection: 'row',
    marginTop: 2,
  },
  inline50: {
    height: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline51: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline52: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
  },
  inline53: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: 24,
    paddingBottom: 15,
  },
  inline54: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  inline55: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  inline56: {
    flex: 1,
  },
  inline57: {
    gap: 24,
  },
});

const sourceCalendarPath =
  'M25.125 14.125V23.5C25.125 24.8805 23.9659 25.9998 22.5361 26H7V14.125H25.125ZM9.5 23.708H12.625V20.583H9.5V23.708ZM14.5 23.708H17.625V20.583H14.5V23.708ZM9.5 19.333H12.625V16.208H9.5V19.333ZM14.5 19.333H17.625V16.208H14.5V19.333ZM19.5 19.333H22.625V16.208H19.5V19.333ZM25.125 12.25H7V8.5C7 7.11951 8.15913 6.00022 9.58887 6H25.125V12.25ZM10.2363 7.875C9.52117 7.87515 8.94238 8.43447 8.94238 9.125C8.94238 9.81491 9.52117 10.3748 10.2363 10.375C10.9516 10.375 11.5312 9.815 11.5312 9.125C11.5312 8.43438 10.9516 7.875 10.2363 7.875ZM21.8887 7.875C21.1734 7.875 20.5938 8.43438 20.5938 9.125C20.5938 9.815 21.1734 10.375 21.8887 10.375C22.6038 10.3749 23.1826 9.81491 23.1826 9.125C23.1826 8.43446 22.6038 7.87515 21.8887 7.875Z';
const sourceClosePath =
  'M22.3002 9.70973C21.9102 9.31973 21.2802 9.31973 20.8902 9.70973L16.0002 14.5897L11.1102 9.69973C10.7202 9.30973 10.0902 9.30973 9.70021 9.69973C9.31021 10.0897 9.31021 10.7197 9.70021 11.1097L14.5902 15.9997L9.70021 20.8897C9.31021 21.2797 9.31021 21.9097 9.70021 22.2997C10.0902 22.6897 10.7202 22.6897 11.1102 22.2997L16.0002 17.4097L20.8902 22.2997C21.2802 22.6897 21.9102 22.6897 22.3002 22.2997C22.6902 21.9097 22.6902 21.2797 22.3002 20.8897L17.4102 15.9997L22.3002 11.1097C22.6802 10.7297 22.6802 10.0897 22.3002 9.70973Z';
