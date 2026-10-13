import React, { useCallback, useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig';
import {
  getAvailableLanguages,
  getLanguageDisplayName,
} from '@/app/registry/languageByCountry';
import type { CzechNativeScreenProps } from '../contracts';
import {
  Button,
  Copy,
  Page,
  Row,
  Section,
  s,
  useLocalBack,
} from './Primitives';
import Appearance from './Appearance';
import {
  czechPreferences,
  translateCzech,
  useCzechPreferences,
  useCzechTranslation,
  type CzechLanguage,
  type HomeTheme,
} from './features/preferences';

export function Language({
  onBack,
  screenTopInset,
  isActive = true,
  onLanguageChange,
  language: hostLanguage,
}: Pick<
  CzechNativeScreenProps,
  'onBack' | 'screenTopInset' | 'isActive' | 'onLanguageChange' | 'language'
>) {
  const { language } = useCzechPreferences();
  const [draft, setDraft] = useState(hostLanguage ?? language);
  const t = (key: string) => translateCzech(key, key, draft);
  return (
    <Page
      title={t('languageSelector.selectLanguage')}
      onBack={onBack}
      active={isActive}
      topInset={screenTopInset}
      footer={
        <Button
          label={t('languageSelector.save')}
          onPress={() => {
            czechPreferences.setLanguage(draft);
            onLanguageChange?.(draft);
            onBack();
          }}
        />
      }
    >
      <View style={s.pad}>
        {getAvailableLanguages('CZ').map(value => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={getLanguageDisplayName(value)}
            accessibilityState={{ selected: draft === value }}
            onPress={() => setDraft(value as CzechLanguage)}
            style={s.horizontal}
          >
            <Copy size={24}>{draft === value ? '◉' : '○'}</Copy>
            <Copy>{getLanguageDisplayName(value)}</Copy>
          </Pressable>
        ))}
      </View>
    </Page>
  );
}
export default function Settings(props: CzechNativeScreenProps) {
  const t = useCzechTranslation(),
    preferences = useCzechPreferences();
  const [view, setView] = useState<'settings' | 'language' | 'appearance'>(
    'settings',
  );
  const [draft, setDraft] = useState<HomeTheme>(preferences.homeTheme);
  const back = useCallback(() => {
    if (view === 'settings') props.onBack();
    else {
      setDraft(preferences.homeTheme);
      setView('settings');
    }
  }, [preferences.homeTheme, props, view]);
  useLocalBack(back, props.isActive !== false && view === 'appearance');
  if (view === 'language')
    return (
      <Language
        onBack={back}
        screenTopInset={props.screenTopInset}
        isActive={props.isActive}
        language={props.language}
        onLanguageChange={props.onLanguageChange}
      />
    );
  if (view === 'appearance') {
    return (
      <View
        style={[fidelityStyles.s0, { paddingTop: props.screenTopInset ?? 0 }]}
      >
        <Appearance
          applied={preferences.homeTheme}
          draft={draft}
          mode={preferences.appearance}
          onSelect={setDraft}
          onBack={back}
          onMode={mode => {
            czechPreferences.setAppearance(mode);
            props.onModeChange?.(mode);
            props.onChanged();
          }}
          onApply={() => {
            czechPreferences.applyTheme(draft);
            props.onHomeThemeChange?.(draft);
            props.onChanged();
            setView('settings');
          }}
        />
      </View>
    );
  }
  return (
    <Page
      title={t('runtime.settings.title', 'Settings')}
      showHelp
      onBack={back}
      topInset={props.screenTopInset}
      active={props.isActive}
    >
      {SETTINGS_SECTIONS.map(section => (
        <Section
          variant="label"
          gapBefore={section.id === 'mobile-app' ? 20 : 24}
          key={section.id}
          title={t(`runtime.settings.sections.${section.id}`, section.title)}
        >
          {section.items.map(item => (
            <Row
              key={item.id}
              title={t(`runtime.settings.items.${item.id}.title`, item.title)}
              description={t(
                `runtime.settings.items.${item.id}.description`,
                item.description,
              )}
              onPress={() => {
                if (item.id === 'language') setView('language');
                if (item.id === 'appearance') {
                  setDraft(preferences.homeTheme);
                  setView('appearance');
                }
              }}
            />
          ))}
        </Section>
      ))}
    </Page>
  );
}

const fidelityStyles = StyleSheet.create({ s0: { flex: 1 } });
