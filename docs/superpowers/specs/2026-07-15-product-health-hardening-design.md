# Product Health Hardening Design

Date: 2026-07-15
Status: approved by operator green light
Baseline: `453e7e2 feat: align global card details reveal flow`
Integration branch: `codex/product-health-hardening`

## Objective

Harden the Mobile Banking CEE demo across nine audited risk areas without losing the approved stakeholder experience. Every direction must be independently verifiable and revertible. Production deployment remains outside the implementation loop until the complete automated verification and operator-led smoke pass are accepted.

## Safety Model

- `main` remains the protected baseline while implementation happens in an isolated worktree.
- Each direction lands as one coherent commit or a short contiguous commit series with a unique scope prefix.
- Cross-direction cleanup is forbidden. A change belongs to exactly one direction.
- Rollback uses `git revert` of the relevant direction commits; destructive reset is not part of the workflow.
- Existing public component and navigation interfaces remain available through adapters during refactors.
- No production deployment occurs before the final smoke gate.
- No original PNG is overwritten, converted, downscaled, or deleted during the first eight directions.

## The Nine Directions

### 1. Access-gate security

Remove production fallback credentials, require independent access-password and cookie-signing secrets, use timing-safe signature comparison, reject unsafe return paths, and make brute-force limitations honest. Add automated API-level tests for cookie forgery, share-token validation, return-path normalization, and failed-attempt behavior.

The code change and production secret rotation are separate operations. Local code and tests land first. Vercel environment mutation and deployment happen only after the final smoke approval.

### 2. Verification toolchain

Install and configure TypeScript, React/Node types, ESLint, Vitest, and a single `verify` command. CI must run clean install, typecheck, lint, tests, all audits, and build. Pin the supported Node/package-manager contract.

The Figma Bridge audit must work from a clean clone. Its current hidden dependency on ignored generated `screenshots/FIgma plugins/Component-E/code.js` is treated as a reproducibility defect and receives a clean-clone test.

### 3. Asset delivery without image mutation

Remove the application-mount preload of all More images. Load only the image assets needed by the active country/route. Add a regression test proving the root application does not initiate the eight-image preload.

This direction changes loading behavior only. Image paths and bytes remain unchanged.

### 4. Navigation and deep-link contract

Define one typed route policy covering renderability, stable deep-link restoration, back fallback, status-bar mode, registry identity, and required payload. Repair Card Details/Options and Investments History coverage. Preserve existing `navigateTo(Screen)` callers through a compatibility adapter while introducing typed payload-aware routes incrementally.

### 5. Product-data authority

Make the relationship between banking scenario holdings and `productCounts` explicit. The selected scenario is the baseline authority; demo overrides are represented as explicit overrides rather than a second silent truth. Introduce invariants that reject visible card/account/investment products unsupported by the resolved holding model.

The rich UI product model remains available through an adapter; the repository layer is not forced directly into screens before it can supply the required fields.

### 6. CZ Chat extraction

Move the pure CZ reply resolver, rich-card builders, and opportunity derivation out of `App.tsx` into a feature-owned module. Characterization fixtures must prove byte-equivalent reply content and follow-up actions for the existing critical conversations. UI and package boundaries stay unchanged during extraction.

### 7. HU Kids decomposition

Split the HU Kids orchestrator by state domain and screen responsibility while retaining the current public `KidsMarketHomeApp` entry point. State transition characterization covers Home, Spending, Payments, Products, More, themes, request/send money, goals, card details, and transaction detail.

No visible redesign is permitted.

### 8. Panel consolidation

Create one shared panel shell for the three near-duplicate panel implementations. Compatibility wrappers preserve current exports and prop contracts. Snapshot/DOM characterization covers translated, untranslated, and no-Co-Apping modes before consolidation.

### 9. Investments token migration

Replace hardcoded surface/text/status colors with existing UniCredit semantic tokens. Instrument and brand colors that carry data meaning remain explicit where no semantic token exists. Visual regression covers Investments Portfolio, distributions, catalogue, owned/catalogue detail, History, filters, light mode, and dark mode.

## PNG Remainder

PNG conversion/deletion is a separate final asset program after the nine directions and smoke approval:

1. Record path, byte size, SHA-256, decoded-RGBA hash, dimensions, alpha, ICC/gamma metadata, and import graph.
2. Capture route screenshots and network waterfalls at DPR 1 and 2.
3. Keep originals immutable and generate candidates side by side.
4. Attempt lossless PNG recompression first.
5. Require identical dimensions, alpha, decoded-RGBA hash, and zero pixel diff for a zero-loss claim.
6. Treat WebP/AVIF, downscale, metadata removal, or lossy encoding as separately approved work.
7. Change one asset mapping per commit and retain immediate rollback.

## Verification Architecture

Every direction must pass:

1. A failing characterization/regression test before production code changes.
2. Its targeted test after implementation.
3. `npm run typecheck`.
4. `npm run lint`.
5. `npm test`.
6. All `audit:*` commands.
7. `npm run build`.
8. `git diff --check`.

Each phase also receives a focused browser smoke. The final operator smoke covers:

- access gate and share-token entry;
- PI Home and country switching across all eight application variants;
- account, card, Card Details/Options, transaction detail, and amount masking;
- Payments create/review/sign/success;
- Products and product detail;
- Investments portfolio, all distributions, catalogue, detail, History, and filters;
- More cards and Tutorials;
- Messages, Documents, Contacts, Settings, Prime, Analytics;
- CZ Future Chatbot critical conversations;
- SK and HU Kids, including themes and card flows;
- Design System, Flow Library, screenshot export, and Figma JSON export;
- light/dark appearance and browser console errors.

## Phase Boundaries

1. Foundation: verification toolchain, clean-clone Figma audit, access-gate tests/fix.
2. Runtime correctness: asset preload, navigation contract, data authority.
3. Architecture: CZ Chat, HU Kids, Panel consolidation.
4. Visual consistency: Investments tokens, complete automated verification, operator smoke package.
5. Optional final asset program: PNG work under the zero-loss protocol.

## Acceptance Criteria

- All nine directions are implemented and individually revertible.
- `main` baseline remains recoverable.
- Clean clone/worktree verification is reproducible.
- No approved visible behavior changes except security/error handling and dark-mode corrections explicitly described above.
- No original image bytes change during the nine directions.
- Automated gates pass from a clean install.
- Operator receives a route-by-route smoke checklist and commit-to-direction rollback map.
- Production is not deployed until operator smoke approval.
