# Current Session

Last updated: 2026-07-20

> Older sessions live in [`archive/`](archive/). This file keeps the most recent 12.

## Archives

- [2026-07](archive/sessions-2026-07.md) — 135 sessions
- [2026-06](archive/sessions-2026-06.md) — 74 sessions

## 2026-07-20 Stakeholder Tools Tab and Flow Export

- Latest request handled: add a stakeholder `Tools` platform tab hosting the approved tool set — side-by-side country comparison, component translation tester, translation review table — plus PDF/Word export for Flow Library journeys. Only the explicitly approved tools were implemented.
- Platform surface: fourth top-bar tab `Tools` next to Demo/Flows/Design system. New runtime screen `tools` (surface `platform`, unrestricted, restorable deep link `?screen=tools`), registered as `platform.tools` across `demoTypes`, `screenRegistry` (new `LayoutFamily` value `tools`), `NavigationContext`, `routePolicy`, `DemoNavigationSync`, `DemoTopBar`, and `App.tsx` (lazy `ToolsScreen`). Landing page with three tool cards; chip navigation between tools.
- Side-by-side countries: renders the same demo screen for 2–4 countries as live, independent app iframes built on the existing deep-link system in frameless device mode (`frame=0`), inheriting the current product/release/theme/banking-scenario context; Local/EN language toggle; only payload-free restorable screens are offered directly; frames are interactive and can be reloaded as a set. Browser-verified: RO/CZ/HU on Payments render the real localized app (RO iframe shows `Plăți`/RoPay, no access gate inside frames).
- Component translation tester: seven real design-system components (PageHeader, PrimaryButton, NavigationRow, TextField, InfoBanner, GhostBanner, SectionHeadingDivider) with declared text slots; text source is custom copy (with Short/Long/Very long presets) or a searchable real translation key; key mode renders all 14 language columns with post-layout measurement (horizontal-overflow badge, wrap height delta vs shortest) and a worst-case action that jumps to and highlights the longest real translation. Browser-verified: 14 specimens for `runtime.actions.back`, worst case RO `Înapoi` highlighted.
- Translation review table: namespace selector (10 namespaces from the canonical RO/EN shape), 15-column sticky table (key + 14 languages), text search, only-risks filter, missing-value flags, overflow-risk highlight (`len > 24 && len > 1.45 × same-country EN`), CSV export with UTF-8 BOM and CRLF. Browser-verified: 253 `runtime` rows; risk highlighting fires on real data in `more` and `prime`.
- Flow export: the Journey panel gained `Export PDF` and `Export Word`. Dependency-free by approval rules: PDF opens a print-formatted HTML document (cover, one page per step, UX-spec appendix) in a new tab with an automatic print dialog; Word downloads an MHTML `.doc` with the captured step PNGs embedded as base64 parts. Captures reuse `createPhoneScreenshotBlob` on the journey steps already mounted in the DOM. Browser-verified end to end: 2 steps captured (~85 KB PNG each), 181 KB `.doc` assembled in ~2.2 s.
- Files added: `src/app/screens/tools/` (`ToolsScreen`, `SideBySideTool`, `TranslationTesterTool`, `TranslationReviewTool`, `testableComponents`, `translationCorpus`, `toolsUi`), `src/app/screens/flow-library/flowExport.ts`, `tests/screens/tools-screen.test.tsx` (10 tests), `tests/screens/flow-export.test.ts` (3 tests). Files changed: `demoTypes.ts`, `screenRegistry.ts`, `NavigationContext.tsx`, `routePolicy.ts`, `DemoTopBar.tsx`, `DemoNavigationSync.tsx`, `App.tsx`, `FlowLibraryScreen.tsx` (backward-compatible `Panel` `action` prop + journey export wiring), `tests/navigation/route-policy.test.ts` (31 routes).
- Verification: TypeScript and ESLint clean for every file of this session; the three affected/new test suites pass (10 + 3 + route-policy); all six audits pass. Repository-wide `npm run verify` is NOT green because of pre-existing, untouched failures from the in-progress PFM recategorization work (`AccountDetailScreen.tsx` TS2345, `pfm-category-change-sheet`/`pfm-transaction-recategorization` tests referencing not-yet-created component/props).
- Browser note: the embedded preview tab reports `document.visibilityState === "hidden"`, so top-bar tab clicks (navigation deferred via `requestAnimationFrame`) do not fire in that pane; deep links (`?screen=tools`) work there, and normal browsers are unaffected.
- Follow-up hardening after a user report that the translation tester appeared not to load (most plausibly the HMR window while the corpus module was mid-edit): every tool now renders inside a `ToolErrorBoundary` (readable error panel + retry instead of a blank surface), and specimen measurement re-runs only on an explicit content signature (component + slot + text), making a measurement/render loop impossible. Re-verified on a fresh tab against the final code: tester card renders 7 components with no error panel.
- Committed on explicit user request as `d017089` (66 files, +5,523), unifying this session with the parallel PFM recategorization and the earlier July 19–20 product work after a green end-to-end `npm run verify`. The reference captures under `To do/` were intentionally left untracked; `.claude/skills/design-system-ui/` was force-added past the `.claude/` ignore rule so the project skill ships with the repo. safe to resume: yes.

## 2026-07-20 PFM Transaction Recategorization

