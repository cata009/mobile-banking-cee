# PI Italy Home fidelity audit

Audit date: 13 October 2026. Integration checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`; base commit `538360ead4a6da9ae889f142f8d00e333f99412b`.

The source is the current frozen `src/experiences/pi/it/mobile-first/MobileFirstHome.tsx`, its CSS, category panels and original assets. Source browser: `http://localhost:4006/italy-migration.html?frame=0`. Native browser: `http://localhost:4006/italy-native.html?frame=0`. Both use the same origin, canonical ledger and two accounts / two debit cards / one credit card composition. Measurements below use the 393-unit authoring width, divide out each frame's display scale and exclude the source's 70-unit simulated phone chrome. Text-size preference was off.

## Ownership and preservation

Before hashes, initial pending changes and allocated paths are recorded in `.codex-temp/universal-demo/native-home-fidelity-ownership.json`. This pass edits only `Home.tsx`, `homeStyles.ts`, `homeModel.ts`, `homeAssets.ts`, `italy-home.test.tsx`, this document, and the explicitly allocated new `universal/SoftShadow.tsx` / `universal-soft-shadow.test.tsx`.

The shared `MainHeader`, `BrandToggle`, `Typography`, `ModalPortal`, card-session subscriptions, native intent contracts, safe-area host and zero-width layout guard are preserved. The integration owner exposed the requested optional `tabsGap` and insurance-catalogue intent. Source UI, PNG/SVG assets, package files, emulator and Git index were not changed.

The subsequent native card-art repair has a separate before-state record in `.codex-temp/universal-demo/native-home-vector-ownership.json`. Its allocation is `Home.tsx`, `italy-home.test.tsx`, this audit, and the new reusable `universal/VectorArtworkLayer.tsx` / `universal-vector-artwork-layer.test.tsx`. The card-detail owner consumes the same helper in their separately owned `CardArt.tsx`.

## Verified source behavior and repairs

| Area | Source behavior / finding | Native result |
| --- | --- | --- |
| Brand | Opens an information sheet containing “I tuoi prodotti UniCredit e le offerte buddy, in un’unica app.” It does not change the preferred profile. | Same information action/copy; original 32×32 close-x vector, 0.4 overlay opacity, 24-unit body line height and matching 136-unit sheet height. |
| Sticky chrome | Header stays at 0; tabs stick at 40. The initial 16-unit gap disappears while scrolling. | `tabsGap` follows `max(0,16-scrollY)`, inside a constant 136-unit flow placeholder. Content positions remain unchanged. |
| Card artwork | Separate black credit and white debit shades; exact CSS angles/stops. | Unique per-artwork SVG IDs fix a confirmed RNWeb collision that made the debit card use the black credit gradient. Original art/brand/payment-network assets are reused. Angles 248.402° / 234.558° and source stops are preserved. Debit holder gap, number line height and spend position now match. |
| Owned product widths | Cards, loans and insurance previews cap at 361 units; source artwork stays 361 wide and clips on narrower screens. | Matching cap and artwork size. The owned grid follows the source 650-unit gap breakpoint and wraps when two 361-unit columns fit. Accounts retain their separate responsive layout. |
| Loan privacy | Hidden outstanding amount is four bullets, with no decimals/currency. | Correct mask and 18-unit visible decimal size. |
| Loan simulation | Source quick action has an explicit line break, 21-unit effective line height and 48-unit spacing after the owned list. Promotional offer sheet contains a simulation button. | Matching quick-action geometry and a working simulation intent from the offer sheet. |
| Commercial catalogue | The source “discover all” card/loan panel contains selectable product rows. | Selectable rows replace the previous inert concatenated description. |
| Insurance promotions | Source image spans are currently unstyled: natural PNG proportions, square image corners, 16-unit titles and 24-unit description line height. Source double margins are visible. | Current rendered source quirks are retained, including 109.31 / 109.06 / 94.37-unit image heights and extra margins. “SCOPRI I NOSTRI PRODOTTI” and each promo emit the actual catalogue intent. |
| Models and navigation | Account/card/PFM balances and eligibility come from feature selectors. Source quick actions first choose an account. | Canonical selectors/session metadata remain in use; exact account-action, card-PIN, category-hub, loan-simulation and insurance-catalogue intents are regression-tested. |

## Browser geometry evidence

Values are document positions in logical units, independent of each tab's current scroll position. After the repairs, the measured heading differences are under 0.001 unit.

