# Banking product/card composition contracts

Owner `/root/baseline_rows_contracts/banking-cards`; Root integrates. Existing checkout `C:/Users/mihai/Desktop/Mobile Banking - CEE`, base `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. `.codex-temp/baseline-banking-cards-pilot/ownership.json` records initial pending changes and allocated source/tests/fixtures/pilots/doc paths. Operator edits and other agents' paths remain intact. No Git index/branch changes, dependencies, demo integration or publication.

The user authorized autonomous completion of remaining baseline contracts and final review. This batch covers ProductCard, ProductsList, TotalRow, StackedProductShadow, AccordionSection, AccountBalanceCard and Card artwork. DebitCard remains its original alias. DS CardComponent and the carousel/controller compositions are outside this leaf extraction.

## Contract and compatibility

Legacy and evolution retain their distinct layouts, fonts, stack radii, PI/SME backgrounds and action/footer rules. The first four action slots remain visible; action callbacks stop propagation. ProductsList keeps the single-product exception (always visible, no total), zero/multiple child behavior, collapsed shadow, 300ms transition classes and total data supplied by owners. Accordion keeps its state and original child-cloning rules. Privacy and financial values remain caller-provided strings; no totals, business decisions or persisted data are recomputed in contracts.

AccountBalanceCard preserves product-type presentation labels, dimensions, active opacity, copy/subaccount flags and clamped progress. Copy clicks stop propagation. Existing Enter/Space keydown propagation from the copy button to the surrounding interactive card is characterized and preserved, including the unusual extra row-owner activation; correction is separate work.

Card metadata, all six variant tones, three sizes, original SVG paths and original imported UniCredit logo path data live in `contracts/cardArtwork.ts`, with no UI runtime imports. The original Web Card renderer consumes them and keeps its legacy named/type exports, custom styles, labels, SVG namespace, dimensions and generated-ID behavior. Native Card artwork consumes the same original geometry and palette; it does not redraw or rasterize art.

Native pilots are isolated under `native-spike/src/universal/Baseline*.tsx`. They retain owner-provided data, action/copy callbacks, single-card rules and Native slot composition. No existing Native demo imports them.

## Evidence

Red: the new composition test initially failed because the pure ProductsList contract did not exist. Green: 24 Web frozen preservation tests cover the legacy/evolution and PI/SME states, list/accordion counts, privacy strings, totals, five product kinds, progress boundaries, callback bubbling and all six artwork variants at three sizes.

Browser evidence: `.codex-temp/baseline-banking-cards-pilot/report.html`, `summary.json`, `browser-results.json`, `keyboard.json` and `images/`. The 160 before/after cases have zero changed pixels, identical normalized DOM and identical measured computed styles. Context is PI/RO/current/release-current/active with original Source CSS/fonts, real Demo/Language providers, Chromium DPR1, light/dark and 240/375px fixture bounds. Product and balance Space+Enter sequences each invoke their owner twice. Normal local access authentication uses the existing helper without credential output; HMR WebSockets are blocked.

Native evidence: renderer tests, strict scoped lint and TypeScript; `native-smoke.json`, `native-light.png`, `native-dark-collapsed-private.png` prove isolated Native Web rendering with zero page errors, exact action/copy callbacks and collapse/privacy/dark interactions. Missing optional `--uc-primary-k0` uses Source's existing `--uc-text` fallback. The standalone entry provides Metro's global alias for Animated.

Root explicitly allocated the later `BaselineCardNavigationRow.tsx` artwork reuse. Its shadow/labels/dimensions/inert behavior remain unchanged while artwork delegates to `BaselineCardArtwork`. `row-art-followup.json`, the before/after crop and `row-art-pixels.json` record zero changed pixels for the isolated Native Web fallback-card crop. A 16-pixel corner difference from an extra shell background was detected and eliminated by retaining the original transparent shell and explicit SVG clip compatibility mode. Original rows Source 132-case captures were not recaptured or relabeled as new Native evidence. Both affected Native row/banking suites and smokes are rerun after reuse.

## Acceptance boundary

This is composition/leaf preservation evidence, not complete RO route traversal or Native device acceptance. Android/iOS fonts, shadows, clipping, platform focus, assistive technology and gestures still need device review. All countries/locales/releases, RTL, system text scaling and complete app-controller integration remain unverified. Evolution/SME/browser fixture coverage establishes retained variants; it does not imply those variants are active PI/RO runtime routes. The Source alpha drop-shadow and Native shell boxShadow rasterization need device acceptance. Source CSS transition classes remain exact; Native ProductsList animates maxHeight/opacity/padding/shadow and Native Accordion uses the shared 300ms chevron duration/default easing. Device motion remains unaccepted.

Root owns final combined `npm run verify` and module audit after all editors finish. No warning/coverage/TypeScript/audit thresholds were weakened.

