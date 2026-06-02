# Current Session

Last updated: 2026-06-02

## Current Focus

Closing the current BA_BL country/application variant, Payments/template alignment work, and accumulated handoff updates into a banana-clean commit.

## Last Meaningful Change

Latest Bosnia Banja Luka country/application variant:

- `src/app/state/demoTypes.ts`, `src/app/registry/demoConfig.ts`, and `src/app/registry/projectModel.ts`
  - added `BA_BL` as a separate country/application variant next to existing `BA`
  - top-bar/Design System country lists now include `Bosnia Banja Luka` with Bosnia flag and `BAM`
- `src/app/registry/countryConfig.ts`, `src/app/registry/languageByCountry.ts`, and `src/translations/index.ts`
  - `BA_BL` reuses Bosnia locale/currency/language/translation behavior (`bs-BA`, `BAM`, `KM`, `bs`, and BA translation package)
- Runtime config/data cloned from Bosnia:
  - `src/app/config/productConfig.ts`
  - `src/app/config/moreCardsConfig.ts`
  - `src/app/config/messagesConfig.ts`
  - `src/app/config/documentsConfig.ts`
  - `src/app/config/paymentsMenuConfig.ts`
  - `src/app/config/productsMenuConfig.ts`
  - `src/data/accountDetails.ts`
  - `src/data/paymentFlow.ts`
- AI/coverage registries updated:
  - `src/app/registry/screenRegistry.ts`
  - `src/app/registry/flowRegistry.ts`
  - `src/app/registry/templateRegistry.ts`
  - `src/app/screens/design-system/DesignSystemPage.tsx`
- Documentation updated:
  - `docs/handoff/state-of-the-world.md`
  - `docs/platform-capability-map/README.md`
  - `src/translations/README.md`
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=48 screens=23 flows=13`
  - static `BA_BL` coverage audit passed across 19 country-model/config/registry/data surfaces
  - in-app browser smoke on `http://localhost:3001/` confirmed the Country dropdown includes `Bosnia Banja Luka`, selecting it succeeds, and the topbar selected country reads `Bosnia Banja Luka`

Closeout / commit readiness on 2026-06-02:

- Commit scope:
  - all currently modified and untracked project files are intended to be staged and committed per explicit user request
  - includes Payments hero-card artwork variants, template/runtime alignment, `BA_BL` country/application coverage, and documentation/capability-map updates
- Banana Loop result:
  - fixed: Bosnia previously had one selectable application context although the business reality needs two maintained Bosnia applications; `BA_BL` is now a first-class duplicate of Bosnia
  - triaged: final country-specific Payments hero-card mapping, labels, and overlay contents remain visible future work in `docs/handoff/next-tasks.md`
  - triaged: build chunk-size warning and missing local `typecheck`/`lint`/`test` scripts remain known bananas, not blockers for this commit
  - no new untriaged banana was found during closeout
- Final verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=48 screens=23 flows=13`
  - static `BA_BL` country/config/registry/data coverage audit passed
  - `git diff --check` passed with only normal Windows LF/CRLF warnings
- constitutional check:
  - scope preserved: yes
  - docs updated: yes
  - verification recorded: yes
  - bananas triaged: yes
  - safe to resume: yes

Latest global cursor affordance fix:

- `src/styles/theme.css`
  - added a base interactive-cursor policy for runtime screens, Design System specimens, and code-backed templates
  - clickable controls now consistently show the hand cursor across native buttons, links, selects, semantic interactive roles (`button`, `tab`, `menuitem`, `option`, `radio`, `checkbox`, `switch`, `link`), labels bound to inputs, and future `[data-clickable="true"]` escape hatches
  - disabled controls now resolve to `not-allowed`, while text inputs and textareas keep the normal text cursor
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser checks confirmed `AccountTransactionRow`, product cards, and generic buttons compute `cursor: pointer`; selects compute `pointer`; text inputs compute `text`; disabled controls compute `not-allowed`

Latest Products template/runtime alignment:

- `src/app/screens/products/ProductsScreen.tsx`
  - exported the runtime Products building blocks (`ProductsHeader`, `ProductsTabs`, `BankingContent`, `ShopSmartContent`, `OffersRail`, and product-card translation helper) so Design System templates can reuse the same layout/component contract instead of duplicating approximate markup
- `src/app/components/templates/TemplateCodePreviews.tsx`
  - `products-menu` and `products-shopsmart` templates now render the Romania Products reference through the same runtime header, underline tab menu, offers rail, product-card grids, and `BottomNavigation`
  - removed the old template-only pill tab/menu spacing for these two templates, so the template visual now tracks the current Romania Products page more closely
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#templates` confirmed Templates loads, `products-menu` renders, and the runtime `Banking / ShopSmart` tab labels are present

Latest runtime translation key migration:

- `src/translations/types.ts`, `src/translations/shared.ts`, and every country/language file under `src/translations/{RO,CZ,SK,HU,RS,BA,SI}`
  - added a shared `runtime` translation namespace for active app surfaces: common actions, accounts, analytics/PFM, payments, products menu, messages, documents, settings, contacts, dialogs, and unsupported contexts
  - all 14 country/language translation files now spread `createSharedTranslations(language)`, giving every supported country both English and local-language runtime keys from one governed source
- `src/app/contexts/LanguageContext.tsx`
  - `t()` now accepts an optional fallback, so newly migrated runtime components do not expose raw key strings while the fine-grained country copy is still being completed
- Runtime screens/components migrated to use translation keys with fallbacks:
  - `PaymentsScreen`, `ProductsScreen`, `DomesticPaymentFlowScreens`
  - `AccountDetailScreen`, `AccountDetailsInfoScreen`, `AccountOptionsScreen`, `AccountActionBar`, `AccountSearchBar`
  - `AnalyticsScreen`, `MessagesScreen`, `DocumentsScreen`, `SettingsScreen`, `ContactsScreen`
  - `LogoutConfirmDialog`, `UnsupportedContextScreen`
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/translations src/app/contexts/LanguageContext.tsx src/app/screens src/app/components/accounts src/app/components/LogoutConfirmDialog.tsx src/app/components/UnsupportedContextScreen.tsx` passed with only normal Windows LF/CRLF warnings
- Limitation:
  - this pass key-backed the active runtime/demo screens listed above; Design System template preview specimens and older registry/config labels still contain explanatory English by design and should be handled as a separate inventory-copy pass if the requirement expands to documentation/DS metadata text as well

Latest PFM dark-mode color normalization:

- `src/styles/theme.css`
  - light PFM category tokens were preserved unchanged
  - dark PFM category tokens were regenerated from the light values using the pattern inferred from the supplied Light/Dark pairs: OKLCH perceptual lightness increases by about `+0.07`, hue/chroma stay close to the light token, and very dark source colors are clamped to a readable dark-surface minimum
  - all 23 PFM category tokens now keep category identity in dark mode instead of falling back to gray, stale light colors, or overly bright one-off partners
- `src/app/registry/colorRegistry.ts`
  - all PFM `darkHex` values now match the runtime CSS tokens exactly
  - the PFM palette description now records the dark-mode derivation rule for Design System Inventory and AI reuse
- Spending impact:
  - `AnalyticsScreen` / My Spendings already consumes `PFM_CATEGORIES -> colorVar -> theme.css`, so the Spending PFM rows, icons, and pale category pills inherit the updated dark colors without local component changes
- Verification on 2026-06-02:
  - OKLCH reference-pair audit confirmed the supplied pairs average roughly `+0.07` perceptual lightness with near-preserved hue/chroma
  - token/registry audit passed: `lightVarCount=23`, `darkVarCount=23`, `registryPfmCount=23`, `mismatches=[]`
  - dark-surface contrast audit passed for all 23 PFM colors on `#333333`, with minimum contrast `3.15:1`
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/styles/theme.css src/app/registry/colorRegistry.ts` passed with only normal Windows LF/CRLF warnings
  - in-app browser smoke could not run because the browser connection failed while preparing local browser assets (`failed to write kernel assets`); runtime verification is covered by build plus token/registry/contrast audits

Latest Text field underline alignment:

- `src/app/components/TextField.tsx`
  - `Text field` now reserves the same trailing `12px` gap plus `32px` control slot as `Dropdown`, even when no chevron is rendered
  - this keeps the underline/input-writing rail equal between `Dropdown` and plain `Text field`; the component container no longer visually grows the text rail when the chevron is absent
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser measurement on `http://localhost:3001/#forms` confirmed both `Dropdown` and `Text field` render `railWidth/inputWidth = 283px`, `gap = 12px`, and `slotWidth = 32px`, with SVG present only in `Dropdown`

Latest Domestic payment component mapping:

- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`
  - Domestic payment create/review/sign screens now use the shared `PageHeader` instead of the local flow header
  - `FROM ACCOUNT`, `BENEFICIARY`, and `PAYMENT DETAILS` separators now route through `SectionHeadingDivider`
  - domestic payment dropdown/text fields now use `TextField`, including camera and dropdown trailing-icon affordances
  - amount/currency entry now uses `AmountField` instead of separate local amount and currency field markup
- `src/app/components/templates/TemplateCodePreviews.tsx`
  - `Payment` and `New request with push` reconstructed previews now use the same `TextField`, `AmountField`, and `SectionHeadingDivider` primitives
  - removed the obsolete local domestic-payment amount/currency field data now that the amount row is component-backed
- `src/app/registry/templateRegistry.ts` and `src/app/registry/componentRegistry.ts`
  - template/component metadata now lists `PageHeader`, `TextField`, `AmountField`, and `SectionHeadingDivider` as the reusable contract for Domestic payment and request-with-push patterns
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser smoke verification on `http://localhost:3001/#templates` confirmed the Templates inventory loads, renders 50 template cards, includes `Payment` and `New request with push`, and has no app boot error

Latest Design System field specimen split:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - the previous `Text field` specimen was renamed to `Dropdown`, preserving the same states and chevron-down field treatment
  - a separate `Text field` specimen was added with the same visual states and look-and-feel, but without the trailing chevron control
  - both specimens share the same `TextFieldSpecimens` state renderer, with the chevron controlled by a specimen prop rather than duplicated markup
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#forms` confirmed `Dropdown`, `Text field`, `Amount field`, and `Generic UI controls` render in Forms; the `Dropdown` preview has one more SVG than `Text field`, matching the removed chevron

Latest Design System component inventory cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - section eyebrow labels such as `HEADERS` are no longer rendered above section titles, removing the duplicated heading treatment
  - section subtitles across Components, Templates, Icons, and Colors are now written in English
  - `AccountActionBar` specimen variants were renamed/expanded to `4 elements`, `3 elements`, `2 elements`, and `1 element`
  - `AccountCarouselIndicator` specimen was renamed to `Carousel Indicator`
  - `Carousel Indicator` now exposes the requested swipe-state variants: first, next, further, and last for both 4-item and 7-item sets
- `src/app/components/accounts/AccountActionBar.tsx`
  - action items now support a hidden reserved slot, so the Design System can show 3/2/1 visible elements while preserving the same 4-position layout geometry
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed the duplicated `HEADERS` eyebrow is gone, the Headers subtitle is English, `AccountActionBar` exposes the four requested variants, and `Carousel Indicator` exposes the eight requested indicator states

Latest Design System selector cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `VariantSelector` no longer renders visible left-side dropdown labels such as `Variant`, `Active tab`, or `Country`
  - select controls keep their accessible `aria-label`, so labels remain available to assistive tooling without cluttering the visual inventory
  - `BottomNavigationVariantSpecimen` no longer renders the auxiliary `activeTab: ...` line above the navigation component
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#navigation` confirmed `activeTab:` text is gone, visible dropdown labels are gone, and selects still expose aria labels (`Active tab`, `Variant`)

Latest Design System specimen-wide theme cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `Specimen` now owns the local icon-only Light/Dark theme segment for all component specimens, not only Headers
  - all specimen preview bodies are locally scoped with `.dark` when their card segment switches to dark, so token-based component colors update inside the component card without changing the global app theme
  - visible `.tsx` source pills and old spec-chip metadata are no longer rendered by `Specimen`, making the component inventory cleaner across sections
  - `Status bar`, `PageHeader`, `Home`, and `More` now consume the theme mode supplied by `Specimen`, avoiding duplicate local theme state
  - `Primary button` no longer has a Light/Dark variant dropdown; its visual variant now follows the specimen theme segment
  - fixed dark preview surface logic so dark mode no longer uses `var(--uc-text)` as a background token
  - `Home` remains background-transparent; in the Design System preview it inherits the page/frame background (`--uc-app-bg`) instead of owning a gray background itself
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed Headers have no source/spec metadata, no old Status bar Light/Dark dropdown, and four local theme segments
  - in-app browser verification on `http://localhost:3001/#buttons` confirmed `Primary button` no longer has a Light/Dark dropdown or source/spec metadata
  - in-app browser verification on `http://localhost:3001/#cards` confirmed source/spec metadata is hidden globally and component cards expose local theme controls
  - Home dark-mode preview was checked by computed styles: frame background `rgb(18, 18, 18)`, header background transparent, title color `rgb(255, 255, 255)`

Latest Design System Headers cleanup:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `Home`, `More`, and `Status bar` now follow the same clean specimen pattern as `PageHeader`
  - removed the visible `.tsx` source pills and extra spec chips from these Header specimens
  - added icon-only Light/Dark `ThemeModeSegment` controls to `Home`, `More`, and `Status bar` specimen headers
  - removed the old Light/Dark dropdown from `Status bar`; the specimen header segment now controls the status bar and dynamic island variant
  - `HeaderPreviewFrame` now scopes dark preview frames with the `.dark` class, so transparent header components read the correct local dark-mode tokens in Design System Inventory
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed no `HomeHeader.tsx`, `MoreHeader.tsx`, or `StatusBar.tsx` source pills remain in the Headers section, the old `status-bar-variant-select` dropdown is gone, and all four Header cards expose icon-only theme segments

Latest Design System inspector enrichment:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - the Design System Inspector now computes structured spacing data for every measured element inside a specimen
  - selected/hovered elements now show visual spacing guides: parent-distance bands, internal padding bands, sibling-distance bands, and parent gap chips
  - the inspector detail panel was expanded from size/font-only metadata to include parent layout, parent gap, and a dedicated `Spacing audit` section
  - the spacing audit lists parent distances, padding, margin, parent gap, previous sibling distance, and next sibling distance in one place
  - the sidebar inspector copy now explains that hover/click exposes size, font, padding, margin, gap, parent distances, and neighbor spacing
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx docs/handoff/current-session.md` passed with only normal Windows LF/CRLF warnings
  - in-app browser verification on `http://localhost:3001/#headers` confirmed the inspector can be enabled and shows dashed element bounds, spacing guide bands, and the expanded `Spacing audit` panel

Latest Design System interaction follow-up:

- `src/app/screens/design-system/DesignSystemPage.tsx`
  - the large intro card (`Visual audit workspace` / `Design System Inventory`) was removed from the main Design System page
  - the Components / Templates / Icons / Colors inventory tabs were moved from the removed intro card into the sticky left sidebar
  - Design System Inventory now derives the active inventory tab from the current hash on mount, so opening `#icons`, `#templates`, or `#colors` no longer renders the wrong/default Components inventory
  - clicking a sidebar inventory tab now updates the hash to that tab's first valid section and scrolls there after render (`#overview`, `#templates`, `#icons`, `#colors`)
  - direct Design System section URLs are now treated as app entry points: `AppWithNavigation` initializes the navigation state on `design-system` for known DS hashes, and `DemoNavigationSync` no longer resets those hashes back to prelogin
  - this fixes direct/loading navigation for `#icons` and `#templates`, including the Templates inventory tab
  - the left sidebar now starts aligned with the top of the content area and keeps inventory tabs, section links, and Inspector controls together for easier navigation
  - Design System Inspector ON/OFF control was moved from the main intro card into the left sections sidebar, reducing the vertical height of the inventory page header
  - the sidebar inspector control is marked as inspector UI, so it does not get selected by the measurement overlay itself
  - `TextField states` specimen was renamed to `Text field`
  - Forms now include a selector-driven `Amount field` specimen with the same states as `Text field`, plus a 24px-spaced currency column and 32x32 chevron control
  - Cards now include a selector-driven `Payments hero card` specimen for the primary Payments menu cards
  - `PrimaryButton family` specimen was renamed to `Primary button`
  - selector variants are now `Primary Action / Light` and `Primary Action / Dark`, making Light/Dark the differentiator rather than separate button variants
  - both modes now use the same `16px` bold label sizing
- `src/app/components/payments/PaymentHeroCard.tsx`
  - extracted the Payments primary menu cards from `PaymentsScreen` into a reusable component with the existing placeholder illustrations and an optional `imageSrc` slot for future supplied artwork
- `src/app/screens/payments/PaymentsScreen.tsx`
  - now consumes `PaymentHeroCard` instead of defining primary payment card JSX locally
- `src/app/config/paymentsMenuConfig.ts`
  - `PaymentHeroItem` now supports optional `imageSrc`, so future payment-card imagery can be mapped in config per card without changing the component
- `src/app/components/products/ProductMenuCard.tsx`
  - the Banking `Our products` / ShopSmart product menu card is now treated as an explicit reusable component surface, with an optional `imageSrc` slot for future supplied artwork and the existing generated illustration as fallback
- `src/app/config/productsMenuConfig.ts`
  - `ProductsCard` now supports optional `imageSrc`, so Account/Cards/Mortgages/Insurance/etc. artwork can be mapped per card without changing the component
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts`
  - added `payments.hero-card` so Payments primary cards are represented in the machine-readable component registry
- `src/app/registry/componentRegistry.ts`
  - `products.product-card` notes now explicitly map the component to the Banking `Our products` grid, ShopSmart featured categories, and future card artwork slot
- `src/app/components/AmountField.tsx`
  - new reusable amount-input variant built on the shared `TextFieldVisualState` contract, with currency label/value typography and disabled/error/focus state passthrough
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts`
  - added `ui.amount-field` so the new component is visible in the machine-readable component contract, not only in the visual inventory
- `src/app/components/ui/PrimaryButton.tsx`
  - the surface/dark wrapper now uses the same `16px` label size as the action/light button

- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx`
  - `TransactionDetailScreen` no longer renders a local, one-off transaction action grid
  - the transaction action shortcuts now use the shared `AccountActionBar` component, with the existing `Redo payment` handler wired through the reusable item contract
- `src/app/components/templates/TemplateCodePreviews.tsx`
  - `Transaction detail` template preview now also uses `AccountActionBar`, so the Design System template contract no longer teaches a separate shortcut implementation for the same action-bar pattern
- Verification on 2026-06-02:
  - `npm run build` passed after the Design System sidebar/header simplification; Vite still emits the known chunk-size warning
  - `npm run build` passed after fixing Design System Inventory tab/hash navigation; Vite still emits the known chunk-size warning
  - `npm run build` passed after making Design System hash URLs initialize and remain on `design-system`; Vite still emits the known chunk-size warning
  - server-code verification on `http://localhost:3001/src/app/App.tsx` and `http://localhost:3001/src/app/components/demo/DemoNavigationSync.tsx` confirmed the active dev server is serving the new DS-hash initialization/reset guards
  - follow-up in-app browser verification traced the remaining direct `#templates` blank page to an `AppIcon` runtime crash when a template preview passed an unmapped/undefined icon name; `AppIcon` now falls back to `help-circle` instead of taking down the app, and `main.tsx` exposes sanitized boot errors rather than leaving a white root
  - in-app browser verification now passes for `http://localhost:3001/#templates` and `http://localhost:3001/#icons`: both load Design System Inventory content and no longer show an app boot error
  - `Country coverage` in the Design System Overview was compacted from a long all-country card grid into a single selector-driven coverage panel; selecting a country updates languages, currency, Co-Apping, products, and More cards for that market
  - `npm run build` passed after the compact Country coverage selector change; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#overview` confirmed the Country coverage selector has all 7 countries, no longer renders the old multi-card list, and switching to Czech Republic updates the panel to CZK + Co-Apping
  - the top-bar country selector now clears Design System hash URLs when leaving `Design System Inventory`; choosing a real country from `#overview` no longer gets pulled back into the Design System by the hash sync effect
  - `npm run build` passed after the top-bar DS-to-country selector fix; Vite still emits the known chunk-size warning
  - in-app browser verification clicked `Design System Inventory` -> `Czech Republic` from `http://localhost:3001/#overview` and confirmed the app lands at `http://localhost:3001/`, shows the Czech Republic context label, and no longer renders the Design System page
  - Design System Headers section labels were cleaned up: `HomeHeader` is now shown as `Home`, `MoreHeader` as `More`, and `StatusBar / DynamicIsland` as `Status bar`
  - `PreLoginHeading` was moved out of Headers into the Navigation section as `Prelogin`, since it is a prelogin content component rather than a header
  - `StatusBar` now zero-pads hours as well as minutes, so the status time renders like `09:35` instead of `9:35`
  - Design System Headers specimens now share the same `375px` bordered preview frame for `PageHeader`, `Home`, `More`, and `Status bar`, so the audit surface is consistent while the runtime components remain unframed
  - `HomeHeader` and `MoreHeader` are now background-transparent components; their owning screen or Design System preview frame supplies the surface color
  - `HomeScreen` now reuses `HomeHeader` for both the sticky action row and scrollable title, removing a duplicated home-header implementation path
  - `npm run build` passed after the Headers cleanup and StatusBar time formatting change; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed the visible specimen names (`Home`, `More`, `Status bar`), `Prelogin` in the Navigation section, and a zero-padded `HH:mm` status time
  - `npm run build` passed after the header preview-frame refactor; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed four `375px` bordered preview frames in the Headers section and a zero-padded status-bar time (`09:51` in the check)
  - `ThemeModeSegment` was introduced as the shared icon-only Light/Dark segmented control and is now used by the main demo topbar and the PageHeader Design System specimen
  - `PageHeader` now supports centered large titles, PFM-colored large titles, and a clean fully-collapsed state where the large title disappears while the small centered title remains
  - The PageHeader Design System specimen no longer shows the `components/PageHeader.tsx` code pill or the old measurement chips; its header now contains the icon-only Light/Dark segment, while the dropdown exposes `Level 1 page`, `Level 1 center`, `Level 1 categorized`, `Level 1 uncategorized`, and `Collapsed`
  - `npm run build` passed after the PageHeader variant and icon-only theme segment changes; Vite still emits the known chunk-size warning
  - in-app browser verification on `http://localhost:3001/#headers` confirmed both theme segments are icon-only, the old PageHeader path/spec text is gone, and all five requested PageHeader variants are available in the dropdown
  - `npm run build` passed after exposing `ProductMenuCard` as the explicit `Products menu card` specimen and adding the optional product-card `imageSrc` slot; Vite still emits the known chunk-size warning
  - Browser verification in Design System Inventory confirmed `Products menu card`, `components/products/ProductMenuCard.tsx`, its selector, and the rendered `164x120` card are visible
  - Browser verification on `http://localhost:3001/#icons` confirmed the removed intro card/eyebrow, sidebar-hosted Components/Templates/Icons/Colors tabs, and aligned sidebar/content top positions (`asideTop=97`, `contentTop=97`, `topDelta=0`)
  - `npm run build` passed after extracting `PaymentHeroCard` and adding `payments.hero-card`; Vite still emits the known chunk-size warning
  - `npm run build` passed after adding `Amount field` and the `ui.amount-field` registry contract; Vite still emits the known chunk-size warning
  - `npm run build` passed after moving the Inspector control into the Design System sidebar; Vite still emits the known chunk-size warning
  - `npm run build` passed after the Transaction Detail action-bar replacement; Vite still emits the known chunk-size warning
  - `git diff --check` passed for the touched runtime/template/handoff files with only normal Windows LF/CRLF warnings
  - Browser opened `http://localhost:3001/#forms` successfully after the change

- `src/app/components/TextField.tsx`
  - empty, error-empty, and disabled-empty now behave as a proper floating-label field: the `Title` text stays in the value/placeholder position at `18px` body styling until the field is active or filled
  - filled, focused, error-filled, disabled-filled, and multiple-filled keep the title floated above the value
  - the underline is now rendered at `0.5px`
  - trailing chevron/icon slot now sits outside the underline rail, with `12px` spacing to the left of the `32x32` icon container, matching the field spec instead of sitting directly on the line
- `src/app/components/accounts/AccountCarouselIndicator.tsx`
  - mid-range `7`-item state now renders the missing dot item so the carousel no longer collapses to `6` visible markers in the Design System specimen/runtime
- `src/app/components/messages/MessagesMailboxTabs.tsx`
  - numeric counter support was removed from the tab contract
  - the leading blue dot is now controlled semantically through `hasNewItems`
- `src/app/screens/messages/MessagesScreen.tsx`
  - Inbox runtime demo now marks new content via the leading dot only
- `src/app/screens/design-system/DesignSystemPage.tsx`
  - `MessagesMailboxTabs` specimen now exposes both `Inbox active / new` and `Inbox active / no new`, rather than the old numeric badge state
- `src/app/components/ProductsList.tsx`
  - collapsed shadow and expanded rows now stay in one animated structure, so the product list / total row transition no longer snaps awkwardly between mounted/unmounted states
- Verification on 2026-06-02:
  - `npm run build` passed twice after these interaction fixes; Vite still emits the known chunk-size warning.

Latest Design System forms + button alignment pass:

- `src/app/components/common/RadioButton.tsx` now follows the spec contract the user validated manually:
  - `32x32` radio slot
  - `20x20` glyph
  - `8px` gap to label
  - `16px` bold label with normal line-height and `var(--uc-primary-k1)` text color
- `src/app/components/TextField.tsx` was rebuilt into a shared stateful field contract instead of a narrow demo-only input:
  - supports `empty`, `on-focus`, `filled`, `error-filled`, `error-empty`, `disabled-empty`, `disabled-filled`, and `multiple-filled`
  - disabled now uses K4 (`var(--uc-neutral-650)`) consistently across title, value, divider, helper copy, and trailing chevron
  - active/focus now uses `var(--uc-action)` for title + underline
  - multiple-filled now supports semicolon-separated values, right-aligned count `(n)`, and ellipsis truncation in the value rail
- `src/app/components/PrimaryButton.tsx` now owns a small family contract with `action` and `surface` variants plus `16px`/`18px` label sizing, and `src/app/components/ui/PrimaryButton.tsx` is now a thin wrapper over that shared button instead of a disconnected duplicate implementation.
- `src/app/screens/design-system/DesignSystemPage.tsx` now reflects those shared changes:
  - `StatusBar / DynamicIsland` specimen renders inside a proper `375x54` relative surface and passes the light/dark variant through `DynamicIsland`
  - `RadioButton` specimen uses the shared component contract directly
  - `PrimaryButton family` replaces the old duplicated `app` vs `ui duplicate` specimens
  - `TextField states` now exposes all requested states through the shared `TextField`
- `src/app/components/DynamicIsland.tsx` was tightened visually for the DS specimen with a flatter, cleaner shell and sensor treatment so it reads correctly on the isolated inventory surface.
- Verification on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser verification on `http://localhost:3001` confirmed:
    - `StatusBar / DynamicIsland` sits correctly in the headers specimen instead of looking cropped/misaligned
    - `RadioButton` no longer uses the old oversized gap/text treatment
    - `PrimaryButton family` now shows the dark/surface `SELECT YOUR ACCOUNT` style inside the same family
    - `TextField states` renders the new disabled/error/multiple variants from the shared component contract

Latest template-contract pass:

- `src/app/registry/templateRegistry.ts` now treats every template as a typed contract, not just visual evidence:
  - `relatedComponents` is now `readonly ComponentId[]` and points only at component registry IDs.
  - every template has `screenFamily`, `relatedScreens`, `flowIds`, `standalonePage`, products/countries/design systems, and optional `runtimeScreenId`.
  - every template receives an `AI assembly contract` with default reuse rules and do-not-invent rules; template 52 also records its `messagesConfig.ts` data source and runtime Messages reuse rules.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include missing reusable DS/component IDs needed by templates, including `icons.app-icon`, `shell.page-header`, `ui.primary-button`, `ui.text-field`, `ui.radio-button`, `ui.section-heading-divider`, `brand.unicredit-logo`, `prelogin.language-selector`, `prelogin.other-panel`, `accounts.details-info-field`, and `dialogs.logout-confirmation`.
- `src/app/screens/design-system/DesignSystemPage.tsx` now exposes the contract for each selected template: family, runtime screen, related screen IDs, flow IDs, reusable component IDs, data sources, reuse rules, and do-not-invent rules.
- `scripts/audit-template-contract.mjs` plus the new `npm run audit:templates` command validate all template contracts against the source registries and the `TemplateCodePreview` switch cases.
- `src/app/registry/aiCatalog.ts` version is now `2026-06-02.templates-contract`.
- Verification on 2026-06-02:
  - `npm run audit:templates` passed with `templates=50 codePreviews=50 components=46 screens=23 flows=13`.
  - `npm run build` passed; Vite still emits the known chunk-size warning.

Latest manual icon-registry touch-up from browser QA:

- A focused follow-up pass in `src/app/components/icons/AppIcon.tsx` tightened several manually flagged UI icons whose inner SVG canvases were still making them read undersized inside the standard `32x32` slot / `20x20` glyph contract.
- The pass included header / bottom-nav / action / account affordances such as `header-messages`, `nav-home`, `nav-analytics`, `nav-payments`, `nav-products`, `back-line`, `search`, `filters`, `chevron-right`, `chevron-down`, `chevron-down-wide`, `panel-smart-banking`, `panel-share-screen`, `demo-chevron-down`, `demo-reset`, `account-details`, `account-options`, `account-option-statement`, `account-option-change-name`, `copy-documents`, and `prime-check`.
- `payment-create-qr` was corrected to the dedicated paycode SVG spec (`12x20` source art rendered through the shared `20x20` glyph size) instead of the older oversized mixed-payment icon.
- `close-x-small` is no longer treated as a non-standard audit exception; it now renders as a standard `20x20` glyph inside the existing `32x32` dismiss slot used by `NewPaymentDiscoverBanner`.
- `prime-email` and `prime-phone` were also normalized to `20x20` registry dimensions so the Prime contact/action family no longer mixes `24x24` and `20x20` definitions for icons that share the same standard runtime slot contract.
- A follow-up refinement also tightened the Prime family viewBoxes themselves (`prime-phone -> 2 2 20 20`, `prime-email -> 1 5 22 14`), so those two no longer rely on a roomier inherited `24x24` canvas while sibling Prime/Contacts icons use cropped glyph frames.
- `npm run build` passed again on 2026-06-01 after this touch-up; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/components/icons/AppIcon.tsx` passed with only the normal LF-to-CRLF warnings on Windows.

Latest icon-registry boundary cleanup:

- Decorative and brand-mark assets that were still inflating the icon audit have been moved out of `AppIcon` usage and replaced with dedicated/local implementations:
  - `src/app/components/prime/PrimeDiamondMark.tsx` now owns the Prime diamond brand mark previously rendered through `AppIcon name="prime-diamond-16"`.
  - `src/app/components/BottomNavigation.tsx` now renders the active underline as a local `24x2` bar instead of `AppIcon name="nav-active-bar"`.
  - `src/app/screens/contacts/ContactsDivider.tsx` now renders its divider as a plain `1px` block line instead of `AppIcon name="divider-375"`.
  - `src/app/screens/more/cards/MoreCardBase.tsx` and `src/app/screens/more/cards/DocumentsCard.tsx` now render the corner badge as a local quarter-circle shape instead of `AppIcon name="badge-corner"`.
- `src/app/components/icons/AppIcon.tsx` no longer contains `prime-diamond-16`, `nav-active-bar`, `divider-375`, or `badge-corner`, so the icon registry is now more honest: standard UI icons stay in `AppIcon`, while decorative shapes and brand marks live outside it.
- A fresh repo-wide audit on 2026-06-01 shows the remaining explicit icon sizes are now illustrative/special only:
  - Kids hero/feature art (`42`, `48`, `28`, dynamic `iconSize`)
  - Payments/home/template hero illustrations (`30`, `40`, `54`, `62`, `64`, `86`)
  - Prime diamond brand mark at `15`, now outside `AppIcon`
- `npm run build` passed again on 2026-06-01 after the boundary cleanup; Vite still emits the known chunk-size warning.
- `git diff --check` passed again with only the normal LF-to-CRLF warnings on Windows.
- Browser re-verification of the cleaned surfaces was not run in this pass because browser automation was not available in the current tool surface; verification for this step relies on build success plus repo-wide icon-usage audits.
- Final standard-UI cleanup on 2026-06-01 also normalized two remaining runtime surfaces that still behaved like regular UI icons rather than illustrations:
  - `src/app/screens/home/InactiveState.tsx` now renders the inactive lock inside a `32x32` centered slot within the existing `80x80` circular badge, instead of hardcoding a `40px` glyph.
  - `src/app/screens/kids/RoKidsApp.tsx` now renders `IconBubble` through a `32x32` centered inner slot for both `default` and `large` bubble sizes, instead of scaling the glyph itself to `21px` / `28px`.
- A fresh repo-wide `AppIcon size={...}` audit after those fixes now leaves only deliberate illustrative or decorative exceptions:
  - Template preview hero/illustration glyphs (`44`, `52`, `54`, `62`, `64`)
  - Runtime promo/illustration glyphs in Products and Payments (`30`, `64`, `86`)
  - Kids onboarding / activation / card-art illustrations (`28`, `42`, `48`)
- `npm run build` passed again on 2026-06-01 after the `InactiveState` + `IconBubble` normalization; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/screens/home/InactiveState.tsx src/app/screens/kids/RoKidsApp.tsx` passed with only the normal LF-to-CRLF warnings on Windows.
- Follow-up icon audit on 2026-06-01 found a second class of sizing bug: several Prime/Contacts custom SVGs were already drawn inside a shrunken inner canvas, so they looked visibly smaller than sibling icons even though the outer runtime slot was already `32x32`.
- `src/app/components/icons/AppIcon.tsx` now tightens the effective glyph canvas for the affected custom icons by replacing overly roomy `32x32` viewBoxes with content-cropped `20x20`-scale viewBoxes:
  - `prime-direction`
  - `contact-prime`
  - `contact-location`
  - `contact-time`
  - `contact-phone`
  - `contact-block`
  - `contact-email`
  - `contact-website`
  - `contact-youtube`
  - `contact-x`
