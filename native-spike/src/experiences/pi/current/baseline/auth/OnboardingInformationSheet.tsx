import React from 'react';
import {
  ONBOARDING_INFORMATION,
  type OnboardingInformationKind,
} from '@/features/ro-onboarding/information';
import { OnboardingSheet } from './OnboardingSheet';
import { CASH_LOAN_INFORMATION } from '@/features/ro-cash-loan/information';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
export function OnboardingInformationSheet({
  kind,
  onClose,
  cashLoan = false,
}: {
  kind: OnboardingInformationKind;
  onClose: () => void;
  cashLoan?: boolean;
}) {
  const source =
    (cashLoan && CASH_LOAN_INFORMATION[kind]) || ONBOARDING_INFORMATION[kind];
  return (
    <OnboardingSheet
      title={source.title}
      onClose={onClose}
      footer={
        <PrimaryButton
          label={kind === 'resumePassword' ? 'Ok' : 'Am inteles'}
          onPress={onClose}
        />
      }
    >
      <Text
        style={{
          fontFamily: 'UniCredit-regular',
          fontSize: 18,
          lineHeight: 24,
          color: sourceColor('var(--uc-text)'),
        }}
      >
        {source.body}
      </Text>
    </OnboardingSheet>
  );
}
