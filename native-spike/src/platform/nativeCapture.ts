import { NativeModules } from 'react-native';
export type CaptureResult =
  | { status: 'selected'; uri: string; name: string; mimeType: string }
  | { status: 'cancelled' | 'unavailable' };
export type SpeechResult =
  | { status: 'recognized'; text: string }
  | { status: 'cancelled' | 'unavailable' };
type DeviceCapture = {
  capturePhoto?: () => Promise<CaptureResult>;
  recognizeSpeech?: (language: string) => Promise<SpeechResult>;
};
export async function capturePhoto(): Promise<CaptureResult> {
  const device = NativeModules.CeeDemoDevice as DeviceCapture | undefined;
  return device?.capturePhoto
    ? device.capturePhoto()
    : { status: 'unavailable' };
}
export async function recognizeSpeech(language = 'en'): Promise<SpeechResult> {
  const device = NativeModules.CeeDemoDevice as DeviceCapture | undefined;
  return device?.recognizeSpeech
    ? device.recognizeSpeech(language)
    : { status: 'unavailable' };
}
