import { createUpdateCoordinator } from './updateCoordinator';
import { flushNativeDemoStorage } from './nativeStorage';

/** Browser previews have no native update client or TurboModule. Android keeps its existing port. */
export const nativeUpdates = createUpdateCoordinator({
  async check() {
    return null;
  },
  async reload() {
    throw new Error('Native updates are unavailable in RNWeb');
  },
  flush: flushNativeDemoStorage,
});
export function nativeUpdateIdentity(): null {
  return null;
}
