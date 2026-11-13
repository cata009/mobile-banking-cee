# Visual QA Inspector ownership

Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/ToolsScreen.tsx, src/app/screens/tools/VisualQaInspectorTool.tsx, src/app/screens/tools/visualQaComparison.ts, tests/screens/visual-qa-inspector.test.tsx, tests/screens/visual-qa-comparison.test.ts, docs/tasks/2026-11-12-visual-qa-inspector.md. Any additional integration path will be recorded before editing.

Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
```

Additional owned path before edit: tests/screens/tools-screen.test.tsx.

Plan: (1) Test pixel comparison and the tool entry; (2) build the local comparison workspace reusing live demo previews and screenshot capture; (3) test image upload, alignment, overlay and reporting; (4) verify in the browser using the supplied image without adding it to the repository; (5) run affected tests and combined verification when no other verification is active.

Design source: Figma Button family 715:6238 verified; existing ToolPanel, SelectionChip, AppIcon, design tokens and screenshot utility are reused. Native HTML file/range controls are described as such, not as DS Dropdowns.

Additional owned paths before edit: src/app/screens/tools/visualQaCapture.ts and tests/screens/visual-qa-capture.test.ts. Browser investigation: iframe source nodes belong to a different DOM realm, so the existing screenshot utility's instanceof checks skip styling and scroll state; snapshot into the host document before capture.

Verification: 19 focused tests passed, targeted ESLint passed, TypeScript passed, and module boundary audit passed. Browser: exercised the Romanian credit-card screen with the user-supplied screenshot held locally, reference capture, swipe, difference highlighting, marker entry, and report download. Matched screenshot aspect ratio and added a simulated configurable system bar; Android is a generic approximation. The screenshot was not copied into the repository.

Combined npm run verify stopped in preverify while building another pending native card-services change: its import of BaselinePageHeader could not be resolved. That file was not owned by this task and was not edited. Other work in the shared checkout was preserved.

## Follow-up: simplified review and report formats

Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths for this follow-up: src/app/screens/tools/VisualQaInspectorTool.tsx, src/app/screens/tools/visualQaReport.ts, tests/screens/visual-qa-inspector.test.tsx, tests/screens/visual-qa-report.test.ts, docs/tasks/2026-11-12-visual-qa-inspector.md.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
```

Follow-up result: simplified alignment to directional and size buttons, retained drag comparison, and added HTML, editable DOCX, and browser print / Save as PDF options. Reports embed three evidence images and numbered manual observations. Browser review used the supplied Romanian card screenshot and captured three preliminary differences; the Word and HTML reports were downloaded locally. The PDF option opened a print-ready report tab; the final Save as PDF step was not automated.

Verification: 21 focused tests and module boundary audit passed. Combined npm run verify passed platform tests, typecheck and lint but stopped at format:check on the unrelated pending src/features/cards/roCardServices.ts. That file remains outside this task's ownership and was not edited.

## Follow-up: clearer difference review and reset

Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx, src/app/screens/tools/visualQaComparison.ts, tests/screens/visual-qa-comparison.test.ts, tests/screens/visual-qa-inspector.test.tsx, docs/tasks/2026-11-12-visual-qa-inspector.md.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

## Follow-up: automatic reference and phone sizing

Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx, tests/screens/visual-qa-inspector.test.tsx, docs/tasks/2026-11-12-visual-qa-inspector.md.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Latest review: grouped changed pixels into numbered review areas, added per-area reference/app previews and navigation, reused the platform action menu for PDF/Word/HTML, and added cancel plus confirmed reset. Removed the separate capture button: Compare screens now captures the current demo screen automatically while retaining existing notes and markers. The reference and uploaded-phone actions were simplified. Prevented the scaled outer frame from scrolling and constrained the iframe's viewport, removing the black strip and top clipping.

