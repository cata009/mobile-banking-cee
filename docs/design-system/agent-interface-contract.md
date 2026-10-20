# Interface authoring contract

This contract applies to every agent creating or changing DEMO interfaces, component previews, or Figma designs. Read it with the root [AGENTS.md](../../AGENTS.md); existing ownership and preservation rules continue to apply.

## Establish the source before editing

The canonical library is [the Figma Design System](https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF), file key `FKbbStgBIP9bFAMl3DPKHF`.

1. Inspect the current approved canonical pages and the relevant main component, properties, variants, tokens and documentation. Use the repository [Figma catalog](../../src/app/screens/design-system/figmaLibraryCatalog.ts) to locate them, then verify the current Figma/source contracts. Counts and snapshots can become stale.
2. Preserve the exact approved page taxonomy: names, IDs, order and grouping. Use the existing matching page; do not invent parallel categories, rename pages, or treat proposal pages, archives or drafts as approved library content. A connected source library alone does not establish approval.
3. Identify the actual implementation and supported variants through the [component registry](../../src/app/registry/componentRegistry.ts), explicit implementation mappings and referenced source. Check [native preview mappings](../../src/features/demo-native/designSystemPreview.ts) and shared contracts when applicable. Record the Figma node/component key and implementation/source IDs used by the interface.

The catalog lists the Figma library. It does not prove that every family or variant is implemented, available on every platform, or approved for a particular experience. Keep this distinction visible in listings, details, exports and handoffs. Describe real executable source, illustrative examples and unavailable mappings accurately; never label an approximation or shared TextField as an implemented Dropdown. Keep catalog/registry metadata free of UI runtime imports.

## Compose with approved components

- Reuse actual existing shared/native components, semantic tokens and approved preview bridges before introducing new UI. Check available props and source contracts rather than copying or redrawing a component. Do not reactivate retired PI screen imports to fill a preview gap.
- Preview components as executable code. Never substitute a Figma screenshot, PNG capture, flattened interface, or image gallery for a component implementation. New raster content is limited to approved original photographs: preserve the original bytes and extension, record source provenance, and keep text, layout and controls in code. Reuse an identical existing asset instead of copying it. The 15 raster-only Company marks excluded by the user remain outside the implementation scope.
- Compare Figma against existing implementations first, reuse or extend what exists, and implement only confirmed gaps. Keep one component/catalog entry per implementation with its variants and source references; do not add a parallel source-image catalog, duplicate implementations or repeated previews of the same component.
- Match the intended platform and experience. Preserve executable business decisions, screen and flow IDs, navigation, scenarios, labels, data and accessibility semantics unless the task explicitly changes them. Keep business policies in features; experience composition does not duplicate those decisions.
- Use the same source IDs, variant mappings, icons and assets in DEMO and Figma. Preserve native bridges and source/package export behaviour. Do not replace original artwork with approximations or claim native implementation from an illustrative Swift/Kotlin example.
- In Figma, use component instances, published/local styles and variables. Preserve original master identities, keys, variant properties, nested bindings, interactions and assets. Do not detach, flatten or recreate originals to restyle or organize them; use move/reparent for organization.

Routine composition from approved components proceeds within the task's existing authorization. Resolve a missing mapping honestly rather than introducing an approval loop for already approved work.

## Handle a genuine gap

First search approved families, variants and existing proposals by source/component identity. For a genuinely unmapped new component, create or update a source-preserving, editable proposal on the dedicated `De aprobat / <source>` Design System page. Keep the original source intact and retain its reference/bindings; do not create duplicate proposals for the same family.

Document its source file/node/key, intended use, states, proposed implementation mapping and known differences. Keep it clearly pending and outside approved catalog/implementation claims. Obtain individual user approval for that proposal before promoting it into a canonical page or publishing it. Promote by move/reparent while preserving identity; approval of one proposal does not approve neighbouring proposals or unimplemented platform coverage. A design/refactor task alone does not authorize deployment or publication.

## Author consistent Figma documentation

Use the existing documentation template and UniCredit styles:

- Documentation width: **1724 px**. Use a black title header without Accessibility mentions or links; use white body sections.
- Section order: **Overview → Accessibility → Anatomy, dimensions & spacing → Variants & states → Behaviour & adaptation → References**.
- Show real component dimensions at 1×, actual font sizes/weights/line heights, padding, gaps, radii and alignment. Document Fixed/Hug/Fill and Auto Layout from the real component rather than inferred screenshot geometry. Use pink spacing bands and dotted guides consistently with the approved template.
- Use meaningful contextual copy, real fonts and existing assets. Demonstrate supported states and adaptation with the actual component; label unavailable states or examples instead of fabricating them.
- When text enlargement is meaningful, document 100% and 200% **text** behaviour separately from Figma drawing scale or browser zoom. Do not call a doubled drawing a text-resize test, and do not invent text-resize examples for purely geometric elements.
- References identify the canonical design node/key, implementation paths/contracts, source assets and any pending limitations.

## Validate in the intended host

Check the changed interface in its real web/native host and relevant states. Verify applicable AA requirements, including contrast, accessible names/roles/states, keyboard and focus behaviour, target usability, and text enlargement/reflow. Report what was actually tested and any remaining limits. Static documentation or Figma measurements alone do not establish AA acceptance or certification.

Run affected tests and `npm run audit:modules` for runtime changes. Review the exact owned delta and coordinate with the integration owner, who runs `npm run verify` once on the combined final state after editors finish. Never overlap `verify` or coverage runs, weaken assertions/thresholds, or modify unrelated files to obtain a green gate.

## Retired template gallery

The legacy DEMO Templates gallery and its reconstructed screen previews are retired. Use approved DS components and the real screen/flow implementation as the source of composition. Do not recreate a parallel screenshot/template catalog or use archived captures as executable UI. `TemplateProductsPreview.tsx` remains shared runtime code for existing RO/RS flows; preserve those consumers and their behaviour.
