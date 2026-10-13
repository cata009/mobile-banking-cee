import { NativeModules, Platform } from 'react-native';
import { createUpdateCoordinator } from './updateCoordinator';
import { flushNativeDemoStorage } from './nativeStorage';

const baseURL = (
  NativeModules.CeeDemoDevice as { otaBaseURL?: string } | undefined
)?.otaBaseURL;
function getClient(): typeof import('./nativeUpdateClient') | undefined {
  if (Platform.OS === 'web' || !baseURL) return undefined;
  return require('./nativeUpdateClient');
}
export const nativeUpdates = createUpdateCoordinator({
  async check() {
    const session = getClient();
    if (!session) return null;
    const sdk = session.client;
    session.resetClientError();
    const update = await sdk.checkForUpdate({ updateStrategy: 'fingerprint' });
    const error = session.readClientError();
    if (error) throw error;
    return update
      ? {
          id: update.id,
          download: () => update.updateBundle(),
          requiresRestart:
            update.transitionKind !== 'ADOPT_RELEASE' ||
            update.shouldForceUpdate,
          deferUntilSafe: update.transitionKind === 'USE_BUILTIN',
        }
      : null;
  },
  async reload() {
    const session = getClient();
    if (!session) throw new Error('Aggiornamenti non configurati');
    await session.client.reload();
  },
  flush: flushNativeDemoStorage,
});
export function nativeUpdateIdentity() {
  const sdk = getClient()?.client;
  return sdk
    ? {
        bundleId: sdk.getBundleId(),
        fingerprint: sdk.getFingerprintHash(),
        channel: sdk.getChannel(),
      }
    : null;
}
