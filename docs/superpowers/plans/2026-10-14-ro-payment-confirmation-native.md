# Romanian baseline payment confirmation

Owner: `/root/ro_internal_transfer`. Base commit: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`. Initial full pending changes and hashes are recorded in `.codex-temp/ro-baseline-payment-confirmation/ownership.json`.

Owned files are the new `native-spike/src/experiences/pi/current/baseline/payments/confirmation/` directory, `native-spike/__tests__/ro-baseline-payment-confirmation.test.tsx`, this plan, and private `.codex-temp/ro-baseline-payment-confirmation/` evidence. Shared controls, routing and domestic flow integration belong to the root and domestic owners.

Canonical references are `StandardSignScreen`, `StandardSuccessScreen`, `PaymentSignScreen`, `PaymentSuccessScreen`, `FaceIdAnimation`, and `usePaymentFlow`. The sign screen retains editable text initially `******`, the `on-focus` TextField presentation, no PIN validation, a disabled Sign action during the 840ms simulated authentication, and the existing baseline FaceIdOverlay matching source phases. Success retains source translated title/body and the 100px olive check ring with its 64px source glyph. Source's parent clears the draft and selected transaction and navigates to Payments on completion; lifecycle clearing remains the integration owner's responsibility.

Implementation sequence: focused red tests; new native sign/success screen compositions consuming existing baseline header, field, primary action and FaceIdOverlay; focused tests, lint, TypeScript; actual source/native screenshots where root integration is available. No route for internal transfer is introduced because RO current source actions are inert.

The prior transfer audit was cancelled before implementation. Its initial record remains private. The newly created red transfer test was deleted with the root's explicit authorization after verifying it was absent from the initial pending changes; the private cancellation record preserves that delta.

Validation: five focused Jest tests pass, including source authentication phases at 360/510/640/840ms, repeat-action guard, unmount cleanup, editable unvalidated PIN, translations and success action. Owned ESLint passes with zero warnings. A native TypeScript pass initially reported an unrelated hub glyph style prop, then an unrelated root integration test fixture cast; both were reported to their owners.

Actual source4004 versus actual CurrentApplication4006 screenshots at 375×812 with top12 match exactly for Sign and Success under light/dark and en/ro query seeds: all eight strict RGBA comparisons have zero changed pixels. No masks, thresholds or tolerance were applied. The source query language seeds still displayed English, so these captures do not establish a changed source language. The native translator fallback behavior is covered in tests. Metadata, error list and image comparisons are in `.codex-temp/ro-baseline-payment-confirmation/`. Success body retains normal metrics because source `.uc-type-n4` overrides its `leading-[22px]` utility.
