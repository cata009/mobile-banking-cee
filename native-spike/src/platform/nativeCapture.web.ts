import type { CaptureResult, SpeechResult } from './nativeCapture';
/** RNWeb preview never claims a native device facility it cannot exercise. */
export async function capturePhoto(): Promise<CaptureResult> {
  return { status: 'unavailable' };
}
export async function recognizeSpeech(_language = 'en'): Promise<SpeechResult> {
  return { status: 'unavailable' };
}
