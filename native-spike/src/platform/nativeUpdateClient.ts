import { NativeModules } from 'react-native';
import { HotUpdater } from '@hot-updater/react-native';

const baseURL = (
  NativeModules.CeeDemoDevice as { otaBaseURL?: string } | undefined
)?.otaBaseURL;
if (!baseURL) throw new Error('Aggiornamenti non configurati');
let error: unknown;
/** Loaded after the native application commits its first successful screen, then initialized once. */
export const client = HotUpdater.init({
  baseURL,
  requestTimeout: 5000,
  onError: value => {
    error = value;
  },
});
export function resetClientError() {
  error = undefined;
}
export function readClientError() {
  return error;
}
