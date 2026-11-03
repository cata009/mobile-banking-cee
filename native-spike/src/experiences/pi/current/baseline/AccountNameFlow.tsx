import React, { useState } from 'react';
import { View } from 'react-native';
import { MAX_ACCOUNT_NAME_LENGTH } from '@/features/accounts-payments/accountNameOverrides';
import type { CurrentScreenProps } from '../contracts';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

export function AccountNameFlow({
  host,
  currentName,
  onClose,
  onSave,
}: {
  host: CurrentScreenProps;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const normalizedName = name.trim();
  const unchanged = normalizedName === currentName;
  const disabled =
    !normalizedName ||
    normalizedName.length > MAX_ACCOUNT_NAME_LENGTH ||
    unchanged;

  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title="Change account name"
        onClose={onClose}
        width={viewport.width}
        height={viewport.height}
        fillHeight
        dark={dark}
        footer={
          <View style={styles.footer}>
            <PrimaryButton
              label="SAVE"
              labelSize="18"
              disabled={disabled}
              onPress={() => {
                if (!disabled) {
                  onSave(normalizedName);
                  onClose();
                }
              }}
              dark={dark}
            />
          </View>
        }
      >
        <BaselineTextField
          label="NAME"
          ariaLabel="Account name"
          value={name}
          onChange={setName}
          maxLength={MAX_ACCOUNT_NAME_LENGTH}
          dark={dark}
        />
        <View style={styles.counterRow}>
          <Text style={[styles.helper, { color: host.tokens.muted }]}>
            Up to {MAX_ACCOUNT_NAME_LENGTH} characters
          </Text>
          <Text
            testID="ro-account-name-character-count"
            style={[styles.counter, { color: host.tokens.muted }]}
          >
            {name.length} / {MAX_ACCOUNT_NAME_LENGTH}
          </Text>
        </View>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}

const styles = {
  counterRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingTop: 8,
  },
  helper: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 18 },
  counter: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 18 },
  footer: { paddingTop: 8, paddingBottom: 8 },
} as const;
