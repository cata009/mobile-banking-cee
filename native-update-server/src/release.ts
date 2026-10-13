import { createHash, createPublicKey } from 'node:crypto'
export const releasePolicy = {
  packageName: 'com.mobilebanking.cee.demo',
  channel: 'demo-preview',
  apkCertificateSha256: '8a44e3e1b48d3d77122fef3e6ee514a3100d0506f8793cb6b3e2e0253a34b616',
}
export interface DeploymentInput {
  sha: string
  ref: string
  state: string
  environment: string
}
export interface VercelDeployment {
  projectId: string
  readyState: string
  target: string
  meta?: { githubCommitSha?: string; githubCommitRef?: string }
  id?: string
}
export function assertDeploymentIdentity(
  event: DeploymentInput,
  vercel: VercelDeployment,
  expected: { defaultBranch: string; headSha: string; projectId: string },
) {
  if (!/^[a-f0-9]{40}$/.test(event.sha) || event.sha !== expected.headSha || event.sha !== vercel.meta?.githubCommitSha)
    throw new Error('Deployment SHA does not match the exact deployed default-branch head')
  if (
    ![expected.defaultBranch, `refs/heads/${expected.defaultBranch}`, event.sha].includes(event.ref) ||
    vercel.meta?.githubCommitRef !== expected.defaultBranch
  )
    throw new Error('Deployment branch is not the reviewed default branch')
  if (
    event.state !== 'success' ||
    event.environment.toLowerCase() !== 'production' ||
    vercel.readyState !== 'READY' ||
    vercel.target !== 'production'
  )
    throw new Error('A successful production deployment is required')
  if (vercel.projectId !== expected.projectId) throw new Error('Unexpected Vercel deployment project')
  return event.sha
}
export function assertApprovedRuntime(
  fingerprint: string,
  approvedFingerprint: string,
  channel: string,
  apkCertificate: string,
) {
  if (!/^[a-f0-9]{40,64}$/.test(approvedFingerprint) || fingerprint !== approvedFingerprint)
    throw new Error('Native runtime changed: install and approve a new base APK before releasing OTA')
  if (channel !== releasePolicy.channel) throw new Error('Native OTA channel differs from the approved base')
  if (apkCertificate.replaceAll(':', '').toLowerCase() !== releasePolicy.apkCertificateSha256)
    throw new Error('APK certificate differs from the original demo signer')
}
export function publicKeyDigest(key: string) {
  return createHash('sha256')
    .update(createPublicKey(key).export({ format: 'der', type: 'spki' }))
    .digest('hex')
}
export function assertPublishingIdentity(input: {
  fingerprint: string
  approvedFingerprint: string
  channel: string
  publicKey: string
  privateKey: string
  apkCertificate: string
}) {
  assertApprovedRuntime(input.fingerprint, input.approvedFingerprint, input.channel, input.apkCertificate)
  try {
    if (publicKeyDigest(input.publicKey) !== publicKeyDigest(input.privateKey)) throw new Error('Mismatch')
  } catch {
    throw new Error('OTA signing key differs from the pinned original public key or is invalid')
  }
}
