## Goal
Fix the distribution donut chart leader-line mismatch: each leader must originate on its own slice's arc (color-correct) and route to a label on the matching side. Robust to any data, not just the current 4 slices.

## Scope — single file
`src/app/components/investments/InvestmentDistributionChart.tsx` (only render site is `InvestmentsPortfolioScreen.tsx`; no tests/snapshots exist).

## Changes

### 1. Add geometry helpers (overlay coordinate space)
The leader-line overlay uses `viewBox="0 0 375 179"`; the 179px donut is centered horizontally, so its center in overlay coords is **(187.5, 89.5)**, radius **62.5**, stroke **54** (outer edge at r+27 = 89.5).

Add constants:
```
CHART_WIDTH = 375, CHART_HEIGHT = 179
DONUT_CENTER_X = 187.5 (= CHART_WIDTH / 2)
DONUT_CENTER_Y = 89.5 (= DONUT_SIZE / 2)
DONUT_RADIUS = 62.5 (unchanged)
```

Add a function `buildSliceMidpoints(items)` that walks the slices the same way `buildSvgSegments` does (cumulative offset, same gap) and returns per item:
- `startAngle`, `midAngle` (degrees, 0 = top, clockwise — same convention as the -90° rotated segments)
- `side`: `"right"` if midAngle ∈ (0,180), else `"left"`
- `ringPoint`: (x,y) on the ring at the outer edge (radius = DONUT_RADIUS + STROKE/2) — where the leader touches the slice color
- `outerPoint`: (x,y) a few px further out along the same radial — the elbow start

### 2. Replace fixed label corner positions with side-aware slotting
Remove `LABEL_POSITIONS`. New logic:
- Bucket the (up to 4) visible labels into `left` and `right` arrays by their `side`.
- Within each side, sort by ring Y (top→bottom), then assign each a vertical slot evenly spaced within the container's vertical range (e.g. 4 slots of ~45px each). This prevents same-side overlap (e.g. RO account-list puts 3 labels on the left).
- Each label gets a computed absolute style: `top` = slot Y, and `left-[24px]` (left side) or `right-[24px]` (right side), `text-left`/`text-right` accordingly.

### 3. Replace hardcoded leader lines with per-slice dynamic paths
Remove `CONNECTOR_LINES`, `CONNECTOR_HORIZONTAL_LINES`, `CONNECTOR_STROKES`.

For each visible item, draw a `<g>` (in the 375×179 overlay SVG) with two paths, stroked with **`item.color`** (the slice's own color — guarantees match):
- **Radial elbow**: from `ringPoint` → `outerPoint` → a short horizontal stub toward the label's side edge (e.g. to x=351 on the right, x=23 on the left), at the label's slot Y. Concretely: `M ringX ringY L outerX outerY L (sideEdgeX) (slotY)` then a horizontal segment to the label edge.
- The leader terminates exactly at the label's vertical slot so it visually connects to that label.

This makes each leader (a) start on its own slice color, and (b) end at its own label — both color and geometry correct.

### 4. Keep everything else unchanged
- Donut `<svg>` segments, white hub, total `<section>`, legend list below, props, the `slice(0,4)` cap — all unchanged.
- Guard: if fewer than 4 items or items sum oddly, the midpoint walk still produces valid angles (driven by `item.percent`, same source as segments).

## Verification
- `npm run build` must pass.
- `npm run audit:templates` must stay `templates=47 ...` (unaffected, but cheap to confirm).
- Manual reasoning (recorded in handoff at closeout): for RO `account-list` (EUR 48 / Local 24 / USD 18 / GBP 10), leaders now anchor at midpoints — EUR top-right, Local bottom-left, USD top-left, GBP upper-left — each on its own slice color; left-side labels stacked in 3 vertical slots without overlap.

## Not changing (out of scope)
- The legend list, colors palette (`DISTRIBUTION_COLORS`), donut segment math, and the `performance` tab (which doesn't render this chart).
- No handoff docs touched in this step (implement request; I'll update docs at closeout when asked).