# RO virtual cards implementation plan

**Goal:** Implement virtual card issuance and picture changes for the active Romanian baseline, using the referenced Figma section and existing components.

**Architecture:** Keep eligibility, selections and scoped issued-card state in a feature model. A session store feeds the current native host, product categories, card detail and both flows. Reuse baseline controls and navigate through existing product detail and card options.

**Tech stack:** React Native / React Native Web, TypeScript, Jest and Vitest. Figma source: RO Enablers 2408:7063 and its visible screens.

**Constraints:** Preserve unrelated pending edits and established routes, scenarios and shared controls. Implement only RO current active. Do not introduce flattened screen captures. Use the existing checkout. No staging, deployment or publication.

**Review focus:** account eligibility and no-account state; terms and PIN validation; cancellation/back without committing; picture change scoped to the selected virtual card; issuing twice and isolation across scenarios; navigation and showing the selected artwork after completion.

1. Record ownership and inspect Figma and canonical components. Add failing model tests for eligibility, issuance, account linking, scope and picture changes; implement the feature model and session adapter.
2. Add failing integration tests for issue and change paths. Compose the Figma selection, setup, terms, signing and success screens using shared controls. Connect the product and card options entry points.
3. Feed issued cards into Home and card detail, and render selected artwork. Preserve existing cards and amounts. Check back, deactivation and accessibility.
4. Run focused tests and module audit; inspect exact task delta. Run combined verify once after editing finishes, then test both user journeys in the actual browser host and report any failures.
