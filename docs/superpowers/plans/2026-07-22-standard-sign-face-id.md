# Standard Sign Face ID Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse the existing Face ID animation on every shared runtime sign screen and advance only after authentication completes.

**Architecture:** `StandardSignScreen` owns the authentication transition because all relevant runtime flows already consume it. Product flows keep their existing `onSign` callbacks and success screens; their only test change is to wait for the shared 840 ms authentication lifecycle.

**Tech Stack:** React 18, TypeScript, Motion `AnimatePresence`, Vitest, Testing Library.

## Global Constraints

- Reuse `src/app/components/FaceIdAnimation.tsx` without creating another visual.
- Do not call `onSign` before Face ID completes.
- Prevent duplicate primary-action activation during authentication.
- Do not add dependencies, routes, backend behavior, persistence, or an invented failure state.
- Do not commit or publish without separate repository authorization.

---

### Task 1: Lock the shared authorization contract

**Files:**
- Modify: `tests/screens/standard-flow-screens.test.tsx`
- Modify: `tests/screens/investment-buy-order-flow.test.tsx`
- Modify: `tests/screens/credit-limit-offer-flow.test.tsx`

**Interfaces:**
- Consumes: `StandardSignScreenProps.onSign: () => void`
- Produces: regression coverage for `Sign -> Face ID completion -> onSign`

- [x] Add a fake-timer component test that clicks Sign, asserts `onSign` is still untouched, advances 839 ms, then advances the final millisecond and expects exactly one call.
- [x] Run `npx vitest run tests/screens/standard-flow-screens.test.tsx` and confirm the new assertion fails because the current screen calls `onSign` immediately.

### Task 2: Implement the shared Face ID transition

**Files:**
- Modify: `src/app/components/flow/StandardSignScreen.tsx`

**Interfaces:**
- Consumes: `FaceIdAnimation({ onComplete })`
- Produces: unchanged `StandardSignScreen` public props with delayed, once-only `onSign` delivery.

- [x] Add local authentication state and a guarded click handler.
- [x] Disable the Sign button while authentication is active.
- [x] Mount the existing `FaceIdAnimation` in `AnimatePresence` and call `onSign` only from its completion handler.
- [x] Advance fake timers in investment and credit-limit tests before asserting their success state.
- [x] Run the three focused test files and confirm they pass.

### Task 3: Verify and document the behavior change

**Files:**
- Modify: `docs/platform-capability-map/README.md`

**Interfaces:**
- Consumes: repository verification scripts and the running port-4001 demo.
- Produces: reproducible evidence and a safe-resume handoff.

- [x] Run the focused test set, `git diff --check`, and `npm run verify`.
- [x] In the live CZ credit-limit flow, confirm Sign change shows Face ID before Limit updated.
