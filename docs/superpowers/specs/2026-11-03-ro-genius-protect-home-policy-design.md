# Genius Protect Homepage policy design

## Intent

After a Romanian customer issues Genius Protect, show the active policy in a new Homepage Insurance section and let the customer open its Figma-based overview and documents. Keep the Genius Protect offer banner visible while the customer has no active policy.

## Scope and constraints

- Applies to active Romania PI using the current release and existing Native experience.
- Reuse the current Genius Protect state as the source for the active policy, plus the existing Home accordion, product card, banner, page header, bottom sheet, and product-detail route.
- Keep current account, card, spending, investment, product menu, and other-market behavior intact.
- The demo policy has the Figma reference number, premium, payment date, and coverage values; claim contacts are informational and do not submit a claim.
- Fix the reported Genius Protect flow issues: show notices before personal data, remove the extra close and leave-flow controls, remove the duplicate email divider, enlarge row chevrons, align section headings, and disable Continue until the required needs declarations are answered.

## Approaches

1. Add a separate insurance state store and a parallel Homepage route. This duplicates ownership and adds navigation work.
2. Extend the existing Genius Protect application snapshot with its issued policy; render the Figma Insurance section through existing Home primitives and open a dedicated policy detail component from the existing product-detail route. This keeps the completed application, Home state, and policy details connected to one source.

Use approach 2 because the completed Genius Protect request already owns active-policy state and the existing route supports the needed screen composition. Reuse the existing Home primitives and add only the missing detail screen.

## Acceptance

- The active RO Homepage shows an Insurance accordion with the Genius Protect policy card after successful signing; before signing it shows the Figma offer banner.
- Selecting the policy opens its active details, coverages, claim contact information, and documents.
- The Genius Protect flow follows Figma order and presentation and gates progression until required acknowledgments are complete.
- Existing non-RO Home and current Genius Protect entry behavior remain unchanged.
