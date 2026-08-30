# Code Quality Refactor Program Design

Date: 2026-08-30
Status: proposed after operator approval of the repository audit
Baseline branch: `agent/publish-flow-updates`

## Objective

Improve the maintainability and verification quality of Mobile Banking CEE without redesigning approved product experiences. The program targets unstable verification, oversized orchestration modules, implicit state machines, mixed data/UI responsibilities, and large declarative registries while preserving current routes, public component contracts, demo behavior, and visual output.

## Scope Decomposition

The audit spans several independent subsystems, so implementation is divided into six self-contained phases. Each phase must end in a green, reviewable repository state and may be accepted or reverted independently.

1. Verification foundation and developer guardrails.
2. Application shell and route orchestration.
3. Complex-flow state models.
4. CZ chat handler modularization.
5. Product and analytics domain extraction.
6. Declarative registries, icons, and translations.

Later phases may consume interfaces created by earlier phases, but no phase may require unfinished code from a following phase.

## Global Constraints

- Preserve all stakeholder-visible banking behavior and approved layouts.
- Preserve the existing `App` entry point, `NavigationProvider`, `Screen`, `NavigationRoute`, and `navigateTo` compatibility surface.
- Do not introduce a new runtime state-machine or routing dependency. Typed reducers and existing React primitives are sufficient.
- Do not weaken strict TypeScript flags, existing audits, or current behavioral assertions.
- Add a failing characterization or regression test before every production-code behavior change.
- Pure extractions must demonstrate behavioral equivalence with existing fixtures before callers move.
- Existing uncommitted work belongs to the operator and must not be reverted, reformatted wholesale, or overwritten.
- Generated and declarative content is split only when the split improves ownership, validation, or loading. File size alone is not a reason to fragment data.
- No deployment, remote mutation, asset deletion, or image conversion is included.

## Phase 1: Verification Foundation

### Test runtime

Create explicit Vitest projects or equivalent configuration for Node tests and jsdom tests. Shared browser-test setup owns deterministic implementations for `ResizeObserver`, browser geometry used by charts, and cleanup of globals and URL state. Individual test files retain only behavior-specific fakes.

Recharts warnings about zero-sized responsive containers must disappear from normal test output. Tests must assert meaningful chart behavior through application-visible output rather than Recharts internals.

### Coverage

The coverage command must run the same 939 existing tests plus new tests without timeouts or missing-screen failures. Instrumentation-related timing must be fixed through deterministic setup and condition-based assertions, not by globally increasing timeouts. Once stable, record the observed baseline and add conservative line, branch, function, and statement thresholds that can only ratchet upward.

### Asset audit

Add a focused audit test that reports the exact delta between the tracked asset set and `scripts/asset-baseline.json`. Determine whether the two additional tracked assets are intentional and referenced. If intentional, update the baseline in the same change; if not, repair the reference or tracking error without deleting an operator asset.

### Linting and repository hygiene

Add React Hooks linting, JSX accessibility checks appropriate for the existing interactive prototype, and feature-boundary restrictions for newly extracted modules. Introduce Prettier 3 without a repository-wide formatting sweep: its initial check covers configuration, program documentation, and newly extracted modules, then expands by phase as legacy modules are structurally touched. Add `.editorconfig` and `.gitattributes` so line endings are deterministic across Windows and CI. Generated/imported areas remain explicitly excluded.

## Phase 2: Application Shell and Route Orchestration

`App.tsx` becomes a composition root rather than the owner of every feature transition.

### Target units

- `App`: parses the initial deep link and mounts providers.
- `AppShell`: owns device/demo framing and cross-cutting overlays.
- `AppScreenRouter`: renders the current typed route.
- Feature coordinators: accounts/payments, investments, analytics, flow library, and CZ chat.
- Route payloads: persistent selections required to restore a screen belong in `NavigationRoute`; transient overlay state remains feature-owned.

The router may use a typed renderer registry where practical, but screens with materially different contracts may use small domain renderers. The design must not replace one giant conditional with an untyped bag of props.

### Data flow

Navigation events enter a feature coordinator, which updates its own reducer or invokes `navigateTo` with a typed payload. `AppScreenRouter` reads route state and focused coordinator interfaces. Cross-feature actions, such as a chat action opening an investment order, use typed application commands rather than direct setter chains.

## Phase 3: Complex-Flow State Models

Refactor three flows independently.

### Robo Advisor