- Latest request handled: map every expense category visible in the 24 production-reference captures under `To do/PFM categs` and connect a Design-System-aligned `Change category` bottom sheet to the PFM icon in Account Detail transaction rows and to the existing Transaction Detail action.
- Taxonomy and interaction: `src/data/pfmCategories.ts` now owns 18 expense groups and 103 unique subcategories. Every group starts collapsed; groups can be expanded independently, search filters/opens matching groups, selection is single-choice, and `CHANGE CATEGORY` stays disabled until the selection differs from the current category.
- Connected behavior: clicking the category icon opens the sheet without opening the transaction; the remainder of the row still opens Transaction Detail. A confirmed selection updates the row icon/category and the selected Transaction Detail category/subcategory through one `App`-level session state. Closing the sheet discards an unconfirmed choice.
- Design-system decision: reused `PfmCategoryIcon`, `AccountSearchBar`, `PrimaryButton`, `AccountActionBar`, `AppIcon`, and Radix accordion primitives; extended `BottomSheet`, `AccountSearchBar`, and `AccountTransactionRow` through optional backward-compatible props; created only the domain-specific `PfmCategoryChangeSheet` and taxonomy contract. The component is registered as `pfm.category-change-sheet`.
- TDD evidence: the taxonomy test first failed on the missing 18-group contract; the sheet tests first failed on the missing component; and the screen integration tests first failed on the absent icon/detail entry points. Focused suites then passed 12/12.
- Full verification: `npm run verify` passed end to end on 2026-07-20: TypeScript, ESLint, all Vitest suites, all repository audits, and production build. Only the existing Recharts zero-size test notices, empty `react-vendor` chunk notice, and >500 kB App chunk warning remain.
- Browser evidence: in-app smoke at 375x812 confirmed 18 collapsed group controls, zero radios before expansion, disabled unchanged confirmation, seven Financial radios after expansion, Mortgage selection/enabled confirmation, list icon update to Finance, and `Finance` / `MORTGAGE` in Transaction Detail. The same sheet reopened from Transaction Detail with Mortgage recommended, all groups collapsed, and confirmation disabled; browser warning/error logs were empty.
- Scope/limitation: recategorization is deterministic front-end session state only. It does not call a backend, persist across reloads, recalculate analytics aggregates, or create audit history. Changes remain intentionally uncommitted pending an explicit commit request. safe to resume: yes.

## 2026-07-20 Investments Sell Eligibility

- Latest request handled: restrict the Product Detail `Sell` action to securities the user can actually sell, without introducing short-selling behavior or moving the remaining action buttons.
- Product behavior: Sell is available only when the catalogue security is owned, active, and has `quantity > 0`. Catalogue-only products, inactive legacy holdings, and zero-quantity positions keep the Sell slot invisible and non-interactive. The shared four-slot `AccountActionBar` still receives all four items, so History, Documents, the blank Sell position, and Buy remain aligned exactly as before.
- Scope: the rule lives in the shared Investments Product Detail and therefore applies to all eight Mobile PI countries. No Sell order flow, persistence, backend trading, dependency, route, or data-model capability was added.
- TDD evidence: the new test first reproduced the bug for an owned zero-quantity position, then passed after the eligibility condition was tightened. The focused suite covers active owned, zero-quantity owned, inactive owned, catalogue-only, and fixed four-slot layout states.
- Browser evidence: Romania smoke confirmed Sell on owned `Global Dividend Fund` (`2,264 PCS`) and no Sell on catalogue-only `Amundi Climate Focus Fund`; History, Documents, an empty third slot, and Buy stayed in their original positions.
- Full verification: `npm run verify` passed end to end - TypeScript clean, ESLint clean, 44 test files / 270 tests, all six audits including the eight-country Investments consistency audit, and production build with 3,962 modules. Known baseline-only warnings remain the test Recharts zero-size notice, empty `react-vendor` chunk, and >500 kB App chunk.
- Files changed for this correction: `src/app/screens/investments/InvestmentSecurityScreens.tsx`, `tests/screens/investment-buy-order-flow.test.tsx`, and handoff/capability documentation. Changes remain intentionally uncommitted pending an explicit commit request.

## 2026-07-20 Mobile PI Product-aware Account Details and Progress

- Latest requests handled: rename the carousel to `My Products`; keep the Savings balance consistent with its Details page; add the exact Term Deposit composition; then use the supplied production screenshots to add connected maturity/repayment progress for Term Deposit, Personal Loan, and Mortgage plus product-specific credit details.
- Saving behavior: Account Details renders exactly Account number, Account title, and Current balance, and Current balance uses the same authoritative product balance shown on the card. Available funds, Blocked/reserved amount, Overdraft, Offer, Show less, and Connected cards remain intentionally absent.
- Term Deposit behavior: the card replaces its IBAN line with `Maturity date 20.09.2026`, hides the unrelated copy action, and renders an 83% progressbar calculated from Start/Value Date `20.09.2025`, Maturity date `20.09.2026`, and the deterministic demo reference date `20.07.2026`. Account Details retains the exact 13-row deposit composition; maturity amount and dates share the same model with the card.
- Loan/Mortgage behavior: both cards now display positive Remaining loan amount, a model-backed Next installment, and amount-derived repayment progress (Personal Loan 40%, Mortgage 16%). Their Account Details pages replace the generic account composition with every supplied named field in order: Next installment, Next installment date, Interest rate, Overdue amount, Overdue interest rate, Owned amount, Original amount, Account title, IBAN, Account owner, Start date, and Final payment. The request described 13 fields but named 12, so the implementation renders all 12 exactly once rather than inventing another field.
- Data authority: `src/data/accountProductDetails.ts` owns the deterministic product dates, rates, amounts, and clamped progress calculation. The product card and Details screen consume the same returned object, preventing the displayed values/progress from diverging. These are coherent demo values, not a real amortization schedule or backend contract.
- Scope boundary: product-type branching applies globally to Mobile PI. Current accounts retain the previous extended detail composition. No dependency, route, release, backend, persistence, transaction mutation, or broad architecture change was introduced.
- Files changed for this work: `src/data/accountProductDetails.ts`, `src/app/components/accounts/AccountBalanceCard.tsx`, `src/app/screens/accounts/AccountDetailScreen.tsx`, `src/app/screens/accounts/AccountDetailsInfoScreen.tsx`, `src/translations/types.ts`, `src/translations/shared.ts`, `tests/data/account-product-details.test.ts`, `tests/screens/account-details-info.test.tsx`, `tests/screens/small-screen-guards.test.tsx`, the design/implementation notes under `docs/superpowers/`, and the required handoff/capability documents.
- TDD evidence: the new suites first failed on the old Term Deposit dates, missing calculation exports, generic loan/mortgage details, missing maturity-date copy, and zero progressbars. After implementation, `npm test -- tests/data/account-product-details.test.ts tests/screens/account-details-info.test.tsx` passed 11/11.
- Full verification: `npm run verify` passed end to end - TypeScript clean, ESLint clean, 45 test files / 277 tests, all six audits, and production build with 3,962 modules. Known baseline-only warnings remain the test Recharts zero-size notices, empty `react-vendor` chunk, and >500 kB App chunk.
- Browser evidence: in-app smoke confirmed all three progressbars and their connected values: Term Deposit `83%`, Personal Loan `40%`, Mortgage `16%`; Term Deposit displayed the connected start/maturity dates and all 13 rows; both credit products displayed the requested 12 fields with values matching their cards. Browser warning/error logs were empty, and the visually verified Mortgage card was left open for review.
- Limitations/next action: product dates, interest rates, and repayment data are deterministic mock values. Changes remain intentionally uncommitted pending an explicit commit request. safe to resume: yes.

