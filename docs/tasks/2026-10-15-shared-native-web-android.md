# Shared React Native demo UI on Web and Android

## Canonical UI and rollout

The migrated PI Baseline demo surface uses the same `CurrentApplication` composition in the Web portal and the Android application. Its canonical UI is under `native-spike/src/experiences/pi/current/baseline/`, with shared primitives under `native-spike/src/universal/`. A baseline Homepage change belongs in `Home.tsx`, `Header.tsx` or `Body.tsx` there. Country data, translations and business policies continue to use the canonical Source modules; do not create per-country copies.

Scope of this rollout: PI, current design system, active, and migrated routes. The common eligibility policy in `src/features/demo-native/baselineEligibility.ts` selects 34 country/release contexts:

| Countries | Releases |
| --- | --- |
| RO, CZ | current, v1 |
| HU, RS, SI, SK, BA, BA_BL | current, v1, v2, v3, v4 |

These are context counts, not a percentage of fully migrated functionality. RO/CZ v2–v4 retain their redesigned Source Homepage until its Native variant is verified. Unplanned flags, unknown releases, unaudited bundle features, other products/design systems/scenarios and unmigrated routes retain the existing renderer. Other experiences remain on their existing renderer until separately validated. The Source Design System, Flows and Tools stay Web surfaces. `?renderer=reference` explicitly opens the previous renderer for regression comparisons. It is a reference, not another baseline UI to maintain for migrated production routes.

The portal uses React18; the Native project uses React19. `NativeDemoSurface` exchanges a versioned plain-data contract with a separately bundled React19/React Native Web root mounted inside an ordinary phone-surface div. It does not embed an iframe/WebView or share React elements/hooks across versions. Contracts are in `src/features/demo-native/contracts.ts`. Resolved product counts, route payloads, language, theme and privacy are synchronized; draft and local Back state stay with the Native composition.

## Development and build

Root `npm run dev` starts the normal portal and a separate production-mode Native Web watch build. Native UI edits rebuild `/native-demo/current-host.js`, CSS and hashed assets; the portal reloads the same implementation. The development output is ignored under `native-spike/dist-host/`. The build watcher explicitly uses NODE_ENV=production to keep its JSX transform consistent with its bundled runtime. SSR-only middleware audit servers do not start this watcher or mutate its live output. Vite plugin closure disposes its own watcher.

Root `npm run build` builds the portal, installs locked Native dependencies if necessary, then builds the Native module into `dist/native-demo/`. Vercel receives this combined output. The Native source/package lock are included in its build input; Android/iOS build directories, Native node_modules, keys, APKs and local evidence remain excluded. Stable module/CSS/manifest URLs use no-store; asset names are content-hashed. Do not publish the standalone Native development server URL.

The Android application imports the same CurrentApplication from its global Native entry. A code change is shared, but distribution is separate: a Vercel deployment updates the Web bundle; installed Android requires a new APK or an explicitly configured, signed, compatible OTA release.

## Git and Vercel release checklist

1. Inventory the shared checkout and identify ownership. It contains substantial pre-existing pending work. Preserve it; do not use `git add .`, reset, stash or a blanket commit. Integration owner stages reviewed paths/groups only.
2. Review scoped changes as logical checkpoints: shared component contracts; Native implementation and tests; Web host/build integration; release/OTA infrastructure where independently ready. Keep local secrets, keys, generated binaries, node_modules and `.codex-temp` outside Git.
3. Run Source `npm run verify`, Native TypeScript/lint/test gates, fidelity guard/tests, combined Web artifact checks and Android review build. Record the exact candidate commit and proof. Do not label browser parity as physical-device acceptance.
4. Commit the reviewed checkpoint and push an explicitly authorized branch. A non-production branch with the project's Git integration produces a Vercel preview. Verify the combined Web demo and unchanged platform surfaces against that exact SHA.
5. Only after approval, integrate/promote the reviewed production revision. Existing production is linked to `cata009/mobile-banking-cee`, project `mobile-banking-cee`; inspect current settings before releasing. Do not assume local files are deployed because a dev server works.
6. Build/sign and distribute Android separately. Public APK aliases are not overwritten by private review builds. Native OTA remains opt-in and guarded by runtime compatibility, signing and deployed-SHA checks.

No Git push, Vercel deployment/promotion or OTA publication is implied by implementing this integration. The current task prepares a reviewable local result and release inventory; remote release needs an explicit instruction.

## Fidelity reference maintenance

The BottomSheet guard repair reviews a literal extraction into shared contracts. It changes only that reviewed reference and adds its two contract dependencies; 978 other entries remain unchanged and `visualAccepted=false`. A reference refresh is not visual approval or a general drift override. Keep the strict guard active for future changes.
