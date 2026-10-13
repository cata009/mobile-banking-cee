# PI Italia Polizze assicurative

Owner: codex-pi-it-insurance. Base 538360ead4a6da9ae889f142f8d00e333f99412b. Existing checkout C:/Users/mihai/Desktop/Mobile Banking - CEE. Initial changes and allocated paths are recorded in the ownership JSON.

Reference: Figma d2TyUaQNN6YsgznQaWymIR / INSURANCES page 24282:368870. Implement actual leaf references, not the page canvas or its cover frames.

- [x] Preserve existing category fallback, introduce an insurance-only Home panel and navigation bridge owned by the integration agent.
- [x] Implement a pure policy model, capabilities, favorites, document filtering/selection and validated local requests. Keep reference fixtures in insuranceContent.ts.
- [x] Implement detail variants with/without modules, module and insured-person tabs, compact scrolling header and privacy controls.
- [x] Implement all-policy and inactive-policy lists, favorite ordering, save confirmation and unsaved-change prompt.
- [x] Implement policy history, document quick sheet, document list/filter/date/category/selection/PDF/Excel flows and certificate request views.
- [x] Implement help/FAQ/contact and management entry points. Figma management links have no supplied external reactions; use the available contact flow and an optional integration callback, not an invented carrier URL.
- [x] Reuse exact existing commercial images/crops; download exact new SVG assets, verify rendered geometry and responsive overflow.
- [x] Run affected tests, scoped lint/format, TypeScript and module audit; independent review and browser QA. Integration owner runs npm run verify after editors finish.

No shared Home/CategoryPanel/global CSS/package/registry edits, staging, commits, deployments, real policy changes, or external messages are part of this implementation.
