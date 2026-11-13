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
  description,
  onPress,
  dark = false,
  paddingHorizontal,
  ...options
}: RadioButtonOptions & {
  label: string;
  description?: string;
  onPress: () => void;
  dark?: boolean;
  /** Override the row inset when its parent surface already supplies one. */
  paddingHorizontal?: number;
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
    paddingHorizontal: paddingHorizontal ?? contract.paddingHorizontal,
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
      accessibilityLabel={description ? `${label}. ${description}` : label}
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
      <View style={styles.copy}>
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
        {description ? (
          <Text style={[styles.description, { color: sourceColor('var(--uc-text-muted)', dark) }]}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  mark: { flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  label: { fontFamily: 'UniCredit-bold', flexShrink: 1 },
  description: { fontFamily: 'UniCredit-regular', fontSize: 15, lineHeight: 20 },
});
