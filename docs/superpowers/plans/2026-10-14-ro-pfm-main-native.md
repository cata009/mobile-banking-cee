# RO baseline Spending main native composition

Owner: `/root/ro_pfm_main_impl`. Base commit: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.
Initial pending changes and initial owned-file hashes are recorded in `.codex-temp/ro-baseline-pfm-main/ownership.json` before implementation.

Owned production files: `native-spike/src/experiences/pi/current/baseline/spending/PfmScreen.tsx`, `Overview.tsx`, `PeriodCarousel.tsx`.
Owned validation: `native-spike/__tests__/ro-baseline-pfm-main.test.tsx` and private `.codex-temp/ro-baseline-pfm-main/**`.
Owned documentation: this file. All Source files, shared primitives, packages and other agents' changes remain read-only.

Implement Source `LegacyAnalyticsScreen` composition and state: canonical analytics timeline, latest period initially, local category detail retaining the period on Back, host footer shown only for overview, and transaction callback delegated to the integration owner. Ignore Evo scope/direction route hints. Overview numbers remain visible under privacy, with Source's fixed 54px spacer and analytics header actions. Preserve inert profile/help/Card Transaction actions and active messages navigation.

Share a fixed 375px period carousel with category detail. Web uses the existing Source drag hook, four-pixel drag threshold, eighty-millisecond click suppression and 120ms idle snap; native uses a horizontal ScrollView. Preserve Source panel geometry, canonical category order and category labels/amount treatment. Chart worker owns chart geometry, period indicator and fractional category tint helpers; detail worker owns category composition.

Validate canonical April totals and category values, category selection, period retention and remount reset, privacy, header actions, local Back registration and inactive-host guards. Integration owner performs final combined verification and Source/native pixel review after editors finish.

Validation completed: four real-model main tests passed; owned production/test ESLint passed with zero warnings; native TypeScript passed after dependent leaves completed. Private browser captures reported no runtime errors. Computed Source inspection confirmed the section title's 48px line height and the action container's 0/24/18 padding; the composition applies those values without editing shared leaves. Preliminary screenshots/metrics are in the private task directory; final strict captures and combined gates belong to the integration owner.

Review repairs preserve the existing transaction avatar with category/glyph identity and host-resolved dark colors. Web vertical scrolling has an opaque Source application background and removes React Native Web's default translateZ transform. Web category marks reproduce Source's inline-flex baseline mechanics: Source's 32px span contributes a 35/34/33px line box for 24/22/20px glyphs. This was measured from actual Source and Native rectangles; glyph dimensions and paths remain unchanged. Native keeps the measured standard 35px wrapper pending device certification. Period panels remain the explicit Source 375px design width even in wider containers. Only category detail opts into hiding inactive panels from the accessibility tree.

Eight strict captures cover main and scroll-600 states in both themes and EN/RO, with Source viewport 375×811, Source phone/native canvas 375×812, and window scroll normalized to zero. `strict-results.json` reports all differences without masks or tolerance: main light12/dark17 changed pixels; scroll light67/dark76. Twelve pixels belong to the shared Offers footer SVG; the remaining five main-dark or 55/64 scroll pixels are thin pill edge raster differences. Main chart, heading/action typography, category glyphs, amounts, order and layout match. The record does not claim zero-pixel parity. Replacing the pill with literal DOM/translate and adding the Source section background did not reduce those residual counts.
