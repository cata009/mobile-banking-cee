# CZ Future Robo Advisor implementation plan

**Goal:** Implement the approved end-to-end Robo Advisor preview as `Mobile PI CZ - Future - Robo`, without changing baseline Investments or the existing CZ Chatbot preview.

**Architecture:** Add one release-scoped feature and pass its resolved state into `InvestmentsPortfolioScreen`. A typed Robo model owns demo content, validation and conditional review rows. A local `CzFutureRoboAdvisorFlow` owns the creation/management state machine and composes existing Mobile PI DS primitives.

## 1. Lock the Future-preview contract with tests

- Extend registry tests to require a separate `CZ - Robo` release/feature and `investments.robo` UI location.
- Extend demo-store feature tests to prove Robo is active only in its CZ Future release and Chatbot is not co-activated.
- Extend DemoTopBar tests to require both compatible CZ Future choices.

## 2. Lock the domain behavior with tests

- Add `tests/screens/cz-future-robo-advisor-model.test.ts`.
- Cover profile validity, one-off/regular/combined fields, strategy counts, conditional review rows, and projection warning copy.

## 3. Lock the visible journey with tests

- Add `tests/screens/cz-future-robo-advisor-flow.test.tsx`.
- Cover intro → profile → goal → funding → strategy → projection → portfolio → review → sign → success.
- Cover the invalid-profile block and unified funding fields for all three variants.
- Cover opening the created goal and the management actions.

## 4. Implement registries and integration

- Add `release-future-cz-robo` and `fx_czRoboAdvisor` to types and registries.
- Add the preview to the stakeholder Future selector and PI/CZ project pack.
- Resolve the feature in `App.tsx` and pass it to `InvestmentsPortfolioScreen`.
- Add a DS-consistent Investment goals entry only when the Robo preview is active.

## 5. Implement the model and flow

- Add `czFutureRoboAdvisorModel.ts` for typed demo data, validation, strategy/portfolio data, projection scenarios, review rows and provisional documents.
- Add `CzFutureRoboAdvisorFlow.tsx` for screen composition and state transitions.
- Reuse the shared sign/success components and existing investment primitives.

## 6. Document and verify

- Update current handoff, state-of-the-world and capability map with explicit mock/unconfirmed boundaries.
- Run focused tests, typecheck, lint, relevant audits, build and browser smoke for:
  - Baseline CZ Investments unchanged;
  - CZ Future Chatbot unchanged;
- CZ Future Robo creation and management;
- One-off, Regular and Combined branches.
