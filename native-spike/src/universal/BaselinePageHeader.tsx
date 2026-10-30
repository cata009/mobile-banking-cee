import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import {
  resolvePageHeader,
  type PageHeaderOptions,
} from '@/app/components/contracts/pageHeader';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';
import { resolveHeaderTitleAccessibility } from '@/app/components/contracts/headerTitleAccessibility';
import { HEADER_ACTIONS_CONTRACT } from '@/app/components/contracts/headerActions';
import { useEvoDuoBackAction } from './EvoDuoNavigation';

/** Isolated Native geometry; sticky anchoring/blur and safe area belong to the host. */
export function BaselinePageHeader({
  title,
  onBack,
  onHelpPress,
  onRightActionPress,
  rightActionIcon,
  rightActionLabel = 'Action',
  rightActionPressed,
  rightActions,
  toolbarLayout = 'standard',
  backIconName = 'back-heavy',
  backLabel = 'Back',
  largeTitleAlign = 'left',
  largeTitleColor,
  largeTitleGutter,
  leadingVisual,
  subtitle,
  headerSubtitle,
  safeAreaReserve,
  dark = false,
  duoActionActive = true,
  ...options
}: PageHeaderOptions & {
  title: string;
  onBack: () => void;
  onHelpPress?: () => void;
  onRightActionPress?: () => void;
  rightActionIcon?: React.ReactNode;
  rightActionLabel?: string;
  rightActionPressed?: boolean;
  /** Host-composed actions; rendered without an enclosing button. */
  rightActions?: React.ReactNode;
  /** Source L2 uses symmetric 72px rails and 32px actions; other hosts retain 40px slots. */
  toolbarLayout?: 'standard' | 'source-l2';
  backIconName?: string;
  backLabel?: string;
  largeTitleAlign?: 'left' | 'center';
  largeTitleColor?: string;
  /** Explicit composition inset; the mapped Figma L2 inner-page case uses 24. */
  largeTitleGutter?: number;
  leadingVisual?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerSubtitle?: React.ReactNode;
  safeAreaReserve?: number;
  dark?: boolean;
  duoActionActive?: boolean;
}) {
  const contract = resolvePageHeader(options);
  const duoBack = useEvoDuoBackAction(
    onBack,
    contract.showBack && duoActionActive,
  );
  const titleAccessibility = resolveHeaderTitleAccessibility({
    largeTitleRendered: contract.shouldRenderLargeTitle,
    largeTitleOpacity: contract.largeTitleOpacity,
    collapsedTitleOpacity: contract.titleProgress,
    hideCollapsedTitleWhenHidden: options.hideCollapsedTitleWhenHidden,
  });
  const textColor = sourceColor(`var(${contract.textToken})`, dark);
  const iconColor = sourceColor(contract.iconColor, dark);
  const backgroundColor = contract.backgroundToken
    ? sourceColor(`var(${contract.backgroundToken})`, dark)
    : 'transparent';
  const sourceL2 = toolbarLayout === 'source-l2';
  const actionSize = sourceL2
    ? HEADER_ACTIONS_CONTRACT.size
    : contract.actionSize;
  const actionStyle = {
    width: actionSize,
    height: actionSize,
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
      ? (safeAreaReserve ?? contract.safeAreaFallback)
      : 0,
    backgroundColor:
      contract.variant === 'dark'
        ? `rgba(26,26,26,${contract.darkBackgroundOpacity})`
        : backgroundColor,
  };
  const toolbarStyle: ViewStyle = {
    height: sourceL2 ? 40 : contract.toolbarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sourceL2 ? 16 : contract.toolbarPaddingHorizontal,
    paddingTop: sourceL2 ? 0 : contract.toolbarPaddingTop,
  };
  const railStyle: ViewStyle = {
    width: HEADER_ACTIONS_CONTRACT.size * 2 + HEADER_ACTIONS_CONTRACT.railGap,
    height: HEADER_ACTIONS_CONTRACT.railHeight,
    flexDirection: 'row',
    gap: HEADER_ACTIONS_CONTRACT.railGap,
    flexShrink: 0,
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
    paddingHorizontal: largeTitleGutter ?? contract.largeTitlePaddingHorizontal,
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
  const backAction =
    contract.showBack && !duoBack ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        style={actionStyle}
      >
        <SourceCustomIcon name={backIconName} size={20} color={iconColor} />
      </Pressable>
    ) : (
      <View style={actionStyle} />
    );
  return (
    <>
      <View style={stickyStyle}>
        <View style={toolbarStyle}>
          {sourceL2 ? (
            <View style={railStyle}>
              {backAction}
              <View style={actionStyle} />
            </View>
          ) : (
            backAction
          )}
          <View
            pointerEvents="none"
            aria-hidden={titleAccessibility.collapsedTitleHidden}
            accessibilityElementsHidden={
              titleAccessibility.collapsedTitleHidden
            }
            importantForAccessibility={
              titleAccessibility.collapsedTitleHidden
                ? 'no-hide-descendants'
                : 'auto'
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
          {rightActions !== undefined ? (
            <View style={sourceL2 ? railStyle : undefined}>{rightActions}</View>
          ) : rightActionIcon ? (
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
        <View
          aria-hidden={titleAccessibility.largeTitleHidden}
          accessibilityElementsHidden={titleAccessibility.largeTitleHidden}
          importantForAccessibility={
            titleAccessibility.largeTitleHidden ? 'no-hide-descendants' : 'auto'
          }
          style={largeTitleStyle}
        >
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
