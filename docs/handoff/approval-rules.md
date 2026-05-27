# Approval Rules

These rules keep the agent from expanding scope accidentally.

## Approval Required

Ask before:

- changing the visible stakeholder demo direction;
- adding or removing major screens or flows;
- changing product taxonomy such as `PI`, `SME`, country support, baseline, release, or design-system strategy;
- introducing new dependencies;
- changing build tooling;
- deleting files;
- replacing generated Figma imports;
- editing production-like security, auth, data, or banking assumptions;
- making a commit, tag, branch, or release;
- changing any project integration contract intended for a larger host platform.

## Approval Not Required

No separate approval is needed for:

- creating or updating handoff docs requested by the user;
- adding architecture documentation that records an already approved direction;
- adding typed registry scaffolding that does not alter runtime behavior;
- fixing typos or stale references inside newly created docs;
- running non-destructive verification commands such as `npm run build`.

## If Unsure

Prefer one concise question when the risk is product or architecture direction.

Prefer implementation when the task is clearly within the already agreed direction.

