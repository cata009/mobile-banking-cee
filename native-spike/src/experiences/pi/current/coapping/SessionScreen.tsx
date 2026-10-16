import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SourceTextField } from '../profile/SourceTextField';
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability';
import type { CurrentScreenProps } from '../contracts';
import { ProfileHost, useProfileTranslation } from '../profile/Host';
import { Button, Copy, Page } from '../profile/Primitives';
import { coappingSessions } from './session';
import { banker } from './assets';
function Content(props: CurrentScreenProps) {
  const t = useProfileTranslation();
  const [code, setCode] = useState('');
  return (
    <Page
      title={t('coApping.coAppingSession')}
      showHelp
      onBack={props.onBack}
      topInset={props.screenTopInset}
      active={props.isActive}
      footerStyle={styles.footer}
      footer={
        <Button
          label={t('coApping.continue')}
          disabled={!code.trim() || !isCoAppingAvailable(props.country)}
          onPress={() => {
            if (!code.trim() || !isCoAppingAvailable(props.country)) return;
            if (props.onContinueCoapping) {
              setCode('');
              props.onContinueCoapping();
              return;
            }
            coappingSessions.start(props);
            setCode('');
            props.onBack();
          }}
        />
      }
    >
      <View style={styles.content}>
        <Image
          source={banker}
          accessibilityLabel="Banker assistance"
          resizeMode="cover"
          style={styles.image}
        />
        <View style={styles.texts}>
          <Copy lineHeight={26}>{t('coApping.coAppingDescription')}</Copy>
          <Copy lineHeight={26}>{t('coApping.coAppingInstruction')}</Copy>
        </View>
        <View style={styles.field}>
          <SourceTextField
            label={t('coApping.coAppingCodePlaceholder')}
            value={code}
            onChange={setCode}
            helperText={t('coApping.coAppingPrivacy')}
          />
        </View>
      </View>
    </Page>
  );
}
export default function SessionScreen(props: CurrentScreenProps) {
  return (
    <ProfileHost host={props}>
      <Content {...props} />
    </ProfileHost>
  );
}
const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  texts: { paddingTop: 24, gap: 16 },
  field: { paddingTop: 24 },
  footer: { paddingTop: 24, paddingBottom: 24 },
  image: { width: '100%', height: 160, borderRadius: 8 },
});
