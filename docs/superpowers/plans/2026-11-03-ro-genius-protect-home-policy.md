# Genius Protect Homepage policy implementation plan

1. Add failing model and Native UI tests for the policy snapshot, Home offer/active states, details route, documents view, notices-first order, missing close/leave controls, and needs Continue gating.
2. Seed the RO active baseline with the Figma policy reference data; retain an empty reset for new-request flows and tests.
3. Add the RO active Home Insurance section using the existing accordion, banner and product-card primitives; route the issued card to a dedicated policy details screen.
4. Build the policy overview, coverage and claim contacts, and document list using existing headers, rows, icons and sheets.
5. Correct the Genius Protect flow order and presentation issues from the browser comments.
6. Run affected model and Native UI tests, type checks, asset/module audits and final combined verification.
