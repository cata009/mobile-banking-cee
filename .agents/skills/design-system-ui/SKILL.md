---
name: design-system-ui
description: Build or modify UI in this app (screens, components, styling) consistently with the UniCredit design system — especially when implementing Figma references. Maps each visual element to existing components, tokens, and screen patterns before writing new code; reuse is the strong default but never blocks delivery. Use for any "build this screen / implement this Figma / add or restyle UI" task.
---

# Design-System-First UI Building

This repo contains a mature UniCredit CEE design system: tokens, primitives, domain components, screen patterns, machine-readable registries, and a live in-app inventory. When the user asks for a screen (usually with Figma references), that screen is almost always composed of things that already exist here.

Your job: **deliver exactly what the Figma/user asks for, built out of as much existing material as possible.**

Two failure modes are equally bad — avoid both:

1. Rebuilding from scratch what already exists (visual drift, duplicate components, inconsistency).
2. Being so strict about reuse that you deliver nothing, refuse to build something the design genuinely needs, or mangle shared components trying to force a fit.

Reuse is a strong recommendation and the default — **not a prohibition**. When nothing fits, build new (on tokens, in the right folder) and keep moving.

## The decision ladder

For every visual element, walk down and stop at the first step that works:

1. **REUSE** — an existing component fits as-is (its props cover the differences). Use it.
2. **EXTEND** — an existing component is close. Add a backward-compatible option: a new *optional* prop whose default preserves today's rendering. First Grep the component's usages — if the change could alter how other screens look, do NOT extend; drop to 3 or 4.
3. **COMPOSE** — build the block from existing primitives + tokens, inline in the screen or as a small local component.
4. **CREATE** — nothing fits. Build a new component: tokens for every color/size/typography, project naming conventions, correct domain folder. This is allowed and normal — just note it in your final summary so the human can review.

Time-box the search: the registry, the map, and one or two similar screens. If you still haven't found a match, that IS the answer — go down the ladder. Never stall, never respond "this can't be built consistently."

## Where to look (in order — targeted lookups, not a full audit)

1. `component-map.md` (this folder) — quick orientation map of directories and headline components.
2. `src/app/registry/componentRegistry.ts` — authoritative machine-readable catalog: component id → file path + `usedByScreens`. Related: `screenRegistry.ts`, `flowRegistry.ts`, `aiCatalog.ts`.
3. **The 1–2 most similar existing screens** in `src/app/screens/<domain>/` — read them and copy their composition idioms (PageHeader usage, spacing rhythm, translations, state wiring). Usually the highest-value read.
4. Components: `src/app/components/<domain>/`, shared root `src/app/components/`, primitives in `src/app/components/ui/`.
5. Tokens: `src/styles/theme.css` — `--uc-*` colors, `--uc-type-*` typography, light/dark via `[data-uc-theme]`.
6. Icons: `src/app/components/icons/` (`AppIcon` + `ICON_INVENTORY`) and `docs/design-system/platform-icons-svg-catalog.md`. Prefer registered icons; register genuinely new SVGs in the icon registry instead of inlining them.
7. Exact visual contracts: `docs/design-system/component-implementation-handoff/components-handoff.md` — per-component deep dives (geometry, radii, typography) and "High-Risk Failure Patterns". Open the relevant section when touching one of those components.
8. Live inventory: `src/app/screens/design-system/` renders every active component — useful to confirm what exists visually.

## Figma workflow

When given Figma references:

1. **Get the design.** If the Figma MCP is connected, load the `figma-design-to-code` skill first, then `get_design_context` (plus a screenshot for layout truth). Without MCP access, ask for screenshots/exports.
2. **Decompose and map.** Split the frame into regions and write a short mapping table *before* coding:

   | Figma element | Repo match | Decision |
   |---|---|---|
   | Header with back + title | `PageHeader` | reuse |
   | Balance block | `AccountBalanceCard` | reuse |
   | Detail rows | `NavigationRow` | extend: optional trailing badge |
   | New chart type | — | create `XyzChart` on tokens |

3. **Expect resemblance.** These Figma screens are drawn WITH this design system. Recognizing "this is a `ProductCard` / `NavigationRow` / `TextField`" by role and structure is the core task — match by role, not by pixel identity.
4. **Noise-level deltas → design system wins.** ±1–2px, a slightly different gray, a marginally different radius: use the existing component/token unchanged. Consistency beats pixel-perfection on noise.
5. **Clear intent → Figma wins.** A genuinely different layout, pattern, or element is the spec — build it, using tokens. When it's ambiguous whether a difference is intentional, prefer the existing component and flag the difference in one line in your summary (don't block on the question).
6. **Values missing from tokens:** use the nearest token. Hardcode only when the value is clearly intentional (e.g. brand illustration colors), and keep the raw value local to that component.

## Safety rails — do not break the project

- **Before editing any shared component**, Grep its usages (`usedByScreens` in `componentRegistry.ts` helps). Only backward-compatible changes: new props optional, defaults preserve current rendering. If in doubt → don't edit; compose or create instead. A new component never breaks existing screens; a careless edit to `NavigationRow` breaks twenty.
- Never delete or rewrite an existing component as a side effect of building a screen.
- All user-facing text goes through the translation system — `guidelines.md` has the mandatory workflow. Mirror how the nearest similar screen wires its strings: `useLanguage()` + `t()`, keys in `src/translations/types.ts`, values in the per-country files and/or the `shared.ts` runtime block.
- New screens get wired the same way the nearest similar screen is wired (screen registry, navigation/route policy, deep-link state). Copy the pattern; don't invent a parallel one.
- Verify before finishing: typecheck/build, run the related tests in `tests/`, and if a preview is available do a quick visual pass at 375px width (phone baseline; content cards 327/343px; 16px page inset rhythm).

## Economy rules

- **Single agent. No subagent swarms, no multi-agent workflows, no fan-out.** Direct, targeted tool calls only.
- Use the registries and the map instead of scanning directory trees; Grep with precise patterns; read only the relevant sections of files.
- Don't re-read large files you've already read, and don't read entire folders "for context."

## Finishing summary

End every UI task with a short report:

- **Reused:** components used as-is.
- **Extended:** what changed, plus confirmation that usages were checked.
- **Created:** new components/files, with one line on why nothing existing fit.
- **Deviations:** any hardcoded values or intentional divergences from Figma or the design system.