Exact follow-up file delta: src/app/screens/tools/VisualQaInspectorTool.tsx; src/app/screens/tools/visualQaComparison.ts; tests/screens/visual-qa-inspector.test.tsx; tests/screens/visual-qa-comparison.test.ts; this task record. Browser verification used the user-supplied screenshot without adding it to the repository. 24 focused tests, targeted ESLint, TypeScript and module audit passed. Word download and PDF print-tab opening from the new menu were verified. The previous combined verify reached format:check and failed on the unrelated pending src/features/cards/roCardServices.ts; a fresh final run is in progress.

Final user-directed refinements: removed the manual capture step; comparison captures the visible demo automatically. Reduced upload control size and fixed the scrolled/clipped frame and black lower strip. Browser verification confirmed the automatic flow, preserved notes on cancel, clear aligned frames and grouped visual review using the supplied screenshot. 24 focused tests, targeted lint, TypeScript and module audit passed. The final combined verify passed platform tests, typecheck, lint and formatting; its coverage suite reported nine failures in tests/screens/request-call-flow-coverage.test.tsx. The remaining suite was interrupted after the user questioned work on other flows; no changes were made to that flow.

## Follow-up: export menu presentation

Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Existing report tests will be run without changes.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: refined the report export action menu in `src/app/screens/tools/VisualQaInspectorTool.tsx`, reusing existing menu and icon components. Verification: inspector and report tests (4 passed), targeted ESLint, TypeScript, module audit, and browser inspection passed. The full verify suite was not repeated after it was stopped at the user's request.

## Follow-up: reference context and screen shortcuts
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; tests/screens/visual-qa-inspector.test.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: reference-only country, language and version controls plus directly restorable screen shortcuts in `src/app/screens/tools/VisualQaInspectorTool.tsx`; regression coverage in `tests/screens/visual-qa-inspector.test.tsx`. Reused existing registries, native select patterns and deep-link routes. Browser verified CZ / Czech / Evo 2027 / Payments and preservation of screenshot and notes after changing context. Inspector and report tests (5 passed), targeted ESLint, TypeScript and module audit passed. Full verify was not repeated after the user's earlier request to stop the unrelated suite.

## Follow-up: comparison actions order
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Existing inspector tests will be run without changes.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: moved existing comparison actions below the setup controls, removed the inert side-by-side button and added guidance for the disabled compare state in `src/app/screens/tools/VisualQaInspectorTool.tsx`. Reused existing button styles; no shared component or new component. Inspector tests (3 passed), targeted ESLint and browser verification passed, including the supplied card screenshot, starting comparison, cancel review and keeping a comparison during reset. Full verify was not repeated after the user's earlier request to stop the unrelated suite.

## Follow-up: simplify manual comparison
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; src/app/screens/tools/visualQaReport.ts; tests/screens/visual-qa-inspector.test.tsx; tests/screens/visual-qa-report.test.ts; docs/tasks/2026-11-12-visual-qa-inspector.md.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: `src/app/screens/tools/VisualQaInspectorTool.tsx` removes automatic region review and pixel analysis, retains swipe and manual observations, moves alignment beneath the comparison, and reuses registered icons for export/reset/cancel. `src/app/screens/tools/visualQaReport.ts` and `tests/screens/visual-qa-report.test.ts` remove automated pixel evidence from exports and verify the two screenshots and manual observations. Two report tests, targeted ESLint, TypeScript, and module audit passed. Browser verification and the inspector test are blocked by a concurrent, unowned change adding `card-installment-plan` to `src/app/components/icons/domains/cards/custom.tsx` without adding it to the ordered icon registry; the browser renders blank and the test fails during registry initialization. That shared file was not changed by this task. Full verify was not rerun after the user's earlier request to stop unrelated work.

## Follow-up: compact setup and restore live inspector
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; src/app/components/icons/customIcons.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Existing inspector, report and icon tests will be run without changes. The separately modified icon domain is not owned by this task and will not be edited.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: `src/app/screens/tools/VisualQaInspectorTool.tsx` places all four setup selectors in one row at the large breakpoint; `src/app/components/icons/customIcons.tsx` registers the existing pending card installment icon so strict registry initialization and the app can load again. The separately modified icon domain was not touched. Inspector/report tests (5), icon/registry tests (18), targeted ESLint, TypeScript and module audit passed. Browser verification used the supplied credit-card image, confirmed the manual comparison and report menu, and confirmed the automatic review button is absent. Existing user tab was not reloaded. Full verify was not repeated after the user's earlier request to stop the unrelated suite.

