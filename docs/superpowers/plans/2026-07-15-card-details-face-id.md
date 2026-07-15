# Plan — Mobile PI Card Details Face ID

Status: completed 2026-07-15

1. Read the Card Details Figma node and retain the shared Mobile PI header. Completed.
2. Reuse `FaceIdAnimation` from the selected-card screen and gate both entry points before routing. Completed.
3. Replace the previous Card Details content with the four Figma fields and shared copy/toast behaviour. Completed.
4. Extend mock card data for static and generated debit/credit cards. Completed.
5. Add a focused audit and run production/platform checks. Completed.

The implementation composes existing `PageHeader`, `FaceIdAnimation`, `CopyToast`, `useCopyToClipboard`, and `AppIcon` primitives rather than creating duplicate platform components.
