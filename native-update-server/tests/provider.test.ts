import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Deployment, HotUpdaterCoreApi } from '@hot-updater/plugin-core'
import {
  verifyDeploymentProvider,
  guardCatalogMutation,
  assertLocalSourceIdentity,
  guardProductionCore,
  guardProductionBuild,
} from '../src/deployment-provider.js'

const deployment = (sha: string): Deployment => ({
  bundle: {
    id: '01900000-0000-7000-8000-000000000001',
    platform: 'android',
    gitCommitHash: sha,
    manifestStorageUri: 'test://bucket/manifest.json',
    manifestFileHash: 'a'.repeat(64),
    assetBaseStorageUri: 'test://bucket/assets',
  },
  release: {
    channel: 'demo-preview',
    enabled: true,
    fingerprintHash: 'b'.repeat(40),
    message: null,
    shouldForceUpdate: false,
    targetAppVersion: null,
  },
})
async function withCheckout(run: (cwd: string, sha: string) => Promise<void>) {
  const cwd = await mkdtemp(path.join(tmpdir(), 'cee-ota-source-test-'))
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  try {
    await mkdir(path.join(cwd, 'native-spike'), { recursive: true })
    await mkdir(path.join(cwd, 'src'), { recursive: true })
    await writeFile(path.join(cwd, 'src/app.ts'), 'export const app = 1\n')
    await writeFile(path.join(cwd, '.gitignore'), '*.ignored.ts\n')
    await writeFile(path.join(cwd, 'native-spike/hot-updater.config.ts'), 'approved original configuration\n')
    await writeFile(
      path.join(cwd, 'native-spike/hot-updater.production.config.ts'),
      'approved production configuration\n',
    )
    git('init', '--quiet')
    git('-c', 'user.name=OTA Fixture', '-c', 'user.email=ota-fixture@example.invalid', 'add', '.')
    git(
      '-c',
      'user.name=OTA Fixture',
      '-c',
      'user.email=ota-fixture@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    )
    await run(cwd, git('rev-parse', 'HEAD'))
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
}

test('provider verification re-reads trusted API state and prevents stale publication after a build', async () => {
  const sha = 'a'.repeat(40)
  let head = sha
  let currentAlias = 'dpl_exact'
  let commits = 0
  const event = {
    repository: { full_name: 'demo/banking', default_branch: 'main' },
    deployment: { sha, ref: 'main', environment: 'Production' },
    deployment_status: { state: 'success', environment_url: 'https://banking-deployment.vercel.app' },
  }
  const env = {
    GITHUB_TOKEN: 'fake',
    VERCEL_TOKEN: 'fake',
    VERCEL_WEB_PROJECT_ID: 'prj_web',
    VERCEL_WEB_PRODUCTION_URL: 'https://banking.vercel.app',
  }
  const request: typeof fetch = async (input) =>
    Response.json(
      String(input).startsWith('https://api.github.com/')
        ? { object: { sha: head } }
        : String(input).includes('/v4/aliases/')
          ? { projectId: 'prj_web', deploymentId: currentAlias }
          : {
              projectId: 'prj_web',
              readyState: 'READY',
              target: 'production',
              id: 'dpl_exact',
              meta: { githubCommitSha: sha, githubCommitRef: 'main' },
            },
    )
  assert.deepEqual(await verifyDeploymentProvider(event, env, request), { sha, deploymentId: 'dpl_exact' })
  const commit = guardCatalogMutation(
    async () => {
      commits++
      return []
    },
    () => verifyDeploymentProvider(event, env, request),
  )
  head = 'b'.repeat(40)
  await assert.rejects(() => commit([deployment(sha)]), /SHA/)
  assert.equal(commits, 0)
  head = sha
  currentAlias = 'dpl_staged'
  await assert.rejects(() => commit([deployment(sha)]), /currently served production/)
  assert.equal(commits, 0)
  currentAlias = 'dpl_exact'
  await commit([deployment(sha)])
  assert.equal(commits, 1)
})

test('submitted bundles must match the verified SHA; stored republish cannot bypass the binding', async () => {
  let calls = 0
  const sha = 'a'.repeat(40)
  const commit = guardCatalogMutation(
    async () => {
      calls++
      return []
    },
    async () => ({ sha }),
  )
  await assert.rejects(() => commit([deployment('b'.repeat(40))]), /bundle.*SHA/i)
  const { release } = deployment(sha)
  await assert.rejects(() => commit([{ bundleId: 'stored', release }]), /bundle.*SHA/i)
  assert.equal(calls, 0)
  await commit([deployment(sha)])
  assert.equal(calls, 1)
})

test('immutable local checkout must have the verified HEAD', async () =>
  withCheckout(async (cwd, sha) => {
    assert.doesNotThrow(() => assertLocalSourceIdentity(sha, cwd))
    assert.doesNotThrow(() => assertLocalSourceIdentity(sha, path.join(cwd, 'native-spike')))
    assert.throws(() => assertLocalSourceIdentity('a'.repeat(40), cwd), /HEAD.*SHA/i)
  }))
test('tracked source changes reject publication', async () =>
  withCheckout(async (cwd, sha) => {
    await writeFile(path.join(cwd, 'src/app.ts'), 'changed source\n')
    assert.throws(() => assertLocalSourceIdentity(sha, cwd), /clean.*source/i)
  }))
test('untracked source changes reject publication', async () =>
  withCheckout(async (cwd, sha) => {
    await writeFile(path.join(cwd, 'src/new.ts'), 'new source\n')
    assert.throws(() => assertLocalSourceIdentity(sha, cwd), /clean.*source/i)
  }))
test('ignored source changes also reject publication', async () =>
  withCheckout(async (cwd, sha) => {
    await writeFile(path.join(cwd, 'src/new.ignored.ts'), 'ignored source\n')
    assert.throws(() => assertLocalSourceIdentity(sha, cwd), /clean.*source/i)
    assert.throws(() => assertLocalSourceIdentity(sha, path.join(cwd, 'native-spike')), /clean.*source/i)
  }))
test('ignored native root platform variants cannot shadow the committed App entry', async () =>
  withCheckout(async (cwd, sha) => {
    await writeFile(path.join(cwd, '.git/info/exclude'), 'App.android.tsx\n')
    await writeFile(path.join(cwd, 'native-spike/App.android.tsx'), 'export default function ShadowApp() {}\n')
    assert.throws(() => assertLocalSourceIdentity(sha, path.join(cwd, 'native-spike')), /clean.*source/i)
  }))
test('ignored native root configuration is source while named generated outputs remain allowed', async () =>
  withCheckout(async (cwd, sha) => {
    await writeFile(path.join(cwd, '.git/info/exclude'), 'native-spike/**\n')
    for (const directory of [
      'node_modules/dependency',
      '.hot-updater/output/production',
      'android/app/build/generated',
      'dist',
      'coverage',
    ]) {
      await mkdir(path.join(cwd, 'native-spike', directory), { recursive: true })
      await writeFile(path.join(cwd, 'native-spike', directory, 'output.js'), 'generated fixture\n')
    }
    assert.doesNotThrow(() => assertLocalSourceIdentity(sha, cwd))
    await writeFile(path.join(cwd, 'native-spike/shadow.config.cjs'), 'module.exports = {}\n')
    assert.throws(() => assertLocalSourceIdentity(sha, cwd), /clean.*source/i)
  }))
test('only the exact committed runner configuration selection is permitted', async () =>
  withCheckout(async (cwd, sha) => {
    const target = path.join(cwd, 'native-spike/hot-updater.config.ts')
    await writeFile(target, 'approved production configuration\n')
    assert.doesNotThrow(() => assertLocalSourceIdentity(sha, cwd))
    await writeFile(target, 'approved production configuration\nextra unsafe override\n')
    assert.throws(() => assertLocalSourceIdentity(sha, cwd), /configuration.*identity/i)
  }))
test('source dirt introduced during build is rejected immediately before mutation', async () =>
  withCheckout(async (cwd, sha) => {
    let calls = 0
    assertLocalSourceIdentity(sha, cwd)
    const commit = guardCatalogMutation(
      async () => {
        calls++
        return []
      },
      async () => {
        assertLocalSourceIdentity(sha, cwd)
        return { sha }
      },
    )
    await writeFile(path.join(cwd, 'src/app.ts'), 'changed during build\n')
    await assert.rejects(() => commit([deployment(sha)]), /clean.*source/i)
    assert.equal(calls, 0)
  }))
test('production publishing config cannot use alternate mutation methods', async () => {
  let calls = 0
  const operation = async () => {
    calls++
    return []
  }
  const core = guardProductionCore({ deploy: operation } as unknown as HotUpdaterCoreApi, async () => ({
    sha: 'a'.repeat(40),
  }))
  await assert.rejects(
    () => core.updateReleasePolicy({ releaseId: 'old', patch: { enabled: true } }),
    /reviewed.*operator/i,
  )
  await assert.rejects(
    () => core.promoteRelease({ releaseId: 'old', targetChannel: 'demo-preview' }),
    /reviewed.*operator/i,
  )
  await assert.rejects(() => core.rebuildReleaseCatalog('scope'), /reviewed.*operator/i)
  await assert.rejects(() => core.updateBundle('old', { gitCommitHash: 'a'.repeat(40) }), /reviewed.*operator/i)
  assert.equal(calls, 0)
})

test('verified deployment and local source are checked before the build adapter runs', async () =>
  withCheckout(async (cwd, sha) => {
    let builds = 0
    const adapter = guardProductionBuild(
      {
        name: 'local-fixture-build',
        build: async () => {
          builds++
          return { buildPath: 'fixture', bundleId: 'fixture', stdout: null }
        },
      },
      async () => {
        assertLocalSourceIdentity(sha, cwd)
        return { sha }
      },
    )
    await adapter.build({ platform: 'android' })
    assert.equal(builds, 1)
    await writeFile(path.join(cwd, 'src/app.ts'), 'changed before build\n')
    await assert.rejects(() => adapter.build({ platform: 'android' }), /clean.*source/i)
    assert.equal(builds, 1)
  }))
