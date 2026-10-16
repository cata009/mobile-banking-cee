import React from 'react';
import {
  Pressable,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  resolveNavigationRow,
  type NavigationRowOptions,
} from '@/app/components/contracts/navigationRow';
import { SourceCustomIcon } from './SourceCustomIcon';
import { ToggleButton } from './ToggleButton';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
import { sourceIconDimensions } from './sourceIconDimensions';

/** Platform slots are Native nodes. The contract retains the legacy inert-row rule. */
export function BaselineNavigationRow({
  title,
  description,
  linkLabel,
  leadingIconName,
  leadingVisual,
  trailing,
  chevronIconName = 'chevron-link',
  chevronStyle,
  onPress,
  onLinkPress,
  onToggle,
  ariaLabel,
  dark = false,
  style,
  titleStyle,
  descriptionStyle,
  ...options
}: Omit<
  NavigationRowOptions,
  'hasLeading' | 'hasTrailing' | 'hasOnClick' | 'hasOnLinkClick'
> & {
  title: string;
  description?: string;
  linkLabel?: string;
  leadingIconName?: string;
  leadingVisual?: React.ReactNode;
  trailing?: React.ReactNode;
  chevronIconName?: string;
  chevronStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLinkPress?: () => void;
  onToggle?: (checked: boolean) => void;
  ariaLabel?: string;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}) {
  const state = resolveNavigationRow({
    ...options,
    hasLeading: Boolean(leadingIconName || leadingVisual),
    hasTrailing: Boolean(trailing),
    hasOnClick: Boolean(onPress),
    hasOnLinkClick: Boolean(onLinkPress),
  });
  const leadingDimensions = leadingIconName
    ? sourceIconDimensions(leadingIconName)
    : { width: 20, height: 20 };
  const trailingDimensions = sourceIconDimensions(chevronIconName);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const rootStyle: StyleProp<ViewStyle> = [
    {
      height: state.rowHeight,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: state.gap,
      paddingLeft: state.paddingLeft,
      paddingRight: state.paddingRight,
      backgroundColor: color(state.backgroundToken),
      justifyContent: state.centerContent ? 'center' : undefined,
    },
    style,
  ];
  const textStyle1 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.linkFontSize,
    color: color(state.actionToken),
    marginTop: 4,
  } as const;
  const link = <Text style={textStyle1}>{linkLabel}</Text>;
  const viewStyle2 = {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: state.centerContent ? 'center' : undefined,
    gap: state.gap,
  } as const;
  const viewStyle3 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const viewStyle4 = {
    flex: state.centerContent ? undefined : 1,
    minWidth: 0,
  } as const;
  const textStyle5 = [
    {
      fontFamily: 'UniCredit-bold',
      fontSize: state.titleFontSize,
      color: color(state.titleToken),
      textAlign: state.centerContent ? 'center' : 'left',
    },
    titleStyle,
  ] as const;
  const textStyle6 = [
    {
      fontFamily: 'UniCredit-regular',
      fontSize: state.descriptionFontSize,
      marginTop: 4,
      color: color(state.textToken),
      textAlign: state.centerContent ? 'center' : 'left',
    },
    descriptionStyle,
  ] as const;
  const viewStyle7 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const children = (
    <>
      <View style={viewStyle2}>
        {leadingVisual ||
          (leadingIconName ? (
            <View style={viewStyle3}>
              <SourceCustomIcon
                name={leadingIconName}
                size={
                  leadingDimensions.width === leadingDimensions.height
                    ? leadingDimensions.width
                    : undefined
                }
                width={leadingDimensions.width}
                height={leadingDimensions.height}
                color={color(state.textToken)}
              />
            </View>
          ) : null)}
        <View style={viewStyle4}>
          <Text numberOfLines={2} style={textStyle5}>
            {title}
          </Text>
          {description ? (
            <Text numberOfLines={2} style={textStyle6}>
              {description}
            </Text>
          ) : null}
          {linkLabel ? (
            onLinkPress ? (
              <Pressable accessibilityRole="button" onPress={onLinkPress}>
                {link}
              </Pressable>
            ) : (
              link
            )
          ) : null}
        </View>
      </View>
      {trailing ? (
        trailing
      ) : state.accessory === 'toggle' ? (
        <ToggleButton
          ariaLabel={title}
          checked={state.toggleChecked}
          onToggle={onToggle}
          dark={dark}
        />
      ) : state.accessory === 'chevron' ? (
        <View style={[viewStyle7, chevronStyle]}>
          <SourceCustomIcon
            name={chevronIconName}
            size={
              trailingDimensions.width === trailingDimensions.height
                ? trailingDimensions.width
                : undefined
            }
            width={trailingDimensions.width}
            height={trailingDimensions.height}
            color={color(state.textToken)}
          />
        </View>
      ) : null}
    </>
  );
  return state.rootKind === 'button' ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ariaLabel ?? title}
      onPress={onPress}
      style={rootStyle}
    >
      {children}
    </Pressable>
  ) : (
    <View accessibilityLabel={ariaLabel} style={rootStyle}>
      {children}
    </View>
  );
}