Represent creation, review, goal detail, and management as a discriminated state plus typed events. Invalid combinations such as management data on an intro step become unrepresentable where practical. Projection math, validation, and back-navigation rules live in pure modules. Presentational sections move to focused files while the existing default export remains stable.

### Analytics

Extract period, scope, split, bucket, and drill-down selection into a reducer. Move transaction filtering, breakdown construction, chart-series construction, and labels into pure selectors. Scroll measurement and responsive behavior remain UI concerns in focused hooks/components.

### HU Kids goals

Separate overview, goal detail, creation, schedule, and add-money state. Shared domain types and amount/schedule calculations stay pure. Existing named exports remain available through a compatibility barrel.

Each flow receives reducer transition tests, selector tests, and its existing DOM integration tests.

## Phase 4: CZ Chat Handler Modularization

Keep the existing NLU resolver and public `buildCzChatSmartReplyResolver` API. Build a normalized immutable chat context once, then compose ordered domain handlers:

- accounts and transactions;
- cards and credit limits;
- savings and deposits;
- investments and goals;
- documents, messages, and payments;
- Prime, contacts, and support.

Each handler declares the intents or predicates it owns and returns either a structured reply or no match. Ordering is explicit and covered by ambiguity tests. Critical canonical prompts receive characterization fixtures that compare reply text, rich blocks, actions, and follow-ups before and after extraction.

## Phase 5: Product and Analytics Domain Extraction

Reduce `useProducts` to a React adapter around pure product selectors and transformations. Move count definitions, CZ 2027 fixtures, cloning, balance conversion, and product-type transformations into domain-owned modules. The hook remains responsible only for reading demo state and memoizing the derived result.

Apply the same boundary to analytics and investment configuration: fixtures remain data, calculations become pure functions, and components consume typed view models. Avoid a generic repository abstraction until more than one concrete data source exists.

## Phase 6: Declarative Content

### Registries and icons

Split component, template, screen, and icon registries by ownership domain and compose them through typed top-level registries. Add uniqueness, reference-integrity, and schema tests. Preserve stable IDs. Large SVG payloads may remain generated/declarative, but the handwritten registry surface should not require editing a two-thousand-line file for every icon.

### Translations

Create a shared English baseline and explicit market overrides. Preserve the current lookup API and runtime fallback behavior. Add tests proving every supported country/language resolves the same key set and that market overrides win over the baseline.

## Error Handling

- Reducers reject or ignore impossible stale events deterministically rather than partially mutating state.
- Route payload validation falls back through the existing route policy.
- Chat handlers return no match instead of throwing for unsupported context; the existing default resolver remains the final fallback.
- Registry composition fails fast in tests and audits for duplicate IDs or broken references.
- Test infrastructure failures produce concise diagnostics and may not be hidden by blanket console suppression.

## Verification Strategy

Every phase runs:

1. Targeted RED test proving the new contract is not already satisfied.
2. Targeted GREEN test after the minimal implementation.
3. Relevant integration tests for the touched feature.
4. `npm run typecheck`.
5. `npm run lint`.
6. `npm test`.
7. `npm run test:coverage` once Phase 1 stabilizes it.
8. `npm run audit:all`.
9. `npm run build`.
10. `git diff --check`.

React phases also receive a browser smoke for the affected routes and a console-error check. No phase is complete while its verification output contains unexplained warnings.

## Rollout and Compatibility

- Extract behind existing exports first, migrate callers second, remove obsolete internals last.
- Keep compatibility barrels for public modules until all repository callers migrate.
- Commit by phase and by independently reviewable behavior; do not mix formatting sweeps with structural changes.
- Because the active checkout contains substantial operator work, implementation should continue in place unless the operator explicitly chooses a new worktree that includes those changes.

## Acceptance Criteria

- The full `verify` command passes from the active repository state.
- Coverage completes deterministically with enforced thresholds.
- Normal test output contains no Recharts zero-dimension warnings.
- `App.tsx` is a composition root with feature-owned orchestration and typed route payloads.
- Robo Advisor, Analytics, and HU Kids goals use tested reducers/selectors for multi-step state.
- CZ chat behavior is preserved while handlers are domain-owned and independently testable.
- Product derivation and analytics calculations are testable without React or jsdom.
- Registries and translations are composed from validated domain modules without changing stable IDs or resolved copy.
- Existing approved visual behavior and deep links remain unchanged.
