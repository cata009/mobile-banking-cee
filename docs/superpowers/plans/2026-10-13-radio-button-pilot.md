# Radio Button preservation pilot

Approved continuation of the component-by-component baseline migration, after the Primary Button visual review. Owner: `/root-radio-button-pilot`. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`. Base and initial pending changes: `.codex-temp/radio-button-pilot/ownership.json`.

Scope: extract the existing common RadioButton contract and Web binding, retaining the legacy import and every default DOM/style/interaction. Introduce the exact `date-filter` compatibility variant and migrate only AccountTransactionFiltersSheet's local DateFilterRow through that variant. Preserve its 80px row, 16px gutter, 14px/18px typography, span icon wrapper, lack of aria-label/hover additions, and selected-preset toggle back to none. Do not change filtering policies, callbacks, radio-group keyboard behavior, checkbox/option/rating semantics, Italy custom controls or navigation.

1. Freeze RadioButton, DateFilterRow and complete sheet. Record scoped ownership and Source hashes. Inventory consumers and exceptions with the existing audit worker.
2. Characterize current controlled selection, keyboard activation, selected/deselected date toggle, draft/apply/close callbacks and exact DOM/classes. Add failing contract tests before extraction.
3. Implement the pure contract and Web binding. Delegate only DateFilterRow; leave its wrapper and call sites stable.
4. Compare frozen/current standard and date-filter rows in both themes, narrow widths, localization, long labels, focus/hover/press and complete sheet. Compare pixels, normalized DOM and computed style. Freeze HMR only in the automated comparison session.
5. Add an isolated Native RadioButton using the same contract and original vector artwork. Test controlled checked state and activation. Native device focus/font/motion and full screen parity remain separate acceptance gates; no demo integration or APK publication.
6. Deliver a local before/after report linked to the first pilot, exact own delta and coverage limits. Run affected tests, strict typing/lint, audits, build and final combined `npm run verify`. Preserve unrelated concurrent edits and report external failures without changing them.

## Evidence

Report: `.codex-temp/radio-button-pilot/report.html`, served at `http://localhost:4004/.codex-temp/radio-button-pilot/report.html`. Isolated Native preview: `http://127.0.0.1:4006/radio-button-pilot.html`.

66 before/after browser cases have identical pixels, measured styles and normalized DOM. The full sheet comparison normalizes only generated React IDs and whitespace. Source real-browser Space/Enter activation passed. Nine Radio Web tests and three Native tests passed; combined Primary/Radio checks have 26 Web and seven Native passing tests. The Native browser smoke caught a missing checked attribute in React Native Web; explicit aria-checked now preserves observable selection while retaining Native accessibilityState, with a red/green regression for true and false states.

Final `npm run verify` passed with 252 test files / 2927 tests, strict TypeScript, zero-warning lint, formatting, coverage thresholds, all audits and Source build. Coverage:83.24% statements/lines,81.95% branches,64.77% functions. Existing bundle-size warnings remain; thresholds were not changed. The earlier concurrent Disposable Cards blocker is absent from this verified final state.

Only the shared RadioButton and local DateFilterRow implementation are changed in existing Source. No filtering policy, parent callback, navigation or existing Native demo was changed. The pure contract, platform bindings, tests, frozen fixture and isolated preview are added. Exact file delta: `.codex-temp/radio-button-pilot/delta.json`. The other task's live scope manifest is preserved; a private explicit combined snapshot is checked separately.

Device font rasterization, focus/motion/accessibility and full Native screen parity remain acceptance gates before integration. The existing date-filter no-op in the business model remains unchanged; this pilot verifies selection/draft/apply behavior rather than introducing new filtering.
