# PI single-source editing guide

## Choose the implementation that owns the change

The current mandate is one Native frontend on Web for all PI countries and releases in scope, including CZ Future/Robo/Evo 2027 and RS Future Gain. PI Italia, SME and KIDS are excluded. APK delivery is deferred. The PI customer shell and PI flow previews select Native ownership without a legacy fallback. Final verification passed: 3,569 Web tests, 2,017 Native tests, mandatory audits and production builds. The retirement graph guard passes. The shared report and `.codex-temp/pi-wide-migration/root/resume-20261016/final-delivery.json` contain current evidence and explicit raster limits. Keep product/country values, translations, route policy and business rules in the shared feature authorities; do not copy them into each screen.

| Area              | Baseline UI owner                                                                                                                                                                                       | Route/composition owner to inspect                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home              | `native-spike/src/experiences/pi/current/Home.tsx` selects the composition; Baseline visuals are in `native-spike/src/experiences/pi/current/baseline/Home.tsx`, `Header.tsx`, and `Body.tsx`.          | `native-spike/src/experiences/pi/current/adapter.ts`                                                                                                                                                                                    |
| Accounts          | `native-spike/src/experiences/pi/current/baseline/Account.tsx`, `AccountInfo.tsx`, `AccountOptions.tsx`, `Transactions.tsx`, and `Transaction.tsx`                                                      | `native-spike/src/experiences/pi/current/banking/adapter.ts`                                                                                                                                                                            |
| Cards             | `native-spike/src/experiences/pi/current/baseline/Card.tsx`, `CardInfo.tsx`, and `CardOptions.tsx`                                                                                                      | `native-spike/src/experiences/pi/current/banking/adapter.ts`                                                                                                                                                                            |
| Payments          | `native-spike/src/experiences/pi/current/baseline/payments/` (hub, domestic-payment and confirmation compositions)                                                                                      | `native-spike/src/experiences/pi/current/banking/adapter.ts`; Source-to-Native route conversion is separate                                                                                                                             |
| PFM / spending    | `native-spike/src/experiences/pi/current/baseline/spending/`                                                                                                                                            | `native-spike/src/experiences/pi/current/analytics/Pfm.tsx` chooses Baseline or other Current UI                                                                                                                                        |
| Offers / products | `native-spike/src/experiences/pi/current/baseline/offers/`                                                                                                                                              | `native-spike/src/experiences/pi/current/adapter.ts`                                                                                                                                                                                    |
| More / profile    | `native-spike/src/experiences/pi/current/baseline/more/`                                                                                                                                                | `native-spike/src/experiences/pi/current/profile/adapter.tsx`                                                                                                                                                                           |
| Investments       | `native-spike/src/experiences/pi/current/investments/baseline/` owns the Baseline controller and views. `native-spike/src/experiences/pi/current/investments/Investments.tsx` is the shared route host. | Default routing is controlled by `src/features/demo-native/policy.ts` and the Baseline context selector in `native-spike/src/experiences/pi/current/investments/baseline/policy.ts`; Investments is enabled in the audited context set. |

A Baseline-only reusable control belongs in `native-spike/src/universal/` with the existing Baseline component family where appropriate. Update the shared control once and preserve its existing callers. A control used by other products or design systems crosses into Core Integration ownership; coordinate before editing it. Avoid copying a control into a screen to work around a shared contract.

The Future experiences use explicit composition owners: CZ Evo 2027 lives in `native-spike/src/experiences/pi/cz/evo-2027/`; CZ Robo uses `current/RoboHome.tsx` and `current/investments/`; Co-Apping uses `current/coapping/`; RS Future Gain uses `current/future-gain/`. These paths are relative to `native-spike/src/experiences/pi/` except where fully written. Reuse the shared primitives and domain models across those compositions; do not copy the Baseline screen into a country folder.

Transaction-detail uses coordinator-owned selection identity and a plain presentation DTO; change its Native view once rather than restoring the former Source view. Domestic payment, review, sign and success compatibility entries consume the shared Native flow. Preserve their canonical draft, matching step and callbacks when editing it.

## Keep data and executable policy in Source

Use the existing canonical Source authority for the type of change:

- Product, account, country and display inputs: `src/data/` and the relevant `src/app/config/` modules.
- Release and feature metadata: `src/app/registry/` and `src/app/state/`.
- Business decisions and executable domain policy: `src/features/<domain>/` (for example, investments order/history rules stay in `src/features/investments/`).
- Native rollout and route conversion: `src/features/demo-native/`, including `baselineEligibility.ts`, `contracts.ts`, `policy.ts` and the investment intent bridge.

The Current experience can compose UI, format a presentation model, and keep transient draft/Back state that belongs to the screen. It must obtain eligibility, product availability, transaction/order rules and other business decisions from Source policy/data. `native-spike/src/experiences/pi/current/baseline/policy.ts` and the Investments counterpart are selectors; they delegate to the shared rollout policy rather than defining a second country/release policy.

