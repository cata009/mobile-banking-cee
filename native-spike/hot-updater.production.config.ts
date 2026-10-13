/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { bare } from '@hot-updater/bare';
import { standaloneRepository } from '@hot-updater/standalone';
import { defineConfig } from 'hot-updater';
import {
  readStorageEnvironment,
  required,
  requireProductionUrl,
} from '../native-update-server/src/env';
import { createImmutableS3Storage } from '../native-update-server/src/storage';
import {
  assertPublishingIdentity,
  releasePolicy,
} from '../native-update-server/src/release';
import {
  assertLocalSourceIdentity,
  guardProductionBuild,
  guardProductionCore,
  verifyDeploymentProvider,
} from '../native-update-server/src/deployment-provider';

/** CI/reviewed local release only; no local-proof credentials or URL fallback. */
export default defineConfig(options => {
  const baseURL = requireProductionUrl(
    required(process.env, 'NATIVE_OTA_SERVER_URL'),
    'NATIVE_OTA_SERVER_URL',
  );
  if (new URL(baseURL).pathname !== '/api/native-updates')
    throw new Error('Production OTA URL must end in /api/native-updates');
  const eventPath = required(process.env, 'GITHUB_EVENT_PATH');
  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  assertLocalSourceIdentity(event.deployment?.sha ?? '');
  const adminToken = required(process.env, 'NATIVE_OTA_ADMIN_TOKEN');
  if (adminToken.length < 32)
    throw new Error('Management token must contain at least 32 characters');
  const channel = required(process.env, 'NATIVE_OTA_CHANNEL');
  if (options?.channel && options.channel !== channel)
    throw new Error('CLI channel differs from the approved native channel');
  const signingPath = required(process.env, 'NATIVE_OTA_PRIVATE_KEY_PATH');
  const cwd = process.cwd();
  const fingerprint = JSON.parse(
    readFileSync(path.join(cwd, 'fingerprint.json'), 'utf8'),
  );
  const marker = JSON.parse(
    readFileSync(path.join(cwd, 'ota-native-compatibility.json'), 'utf8'),
  );
  if (
    marker.applicationId !== releasePolicy.packageName ||
    marker.channel !== channel
  )
    throw new Error('Native release identity differs from the approved base');
  assertPublishingIdentity({
    fingerprint: fingerprint.android?.hash ?? '',
    approvedFingerprint: required(process.env, 'NATIVE_OTA_BASE_FINGERPRINT'),
    channel,
    apkCertificate: required(process.env, 'NATIVE_OTA_APK_CERT_SHA256'),
    publicKey: readFileSync(path.join(cwd, 'keys/ota-public-key.pem'), 'utf8'),
    privateKey: readFileSync(signingPath, 'utf8'),
  });
  const database = standaloneRepository({
    baseUrl: `${baseURL}/admin`,
    commonHeaders: { Authorization: `Bearer ${adminToken}` },
  });
  const verifySource = async () => {
    const verified = await verifyDeploymentProvider(event, process.env);
    assertLocalSourceIdentity(verified.sha);
    execFileSync(
      process.execPath,
      [path.join(cwd, '../scripts/native-spike/fidelity/check-reference.mjs')],
      { cwd, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 2 * 1024 * 1024 },
    );
    return verified;
  };
  const guardedDatabase = {
    ...database,
    core: guardProductionCore(database.core, verifySource),
  };
  const build = bare({
    enableHermes: true,
    outDir: '.hot-updater/output/production',
    sourcemap: false,
  });
  return {
    build: args => guardProductionBuild(build(args), verifySource),
    storage: createImmutableS3Storage(readStorageEnvironment(process.env)),
    database: guardedDatabase,
    updateStrategy: 'fingerprint',
    fingerprint: {
      extraSources: {
        android: [
          'android/app/src/**/*.kt',
          'android/app/src/**/*.java',
          'android/app/src/main/res/**/*',
          'android/app/src/main/assets/fonts/**/*',
          'android/app/build.gradle',
          'android/build.gradle',
          'android/settings.gradle',
          'android/gradle.properties',
          'ota-native-compatibility.json',
          'keys/ota-public-key.pem',
        ],
      },
    },
    platform: {
      android: {
        androidManifestPaths: ['android/app/src/main/AndroidManifest.xml'],
      },
      ios: { infoPlistPaths: [] },
    },
    signing: { enabled: true, privateKeyPath: signingPath },
    patch: { enabled: false },
  };
});
