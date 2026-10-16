# Native RO baseline Homepage shell: independent integration proof

Owner: `/root/baseline_navigation_contracts`; integration/product owner: Root. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`, base `d338f7cfb92435bb8edc8817afbdd47031fb18e3`. Ownership and initial pending changes were recorded before editing in `.codex-temp/native-baseline-home-shell-proof/ownership.json`.

Owned delta is limited to the new `native-spike/__tests__/baseline-home-integration.test.tsx`, this document and private proof files. This worker did not edit Root's Home wrapper, new baseline Home/Header/Body, NativeCurrentApp, shared primitives, Source Web, package/configuration files or Git index. Root's product changes remain separately attributable.

## Actual integration tests

The test entry is the real `CURRENT_HOME_ADAPTER.screens.home`, with `CurrentScreenProps` and authoritative default product counts from `DEFAULT_VISIBLE_PRODUCT_OVERRIDES`. This detects adoption through the actual adapter/Home wrapper rather than rendering a detached specimen. Controller tests instantiate the real `NativeCurrentApp`; a minimal test adapter preserves the actual Home entry and uses lightweight destination components to inspect navigation results without claiming unrelated screen coverage.

The original twelve tests were red before integration: ten failed because RO Home had no shared L1/rail/privacy/accordion leaves and the controller had no shared bottom navigation. BA/current and RS future legacy boundaries passed. Root's initial Prime integration exposed a real renderer error: SourceVector received a functional React element rather than static vector nodes. Root corrected it to the original pure PrimeDiamondMark SVG result, without mocks, artwork changes or converter relaxation. Test selectors were then corrected to emitted accessibility semantics because RN's memoized Pressable is not reliably found by raw component-type identity.

The final fourteen tests pass:

- Actual RO/current/active adapter mounts two shared Home L1 leaves: fixed actions outside ScrollView and title inside it, in both themes.
- Shared rail/privacy/Profile/Messages are present. Profile is enabled and inert; Prime/Messages call the host's existing routes.
- Privacy remains controlled: invoking the actual control calls its owner once and does not independently mutate the supplied hidden state; rerendering the owner updates `aria-pressed` and labels. A real NativeCurrentApp callback updates host privacy.
- Product-list child counts match `createCurrentProducts(host)` authority. The actual accordion clones ProductsList `isOpen` false→true→false and controls secondary-product accessibility. Hidden descendants are retained; tests do not treat tree-node counts as visible counts.
- Actual shared navigation maps analytics→pfm, payments→payments, products→products and more→profile through the real host controller.
- Representative isolation boundaries cover BA/current, RS future MyBanker, RO future release and RO inactive context. These are adapter gating tests; the unsupported RO future tuple is not presented as an available public experience.

Scoped Native lint uses `--max-warnings 0`, and strict Native typecheck passes. Final outcomes and exact delta are in the private checks/delta files. No global verification was run by this worker.

## Read-only actual Source geometry

Source captures use the normal `.codex-temp/native-parity/reference-browser.cjs` local access gate, with HMR WebSockets blocked. No authentication-storage bypass or Source DOM/style rewrite was used.

`source-geometry.json` and four `images/source-*.png` files capture the actual PI/RO/current/release-current/active Homepage, identified through the real `data-phone-bottom-navigation` dock's owning page. Both themes are captured at scroll0/160. Source FramelessDeviceFrame intentionally adds1px viewport height and sets top reserve12; therefore a375×811 browser viewport yields an unchanged375×812 logical Source canvas. This separate frameless proof confirms fixed Prime/navigation and scrolling title, not parity with the framed system area.

`source-framed-geometry.json` inspects the actual framed Source Homepage and numerically normalizes geometry to authoring units without rewriting DOM transforms. Current iPhone16 sizing yields375×812.969, with a54px system reserve and758.969px below it. Relative to the excluded reserve, Prime is approximately x24/y0/79.906×32, privacy starts at x239, title is x24/y56/327×31, and navigation is y704.969 with height54. Source CSS title line height is normal.

Root's actual Native preview is375×758 and excludes the54px simulated system area. Its height differs by approximately0.969 logical pixels from the measured framed Source area; matched comparisons should use measured Source height rather than assert equality to the rounded preset. No zero-pixel whole-Homepage or device-fidelity claim is made here. Root owns paired Native capture/calibration and central progress reporting.
