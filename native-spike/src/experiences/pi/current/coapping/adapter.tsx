import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import svgPaths from '@/imports/svg-18ehkdpg9k';
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import type { CurrentAdapter, CurrentScreenProps } from '../contracts';
import { ProfileHost, translateProfile } from '../profile/Host';
import { Confirm } from '../profile/Primitives';
import { coappingSessions, useCoappingSession } from './session';
import { assistantAvailable } from './model';
import Assistant from './Assistant';
import { useDuoPreview } from '../../../../universal/DuoPreview';
import { BaselineCoappingSession } from '../baseline/coapping/SessionScreen';
export { openCurrentContextHelp } from './contextHelp';
export const CURRENT_COAPPING_ADAPTER: CurrentAdapter = {
  id: 'pi.current.coapping',
  screens: {
    coapping: host => <BaselineCoappingSession host={host} />,
  },
};
export function CoappingLayer({ host }: { host: CurrentScreenProps }) {
  const duo = useDuoPreview();
  const localSession = useCoappingSession(host);
  const sourceContext = host.coAppingContext;
  const sessionActive = sourceContext?.sessionActive ?? localSession.active;
  const showAssistant =
    sourceContext?.assistantAvailable ?? assistantAvailable(host);
  const [terminate, setTerminate] = useState(false);
  const t = (key: string) => translateProfile(host, key);
  return (
    <ProfileHost host={host}>
      {sessionActive && isCoAppingAvailable(host.country) ? (
        <>
          <View pointerEvents="none" style={styles.glow} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Co-apping session active"
            onPress={() => setTerminate(true)}
            style={[
              styles.floating,
              duo ? { right: duo.rightInset } : undefined,
            ]}
          >
            <Svg width={44} height={113.013} viewBox="0 0 44 113.013">
              <Path d={svgPaths.p2d5f5a80} fill="#00b35a" />
            </Svg>
            <View style={styles.share}>
              <SourceCustomIcon
                name="panel-share-screen"
                color="#ffffff"
                size={24}
              />
            </View>
          </Pressable>
          {terminate ? (
            <Confirm
              title={t('coApping.endSessionConfirm')}
              body={t('coApping.coAppingPrivacy')}
              confirmLabel={t('coApping.yes')}
              cancelLabel={t('coApping.no')}
              onCancel={() => setTerminate(false)}
              onConfirm={() => {
                if (sourceContext) host.onCoAppingSessionEnd?.();
                else coappingSessions.end(host);
                setTerminate(false);
              }}
            />
          ) : null}
        </>
      ) : null}
      {showAssistant ? (
        <Assistant key={`${host.country}:${host.release}`} host={host} />
      ) : null}
    </ProfileHost>
  );
}
const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    right: 0,
    top: 432,
    width: 44,
    height: 113.013,
  },
  share: {
    position: 'absolute',
    top: 41,
    right: 2,
    bottom: 40,
    left: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 3,
    borderColor: '#00b35a',
    borderRadius: 4,
  },
});
