# RO current active baseline Payments hub

Owner: `/root/ro_payments_hub`. Integration owner: `/root`.

Base commit: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`.
Checkout: `C:\Users\mihai\Desktop\Mobile Banking - CEE`.

Initial full pending path inventory is saved in `.codex-temp/ro-baseline-payments-hub/initial-pending.txt`; initial tracked pending SHA256 records are in `initial-pending-hashes.json`. Owned production, test and documentation paths were absent before this task. Existing pending edits were preserved. This agent performed no branch/index/commit/worktree/package/asset/Source/public writes.

## Ownership

- New `native-spike/src/experiences/pi/current/baseline/payments/hub/**`.
- New `native-spike/__tests__/ro-baseline-payments-hub.test.tsx`.
- This document.
- Private evidence and scripts in `.codex-temp/ro-baseline-payments-hub/**`.

Shared contracts, leaves, adapter, host navigation and preview are owned by the integration owner. Domestic and internal transfer screens are owned by separate agents.

## Reference behavior

The authenticated, read-only original at `http://localhost:4004` is authoritative. Its baseline hub has four heroes in order: Payment to account, RoPay, Currency exchange, Bills & Direct Debit. Every hero opens its generic three-action sheet. Only Domestic payment proceeds to the form; Foreign payment and Templates and beneficiaries remain inert. The Recurrent Payments and Foreign Payments shortcuts remain inert. My Templates opens the baseline list and Exchange Rates opens the calculator.

Template and recipient selection immediately passes canonical selection identity to `payment-create`. Template details/edit, recurrent/scheduled pages and beneficiary management are not reachable from this RO baseline hub. No destinations were invented for their inert labels.

The overview retains Source's fixed54px top reserve even in `frame=0`. Child pages use the host's dynamic safe-area reserve. Source assets retain contain sizing with right/bottom positioning; intrinsic image geometry is applied to the native Image slot without image conversion.

The calculator uses the canonical currency/date/rate datasets. Currency choice is staged until OK, and cancellation resets the draft to the currently applied currency. Rate-row selection immediately changes the base. The original amount input includes a3px inline baseline gap; the result's undefined Source typography class inherits16px regular text. The original currency radios render72px rows because the standard20px vertical padding wins the appended14px class.

The integration-owner callback `onBackHandlerChange` allows physical Back to close an active menu/chooser, then return a child to overview, then defer to normal host navigation. Template search remains case-insensitive over title, beneficiary and account number. Existing Source entitlement policies, translators, models, assets and leaves are reused.

## Verification

Two initial regression tests failed on the old shared Native Payments: missing baseline template row metadata/accessible selection and missing confirmation/cancellation currency chooser. The corrected final test helper was also rerun against the old component in an isolated private harness and reproduced both failures (`red-regression.log`); all five focused regressions pass on the new implementation. They cover these behaviors, the four generic sheets/inert controls, canonical search, and physical Back. Owned ESLint exits0 with zero warnings; Native TypeScript exits0.

Private scripts `reference.cjs`, `native.cjs`, `matrix.cjs`, `matrix-native.cjs`, `hero-behavior.cjs` and the comparison scripts capture the actual Source and `CurrentApplication` integration preview in375×812 canvases. Pixel comparison has no masks or tolerance. Source authentication uses the existing helper without logging credentials. The final32-state matrix spans light/dark, English/Romanian, hub, hero sheet, templates, populated/empty search, calculator, edited amount and currency chooser. All32 have equal normalized visible text and exact input values/placeholders/labels; page errors are0. The final24 non-overlay states have0changed pixels.

Eight overlay captures still contain tiny shared SVG raster differences: light hero sheets22pixels, dark21; light currency choosers12pixels, dark17, out of304,500pixels per capture. These are explicitly nonzero and are not treated as passing strict parity. The selected radio's Source/native paths, normalized rectangle and computed paint values are equal; its Source SVG preserves `currentColor` while the Native serializer resolves it to explicit RGB. The integration owner owns any shared glyph repair and final verification.

All four heroes were separately captured and exercised through their inert sheet rows, dismissible helper and close/return behavior. Source and Native visible text and behaviors match in all four; each light sheet retains the22pixel shared glyph difference. Existing shared leaves were corrected only by their integration owner: Source hero inset shadow/one-paint web gradient, static sheet shadow/raster layers and full-height content constraints.

The integration owner runs combined final verification after all editors finish. Exact final file deltas and checks are recorded in the private handoff evidence.
