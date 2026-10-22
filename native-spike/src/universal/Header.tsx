import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import type { Themed } from './types';
import { styles } from './styles';
import { resolveHeaderTitleAccessibility } from '@/app/components/contracts/headerTitleAccessibility';

export function Header({
  tokens,
  title,
  onBack,
  backLabel = 'Back',
  backIcon,
  trailing,
  variant = 'default',
  screenTopInset = 0,
  collapsedTitleProgress = 0,
  renderLargeTitle = true,
  showBack = true,
  leadingVisual,
  subtitle,
  headerSubtitle,
  collapsedTitleOpacity,
  largeTitleColor,
}: Themed & {
  title: string;
  onBack: () => void;
  backLabel?: string;
  backIcon?: React.ReactNode;
  trailing?: React.ReactNode;
  variant?: 'default' | 'current';
  screenTopInset?: number;
  collapsedTitleProgress?: number;
  renderLargeTitle?: boolean;
  showBack?: boolean;
  leadingVisual?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerSubtitle?: React.ReactNode;
  collapsedTitleOpacity?: number;
  largeTitleColor?: string;
}) {
  const progress = Math.max(0, Math.min(1, collapsedTitleProgress));
  const titleOpacity =
    collapsedTitleOpacity ?? (renderLargeTitle ? progress : 1);
  const titleAccessibility = resolveHeaderTitleAccessibility({
    largeTitleRendered: renderLargeTitle,
    largeTitleOpacity: 1 - progress,
    collapsedTitleOpacity: titleOpacity,
  });
  if (variant === 'current')
    return (
      <>
        <View
          style={{
            paddingTop: screenTopInset,
            backgroundColor: tokens.background,
          }}
        >
          <View style={s.currentNavigation}>
            {showBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={backLabel}
                onPress={onBack}
                style={s.currentAction}
              >
                {backIcon ?? (
                  <Text style={[styles.largeSymbol, { color: tokens.text }]}>
                    ‹
                  </Text>
                )}
              </Pressable>
            ) : (
              <View style={s.currentAction} />
            )}
            <View
              aria-hidden={titleAccessibility.collapsedTitleHidden}
              accessibilityElementsHidden={
                titleAccessibility.collapsedTitleHidden
              }
              importantForAccessibility={
                titleAccessibility.collapsedTitleHidden
                  ? 'no-hide-descendants'
                  : 'auto'
              }
              style={[
                s.copy,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: (1 - progress) * 6 }],
                },
              ]}
            >
              <Text
                accessibilityRole="header"
                numberOfLines={1}
                style={[
                  s.collapsedTitle,
                  {
                    fontFamily: tokens.strongFont,
                    color: tokens.text,
                  },
                ]}
              >
                {title}
              </Text>
              {headerSubtitle && (
                <Text
                  numberOfLines={1}
                  style={[
                    s.headerSubtitle,
                    {
                      fontFamily: tokens.font,
                      color: tokens.muted,
                    },
                  ]}
                >
                  {headerSubtitle}
                </Text>
              )}
            </View>
            {trailing ?? <View style={s.currentAction} />}
          </View>
        </View>
        {renderLargeTitle && (
          <View
            aria-hidden={titleAccessibility.largeTitleHidden}
            accessibilityElementsHidden={titleAccessibility.largeTitleHidden}
            importantForAccessibility={
              titleAccessibility.largeTitleHidden
                ? 'no-hide-descendants'
                : 'auto'
            }
            style={[
              s.largeBand,
              {
                backgroundColor: tokens.background,
                opacity: 1 - progress,
              },
            ]}
          >
            {leadingVisual}
            <View style={s.copy}>
              <Text
                accessibilityRole="header"
                numberOfLines={2}
                style={[
                  s.largeTitle,
                  {
                    fontFamily: tokens.strongFont,
                    color: largeTitleColor ?? tokens.text,
                  },
                ]}
              >
                {title}
              </Text>
              {subtitle}
            </View>
          </View>
        )}
      </>
    );
  return (
    <View
      style={[
        styles.header,
        styles.borderedHeader,
        { borderBottomColor: tokens.border },
      ]}
    >
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          onPress={onBack}
          style={styles.iconButton}
        >
          {backIcon ?? (
            <Text style={[styles.largeSymbol, { color: tokens.text }]}>‹</Text>
          )}
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
      <Text
        accessibilityRole="header"
        style={[
          styles.heading,
          { fontFamily: tokens.strongFont, color: tokens.text },
        ]}
      >
        {title}
      </Text>
      {trailing ?? <View style={styles.iconButton} />}
    </View>
  );
}
const s = StyleSheet.create({
  currentNavigation: {
    height: 48,
    paddingTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  collapsedTitle: { fontSize: 16, lineHeight: 17.5, textAlign: 'center' },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 2,
  },
  largeBand: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeTitle: { fontSize: 28, lineHeight: 31 },
});
