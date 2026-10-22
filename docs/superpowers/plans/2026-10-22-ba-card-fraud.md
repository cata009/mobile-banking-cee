# Bosnia Card Fraud Implementation Plan

> Execute inline with superpowers:executing-plans. Keep ownership and verification evidence in the task document.

**Goal:** A complete Bosnia baseline fraud alert, dispute tracking and card protection demo with a PRIME-style modal presentation.

**Architecture:** Pure feature reducer owns transaction eligibility, cases, protection and replacement. Flow metadata supplies screen contracts and presentation chapters. A shared executable baseline journey serves modal, Journey and Prototype views; Flow Library integration registers it and exposes source exports.

**Tech Stack:** Existing React, TypeScript, Radix Dialog, baseline DS components, Vitest.

**Spec:** `docs/tasks/2026-10-22-ba-card-fraud.md`.

## Global constraints

- BA and BA_BL, baseline/current. English demo copy, BAM transactions, simulated integrations and dates.
- Existing checkout and all initial pending edits preserved. No new dependencies, real banking calls, location acquisition or publication.
- Business policies live in `src/features/cards/fraud/model.ts`; metadata imports no UI.

## Review focus

- Declined and pending payments must not become booked-payment chargebacks.
- Retry, return navigation and selecting another transaction must not duplicate or misassign a case.
- Closing or reissuing a card must not resolve its dispute or permit reactivation through a channel switch.
- Unavailable/stale phone location must not silently enable country protection or affect internet transactions.
- Modal must support keyboard dismissal, restored trigger focus, small viewports and readable scrolling.

### Task 1 · Domain state

- [x] Write and run failing model tests for recognition, claim validation/idempotency, case progression, replacement and location handling.
- [x] Implement `createFraudSession`, `fraudReducer`, `canSubmitClaim`, `countryProtectionDecision` in `src/features/cards/fraud/model.ts`.
- [x] Run model tests and preserve results in ledger.

### Task 2 · Baseline journey and presentation

- [x] Write failing user interaction tests for alert → review → submit → linked case, replacement and controls.
- [x] Add canonical `definition.ts`, executable `FraudJourney.tsx`, supporting screen composition, CSS and accessible `FraudPresentationDialog.tsx` under `src/flows/ba/card-fraud/`.
- [x] Reuse verified DS components and MiniPhone; chapter navigation and presenter-only case fixtures are distinct from customer controls.
- [x] Run interaction tests and inspect the actual desktop browser. No viewport override or narrow-viewport acceptance claim.

### Task 3 · Integration and verification

- [x] Re-read and minimally extend flow types, index, renderer, FlowDetail demo launch and source exports.
- [x] Run affected model, flow and inventory regressions: 35 passed. Typecheck, lint and formatting passed before the last small visual refinement; no blanket final gate claim.
- [x] Review owned deltas and run combined `npm run verify`: 3946 tests passed; two inventory expectations required the new flow entry and then passed in the affected run. No assertions or thresholds weakened. The user explicitly stopped extended verification, so the entire gate was not repeated.
- [x] Show the updated menu in the existing user tab. No commit or publication.
