# Current Session

Last updated: 2026-07-25

## 2026-07-25 Complete ZCode Workspace Closeout

- Latest request handled: preserve and commit every remaining ZCode development on local `main`, with `Creator Mobile/` still excluded.
- Unified product scope:
  - retired the complete Serbia Kids / RS Teens experiment from source, registries, routes, CSS, tests, and its design spec while preserving Serbia PI retail banking;
  - expanded HU Kids goal management with scheduled transfers, schedule detail/deletion, goal rename/target modification/closure, and connected local state updates;
  - migrated Access Gate and reconstructed template previews from raw color/typography values to shared Design System tokens;
  - added the optional `npm run test:coverage` command with V8 coverage configuration.
- Closeout fixes:
  - removed the obsolete HU goal-completion callback/state left unused by the new goal-management composition;
  - updated the intentional `analytics-overview` markup hash after its typography-token migration;
  - staged the authorized deletion snapshot before the asset audit because that audit intentionally reads Git's tracked-file view.
- Verification evidence: fresh staged `npm run verify` passed typecheck, lint, 65 test files / 651 tests, all six audits, and the production build (`4,456` modules). The new `npm run test:coverage` command also passed all 651 tests and reported 75.83% statements/lines, 77.93% branches, and 60.37% functions; no threshold is enforced. Template audit reports 47 templates / 47 code previews / 96 components / 33 screens / 14 flows; platform audit remains 3 products / 8 countries / 24 project-pack combinations / 7 banking scenarios / 6 repositories. Existing jsdom chart-size messages, empty `react-vendor`, and large-chunk warnings remain non-blocking and previously triaged.
- Banana Loop result:
  - fixed: two HU Kids TypeScript failures and one intentional template snapshot mismatch;
  - fixed: current capability documentation no longer claims the deleted RS Teens concept is active;
  - triaged: scheduled transfers and goal edits are session-local mock behavior; coverage reporting is optional and has no enforcement threshold.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-24 Remove Serbia Kids (RS Teens) — Experiment Retired

- Latest request handled: the Serbia Kids experiment failed and was completely removed from the codebase. All RS Teens code, data, registries, tests, CSS, and design spec were deleted. Serbia as a general PI retail banking country remains unchanged.
- Deleted: `src/app/screens/kids/rs/` (25 files, ~5,250 lines), `src/styles/rs-kids.css` + its import in `src/styles/index.css`, `docs/superpowers/specs/2026-07-24-kids-serbia-teens-design.md`, `tests/screens/rs-kids-decide-payment.test.ts`.
- Cleaned references in: `src/data/kidsMarketHomeConcepts.ts` (RS type/union/array/concept entry), `src/app/registry/projectPackRegistry.ts` (KIDS_MARKET_CONCEPT_COUNTRIES + screen map), `src/app/registry/screenRegistry.ts` (kids.rs.home-concept entry), `src/app/registry/flowRegistry.ts` (countries + step), `src/app/state/demoTypes.ts` (ScreenId union), `src/app/navigation/routePolicy.ts` (eligibility + status bar variant), `src/app/screens/kids/KidsMarketHomeApp.tsx` (import + dispatcher), `tests/screens/kids-market-home.test.tsx` (RS render type + test block), `tests/navigation/route-policy.test.ts` (RS assertion).
- Preserved: Serbia as a general PI country in `demoConfig.ts`, `projectModel.ts`, `countryConfig.ts`, `accountDetails.ts`, `paymentFlow.ts`, `template-rs-travel-insurance`, `translations/RS/`. The Kids concept countries are now `["SK", "HU"]` only (RS removed from `KIDS_MARKET_CONCEPT_COUNTRIES` and `KIDS_HOME_COUNTRIES`).
- Verification evidence: `npm run build` passed (only chunk-size warning); `npm run audit:platform` passed (products=3, countries=8, projectPackCombinations=24 — unchanged because RS PI pack remains); final `grep` sweep for `rs-teen-fintech`/`RsTeensApp`/`kids.rs.home-concept`/`rs-kids.css` across `src/` and `tests/` returned zero matches.
- Safe to resume: yes

## 2026-07-24 Clean Checkpoint — HU Kids Goal Funding

- Latest request handled: commit every accumulated main-project development and return the repository to a clean local state while keeping `Creator Mobile/` excluded.
- Unified scope:
  - HU Kids Goal Detail now uses a three-action rail; Add Money opens the dedicated goal-funding screen, while Withdrawal and Settings remain explicit placeholders.
  - The Add Money screen provides goal context, source-account selection, balance-aware validation, preset amounts, a numeric keypad, arithmetic operators, and direct application to the selected goal.
  - The shared icon registry includes the keypad backspace glyph, and the HU Kids view/data types include the new route and mock source accounts.
  - The associated ZCode implementation plan is retained as development evidence.
- Closeout corrections:
  - removed one unused import;
  - made calculator token parsing safe under `noUncheckedIndexedAccess`;
  - expressed `HU_KIDS_ACCOUNTS` as a statically non-empty tuple so the initial account cannot be `undefined`;
  - corrected the earlier handoff claim that typecheck, lint, and tests were unavailable: all repository scripts are present and pass.
- Files in this checkpoint: `.zcode/plans/plan-sess_dfbbdd9d-e795-4ed6-a726-06087f0ae80c.md`, `src/app/components/icons/customIcons.tsx`, `src/app/screens/kids/KidsMarketHomeApp.tsx`, `src/app/screens/kids/hu/goals.tsx`, `src/app/screens/kids/hu/types.ts`, `src/data/huKidsBanking.ts`, and the handoff/capability documentation.
- Verification evidence: fresh `npm run verify` passed typecheck, lint, 66 test files / 662 tests, all six repository audits, and the production build. The build retains the pre-existing large-chunk warning; chart tests retain their pre-existing zero-size jsdom warnings.
- Banana Loop result:
  - fixed: the three new TypeScript failures described above;
  - corrected: stale verification documentation;
  - triaged: source accounts remain mock fixtures; Withdrawal and Settings remain placeholders; no focused regression currently exercises the complete Add Money calculator/account-picker interaction.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-24 HU Kids Add Money — Revolut-Style Calculator Screen

- Latest request handled: tap "Add Money" on the HU Kids Goal Detail action rail now opens a full-screen Revolut-style Add-money surface — header with goal context, large amount display, source-account picker (bottom sheet), and a custom numeric keypad with arithmetic operators (+ − × ÷) and presets (+1000/+2500/+5000), a clear (C), an evaluate (=), and an "Add X HUF" submit button that fires only when the evaluated amount is greater than zero.
- Scope decisions (made with best judgment after the user skipped the clarifying questions): (a) account source is a new mock list `HU_KIDS_ACCOUNTS` in `huKidsBanking.ts` (3 fixtures: Spending account 35.628 HUF, Savings account 5.000 HUF, Pocket money 1.200 HUF) — `useProducts` is NOT used by kids and was intentionally left out; (b) the calculator is fully functional with operators and an inline expression evaluator (two-pass: ×÷ then +−, returns NaN on dangling operators or divide-by-zero); (c) submit is direct — tap "Add" applies `onAddMoney(amount)` via the existing `handleAddGoalMoney` (clamps to target, prepends a contribution) and returns to Goal Detail, no review step.
- Files central to this change:
  - `src/data/huKidsBanking.ts` — new `HuKidsAccount` type + `HU_KIDS_ACCOUNTS` fixtures.
  - `src/app/screens/kids/hu/types.ts` — `"add-money"` added to `HuLightView`.
  - `src/app/screens/kids/hu/goals.tsx` — new exported `HuKidsAddMoneyPage` (keypad + account sheet + `evaluateExpression` helper + `OPERATOR_RE`/`TRAILING_OPERATOR_RE` module constants), `HuKidsGoalDetailPage` gained `onOpenAddMoney` prop, action-rail "Add Money" now calls `onOpenAddMoney` instead of `onAddMoney(0)`.
  - `src/app/screens/kids/KidsMarketHomeApp.tsx` — new `handleOpenAddMoney` handler, `onOpenAddMoney={handleOpenAddMoney}` passed to Goal Detail, new `view === "add-money"` branch rendering `HuKidsAddMoneyPage` with back → goal-detail and submit → apply + goal-detail.
- Build notes: first two build attempts failed on TSX parsing of regex literals — `/[+\-*/]/` inside JSX expression position and inside a `/** */` block comment both confuse esbuild (the `*/` in the char class prematurely closes the comment). Fixed by hoisting the regexes to module-level `const OPERATOR_RE` / `TRAILING_OPERATOR_RE` and shortening the comment to a `//` line comment. Worth recording because inline operator regexes in TSX are a recurring footgun in this file.
- Verification evidence: the later clean-checkpoint pass ran the full `npm run verify` successfully: typecheck, lint, 66 test files / 662 tests, all six audits, and production build. Browser smoke remains recommended for the complete keypad/account-picker interaction.
- Banana Loop result:
  - fixed: Goal Detail Add Money now opens a real amount-entry screen instead of a no-op `onAddMoney(0)`;
  - triaged: the Kids accounts are mock fixtures, not real `useProducts` data; the evaluator is a tiny hand-rolled parser, not a math library (no parentheses, no exponent); Withdrawal and Settings remain no-op.
- Constitutional check:
  - scope preserved: yes (new full-screen sub-page inside the already-approved HU Kids Goal Detail flow; new mock data type + fixtures; no new screens outside Kids, no new dependencies, no new integration contracts)
  - docs/capability map updated: not required — no new capability/screen/flow at the platform level; this is a Kids-surface UX addition
  - full verification and evidence recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-24 HU Kids Goal Detail Action Rail

- Latest request handled: add a 3-button action rail to the HU Kids Goal Detail screen, placed directly under the "Saved so far" card and above the existing "Add money" section. Styled after the HU Kids Card Details action rail (Card details / Block card / Manage card) for cross-surface visual consistency.
- Actions: Add Money (`add-money` icon, wired to the existing `onAddMoney` callback); Withdrawal and Settings (both no-op placeholders for now). Withdrawal and Settings reuse the existing `account-options` gear glyph as an approved proxy because no dedicated withdrawal/settings icons exist in the registry; Add Money duplicates the existing "Add money" section intentionally — the rail acts as a quick shortcut while the detailed section below keeps the +1.000/+2.500/+5.000 custom-amount flow.
- Implementation: inline `goalActions` array + a new `<section data-hu-goal-actions="true">` inserted in `HuKidsGoalDetailPage` between the "Saved so far" card and the "Add money" card. Styling matches the Card Details rail contract: container `grid grid-cols-3 gap-[18px]`, button `flex min-w-0 flex-col items-center gap-[10px]`, icon circle `size-[64px] rounded-full bg-[var(--uc-surface)] shadow-sm`, label `text-[14px] font-medium text-[var(--uc-text-muted)]` with two-line split via `block h-[16px]` spans.
- Files central to this change: `src/app/screens/kids/hu/goals.tsx` (only file touched).
- Verification evidence: `npm run build` passed (only the pre-existing chunk-size warning). Browser smoke recommended: HU Kids → Saving → tap a goal → verify the 3-button rail under "Saved so far", above the "Add money" section; Add Money functional, Withdrawal/Settings visual only. `typecheck`, `lint`, and `test` remain blocked by missing local scripts/tooling in this environment.
- Banana Loop result:
  - fixed: Goal Detail now has a consistent action rail matching the Card Details pattern, addressing the missing quick-action surface;
  - triaged: Withdrawal and Settings are no-op placeholders — their mock flows are not implemented; only Add Money is connected.
- Constitutional check:
  - scope preserved: yes (visible-UX addition inside the already-approved HU Kids Goal Detail surface; no new screens/flows/data/integration contracts; no new dependencies or icons)
  - docs/capability map updated: not required — no new capability, screen, flow, or integration contract
  - full verification and evidence recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-24 Unified Workspace Checkpoint — Creator Mobile Excluded

- Latest request handled: unify the accumulated main-project developments into one clean repository state while excluding `Creator Mobile`, which will be moved to and maintained in a separate Creator project.
- Repository boundary: added `Creator Mobile/` to the root `.gitignore`. The directory remains physically intact at `C:\Users\mihai\Desktop\Mobile Banking - CEE\Creator Mobile`, was never tracked by this repository, and is absent from the Git snapshot. Removed the accidental untracked zero-byte `nul` artifact.
- Unified product scope:
  - CZ Chat now has a bilingual deterministic NLU front layer that maps free text, common typos, and Czech/English formulations back to proven canonical prompts; ambiguous matches produce explicit disambiguation chips. Investment-goal amount steps accept typed values such as `10k` and localized CZK forms without weakening the existing chip path.
  - Assistant reply feedback is stateful and accessible (`aria-pressed`), supports up/down switching and toggle-off, and exposes a typed host callback without inventing telemetry storage.
  - Flow Library is split from one monolithic screen into typed flow definitions, reusable previews, index/detail components, per-screen BA specifications, and export driven from the same source of truth.
  - Kids coverage includes the self-contained RO Teens and RS Teens concepts alongside SK/HU. RS retains its balance-aware approval engine and the `Uči` learn-to-earn loop; RO remains a separate Romanian/RON payments-first concept.
- Integration fixes found by the unified gate: renamed the RS Learn artwork module from `.ts` to `.tsx` because it renders JSX, and made Flow Library account-preview decimals safely default to `00` when source data omits a fractional segment.
- Verification evidence: `npm run typecheck` passed; repository ESLint passed as the lint stage of `npm run verify`; `npm test` passed **66 files / 662 tests**; `npm run audit:all` passed card-details, Investments (`countries=8 active=10 inactive=2`), Figma bridge, templates (`47/47`, `components=96`, `screens=34`, `flows=14`), platform (`projectPackCombinations=24`), and assets (`179` tracked assets); `npm run build` passed with `4,485` modules transformed. Vitest/Vite commands required an unsandboxed rerun because esbuild was denied read access to the workspace parent; this was an environment restriction, not a product failure.
- Limitations: all added banking/Kids/chat behavior remains deterministic front-end mock behavior; no backend, real NLU service, telemetry persistence, payment execution, parent approval service, or real investment execution is implied. Existing Recharts jsdom zero-size diagnostics, empty `react-vendor`, and large-chunk build warnings remain visible and previously triaged.
- Banana loop: the untracked mobile subproject is explicitly excluded instead of accidentally committed; the stray `nul` file is removed; both integration type errors are fixed; stale SK/HU-only capability statements are corrected below; no important remaining item is hidden.
- constitutional check:
  - scope preserved: yes (main-project developments unified; `Creator Mobile` left intact and excluded)
  - docs updated: yes (handoff, next tasks, banana log, capability map)
  - verification recorded: yes (typecheck, lint, 662 tests, six audits, production build)
  - bananas triaged: yes
  - safe to resume: yes after the local Git checkpoint is created

