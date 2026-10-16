# Gallery and auxiliary baseline contracts

Owner: `/root/baseline_navigation_contracts`; integration owner: Root. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`; base `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Ownership/initial pending changes were recorded before edits in `.codex-temp/baseline-gallery-pilot/ownership.json`. Existing main checkout; no index, branch/worktree, package/theme, application integration, asset conversion or publication changes.

## Scope and behavior

Eleven Source modules retain existing exports and Figma source constants: HelperCard, GhostBanner, InfoBanner, PendingActionCard, UserEventCard, CardComponent, PaymentHeroCard, NewPaymentDiscoverBanner, Pill, PillSorting and ToastMessage. Seven pure contracts/bindings have no UI runtime imports and are consumed by the existing Source renderers.

Banner contracts preserve actual width343/327, centered/helper versus start alignment, ghost horizontal/stacked modes, static/button roots, inline action/close/options ownership, custom icon/class/style overrides, original gradient and avatar geometry. Metadata heights for Ghost/Info/UserEvent/Helper are not imposed on auto-height roots; Pending retains actual157px height. The actual payment discovery view remains distinct from DS Helper: grid32/1fr/32, gap14, start alignment, default close glyph32 and internal dismissal. Helper uses gap8, centered alignment, close glyph12 and external onClose callback.

PaymentHero retains all nine screenshot presets and their legacy exported data, image override precedence, fallback art,120px height, multiline title line26/gap8 versus normal/gap16, disabled opacity55% and exact selection payload. CardComponent retains its static DS identity/art rail with219×138 slots/radius5.67, original default holder/number, attributes, artwork and scroll styles. Metadata375×448 does not fix renderer dimensions or create a runtime carousel controller. Shared Card artwork belongs to the banking owner and was reused without edits.

Pill retains variant defaults, explicit/empty labels, loading disability, busy state, button type, forwarding/override order, original success vector and spinner. Sorting remains controlled with four original labels/order and MAX% default; selection emits the original value without internal mutation. Toast retains default messages, status/polite semantics, Google Pay174×35 versus standard327×32, custom role/attributes and dark-mode defaults independent of the global theme.

## Provenance

These are auxiliary/gallery families, not an assertion that every specimen is an active PI/RO baseline control. Source imports show Helper in PFM category detail, UserEvent in a guarded card-detail branch, and payment hero/discovery in payment compositions. CardComponent and several pill/toast/banner variants are primarily gallery or conditional/other-context specimens. No screen was changed to adopt them. Root's catalog owns comprehensive DS/runtime classification.

## Source evidence

Initial Source files were frozen under `tests/fixtures/baseline-gallery-before/`; only PaymentHero screenshot import paths were relocated for the fixture directory. Exact untouched initial sources are separately retained under private `source-initial/` for attribution. Per-file own patches and hashes are recorded against those snapshots in `source-delta-proof.json`/`delta.json`.

Contract tests initially failed because new pure modules did not exist. After extraction,35 contract/DOM/event tests passed. Tests cover static/interactive roots, external helper close versus internal discovery dismissal, original glyph sizes, callback order/payloads, disabled activation, controlled sorting, caption/attribute overrides and toast mode defaults. Generated SVG identifiers are normalized with their references; the original artwork, paths, tones and dimensions remain checked.

The local report is `.codex-temp/baseline-gallery-pilot/report.html`. All94 independent browser pairs (188 unique screenshots) have zero changed pixels, identical DOM and computed styles. Matrix: light/dark, all five banners and full/plain states, Ghost stacked, discovery, all nine hero photos and four fallbacks, multiline/disabled hero, five pills, nullable/default sorting, toast modes/dark overrides, static card composition, responsive240 and hover/focus/pressed. Original fonts/colors/assets are loaded and every captured img is checked. The infinite CSS spinner is paused at phase0 before measurement/capture so timing drift is not mistaken for geometry changes. HMR WebSockets are blocked; normal local authentication uses the existing helper.

Browser interactions verify Enter dismisses discovery, Space invokes Helper's action and Close reports to the owner while the helper remains visible. Source scoped lint (`--max-warnings 0`) and fresh strict typecheck pass. An initial test SVG-identifier capture needed explicit narrowing under `noUncheckedIndexedAccess`; this was corrected without assertions/suppression, verified, and Source formally frozen before Root's combined gate.

## Native evidence and limits

Five isolated Native files provide banner/discovery variants, payment hero, static CardComponent, pills/sorting and toast. Original Source vector glyphs, success mark, payment photos and the stable shared CardArtwork are reused. No artwork redraw or raster conversion occurred.13 Native tests pass, including dismissal ownership/glyph sizes, disabled callback blocking, payloads, controlled sorting, stable artwork and polite toast semantics. Native scoped lint and strict typecheck pass. The Native Web preview verifies both themes, pill activation and discovery dismissal.

Native device font/crop/theme-hook/shadow/focus/accessibility/motion acceptance remains unverified. CSS payment hero fallback art requires a supplied original artwork slot and is not redrawn or certified. Existing Native apps/APKs remain untouched. These are family fixtures and scoped tests, not full app/country/release acceptance. Root owns final combined `npm run verify` and module audit after Source editors freeze.
