import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync } from 'node:crypto'
import { assertDeploymentIdentity, assertPublishingIdentity, releasePolicy } from '../src/release.js'

const sha = 'a'.repeat(40)
const deployment = { sha, ref: 'main', state: 'success', environment: 'Production' }
const vercel = {
  id: 'dpl_reviewed',
  projectId: 'prj_web',
  readyState: 'READY',
  target: 'production',
  meta: { githubCommitSha: sha, githubCommitRef: 'main' },
}
const expected = { defaultBranch: 'main', headSha: sha, projectId: 'prj_web' }

test('release accepts only the exact successful production deployment SHA on the default branch', () => {
  assert.equal(assertDeploymentIdentity(deployment, vercel, expected), sha)
  for (const bad of [
    { ...deployment, sha: 'b'.repeat(40) },
    { ...deployment, ref: 'feature' },
    { ...deployment, state: 'pending' },
    { ...deployment, environment: 'Preview' },
  ])
    assert.throws(() => assertDeploymentIdentity(bad, vercel, expected), /deployment|branch|SHA/i)
  assert.throws(() => assertDeploymentIdentity(deployment, { ...vercel, projectId: 'prj_other' }, expected), /project/)
  assert.throws(() => assertDeploymentIdentity(deployment, { ...vercel, target: 'preview' }, expected), /production/)
  assert.throws(() => assertDeploymentIdentity(deployment, vercel, { ...expected, headSha: 'c'.repeat(40) }), /SHA/)
})

test('native ABI changes, signer substitutions and channel changes require a new approved base', () => {
  const keys = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })
  const other = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  })
  const input = {
    fingerprint: 'a'.repeat(40),
    approvedFingerprint: 'a'.repeat(40),
    channel: 'demo-preview',
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    apkCertificate: releasePolicy.apkCertificateSha256,
  }
  assert.doesNotThrow(() => assertPublishingIdentity(input))
  assert.throws(() => assertPublishingIdentity({ ...input, fingerprint: 'b'.repeat(40) }), /base APK/)
  assert.throws(() => assertPublishingIdentity({ ...input, channel: 'production' }), /channel/)
  assert.throws(() => assertPublishingIdentity({ ...input, privateKey: other.privateKey }), /signing key/)
  assert.throws(() => assertPublishingIdentity({ ...input, apkCertificate: 'c'.repeat(64) }), /APK certificate/)
})
