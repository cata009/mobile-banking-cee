# PI Italy Investimenti implementation plan

Goal: implement the whole Figma INVESTMENTS page (24262:641750), as confirmed by the user on 2026-10-12. The 673 frames are variants of 39 section families. Preserve the existing Home shell, IDs, Italian labels, local source assets and amount privacy.

Architecture: React/TypeScript/CSS experience components select composition; feature modules own executable policies. A single Investimenti host owns portfolio tabs, overlays and cross-area navigation. Domain workers own disjoint components, policies, assets and tests. No branch/index/commit or shared Home edits.

Canonical specification: https://www.figma.com/design/d2TyUaQNN6YsgznQaWymIR/CEE---Mobile-First---Enhanced?node-id=24262-641750

- [x] Parent: inventory and coverage ledger, shared investment primitives, overview behavior, investment drawer, routing and Home bridge contract.
- [x] Securities worker: securities portfolio/deposits/positions/sheets, markets/search, buy/sell/AUCAP/auctions, orders/movements, watchlists/virtual portfolio, assembly tickets, deposit eligibility.
- [x] Funds worker: funds portfolio/PIC/PAC/PIR/managed positions, catalog/search, dispositive PIC/PAC, Risparmia e investi lifecycle, fund order management.
- [x] Services worker: fiscal positions, savings products/subscription, insurance, investment profile, advisory/signing, MIFID questionnaires and additional packages.
- [x] Review each domain delta sequentially, test cross-domain routing and amount masking, verify local assets and rendered flows. All reported important findings repaired and re-reviewed; 78 affected tests pass.
- [x] Ask the existing integration owner to run npm run verify on the combined state after all editors close their changes.
- [ ] Record the integration owner's final combined verification result and appointment/scenario bridges.

Review focus: back/close retain portfolio context; invalid input cannot advance; mobile-code and document acknowledgement gate confirmation; all portfolio and detail amounts obey privacy; each domain has navigable source-backed entry points and an honest Figma coverage ledger.

Ruling: use the existing main checkout per user AGENTS.md. Existing operator and other agents' changes remain intact. User's direct instruction to implement the supplied design and subsequent all-page confirmation authorize implementation without another design approval request.
