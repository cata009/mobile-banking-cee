# AI Contributor Operating System

This repository uses an AI Contributor Operating System: repo-level rules for how AI contributors work with the human operator.

This is not a product feature. It is the working contract for continuity, correctness, and clean handoff.

Core principle:

```text
The user speaks naturally.
The agent keeps the discipline.
Do not optimize for impressiveness.
Optimize for continuity and correctness.
```

## Always Read First

At the start of any non-trivial task, read:

1. `agents.md`
2. `docs/handoff/current-session.md`
3. `docs/handoff/work-mode.md`
4. `docs/handoff/approval-rules.md`

If the task changes product behavior, also read:

1. `docs/handoff/product-principles.md`
2. `docs/handoff/state-of-the-world.md`
3. `docs/platform-capability-map/README.md`

## Natural Language Mode Detection

The user does not need exact prompts. Interpret intent from natural language in Romanian or English.

### Resume / Reia

Triggers include:

```text
resume
reia
unde eram?
continua de unde am ramas
where were we?
```

Required behavior:

1. Read `agents.md`.
2. Read `docs/handoff/current-session.md`.
3. Reply with:
   - current focus;
   - last meaningful change;
   - blocked by;
   - next recommended action;
   - safe to resume: yes/no.
4. Do not modify files unless the user then asks to continue.

### Investigation Only

Triggers include:

```text
fa doar investigatie
analizeaza fara cod
nu implementa
vreau sa inteleg
investigate only
no code changes
```

Allowed:

- Read files.
- Run non-mutating analysis commands.
- Inspect build outputs and docs.
- Produce findings, risks, and a plan.

Forbidden:

- Editing files.
- Formatting files.
- Installing dependencies.
- Changing generated outputs.
- Marking tasks done.

### Continue / Implement

Triggers include:

```text
continua
implementeaza
rezolva
continua implementarea
implement
fix it
```

Required behavior:

1. Preserve the active scope from `current-session.md`.
2. Implement the smallest coherent change that satisfies the current task.
3. Update handoff docs when the change affects architecture, workflows, capabilities, known risks, or next tasks.
4. Run the most relevant verification available.
5. If visible UX, architecture, product direction, data model, or high-risk scope expands beyond the agreed task, ask for approval before expanding.

### Closeout / Commit / Comite

Triggers include:

```text
commit
comite
comiti
inchide sesiunea
pregateste handoff
closeout
prepare handoff
```

Required behavior:

1. Update `docs/handoff/current-session.md`.
2. Update `docs/handoff/next-tasks.md`.
3. Log decisions, tests, limitations, and commands.
4. Update capability docs if product behavior changed.
5. Run Banana Loop.
6. Run Constitutional Check.
7. Report `safe to resume: yes/no`.
8. If this workspace is not a Git repository, say that a commit cannot be created from this workspace and still complete the documentation closeout.

## Banana Loop

A banana is anything that can sabotage the next session.

Examples:

- A task marked done without evidence.
- Tests or commands not recorded.
- A next step that is vague.
- Stale docs.
- Broken file links.
- An undocumented decision.
- A hidden limitation.
- Capability map not updated after product behavior changed.
- "All done" without evidence.

Bananas must be triaged before closeout:

1. Fix immediately, or
2. Move to `docs/handoff/known-bananas.md`, or
3. Convert to a task in `docs/handoff/next-tasks.md`, or
4. Convert to an investigation in `docs/handoff/active-investigations.md`.

The rule is not "fix the universe." The rule is: nothing important remains untriaged.

## Operating Files

Minimum operating set:

- `agents.md`
- `docs/handoff/current-session.md`
- `docs/handoff/next-tasks.md`
- `docs/handoff/banana-log.md`
- `docs/handoff/known-bananas.md`
- `docs/handoff/work-mode.md`
- `docs/handoff/anti-slop.md`
- `docs/handoff/approval-rules.md`
- `docs/handoff/constitutional-check.md`

Extended operating set:

- `docs/handoff/state-of-the-world.md`
- `docs/handoff/risk-map.md`
- `docs/handoff/product-principles.md`
- `docs/handoff/active-investigations.md`
- `docs/handoff/session-summary-template.md`

Project model docs:

- `docs/architecture/PROJECT_MODEL.md`

Capability evidence:

- `docs/platform-capability-map/README.md`

## Documentation Rule

If a change alters product behavior, architecture, demo state, feature coverage, or integration assumptions, update the relevant docs in the same session.

`docs/handoff/current-session.md` holds only the most recent sessions; older ones move to `docs/handoff/archive/sessions-YYYY-MM.md`. Keep the active file small enough to actually be read at the start of a session — it grew to 690 KB once, which put it past the point where any agent could open it. When it passes roughly the last dozen sessions, archive the tail rather than letting it grow.

Documentation should include evidence:

- files changed;
- decisions made;
- tests or commands run;
- limitations;
- next action.

## Safety Rule

Do not silently broaden the task.

Ask before expanding into:

- visible UX direction;
- new product capabilities;
- architecture changes with broad blast radius;
- dependency changes;
- destructive file operations;
- migrations;
- commit/release actions.

