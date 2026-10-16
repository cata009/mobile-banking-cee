# Baseline navigation contracts: implementation and evidence

Owner: `/root/baseline_navigation_contracts`. Integration owner: Root. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`. Base: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Existing main checkout, with no Git index/branch/worktree mutations. Initial pending changes and allocated paths were recorded before editing in `.codex-temp/baseline-navigation-pilot/ownership.json`; the four edited source components initially had no pending changes. Other editors' changes were preserved.

The integration plan is `2026-10-13-baseline-component-batch.md`. Navigation owns PageHeader, BottomNavigation, legacy BackButton and HeaderActionIcons, their six pure contract/binding files, frozen reference fixtures and two Web tests, four isolated Native leaves and their test/HTML/Web entry, this document and `.codex-temp/baseline-navigation-pilot/**`. No package, theme, registry, app composition or existing Native app was edited.

## Preserved behavior

- PageHeader keeps all existing props and default export. Its pure options type is shared with the Native leaf. Web binding preserves four backgrounds, dark progress-driven opacity/blur, sticky reserve, progress clamping/translation, compact cutoff `.999`, 48px toolbar with 40px actions, exact action padding, 8/16px title padding, leading/title/subtitle wrappers, optional header subtitle, right action precedence and aria/title labels. CSS typography remains the Source's 28px/700 title and 16px/700 collapsed title with normal line height.
- BottomNavigation retains `NavItem`, `DEFAULT_NAV_ITEMS`, `MY_BANKER_NAV_ITEMS` exports. Country/release feature decisions stay in the existing renderer. Caller `items` selects membership in historical source order. Callback activation suppresses internal state updates; uncontrolled activation updates internal state; a controlled prop wins. Evo selection maps Investments to Home through the untouched App2027 navigation branch. Labels/icons continue to resolve from existing owners and overrides. Baseline remains 375×54 with 32px slots, 20px glyphs, 24×2 indicators and text14/15.
- Legacy BackButton remains a distinct 32px control with original `back-line` artwork, `Go back` label, class override and callback. Header actions preserve icon mappings, 32px rail/action defaults, class overrides, badges hidden at <=0, numeric 1–99 and `99+` above99, 20px badge and Source text14/700. No new role or button type was added to legacy Web elements.

## Evidence

Frozen copies were captured before extraction under `tests/fixtures/baseline-navigation-before/`. Initial characterization passed 22 Web preservation tests. Contract tests first failed because the new pure contract modules did not exist; after extraction, the 32 combined Web contract/preservation tests passed.

The local report is `.codex-temp/baseline-navigation-pilot/report.html`. `browser-results.json` contains measured DOM, geometry, fonts and theme colors for each capture; `comparison-summary.json` summarizes zero changed pixels, zero DOM differences and zero computed-style differences across 58 comparisons. `keyboard.json` records two callback activations from Space and Enter. Frozen and current renderers use original Source CSS/fonts, normal local-gate authentication via the existing helper, and blocked HMR WebSockets.

Cases cover light/dark themes, light/dark/gray/transparent PageHeader variants, progress0/.5/1, safe reserve, narrow240/default375/landscape600 layouts with long titles/leading/subtitle/action/header-subtitle slots, and navigation/action rest/hover/focus/pressed. These are family visual fixtures, not full app screen/country/release traversal. Existing L1 headers and Account/Card local toolbars remain unmigrated and outside this certification.

Native leaves import pure family contracts and SourceCustomIcon's original vector geometry and Source palette. Native tests characterize geometry, callbacks, controlled state, glyph provenance and badge limits. The isolated browser entry renders both themes and Messages callback; screenshots are `images/native-light.png` and `images/native-dark.png`. This demonstrates a Native Web preview, not acceptance on Android/iOS. Native host sticky anchoring/blur/safe area, platform focus, accessibility and device font metrics remain unverified. No APK was generated or existing Native app changed.

## Verification handoff

Scoped Web and Native lint use `--max-warnings 0`, without weakened rules. Both strict project typechecks are run; an early root typecheck encountered another editor's transient TextField unused declarations, reported to Root, and the final result is recorded in `checks.json`. Root alone runs final combined `npm run verify` and module audit after all relevant editors finish. Exact owned deltas are in `.codex-temp/baseline-navigation-pilot/delta.json`; private evidence paths are listed separately there.