## Follow-up: direct comparison drag and refined layout
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; tests/screens/visual-qa-inspector.test.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Existing visual QA tests will also be run.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/icons/customIcons.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: `src/app/screens/tools/VisualQaInspectorTool.tsx` adds direct pointer dragging and a visible divider handle while preserving the native range and observation marking; the observations column now fills the available layout width and icon controls follow the existing demo header treatment. Reused AppIcon, existing demo-reset/close/download icons and semantic tokens; no shared component was changed or new component created. Inspector/report tests (5), targeted ESLint, TypeScript and module audit passed. Browser verification with the supplied card screenshot confirmed mouse drag updates the slider (50 to 83, then 83 to 16), marker placement remains functional, and the layout renders; touch handling uses pointer events but was not tested on a physical device. Full verify was not repeated after the user's earlier request to stop unrelated work.

## Follow-up: unified setup and clear actions
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; tests/screens/visual-qa-inspector.test.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Existing report tests will also be run.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M src/app/components/icons/customIcons.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: `src/app/screens/tools/VisualQaInspectorTool.tsx` combines the phone settings with the comparison setup, replaces ambiguous icon-only actions with consistently styled labelled actions, and removes the separate comparison bar while retaining pointer and keyboard control on the image handle. A small local ComparisonHandle provides slider semantics and keyboard support; existing AppIcon and menu primitives are reused. `tests/screens/visual-qa-inspector.test.tsx` adds keyboard regression coverage. Inspector/report tests (6), targeted ESLint, TypeScript and module audit passed. Browser verification with the supplied credit-card screenshot confirmed direct mouse drag, keyboard Home, marking, and PDF/Word/HTML menu. Touch was not tested on a physical device. Full verify was not repeated after the user's earlier request to stop unrelated work.

## Follow-up: comparison action order and reset availability
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; tests/screens/visual-qa-inspector.test.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M native-spike/src/universal/RadioButton.tsx
 M src/app/components/contracts/radioButton.ts
 M src/app/components/contracts/radioButtonWeb.ts
 M src/app/components/icons/customIcons.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/components/radio-button-contract.test.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

## Follow-up: remove redundant inspector header
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; tests/screens/visual-qa-inspector.test.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Initial status at the start of this turn is recorded in the preceding comparison action entry; the additional edits so far are limited to the same owned inspector and test files.

Follow-up delta: `src/app/screens/tools/VisualQaInspectorTool.tsx` places reset before the primary action and only shows it after a screenshot is loaded; it also removes the redundant title and guide and moves the existing setup panel to the top, with the privacy note beside its heading. `tests/screens/visual-qa-inspector.test.tsx` covers initial absence, ordering, upload, confirmation, preserving the screenshot and confirmed reset, plus absence of the redundant header. Inspector/report tests (6) and targeted ESLint passed. Browser verified initial layout, screenshot upload, action order and keeping the comparison. Reused existing styles and controls; no shared component changed. Full verify was not repeated after the user's earlier request to stop unrelated work.

## Follow-up: flatten and reorder comparison setup
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Existing inspector tests will be run without changes.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M native-spike/src/universal/RadioButton.tsx
 M src/app/components/contracts/radioButton.ts
 M src/app/components/contracts/radioButtonWeb.ts
 M src/app/components/icons/customIcons.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/components/radio-button-contract.test.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: `src/app/screens/tools/VisualQaInspectorTool.tsx` removes the inner setup border and padding and places phone/system-bar settings below country, language, version and screen controls. Existing inspector tests (4), targeted ESLint and browser visual inspection passed. Reused existing controls and tokens; no new component or shared component change. Full verify was not repeated after the user's earlier request to stop unrelated work.