When Native needs Source state, keep the host boundary data-only. `src/features/demo-native/contracts.ts` defines the versioned contract; the Source host and Native root are separate React bundles. Change the contract or route bridge only when the payload or entry/exit behavior requires it, and coordinate those Core Integration files with the integration owner.

## Know when Source is reference and when it is still live

The reference is a separately frozen Source build at `http://127.0.0.1:4008`. The normal Web frontend is at port 4004. `?renderer=reference` on 4004 no longer selects the old PI renderer. Never edit the frozen reference to hide a discrepancy.

Missing routes, payloads or Native module failures show a controlled Native error/retry state; they do not activate Source UI. Compatibility screen entrypoints delegate to Native through plain data and callbacks. PI flow previews consume the same Native leaves, including transaction visuals, bulk-approval documents and internal transfers. Excluded products retain their existing owners. Source React is still used by the platform shell and excluded experiences; its presence is not a second maintained PI customer UI.

The current owner decision is broader than the historical 40 active Baseline cells: in-scope PI uses Native across Baseline releases and the registered CZ/RS Future experiences, including implemented inactive entry states. `src/features/demo-native/piExperiencePolicy.ts` is the pure experience authority; route and payload adapters preserve the original customer context. Eligibility still determines which feature or empty/invalid state is shown, but does not opt PI back into Source UI. The current retirement evidence is `.codex-temp/pi-wide-migration/progress.json` and the linked graph audit; earlier Baseline inventories remain historical evidence.

## How one edit reaches Web and Android

1. Confirm product=`PI`, design system=`current`, scenario, country/release and entry route. Check `piExperiencePolicy.ts` and the route bridge; Italy, SME and KIDS have separate owners.
2. Edit the Baseline UI owner above. Put shared visual behavior in the shared component owner and data/business-rule changes in the Source authority. Preserve the Source labels, normal DOM/Web behavior, data and navigation contract, including intentionally inert actions.
3. If a route, payload, eligibility cell, or default-renderer decision changes, have the Core Integration owner update the manifest/route policy and add focused regression proof. A worker must not self-enable a candidate route by changing only a screen or a local selector.
4. Compare port 4004 with the separate frozen reference on port 4008, using the same context, data, viewport and interaction steps. Record Web evidence. Android device acceptance is a separate deferred delivery.
5. The portal development watcher and production build consume the shared `CurrentApplication`/Native Web bundle. The Android app imports the same Current Native composition. A source change therefore has one UI implementation; an installed APK still needs a separate compatible APK build/distribution (or explicitly configured OTA release).

See `docs/tasks/2026-10-15-shared-native-web-android.md` for the host contract, dev/build outputs, and release boundaries. This guide does not authorize changing the acceptance gate, editing the frozen reference, or publishing a release.

## Track completion at component, screen and flow level

Record these as separate statuses for each route family and country/release context; a lower-level status never implies the next one:

| Status              | Evidence it represents                                                                                                                                                                    | It does not establish                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **`componentdone`** | Its focused contract tests and reference render cover the leaf component’s props/data, states, visuals, accessibility semantics and interactions.                                         | The containing screen composition, route entry/exit, or a complete user journey.                                      |
| **`screendone`**    | The assembled screen matches its Source reference for the recorded context and states, including labels, values, assets, layout and within-screen actions.                                | Source-to-Native entry, cross-screen state continuity, Back/exit, completion effects, or other screens in the family. |
| **`flowdone`**      | The end-to-end route journey is paired: entry and payload, nested steps, Back/cancel/success, state/request consumption and return/exit behavior all match Source for the stated context. | Unlisted countries/releases or Android device acceptance unless those are evidenced too.                              |

Use `flowdone` only after its screens and required interactions have evidence. Changing ownership or routing is a Core Integration change, not a local screen switch. Android device acceptance is deferred and must be reported separately from this Web mandate.

## Verify default Native and explicit Source reference in the same report

Use the separate Native and reference origins when making a pair. Keep country, release, scenario, route and payload, account/product counts, language, theme, privacy state, viewport, scroll position and interaction steps identical.

- The normal/default URL selects the declared Native experience for in-scope PI, including Investments, CZ Future/Robo/Evo 2027 and RS Future Gain.
- Port 4008 serves the frozen original. A renderer query on 4004 cannot select it.
- `?renderer=candidate` remains an optional diagnostic mode and is not needed to enable Native. Module failures or unsupported in-scope route payloads expose a controlled error/invalid state; they never select an old PI screen. Only excluded products/experiences and platform surfaces retain their declared existing renderer.

Put both sides and their interaction outcomes in the same context/route/state entry of the integration owner’s shared comparison report, currently `.codex-temp/native-baseline-home-integration/report.html`. Record the build/context, separate `componentdone`/`screendone`/`flowdone` statuses, Source and Native captures, text/value checks, pixel residuals, route/payload/Back results, and Android evidence where required. A separate candidate-only screenshot or report does not close a pair.