## 2026-07-20 Investments BUY Order Design-System Correction

- Latest request handled: correct the Mobile PI Investments BUY Order mapping against the supplied Figma frame and the already-approved Product Detail reference, without changing the eight-country scope or the order state machine.
- Product Detail mapping: Product, Status, Product ID, Product type, Asset class, and review summary values now reuse the same vertical investment detail component as the existing security Product Detail screen (label above, value below) instead of the custom horizontal two-column row.
- Order Data mapping: Security account, Cash account, Market price, and Quantity now use the shared Design System `TextField`. Account selectors use the DS divider/helper/chevron treatment; Cash account keeps the existing selection sheet and adds account name plus available-balance helper copy. Quantity uses the DS line field with numeric keyboard hint, `PCS` suffix, minimum helper, and the existing validation behavior rather than a boxed native number input.
- Shared component work: the existing Product Detail field was extracted to `src/app/components/investments/InvestmentDetailField.tsx`; `TextField` gained accessible label binding plus narrowly scoped read-only, input-mode, suffix, and activation support used by selector-style fields.
- Files changed in this correction: `src/app/components/TextField.tsx`, `src/app/components/investments/InvestmentDetailField.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, `src/app/screens/investments/InvestmentBuyOrderFlow.tsx`, `tests/screens/investment-buy-order-flow.test.tsx`, and handoff/capability documentation.
- Verification: targeted BUY Order suite passed (7/7); typecheck and ESLint passed; all six audits passed, including Investments consistency for all eight countries; production build passed (3,961 modules). In-app browser smoke on `http://127.0.0.1:4004/` confirmed the vertical Product Detail rows and DS line fields/helper text/chevrons for Security account, Cash account, Market price, and Quantity. The formerly unrelated Saving Account failure was resolved by the subsequent account-details task above; repository-wide `npm run verify` is now green at 268/268 tests.
- No dependency, backend, persistence, release, commit, push, or deployment action was taken. The BUY flow remains shared across `RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, and `SI`, mock-only, and intentionally uncommitted.
- safe to resume: yes for Investments; repository-wide verification is green.

## 2026-07-19 Investments One-Off Buy Order

- Latest request handled: implement the Figma-derived Mobile PI Investments one-off BUY flow for every supported country (`RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, `SI`), entered from Investments -> Invest -> security detail -> Buy. Recurring orders remain explicitly out of scope.
- Product behavior: the local Investments coordinator now covers Order Data -> Review Data -> Sign order -> Order accepted. Order Data selects an existing current account, validates a positive whole quantity and available balance, shows market price/product amount, and converts the estimated debit into the selected account currency using the existing mock FX table. Review exposes the order/account summary, document rows, terms acceptance, and a gated Buy action. Success returns to the Investments portfolio.
- Reuse: payment Sign/Success visuals were generalized into `StandardSignScreen` and `StandardSuccessScreen`; the domestic-payment wrappers preserve their existing API and copy. The Investments flow continues to use the shared PageHeader, PrimaryButton, BottomSheet, ToggleButton, SectionHeadingDivider, action bar, and catalogue/product-detail components.
- Mock boundary: no backend trade is sent, balances and holdings are not mutated, and the accepted order is not persisted into History. The flow is a deterministic front-end simulation aligned with the repository's existing Investments data contract.
- Browser issue found and fixed during smoke: owned and catalogue-only products could share seed IDs, producing duplicate React keys in the securities list. Catalogue-only runtime IDs are now namespaced; a regression test proves catalogue IDs remain unique.
- Files changed: `src/app/screens/investments/InvestmentBuyOrderFlow.tsx`, `src/app/screens/investments/investmentBuyOrderModel.ts`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, `src/app/config/investmentsPortfolioConfig.ts`, `src/app/components/flow/StandardSignScreen.tsx`, `src/app/components/flow/StandardSuccessScreen.tsx`, `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`, four focused test files, the approved design/spec plan, and capability/handoff documentation.
- Verification: `npm run verify` passed end to end — typecheck clean, ESLint clean, 43 test files / 263 tests, all six audits, and production build (3,960 modules). The Investments audit passed for all eight countries. In-app browser smoke on `http://127.0.0.1:4004/` passed Home -> Investments -> Invest -> product detail -> Buy -> Review -> terms -> Sign -> Order accepted -> Back to Investments; after the catalogue-ID fix, no new browser warning/error was emitted.
- Known non-blocking baseline warnings: the test-only Recharts zero-size notice, empty `react-vendor` build chunk, and >500 kB App chunk remain unchanged. No dependency, release, commit, push, or deployment action was taken.
- safe to resume: yes — implementation is verified and intentionally remains uncommitted pending an explicit commit request.