## Follow-up: immediate reset
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; tests/screens/visual-qa-inspector.test.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M native-spike/src/universal/RadioButton.tsx
 M src/app/components/contracts/radioButton.ts
 M src/app/components/contracts/radioButtonWeb.ts
 M src/app/components/icons/customIcons.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/components/radio-button-contract.test.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: `src/app/screens/tools/VisualQaInspectorTool.tsx` resets immediately without the confirmation state or panel; `tests/screens/visual-qa-inspector.test.tsx` verifies the screenshot is cleared on the first click. Inspector tests (4), targeted ESLint, and browser upload/reset verification passed. Existing styles and controls were reused. Full verify was not repeated after the user's earlier request to stop unrelated work.

## Follow-up: tools overview icons
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/ToolsScreen.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Existing Tools screen tests will be run without changes. The pre-existing Visual QA integration in ToolsScreen is preserved.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M native-spike/src/universal/RadioButton.tsx
 M src/app/components/contracts/radioButton.ts
 M src/app/components/contracts/radioButtonWeb.ts
 M src/app/components/icons/customIcons.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/components/radio-button-contract.test.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Follow-up delta: `src/app/screens/tools/ToolsScreen.tsx` uses distinct existing AppIcon glyphs for visual QA, email, country comparison and divergence, with a consistent token-based icon treatment and aligned card contents. Existing Visual QA changes and all tool navigation were preserved. No new icon, asset or shared component was created. Tools screen tests (13), targeted ESLint, module audit, and browser visual inspection passed. Full verify was not repeated after the user's earlier request to stop unrelated work.

