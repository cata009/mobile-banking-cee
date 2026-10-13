import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const require = createRequire(new URL('../../../native-spike/package.json', import.meta.url));
const { createStorageAdapter, createStorageUri, parseStorageUri } = require('@hot-updater/plugin-core');
export const checkout = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
export const proofRoot = path.join(checkout, '.codex-temp/universal-demo/ota');
const objects = path.join(proofRoot, 'objects');

export function localObjectPath(key) {
  if (typeof key !== 'string' || !key || key.includes('\\') || key.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid local OTA object key');
  const target = path.resolve(objects, key);
  if (!target.startsWith(objects + path.sep)) throw new Error('OTA object escapes proof directory');
  return target;
}
function uriKey(uri) {
  const value = parseStorageUri(uri, 'local-ota');
  if (value.bucket !== 'proof') throw new Error('Unexpected OTA bucket');
  return value.key;
}
export function localOtaStorage(baseURL = 'http://localhost:4010') {
  return createStorageAdapter({
    name: 'localOtaProof', protocol: 'local-ota',
    async put({ key, body }) {
      const target = localObjectPath(key);
      await fs.mkdir(path.dirname(target), { recursive: true });
      const bytes = Buffer.from(await new globalThis.Response(body).arrayBuffer());
      try { await fs.writeFile(target, bytes, { flag: 'wx' }); }
      catch (error) { if (error.code !== 'EEXIST' || !(await fs.readFile(target)).equals(bytes)) throw error; }
      return { storageUri: createStorageUri({ protocol: 'local-ota', bucket: 'proof', key }) };
    },
    async get({ storageUri }) {
      try { return { response: new globalThis.Response(await fs.readFile(localObjectPath(uriKey(storageUri)))) }; }
      catch (error) { if (error.code === 'ENOENT') return { response: null }; throw error; }
    },
    async exists({ storageUri }) {
      try { await fs.stat(localObjectPath(uriKey(storageUri))); return { exists: true }; }
      catch (error) { if (error.code === 'ENOENT') return { exists: false }; throw error; }
    },
    async getDownloadUrl({ storageUri }) {
      const key = uriKey(storageUri); localObjectPath(key);
      return { url: `${baseURL}/objects/${key.split('/').map(encodeURIComponent).join('/')}` };
    },
    async delete({ storageUri }) {
      const target = localObjectPath(uriKey(storageUri));
      const quarantine = path.join(proofRoot, 'quarantine');
      await fs.mkdir(quarantine, { recursive: true });
      try { await fs.rename(target, path.join(quarantine, `${randomUUID()}-${path.basename(target)}`)); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      return { deleted: true };
    },
  });
}
