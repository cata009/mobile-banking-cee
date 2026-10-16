# Native RO baseline Payments integration

The user's approved continuation extends the existing Source-preserving integration and the same report to PI / RO / current / release-current / active Payments. Original port 4004 is authoritative for rendering, behavior, routing, translations, values and financial policy. Work remains in the existing shared checkout at d338f7cfb92435bb8edc8817afbdd47031fb18e3. Owner, absolute checkout, initial pending changes, paths and before hashes were recorded before editing in `.codex-temp/native-ro-payments-integration/ownership.json`.

## Scope and boundaries

Source inspection confirms current RO reaches Payments overview, its four generic hero sheets (domestic action only), Templates/beneficiary selection, Exchange Rates/calculator/currency selection and domestic create → review → StandardSign → StandardSuccess. Internal Transfer, recurrent management and template editing are reachable in Evo, not this baseline; expose no invented RO destinations. Preserve Source inert controls and legacy validation, including its required prefix and trimmed nonempty amount. Use original models/contracts/translator/assets; no hand-entered replacement totals.

Source `handlePaymentDone` clears draft/transaction and uses `navigateTo('payments')`, not `navigateToAndReset`. Source navigation pushes the route. New Native substeps must match visible Back/draft semantics and preserve the actual done behavior, rather than introduce a speculative reset policy.

Source/public/fonts/assets/config/package/lock and original demo are read-only. No Git index/branch mutation, worktree, APK, publication or unrelated cleanup. One editor per file; all Root shared changes require a fresh read and before ownership allocation. Maintain legacy Native renderers outside the RO/current/active guard.

## Disjoint implementation

- Hub owner: new `baseline/payments/hub/**`, own test/docs/private evidence. Overview, hero sheet, templates and Exchange Rates.
- Domestic owner: new `baseline/payments/domestic/**`, own test/docs/private evidence. Canonical draft initialization (blank/template/beneficiary/redo), create/review and state transitions.
- Confirmation owner: new `baseline/payments/confirmation/**`, own test/docs/private evidence. StandardSign/Success and Source Face ID timing. Initial internal-transfer audit canceled after reachability was verified; agent-created unused red test removed by its owner.
- Root: conditional banking adapter, existing integration preview, shared primitive repairs if confirmed, integration tests/capture/navigation/report/scope, final verification.

## Verification checklist

- [x] Read Source routes/policies/lifecycle; record ownership and immutable original snapshot.
- [x] Implement and review disjoint Native renderers from canonical contracts and Source code.
- [x] Match actual 375×812 Source and CurrentApplication preview across themes/RO locale/scroll and reachable child states; include field values/placeholders and geometry.
- [x] Compare interactive flows: all hero choices, templates/beneficiaries, search, FX edits/selection, draft validation/back/review/sign/done; canonical redo/template model tests. No masks or pixel tolerance; disclose any residual differences.
- [x] Regress Home/Account/Card after shared repairs; affected Native tests, types, owned lint zero warnings, Web build and Android JS bundle (not APK/device proof).
- [x] Run final combined `npm run verify`, Source 2,105-file SHA preservation, sequential exact deltas/scope and same report updates. Final Source gate has one reproducible external RS timer error (see below); no source runtime repairs authorized in this Native migration.

## Final evidence and review

52 strict Source/registered Native comparisons:44 zero-pixel matches;8 overlays retain12–22 SVG raster pixels, with no masks or tolerances. Text, value, placeholder and input-label comparisons agree in all52. The actual controller navigation script compares20 reachable states, including template/beneficiary defaults, FX123.45 conversion and USD chooser, create/review/sign/Back/Face ID/success/done/fresh empty draft. All agree; no page errors.

Source models/policies remain canonical. Native local Back registration is guarded by route and activation token: a stale unmounted parent cannot clear the restored parent's replacement handler. Reviewer private regression went red before the token correction and green afterward. Leaf changes reproduce Source paint order and panel geometry: one CSS gradient+inset paint on Web, native SVG retained, static panel has no synthetic transform, Source upward shadow and fill-height flex body. Native field/body font aliases were preserved; opacity/GPU-context corrections solved whole-screen typography differences. Divider/banner/icon serializer probes were rejected when causal comparison disproved them; those files remain unchanged.

Native affected tests360/34 suites pass; strict types, owned ESLint21 files zero warnings, Web build and Android JS bundle226 assets pass. Full Native test audit has999 passes and4 existing Czech failures in2 suites. Home14 + Account/Card27 were recaptured with unchanged text/figures and prior raster deltas. Native hardware/device rendering and APK are not certified.

Original preservation uses a separate Payments initial snapshot:2,105 Source/public files unchanged, no additions. The previous Home snapshot has2 externally changed RS Disposable Cards files, preserved as other-author changes. This task does not edit Source/public/asset/font/config/package files.

`npm run verify` executes successfully through Source types/lint/format and all3,246 assertions in273 suites, but exits1 from an unhandled FaceIdAnimation timer after teardown in `tests/screens/disposable-cards-flow.test.tsx`. The same error reproduces in the isolated4-test RS run. Source audit:all and build run separately and pass. This is not presented as a green global Source gate; no thresholds/assertions weakened or unrelated original source files repaired. Same report records this limitation and existing Native CZ restants.
