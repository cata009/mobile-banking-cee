# Italy native reference drift guard preparation

Owner: `/root/review_native_profile`. Base commit: `538360ead4a6da9ae889f142f8d00e333f99412b`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
Owned paths: new `scripts/native-spike/fidelity/check-reference.mjs`, new `scripts/native-spike/fidelity/record-reference.mjs`, new `scripts/native-spike/fidelity/reference-guard.test.mjs`, new `native-spike/fidelity/reference-baseline.json`, and this document. Initial pending changes for those paths: none. The integration owner's `.agent-task.json` records the extensive unrelated shared-checkout changes. No existing package, Source, release configuration, Git index, provider or publication changes are owned here.

The integration owner decides whether to add the prepared check to native release/build gates after review. A matching reference hash is not visual acceptance.

## Purpose and scope

The guard detects stale frozen Source references while the composed native RNWeb preview at port 4006 becomes the rendering authority. It does not render screens, compare pixels, certify device behavior, or promote the legacy port 4004 preview as a new implementation target. Existing `native-spike/HOME_FIDELITY.md`, Profile `FIDELITY.md`, investments `SOURCE_PARITY.md` and loans `fidelity-ledger.md` informed the reference scope; their state-specific acceptance limits remain in force.

Nine mapped areas are Home (including header Search/category presentation), accounts, cards, operations/payments, loans, insurance, PFM, investments and Profile. The manifest records **979 exact paths**, each with a SHA256, content size, kind and affected area list. Selection covers the Italy experience's TSX/CSS/asset maps, original Italy artwork, three shared Source UI controls, all current Source global stylesheets, and the two copied UniCredit TTF files. Directory inventory comparisons also detect added UI/artwork paths; deletions, changed hashes, incorrect scope associations and malformed/incomplete manifests fail closed.

The Source UI/CSS/asset-map content hash normalizes CRLF and CR to LF, without trimming or other rewriting. This avoids the checkout's existing CRLF CSS/Git LF mismatch. Original artwork and font files are hashed as exact bytes and never converted or written by these scripts. No native implementation module, shared feature/data business model or experience content/model metadata enters the blocking baseline. Those canonical models can still change through their own validation gates. Consequently this guard does not detect every possible rendered change, including presentation text changed through a content module, state/data-driven layout, or a dependency/browser/OS font fallback.

Global stylesheet selection is deliberately conservative: a stylesheet edit for another country may produce a drift report even when Italy's rendered result is unaffected. Area associations are review routing hints, not a transitive component dependency graph. Artwork inventory includes unobserved Source states; an unused artwork change/addition can still require review. The copied TTF hashes cannot prove which locally installed font the legacy browser actually selected. These tradeoffs favor visible review of reference drift over silently changing the reference.

## Commands and outcomes

From the checkout root, run the read-only checker:

```powershell
node scripts/native-spike/fidelity/check-reference.mjs
```

Exit 0 means the selected reference inventory/content matches. Exit 1 reports stale, missing or added paths and affected areas. Exit 2 reports an invalid/unreadable manifest or unsafe/unreadable selection. Every result retains `visualAccepted: false`; matching hashes alone never constitute visual approval.

Manual capture is a separate explicit operator action:

```powershell
node scripts/native-spike/fidelity/record-reference.mjs --reviewed-capture --owner reviewed-owner --reason "Describe the reviewed reference change" --base-commit EXACT_40_CHARACTER_BASE_COMMIT
```

The command captures the current working tree into `native-spike/fidelity/reference-baseline.json`, requiring the manual flag, owner, reason and base commit provenance. The initial capture describes the current intentionally dirty working tree at base `538360ead4a6da9ae889f142f8d00e333f99412b`; it does not assert that all captured Source files already exist in that commit. Capture never changes Source files and always writes `visualAccepted: false`. Its metadata is a cooperative review record, not authentication or automatic Git provenance.

When drift is reported, inspect the changed reference and corresponding native state, preserve Source IDs/policies/artwork, and record the visual evidence or remaining fidelity gaps in the relevant native ledger. Refresh hashes only after the reference selection/change is reviewed. Do not invoke the recorder in CI or a native release step to make a red check green. Required visual/device acceptance remains separate from this hash snapshot. No existing package/build/release command is integrated by this task.

## Verification

Focused Node tests use isolated temporary fixtures, verified cleanup paths and no repository Git mutations. The initial test run failed before the modules existed. A domain-search association test then reproduced an incorrect Home association before correction. The tests cover nine-area capture, mandatory manual provenance, UI/global CSS drift, exact asset/font bytes, business-model exclusion, line-ending normalization, missing/added files, malformed/traversal/duplicate/incomplete manifests, CLI exit states and capture preserving source bytes. Final counts and scoped lint/format evidence are recorded at handoff; Root runs final combined verification if integration is chosen.

Final scoped results: **11/11 Node tests pass**, scoped ESLint with `--max-warnings 0` exits 0, and the checkout's read-only guard reports `ok: true`, `checked: 979`, empty drift lists and `visualAccepted: false`. Code, tests, documentation and the generated review JSON pass scoped formatting. No Git mutation, external API call, deployment, publication or automatic visual approval was performed.

## Root integration checkpoint

Root reviewed and integrated the prepared guard into Native's `fidelity:check` and `fidelity:test` commands, the local APK builder before Gradle, the disabled OTA workflow before publication, and the production publishing callback before build/deploy. These steps only compare references and never invoke the recorder. Changing a frozen Source UI/CSS/font/artwork reference requires reviewing the corresponding native rendering and manually recording the new reference provenance; automatic publication refuses stale mappings. Shared business-model updates remain outside this presentation snapshot.

The existing 4004 legacy UI does not automatically transform into native UI when its CSS/markup changes. The common React Native compositions used by 4006 RNWeb and the APK are the intended editing authority after migration. Current Italy visual acceptance remains incomplete and `visualAccepted:false` is preserved. This preparation is not production activation or a full pixel comparison.