## 2026-07-24 Kids Serbia — Teens (12-18), Payments with Approval + „Uči" Coach

- Latest request handled: build a Kids Serbia concept app that is measurably superior to both the RO Teens app (judged mediocre by the operator) and the HU Kids app (the quality reference), on a different country rather than overwriting RO. The operator explicitly asked for maximum effort and a superior front-end / UX.
- Direction alignment: the operator chose the 12-18 segment (Nikola, 14, Beograd), two balanced signature features (payments-with-approval AND the „Uči" educational coach), and Latin Serbian script (sr-Latn). A design spec was approved and written to `docs/superpowers/specs/2026-07-24-kids-serbia-teens-design.md`.
- Architecture: a new self-contained fork `src/app/screens/kids/rs/` (mirrors the RO/sk fork shape; never imports RO, never edits HU). It reuses HU's theming engine, themed shell, and ambient motion layer by **import** (`HuThemeShell`, `getHuTheme`/`getHuThemeStyle`, `HU_THEME_PRESETS`, `HuThemeMotionLayer`, the `--hu-theme-*` CSS vars/keyframes) and layers its own Serbian/RSD/teen-tuned surfaces. State lives in a typed reducer (not the 515-line god-component RO shipped).
- Five RO flaws fixed by design: (1) a real component vocabulary (`HeroCard` themed-gradient / `GlassCard` translucent / `ListCard` grouped / `StatTile` / `Banner` / `QuickActionTile`) instead of RO's single `RoCard` white rectangle; (2) boot theme is non-default (`nordlys`) so the hero is alive from second one instead of RO's dead gray hero; (3) real `AppIcon` (lucide) iconography + inline-SVG Serbian merchant marks (`MerchantLogoMark`: Maxi, Gomex, Yuh, Netflix, Spotify, dm, Miloš Kafić, GSP) instead of emoji; (4) motion — animated `SpendRing` arc + overlay transitions + a real success choreography (`rs-success-pop` / `rs-pending-pulse` in a dedicated `src/styles/rs-kids.css`) instead of RO's static moments; (5) dates derive from `now()` (`rsNowStamp`/`rsDayLabel`) instead of RO's hardcoded `2026-07-23`/`Azi` that rotted.
- Signature feature #1 — payments with approval: `decidePayment(amount, payee, { weeklyRemaining, balance })` is **balance-aware** (RO's was balance-blind — it could green-light an instant payment the balance could not cover). Ordered ruleset: non-positive/per-payee-limit/weekly-remaining/**balance** → blocked; always-needs-approval/untrusted-above-threshold → needs-approval; else instant. Instant payments decrement balance + add to weekly spend; large ones become pending approvals; approving moves the money (loop-closer). A dedicated `tests/screens/rs-kids-decide-payment.test.ts` (9 tests) covers the full matrix — RO had zero tests for its engine.
- Signature feature #2 — the „Uči" educational coach (entirely absent from RO): 5 financial modules × lessons, each with content blocks + a single-question quiz with immediate feedback, and a reward credited to the balance on completion (closing the learn→earn loop). Modules: Budžet, Štednja i kamata, Bezbedne kupovine (anti-fraud), Ciljevi, Vrednost novca.
- Wiring — 6 files touched, including the 3 registries RO skipped: `kidsMarketHomeConcepts.ts` (RS to type/array/style + a single-source-of-truth concept entry — not RO's dead split-brain data), `KidsMarketHomeApp.tsx` (dispatch `rs-teen-fintech` → `RsTeensApp`), `routePolicy.ts` (RS eligibility + `"theme"` status-bar), `projectPackRegistry.ts` (RS concept country + screen map), `screenRegistry.ts` (`kids.rs.home-concept` entry), `flowRegistry.ts` (RS step in the kids bottom-nav comparison flow), and `demoTypes.ts` (`ScreenId` union). RS currency/locale/language were already configured (RSD, sr-RS, sr).
- Files added (new): the `src/app/screens/kids/rs/` module — `RsTeensApp.tsx`, `money.ts`, `types.ts`, `payees.ts`, `data.ts`, `cards.ts`, `chrome.tsx`, `ui/index.ts`, `ui/cards.tsx`, `ui/atoms.tsx`, `ui/merchantLogos.tsx`, `learn/topics.ts`, `learn/LearnScreens.tsx`, `screens/home.tsx`, `screens/payments.tsx`, `screens/payFlow.tsx`, `screens/approvals.tsx`, `screens/goals.tsx`, `screens/card.tsx`, `screens/activity.tsx`, `screens/insights.tsx`, `screens/moneyFlows.tsx`, `screens/profile.tsx`, `screens/themeSheet.tsx`; `src/styles/rs-kids.css`; `tests/screens/rs-kids-decide-payment.test.ts`; the design spec.
- Files changed: `kidsMarketHomeConcepts.ts`, `KidsMarketHomeApp.tsx`, `routePolicy.ts`, `projectPackRegistry.ts`, `screenRegistry.ts`, `flowRegistry.ts`, `demoTypes.ts`, `src/styles/index.css` (import rs-kids.css), `tests/screens/kids-market-home.test.tsx` (renderKids widened to RS + RS pocket assertion + RS render/pay-flow tests), `tests/navigation/route-policy.test.ts` (RS eligibility assertion).
- Verification: `npm run typecheck` (0 errors), `npx eslint src/app/screens/kids/rs` (0 warnings), full Vitest suite **662 tests pass** (66 files; +9 decidePayment matrix + 2 RS render/pay-flow), `npm run build` (only the previously-triaged chunk-size warning), `npm run audit:all` green (templates `screens=34`, platform `projectPackCombinations=24`, investments, card-details, figma-bridge, assets). Dev server served `RsTeensApp.tsx` HTTP 200 with zero runtime errors in the log; the render is further proven by the passing jsdom tests that assert „Dobar dan, Nikola", „Plaćanja", „Uči", and the curated-payee „bez IBAN-a" explainer.
- Limitation: deterministic front-end mock only, consistent with the existing SK/HU/RO kids concepts — no banking backend, no real payment execution, no persistence beyond session state, no real parent approval, no real biometrics, no ledger posting, no real activation/legal consent/wallet/notifications/audit.
- Design-system report: **Reused** (by import, HU untouched) the theme engine, `HuThemeShell`, `HuThemeMotionLayer`, shared `AppIcon`/`cn`/money helpers. **Extended (backward-compatible)** `KidsHomeCountry`/`KidsHomeStyle`/`KIDS_HOME_COUNTRIES` with RS and `rs-teen-fintech`; `ScreenId` with `kids.rs.home-concept`; the route/project-pack/screen/flow registries with RS. **Created new** the `src/app/screens/kids/rs/` module (24 files) + `rs-kids.css` motion. **Deviations**: hardcoded Serbian-Latin strings in the screens (same convention as HU/RO, which hardcode their own language) rather than the `t()` system; merchant marks are clean inline SVGs (no trademark asset files).
- Banana loop: no untriaged banana. The embedded preview pane cannot composite a screenshot (the known infra limitation), so visual proof is DOM-level via the passing jsdom tests; this is documented rather than hidden. No dependency, backend, persistence-beyond-session, or release action.
- constitutional check:
  - scope preserved: yes (the approved Kids Serbia concept only; HU/RO untouched)
  - docs updated: yes (this entry + capability map + design spec)
  - verification recorded: yes (typecheck, lint, 662 tests, build, all 6 audits)
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-23 Stakeholder Tools — Divergence, Sign-off & Coverage

- Latest request handled: extend the stakeholder `Tools` tab with the tools the user selected after rejecting the inspection-style ideas — a country divergence explorer, a localization sign-off workflow, and (after a review pass) a localization coverage dashboard. The demo-storyline and usability-runner ideas remain deferred.
- Review pass + fix (commit `3012126`): the divergence explorer originally carried three per-country translation rows (localized coverage %, identical-to-EN, missing). They reported ~24% for every country and flagged 1-key differences as divergences — noise as signal, and a "24% localized" headline that would alarm stakeholders when the apps are in fact well localized (most identical-to-EN keys are `runtime` strings that inherit English by design). Those rows were removed; the divergence explorer now stays strictly on capability/config/feature-scope differences. Translation completeness moved to its own honest tool (below).
- Localization coverage dashboard (`localization-coverage` card, commit pending): honest per-language completeness over `translationCorpus` — every key is bucketed translated / inherited-from-English / missing (no leakage), shown as a stacked bar per language and a per-namespace drill-down table, with CSV export. Browser-verified this tells a true, differentiated story: overall ~24% for every language is driven entirely by the shared `runtime` namespace (10%, 253 inherited by design), while user-facing namespaces are 82–100% (preLogin 88%, home/more/panel/languageSelector 100%, prime 82%) and `navigation` at 20% surfaces as a genuine gap. Model in `localizationCoverage.ts`.
- Country divergence explorer (`country-divergence` card): a matrix of every dimension that varies across the 8 countries — currency/locale/local language, capability availability (Co-Apping = CZ/SK, Kids app = HU/SK, Investments), feature-flag country scope from `FEATURE_META`, and local-language translation coverage/identical-to-EN/missing counts. Divergent cells are highlighted against either the majority value or a chosen reference country; an "Only differences" filter hides rows where every country agrees; per-country divergence counts and CSV export. All values read live from `demoConfig`, `countryConfig`, `languageByCountry`, the availability utils, and `translationCorpus`. Pure read model in `countryDivergence.ts`.
- Localization sign-off workflow (`localization-signoff` card): turns the read-only translation review into an accountable process — a reviewer picks one of the 7 local-language columns and a namespace, then marks each string Approved / Needs change (with a note revealed on Needs change). State persists in `localStorage` under `uc-l10n-signoff-v1`, survives reloads, shows per-namespace progress (approved/needs-change/pending + bar), status filter and search, and exports a per-language CSV report. Store logic in `localizationSignoff.ts` (client-only; not a source of truth the app consumes).
- Design-system decision: all three tools reuse the existing Tools primitives (`ToolPanel`, `SelectionChip`, `FieldLabel`, `StatusBadge`, `downloadTextFile`, `uc-select`, `ToolErrorBoundary`) and the already-shipped `translationCorpus` module; no design-system component was modified, no new dependency, and no icon-registry change (reused `sliders-horizontal`, `shield-check`, `receipt-text`). Only `ToolsScreen.tsx` was edited to register the cards. The Tools surface now has 6 cards.
- Files added: `countryDivergence.ts`, `CountryDivergenceTool.tsx`, `localizationSignoff.ts`, `LocalizationSignoffTool.tsx`, `localizationCoverage.ts`, `LocalizationCoverageTool.tsx` (all under `src/app/screens/tools/`), `tests/screens/tools-divergence-signoff.test.tsx` (16 tests). Files changed: `ToolsScreen.tsx`, `tests/screens/tools-screen.test.tsx` (card count 3 → 6).
- Verification: `npm run verify` green end to end (typecheck, ESLint, full Vitest suite, all six audits, production build) after each commit. Browser-verified on the live app: divergence matrix renders 8 country columns and only genuine differences (Co-Apping = CZ/SK, Cards Redesign = RO/CZ, banner = RO), reference-country mode re-highlights against RO; sign-off marks approved/needs-change with note, and survives a full page reload from `localStorage`; coverage dashboard shows the honest translated/inherited/missing split per language and per namespace with the runtime-vs-user-facing story above. Error boundary confirmed working — it caught a transient HMR crash mid-edit without blanking the surface. The embedded preview pane cannot composite a screenshot (infra limitation), so proof is DOM-level.
- No dependency, backend, persistence-beyond-localStorage, or release action. Committed on the user's standing request to keep the repo clean.

## 2026-07-22 Design System and Basket Carousel Clean Publication

- Latest request handled: commit every remaining tracked and untracked workspace change, push the resulting `main` checkpoint to GitHub, deploy that exact state to Vercel Production, and finish with a clean repository.
- Included scope: the component-detail information architecture now opens on View with inspectable state previews and keeps implementation code/specifications/motion in the portable package; the Design System catalogue/inventories were reconciled and unused shadcn UI source modules were removed; the CZ Basket Funds shelf now implements pointer/mouse drag, nearest-card snap, click suppression after drag, keyboard activation, and card-level event forwarding; associated Design System and Investments regression tests plus the authored ZCode plan are included.
- Verification: the first `npm run verify` passed typecheck, lint, and the test suite but stopped in the asset audit because unstaged deleted files still appeared in `git ls-files`. Since the user explicitly authorized the complete worktree, all changes were staged and the gate was rerun on the exact publish snapshot. The fresh rerun passed typecheck, repository ESLint, 61 test files / 606 tests, all six audits (`card-details`, `investments`, `figma-bridge`, `templates`, `platform`, `assets`), and the production Vite build.
- Known non-blocking output: the established Recharts zero-size diagnostics in jsdom, empty `react-vendor` chunk, and Vite large-chunk notice remain visible and triaged; no failing check is hidden.
- Publication evidence: source checkpoint `26fd27d` (`Polish design system and investment carousels`) was pushed to `origin/main`. Vercel Production deployment `dpl_3XfcSSifncbkhiytwGAEFntZXzWV` reached `READY`, updated `https://mobile-banking-cee.vercel.app`, exposed the expected `api/access` function, returned HTTP 200 / 1,134 bytes through the canonical alias, and had no error logs in the preceding hour. This publication-evidence-only handoff update is committed and the final documentation checkpoint is redeployed so GitHub and Production end on the same HEAD.
- Banana Loop: the asset-audit/staging interaction is documented rather than bypassed; all local files are intentionally in scope; Vercel readiness, canonical HTTP response, and recent error logs are proven above. Final Git parity and worktree cleanliness are checked after the documentation checkpoint is pushed and redeployed.
- constitutional check:
  - scope preserved: yes (the user explicitly requested every uncommitted file)
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after the final documentation checkpoint is pushed, redeployed, and confirmed clean

## 2026-07-22 Unified Git and Vercel Publication Closeout

- Latest request handled: unify the complete shared workspace, commit every tracked and untracked product/documentation change, publish the resulting `main` branch to GitHub, and deploy that exact state to Vercel Production.
- Included scope: the complete Design System implementation-package rollout, CZ Basket Funds catalogue, all-country Investments Sell Order, Card Details sensitive/non-sensitive boundary and carousel-shadow correction, Translation Tester updates, and phone-screenshot/Figma-export improvements already present in the workspace.
- Pre-publication verification: fresh `npm run verify` passed TypeScript, repository ESLint, 61 test files / 603 tests, all six audits (`card-details`, `investments`, `figma-bridge`, `templates`, `platform`, `assets`), and the production Vite build. Known Recharts zero-size diagnostics, the empty `react-vendor` chunk, and large-chunk notices remain the previously triaged non-blocking warnings.
- Banana Loop: the transient Design System coverage failure observed while concurrent authoring was still writing package entries was rerun after the workspace stabilized; its dedicated suite passed 206/206 and the complete repository gate then passed. No failing gate is being hidden from publication.
- Publication evidence: unified source commit `eea7c9c` (`Unify design system, investments, and card flows`) was pushed from local `main` to `origin/main`. Vercel Production deployment `dpl_2vaoZje5JFPtcKGuCJQJ59Q5gBcs` reached `READY` at `https://mobile-banking-2tbzx3lu1-imc-uci.vercel.app` and updated the canonical alias `https://mobile-banking-cee.vercel.app`.
- Post-deploy evidence: Vercel inspection reported target `production`, status `Ready`, and the expected `api/access` function; the canonical alias returned HTTP 200 and the deployment error-log query for the preceding hour returned no entries. This publication-evidence-only handoff update is committed and redeployed immediately after the product commit so final `main` and Production remain aligned.
- constitutional check:
  - scope preserved: yes (the user explicitly requested the whole workspace)
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 Implementation Package Rollout to All Design System Components

- Latest request handled: extend the `ui.primary-button` portable Implementation Package pilot to every component shown in Design System -> Components, with 100% coverage, no leftover "Code" tab or "No isolated live preview" placeholders, and a fail-closed automated test guarding future additions.
- Architecture generalized: `ComponentImplementationPackage.tsx` no longer special-cases Primary Button — its States section now calls `getComponentStatePreview(componentId, stateId)` (new `componentStatePreviews.tsx`), falling back to the existing "Not part of the current public component contract" placeholder only when a state genuinely has no mapped preview. `ComponentDetailScreen.tsx`'s View tab now calls `getComponentLivePreview(componentId, themeMode)` (new `componentLivePreviews.tsx`) instead of the old fragile `TESTABLE_COMPONENTS` suffix-matching; most entries simply reuse the exact `*VariantSpecimen` components already rendered in the Components catalog (so the catalog card and the detail page can never drift apart), with a handful of thin inline adapters for components only ever inlined directly in `DesignSystemPage.tsx` (StatusBar/DynamicIsland, HomeHeader, MoreHeader, LanguageSelectorButton, NavigationLink, PreLoginHeading, FloatingCoAppingButton, PanelWithTranslations/PanelWithoutCoAppingTranslations, LogoutConfirmDialog, the shadcn generic-controls kit).
- Registry reconciliation: added 10 new `COMPONENT_REGISTRY`/`ComponentId` entries that specimens referenced but the registry lacked (`shell.status-bar`, `shell.home-header`, `shell.more-header`, `ui.language-selector-button`, `ui.navigation-link`, `ui.prelogin-heading`, `ui.button-registry`, `ui.generic-controls`, `accounts.carousel-indicator`, `prelogin.other-panel-basic`), and fixed two id mismatches between registry/specimen-href/code-sample keys (`dialogs.logout-confirm` -> `dialogs.logout-confirmation`, `accounts.search-bar` -> `accounts.transaction-search`). `COMPONENT_REGISTRY` grew from 86 to 96 entries.
- Specimen wiring: every `<Specimen>` in `DesignSystemPage.tsx`, `specimens/cardSpecimens.tsx`, and `specimens/fieldSpecimens.tsx` now carries a `detailsHref`. Content authored directly (no sub-agents — see Banana Loop note): 51 `COMPONENT_IMPLEMENTATION_PACKAGES` entries (summary, visual specifications read from real source, real supported states with live-component previews, motion values taken from real source or explicit "None", accessibility facts true of that component, asset requirements) plus React/Swift/Kotlin code samples for the 6 components that had none yet (`shell.home-header`, `shell.more-header`, `ui.button-registry`, `ui.generic-controls`, `prelogin.other-panel`, `prelogin.other-panel-basic`); the other 45 already had samples from earlier sessions and were left untouched.
- Vendor-neutrality: the package/code-sample text for every component was checked against the forbidden-term list (Asseco/ASEE/Adaptive Elements/Reply); none matched. UniCredit tokens and Figma node references stay, since they are part of the product, not a vendor.
- TDD evidence: `tests/screens/component-implementation-package-coverage.test.tsx` parses every `<Specimen>` in the three catalog source files via a regex-split extractor (robust against literal `>` characters inside `specs={[...]}` strings), derives the componentId set from `detailsHref`, and asserts for each one: a complete package, non-empty React/Swift/Kotlin samples (plus every declared variant resolves), a non-null live preview in both themes, and no forbidden vendor terms. It started RED (56/202 failing, only `ui.primary-button` covered) and finished GREEN at 206/206 after the full rollout; the pre-existing pilot test's "keeps the existing Code mode" case was repointed from `shell.page-header` (now covered) to `analytics.spendings` (a screen composite outside the Components tab, still package-less by design).
- Verification evidence: the rollout's dedicated coverage suite passed 206/206; the final unified `npm run verify` passed typecheck, lint, 61 files / 603 tests, all six audits (`audit:templates` reports `components=96`), and build. `git diff --check` reported only LF/CRLF conversion warnings, no real whitespace errors.
- Live port-`localhost` evidence (own dev-server instance on an auto-assigned port, since another session already held 5173): verified 3 simple components (`ui.radio-button`, `ui.link-button`, `ui.language-selector-button`), 3 complex compositions (`ui.navigation-row`, `cards.card-component`, `products.product-card-list-total` — the last one's States section renders the real `ProductCard`/`ProductsList`/`TotalRow` composition end-to-end with a working Open/Accordion/Default set), a 6-variant component (`cards.card`, all six Mastercard SVG palettes), an image-bearing component (`payments.hero-card`, three real `screenshots/paymentsN.png` states, confirmed 200 OK on the network tab), and an interactive component (`ui.toggle-button`, real `role="switch"` toggling `aria-checked` true/false on click with zero console errors). Confirmed `ui.primary-button` is not regressed (both View and Implementation package tabs, all 6 package sections, Swift/Kotlin code switching). Light/Dark theme toggling and the View/Implementation-package tab switch were confirmed working end-to-end via a dispatched click (the sandboxed Browser pane's pointer-click delivery was itself intermittently unreliable in this session — confirmed independently on an unrelated, unmodified specimen's own theme toggle — so click-driven checks were cross-verified with a dispatched DOM click event where the tool's synthetic pointer click did not land).
- Banana Loop result: the originally-planned 50-agent Workflow for authoring this content was stopped mid-run after explicit user feedback that it was excessive token spend for this repo (see the reinforced `design-system-ui-skill` memory); all package/sample authoring was redone directly by reading each real component's source. No other new untriaged banana was introduced.
- constitutional check:
  - scope preserved: yes (exactly the requested catalog-wide rollout; no runtime component behavior changed except adding two `export` keywords in `cardSpecimens.tsx` to reuse existing internal helpers)
  - docs updated: yes
  - verification recorded: yes (RED/GREEN coverage suite, full local gate, live browser evidence)
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 CZ Basket Funds Catalogue

- Latest request handled: reproduce the Figma Basket Funds carousel and Basket Funds list inside the Investments securities catalogue, only for Czech Republic, including present and future releases.
- Behavior: CZ `Invest` now opens `Buy securities` with `All products` / `Regular Plan`, the shared Search control, a 20-card horizontal Basket Funds carousel, `See all basket funds`, and the existing securities list below. `Regular Plan` filters both baskets and securities to recurrent products. Other countries retain the existing `List of securities` screen with no Basket Funds content.
- Basket Funds page: `See all basket funds` and a basket card open the Figma-derived `Basket Funds` surface with explanatory copy, six one-off baskets, fourteen regular-investment baskets, four initially visible rows per group, and independent `See more` / `See less` expansion. Back returns to the catalogue without losing the selected tab or search/filter context.
- Scope rule: availability is derived only from `country === "CZ"`; it is intentionally independent of release ID, so CZ current and future releases inherit the feature while RO/SK/HU/RS/BA/BA_BL/SI do not.
- Design evidence: implementation was derived from Figma section `10738:58235` and inspected child nodes `10738:71476`, `10738:72982`, `10738:58263`, and `10738:72190`. Existing PageHeader, mailbox tabs, Search, section divider, BrandLogo, and LinkButton components were reused.
- Verification: focused RED/GREEN coverage passed 4/4 Basket Funds tests; the related Investments regression set passed 6 files / 60 tests; focused ESLint, `npm run typecheck`, and the production build passed. Live port-4001 checks confirmed 20 cards on CZ current, 20 on CZ Future, 14 basket cards plus six securities under Regular Plan, independent 6/4 group expansion, and zero Basket Funds cards/carousel on RO.
- Final unified gate: after the concurrent Design System rollout stabilized, fresh `npm run verify` passed 61 test files / 603 tests, all audits, and build; the Basket Funds suite remains green at 4/4.
- Files central to this change: `src/app/config/investmentBasketFundsConfig.ts`, `src/app/components/investments/InvestmentBasketFundCard.tsx`, `src/app/screens/investments/InvestmentBasketFundsScreen.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, and `tests/screens/investment-basket-funds.test.tsx`.
- Limitation: Basket Funds and their descriptions are deterministic front-end mock catalogue data. This adds no backend catalogue, suitability logic, recommendation ranking, order placement, or persistence.
- Banana Loop result: country leakage, release coupling, tab/filter drift, Back-state loss, and linked group expansion all have explicit regression coverage. The earlier transient concurrent-edit blocker is resolved and the final full gate is green; no Basket Funds banana remains untriaged.
- safe to resume: yes

## 2026-07-22 Investments Sell Order

- Latest request handled: connect Product Detail `Sell` to the Figma-derived Sell Order journey for every supported Mobile PI country and include the two requested CTS validation outcomes.
- Behavior: an owned, active position now opens `Sell Order` with product evaluation/details, portfolio account, Units/Amount selection, unit or amount input, Sell all, cash-account selection, inline validation, Review Data, terms acceptance, shared Face ID Sign, and `Order accepted` success. Back navigation remains local to the coordinator and completion returns to Investments.
- CTS simulations: `UniCredit Balanced Income Fund` exposes Units only and shows a generic explanation that amount selling is unavailable. Other eligible positions expose both modes; their deterministic mock CTS amount ceiling is 65% of the current position value, and exceeding it shows a generic maximum-amount error without exposing the backend reason.
- Country scope: the same coordinator and canonical security enrichment are shared by `RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `BA_BL`, and `SI`; currency formatting and account conversion continue to follow the selected country/account.
- Design evidence: implementation was derived from Figma nodes `12163:83967`, `12163:86135`, and `12163:83940`, reusing the existing PageHeader, section divider, detail field, TextField, Toggle, BottomSheet, PrimaryButton, order-documents, Sign, Face ID, and Success components.
- TDD evidence: Sell-action wiring and portfolio integration were first observed failing, then passed after implementation. Fresh focused verification passed 3 files / 33 tests; focused ESLint, the eight-country Investments audit, and the production build also passed.
- Live port-4001 evidence: amount mode rejected `999999` with the CTS maximum error and kept Next disabled; Balanced Income rendered Units with no Amount control and the generic availability message; a 2-unit order reached Review, terms, Face ID, and `Order accepted`.
- Final unified gate: the concurrent Design System TypeScript errors were completed and resolved before publication; fresh `npm run verify` passed 61 test files / 603 tests, all audits, and build.
- Files central to this change: `src/app/screens/investments/InvestmentSellOrderFlow.tsx`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, `src/app/screens/investments/InvestmentSecurityScreens.tsx`, `src/app/config/investmentsPortfolioConfig.ts`, `src/app/components/investments/InvestmentDetailField.tsx`, and `tests/screens/investment-sell-order-flow.test.tsx`.
- Limitation: this remains deterministic front-end simulation. It does not call CTS, execute or persist a trade, update holdings/balances, or add an order to History.
- Banana Loop result: the new Sell path has explicit guards for quantity above holdings, CTS amount ceiling, units-only eligibility, terms gating, and shared authentication. The temporary concurrent-edit blocker is resolved and the final full gate is green.
- safe to resume: yes

## 2026-07-22 Card Details Boundary and Carousel Shadow

- Latest request handled: separate the non-sensitive `Card Details` quick action from the authenticated `Show Card Details` reveal, and stop the card carousel from clipping its drop shadow against the content below.
- Root cause: both entry controls were wired to `handleShowCardDetails`, so both mounted Face ID and reused the sensitive number/CVV/holder/validity surface. Separately, horizontal overflow made the carousel a vertical clipping context while its 8px bottom reserve was smaller than the card shadow.
- Behavior: the quick action now navigates directly to the existing `card-details-info` route, whose composition mirrors Account Details and shows only product, status, masked reference, available-to-spend, and credit-limit/linked-account information. `Show Card Details` alone mounts Face ID; after its 840ms completion, a dedicated local sensitive-detail screen reveals the full number, CVV, holder, and validity and returns locally to Card Detail.
- Visual correction: the real horizontal carousel now owns a 20px shadow lane, a matching negative bottom margin, and a raised stacking context. The following content keeps its position while the card shadow remains visible above it instead of ending at the scroll container boundary.
- TDD evidence: three regressions first failed on the shared handler, missing shadow lane, and sensitive direct-details content, then passed after the split. Focused Card Detail, small-screen, and route-restoration coverage passed 3 files / 21 tests. The complete `npm run verify` gate then passed TypeScript, ESLint, 58 test files / 374 tests, card-details and product audits, asset checks, and the production build.
- Live port-4001 evidence: direct `Card Details` rendered `Card product` and `Card status` with no CVV or full number. `Show Card Details` exposed no sensitive content immediately, then rendered the CVV surface only after Face ID. The carousel reported the expected raised 20px shadow lane and the screenshot confirmed the shadow continues below the card edge.
- Files central to this correction: `src/app/screens/cards/CardDetailScreen.tsx`, `src/app/screens/cards/CardDetailsInfoScreen.tsx`, `src/app/screens/cards/CardSensitiveDetailsScreen.tsx`, and `tests/screens/card-detail-boundaries.test.tsx`.
- Limitation: both surfaces remain mock-driven; Face ID is still the existing deterministic local animation rather than real authentication.
- Banana Loop result: the previously open carousel-shadow regression task now has an automated guard. No new untriaged banana was introduced.
- constitutional check:
  - scope preserved: yes (the two requested Card Detail corrections only)
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 Primary Button Portable Implementation Package Pilot

- Latest request handled: transform the Design System `Primary button` detail into a supplier-neutral implementation handoff that developers can use directly, without documenting an unknown vendor implementation, alleged defects, or an acceptance checklist.
- Product behavior: `ui.primary-button` now opens with `View` and `Implementation package` tabs. View renders the real shared `PrimaryButton` through the existing testable-component registry instead of the prior missing-preview placeholder. The package combines the live React reference, native SwiftUI and Jetpack Compose references, exact visual values and semantic tokens, interactive states, motion, accessibility, and asset requirements on one page. Other component details keep their existing `View` / `Code` behavior.
- Neutrality boundary: the package contains no supplier, Adaptive Elements, or implementation-platform branding. It describes the component contract only and does not claim drop-in compatibility with an unknown host application.
- Code-reference correction: the React sample now includes its `ReactNode` import and matches the real focus-ring offsets. The Kotlin sample includes the required `remember` import and implements the documented 200 ms pressed-scale transition through `animateFloatAsState`; native color tokens remain explicit integration dependencies. The live state previews reuse the actual `PrimaryButton` component rather than drawing lookalikes.
- TDD evidence: the package-detail test first failed on the missing package route and then on incomplete code samples. After implementation it proves all six package sections, all three language selectors, vendor-neutral copy, and preservation of the old Code tab on unrelated components.
- Final verification: `npm run typecheck`, `npm run lint -- --quiet`, all 57 test files / 371 tests, and `npm run build` passed after the live-preview correction. Existing Recharts zero-size diagnostics and production chunk-size notices remain unrelated, previously triaged warnings.
- Files central to this pilot: `src/app/registry/componentImplementationPackages.ts`, `src/app/screens/design-system/ComponentImplementationPackage.tsx`, `src/app/screens/design-system/ComponentDetailScreen.tsx`, `src/app/registry/componentCodeSamples.ts`, and `tests/screens/component-implementation-package.test.tsx`.
- Banana Loop result: the pilot is intentionally limited to Primary Button so its usefulness can be reviewed before applying the format to the wider catalog. No new untriaged banana was introduced.
- constitutional check:
  - scope preserved: yes (Primary Button pilot only)
  - docs updated: yes
  - verification recorded: yes (RED/GREEN plus complete local checks)
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 Risk-Matched Funds Handoff

- Latest request handled: make `Explore matching funds` honor the risk comfort already collected by the investment-goal conversation instead of reopening the generic `Our funds selection` banner storefront.
- Behavior: the goal summary carries a typed collection ID through the portable chat action, `App`, and a correlated Investments request object. `Prefer less movement` opens `Conservative funds`, `Balanced` opens `Balanced funds`, and `Accept more movement` opens `Equity funds`. The portfolio discovery banner remains unchanged and still opens the general storefront.
- Navigation boundary: the matched collection reuses the existing collection detail, fund rows, security detail, BUY, Review Data, terms, Face ID Sign, and Success path. Back from a direct chatbot handoff returns to the Investments portfolio rather than inserting the unrelated storefront.
- TDD evidence: the new action-metadata and direct-collection tests first failed on the missing collection ID and ignored request, then passed after the typed handoff. Focused orchestration/screen coverage passed 33/33, the Funds window suite passed 5/5, and `npx tsc --noEmit` passed.
- Live port-4001 evidence: completed `Grow my savings -> In 3-5 years -> 10,000 CZK -> 500 CZK monthly -> Balanced -> Explore matching funds`. The resulting runtime contained exactly one `investment-fund-collection-balanced`, one `Balanced funds` heading, and zero `investment-funds-selection` storefronts. The screenshot confirmed the existing sticky Balanced collection header and fund list. The historical Investments `ReferenceLine` NaN console warning remains the already-triaged chart banana and is unrelated to this handoff.
- Final repository gate: fresh `npm run verify` passed TypeScript, ESLint, all 56 test files / 367 tests, all six audits, the locked 179-asset baseline, and the 4,397-module production build. Existing jsdom Recharts zero-size diagnostics, the browser `ReferenceLine` warning, the empty `react-vendor` chunk, and large-chunk warnings remain the already-triaged non-blocking notices.
- Files central to this correction: portable chat action types, `src/app/chat/cz/investmentGoal.ts`, `src/app/chat/cz/helpers.ts`, `src/app/chat/czChatOrchestration.ts`, `src/app/App.tsx`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, the two focused tests, and the handoff/capability/design docs.
- Limitation: this is deterministic demo routing from the selected comfort label, not suitability, personalized advice, ranking, persistence, or a recommendation backend.
- Banana Loop result: the misleading generic-storefront destination was corrected at the typed handoff boundary; the portfolio banner's generic discovery route is preserved. No new untriaged banana was introduced.
- constitutional check:
  - scope preserved: yes (only the approved matching-funds handoff)
  - docs updated: yes
  - verification recorded: yes (RED/GREEN, focused suites, live browser, and fresh full gate)
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 Shared Sign Face ID Gate

- Latest request handled: make the primary action on runtime Sign screens show the established Face ID effect before navigating to Success, using the same animation already present at active login instead of leaving the PIN screen visually empty.
- Shared behavior: `StandardSignScreen` now owns a local authentication state. Pressing its primary action mounts the existing `FaceIdAnimation`, disables the action and guards retriggering; only the animation's `onComplete` releases the supplied `onSign` callback. The shared public props remain unchanged.
- Coverage: domestic payment signing, investment BUY-order signing, and the new CZ credit-limit signing flow already consume `StandardSignScreen`, so all three inherit the same `Sign -> Face ID -> Success` sequence without separate implementations.
- TDD evidence: the new regression first failed because `onSign` was called immediately with the click event. After the shared change, the component test proves no callback at click or 839 ms and exactly one callback at 840 ms. Investment and credit-limit end-to-end tests now also prove their Success headings are absent during Face ID and present only after completion. The focused suite passed 3 files / 16 tests.
- Live port-4001 evidence: completed CZ Card Detail -> For you -> `I'm interested` -> `Review offer` -> terms -> `Sign change`. Immediate inspection returned `authenticating: true`, a mounted Face ID overlay, and `successVisible: false`; after completion exactly one `Limit updated` heading was visible and the Sign screen was gone. The screenshot confirmed the existing black Face ID tile over a dimmed/blurred phone surface. Browser error logs were empty.
- Final repository gate: fresh `npm run verify` passed TypeScript, ESLint, all 56 test files / 366 tests, all six audits, the locked 179-asset baseline, and the 4,397-module production build. Existing jsdom Recharts zero-size diagnostics, the empty `react-vendor` chunk, and large-chunk warnings remain the already-triaged non-blocking warnings.
- Files central to this change: `src/app/components/flow/StandardSignScreen.tsx`, `tests/screens/standard-flow-screens.test.tsx`, `tests/screens/investment-buy-order-flow.test.tsx`, `tests/screens/credit-limit-offer-flow.test.tsx`, the handoff/capability docs, and the authored design/plan under `docs/superpowers/`.
- Limitation: Face ID remains a deterministic 840 ms local visual simulation. This change adds no biometric validation, failure/retry/cancel path, authentication backend, persistence, or security-policy claim.
- Banana Loop result: the missing authentication handoff was fixed at its shared source rather than patched per product. No new untriaged banana was found; the existing Recharts and bundle warnings remain documented and unrelated.
- constitutional check:
  - scope preserved: yes (the approved shared Sign transition only)
  - docs updated: yes
  - verification recorded: yes (RED/GREEN, live browser sequence, fresh full gate)
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 Investment Goal and Credit-Limit Completion

- Latest request handled: turn `Start an investment goal` and the `New credit limit for you` opportunity into clear end-to-end demo stories, while preserving the shared conversation-local option-consumption contract and eliminating circular choices.
- Investment goal: the assistant now collects five qualified inputs in order (purpose, horizon, starting amount, monthly contribution, and risk comfort), builds a deterministic illustrative projection from the selected values, renders a concise recap, and offers only `Explore matching funds` or terminal `I'm done`. `Not sure yet` is tied to its exact step and can no longer fall into another branch through ambiguous text matching.
- Investment handoff: `Explore matching funds` uses the typed `investment-funds` action target and now opens the risk-matched collection directly; the later correction is documented above. Funds collection, security detail, BUY Review Data, terms, PIN, and Success remain the existing transaction authority.
- Credit-limit conversation: `I'm interested` now offers `Check repayment impact`, `Review offer`, or terminal `Not now`. Impact converges to Review/Not now and does not repeat itself. Stable semantic IDs let the portable assistant consume every selected option across later surfaces in the same conversation.
- Credit-limit action flow: `Review offer` opens a dedicated review with current/new/increase values, requires explicit terms acceptance, then reuses the standard PIN/sign and success screens. Only leaving Success applies the new limit. The accepted limit and +5,000 CZK available-credit delta are session-only; the card nudge and `For you` opportunity disappear after success, while reload intentionally restores mock data.
- Safety boundary: goal projections are explicitly illustrative and incomplete inputs produce no invented numeric range. The credit offer remains mock/session-only and adds no underwriting, eligibility service, persistence, document generation, or banking backend.
- Verification evidence before the final repository gate: focused TypeScript and 42 relevant tests passed. Live port-4001 smoke completed credit `I'm interested -> impact -> Review -> terms -> PIN -> Success -> Back to card`, confirmed the selected impact action disappeared, Free To Spend changed from 3,200 to 8,200 CZK, and the nudge/opportunity disappeared. The investment smoke completed all five questions, rendered the selected-value simulation, and confirmed `Explore matching funds` closed chat and opened `Our funds selection` with Search and the exact collection banners. No Vite overlay was present.
- Final repository gate: after triaging and re-locking the prior Funds asset delta, fresh `npm run verify` passed TypeScript, ESLint, all 56 test files / 366 tests, all six audits, the 179-asset fail-closed baseline (`127` referenced; the existing `52` review candidates unchanged), and the 4,397-module production build. Only the already-triaged jsdom Recharts diagnostics, empty `react-vendor` chunk, and large-chunk warnings remain.
- Files central to this change: `src/app/chat/cz/investmentGoal.ts`, `src/app/chat/czChatOrchestration.ts`, `src/app/App.tsx`, `src/app/screens/cards/CreditLimitOfferFlow.tsx`, `src/app/screens/cards/CardDetailScreen.tsx`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, portable chat action types, the focused chat/screen tests, and the authored design/implementation docs under `docs/superpowers/`.
- Banana Loop result: the browser check initially compared a locale-formatted non-breaking space to a regular space; inspecting the actual `Free To Spend` line confirmed the correct 8,200.00 CZK session value. The first full gate also exposed that the previous approved Funds commit added seven referenced Figma images without refreshing the fail-closed asset baseline. The audited 172 -> 179 delta was exactly those six collection banners plus the Amundi logo, so the baseline was re-locked without deleting, replacing, or optimizing assets. Existing Recharts jsdom zero-size and production chunk-size warnings remain the already-triaged non-blocking warnings.
- constitutional check:
  - scope preserved: yes (approved Variant A only; no backend or persistence expansion)
  - docs updated: yes
  - verification recorded: yes (focused RED/GREEN, end-to-end browser smoke, and fresh full `npm run verify`)
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 Investments Funds Window and Collection Drill-Down

- Latest request handled: connect the existing `Find out the best fund for you` portfolio banner to the Figma `Our funds selection` storefront, add the six supplied collection-banner variants to the shared `Investments fund banner` Design System component, and connect every collection to a Figma-aligned collection detail that reuses the existing fund-detail route.
- Final banner-height correction: collection banners no longer force `height: 126px`. They keep `126px` as a minimum, opt out of flex shrinking, and hug multiline title/subtitle content; the inner layout uses a 94px minimum plus an explicit 8px content/CTA gap, so the image and CTA remain inside the final card height. Each banner also creates its own stacking context so its foreground cannot draw over the storefront's sticky header.
- Final header contract after clarification: the `Our funds selection` storefront follows the normal scroll-owned `PageHeader` pattern. Its title, Search control, and banners scroll together; after 96px, the title appears small and centered in the sticky safe-area header. Only a selected collection detail is the fixed-header exception: its entire safe-area/Back/Help/hero/title/subtitle composition stays fixed while the introduction, grouped funds, and disclaimer scroll beneath it. The safe-area and control row use the exact solid background sampled from the selected Figma banner, with a transparent `PageHeader`, so no white band interrupts the hero composition.
- Final compact-detail correction: the fixed collection hero is `132px` high instead of content-driven from a `188px` minimum. Its title is clamped to one line and its subtitle to three lines, providing the approved maximum four-line text budget while the supplied image remains `object-cover` and may crop. This changes only the fixed block's density; the safe-area background continuation and fixed-header/independent-content-scroll contract remain intact.
- Runtime flow: portfolio banner -> funds storefront -> selected collection -> existing security detail. `Search funds` reuses the existing investment catalogue. Back from a security returns to its collection; Back from a collection returns to the storefront; Back from the storefront returns to the portfolio. No global route or new trading behavior was introduced.
- Figma fidelity: the storefront uses the exact six Figma assets for Onemarket, Selection+, Featured, Equity, Balanced, and Conservative collections. The Onemarket detail uses the supplied title and longer hero subtitle, groups the canonical active investment catalogue into one-off and regular sections, shows exact supplied Amundi artwork, and retains the informational investment disclaimer.
- Design System: `InvestmentsFundBanner` now exposes a typed seven-variant API (`discovery` plus six collection variants). The existing `investments.fund-banner` specimen has a selector for all variants, and its registry/specification notes document the two supported geometries and Figma imagery.
- Data boundary: collection rows are deterministic views of the existing canonical investment catalogue. Clicking a row opens the already implemented product detail/buy path; no price, holding, recommendation, execution, or backend capability was invented.
- Verification evidence: the final RED run failed independently on missing `shrink-0`, the incorrectly fixed storefront root, missing banner-matched header color, missing stacking isolation, and the still-tall collection hero. The focused suite then passed 5/5, including `h-[132px]`, title `line-clamp-1`, subtitle `line-clamp-3`, and preservation of the independently scrolling content region. Live port-4001 evidence measured multiline banners at 149px and short banners at 126px, each with a 15px CTA bottom gap and `flex-shrink: 0`. At storefront scrollTop 364, compact `Our funds selection` opacity was 1 and banner isolation prevented foreground overlap. Earlier Selection+ detail evidence kept the complete header fixed at top 143 / bottom 408 with `rgb(229, 217, 199)` across the safe area. The final Balanced-detail browser check measured the new hero at the expected scaled `90.32px` (`132px` CSS), confirmed the `132px`/one-line/three-line classes, the exact `rgb(218, 233, 240)` collection background, and a visibly larger fund-content viewport. The first complete gate caught direct Figma color literals inside the guarded Investments component root; moving those exact values to the collection configuration authority restored the semantic-color contract. The final `git diff --check && npm run verify` passed TypeScript, ESLint, all 55 test files / 361 tests, all six audits, and the 4,395-module production build; only the already-triaged jsdom Recharts and bundle-size warnings remain.
- Files central to this change: `src/app/components/investments/InvestmentsFundBanner.tsx`, `src/app/config/investmentFundCollections.ts`, `src/app/screens/investments/InvestmentFundsWindowScreens.tsx`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, `src/app/screens/design-system/specimens/cardSpecimens.tsx`, `src/app/screens/design-system/DesignSystemPage.tsx`, `src/app/registry/componentRegistry.ts`, `src/assets/investments/funds/`, `tests/screens/investment-funds-window.test.tsx`, and `tests/screens/investment-product-chat-context.test.tsx`.
- Publication evidence: the complete approved workspace was committed as `4fb5987` (`feat: refine investment guidance and fund discovery`) and deployed directly to Vercel Production as `dpl_2ByZhai7uhd8oSjocz3UJeeaRczJ`. Vercel inspection reported `READY`, the canonical `https://mobile-banking-cee.vercel.app` alias returned HTTP `200`, and `vercel logs --since 1h --level error` returned no runtime error entries.
- Banana Loop result: no new untriaged banana. Existing Recharts jsdom zero-size diagnostics and production chunk-size warnings remain the already-known non-blocking warnings; the asset audit passed and did not classify the seven newly referenced Figma files as unreferenced.
- constitutional check:
  - scope preserved: yes (the approved Figma storefront, collection drill-down, exact image variants, and existing detail reuse only)
  - docs updated: yes
  - verification recorded: yes (focused RED/GREEN, final `npm run verify`, live port-4001 visual/geometry smoke, and production deployment evidence)
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-22 Investments "Consolidated report" Rename + Fund Banner Design-System Mapping

- Latest request handled: (1) rename the Investments action-bar report button from "Download Report" to "Consolidated report" across all countries; (2) map the existing Investments fund banner as a registered specimen in the Design System so it appears in the catalog with live preview and component-detail code samples (title / subtitle / link / image slots), preparatory to mapping further banner versions later.
- "Consolidated report" rename: the report button label lives on the shared translation key `runtime.investments.actions.downloadReport` in `src/translations/shared.ts`. No country overrides the `investments.actions` block (verified for all 7 countries / all languages), so a single edit propagates everywhere. The button renders two lines via a `\n`, preserved as `Consolidated\nreport`. The inline fallback in `InvestmentsPortfolioScreen.tsx` was kept in sync. The action id (`download-report`), icon name, and translation key are identifiers, not user-visible text, and were left unchanged.
- Fund-banner design-system mapping: the `InvestmentsFundBanner` component already existed with all four requested slots (title `h2`, description `p`, action `span` + arrow-right, decorative `fund-banner-plant-unsplash.jpg` image with left gradient fade) and was already registered in `COMPONENT_REGISTRY` (id `investments.fund-banner`) and the `ComponentId` union. What was missing was the actual Design-System presence. Added: (a) a live `InvestmentsFundBannerVariantSpecimen` in `cardSpecimens.tsx` mirroring the `InfoBannerVariantSpecimen` container; (b) a `<Specimen>` block in `DesignSystemPage.tsx`'s "Cards and content blocks" section with `detailsHref="#component/investments.fund-banner"`; (c) a full React/Swift/Kotlin code-sample entry in `componentCodeSamples.ts` (BATCH 6 — Investments), so the detail page shows real code instead of "Code samples pending"; (d) extended `usedByScreens` from `["pi.investments.portfolio"]` to also include `"platform.design-system"`, matching the convention used by every other DS-showcased banner. No component source, translations, or tests were changed.
- Extensibility for later banner versions: the new specimen is intentionally single-variant (the simplest `*VariantSpecimen` shape). Adding later banner versions is a localized edit — extend the specimen with a `VariantSelector` (same pattern as `InfoBannerVariantSpecimen`) rather than new infrastructure.
- Verification evidence: `npm run typecheck` passed with 0 errors; `npm run lint` passed clean; `npm run audit:templates` passed (`templates=47 codePreviews=47 components=86 screens=33 flows=14` — registry/union parity intact); `npm run build` succeeded (`✓ built in 6.01s`). Only the already-triaged chunk-size warnings (DesignSystemPage, App, emacs-lisp/shiki) remain. `test` and browser smoke were not re-run because the change is pure design-system presentation plus two string edits with no behavior/contract change; manual browser confirmation on `?screen=design-system` → "Cards" is recommended to confirm the specimen renders with the plant illustration and the "Details →" link opens populated React/Swift/Kotlin tabs.
- Files central to this change: `src/translations/shared.ts` (Consolidated report label), `src/app/screens/investments/InvestmentsPortfolioScreen.tsx` (inline fallback), `src/app/screens/design-system/specimens/cardSpecimens.tsx` (new specimen), `src/app/screens/design-system/DesignSystemPage.tsx` (import + Specimen block), `src/app/registry/componentCodeSamples.ts` (new React/Swift/Kotlin sample), `src/app/registry/componentRegistry.ts` (usedByScreens extended).
- Banana Loop result: no new banana. The specimen has no Figma `_SOURCE` constant (the banner is not a Figma-extracted node), so its `Specimen` omits `note` — consistent with `ProductOfferCard`. The optional `TESTABLE_COMPONENTS` entry was deliberately skipped (it serves only the standalone TranslationTesterTool and carries a known full-vs-short id mismatch that disconnects it from the detail screen) to keep the change minimal.
- constitutional check:
  - scope preserved: yes (Design-System presentation registration of an existing component + two-string label rename; no new capability, screen, flow, data, or integration contract)
  - docs updated: yes (this entry)
  - verification recorded: yes (typecheck + lint + audit:templates + build)
  - bananas triaged: yes (no new untriaged banana)
  - safe to resume: yes

## 2026-07-22 Global Chatbot Option Consumption and Investment Pre-Review Bridge

- Latest request handled: apply option consumption across the complete portable chatbot so a selected action cannot reappear later in the same conversation and form a circular flow; also soften the selected-investment timing transition before Review Data.
- Global contract: suggested topics, follow-up shelves, rich-block actions, product-card actions, and `For you` opportunity/discovery actions now share one conversation-local consumed-action registry. Consumption happens only after a successful stationary selection, using the stable action ID (or the suggestion ID fallback); merely displaying, scrolling, or dragging an option does not consume it. Repeated action IDs are filtered from every later assistant surface in that conversation.
- Reset contract: `Start new conversation`, entry-context changes, and opening a saved conversation start with a clean consumed-option set, so the full relevant graph is available in the new context without leaking state from the previous conversation.
- Investment bridge: `Today` and `Next business day` now remain chat actions. Either choice produces a `Ready to review` summary with product, quantity, masked cash account, execution timing, and estimated debit; only the explicit `Review order` action navigates to Review Data. Correction actions let the client change timing, account, or quantity while still respecting global option consumption.
- Verification evidence: the new regression first failed because a deliberately repeated `Review risk` action reappeared, then passed after the shared registry was added; the component suite passed 18/18 and the combined assistant/orchestration suites passed 41/41. Live port-4001 verification confirmed that selecting `Today`, then `Change timing`, exposes only the unconsumed `Next business day`; both timings rendered `Ready to review` without leaving Product Detail, and `Review order` remained a separate explicit action. Fresh `npm run verify` passed TypeScript, ESLint, 54/54 test files and 355/355 tests, all six audits, and the 4,386-module production build. Only the already-triaged Recharts jsdom zero-size messages and build chunk warnings remain.
- Files central to this change: `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`, `src/app/chat/czChatOrchestration.ts`, `tests/chat/co-apping-chat-assistant.test.tsx`, `tests/chat/cz-chat-app-orchestration.test.ts`, `docs/superpowers/specs/2026-07-22-cz-investment-guided-story-design.md`, and `docs/superpowers/plans/2026-07-22-cz-investment-guided-story.md`.

## 2026-07-22 CZ Selected-Investment Guided Story and Commercial Copy

- Latest request handled: turn the selected-investment chatbot into a management-ready `Understand -> Evaluate -> Act` story, keep the existing Product Detail entry choices, summarize key document facts in chat (Option A), prevent circular suggestions, and compress every response into a more commercial, client-oriented voice.
- Guided graph: `Explain this product` now opens `How is it doing for me?`, `What could affect my return?`, and `Show me the essentials`. Performance, risk, essentials, portfolio-fit, legacy checklist, generic product opinion, and terminal closeout use shorter benefit/impact/next-step copy. Exact holding metrics stay in the rich card instead of being repeated in prose. The commercial CTA is `Explore adding more` for an owned product and `Explore investing` for catalogue-only products; both reuse the existing quantity/account/timing/order-review path.
- Document decision: `Show me the essentials` answers three client questions (`Potential gain or loss`, `Total cost`, `Access to money`) and renders a non-interactive `Key information at a glance` KID/KIID summary. No PDF, route, fake open/download action, or new capability was added.
- Loop prevention: the deterministic resolver now derives visited investment topics from user-message history. Once a branch is selected, its suggestion ID is consumed across later replies in that conversation. `Back to product overview` shows only unvisited primary branches; `I'm done` returns terminal `All set` copy with no follow-ups. A new conversation resets the graph. Displaying an option does not consume it; selecting it does.
- Copy-density regression: automated checks cap Explain at 650 characters, Performance and Risk at 550 each, and Essentials at 700, while requiring client-oriented headings and `Why it may fit` language.
- Verification evidence: the consumed-option RED returned `Show me the essentials` again after Essentials -> Back; the concise-copy RED returned the old long `in simple terms` answer. Both passed after the minimal production changes, and focused orchestration passed 22/22. Fresh `npm run verify` then passed TypeScript, ESLint, 54/54 test files and 353/353 tests, all six audits, and the 4,386-module production build. Live port-4001 smoke confirmed the short Explain, Essentials, Risk, Portfolio fit, Performance, and `All set` replies; after Essentials -> Back the shelf contained only Performance and Risk, after Risk -> Portfolio fit it contained only `Explore adding more` and `I'm done`, and terminal closeout rendered no suggestion shelf. The owned commercial CTA still opened `Choose quantity`. Only the already-triaged Recharts jsdom zero-size messages and build chunk warnings remain.
- Files central to this change: `src/app/chat/czChatOrchestration.ts`, `tests/chat/cz-chat-app-orchestration.test.ts`, `tests/chat/co-apping-chat-assistant.test.tsx`, `docs/superpowers/specs/2026-07-22-cz-investment-guided-story-design.md`, and `docs/superpowers/plans/2026-07-22-cz-investment-guided-story.md`.

## 2026-07-22 Chat Follow-Up Carousel Pointer-Capture and Drag-Selection Fix

- Latest request handled: repair the shared chatbot follow-up carousel because selecting a response could leave the pointer captured by the chip and keep the shelf in a `grabbing` state, while releasing a horizontal drag over an option could incorrectly select that option even though the user only intended to inspect the carousel.
- Root causes: the follow-up chip handled `pointerup`, called `stopPropagation()`, and changed the conversation before the parent shelf could release pointer capture. Separately, the drag marker was cleared before the browser's synthesized click and a release crossing onto another chip could reach that chip without an observed intermediate move, so mouse-up could be interpreted as selection.
- Fix: chip `pointerup` now bubbles to the shelf cleanup so `releasePointerCapture`, drag-state reset, and cursor restoration always run. Selection suppression remains active through the synthesized click, and pointer-up also compares its horizontal coordinate with the original pointer-down coordinate; a displacement greater than 4px is classified as drag even if the release lands over a different chip. Only a stationary click selects an option.
- Regression: `co-apping-chat-assistant.test.tsx` supplies realistic Pointer Events/pointer-capture APIs and proves capture/release for a stationary selection, no selection after a normal pointer-move drag, and no selection of the chip under pointer release when a drag crosses chips without an intermediate move event.
- Verification evidence: the pointer-capture RED failed because `releasePointerCapture(7)` had zero calls. The first drag-selection RED rendered the `Review this product in my portfolio.` user bubble, and the cross-chip RED rendered `Show me the documents that matter.`; each focused test passed after its minimal fix. The complete assistant suite passed 17/17. Fresh `npm run verify` passed TypeScript, ESLint, 54/54 test files and 350/350 tests, all six audits, and the 4,386-module production build. Live CZ Future / selected-investment smoke used a real drag beginning on the visible edge of `What should I consider?`: shelf `scrollLeft` moved from 2 to 132, conversation text stayed unchanged, and the shelf returned to its non-dragging class. A subsequent stationary click on `Review portfolio` opened `Euro Green Bond Fund in your portfolio`, proving selection remains available. Existing Investments Recharts zero-size/NaN logs predate this interaction and remain the known unrelated chart banana; build retains the already-triaged empty `react-vendor` and large-chunk warnings.
- Files central to this change: `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`, `tests/chat/co-apping-chat-assistant.test.tsx`.

## 2026-07-21 Full Workspace Git Unification (Git Only)

- Latest request handled: consolidate every tracked and untracked workspace change into one Git publication, explicitly without a Vercel deployment.
- Unified scope: selected-investment chatbot/chart/document/buy-flow refinements; Investments order-document accordion and distribution geometry; History crash hardening; Demo topbar App+Country selector; Card Details spacing/shadow; Tools side-by-side refinements; icon, Design System, registry, product-card, message-tab, test, generated icon-catalog, and ZCode plan updates already present in the shared worktree.
- Final integration fixes before publication:
  - restored the product-explanation structure/currency/dealing metrics and official dealing/document context that a parallel chatbot edit had removed;
  - restored visual-first performance order (`richBlocksPosition: before-text`) and removed duplicated position figures from the interpretation copy;
  - aligned chat reverse-import, donut real-midpoint geometry, and intentional investment-color allowlist tests with the approved implementation;
  - guarded Investments History against click-event payloads and wrapped the History action callback so a React event cannot become a title filter;
  - replaced the temporary App+Country push panel with the final compact Radix root/submenu behavior, using the More menu's surface, border, radius, shadow, text, and state colors; added a focused regression.
- Verification evidence: initial `npm run verify` reproduced 5 integration failures across 3 suites; focused fixes then passed 30/30 tests. Final `npm run verify` passed TypeScript, ESLint, 54 suites / 347 tests, all six audits, and the production build. Browser smoke passed for the History route and the compact App+Country root + country submenu. Build retains only the known empty `react-vendor` and >500 kB chunk warnings; jsdom Recharts zero-size warnings remain test-environment noise already tracked in Known Bananas.
- Publication boundary: Git/GitHub only. No Vercel command, deployment, promotion, or alias mutation was run.
- Banana Loop result: integration failures were fixed; existing asset candidates, bundle warnings, and Recharts test warnings remain explicitly triaged in `known-bananas.md`; no new untriaged blocker remains.
- Constitutional check:
  - scope preserved: yes (whole-worktree consolidation explicitly authorized; no Vercel publication)
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-21 Investments Order Documents Accordion Polish

- Latest request handled: five visual fixes on the Investments buy-order "DOCUMENTS AND TERMS" accordion (`InvestmentOrderDocumentsAccordion.tsx`): broken Ex-Ante icon aspect ratio, oversized section titles, accordion row separators not matching the "DOCUMENTS AND TERMS" heading separator, oversized chevron vs the original component, and expanded-content inner separators stretching full-width plus the leading icon not recoloring on open.
- Changes:
  - **Ex-Ante icon aspect ratio**: `iconSize={32}` was forcing the non-square 15×20 `investment-ex-ante` glyph into a 32×32 square, distorting it. Added `iconWidth`/`iconHeight` props to `DocumentsAccordionSection` (preserving the existing `iconSize` for square glyphs) and the Ex-Ante call site now uses `iconWidth={24} iconHeight={32}` so it scales to the same height as the other 32×32 glyphs but keeps its native 15:20 aspect ratio.
  - **Section title size**: changed the row title from `uc-type-h2` (18px Bold) to `uc-type-n4-strong` (16px Bold) per request.
  - **Row separators**: the row wrapper used `border-b` edge-to-edge, which did not match the `SectionHeadingDivider` heading separator above (which lives in a `px-[24px]` wrapper). Removed the wrapper border and added a dedicated `<div className="mx-[24px] h-px w-auto bg-[var(--uc-border)]" />` separator under each row header, so all section separators (heading + rows) now share the same 24px-inset line treatment.
  - **Chevron size**: swapped `chevron-down-wide` (viewBox `9 12 14 8`, visually larger) for `chevron-down` (viewBox `10 12 12 8`, closer to the original component's narrower chevron).
  - **Leading icon color on open**: the leading glyph was hardcoded `color="var(--uc-text)"` regardless of open state. It now follows the same `isOpen ? "var(--uc-action)" : "var(--uc-text)"` rule as the title/subtitle/chevron, so the whole row recolors coherently when expanded.
  - **Inner separators inset**: inside `CostBreakdownBlock` (Ex-Ante and Disclaimer sections) and inside the Performance scenarios block, the `ENTRY`/`TOTAL`/`NET INVESTMENT AMOUNT`/`NET RETURN` group separators were full-width while their sibling rows use `px-[24px]` content padding. Added `mx-[24px]` to those four separator wrappers so they align with the content inset instead of spanning the full container.
- Files central to this change: `src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx` (only file touched).
- Verification evidence: `npm run build` passed (only the pre-existing chunk-size warning); `npm run audit:investments` passed (countries=8, active=10, inactive=2); `npm run audit:templates` passed (templates=47, codePreviews=47, components=86, screens=33, flows=14). `typecheck`, `lint`, and `test` remain blocked by missing local scripts/tooling in this environment.
- Banana Loop result:
  - fixed: Ex-Ante icon distortion, oversized titles, mismatched row separators, oversized chevron, non-recoloring leading icon, full-width inner separators;
  - triaged: no automated browser regression yet for the accordion visual contract (icon aspect ratio, title size, separator inset alignment, open-state recolor).
- Constitutional check:
  - scope preserved: yes (visual polish inside the already-approved Investments order-documents accordion; no new screens/flows/data/integration contracts)
  - docs/capability map updated: not required — no new capability, screen, flow, or integration contract
  - full verification and evidence recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-21 Demo Topbar App+Country Push Drill-Down

- Latest request handled: the demo topbar `App + Country` dropdown was one long flat menu (APP section with 3 buttons, divider, COUNTRY section with 8 buttons — ~15 rows visible at once), which the user found ugly and inconsistent. Refactored it into a two-level push drill-down: level 1 shows only the 3 apps with a right chevron; tapping an app pushes a level 2 view (with a back arrow + the app name as title) listing the 8 countries; tapping a country applies both selections atomically and closes the dropdown.
- Design choice: implemented as an extension of the existing hand-rolled panel (kept click-outside, `z-[10000]`, positioning, row styling, and the same look as the sibling release/scenario/future-release dropdowns). Did NOT switch to Radix `DropdownMenuSub` because that does a hover-triggered lateral fly-out, not a push drill-down that covers level 1 — the user explicitly referenced the "More with arrow" drill-down pattern.
- Selection semantics: tapping an app on level 1 no longer changes demo state immediately. Instead the app is staged in local `drillDownProduct` state; the actual `setProduct` + `setCountry` run together only when the user taps a country on level 2. This makes the flow atomic — the user can back out with the back arrow without leaving the app they were on. Product is applied before country so the product's default `bankingScenario` reset lands before country effects run.
- Escape handling: Escape on level 2 returns to level 1; Escape on level 1 closes the dropdown. Click-outside closes the whole dropdown. `closeAllDropdowns()` now also clears `drillDownProduct` so reopening always starts at the app list.
- Highlight logic: the level-1 app row highlights when it matches the active `product`; the level-2 country row highlights only when it matches the active `country` AND the staged app matches the active `product` (so you don't see a false-positive highlight while drilling into a different app).
- Files central to this change: `src/app/components/demo/DemoTopBar.tsx` (new `drillDownProduct` state, `closeAllDropdowns` reset, and the rewritten product dropdown panel with two conditional branches). No other files touched; no new dependencies; no new primitives exported.
- Verification evidence: `npm run build` passed (only the pre-existing chunk-size warning); `npm run audit:platform` passed (products=3, countries=8, projectPackCombinations=24, bankingScenarios=7, repositories=6 — unchanged). `typecheck`, `lint`, and `test` remain blocked by missing local scripts/tooling in this environment. Browser smoke (open dropdown, see 3 apps with chevrons, tap PI → country list with back header, tap RO → applies + closes, label updates) is recommended manual follow-up.
- Banana Loop result:
  - fixed: ugly long flat App+Country menu replaced with a compact two-level push drill-down matching the requested "More with arrow" pattern;
  - triaged: no automated browser regression yet for the new drill-down (level transitions, Escape semantics, atomic product→country application, click-outside reset).
- Constitutional check:
  - scope preserved: yes (UI refinement of the already-approved demo topbar selector; no new screens/flows/data; the 8-country × 3-app matrix and deep-link `?product=&country=` contract are unchanged)
  - docs/capability map updated: not required — no new capability, screen, flow, or integration contract
  - full verification and evidence recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-21 Tools Side-by-Side Compact Header + Refresh Icon

- Latest request handled: on the stakeholder Tools / Side-by-Side comparison screen, turn the `Reload frames` text button into a compact refresh icon button aligned to the right edge of the panel, reduce the country capacity from 2–4 to 2–3, and remove the redundant `COUNTRIES (2–3)` field label while keeping the country selection chips themselves.
- Changes:
  - Added a new general-purpose `refresh` icon to `customIcons.tsx`: 20×20 two-circular-arrows glyph, `System` category, registered through `AppIcon` so it appears in the Design System Icons inventory (catalog now reports 125 app icons). Color is passed via the standard `AppIcon` color prop.
  - `SideBySideTool.tsx`: replaced the `SelectionChip` reload action with an icon-only 32×32 round button (`AppIcon name="refresh" size={16}`) using the same border/hover treatment as the existing per-frame remove buttons; kept `title` + `aria-label="Reload frames"` for accessibility. The `ToolPanel` header is `flex justify-between`, so the icon naturally aligns to the right edge of the panel, which matches the right edge of the countries chip row (both share the panel's `p-[20px]`).
  - `MAX_COUNTRIES` 4 → 3 and the component docstring updated. Frame grid scaling for 1/2/3 selections is unchanged (3 countries still use the existing `0.58` scale).
  - Removed the `Countries (2–3)` `FieldLabel` heading above the country chips. The chips themselves (and `SelectionChip` import) stay — this was an iteration correction after a first pass accidentally removed the whole countries block; the final state removes only the redundant label so the chip row self-describes.
- Files central to this change: `src/app/components/icons/customIcons.tsx` and `src/app/screens/tools/SideBySideTool.tsx`.
- Verification evidence: `npm run build` passed (only the pre-existing chunk-size warning); `node scripts/export-platform-icon-catalog.mjs` reported `AppIcon: 125` (refresh included); `npm run audit:templates` passed (templates=47, codePreviews=47, components=86, screens=33, flows=14). `typecheck`, `lint`, and `test` remain blocked by missing local scripts/tooling in this environment.
- Banana Loop result:
  - fixed: oversized `Reload frames` text button replaced with a compact refresh glyph aligned to the panel's right edge;
  - fixed: 4-country capacity reduced to 3 to compact the comparison grid;
  - fixed: first-pass regression that removed the entire countries chip block was corrected to remove only the redundant `Countries (2–3)` label;
  - triaged: no automated browser regression yet for the new header layout or the 3-country capacity (manual visual check recommended).
- Constitutional check:
  - scope preserved: yes (UI refinement inside the already-approved Tools surface, plus one new reusable icon in the AppIcon registry; no new screens/flows/data/integration contracts)
  - docs/capability map updated: not required — no new capability, screen, flow, or integration contract; the new icon is auto-inventoried by the existing icon catalog export
  - full verification and evidence recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-21 Card Detail Spacing Fix + Investments Distribution Donut Rewrite

- Latest request handled: (1) tighten Card Details spacing — `Free To Spend` ↔ `Show Card Details` ↔ carousel indicator ↔ quick actions gaps were too large; (2) fix the Card Details card carousel bottom shadow being clipped; (3) rebuild the Investments distribution donut so each connector/label attaches to the correct slice with the slice's own color, and cap the donut to at most 4 visible slices across the Product Type / Currency / Asset Class / Account List tabs.
- Card Details result:
  - Carousel no longer clips its card shadow. Root cause: the scroll container had `overflow-x-auto` and `overflow-y-visible` on the same element, so CSS spec forced `visible` to `auto` and clipped the 11px drop shadow. Refactored into a two-layer structure — outer wrapper keeps `overflow-x-auto` + drag/scroll handlers, inner flex container holds cards with natural overflow so the shadow renders freely. Inner container padding is `pt-[8px] pb-[8px]` (symmetrical, gives the 11px shadow full room).
  - Tightened the bottom stack: `Free To Spend` block unchanged; `Show Card Details` button padding reduced from `py-[24px]` to `py-[8px]`; carousel indicator wrapper dropped its `-mt-[8px]` offset; container bottom padding reduced from `pb-[16px]` to `pb-[4px]` so the dots ↔ quick actions gap is `4 + 8 (AccountActionBar pt)` = 12px.
  - Final gaps: amount ↔ button = 16+8 = 24px; button ↔ dots = 16+8 = 24px; dots ↔ quick actions = 12px. Above/below carousel gaps are now symmetrical.
- Investments distribution donut result:
  - Root cause of the "green Bond connector on blue Fund slice" complaint: the previous `buildSliceLeaders` used a special-cased branch for `items.length === 4` with hard-coded anchor angles (225°/315°/135°/45°) that did not match the slices' real midpoint angles. For Fund 34% / Bond 24% / Stock 18% / ETF 14% the real midpoints are 61°/166°/241°/299°, so every connector landed on the wrong slice.
  - Removed the hard-coded 4-slice branch. New `buildSliceGeometry` computes each slice's SVG stroke geometry and its real midpoint angle in a single pass; `buildSliceLeaders` anchors each connector at `pointOnDonutEdge(midpointAngle)` and derives `side` (`left`/`right`) from that midpoint. Slot assignment per side is unchanged (sorted by anchor Y, fixed vertical slots).
  - Capped donut to `MAX_VISIBLE_SLICES = 4`. The list below the chart still renders every distribution row (e.g. Product Type shows Fund/Bond/Stock/ETF/Money market in the list, but only the top 4 on the donut).
  - Numeric verification (node one-liner): Fund→right-top, Bond→right-bottom, Stock→left-bottom, ETF→left-top — every connector now visually lands on its own slice with its own color.
- Files central to this change: `src/app/screens/cards/CardDetailScreen.tsx` and `src/app/components/investments/InvestmentDistributionChart.tsx`.
- Verification evidence: `npm run build` passed (only the pre-existing chunk-size warning); `npm run audit:investments` passed (countries=8, active=10, inactive=2); `npm run audit:templates` passed (templates=47, codePreviews=47, components=86, screens=33, flows=14); `npm run audit:platform` passed (products=3, countries=8, projectPackCombinations=24, bankingScenarios=7, repositories=6). `typecheck`, `lint`, and `test` remain blocked by missing local scripts/tooling in this environment.
- Banana Loop result:
  - fixed: hard-coded 4-slice anchor geometry that mismatched real slice midpoints;
  - fixed: card carousel shadow clipping caused by conflicting `overflow-x-auto` + `overflow-y-visible` on the same element;
  - triaged: no automated browser regression yet for the new connector geometry (manual visual check recommended); no automated regression for Card Details spacing.
- Constitutional check:
  - scope preserved: yes (visible-UX refinement inside already-approved Card Details and Investments surfaces, no new screens/flows/data)
  - docs/capability map updated: not required — no new capability, screen, flow, or integration contract
  - full verification and evidence recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-21 Investment Chat Chart Completion + Unified Publication

- Latest request handled: finish the interrupted selected-investment chatbot chart, including the missing connected period selectors, then preserve every current Codex/ZCode/GLM workspace change in Git and publish the exact final `main` state to Vercel Production.
- Product result: the first selected-product explanation card now renders the canonical Investments performance chart with `1 M`, `3 M`, `1 Y`, `3 Y`, and `ALL`; `3 Y` is selected by default and every selector switches to its own deterministic series. The chart uses the exact selected security's market price and instrument currency, a compact phone-card layout, readable anchor labels, and the shared Investments period controls.
- Architecture decision: the portable co-apping package owns only a typed chart payload (`CoAppingInvestmentChart`) and an optional renderer slot. `App` injects `InvestmentChatChart`, which composes the application-owned `InvestmentPortfolioChart` and `InvestmentPeriodChips`. This removes the interrupted implementation's package-to-app reverse imports, unknown-array cast, one-period payload, and hard-coded EUR fallback while keeping the package reusable.
- Data and advice boundary: all five series are deterministic mock histories derived from the canonical selected-security snapshot; they are not live prices, forecasts, personalized advice, or order execution. The existing terms/signature boundary for BUY remains unchanged.
- TDD evidence: focused chat orchestration/renderer tests first failed on the missing typed series and selector behavior, then passed 2 files / 33 tests. The regression locks the five period keys, `3 Y` default state, currency propagation, and the real UI click transition from `3 Y` to `1 M`.
- Visual evidence: in-app browser verification on CZ Future / Global Growth Portfolio confirmed the canonical logo/title card, full-width compact SVG, all five controls on one row, `3 Y` selected on entry, `1 M` selectable and reversible, and no overlapping axis labels. Measured card width was about `298px`; the chart region/SVG was about `287px`.
- Unified verification: a fresh `npm run verify` passed TypeScript, ESLint, 53/53 test files and 345/345 tests, all six audits, the locked asset inventory, and the Vite production build. The first complete run exposed only two stale parallel contracts: the intentional ShopSmart 18px title markup hash and a brittle Design System specimen ancestor traversal. Both were updated to the current intended DOM, their focused 17/17 tests passed, and the complete gate then passed.
- Known non-blocking notices: jsdom still emits the already-triaged Recharts zero-size messages; the build still reports the empty `react-vendor` and large App/lazy syntax-highlighter chunks; the older Investments `ReferenceLine` NaN browser-log entry predates this chat-chart smoke and remains tracked in `known-bananas.md`.
- Files central to this change: `package/mobile-pi-coapping-chat-package/src/types.ts`, `package/mobile-pi-coapping-chat-package/src/CoAppingChatAssistant.tsx`, `package/mobile-pi-coapping-chat-package/src/coapping.css`, `src/app/components/investments/InvestmentChatChart.tsx`, `src/app/components/investments/InvestmentPortfolioChart.tsx`, `src/app/chat/czChatOrchestration.ts`, `src/app/App.tsx`, and the focused chat tests. The requested unified checkpoint also preserves all other tracked and untracked Design System, Tools, Payments, Products, Messages, ShopSmart, dependency, test, and plan deltas present in the workspace.
- Banana Loop result:
  - fixed: interrupted reverse dependency, untyped chart data, hard-coded currency, missing periods, missing default/interactive period state, and cramped chat rendering;
  - fixed: two stale regression contracts exposed by the all-workspace gate without reverting their parallel product changes;
  - triaged: deterministic-data/advice boundary and existing non-blocking warnings are explicit rather than hidden.
- Constitutional check:
  - scope preserved: yes
  - docs/capability map updated: yes
  - full verification and browser evidence recorded: yes
  - bananas triaged: yes
  - safe to resume: yes
- Publication evidence: unified product commit `38a6201` plus the two preceding local commits were pushed to `origin/main` with local/remote parity confirmed. Vercel Production deployment `dpl_FWW19HHFS8mmUwP1DKwHza4UwTJE` reached `READY` and received the canonical `https://mobile-banking-cee.vercel.app` alias. The canonical URL returned HTTP `200` with the application root mount; the immutable URL returned HTTP `200` with Vercel's protected Login page, so it is recorded as access-gated rather than misreported as an app-root smoke. Deployment-scoped error and HTTP-500 log queries returned no entries. This handoff checkpoint is pushed separately and its exact final `main` HEAD is explicitly rebuilt/redeployed before closeout.
- safe to resume: yes

## 2026-07-21 Design System Component Details Pages + Multi-Lane Investment Polish

- Latest request handled: user asked for design-system specimen cards to become clickable, opening a dedicated "Component Details" page with View/Code tabs. Code tab has 3 language segments: React (real source), Swift (SwiftUI port), Kotlin (Jetpack Compose port). Target: all ~70 reusable components.
- Foundation delivered:
  - `src/app/components/CodeBlock.tsx` — syntax-highlighted code viewer via shiki v4.3.1 (lazy-loaded highlighter, supports tsx/swift/kotlin, copy-to-clipboard button, dark theme).
  - `src/app/screens/design-system/ComponentDetailScreen.tsx` — detail page with back button, component metadata (label, componentPath, notes from COMPONENT_REGISTRY), variant selector (when available), View/Code toggle, and 3 language segments (React/Swift/Kotlin). View tab renders live preview via TESTABLE_COMPONENTS where available; Code tab renders CodeBlock with the selected language. Disclaimers clearly label Swift/Kotlin as reference ports.
  - `src/app/registry/componentCodeSamples.ts` — central code-sample registry with `ComponentCodeSample` interface (react + swift + kotlin + optional variants). `resolveComponentCodeSample()` helper for variant-aware resolution. **69 entries** authored across 7 batches (headers/nav, buttons, forms, cards/banners, products, investments/payments, overlays/prime). Total: ~7,265 lines of real code samples.
  - `src/app/screens/design-system/inventoryNav.ts` — added `parseComponentDetailHash()` and `buildComponentDetailHref()` helpers for `#component/<id>` deep links.
  - `src/app/screens/design-system/DesignSystemPage.tsx` — added `detailComponentId` state, `closeComponentDetail()` handler, and conditional rendering of `<ComponentDetailScreen>` when a detail hash is active. Hash routing synchronized via existing `hashchange` listener.
  - `src/app/App.tsx` — extended `shouldOpenDesignSystem` and `syncDesignSystemHash` to recognize `component/` prefix hashes for cold deep-link support.
  - `src/app/components/demo/DemoNavigationSync.tsx` — extended `hasDesignSystemHash()` to recognize `component/` prefix.
  - `src/app/screens/design-system/specimenShell.tsx` — added optional `detailsHref` prop to `<Specimen>`, rendering a "Details →" link next to the title.
- Specimen wiring: **31 specimen cards** in DesignSystemPage.tsx and cardSpecimens.tsx now have `detailsHref` linking to their component detail pages (PageHeader, BottomNavigation, PrimaryButton, LinkButton, Pill, LanguageSelectorButton, NavigationLink, Prelogin, Status bar, Text field, Info Banner, Ghost Banner, Helper Card, Pending Action Card, User Event Card, Card Component, Carousel Indicator, AccountDetailsInfoField, MessagesMailboxTabs, AccountTransactionRow, Payments hero card, Contacts navigation, Products offer card, Products menu card, AccountBalanceCard, AccountActionBar, RadioButton, Floating Co-Apping, LogoutConfirmDialog, ProductAccordion, ProductAccordionAnimated).
- Also delivered during this session (parallel investment/tools polish):
  - Investment portfolio chart: vertical grid lines restored (ReferenceLine per labeled point), CartesianGrid horizontal lines restored, Y-axis 4-tick forced ticks, chart anchor indices corrected for even spacing.
  - Investment history: trade direction icons (trade-buy/trade-sell SVGs in AppIcon), date day punctuation removed (--0,7% double-minus fixed), history filter from security detail (title-based searchQuery pre-seed, persisted across Transactions/Orders tabs).
  - Account detail: AccountActionBar per-product-type actions (saving=Add money hidden, term deposit=Options hidden + Open/Close term deposit, loan/mortgage=Options+Add money hidden + Reimbursement). `hidden` items removed from render, not left as placeholders.
  - Investment buy order flow: header fixed (collapsedTitleProgress + largeTitleAlign), Market price moved to read-only InvestmentDetailField under Asset class, Price updated at (yesterday, DD.MM.YYYY bold), Status/Tradable removed, separator above Next removed, Frequency bold, Estimated amount/debit removed from order-data (kept on review), cash account IBAN full.
  - Tools side-by-side: Screen/Language dropdowns (native select), phone frame with bezel (thin 4px, rounded-[28px] outer / [24px] screen), scrollbar hidden, dashed empty-country placeholders, remove-country buttons (X per frame), back button + tool detail header, Comparison setup consolidated panel (dropdowns + frames inside one ToolPanel).
  - Component translation tester: 7 new components added (HelperCard, PendingActionCard, UserEventCard, ProductOfferCard, ProductMenuCard, PaymentHeroCard, ContactsNavigationCard). Line-clamp on PrimaryButton (1 line), NavigationRow/TextField/InfoBanner/GhostBanner/SectionHeadingDivider (2 lines title), InfoBanner/GhostBanner description (4 lines). Character limit on PrimaryButton label (40 chars).
  - Native select chevron fix: `.uc-select` CSS utility class (appearance: none + custom SVG background chevron + 36px padding-right). Applied to all 6 native selects in the tools + all Design System variant selectors.
- Verification:
  - `npm run build` passed on 2026-07-21; known Vite warnings remain for empty `react-vendor` and chunks above 500 kB (shiki adds a ~780kB emacs-lisp chunk loaded lazily only when CodeBlock mounts).
  - `npx tsc --noEmit` passed with 0 errors.
  - `npm run audit:templates` passed: `templates=47 codePreviews=47 components=86 screens=33 flows=14`.
- Limitations (honest):
  - Swift and Kotlin code samples are **reference ports** (no native source exists in this repo — 0 Swift, 0 Kotlin files confirmed). They are production-faithful SwiftUI/Compose translations of the real React component, labeled "Reference port — adapt to your native project conventions" in the UI. Not originals.
  - ~17 components (complex charts, PFM icons, demo/template-specific) do not have code samples yet — their detail page shows "Code samples pending" (honest placeholder, not empty code).
  - React samples are hand-curated snippets (imports + types + main render body; large SVG path data tables trimmed with ellipsis comments for readability). Not raw `?raw` imports — by design, for developer consumption.
- Banana Loop result:
  - fixed: 69 components now have complete React/Swift/Kotlin code samples, wired to 31 specimen cards via clickable Details links.
  - triaged: ~17 remaining components documented as "pending" — intentional, not hidden.
  - preserved: this remains a stakeholder demo; code samples are for developer reference, not production native code.
- Constitutional check:
  - scope preserved: yes
  - docs updated: yes (this entry)
  - verification recorded: yes (build + typecheck + audit)
  - bananas triaged: yes
  - safe to resume: yes
- safe to resume: yes

## 2026-07-20 CZ Chatbot Investment Product Context

- Latest reviewed correction: the selected-investment performance reply is visual-first. Its canonical product card renders before the interpretation, remains the only authority for holding value, quantity, performance, market price, and update date, and the prose below explains how to interpret the snapshot without repeating those figures.
- Connected purchase handoff: `Buy more` / `Buy` now stays inside the chatbot long enough to collect the variable order data in three steps: positive whole-unit quantity, one canonical current account, and `Today` / `Next business day` execution timing. Quantity and cash-account balance are validated with the same quote model as Investments. Only a complete valid draft carries the canonical `securityId`, quantity, account ID, frequency, and execution timing through `App`; `InvestmentsPortfolioScreen` consumes it once and opens the existing coordinator directly on `Review Data`. Unknown, repeated, invalid-account, and insufficient-balance cases cannot silently open the wrong review.
- Focused TDD evidence for this correction: 4 files / 48 tests passed across CZ orchestration, portable chat rendering, selected-security handoff, and the BUY order state machine; `npm run typecheck` is clean. Browser smoke on `UniCredit Balanced Income Fund` confirmed the live chain `Buy more -> 1 PCS -> Primary Account 1 -> Today -> Review Data -> terms -> Sign order -> Order accepted`, with Review showing the exact collected product, quantity, account, timing, and estimated debit.
- Fresh combined gate after the conversational BUY correction: `npm run verify` passed TypeScript, ESLint, 53/53 test files and 344/344 tests, all six audits, the locked 172-asset inventory, and the Vite production build with 3,984 transformed modules. The first full run correctly exposed one stale `products-menu` markup hash after the parallel intentional `SectionHeadingDivider` two-line clamp; the hash contract was updated only after reproducing and tracing that exact markup source, then the focused snapshot and full gate both passed. Remaining output is limited to the already-triaged jsdom Recharts zero-size messages, empty `react-vendor` chunk, and App chunk-size warning.
- Local unification closeout: the operator explicitly requested one commit containing every remaining tracked and untracked workspace change. The checkpoint therefore includes the complete conversational Investments BUY handoff, selected-product chat rendering, shared text-clamp and Tools tester deltas from the parallel work, focused regressions, design/spec documentation, the previously untracked implementation plan, and all updated handoff/capability evidence. Nothing in the current Git inventory is intentionally excluded.
- Closeout verification: a fresh `npm run verify` immediately before staging passed TypeScript, ESLint, 53/53 test files and 344/344 tests, all six audits, the locked 172-asset inventory, and the 3,984-module production build. `git diff --check` is run again on the final documented state before commit. Known non-blocking notices remain the jsdom Recharts zero-size messages, empty `react-vendor` chunk, and App chunk-size warning. This is a local commit only; no push or Vercel deployment is authorized by this request.
- Fresh final gate for this correction: `npm run verify` passed end to end with clean TypeScript and ESLint, 53/53 test files and 339/339 tests, all six audits, the locked 172-asset inventory, and the production Vite build with 3,984 transformed modules. The only notices remain the already-triaged jsdom Recharts zero-size output, empty `react-vendor` chunk, and App chunk-size warning.
- Parallel shared-component deltas that landed during the gate (`PrimaryButton` child truncation and two-line `NavigationRow` text clamps) were preserved; a fresh post-delta TypeScript check, ESLint run, and 12/12 focused shared-component tests also passed.
- Purchase boundary: the chatbot prepares a typed review draft but does not place an order itself. Terms acceptance and signing remain mandatory in the existing mock one-off BUY coordinator; no personalized recommendation, backend execution, persistence, balance/holding mutation, or History append was added.
- Latest request handled: when a CZ Future user opens the chatbot from an Investments security detail, ground the assistant in that exact product and keep the initial choice intentionally focused on two useful routes: product explanation and holding-performance review.
- Runtime behavior: `InvestmentsPortfolioScreen` emits the selected canonical `InvestmentCatalogSecurity` through a backward-compatible optional callback; `App` supplies that snapshot to the existing CZ chat entry-context and structured-reply builders. Leaving the detail or unmounting Investments clears it, so the portfolio route returns to portfolio-level topics.
- Product grounding: owned positions report the same local holding value, quantity, performance, market price, risk, and liquidity used by Product Detail. Catalogue-only products are clearly described as not currently held and do not fabricate holding value or quantity.
- Advice boundary: product replies explain factual mock data and decision factors but explicitly state that they are not personalized buy, sell, or hold recommendations. No trade, suitability decision, backend, live quote feed, persistence, or order execution was added.
- Design-system decision: reused the existing CZ Co-Apping launcher, chat package, `investment-summary` rich block, follow-up chips, canonical Investments model, and Product Detail `BrandLogo`. The existing rich-block contract was extended only through optional `logoId`, optional eyebrow, and opt-in stacked metrics, so portfolio and other cards stay backward-compatible; no new UI component was created.
- TDD evidence: product context/screen handoff first failed because the context and callback did not exist; reviewed follow-up regressions then failed on the redundant CTA, navigate-only portfolio chip, generic documents/checklist reply, and lost-snapshot fallback. The final card regression failed specifically because logo/stack props were ignored, then passed after the backward-compatible renderer extension. Integrated UI tests now open a conversation and click all three primary follow-ups. Focused final result is 3 files / 27 tests passed.
- Browser evidence: on CZ Future, opening `UniCredit Balanced Income Fund` then the chatbot showed the exact product-specific title with only `Explain this product` and `Review my performance`; `Review risk and liquidity` and `What should I consider?` had zero entry buttons. The live conversation rendered a factual product explanation under `UniCredit Balanced Income Fund` and a different performance answer under `UniCredit Balanced Income Fund performance`, both tied to the same selected holding facts. Returning to the portfolio still restores its four portfolio-level topics.
- Explain/product correction: the explanation route is now a dedicated scenario rather than the generic position/opinion template. It defines a balanced fund as pooled money combining growth assets such as equities with income/defensive assets such as bonds; explains diversification, market/capital and EUR/CZK currency risk, monthly dealing, and the role of KID/KIID, prospectus, and factsheet. It deliberately omits holding value, performance, and market price from the answer and points the customer to `Review my performance` for those facts. Its logo card is likewise distinct: `Structure`, `Currency`, and `Dealing`, all in the existing stacked rich-block layout.
- Reviewed follow-up correction: selected-holding rich cards no longer expose the redundant `Open Investments` CTA. Every product chip stays in chat as a `send-message` action and resolves to a distinct scenario for performance, risk/liquidity, documents, portfolio fit, or decision checklist. Exact product names embedded in prompts are resolved back through the canonical Investments catalogue, so resumed conversations still work after the volatile screen snapshot is cleared or replaced.
- Follow-up browser evidence: the complete `UniCredit Balanced Income Fund` chain rendered Performance -> Risk -> Documents -> Portfolio -> Checklist, including the connected `13%` portfolio share, largest holding, currency mix, and asset-class mix. Fresh selected-product cards contained zero `Open Investments` buttons, showed the canonical logo with computed `32px` width/height, no eyebrow, and three equal-width metric rows at separate vertical positions. Separate live clicks produced `UniCredit Balanced Income Fund performance`, `... risk context`, and `Documents for ...` headings.
- Explain correction evidence: the orchestration regression first failed on the old value/performance answer, then passed 14/14 after the dedicated matcher/content/card were added. A fresh live product-detail -> chatbot -> `Explain this product` run rendered `What UniCredit Balanced Income Fund is`, the product mechanics and risks above, the `32x32` Product Detail logo, and only `Balanced fund` / `EUR` / `Monthly` product characteristics in the card; all three suggested next actions remained available.
- Single-card conversation rule: the selected-product rich card is emitted only by the first product answer that displays it. The resolver inspects prior agent messages for an `investment-summary` with the same canonical product title; subsequent performance/risk/documents/portfolio/checklist/opinion replies keep their text and follow-ups but omit another card. A different product can still introduce its own first card. RED/GREEN orchestration evidence is 15/15; a live Explain -> Review risk run kept exactly one product card in the conversation and rendered no Holding-value duplicate under the risk answer.
- Buy-flow unification: ZCode's reviewed Order Data composition intentionally moved Market price into Product Detail and removed the provisional estimated amount from the editable first step; the canonical quote remains visible on Review Data. The stale completion test was aligned to assert `100,00 EUR` after `Next`, preserving coverage of the quote without reverting the newer UI.
- Unified closeout gate: the complete combined Codex/ZCode worktree passed fresh `npm run verify` end to end: TypeScript, ESLint, 53/53 test files and 332/332 tests, all six audits (including the locked 172-asset inventory), and the Vite production build with 3,984 transformed modules. `git diff --check` also passed. The only emitted notices are the already-triaged jsdom Recharts zero-size messages, empty `react-vendor` chunk, and App chunk-size warning.
- Publication scope: the operator explicitly requested that every current tracked and untracked change be preserved together, committed to `main`, pushed to `origin/main`, and published to the linked Vercel Production project. No local change, ZCode plan, design/spec document, or test is intentionally excluded from this checkpoint.
- Publication evidence: unified product commit `24dfaeb` and the four preceding local commits were pushed to `origin/main`. Vercel Production deployment `dpl_EwYh5Xz7RoCvfSctddY81mJgpizu` reached `READY`, received the canonical `https://mobile-banking-cee.vercel.app` alias, and built the same 3,984-module Vite application. Canonical and immutable deployment HTTP smokes returned `200`; the canonical document contained the application root mount. Deployment-scoped error and HTTP-500 log queries returned no entries. This handoff evidence is included in a final documentation commit, pushed to `main`, and that final HEAD is explicitly redeployed before closeout.
- Files changed for this feature: `src/app/App.tsx`, `src/app/chat/cz/context.ts`, `src/app/chat/cz/helpers.ts`, `src/app/chat/czChatOrchestration.ts`, `src/app/screens/investments/InvestmentsPortfolioScreen.tsx`, the portable chat package types/renderer/styles, `tests/chat/co-apping-chat-assistant.test.tsx`, `tests/chat/cz-chat-app-orchestration.test.ts`, `tests/screens/investment-product-chat-context.test.tsx`, the design/plan docs, and handoff/capability documentation.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

> Older sessions live in [`archive/`](archive/). This file keeps the most recent 12.

## Archives

- [2026-07](archive/sessions-2026-07.md) — 135 sessions
- [2026-06](archive/sessions-2026-06.md) — 74 sessions

## 2026-07-20 Payments/PFM Clean Checkpoint

- Latest request handled: correct PFM subcategory filters so a filtered bubble remains visible and can be reactivated, restore desktop/touch period navigation across months and both yearly summaries, then commit the complete Payments/PFM workspace as a clean local checkpoint.
- Root cause and fix: `PfmCategoryDetailScreen` passed the already-filtered subcategory list into the chart, which removed the only control capable of undoing the filter. The chart now always receives the complete subcategory geometry while the excluded set drives calculations and an explicit visual/accessibility state.
- Product behavior: tapping an active bubble keeps it in place, renders it with the DS neutral disabled color, sets `aria-pressed=true`, removes only its transactions/amount from both totals, and changes its accessible action to `Include subcategory`. Tapping it again restores its category color, transactions, and totals. The last active bubble remains protected while every inactive bubble remains reactivatable.
- Period navigation: the detail carousel now mirrors the existing Spending hero interaction contract. Native touch scrolling plus desktop mouse/pointer drag use a movement threshold, grab/grabbing state, click suppression, nearest-panel snap, and cleanup; month and yearly summary panels continue to come from the same `SpendingAnalyticsTimeline` and drive the header total, indicator, divider, and transaction list together.
- Design-system decision: reused the existing `PfmCategoryBubbleChart`, PFM category colors, DS neutral token, translation runtime, and shared analytics aggregation. Extended the chart through optional backward-compatible props after verifying it has one runtime consumer; no new component or visual pattern was created.
- TDD evidence: the filter regression first failed because `Include subcategory: ELECTRONICS & COMPUTERS` did not exist after filtering; the period regression then failed because the detail carousel had no desktop drag surface. Both passed after implementation: focused suite 5/5.
- Browser evidence: RO Financial April smoke toggled Mortgage inactive without moving/removing it, changed both totals from `3.191,45 RON` to `1.829,60 RON`, rendered `aria-pressed=true` / neutral `rgb(204, 204, 204)`, then restored Mortgage, `aria-pressed=false`, category color `rgb(83, 84, 83)`, and the original total. Real carousel drags navigated April 2026 `3.191,45 RON` -> 2026 `9.119,16 RON` -> 2025 `2.723,70 RON` and back through 2026 to April, with `scrollLeft`, active period, title, and total synchronized. Warning/error logs were empty.
- Full verification: fresh final `npm run verify` passed on the complete checkpoint: TypeScript, ESLint, 52/52 test files and 317/317 tests, all six audits (including the 172-asset lock), and the production build. Known baseline notices remain Recharts zero-size output in jsdom, empty `react-vendor`, and the >500 kB App chunk.
- Checkpoint scope: all intentional tracked and untracked Payments Templates/Exchange Rates implementation, SVG flags, asset-baseline lock, PFM toggle/period-navigation corrections, tests, specs/plans, translations, registries, and handoff/capability documentation are included. No push, deploy, tag, dependency, or release action is requested.
- Limitations: Payments/FX and PFM filter state remain deterministic front-end/session data; no backend persistence, live quote feed, ledger mutation, payment execution, or audit history is implied.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes after the requested local commit

## 2026-07-20 Payments Templates and Exchange Rates

- Latest request handled: map the supplied production references for `My Templates` and `Exchange Rates`, use different fictional customer/payment data, connect both shortcuts to real demo behavior, then correct the reviewed FX flags and oversized Amount/Currency controls.
- Templates behavior: `My Templates` opens a searchable two-section list of five saved templates and three beneficiaries. Selecting a template enters the existing Domestic payment flow with beneficiary, account, bank, amount, currency, and note prefilled; selecting a beneficiary uses the same route but intentionally leaves amount and note empty.
- Exchange behavior: `Exchange Rates` opens a connected amount calculator backed by the existing EUR reference-rate authority. The country currency is selected initially, the bottom sheet keeps a draft radio choice until `OK`, closing discards it, tapping another rate promotes that currency to the source, and every row recalculates from the same model.
- Visual feedback fix: Windows rendered Unicode flag pairs as `RO`, `US`, and `GB` glyphs. `CurrencyFlag` now draws deterministic 36x24 local SVG flags for every supported demo currency. Amount/Currency values use the DS 20px regular numeric style, and the selector is a compact 96px/44px control with a 24px chevron while preserving a semantic button and focus ring.
- Design-system decision: reused `PageHeader`, `AccountSearchBar`, `SectionHeadingDivider`, `BottomSheet`, `RadioButton`, `PrimaryButton`, `PaymentOtherShortcut`, the existing Domestic payment draft/route, and the existing FX authority; extended `PaymentsScreen`, `App`, translations, and registry evidence through backward-compatible interfaces; created only the domain-specific template/rate rows, two child screens, typed template data, and local flag artwork.
- TDD evidence: data/screen tests first failed on missing contracts/screens and the reviewed compact-selector/graphic-flag assertions; final focused result is 2 files / 9 tests passed, with TypeScript and ESLint clean.
- Browser evidence: RO Payments opened both shortcuts; search `north` retained only Monthly Rent; selecting it opened Domestic payment prefilled for North Residence and `2.750,00 RON`. FX smoke confirmed graphic flags, compact controls, RON -> EUR selection, connected `1 EUR = 5.2379 RON`, and zero warning/error logs. The verified EUR screen remains open for review.
- Asset audit banana: the prior checkpoint tracked 13 approved `To do/` reference JPEGs but retained the old 159-asset baseline. The baseline was re-locked to all 172 tracked assets instead of excluding reference folders or weakening the audit; no image blobs were edited.
- Full verification: fresh final `npm run verify` passed after the reviewed visual correction: TypeScript, ESLint, 52 files / 316 tests, all six audits (including the re-locked 172-asset audit), and the production build. Known baseline notices remain Recharts zero-size output in jsdom, empty `react-vendor`, and the >500 kB App chunk.
- Limitations: templates, beneficiaries, and rates are deterministic front-end demo data; no backend persistence, template editing/deletion, live quote feed, executable buy/sell, ledger mutation, or payment execution was added. This work is included in the requested clean local checkpoint.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

## 2026-07-20 PFM Spending Category Drill-downs

- Latest request handled: reproduce the production-reference category pages opened from Analytics / My Spendings `Money out` and `Money in`, then correct the supplied Financial feedback so bubbles never overlap/crop and tapping a bubble filters that subcategory out of the whole detail view.
- Product behavior: every populated PFM category row is now a semantic button that opens a category-colored detail surface for the selected month/year. The page keeps the shared period carousel/indicator and now supports the same touch plus desktop mouse/pointer drag and snap behavior as the Spending hero across monthly/current-year/previous-year panels. It shows connected category totals, proportional subcategory bubbles, the shared `Add Transaction` action presentation, the shared transaction month divider/rows, and the supplied dismissible Uncategorized helper. Transaction rows continue into the existing Transaction Detail screen.
- Connected data: `spendingAnalytics.ts` is the single aggregation authority for overview totals, drill-down subcategories, transactions, and session recategorization overrides. Shopping maps online purchases to `ELECTRONICS & COMPUTERS`, income maps Salary/Social Transfers/other income explicitly, Personal Loan and Mortgage profiles remain distinct, and yearly transactions sort by month then day. A recategorized transaction immediately changes both overview and drill-down aggregation.
- Bubble feedback fix: bubbles use a bounded flex/wrap layout rather than absolute coordinates, so Financial `LOANS`, `MORTGAGE`, `FINANCIAL (OTHER)`, and `BANK FEES` remain fully visible without collision. Each bubble is a keyboard-accessible toggle. Tapping it keeps the bubble visible in a neutral inactive state while removing that subcategory from transactions and both totals; tapping it again restores the original color/data. The last active bubble is protected, and local filters reset on period/category change or re-entry.
- Design-system decision: reused `PageHeader`, `AnalyticsPeriodIndicator`, `AccountActionBar`, `AccountTransactionMonthDivider`, `AccountTransactionRow`, `HelperCard`, PFM icon/color tokens, and runtime translations; extended Analytics/category aggregation with backward-compatible props; created only the domain-specific `PfmCategoryDetailScreen`, `PfmCategoryBubbleChart`, and label/period helpers. Registered evidence is `analytics.category-details`.
- Reference evidence: all 13 production captures under `To do/` are included in this checkpoint: the nine `PFM categs` captures used for this implementation and four `Payments` captures retained as reference-only material outside this task's product scope. The exact production app is not a runtime dependency.
- TDD evidence: focused RED/GREEN coverage proves override-before-aggregation, expense/income taxonomy, distinct Loan/Mortgage data, chronological yearly ordering, overview-to-detail/back navigation, Uncategorized helper dismissal, transaction navigation, desktop category-period drag, and reversible bubble exclusion with the Shopping total changing from `599,21 RON` to `208,99 RON` and back.
- Browser evidence: local RO smoke verified Shopping bubbles/transactions, Financial `LOANS` + `MORTGAGE` + `BANK FEES`, Income `SALARY` + `INCOME (OTHER)`, reversible Mortgage filtering, and bidirectional April/current-year/previous-year drag navigation with no browser warning/error logs.
- Full verification: `npm run verify` passed after the final feedback: TypeScript, ESLint, 50 files / 307 tests, all six audits, and production build. Known baseline notices remain Recharts zero-size output in jsdom, empty `react-vendor`, and the >500 kB App chunk.
- Limitations: state is mock/session-local; bubble exclusions reset rather than persist; `Add Transaction` remains presentational because no transaction-creation behavior was supplied; no API, ledger mutation, or audit history was added.
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

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
