# PI Italy / Mobile First insurance handoff

Owner: codex-pi-it-insurance. Checkout: C:/Users/mihai/Desktop/Mobile Banking - CEE. Base: 538360ead4a6da9ae889f142f8d00e333f99412b. Initial pending changes are preserved in the ownership JSON. All insurance task files are additions; no tracked file deletions, renames, index mutations or commits.

Implemented the INSURANCES page's leaf references in Figma d2TyUaQNN6YsgznQaWymIR: homepage variants 369479/369514/369601/369720, policy details 369626/369661/369747/370158/370423, lists/customization 369874/370011/370071/370104/371914, modules and coverage 370476/370583/370656, history 370740, management 371711/372010, documents and filters 370812/370849/371084/371144/371250/371328/371351, help 371648/371960. All IDs have prefix 24282.

## Integration

`MobileFirstInsurance` exposes `initialPolicyId`, `initialView` (`detail`, `list`, `catalogue`, `documents`), `onClose`, optional `policies`, `onContact(channel, policyId)`, `onManage(policyId, actionId)`, and `onProfile`. `MobileFirstInsurancePanel` exposes `onOpen(policyId?, view?)` and optional policies.

Core/Home owner added the Home and CategoryPanel bridge. The actual Home component was exercised in a static browser harness: category -> detail -> Home and category -> list -> detail -> list -> Home; contact opens Profile support. No Home, CategoryPanel, global CSS, registry or package files were edited by this task.

## Behavior and financial coherence

- Favorites are scoped to the supplied portfolio, active only, ordered and limited to two. Saved preferences survive component remounts during the demo session.
- Module premiums share the policy's monthly period. The family premium is 45,000 cents = three modules of 15,000 cents; policy details and PDF use the same feature calculation. This intentionally resolves the source's conflicting 21.81 vs 3 x 150, following the integration owner's explicit financial coherence instruction.
- Insured capital is coverage and does not contribute to assets/wealth. History displays explicit fixture records only; no derived premium-paid posting is created.
- Assistance-only policy actions remain assistance-only. Carrier management links have no destination reactions in Figma; they expose an optional host callback or open the supplied contact flow. No real policy mutation or external communication is performed.
- Document filters use inclusive date boundaries and real categories; draft filters survive help, applied filters persist per policy, unread markers update, and year validation gates local certificate requests.
- Downloads are real PDF and XLSX bytes. XLSX uses escaped inline string cells; exports reject cross-policy documents. Hidden amounts remain hidden in PDF preview and download actions honor privacy.
- Font sizes/line heights respect `--mf-text-scale`. Exact Figma SVG assets preserve their root dimensions; existing promo artwork/crops are reused.

## Verification

- 19/19 insurance tests pass: 13 screen/integration and 6 feature/export tests.
- Scoped ESLint (0 warnings), scoped Prettier and module audit (260 files) pass. Full TypeScript passed at 21:27; the final 21:32 rerun reports one concurrent Investments error: `tests/features/mobile-first-investment-financials.test.ts(19,3)` imports missing `securityOrderPeriodRange`. No insurance TypeScript errors were reported. The integration owner was informed and owns final combined verification.
- Static Vite QA build succeeds. The combined Home import reports existing large-chunk/mixed Profile import warnings; no thresholds were changed.
- Browser verified modules, policy list, favorites/order/save, document filters/selection, real PDF/XLSX downloads and Home/contact bridges. Screenshots are saved next to this handoff.
- Independent review confirms all reported focus, help-state, duplicate-dialog, favorites-context and list-navigation issues fixed; no important remaining defects.
- Broader Home+tabs run: 65/67 passed. The two Home assertions affected by concurrent finance changes (old privacy mask count and old carousel wording) were sent to the Home owner. Tabs: 33 passed. Combined final `npm run verify` belongs to the integration owner after all editors finish.

Exact task file delta is in `pi-italy-mobile-first-insurance-delta.json`. QA build/server files under `.codex-temp/pi-it-insurance-qa/` are ignored and are not product source.