## 2026-11-13: QA reference configuration and rights
Owner: Codex integration owner
Base commit: 04dc35bd11e9069a372b01f34ff44a3df6de8ff0
Checkout: C:\Users\mihai\Desktop\Mobile Banking - CEE
Owned paths: src/app/screens/tools/VisualQaInspectorTool.tsx; src/app/components/demo/DemoFeatureSidePanel.tsx; src/app/utils/deepLink.ts; src/features/accounts-payments/paymentShortcutPolicy.ts; native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx; tests/screens/visual-qa-inspector.test.tsx; tests/screens/demo-control-panel-qa.test.tsx; native-spike/__tests__/payments-rights-regression.test.tsx; docs/tasks/2026-11-12-visual-qa-inspector.md. Native payment hub has pre-existing pending changes last edited on 2026-11-12; preserve them with narrow edits. No other agent in this thread is editing it. Generated native bridge artifacts may update through the existing development watcher.
Initial pending changes:
```
 M native-spike/__tests__/parity-navigation.test.tsx
 M native-spike/__tests__/ro-baseline-account-details.test.tsx
 M native-spike/__tests__/ro-baseline-card-details.test.tsx
 M native-spike/__tests__/ro-baseline-payments-hub.test.tsx
 M native-spike/__tests__/universal-date-field.test.tsx
 M native-spike/src/experiences/pi/current/NativeCurrentApp.tsx
 M native-spike/src/experiences/pi/current/baseline/Account.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountAddMoneyFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountInfo.tsx
 M native-spike/src/experiences/pi/current/baseline/AccountStatementFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/Card.tsx
 M native-spike/src/experiences/pi/current/baseline/CardOptions.tsx
 M native-spike/src/experiences/pi/current/baseline/DetailsHeader.tsx
 M native-spike/src/experiences/pi/current/baseline/TransactionFilters.tsx
 M native-spike/src/experiences/pi/current/baseline/Transactions.tsx
 M native-spike/src/experiences/pi/current/baseline/more/ContractWithdrawalFlow.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Sheets.tsx
 M native-spike/src/experiences/pi/current/baseline/more/appointment/Ui.tsx
 M native-spike/src/experiences/pi/current/baseline/offers/GeniusProtectPolicyDetails.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen.tsx
 M native-spike/src/experiences/pi/current/baseline/payments/hub/Payments.tsx
 M native-spike/src/experiences/pi/current/baseline/profile/RomanianPersonalProfile.tsx
 M native-spike/src/experiences/pi/current/baseline/spending/AddTransactionFlow.tsx
 M native-spike/src/experiences/pi/cz/evo-2027/payments/PaymentFlow.tsx
 M native-spike/src/universal/BaselineBottomSheet.tsx
 M native-spike/src/universal/BaselineDatePeriodFilterSheet.tsx
 M native-spike/src/universal/BaselineDetailToolbar.tsx
 M native-spike/src/universal/BaselineMailboxTabs.tsx
 M native-spike/src/universal/DateField.tsx
 M native-spike/src/universal/RadioButton.tsx
 M native-spike/src/universal/SourceBottomSheet.tsx
 M src/app/components/contracts/detailToolbar.ts
 M src/app/components/contracts/radioButton.ts
 M src/app/components/contracts/radioButtonWeb.ts
 M src/app/components/icons/customIcons.tsx
 M src/app/components/icons/domains/cards/custom.tsx
 M src/app/components/ui/WalletButton.tsx
 M src/app/registry/componentImplementationPackages.ts
 M src/app/screens/tools/ToolsScreen.tsx
 M src/data/paymentsHub.ts
 M src/features/accounts-payments/currentPaymentPolicy.ts
 M tests/components/radio-button-contract.test.ts
 M tests/screens/tools-screen.test.tsx
?? .agents/
?? docs/superpowers/plans/2026-11-12-pi-ro-payments-completion.md
?? docs/superpowers/specs/2026-11-12-pi-ro-payments-completion-design.md
?? docs/tasks/2026-11-12-visual-qa-inspector.md
?? native-spike/__tests__/baseline-payment-date-regression.test.tsx
?? native-spike/__tests__/night-cz-flow-date.test.tsx
?? native-spike/__tests__/night-sheet-viewport.test.tsx
?? native-spike/__tests__/ro-baseline-payment-forms.test.tsx
?? native-spike/src/experiences/pi/current/banking/cardServicesStore.ts
?? native-spike/src/experiences/pi/current/baseline/MortgageReimbursementFlow.tsx
?? native-spike/src/experiences/pi/current/baseline/RoCardServices.tsx
?? native-spike/src/experiences/pi/current/baseline/payments/forms/
?? src/app/screens/tools/VisualQaInspectorTool.tsx
?? src/app/screens/tools/visualQaCapture.ts
?? src/app/screens/tools/visualQaComparison.ts
?? src/app/screens/tools/visualQaReport.ts
?? src/assets/design-system/icons/click-to-pay/
?? src/features/accounts-payments/mortgageReimbursement.ts
?? src/features/cards/roCardServices.ts
?? tests/components/wallet-button-figma-contract.test.tsx
?? tests/data/ro-baseline-recurrent-payments.test.ts
?? tests/features/mortgage-reimbursement.test.ts
?? tests/features/ro-baseline-payment-forms.test.ts
?? tests/screens/night-r06-a-dialog.test.tsx
?? tests/screens/visual-qa-capture.test.ts
?? tests/screens/visual-qa-comparison.test.ts
?? tests/screens/visual-qa-inspector.test.tsx
?? tests/screens/visual-qa-report.test.ts
```

Task delta: added inspector-local customer scenario, product counts and modeled-rights information; included counts in the report context. Scenario selection in the demo control panel now applies its starting product counts, and the Release Features list was removed from that panel. Added the shared payment shortcut policy and guarded the existing Romanian payment hub's foreign-payment, recurrent-payment and template shortcuts; preserved the hub's pre-existing edits. Added focused inspector, control-panel and native payment-rights regression coverage. Exported the existing deep-link count parameter mapping for reuse. Modeled rights remain only partially enforced across demo screens and are labeled accordingly.

Verification: focused Vitest suites (49 tests), native payment suites (8 tests), targeted ESLint and module boundary audit passed. Browser checks confirmed scenario counts update the isolated reference phone and restricted payment shortcuts are disabled while exchange rates remain available. Full verify was not run in this shared checkout because of the user's prior instruction to avoid unrelated verification work.
