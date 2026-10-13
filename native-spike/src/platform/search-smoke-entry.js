import React from 'react';
import { AppRegistry, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Search from '../experiences/pi/it/Search';
import { getItalySearchSnapshot } from '@/universal/experiences/pi/it/searchSnapshot';
import { DEFAULT_ITALY_COUNTS } from '../experiences/pi/it/contracts';
import { name as appName } from '../../app.json';

/** Internal release smoke harness. Destination navigation is tested in the composed app. */
function Probe() {
  const insets = useSafeAreaInsets();
  const snapshot = getItalySearchSnapshot(DEFAULT_ITALY_COUNTS);
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Search entries={snapshot.entries} onClose={() => {}} />
    </View>
  );
}
function Smoke() {
  return (
    <SafeAreaProvider>
      <Probe />
    </SafeAreaProvider>
  );
}
AppRegistry.registerComponent(appName, () => Smoke);
const styles = StyleSheet.create({ root: { flex: 1 } });
