# AI Design Screen Factory Protocol

Last updated: 2026-06-16

This document is the operating protocol for using Codex as a repeatable Figma screen factory and for bringing Figma screens or flows back into the Mobile Banking CEE platform.

The goal is not to generate impressive one-off mockups. The goal is to repeatedly produce usable, inspectable, system-faithful screens and then translate them into platform code with traceable component mapping.

## Core Principle

The user can speak naturally.

Codex must keep the discipline:

- Reuse real Figma design-system instances first.
- Avoid drawing custom UI unless it is a wrapper, lab note, layout helper, or explicitly approved missing-component placeholder.
- Preserve the original Figma source pages.
- Create work in an isolated LAB page unless the user explicitly asks to update a production design page.
- Keep a visible source map next to generated screens.
- Verify with screenshots before claiming success.
- When importing back into the platform, map Figma instances to React components before writing runtime code.

## Golden Outcome

A successful Codex-generated Figma screen should feel like it was assembled by a designer using the existing Meniga/UniCredit design system:

- Components remain Figma instances where possible.
- Header, search, navigation, rows, dividers, buttons, cards, lists, wallet actions, toasts, filters, and bars come from existing Figma sources.
- The generated screen has a nearby reference screen or source map.
- Text overrides are intentional and do not corrupt nested action labels.
- The output is clean enough for the user to inspect manually in Figma.
- The structure is clean enough that Codex can later reverse-map it into React/platform screens.

## Scope

Use this protocol when the user asks for any of the following:

- Create many screens in Figma from existing components.
- Make a LAB page in Figma.
- Build a screen from a current platform idea.
- Build a flow cover, flow explanation, or screen composition near an existing Figma flow.
- Take a Figma screen or flow and implement it in the Mobile Banking CEE platform.
- Normalize Figma components into the local Design System Inventory.
- Create a repeatable bridge between Figma screens and platform screens/flows.

Do not use this protocol for:

- Pure code fixes with no Figma design work.
- Freeform image generation.
- Committing or deploying.
- Replacing the design-system strategy without approval.

## Required Figma Skills

Before any Figma write operation, Codex must load:

- `figma-use`

When building or updating a screen, view, flow, panel, or multi-section layout, Codex must also load:

- `figma-generate-design`

When creating new reusable Figma components or variants, Codex must also load:

- `figma-generate-library`

When creating Code Connect mappings, Codex must use:

- `figma-code-connect`

## Known Figma File Anchors

Current Meniga Harmonization Design System file:

- File key: `FKbbStgBIP9bFAMl3DPKHF`

Known useful nodes:

- Templates page: `7365:2841`
- Example Documents screen: `9120:12914`
- AI LAB page created as first experiment: `9210:332`
- Generated Messages LAB screen from first experiment: `9210:382`

These anchors are not permanent API contracts. They are useful starting points and must be re-verified before use.

## Allowed Figma Mutations Without Extra Approval

These are safe when the user asks to experiment or test generation:

- Create a new page named `LAB - AI Composition` or similar.
- Create or update frames inside that LAB page.
- Clone existing screen frames into the LAB page.
- Clone existing component instances into generated screens.
- Add source map cards, notes, checklists, labels, or comparison frames in the LAB.
- Change text content in cloned/generated LAB frames.
- Add Figma-only helper backgrounds behind bottom CTAs when needed for visual testing.

## Mutations That Require Explicit Approval

Ask first before:

- Editing original source pages like `13 Templates`.
- Detaching instances in production-like Figma pages.
- Replacing original components.
- Creating new component variants in the design-system library.
- Changing design-system token strategy.
- Moving generated LAB work into a production design page.
- Importing a large Figma flow into runtime code when it adds product scope not previously approved.
- Committing, pushing, or deploying.

## Part A - Figma Screen Composition Protocol

Use this when the user asks Codex to make screens in Figma.

### A1. Understand The Deliverable

Codex should identify:

- Target product: PI, SME, Kids, or generic DS.
- Target country or market if relevant.
- Screen type: homepage, messages, payments, product list, form, success page, settings, flow cover, etc.
- Expected fidelity: quick LAB, stakeholder-ready, or implementation-ready.
- Whether the output belongs in a LAB page or a production Figma page.

If the user says "fa ceva sa pot testa", default to:

- LAB page.
- One reference screen.
- One generated screen.
- One component source map.
- One verification checklist.

### A2. Inspect Before Drawing

Before creating or modifying nodes, Codex must inspect:

- Top-level pages in the file.
- The source page or screen the user gave.
- Existing instances inside one good source frame.
- Component names, component sets, and variants used.
- Text nodes and component properties if text overrides are needed.

