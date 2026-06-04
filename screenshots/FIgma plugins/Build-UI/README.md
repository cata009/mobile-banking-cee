# Build-UI

Figma plugin that receives JSON and builds an editable UI screen inside a selected or newly-created frame.

## Workflow

1. Select one destination frame in Figma, or let the plugin create a new one.
2. Run `Build-UI`.
3. Paste JSON in the plugin UI.
4. Click `Build UI`.
5. The plugin creates editable Figma layers inside the target frame.

## Target Frame Strategy

Build-UI treats width as the contract and height as content-driven.

- Default mode is `Auto`: use the selected frame if exactly one frame/component is selected; otherwise create a new frame.
- New frames can be `393 px`, `375 px`, or the JSON-provided width.
- JSON coordinates are scaled to the target width, so a `390 px` JSON screen can build correctly inside `375 px` or `393 px` frames.
- Height can be auto-resized from the deepest visible JSON layer plus bottom padding.
- `Require selected frame` is available when you want to prevent accidental new-frame creation.
- `Always create new frame` is available when you want every build to be a fresh screen.

## Compatible JSON

Build-UI accepts the JSON exported by `Component-E`:

- `components[].root`
- `roots[]`
- `root`
- `screen`
- `children[]`
- `layers[]`

Minimal example:

```json
{
  "screen": {
    "name": "Mobile Home",
    "width": 390,
    "height": 844,
    "background": "#F6F2EA"
  },
  "children": [
    {
      "type": "text",
      "name": "Greeting",
      "x": 24,
      "y": 56,
      "width": 260,
      "height": 38,
      "characters": "Good morning",
      "fontSize": 30,
      "color": "#1D1D1F"
    },
    {
      "type": "rectangle",
      "name": "Main Card",
      "x": 20,
      "y": 156,
      "width": 350,
      "height": 176,
      "fill": "#FFFFFF",
      "radius": 24,
      "stroke": "#E6DED3",
      "strokeWeight": 1
    }
  ]
}
```

## Supported layers

- Frames/containers with children.
- Rectangles, ellipses, lines, and fallback vector rectangles.
- Text nodes with font, size, fill, alignment, line height, letter spacing, text case, decoration, and styled segments where available.
- Solid fills, common gradients, strokes, corner radius, corner radii, shadows, blur effects, opacity, blend mode, rotation, visibility, and locking.
- SVG assets from `Component-E` when included as plain SVG assets.
- PNG assets from base64 image exports.

## Options

- `Remove previous Build-UI output`: removes layers previously created by this plugin.
- `Clear selected frame first`: removes every child layer in an existing target frame before building.
- `Use target frame as root`: maps the JSON root frame to the target Figma frame and creates its children directly inside it.
- `Scale to target width`: scales JSON coordinates proportionally using the target frame width.
- `Layout mode`:
  - `Smart hybrid`: uses safe Auto Layout when explicit or inferred layout matches the pixel bounds.
  - `Pixel safe`: keeps generated layers positioned by bounds and avoids Auto Layout reflow.
  - `Trust JSON layout`: applies explicit JSON Auto Layout only; useful when the JSON was authored carefully.
- `Auto height from content`: resizes the target frame height using rendered content bounds plus bottom padding.
- `Render hidden JSON layers`: creates hidden layers too, preserving `visible: false`.
- `Lock generated layers`: locks generated layers after creation.

## Development

```bash
npm install
npm run build
npm run lint
```

TypeScript compiles `code.ts` to `code.js`, which is referenced by `manifest.json`.
