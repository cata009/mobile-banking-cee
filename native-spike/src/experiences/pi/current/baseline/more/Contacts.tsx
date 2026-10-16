import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RasterImage } from '../offers/RasterImage';
import type { CurrentScreenProps } from '../../contracts';
import { building } from '../../profile/assets';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { MoreServicePage, serviceDark } from './ServicePrimitives';

const inert = () => undefined;
export default function Contacts(host: CurrentScreenProps) {
  const dark = serviceDark(host),
    t = host.t;
  const row = (
    key: string,
    fallback: string,
    icon: string,
    value?: string,
    description?: string,
    chevron = false,
  ) => (
    <BaselineNavigationRow
      title={t(`runtime.contacts.cards.${key}`, fallback)}
      leadingIconName={icon}
      linkLabel={value}
      description={description}
      trailingAccessory={chevron ? 'chevron' : 'none'}
      onPress={
        key === 'primeAdvisor'
          ? () => host.onNavigate({ screen: 'prime' })
          : inert
      }
      dark={dark}
    />
  );
  return (
    <MoreServicePage
      host={host}
      title={t('runtime.contacts.title', 'Contact us')}
    >
      <View style={styles.content}>
        <View style={styles.imageFrame}>
          <RasterImage
            source={building}
            accessibilityLabel="UniCredit Building"
            resizeMode="cover"
            style={styles.image}
          />
        </View>
        <View>
          <View style={styles.section}>
            <BaselineSectionDivider
              title={t(
                'runtime.contacts.sections.bankContacts',
                'BANK CONTACTS',
              )}
              dark={dark}
            />
          </View>
          <View style={styles.rows}>
            {row(
              'primeAdvisor',
              'MY PRIME ADVISOR',
              'contact-prime',
              undefined,
              undefined,
              true,
            )}
            {row(
              'branchAtmFinder',
              'BRANCH & ATM FINDER',
              'contact-location',
              undefined,
              undefined,
              true,
            )}
            {row(
              'infolineAvailability',
              'INFOLINE AVAILABILITY',
              'contact-time',
              undefined,
              'Mon - Sun | 07:00 - 22:00',
            )}
            {row('callUs', 'CALL US', 'contact-phone', '+420 221 210 031')}
            {row(
              'emergencyLine',
              'EMERGENCY LINE FOR CARD BLOCKING',
              'contact-block',
              '+420 221 210 012',
            )}
            {row('email', 'EMAIL', 'contact-email', 'INFO@UNICREDITGROUP.RO')}
            {row('website', 'WEBSITE', 'contact-website', 'WWW.UNICREDIT.CZ')}
          </View>
        </View>
        <View>
          <View style={styles.section}>
            <BaselineSectionDivider
              title={t('runtime.contacts.sections.socialMedia', 'SOCIAL MEDIA')}
              dark={dark}
            />
          </View>
          <View style={styles.rows}>
            {row('youtube', 'YOUTUBE', 'contact-youtube')}
            <BaselineNavigationRow
              title="X"
              leadingIconName="contact-x"
              onPress={inert}
              dark={dark}
            />
          </View>
        </View>
      </View>
    </MoreServicePage>
  );
}
const styles = StyleSheet.create({
  content: { gap: 24, paddingTop: 8, paddingBottom: 24 },
  imageFrame: {
    marginHorizontal: 24,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  section: { paddingHorizontal: 24 },
  rows: { marginTop: 16 },
});
