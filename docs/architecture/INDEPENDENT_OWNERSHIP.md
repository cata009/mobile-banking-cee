# Independent module work

The platform remains one React demo. Features own behavior, experience manifests select existing composition, and Flows own journey/specification/prototype records. Runtime FlowMeta and Flow Library FlowDefinition remain separate contracts.

All six implemented Flow Library modules now own definition and preview code under `src/flows/<scope>/<flow>/`. Their old definition and renderer paths remain compatibility exports. Executable selection/calculation policy lives in features; source handoff follows extracted implementation dependencies and retains stable IDs and scenario order.

Fifteen experience adapters now select composition: eight PI market baselines, Kids PI SK/HU/RO and four existing PI future experiences. Evo 2027 remains a Czech experience on design system `current`. Adapters delegate eligibility to the existing feature resolver; they do not create a second business-policy gate. Uncatalogued contexts return null metadata and retain their existing runtime. Metadata entry points contain no UI runtime imports. IDs, contexts and source references are checked by `npm run audit:modules`.

## Parallel work

| Task | Owned files | Shared requests |
| --- | --- | --- |
| Flow changes | Flow directory, its feature model, tests/scenarios | New global IDs, renderer registration, generic handoff tooling |
| PI RO baseline | RO manifest and allocated overrides/tests | Shared Home/Payments/data/primitives |
| PI CZ future | CZ manifest and allocated Czech-specific screens/models/tests | Shared portfolio host, navigation, design primitives |
| CZ Robo | `src/app/screens/investments/robo/`, `src/features/investments/robo/`, `src/experiences/pi/cz/robo/`, allocated compatibility entries/tests/assets | Shared portfolio host, App investment coordinator, translations used by other CZ features |
| Analytics | `src/features/analytics/`, `src/app/screens/analytics/evo/`, allocated legacy entries/tests | Shared PFM primitives, product and navigation contracts |
| HU Kids goals | `src/features/kids/hu/goals/`, `src/app/screens/kids/hu/goals/`, HU composition and allocated tests | Shared banking context, money fields, global metadata |
| CZ chat | `src/app/chat/cz/` domain builders/handlers, allocated resolver/tests | App chat coordinator, shared NLU and route contracts |
| Integration | Shared contracts, registries, App, dependencies, CI | Review all consumers before changing a public interface |

The user's chosen workflow is the existing main checkout, with different files allocated to each active agent. One file has one active editor; shared integration files belong to one coordinator. Record existing pending changes, re-read files before editing and report each task's exact delta. Never reset, stash, switch branches, or stage another contributor's work. New assets, translations, tests and documentation need ownership too. Separate worktrees remain available only when explicitly requested; they do not automatically include pending operator edits.

An agent's task JSON declares owner, worktreeRoot and ownedPaths; worktreeRoot may be the main checkout's absolute path. `npm run agent:scope -- --task task.json --base COMMIT` validates the whole checkout delta against those paths. In a shared checkout this includes all contributors' pending changes, so the check cannot determine which agent wrote a file. Use an explicitly combined scope for the coordinator's check and review individual task deltas separately. CI uses `.agent-task.json`, when supplied, to validate the PR diff. These checks do not lock files and are not protected unless the repository owner makes them required and protects their configuration. Shared-file edits, Git index changes and final combined verification must be coordinated.

Typed domain aggregation now composes screen/component/template/icon registries with duplicate and reference checks. A generator should be introduced only if synchronized manual registration becomes a demonstrated bottleneck. Feature coordinators own focused App orchestration; AppShell and AppScreenRouter are integration-owned. Compatibility exports remain during extraction.

## Accepted baselines

The current baseline ledger is metadata over the current executable code. A version label does not freeze shared imports. For exact historical comparison, retain the full built artifact/assets and source/dependency/configuration/fixture identities at immutable locations. Do not confuse running old flags through current code with replaying an old accepted build. Production publication is a separate explicitly authorized delivery step; country work does not imply a deployment.

Prefer small compatibility-preserving changes, independent review and sequential integration. The complete gate is `npm run verify`: strict TypeScript, ESLint with zero warnings, scoped formatting, the full coverage suite, all seven audits and production build. Existing coverage thresholds remain 80% statements/lines/branches and 62% functions. The integration owner runs this combined gate after all relevant editors finish.
