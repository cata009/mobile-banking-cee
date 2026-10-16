import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  type ViewStyle,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import type { CurrentScreenProps, CurrentContext } from '../contracts';
import { currentFeature } from '../context';
import { futureGainEnabled } from '../future-gain/model';
import { BaselineL1Header } from '../../../../universal/BaselineL1Header';
import { BaselineHomeHeader } from './Header';
import { BaselineHomeBody } from './Body';
export function isRoBaselineHome(
  context: Pick<CurrentContext, 'country' | 'release' | 'scenario'>,
) {
  return (
    context.country === 'RO' &&
    context.release === 'release-current' &&
    context.scenario === 'active'
  );
}
export function BaselineHomeFrame({
  host,
  redesigned = false,
}: {
  host: CurrentScreenProps;
  redesigned?: boolean;
}) {
  const dark = host.tokens.background === '#121212';
  const page = [styles.page, { backgroundColor: host.tokens.background }];
  const safeAreaInsets = React.useContext(SafeAreaInsetsContext);
  const futureGainPadding: ViewStyle | undefined = futureGainEnabled(host)
    ? Platform.OS === 'web'
      ? ({
          paddingBottom: 'calc(40px + var(--uc-phone-bottom-reserve, 34px))',
        } as unknown as ViewStyle)
      : { paddingBottom: 40 + (safeAreaInsets?.bottom ?? 34) }
    : undefined;
  const reserve = {
    height: host.screenTopInset,
    backgroundColor: host.tokens.background,
  };
  return (
    <View style={page}>
      <View style={reserve} />
      <BaselineHomeHeader host={host} />
      <ScrollView
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        contentContainerStyle={[styles.content, futureGainPadding]}
        showsVerticalScrollIndicator={false}
      >
        <BaselineL1Header
          variant="home"
          title="Your Homepage"
          showActions={false}
          dark={dark}
        />
        <BaselineHomeBody host={host} redesigned={redesigned} />
      </ScrollView>
    </View>
  );
}

export default function BaselineHome({ host }: { host: CurrentScreenProps }) {
  return (
    <BaselineHomeFrame
      host={host}
      redesigned={currentFeature(host, 'fx_cardsRedesign')}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingBottom: 80 },
  // Match Source's raster layer on RNWeb; retain platform scrolling on device.
  webScroll: { transform: 'none' },
});
