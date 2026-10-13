import { Platform } from 'react-native';
import { createDemoStorage } from './demoStorage';
import { installModelGlobals } from './modelGlobals';

let bridge: ReturnType<typeof createDemoStorage> | undefined;
let initialization: Promise<void> | undefined;
export function initializeNativeDemoStorage(): Promise<void> {
  installModelGlobals();
  if (Platform.OS === 'web') return Promise.resolve();
  if (initialization) return initialization;
  initialization = (async () => {
    const {
      createAsyncStorage,
    } = require('@react-native-async-storage/async-storage');
    bridge = createDemoStorage(createAsyncStorage('mobileBankingCeeDemo'));
    await bridge.hydrate();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: bridge.storage,
    });
  })().catch(error => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}
export function flushNativeDemoStorage() {
  return bridge?.flush() ?? Promise.resolve();
}
