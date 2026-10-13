import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import type { Themed } from './types';

/** Shared safe-area-relative navigation band; the host supplies the system inset. */
export function DetailHeader({
  tokens,
  onBack,
  onProfile,
  avatarSource,
  backIcon,
  title,
  actions,
}: Themed & {
  onBack?: () => void;
  onProfile?: () => void;
  avatarSource?: ImageSourcePropType;
  backIcon?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <View style={[styles.header, { backgroundColor: tokens.background }]}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Indietro"
          onPress={onBack}
          style={styles.control}
        >
          {backIcon}
        </Pressable>
      ) : (
        <View style={styles.control} />
      )}
      <View style={styles.title}>{title}</View>
      <View style={styles.actions}>
        {actions}
        {onProfile && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profilo"
            onPress={onProfile}
            style={styles.control}
          >
            {avatarSource && (
              <View style={styles.avatarMask}>
                <Image
                  source={avatarSource}
                  style={styles.avatar}
                  resizeMode="cover"
                  onError={event =>
                    console.warn(
                      'Demo profile avatar could not render',
                      event.nativeEvent.error,
                    )
                  }
                />
              </View>
            )}
            <View style={styles.notification} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 44,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  control: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarMask: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  avatar: { width: 32, height: 32 },
  notification: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2001a',
  },
});
