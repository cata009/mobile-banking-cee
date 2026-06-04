# Known Bananas

Known bananas are triaged risks that can sabotage a future session if forgotten.

## Active Known Bananas

| Banana | Impact | Triage |
| --- | --- | --- |
| Platform capability map says there is no product handoff/audit workflow | This remains true for product features, but repo-level AI handoff now exists | Do not treat AI OS docs as a banking product capability |
| Several active UI strings are hardcoded in English | Country/language confidence is lower than translation docs imply | Keep as task until translation coverage is expanded |
| Feature registry contains features that are not all rendered by active screens | Demo panel may imply more coverage than UI currently provides | Use feature coverage metadata and control panel warnings |
| Vite build warns about chunks larger than 500 kB | Build passes, but future load performance can degrade | Consider code splitting and asset strategy after architecture/control-panel work |
| Existing dev servers on `6000`/`6001` may be stale | Browser checks may show mixed old/new module state | Prefer a fresh dev server port for verification when metadata appears stale |
| SME and next design system are selectable but not implemented as real flows | Users may expect complete mobile screens after selecting them | Runtime now shows a planned-state placeholder until real screens are added |
| No local TypeScript CLI or `typecheck` script is installed | `npx tsc --noEmit` cannot be used as verification yet | Add `typescript` and scripts for `typecheck`, `lint`, and tests before broad refactors |
| Payments labels are shared placeholders for all countries | Country-specific payment wording is not represented yet | Keep copy in `paymentsMenuConfig.ts` and update per country when labels are supplied |
| New payment bottom sheet Foreign/SEPA and Templates/Beneficiaries actions do not open payment-type flows | Domestic payment now continues into a mock create/review/sign/success flow, but the remaining payment action rows are still placeholders | Keep remaining action rows logged as placeholders until target screens are provided |
| Products labels, imagery, and ShopSmart content are shared placeholders | Country-specific product wording/assets and final ShopSmart content are not represented yet | Keep behavior in `productsMenuConfig.ts`; update copy/assets per country during fine tuning |
| Domestic payment flow is mock-only | Stakeholders can walk through create/review/sign/success, but no balance, ledger, transaction list, or backend state changes | Keep it documented as a demo flow until real payment execution/state rules are intentionally added |
| No automated icon registry audit exists yet | Future contributors could accidentally add a reusable app icon as raw inline SVG outside `AppIcon` | Add a script/test that fails on non-exempt reusable SVG/lucide usage outside `src/app/components/icons/AppIcon.tsx` |
| Products offer carousel spacing and drag/snap have only manual browser coverage | A future layout tweak could break the `16px` rhythm or desktop drag behavior without a failing test | Add visual/pointer regression coverage for Products offers and product-card grid spacing |
| No automated color-token audit exists yet | Future contributors could accidentally add raw app hex/rgb/Tailwind palette colors outside the DS color registry and theme variables | Add a script/test that fails on non-exempt color usage outside `src/app/registry/colorRegistry.ts`, `src/styles/theme.css`, and asset imports |
| Dark mode has browser smoke coverage but no screen-by-screen visual regression suite | A future screen could remain light-only or lose contrast without failing CI | Add visual regression snapshots for Home, Payments, Products, Analytics, More, and Design System Inventory in both Light and Dark |
| Phase 1 release promotion is source-level only | The baseline ledger and readiness checks model publication, but there is no persisted release workflow, approval record, or runtime promotion action | Keep it framed as Reference Platform infrastructure until a real publication workflow is approved |
| Banking entitlements are mock scenario data | The control panel can model rights and limits, but it is not a real banking permission system | Replace mock repositories with backend adapters only after API/security contracts are approved |
| Effective app context is only partially consumed by runtime screens | Payments primary cards consume disabled-action state; other screens mostly still render their existing mock data | Wire additional screens intentionally in future passes instead of adding hidden component conditionals |
| Demo access password has a committed fallback | The user-requested password works without Vercel env setup, but wider sharing should not rely on a source-level fallback | Before broader external distribution, set `ACCESS_PASSWORD` and `ACCESS_COOKIE_SECRET` in Vercel and remove or rotate the fallback intentionally |
