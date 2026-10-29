import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { existsSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs'
import childProcess from 'node:child_process'
import { EventEmitter } from 'node:events'
import { syncBuiltinESMExports } from 'node:module'
import { bridgeAssetPath, nativeBridgePlugin } from './bridge-files.mjs'

test('same-origin Native artifact paths cannot escape their build output', () => {
  const root = path.resolve('native-spike/dist-host')
  assert.equal(bridgeAssetPath(root, '/native-demo/current-host.js?build=123'), path.join(root, 'current-host.js'))
  for (const value of [
    '/native-demo/../package.json',
    '/native-demo/%2e%2e/package.json',
    '/native-demo/..%5cpackage.json',
    '/other/file.js',
    '/native-demo/%ZZ',
  ])
    assert.equal(bridgeAssetPath(root, value), null)
})

test('a directory junction cannot expose files outside the Native artifact directory', () => {
  mkdirSync('.codex-temp', { recursive: true })
  const fixture = mkdtempSync(path.resolve('.codex-temp/native-artifact-path-'))
  const root = path.join(fixture, 'artifacts'),
    outside = path.join(fixture, 'private')
  mkdirSync(root)
  mkdirSync(outside)
  writeFileSync(path.join(outside, 'benign.txt'), 'fixture only')
  symlinkSync(outside, path.join(root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir')
  assert.equal(bridgeAssetPath(root, '/native-demo/escape/benign.txt'), null)
})

function fakeWatch() {
  const child = new EventEmitter()
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  child.killCalls = 0
  child.kill = () => child.killCalls++
  return child
}

test('completed Native rebuild notifies the demo without reloading the whole page', async (t) => {
  const child = fakeWatch()
  const spawn = t.mock.method(childProcess, 'spawn', () => child)
  syncBuiltinESMExports()
  const fixture = mkdtempSync(path.resolve('.codex-temp/native-watch-update-'))
  const viteBin = path.join(fixture, 'native-spike/node_modules/vite/bin')
  mkdirSync(viteBin, { recursive: true })
  writeFileSync(path.join(viteBin, 'vite.js'), 'fixture only')
  const plugin = nativeBridgePlugin(fixture)
  const messages = []
  try {
    await plugin.configureServer({
      config: { server: { middlewareMode: false }, logger: { warn() {}, error() {} } },
      httpServer: new EventEmitter(), middlewares: { use() {} }, ws: { send: message => messages.push(message) },
    })
    writeFileSync(path.join(fixture, 'native-spike/dist-host/current-host.js'), 'fixture only')
    child.stdout.emit('data', Buffer.from('built in 1ms'))
    await new Promise(resolve => setTimeout(resolve, 150))
    assert.equal(messages.length, 1)
    assert.equal(messages[0].type, 'custom')
    assert.equal(messages[0].event, 'native-demo:built')
  } finally {
    plugin.closeBundle()
    spawn.mock.restore()
    syncBuiltinESMExports()
  }
})

test('SSR audit servers do not spawn a Native watcher or register artifact middleware', async (t) => {
  const spawn = t.mock.method(childProcess, 'spawn', () => {
    throw new Error('SSR audit must not start a Native watch build')
  })
  syncBuiltinESMExports()
  try {
    const plugin = nativeBridgePlugin(process.cwd())
    await plugin.configureServer({
      config: { server: { middlewareMode: true } },
      httpServer: null,
      middlewares: { use: () => assert.fail('SSR audit does not serve the demo artifact') },
    })
    assert.equal(spawn.mock.callCount(), 0)
  } finally {
    spawn.mock.restore()
    syncBuiltinESMExports()
  }
})

test('closing the Vite plugin disposes its own development watcher once', async (t) => {
  const child = fakeWatch()
  const spawn = t.mock.method(childProcess, 'spawn', () => child)
  syncBuiltinESMExports()
  try {
    const fixture = mkdtempSync(path.resolve('.codex-temp/native-watch-lifecycle-'))
    const viteBin = path.join(fixture, 'native-spike/node_modules/vite/bin')
    mkdirSync(viteBin, { recursive: true })
    writeFileSync(path.join(viteBin, 'vite.js'), 'fixture only')
    const plugin = nativeBridgePlugin(fixture)
    const httpServer = new EventEmitter()
    let reloads = 0
    await plugin.configureServer({
      config: { server: { middlewareMode: false }, logger: { warn() {}, error() {} } },
      httpServer,
      middlewares: { use() {} },
      ws: { send: () => reloads++ },
    })
    const output = path.join(fixture, 'native-spike/dist-host')
    writeFileSync(path.join(output, 'current-host.js'), 'fixture only')
    assert.equal(spawn.mock.callCount(), 1)
    child.stdout.emit('data', Buffer.from('built in 1ms'))
    plugin.closeBundle()
    httpServer.emit('close')
    child.stdout.emit('data', Buffer.from('built in 1ms'))
    await new Promise((resolve) => setTimeout(resolve, 125))
    assert.equal(child.killCalls, 1)
    assert.equal(reloads, 0)
    assert.equal(existsSync(path.join(output, 'manifest.json')), false)
  } finally {
    spawn.mock.restore()
    syncBuiltinESMExports()
  }
})
