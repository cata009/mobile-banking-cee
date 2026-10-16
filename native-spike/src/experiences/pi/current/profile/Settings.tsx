import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig';
import {
  getAvailableLanguages,
  getLanguageDisplayName,
} from '@/app/registry/languageByCountry';
import type { CurrentScreenProps } from '../contracts';
import {
  Button,
  Copy,
  Page,
  Row,
  Section,
  useLocalBack,
} from './Primitives';
import { translateProfile, useProfileTranslation } from './Host';
import { readHomeTheme, storeHomeTheme, type HomeTheme } from './preferences';
import Appearance from './Appearance';
import {SourceCustomIcon} from '../../../../universal/SourceCustomIcon';
export function Language(props: CurrentScreenProps) {
  const [draft, setDraft] = useState(props.language);
  const t = (key: string) => translateProfile(props, key, key, draft);
  return (
    <Page
      title={t('languageSelector.selectLanguage')}
      showHelp
      onBack={props.onBack}
      topInset={props.screenTopInset}
      active={props.isActive}
      footerStyle={styles.languageFooter}
      footer={
        <Button
          label={t('languageSelector.save')}
          onPress={() => {
            props.onLanguageChange(draft);
            props.onBack();
          }}
        />
      }
    >
      <View style={styles.languageOptions}>
        {getAvailableLanguages(props.country).map(value => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={getLanguageDisplayName(value)}
            accessibilityState={{ selected: draft === value }}
            onPress={() => setDraft(value)}
            style={styles.languageRow}
          >
            <View style={styles.radioSlot}><SourceCustomIcon name={draft===value?'radio-selected':'radio-unselected'} size={24} color={props.tokens.text}/></View>
            <Copy strong lineHeight={17.5}>{getLanguageDisplayName(value)}</Copy>
          </Pressable>
        ))}
      </View>
    </Page>
  );
}
export default function Settings(props: CurrentScreenProps) {
  const t = useProfileTranslation();
  const [view, setView] = useState<'settings' | 'language' | 'appearance'>(
    'settings',
  );
  const [applied, setApplied] = useState(() => readHomeTheme(props.country));
  const [draft, setDraft] = useState<HomeTheme>(applied);
  const back = () => {
    if (view === 'settings') props.onBack();
    else {
      setDraft(applied);
      setView('settings');
    }
  };
  useLocalBack(back, props.isActive && view === 'appearance');
  if (view === 'language') return <Language {...props} onBack={back} />;
  if (view === 'appearance')
    return (
      <View
        style={{
          ...styles.page,
          paddingTop: props.screenTopInset,
          backgroundColor: props.tokens.background,
        }}
      >
        <Appearance
          applied={applied}
          draft={draft}
          mode={props.mode}
          onSelect={setDraft}
          onMode={mode => {
            props.onModeChange(mode);
            props.onChanged();
          }}
          onBack={back}
          onApply={() => {
            setApplied(draft);
            storeHomeTheme(props.country, draft);
            props.onChanged();
            setView('settings');
          }}
        />
      </View>
    );
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
          key={section.id}
          variant="label"
          gapBefore={section.id==='mobile-app'?20:24}
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
                  setDraft(applied);
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
const styles = StyleSheet.create({
  languageRow: {flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:24,paddingVertical:20},
  languageOptions:{paddingTop:24},
  languageFooter:{paddingTop:0,paddingBottom:24},
  radioSlot:{width:32,height:32,alignItems:'center',justifyContent:'center'},
  page: { flex: 1 },
});
