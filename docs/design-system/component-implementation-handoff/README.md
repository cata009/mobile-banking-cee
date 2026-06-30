# Component Implementation Handoff

Purpose: this folder is a portable instruction package for another Codex session/project, especially the `Components2` conversation. It documents how the Mobile Banking CEE design-system components are implemented in code, where they live, which visual contracts are non-negotiable, and how to recreate them without re-opening Figma.

Use this as the source of truth before implementing or normalizing components in another project.

## Files

- `components-handoff.md` - the main technical handoff: component map, visual contracts, implementation rules, copy checklist, and high-risk component details.
- `COMPONENTS2_PROMPT.md` - a ready-to-send prompt for the `Components2` Codex thread.

## Explicit Exclusions

The user asked to document all component families except:

- Status Bar
- Floating Co-Apping
- Button registry variants
- Generic UI controls
- Home content modules
- Logout confirmation dialog

Do not use this package to recreate those excluded families unless the user explicitly asks for a separate pass.

## How Another Codex Should Use This

1. Read `components-handoff.md` completely.
2. Open each referenced source file before writing code.
3. Reuse the component names, props, tokens, `AppIcon` registry, and fixed geometry contracts.
4. Do not "improve" sizes, shadows, gaps, radii, or typography unless the user gives a new Figma source or explicit correction.
5. Verify in browser at the same phone width where applicable: 375px screen, 327px/343px content cards, 16px page inset rhythm.

## Copy Rule

When moving this to another project, copy the whole folder:

```text
docs/design-system/component-implementation-handoff/
```

Then ask Codex in the target project to read `README.md` and `components-handoff.md` before implementing.
