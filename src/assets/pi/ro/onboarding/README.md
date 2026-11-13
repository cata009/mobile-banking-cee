Original, unmodified assets downloaded from Figma frame `10164:109267` in file `bM3r8YmHuaIDXFFgsPhvDY` on 2026-11-13.

- `introduction.png`: source photograph `10164:109273` (original bytes; display crop belongs to the screen).
- `individual.svg`: `10164:109281`.
- `new-customer.svg`: `10164:109287`.
- `identity-card.svg`: `10164:109301`.
- `phone.svg`: `10164:109307`.
- `email.svg`: `10164:109313`.
- `product-catalog.svg`: original Products catalog icon in frame `9852:84646`.
- `mobile-activation.svg`: original transaction-migration icon in frame `9868:92601`.

Used by the executable `OnboardingIntroduction` composition. No screenshot is used as a control or screen implementation.

## Additional original source assets

All files retain their original bytes and extension. They are rendered through the shared vector/raster renderers; no screen or control is replaced with an image.

| Assets | Source frames |
|---|---|
| quick-menu.svg | 9868:93384 |
| romanian-prefix.svg | 9852:66485 |
| contact-verified.svg | 9852:66710 |
| verification-failed.svg | 9852:63286 |
| link-expired.svg | 9852:66171; reused for identical warning artwork |
| offer-cards.svg, offer-mobile.svg | 15048:100897 |
| prime.svg | 27310:16122 |
| scan-camera.svg, scan-instructions.svg | 9852:63352 |
| scan-person.svg | 9852:63588 |
| scan-phone-outline.svg, scan-example-id.png, scan-check.svg, scan-cross.svg | 9852:63383 |
| scan-desk.png | 9852:65294 |
| scan-review-id.png | 9852:65276 |
| card-benefit.svg | 15048:112677 |
| branch-required.svg | 9852:69345; reused for identical blocked/existing-customer artwork |
| evaluation-pending.svg | 9852:63549 |
| process-ceased.svg | 9930:82957 |
| identification-success.svg | 9852:63482 |
| selfie-center-source.png, selfie-smile-source.png | 9852:65511, 9852:65513 |
| branch-map-source.png, branch-pin.svg | 9930:56775 |

The user approved using only the photographic region of the provider captures. The implementation clips away their text and toolbar (pixels above source y=194) and renders provider headings, actions and retry states as code. The originals are preserved.

The user separately approved the geographic map background as an exception to the raster rule. The map composition clips the source app chrome and branch panel outside the visible geographic region; native search, branch pins, list/detail sheets and selection remain executable.

Card artwork is reused from the canonical shared BaselineCardArt implementation. The source CR intentionally shows physical artwork under the virtual-type tile and virtual artwork under the physical-type tile; those source slots are preserved, while the subsequent detail/selection rules retain the correct card semantics.