## 2026-07-19 Unified Git and Production Publication Closeout

- Latest request handled: unify every completed local change on `main`, publish it to GitHub and Vercel Production, and leave no hidden worktree, stash, side branch, or uncommitted publication work.
- Starting state was audited before publication: exactly one worktree on local `main`, no stash entries, no secondary local branches, a clean index/worktree, and 14 verified commits ahead of `origin/main`. The only secondary remote branch, `origin/codex/product-health-hardening`, was already fully merged into `main`.
- GitHub publication: the 14 commits through `bb8257d` were pushed to `origin/main`; the fully merged `codex/product-health-hardening` remote branch was deleted. This closeout documentation is the final follow-up commit and is pushed to the same branch before the explicit Production deployment.
- Fresh verification immediately before publication: `npm run verify` passed end to end - 0 type errors, ESLint clean, 39 test files / 234 tests, all six audits, and the Vite production build (3,956 modules). The asset audit still locks all 159 tracked assets at aggregate `eb450645cc7aae56dbcc8b147dc5f941fd720a041a85d03962a5870c74af1f99`.
- Image safety: no image was edited during this closeout. PNG optimization remains an explicitly controlled future task; the already committed lossless pass retains identical decoded samples and the same 159-asset inventory.
- Known limitations are not hidden: the successful build still reports the documented empty `react-vendor` chunk and `App` chunk-size warning. Product backlog remains in `next-tasks.md` / `known-bananas.md`; neither warning blocks publication and neither was expanded into last-minute scope.
- Commands/evidence: `git worktree list --porcelain`, `git stash list`, `git branch -vv`, `git branch -r --no-merged main`, `git status --short`, `git rev-list --left-right --count origin/main...HEAD`, `npm run verify`, `git push origin main`, and `git push origin --delete codex/product-health-hardening`.
- Publication evidence: Vercel Production deployment `dpl_9FvgW2YuCKxRMwPWgmPVnfbYnebC` reached `READY` on the canonical `https://mobile-banking-cee.vercel.app` alias. Production access smoke passed unauthenticated -> login -> authenticated, and the authenticated app document returned HTTP 200 with its root mount. GitHub Actions `verify` run `29687079235` completed successfully for `da6895e`.
- Banana Loop: all publication-state risks were either removed or recorded; there is no untriaged local work. The successful CI run emitted a non-blocking Node 20 action-runtime deprecation notice; it is recorded in `banana-log.md` and `next-tasks.md` rather than expanded into this closeout.
- Constitutional Check:
  - scope preserved: yes - closeout/publication only; no new product or PNG work
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-19 Monolith Split

- Latest request handled: split all six remaining monolith files, finishing the job rather than stopping at the largest.
- Result, one commit each so any of them can be reverted alone:

  | file | before | after |
  | --- | ---: | ---: |
  | `DesignSystemPage.tsx` | 4,371 | 462 |
  | `TemplateCodePreviews.tsx` | 2,836 | 138 |
  | `KidsMarketHomeApp.tsx` | 2,725 | 977 |
  | `AppIcon.tsx` | 2,135 | 249 |
  | `czChatOrchestration.ts` | 1,816 | 1,335 |
  | `phoneScreenshot.ts` | 1,744 | 309 |

- Every split was verified as a pure move: each original declaration is byte-identical in its new home, none missing, none added, no import cycles, and `npm run verify` green before moving on. Public surfaces were preserved by re-exporting moved names from the original paths, so no consumer changed.
- Two audits were taught the new layout without changing what they assert: `audit-template-contract.mjs` now reads the preview-id union from `templateData.ts` (it still reads the `case` arms from the dispatcher), and `audit-figma-bridge.mjs` now reads the whole exporter folder for its seven static checks. Both report the same numbers as before.
- Tooling bug found and fixed mid-way: the extraction script's declaration pattern did not recognise `export async function`, so on `phoneScreenshot.ts` the three exported entry points were absorbed into the preceding constant's block and moved out with it. The pattern now handles `async`, that split was redone from scratch, and the three earlier splits were checked and contain no top-level async functions, so they were unaffected.
- Deliberately not done: `buildCzChatSmartReplyResolver` is a single 1,285-line function with 87 inner bindings. Splitting it means restructuring a function body, which forfeits the byte-identical guarantee every other step relied on, so it was left for a dedicated pass.
- Verification: `npm run verify` passes end to end - 0 type errors, ESLint clean, 234/234 tests, six audits, production build.
- safe to resume: yes.

## 2026-07-18 Project Health Pass

