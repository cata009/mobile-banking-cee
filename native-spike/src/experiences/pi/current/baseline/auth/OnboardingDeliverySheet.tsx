import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  DELIVERY_ADDRESSES,
  deliveryOutsideCoverage,
} from '@/features/ro-onboarding/delivery';
import { OnboardingSheet } from './OnboardingSheet';
import { RadioButton } from '../../../../../universal/RadioButton';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
export function OnboardingDeliverySheet({
  value,
  onConfirm,
  onClose,
}: {
  value: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(value || 'home');
  const [details, setDetails] = useState(false);
  return (
    <OnboardingSheet
      title="Your card delivery address"
      onClose={onClose}
      footer={
        <PrimaryButton label="Confirm" onPress={() => onConfirm(selected)} />
      }
    >
      {DELIVERY_ADDRESSES.map(address => (
        <View key={address.value}>
          <RadioButton
            label={address.label}
            selected={selected === address.value}
            onPress={() => setSelected(address.value)}
            paddingHorizontal={0}
            style={s.option}
            labelStyle={s.optionLabel}
          />
          {address.value === 'correspondence' &&
            selected === address.value &&
            deliveryOutsideCoverage(selected) && (
              <View style={s.error}>
                <Text style={s.errorText}>
                  The selected address is outside the courier's delivery
                  coverage area, so please enter another one. If you do not have
                  another address then your card will be delivered to the
                  Branch… See below for more details about the coverage area
                  available for the delivery of cards by courier.
                </Text>
                <BaselineNavigationLink
                  text="SEE DETAILS"
                  dark
                  onPress={() => setDetails(!details)}
                />
                {details && (
                  <Text style={s.errorText}>
                    Please be informed that you can choose only a delivery
                    address which is on the delivery area of Fan Courier.
                  </Text>
                )}
              </View>
            )}
        </View>
      ))}
      {selected === 'new' && (
        <View style={s.notice}>
          <Text style={s.body}>
            Please be informed that you can choose only a delivery address which
            is on the delivery area of Fan Courier.
          </Text>
        </View>
      )}
    </OnboardingSheet>
  );
}
const s = StyleSheet.create({
  option: { minHeight: 80 },
  optionLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    color: sourceColor('var(--uc-text)'),
  },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  notice: {
    borderWidth: 1,
    borderColor: sourceColor('var(--uc-text)'),
    borderRadius: 4,
    padding: 16,
  },
  error: {
    padding: 16,
    borderRadius: 4,
    gap: 16,
    backgroundColor: sourceColor('var(--uc-status-red)'),
  },
  errorText: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-static-white)'),
  },
});
