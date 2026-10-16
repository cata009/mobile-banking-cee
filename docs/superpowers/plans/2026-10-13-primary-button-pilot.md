# Primary Button preservation pilot

Owner: `/root-primary-button-pilot`. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`. Base: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Initial pending changes and exact ownership: `.codex-temp/primary-button-pilot/ownership.json`.

## Approved scope

The existing web demo is the visual reference. Extract the existing PrimaryButton contract without changing its default DOM, classes, callbacks or states. Preserve legacy imports, the white prelogin adapter and consumer class overrides. Migrate only LanguageSelector Save, using an explicit compatibility preset that preserves its action token, typography, opacity hover and existing HTML button type behavior. Do not migrate other buttons or rebuild screens.

The native renderer is an isolated component pilot. It consumes the same semantic contract; it does not replace existing native demos or claim Android screen parity.

## Execution and verification

1. Freeze the two existing implementations and white adapter before edits. Record hashes and initial Git status.
2. Produce a static import/callsite inventory, identifying overrides and uncertain reachability. Static inventory is not runtime coverage.
3. Characterize default, disabled, surface, typography, consumer overrides, legacy wrapper and LanguageSelector save/cancel behavior. Add failing contract tests before implementation.
4. Extract the platform-independent contract and web binding. Keep source-compatible exports and preserve the old default rendering. Replace only the language save button.
5. Compare frozen and current components in the same browser and theme. Measure DOM, styles, bounds and pixels for enabled/disabled/hover/focus/pressed states, typography, long labels and exceptional overrides. Capture the complete language screen and exercise save/cancel.
6. Build the isolated native component and preview using contract tokens. Test disabled and callback behavior. Clearly distinguish native preview from device verification.
7. Publish a local review report with exact modified paths, before/after images, measured differences and untested scope. Keep a frozen reference for later pilots. Run affected checks, module audit and the integration owner's combined `npm run verify`; report unrelated failures without changing unrelated work.

## User control

No blanket replacement. Each future migration has a named caller and compatibility decision, before/after evidence and regression coverage. Differences remain visible in the report; unverified states are not called identical. Rollback is a scoped reversal of this pilot's delta, preserving other pending changes. No reset, staging, commit, deployment or APK publication is part of this task.

## Pilot evidence

- Local interactive report: `.codex-temp/primary-button-pilot/report.html`, served at `http://localhost:4004/.codex-temp/primary-button-pilot/report.html`. Before/after, overlay, pixel differences, exact caller inventory and limitations are inspectable.
- 108 Chromium comparisons, light/dark: zero changed pixels; normalized DOM and measured styles matched. HMR was disabled only in the automated browser session because concurrent checkout changes can reset the fixture during capture.
- Web tests: 17 passed. Native component tests: 4 passed. Native strict TypeScript, source lint, isolated Native lint, Source build, all audits and explicit combined scope snapshot passed. The Native preview is available at `http://127.0.0.1:4006/primary-button-pilot.html`; no existing Native demo imports it.
- Final `npm run verify` was attempted after pilot edits. It is blocked by TS18048 in the concurrently edited `tests/screens/disposable-cards-flow.test.tsx` (optional flow access). This is outside pilot ownership and has not been modified here. The full repository gate is not claimed green.
- Exact own delta and preserved reference hashes: `.codex-temp/primary-button-pilot/delta.json`. The live `.agent-task.json` belongs to the concurrent integration task and was preserved; an explicit private combined snapshot was validated separately.
- Android focus/motion/font rasterization and full app journey coverage remain acceptance gates before integrating this Native renderer. Existing CSS override sites require platform-specific review before a Native caller migration.