- Latest request handled: after the Kids split, execute the four project-health items — delete the dead `src/imports` dump, enforce the quality gate in CI, shrink the oversized shipped images without losing anything, and split the session log. Verification of every claim was demanded before any execution.
- Dead code removed: 72 of the 77 files under `src/imports` (14,942 lines). Proven dead four independent ways before deletion — reachability from all 49 real entry points, brute-force textual search across 537 repo files of every type, bundle inspection, and a real `git rm` deletion taken through typecheck, lint, tests, audits, and build. Two earlier signals turned out to be false: an apparent reference to `Patch` was a code comment, and `PrimeHome` was a `figma:asset` image, not the module. The bundle hits were live components (`PanelMenuSheet`, `StatusBar`, `AppIcon`) carrying their own copies of the same generated Figma markup — `src/imports` held the originals, and the code had been copied out of them.
- Correction to an earlier claim in this session: the number of surviving `svg-*` modules is five, not two. The first search was scoped to `src/app/**` and missed `useProducts.tsx`, `StatusBar.tsx`, and `Card.tsx`.
- Images: the three shipped Figma exports were re-compressed losslessly, 40.61 MB -> 34.28 MB, taking `dist` from 64.3 MB to 57.9 MB. No tool was available and none was added; the optimiser is a local script using Node's own `zlib` that decodes the existing image, re-chooses PNG row filters, re-deflates, and drops an `eXIf` metadata chunk. Nothing is invented: a second, independently written decoder confirmed the SHA-256 of the raw samples is identical before and after for all three files. `scripts/asset-baseline.json` was re-locked to the new aggregate with `assetCount` still 159 — no image was added, removed, resized, converted, or regenerated.
- Deliberately not done: `ff8ceb68….png` (48.6 MB) and `cb092756….png` lost their last references when the dead imports went, but both were kept, because the standing instruction is that every existing image stays. Logged as a decision for their owner.
- CI: `.github/workflows/verify.yml` now runs `npm run verify` on push to `main`, on pull requests, and on demand. Nothing enforced the gate before, which is how the tree reached five type errors and two failing tests without anyone noticing.
- Type errors: three of the five turned out to be a configuration gap, not a code fault. `useGrouping: "always"` is valid ES2023 and correct at runtime, but `tsconfig.json` loaded only `ES2020`. Adding `ES2023.Intl` to `lib` cleared exactly those three and introduced nothing new.
- Session log: `current-session.md` went from 690 KB / 6,293 lines to 22 KB / 177 lines, with 209 older sessions moved verbatim into `docs/handoff/archive/`. Zero sections and zero content lines were lost, verified by comparison against a pre-split copy. `agents.md` now records the archiving convention, since the rule to read this file first had become impossible to follow.
- CI made green afterwards, on request. All four remaining failures turned out to be stale expectations rather than broken product code:
  - `selectedPendingActionId` now binds only its setter; nothing reads the value yet.
  - `TutorialDetailOverlay` stops destructuring `onBack`. The prop stays on the interface and at the call site because the caller really does wire "return to the tutorial list" — but the header only draws a Close control, so that path is currently unreachable. Logged as its own task rather than inventing a button.
  - The two Learn tests were repaired against the current UI, verified by probing the live DOM rather than guessing. Earning now renders two `SHOW MORE` links (Tasks and Education), so the query is scoped through `[data-hu-learn-education-card]`. Messages is asserted on the Earning header *before* navigating, because opening Learn swaps that header for the menu frame and the button disappears. The lesson player was redesigned in the same uncommitted work — the control is `NEXT`, not `Continue`, and the "Slide n of m" caption was removed — so the 4-segment rail is now the progress contract, and it still advances 1 -> 2 on NEXT.
- Verification: `npm run verify` passes end to end — **0 type errors** (from 5), ESLint clean, **234/234 tests across 39 files**, all six audits, and the production build.
- Limitations:
  - Lossless compression recovered 15.6%. The larger problem is dimensions — `7397x5011` and `6144x4096` images rendered as small cards — and downscaling changes pixels, so it was not attempted.
- safe to resume: yes.

## 2026-07-18 Kids Split Phases 2-3

- Latest request handled: refactor `src/app/screens/kids/KidsMarketHomeApp.tsx` with a single agent (explicitly no multi-agent fan-out), without changing behavior, following the existing Kids split plan in `next-tasks.md`.
- Pre-existing red baseline, measured before any edit and unchanged by this work: the uncommitted working tree already had **5 typecheck errors** and **2 failing tests**. Three type errors are `useGrouping: "always"` in the `formatHu*` helpers (valid ES2023, not in the installed TS lib); one is an orphaned `selectedPendingActionId` state whose reader was removed; one is an unused `onBack` in `TutorialsFlow.tsx`. The two test failures are `SHOW MORE` matching multiple elements after the Learn topics were expanded. `useGrouping` does not exist in `HEAD`, so these arrived with the uncommitted work, not with this refactor. They were deliberately preserved rather than silently fixed.
- Method: extraction was done with a scripted byte-exact declaration mover rather than by retyping, and every step was gated on typecheck. A verification script then compared all 178 original top-level declarations against their new homes.
- Extracted (pure moves, `KidsMarketHomeApp.tsx` 9,292 -> 2,724 lines, -70.7%):
  - `sk/data.ts`, `sk/SkBulbankScreens.tsx`, `sk/ConceptShell.tsx` — the entire non-HU tree.
  - `hu/types.ts`, `hu/data.ts`, `hu/learnTopics.ts`, `hu/money.ts`, `hu/learnArtwork.ts`, `hu/merchantLogos.tsx`, `hu/goals.tsx`, `hu/transactions.tsx`, `hu/cardDetails.tsx`, `hu/chrome.tsx`, `hu/learnScreens.tsx`.
  - The 20 Learn PNG imports moved into `hu/learnArtwork.ts` as `@/assets/...`; the card/profile images moved with the components that use them.
  - `KidsMarketHomeAppProps` was moved below the import block (it previously sat between two import groups).
