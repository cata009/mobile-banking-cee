# Romanian baseline PFM chart leaves

Owner: `/root/ro_pfm_chart_impl`. Base: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
Initial complete pending changes and ownership were recorded before edits in
`.codex-temp/ro-baseline-pfm-charts/ownership.json`.

Owned deliverables:

- `native-spike/src/experiences/pi/current/baseline/spending/charts/index.tsx`
- `native-spike/__tests__/ro-baseline-pfm-charts.test.tsx`
- This document and the private chart evidence directory.

Implement the Source Romanian current cash-flow, subcategory bubbles, period
indicator contract, and category-pill width/tint helpers. The screen owner keeps
the canonical transaction aggregation, reporting currency, category overrides,
period window, privacy state and navigation. The leaves consume those values.

The baseline cash-flow scales two 16px bars to a maximum 104px and retains an
18px minimum. Overview totals remain visible under Source privacy behavior.
Bubble geometry consumes the complete subcategory set. Excluding labels changes
activity without reflow; the final active label is disabled. Native uses its
button accessibility contract. Browser leaves retain Source normal font line
boxes, real button tooltip, pressed state, original 16% sRGB color-mix and
explicit native-to-browser color pass-through. The visible period key window is
provided by the consuming screen and is not independently reduced.

Validation uses renderer regression tests plus the actual Source application on
4004 and registered CurrentApplication on 4006 at viewport 375×811 with Source
frame 0. Source was authenticated through its normal visible UI gate. Captures
were compared without masks, thresholds, tolerance, offsets or figure overrides.
Private evidence includes the complete computed Source snapshots, pixel leaves,
Source-versus-Native exclusion states, and ownership/delta records. The full
integration verification is reserved for the integration owner after all editors
finish. Source code, shared legacy charts, fonts, assets and configuration remain
outside this agent's ownership.

Final leaf checks: six renderer tests pass, owned ESLint has zero warnings, and
the combined Native TypeScript check passes. Browser comparison confirms all
four Source exclusion/reinclusion states match exactly for geometry, tooltips,
pressed state and final-active protection. The cash-flow leaf has zero changed
pixels. The Shopping bubble leaf retains 127 differing pixels confined to thin
circle edges; its Source and Native dimensions, computed radius, colors,
typography and labels match. This residual is reported to integration, without
a mask or tolerance. The main owner independently confirmed category-pill
interior colors match after the browser color-mix pass-through.
