import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  resolveRadioButton,
  type RadioButtonOptions,
} from '@/app/components/contracts/radioButton';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
import { SourceCustomIcon } from './SourceCustomIcon';

/** Isolated controlled-row pilot, using the original Source icon artwork. */
export function RadioButton({
  label,
  onPress,
  dark = false,
  ...options
}: RadioButtonOptions & {
  label: string;
  onPress: () => void;
  dark?: boolean;
}) {
  const contract = resolveRadioButton(options);
  const [hovered, setHovered] = useState(false);
  const markStyle = {
    ...styles.mark,
    width: contract.slotSize,
    height: contract.slotSize,
  };
  const iconVariables = {
    '--uc-surface': sourceColor('var(--uc-surface)', dark),
    '--uc-action': sourceColor('var(--uc-action)', dark),
  };
  const rowStateStyle = {
    height: contract.height,
    paddingHorizontal: contract.paddingHorizontal,
    paddingVertical: contract.paddingVertical,
    gap: contract.gap,
    backgroundColor: contract.backgroundToken
      ? sourceColor(`var(${contract.backgroundToken})`, dark)
      : undefined,
    opacity: hovered ? contract.hoverOpacity : 1,
  };
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: contract.selected }}
      aria-checked={contract.selected}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.row, rowStateStyle]}
    >
      <View
        style={markStyle}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <SourceCustomIcon
          name={contract.selectedIcon}
          size={contract.iconSize}
          color={sourceColor(`var(${contract.iconToken})`, dark)}
          variables={iconVariables}
        />
      </View>
      <Text
        style={[
          styles.label,
          {
            fontSize: contract.fontSize,
            lineHeight:
              typeof contract.lineHeight === 'number'
                ? contract.lineHeight
                : undefined,
            color: sourceColor(`var(${contract.labelToken})`, dark),
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  mark: { flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: 'UniCredit-bold', flexShrink: 1 },
});