Preferred order:

1. Use metadata for a broad page list.
2. Use `use_figma` compact scripts for large nodes, because full XML metadata can time out on heavy pages.
3. Inspect instances with `findAllWithCriteria({ types: ["INSTANCE"] })`.
4. Inspect text nodes only when needed for content override.

### A3. Pick A Source Screen

A source screen is a real design-system composition that already uses the correct primitives.

Good source screens:

- Use real Figma instances.
- Have the same screen size as the target, usually 375x812.
- Use the same product style and app shell.
- Have the same major sections, even if content differs.

Example:

- To make `Messages`, the first experiment used `Documents` because it already had Header, Search, Divider, List, and Home indicator.

### A4. Create Or Reuse LAB Page

For exploratory generation, create or reuse:

- `LAB - AI Composition`

If that page already exists and the user did not ask for a new page:

- Add a new section or frame inside it.
- Do not overwrite prior experiments unless the user explicitly says to replace them.

The LAB should usually contain:

- Title and short note.
- Component Source Map.
- Reference screen clone.
- Generated screen.
- Validation checklist.

### A5. Compose From Instances

The generated screen must prefer:

- Cloned screen sections.
- Cloned component instances.
- Existing component variants.

Manual primitives are allowed only for:

- LAB page wrappers.
- Explanatory cards.
- Labels and notes.
- Layout scaffolding.
- Temporary placeholders for missing components, clearly named as placeholders.
- Protective overlays behind fixed bottom actions, when needed.

Manual primitives are not allowed for:

- Recreating a button from scratch when a Button instance exists.
- Recreating a list row from rectangles/text when a List instance exists.
- Recreating a header from scratch when a Header instance exists.
- Recreating icons from vectors when icon instances exist.

### A6. Text Override Discipline

When overriding text:

- Prefer component properties if available.
- If direct text mutation is needed, load the current font segments first.
- Mutate only the intended text nodes.
- Watch for nested action labels such as `DELETE`, `NEW`, `REMOVE FILTERS`, or bottom action labels.
- Re-screenshot after content changes.

Text overrides should not:

- Accidentally replace swipe action labels.
- Replace badge labels unless intended.
- Replace date labels unless intended.
- Overflow the row or crop vertically.

### A7. Bottom Actions And Native Shell

When adding bottom CTAs:

- Use an existing primary Button instance from the design system.
- Common primary button size: 327x48.
- Common x position in a 375px frame: 24.
- Keep button above the native home indicator.
- Add a subtle white or surface protection layer only if the screen content visually conflicts with the CTA.
- Keep the home indicator visible unless the source pattern does otherwise.

The first LAB experiment used a cloned primary `Button` instance from `7365:14603`, changed label to `Continue`, and placed it in the generated Messages screen.

### A8. Source Map Requirement

Every generated LAB should include a visible source map with at least:

| Section | Source | Target Use | Notes |
| --- | --- | --- | --- |
| Header | source node id or component name | generated screen header | title override |
| Search | source node id or component name | generated search row | placeholder override |
| Divider/List | source node id or component name | content groups | date/title/description overrides |
| Button | source node id or component name | bottom CTA | label override |

The source map is not decoration. It is the future bridge for reverse import into code.

### A9. Screenshot Validation

Codex must verify with screenshot after meaningful changes.

Check:

- Screen visible, not clipped.
- Main row/page layout not compressed.
- Generated frame is 375x812 or intentionally different.
- Components are visually aligned.
- Text is not cropped.
- No wrong labels in hidden/swipe/action areas.
- CTA placement is correct.
- Reference and generated screens are easy to compare.

If screenshot reveals an issue:

- Fix it before continuing.
- Do not claim success with known visual defects unless explicitly triaged.

### A10. Figma Composition Definition Of Done

A Figma LAB screen is done when:

- It lives in a LAB or explicitly requested destination page.
- Original source pages are untouched.
- A reference/source frame is visible or named.
- The generated screen is visible and inspectable.
- Core UI pieces are real Figma instances where possible.
- Source map exists.
- Screenshot validation was performed.
- Known limitations are reported.

## Part B - Figma Flow Composition Protocol

Use this when the user gives an existing flow and asks Codex to create a cover, explanation, or adjacent generated screen.

### B1. Inspect Flow Structure

Codex should identify:

- Number of screens.
- Flow order.
- Main user action per screen.
- Components repeated across screens.
- Entry point and end state.
- Any decision branches.

### B2. Create A Flow Cover

The flow cover should sit near the flow, not on top of it.