| State / point | Source | Native RNWeb |
| --- | ---: | ---: |
| Initial summary card top | 152 | 152 |
| “I tuoi prodotti” heading | 414 | 414 |
| Category rail top | 470 | 470 |
| First account / owned card top | 540 | 540 |
| Cards: “Le nostre carte” | 1086 | 1085.9998 |
| Cards: “Offerte per te” | 1586 | 1585.9997 |
| Loans: simulation top / height | 928 / 114 | 927.9998 / 113.99996 |
| Loans: commercial heading | 1082.0000 | 1081.9998 |
| Loans: offers / highlights headings | 1584.0001 / 1930.0000 | 1583.9998 / 1929.9996 |
| Insurance: commercial heading | 1016.0000 | 1015.9998 |
| Insurance: offers / highlights headings | 1413.0625 / 1759.0626 | 1413.0623 / 1759.0622 |
| Brand sheet height | 135.99995 | 135.99995 |
| Brand sheet overlay | rgba(0,0,0,0.4) | rgba(0,0,0,0.4) |

The browser visual comparison also confirmed that the repaired debit artwork uses its white shade and the original pink arrow rather than the previous dark gray/red appearance. Card, loan and insurance category selection, brand information, carousel controls and privacy/navigation requests were checked in owned tests; the host's full destination screens are owned separately.

## Android floating-shadow defect

The supplied Android 9 screenshot `.codex-temp/universal-demo/native-home-safe-update.png` (420 dpi, 411.43 logical width) shows a sharp gray pill-shaped band below Operazioni. The installed RN 0.87 `OutsetBoxShadowDrawable.kt` applies a `BlurMaskFilter` to a Paint and draws the rounded path directly on the hardware Canvas. Android's documented hardware drawing support excludes `Paint.setMaskFilter()`: [Android hardware acceleration](https://developer.android.com/topic/performance/hardware-accel). This explains the unblurred translated shadow; matching CSS numbers alone does not fix that rendering path.

`SoftShadow` supplies an Android-only, non-interactive SVG fallback. Nested contours sampled every half logical unit approximate a Gaussian edge falloff with sigma = blur/2, preserve the original rounded-rectangle knockout, and allocate room for three sigma plus the offset. Home keeps the source width 172, height 72, effective radius 36, offset 11, blur 17, color #262626 and opacity 0.36. Web/iOS continue using the original CSS `boxShadow`. No raster asset, conversion, dependency or native-platform setting was introduced.

The fallback's geometry/falloff, offset bounds, input transparency and platform exclusion are tested. After the integration owner installed the updated native base, `.codex-temp/universal-demo/native-home-new-base.png` was inspected at its original 1080×1920 resolution. This Android emulator Home frame shows a continuous feathered shadow around Operazioni: the previous sharp opaque gray band and flat cutoff are absent. The visible header, summary, category rail and first account retain their previous geometry. No additional production correction is warranted by this frame. The contour falloff approximates a 2D Gaussian near curved corners and is not a pixel-equivalence claim.

## Native card-art decoder repair

The sixth-OTA emulator screenshot `.codex-temp/universal-demo/sixth-home-cards.png` shows a flat dark credit card instead of the original red skin, texture and arrow. The integration owner's Android process log (PID 9594) reports `RNSVG fetchDecodedImage failed` / `DecodeException unknown image format`. Home was handing SVG data URIs to `react-native-svg`'s `Image` node, which uses the Android Fresco bitmap decoding path. The earlier browser card observation did not exercise that native decoder.

Home now positions the original skin, texture and arrow through `VectorArtworkLayer` and `SvgXml`, preserving skin 361×227, texture (-109.998, -136.115) / 643.939×622.738, arrow (-50.855, -0.59) / 226.188×229.165 and debit-arrow opacity 0.8. The XML helper gives each layer's local `id`, `url(#...)` and `href` references a distinct namespace. Quoted local brush URLs are expressed in the equivalent unquoted form accepted by SvgXml's native parser. Original SVG files, paths, colors and transforms remain unchanged on disk. PNG paintings still render as native raster images.

