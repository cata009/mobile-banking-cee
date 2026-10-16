import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  resolveSectionDivider,
  type SectionDividerOptions,
} from '@/app/components/contracts/sectionDivider';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Isolated leaf: section, Meniga and light-restyle geometry remain distinct. */
export function BaselineSectionDivider({
  title,
  dark = false,
  ...options
}: SectionDividerOptions & { title: string; dark?: boolean }) {
  const state = resolveSectionDivider(options);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const titleLineHeight =
    state.variant === 'medium-title'
      ? 15
      : typeof state.lineHeight === 'number'
        ? state.lineHeight
        : undefined;
  const titleStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    lineHeight: titleLineHeight,
    color: color(state.titleToken),
    flexShrink: 1,
  };
  const otherStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: state.light || state.variant !== 'section' ? 14 : undefined,
    color: color(state.variant === 'section' ? '--uc-text-muted' : '--uc-text'),
  };
  const viewStyle1 = {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: color(state.lineToken),
    marginTop: state.lineMarginTop,
  } as const;
  const line = <View style={viewStyle1} />;
  const viewStyle2 = [
    styles.row,
    {
      gap: 8,
      justifyContent:
        state.alignCountToEnd && state.hasCount
          ? 'space-between'
          : 'flex-start',
    },
  ] as const;
  const textStyle3 = [titleStyle, { textTransform: 'uppercase' }] as const;
  if (state.variant === 'section')
    return (
      <View>
        <View style={viewStyle2}>
          <Text numberOfLines={2} style={textStyle3}>
            {title}
          </Text>
          {state.hasCount ? (
            <Text
              accessibilityLabel={`${title} count ${options.count}`}
              style={otherStyle}
            >
              {options.count}
            </Text>
          ) : null}
        </View>
        {line}
      </View>
    );
  const viewStyle4 = {
    width: state.width,
    paddingHorizontal: state.paddingHorizontal,
    backgroundColor: color('--uc-surface'),
  } as const;
  if (state.large)
    return (
      <View style={viewStyle4}>
        <Text style={titleStyle}>
          {title}
          {state.variant === 'large-two-line-title' && options.secondaryText
            ? `\n${options.secondaryText}`
            : ''}
        </Text>
      </View>
    );
  const viewStyle5 = {
    width: state.width,
    height: state.height,
    justifyContent: 'flex-end',
  } as const;
  const viewStyle6 = [
    styles.row,
    {
      paddingHorizontal: state.paddingHorizontal,
      gap: 8,
      justifyContent: 'space-between',
    },
  ] as const;
  if (state.light)
    return (
      <View style={viewStyle5}>
        <View style={viewStyle6}>
          <Text numberOfLines={1} style={titleStyle}>
            {title}
          </Text>
          {options.secondaryText ? (
            <Text style={otherStyle}>{options.secondaryText}</Text>
          ) : null}
          {state.hasCount ? (
            <Text style={otherStyle}>{options.count}</Text>
          ) : null}
        </View>
        {line}
      </View>
    );
  const viewStyle7 = {
    width: state.width,
    minHeight: state.minHeight,
    paddingHorizontal: state.paddingHorizontal,
    paddingVertical: state.paddingVertical,
    gap: state.gap,
    backgroundColor: color('--uc-surface'),
  } as const;
  const viewStyle8 = [
    styles.row,
    { minHeight: 14, justifyContent: 'space-between', gap: 8 },
  ] as const;
  const viewStyle9 = [styles.row, { flexShrink: 1, gap: 4 }] as const;
  const viewStyle10 = {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const viewStyle11 = {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: color('--uc-text'),
    backgroundColor: color('--uc-surface'),
  } as const;
  return (
    <View style={viewStyle7}>
      <View style={viewStyle8}>
        <View style={viewStyle9}>
          {state.checkbox ? (
            <View accessible={false} style={viewStyle10}>
              <View style={viewStyle11} />
            </View>
          ) : null}
          <Text style={titleStyle}>{title}</Text>
        </View>
        {state.rightText ? (
          <Text style={otherStyle}>{state.rightText}</Text>
        ) : null}
      </View>
      {state.hasLine ? line : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
