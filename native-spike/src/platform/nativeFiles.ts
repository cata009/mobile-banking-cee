import { Image, NativeModules } from 'react-native';

const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function bytesToBase64(bytes: Uint8Array): string {
  const output: string[] = [];
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index]!,
      b = bytes[index + 1] ?? 0,
      c = bytes[index + 2] ?? 0;
    output.push(
      alphabet[Math.floor(a / 4)]!,
      alphabet[(a % 4) * 16 + Math.floor(b / 16)]!,
      index + 1 < bytes.length
        ? alphabet[(b % 16) * 4 + Math.floor(c / 64)]!
        : '=',
      index + 2 < bytes.length ? alphabet[c % 64]! : '=',
    );
  }
  return output.join('');
}
export async function shareDemoFile(
  filename: string,
  mime: string,
  bytes: Uint8Array,
) {
  const module = NativeModules.CeeDemoDevice as
    | {
        shareFile?: (
          filename: string,
          mime: string,
          base64: string,
        ) => Promise<boolean>;
      }
    | undefined;
  if (!module?.shareFile)
    throw new Error('Condivisione documenti non disponibile');
  await module.shareFile(filename, mime, bytesToBase64(bytes));
}
export async function copyDemoText(text: string) {
  const module = NativeModules.CeeDemoDevice as
    | { copyText?: (value: string) => Promise<boolean> }
    | undefined;
  if (!module?.copyText) throw new Error('Copia non disponibile');
  await module.copyText(text);
}

export function bytesFromBase64(encoded: string): Uint8Array {
  const clean = encoded.replace(/(?:=+)$/, '');
  if (!/^[A-Za-z0-9+/]*$/.test(clean) || encoded.length % 4 !== 0)
    throw new Error('Invalid original asset bytes');
  const result = new Uint8Array(Math.floor((clean.length * 6) / 8));
  let buffer = 0,
    bits = 0,
    position = 0;
  for (const character of clean) {
    buffer = buffer * 64 + alphabet.indexOf(character);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      result[position++] = Math.floor(buffer / 2 ** bits);
      buffer %= 2 ** bits;
    }
  }
  return result;
}
export async function shareOriginalAsset(
  asset: string | number,
  filename: string,
) {
  const uri =
    typeof asset === 'number' ? Image.resolveAssetSource(asset)?.uri : asset;
  const module = NativeModules.CeeDemoDevice as
    | {
        readOriginalAsset?: (
          uri: string,
        ) => Promise<{ base64: string; mime: string }>;
      }
    | undefined;
  if (!uri || !module?.readOriginalAsset)
    throw new Error('Condivisione del documento originale non disponibile');
  const original = await module.readOriginalAsset(uri);
  await shareDemoFile(
    filename,
    original.mime,
    bytesFromBase64(original.base64),
  );
}
