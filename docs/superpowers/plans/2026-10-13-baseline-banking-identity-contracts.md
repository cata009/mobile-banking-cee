# Banking and identity leaf contracts

Owner `/root/baseline_rows_contracts/banking-identity`; integration owner Root. Existing checkout `C:/Users/mihai/Desktop/Mobile Banking - CEE`, base `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Initial pending changes, owned paths and additional feature-helper allocation are recorded in `.codex-temp/baseline-banking-identity-pilot/ownership.json`. No app/package/index/theme edits, staging/commits, image conversion, publication or Native demo integration.

The user authorized autonomous completion and final review. This final batch preserves AccountActionBar, AccountDetailsInfoField, AccountTransactionRow, TransactionAvatar/Party/Pair, ProfileAvatar and AmountVisibilityButton. Frozen pre-extraction copies are in `tests/fixtures/baseline-banking-identity-before/`.

## Policy and presentation ownership

Root explicitly allocated `src/features/accounts-payments/transactionAvatarIdentity.ts` to extract the existing UI-owned selection policy. Its order remains: explicit category presentation, own-account/currency pair, existing merchant lookup, non-card counterparty, category fallback. It calls the unchanged merchant directory/nonmerchant policy. It keeps original party direction from transaction type, including conflicting amount-sign cases. Source and Native consume this same resolved descriptor. Existing merchant/party/category data and feature policies were not edited.

Pure family contracts carry geometry/presentation: four action slots and alignments; bare 32px and bubble 48px treatments; 80px info fields and optional 40px slot; legacy transaction 32px leading marks versus Evo 42px marks; booked/pending/compact sizes; exact supplied formatted-amount splitting, sign and caller privacy strings; party/pair badge dimensions and original direction paths; Profile avatar metadata, normalization and original AI SVG paths; controlled amount visibility labels/icons.

The existing Web defaults actually consume these contracts and retain legacy exports, classes/DOM/attributes, callbacks and locale context. Hidden action slots remain disabled, invisible and space-preserving. Category and transaction buttons retain separate callback owners and original transaction payload identity. No financial amounts, merchant names, account/category selections or privacy state are recomputed in renderers.

Native renderers remain isolated leaves. Merchant artwork uses the original directory paths or bundled eMAG SVG through the existing AssetGlyph. Party glyphs use the exact Source paths. PFM glyphs reuse the existing pure Source-derived `pfmGlyphs` dataset; the new regression test confirms every reused path exists in the current canonical Source PFM component. Currency pairs reuse the existing original-converted TransferFlag geometry. No rasterization or illustrative substitutes were created.

ProfileAvatar provenance: DS specimen and Kids RO (34px), HU and SK use this component. Its 40px baseline specimen is not the baseline header's profileGlyph/HeaderAction implementation. No header was changed to adopt ProfileAvatar. AI paths, photo inset/full sizing, notification clipping and photo-to-initials fallback are retained. Browser photo-crop tests use an explicit synthetic SVG fixture rather than claim coverage of every production photograph.

## Verification

Red: new tests initially could not import the absent transaction-row contract. Green: 26 Web tests cover frozen markup, selection-policy priority, original PFM path provenance, row modes/statuses/signs/decimal separators/privacy strings, identities/sizes, action cap/hidden state, info slots, profile variants and exact callback payloads. Six Native tests cover the shared identity descriptor/original badge paths, exact category/transaction callbacks, hidden action slots, Profile AI/fallback and controlled visibility.

The Source browser report `.codex-temp/baseline-banking-identity-pilot/report.html` contains 154 before/after cases with zero changed pixels, identical normalized DOM and identical computed styles. Original Source CSS, UniCredit fonts and theme tokens are used. HMR WebSockets are blocked; normal authentication uses the established local gate helper without credential output. Real Demo/Language providers exercise PI/RO/current/release-current/active plus explicit RO-language and CZ account-action context cases. Evo layouts are explicit leaf variants, not a claim of full Evo release traversal. Source row and visibility Space+Enter each invoke their owner exactly twice.

`native-smoke.json`, `native-light.png`, `native-dark-private.png` record zero browser page errors, exactly three action/category/open callbacks and caller-updated amount-visibility pressed state. Scoped Source and Native lint pass with zero warnings; root and Native TypeScript checks pass. Root owns final combined verify and module audit after all editors finish.

## Acceptance boundary

The Source comparison establishes leaf preservation, not complete screen/controller/navigation or all market/localization acceptance. Native tests and browser smoke do not establish Android/iOS device fidelity. Font scaling, RTL, all languages/countries/releases, platform focus/assistive technology, every merchant asset-failure branch, device shadow/ring/crop rasterization and full demo integration remain unverified. Dark Profile initials preserve the existing Source token pairing; this specimen is separate from baseline header identity. No thresholds, TypeScript checks or audits were weakened.
