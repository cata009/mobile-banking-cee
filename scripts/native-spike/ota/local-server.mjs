import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { timingSafeEqual, randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { localObjectPath, localOtaStorage, proofRoot } from './local-storage.mjs';
const require = createRequire(new URL('../../../native-spike/package.json', import.meta.url));
const { createHotUpdater } = require('@hot-updater/server');
const { createMemoryAdapter, createEngineDatabase, migrateCoreSchema } = require('@hot-updater/plugin-core');
await fs.mkdir(proofRoot, { recursive: true });
const tokenPath = path.join(proofRoot, 'local-management-token.txt');
try { await fs.writeFile(tokenPath, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 }); }
catch (error) { if (error.code !== 'EEXIST') throw error; }
const token = (await fs.readFile(tokenPath, 'utf8')).trim();
const adapter = createMemoryAdapter();
await migrateCoreSchema(adapter, 'local-proof');
const server = createHotUpdater({ database: createEngineDatabase({ name: 'local-proof', adapter }), storage: localOtaStorage(), clientAccess: 'public' });
await server.core.ready();

/** Development proof only: loopback bound, temporary in-memory catalog, read-only public downloads. */
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost:4010');
    if (request.method === 'GET' && url.pathname.startsWith('/objects/')) {
      const bytes = await fs.readFile(localObjectPath(decodeURIComponent(url.pathname.slice(9))));
      response.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'public,max-age=31536000,immutable' }); response.end(bytes); return;
    }
    const admin = url.pathname.startsWith('/admin/');
    if (admin) {
      const header = String(request.headers.authorization ?? '');
      const expected = `Bearer ${token}`;
      if (header.length !== expected.length || !timingSafeEqual(Buffer.from(header), Buffer.from(expected))) { response.writeHead(401); response.end('Unauthorized'); return; }
      url.pathname = url.pathname.slice('/admin'.length);
    }
    const bytes = [];
    let length = 0;
    for await (const chunk of request) { length += chunk.length; if (length > 1024 * 1024) throw new Error('OTA management request too large'); bytes.push(chunk); }
    const body = Buffer.concat(bytes);
    const reply = await (admin ? server.handlers.admin : server.handlers.client)(new globalThis.Request(url, { method: request.method, headers: request.headers, ...(body.length ? { body } : {}) }));
    response.writeHead(reply.status, Object.fromEntries(reply.headers)); response.end(Buffer.from(await reply.arrayBuffer()));
  } catch (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 400); response.end('Local OTA proof request failed'); console.error(error.message); }
}).listen(4010, '127.0.0.1', () => console.log('Local signed OTA proof: http://localhost:4010 (catalog resets on server restart)'));
