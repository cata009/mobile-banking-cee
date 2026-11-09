# Colors: one source

Every color in the app is defined once, in `src/app/registry/colorTokens.ts`.

```
colorTokens.ts  ──generate──▶  src/styles/colors.generated.css          (web: CSS custom properties)
                └─generate──▶  native-spike/src/universal/sourcePalette.json  (React Native demo)
                └─read──────▶  colorRegistry.ts                         (the Colors page in Design System)
```

## Change a color

1. Edit the value in `colorTokens.ts`. A raw palette color (`--uc-teal-main`) is a hex. A role (`--uc-action`,
   `--uc-action-strong`, `--uc-surface`) usually points at a palette color with `var(--uc-teal-main)`, so changing
   the palette color changes every role that follows it.
2. Run `npm run generate:colors`.
3. The web, the phone in the demo and the Design System Colors page all show the new value.

`npm run audit:colors` (part of `audit:all`) fails if a generated file no longer matches the source, so nobody can
edit the generated files by hand and drift.

## Light and dark

`light` and `dark` are both written in the source. A token without `dark` keeps its light value in dark mode
(it is not redeclared). Aliases are resolved per theme by `resolveColorToken`, the same function the generator
uses.

## What the phone follows

The React Native demo reads colors through `sourceColor('var(--uc-...)', dark)`, which looks the token up in
`sourcePalette.json`. Anything written through a token follows the source. A color typed into a component
(`'#007A91'`, `rgb(...)`) does not.

`npm run audit:color-literals` counts those typed colors per file in `docs/design-system/color-literals-baseline.json`
and fails when a file gains one. Convert them to tokens and refresh the baseline with
`node scripts/audit-color-literals.mjs --write-baseline`. Not counted: Italy, Evo 2027, Kids, tests, and brand or
product artwork (flags, logos, card art), whose colors are the artwork itself.

## Proven

Changing `--uc-teal-main` to magenta in the source and regenerating turned the primary-button fill, the active tab
icon, the product icons and the active tab underline magenta on the phone (Home 12 elements, Payments 7, Messages
8, none left on the old color) and on the web. Reverting restored every value byte for byte. The only element that
kept the old teal was an offer card that uses `--uc-banner-blue-2`, a separate banner token with the same value.

## Kept outside the source on purpose

- `--uc-investment-reference-*` in `src/styles/investment-reference.css`: approved static snapshots, the same in
  both themes, pinned by `tests/components/investment-semantic-colors.test.tsx`.
- `--prime-*` in the Prime presentation, and the Italy and Evo 2027 styles (out of scope until scheduled).

## What is still typed directly (tracked by the ratchet)

About 1,400 typed colors remain in 212 files. Roughly half are authored on purpose: theme and appearance
previews and pickers (swatches), the Prime experience, tutorial and illustration art, charts, and the Flow Library
and Tools chrome. About 680 in 167 files are ordinary interface colors that should become tokens, component by
component. They do not follow the source today; the ratchet stops the number from growing. Shadows, static white
and the brand red in the React Native library are already tokens (`--uc-shadow-rgb`, `--uc-static-white`,
`--uc-brand`, `--uc-danger`).
