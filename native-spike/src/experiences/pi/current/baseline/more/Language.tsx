import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import {
  getAvailableLanguages,
  getLanguageDisplayName,
} from '@/app/registry/languageByCountry';
import type { CurrentScreenProps } from '../../contracts';
import { createCurrentTranslator } from '../../context';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { RadioButton } from '../../../../../universal/RadioButton';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { sourceColor } from '../../../../../universal/sourceColor';

/** Source's shared selector previews the draft locale before Save commits it. */
export default function Language(host: CurrentScreenProps) {
  const [draft, setDraft] = useState(host.language);
  const system = useColorScheme();
  const dark =
    host.mode === 'dark' || (host.mode === 'system' && system === 'dark');
  const t = createCurrentTranslator(host.country, draft);
  const visibility = host.onPrimaryNavigationChange;
  useEffect(() => {
    if (!host.isActive) return;
    visibility?.(false);
    return () => visibility?.(true);
  }, [host.isActive, visibility]);
  return (
    <View
      testID="ro-baseline-language"
      style={[
        styles.page,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={{ paddingTop: host.screenTopInset }}>
        <BaselinePageHeader
          title={t('languageSelector.selectLanguage')}
          onBack={host.onBack}
          dark={dark}
        />
      </View>
      <View style={styles.content}>
        <View>
          {getAvailableLanguages(host.country).map(language => (
            <RadioButton
              key={language}
              label={getLanguageDisplayName(language)}
              selected={draft === language}
              onPress={() => setDraft(language)}
              dark={dark}
            />
          ))}
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            variant="language-save"
            label={t('languageSelector.save')}
            dark={dark}
            onPress={() => {
              host.onLanguageChange(draft);
              host.onBack();
            }}
          />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flex: 1, paddingTop: 24, paddingBottom: 24 },
  footer: { marginTop: 'auto', paddingHorizontal: 24 },
});
