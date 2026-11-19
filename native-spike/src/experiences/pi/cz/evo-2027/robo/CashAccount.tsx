import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import fundingChevronDown from '@/assets/investments/robo/funding-chevron-down.svg';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { displayRoboAccountNumber } from '@/features/investments/robo/presentationData';
import type { CurrentAccount } from '@/data/products';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import {
  Button,
  Choice,
  Copy,
  czInvestmentTokens,
} from '../investments/Primitives';

export function CashAccountIntroduction() {
  return (
    <View style={styles.introduction}>
      <Copy strong style={styles.heading}>
        Choose the account to use
      </Copy>
      <Copy style={styles.explanation}>
        We’ll use this account for your first and future investments.
      </Copy>
    </View>
  );
}

export function CashAccountField({
  account,
  amountsHidden,
  expanded,
  onOpen,
  disabled,
  announceAccountName = false,
}: {
  account?: CurrentAccount | null;
  amountsHidden: boolean;
  expanded: boolean;
  onOpen: () => void;
  disabled?: boolean;
  announceAccountName?: boolean;
}) {
  return (
    <BaselineTextField
      label={announceAccountName ? 'Cash Account' : 'Cash account'}
      ariaLabel={
        announceAccountName && account
          ? `Cash account, ${account.name}`
          : 'Cash account'
      }
      value={
        account ? displayRoboAccountNumber(account.accountNumber, 'CZ') : ''
      }
      placeholder="Select cash account"
      onChange={() => undefined}
      readOnly
      disabled={disabled}
      trailingIcon={<AssetGlyph asset={fundingChevronDown} size={32} />}
      trailingIconSize={32}
      helperText={account?.name}
      helperText2={
        account
          ? `Available balance ${formatInvestmentMoney(account.balance, 'CZ', account.currency, amountsHidden)}`
          : undefined
      }
      onActivate={onOpen}
      selectionControl={{ expanded, onPress: onOpen }}
    />
  );
}

export function CashAccountSheet({
  accounts,
  selectedId,
  amountsHidden,
  onClose,
  onSelect,
}: {
  accounts: readonly CurrentAccount[];
  selectedId: string;
  amountsHidden: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const { width, height } = useDemoViewport();
  const [draftId, setDraftId] = useState(selectedId);
  const available = accounts.some(account => account.id === draftId);
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title="Select cash account"
        closeLabel="Close cash accounts"
        onClose={onClose}
        width={width}
        height={height}
        hostedInModal
        footer={
          <View style={styles.footer}>
            <Button
              label="Select"
              disabled={!available}
              onPress={() => {
                if (!available) return;
                onSelect(draftId);
                onClose();
              }}
            />
          </View>
        }
      >
        <View
          role="radiogroup"
          accessibilityLabel="Select cash account"
          style={styles.options}
        >
          {accounts.map(account => {
            const detail = displayRoboAccountNumber(
              account.accountNumber,
              'CZ',
            );
            const balance = formatInvestmentMoney(
              account.balance,
              'CZ',
              account.currency,
              amountsHidden,
            );
            return (
              <View key={account.id} style={styles.option}>
                <Choice
                  variant="radio"
                  title={account.name}
                  description={`${detail}\n${balance}`}
                  label={`${account.name}, ${detail}, ${balance}`}
                  selected={draftId === account.id}
                  onPress={() => setDraftId(account.id)}
                  titleStyle={styles.optionTitle}
                  descriptionStyle={styles.optionDescription}
                />
              </View>
            );
          })}
        </View>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}

const styles = StyleSheet.create({
  introduction: { gap: 16 },
  heading: { fontSize: 18, lineHeight: 21 },
  explanation: { fontSize: 16, lineHeight: 18 },
  footer: { paddingTop: 8 },
  options: { gap: 8 },
  option: { minHeight: 80, paddingHorizontal: 8, paddingVertical: 12 },
  optionTitle: { fontSize: 18, lineHeight: 21 },
  optionDescription: { color: czInvestmentTokens.muted },
});
