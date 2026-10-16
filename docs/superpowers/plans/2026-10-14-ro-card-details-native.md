# Romanian baseline native card details

Owner: `/root/ro_card_details`. Base: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`.
Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`.
Initial pending state: `.codex-temp/ro-baseline-card-details/initial-pending.txt`.
Owned paths: `native-spike/src/experiences/pi/current/baseline/Card.tsx`,
`native-spike/__tests__/ro-baseline-card-details.test.tsx`, this plan and
`.codex-temp/ro-baseline-card-details/**`.

Expanded owner scope before editing: new `baseline/CardInfo.tsx` and
`baseline/CardOptions.tsx`. Their initial pending state was empty, recorded in
`expanded-scope-initial-pending.txt`; the ownership JSON includes both paths.
Reachable Source info/options destinations require shared baseline fields,
navigation rows and page header composition in place of generic banking rows.

Source files are read-only. Preserve canonical products, figures, order, artwork,
local selection, copy, transaction callbacks, Face ID timing and sensitive Back.
The integration owner owns the adapter guard, common artwork repairs and header.
The transaction owner supplies `RoBaselineTransactions` so no filter policy is
duplicated in the Card composition.

1. Record ownership and initial pending changes; inspect Source card details,
   sensitive details, card artwork and current banking products.
2. Add regression tests for canonical credit/debit values, callbacks, privacy,
   selection, sensitive details/copy, local Back and active-screen lifecycle.
3. Observe RED for the missing native composition, then implement shared leaves
   in the allocated Card module with Source geometry and defaults.
4. Run focused tests and compare the native preview with Source port 4004.
   Report the exact delta and any common leaf repairs to the integration owner.
5. Integration owner runs combined verification after all editors finish.

RED: five tests failed with `Card` undefined before implementation (missing
composition), confirmed 2026-10-14. Source screenshot and browser geometry are
under the private evidence directory. No Source writes or artwork conversion.

GREEN: six card tests pass, including copy payload/toast, Romanian host language,
resolved dark theme and header progress. Native TypeScript and owned-file lint
pass. Browser Source and native debit/sensitive screenshots are captured in the
private directory. Actual Source UC typography overrides the explicit sensitive
field classes: labels and values both render 16px with 17px line boxes, rows 74px.
Card artwork uses the original shared paths; integration owner repaired shared
SVG fill sizing. Integration owner retains final combined verification.

Expanded GREEN: eleven tests cover Source info/options destinations, card search
pinning at 102px without moving the toolbar, live carousel selection, desktop drag
and Source's 80ms post-drag click suppression. The browser pointer test exposed
the release-click defect; a new RED regression reproduced it before repair.
Source/native live drag both select card-debit-1 (614,83 RON) and settle at 189px.
Safe-area discrepancy resolved: the source reserve is 12px; its frameless wrapper
automatically scrolls the browser window by one pixel. Capture window.scrollTo(0,0)
and the phone element at viewport 375x811 to compare the logical 375x812 canvas.
Main/hidden/dark/sensitive and reachable credit/debit info/options comparison
metrics and strict pixel counts are saved under the private evidence directory.

Final expanded ownership before edit: new `baseline/FaceIdOverlay.tsx`, initially
absent (`face-id-initial-pending.txt`). Replace only the Card import, preserving
the existing banking animation. Characterize 360/510/640/840ms phases, Source
glyph exit, animated ring/path, source pulse/entry easing and cancellation before
implementation. This allocation does not change the main card geometry.

Face ID GREEN: thirteen tests pass with native animated dash offsets proved
partially drawn at 640ms, glyph exiting from 360 through 509ms, check mounting at
510ms and exact 840ms completion. Cleanup stops animations and timers. Web CSS
matches the Source easing, keyframes, glow, blur and timing while native SVG
drawing and fades remain Animated driven. Deterministic browser clock frames at
200/360/510/640/839/840ms confirm the overlay lifecycle and zero runtime errors.
`face-browser-qa.json` and PNGs record the evidence. The existing banking and
profile overlay files remain untouched. Source search handlers were re-read and
preserved; shared filtered-body diagnostics are owned by the transaction agent.

Final layering proof: private live before/after measurement showed 768 differing
top pixels before and five single-channel differences after adding the Source
carousel z-index 10 and restoring an opaque outer summary. The Source shadow tail
remains above that summary, and the last button text difference disappears.
`card-layer-proof.json` records the comparison. Card geometry is unchanged.
