# Romanian baseline PFM category detail

Owner: `/root/ro_pfm_detail_impl`. Base: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`.
Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`.
Initial pending changes are fully recorded in `.codex-temp/ro-baseline-pfm-details/initial-pending.txt`; ownership is recorded in the adjacent `ownership.json` before implementation edits.

Owned paths: new `native-spike/src/experiences/pi/current/baseline/spending/details/**`, new `native-spike/__tests__/ro-baseline-pfm-details.test.tsx`, this document, and `.codex-temp/ro-baseline-pfm-details/**`.

Source authority: `PfmCategoryDetailScreen`, `createSpendingCategoryDetail`, analytics category labels, amount privacy helpers, and baseline header/action/transaction/helper contracts. Period carousel and bubble chart belong to the main/chart owners; shared leaf changes belong to the integration owner.

Implement the colored PageHeader, raw period month/year hero and unsigned filtered total. Feed complete subcategories to chart, retain exclusions per mounted detail, and reset exclusions on period/category/direction changes. Source transaction rows use category avatars and full reporting-currency transaction payloads. The divider uses signed total. Uncategorized helper appears immediately below the first transaction and stays dismissed until detail is remounted. Add Transaction and the period hero have no action.

Verify Source behavior first with failing tests, then affected tests, TypeScript, scoped ESLint and exact Source/Native captures. Integration owner runs combined final verification.

Implemented files are exactly `native-spike/src/experiences/pi/current/baseline/spending/details/index.tsx`, `native-spike/__tests__/ro-baseline-pfm-details.test.tsx`, and this document. No preexisting file was edited by this owner. The detail imports the main owner's period carousel and chart owner's visual leaves and requests the Source detail-only inactive-panel accessibility treatment.

Verification: the initial three canonical detail assertions failed against a null scaffold (expected rows/privacy/helper absent), then passed after implementation. Seven detail regression cases now cover exact reporting-currency transaction payload identity, category avatars, signed month totals, privacy for hero/rows/divider, helper order/dismissal/remount, Source filtering with full bubble geometry, exclusion reset by period/category/direction, year/income totals, inert action, empty periods, and effective System/dark tokens. Scoped ESLint uses `--max-warnings=0`; Native TypeScript is checked without weakening options.

Actual Source `4004` and registered Native `CurrentApplication` `4006` are captured at logical 375×812, using Source viewport 375×811 and reset browser scroll, with real fonts and no masks or tolerance. Baseline Shopping, Uncategorized and Income plus seven behavior states have identical text and no page errors. Initial strict raster results: six of ten states have zero changed pixels; Shopping default/restored/year-reset/hidden each retain 145 pixels in bubble circle edges and the first cart SVG. These differences are recorded, not treated as equality. Chart/shared-leaf owners may improve their corresponding geometry independently; the integration owner must refresh combined final captures.

Evidence resides in `.codex-temp/ro-baseline-pfm-details/`: `ownership.json`, `initial-pending.txt`, `captures.json`, `pixel-results.json`, `behavior-captures.json`, `behavior-pixel-results.json`, source/native PNGs and strict difference PNGs. `capture.cjs` and `behavior.cjs` navigate the actual apps; `compare.py` and `compare-behavior.py` compare every pixel. Production edits are frozen after final scoped validation; integration retains responsibility for final combined verification and publication decisions.
