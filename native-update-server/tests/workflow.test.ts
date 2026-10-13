import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

test('workflow publication is opt-in, production-success-only, and checks out the deployment SHA', async () => {
  const workflow = parse(
    await readFile(new URL('../../.github/workflows/native-demo-ota.yml', import.meta.url), 'utf8'),
  )
  const release = workflow.jobs.release
  const eligible = new Function('vars', 'github', `return (${release.if});`)
  const github = {
    event_name: 'deployment_status',
    event: { deployment_status: { state: 'success' }, deployment: { environment: 'Production' } },
  }
  assert.equal(eligible({}, github), false)
  assert.equal(eligible({ NATIVE_OTA_RELEASE_ENABLED: 'false' }, github), false)
  assert.equal(eligible({ NATIVE_OTA_RELEASE_ENABLED: 'true' }, github), true)
  assert.equal(
    eligible(
      { NATIVE_OTA_RELEASE_ENABLED: 'true' },
      { ...github, event: { ...github.event, deployment: { environment: 'Preview' } } },
    ),
    false,
  )
  assert.equal(
    eligible(
      { NATIVE_OTA_RELEASE_ENABLED: 'true' },
      { ...github, event: { ...github.event, deployment_status: { state: 'pending' } } },
    ),
    false,
  )
  const checkout = release.steps.find((step: { uses?: string }) => step.uses?.startsWith('actions/checkout@'))
  assert.equal(checkout.with.ref, '${{ github.event.deployment.sha }}')
  assert.equal(checkout.with['persist-credentials'], false)
  assert.equal(release.environment, 'native-ota-production')
  for (const job of [workflow.jobs.checks, release]) {
    const nativeInstall = job.steps.findIndex(
      (step: { run?: string; 'working-directory'?: string }) =>
        step.run === 'npm ci' && step['working-directory'] === 'native-spike',
    )
    const serverTest = job.steps.findIndex(
      (step: { run?: string; 'working-directory'?: string }) =>
        step.run === 'npm test' && step['working-directory'] === 'native-update-server',
    )
    assert.ok(
      nativeInstall >= 0 && nativeInstall < serverTest,
      'production-config test needs native SDK dependencies installed first',
    )
    assert.ok(job.steps.some((step: { run?: string }) => step.run === 'npm run typecheck:production-config'))
  }
})
