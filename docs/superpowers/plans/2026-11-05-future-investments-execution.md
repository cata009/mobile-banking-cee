# Future Investments — execution record

Owner: Codex /root. Base: ce8c4bc97571bfadffa752887cc2727e8f32609e.
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE. Existing main checkout; no branch, index or worktree mutations.

## Authorized scope and preservation

The user approved implementation of the business-feedback plan, OS/header blending and a Portfolio/Goals switcher, then clarified that the five navigation destinations must own their actual content. During implementation the user rejected the first visual treatment and the long generic selector. The final treatment returns to the previous typography, split-decimal Amount component, compact period chips and smooth teal curve, with a subdued dashed net-invested series. The selector now contains exactly Portfolio details and Goals in the existing Source bottom sheet.

Initial pending changes were recorded with git status before implementation. They included previous Investments/Robo work, shared signing and other operators' work. They were preserved. This record describes this task's changes, not every pending change in the checkout.

## Owned paths for this task

New feature logic/localization/session:
- src/features/investments/future-overview/model.ts
- src/features/investments/future-overview/copy.ts
- src/features/investments/future-overview/session.ts

New native presentation:
- native-spike/src/experiences/pi/cz/evo-2027/investments/FutureInvestmentOverview.tsx
- native-spike/src/experiences/pi/cz/evo-2027/investments/FuturePortfolioChart.tsx
- native-spike/src/experiences/pi/cz/evo-2027/investments/FutureInvestmentMore.tsx
- native-spike/src/experiences/pi/cz/evo-2027/investments/FuturePortfolioSwitcher.tsx

Integration deltas, preserving initial edits:
- native-spike/src/experiences/pi/current/investments/baseline/Controller.tsx
- native-spike/src/experiences/pi/current/investments/Investments.tsx
- native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
- native-spike/src/experiences/pi/cz/evo-2027/NativeCzechApp.tsx
- native-spike/src/experiences/pi/cz/evo-2027/investments/adapter.tsx
- native-spike/src/experiences/pi/cz/evo-2027/investments/InvestmentsScreen.tsx
- native-spike/src/experiences/pi/cz/evo-2027/investments/ModuleNavigation.tsx
- native-spike/src/experiences/pi/cz/evo-2027/investments/Primitives.tsx
- native-spike/src/experiences/pi/cz/evo-2027/robo/GoalsScreen.tsx
- native-spike/src/experiences/pi/cz/evo-2027/robo/GoalDetail.tsx
- native-spike/src/experiences/pi/cz/evo-2027/robo/RoboFlow.tsx
- native-spike/src/universal/Header.tsx
- native-spike/src/universal/BaselinePageHeader.tsx
- native-spike/src/app/CzechPrimaryNavigation.tsx
- src/app/AppShell.tsx

Tests:
- native-spike/__tests__/future-investments-model.test.ts
- native-spike/__tests__/future-investments-variants.test.tsx
- native-spike/__tests__/pi-wide-evo-investments-adapter.test.tsx
- native-spike/__tests__/pi-wide-evo-investments-orders.test.tsx
- tests/features/future-investments-overview.test.ts

Documentation: this execution record. No assets created, deleted or converted.

## Decisions and delivered behavior

- Portfolio: previous visual hierarchy, two-series interactive chart, exactly 1M/3M/1Y/3Y/MAX, compatible product teaser, existing holdings rows and compact sorting. Secondary breakdown is available below holdings.
- Explore: all compatible recommendations, product links and investment education. Product detail opens the existing purchase/sell/document flow.
- Invest: the existing executable catalog, including product and basket routes. The Invest icon is emphasized without a full-height filled tile.
- Activity: existing history renderer with persistent navigation. Effective transactions, orders, currencies, filters, initial tab and host callbacks are forwarded by the controller.
- More: investment profile, illustrative questionnaire, target-market explanation, consolidated report and annual transaction statements. Both report types export actual CSV files through the native/web bridge.
- Portfolio/Goals: two choices only. Goal detail keeps its existing behavior and receives the same selector. Explicit Portfolio selection clears the saved goal resume and uses initialView=portfolio so it cannot silently reopen the last goal.
- All three CZ Future release IDs use the same overview; CZ Chatbot also routes the Goals destination to the existing Robo composition. Baseline selection remains separate.
- OS/header blending uses the resolved theme, including system dark mode. The Future Investments web host uses overflow:clip so decorative pseudo-elements cannot make keyboard/locator focus scroll the fixed native surface under the OS strip.

## Financial and data conventions for this DEMO

Ruling: history is synthetic, anchored to the existing reference curve and reconciled with every active holding once by security ID. It includes positive external contributions and withdrawals. Both one-off and recurring holdings are included; contribution type does not duplicate a holding.

Ruling: period absolute performance equals closing value minus opening value minus change in net invested. Percentage is a daily time-weighted return with end-of-day external flows removed before compounding. It can differ from simple gain divided by current value. The MAX opening point has zero accumulated profit; final value minus final net invested matches the current holdings' summed gain/loss. Currency conversion uses the existing portfolio-local values supplied by the source snapshot; historical FX is not independently simulated.

Ruling: the in-session demo profile filters recommendations by a valid questionnaire date, loss acceptance, risk level, horizon and understood product types. Unknown product risk is excluded. Compatible candidates have deterministic risk/ID priority. This is a demonstration of the requested UX, not a production suitability service or the bank's full MiFID questionnaire. The questionnaire states this limitation and the Help view identifies the illustrative history.

Ruling: chart selection snaps to plotted sample points, so tooltip date/amounts and the marker match the visible curve. The complete daily series remains the basis for period calculations.

## Verification evidence

- Native integration/model/navigation/order suites: 34 tests passed before the final review fixes; the three release-specific Portfolio/Goals tests also passed. The final verification run is recorded separately in the chat/tool results.
- Root feature model: 6 tests passed, including external cash flows, negative/zero-capital cases, eligibility and profile invalidation.
- Module audit: 377 files passed.
- Independent read-only review found history forwarding, CZ Chatbot Goals routing, curve selection and system-dark background issues; each was corrected.
- Real localhost Evo browser: observed OS/header blending, compact selector, Goals list, individual goal and return to Portfolio, Explore recommendation to real product detail and return, Invest catalog, Activity with persistent dock, More/profile/questionnaire entry, chart period change and keyboard selection with date and both values.
- Browser exports: investment-report-2026-11-05.csv and investment-statement-2026.csv downloaded successfully. The generated files contain actual demo holdings/activity rows.
- No iOS or Android device/emulator run was performed in this session. React Native component tests and web-host behavior are distinct from native-device acceptance.
- No deployment, remote publication or commits were performed.

Final checks: all 7 targeted native suites passed (37 tests), the root feature suite passed (6 tests), and native TypeScript completed successfully. The combined npm run verify passed platform tests, platform/root TypeScript and lint, then stopped at format:check in 10 files outside this task's owned delta (Robo state/onboarding, transaction filters, demo-native policy, product selectors/icons, card-fraud files and NavigationContext). Coverage and the final production build were not reached by that combined command. Those other operators' files were not reformatted to force a green gate.

The final browser check also reproduced and resolved focus-induced outer scrolling: the Future Investments app wrapper reports overflow=clip and scrollTop=0 after repeated period changes, with the header visibly below the OS strip. Both CSV downloads were opened to confirm they contain holdings/transaction rows rather than placeholder files.
