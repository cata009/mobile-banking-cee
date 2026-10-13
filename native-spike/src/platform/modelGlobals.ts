import { serialize, deserialize } from '@ungap/structured-clone';

/** Runtime compatibility ports for pure source models. Existing native built-ins are never replaced. */
export function cloneModelData<T>(value: T): T {
  return deserialize(serialize(value));
}
export class ModelTextEncoder {
  readonly encoding = 'utf-8';
  encode(input = ''): Uint8Array {
    const bytes: number[] = [];
    for (const character of String(input)) {
      let point = character.codePointAt(0)!;
      if (point >= 0xd800 && point <= 0xdfff) point = 0xfffd;
      if (point < 0x80) bytes.push(point);
      else if (point < 0x800)
        bytes.push(0xc0 + Math.floor(point / 64), 0x80 + (point % 64));
      else if (point < 0x10000)
        bytes.push(
          0xe0 + Math.floor(point / 4096),
          0x80 + (Math.floor(point / 64) % 64),
          0x80 + (point % 64),
        );
      else
        bytes.push(
          0xf0 + Math.floor(point / 262144),
          0x80 + (Math.floor(point / 4096) % 64),
          0x80 + (Math.floor(point / 64) % 64),
          0x80 + (point % 64),
        );
    }
    return new Uint8Array(bytes);
  }
  encodeInto(source: string, destination: Uint8Array) {
    let read = 0,
      written = 0;
    for (const character of source) {
      const bytes = this.encode(character);
      if (written + bytes.length > destination.length) break;
      destination.set(bytes, written);
      written += bytes.length;
      read += character.length;
    }
    return { read, written };
  }
}
export function installModelGlobals() {
  if (typeof globalThis.structuredClone !== 'function')
    Object.defineProperty(globalThis, 'structuredClone', {
      configurable: true,
      writable: true,
      value: <T>(value: T, options?: StructuredSerializeOptions): T => {
        if (options?.transfer?.length) {
          const error = new Error(
            'Transfer is not supported by the native demo clone port',
          );
          error.name = 'DataCloneError';
          throw error;
        }
        return cloneModelData(value);
      },
    });
  if (typeof globalThis.TextEncoder !== 'function')
    Object.defineProperty(globalThis, 'TextEncoder', {
      configurable: true,
      value: ModelTextEncoder,
    });
}
