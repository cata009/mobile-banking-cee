# Baseline marketing, More and inactive prelogin contracts

Owner: `/root/baseline_navigation_contracts`; integration owner: Root. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`. Base commit: `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Ownership and initial pending changes were captured before edits in `.codex-temp/baseline-marketing-pilot/ownership.json`. Existing main checkout only; no Git index/branch/worktree mutations, dependency changes or publication.

The allocated fourteen Source modules are ProductMenuCard, ProductOfferCard, ShopsmartOfferCard, MoreCardBase, eight concrete More cards and both ProductAccordion variants. Frozen initial files are in `tests/fixtures/baseline-marketing-before/`. Exact own patches are computed against these snapshots and recorded in `source-delta-proof.json`/`delta.json`; other work in the shared checkout was preserved.

## Contracts and compatibility

Pure `marketingCard`/`marketingCardWeb`, `moreCard`/`moreCardWeb` and `preloginAccordion` have no UI runtime imports. Feature models/configurations still supply product selection, order, banner tones, labels, assets and callbacks.

Product menu retains responsive full width, height120/72 and padding16/12 variants, per-ID image placement, all six original fallback illustrations, original title font18/16, badge99+ and exact clicked-card payload. Product offer retains327×157, banner color-family/light-mode resolution from existing config, original photo and chevron path, title22/20 and description18/16, line clamps and compact caption. ShopSmart retains button/article mode, flexible width, actual no-border rendering, image130/143, equalizer hooks, default/partner typography, original gift path, fixed pill geometry, tag/distance/trailing icon branches and legacy metadata exports. Banner/gift vector paths are shared original Source data.

`MoreCardShell` extracts confirmed identical outer markup while every concrete wrapper supplies its exact original artwork node. Base is an explicit variant, preserving hover90 rather than concrete80, distinct title font class,50% image area and scale.9. Concrete cards retain all image percentages, repeated GDPR tiles and rotated/flipped third-party imagery. Badge remains capped99 without plus. Asset nodes and source PNG references remain with their existing wrappers.

`preloginProductViews` extracts the duplicated expanded/collapsed/separator markup; static default FIND OUT MORE and animated localized label stay distinct inputs. Existing Source controllers retain their initial-state/country-reset lifecycle, original index callbacks, invalid-entry filtering, promotion and350ms wait-mode motion. Static does not gain animated reset behavior. These are inactive prelogin compositions, not active-baseline Home accordions.

## Source verification

Contract tests initially failed because pure modules did not exist. After extraction,77 new contract/DOM/interaction tests and11 existing accordion tests pass (88 total). Exact DOM tests cover menu IDs/variants and six fallbacks, callback payloads, offer captions, ShopSmart root/tag/pill/icon branches, all nine More variants with badges0/1/99/100, empty/1–4 accordions, invalid indices and keyboard controlled callbacks.

The local report is `.codex-temp/baseline-marketing-pilot/report.html`. All196 browser fixture pairs have zero changed pixels, identical DOM and computed styles. Both themes use actual Source fonts/tokens/assets; every captured img was checked as loaded. Cases include nine menu IDs in standard/compact, fallback artwork, nine More variants at155.5/240/327, fourteen banner tones/light combinations and compact clipping, default/partner ShopSmart states/image heights/overlays/pills/tags/distances, prelogin0–4 products/static/animated and settled promoted states, plus hover/focus/pressed. Source Enter keyboard activation promotes the original index. HMR WebSockets are blocked; normal local-gate authentication reuses the existing helper.

## Native boundaries

The final evidence audit caught filename reuse in early card captures. All196 cases were regenerated with unique per-case/version paths; the pixel comparator now rejects duplicated capture paths. Earlier unused captures were retained rather than deleting images.

Five isolated Native leaves consume shared contracts and original Source assets/vector paths. More reuses the existing exported MoreArtwork module with the unchanged original PNG resources/crop definitions. The banner and gift vector geometry is not redrawn. No PNG conversion, image deletion or raster asset generation occurred.

Native tests pass15, including controlled callback/order behavior, original image references, More artwork, decorative ShopSmart mode and shared350ms timing. Native animated prelogin implements exit/entry wait-mode slide; local browser preview checks promotion after900ms and menu activation in both themes. Exact device crop/font/animation/focus/accessibility acceptance remains unverified; platform theme image filters/shadows also remain unverified. Menu CSS fallback illustrations require a caller-supplied original artwork slot and are not redrawn/certified in Native. Existing Native apps/APKs remain untouched.

Scoped Source/Native lint use `--max-warnings 0`; strict typechecks and browser report smoke results are recorded in `checks.json`. These are family visual fixtures plus scoped regressions, not full app/country/release acceptance. Root catalog owns DS/runtime provenance and final combined `npm run verify`/module audit after editors stop.
