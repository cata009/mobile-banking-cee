# PI Italy native demo — current0.3 checkpoint

React Native0.87.1/Hermes renders Home, header Search and the connected accounts/cards/payments/loans/insurance/PFM/investments/Profile compositions directly. There is no WebView, iframe or Chrome toolbar. The APK starts in Italy Home without the portal password; Source feature policies, IDs and fixtures remain canonical. Other countries/releases are architectural migration targets, not completed native experiences. Domain fidelity ledgers retain explicit unaccepted states.

Preview the composed interface at `http://localhost:4006/italy-native.html?frame=0`; compare Source/shared Search at `italy-migration.html?frame=0`. Run `npm run typecheck`, `npm run lint -- --max-warnings 0`, `npm test -- --runInBand` and `npm run web:build` inside this directory. Browser annotations address the same native components. OS insets, keyboard, dialogs and SVG/sticky/shadow rendering still require installed checks.

Current signed review file: `../public/downloads/mobile-banking-cee-native-0.3.0.apk`, versionCode5, original package/certificate. The existing `mobile-banking-cee-demo.apk` download alias has identical bytes; named earlier APKs remain preserved. `native-demo.json` records SHA256/runtime/activation. The universal APK includes32/64bit ARM and x86; minimum API24, compile/target36. Installed evidence currently uses Android9/API28 emulator; physical-phone/otherOS/biometric-hardware acceptance is pending.

Native TextInput uses the Android keyboard. The device module provides OS biometrics when supported/enrolled, an explicit demo fallback, metadata-only document selection and original-byte FileProvider sharing. Only Internet and normal biometric permissions are declared, with no general storage/camera/location/contacts permissions. Sideload installation uses Android's normal download-source confirmation. No portal/admin credential is embedded.

Build from root with `./scripts/native-spike/build.ps1`. After reviewing native changes, run root `node scripts/native-spike/ota/prepare-runtime.mjs`, then inside this directory `npx hot-updater fingerprint create`, then root `node scripts/native-spike/ota/verify-runtime.mjs` before building. The builder rejects stale metadata and public loopback proof output. Local signing keys/tooling stay in the ignored cache; `C:/mb-cee` is a short junction to this same checkout, not a worktree.

HotUpdater1.0.1 uses signed fingerprint-compatible JS/assets. Actual local delivery reused unchanged images and updated the same installation; rollback preserved an unsaved form until closing to foreground idle Home. Persistence flush and a second safe-point check precede restart. Native code, permissions, fonts or trust-anchor changes require an approved new base APK.

The review APK's stable future URL is `https://mobile-banking-cee.vercel.app/api/native-updates`. Production service/storage/CI remain unprovisioned and unpublished. Missing service leaves the bundled/last healthy demo usable. Preparation in `../native-update-server` uses durable Postgres, immutable S3/R2, public read-only client routes and authenticated management. Exact deployed-SHA gates reject this intentionally dirty checkout. The workflow stays disabled until review/activation; see `../docs/tasks/2026-10-13-native-ota-*.md`.

Original fonts/Figma icon/rasters/SVGs are unchanged. VectorArtworkLayer namespaces IDs in memory and retains geometry. Android only renames generated JPEG/WebP copies misnamed.png without changing bytes. Original MIFID sharing matches the Source SHA256. Evidence/ownership/private local proof files are under ignored `../.codex-temp/universal-demo`.

## Historical0.2 experiment (retained documentation)

The paragraphs below describe `LegacySpikeApp.tsx` and its original landing preview, not the current composed0.3 application.

Approved scope: Home → account detail → Italian demo transfer → review → local receipt. Native React Native controls, Hermes and bundled assets; no WebView, TWA, Custom Tabs, iframe or hosted-page dependency. App starts directly without a password. Other services show an explicit scope notice. Android biometric authentication and country/release selection are not implemented in this spike.

The two account fixtures, available balances, transaction history, financial posting/idempotency, IBAN checksum and spending summary consume the existing pure TypeScript feature/data policies in `../src`. This module does not import the web UI. Android data resets on process restart; transfers never leave the demo ledger. The browser preview uses the same components with React Native Web and may retain the existing demo ledger in browser localStorage.

## Preview and validation

Inside `native-spike`, run `npm ci`, `npm run web` (http://127.0.0.1:4006), `npm run typecheck`, `npm test -- --runInBand`, and `npm run web:build`. Browser annotations apply to the same `App.tsx` and `src/styles.ts` used in the APK. OS keyboard, Android insets, native dialogs and performance need device testing.

## Signed APK

From the checkout root run `./scripts/native-spike/build.ps1`. Uses `JAVA_HOME`, `ANDROID_HOME`, `ANDROID_DEMO_KEYSTORE`, `ANDROID_DEMO_STORE_PASSWORD`, `ANDROID_DEMO_KEY_PASSWORD` (alias `cee-demo`); the local ignored Android tool/key cache is supported as a fallback. Signing secrets are never included in the project or APK. Android compile/target SDK 36; build-tools 37; NDK 27.1.12297006; CMake 3.22.1. On this Windows machine `C:/mb-cee` is a junction to this same checkout to avoid Ninja's MAX_PATH limit; this is not a separate checkout. On other long Windows paths supply a short checkout junction via `-BuildRoot`.

Output: `../public/downloads/mobile-banking-cee-native-0.2.0.apk`, versionCode 4, package `com.mobilebanking.cee.demo`, same signing key as the previous demo. Android 7+ on arm64 phones, plus x86_64 for emulator testing. No runtime permissions requested; installation outside a store requires Android's normal “allow this source” confirmation.

The UI and JS are bundled into the APK. A Vercel deploy does not change this installed binary. Sustainable delivery requires a native build per approved release, or a separately configured signed/compatible OTA channel for JS/assets. Native module or permission changes always require a new APK. No OTA or production deployment is configured by this spike.

## Visual assets

UniCredit regular/bold TTF files are unchanged copies of fonts installed by the operator. The supplied Figma icon is copied unchanged from `../android-spike/app/src/main/res/drawable-nodpi/unicredit_app_icon.png`; provenance is in `../android-spike/icon-source.json`. Home icons are unchanged SVG exports from `../src/assets/mobile-first/it`, serialized in `src/icons.ts`. The profile avatar also reuses the existing export. Android 9 blank-image regression was isolated to `Image` borderRadius; avatar pixels already contain the circular silhouette, so no image-level radius is needed.