- Compatibility preserved: the default export and the `hu/cards` + `hu/theme` re-exports at the top of `KidsMarketHomeApp.tsx` are untouched, so `tests/screens/hu-kids-domain-boundaries.test.ts` and `tests/screens/kids-market-home.test.tsx` keep importing from the same path.
- Added: `tests/screens/sk-kids-tree.test.tsx`, because the only committed test that renders SK fails earlier on an unrelated HU assertion, leaving the 817 moved SK lines unguarded.
- Self-review pass after the split, driven by static checks rather than reading:
  - An unused-export scan found three types (`HuPendingActionFlow`, `HuPendingActionStatus`, `HuTaskStatus`) that the mover had exported even though the original kept them module-private. They were returned to non-exported, restoring exact parity with the original.
  - `hu/data.ts` had simply inherited the monolith at 2,932 lines, so the Learn curriculum was split into `hu/learnTopics.ts` (2,478 lines) and `hu/data.ts` dropped to 461.
  - `hu/learn.ts` was renamed `hu/learnArtwork.ts`; alongside `learnTopics.ts` and `learnScreens.tsx` the three Learn modules now say what they hold.
  - The last relative asset import in the dispatcher (`../../../assets/kids/figma/hu-sun-emoji.png`) was normalised to `@/assets/...`, so every Kids asset import uses the alias.
  - Dead code found but deliberately not deleted: `HuSmartHero` and four `concept.style === "hu-smart-fintech"` branches inside `sk/ConceptShell.tsx` are unreachable, because the dispatcher returns `HuCeeLightRestyleApp` before `ConceptHero` renders. Logged as its own task; retiring a concept surface is a product decision.
- Verification: typecheck **5 errors (identical to baseline, relocated with their code)**; ESLint clean; **232 passed / 2 failed (234)** with the same two pre-existing failures and one new passing SK test; production build passes and the `KidsMarketHomeApp` chunk is 280.03 kB vs 280.02 kB before; all six audits pass. Structural proof: 177 of 178 declarations byte-identical, 0 missing, 0 added, 0 new declarations; the single delta is `KidsMarketHomeAppProps`, whose body is identical and whose only change is the deliberately removed trailing `./shared/money` import. A line-level conservation audit reports only those 3 intentionally deleted comment lines. An import-cycle scan over all 17 kids modules reports no cycles.
- Limitations:
  - Browser smoke was not performed: the local dev gate asks for a password and entering credentials is out of bounds for the agent. Coverage rests on the automated evidence above, including the new SK render test.
  - The 5 typecheck errors and 2 test failures from the uncommitted work are still open and are not this refactor's to close.
- Working-tree safety note: a mistaken `git stash push` early in the session removed the uncommitted changes for one step. They were restored with `git stash pop` and every one of the 5 modified files was confirmed byte-identical to a pre-refactor backup kept outside the repo. Nothing was lost.
- safe to resume: yes.

## 2026-07-15 Product Health Publication Closeout

- Latest request handled: commit every intentional workspace change, push `main` to GitHub, and publish the verified product-health hardening build to Vercel production.
- Access configuration: Vercel Production now stores `ACCESS_PASSWORD` and an independently generated `ACCESS_COOKIE_SECRET` as sensitive environment variables. The requested password remains local/Vercel configuration only; `.env.local` stays ignored and no credential is committed.
- Asset guard correction: the first full verification exposed that the new asset audit hashed platform-specific worktree line endings. `scripts/audit-assets.mjs` now hashes Git-filtered canonical asset bytes, including unstaged content, and `tests/audits/asset-audit.test.mjs` covers Windows CRLF versus canonical Git bytes. The baseline is the reproducible canonical manifest for the same 159 assets at `453e7e2`; no PNG, JPG, SVG, or other asset file was edited.
- Files changed: `scripts/audit-assets.mjs`, `scripts/asset-baseline.json`, `tests/audits/asset-audit.test.mjs`, and closeout handoff documentation only.
- Verification: `npm run verify` passed after the guard correction: typecheck, ESLint, 38 test files / 233 tests, all six audits, and the Vite production build (3,918 modules). `npm run audit:assets` reports 159 assets, 123 referenced assets, 36 review-only candidates, four exact duplicate groups, and canonical aggregate `2452305fa59ecd0691d15d0a0b4540e85cd6326ddd96461f31dd3767ea0e13db`. Existing empty `react-vendor` and >500 kB chunk warnings remain triaged.
- Banana Loop: the broken cross-platform asset hash was fixed rather than bypassed; the production access variables are configured rather than relying on source fallback; all image candidates remain review-only; no image was changed, removed, converted, or recompressed.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after commit, push, production deployment, and post-deploy access smoke complete.

## 2026-07-15 Product Health Hardening Closeout

- Scope: completed the approved nine-direction hardening pass on isolated branch `codex/product-health-hardening`, preserving the original workspace and keeping each direction independently revertible.
- Outcomes: stakeholder access hardened; reproducible type/lint/test/audit/build gates added; TypeScript and ESLint reduced to zero errors; navigation centralized and typed; product UI/repositories aligned to one scenario authority; disappearing product routes recover safely; CZ Chat orchestration extracted from `App.tsx`; HU Kids theme/card domains extracted; panel menu duplicates consolidated; Investments made non-empty-safe and moved to semantic colors.
- Asset/PNG safety: no tracked raster/vector asset changed from baseline `453e7e2`. `npm run audit:assets` inventories 159 assets and now fails closed if any tracked image path/blob differs from `scripts/asset-baseline.json`. The 36 conservative unreferenced candidates and four duplicate groups were reported only; nothing was deleted, converted, or recompressed.
- Verification: `npm run typecheck`, `npm run lint`, 38 test files / 231 tests, `npm run audit:all`, `npm run build` (3,918 modules), and `git diff --check` passed. The first aggregate run exposed one stale `Data Snapshot` audit literal; `ef5c106` aligned it and the audit rerun passed.
- Browser smoke: CZ Home, CZ Card Detail, RO Investments, HU Kids Home, and CZ Future loaded on a fresh local server with meaningful screen content, no Vite overlay, and no browser warning/error logs.
- Revert evidence: `docs/handoff/product-health-revert-map.md` maps every direction to its independent commits.
- Limitations: the existing empty `react-vendor` and >500 kB App chunk warnings remain triaged. Asset candidates require explicit visual approval before any future deletion/compression.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes.

