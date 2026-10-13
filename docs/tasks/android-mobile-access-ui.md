# APK 0.1.2 — automatic mobile demo entry and selector

Ownership, base commit and initial pending state: `android-mobile-access-ui.json`. Existing main checkout and other agents' files were preserved. No commit, push or deployment.

The native selector now uses a UniCredit red header, exact supplied icon, version cards, checked indicators, a single Apri app action and optional compatible device biometrics. Selection and the biometric choice survive recreation; decorative radio state saving is disabled to avoid duplicate-ID restoration. Version code is 3; package and signing identity are unchanged.

APK launch URLs carry `apk=1`. AccessGate checks the actual server, issues anonymous mobile demo entry through `/api/access?mode=mobile-entry`, and accepts a separate signed, HttpOnly 15-minute cookie bound to the PI Italy, Romania or Czech launch context. Normal desktop access and staff share-token issuance remain separate. Tagged mobile cookies cannot be renamed as normal access cookies. Existing valid staff links still work; expired ones fall back to mobile access. URL/session bookkeeping does not authorize access; the server checks signature, purpose, expiry and context. A query attempt marker prevents redirect loops when storage/cookies are blocked.

The mobile entry endpoint is intentionally public demo access and is also usable from a browser. It is not APK attestation or banking authentication. Neither the site password nor its signing secret is included in the APK. Server configuration reuses the existing access-service signing secret.

Verification: 92 access tests, 7 Java tests and 2 Android 9 device tests passed; native lint returned 0 errors and 2 warnings. Local browser integration issued the actual cookie and opened Italy without a password. Combined npm verification stopped on concurrent unrelated insurance/account-card TypeScript errors; those files were not edited. The local dev proxy also encountered an unrelated lazy-module reload error after initially opening the protected app.

Candidate: `public/downloads/mobile-banking-cee-demo-0.1.2.apk`; the stable APK download and version/checksum metadata also point to the updated bytes. Native preview: `.codex-temp/android-spike/v3-entry-final.png`.

Live activation still requires publishing `api/access.js` and `src/app/components/security/AccessGate.tsx` with the web release. Until then, the installed APK remains compatible with the old deployed access gate and may still request its password. No publication was performed because the user reserved officialization until acceptance.
