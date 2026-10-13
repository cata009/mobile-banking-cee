# PI Italy Android spike — 2026-10-12

Owner: `codex-pi-italy-android-spike-integration`. Base commit: `538360ead4a6da9ae889f142f8d00e333f99412b`. Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Initial pending changes, allocated paths, original hashes and the exact file delta are recorded in `pi-italy-android-spike.json`. Existing operator/other-agent edits were preserved; no branch/index mutations, commit, push or deployment were performed.

## Deliverable

Signed Android 9+ demo APK at `public/downloads/mobile-banking-cee-demo.apk`, with package `com.mobilebanking.cee.demo`. End-user flow is download APK, accept Android's ordinary direct-install confirmation, install, launch. No Google Play, developer mode, USB debugging, SDK or special accounts are required for end users. Developer debugging is only an optional test method.

The native entry screen selects Italy Mobile First, Romania baseline, Czech baseline, Czech Evo 2027, or the exact shared QR context. It preserves selected context on rotation, including biometric prompt recreation. The optional real Android biometric prompt uses enrolled compatible face/fingerprint hardware; Android chooses the modality. Unavailable or cancelled biometrics do not report simulated success; users can explicitly continue without biometrics. The native biometric demonstration does not replace web/server authentication.

The TWA opens the stable production origin and forces `frame=0`. Italy search allows the real system keyboard there and preserves the simulated keyboard in desktop preview. Existing HTML forms retain native input behavior. There is no native JavaScript bridge and no access to camera, contacts or storage; declared permissions are internet and normal Android biometric permission.

Italy's Share menu now has a direct APK download. Packaging runs Java tests, Android lint, signing checks and certificate comparison, copies the APK to Vercel's public files, and generates checksum/version metadata. The native workflow validates code on relevant PRs/pushes and builds a signed review artifact on manual runs once the original demo signing key is configured in secrets. It does not publish automatically.

## Verification

- A failing regression test reproduced Italy search suppressing the phone IME (`inputMode=none`). The fix passed 35 affected web tests across search, simulated keyboard, home and demo toolbar.
- Five native URL/context tests passed. Signed release built; APK signature and metadata SHA-256 matched. Android lint reported `No issues found.`
- Targeted ESLint and Prettier checks passed. Module audit passed for 236 files. Web production build passed, retaining its existing large-chunk warnings.
- Browser checks confirmed `inputmode=search`, `enterkeyhint=search`, no simulated keyboard in device mode, accents/currency text entry and the Italy download action. Screenshot: `.codex-temp/android-spike/share-apk.png`.
- Read-only review found selection loss on activity recreation and PowerShell 5.1 signer selection; both were fixed and re-reviewed.
- Combined `npm run verify` was attempted as the profile owner completed work. The latest run passes full TypeScript and ESLint checks, then stops on formatting in existing `MobileFirstProfileServicesBank.tsx` and `MobileFirstProfileServicesCommunications.tsx`. Earlier profile import/TypeScript blockers were resolved by the profile owner. These files are outside this task's allocated edits; their owner must finish formatting before the combined gate/deployment.
- Windows detects the connected Galaxy S9 through USB/MTP. ADB does not yet list it; no install, physical IME or sensor test has been claimed.
- For normal-install testing without developer mode, an APK-only temporary HTTP server is running at `http://192.168.68.60:4005/` on the PC's Wi-Fi interface. It serves the signed APK with the Android package MIME type and attachment filename; phone and PC must share the Wi-Fi network. No firewall rules or debugging settings were changed. QR screenshot: `.codex-temp/android-spike/download-apk-qr.png`. Temporary server exec session: `52731`; stop it after phone testing.

## Remaining activation

1. Resolve the profile owner's remaining formatting blockers and rerun `npm run verify` after relevant editors finish.
2. Extend the existing combined `.agent-task.json` ownership record with this task's exact allocated additions before task-scope CI. This task's exact delta passed the existing scope checker separately; unrelated pending files were excluded from that check.
3. Coordinate publishing the prepared web code, APK and `/.well-known/assetlinks.json` together. The production asset-links URL currently returns 404. Before this publication, the APK loads the previous deployed Italy implementation and falls back to a browser toolbar; the new Italy keyboard mode is present only in the local checkout.
4. Test the signed APK on the physical phone using the acceptance checklist in `android-spike/README.md`. Normal installation does not need USB debugging.

The APK requires internet. Web changes arrive on reload/relaunch from the production domain without reinstalling the APK. Native changes require a new APK with an increased version code and the same signing key. In-session hot reload, offline mode and production banking login are outside this spike.
