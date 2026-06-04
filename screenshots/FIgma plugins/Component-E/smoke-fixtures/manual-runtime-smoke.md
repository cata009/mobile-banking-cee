# Manual Figma Runtime Smoke

Use this checklist after importing either local manifest:

- `figma-plugins/screen-json-importer/manifest.json`
- `screenshots/FIgma plugins/Component-E/manifest.json`

The plugin UI must stay English-only.

## Build Canonical Screen

1. Run the plugin.
2. Open `Build from JSON`.
3. Paste `smoke-fixtures/canonical-mobile-screen.json`.
4. Use `Destination: New frame`.
5. Use `Layout mode: Smart hybrid`.
6. Click `Build UI`.
7. Expected result:
   - one frame named `Smoke Mobile Screen`;
   - frame size `393 x 852`;
   - light app background, not a phone/browser shell;
   - editable layers named `Header`, `Primary Account Card`, `Quick Actions Row`, `Transaction Row`, and `Bottom Navigation`;
   - SVG icons are vectors/assets, not missing boxes;
   - text remains in normal word lines, not letter-by-letter wrapping.

## Preflight Diagnostics

1. Open `Build from JSON`.
2. Paste a canonical payload with a string measurement, for example `"x": "24px"` inside a layer `bounds`.
3. Click `Build UI`.
4. Expected result:
   - the build is blocked before a new Figma frame is created;
   - the status starts with `JSON preflight failed`;
   - the message names the non-numeric bounds field.

Then paste a canonical payload with a missing `assetRef`.

Expected result:

- the build can complete with a placeholder;
- the build summary includes a warning naming the missing asset ref.

## Build Legacy Component-E Payload

1. Open `Build from JSON`.
2. Paste `smoke-fixtures/legacy-component-e-screen.json`.
3. Use `Destination: New frame`.
4. Use `Layout mode: Pixel safe`.
5. Click `Build UI`.
6. Expected result:
   - one frame named `Legacy Smoke Card`;
   - imported text is editable;
   - inline SVG, PNG, JPEG, and referenced SVG assets are visible;
   - legacy CSS-style fields are normalized by the plugin and do not need manual cleanup.

## Extract And Rebuild

1. Select the built `Smoke Mobile Screen` frame.
2. Open `Extract selection`.
3. Keep `Include SVG assets` enabled.
4. Optional: enable `Include PNG snapshot 2x` for visual comparison.
5. Click `Extract JSON`.
6. Copy or download the extracted JSON.
7. Switch back to `Build from JSON`.
8. Paste the extracted JSON.
9. Use `Destination: New frame` and `Layout mode: Pixel safe`.
10. Click `Build UI`.
11. Expected result:
    - rebuilt frame is visible and editable;
    - exported schema is `build-ui.screen.v1`;
    - layer names remain designer-friendly;
    - extracted JSON includes `frame`, `root`, `assets`, and `source`.

## Single-Layer Safety

1. Select only the `Screen Title` text layer inside the smoke screen.
2. Run `Extract selection`.
3. Copy or download the JSON.
4. Rebuild it through `Build from JSON`.
5. Expected result:
   - the plugin wraps the single text layer in a `Screen` root;
   - rebuilt output is not empty.
