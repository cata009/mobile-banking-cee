import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  resolveStatusTag,
  type StatusTagTone,
} from '@/app/components/contracts/statusTag';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

const tint = (hex: string, percent: number) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const alpha = Math.round((percent / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alpha}`;
};

/** The Design System status tag: tinted rounded label with an optional dot in the tone color. */
export function BaselineStatusTag({
  label,
  tone = 'neutral',
  dot = true,
  dark = false,
}: {
  label: string;
  tone?: StatusTagTone;
  dot?: boolean;
  dark?: boolean;
}) {
  const tag = resolveStatusTag({ tone, dot });
  const color = sourceColor(`var(${tag.textToken})`, dark);
  const fill = sourceColor(`var(${tag.fillToken})`, dark);
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[
        styles.root,
        {
          gap: tag.gap,
          paddingHorizontal: tag.paddingHorizontal,
          paddingVertical: tag.paddingVertical,
          backgroundColor:
            tag.tintPercent === 0 ? fill : tint(fill, tag.tintPercent),
        },
      ]}
    >
      {tag.showDot ? (
        <View
          style={{
            width: tag.dotSize,
            height: tag.dotSize,
            borderRadius: tag.dotSize / 2,
            backgroundColor: color,
          }}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          { fontSize: tag.fontSize, lineHeight: tag.lineHeight, color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  label: { fontFamily: 'UniCredit-bold' },
});
