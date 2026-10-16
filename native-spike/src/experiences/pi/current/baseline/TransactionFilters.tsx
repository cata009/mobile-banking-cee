import React, { useState, type CSSProperties } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  hasAccountTransactionFilters,
  type AccountTransactionFilterState,
  type AccountTransactionDateFilter,
} from '@/features/accounts-payments/evoTransactionFilters';
import type { CurrentScreenProps } from '../contracts';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { Text } from '../../../../universal/Typography';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { resolveRadioButton } from '@/app/components/contracts/radioButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';
const untransformedWebStyle = {
  transform: 'none',
} satisfies CSSProperties;
const disabledWebButtonStyle = untransformedWebStyle as unknown as ViewStyle;
export function RoBaselineTransactionFilters({
  host,
  currency,
  filters,
  onApply,
  onClose,
}: {
  host: CurrentScreenProps;
  currency: string;
  filters: AccountTransactionFilterState;
  onApply: (filters: AccountTransactionFilterState) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(filters),
    { height } = useDemoViewport(),
    dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const surface = sourceColor('var(--uc-surface)', dark);
  const patch = (change: Partial<AccountTransactionFilterState>) => {
    return setDraft(current => {
      return {
        ...current,
        ...change,
      };
    });
  };
  const section = (title: string, children: React.ReactNode) => {
    const sourceStyle0 = {
      gap: 16,
    } as const;
    const sourceStyle1 = {
      height: 32,
      paddingLeft: 24,
      paddingRight: 16,
      paddingTop: 6,
      justifyContent: 'center',
      backgroundColor: surface,
    } as const;
    const sourceStyle2 = {
      fontFamily: 'UniCredit-bold',
      fontSize: 18,
      lineHeight: 22,
      color: host.tokens.text,
    } as const;
    const sourceStyle3 = {
      position: 'absolute',
      bottom: 0,
      left: 16,
      right: 16,
      height: 1,
      backgroundColor: host.tokens.border,
    } as const;
    return (
      <View style={sourceStyle0}>
        <View style={sourceStyle1}>
          <Text style={sourceStyle2}>{title}</Text>
          <View style={sourceStyle3} />
        </View>
        {children}
      </View>
    );
  };
  const field = (
    key: 'keyword' | 'accountNumber' | 'variableCode',
    label: string,
  ) => {
    const sourceStyle4 = {
      height: 64,
      paddingHorizontal: 24,
      paddingTop: 4,
    } as const;
    return (
      <View style={sourceStyle4}>
        <BaselineTextField
          label={label}
          value={draft[key]}
          onChange={value => {
            return patch({
              [key]: value,
            });
          }}
          dark={dark}
        />
      </View>
    );
  };
  const amount = (key: 'amountFrom' | 'amountTo', label: string) => {
    const sourceStyle5 = {
      height: 96,
      paddingHorizontal: 24,
      paddingTop: 14,
      flexDirection: 'row',
      gap: 24,
    } as const;
    const sourceStyle6 = {
      width: 208,
    } as const;
    const sourceStyle7 = {
      paddingTop: 2,
      width: 66,
    } as const;
    const sourceStyle8 = {
      fontSize: 14,
      lineHeight: 16,
      color: host.tokens.muted,
    } as const;
    const sourceStyle9 = {
      fontSize: 18,
      lineHeight: 22,
      color: host.tokens.text,
    } as const;
    return (
      <View style={sourceStyle5}>
        <View style={sourceStyle6}>
          <BaselineTextField
            label={label}
            value={draft[key]}
            onChange={value => {
              return patch({
                [key]: value,
              });
            }}
            dark={dark}
          />
        </View>
        <View style={sourceStyle7}>
          <Text style={sourceStyle8}>Currency</Text>
          <Text style={sourceStyle9}>{currency}</Text>
        </View>
      </View>
    );
  };
  const inert = (label: string, value: string) => {
    const sourceStyle10 = {
      height: 96,
    } as const;
    const sourceStyle11 = {
      position: 'absolute',
      left: 24,
      top: 14,
      width: 295,
    } as const;
    const sourceStyle12 = {
      fontSize: 14,
      lineHeight: 16,
      color: host.tokens.muted,
    } as const;
    const sourceStyle13 = {
      marginTop: 4,
      fontSize: 18,
      lineHeight: 22,
      color: host.tokens.text,
    } as const;
    const sourceStyle14 = {
      marginTop: 7,
      height: 1,
      backgroundColor: host.tokens.border,
    } as const;
    const sourceStyle15 = {
      position: 'absolute',
      left: 331,
      top: 20,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    } as const;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={sourceStyle10}
      >
        <View style={sourceStyle11}>
          <Text style={sourceStyle12}>{label}</Text>
          <Text style={sourceStyle13}>{value}</Text>
          <View style={sourceStyle14} />
        </View>
        <View style={sourceStyle15}>
          <SourceCustomIcon
            name="chevron-down"
            size={20}
            color={host.tokens.text}
          />
        </View>
      </Pressable>
    );
  };
  const sourceStyle16 = {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: sourceColor('var(--uc-overlay)', dark),
  } as const;
  const sourceStyle17 = {
    maxHeight: height - 54,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: sourceColor('var(--uc-surface)', dark),
    boxShadow: `0 -8px 24px ${sourceColor(
      'rgb(var(--uc-shadow-rgb)/0.18)',
      dark,
    )}`,
    paddingTop: 24,
    overflow: 'hidden',
  } as const;
  const sourceStyle18 = {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  } as const;
  const sourceStyle19 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 31,
    color: host.tokens.text,
  } as const;
  const sourceStyle20 = {
    width: 32,
    height: 32,
  } as const;
  const sourceStyle21 = {
    flexShrink: 1,
  } as const;
  const sourceStyle22 = {
    gap: 24,
    paddingBottom: 24,
  } as const;
  const sourceStyle23 = {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: surface,
  } as const;
  const sourceStyle24 = {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: surface,
  } as const;
  const sourceStyle25 = {
    height: 5,
    width: 134,
    borderRadius: 999,
    backgroundColor: sourceColor('var(--uc-static-black)', dark),
  } as const;
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={sourceStyle16}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={sourceStyle17}>
          <View style={sourceStyle18}>
            <Text style={sourceStyle19}>Apply filters</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={sourceStyle20}
            >
              <SourceCustomIcon
                name="close-x"
                size={32}
                color={host.tokens.text}
              />
            </Pressable>
          </View>
          <ScrollView style={sourceStyle21} keyboardShouldPersistTaps="handled">
            <View style={sourceStyle22}>
              {section(
                'SEARCH BY TRANSACTION DETAIL',
                <View>
                  {field('keyword', 'Search by keyword')}
                  {field('accountNumber', 'Search by account number')}
                  {field('variableCode', 'Search by variable code')}
                </View>,
              )}
              {section(
                'SEARCH BY DATE',
                <View>
                  {(
                    [
                      ['last-week', 'LAST WEEK'],
                      ['last-month', 'LAST MONTH'],
                      ['last-3-months', 'LAST 3 MONTHS'],
                      ['custom', 'SELECT CUSTOM PERIOD'],
                    ] as [AccountTransactionDateFilter, string][]
                  ).map(([id, label]) => {
                    return (
                      <DateOption
                        key={id}
                        label={label}
                        selected={draft.datePreset === id}
                        onPress={() => {
                          return patch({
                            datePreset: draft.datePreset === id ? 'none' : id,
                          });
                        }}
                        dark={dark}
                      />
                    );
                  })}
                </View>,
              )}
              {section(
                'SEARCH BY AMOUNT',
                <View>
                  {amount('amountFrom', 'From')}
                  {amount('amountTo', 'To')}
                </View>,
              )}
              {section(
                'BY STATUS',
                <View>
                  {inert('Select status', draft.status)}
                  {inert('Transaction type', draft.transactionType)}
                </View>,
              )}
              {section(
                'SEARCH BY CATEGORY',
                inert('Select category', draft.category),
              )}
            </View>
          </ScrollView>
          <View style={sourceStyle23}>
            <PrimaryButton
              label="Apply"
              labelSize="18"
              disabled={!hasAccountTransactionFilters(draft)}
              onPress={() => {
                return onApply(draft);
              }}
              dark={dark}
              style={
                Platform.OS === 'web' && !hasAccountTransactionFilters(draft)
                  ? disabledWebButtonStyle
                  : undefined
              }
            />
          </View>
          <View style={sourceStyle24}>
            <View style={sourceStyle25} />
          </View>
        </View>
      </View>
    </ModalPortal>
  );
}

/** Source date-filter composition on its already-painted panel surface; selection remains owned above. */
function DateOption({
  label,
  selected,
  onPress,
  dark,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  dark: boolean;
}) {
  const state = resolveRadioButton({
      selected,
      variant: 'date-filter',
    }),
    color = sourceColor('var(--uc-text)', dark);
  const sourceStyle26 = {
    height: state.height,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: state.gap,
    paddingHorizontal: state.paddingHorizontal,
  } as const;
  const sourceStyle27 = {
    width: state.slotSize,
    height: state.slotSize,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const sourceStyle28 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    lineHeight:
      typeof state.lineHeight === 'number' ? state.lineHeight : undefined,
    color,
  } as const;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{
        checked: selected,
      }}
      onPress={onPress}
      style={sourceStyle26}
    >
      <View style={sourceStyle27}>
        <SourceCustomIcon
          name={state.selectedIcon}
          size={state.iconSize}
          color={color}
          variables={{
            '--uc-surface': sourceColor('var(--uc-surface)', dark),
            '--uc-action': sourceColor('var(--uc-action)', dark),
          }}
        />
      </View>
      <Text style={sourceStyle28}>{label}</Text>
    </Pressable>
  );
}
