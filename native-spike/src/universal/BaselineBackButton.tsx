import React from 'react';
import { Pressable } from 'react-native';
import { BACK_BUTTON_CONTRACT } from '@/app/components/contracts/backButton';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

/** Isolated 32px legacy leaf; does not replace PageHeader actions. */
export function BaselineBackButton({
  onPress,
  dark = false,
}: {
  onPress: () => void;
  dark?: boolean;
}) {
  const buttonStyle = {
    width: BACK_BUTTON_CONTRACT.size,
    height: BACK_BUTTON_CONTRACT.size,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={BACK_BUTTON_CONTRACT.label}
      onPress={onPress}
      style={buttonStyle}
    >
      <SourceCustomIcon
        name={BACK_BUTTON_CONTRACT.icon}
        size={20}
        color={sourceColor('var(--uc-text)', dark)}
      />
    </Pressable>
  );
}