- This fix preserves the shared runtime contract (`20x20` glyph rendered inside the existing `32x32` slot) while removing the accidental extra whitespace that made these icons look doubly reduced compared with healthy references such as `prime-email`.
- `npm run build` passed again on 2026-06-01 after the Prime/Contacts viewBox normalization; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/components/icons/AppIcon.tsx` passed with only the normal LF-to-CRLF warnings on Windows.
- Browser re-verification of the specific Prime/Contacts icon rows was not run in this pass because browser automation was not available in the current tool surface; verification for this step relies on direct SVG-definition audit plus build success.

Latest Design System Inventory compaction pass:

Latest Design System Inventory selector recovery fix:

- The top-bar country/context selector bug on `http://localhost:3001` was traced to a runtime crash inside `src/app/screens/design-system/DesignSystemPage.tsx`, not to `DemoTopBar` navigation itself.
- `MessagesMailboxTabsVariantSpecimen` was still rendering a removed `InlineControls` helper, which caused `ReferenceError: InlineControls is not defined` when entering `Design system inventory`; that made the destination screen appear blank, so the selector looked like it was no longer loading pages.
- `src/app/screens/design-system/DesignSystemPage.tsx` now uses the existing shared `VariantSelector` for the `MessagesMailboxTabs` specimen instead of the missing helper.
- `npm run build` passed again on 2026-06-01 after this fix; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` reproduced the blank `Design system inventory` state before the patch, then confirmed the full flow after the fix: `Romania -> Design system inventory` loads the inventory correctly, and `Design System Inventory -> Czech Republic` exits back to the live country prelogin screen correctly.

Latest DemoTopBar context-selector clarity fix:

- `src/app/components/demo/DemoTopBar.tsx` now treats the country dropdown trigger as a hybrid context selector: when the current screen is `design-system`, the trigger label shows `Design System Inventory` instead of the last selected country.
- Choosing a real country while the user is inside the Design System Inventory now exits that surface back to the scenario-appropriate prelogin entry (`prelogin-active` / `prelogin-inactive`), so the trigger immediately becomes country-relevant again instead of looking stuck on the inventory context.
- Country rows in the dropdown only render as selected when the runtime is actually in a country context; the dedicated `Design system inventory` row owns the selected state while the inventory screen is open.
- `src/app/components/demo/DemoNavigationSync.tsx` now resets to the scenario-appropriate prelogin entry instead of always forcing `prelogin-inactive`, fixing the race where leaving `Design System Inventory` through the country selector could appear to stop loading or reopen on the wrong entry state.
- `src/app/components/demo/DemoTopBar.tsx` now uses `navigateToAndReset` for `Reset`, `Design system inventory`, and `Design System Inventory -> country` exits, so the control plane does not leave stale navigation history behind while switching context.
- `npm run build` passed again on 2026-06-01 after the DemoTopBar + DemoNavigationSync fix; Vite still emits the known chunk-size warning.

- `src/app/screens/design-system/DesignSystemPage.tsx` now groups the remaining multi-variant component families under selector-driven specimens instead of rendering their variants as separate long-form inventory blocks.
- Added/finished selector-based inventory specimens for `PageHeader` light/dark and the generic `components/ui/*` family (`Button`, `Badge`, `Input`, `Checkbox`, `Switch`, `Toggle`, `ToggleGroup`, `Slider`, `Progress`, `Separator`, `Avatar`, `Skeleton`, `Alert`, `Tabs`), so those audits happen one variant at a time without touching the underlying components.
- Structural audit on 2026-06-01 found no duplicate `source=` entries across `<Specimen ...>` blocks in `DesignSystemPage.tsx`, which is the current proof that no component family is still represented as multiple separate specimen cards in the Components inventory.
- `npm run build` passed on 2026-06-01 after the DS compaction pass; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` opened `Design System Inventory -> Components` and confirmed the generic UI section now renders as a single `Shadcn / generic UI primitives` card with `Family` and `Variant` dropdowns instead of listing all control states at once.

Latest Home dark-mode account-card refinement:

Latest Products country-specific commercial-banner refresh:

- `src/app/config/productsMenuConfig.ts` now defines per-country Products offer copy and banner-tone selection instead of reusing one shared set of banking/shop-smart banners across all markets.
- The same config now also varies banner count by market context, with richer multi-card rails (`3` banking offers in every country and `2` ShopSmart offers where the tab exists) so the Products carousel feels less repetitive during country switching.
- `ProductsOffer` now carries optional `colorFamily` and `lightVersion` metadata, so offer content and visual treatment stay coupled in config rather than being hardcoded in the screen.
- `src/app/screens/products/ProductsScreen.tsx` now passes each offer's configured banner tone into `ProductOfferCard`, allowing runtime Products rails to change color and artwork dynamically when the selected country changes.
- `npm run build` passed on 2026-06-01 after the country-specific Products banner update; Vite still emits the known chunk-size warning.

- `src/app/components/ProductCard.tsx` now uses `var(--uc-surface-raised)` instead of `var(--uc-surface)` for accordion product cards, so Home account/card items separate more cleanly from the dark app background.
- `src/app/components/StackedProductShadow.tsx` now renders the stacked shelf fill with `var(--uc-surface-raised)` and the divider line with `var(--uc-border-muted)` instead of a hard white fill/border treatment, removing the bright white bars that were showing under collapsed cards in dark mode.
- `src/hooks/useProducts.tsx` now removes the hard white `32x32` background rectangles from the `saving_account`, `term_deposit`, `loan`, `mortgage`, and `investment_account` product SVGs, so those Home accordion icons render transparently in dark mode instead of sitting on white tiles.
- `src/app/config/productBannerVariants.ts` now maps each offer-banner color family to the matching screenshot asset from `screenshots/comm-banner-*.png`, reusing the same image for both `normal` and `light` variants inside that family.
- `src/app/components/products/ProductOfferCard.tsx` now renders its right-side `100px` image column from the banner-tone mapping instead of a single shared fallback image, so the Products banner specimen/runtime can show family-specific artwork.
- `npm run build` passed on 2026-06-01 after the dark-mode card fix; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` switched the top-bar theme toggle to `Dark`, opened active PI Home, and confirmed the Home Accounts/Cards shelves no longer render the previous white stacked-shadow artifact behind the dark cards; the `Emergency Fund` icon now also renders without the old white tile backdrop in dark mode.

Latest icon-source cleanup:

Latest UI icon slot-standardization pass:

- `src/app/components/demo/DemoTopBar.tsx` now renders the three dropdown chevrons plus the control-panel and reset affordances through explicit `32x32` slots, instead of the older `24px` wrappers / `size-full` glyph treatment, bringing those top-bar controls back onto the shared `32x32 slot / 20x20 glyph` contract.
- `src/app/screens/prime/YourAdvisorTab.tsx` now renders the `Call now` and `Send email` action icons inside `32x32` centered slots rather than raw `24px` boxes, aligning the advisor quick actions with the same standard UI icon sizing used elsewhere in the app.
- `src/app/components/icons/AppIcon.tsx` now defines `radio-selected` / `radio-unselected` as `20x20` glyphs, while `src/app/components/common/RadioButton.tsx` and the matching `TemplateRadioMark` in `src/app/components/templates/TemplateCodePreviews.tsx` now render those radio icons inside `32x32` slots instead of the older `22px` / `24px` treatments.
- `src/app/screens/design-system/DesignSystemPage.tsx` now renders the generic `Alert` primitive specimen icon through a `32x32` slot instead of a hardcoded `16px` class override, `src/app/components/demo/DemoFeatureSidePanel.tsx` now uses a `32x32` close slot instead of a `20px` local override, and `src/app/components/common/BackButton.tsx` now relies on the default `20x20` glyph inside its existing `32x32` button slot.
- The remaining toggle check marks in `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now use the default `20x20` glyph size instead of explicit `16px` overrides.
- The inline PFM badge in `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now uses a full `32x32` `PfmCategoryIcon` slot with a slightly taller pill container, eliminating the last runtime `size={20}` PFM icon use.
- A fresh repo-wide audit on 2026-06-01 shows the remaining explicit non-32/20 icon cases are now limited to deliberate non-standard assets: Prime brand diamonds at `15`, divider/badge decorative SVGs that intentionally fill their own shapes, the system `StatusBar` SVGs, and larger illustration/hero art icons (`28+`, `30+`, `40+`, `54+`, `62+`, `64+`, `86`).
- `npm run build` passed again on 2026-06-01 after the DemoTopBar + Prime advisor slot cleanup; Vite still emits the known chunk-size warning.

- `src/app/components/templates/TemplateCodePreviews.tsx` now normalizes standard interactive icons in shared template building blocks (`TemplateFlowField`, `TemplateReadOnlyRow`, `TemplateMiniBottomNavigation`, `TemplateFiveBottomNavigation`, `TemplateTopLevelHeader`, prelogin language selectors, close/help/header actions, chevrons, copy/share actions) so they render through explicit `32x32` slots with the `AppIcon` default `20x20` glyph contract instead of ad hoc `22px` / `24px` / `26px` overrides.
- Follow-up refinements on the same pass now also normalize smaller stragglers in shared/runtime surfaces: `src/app/components/accounts/AccountSearchBar.tsx` no longer hardcodes `20px` sizes for search/filter/clear inside `32x32` slots, `src/app/components/products/ProductMenuCard.tsx` now renders its fallback arrow through a `32x32` slot instead of a raw `32px` glyph, and `TemplateCodePreviews.tsx` now uses the standard slot contract for transaction rows, shortcut tiles, money-out category rows, tutorial arrows, and transaction-detail hero icons where those controls are UI glyphs rather than illustrations.
- The remaining explicit sizes in `TemplateCodePreviews.tsx` after the pass are now mostly deliberate non-standard or illustrative cases (`54px` payment-hero art, `52px` profile avatar icon, `62/64px` success glyphs, `44px` push-notification illustration, `30px` / `28px` promo accents, `21px` / `25px` transaction/decorative glyph tuning, and compact special icons such as `close-x-small`).
- `src/app/screens/kids/RoKidsApp.tsx` now normalizes standard navigation/row/action icons (`FlowHeader` back button, `KidsBottomNav`, goal/parent/approval chevrons, `ParentQuickAction`, the eye toggle, action tiles, and toast close affordance) to the same slot/glyph contract while leaving intentional larger Kids illustrations (`42px` carousel art, `48px` QR hero, `28px` card artwork, `40px`/`54px` icon bubbles) untouched.
- `npm run build` passed again on 2026-06-01 after the template + Kids slot-standardization pass; Vite still emits the known chunk-size warning.
- `git diff --check -- src/app/components/templates/TemplateCodePreviews.tsx src/app/screens/kids/RoKidsApp.tsx docs/handoff/current-session.md` passed with only the normal LF-to-CRLF warnings on Windows.

- `src/app/components/icons/AppIcon.tsx` now removes lucide wrappers that already had custom SVG equivalents or better custom registry targets: `share-2`, `copy`, `check`, `bell`, `file-text`, `qr-code`, `chevron-down-lucide`, `plus-circle`, `filter`, and lucide `close-x`.
- `close-x` is now a custom SVG registry icon, and active/template usages were remapped to existing custom entries such as `copy-documents`, `filters`, `add-money`, `payment-create-qr`, `chevron-down`, `prime-check`, `account-option-statement`, and `account-option-push-notifications`.
- `src/app/screens/kids/RoKidsApp.tsx` no longer imports `lucide-react` directly; Kids icon usage now routes through `AppIcon` / `IconName`, while Kids-only lucide glyphs are centralized as explicit `AppIcon` lucide-alone registry entries.
- `src/app/components/icons/AppIcon.tsx` now documents extra raw-SVG audit exclusions for `PfmCategoryIcon` and the decorative `ProductOfferCard` chevron background, so remaining raw SVG boundaries match the actual source scan.
- Remaining lucide-alone registry keys after the cleanup are: `wallet-cards`, `shopping-bag`, `arrow-right`, `camera`, `grid-2x2`, `landmark`, `repeat`, `lock`, `alert-triangle`, `credit-card`, `send`, `bike`, `book-open`, `calendar-days`, `circle-dollar-sign`, `clipboard-check`, `eye`, `eye-off`, `gift`, `palette`, `piggy-bank`, `receipt-text`, `shield-check`, `sliders-horizontal`, `trophy`, `user-round`, and `users`.
- `npm run build` passed on 2026-06-01; Vite still emits the known chunk-size warning.
- Icon audits passed on 2026-06-01: `lucide-react` remains only in `AppIcon.tsx` plus vendored `src/app/components/ui/**`; removed lucide wrapper names no longer appear as active `AppIcon` names; removed lucide components are no longer referenced in `AppIcon.tsx`; raw `<svg>` occurrences match the documented audit boundaries.
- Static template coverage still passes after the icon remap: `ids=50`, `codePreviewIds=50`, `uniqueCodePreviewIds=50`, `screenshots=30`, `codeOnly=20`, `previewCases=50`, `missingCases=0`.
- `git diff --check` passed; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Icons renders `Icon registry`, counters show `Mapped icons 97`, `Custom SVG 70`, `Lucide wrappers 27`, and centralized Kids icons such as `Bike` and `Piggy bank` are visible.

Latest template expansion:

- `src/app/components/templates/TemplateCodePreviews.tsx` now adds another 10 code-only templates derived from active app patterns: Prelogin inactive, Prelogin active, Language selector sheet, Other panel menu, Co-Apping session, Account transactions list, Account search results, Spending money out, Products ShopSmart, and Logout confirmation.
- `src/app/registry/templateRegistry.ts` now represents 50 code-backed templates total: 30 screenshot-backed templates plus 20 code-only templates with `sourceKind: "code-only"` and no fake PNG source.
- `src/app/screens/design-system/DesignSystemPage.tsx` now supports code-only templates in the Templates tab, keeps screenshot/source toggles only for screenshot-backed templates, and reduces template cards from `190px` to `168px` high to keep the expanded grid compact.
- `src/app/registry/componentRegistry.ts`, `src/app/registry/aiCatalog.ts`, `docs/handoff/next-tasks.md`, `docs/handoff/state-of-the-world.md`, `docs/handoff/banana-log.md`, and `docs/platform-capability-map/README.md` now record 50 code-backed templates, including the 20 code-only templates.
- `npm run build` passed on 2026-06-01; Vite still emits the known chunk-size warning.
- Static coverage check passed: `ids=50`, `codePreviewIds=50`, `uniqueCodePreviewIds=50`, `screenshots=30`, `codeOnly=20`, `missingCases=0`.
- `git diff --check` passed; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates selected, 50 template cards, 50 code-backed cards, stat counters show 30 screenshot sources and 20 code-only templates, and selecting a newly added code-only template opens in `code` mode with a `Code-only template` notice and no false source toggle.

Previous screenshot-template completion:

- `src/app/components/templates/TemplateCodePreviews.tsx` reconstructs all 30 source screenshot templates as code, including Account options, Activate Mobile Token, Analytics, Cards, Contact bottom sheet, account-detail homepage, Domestic payment, Review request, Review data, and Transaction detail.
- `src/app/registry/templateRegistry.ts` marks all 30 screenshot templates as `reconstructed-code` with `codePreviewId` mappings; source PNG/JPG assets remain comparison evidence in the Design System Templates tab.
- Raw color audits passed: no raw app hex outside `colorRegistry.ts` and no direct numeric `rgb()`/`rgba()` in `src/app` or `src/styles`.

Latest RO Kids prototype implementation:

- `src/data/roKidsBanking.ts` adds strict Romania/RON mock data and types for child profile, parent profile, money requests, send-money requests, saving goals, chores, approvals, allowance, transactions, learn modules, card settings, and parent controls.
- `src/app/screens/kids/RoKidsApp.tsx` implements a contained Mobile PI Kids module with Kid Home, onboarding, parent activation, request money, parent approval, send money approval, My Card, card customization, saving goals, allowance, chores, Learn, What Parent Can See, Parent Dashboard, Parent Approvals, Parent Controls, and chore/allowance management.
- `src/app/App.tsx` renders `RoKidsApp` only for `product=KIDS_PI`, `country=RO`, and `designSystem=current`; all other Kids contexts still fall back to the honest planned-state placeholder.
- `src/app/registry/projectModel.ts`, `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/flowRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/aiCatalog.ts` now register the RO Kids prototype, the core Ask Money -> Parent Approval -> Money Received flow, and the contained module component entry.
- `docs/architecture/PROJECT_MODEL.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record that Mobile PI Kids has a Romania-only mock-driven runtime prototype while other Kids concepts remain planned.
- `npm run build` passed after the RO Kids implementation on 2026-05-29; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://127.0.0.1:5177` selected `Mobile PI Kids` + `Romania`, opened the Kids Home, completed Ask Money -> Parent Approval -> Approve -> Money Received, and confirmed Mia's balance moved from `86 RON` to `116 RON` with no stale waiting banner.
- `git diff --check` passed after the RO Kids code changes; Git only reported the normal LF-to-CRLF warnings on Windows.
- Typecheck, lint, and tests remain unavailable as separate scripts; `package.json` only exposes `dev`, `build`, and `preview`.

Previous product-taxonomy infrastructure refinement:

- `src/app/state/demoTypes.ts` now models `KIDS_PI` as a first-class `ProductId`, alongside `PI` and `SME`, so future registries can attach country/screen/flow coverage without another taxonomy migration.
- `src/app/registry/projectModel.ts` now registers `KIDS PI` as a planned product layer and includes it in `PRODUCT_ORDER`, so it appears in the same selector/dropdown infrastructure as `Mobile SME planned`.
- `docs/architecture/PROJECT_MODEL.md`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record that `KIDS PI` exists for all countries and is visible in runtime selectors as a planned context, while still rendering the honest non-implemented placeholder.
- `npm run build` passed after the KIDS PI selector exposure on 2026-05-28; Vite still emits the known chunk-size warning.

Latest demo top-bar compactness refinement:

- `src/app/components/demo/DemoTopBar.tsx` now renders the product, country, and release dropdown triggers as plain selected values (`Mobile PI`, `Romania`, `Current baseline`) without the extra `Application`, `Country`, and `Release` helper labels, making the control strip denser and easier to scan.

Latest Spending / My Spendings PFM baseline refinement:

- `src/data/spendingAnalytics.ts` now exposes a reusable period timeline for Spending, combining up to 2 years of month entries with appended yearly totals so the screen can navigate backward through historical months and forward into annual totals.
- `src/data/accountDetails.ts` now includes extra 2025 mock transactions across primary current, secondary current, savings-transfer, and credit-product profiles so the Spending timeline has meaningful month/year history instead of a single isolated month.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now uses the timeline-driven period selector, centered period indicator, and screenshot-style `Money out` / `Money in` sections with proportional pale background pills per PFM category, while removing the previous transaction-count rows, cash banner, and cash-withdrawal divider from the baseline screen.
- The Spending top hero (`Data For` + inflow/outflow chart + centered period dots) now supports full-width swipe/drag navigation between periods and animates as a single sliding panel: the outgoing period section exits toward the screen edge while the incoming section enters concurrently from the opposite side with eased slide/fade motion.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now uses the same drag/snap interaction model as the Products offers rail, with fixed `375px` period panels and deterministic horizontal snap math, so the Spending hero follows the same desktop swipe/drag pattern instead of a bespoke carousel contract.
- The Spending period indicator dots are now anchored outside the moving hero panel, so only the `Data For` + chart + `Incomes/Spendings` section slides between periods while the centered indicator stays fixed in place.
- The `Card Transaction` quick action above `Money out` is now restored through the shared `AccountActionBar` instead of the temporary custom button markup used during iteration.
- `npm run build` passed after the Spending baseline refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` earlier in the day confirmed the Spending screen now starts on `APRIL 2026`, navigates forward into yearly totals (`2026`, then `2025`), keeps the indicator centered, and renders right-aligned proportional Money Out pills with shared PFM icons.
- `npm run build` and `git diff --check` both passed again after the Spending hero transition polish on 2026-05-28; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest Documents screen implementation:

- `src/app/screens/documents/DocumentsScreen.tsx` now implements the PI Documents screen as the same family as Messages, reusing the shared `PageHeader` and `AccountSearchBar` but removing the mailbox tabs and dot-menu actions.
- `src/app/config/documentsConfig.ts` now owns the grouped-by-year Documents mock rows used by both runtime and template reconstruction.
- `src/app/screens/more/MoreScreen.tsx` now routes the Documents card to a real runtime Documents screen, and `src/app/App.tsx` plus the navigation/flow/screen registries now recognize `documents` as a real screen reachable from More.
- `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/registry/templateRegistry.ts` now reconstruct `screenshots/Documents.png` as code; this was part of the earlier partial template-coverage phase.
- `npm run build` passed after the Documents implementation on 2026-05-28; Vite still emits the known chunk-size warning.

Latest Settings screen implementation:

- `src/app/screens/settings/SettingsScreen.tsx` now implements the PI Settings screen with the shared `PageHeader`, `SectionHeadingDivider`, and chevron-row treatment, driven by `src/app/config/settingsConfig.ts`.
- `src/app/screens/more/MoreScreen.tsx` now routes the Settings card to the new runtime Settings screen, and `src/app/App.tsx` plus the navigation/flow/screen registries now recognize `settings` as a real screen reachable from More.
- `src/app/components/templates/TemplateCodePreviews.tsx` and `src/app/registry/templateRegistry.ts` now reconstruct the `screenshots/Settings.png` template as code, so the Design System Templates tab shows Settings as a code-backed preview instead of source-only PNG.
- `npm run build` passed after the Settings implementation on 2026-05-28; Vite still emits the known chunk-size warning.

Latest manual dark-mode pair mapping pass:

- `src/styles/theme.css` now applies the user-supplied dark counterparts for the previously unmatched DS colors, including neutral surfaces, teal accents, warm colors, product colors, and PFM semantic colors.
- Pure black was removed from active DS tokens: `--uc-primary-main` and `--uc-static-black` now normalize to `#262626`, and `--uc-static-black-rgb` now uses `38 38 38`.
- `src/app/registry/colorRegistry.ts` now mirrors the same manual dark pairs so the Design System Colors inventory matches runtime behavior.
- PFM semantic colors that reuse the same light hex as core DS colors now also inherit the user-supplied dark pairs in the registry/runtime instead of staying on placeholder dark values.

Latest DS color-registry expansion for active platform colors:

- `src/app/registry/colorRegistry.ts` now includes a dedicated `PFM Categories` palette so active Personal Finance Management colors are cataloged explicitly in the Design System inventory instead of existing only as theme tokens.
- Added DS color entries for the previously uncataloged active PFM colors and semantics, including `Taxes and Penalties`, `Groceries`, `Lifestyle`, `Investments`, `Internal`, plus the rest of the active PFM token set for semantic traceability.
- `COLOR_SOURCE_AUDIT.normalizedColorsInRegistry` now reflects the expanded registry coverage for active platform colors.
- `APP_COLOR_AUDIT` now records that the PFM-only colors are intentionally mapped through DS registry entries rather than remaining hidden in `theme.css`.

Latest dark-mode token matching refinement:

- `src/styles/theme.css` now remaps dark-mode tokens by exact-match reference against the supplied external DS table, reusing only the corresponding dark partners for colors that already exist in the current DS.
- Updated dark mappings now include the neutral `#666666 -> #CCCCCC` pair, primary teal `#006375 -> #CCCCCC` and `#007A91 -> #FFFFFF`, brand red `#E2001A -> #E2001A`, product blue deep `#244858 -> #91D1DD`, green `#004C3D -> #004C3D`, `#008574 -> #008574`, `#359F42 -> #359F42`, status green `#3D7D43 -> #26EDA9`, warning orange `#F26B08 -> #FDA98B`, and status red `#CF3524 -> #FF7A8E`.
- `src/app/registry/colorRegistry.ts` now mirrors those exact-match dark pairs in the Design System Colors inventory so the registry stays aligned with runtime theme tokens.
- Banner blue variants in dark mode now also follow the exact-match teal mapping (`#006375 -> #CCCCCC`, `#007A91 -> #FFFFFF`) instead of reusing the light-mode values.

Latest Products offer-card color-variant system:

- `src/app/components/SectionHeadingDivider.tsx` now provides the shared 14px bold uppercase section-label + divider contract (`line-height: normal`) for top-of-section headings.
- `src/app/screens/products/ProductsScreen.tsx` now uses that shared section heading contract for `OFFERS FOR YOU`, `OUR PRODUCTS`, `OTHER SOLUTIONS`, and the ShopSmart section labels instead of a local `21px/24px` heading style.

- `src/app/config/productBannerVariants.ts` now defines reusable banner color-family mappings for `green`, `yellow`, `orange`, `pink`, `red`, `blue`, and `grey`, each with `normal` and `light` variants.
- `src/styles/theme.css` now exposes stable banner color variables so these variants keep their supplied values regardless of app light/dark theme.
- `src/app/components/products/ProductOfferCard.tsx` now accepts color-family and light-version props, applying the mapped background, chevron, and text colors through the new banner-variant config.
- `src/app/screens/design-system/DesignSystemPage.tsx` now renders the Products offer-card specimen with a compact dropdown that switches between the banner color variants instead of listing every color block separately.
- `src/app/registry/componentRegistry.ts` now records the Products offer-card as a family/light-tone variant component rather than a single green implementation.

Latest Products offer-banner chevron refinement:

- `src/app/components/products/ProductOfferCard.tsx` now owns the requested Products banner-card structure: centered vertical chevron SVG background, fixed `100px` right image column, and text aligned to the remaining left content area.
- The Products offer-card text area now fills horizontally up to `16px` before the right image column instead of staying in a narrower fixed column.
- The Products offer-card title now uses `22px` bold white typography clamped to 2 lines, while the subtitle uses `18px` regular white typography clamped to 3 lines with an `8px` gap from the title.
- `src/app/config/productsMenuConfig.ts` now replaces lorem ipsum in Products offers with banking-focused copy sized to fit the current banner-card layout.
- `src/app/screens/payments/PaymentsScreen.tsx` was reverted to its previous Payments hero-card implementation because the chevron/banner brief belonged to Products, not Payments.
- `src/app/registry/componentRegistry.ts` now records the updated Products offer-card contract, including the chevron layout and `100px` image column.

Latest Payments OTHER shortcut carousel refinement:

- `src/app/screens/payments/PaymentsScreen.tsx` now renders the Payments `OTHER` shortcuts inside a horizontally scrollable rail instead of a static 4-item row.
- `src/app/components/payments/PaymentOtherShortcut.tsx` now uses a fixed `74px` shortcut width and clamps labels to a maximum of 2 lines at `15px` line-height, so labels like `CREATE QR CODE` and `EXCHANGE RATES` no longer spill to a third row.
- `src/app/registry/componentRegistry.ts` now records the `payments.other-shortcut` contract as a carousel-ready shortcut item with fixed width and 2-line label behavior.
- `npm run build` passed after the Payments OTHER carousel refinement on 2026-05-28; Vite still emits the known chunk-size warning.

Latest Account Details info-field component extraction:

- `src/app/components/accounts/AccountDetailsInfoField.tsx` was added as the dedicated Account Details reusable field component, with an `80px` row height, `4px` title-to-subtitle gap, 16px regular title, 16px bold subtitle, and optional trailing-icon variant.
- `src/app/screens/accounts/AccountDetailsInfoScreen.tsx` now uses `AccountDetailsInfoField` for the account-number/copy row and all default title/subtitle balance fields, with `0px` external gap between rows.
- `src/app/registry/componentRegistry.ts` and `src/app/screens/design-system/DesignSystemPage.tsx` now catalog and demonstrate `accounts.details-info-field`, including the default and with-icon variants.
- `npm run build` passed after the Account Details info-field extraction on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed for the touched Account Details component files; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the first Account Details rows compute to `80px` height, title `16px/400/normal`, subtitle `16px/700/normal`, text color `rgb(38, 38, 38)`, and variant markers `with-icon` / `default`.

Latest account transaction data enrichment:

- `src/data/accountDetails.ts` now has country-specific merchant/counterparty profiles for all PI countries (`RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `SI`) covering current-account payments, card-linked card payments, incoming transfers, account payments, fees, ATM, FX, wallet, investments, taxes, home, education, children, healthcare, insurance, shopping, groceries, lifestyle, leisure, cash, internal transfers, excluded and uncategorized PFM cases.
- Current-account transaction profiles are now distinct per current account instead of reusing the savings profile, so each current account shows different demo transactions.
- Saving accounts and term deposits now use a transfer-only mock profile: only own-account transfers in/out, no merchant/card/interest/round-up rows.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now requests Account Detail transactions in the active country currency, keeping account transaction display aligned with country-local demo reporting.
- `src/data/spendingAnalytics.ts` keeps internal own-account transfers visible in Account Detail but excludes `Internal` PFM transactions from Spending inflow/outflow totals and Money Out / Money In category lists, so savings movements do not appear as real expenses.
- FX demo scale in `src/data/accountDetails.ts` now matches the existing `src/data/exchangeRates.ts` reference table values for deterministic local-currency reporting.
- `npm run build` and `npm run build -- --mode development` passed after the enrichment on 2026-05-28; Vite still emits the known chunk-size warning.
- PFM coverage audit confirmed all 23 categories from `src/data/pfmCategories.ts` are represented in Account Detail mock data; browser smoke on `http://localhost:5175` confirmed RO Primary Account, the second current account, and Emergency Fund render the expected richer/current-only/transfer-only transaction profiles.

Latest AccountSearchBar icon-size contract fix:

- `src/app/components/accounts/AccountSearchBar.tsx` now uses an icon-driven `32px` height with zero vertical padding, explicit `32x32` search/filter/clear SVG rendering, `32px` icon slots, and a `32px` input height.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now record the AccountSearchBar contract as auto-height from the standard 32px icons instead of a separate 36px wrapper.
- `npm run build` passed after the AccountSearchBar icon-size fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed CSS heights for the search bar root, search icon slot, filter button, search SVG, filter SVG, and input all compute to `32px`; measured boxes are scaled by the phone preview transform.

Latest AccountSearchBar specimen cleanup:

- `src/app/components/accounts/AccountSearchBar.tsx` now renders the search, filter, and clear glyphs at `20x20` inside the existing `32x32` icon slots, so the component matches the intended `32px` hit area + `20px` SVG contract instead of drawing oversized icons.
- `src/app/screens/design-system/DesignSystemPage.tsx` now renders the `AccountSearchBar` specimen without the previous artificial `px-[16px]` wrapper padding, removing the false white lateral margins around the bar in Design System Inventory.
- `npm run build` passed on 2026-06-01 after the specimen/icon cleanup; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` confirmed the Components inventory now shows `AccountSearchBar` with no extra lateral specimen padding and inspector overlays reporting `20x20` search/filter glyphs inside `32x32` icon slots.

Latest Messages mailbox-tabs extraction:

- `src/app/components/messages/MessagesMailboxTabs.tsx` is now the dedicated reusable component for the `Inbox / Outbox` switcher, preserving the `48px` tab rail, active leading dot, optional badge pill, muted inactive state, and `2px` active underline.
- `src/app/screens/messages/MessagesScreen.tsx` no longer keeps mailbox tabs as local screen-only JSX; the runtime screen now consumes `MessagesMailboxTabs`.
- `src/app/components/templates/TemplateCodePreviews.tsx` now reuses the same `MessagesMailboxTabs` component for Messages-family template previews, so runtime and template inventory no longer drift.
- `src/app/screens/design-system/DesignSystemPage.tsx`, `src/app/registry/componentRegistry.ts`, and `src/app/state/demoTypes.ts` now catalog `MessagesMailboxTabs` as a first-class component in the Design System inventory / AI reuse map.
- `npm run build` passed on 2026-06-01 after the mailbox-tab extraction; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:3001` confirmed the active app can still open `Messages` and switch from `Inbox` to `Outbox` after the extraction, rendering the correct Outbox rows.

Latest Account Detail carousel shadow refinement:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now gives the horizontal carousel a `34px` bottom shadow buffer while pulling the carousel indicator back up by `16px`, so card shadows are not clipped by the scrollport and the surrounding gray surface keeps the same visual rhythm.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a softer `0 16px 32px / 0.08` plus `0 3px 10px / 0.05` layered shadow, replacing the harder shorter shadow.
- `npm run build` passed after the account-carousel shadow refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the carousel has `padding-bottom: 34px`, the available room below the active card is `29px` in the scaled preview, the indicator remains at the prior visual y-position, and the action bar still starts at the same y-position.

Latest Account Detail carousel depth refinement:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now keeps the focused account card at the full `311x197` size while inactive neighbor cards render at a `165px` visual height, preserving a `16px` top and bottom inset relative to the active card.
- Inactive carousel cards now transition their vertical scale, opacity, and filter as focus changes, so click and mouse-drag/swipe movement has a smoother handoff between accounts.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a 300ms ease-out transition for opacity/shadow changes so the reusable card cooperates with the carousel focus animation.
- `npm run build` passed after the account-carousel depth refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the active card reports `data-account-carousel-visual-height="197"` and inactive cards report `165`; measured inside the scaled phone preview this is `169px` active vs `142px` inactive. Clicking `Savings Account` and mouse-dragging to `Emergency Fund` both swapped the full-height active state correctly.

Latest Messages scroll and header refinement:

- `src/app/screens/messages/MessagesScreen.tsx` now uses the shared `PageHeader` with safe-area handling and scroll-derived collapsed title progress instead of a local `MessagesTopChrome`.
- `src/app/config/messagesConfig.ts` now includes extended mock data for Messages: 16 Inbox rows and 10 Outbox rows, so both mailboxes can be scrolled and tested inside the phone frame.
- `src/app/registry/componentRegistry.ts`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record the shared-header and scrollable extended-message behavior.
- `npm run build` passed after the Messages scroll/header refinement on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the Messages scroll/header refinement; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed Messages opens with the shared sticky header, Inbox has 16 rows and `scrollHeight=1664` / `clientHeight=812`, scrolling sets the Messages page `scrollTop=420` and the collapsed centered title opacity to `1`, and Outbox has extended rows with `scrollHeight=1184` / `clientHeight=812`.

Latest BottomNavigation Figma contract fix:

- `src/app/components/BottomNavigation.tsx` now uses a fixed `375x54` bottom navigation contract with 24px side padding, 32px icon slots, a 24x2 active indicator, zero gap between active bar/icon/label, and 14px labels with `15px` line-height.
- `src/app/registry/componentRegistry.ts` and `src/app/screens/design-system/DesignSystemPage.tsx` now document the bottom navigation sizing, icon, active-bar, and label contract.
- `npm run build` passed after the BottomNavigation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the first BottomNavigation code/doc update; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the runtime BottomNavigation computes to `width=375px`, `height=54px`, label `font-size=14px`, label `line-height=15px`, active bar `24x2`, icon slot `32x32`, `0px` active-bar-to-icon gap, and `0px` icon-to-label gap. Visual boxes are scaled by the phone preview transform, but computed CSS values match the Figma contract.

Latest Transaction Detail PFM category pill fix:

- `src/data/paymentFlow.ts` now exposes the normalized transaction PFM category, display label, color token, and original subcategory on `TransactionDetailData`.
- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` now renders the top Transaction Detail category pill from the real PFM category with `PfmCategoryIcon`, tokenized category color, and `data-transaction-pfm-category` evidence instead of showing the subcategory with a generic landmark icon.
- `src/app/registry/componentRegistry.ts` now records that Transaction Detail uses the shared PFM icon/category mapping.
- `npm run build` passed after the Transaction Detail PFM category pill fix on 2026-05-28; Vite still emits the known chunk-size warning.
- Fresh preview verification on `http://127.0.0.1:5177` confirmed the Enel Energie transaction opens Transaction Detail with pill text `UTILITIES`, `data-transaction-pfm-category="Utilities"`, subcategory evidence `Utility bill`, and SVG rendering from the shared PFM icon component.

Latest Account Options icon and header fix:

- `src/app/components/icons/AppIcon.tsx` now includes the supplied custom Account Options SVGs for Share account info, Push notifications, Account statement, Create paycode, Change account name, and the 32x32 chevron link.
- `src/app/screens/accounts/AccountOptionsScreen.tsx` now uses those registry icons instead of lucide fallbacks, with 32x32 leading/trailing icon slots.
- Account Options now uses the same scroll-container `PageHeader` pattern as detail screens, with safe area handled by the header and collapsed centered title progress derived from page scroll.
- `npm run build` passed after the Account Options icon/header fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the fix; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser verification on `http://localhost:5175` confirmed the Account Options page renders the five supplied option icons and chevron SVGs through `AppIcon`, with 32px row slots and the standard `PageHeader` title setup.

Latest Account Detail month-divider spacing fix:

- `src/app/screens/accounts/AccountDetailScreen.tsx` now uses a `16px` rule between each month divider and the next transaction row, plus `16px` between the previous transaction block and the next month divider.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now document the month-divider spacing contract alongside the AccountTransactionRow specimen.
- `npm run build` passed after the month-divider spacing fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the spacing fix; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser visual verification on `http://localhost:5175` confirmed Account Detail renders with the updated month-divider spacing rhythm.

Latest AccountTransactionRow spacing and line-height fix:

- `src/app/components/accounts/AccountTransactionRow.tsx` now follows the requested Figma contract: transaction label line-height `18px`, amount block line-height `22px`, `4px` label-to-amount gap, day line-height `20px`, `2px` day/month gap, month line-height `15px`, and `16px` date-to-icon gap.
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` now document the updated AccountTransactionRow contract.
- `npm run build` passed after the row spacing fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed the runtime Account Detail row computes to label `18px`, amount `22px`, details gap `4px`, day `20px`, date gap `2px`, month `15px`, and left date/icon `column-gap: 16px`; visual pixel distances are scaled by the phone preview transform.

Latest PFM icon glyph expansion:

- `src/app/components/pfm/PfmCategoryIcon.tsx` now renders real 20x20 SVG glyphs inside the existing 32x32 category icon container for `Taxes and Penalties`, `Income`, `Home`, `Utilities`, `Transportation`, `Children`, `Healthcare`, `Shopping`, `Lifestyle`, `Education`, `Leisure time`, `Investments`, `Uncategorized`, `Groceries`, `Exclude from budget`, `Insurance`, `Finance`, `Wallet`, and `Transfers`, using the path data supplied by the user.
- `Exclude from budget` preserves its source `0 0 21 20` viewBox while still fitting the app's 20px glyph contract inside the 32px container.
- `src/data/pfmCategories.ts` now resolves source/Figma category labels case-insensitively, including aliases such as `Taxes and fines`, `Leisure personal care`, `School and education`, `Transport and utility`, `Uncategorized expenses`, `Cars and transportation`, `Health care`, and the user-supplied `Finacial` typo.
- `src/styles/theme.css` now aligns the supplied PFM category color tokens with the SVG fills for the expanded glyph set.
- `npm run build` passed after expanding the PFM glyphs on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed visible Spending icons for `Wallet` and `Income`, plus Account Detail icons for `Income` and `Taxes and Penalties`, render as SVG glyphs sourced from `screenshots/PFM-icons.svg`; measured browser boxes are scaled by the phone preview transform, matching the intended 32px container / 20px glyph contract.

Latest Spending PFM aggregation implementation:

- `src/data/pfmCategories.ts` now defines the first-pass PFM taxonomy, category aliases, color-token references, fallback initials, and source traceability to `screenshots/PFM-icons.svg`.
- `src/styles/theme.css` now exposes PFM category color variables for both light and dark demo themes.
- `src/data/exchangeRates.ts` now centralizes deterministic demo FX conversion into each country's local reporting currency using a 2026-05-28 reference table.
- `src/data/accountDetails.ts` now maps every generated account transaction to `pfmCategory` and `pfmSubcategory`; transaction detail now uses those PFM fields instead of treating the category as a free-form label.
- `src/data/spendingAnalytics.ts` now aggregates Account Detail transaction profiles into a monthly Spending summary with income total, spending total, cash withdrawal total, Money Out category totals, and Money In category totals.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now renders April 2026 chart totals from the aggregation, removes the fake `Transaction Details` row, and shows PFM-category Money Out plus Money In sections.
- `src/app/components/accounts/AccountTransactionRow.tsx` now renders the shared `PfmCategoryIcon` for each transaction category instead of the generic transfer icon.
- `src/app/registry/componentRegistry.ts`, `src/app/registry/flowRegistry.ts`, `src/app/registry/aiCatalog.ts`, `docs/handoff/state-of-the-world.md`, and `docs/platform-capability-map/README.md` now record the Spending/PFM aggregation behavior.
- `npm run build` passed after the Spending PFM aggregation work on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed `My Spendings` shows April 2026, Outflow `1.438,43 RON`, Money Out categories (`Groceries`, `Utilities`, `Transportation`, `Wallet`, `Lifestyle`, `Leisure time`, `FX`), Money In categories (`Income`, `Internal`, `Transfers`, `Investments`), PFM icon markers sourced from `screenshots/PFM-icons.svg`, and no fake `Transaction Details` row.

Latest AccountTransactionMonthDivider typography fix:

- `src/app/components/accounts/AccountTransactionMonthDivider.tsx` now follows the L3 card-label contract: 14px UniCredit bold uppercase with CSS `line-height: normal`.
- Divider left/month text now uses `var(--uc-text-muted)` / Primary Grey, while the right total uses `var(--uc-text)` / Primary K1 with right alignment.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the divider L3 contract in the AccountTransactionRow specimen.
- `npm run build` passed after the divider typography fix on 2026-05-28; Vite still emits the known chunk-size warning.
- In-app browser verification on `http://localhost:5175` confirmed `APRIL 2026` computes to `14px`, `700`, `line-height: normal`, `uppercase`, `rgb(102, 102, 102)`, and `5.683,92 RON` computes to `14px`, `700`, `line-height: normal`, `uppercase`, `rgb(38, 38, 38)`, `text-align: right`.

Latest AccountActionBar reuse fix:

- `src/app/components/accounts/AccountActionBar.tsx` now supports a configurable `items` API with 1-4 actions and page-level alignment (`start`, `center`, `end`, `between`) while preserving the existing 4-action Account Detail default.
- `src/app/screens/analytics/AnalyticsScreen.tsx` now renders `Card Transaction` through the shared `AccountActionBar` instead of local markup, so future action-bar label/icon changes propagate there too.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents AccountActionBar as a 1-4 item component and shows the one-item right-aligned `Card Transaction` variant.
- `src/app/state/demoTypes.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/aiCatalog.ts` now catalog `accounts.action-bar` as a reusable component used by Account Detail and Analytics.
- Browser verification on `http://localhost:5175` confirmed Analytics renders one AccountActionBar item with `justifyContent=flex-end`, `padding=0px 24px 18px 24px`, `fontSize=14px`, and `lineHeight=15px`; Account Detail still renders four items with `justifyContent=space-between`.
- `npm run build` passed after the AccountActionBar reuse fix on 2026-05-28; Vite still emits the known chunk-size warning.

Latest 10-template reconstruction pack:

- Added 10 more screenshot templates as real JSX code previews in `src/app/components/templates/TemplateCodePreviews.tsx`: `Language Selection` as Sign/PIN, `Generate Token`, `Message`, `New request with push`, `Panel` as account-selection sheet, `Apple pay`, `Transfer to new phone` as Successful payment, `Tutorial 1`, `Product selection`, and `RS - Travel Insurance`.
- The new templates share reusable primitives for phone surface, bottom CTA, home indicator, radio rows, form field rows, mini bottom navigation, media/device hero compositions, and code-native travel/card/tutorial visuals.
- `src/app/registry/templateRegistry.ts` now marks those 10 templates as `reconstructed-code`; `src/app/registry/componentRegistry.ts` and `src/app/registry/aiCatalog.ts` now reflect 18 code-backed templates total.
- Screenshot-to-template coverage check still passed after the new pack: `screenshots=30 registry=30`.
- `npm run build` passed after the 10-template pack on 2026-05-28; Vite still emits the known chunk-size warning.
- Raw color audits passed after the 10-template pack: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the 10-template pack; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates renders 30 cards and 18 code-backed templates; all 10 new templates select in `code` mode, show `Reconstructed code`, point to `src/app/components/templates/TemplateCodePreviews.tsx`, and render their expected screen text.

Latest AccountActionBar label annotation fix:

- `src/app/components/accounts/AccountActionBar.tsx` now renders action labels with explicit `15px` line-height instead of `leading-normal`, so labels such as `Details` no longer compute as a 21px-tall text box.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the AccountActionBar label contract as `14px regular / 15px line`.
- Browser verification on `http://localhost:5175` confirmed the runtime AccountActionBar labels render with `fontSize=14px`, `fontWeight=400`, and `lineHeight=15px`.
- `npm run build` passed after the AccountActionBar label fix on 2026-05-28; Vite still emits the known chunk-size warning.

Latest New payment sheet spacing annotations:

- `src/app/components/BottomSheet.tsx` now uses uniform `16px` sheet padding for the New payment modal shell.
- `src/app/components/payments/NewPaymentDiscoverBanner.tsx` now uses uniform `16px` banner padding, a `4px` title/subtitle gap, and CSS `line-height: normal` for the banner title and subtitle.
- Browser verification on `http://127.0.0.1:5175` confirmed the New payment dialog padding is `16px` on all sides, the discover banner padding is `16px` on all sides, the subtitle margin-top is `4px`, and the subtitle line-height computes to `normal`.
- `npm run build` passed after the sheet/banner annotation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the sheet/banner annotation fix; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest Payments shortcut annotation fix:

- `src/app/components/payments/PaymentOtherShortcut.tsx` now applies the requested 15px label box and 15px line-height to the `CARD REPAYMENT` shortcut label only.
- The change is scoped to `card-repayment` so multi-line shortcuts such as `CREATE QR CODE` keep their existing layout.
- Browser verification on `http://127.0.0.1:5175` confirmed the `CARD REPAYMENT` label computes to `cssHeight=15px` and `lineHeight=15px`.
- `npm run build` passed after the annotation fix on 2026-05-28; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the annotation fix; Git only reported the normal LF-to-CRLF warnings on Windows.

Latest feedback status template reconstruction:

- Five additional screenshot templates were reconstructed as real JSX code previews: `Informative`, `Pending`, `Success to be`, `Error to be`, and `Warning to be`.
- `src/app/components/templates/TemplateCodePreviews.tsx` now includes a reusable feedback status screen primitive with help-only top chrome, centered status icon, lorem body section, and fixed bottom `PrimaryButton` CTA.
- The five feedback templates share the same parameterized implementation and differ only by title, status icon treatment, and semantic status color.
- `src/app/registry/templateRegistry.ts` now marks those five templates as `reconstructed-code` with code preview ids: `informative-status`, `pending-status`, `success-status`, `error-status`, and `warning-status`.
- That step brought `src/app/registry/componentRegistry.ts` and `src/app/registry/aiCatalog.ts` to 8 code-backed templates total: template 52, template 67, Product, plus the five feedback status templates.
- Screenshot-to-template coverage check still passed after the feedback pack: `screenshots=30 registry=30`.
- `npm run build` passed after the feedback template pack on 2026-05-28; Vite still emits the known chunk-size warning.
- Raw color audits passed after the feedback template pack: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the feedback template pack; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification for that step passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates rendered 30 cards and 8 code-backed templates; the five new feedback templates were present, each selected in reconstructed-code mode, showed the expected title/status body/`Ok, got it` CTA, and pointed to `src/app/components/templates/TemplateCodePreviews.tsx`.

Latest Messages runtime implementation:

- `src/app/screens/messages/MessagesScreen.tsx` was added as the real runtime Messages screen reconstructed from `screenshots/52.png` / template 52.
- `src/app/config/messagesConfig.ts` now exposes a country-addressable mock Messages config for all PI countries (`RO`, `CZ`, `SK`, `HU`, `RS`, `BA`, `SI`), currently sharing the same baseline Inbox/Outbox data until country-specific copy is supplied.
- `src/app/App.tsx`, `NavigationContext`, and `useNavigation` now include the `messages` runtime screen.
- Top-level runtime headers now route their Messages icon to the new screen from Home, Analytics / Spending, Payments, Products, and More.
- `TemplateCodePreviews.tsx` now reuses the same message config data as the runtime Messages screen for template 52 continuity.
- `screenRegistry.ts`, `componentRegistry.ts`, `flowRegistry.ts`, `templateRegistry.ts`, `demoTypes.ts`, and `aiCatalog.ts` now catalog `pi.messages.overview`, `messages.inbox-list`, and `pi.header-to-messages`.
- `npm run build` passed on 2026-05-28 after the Messages runtime implementation; Vite still emits the known chunk-size warning.
- Raw color audits passed after the Messages runtime implementation: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the Messages runtime implementation; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: RO Home -> Messages opens the reconstructed screen with `Messages`, `Inbox`, `Outbox`, `2025`, five Inbox rows, and `NEW` badges; Back returns to Home; switching to Czech Republic and logging in again still exposes the Messages icon and opens the same screen; Outbox and search filter work, with `AUG` narrowing Outbox to one row and showing the clear-results action.

Previous reconstructed template-code preview implementation:

- `src/app/components/templates/TemplateCodePreviews.tsx` was added as the real-code renderer for screenshot templates, with reusable phone surface, static status chrome, top header, tab bar, search strip, list rows, dot menu, standing-order rows, and product bottom-sheet composition.
- `template-52` now renders the Messages / Inbox screen as JSX by default in Design System Templates, while keeping `screenshots/52.png` as source evidence.
- `template-67` now renders the Recurrent payment / Standing orders screen as JSX, reusing the same header, tab, search, section-title, and row/action patterns as template 52.
- `template-product` now renders the Product bottom-sheet as JSX with overlay, rounded sheet, media placeholder, close action, body copy, and the existing `PrimaryButton`.
- `src/app/registry/templateRegistry.ts`, `componentRegistry.ts`, `demoTypes.ts`, and `aiCatalog.ts` now mark reconstructed template coverage explicitly for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now makes the Templates grid more compact (`190px` cards), bounds the template-card list inside an internal scroller, marks code-backed templates, and opens implemented templates in `code` mode with a `source` toggle for PNG comparison.
- `npm run build` passed after the template reconstruction work on 2026-05-27; Vite still emits the known chunk-size warning.
- Screenshot-to-template coverage check passed after the template work: `screenshots=30 registry=30`.
- Raw color audits passed after the template work: no raw hex under `src/app` outside `colorRegistry.ts`, and no direct numeric `rgb()` / `rgba()` under `src/app` or `src/styles`.
- `git diff --check` passed after the template work; Git only reported the normal LF-to-CRLF warnings on Windows.
- In-app browser smoke verification passed on `http://127.0.0.1:5175`: Design System Inventory -> Templates renders 30 compact cards, 3 code-backed templates, template 52 selected by default in `code` mode at `377 x 814`, code/source toggles are present, the card height is `190px`, thumbnail mode has no focusable nested controls, and selecting template 67 and Product keeps `code` mode with their expected reconstructed text visible.

Latest Products bottom-navigation overlap fix:

- `src/app/screens/products/ProductsScreen.tsx` now gives the Products scroll content a base stacking layer and the Products bottom navigation wrapper an explicit `z-20` layer.
- This prevents Product menu card text/illustrations with internal `z-index` from painting above the bottom navigation while the Products page is scrolled.
- `npm run build` passed after the fix on 2026-05-27; Vite still emits the known chunk-size warning.
- `git diff --check` passed after the fix; Git only reported the normal LF-to-CRLF warning on Windows.
- In-app browser verification passed on `http://localhost:5175`: after navigating to Products and scrolling down, `Investments and savings` no longer overlaps the bottom nav; measured overlap is `0`, the nav background is opaque white, and `elementFromPoint` over the nav resolves to nav elements rather than product-card text.

Latest Design System Colors and Light/Dark implementation:

- `src/app/registry/colorRegistry.ts` was added as the canonical source-level color registry derived from `screenshots/Colors.svg`, with palette groups, source token names, light/dark hex pairs, usage notes, CSS-variable names, and an app color audit map.
- `src/app/screens/design-system/DesignSystemPage.tsx` now has a top-level `Colors` tab next to `Components`, `Templates`, and `Icons`.
- The `Colors` tab renders compact palette filters, source counts, light/dark swatches, copy-hex buttons with visible `Copied` feedback, and an app color map showing how legacy/runtime colors map into the DS palette.
- `src/styles/theme.css` now defines light/dark UniCredit theme variables under `data-uc-theme`, including app background, surfaces, text, icons, borders, action teal, brand red, overlay, shadow, and static black/white tokens.
- `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx` now carry `themeMode`, `setThemeMode`, and `toggleThemeMode`, defaulting to light.
- `src/app/App.tsx` applies `data-uc-theme` to the app shell and switches normal active-app status-bar treatment for dark theme.
- `src/app/components/demo/DemoTopBar.tsx` and `src/app/components/demo/DemoFeatureSidePanel.tsx` now expose a Light/Dark appearance switch so theme mode can be changed from both the top control plane and settings panel.
- Active app screens and shared components were tokenized away from raw runtime colors; reusable app color styling now resolves through DS CSS variables, with images/photos treated as asset exceptions.
- `npm run build` passed after the color registry, Colors tab, and dark theme implementation on 2026-05-27; Vite still emits the known chunk-size warning.
- Color audits passed: no raw hex remains under `src/app` outside `src/app/registry/colorRegistry.ts`, no direct numeric `rgb()` / `rgba()` remains under `src/app` or `src/styles`, and Tailwind color-class audit no longer reports palette classes beyond non-color layout utility matches.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Colors`, confirmed the color map renders, confirmed copy-button feedback changes to `Copied`, switched to `Dark`, and confirmed `data-uc-theme="dark"` plus dark CSS variables on the live root.

Latest Analytics / My Spendings implementation:

- `src/app/screens/analytics/AnalyticsScreen.tsx` was added as the bottom-nav `Spending` tab screen, modeled after the supplied `screenshots/Analytics.jpg` reference.
- `src/app/App.tsx`, `NavigationContext`, `useNavigation`, Home, Payments, Products, and More now route the bottom-nav Analytics/Spending tab to the new screen.
- The Analytics header now uses the same shared `HeaderActionRail` / `HeaderActionButton` pattern as Payments and Products, with aligned 28px top title typography.
- `Card Transaction` now reuses the existing `add-money` `AppIcon` family from Account Details instead of a hand-drawn plus.
- The cash prompt now reuses `NewPaymentDiscoverBanner`, with a configurable margin so the Payments bottom-sheet banner and Analytics banner share the same component.
- `AccountTransactionRow` now supports `showDate={false}`; Analytics uses that same transaction-row component for the `Money Out` row instead of a custom icon/amount layout.
- `TOTAL CASH WITHDRAWAL` now reuses `AccountTransactionMonthDivider`, matching Account Detail transaction separators.
- Analytics typography was aligned to the supplied contracts: `Data For` 16px, `March 2025` 28px, chart labels/values 14px, and `Money Out` 24px.
- Analytics spacing now keeps `16px` between the `TOTAL CASH WITHDRAWAL` divider line and `Money Out`, and `16px` between `Money Out` and the `Transaction Details` row.
- Analytics month selector now keeps a `4px` gap between `Data For` and the `March 2025` row.
- Analytics chart labels were refined: the old `Credit card payments` split was removed, `Booked transactions` was replaced by `Outflow`, the black spendings bar is filled to its rounded top, the inflow amount block is left-aligned above the dashed line, `INCOMES` right-aligns to the blue bar, and `SPENDINGS` left-aligns to the black bar.
- Analytics chart label spacing now keeps `16px` logical distance from the dashed baseline to `INCOMES` / `SPENDINGS`, and `8px` logical distance from those labels to the swipe indicator dots.
- `src/app/state/demoTypes.ts`, `screenRegistry.ts`, `flowRegistry.ts`, `componentRegistry.ts`, and `demoConfig.ts` now catalog `pi.analytics.overview`, `analytics.spendings`, and `pi.home-to-analytics`.
- Bottom navigation English labels now render the Analytics tab as `Spending`, matching the supplied reference.
- `npm run build` passed after the Analytics implementation on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: login -> `Spending` opens `My Spendings`; header actions are present; the reused cash banner renders; the reused transaction row renders `Transaction Details` / `- 405.000,00 RON` without the date column; computed styles confirm the requested 4px month-selector gap, 16px/28px/14px/24px typography, the reused divider component, the `Outflow` chart label, left-aligned inflow amount, the requested `INCOMES` / `SPENDINGS` bar alignment, `16px` logical label distance from the dashed chart baseline, and `8px` logical distance from the labels to the swipe indicator dots.

Latest Products carousel and spacing fix:

- `src/app/screens/products/ProductsScreen.tsx` now gives the Products offers carousel the same interaction model as the Account Detail carousel: pointer/mouse drag, click suppression during drag, nearest-card snapping, edge-aware snap math, and a trailing spacer for the final peek.
- Products vertical spacing is now normalized to `16px` between the top tab and `OFFERS FOR YOU`, between the `OFFERS FOR YOU` divider and the carousel card, between the carousel and `OUR PRODUCTS`, and between the `OUR PRODUCTS` divider and product card grid.
- Product menu card grid spacing now uses a consistent `16px` horizontal and vertical gap across all rows.
- ShopSmart content uses the same Products carousel and spacing rules as Banking.

Latest icon registry and Design System Inventory implementation:

- `src/app/components/icons/AppIcon.tsx` and `src/app/components/icons/index.ts` now define the single platform icon repository.
- `AppIcon` is the canonical runtime component for reusable UI icons; duplicate SVGs were consolidated into one named icon entry.
- Design System Inventory now has a top-level `Icons` tab next to `Components` and `Templates`.
- The Icons tab renders all mapped icons with name, category, source, default size, viewBox/source, usage, and deduplication notes.
- The Icons tab also documents explicit audit boundaries for SVGs that intentionally remain outside the icon registry: brand logos, status/device chrome, decorative motion/texture/shadow SVGs, and vendored UI primitives.
- Reusable icons in headers, navigation, payments, products, account/search/actions, contacts, panels, Prime, Co-Apping, demo topbar controls, and radio controls now route through `AppIcon`.
- Direct app-level `lucide-react` usage is centralized behind `AppIcon`; remaining direct lucide imports are limited to `AppIcon.tsx` plus vendored `src/app/components/ui/**` primitives.

Latest Products offer card component fix:

- `src/app/components/products/ProductOfferCard.tsx` was added as the reusable Products offer carousel card.
- `src/app/screens/products/ProductsScreen.tsx` now renders offers through `ProductOfferCard` instead of keeping the offer card inline.
- The offer card now matches the requested contract: `327px` width, `157px` height, white title `24px` bold `700`, white subtitle `16px` regular `400`, and a `206px` flex column text stack with `8px` gap.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `products.offer-card` for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now includes a Products offer card specimen in the component inventory.

Latest Design System Templates inventory implementation:

- `src/app/registry/templateRegistry.ts` was added as the explicit source-level template registry for all screenshots in `screenshots/`.
- The registry currently represents all 30 screenshot files with template id, name, source path, dimensions, format, imported image URL, and related reusable components, plus 20 code-only templates derived from active runtime patterns.
- `src/app/screens/design-system/DesignSystemPage.tsx` now has a top-level `Components` / `Templates` tab switch.
- The `Templates` tab renders selectable screenshot cards and a selected-template preview panel with source path, size, format, registry id, and reusable component badges.
- The existing component inventory remains under the `Components` tab.
- The Design System overview count now includes `Screenshot templates`.

Latest New payment bottom-sheet component refinement:

- `src/app/components/payments/NewPaymentActionListItem.tsx` was added as the reusable New payment action row component.
- The row component now owns the supplied Domestic payment, Foreign payment, Templates, and right-chevron SVGs.
- Each action row now has a logical `80px` height and renders rows one after another with no vertical gap.
- The action title now matches the requested UniCredit `18px`, bold `700`, `0.3px` letter-spacing, `#262626`, and `liga` / `clig` off contract.
- The action subtitle now matches the requested UniCredit `14px`, regular `400`, `#262626` contract.
- `src/app/components/payments/NewPaymentDiscoverBanner.tsx` was added as the reusable teal Discover banner component.
- The banner now owns the supplied white 20x20 info icon and 12x12 close icon SVGs.
- The banner title now uses UniCredit `18px`, bold `700`, white; the banner subtitle uses UniCredit `18px`, regular `400`, white.
- `src/app/components/BottomSheet.tsx` now gives the title/header block a `24px` gap to the first New payment action row.
- `src/app/screens/payments/PaymentsScreen.tsx` now composes the New payment sheet from the reusable action-row and Discover-banner components.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `payments.new-payment-action` and `payments.new-payment-discover-banner` for AI catalog continuity.

Latest top-level header action alignment fix:

- `src/app/components/HeaderActionIcons.tsx` now exposes `HeaderActionRail`, a shared fixed 32px action row used by top-level app headers.
- The shared header action icon set now includes `logout`, so More no longer keeps a separate inline logout/profile/messages implementation.
- Home now renders the amount visibility toggle first, then `Profile`, then `Messages`, matching the Home-specific header order.
- Payments, Products, and More now render their header actions through `HeaderActionRail`.
- Browser verification confirmed fixed top action slots per page; Home uses `Hide/Show amounts`, `Profile`, `Messages`, while Payments/Products/More keep their page-specific header actions inside the same rail.

Latest Payments `OTHER` shortcut component implementation:

- `src/app/components/payments/PaymentOtherShortcut.tsx` was added as the reusable single shortcut action used by the Payments `OTHER` section.
- The component now owns the supplied SVGs for `CREATE QR CODE`, `TEMPLATES`, `CARD REPAYMENT`, and `EXCHANGE RATES`.
- Each shortcut icon is rendered inside a stable `32px` by `32px` non-shrinking icon slot; the QR icon keeps its supplied `22px` by `28px` SVG size, and the other three icons keep `32px` by `32px`.
- The shortcut labels now match the supplied contract: UniCredit, `14px`, bold `700`, centered, `#262626`, normal line-height, `1px` letter spacing, and `liga` / `clig` disabled.
- `src/app/screens/payments/PaymentsScreen.tsx` now renders `PaymentOtherShortcut` for all configured country menu items instead of keeping shortcut icon layout inline.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `payments.other-shortcut` for AI catalog continuity.

Latest Transaction Detail and Domestic Payment flow implementation:

- `src/data/paymentFlow.ts` was added as the mock adapter for Transaction Detail data, blank domestic-payment drafts, redo-payment drafts, country bank names/codes, and formatted payment amounts.
- `src/app/screens/payments/DomesticPaymentFlowScreens.tsx` was added with five screenshot-inspired runtime screens: Transaction Detail, Domestic payment create, Review data, Sign, and Successful payment.
- `src/app/components/accounts/AccountTransactionRow.tsx` now supports click handling, and `src/app/screens/accounts/AccountDetailScreen.tsx` sends the selected transaction/product into the new flow.
- Transaction rows now open Transaction Detail; the `Redo payment` action creates a domestic-payment draft prefilled from the selected transaction.
- `src/app/screens/payments/PaymentsScreen.tsx` now turns the New payment bottom-sheet `DOMESTIC PAYMENT` action into a real entry point instead of a placeholder.
- Payments/New payment/Domestic payment opens the Domestic payment create screen with empty beneficiary/payment fields and the selected payer account context.
- Domestic payment now continues through Review data, Sign, and Successful payment; the success confirmation returns to Payments.
- `src/app/App.tsx`, navigation types, screen registry, component registry, flow registry, and feature metadata now include the new transaction/payment screens and the `pi.new-domestic-payment` / `pi.transaction-redo-payment` flows.
- The supplied screenshots are cataloged in `src/app/registry/screenRegistry.ts`: `Transaction detail.png`, `Payment.png`, `Review.png`, `Language Selection.png` for Sign, and `Transfer to new phone.png` for Successful payment.

Latest Dynamic Island visual fix:

- `src/app/components/DynamicIsland.tsx` no longer applies a drop shadow to the black Dynamic Island shape.
- The component keeps the same size, position, radius, and sensor layout, but now matches the real device treatment more closely.

Latest transaction search implementation:

- `src/app/components/accounts/AccountSearchBar.tsx` is now an interactive search input while preserving the existing 36px search-bar contract.
- Typing a query replaces the right-side filters icon with the supplied 20x20 clear-results icon.
- Clicking clear resets the query and restores the filters icon.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now filters the current account's mock transactions by label, details, category, status, date/month, and formatted amount.
- Activating the search input scrolls the Account Detail page so the sticky search area moves to the top-list position under the collapsed account header.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `accounts.transaction-search` for AI catalog continuity.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents both empty and active search-bar states.

Latest amount visibility implementation:

- `src/app/components/AmountVisibilityButton.tsx` was added as the reusable hide/show button; visible state keeps the existing hide icon, hidden state renders the supplied 20x20 show icon.
- `src/app/state/demoTypes.ts` and `src/app/state/demoStore.tsx` now carry `amountsHidden`, `toggleAmountsHidden`, and `setAmountsHidden`, defaulting to visible amounts.
- `src/app/utils/amountPrivacy.ts` centralizes masking to `****` / `.**` or `,**` while preserving currency display.
- Homepage totals and product-category account/card/product amounts now mask when `amountsHidden` is enabled.
- Account Detail balance carousel and Account Details info money fields now keep the same hidden state while navigating.
- Transaction rows and transaction monthly totals remain visible intentionally; amount privacy applies to account/card/product balances, not transaction history.
- `src/app/registry/componentRegistry.ts` now includes `home.amount-visibility-toggle` for AI catalog continuity.

Recent Products card component fix:

- `src/app/components/products/ProductMenuCard.tsx` was added as the reusable Products menu card component.
- The Account, Cards, Mortgages and loans, Insurance, and Investments and savings cards now share the same component and differ only by config-driven text, background color, and illustration.
- The card component now matches the supplied contract: `display: flex`, `width: 164px`, `height: 120px`, `padding: 16px`, `align-items: flex-start`, `gap: 10px`.
- The card label now matches the supplied text contract: UniCredit font, white, `18px`, bold `700`, normal line-height.
- `src/app/screens/products/ProductsScreen.tsx` now renders Products and ShopSmart grids through `ProductMenuCard` instead of inline card/layout code.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include `products.product-card` for AI catalog continuity.

Recent New payment bottom sheet implementation:

- `src/app/components/BottomSheet.tsx` was added as a reusable phone-frame modal shell with dim overlay, outside-tap close, Escape close, rounded white panel, and header close action.
- `src/app/config/paymentsMenuConfig.ts` now includes hero-sheet metadata for Payments primary cards, with placeholder actions such as `DOMESTIC PAYMENT`, `FOREIGN PAYMENT`, and `TEMPLATES AND BENEFICIARIES` until final per-menu overlays are supplied.
- Domestic-payment helper text is country-scoped in config; CZ renders the supplied example text `Send payment in CZK in CR`.
- `src/app/screens/payments/PaymentsScreen.tsx` now opens the New payment bottom sheet from the `New payment` hero card and renders the payment help banner with dismiss action.
- `src/app/state/demoTypes.ts` and `src/app/registry/componentRegistry.ts` now include the reusable bottom-sheet shell and New payment sheet component entries for AI catalog continuity.

Recent Products implementation:

- `src/app/config/productsMenuConfig.ts` was added as the country-scoped Products menu configuration.
- RO, CZ, SK, and HU now show the `Banking` / `ShopSmart` tab row; RS, BA, and SI render the same Products page without the tab split.
- `src/app/screens/products/ProductsScreen.tsx` was added with the `Products` header, offers carousel, banking product grid, other-solutions card, optional ShopSmart tab, and active Products bottom navigation.
- `src/app/App.tsx`, `src/app/contexts/NavigationContext.tsx`, `src/app/hooks/useNavigation.ts`, `src/app/screens/home/HomeScreen.tsx`, `src/app/screens/payments/PaymentsScreen.tsx`, and `src/app/screens/more/MoreScreen.tsx` now route the bottom-nav Products tab to the new screen.
- `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/flowRegistry.ts` now include the Products screen/component/flow entries for the AI catalog.

Recent Payments implementation:

- `src/app/config/paymentsMenuConfig.ts` was added as the country-scoped Payments menu configuration; all countries currently share the same baseline labels and action set.
- `src/app/screens/payments/PaymentsScreen.tsx` was added with the `Payments` header, four primary payment cards, `OTHER` shortcuts, and active Payments bottom navigation.
- `src/app/App.tsx`, `src/app/contexts/NavigationContext.tsx`, `src/app/screens/home/HomeScreen.tsx`, and `src/app/screens/more/MoreScreen.tsx` now route the bottom-nav Payments tab to the new screen.
- `src/app/state/demoTypes.ts`, `src/app/registry/screenRegistry.ts`, `src/app/registry/componentRegistry.ts`, and `src/app/registry/flowRegistry.ts` now include the Payments screen/component/flow entries for the AI catalog.
- `fx_newPaymentsHub` coverage now includes the Payments screen.

The `Details` action from Account Detail now opens a dedicated account details information screen modeled after the supplied screenshot.

Implementation change:

- `src/app/components/accounts/AccountActionBar.tsx` now accepts `onDetailsClick` and wires the `Details` action instead of rendering it as a dead button.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now sends the currently active carousel product to the `Details` action, so details follow the selected card.
- `src/app/screens/accounts/AccountDetailsInfoScreen.tsx` was added with an account details layout: account number, balances, blocked/reserved amount, overdraft, account title, offer, show-less action, connected card row, copy icon, share icon, and scroll-driven header collapse.
- `src/app/components/PageHeader.tsx` now supports a custom right-side action icon, safe-area ownership, and scroll progress for the centered collapsed title used by Account Details.
- `src/app/App.tsx` and the navigation/screen/component/flow registries now include the new `account-details-info` runtime screen.
- `src/data/products.ts` now exposes `isAccountDetailProduct`, the shared product filter for homepage-to-account-detail navigation.
- `src/app/screens/home/AccountSummary.tsx` now opens Account Detail for current accounts, saving accounts, term deposits, loans, and mortgages, while cards/investments remain outside this Account Detail path.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now builds its carousel from the homepage product categories instead of using only the first three account-like products.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now renders product names and account numbers from the product catalog in the carousel, preserving the existing card layout and hiding sub-account metadata.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now uses a `16px` carousel top padding so the rendered gap from the large `Accounts` title to the account card is `24px` logical.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now makes the search bar wrapper sticky below the `102px` account header, with `24px` top padding to preserve the requested header-to-search gap during scroll.
- `src/app/components/accounts/AccountBalanceCard.tsx` now renders the `Current balance` label and value in the same compact row with a `4px` logical gap.
- `src/app/components/accounts/AccountBalanceCard.tsx` now supports optional sub-account rendering; when shown, the IBAN-to-sub-account gap is `0`, and the metadata group has a `16px` logical gap to the balance group.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now disables sub-account metadata for `current_account` and `saving_account` cards.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents sub-account as optional and hides it in the current-account specimen.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now calculates snap positions per card index instead of relying on native `snap-start` alignment.
- middle account cards use centered scroll positions; first and last account cards use edge-aligned scroll positions.
- the carousel uses a trailing invisible spacer to give the browser enough real scroll width for the final right-side gutter.
- `src/app/screens/accounts/AccountOptionsScreen.tsx` now applies `scrollbar-hide` to its internal `overflow-y-auto` content area.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now gives the carousel explicit card sizing constants, 16px start gutter, snap padding, and drag state for pointer + desktop mouse interactions.
- account-card drag is handled on the card wrapper while the visual card content ignores pointer events, so dragging from the visible card surface works instead of being swallowed by inner text/card elements.
- `src/app/components/accounts/AccountBalanceCard.tsx` now uses a softer layered shadow and keeps optional click accessibility through `role="button"` + Enter/Space when reused as an interactive card.
- `src/app/screens/design-system/DesignSystemPage.tsx` now documents the softer account-card shadow in the component inventory.
- `src/app/components/demo/DemoShell.tsx` now uses a fixed viewport shell (`h-screen overflow-hidden`) and gives the remaining space to the preview surface.
- `src/app/components/MobileFrame.tsx` now measures its available container with `ResizeObserver`, computes a bounded fit scale, and reserves the scaled phone dimensions in layout before applying `transform`.
- `src/app/screens/design-system/DesignSystemPage.tsx` now owns its internal scroll area so the inventory page still works inside the fixed demo shell.
- `src/app/screens/accounts/AccountDetailScreen.tsx` now keeps the collapsing `Accounts` header as a top-level sticky child of the account-detail scroll container, instead of nesting it inside the finite gray account-card section.
- the empty account-detail fallback no longer double-applies the top safe-area padding before rendering the same sticky header.

Previous architecture foundation remains in place:

- root operating contract in `agents.md`;
- handoff mode rules under `docs/handoff/`;
- architecture foundation in `docs/architecture/PROJECT_MODEL.md`;
- typed project model in `src/app/registry/projectModel.ts`;
- release mapping in `src/app/registry/releaseRegistry.ts`;
- screen catalog in `src/app/registry/screenRegistry.ts`;
- flow catalog in `src/app/registry/flowRegistry.ts`;
- feature metadata expanded in `src/app/state/demoTypes.ts` and `src/app/registry/demoConfig.ts`;
- demo side panel upgraded from feature-only settings to a Control Panel in `src/app/components/demo/DemoFeatureSidePanel.tsx`;
- top bar label changed from `Version` to `Release` in `src/app/components/demo/DemoTopBar.tsx`;
- runtime store now uses explicit `product`, `designSystem`, `baseline`, and `release` state instead of a release-like `variant` field;
- `CountryId` exists as the official project alias for country taxonomy;
- product selector supports `PI` and `SME`;
- design-system selector supports `current` and `next`;
- unsupported product/design-system combinations render an honest planned-state placeholder instead of PI screens;
- component registry and AI catalog export were added;
- root `README.md` now points to the operating docs.

## Active Scope

Approved direction from the user:

1. Add AI Contributor Operating System.
2. Document the project organization before major implementation.
3. Continue with the previously agreed architecture direction:
   - official taxonomy;
   - release/baseline model;
   - screen and flow registries;
   - feature metadata expansion;
   - project model documentation;
   - gradual refactor strategy.
4. Fix screenshot-level and desktop-shell UX bugs inside the existing Mobile PI/current-design-system runtime without broadening product scope.
5. Add the Payments menu foundation for all countries before country-specific copy refinements.
6. Add the Products menu foundation for all countries, with ShopSmart tab visibility country-scoped before label/content fine tuning.
7. Add the New payment bottom sheet foundation for all countries before implementing payment-type flows.
8. Keep Products menu card layout as a reusable component contract shared across all countries.
9. Hide/show account, card, and product balances globally from the homepage toggle while leaving transactions visible.
10. Make Account Detail transaction search usable, including query filtering, clear action, and search activation scroll behavior.
11. Keep the MobileFrame system area visually faithful by removing non-device shadows from the Dynamic Island.
12. Add the Transaction Detail and Domestic Payment flow screens supplied by screenshot, with entry from both Transaction Detail `Redo payment` and Payments/New payment/Domestic payment.
13. Keep the Payments `OTHER` shortcut action as a reusable component with supplied SVGs and a stable icon/label styling contract shared across countries.
14. Keep top-level header action slots stable inside each page header rail; Home is intentionally ordered `Hide/Show amounts`, `Profile`, `Messages`.
15. Keep New payment bottom-sheet rows and help banner as reusable component contracts with supplied icons and typography.
16. Keep every screenshot in `screenshots/` represented in the Design System Inventory `Templates` tab as a selectable template, with related existing components called out where the mapping is clear.
17. Keep Products offer carousel cards as a reusable component contract matching the supplied 327x157 offer-card typography/layout spec.
18. Keep Design System Inventory as the visible control surface for components, templates, icons, and colors.
19. Keep reusable app colors centralized in `colorRegistry.ts` and `theme.css`, with Light/Dark controlled through demo state rather than scattered local styling.
20. Explore Mobile PI Kids as country-specific concept battles, starting with a Romania-only RO Kids prototype that stays close to the current UniCredit design system and covers as many Kid/Parent flows as possible with mock data.

## Blocked By

- Full SME and next-design-system screen implementations remain future product work, but they are no longer hidden leftovers: selecting them now produces an explicit planned-state runtime.
- Mobile PI Kids is implemented only for Romania/current design system. HU, BA, CZ, and other Kids concepts remain future comparison executions before any unified cross-country Kids model is chosen.
- No automated visual regression suite exists yet for safe-area/header/desktop viewport/account-carousel behavior; verification for these bugs was manual browser smoke testing plus production build.

## Next Recommended Action

Continue with product evolution work:

1. Audit and polish the RO Kids main journey: Kids Home -> Ask Money -> Parent Approval -> Money Received.
2. Decide whether the next concept battle should be HU, BA, or CZ Kids, then keep that execution country-contained instead of prematurely unifying the models.
3. Fill SME screen registry entries when actual SME screens are imported or designed.
4. Fill next-design-system screen/component mappings before visual migration.
5. Keep `src/app/registry/templateRegistry.ts` updated whenever new screenshot templates are added to `screenshots/`.
6. Expand AI catalog metadata as new screenshots and components are added.
7. Add automated tests for product/release/design-system switching and the RO Kids core money-request flow.
8. Add visual regression coverage for account-detail sticky header, safe-area behavior, account-card carousel drag/snap, all-products carousel coverage, account-details info screen layout, desktop preview auto-fit behavior, Design System template-card selection, and RO Kids home/approval screens.
9. Replace default Payments placeholder labels with country-specific titles and labels when copy is provided.
10. Fine tune Products labels, imagery, ShopSmart content, and per-country copy once the country-specific source copy and final assets are provided.
11. Fine tune New payment bottom sheet labels per country and implement the remaining Foreign/SEPA and Templates/Beneficiaries flows when those screens are supplied.
12. Add automated coverage for amount visibility persistence across navigation and transaction-row exclusion.
13. Add automated coverage for Account Detail transaction search, clear reset, and activation scroll behavior.
14. Fine tune Transaction Detail and Domestic Payment create/review/sign/success spacing, labels, and per-country copy against final screenshot references.
15. Add an automated color-token audit that fails on raw app hex/rgb/Tailwind palette classes outside approved registry/asset boundaries.
16. Add visual regression coverage for Light/Dark mode across Home, Payments, Products, Analytics, More, and Design System Inventory.

## Commands / Verification

- `npm run build` passed on 2026-05-29 after implementing RO Kids; Vite still emits the known chunk-size warning.
- Dev server started on `http://127.0.0.1:5177` for RO Kids verification.
- In-app browser smoke passed on `http://127.0.0.1:5177`: selected `Mobile PI Kids` + `Romania`, confirmed Kids Home, submitted Ask Money, opened Parent Approval, approved the request, returned to Mia home, and confirmed balance `116 RON available` with no stale waiting banner.
- `git diff --check` passed after the RO Kids code changes; Git only reported the normal LF-to-CRLF warnings on Windows.
- `rg -n "#[0-9A-Fa-f]{3,8}|rgba\\(|rgb\\([0-9]" src/app/screens/kids src/data/roKidsBanking.ts` returned no matches.
- `rg -n "uc-warning|uc-status-green" src/app/screens/kids src/data/roKidsBanking.ts` returned no matches.
- GitHub repository created: `https://github.com/cata009/mobile-banking-cee`.
- Initial commit pushed to `origin/main`: `2767060` (`Initial mobile banking demo platform`).
- `npm run build` passed on 2026-05-27.
- Vite emitted a chunk-size warning because the bundle and image assets are large; this is recorded in `known-bananas.md`.
- Browser verification passed on fresh dev server `http://localhost:5174`: Control Panel opens, shows Mobile PI/current design system context, and displays feature lifecycle/coverage statuses.
- `npm run build` passed again after removing runtime `variant` state and adding product/design-system selectors.
- `npm run build` passed again after adding `CountryId`, component registry, AI catalog export, and planned-state placeholders.
- Browser verification passed on fresh dev server `http://localhost:5175`: Mobile PI loads, Mobile SME selection shows the planned-context placeholder, and next design-system selection shows the planned-context placeholder.
- `npx tsc --noEmit` could not run because the workspace does not include a local `typescript` package or `typecheck` script; this is recorded in `known-bananas.md`.
- `npm run build` passed after the account-detail sticky-header/safe-area fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on fresh dev server `http://127.0.0.1:5176`: opened Mobile PI, logged in, opened Accounts, entered account detail, scrolled transactions, and confirmed `Dante International` / `Carrefour` rows stay below the sticky `Accounts` header instead of under Dynamic Island.
- `npm run build` passed after the desktop preview auto-fit/page-scroll fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: after reload, `bodyCanScrollX` and `bodyCanScrollY` were both `false`; the shell height matched the viewport; internal phone scrolling still worked on the homepage while `window.scrollY` stayed `0`.
- `npm run build` passed after the account-carousel gutter/shadow/drag fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: account carousel reset to account 1 with `scrollLeft: 0`, first card logical offset `16`, `scrollPaddingLeft: 16px`, softened layered shadow, and drag from the visible card surface snapped to account 2 with `scrollLeft: 327`.
- `npm run build` passed after hiding the Account options scrollbar on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: Account options content area has `scrollbar-hide` / `scrollbarWidth: none`, and internal `scrollTop` still changes on scroll.
- `npm run build` passed after the account-carousel edge-peek fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: first card remains at `scrollLeft: 0`; middle card snaps to `scrollLeft: 311` with previous and next peeks visible; last card snaps to `scrollLeft: 622` with the right margin preserved.
- `npm run build` passed after the AccountBalanceCard sub-account visibility/spacing fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: Account Detail rendered three account cards with no visible `SUB ACCOUNT` text, no sub-account value nodes, and a measured `16px` logical metadata-to-balance gap at the current phone-frame scale.
- `npm run build` passed after the AccountBalanceCard current-balance row gap fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: first account card rendered `Current balance` and `534,98 RON` in a row with class `gap-[4px]`; measured visual gap was `4px` logical at the current phone-frame scale.
- `npm run build` passed after the Account Detail title-card spacing and sticky-search fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: at `scrollTop: 0`, the large `Accounts` title-to-card gap measured `24px` logical; after scrolling to `scrollTop: 520`, the search bar stayed sticky with a `24px` logical gap below the top header.
- `npm run build` passed after the Account Detail all-products carousel fix on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: clicked `Personal Loan` from homepage, Account Detail rendered six carousel cards (`Primary Account`, `Savings Account`, `Emergency Fund`, `12-Month Term Deposit`, `Personal Loan`, `Home Mortgage`), and desktop drag reached the final `Home Mortgage` card.
- `npm run build` passed after adding the Account Details info screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: logged in, opened `Primary Account`, clicked the `Details` action, and confirmed the new `Account Details` screen renders with the share header action, account-number/copy row, balance fields, `Show less`, and connected-card row.
- `npm run build` passed after fixing Account Details to reuse the existing `PageHeader` collapse behavior on 2026-05-27; Vite still emits the known chunk-size warning.
- Browser verification passed on `http://127.0.0.1:5176`: logged in, opened `Primary Account`, clicked `Details`, confirmed the large `Account Details` title at the top state, scrolled the page, and confirmed the sticky header stays visible with `Account Details` centered between Back and Share.
- `npm run build` passed after adding the Payments menu screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5176`: logged in, opened Payments from bottom navigation, and confirmed `Payments`, `New payment`, `Between my accounts`, `Recurrent payments`, `Scan & pay`, `OTHER`, `CREATE QR CODE`, `TEMPLATES`, `CARD REPAYMENT`, and `EXCHANGE RATES` are visible/reachable.
- `npm run build` passed after wiring the Products menu screen on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5176`: logged in, opened Products from bottom navigation, confirmed RO shows `Banking` and `ShopSmart`, confirmed the Offers/Products/Other Solutions content, and confirmed the first offer card text does not clip.
- Chrome headless/CDP smoke verification passed on the user's active dev-server port `http://127.0.0.1:5175`: RO shows the `ShopSmart` tab and RS/Serbia hides `ShopSmart` while keeping the Products page content.
- `npm run build` passed after adding the New payment bottom sheet on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on the user's active dev-server port `http://127.0.0.1:5175`: logged in, opened Payments, clicked `New payment`, confirmed the bottom sheet contains the three payment actions, help banner, and bottom anchoring, and confirmed both header X and outside-tap close dismiss the sheet.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175` for CZ: after switching to Czech Republic, the New payment sheet renders `Send payment in CZK in CR`.
- `npm run build` passed after adding the reusable Products menu card component on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: logged in, opened Products, and confirmed the five core product cards (`Account`, `Cards`, `Mortgages and loans`, `Insurance`, `Investments and savings`) compute to `164px` width, `120px` height, `16px` padding, `flex-start` alignment, `10px` gap, and `18px`/`700`/white UniCredit text.
- `npm run build` passed after adding global amount visibility on 2026-05-27; Vite still emits the known chunk-size warning.
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: default homepage amounts are visible; clicking the hide icon masks homepage balances, switches to the supplied 20x20 show icon, keeps masks across Account Detail and Account Details navigation, and leaves a transaction row amount visible (`+ 6.225,00 RON`).
- Chrome headless/CDP smoke verification passed on `http://127.0.0.1:5175`: clicking the show icon restores visible homepage amounts and returns the hide icon.
- `npm run build` passed after adding Account Detail transaction search on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Account Detail, focused the search input, confirmed the page scrolls to the search sticky target (`scrollTop: 394`), searched `Carrefour`, confirmed `Dante International` is filtered out, confirmed the supplied 20x20 clear-results icon replaces Filters, and confirmed clear restores the full list and Filters icon.
- `npm run build` passed after removing the Dynamic Island drop shadow on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: the Dynamic Island element resolves with `boxShadow: none` while keeping the same class contract for size and radius.
- `npm run build` passed after adding the Transaction Detail and Domestic Payment flow on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: Payments -> New payment -> Domestic payment opened a blank Domestic payment form, continued through Review data, Sign, Successful payment, and returned to Payments.
- In-app browser smoke verification passed on `http://localhost:5175`: Account Detail transaction row -> Transaction Detail -> Redo payment opened Domestic payment with beneficiary/account/amount fields prefilled from the selected transaction.
- `npm run build` passed after adding the reusable Payments `OTHER` shortcut component on 2026-05-27; Vite still emits the known chunk-size warning.
- `git diff --check` returned no whitespace errors after the Payments `OTHER` shortcut change; it only reported the existing LF-to-CRLF normalization warnings.
- In-app browser smoke verification passed on `http://localhost:5175`: Payments `OTHER` renders all four shortcut actions, the QR SVG computes to `22x28`, the other three SVGs compute to `32x32`, each icon slot computes to `32px` by `32px` with `flex-shrink: 0`, and each label computes to `14px`, `700`, `1px` letter spacing, centered `#262626`, with `liga` / `clig` disabled.
- `npm run build` passed after the top-level header action alignment fix on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: after navigating Home -> Payments -> Products -> More, top header actions stayed in fixed rail slots; Home now uses the requested `Hide/Show amounts`, `Profile`, `Messages` order.
- `npm run build` passed after adding the reusable New payment action rows and Discover banner on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: New payment bottom-sheet rows compute to logical `80px` height, stack with `0` visual gap, keep a `24px` logical gap from the title/header block, render Domestic icon as `19x20`, Foreign/Templates/Chevron as `32x32`, and render the Discover banner info icon as `20x20`, close icon as `12x12`, title as `18px/700/white`, and subtitle as `18px/400/white`.
- `npm run build` passed after adding the Design System Inventory `Templates` tab on 2026-05-27; Vite still emits the known chunk-size warning.
- Screenshot-to-template coverage check passed: `screenshots=30 registry=30`, with no differences between the `screenshots/` folder and `src/app/registry/templateRegistry.ts`.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Templates`, confirmed the active tab is `Templates`, confirmed 30 selectable template cards, confirmed the selected preview image loads, and confirmed selecting `Transaction detail` changes the selected card and preview to `screenshots/Transaction detail.png` at `375 x 1855`.
- `npm run build` passed after adding the reusable Products offer card on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Products and confirmed the first offer card computes to `327px` width, `157px` height, text stack `display:flex`, `width:206px`, `flex-direction:column`, `align-items:flex-start`, `gap:8px`, title `24px`/`700`/white/normal line-height/stretch, and subtitle `16px`/`400`/white/normal line-height/stretch.
- `npm run build` passed after centralizing the app icon registry and adding the Design System Inventory `Icons` tab on 2026-05-27; Vite still emits the known chunk-size warning.
- Icon audit passed with reusable UI icons routed through `AppIcon`; remaining `<svg>` occurrences are limited to `AppIcon`, brand logos, status/device chrome, decorative motion/texture/shadow SVGs, Prime background texture SVGs, PFM category glyph registry, Product offer-card background geometry, and the Floating Co-Apping background shape.
- In-app browser smoke verification passed on `http://localhost:5175`: opened Design System Inventory, selected `Icons`, confirmed the tab renders `Icon registry`, `Mapped icons`, `Custom SVG`, `Lucide wrappers`, `Deduplicated`, category sections including `Header`, `Payments`, and `Prime`, plus `Icon audit boundaries`; 84 icon cards rendered.
- `npm run build` passed after the Products offer carousel drag/snap and spacing fix on 2026-05-27; Vite still emits the known chunk-size warning.
- In-app browser smoke verification passed on `http://localhost:5175`: Products spacing measured `16px` for tab-to-offers, offers divider-to-carousel, carousel-to-our-products, our-products divider-to-grid, product column gap, and product row gap; dragging the offer carousel snapped to the second card at `scrollLeft=339`.
- `npm run build` passed after the Design System Colors inventory, app-wide color tokenization, and Light/Dark appearance mode on 2026-05-27; Vite still emits the known chunk-size warning.
- Raw hex audit passed: `rg -n "#[0-9A-Fa-f]{3,8}" src/app -g "*.tsx" -g "*.ts" -g "*.css" -g "!src/app/registry/colorRegistry.ts"` returned no matches.
- Numeric RGB audit passed: `rg -n "rgba\(|rgb\([0-9]" src/app src/styles -g "*.tsx" -g "*.ts" -g "*.css"` returned no matches.
- Tailwind palette audit passed: app code no longer reports color palette classes; remaining matches are non-color layout utilities such as `focus:ring-offset-*` and border-width helpers.
- In-app browser smoke verification passed on `http://localhost:5175`: Design System Inventory `Colors` tab renders, color copy feedback changes to `Copied`, Light/Dark switches from the control plane, and the dark root exposes `--uc-app-bg: #262626`, `--uc-surface: #454545`, and `--uc-text: #FFFFFF`.
- `git diff --check` passed after final whitespace cleanup; Git only reported existing LF-to-CRLF normalization warnings.

## Decisions

- Mobile PI Kids is active only for `RO` + `current` design system in this first experiment; other Kids country/design-system contexts continue to use the planned-state placeholder.
- RO Kids is intentionally a contained mock-driven module for concept exploration, not a new global router/product architecture yet.
- The first RO Kids concept excludes loans, child debt, repayment obligations, reward freezing, punishment mechanics, gambling-like rewards, and leaderboards.
- Parent controls in RO Kids use approval and transparency language (`Safety limits`, `Approval needed`, `What my parent can see`) rather than punishment or surveillance language.
- Kids flows update local state only: approving a money request or chore changes the visible balance/activity for the prototype but does not introduce persistence, ledger posting, or backend APIs.
- Runtime release selection is now explicit: `DemoState.release` + `DemoState.baseline`.
- `CountryId` is the official taxonomy alias; legacy `Country` remains as the underlying union for compatibility.
- `baseline` and `release` become explicit concepts.
- AI handoff docs are repo-level operating docs, not product features.
- The new registries are mostly non-invasive, except the control panel now reads release and feature metadata visibly.
- The platform capability map was updated for the visible control-panel/release wording change.
- SME and next design system can be selected, but show planned-state placeholders until actual flows exist.
- Account-detail sticky headers must live at the scroll-container level if they are responsible for protecting the device safe area while lower content scrolls.
- Desktop preview scaling must reserve scaled layout dimensions, not only use CSS `transform`, otherwise the visual phone shrinks while the page still scrolls as if it were full size.
- Account-detail card snap positions must use both physical gutter padding and matching `scroll-padding`; otherwise the browser can auto-snap to `scrollLeft: 16` and visually erase the default side margin.
- The account card visual should not receive pointer events inside the carousel; the interactive wrapper owns click, keyboard, and drag so desktop mouse dragging works from the whole visible card.
- Account carousel edge cards and middle cards need different snap math: middle cards center to reveal both neighbors, while first/last cards preserve their outer gutters.
- Account options should keep scroll local to the phone screen without showing a desktop-style scrollbar.
- Current and savings account detail cards should not expose sub-account metadata, even though the reusable card component still supports that optional field for other product contexts.
- Current-balance row value should stay inline next to its label with a `4px` logical gap, not be pushed to the far right edge of the card.
- Account Detail search should stick inside the phone scroll container below the top account header, preserving a `24px` logical gap while transactions scroll underneath.
- Account Detail should reuse homepage product categories for current accounts, saving accounts, term deposits, loans, and mortgages; cards and investments stay out of this carousel unless explicitly requested later.
- Account Details info is a separate runtime screen opened from the `Details` action; it uses the product currently active in the Account Detail carousel.
- Shared header collapse must live in `PageHeader`, with the screen providing scroll progress, so detail screens do not fork their own top bars.
- Spending analytics should summarize the same account transaction profiles used by Account Detail, grouped by PFM category and reported in the selected country's local currency.
- PFM category colors are tokenized in `theme.css`; `PfmCategoryIcon` now has real glyphs for Taxes and Penalties, Income, Home, Utilities, Transportation, Children, Healthcare, Shopping, Lifestyle, Education, Leisure time, Investments, Uncategorized, Groceries, Exclude from budget, Insurance, Finance, Wallet, and Transfers, while the remaining categories still use color badges and fallback initials traced to `screenshots/PFM-icons.svg`.
- Demo FX conversion is deterministic and source-dated, not live; the app should not fetch exchange rates at runtime until a real data/API boundary is approved.
- Payments copy is centralized in `paymentsMenuConfig.ts` by `CountryId`; current labels are intentionally shared across all countries until localized/country-specific wording is provided.
- New payment sheet content lives inside `paymentsMenuConfig.ts`; the sheet shell is generic and reusable, while payment action copy remains country-scoped.
- Products copy and tab availability are centralized in `productsMenuConfig.ts` by `CountryId`; only RO, CZ, SK, and HU show the `Banking` / `ShopSmart` split.
- Products menu card layout lives in `ProductMenuCard`; country-specific differences should stay in `productsMenuConfig.ts` unless the design system itself changes.
- Amount visibility is an in-app demo state, not a feature flag; it persists while navigating screens and resets to visible on a full demo reset/reload.
- Transaction amounts are excluded from amount masking by design.
- Account Detail transaction search is local to the currently selected account/product transaction list; it filters the mock profile in memory and does not introduce backend search or saved search state.
- Dynamic Island should not carry an artificial drop shadow; the phone-frame outer shell can keep its desktop preview shadow, but the system cutout itself stays flat black.
- Transaction Detail is a front-end mock detail screen derived from the selected static transaction and selected account product.
- Domestic payment has two supported entry modes: blank from Payments/New payment/Domestic payment and prefilled from Transaction Detail/Redo payment.
- Domestic payment success returns to Payments, because there is no real account ledger update or transaction creation behind the demo flow yet.
- Payments `OTHER` shortcut visuals live in `PaymentOtherShortcut`; item identity and country menu membership remain in `paymentsMenuConfig.ts`.
- Top-level page headers use fixed header action rails; Home intentionally orders `Hide/Show amounts`, `Profile`, `Messages`, while other top-level pages keep page-specific action sets in the same fixed rail.
- Messages is a mock-driven runtime screen reconstructed from template 52; all PI countries are wired through `messagesConfig.ts`, but the current baseline copy/data is intentionally shared until market-specific messages are supplied.
- New payment bottom-sheet action rows and Discover banner live as reusable components under `src/app/components/payments`; country-specific action text remains in `paymentsMenuConfig.ts`.
- Screenshot and code-only templates live in `src/app/registry/templateRegistry.ts`; the Design System page consumes that registry so screenshot coverage, code preview coverage, and AI reuse contracts can be audited separately from the long component inventory JSX.
- Reconstructed templates live in `src/app/components/templates/TemplateCodePreviews.tsx`; `templateRegistry.ts` points implemented screenshot templates and code-only templates at a `codePreviewId`, typed `ComponentId` references, related `ScreenId` / `FlowId` links, screen family, runtime screen links where available, and an AI assembly contract, while original screenshots remain source/comparison evidence where they exist.
- Design System Template cards should stay compact and code-backed templates should open in `code` mode by default; the PNG source toggle exists for comparison, not as the implementation surface.
- `npm run audit:templates` is now the semantic guard for template/component/screen/flow drift; browser or visual regression is still needed for rendered preview fidelity.
- Products offer carousel visuals live in `ProductOfferCard`; offer identity and country/product menu membership remain in `productsMenuConfig.ts`.
- Reusable UI icons live in `src/app/components/icons/AppIcon.tsx`; product code should consume icons through `AppIcon` so a registry SVG change propagates to every usage.
- Remaining raw SVGs outside `AppIcon` are treated as brand/logo, device chrome, decorative effect assets, PFM category glyph registry, or Product offer-card decorative geometry unless explicitly promoted into the icon registry later.
- Products offer carousel behavior lives in `ProductsScreen` for now, matching the Account Detail drag/snap interaction without introducing a broader carousel abstraction yet.
- Products page section and grid spacing should stay on the `16px` rhythm unless a later screenshot-level correction explicitly changes it.
- Reusable DS colors live in `src/app/registry/colorRegistry.ts`; runtime styling consumes `src/styles/theme.css` variables so palette changes propagate through CSS tokens.
- Dark mode is a demo appearance mode, not a separate design-system id; `current` / `next` design-system selection remains about DS generation, while Light/Dark is a theme state within the selected DS.
- Raw colors are allowed in the color registry and source assets/screenshots only; active app styling should use CSS variables or registry-driven values.

## Limitations

- RO Kids data and transitions are local state only; reloading the app resets the concept.
- RO Kids has no real parent consent, legal eligibility checks, activation QR, child device pairing, wallet/card operation, notifications, ledger posting, persistence, backend, or audit trail.
- RO Kids is Romania-only for this execution and uses RON/Romanian assumptions; HU, BA, CZ, and other country Kids concepts are intentionally not implemented yet.
- RO Kids copy is mostly English with light Romanian greeting/context, pending a dedicated localization/content pass.
- `RoKidsApp.tsx` is intentionally broad and contained for the first concept battle; after the winning direction is chosen, split it into smaller screens/components before productionizing.
- Local Git repository is initialized on `main` with remote `origin` set to `https://github.com/cata009/mobile-banking-cee.git`.
- SME and next design system have runtime selectors and planned-state placeholders, but not real product screens yet.
- Screen and flow registry entries are first-pass foundations and should be refined as more screenshots/components are cataloged.
- Existing dev servers on ports `6000`/`6001` may be stale; `5174` and `5175` were started fresh for verification.
- Typecheck, lint, and test cannot be run yet because the package only defines `dev`, `build`, and `preview` scripts.
- Fresh dev server `http://127.0.0.1:5176` was started for this visual check.
- Extremely short desktop viewport heights may still hit the minimum preview scale; add automated viewport-size regression tests before changing the scale bounds further.
- Carousel drag behavior is currently verified manually in the browser; add automated pointer/mouse drag coverage before changing the account carousel interaction model.
- Transaction rows remain mock-profile driven for the expanded product carousel; term deposits, loans, and mortgages reuse existing account transaction profiles until product-specific transaction data is defined.
- Account Details info values are mock-derived from the selected product and should receive screenshot-level spacing/copy refinements in follow-up fixes.
- Spending analytics now derives from transaction profiles, but those profiles are still static mocks and currently deduplicated by reused profile index to avoid counting the same mock profile multiple times across product types.
- PFM category icon glyph extraction is partial: Taxes and Penalties, Income, Home, Utilities, Transportation, Children, Healthcare, Shopping, Lifestyle, Education, Leisure time, Investments, Uncategorized, Groceries, Exclude from budget, Insurance, Finance, Wallet, and Transfers render as real 20x20 SVG glyphs; remaining categories such as Cash, ATM, FX, and Internal still use token-colored initial badges with source traceability to `screenshots/PFM-icons.svg`.
- Exchange rates are a static 2026-05-28 demo reference table, not a live market feed.
- Payments menu actions are mostly navigational placeholders; Domestic payment now has a mock create/review/sign/success flow, but there is still no real payment execution, QR generation, template management, repayment, or exchange-rate detail flow.
- Payments menu labels are shared English placeholders across all countries until country-specific title/label updates are requested.
- New payment sheet Domestic now opens the mock Domestic payment flow; Foreign/SEPA and Templates/Beneficiaries remain menu placeholders until their target screens are supplied.
- Domestic payment values are static/mock-driven and do not update balances, transaction lists, or backend state after success.
- The screenshot filenames for Sign and Successful payment are currently source-supplied names (`Language Selection.png` and `Transfer to new phone.png`), while the registry maps them to the actual payment screens they represent.
- Products menu cards are navigational placeholders only; product detail, ShopSmart purchasing, offer detail, and additional-services detail flows do not exist yet.
- Products menu labels, imagery, and ShopSmart content are shared placeholders until country-specific copy and final assets are supplied.
- Products offer carousel drag/snap is manually browser-verified only; add automated pointer/visual regression coverage before changing carousel math again.
- Amount visibility is not persisted to local storage; this satisfies navigation persistence but not browser reload persistence.
- Transaction search uses the current static mock transaction profile only; term deposits, loans, and mortgages still reuse the existing mock transaction profiles until product-specific transaction data is defined.
- Messages uses static mock Inbox/Outbox rows and does not create a backend notification/message domain, unread-count state, message detail screen, or country-specific message copy yet.
- `templateRegistry.ts` is intentionally explicit, so adding or renaming files in `screenshots/`, adding a code-only template, or changing a template-to-app relationship requires updating the registry entry and keeping `npm run audit:templates` green in the same session.
- Reconstructed template coverage is complete for the screenshot set and expanded beyond it: all 30 screenshot templates have real-code previews, and 20 additional code-only templates now cover active runtime patterns; every template now has typed component/screen/flow reuse metadata, while source PNG/JPG files remain available only as comparison evidence.
- The new template contract is a source-level AI map, not an automatic runtime screen generator; future work can use it to compose flows, but prompts are not compiled into new mounted screens yet.
- `AppIcon.tsx` is intentionally explicit, so adding a reusable UI icon requires a registry entry with usage metadata in the same session.
- Final custom-icon audit for standard UI glyphs is clean: all non-exempt `source: "custom"` icons in `AppIcon.tsx` now declare `20x20` metadata, including the last straggler `new-payment-domestic`.
- A final follow-up pass also tightened a few remaining standard affordance viewBoxes whose glyphs were still reading slightly undersized despite correct `20x20` metadata:
  - `back-heavy`
  - `chevron-link`
  - `contact-chevron`
  - `share-filled`
  - `chevron-forward-heavy`
- These now use cropped content viewBoxes rather than roomy `24x24` / `32x32` canvases, so the rendered glyph fills the shared `20x20` inner space more consistently next to already-correct siblings.
- `npm run build` passed again on 2026-06-01 after this viewBox-tightening pass; Vite still emits the known chunk-size warning.
- A targeted icon audit confirmed the affected families now all remain on `20x20` metadata with the tightened viewBoxes: `back-heavy`, `chevron-link`, `share-filled`, `chevron-forward-heavy`, `contact-chevron`, `contact-prime`, `contact-location`, `contact-youtube`, `prime-direction`, `prime-email`, and `prime-phone`.
- `AppIcon.tsx` still has 27 lucide-alone entries because no approved custom SVG equivalents are mapped yet: `wallet-cards`, `shopping-bag`, `arrow-right`, `camera`, `grid-2x2`, `landmark`, `repeat`, `lock`, `alert-triangle`, `credit-card`, `send`, `bike`, `book-open`, `calendar-days`, `circle-dollar-sign`, `clipboard-check`, `eye`, `eye-off`, `gift`, `palette`, `piggy-bank`, `receipt-text`, `shield-check`, `sliders-horizontal`, `trophy`, `user-round`, and `users`.
- SVG audit still allows brand logos, device chrome, decorative textures/effects, the PFM category glyph registry, Product offer-card decorative geometry, and vendored `ui/` primitives outside `AppIcon`; these boundaries are documented in the Design System Inventory Icons tab.
- `colorRegistry.ts` and `theme.css` are intentionally explicit, so adding a reusable color or app semantic color requires updating the registry/theme in the same session.
- Color-token compliance is currently enforced by manual `rg` audits and browser smoke checks; no automated test fails the build yet if a future contributor introduces raw app colors.
- The Browser virtual clipboard cannot read back copied values in this environment, so copy-hex verification used visible `Copied` UI feedback rather than clipboard-read confirmation.

## 2026-06-02 Template System Header Update

- Applied the shared system header components to Design System template previews by mounting `StatusBar` and `DynamicIsland` centrally in `TemplatePhoneSurface`.
- Removed the local `StaticStatusBar` drawing from `TemplateCodePreviews.tsx`; existing top spacing is preserved through an invisible template spacer so reconstructed template layouts do not jump vertically.
- Dark-overlay templates now request the dark system-header variant, while normal templates inherit the light variant from the shared surface.
- `LogoutConfirmationTemplate` disables the outer system-header overlay because it embeds `MoreMenuTemplate`, which already renders through its own `TemplatePhoneSurface`.
- Verification:
  - `rg -n "StaticStatusBar|TemplatePhoneSurface statusBarVariant|TemplatePhoneSurface showSystemHeader|function TemplatePhoneSurface|StatusBar|DynamicIsland" "src/app/components/templates/TemplateCodePreviews.tsx"`
  - `git diff --check -- "src/app/components/templates/TemplateCodePreviews.tsx"`
  - `npm run build` passed; Vite still emits the known chunk-size warning.

## 2026-06-02 Template Header Spacing Follow-up

- `TemplatePhoneSurface` now owns the reserved system-header space for normal code-backed template previews, so page content starts below the shared `StatusBar` / `DynamicIsland` instead of relying on each template to add a local spacer.
- `TemplateSystemHeaderSpacer` is now a compatibility no-op; existing templates can keep calling it without accumulating duplicated top gaps.
- Full-bleed overlay templates such as prelogin, language selector sheet, smart-banking panel, and account-selection panel opt out of the reserved space so their background still extends behind the system bar.
- Template page headers that render back/help/title chrome now route through shared `PageHeader`.
- `PageHeader` gained a non-breaking `showBack` option so help-only template states can use the same component without showing an unwanted back action.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check -- src/app/components/templates/TemplateCodePreviews.tsx src/app/components/PageHeader.tsx` passed with only normal Windows LF/CRLF warnings.
  - Browser reload on `http://localhost:3001/#templates` reached the Design System hash but the current in-app browser state did not consistently stay on the DS Templates surface for a reliable visual measurement; treat this as a follow-up smoke-check target after the selector/hash state is stabilized.

## 2026-06-02 Products Menu Card Artwork Variant

- Extended `ProductMenuCard` with a non-breaking `variant` prop: the default `standard` keeps the existing 164x120 country runtime cards, while the new `compact` variant renders a 164x72 card with a 16px title.
- Added optional screenshot artwork support and per-card image placement for Account, Cards, Mortgages and Loans, Insurance, Investments and Savings, Market Hedging, Shopsmart, and Partner Offers.
- Added Design System specimen controls for selecting the product card family and size variant; this is intentionally component-only and does not modify country product baselines.
- Added product hedging color token/registry entry for `#717863`, and registered the three new component-demo product card families: Market Hedging, Shopsmart, and Partner Offers.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser smoke check on `http://localhost:3001/#products` confirmed the Products menu card specimen, the Standard/Compact selector, all 8 card options, and the 3 new cards.
  - `rg -n '#717863|717863|market-hedging|partner-offers|shopsmart|uc-product-hedging' src/app src/styles`
  - `git diff --check -- src/app/components/products/ProductMenuCard.tsx src/app/config/productsMenuConfig.ts src/app/screens/design-system/DesignSystemPage.tsx src/app/registry/componentRegistry.ts src/app/registry/colorRegistry.ts src/styles/theme.css`

## 2026-06-02 Compact Form Component Specimens

- Compactified the Design System Inventory Forms section by grouping Dropdown, Text field, and Amount field specimens into a responsive grid.
- The field previews now use fluid `max-width: 327px` wrappers, so they can fit 2 cards per row at the current desktop width and 3 per row on wider inventory layouts.
- Runtime field components are unchanged; this is only a Design System Inventory presentation adjustment.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser smoke check on `http://localhost:3001/#forms` confirmed Dropdown and Text field share the first row at the current viewport, with Amount field wrapping cleanly below.
  - `git diff --check -- src/app/screens/design-system/DesignSystemPage.tsx`

## 2026-06-02 Runtime Products Menu Card Artwork Sync

- Synced the runtime Products `OUR PRODUCTS` cards to the latest standard `ProductMenuCard` artwork support by passing the supplied screenshots into the existing shared `BANKING_PRODUCTS` config.
- Kept the runtime card list unchanged: Account, Cards, Mortgages and loans, Insurance, and Investments and savings only. The new Design System-only Market Hedging, Shopsmart, and Partner Offers demo cards were not added to country prototypes.
- Explicitly rendered Products runtime cards with `variant="standard"` so the new compact component variant stays Design System-only until separately requested.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Browser smoke check on `http://localhost:3001/` -> Products confirmed `OUR PRODUCTS`, 5 existing product cards, 5 images inside those cards, and no Market Hedging / Partner Offers extra runtime cards.
  - `git diff --check -- src/app/config/productsMenuConfig.ts src/app/screens/products/ProductsScreen.tsx`

## 2026-06-02 Products Country Visibility Rules

- Limited the Products `OTHER SOLUTIONS FOR YOU` divider and `Additional services` card to Czech Republic and Slovakia only by keeping base product configs empty and wrapping only CZ/SK with `withAdditionalServices`.
- `ProductsScreen` now renders the Other Solutions section only when `otherSolutions.length > 0`, so RO/HU/RS/BA/SI no longer show an empty or non-applicable divider.
- Confirmed Serbia, Bosnia, and Slovenia stay direct Products pages without Banking/ShopSmart tabs via their existing `createProductsMenuConfig(false)` configuration.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - PowerShell config matrix check confirmed RO/HU tabs true without additional services, CZ/SK tabs true with additional services, RS/BA/SI no tabs, and base config no other solutions.
  - `git diff --check -- src/app/config/productsMenuConfig.ts src/app/screens/products/ProductsScreen.tsx`

## 2026-06-02 More Card Localization Pass

- Added a typed `more` translation namespace to `src/translations/types.ts`, covering the More title and all More card labels.
- Added More card translations to all 14 country/language files under `src/translations`.
- Czech Republic and Slovakia English labels now use the requested wording:
  - `Consent to third parties`
  - `Digital activity record`
  - `My applications`
  - `Tutorials`
- Czech and Slovak local-language labels were added for the same cards, so switching between English and the local app language changes the More screen labels instead of reusing hardcoded English.
- `MoreHeader` and every More card now consume translation-backed labels through `MoreScreen` / `LanguageContext`; card components keep English defaults only for isolated Design System/specimen rendering.
- Design System More-card selectors and More template preview metadata were updated to the new English labels.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Translation audit passed: `translation-more audit ok: files=14 keys=9`.
  - `rg` audit confirmed the old requested More labels no longer remain in runtime/app code.
  - `git diff --check -- src/translations/types.ts src/translations src/app/screens/more src/app/screens/design-system/DesignSystemPage.tsx src/app/components/templates/TemplateCodePreviews.tsx` passed with only normal Windows LF/CRLF warnings.
- Limitation:
  - This is the first coherent localization slice for More. Other active screens still contain hardcoded English and need a separate full localization migration, rather than being rewritten ad hoc in this pass.

## 2026-06-02 Slovenia Products Direct Cards Rule

- Updated Slovenia Products runtime to a cards-only surface:
  - no `OFFERS FOR YOU` heading
  - no offer carousel
  - no `OUR PRODUCTS` heading
  - no Insurance card
  - four remaining standard cards: Account, Cards, Mortgages and loans, Investments and savings
- `ProductsScreen` now skips the offer section when `offers.length === 0` and skips the products heading when `productsTitle` is empty, so the Slovenia behavior stays config-driven instead of being hardcoded into the screen.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - Slovenia products config audit passed: `offers=0 products=4 insurance=hidden productsTitle=hidden`.
  - `git diff --check -- src/app/config/productsMenuConfig.ts src/app/screens/products/ProductsScreen.tsx` passed with only normal Windows LF/CRLF warnings.

## 2026-06-02 Closeout / Commit Prep

- Prepared a full-session commit after the latest global cursor affordance fix and the broader accumulated Design System / runtime prototype work.
- Current working tree includes runtime prototype, template, Design System inventory, translation, color/icon, Products, Payments, More, Settings/Documents, and handoff-documentation updates from this session.
- Banana Loop result:
  - build chunk-size warning remains triaged in `known-bananas.md`
  - missing `typecheck`, `lint`, and `test` scripts remain triaged in `known-bananas.md` and `next-tasks.md`
  - no new untriaged blocker was found during closeout
- Verification run on 2026-06-02:
  - `npm run build` passed; Vite still emits the known chunk-size warning
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`
  - `git diff --check` passed with only normal Windows LF/CRLF warnings
- Commit scope:
  - all currently modified and untracked project files are intended to be included in the closeout commit per user request

## 2026-06-02 Payments Hero Card Image Variants

- `PaymentHeroCard` now supports 9 screenshot-backed image variants sourced from `screenshots/payments1.png` through `screenshots/payments9.png`.
- `paymentsMenuConfig` now exposes `PaymentHeroImageVariant` and optional `imageVariant` metadata on `PaymentHeroItem`; the existing Payments primary cards have a temporary default artwork mapping until final country-specific mapping and H1/H2 copy are provided.
- `paymentsMenuConfig` now also exposes `heroSheets` keyed by each `PaymentHeroId`, so every Payments hero card opens a dedicated overlay configuration rather than sharing one semantic `New payment` sheet.
- `PaymentsScreen` tracks the selected hero card id and renders `PaymentHeroSheet` from that card's config; current sheet actions are intentionally placeholder-compatible until each menu receives its final overlay content.
- The Design System `Payments hero card` specimen now has a selector with all 9 variants, so each supplied image can be inspected from the component inventory.
- Template previews now reuse `PaymentHeroCard` for the Payments hero cards instead of a separate local approximation, and the New payment sheet template reads from `heroSheets["new-payment"]`.
- `componentRegistry` now records the 9 screenshot-backed variant contract and optional `imageSrc` override.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.
  - Browser smoke on `http://localhost:3001/#buttons` confirmed the `Payments hero card` specimen loads, exposes 9 options (`payments-1` ... `payments-9`), and selecting `payments-9` renders the expected screenshot image at `118x104`.
- Limitation:
  - Country-specific Payments hero-card mapping, final H1/H2 copy, and final per-overlay menu content/icons remain intentionally pending user guidance.

## 2026-06-02 Payments OTHER Divider Component Mapping

- `src/app/screens/payments/PaymentsScreen.tsx` now renders the Payments `OTHER` section heading and divider through shared `SectionHeadingDivider` instead of local hardcoded heading/line markup.
- `src/app/components/templates/TemplateCodePreviews.tsx` now uses the same component for the Payments menu template preview, keeping runtime and template inventory aligned.
- Because all countries share `PaymentsScreen` and the country menu config only supplies labels/items, the component-backed `OTHER` divider applies across all country prototypes.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.

## 2026-06-02 Payments Hero Card Typography Follow-up

- `src/app/components/payments/PaymentHeroCard.tsx` now matches the requested Figma baseline more closely:
  - card height is `120px`
  - title starts `16px` from the top
  - title uses 24px bold, single-line `nowrap`, and no ellipsis/truncation
  - subtitle uses 14px regular and sits `16px` below the title
  - text is allowed to extend over the image area instead of reserving a narrow fixed text column
- `src/app/screens/design-system/DesignSystemPage.tsx` and `src/app/registry/componentRegistry.ts` were updated so the Design System specimen and component registry describe the new card contract.
- Verification:
  - `npm run build` passed; Vite still emits the known chunk-size warning.
  - `npm run audit:templates` passed: `template-contract ok: templates=50 codePreviews=50 components=48 screens=23 flows=13`.
  - In-app browser verification on `http://localhost:3001/#buttons` confirmed `cardHeight=120px`, `titleFontSize=24px`, `titleFontWeight=700`, `titleTop=16`, `titleWhiteSpace=nowrap`, `titleTextOverflow=clip`, `descFontSize=14px`, `descFontWeight=400`, and `descMarginTop=16px`.
  - `git diff --check` passed with only normal Windows LF/CRLF warnings.

## Constitutional Check

constitutional check:
- scope preserved: yes
- docs updated: yes
- verification recorded: yes
- bananas triaged: yes
- safe to resume: yes

safe to resume: yes, 50 code-backed template previews (30 screenshot-backed + 20 code-only active-pattern templates), typed template-to-app contracts with component/screen/flow metadata, `npm run audit:templates`, centralized icon cleanup with redundant lucide wrappers removed, RO Kids icon calls routed through `AppIcon`, remaining lucide-alone keys documented, Messages runtime screen from template 52, Documents and Settings runtime/template wiring from More, compact Design System Templates grid, Products bottom-navigation overlap fix, Design System Colors inventory, Light/Dark appearance switching, app-wide color tokenization, color/icon audits, build verification, browser smoke verification, and prior Payments/Products/Analytics/account-detail/demo-foundation work are complete; remaining work is follow-up screenshot-level fine tuning and automated visual coverage.
