# Contributor ownership and preservation

The user prefers agents to work in the existing main checkout. Do not require or create a separate worktree unless the user explicitly requests one. Keep the operator's edits and other agents' edits intact. Parallel work in this checkout requires disjoint file ownership; one file has one active editor at a time.

Before editing, record the task's owner, base commit, absolute checkout path, initial pending changes and owned paths. Include tests, fixtures, assets and documentation. Re-read a file before applying an edit; never replace it from a stale full-file copy. The scope checker reports additions, deletions and both paths of renames, but in a shared checkout it sees everybody's pending changes and cannot attribute them to one agent. The integration owner can validate an explicitly combined scope; each agent must report its own exact file delta separately.

In the shared checkout, do not switch branches, reset, stash, clean, or stage/commit everybody's changes. Coordinate Git index mutations and commits through one integration owner. Request a shared-file change from its current owner instead of editing the same file concurrently. Schedule the final combined verification after the relevant editors finish.

Responsibilities:

- Flows: `src/flows/<scope>/<flow>/`, its feature model, scenarios and associated tests. Definition/specification is canonical; preview consumes its references. Preserve Flow IDs, screen kinds, scenario order and source/ZIP exports.
- PI Romania baseline: `src/experiences/pi/ro/baseline/` and explicitly allocated Romanian overrides/tests. Shared Home, Payments and infrastructure files require the integration owner.
- PI Czech future: `src/experiences/pi/cz/evo-2027/`, allocated Czech-only screens/models and tests. Evo is an experience/release on design system `current`; do not replace that axis or copy baseline screens wholesale.
- Core integration: App, navigation, demo/effective context, registries/contracts, shared design primitives, global data, package/lockfile, tooling and CI. Coordinate changes to these files with one owner.

Keep executable policies in features. Experiences select composition and parameters; they do not duplicate business decisions. Metadata entry points stay free of UI runtime imports. New boundaries are checked by `npm run audit:modules`.

Keep legacy exports during extraction. Preserve normal DOM, styles, labels, data and navigation; separate moves from behavior corrections. Characterize existing behavior before refactoring and add regression proof for confirmed defects. Do not weaken strict TypeScript, audit assertions or warning/coverage thresholds to obtain a green gate.

Run the affected tests, then have the integration owner run `npm run verify` on the combined final state. Review agent deltas sequentially. If separate branches were explicitly requested, integrate them sequentially too. No deployment, remote publication, image deletion/conversion or unrelated cleanup is implied by a refactor task.

The scope manifest and these instructions are cooperative controls; they are not a filesystem lock or authentication boundary. CI runs task-scope validation when `.agent-task.json` is present. Required branch protection is managed separately by the repository owner.

# Design System authoring for DEMO and Figma

Agents building or changing DEMO interfaces or editing Figma must follow [the interface authoring contract](docs/design-system/agent-interface-contract.md).

- Use approved components, variants, assets and tokens from the canonical Figma Design System `FKbbStgBIP9bFAMl3DPKHF` and their verified implementation contracts. Preserve the current approved page names, IDs, order and grouping; organize originals by move/reparent, preserving component keys and instance bindings.
- Reuse the existing shared/native implementation and approved preview bridges before creating another component. Preserve business logic, screen/flow IDs, navigation, scenarios and platform semantics. Metadata entry points stay free of UI runtime imports.
- Never substitute screenshots, PNG captures or flattened controls for executable components. Audit existing code before adding a component; consolidate Figma aliases and states into one catalog entry per implementation instead of duplicating previews or renderers.
- Treat the Figma catalog as an index, not proof of implemented coverage. Verify actual source and supported variants; distinguish canonical source, illustrative examples and unavailable mappings. Never present a shared TextField or an approximation as an implemented Dropdown.
- Put genuinely unmapped proposals on `De aprobat / <source>` pages, preserving editable source references. Reuse an existing proposal and obtain individual user approval before promotion or publication. Routine use of approved components needs no additional approval.
- Follow the documentation template and real-host accessibility acceptance in the contract. Run affected checks and coordinate the final combined `npm run verify` with the integration owner; never overlap verification/coverage runs.
