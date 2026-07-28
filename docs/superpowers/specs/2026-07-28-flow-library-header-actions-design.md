# Flow Library Header Actions Design

## Goal

Make the Flow Library detail header compact and action-led: show Figma, PDF, and Word as three icon-only controls aligned on the top right.

## Scope

- Replace the visible `Figma <node id>` label with a Figma icon while preserving its external source link.
- Replace the visible Export PDF and Export Word labels/download glyphs with dedicated PDF and Word icons while preserving their existing export handlers and busy/disabled state.
- Remove the supporting handoff sentence.
- Retain accessible names and tooltips for all three icon-only controls.

## Non-goals

- No changes to flow export generation, Figma URLs, source data, or Flow Library navigation.
- No new dependencies or new icons outside the shared application icon registry.

## Verification

Add a Flow Library integration test covering the three accessible controls and the absence of the removed handoff copy, then run the focused test, typecheck, and production build.
