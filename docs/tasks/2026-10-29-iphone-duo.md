# iPhone Duo executable preview

Owner/integration owner: `/root`. Checkout: `C:/Users/mihai/Desktop/Mobile Banking - CEE`.
Base: `745956e19c87f52bfc84267fa328c48479ccf24e`.
Initial pending changes and owned paths: `.codex-temp/iphone-duo/ownership-before.json`.
Preserve the main checkout and all prior changes. No commits, deployment or publication.

User request: run port 4004, rename Passport concepts to iPhone Duo, match the hardware silhouette to Apple's references, and adapt the executable baseline by content family while preserving its current navigation. The user rejected a generic two-column conversion, exploratory mode controls and an onscreen findings menu.

Use the existing React Native Web bridge and approved executable components. Preserve source artwork, text/control sizes, routes and interactions. The 375pt baseline is a media/reference unit, not a universal width for the whole app. Centre each composition within the safe area. Home, accounts, lists, documents and forms stay linear, capped at 560pt on the inner display. Repeatable option grids and specifically related panes may use up to 750pt (two existing reference units): Cards artwork/details, Payments choices, Products, More, Prime advisor information/actions and product editorial image/copy. ShopSmart retains a 375pt feed so its327pt images are not enlarged. Signing/success, currency exchange and templates are bounded independently of their parent editorial/menu screen. A layout must not be made multi-column solely because the device is open. These are prototype layout choices, not Apple-mandated constants or native SDK behaviour. Sheets use their own375pt column independently of their parent screen. Source screen identity remains stable across ordinary phone, Duo closed/open and rotation, so local form steps/values and selected products survive.

Background contract, explicitly supplied by the user: LVL1 Payments, Offers and More use white (`--uc-surface`), Home uses gray (`--uc-app-bg`). Spending stays vertical: spacer/header/chart through Card Transaction are gray, categories below and the scroll tail are white. PFM uses full-glass section surfaces with asymmetric foreground gutters; it does not bound the background to a narrow column. Its fixed375pt period viewport displays one active period rather than an accidental half of a second period. Category drill-ins preserve the same gray-top/white-transactions layering. Dark mode uses the corresponding existing tokens.

Sources: supplied ASEE PDF (cover 466x678pt, inner 951x669pt, 84pt right strip measured on cover and estimated on inner); https://developer.apple.com/iphone-duo/prepare/ ; https://developer.apple.com/videos/play/tech-talks/111461/ . Report dimensions are fixtures, not verified hardware geometry. The reference column is the actual existing baseline authoring width, not the report banner's 436pt width. SDK26 compatibility letterboxing and SDK27.1 system vertical bars are separate behaviours; neither is claimed by this custom-app preview. No live native inset measurement, keyboard, fold occlusion or Dynamic Island interaction can be certified by a browser.

Navigation contract: preserve the current app's horizontal bottom navigation and original header Back/Help/actions. The ASEE report requests safe-area corrections and a media/layout decision, not migration to native vertical bars. The user explicitly requires the recommendation and executable prototype to demonstrate the same scope. No mode switch, findings menu or technical notes inside the demo. Documentation carries the limits. A full native-bar adaptation is a separate future scope requiring SDK/container confirmation.

Canonical library verified read-only: `FKbbStgBIP9bFAMl3DPKHF`; approved App Header, Navigation, Images and Cards & Wallets pages. Reuse BaselinePageHeader, BaselineBottomNavigation, BaselinePaymentHero (327x120 contract) and BaselineCardArtwork (current Card composition 219x138) without rebuilding masters or adding assets.

Acceptance: source phone preview unchanged; Duo screen fixtures and strip visible; real Home, Cards, Payments, Offers, More, Prime, Login and modal views navigable; artwork not magnified to inner width; close/actions clear of strip; profile change keeps route; tests, module audit and final verify recorded after implementation.

Hardware visual references inspected: https://developer.apple.com/iphone-duo/images/sdk-ios-27-1_2x.png and https://www.apple.com/v/iphone-duo/e/images/overview/product-viewer/foldable__iybtpzlhgj6u_large.jpg . Closed hardware has a near-square hinge edge, rounded outside edge and circular front camera. Flat inner glass has no permanent black divider or exposed camera cutout. The executable CSS frame approximates the official render; no Apple raster artwork or flattened bank controls are embedded.

Review links preserve `previewDevice=iphone-duo-open` or `previewDevice=iphone-duo-closed` and `previewOrientation=portrait|landscape` through navigation/reload. The restored open-device rotation control remains next to Refresh. Open landscape uses the report's951x669 fixture/right strip; open portrait swaps to669x951 and uses a top status area. The frame's hinge/buttons reorient; the inner camera remains hidden. On unsupported app contexts the shell reserves the simulated strip without altering that experience's composition. The service runs locally on port4004; no external publication is implied.

Apple pose references: https://developer.apple.com/videos/play/tech-talks/111462/ and https://developer.apple.com/videos/play/tech-talks/111466/ . Native vertical bars apply on the outer display and inner landscape, while inner portrait returns to horizontal bars. Adopting that app-navigation behaviour requires compatible SDKs/native containers. The current custom banking navigation and Banking/ShopSmart segmented control are preserved; the prototype only relocates system chrome at rotation. Partially folded/Split View/PiP/reserved-region behaviour still needs native validation.

## Recommendation matching the prototype

Hi Jerko,

We recommend a content-driven adaptation of the current app, keeping its existing navigation and business flows.

1. Correct the shared screen, header, modal and bottom-action layouts using their actual view bounds and system safe-area insets. Handle each edge independently and update layout when the available geometry changes. Backgrounds may extend to the display edges; readable content and interactive controls must remain unobstructed.
2. Preserve a linear layout for Home, account information, transaction/document lists, forms and confirmations. Give them a comfortable maximum content width rather than stretching the phone UI or splitting unrelated sections into columns.
3. Assess wider compositions individually. Grids can serve similar choices in Payments, Products and More. Related information may be placed alongside an existing card, image or chart when it improves the task. Keep reading order, groupings, expansion behaviour and actions predictable. This is not a blanket two-column rule.
4. Limit media at component level, preserving its aspect ratio and existing crop/focal point. Do not enlarge card artwork or server images just to fill the inner display. Reuse existing assets initially and report any remaining resolution limitations after sizing is corrected.
5. Size modal sheets independently of the underlying screen. Keep close controls reachable and reserve sufficient scrollable space around fixed actions and the keyboard. Preserve entered values, selected products and the current step when the app resizes.
6. Keep the actual baseline surfaces: white Payments/Offers/More; gray Home; Spending gray through Card Transaction followed by full-width white content. Support portrait and landscape without changing the navigation model or losing state.

The web prototype demonstrates the proposed compositions using the existing executable baseline. Its dimensions and status-strip fixture come from your report. It does not certify the current binary's compatibility mode or introduce native vertical navigation bars. Please confirm the build SDK and native implementation constraints, estimate the scope, and return matched screenshots for both displays and a reference iPhone before release acceptance.

Best regards,
Mihai

## Verification record

Automated render inventory exercises 27 actual baseline screen types; the country check exercises the shared Payments composition for RO, CZ, SK, HU, RS, SI, BA and BA_BL. Dedicated regressions check safe centring, preserved device identifiers, review links, bridge lifetime, bounded media, linear Home, separate payment-sheet sizing and selected-card state across a pose change. This is render/behaviour evidence, not a claim of complete visual/accessibility acceptance for every nested state or a native-device certification.
