import React from 'react';
import {
  Pressable,
  Platform,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolveSectionDivider,
  type SectionDividerOptions,
  type SectionDividerInteractions,
} from '@/app/components/contracts/sectionDivider';
import {
  DIVIDER_RULE_327,
  DIVIDER_RULE_343,
  DIVIDER_RULE_LIGHT,
} from '@/app/components/contracts/dividerArtwork';
import { Text } from './Typography';
import { sourceCustomIconXml } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

/** The thirteen source variants share geometry with web; the legacy section composition stays distinct. */
export function BaselineSectionDivider({
  title,
  dark = false,
  onAction,
  checked = false,
  onCheckedChange,
  disabled = false,
  ruleOnly = false,
  ...options
}: SectionDividerOptions &
  SectionDividerInteractions & {
    title: string;
    dark?: boolean;
    ruleOnly?: boolean;
  }) {
  const state = resolveSectionDivider(options);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  if (ruleOnly)
    return (
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: options.width ?? 375,
          maxWidth: '100%',
          height: 1,
          backgroundColor: '#909090',
        }}
      />
    );
  const titleStyle: TextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    lineHeight:
      typeof state.lineHeight === 'number' ? state.lineHeight : undefined,
    includeFontPadding: state.variant === 'section' ? undefined : false,
    color: color(state.titleToken),
    flexShrink: 1,
  };
  const secondaryStyle: TextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: state.variant === 'section' ? undefined : 15,
    includeFontPadding: state.variant === 'section' ? undefined : false,
    color: color(
      state.variant === 'section' ? '--uc-text-muted' : state.secondaryToken,
    ),
    flexShrink: 0,
    maxWidth: '100%',
    textAlign: state.secondaryAlign,
    minWidth: state.secondaryMinWidth,
  };
  const sectionRowStyle: ViewStyle = {
    gap: 8,
    justifyContent:
      state.alignCountToEnd && state.hasCount ? 'space-between' : 'flex-start',
  };
  const sectionRuleStyle: ViewStyle = {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: color(state.lineToken),
    marginTop: state.lineMarginTop,
  };
  if (state.variant === 'section')
    return (
      <View>
        <View style={[styles.row, sectionRowStyle]}>
          <Text
            accessibilityRole="header"
            aria-level={2}
            numberOfLines={2}
            style={[titleStyle, styles.sectionTitle]}
          >
            {title}
          </Text>
          {state.hasCount ? (
            <Text
              accessibilityLabel={`${title} count ${options.count}`}
              style={secondaryStyle}
            >
              {options.count}
            </Text>
          ) : null}
        </View>
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={sectionRuleStyle}
        />
      </View>
    );
  const rootStyle: ViewStyle = {
    width: state.width,
    maxWidth: '100%',
    position: 'relative',
    minHeight: state.minHeight,
    paddingHorizontal: state.light ? undefined : state.paddingHorizontal,
    paddingLeft: state.light ? state.outerPaddingLeft : state.paddingHorizontal,
    paddingRight: state.light
      ? state.outerPaddingRight
      : state.paddingHorizontal,
    paddingVertical: state.paddingVertical,
    gap: state.light || state.large ? 0 : state.gap,
    backgroundColor: state.backgroundToken
      ? color(state.backgroundToken)
      : undefined,
  };
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: state.light || state.large ? 'nowrap' : 'wrap',
    columnGap: state.rowGap,
    rowGap: state.gap,
    minHeight: state.light
      ? state.height
      : state.large
        ? undefined
        : state.rowMinHeight,
    paddingHorizontal: state.light ? state.paddingHorizontal : 0,
  };
  const primaryStyle: TextStyle = {
    ...titleStyle,
    flexGrow: 1,
    flexBasis: 0,
    minWidth: state.light || state.large ? 0 : 32,
  };
  const titleContent =
    state.large &&
    state.variant === 'large-two-line-title' &&
    options.secondaryText
      ? `${title}\n${options.secondaryText}`
      : title;
  const actionPadding: ViewStyle = { paddingVertical: 8, marginVertical: -8 };
  const checkboxStyle: ViewStyle = {
    ...styles.checkboxShape,
    borderColor: color('--uc-text'),
    backgroundColor: color(checked ? '--uc-text' : '--uc-surface'),
  };
  const glyph = checked
    ? sourceCustomIconXml('check', color('--uc-surface'))?.replace(
        'stroke-width="3"',
        'stroke-width="2"',
      )
    : undefined;
  // RN Web's PressResponder treats Space as activation only for button/menuitem roles.
  // The native checkbox keeps its platform interaction; the compiled Web host supplies Space explicitly.
  const selectionKeyboardProps: Pick<
    React.ComponentProps<typeof Pressable>,
    'onKeyDown'
  > = Platform.OS === 'web'
    ? {
        onKeyDown: event => {
          const key: unknown = Reflect.get(event, 'key');
          const repeat = Reflect.get(event, 'repeat') === true;
          if (
            (key === ' ' || key === 'Spacebar') &&
            !disabled &&
            onCheckedChange
          ) {
            event.preventDefault();
            if (!repeat) onCheckedChange(!checked);
          }
        },
      }
    : {};
  const primary = state.checkbox ? (
    <Pressable
      {...selectionKeyboardProps}
      accessibilityRole="checkbox"
      accessibilityLabel={title}
      accessibilityState={{ checked, disabled: disabled || !onCheckedChange }}
      aria-checked={checked}
      disabled={disabled || !onCheckedChange}
      onPress={() => {
        if (!disabled) onCheckedChange?.(!checked);
      }}
      style={[styles.row, styles.selection]}
    >
      <View accessible={false} style={styles.selectionSlot}>
        <View style={checkboxStyle}>
          {glyph ? <SvgXml xml={glyph} width={14} height={14} /> : null}
        </View>
      </View>
      <Text testID="divider-title" style={primaryStyle}>
        {title}
      </Text>
    </Pressable>
  ) : state.primaryAction ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || !onAction }}
      disabled={disabled || !onAction}
      onPress={() => {
        if (!disabled) onAction?.();
      }}
      style={[actionPadding, styles.primaryAction]}
    >
      <Text testID="divider-title" style={titleStyle}>
        {title}
      </Text>
    </Pressable>
  ) : (
    <Text
      testID="divider-title"
      accessibilityRole={state.titleRole}
      aria-level={state.titleRole === 'header' ? 2 : undefined}
      numberOfLines={state.light ? 1 : undefined}
      ellipsizeMode="tail"
      style={primaryStyle}
    >
      {titleContent}
    </Text>
  );
  const secondary =
    state.secondaryAction && state.rightText ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={state.rightText}
        accessibilityState={{ disabled: disabled || !onAction }}
        disabled={disabled || !onAction}
        onPress={() => {
          if (!disabled) onAction?.();
        }}
        style={[actionPadding, styles.secondaryAction]}
      >
        <Text style={secondaryStyle}>{state.rightText}</Text>
      </Pressable>
    ) : state.light ? (
      <>
        {options.secondaryText ? (
          <Text style={secondaryStyle}>{options.secondaryText}</Text>
        ) : null}
        {state.hasCount ? (
          <Text style={secondaryStyle}>{options.count}</Text>
        ) : null}
      </>
    ) : !state.large && state.rightText ? (
      <Text style={secondaryStyle}>{state.rightText}</Text>
    ) : null;
  const ruleStyle: ViewStyle = state.light
    ? {
        height: 1,
        position: 'absolute',
        bottom: 0,
        left: state.ruleLeft,
        right: state.ruleRight,
      }
    : { height: 1, alignSelf: 'stretch', flexShrink: 0 };
  return (
    <View testID="divider-geometry" style={rootStyle}>
      <View testID="divider-row" style={rowStyle}>
        {primary}
        {secondary}
      </View>
      {state.hasLine ? (
        <View
          testID="divider-rule"
          aria-hidden
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={ruleStyle}
        >
          {state.light ? (
            <View style={styles.lightRuleArtwork}>
              <SvgXml xml={DIVIDER_RULE_LIGHT} width="100%" height={0.25} />
            </View>
          ) : (
            <SvgXml
              xml={
                state.paddingHorizontal === 16
                  ? DIVIDER_RULE_343
                  : DIVIDER_RULE_327
              }
              width="100%"
              height={1}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { textTransform: 'uppercase' },
  selection: { flex: 1, minWidth: 32, gap: 4 },
  selectionSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxShape: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: { flex: 1, minWidth: 32 },
  secondaryAction: { flexShrink: 0 },
  lightRuleArtwork: {
    position: 'absolute',
    left: '0.12%',
    right: '0.12%',
    top: 0.375,
    height: 0.25,
  },
});
