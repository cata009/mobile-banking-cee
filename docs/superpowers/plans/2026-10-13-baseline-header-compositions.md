# Baseline L1 and detail header compositions

Owner: `/root/baseline_navigation_contracts`; integration owner: Root. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`. Base commit: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Initial pending changes/ownership were captured before editing in `.codex-temp/baseline-header-compositions-pilot/ownership.json`. This follow-on task uses the existing main checkout and preserves all earlier navigation contracts and other editors' pending work.

## Implementation

Five exact L1 variants (`home`, `more`, `products`, `payments`, `analytics`) share `BaselineL1Header` and the pure `l1Header`/`l1HeaderWeb` contract. Named existing wrappers retain context, translations, Prime/privacy actions, country-specific servicing rails, and the existing Evo payments branches. Home remains independently renderable as fixed actions and scrolling title; HomeScreen's host was not edited. More remains transparent at gutter16/pb24; Products keeps app background, overrideable gutter24, pb22 and 28/36 title; Payments keeps gutter20/pb20; Analytics keeps its `header` tag, gutter24/pb20 and original class ordering. Common action slots remain32; existing artwork and Prime gradient remain in their owners.

`BaselineDetailToolbar` and pure `detailToolbar`/`detailToolbarWeb` preserve the local Account/Card toolbar instead of imposing PageHeader's defaults. Both keep sticky z30, reserve54, 48px toolbar/40px actions, gutter8/top8, original labels/glyphs and no new button type/title/cursor/padding. Progress is supplied unchanged; no clamping was added. Account requires an actual Help callback; Card always renders Help and retains its literal `Cards` title. The local wrapper functions are retained with additive named exports to make exact compositions inspectable and testable.

Edits in the seven existing files are restricted to local header functions and allocated imports. The initial CardDetail pending state includes business/controller changes from earlier work; these were preserved. `preservation-proof.json` compares all text outside the owned header function and allocated imports against exact initial snapshots. Per-file `*-own.patch` files show this agent's delta against initial pending state; the combined Git diff cannot attribute pending changes by owner.

## Verification evidence

Frozen original wrappers/snippets live in `tests/fixtures/baseline-header-compositions-before/`. Three characterization tests passed before extraction; contract tests initially failed because the pure modules did not exist. After extraction, 34 new Web tests passed, including exact DOM preservation, Home privacy/callbacks, country/custom/Evo rails, progress0/.5/1, Help presence and callback continuity. A whitespace regression introduced at the Home JSX slot boundary was detected by exact DOM comparison and corrected at that boundary.

55 existing affected screen regressions passed: Card Detail19, Account Info10 and Evo Analytics26. Native isolated composition tests pass10. Source and Native scoped lint use `--max-warnings 0`; strict typecheck outcomes are recorded in `checks.json`. A root typecheck during concurrent work encountered another owner's Toggle test `replaceAll` incompatibility; Root was notified. No typechecking, warning or audit policy was weakened.

The local before/after report is `.codex-temp/baseline-header-compositions-pilot/report.html`. All96 browser fixture pairs have identical pixels, DOM, computed styles and scroll positions. Captures cover light/dark; five L1 variants; RO/BA/BA_BL/CZ servicing rails; narrow240/default375/landscape600; long title clipping and custom actions; Home amount privacy and fixed/scrolled composition; Account/Card progress0/.5/1 with both Help conditions; scrolled sticky toolbars; hover/focus/pressed. Original Source fonts, styles and theme tokens are loaded. HMR WebSockets are blocked and normal local-gate authentication uses the existing reference helper. Account Back's Space/Enter keyboard activation calls its owner twice.

## Native and acceptance boundaries

New Native L1/detail leaves consume the same pure geometry contracts, Source palette and supplied original Source icon slots. Existing Native apps and APKs remain untouched. The isolated Native Web preview checks both themes and activation; Home preview shows the scrolling title, while feature-owned Prime/privacy/country/Evo composition stays outside this isolated leaf preview. Device font metrics, sticky hosting, safe-area integration, native focus and accessibility remain unverified.

These are family visual fixtures plus scoped affected-screen regressions, not full app/country/release acceptance. No search/payment/PFM or card/account controller behavior was changed. Root owns the final combined `npm run verify` and module audit after all relevant editors stop. Exact owned additions/modifications and private evidence paths are in `delta.json`.