Recommended cover sections:

- Flow name.
- Who the flow is for.
- Entry point.
- Step-by-step summary.
- Key decisions.
- Components used.
- Open questions.
- Implementation notes.

### B3. Do Not Overwrite Flow Screens

Unless explicitly asked, Codex should not mutate original flow screens.

Allowed:

- Add adjacent cover.
- Add adjacent source map.
- Add cloned generated alternative.

Not allowed without approval:

- Re-layout existing flow.
- Replace flow screens.
- Detach original components.

## Part C - Figma To Platform Reverse Import Protocol

Use this when the user gives a Figma screen or flow and asks Codex to implement it in the Mobile Banking CEE platform.

### C1. Import Starts With Inventory, Not Code

Before coding, Codex must produce or internally build:

- Screen/frame IDs.
- Component instances used.
- Component set names and variants.
- Text content.
- Icons/images used.
- Layout dimensions.
- Missing component list.
- Platform component candidates.

### C2. Mapping Table

Every import should have a mapping table:

| Figma component | Figma node/component set | Platform component | Status | Action |
| --- | --- | --- | --- | --- |
| Header/Top | component or node id | `PageHeader` or relevant shell | mapped | use existing |
| Search | component or node id | `AccountSearchBar` | mapped/partial | extend if needed |
| List | component or node id | candidate row component | partial | normalize variant |
| Button | component or node id | platform button/link button | mapped | use existing |

Status values:

- `mapped`
- `partial`
- `missing`
- `figma-only`
- `needs-design-decision`

### C3. Reverse Import Decision Tree

For each Figma component:

1. If platform component exists and matches behavior, reuse it.
2. If platform component exists but misses a variant, extend it in a backward-compatible way.
3. If component exists in Figma but not in platform, normalize it into `src/app/components`.
4. If component is only an annotation or LAB helper, do not import it into runtime.
5. If behavior is product scope, ask approval before implementing.

### C4. Platform Implementation Rules

When writing code:

- Keep changes scoped.
- Follow existing React/component patterns.
- Add opt-in variants instead of breaking existing consumers.
- Register reusable components in `src/app/registry/componentRegistry.ts`.
- Add IDs to `src/app/state/demoTypes.ts` when needed.
- Add specimens to `src/app/screens/design-system/DesignSystemPage.tsx` for reusable DS components.
- Update template/screen/flow registries only when the user asks to make it a platform flow or screen.
- Preserve PI/Kids/SME boundaries unless explicitly asked to bridge them.

### C5. Verification For Reverse Import

Minimum verification depends on scope:

For component normalization:

- `npm run build`
- `npm run audit:templates`
- `npm run audit:platform`
- Browser smoke on the Design System Inventory page where the specimen appears.
- `git diff --check`

For a screen or flow:

- `npm run build`
- Relevant audits.
- Browser smoke of the screen/flow.
- Visual checks for spacing, text fit, contrast, and navigation.
- Update handoff and capability docs when product behavior or coverage changed.

### C6. Reverse Import Definition Of Done

A Figma-to-platform import is done when:

- Source Figma link/node is recorded.
- Component mapping table exists in notes/docs or final response.
- Missing components are either implemented, triaged, or explicitly deferred.
- Platform screen/flow uses existing reusable components where possible.
- New reusable pieces are registered.
- Verification commands ran and results are recorded.
- Handoff docs are updated if behavior/capability changed.

## Part D - Component Normalization Protocol

Use this when the user gives a Figma component and asks to add it to the local platform Design System Inventory.

### D1. Inspect Figma Component

Capture:

- Node ID.
- Component name.
- Component set name.
- Variants.
- Width/height.
- Padding/gap.
- Typography.
- Colors.
- Radius.
- Borders/shadows.
- Accessibility role or expected behavior.
- Light/dark behavior if available.

### D2. Implement As Backward-Compatible Component

Rules:

- Add a new component file when no platform equivalent exists.
- Extend an existing component only when ownership and behavior match.
- Prefer explicit opt-in props such as `variant`, `status`, `size`, or `mode`.
- Do not silently alter existing runtime consumers.
- Use local tokens and CSS variables where platform patterns already use them.
- Avoid copying expiring Figma image assets when a robust vector/CSS representation is better.

### D3. Add Design System Specimen

Add a selector-driven specimen in `DesignSystemPage`:

- Show all key variants.
- Include source node metadata if the local pattern supports it.
- Keep specimens testable in the browser.

### D4. Register Capability

If a reusable component is added:

- Add component ID to `src/app/state/demoTypes.ts`.
- Add registry entry to `src/app/registry/componentRegistry.ts`.
- Update docs if capability coverage changes.