The existing distinct source shade gradients remain on a separate, explicitly positioned SVG overlay. Making that overlay absolute also prevents the browser's normal-flow SVG from painting below the positioned vector layers. Final RNWeb visual inspection confirms the original red credit texture and pink/white debit appearance, distinct parsed definitions, zero SVG bitmap image nodes, and no captured warning/error logs. The seventh signed OTA was subsequently inspected on Android 9: `.codex-temp/universal-demo/seventh-home-cards.png` visibly restores the red Flexia skin, repeated texture and large arrow that were absent in the sixth-OTA frame. The integration owner reports that process 10663 produced no `fetchDecodedImage` / `unknown image format` errors after selecting Carte. This closes the confirmed native bitmap-decoder defect for the observed Home credit-card state; the sixth-OTA screenshot remains its before evidence.

## Installed Home observations and limits

| Evidence | Installed environment / state | What is visibly established |
| --- | --- | --- |
| `seventh-home-cards.png` | Android 9 / API 28 emulator; seventh signed OTA; Carte selected, amounts visible | Original red credit skin, texture and large arrow render in the visible upper portion of the first card. Header brand/avatar and feathered Operazioni shadow are present. The lower card and debit preview are outside this frame, so it does not visually accept those states. |
| `api35-home.png` | Android 15 / API 35 emulator; bundled public native 0.3.0 APK; Conti selected, amounts visible | Initial Home renders the original header brand/avatar, summary, categories, first account and soft floating shadow with Android gesture navigation. No card-art state is visible in this screenshot; it does not establish Android 15 texture/arrow acceptance. |
| `final-api35-home-cards-ready.png` | Android 15 / API 35 emulator; integration owner's frozen CB08 public APK; Carte selected, amounts visible | The visible first credit-card subset shows the red skin, texture, large arrow, holder/amount/network glyphs and Credit label. The summary now displays `1341,00 €` without the earlier separator. This is not a full-card/debit capture and precedes the shade-blur candidate below. |

All three inspected screenshots are 1080×1920 emulator captures. Historical APK provenance for the second observation was versionCode 5, package `com.mobilebanking.cee.demo`, `mobile-banking-cee-native-0.3.0.apk`, SHA256 `c97960ed4dafaf7601ecdf0f72d6df9fdbed870e1a9a22eb424e25f83e795075`. The current CB08 metadata records the same package/versionCode and SHA256 `cb08f122828f6ccf10f81e3cecd9ec1c86e4d0749df9fa09c8646d02a734f27d`. The additional card-ready screenshot has SHA256 `a85c23da1221fa062472da50cc5cb6a229ee543229ef0bea0c793363312827e3`. These are native installed observations, not browser screenshots, and not physical-phone acceptance. No emulator control was performed during this audit, and the frozen public APK was not modified.

The captured Android frames precede the grouping correction described below: Chrome/source displayed `1341,00 €`, while Hermes displayed `1.341,00 €`. Both represent the same canonical 1341-euro ledger value. The screenshots remain historical before evidence; they are not acceptance evidence for the newer presentation correction.

## Home integer presentation normalization

The Source Chrome generic Home formatter is the reference: four-digit integers have no separator; grouping starts at five integer digits. The pure presentation helper `numberFormatting.ts` exports `normalizeItalianAutoInteger(integer: string)`. `homeAmountParts` uses it only on the already-formatted integer from Intl: remove dots when auto grouping has fewer than five digits, counting digits after cent rounding and independently of the sign. The decimal substring and existing privacy masks are retained. Intl continues doing the actual cent rounding; no numeric ledger value, feature policy, Source file, global Intl object or account-detail formatter was changed. The helper has no runtime/UI imports and is available for separately owned native presentation consumers after this ownership freeze.

The bounded Home Amount callsite preserves Source exceptions explicitly: widgets and normal account previews use `auto`; Home payment-card spend and loan previews use `always`, matching the Source card formatter's manual grouping and loan formatter's explicit `useGrouping: 'always'`. Account detail retains its separate formatter. Production search confirmed that only Home calls `homeAmountParts`.

| Old Hermes formatted input | Home auto result | Reason |
| --- | --- | --- |
| `1.341,27` / `-1.341,27` | `1341,27` / `-1341,27` | Four integer digits, sign preserved. |
| `1.000,00` after rounding ±999.995 | `1000,00` / `-1000,00` | Threshold follows the rounded integer. |
| `9.999,99` after rounding ±9999.994 | `9999,99` / `-9999,99` | Still four digits. |
| `10.000,00` after rounding ±9999.995 | `10.000,00` / `-10.000,00` | Five rounded digits retain grouping. |
| Card/loan `always`: `1.341,27` | `1.341,27` | The Source exception stays grouped. |

