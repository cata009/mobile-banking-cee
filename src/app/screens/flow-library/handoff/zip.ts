/**
 * Minimal ZIP writer.
 *
 * A `.docx` is a ZIP of XML parts, and Confluence Data Center's "Import Word
 * Document" only accepts the real thing. Adding a packaging library needs
 * separate approval in this repo, so entries are written with the STORED
 * (uncompressed) method: a valid ZIP by spec, understood by Word and by the
 * Confluence importer alike. Documents here are a few hundred KB of XML plus
 * already-compressed PNGs, so skipping deflate costs almost nothing.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xed_b8_83_20 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xff_ff_ff_ff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xff_ff_ff_ff) >>> 0;
}

export interface ZipEntry {
  /** Path inside the archive, e.g. `word/document.xml`. Forward slashes only. */
  name: string;
  data: Uint8Array<ArrayBuffer>;
}

/** Fixed DOS timestamp: the archive is content-addressed, not time-sensitive. */
const DOS_TIME = 0;
const DOS_DATE = 0x21 << 5; // 1 Jan 2000

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true);
}

/** Build a ZIP archive from the given entries, in order. */
export function createZip(entries: readonly ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const locals: Uint8Array<ArrayBuffer>[] = [];
  const centrals: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    writeUint32(localView, 0, 0x04_03_4b_50);
    writeUint16(localView, 4, 20); // version needed
    writeUint16(localView, 6, 0); // flags
    writeUint16(localView, 8, 0); // method: stored
    writeUint16(localView, 10, DOS_TIME);
    writeUint16(localView, 12, DOS_DATE);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, size);
    writeUint32(localView, 22, size);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0); // extra length
    local.set(nameBytes, 30);
    locals.push(local, entry.data);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    writeUint32(centralView, 0, 0x02_01_4b_50);
    writeUint16(centralView, 4, 20); // version made by
    writeUint16(centralView, 6, 20); // version needed
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, DOS_TIME);
    writeUint16(centralView, 14, DOS_DATE);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, size);
    writeUint32(centralView, 24, size);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0); // extra
    writeUint16(centralView, 32, 0); // comment
    writeUint16(centralView, 34, 0); // disk
    writeUint16(centralView, 36, 0); // internal attrs
    writeUint32(centralView, 38, 0); // external attrs
    writeUint32(centralView, 42, offset);
    central.set(nameBytes, 46);
    centrals.push(central);

    offset += local.length + size;
  }

  const centralSize = centrals.reduce((total, part) => total + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  writeUint32(endView, 0, 0x06_05_4b_50);
  writeUint16(endView, 8, entries.length);
  writeUint16(endView, 10, entries.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);

  return new Blob([...locals, ...centrals, end], { type: "application/zip" });
}

/** Decode a base64 payload (as produced by the screen capture) to bytes. */
export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
