import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import {
  resolvePageHeader,
  type PageHeaderOptions,
} from '@/app/components/contracts/pageHeader';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

/** Isolated Native geometry; sticky anchoring/blur and safe area belong to the host. */
export function BaselinePageHeader({
  title,
  onBack,
  onHelpPress,
  onRightActionPress,
  rightActionIcon,
  rightActionLabel = 'Action',
  rightActionPressed,
  backIconName = 'back-heavy',
  backLabel = 'Back',
  largeTitleAlign = 'left',
  largeTitleColor,
  leadingVisual,
  subtitle,
  headerSubtitle,
  safeAreaReserve,
  dark = false,
  ...options
}: PageHeaderOptions & {
  title: string;
  onBack: () => void;
  onHelpPress?: () => void;
  onRightActionPress?: () => void;
  rightActionIcon?: React.ReactNode;
  rightActionLabel?: string;
  rightActionPressed?: boolean;
  backIconName?: string;
  backLabel?: string;
  largeTitleAlign?: 'left' | 'center';
  largeTitleColor?: string;
  leadingVisual?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerSubtitle?: React.ReactNode;
  safeAreaReserve?: number;
  dark?: boolean;
}) {
  const contract = resolvePageHeader(options);
  const textColor = sourceColor(`var(${contract.textToken})`, dark);
  const iconColor = sourceColor(contract.iconColor, dark);
  const backgroundColor = contract.backgroundToken
    ? sourceColor(`var(${contract.backgroundToken})`, dark)
    : 'transparent';
  const actionStyle = {
    width: contract.actionSize,
    height: contract.actionSize,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
  const titleStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleTypography.fontSize,
    color: largeTitleColor ?? textColor,
    textAlign: largeTitleAlign,
  };
  const stickyStyle: ViewStyle = {
    width: '100%',
    paddingTop: contract.includeSafeArea
      ? safeAreaReserve ?? contract.safeAreaFallback
      : 0,
    backgroundColor:
      contract.variant === 'dark'
        ? `rgba(26,26,26,${contract.darkBackgroundOpacity})`
        : backgroundColor,
  };
  const toolbarStyle: ViewStyle = {
    height: contract.toolbarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: contract.toolbarPaddingHorizontal,
    paddingTop: contract.toolbarPaddingTop,
  };
  const collapsedStyle: ViewStyle = {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    opacity: contract.titleProgress,
    transform: [{ translateY: contract.collapsedTitleTranslateY }],
  };
  const collapsedTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.collapsedTypography.fontSize,
    color: textColor,
    width: '100%' as const,
    textAlign: 'center' as const,
  };
  const subtitleStyle = {
    marginTop: 2,
    fontFamily: 'UniCredit-regular',
    fontSize: contract.headerSubtitleTypography.fontSize,
    lineHeight: contract.headerSubtitleTypography.lineHeight,
    color: sourceColor('var(--uc-text-muted)', dark),
  };
  const largeTitleStyle: ViewStyle = {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: largeTitleAlign === 'center' ? 'center' : undefined,
    gap: contract.leadingGap,
    paddingHorizontal: contract.largeTitlePaddingHorizontal,
    paddingVertical: contract.largeTitlePaddingVertical,
    opacity: contract.largeTitleOpacity,
    backgroundColor,
  };
  const titleWrapperStyle = { flex: 1 };
  const largeTitle = (
    <Text
      accessibilityRole="header"
      numberOfLines={contract.largeTitleLines}
      style={titleStyle}
    >
      {title}
    </Text>
  );
  return (
    <>
      <View style={stickyStyle}>
        <View style={toolbarStyle}>
          {contract.showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={backLabel}
              onPress={onBack}
              style={actionStyle}
            >
              <SourceCustomIcon
                name={backIconName}
                size={20}
                color={iconColor}
              />
            </Pressable>
          ) : (
            <View style={actionStyle} />
          )}
          <View
            pointerEvents="none"
            accessibilityElementsHidden={contract.collapsedTitleHidden}
            importantForAccessibility={
              contract.collapsedTitleHidden ? 'no-hide-descendants' : 'auto'
            }
            style={collapsedStyle}
          >
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              style={collapsedTextStyle}
            >
              {title}
            </Text>
            {headerSubtitle && (
              <Text numberOfLines={1} style={subtitleStyle}>
                {headerSubtitle}
              </Text>
            )}
          </View>
          {rightActionIcon ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={rightActionLabel}
              accessibilityState={
                rightActionPressed === undefined
                  ? undefined
                  : { selected: rightActionPressed }
              }
              onPress={onRightActionPress}
              style={actionStyle}
            >
              {rightActionIcon}
            </Pressable>
          ) : contract.showHelp ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Help"
              onPress={onHelpPress}
              style={actionStyle}
            >
              <SourceCustomIcon
                name="help-circle"
                size={20}
                color={iconColor}
              />
            </Pressable>
          ) : (
            <View style={actionStyle} />
          )}
        </View>
      </View>
      {contract.shouldRenderLargeTitle && (
        <View style={largeTitleStyle}>
          {leadingVisual}
          {leadingVisual || subtitle ? (
            <View style={titleWrapperStyle}>
              {largeTitle}
              {subtitle}
            </View>
          ) : (
            largeTitle
          )}
        </View>
      )}
    </>
  );
}
