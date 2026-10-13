import { NativeModules, Platform } from 'react-native';

export async function setNativeScreenshotsAllowed(
  allowed: boolean,
): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const device = NativeModules.CeeDemoDevice as
    | { setScreenshotsAllowed?: (allowed: boolean) => Promise<boolean> }
    | undefined;
  return device?.setScreenshotsAllowed
    ? device.setScreenshotsAllowed(allowed)
    : false;
}
