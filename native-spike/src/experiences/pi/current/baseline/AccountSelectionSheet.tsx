import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import type { CurrentScreenProps } from '../contracts';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { AppointmentSheet } from './more/appointment/Sheets';
import { AppointmentHost } from './more/appointment/Ui';

export interface AccountSelectionOption {
  id: string;
  name: string;
  detail?: string;
  balance?: number;
  currency?: string;
  /** Preformatted values support existing investment-account contracts. */
  balanceText?: string;
}
export function AccountSelectionSheet({
  host,
  title,
  options,
  selectedId,
  onClose,
  onConfirm,
}: {
  host: CurrentScreenProps;
  title: string;
  options: readonly AccountSelectionOption[];
  selectedId: string;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  const [draft, setDraft] = useState(selectedId);
  const dark = host.tokens.background === '#121212';
  return (
    <AppointmentHost host={host}>
      <AppointmentSheet
        title={title}
        headerGap={12}
        onClose={onClose}
        footer={
          <PrimaryButton
            label="Select"
            dark={dark}
            disabled={!options.some(option => option.id === draft)}
            onPress={() => onConfirm(draft)}
          />
        }
      >
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={title}
          style={styles.options}
        >
          {options.map(option => {
            const numericBalance =
              option.balance === undefined
                ? undefined
                : `${maskFormattedAmount(formatMoneyNumber(option.balance, host.country), host.amountsHidden)} ${option.currency ?? ''}`.trim();
            const balance =
              option.balanceText && host.amountsHidden
                ? `${maskFormattedAmount(option.balanceText, true)} ${option.currency ?? option.balanceText.match(/\b[A-Z]{3}\s*$/)?.[0] ?? ''}`.trim()
                : (option.balanceText ?? numericBalance);
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityLabel={[option.name, option.detail]
                  .filter(Boolean)
                  .join(', ')}
                accessibilityValue={balance ? { text: balance } : undefined}
                accessibilityState={{ checked: option.id === draft }}
                onPress={() => setDraft(option.id)}
                style={styles.option}
              >
                <SourceCustomIcon
                  name={
                    option.id === draft ? 'radio-selected' : 'radio-unselected'
                  }
                  size={24}
                  color={host.tokens.text}
                />
                <View style={styles.copy}>
                  <Text style={[styles.name, { color: host.tokens.text }]}>
                    {option.name}
                  </Text>
                  {option.detail ? (
                    <Text style={[styles.detail, { color: host.tokens.muted }]}>
                      {option.detail}
                    </Text>
                  ) : null}
                  {balance ? (
                    <Text style={[styles.detail, { color: host.tokens.muted }]}>
                      {balance}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </AppointmentSheet>
    </AppointmentHost>
  );
}
const styles = StyleSheet.create({
  options: { paddingBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 56,
  },
  copy: { flex: 1 },
  name: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  detail: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 17 },
});