## Part E - AI Screen Factory Prompt Recipes

Use these short prompts after this protocol exists.

### Create A New LAB Screen

```text
Codex, use the AI Design Screen Factory Protocol.
In the Meniga DS Figma file, create a new LAB screen for [screen name].
Reuse existing Figma components first.
Put a source map and reference screen next to it.
Do not modify source pages.
```

### Create Many Screens

```text
Codex, use the AI Design Screen Factory Protocol.
Create a LAB batch with screens for:
- [screen 1]
- [screen 2]
- [screen 3]
For each screen, include source map, reference, generated screen, and validation notes.
```

### Add A Component To A Generated Screen

```text
Codex, in the LAB screen you created, add [component] using the existing design-system instance from Templates.
Keep it as an instance and verify with screenshot.
```

### Reverse Import A Figma Screen

```text
Codex, use the Figma To Platform Reverse Import Protocol.
Take this Figma screen [link] and map it to our platform components.
First show the mapping and missing components.
Then implement the smallest coherent platform screen/component changes.
```

### Reverse Import A Full Flow

```text
Codex, use the Figma To Platform Reverse Import Protocol.
Take this Figma flow [link] and import it as a platform flow.
Map components first, normalize missing pieces, register the flow, and verify in browser.
```

### Normalize A Figma Component

```text
Codex, use the Component Normalization Protocol.
Normalize this Figma component [link] into our Design System Inventory.
Keep existing runtime consumers unchanged.
```

## Part F - File And Naming Conventions

Recommended Figma page names:

- `LAB - AI Composition`
- `LAB - AI Composition 2`
- `AI Flow Cover - [Flow Name]`

Recommended Figma frame names:

- `[Screen Name] LAB - instance assembly`
- `Reference clone - [Source Screen]`
- `Component Source Map`
- `How to test this LAB`

Recommended docs when reverse importing:

- Use this protocol as the umbrella.
- Record source node IDs in handoff docs.
- If a mapping becomes stable, add it to a future dedicated component source map doc.

## Part G - Common Failure Modes

### Metadata Timeout

Large Figma nodes can time out when using broad metadata XML.

Fix:

- Use compact `use_figma` scripts.
- Return only top-level children, instance summaries, or selected text summaries.

### Compressed Auto Layout

Horizontal auto-layout rows can collapse height if sizing modes are wrong.

Fix:

- Set parent and row sizing intentionally.
- Validate with screenshot.
- Do not continue until the screen is visible.

### Wrong Text Override

Direct text changes can hit hidden or nested action labels.

Fix:

- Inspect text names and parent chains.
- Prefer component properties where available.
- Re-screenshot.

### Detached Or Manual UI

Generated screens become hard to import if they are mostly rectangles and text.

Fix:

- Clone/import real instances.
- Use manual nodes only for wrappers and notes.

### Lost Source Trace

Future Codex sessions cannot reverse-map a screen if sources are not documented.

Fix:

- Always add a source map.
- Return/record source IDs in the final response.

### Product Scope Creep

A Figma flow may imply new banking behavior.

Fix:

- Map first.
- Ask before implementing new product capability.

## Part H - Human Review Checklist

The user can review a generated LAB by checking:

- Can I select real Figma instances inside the generated screen?
- Is there a source map next to the generated screen?
- Is the reference screen visible?
- Does the generated screen look like the same design system?
- Are labels and dates correct?
- Are action labels such as `DELETE`, `NEW`, `Continue`, and `REMOVE FILTERS` still correct?
- Is the CTA placed naturally?
- Is the screen ready to become a platform mapping task?

## Part I - Codex Final Response Contract

When Codex finishes a Figma LAB composition, the final response should include:

- Figma link to the page or frame.
- What was created.
- What source screen/components were used.
- Whether source pages were left untouched.
- Any limitations.

When Codex finishes a reverse import, the final response should include:

- Files changed.
- Figma source link/node.
- Component mapping summary.
- Verification commands and results.
- Known limitations or next step.

## Part J - Current Baseline Example

The first successful LAB experiment created:

- Page: `LAB - AI Composition`
- Page node: `9210:332`
- Reference: cloned `Documents` screen from node `9120:12914`
- Generated screen: `Messages LAB - instance assembly`
- Generated node: `9210:382`
- Reused instances: Header, Search, Divider, List, Home indicator, Button
- Added bottom CTA: cloned primary Button from `7365:14603`, label `Continue`
- Added visible Component Source Map and test checklist

This is the reference pattern for future screen batches.
