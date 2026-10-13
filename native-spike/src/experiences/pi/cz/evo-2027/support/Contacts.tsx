import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import type { CzechNativeScreenProps } from '../contracts';
import { Page, Row, Section, useCurrentTokens } from '../profile/Primitives';
import { building } from '../profile/assets';
import { useCzechTranslation } from '../profile/features/preferences';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
const iconNames: Record<string, string> = {
  primeAdvisor: 'contact-prime',
  branchAtmFinder: 'contact-location',
  infolineAvailability: 'contact-time',
  callUs: 'contact-phone',
  emergencyLine: 'contact-block',
  email: 'contact-email',
  website: 'contact-website',
  youtube: 'contact-youtube',
};
export default function Contacts(props: CzechNativeScreenProps) {
  const t = useCzechTranslation(),
    tokens = useCurrentTokens();
  const row = (
    key: string,
    fallback: string,
    description?: string,
    active = false,
  ) => (
    <Row
      title={t(`runtime.contacts.cards.${key}`, fallback)}
      description={key === 'infolineAvailability' ? description : undefined}
      linkValue={key !== 'infolineAvailability' ? description : undefined}
      icon={
        <SourceCustomIcon name={iconNames[key]} color={tokens.text} size={20} />
      }
      chevron={key === 'primeAdvisor' || key === 'branchAtmFinder'}
      onPress={
        active
          ? () =>
              props.onNavigate({
                screen: 'support',
                params: { area: 'advisor' },
              })
          : undefined
      }
    />
  );
  return (
    <Page
      title={t('runtime.contacts.title', 'Contact us')}
      showHelp
      onBack={props.onBack}
      topInset={props.screenTopInset}
      active={props.isActive}
    >
      <View style={fidelityStyles.s0}>
        <Image
          source={building}
          style={fidelityStyles.s1}
          resizeMode="cover"
          accessibilityLabel="UniCredit Building"
        />
      </View>
      <Section
        variant="label"
        gapBefore={24}
        title={t('runtime.contacts.sections.bankContacts', 'BANK CONTACTS')}
      >
        {row('primeAdvisor', 'MY PRIME ADVISOR', undefined, true)}
        {row('branchAtmFinder', 'BRANCH & ATM FINDER')}
        {row(
          'infolineAvailability',
          'INFOLINE AVAILABILITY',
          'Mon - Sun | 07:00 - 22:00',
        )}
        {row('callUs', 'CALL US', '+420 221 210 031')}
        {row(
          'emergencyLine',
          'EMERGENCY LINE FOR CARD BLOCKING',
          '+420 221 210 012',
        )}
        {row('email', 'EMAIL', 'INFO@UNICREDITGROUP.RO')}
        {row('website', 'WEBSITE', 'WWW.UNICREDIT.CZ')}
      </Section>
      <Section
        variant="label"
        gapBefore={24}
        title={t('runtime.contacts.sections.socialMedia', 'SOCIAL MEDIA')}
      >
        {row('youtube', 'YOUTUBE')}
        <Row
          title="X"
          chevron={false}
          icon={
            <SourceCustomIcon name="contact-x" color={tokens.text} size={20} />
          }
        />
      </Section>
    </Page>
  );
}

const fidelityStyles = StyleSheet.create({
  s0: {
    marginHorizontal: 24,
    marginTop: 8,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  s1: { width: '100%', height: '100%' },
});
