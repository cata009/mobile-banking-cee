# Current Session

Last updated: 2026-05-27

## Current Focus

Implement the AI Contributor Operating System first, then create the architecture foundation for the Mobile Banking CEE demo platform so future PI/SME, country, baseline, release, and design-system work is documented from the start.

## Last Meaningful Change

Initial handoff system and architecture foundation were introduced:

- root operating contract in `agents.md`;
- handoff mode rules under `docs/handoff/`;
- architecture foundation in `docs/architecture/PROJECT_MODEL.md`;
- typed project model in `src/app/registry/projectModel.ts`;
- release mapping in `src/app/registry/releaseRegistry.ts`;
- screen catalog in `src/app/registry/screenRegistry.ts`;
- flow catalog in `src/app/registry/flowRegistry.ts`;
- feature metadata expanded in `src/app/state/demoTypes.ts` and `src/app/registry/demoConfig.ts`;
- demo side panel upgraded from feature-only settings to a Control Panel in `src/app/components/demo/DemoFeatureSidePanel.tsx`;
- top bar label changed from `Version` to `Release` in `src/app/components/demo/DemoTopBar.tsx`;
- runtime store now uses explicit `product`, `designSystem`, `baseline`, and `release` state instead of a release-like `variant` field;
- `CountryId` exists as the official project alias for country taxonomy;
- product selector supports `PI` and `SME`;
- design-system selector supports `current` and `next`;
- unsupported product/design-system combinations render an honest planned-state placeholder instead of PI screens;
- component registry and AI catalog export were added;
- root `README.md` now points to the operating docs.

## Active Scope

Approved direction from the user:

1. Add AI Contributor Operating System.
2. Document the project organization before major implementation.
3. Continue with the previously agreed architecture direction:
   - official taxonomy;
   - release/baseline model;
   - screen and flow registries;
   - feature metadata expansion;
   - project model documentation;
   - gradual refactor strategy.

## Blocked By

- Full SME and next-design-system screen implementations remain future product work, but they are no longer hidden leftovers: selecting them now produces an explicit planned-state runtime.

## Next Recommended Action

Continue with product evolution work:

1. Fill SME screen registry entries when actual SME screens are imported or designed.
2. Fill next-design-system screen/component mappings before visual migration.
3. Expand AI catalog metadata as new screenshots and components are added.
4. Add automated tests for product/release/design-system switching.

## Commands / Verification

- GitHub repository created: `https://github.com/cata009/mobile-banking-cee`.
- `npm run build` passed on 2026-05-27.
- Vite emitted a chunk-size warning because the bundle and image assets are large; this is recorded in `known-bananas.md`.
- Browser verification passed on fresh dev server `http://localhost:5174`: Control Panel opens, shows Mobile PI/current design system context, and displays feature lifecycle/coverage statuses.
- `npm run build` passed again after removing runtime `variant` state and adding product/design-system selectors.
- `npm run build` passed again after adding `CountryId`, component registry, AI catalog export, and planned-state placeholders.
- Browser verification passed on fresh dev server `http://localhost:5175`: Mobile PI loads, Mobile SME selection shows the planned-context placeholder, and next design-system selection shows the planned-context placeholder.
- `npx tsc --noEmit` could not run because the workspace does not include a local `typescript` package or `typecheck` script; this is recorded in `known-bananas.md`.

## Decisions

- Runtime release selection is now explicit: `DemoState.release` + `DemoState.baseline`.
- `CountryId` is the official taxonomy alias; legacy `Country` remains as the underlying union for compatibility.
- `baseline` and `release` become explicit concepts.
- AI handoff docs are repo-level operating docs, not product features.
- The new registries are mostly non-invasive, except the control panel now reads release and feature metadata visibly.
- The platform capability map was updated for the visible control-panel/release wording change.
- SME and next design system can be selected, but show planned-state placeholders until actual flows exist.

## Limitations

- Local Git repository is initialized on `main` with remote `origin` set to `https://github.com/cata009/mobile-banking-cee.git`.
- SME and next design system have runtime selectors and planned-state placeholders, but not real product screens yet.
- Screen and flow registry entries are first-pass foundations and should be refined as more screenshots/components are cataloged.
- Existing dev servers on ports `6000`/`6001` may be stale; `5174` and `5175` were started fresh for verification.
- Typecheck, lint, and test cannot be run yet because the package only defines `dev`, `build`, and `preview` scripts.

## Constitutional Check

constitutional check:
- scope preserved: yes
- docs updated: yes
- verification recorded: yes
- bananas triaged: yes
- safe to resume: yes

safe to resume: yes, the operating system, architecture foundation, leftover cleanup, build verification, and browser smoke verification are complete.
