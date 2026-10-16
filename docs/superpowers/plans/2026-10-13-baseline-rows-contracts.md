# Baseline divider and navigation leaf contracts

Owner: `/root/baseline_rows_contracts`. Integration owner: Root. Shared checkout `C:/Users/mihai/Desktop/Mobile Banking - CEE`, base `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Initial pending changes and complete owned-path allocation are recorded in `.codex-temp/baseline-rows-pilot/ownership.json`. No index, branch, dependency or global demo changes.

Approved batch scope: preserve existing Web source visuals/DOM/callbacks and introduce platform-independent contracts plus isolated Native leaf pilots. User authorized autonomous execution and final review without intermediate approval pauses.

## Implementation

- Pure family contracts: section divider + exact Web classes, transaction month/date separator, navigation row + exact Web classes, white inline link and physical-card row mapping.
- Existing default exports remain canonical Web renderers and consume the contracts. Section and NavigationRow source metadata/IDs remain available. Card row localization, masking, artwork owner and data selection remain where they were.
- Frozen pre-extraction source exists in `tests/fixtures/baseline-rows-before/`. DOM tests cover 14 section variants, missing/zero/end counts, month/date totals, compact/centered/icon/slot rows, class/style overrides, nested link/toggle callback ownership and card/button inertness.
- Isolated Native renderers live under `native-spike/src/universal/Baseline*.tsx`; no existing Native demo imports them. Original custom icon vectors and the original physical-card SVG paths/logo/color mapping are used, including the original 64×40 size and 4px clip radius.

## Verification and acceptance

Red: the Web integration assertion failed because existing renderers did not yet import the extracted contracts. The card DOM normalizer initially did not account for Card's colon-stripped React IDs; it was corrected to normalize only generated `-r…-` IDs and references, leaving paths/styles/assets intact.

Green: affected Web contract/preservation suite, isolated Native renderer suite, targeted Web lint and both root and Native TypeScript checks. Final combined `npm run verify` belongs to Root after all editors finish.

Browser evidence: `.codex-temp/baseline-rows-pilot/report.html`, `browser-results.json`, `summary.json`, `keyboard.json` and `images/`. All 132 cases have zero changed pixels, identical normalized DOM and identical computed styles. Each row/link Space+Enter sequence calls its owner exactly twice. The local access gate is passed by the existing normal authentication helper, without credential output. HMR WebSockets are blocked. The fixture uses real Demo/Language providers and original Source CSS/fonts/tokens.

Native browser smoke: `native-smoke.json`, `native-light.png`, `native-dark.png`. Zero page errors, one row activation and owner-updated controlled toggle. Standalone entry provides the same `global` alias as the existing Toggle pilot, required by Animated outside Metro. Targeted Native lint passes with zero warnings after named style values replace inline JSX objects; no lint rule/threshold was weakened.

Native acceptance boundary: isolated Native unit coverage and browser smoke do not establish Android/iOS device fidelity or integration acceptance. CSS drop-shadow uses alpha-shaped filtering while the Native pilot uses boxShadow around the card shell; the shell-shadow rasterization needs device review. Normal text line-height remains normal rather than being forced to arbitrary 18/20px. RTL, system text scaling, all locales, complete app routes and device focus behavior remain outside this batch evidence.
