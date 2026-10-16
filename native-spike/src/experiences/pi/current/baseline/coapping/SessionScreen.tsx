import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import banker from '@/assets/315dec1a1353b81d727b0abffc6cfc5a36f4578f.png';
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../../contracts';
import { coappingSessions } from '../../coapping/session';

/** Native Baseline rendering of Source's co-apping session app route. */
export function BaselineCoappingSession({
  host,
}: {
  host: CurrentScreenProps;
}) {
  const [code, setCode] = useState('');
  const dark = host.tokens.text.toLowerCase() !== '#262626';
  const available = isCoAppingAvailable(host.country);
  const canContinue = available && code.trim().length > 0;
  const surface = sourceColor('var(--uc-surface)', dark);
  const copyColor = sourceColor('var(--uc-primary-main)', dark);

  const continueCoapping = () => {
    if (!canContinue) return;
    if (host.onContinueCoapping) {
      setCode('');
      host.onContinueCoapping();
      return;
    }
    coappingSessions.start(host);
    setCode('');
    host.onBack();
  };

  return (
    <View
      testID="baseline-coapping-session"
      style={[styles.screen, { backgroundColor: surface }]}
    >
      <BaselinePageHeader
        title={host.t('coApping.coAppingSession')}
        onBack={host.onBack}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        dark={dark}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.imageFrame}>
            <Image
              source={typeof banker === 'number' ? banker : { uri: banker }}
              accessibilityLabel="Banker assistance"
              resizeMode="cover"
              style={styles.image}
            />
          </View>

          <View style={styles.texts}>
            <Text style={[styles.copy, { color: copyColor }]}>
              {host.t('coApping.coAppingDescription')}
            </Text>
            <Text style={[styles.copy, { color: copyColor }]}>
              {host.t('coApping.coAppingInstruction')}
            </Text>
          </View>

          <View style={styles.field}>
            <BaselineTextField
              label={host.t('coApping.coAppingCodePlaceholder')}
              value={code}
              onChange={setCode}
              helperText={host.t('coApping.coAppingPrivacy')}
              dark={dark}
            />
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              label={host.t('coApping.continue')}
              disabled={!canContinue}
              dark={dark}
              onPress={continueCoapping}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  content: { flex: 1 },
  imageFrame: {
    width: '100%',
    maxWidth: 327,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  texts: { paddingTop: 24, gap: 16 },
  copy: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 26,
  },
  field: { paddingTop: 24 },
  footer: { marginTop: 'auto', paddingTop: 24 },
});
