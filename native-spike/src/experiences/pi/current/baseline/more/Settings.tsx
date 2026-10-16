import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  type ViewStyle,
} from 'react-native';
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig';
import {
  APP_2027_THEMES,
  type HomeTheme,
} from '@/features/products/evoAppearance';
import type { CurrentScreenProps } from '../../contracts';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import Language from './Language';
import Appearance from './Appearance';

function storedTheme(): HomeTheme {
  const stored = globalThis.localStorage?.getItem('app-2027-home-theme');
  return APP_2027_THEMES.find(theme => theme.id === stored)?.id ?? 'standard';
}
/** Local children preserve the owning Settings route and Source draft semantics. */
export default function Settings(host: CurrentScreenProps) {
  const [view, setView] = useState<'settings' | 'language' | 'appearance'>(
    'settings',
  );
  const [applied, setApplied] = useState<HomeTheme>(storedTheme);
  const [draft, setDraft] = useState<HomeTheme>(applied);
  const [progress, setProgress] = useState(0);
  const system = useColorScheme();
  const dark =
    host.mode === 'dark' || (host.mode === 'system' && system === 'dark');
  const registerBack = host.onBackHandlerChange;
  useEffect(() => {
    if (!host.isActive || view === 'settings') return;
    registerBack?.(() => {
      setDraft(applied);
      setView('settings');
      return true;
    });
    return () => registerBack?.(null);
  }, [host.isActive, view, applied, registerBack]);
  const visibility = host.onPrimaryNavigationChange;
  useEffect(() => {
    if (!host.isActive) return;
    visibility?.(false);
    return () => visibility?.(true);
  }, [host.isActive, visibility, view]);
  const back = () => {
    setDraft(applied);
    setView('settings');
  };
  if (view === 'language') return <Language {...host} onBack={back} />;
  if (view === 'appearance')
    return (
      <Appearance
        host={host}
        applied={applied}
        draft={draft}
        onSelect={setDraft}
        onBack={back}
        onApply={() => {
          setApplied(draft);
          globalThis.localStorage?.setItem('app-2027-home-theme', draft);
          host.onChanged();
          setView('settings');
        }}
      />
    );
  const title = host.t('runtime.settings.title', 'Settings');
  // Source's scrolling layer rasterizes the vector separately. Preserve the
  // slot's geometry while matching that browser paint context.
  const chevronStyle =
    Platform.OS === 'web'
      ? ({ transform: 'translateZ(0)' } as unknown as ViewStyle)
      : undefined;
  return (
    <View
      testID="ro-baseline-settings"
      style={[
        styles.page,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.toolbar}>
        <BaselinePageHeader
          title={title}
          onBack={host.onBack}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          renderLargeTitle={false}
          collapsedTitleProgress={progress}
          dark={dark}
        />
      </View>
      <ScrollView
        style={
          Platform.OS === 'web'
            ? ({ transform: 'none' } as unknown as ViewStyle)
            : undefined
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <View style={{ height: host.screenTopInset + 48 }} />
        <View style={styles.title}>
          <Text
            accessibilityRole="header"
            style={[
              styles.titleText,
              {
                color: sourceColor('var(--uc-text)', dark),
                opacity: 1 - progress,
              },
            ]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.content}>
          {SETTINGS_SECTIONS.map(section => (
            <View key={section.id}>
              <View style={styles.section}>
                <BaselineSectionDivider
                  title={host.t(
                    `runtime.settings.sections.${section.id}`,
                    section.title,
                  )}
                  dark={dark}
                />
              </View>
              <View style={styles.rows}>
                {section.items.map(item => (
                  <BaselineNavigationRow
                    key={item.id}
                    title={host.t(
                      `runtime.settings.items.${item.id}.title`,
                      item.title,
                    )}
                    description={host.t(
                      `runtime.settings.items.${item.id}.description`,
                      item.description,
                    )}
                    trailingAccessory="chevron"
                    chevronIconName="chevron-link"
                    chevronStyle={chevronStyle}
                    dark={dark}
                    onPress={
                      item.id === 'appearance'
                        ? () => {
                            setDraft(applied);
                            setView('appearance');
                          }
                        : item.id === 'language'
                        ? () => setView('language')
                        : undefined
                    }
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  toolbar: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 2 },
  title: { paddingHorizontal: 16, paddingVertical: 8 },
  titleText: { fontFamily: 'UniCredit-bold', fontSize: 28 },
  content: { paddingTop: 20, paddingBottom: 40, gap: 24 },
  section: { paddingHorizontal: 24 },
  rows: { paddingTop: 16 },
});
