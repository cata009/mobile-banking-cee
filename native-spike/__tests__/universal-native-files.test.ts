import { NativeModules } from 'react-native';
import {
  bytesToBase64,
  bytesFromBase64,
  shareOriginalAsset,
} from '../src/platform/nativeFiles';
test.each([
  [[], ''],
  [[102], 'Zg=='],
  [[102, 111], 'Zm8='],
  [[102, 111, 111], 'Zm9v'],
  [[0, 255, 128], 'AP+A'],
])(
  'encodes original document bytes without text conversion',
  (input, expected) => {
    expect(bytesToBase64(new Uint8Array(input as number[]))).toBe(expected);
  },
);

test('original source image bytes survive bridge encoding without bitmap conversion', async () => {
  const bytes = new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70, 0, 255]);
  expect(bytesFromBase64(bytesToBase64(bytes))).toEqual(bytes);
  const previous = NativeModules.CeeDemoDevice;
  const readOriginalAsset = jest.fn(async () => ({
    base64: bytesToBase64(bytes),
    mime: 'image/jpeg',
  }));
  const shareFile = jest.fn(async () => true);
  try {
    NativeModules.CeeDemoDevice = { readOriginalAsset, shareFile };
    await shareOriginalAsset(
      'file:///application/original.png',
      'mifidDocument.png',
    );
    expect(readOriginalAsset).toHaveBeenCalledWith(
      'file:///application/original.png',
    );
    expect(shareFile).toHaveBeenCalledWith(
      'mifidDocument.png',
      'image/jpeg',
      bytesToBase64(bytes),
    );
  } finally {
    NativeModules.CeeDemoDevice = previous;
  }
});
test('invalid original image byte envelopes are refused', () => {
  expect(() => bytesFromBase64('bad*')).toThrow();
  expect(() => bytesFromBase64('abc')).toThrow();
});
