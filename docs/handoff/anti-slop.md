# Anti-Slop Rules

The project should stay useful to a future AI contributor and to human stakeholders.

## Evidence Over Vibes

Do not mark work complete without evidence.

Evidence can be:

- changed file paths;
- command output summary;
- visual verification;
- documented limitation;
- linked capability map entry;
- explicit decision record.

## Naming Discipline

Use stable nouns:

- `product` for `PI` and `SME`;
- `country` for regional variants;
- `designSystem` for visual systems;
- `baseline` for official stable demo/UAT state;
- `release` for project-evolution bundles;
- `feature` for a user-visible capability or controlled UI change;
- `screen` for an addressable view;
- `flow` for ordered screen journeys.

Avoid using `variant` as a catch-all for release, design system, and product differences.

## Documentation Discipline

Every new architecture concept needs:

- a short definition;
- scope;
- owner file or registry;
- current status;
- evidence;
- open risk if incomplete.

## Implementation Discipline

Prefer registries and typed metadata over hidden branching.

If behavior is country-specific, release-specific, or product-specific, make that visible in config instead of burying it inside component logic.

## No Phantom Coverage

Do not claim that a screen, flow, feature, country, product, or design system is implemented unless there is a file-level evidence path.

