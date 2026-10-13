import { assertDeploymentIdentity, type VercelDeployment } from './release.js'
import { required, requireProductionUrl } from './env.js'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { BuildAdapter, HotUpdaterCoreApi } from '@hot-updater/plugin-core'

/** Source checks never mutate Git. Ignored build/dependency outputs are not source. */
export function assertLocalSourceIdentity(expectedSha: string, cwd = process.cwd()) {
  if (!/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error('Verified source SHA is invalid')
  let gitCwd = cwd
  const git = (...args: string[]) =>
    execFileSync('git', args, {
      cwd: gitCwd,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  if (git('rev-parse', 'HEAD').trim() !== expectedSha) throw new Error('Local Git HEAD differs from verified SHA')
  const root = git('rev-parse', '--show-toplevel').trim()
  gitCwd = root
  const tracked = git('ls-files', '-v', '-z').split('\0').filter(Boolean)
  if (tracked.some((entry) => entry[0] === 'S' || entry[0] === entry[0]?.toLowerCase()))
    throw new Error('Clean source requires a complete checkout without hidden tracked changes')
  const pending = git('status', '--porcelain=v1', '-z', '--untracked-files=all').split('\0').filter(Boolean)
  const selectionPath = 'native-spike/hot-updater.config.ts'
  for (const entry of pending) {
    if (entry !== ` M ${selectionPath}`)
      throw new Error('Production release requires clean tracked and untracked source')
    const productionPath = 'native-spike/hot-updater.production.config.ts'
    const production = readFileSync(path.join(root, productionPath))
    if (
      !readFileSync(path.join(root, selectionPath)).equals(production) ||
      git('hash-object', `--path=${productionPath}`, path.join(root, productionPath)).trim() !==
        git('rev-parse', `${expectedSha}:${productionPath}`).trim()
    )
      throw new Error('Runner configuration selection differs from committed production configuration identity')
  }
  const ignoredSource = git(
    'ls-files',
    '--others',
    '--ignored',
    '--exclude-standard',
    '-z',
    '--',
    'src',
    'api',
    'public',
    'scripts',
    'tests',
    '.github',
    // Metro can resolve authored platform variants/config anywhere in the package,
    // including its root. Only named dependency/generated outputs may be ignored.
    'native-spike',
    ':(exclude)native-spike/node_modules',
    ':(exclude)native-spike/.hot-updater/output',
    ':(exclude)native-spike/dist',
    ':(exclude)native-spike/coverage',
    ':(exclude)native-spike/android/.gradle',
    ':(exclude)native-spike/android/.kotlin',
    ':(exclude)native-spike/android/build',
    ':(exclude)native-spike/android/app/build',
    ':(exclude)native-spike/android/app/.cxx',
    ':(exclude)native-spike/android/app/.kotlin',
    ':(exclude)native-spike/android/local.properties',
    ':(exclude)native-spike/ios/Pods',
    ':(exclude)native-spike/ios/build',
    'native-update-server/src',
    'native-update-server/scripts',
    'native-update-server/tests',
  )
  if (ignoredSource.length) throw new Error('Production release requires clean source, including ignored source files')
}

export async function verifyDeploymentProvider(event: any, env: NodeJS.ProcessEnv, request: typeof fetch = fetch) {
  if (event.deployment_status?.state !== 'success') throw new Error('Successful Vercel deployment event required')
  const deploymentUrl = requireProductionUrl(event.deployment_status.environment_url, 'Vercel deployment URL')
  const repository = event.repository?.full_name
  const branch = event.repository?.default_branch
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '') || typeof branch !== 'string')
    throw new Error('Invalid repository identity')
  async function json(url: string, token: string) {
    const response = await request(url, {
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
      redirect: 'error',
    })
    if (!response.ok) throw new Error('Deployment identity service refused verification')
    return response.json()
  }
  const head = await json(
    `https://api.github.com/repos/${repository}/git/ref/heads/${encodeURIComponent(branch)}`,
    required(env, 'GITHUB_TOKEN'),
  )
  const team = env.VERCEL_TEAM_ID ? `?teamId=${encodeURIComponent(env.VERCEL_TEAM_ID)}` : ''
  const vercel = (await json(
    `https://api.vercel.com/v13/deployments/${encodeURIComponent(new URL(deploymentUrl).hostname)}${team}`,
    required(env, 'VERCEL_TOKEN'),
  )) as VercelDeployment
  const sha = assertDeploymentIdentity(
    {
      sha: event.deployment.sha,
      ref: event.deployment.ref,
      state: event.deployment_status.state,
      environment: event.deployment.environment,
    },
    vercel,
    { defaultBranch: branch, headSha: head.object?.sha, projectId: required(env, 'VERCEL_WEB_PROJECT_ID') },
  )
  const productionURL = requireProductionUrl(required(env, 'VERCEL_WEB_PRODUCTION_URL'), 'VERCEL_WEB_PRODUCTION_URL')
  if (new URL(productionURL).pathname !== '/') throw new Error('Production web alias must be an origin')
  const alias = await json(
    `https://api.vercel.com/v4/aliases/${encodeURIComponent(new URL(productionURL).hostname)}${team}`,
    required(env, 'VERCEL_TOKEN'),
  )
  if (
    !vercel.id ||
    alias.projectId !== required(env, 'VERCEL_WEB_PROJECT_ID') ||
    alias.deploymentId !== vercel.id ||
    alias.redirect
  )
    throw new Error('Deployment is not the currently served production web alias')
  return { sha, deploymentId: vercel.id }
}

/** The second check runs after signing/uploading, immediately before the SDK's catalog mutation. */
export function guardCatalogMutation(
  operation: HotUpdaterCoreApi['deploy'],
  verify: () => Promise<{ sha: string }>,
): HotUpdaterCoreApi['deploy'] {
  return async (deployments) => {
    const { sha } = await verify()
    if (
      !/^[a-f0-9]{40}$/.test(sha) ||
      deployments.length === 0 ||
      deployments.some((deployment) => !('bundle' in deployment) || deployment.bundle.gitCommitHash !== sha)
    )
      throw new Error(
        'Every submitted bundle must bind to the exact verified source SHA; stored republish is forbidden',
      )
    return operation(deployments)
  }
}

/** This release configuration publishes new verified builds only. Other mutations use reviewed operator tooling. */
export function guardProductionCore(
  core: HotUpdaterCoreApi,
  verify: () => Promise<{ sha: string }>,
): HotUpdaterCoreApi {
  const operatorOnly = async (): Promise<never> => {
    throw new Error('This publishing configuration forbids alternate mutations; use reviewed operator tooling')
  }
  return {
    ...core,
    deploy: guardCatalogMutation(core.deploy, verify),
    updateReleasePolicy: operatorOnly,
    promoteRelease: operatorOnly,
    rebuildReleaseCatalog: operatorOnly,
    deleteRelease: operatorOnly,
    updateBundle: operatorOnly,
    deleteBundles: operatorOnly,
    ensureChannel: operatorOnly,
    deleteChannel: operatorOnly,
  }
}

export function guardProductionBuild(adapter: BuildAdapter, verify: () => Promise<{ sha: string }>): BuildAdapter {
  return {
    ...adapter,
    build: async (input) => {
      await verify()
      return adapter.build(input)
    },
  }
}
