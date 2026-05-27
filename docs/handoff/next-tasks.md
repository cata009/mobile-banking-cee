# Next Tasks

Status legend: `todo` / `in_progress` / `done` / `blocked`

## Active

| Status | Task | Evidence / Notes |
| --- | --- | --- |
| done | Install AI Contributor Operating System docs | `agents.md`, `docs/handoff/*` |
| done | Add project architecture model | `docs/architecture/PROJECT_MODEL.md` |
| done | Add typed taxonomy and registries | `src/app/registry/projectModel.ts`, `screenRegistry.ts`, `flowRegistry.ts`, `releaseRegistry.ts` |
| done | Run verification | `npm run build` passed on 2026-05-27; browser smoke passed on fresh dev server `5175`; typecheck is blocked by missing local TypeScript CLI |

## Upcoming

| Status | Task | Evidence / Notes |
| --- | --- | --- |
| done | Refactor visible topbar wording from `Version` to `Release` | Runtime state now uses explicit `release` |
| done | Wire `releaseRegistry` into the control panel | `DemoTopBar` and `DemoFeatureSidePanel` use release metadata |
| done | Add product selector for `PI` / `SME` | SME is selectable and renders planned-state placeholder |
| done | Add design-system selector for `current` / `next` | Next DS is selectable and renders planned-state placeholder |
| done | Build initial control panel view for feature lifecycle and coverage | Shows lifecycle/coverage badges from feature metadata |
| done | Add screen/component catalog export for AI training and larger-platform integration | `componentRegistry.ts` and `aiCatalog.ts` |
| done | Update platform capability map after runtime architecture changes | Updated release/control-panel wording |

## Future Product Work

| Status | Task | Evidence / Notes |
| --- | --- | --- |
| todo | Import or build actual SME screens | Selector exists; runtime placeholder prevents false coverage |
| todo | Implement actual next design-system screens/components | Selector exists; runtime placeholder prevents false coverage |
| todo | Add tests for product/release/design-system switching | Build passes, but no automated UI tests yet |
