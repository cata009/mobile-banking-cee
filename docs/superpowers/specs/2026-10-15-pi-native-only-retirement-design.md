# PI Native-only: scope and retirement design

## Intended outcome

One active customer UI implementation for all existing PI demos in scope, consumed by React Native Web and Android. Future UI changes belong in Native components. Shared financial models, data, translations, feature policies, navigation identities and flow definitions retain their canonical authorities. A Native failure must never silently activate the former PI customer UI.

The user explicitly requested continued parallel implementation and the end of duplicate UI maintenance. The latest request asks for a concrete plan to remove the former UI from service and repair regressions in Native. This document defines the technical acceptance gates for that retirement; it does not itself remove screens.

## Scope

- Existing PI experiences for RO, HU, RS, SI, CZ, SK, BA and BA_BL.
- Baseline/current and R1–R4, CZ Chatbot/Co-Apping, CZ Robo, CZ Evo 2027, RS Future Gain.
- Existing active, inactive, authentication/onboarding and supported feature combinations. Validity comes from Source experience/route/feature registries, not a fabricated Cartesian product.
- `src/experiences/registry.ts` currently declares eight Baseline manifests and four additional PI manifests in this scope. CZ declares Co-Apping, Robo and Evo 2027; the project selector/runtime inventory must reconcile this with the user's three-project wording.
- PI Italia and KIDS are excluded. SME is not part of the PI request. Desktop platform controls, Design System, Flows and Tools remain platform surfaces; any PI customer preview they embed must ultimately consume the same canonical Native UI.
- Planned metadata with no implemented Source journey is documented as such, not invented as a new feature.

## Current starting point

The accepted active Baseline cohort has 40 country/release cells using the shared UI by default. Its retained legacy routes are still reachable through `renderer=reference`, missing modules, unsupported/manual flag combinations and non-migrated contexts. Therefore runtime replacement of that cohort does not yet equal code retirement across PI.

The completed milestone has 3,393 Source tests, 1,591 Native tests and 47 representative Android checks. Its receipt records remaining raw raster differences and manual Android limits. These results are preserved as historical evidence; they do not automatically accept the expanded scope.

## Architecture

1. **Canonical experience selection.** Extend a pure PI experience policy using Source registry and effective feature/scenario context. Baseline and Future share composition where Source shares it; Evo keeps its existing separate experience and design-system axis `current`.
2. **Plain-data host boundary.** Extend existing snapshot/events and route-intent adapters for selected transactions, payment drafts, Robo goals/service state, Future Gain return state and chatbot actions. React elements and React contexts never cross the React 18 shell / React 19 Native island boundary.
3. **One UI authority.** Keep Native UI under `native-spike/src/experiences/pi/current/` and `native-spike/src/experiences/pi/cz/evo-2027/`, plus shared primitives. Reuse Source pure policies and data. Retire duplicated business decisions rather than copying them into each experience.
4. **Native-only runtime decision.** For an in-scope customer route, the result is a Native screen, loading state or controlled failure. Missing payloads follow the canonical invalid/empty state. Module failures expose retry/diagnostics; they do not render an old bank screen. Excluded products and platform routes retain their declared owners.
5. **Separate reference artifact.** Before destructive removal, produce a verified private reference build/archive from the actual working tree and evidence, excluding secrets, signing keys and dependency directories. Record hashes and executable comparison instructions. Do not rely on HEAD alone: this checkout contains pre-existing uncommitted work.
6. **Removal from the build graph.** Split router imports by owner, remove PI-only legacy view imports and compatibility branches, and delete unique legacy PI UI only after proving no excluded experience consumes it. A tiny compatibility entry may mount the new UI; it must not contain a second screen implementation.

## What is retained

Canonical data, calculations, translations, shared SVG/assets, feature policies, flow IDs, scenario order, metadata and export contracts remain. Source files shared with excluded experiences remain until consumers are separated safely. React/ReactDOM needed by the desktop shell and excluded experiences are not the legacy PI renderer and are not removed merely by name.

## Retirement gate

Retirement requires all of the following:

- Every valid in-scope customer route resolves to one canonical Native UI owner; no unexplained legacy fallback remains.
- Source entity IDs, selected objects, draft values, Back behavior and request consumption survive navigation and stale callbacks cannot act.
- Raster differences are measured without masks and resolved from confirmed causes. Exact vectors/typography/layout are retained; unresolved differences and platform precision limits remain visible rather than relabeled as exact.
- Android/APK work is deferred by the user's later instruction. It is not part of this Web frontend acceptance gate. Existing Android work is preserved.
- A reference archive exists and is verified before deletion. It is not imported or shipped in the normal customer build.
- A build-graph guard rejects retired PI view imports in production, and a routing guard rejects legacy renderer selection for in-scope PI.
- Focused checks and the final combined `npm run verify`, shared Native checks needed for Web, and Web build pass without lowering existing thresholds. APK/device checks are deferred.
- KIDS/PI Italia and other excluded owners have no unintended changes.

## Regression handling

A failed comparison blocks acceptance of that route/family. Repair the Native implementation or its canonical shared policy, add a meaningful regression, and rerun the affected evidence. Do not fix a discrepancy by changing the frozen original, masking pixels, inventing values or automatically restoring the old renderer. If an application cannot load, show a controlled failure and preserve diagnosable context.

## Delivery

Update the existing `.codex-temp/native-baseline-home-integration/report.html` with per-experience component/screen/flow states, missing routes, Web raster evidence and retirement status. The final deliverable is one active PI Web UI implementation in scope, a private reference archive, a production Web bundle free of retired PI-only views, and an editing guide naming the canonical files. PI Italia, SME and KIDS are excluded. Android evidence stays historical and APK delivery is deferred. Commit, push and deployment are separate actions and are not implied by this plan.
