import { NativeModules } from 'react-native';
import { capturePhoto, recognizeSpeech } from '../src/platform/nativeCapture';
afterEach(() => {
  delete NativeModules.CeeDemoDevice;
});
test('unavailable OS facilities retain explicit unavailable outcomes', async () => {
  expect(await capturePhoto()).toEqual({ status: 'unavailable' });
  expect(await recognizeSpeech()).toEqual({ status: 'unavailable' });
});
test('camera and speech preserve selected/cancelled OS results without uploading', async () => {
  const photo = {
    status: 'selected',
    uri: 'content://demo.files/photo.jpg',
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
  };
  NativeModules.CeeDemoDevice = {
    capturePhoto: jest.fn().mockResolvedValue(photo),
    recognizeSpeech: jest
      .fn()
      .mockResolvedValue({ status: 'recognized', text: 'Show my accounts' }),
  };
  expect(await capturePhoto()).toEqual(photo);
  expect(await recognizeSpeech('cs')).toEqual({
    status: 'recognized',
    text: 'Show my accounts',
  });
  expect(NativeModules.CeeDemoDevice.recognizeSpeech).toHaveBeenCalledWith(
    'cs',
  );
  NativeModules.CeeDemoDevice.capturePhoto.mockResolvedValue({
    status: 'cancelled',
  });
  expect(await capturePhoto()).toEqual({ status: 'cancelled' });
});
