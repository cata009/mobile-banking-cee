# Banana Log

This log records bananas found and how they were triaged.

## 2026-05-27

| Banana | Triage | Evidence |
| --- | --- | --- |
| No repo-level AI operating contract existed | Fixed by adding AI Contributor Operating System docs | `agents.md`, `docs/handoff/*` |
| Workspace was not detected as Git repo, so commit mode could not commit | Fixed by creating `cata009/mobile-banking-cee`, initializing local Git, and setting `origin` | `docs/handoff/work-mode.md`, `https://github.com/cata009/mobile-banking-cee` |
| Existing architecture uses `variant` as a broad concept | Converted into explicit future architecture rule and registry foundation | `docs/handoff/anti-slop.md`, `docs/architecture/PROJECT_MODEL.md` |
| Build produces chunk-size warning from large assets/bundle | Recorded as known banana, not blocking current foundation | `docs/handoff/known-bananas.md`; `npm run build` passed |
| Existing dev server on `6001` showed stale mixed module state during browser check | Started fresh dev server on `5174`; recorded as known banana | Browser verification passed at `http://localhost:5174` |
| Runtime still carried a release-like `variant` field | Fixed by replacing it with explicit `product`, `designSystem`, `baseline`, and `release` state | `src/app/state/demoTypes.ts`, `src/app/state/demoStore.tsx` |
| PI/SME and next design system could not be selected as first-class runtime contexts | Fixed with selectors and planned-state placeholders for unsupported contexts | `src/app/components/demo/DemoTopBar.tsx`, `src/app/components/demo/DemoFeatureSidePanel.tsx`, `src/app/components/UnsupportedContextScreen.tsx` |
| `CountryCode` import in More card config pointed to the wrong module | Fixed by using the official `CountryId` taxonomy alias | `src/app/config/moreCardsConfig.ts`, `src/app/state/demoTypes.ts` |
| No component/screen catalog export existed for future AI training or platform integration | Fixed by adding component registry and AI catalog source export | `src/app/registry/componentRegistry.ts`, `src/app/registry/aiCatalog.ts` |
| `npx tsc --noEmit` cannot run from this workspace | Triaged as known tooling limitation because no local `typescript` package or typecheck script exists | `package.json`, `docs/handoff/known-bananas.md` |
| Initial workspace was not published anywhere | Fixed by creating private GitHub repo and pushing `main` | `https://github.com/cata009/mobile-banking-cee`, commit `2767060` |