Regression tests first reproduced six failures with old Hermes-formatted inputs, then passed after the local normalization. The grouping checkpoint passed 28 Home tests, including sign, rounded boundary, decimal/privacy preservation, real Intl always-grouping, and each Home category's grouping mode. Scoped lint with zero warnings and whole native TypeScript passed. The subsequent `final-api35-home-cards-ready.png` Android 15 frame visibly confirms the specific summary value `1341,00 €`; negative/rounded-boundary and all grouping-exception states still rely on regressions rather than installed visual captures.

## Source shade-edge blur candidate

The remaining Source effect was inspected in a separate, owned browser tab: both card shade elements compute `filter: blur(2px)`, with the original credit multiply/black and debit normal/white gradients. The bounded candidate applies a separate `Filter` / `FeGaussianBlur` to each shade rectangle only. Its sigma is 2, with a six-unit three-sigma region around the unchanged 361×227 shade. Each card receives a distinct filter ID derived from its existing unique gradient ID. Original skin/texture/arrow bytes, their placement/opacity, amounts, glyphs, layout and callbacks are untouched; shared controls, dependencies and ABI configuration were not edited.

The installed react-native-svg backend includes `FeGaussianBlurView.java`. Unlike the unsupported hardware Paint mask blur, it filters the element's offscreen bitmap through RenderScript. That implementation reads stdDeviation directly as bitmap-pixel units and applies its own radius factor/cap; the Android candidate supplies `2 * PixelRatio.get()` while browser/iOS receive 2 in SVG units. At 420 dpi the Android declaration is 5.25. Backend inspection establishes an implemented path, not exact device-kernel equivalence or installed acceptance.

The new regression first failed because both filters were absent. The candidate then passed 30 Home tests, including isolated shade-only targets, unique IDs, unchanged canvas/vector geometry and Android density handling. Scoped lint with zero warnings and native TypeScript passed. Browser inspection confirms two separate sigma-2 filters, each linked to its own shade, the Source gradient values/appearance, and no captured warning/error logs. Existing SoftShadow uses nested vector contours; its feathered device screenshots do not prove Gaussian-filter behavior.

This is a private next-candidate implementation, not a change to the frozen CB08 public APK. Android blur appearance, clipping, runtime performance and numerical kernel correspondence require the integration owner's private device probe before closing the native shade-edge gap. No backdrop blur fallback, new image, image conversion, dependency or native rebuild was introduced by this task.

## Validation and remaining limits

The earlier fidelity checkpoint passed 13 Home tests and 4 shared-shadow tests. The native card-art repair adds the exact vector-layer geometry/variant/no-bitmap regression and five helper tests covering original XML, local references, per-instance namespaces, browser SVG URL parsing and PNG preservation. The helper tests also reject SVG parser/brush warnings and errors. Scoped ESLint continues to use `--max-warnings 0`; the whole native TypeScript check passed after the separately owned card test was corrected.

Remaining visual limits are recorded explicitly:

- The repaired shadow is visibly feathered in inspected Android 9 and Android 15 emulator Home frames. There is no physical-phone observation or pixel-diff acceptance of every state.
- The native SVG decoder defect is closed for the observed Android 9 credit preview, with the integration owner's clean log observation. The later Android 15 card-ready frame confirms the visible first credit subset too; full/debit previews and all artwork variants remain unaccepted.
- Source card-shade blur has a browser-verified, regression-tested private candidate. Its actual Android filter appearance/performance and exact kernel match remain pending a device probe; the frozen public APK does not include this candidate.
- Source floating `backdrop-filter: blur(17px)` has no native backdrop blur equivalent in this pass.
- Browser keyboard `:focus-visible` outline treatment and focus restoration/trapping are not yet identical to the source DOM sheet/card behavior.
- The specific `1341,00 €` summary grouping is confirmed in the later Android 15 card-ready capture. Broader sign/rounding/grouping-exception visual states remain covered by regressions, not device captures.
- The browser measurements cover the default 393-unit composition with text-size preference off. Large-text, other OS versions and every wider/narrower breakpoint have not received pixel-level visual verification.
- Native insurance-catalogue routing is exact at the Home boundary; the catalogue destination is maintained and verified by its separate owner.

This audit supports the repaired states and measurements above. It does not certify 100% visual parity.
