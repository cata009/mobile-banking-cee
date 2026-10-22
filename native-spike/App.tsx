import React, { useEffect, useState } from 'react';
import {
  AppState,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {
  initializeNativeDemoStorage,
  flushNativeDemoStorage,
} from './src/platform/nativeStorage';
import { loadApplication } from './src/app/loadApplication';
import type { GlobalNativeAppProps } from './src/app/types';

/** Models load only after their native persistence port has been hydrated. No portal login is involved. */
export default function App(props: GlobalNativeAppProps = {}) {
  const [Application, setApplication] =
    useState<React.ComponentType<GlobalNativeAppProps> | null>(null);
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  useEffect(() => {
    let active = true;
    initializeNativeDemoStorage()
      .then(loadApplication)
      .then(Component => {
        if (active) setApplication(() => Component);
      })
      .catch(bootstrapError => {
        console.error('Native demo bootstrap failed', bootstrapError);
        if (active)
          setError('Datele demo nu pot fi deschise. Încearcă din nou.');
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      if (state !== 'active') flushNativeDemoStorage().catch(() => {});
    });
    return () => listener.remove();
  }, []);
  const size = Dimensions.get('window');
  const metrics = initialWindowMetrics ?? {
    frame: { x: 0, y: 0, width: size.width, height: size.height },
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  };
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      {Application ? (
        <Application {...props} />
      ) : (
        <View style={s.boot}>
          <Text style={s.title}>Mobile Banking · CEE</Text>
          <Text style={s.body}>{error || 'Se pregătește demo…'}</Text>
          {!!error && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reîncearcă"
              onPress={() => {
                setError('');
                retry(value => value + 1);
              }}
            >
              <Text style={s.retry}>Reîncearcă</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 32, color: '#262626' },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
  },
  retry: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    color: '#007a91',
    padding: 12,
  },
});