## Historical Baseline receipt — 2026-10-15

This records the earlier milestone, not the current expanded PI acceptance: the default PI/current/active gate covered all 40 audited contexts for mapped and convertible routes, Investments included. Source verification run 3 exited 0 with 3,393 tests in 280 files, coverage of 83.71% statements, 82.78% branches and 65.45% functions, 295 module-audit files, and both Source and Web builds passed ([Source verify 3](../../.codex-temp/native-baseline-integration-coordination/final-source-verify-3.log)). Native TypeScript, format and lint run 6 exited 0; the combined Native run passed 1,591 tests across 171 suites ([Native tests 6](../../.codex-temp/native-baseline-integration-coordination/native-combined-final-tests-6.log)). Historical APK build 4 and its 47 emulator checks are in the [APK log](../../.codex-temp/native-baseline-integration-coordination/final-apk-build-4.log); that receipt is not current device acceptance, and APK work is now deferred. Source preservation checked 2,110 files, with seven allowlisted bridge changes and no unexpected changes ([preservation](../../.codex-temp/native-baseline-integration-coordination/final-source-preservation.json), [scope check](../../.codex-temp/native-baseline-integration-coordination/final-scope-check.log)). The [earlier delivery receipt](../../.codex-temp/native-baseline-integration-coordination/final-delivery.json) remains inspectable; current verification is in the shared PI-wide report.

## Proposed migration manifest and guard (read-only proposal)

Historical proposal: current routing uses `piExperiencePolicy.ts` and the existing route-intent adapters; `scripts/native-spike/audit-retired-pi-ui.mjs` now enforces retirement against the full production graph with exact reviewed excluded-owner edges. Do not introduce the alternative manifest below as a second live routing authority. The paragraphs are retained only as the original design discussion.

Keep migration status in one machine-readable manifest next to the Native rollout policy, for example `src/features/demo-native/baselineMigrationManifest.ts`. Give each route family one entry with its Source route key(s), Native screen key and UI owner path, applicable context set, state (`source-active`, `candidate`, `held`, or `accepted`), and evidence references for Web, Android, behavior and visual acceptance. Store independent `componentdone`, `screendone`, and `flowdone` evidence statuses. Store per-context exceptions as explicit cells or named sets rather than implying that one route's acceptance covers a whole release.

Make `baselineEligibility.ts` and `policy.ts` derive their allow/deny decisions from that manifest; keep them as consumers, not additional hand-maintained route inventories. The coordination registry `.codex-temp/native-baseline-integration-coordination/conversations.json` tracks conversations and ownership; it is useful project context but is not a runtime route-coverage manifest. A focused guard should fail if an accepted entry lacks evidence, a Native screen is enabled without a manifest owner, a Source route has no declared fallback/conversion state, or the manifest names a route/screen that the adapters do not expose. It should print the migrated/candidate/held/Source-active summary from the same data. Keep the manifest free of UI runtime imports so `npm run audit:modules` can enforce the existing boundary. This proposal does not change code or imply any current acceptance verdict.

## One frontend component per semantic control type

Identical controls consume one canonical Native renderer and shared contract. Differences are explicit variants or parameters, never screen-local copies of the same control. Thin compatibility wrappers may preserve old public props, but do not own a second visual implementation.

| Control               | Canonical customer UI                                                              | Shared contract                                                      |
| --------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Baseline primary CTA  | native-spike/src/universal/PrimaryButton.tsx                                       | src/app/components/contracts/primaryButton.ts                        |
| Search/filter bar     | native-spike/src/universal/BaselineSearchBar.tsx                                   | src/app/components/contracts/searchBar.ts                            |
| Radio                 | native-spike/src/universal/RadioButton.tsx                                         | src/app/components/contracts/radioButton.ts                          |
| Toggle                | native-spike/src/universal/ToggleButton.tsx                                        | src/app/components/contracts/toggleButton.ts                         |
| Detail toolbar        | native-spike/src/universal/BaselineDetailToolbar.tsx                               | src/app/components/contracts/detailToolbar.ts                        |
| Page header           | native-spike/src/universal/BaselinePageHeader.tsx                                  | src/app/components/contracts/pageHeader.ts                           |
| Sensitive card detail | BaselineSensitiveCard in native-spike/src/experiences/pi/current/baseline/Card.tsx | Existing card DTO; generic and Evo callers delegate to the same leaf |

The capsule ActionButton and generic SearchField have different geometry and interaction states from the Baseline primary CTA and filter bar. Their names alone do not justify replacing them with a visually different control. The bounded audit is recorded in .codex-temp/pi-wide-migration/luna-2/primitive-reuse-review.json; it is not an exhaustive audit of every control in the application.
