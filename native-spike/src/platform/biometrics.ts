import { NativeModules, Platform } from 'react-native';
type BiometricResult = 'authenticated' | 'cancelled' | 'unavailable';
export async function nativeBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const module = NativeModules.CeeDemoDevice as
    | { biometricAvailable?: () => Promise<boolean> }
    | undefined;
  return module?.biometricAvailable ? module.biometricAvailable() : false;
}
export async function authenticateNativeBiometric(
  title = 'Conferma operazione',
): Promise<BiometricResult> {
  if (Platform.OS === 'web') return 'unavailable';
  const module = NativeModules.CeeDemoDevice as
    | { authenticate?: (title: string) => Promise<BiometricResult> }
    | undefined;
  return module?.authenticate ? module.authenticate(title) : 'unavailable';
}
