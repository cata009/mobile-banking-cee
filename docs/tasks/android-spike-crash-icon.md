# Android APK 0.1.1: launch crash and requested icon

Task owner and checkout baseline: `android-spike-crash-icon.json`. Work remains in the existing main checkout; no branch/index mutations, commit, push, deployment or Figma edits.

The user reported closure after **Continua demo**. With no physical ADB connection available, the exact original signed 0.1.0 APK was installed on an isolated Android 9 emulator (`cee-spike-api28`). An instrumentation test pressed the actual Continue button. It reproduced a fatal `IllegalArgumentException`: `com.google.androidbrowserhelper.trusted.ManageDataLauncherActivity` does not exist in `com.mobilebanking.cee.demo`.

Browser Helper calls `ManageDataLauncherActivity.addSiteSettingsShortcut` during launch. Both provider-support branches update this component's enabled state, which requires the component to be registered in the app manifest. The manifest now registers it, provides its `MANAGE_SPACE_URL` and declares browser visibility queries for newer Android versions. No new user permissions were added.

The final regression ran against Android 9 and passed: the actual native Continue action reaches Chrome; the fresh crash buffer was empty. Five unit tests and Android lint (`No issues found`) also pass. This establishes the fix for the reproduced launch failure; physical hardware biometrics and the phone's IME still require user acceptance.

Figma source: file `F5ppItNJd0pjehF7Y1UzgG`, requested export card `4721:10051`, actual icon `4721:10063`. The exact exported 1024×1024 PNG is stored at `app/src/main/res/drawable-nodpi/unicredit_app_icon.png` and bound through the existing `ic_launcher.xml`. It was visually compared with the Figma reference. Source provenance and asset checksum are in `android-spike/icon-source.json`.

The package ID and signing identity are preserved. Version code advances from 1 to 2, version name from `0.1.0-spike` to `0.1.1-spike`. Local delivery paths are:

- `public/downloads/mobile-banking-cee-demo-0.1.1.apk` — explicitly versioned candidate for acceptance.
- `public/downloads/mobile-banking-cee-demo.apk` — existing download URL, replaced with the same updated bytes.
- `public/downloads/android-spike.json` — actual version and verified artifact checksum, generated from Gradle output.

The current task changes only native manifest/build/test/icon/provenance/README, APK delivery outputs and its own task documentation. Web experience code and deployment configuration are unchanged in this task. The APK still opens the configured production origin; publishing the prepared PI Italy web changes and domain association remains a later coordinated step after user confirmation.

Development evidence is preserved under ignored `.codex-temp/android-spike/`: `original-crashing-v1.apk`, `original-launch-test.log`, `original-crash.log`, `v2-device-tests.log`, `v2-package.log` and `crash-icon-web-verify.log`.

Combined `npm run verify` passed TypeScript, ESLint, formatting, coverage tests and the preceding audit steps, then stopped at the existing web asset baseline mismatch (expected 275, current 1093). The Android icon is outside that audit's asset roots; no baseline assertion was changed. A separate module-boundary audit also passed. This broader integration issue remains for the later officialization, independent of the reproduced native crash fix.