## 2026-07-15 Mobile PI Card Details Face ID and Figma Alignment

- Latest request handled: make `SHOW CARD DETAILS` work globally as a gated Face ID reveal and then show the Figma Card details screen for all Mobile PI debit and credit cards.
- Runtime changes: both `SHOW CARD DETAILS` and the Card Details quick action now start shared `FaceIdAnimation`; only its completion routes to the selected card. The destination reuses `PageHeader` and maps Card number, Card CVV2/CVC2, Card holder, and Card validity. The Card number copy action writes the unmasked value through the shared clipboard hook and shows the same bottom toast used by Account Details.
- Data changes: debit and credit products now carry mock cardholder/CVC fields; generated card-count variants receive deterministic values so the complete flow remains valid for all eight Mobile PI countries and scenario combinations.
- Figma evidence: Meniga Harmonization Design System `FKbbStgBIP9bFAMl3DPKHF`, node `7375:10660`.
- Files changed: `src/app/screens/cards/CardDetailScreen.tsx`, `src/app/screens/cards/CardDetailsInfoScreen.tsx`, `src/hooks/useProducts.tsx`, `src/data/products.ts`, `src/app/components/icons/AppIcon.tsx`, `scripts/audit-card-details-flow.mjs`, `package.json`, and the linked handoff/spec/plan documents.
- Verification: `npm run audit:card-details`, `npm run build` (3,910 modules), `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. Build retains the already-triaged empty `react-vendor` and large-chunk warnings.
- Limitation: the Face ID gate and card data are mock front-end behaviour; no biometric verification, secure card-data API, or persistence is implied.
- Banana Loop: the only remaining build warnings are already triaged in `known-bananas.md`; no untracked temporary outputs remain outside the intentional audits, copy primitives, and implementation/spec documents.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-15 Investments Portfolio Financial Consistency

- Latest request handled: make the mocked Investments holdings genuinely reconcile across Performance, Product Type, Currency, Asset Class, Account List, product detail and History for every Mobile PI country/application variant.
- Runtime changes: one canonical portfolio now creates 12 owned securities: 10 active positions (four Funds, two Bonds, two Stocks, one ETF and one Money market) and two zero-balance inactive legacy positions retained for demo coverage. Every active position carries a deterministic instrument market price, derived quantity, local portfolio value and return. Performance totals/chart and all four distribution tabs consume exactly those active positions; inactive positions remain visible only in the inactive accordion/catalogue and do not affect financial aggregates or history.
- Guardrail: `npm run audit:investments` loads the TypeScript portfolio builders through Vite SSR for `RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, and `SI`; it checks counts, local total reconciliation, price × quantity, inactive zero balance, distribution totals/percentages, and Product Type counts.
- Files changed: `src/app/config/investmentsPortfolioConfig.ts`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, `scripts/audit-investments-portfolio.mjs`, `package.json`, `docs/superpowers/specs/2026-07-15-investments-portfolio-consistency-design.md`, `docs/superpowers/plans/2026-07-15-investments-portfolio-consistency.md`, and handoff/capability documentation.
- Verification: `npm run audit:investments` passed (`countries=8 active=10 inactive=2`); `npm run audit:templates`, `npm run audit:platform`, `npm run build` (3,908 modules), and `git diff --check` passed. Local dev server responded with HTTP 200 on port 4001; automated in-app-browser reload was blocked by the browser URL policy, so no policy workaround was used. The already-triaged empty `react-vendor` and large-chunk Vite warnings remain non-blocking.
- Limitation: all investment values remain deterministic front-end mock data; no market feed, trading execution, or persistence is implied.
- safe to resume: yes

## 2026-07-15 Investments Distribution Controls Publication

- Latest request handled: include every current workspace change in Git and publish the updated application to Vercel production.
- Runtime scope: four-item Investments distributions now keep a stable two-labels-left/two-labels-right connector layout; sorting chips are centered; and the shared History/To approve/Download Report/Invest action bar is available below both Performance and distribution charts.
- Files changed: `src/app/components/investments/InvestmentDistributionChart.tsx`, `src/app/components/investments/InvestmentFilterChips.tsx`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, plus handoff/capability documentation.
- Verification commands: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. Build transformed 3,908 modules; the known empty `react-vendor` and large-chunk warnings remain triaged.
- Publication result: product commit `8fb1831` was pushed to `origin/main`; Git-integrated production deployment `dpl_GciexcyciAbjBhUw2dEMwHFcYh9w` reached `READY` with no alias error and serves the canonical `https://mobile-banking-cee.vercel.app`. This result is recorded in a final handoff commit that is pushed and production-verified again before the user-facing closeout.
- Limitation: Investments data and approval/download/invest actions remain mock/demo behavior unless their existing local navigation explicitly handles the action.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-15 Complete Workspace Checkpoint

