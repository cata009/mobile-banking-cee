# CZ Robo Order Review and Completion Design

## Intent

Refine the Czech Robo goal creation and add-money journeys shown in the supplied browser comments. Reuse the established investment review, bottom sheet, signing, success, and native row components so the flow stays consistent with the rest of the app.

## Goals

- Make the phone and email info controls on personal-data confirmation open their own Figma-matched bottom sheets.
- Remove the obsolete combined contact-details/help affordance from that screen.
- Show contact confirmation before the “Invest towards what matters” introduction, and provide Back from the introduction to contact confirmation.
- Keep the investment-account document in a scrollable sheet with an always-enabled Download document action; gate only the read acknowledgement until the reader reaches the end.
- Match the KID document row icon and chevron sizing to the existing native navigation row implementation.
- Keep Robo top-up review on the standard Buy Order review structure, with one basket ISIN and the existing purchase, account, and document sections.
- Show the existing Close action on the web Add money entry screen reached from a goal detail and preserve its existing close callback.
- Keep the Robo sign screen consistent with goal creation, skip the simulated biometric prompt for this demo top-up, and proceed to the standard success screen.
- Match the success CTA to the supplied Figma screen and keep the success surface free of top-level back/close actions.
- Keep the scroll position indicator visible in the baseline Investments History “Apply filters” sheet while its content is scrollable.

## Non-goals

- Change Robo business policies, order calculations, scenario order, screen kinds, navigation IDs, or exported flow definitions.
- Change signing behavior for other product flows.
- Publish or modify the Figma source file or add Code Connect mappings.

## Approaches

1. **Target CZ Robo and reuse shared components (chosen).** Make Robo-specific composition changes in its screen modules and add narrowly scoped props only where a shared component needs to express the Robo demo behavior. Correct the reusable KID row/reader at its existing source. This preserves one implementation for shared investment UI while containing behavior changes to the requested flow.
2. **Change every investment flow.** Update standard buy/sell review, signing, and success defaults globally. This would broaden behavior beyond the annotated CZ Robo screens and could change unrelated journeys.

## Constraints and decisions

- Keep the current `current` design-system axis and `release-future-cz-robo` release.
- Use the existing native `SourceBottomSheet`, `BaselineNavigationRow`, `OrderDocuments`, `Signing`, and `BaselineStandardSuccess` implementations. Keep the React screen adapters aligned.
- Use the user-provided Figma copy for Phone number and Email Address sheets; preserve the existing fictitious contact values.
- The contract reader is demo content. Its optional export must stay a clearly fictional local demonstration PDF.
- Preserve the default Face ID simulation for callers that do not opt into the CZ Robo demo path.
- Keep the history filter indicator change local to the React Native `ScrollView` in the baseline Investments History filter scaffold.

## Files and verification targets

- `src/app/screens/investments/robo/PersonalDataConfirmationScreen.tsx`
- `src/app/screens/investments/robo/CreationReviewScreen.tsx`
- `src/app/screens/investments/robo/TopUpScreens.tsx`
- `src/app/screens/investments/robo/ManagementInputScreen.tsx`
- `src/app/components/flow/StandardSignScreen.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/robo/CreationScreens.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/robo/InvestmentContract.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/robo/HoldingDetails.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/robo/Management.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/investments/Signing.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/auth/Authorization.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/investments/OrderDocuments.tsx`
- `native-spike/src/experiences/pi/cz/evo-2027/investments/BuyOrder.tsx`
- `native-spike/src/experiences/pi/current/investments/baseline/flows/HistoryFilters.tsx`
- `tests/screens/cz-future-robo-advisor-flow.test.tsx`
- `tests/screens/investment-order-documents-accordion.test.tsx`
- `tests/screens/standard-flow-screens.test.tsx`
- `native-spike/__tests__/cz-evo-robo-figma-flow.test.tsx`
- `native-spike/__tests__/cz-robo-contract-content.test.tsx`
- `native-spike/__tests__/cz-robo-management-presentation.test.tsx`
- `native-spike/__tests__/cz-evo-robo-management.test.tsx`
- `native-spike/__tests__/baseline-investments-history.test.tsx`

Run the affected tests, inspect the CZ Robo states in the running app, run `npm run audit:modules`, and coordinate one final `npm run verify` on the combined checkout.
