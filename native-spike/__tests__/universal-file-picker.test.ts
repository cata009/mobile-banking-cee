import { NativeModules } from 'react-native';
import { pickLocalDocument } from '../src/platform/filePicker';
test('the OS picker returns selected local metadata and cancellation remains empty', async () => {
  const previous = NativeModules.CeeDemoDevice;
  const file = {
    uri: 'content://local/document/1',
    name: 'busta-paga.pdf',
    mime: 'application/pdf',
    size: 1024,
  };
  const pick = jest
    .fn()
    .mockResolvedValueOnce(file)
    .mockResolvedValueOnce(null);
  try {
    NativeModules.CeeDemoDevice = { pickLocalDocument: pick };
    expect(await pickLocalDocument()).toEqual(file);
    expect(pick).toHaveBeenLastCalledWith(false);
    expect(await pickLocalDocument(true)).toBeNull();
    expect(pick).toHaveBeenLastCalledWith(true);
  } finally {
    NativeModules.CeeDemoDevice = previous;
  }
});
test('an older base APK does not pretend to open a file selector', async () => {
  const previous = NativeModules.CeeDemoDevice;
  try {
    NativeModules.CeeDemoDevice = {};
    await expect(pickLocalDocument()).rejects.toThrow('non disponibile');
  } finally {
    NativeModules.CeeDemoDevice = previous;
  }
});