- Latest request handled: commit every tracked and untracked change in the current workspace so the repository is clean at the current reviewed version.
- Scope intentionally included: global Mobile PI Card Options/Card Details alignment, the registered card-option SVG inventory, HU Kids transaction/card-management enrichment, and the HU Kids photographic frozen-card state with its CC0 asset/license and related handoff/capability documentation.
- Decisions: preserve all operator-approved changes as one coherent checkpoint on `main`; do not discard or split existing work; do not push, deploy, tag, or release because none of those actions were requested.
- Verification commands: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed on 2026-07-15. Build evidence: 3,908 modules transformed; template audit reports 47 templates/47 code previews/79 components/27 screens/14 flows; platform audit reports 3 products/8 countries/24 project packs/7 banking scenarios/6 repositories.
- Limitations: Card Options rows and HU Kids Block/Unblock remain front-end mock interactions without backend execution or persistence. Vite still reports the already-triaged empty `react-vendor` chunk and large-chunk warning; the 2.09 MB frost photo is tracked under the asset-size banana for a future non-visual optimization pass.
- Banana Loop: no untracked temporary files or hidden scope were found; existing bundle/asset warnings remain visible in `known-bananas.md`, and the frost optimization follow-up is recorded in `next-tasks.md`.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

- safe to resume: yes

## 2026-07-14 Global Card Options Figma Alignment

- Latest request handled: align Mobile PI Card Options with the RO Enablers credit/debit references for every supported country.
- Runtime changes: removed the card artwork/name/number block; replaced the placeholder menu with the exact shared, credit-specific, and debit-specific option sets; removed dividers between option rows; and restored the shared 14px `SectionHeadingDivider` for `GENERAL SETTINGS`.
- Design System changes: added the exact supplied Apple Pay, Mastercard, Card registrations, Card limits, Change card name, Card delivery address, and Reissue card SVGs to `AppIcon`. All seven icons are exposed through the Design System icon inventory.
- Card detail polish: the shared `SHOW CARD DETAILS` action now has 24px vertical padding so it no longer crowds the amount and quick-action rail.
- Files changed: `src/app/screens/cards/CardOptionsScreen.tsx`, `src/app/screens/cards/CardDetailScreen.tsx`, `src/app/components/icons/AppIcon.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. In-app browser smoke confirmed the exact debit and credit row sets, native 22/32px icon viewBoxes, zero row separators, standard 14px section heading, no card identity artwork, exact Change card name path, 24px top/bottom Card Details CTA padding, and no browser errors.
- Limitation: rows remain navigation-preview entries until each downstream product workflow and data contract is specified.
- safe to resume: yes

## 2026-07-14 Closeout And Vercel Publication

- Latest request handled: commit the complete current workspace and publish the latest build to Vercel production.
- Scope: all currently tracked and untracked product, Design System, Investments, card, filter-sheet, chatbot, and handoff changes were intentionally included; no unrelated files were discarded.
- Verification before publication: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check` passed. Known Vite empty `react-vendor` and chunk-size warnings remain documented in `docs/handoff/known-bananas.md`.
- Publication: the latest `origin/main` commit is live on Vercel production; canonical URL is `https://mobile-banking-cee.vercel.app`.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-13 Investments Portfolio Header Safe-Area Regression

- Latest request handled: restore the Investments portfolio header's normal initial state and keep the compact title below the phone system bar while scrolling.
- Runtime changes: shared `PageHeader` now keeps the sticky header anchored at `top: 0` and applies the phone top reserve inside the header; this removes the duplicated offset that created the large blank block while preserving scroll collapse.
- Files changed: `src/app/components/PageHeader.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check`; in-app browser smoke confirmed the initial large left title, centered compact title after scroll, and no warning/error logs.
- safe to resume: yes

## 2026-07-13 Account Filter Sheet And Card Details/Options Foundation

- Latest request handled: align the account transaction filters sheet to the shared safe-area bottom-sheet geometry, repair the Connected cards heading, and add reusable debit/credit Card details and Card options routes for all supported countries.
- Runtime changes: account filters now use the standard 54px top reserve; Account Details Info reuses `SectionHeadingDivider`; CardDetail quick actions route to safe-area `CardDetailsInfoScreen` and `CardOptionsScreen`, preserving selected-card context and masking sensitive values.
- Files changed: `src/app/screens/accounts/AccountTransactionFiltersSheet.tsx`, `src/app/screens/accounts/AccountDetailsInfoScreen.tsx`, `src/app/screens/cards/CardDetailScreen.tsx`, `src/app/screens/cards/CardDetailsInfoScreen.tsx`, `src/app/screens/cards/CardOptionsScreen.tsx`, `src/app/App.tsx`, `src/app/contexts/NavigationContext.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check`; in-app browser smoke confirmed the filters sheet clears the system bar and both debit/credit Card Details and Card Options routes render without browser warning/error logs.
- Limitation: Card option rows are intentionally presentational until the user provides the exact product behaviors and data model.
- safe to resume: yes

## 2026-07-13 Tutorial Detail Bottom-Sheet Header Alignment

- Latest request handled: repair the More -> Tutorials detail bottom-sheet header so it no longer overlaps the phone system/status bar and uses the correct shared back glyph.
- Runtime changes: `TutorialsFlow` anchors the detail sheet at `--uc-phone-top-reserve` with a 54px fallback and renders the header back action with the shared `back-heavy` icon at 20px; tutorial content and navigation remain unchanged.
- Files changed: `src/app/screens/more/tutorials/TutorialsFlow.tsx`, handoff/capability docs.
- Verification: `npm run build`, `npm run audit:templates`, `npm run audit:platform`, and `git diff --check`; in-app browser smoke confirmed the header clears the status bar, the standard icon/viewBox is used, and no warning/error logs were reported.
- safe to resume: yes
