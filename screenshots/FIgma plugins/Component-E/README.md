# Component-E Build UI Bridge

Local Figma development plugin for bidirectional Mobile Banking CEE screen handoff. This is the unified Component-E plugin with the Build-UI import capability merged in.

The plugin uses one canonical schema in both directions:

```json
{
  "schema": "build-ui.screen.v1",
  "frame": { "width": 393, "height": 852, "background": "#F5F5F5" },
  "root": {
    "type": "container",
    "name": "Screen",
    "bounds": { "x": 0, "y": 0, "width": 393, "height": 852 },
    "styles": { "fills": [{ "type": "SOLID", "color": { "hex": "#F5F5F5" } }] },
    "children": []
  },
  "assets": []
}
```

## What It Does

- Builds editable Figma layers from `build-ui.screen.v1` JSON copied from the demo header dropdown or another Figma extraction.
- Also accepts legacy Build-UI / Component-E-compatible payloads and normalizes them to `build-ui.screen.v1` before rendering:
  - `codex-figma-component-spec/v1`
  - `components[].root`
  - `roots[]`
  - `root`
  - `screen`
  - top-level `children[]` / `layers[]`
- Extracts the current Figma selection into the same `build-ui.screen.v1` contract.
- Supports frames, components, instances, groups, rectangles, ellipses, lines, text, SVG/vector assets, and image fills.
- Preserves numeric absolute bounds, Figma paint arrays, effects, corner radii, strokes, opacity, rotation, visibility, text styling, text segments, Auto Layout intent, child Auto Layout positioning, and useful Figma metadata.
- Extracted JSON also includes `components[]` and `variantSets[]` companion data where available, plus raw Figma style refs, component props, bound variables, and optional `exports.rootPng2xAssetRefs` for visual comparison.
- Offers three build layout modes:
  - `Smart hybrid`: applies Auto Layout only when child geometry matches padding/gap/alignment.
  - `Pixel safe`: keeps imported layers absolutely positioned.
  - `Trust JSON layout`: applies explicit JSON Auto Layout directly.
- Can build into the selected frame/component or create a new frame.
- Can clear the target, remove previously generated layers, resize to JSON size, fit JSON to target width, or lock generated layers.
- Can include or skip SVG assets, image assets, hidden layers, optional PNG 2x snapshots, max extraction depth, and asset count limits during extraction.
- Runs preflight diagnostics before building, blocking invalid canonical geometry and surfacing warnings for issues such as missing assets, CSS/DOM-style keys, unsupported layout values, and narrow text bounds.
- Shows a dedicated Diagnostics panel after build/extract, listing preflight stats, all build warnings, extraction warnings, component/variant companion counts, and optional PNG snapshot refs instead of hiding the useful details inside a short status line.

## Contract Rules

The JSON is Figma-ready design data, not HTML/CSS export data:

- `schema` must be `build-ui.screen.v1`.
- `frame`, `root`, and `assets` are required.
- Every layer must include `type`, `name`, and numeric `bounds`.
- Coordinates are absolute relative to the root screen.
- Layer types are limited to `container`, `shape`, `text`, `ellipse`, `line`, `vector`, and `image`.
- Colors use Figma paint arrays such as `styles.fills`.
- Shadows use Figma effects such as `DROP_SHADOW`.
- Text uses numeric `fontSize`, Figma `lineHeight`, `letterSpacing`, `fontName`, and alignments.
- Mixed-style text can use `text.segments`.
- SVG and image data live in `assets[]`; visual layers reference them with `assetRef`.
- SVG assets are accepted when identified by `kind: "svg"`, SVG `mimeType`, or plain SVG content.
- Auto Layout is intentional: use `layout` only for logical rows/stacks, and use `autoLayoutChild.layoutPositioning: "ABSOLUTE"` for overlays, peeking cards, status items, and precision art.
- Layer names should be semantic and designer-friendly, for example `Screen`, `Header`, `Primary Account Card`, `Balance Stack`, `Search Row`, and `Transaction Row`.
- Do not include CSS-only keys such as `backgroundColor`, `boxShadow`, string `fontSize`, string `borderRadius`, `asset.dataUrl`, DOM tags, class names, or browser/device shell elements.
- Legacy Component-E / Build-UI JSON is accepted at import time, but the plugin normalizes it to this contract internally before building.
- The builder runs a preflight pass before creating Figma nodes. Preflight errors stop the build; preflight warnings are included in the build summary.
- The UI Diagnostics panel is part of the contract review flow. Treat any warning there as something to either fix in the JSON generator or consciously accept for the specific screen.

## Install Locally

1. In Figma, open `Plugins -> Development -> Import plugin from manifest...`.
2. Select `screenshots/FIgma plugins/Component-E/manifest.json`.
3. Run `Component-E Build UI Bridge`.
4. Use `Build from JSON` to paste and build a screen.
5. Use `Extract selection` to select a Figma frame/component/layer and export JSON.

## Manual Smoke Fixtures

Use `smoke-fixtures/manual-runtime-smoke.md` for the final Figma runtime smoke.

The fixture set includes:

- `smoke-fixtures/canonical-mobile-screen.json`: canonical `build-ui.screen.v1` with semantic mobile-banking layers, Figma paints/effects/text objects, SVG assets, mixed-style money text, and conservative Auto Layout intent.
- `smoke-fixtures/legacy-component-e-screen.json`: legacy `codex-figma-component-spec/v1` with CSS-style legacy fields and inline SVG/PNG/JPEG assets, used to verify normalization.

`npm run audit:figma-bridge` imports both fixture files for both plugin copies, so the manual smoke uses the same payloads as the local gate.

## Verification

Local verification should include:

```bash
node --check "screenshots/FIgma plugins/Component-E/code.js"
npm --prefix "screenshots/FIgma plugins/Component-E" run build
npm --prefix "screenshots/FIgma plugins/Component-E" run lint
npm run audit:figma-bridge
npm run build
npm run audit:templates
npm run audit:platform
```

Figma runtime behavior still needs a manual plugin smoke after installing the manifest because the Figma plugin API is not available in Node.
