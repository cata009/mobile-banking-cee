/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { bare } from '@hot-updater/bare';
import { standaloneRepository } from '@hot-updater/standalone';
import { defineConfig } from 'hot-updater';
import {
  localOtaStorage,
  proofRoot,
  checkout,
} from '../scripts/native-spike/ota/local-storage.mjs';
const output = path.resolve(proofRoot, 'bundle-build');
if (!output.startsWith(checkout + path.sep))
  throw new Error('OTA build output must stay in checkout');
const tokenPath = path.join(proofRoot, 'local-management-token.txt');
const managementToken = existsSync(tokenPath)
  ? readFileSync(tokenPath, 'utf8').trim()
  : 'local-server-not-running';

/** Local verification configuration. Production adapters and publication are a separate release step. */
export default defineConfig({
  build: bare({
    enableHermes: true,
    outDir: path.relative(path.join(checkout, 'native-spike'), output),
  }),
  storage: localOtaStorage(),
  database: standaloneRepository({
    baseUrl: 'http://localhost:4010/admin',
    commonHeaders: { Authorization: `Bearer ${managementToken}` },
  }),
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
    debug: true,
  },
  platform: {
    android: {
      androidManifestPaths: ['android/app/src/main/AndroidManifest.xml'],
    },
    ios: { infoPlistPaths: [] },
  },
  signing: {
    enabled: true,
    privateKeyPath: path.join(proofRoot, 'keys/private-key.pem'),
  },
  patch: { enabled: false },
});
