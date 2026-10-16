import React, { useState } from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Platform,
} from 'react-native';
import type { PageHeaderOptions } from '@/app/components/contracts/pageHeader';
import type { CurrentScreenProps } from '../../contracts';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
export const investmentDark = (host: Pick<CurrentScreenProps, 'tokens'>) =>
  host.tokens.background === sourceColor('var(--uc-app-bg)', true);
/** Source's ordinary overflow div does not create a hardware text-compositing layer. */
export const investmentScrollStyle = () =>
  Platform.OS === 'web' ? plainScrollStyle : undefined;
const plainScrollStyle = StyleSheet.create({ web: { transform: 'none' } }).web;
export const investmentColor = (
  host: Pick<CurrentScreenProps, 'tokens'>,
  value: string,
) =>
  sourceColor(
    value.startsWith('--') ? `var(${value})` : value,
    investmentDark(host),
  );
export function BaselineInvestmentFrame({
  host,
  title,
  onBack,
  children,
  footer,
  scroll = true,
  onScroll,
  headerOptions,
  onHelp,
  collapseDistance = 64,
}: {
  host: CurrentScreenProps;
  title: string;
  onBack(): void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  headerOptions?: PageHeaderOptions;
  onHelp?: () => void;
  collapseDistance?: number;
}) {
  const [progress, setProgress] = useState(0);
  const shownProgress = headerOptions?.collapsedTitleProgress ?? progress;
  const largeTitle =
    headerOptions?.renderLargeTitle !== false &&
    !(headerOptions?.compact && shownProgress >= 0.999);
  const toolbar = (
    <View>
      <BaselinePageHeader
        title={title}
        onBack={onBack}
        includeSafeArea
        showHelp={false}
        safeAreaReserve={host.screenTopInset}
        dark={investmentDark(host)}
        collapsedTitleProgress={shownProgress}
        onHelpPress={onHelp}
        {...headerOptions}
        renderLargeTitle={false}
      />
    </View>
  );
  const renderStyle1 = {
    opacity: 1 - shownProgress,
    backgroundColor: investmentColor(
      host,
      headerOptions?.variant === 'gray' ? '--uc-app-bg' : '--uc-surface',
    ),
  } as const;
  const renderStyle2 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  const titleView = largeTitle ? (
    <View style={[baselineStyles.inline1, renderStyle1]}>
      <Text
        accessibilityRole="header"
        numberOfLines={2}
        style={[baselineStyles.inline2, renderStyle2]}
      >
        {title}
      </Text>
    </View>
  ) : null;
  const renderStyle3 = {
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  return (
    <View style={[baselineStyles.inline3, renderStyle3]}>
      {scroll ? (
        <ScrollView
          style={investmentScrollStyle()}
          stickyHeaderIndices={[0]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={event => {
            setProgress(
              Math.min(
                1,
                Math.max(
                  0,
                  event.nativeEvent.contentOffset.y / collapseDistance,
                ),
              ),
            );
            onScroll?.(event);
          }}
        >
          {toolbar}
          {titleView}
          {children}
        </ScrollView>
      ) : (
        <>
          {toolbar}
          {titleView}
          {children}
        </>
      )}
      {footer}
    </View>
  );
}
export function BaselineInvestmentField({
  host,
  label,
  value,
  multiline = false,
  strong = true,
  secondaryValue,
  variant = 'default',
}: {
  host: CurrentScreenProps;
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
  strong?: boolean;
  secondaryValue?: string;
  variant?: 'default' | 'product-detail';
}) {
  const renderStyle4 = {
    minHeight: multiline ? 132 : 80,
    justifyContent: multiline ? undefined : 'center',
  } as const;
  const renderStyle5 = {
    fontSize: variant === 'product-detail' ? 16 : 14,
  } as const;
  const renderStyle6 = {
    color: investmentColor(
      host,
      variant === 'product-detail' ? '--uc-text' : '--uc-text-muted',
    ),
  } as const;
  const renderStyle7 = {
    fontFamily: strong ? 'UniCredit-bold' : 'UniCredit-regular',
    fontSize: variant === 'product-detail' ? 18 : 16,
  } as const;
  const renderStyle8 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  const renderStyle9 = {
    color: investmentColor(host, '--uc-text-muted'),
  } as const;
  return (
    <View
      testID={`investment-field-${label}`}
      style={[baselineStyles.inline4, renderStyle4]}
    >
      <Text
        style={[
          baselineStyles.inline5,
          renderStyle5,
          baselineStyles.inline6,
          renderStyle6,
        ]}
      >
        {label}
      </Text>
      <Text style={[renderStyle7, baselineStyles.inline7, renderStyle8]}>
        {value}
      </Text>
      {secondaryValue ? (
        <Text style={[baselineStyles.inline8, renderStyle9]}>
          {secondaryValue}
        </Text>
      ) : null}
    </View>
  );
}
export function BaselineInvestmentSection({
  host,
  title,
}: {
  host: CurrentScreenProps;
  title: string;
}) {
  return (
    <View style={baselineStyles.inline9}>
      <BaselineSectionDivider title={title} dark={investmentDark(host)} />
    </View>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inline2: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 31,
  },
  inline3: {
    flex: 1,
  },
  inline4: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 4,
  },
  inline5: {
    fontFamily: 'UniCredit-regular',
  },
  inline6: {
    lineHeight: 16,
  },
  inline7: {
    lineHeight: 20,
  },
  inline8: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
  },
  inline9: {
    paddingHorizontal: 24,
  },
});
